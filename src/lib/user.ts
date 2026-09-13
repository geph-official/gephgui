import { derived, get, writable, type Readable, type Writable } from "svelte/store";
import { persistentWritable } from "./persistent";
import {
  pref_app_whitelist,
  pref_block_ads,
  pref_block_adult,
  pref_allow_lan,
  pref_allow_direct,
  pref_exit_constraint,
  pref_global_vpn,
  pref_http_port,
  pref_listen_all,
  pref_proxy_autoconf,
  pref_proxy_mode,
  pref_socks5_port,
  pref_use_app_whitelist,
  pref_use_prc_whitelist,
  type ExitConstraint,
} from "./prefs";
import {
  native_gate,
  type DaemonArgs,
  type NetStatus,
  broker_rpc,
} from "../native-gate";
import { LRUCache } from "lru-cache";
import { curr_lang } from "./l10n";

/**
 * The current valid secret
 */
export const curr_valid_secret: Writable<string | null> = persistentWritable(
  "secret",
  null
);

export type AccountCodeStatus =
  | { current: { user_id: number; invite_code: string | null } }
  | "retired"
  | "invalid";

export const account_code_status = writable<{ secret: string; status: AccountCodeStatus } | null>(null);
const PENDING_CODE_KEY = "pending-account-code";
type PendingCode = { secret: string; showCode: boolean };
let restoredCode: PendingCode | null = null;
try {
  const saved = JSON.parse(localStorage.getItem(PENDING_CODE_KEY) || "null");
  if (saved && /^8[0-9]{23}$/.test(saved.secret) && typeof saved.showCode === "boolean") {
    restoredCode = saved;
  }
} catch { /* A malformed journal must not replace the saved account. */ }
export const pending_account_code = writable<PendingCode | null>(restoredCode);
export const account_code_busy = writable(false);
export const account_code_error = writable<string | null>(null);
let codeSynced = false;

export const account_update_required = derived(
  [curr_valid_secret, pending_account_code, account_code_status],
  ([secret, pending, checked]) => !!pending || !!secret?.startsWith("9") ||
    (!!secret && checked?.secret === secret && typeof checked.status === "string")
);

export async function checkAccountCode(secret: string): Promise<AccountCodeStatus> {
  const status: AccountCodeStatus = await broker_rpc("get_account_secret_status", [secret]);
  if (status !== "retired" && status !== "invalid" &&
      !(status && typeof status === "object" && "current" in status &&
        typeof status.current?.user_id === "number" &&
        (status.current.invite_code === null || typeof status.current.invite_code === "string"))) {
    throw new Error("Invalid account status response");
  }
  if (get(curr_valid_secret) === secret) account_code_status.set({ secret, status });
  return status;
}

// Shared by login and the required update screen. A legacy code is only saved
// here; the user must explicitly request rotation on the next screen.
export async function signInWithCode(input: string): Promise<void> {
  if (get(account_code_busy)) return;
  account_code_busy.set(true);
  account_code_error.set(null);
  try {
    const secret = input.replace(/\s/g, "");
    const status = await checkAccountCode(secret);
    if (status === "invalid" || (status === "retired" && !secret.startsWith("9"))) {
      throw new Error("incorrect-user-secret");
    }
    if (secret.startsWith("9")) {
      curr_valid_secret.set(secret);
      account_code_status.set({ secret, status });
      clearAccountCache();
      app_status.set(null);
    } else {
      if (!/^8[0-9]{23}$/.test(secret)) throw new Error("incorrect-user-secret");
      pending_account_code.set({ secret, showCode: false });
      codeSynced = false;
      await saveAndSyncAccountCode();
      localStorage.removeItem(PENDING_CODE_KEY);
      pending_account_code.set(null);
    }
  } catch (error) {
    if (!get(account_code_error)) account_code_error.set(
      error instanceof Error && error.message === "incorrect-user-secret"
        ? "incorrect-user-secret" : "account-code-request-error"
    );
    throw error;
  } finally {
    account_code_busy.set(false);
  }
}

export async function rotateAccountCode(): Promise<void> {
  if (get(account_code_busy) || get(pending_account_code)) return;
  const secret = get(curr_valid_secret);
  if (!secret?.startsWith("9")) return;
  account_code_busy.set(true);
  account_code_error.set(null);
  try {
    const replacement: unknown = await broker_rpc("rotate_account_secret", [secret]);
    if (typeof replacement !== "string" || !/^8[0-9]{23}$/.test(replacement)) {
      throw new Error("Invalid replacement response");
    }
    // Keep the returned code in memory even if either local write fails.
    pending_account_code.set({ secret: replacement, showCode: true });
    codeSynced = false;
    await saveAndSyncAccountCode();
  } catch {
    if (!get(pending_account_code)) {
      let status: AccountCodeStatus | null = null;
      try { status = await checkAccountCode(secret); } catch { /* Keep network failures recoverable. */ }
      account_code_error.set(status === "retired" ? "account-code-retired" :
        status === "invalid" ? "incorrect-user-secret" : "account-code-request-error");
    }
  } finally {
    account_code_busy.set(false);
  }
}

export async function completeAccountCodeUpdate(acknowledge: boolean): Promise<void> {
  if (get(account_code_busy)) return;
  account_code_busy.set(true);
  account_code_error.set(null);
  try {
    await saveAndSyncAccountCode();
    if (acknowledge) {
      localStorage.removeItem(PENDING_CODE_KEY);
      pending_account_code.set(null);
    }
  } catch {
    if (!get(account_code_error)) account_code_error.set("account-code-save-error");
  } finally {
    account_code_busy.set(false);
  }
}

async function saveAndSyncAccountCode(): Promise<void> {
  const pending = get(pending_account_code);
  if (!pending) return;
  try {
    // Journal first: reload can finish installing a successfully returned code.
    localStorage.setItem(PENDING_CODE_KEY, JSON.stringify(pending));
    curr_valid_secret.set(pending.secret);
    clearAccountCache();
    app_status.set(null);
  } catch (error) {
    account_code_error.set("account-code-save-error");
    throw error;
  }
  if (!codeSynced) {
    try {
      const args = await startDaemonArgs();
      if (!args) throw new Error("Missing saved account");
      await (await native_gate()).restart_daemon(args);
      codeSynced = true;
      triggerPollBurst();
    } catch (error) {
      account_code_error.set("account-code-reconnect-error");
      throw error;
    }
  }
}

/****************
 * News
 ****************/
export type NewsItem = {
  title: string;
  date_unix: number;
  contents: string;
  thumbnail: string;
  important: boolean;
};

const serverListCache = new LRUCache<string, NetStatus>({
  max: 1,
  ttl: 5 * 60 * 1000,
  fetchMethod: async (dummy, oldValue, { signal }) => {
    const gate = await native_gate();
    const exitList: NetStatus = (await gate.daemon_rpc(
      "net_status",
      []
    )) as any;
    return exitList;
  },
});


// Combined app status types
export type AccountStatus =
  | { level: "Plus"; expiry: number; user_id: number; recurring: boolean; bw_consumption: BwConsumption | null; }
  | { level: "Free"; user_id: number };

  export type BwConsumption = {
    mb_used: number;
    mb_limit: number;
    renew_unix: number;
  }

export type SessionInfo = {
  exit: string;
  country: string;
  city: string;
  protocol: string;
  bridge: string | null;
};

export type ConnectionStatus =
  | { sessions: SessionInfo[]; primary: SessionInfo }
  | "disconnected"
  | "connecting";

export type AppStatus = {
  account: AccountStatus;

  net_status: NetStatus
};

export function endpointHost(endpoint: string): string {
  const trimmed = endpoint.trim();

  const bracketedIpv6 = trimmed.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracketedIpv6) {
    return bracketedIpv6[1];
  }

  const firstColon = trimmed.indexOf(":");
  const lastColon = trimmed.lastIndexOf(":");
  if (
    firstColon > -1 &&
    firstColon === lastColon &&
    /^\d+$/.test(trimmed.slice(firstColon + 1))
  ) {
    return trimmed.slice(0, firstColon);
  }

  return trimmed;
}

/**
 * Creates a self-refreshing store that calls an async function at a given interval.
 * Instead of using setInterval, we run a background task that refreshes, sleeps, and loops.
 * @param refreshFn - The asynchronous function to refresh the store's value.
 * @param intervalMs - Refresh interval in milliseconds.
 * @param initialValue - The initial value of the store.
 */
function selfRefreshingStore<T>(
  refreshFn: () => Promise<T>,
  intervalMs: number | (() => number),
  initialValue: T
): Writable<T> {
  const store = writable(initialValue);
  const isDynamic = typeof intervalMs === "function";
  const getInterval = isDynamic ? (intervalMs as () => number) : () => intervalMs as number;
  const sleep = isDynamic ? burstPollSleep : pollSleep;

  async function loop() {
    while (true) {
      try {
        const value = await refreshFn();
        store.set(value);
      } catch (error) {
        console.error("Error during refresh:", error);
      }
      await sleep(getInterval());
    }
  }

  loop();

  return store;
}

/**
 * Creates a persistent self-refreshing store that calls an async function at a given interval
 * and persists its value to localStorage.
 * @param storageName - The name of the localStorage key.
 * @param refreshFn - The asynchronous function to refresh the store's value.
 * @param intervalMs - Refresh interval in milliseconds.
 * @param initialValue - The initial value of the store.
 */
export function persistentSelfRefreshingStore<T>(
  storageName: string,
  refreshFn: () => Promise<T>,
  intervalMs: number | (() => number),
  initialValue: T
): Writable<T> {
  const store = persistentWritable<T>(storageName, initialValue);
  const isDynamic = typeof intervalMs === "function";
  const getInterval = isDynamic ? (intervalMs as () => number) : () => intervalMs as number;
  const sleep = isDynamic ? burstPollSleep : pollSleep;

  async function loop() {
    while (true) {
      try {
        const value = await refreshFn();
        store.set(value);
      } catch (error) {
        console.error("Error during refresh:", error);
      }
      await sleep(getInterval());
    }
  }

  loop();

  return store;
}

/**
 * Adaptive polling: callers (start/stop daemon) set a burst window during
 * which conn-status / traffic polls fire at a much higher rate. Triggering
 * a burst also wakes any sleeping polls so the very next refresh fires
 * immediately rather than waiting out the slow-interval sleep.
 */
let burstUntil = 0;
const pollWakers = new Set<() => void>();

export function triggerPollBurst(durationMs: number = 10_000) {
  burstUntil = Date.now() + durationMs;
  for (const w of [...pollWakers]) w();
}

function pollInterval(slowMs: number, fastMs: number = 100): number {
  return Date.now() < burstUntil ? fastMs : slowMs;
}

function pollSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Like pollSleep but registers in pollWakers so triggerPollBurst can interrupt it early.
function burstPollSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      pollWakers.delete(finish);
      clearTimeout(t);
      resolve();
    };
    const t = setTimeout(finish, ms);
    pollWakers.add(finish);
  });
}

/**
 * Account status cache: 5 minutes, keyed by secret.
 */
const accountStatusCache = new LRUCache<string, AccountStatus>({
  max: 100,
  ttl: 5 * 60 * 1000,

  fetchMethod: async (secret, oldValue, { signal }) => {
    account_refreshing.set(true);
    try {
      await native_gate();
      const codeStatus = await checkAccountCode(secret);
      if (typeof codeStatus === "string") throw new Error("Account code is no longer current");
      const info = (await broker_rpc("get_user_info_by_cred", [
        { secret },
      ])) as any;
      if (!info) {
        throw new Error("no such user");
      }

      const level = info.plus_expires_unix ? "Plus" : "Free";
      const account: AccountStatus =
        level === "Plus"
          ? {
              level,
              expiry: info.plus_expires_unix,
              user_id: info.user_id,
              recurring: info.recurring,
              bw_consumption: info.bw_consumption,
            }
          : { level, user_id: info.user_id };
      return account;
    } finally {
      account_refreshing.set(false);
    }
  },
});

export const clearAccountCache = () => {
  console.log("clearing account cache!");
  accountStatusCache.clear();
  account_refreshing.set(true);
};

export const clearAllCaches = () => {
  clearAccountCache();
  serverListCache.clear();
};

export const account_refreshing = writable(false);

/**
 * Fetches the connection status from the daemon.
 */
async function fetchConnectionStatus(): Promise<ConnectionStatus> {
  const gate = await native_gate();
  if (!(await gate.is_running())) {
    return "disconnected";
  }
  const info: any = await gate.daemon_rpc("conn_info", []);
  console.log("INFO", info);

  if (info.state === "Connected") {
    const sessions: SessionInfo[] = (info.sessions ?? []).map((s: any) => ({
      exit: endpointHost(s.exit.c2e_listen),
      country: s.exit.country,
      city: s.exit.city,
      protocol: s.protocol,
      bridge: s.bridge ?? null,
    }));
    if (sessions.length === 0) {
      return "connecting";
    }
    const counts = new Map<string, number>();
    for (const s of sessions) {
      counts.set(s.country, (counts.get(s.country) ?? 0) + 1);
    }
    let bestCountry = sessions[0].country;
    let bestCount = -1;
    for (const [c, n] of counts) {
      if (n > bestCount) {
        bestCount = n;
        bestCountry = c;
      }
    }
    const primary =
      sessions.find((s) => s.country === bestCountry) ?? sessions[0];
    return { sessions, primary };
  } else {
    return "connecting";
  }
}

/**
 * Separate connectionStatus store with no caching, using persistentSelfRefreshingStore
 */
export const conn_status: Writable<ConnectionStatus> =
  persistentSelfRefreshingStore(
    "connection_status_1", // localStorage key; bumped when the connected shape changed to {sessions, primary}
    fetchConnectionStatus,
    () => pollInterval(1000),
    "disconnected" // initial value
  );

/**
 * Single store to track account, stats, and news.
 * Returns null if the secret is missing.
 * Persists to localStorage so that on startup it still has the previous version.
 */
export const app_status: Writable<AppStatus | null> =
  persistentSelfRefreshingStore<AppStatus | null>(
    "app_status_1", // localStorage key
    async () => {
      const secret = get(curr_valid_secret);
      if (!secret) {
        return null;
      }

      // fetch language from store
      const lang = get(curr_lang);

      // Run all fetch operations in parallel
      console.log("lang", lang);
      const [account, net_status] = await Promise.all([
        accountStatusCache.fetch(secret),

        serverListCache.fetch("exits"),
      ]);

      if (get(curr_valid_secret) !== secret) throw new Error("Account changed during refresh");
      const previousAccount = get(app_status)?.account;
      if (
        previousAccount?.level === "Free" &&
        account?.level === "Plus" &&
        previousAccount.user_id === account.user_id
      ) {
        // Reconnect with Plus credentials as soon as an upgrade is observed.
        const gate = await native_gate();
        if (await gate.is_running()) {
          const args = await startDaemonArgs();
          if (args?.secret === secret && get(curr_valid_secret) === secret) {
            await gate.restart_daemon(args);
            triggerPollBurst();
          }
        }
      }
      if (get(curr_valid_secret) !== secret) throw new Error("Account changed during refresh");
      const toret = {
        account: account as any,
        net_status: net_status as any,
      };
      console.log("app_status", toret);
      return toret;
    },
    2000, // refresh interval in ms
    null
  );

/**
 * The current exit constraint, taking into account available exits.
 *
 * Lives here rather than in prefs.ts because it reads app_status at module
 * evaluation time; prefs.ts importing user.ts would create an import cycle.
 */
export const pref_exit_constraint_derived: Readable<ExitConstraint> = derived(
  [pref_exit_constraint, app_status],
  ([$pref_exit_constraint, $app_status]) => {
    // Return "auto" when the constraint is already "auto"
    if ($pref_exit_constraint === "auto" || !$app_status) {
      return "auto";
    }

    const exitList = Object.values($app_status.net_status.exits).map(v => v[1]);
    const freeExitList = Object.values($app_status.net_status.exits).filter(v => v[2].allowed_levels.includes("Free")).map(v => v[1]);
    const exits = ($app_status.account.level === "Free") ? freeExitList : exitList;

    // Check if app_status has exits data
    if (exits.length === 0) {
      return "auto";
    }

    // Check if any exit matches the constraint (country and city)
    const matchingExit = exits.find(
      (exit) =>
        exit.country === $pref_exit_constraint.country &&
        exit.city === $pref_exit_constraint.city
    );

    // If no exit matches the constraint, return "auto", otherwise return the constraint
    return matchingExit ? $pref_exit_constraint : "auto";
  }
);

export const startDaemonArgs = async (): Promise<DaemonArgs | null> => {
  const secret = get(curr_valid_secret);
  if (!secret) {
    return null;
  }

  // Get the app whitelist only if enabled
  const useAppWhitelist = get(pref_use_app_whitelist);
  const whitelistApps = useAppWhitelist
    ? Object.keys(get(pref_app_whitelist)).filter(
        (key) => get(pref_app_whitelist)[key]
      )
    : [];

  return {
    secret,
    metadata: {
      filter: {
        nsfw: get(pref_block_adult),
        ads: get(pref_block_ads),
      },
    },
    exit: get(pref_exit_constraint_derived),
    app_whitelist: whitelistApps,
    prc_whitelist: get(pref_use_prc_whitelist),
    allow_lan: get(pref_allow_lan),
    allow_direct: get(pref_allow_direct),
    global_vpn: get(pref_global_vpn),
    proxy: get(pref_proxy_mode)
      ? {
          autoconf: get(pref_proxy_autoconf),
          listen_all: get(pref_listen_all),
          socks5_port: get(pref_socks5_port),
          http_port: get(pref_http_port),
        }
      : null,
  };
};

// A simple store to open or close a payments modal
export const paymentsOpen: Writable<boolean> = writable(false);
export const iosSubscriptionOpen: Writable<boolean> = writable(false);

export async function openPayments() {
  try {
    const gate = await native_gate();
    const info = await gate.get_native_info();
    if (info.platform_type === "ios") {
      paymentsOpen.set(false);
      iosSubscriptionOpen.set(true);
      return;
    }
  } catch (error) {
    console.warn("Unable to determine payment platform", error);
  }
  iosSubscriptionOpen.set(false);
  paymentsOpen.set(true);
}
