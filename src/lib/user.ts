import { get, writable, type Readable, type Writable } from "svelte/store";
import {
  persistentWritable,
  pref_app_whitelist,
  pref_block_ads,
  pref_block_adult,
  pref_allow_direct,
  pref_exit_constraint_derived,
  pref_global_vpn,
  pref_listen_all,
  pref_proxy_autoconf,
  pref_use_app_whitelist,
  pref_use_prc_whitelist,
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
  const getInterval =
    typeof intervalMs === "function" ? intervalMs : () => intervalMs;

  async function loop() {
    while (true) {
      try {
        const value = await refreshFn();
        store.set(value);
      } catch (error) {
        console.error("Error during refresh:", error);
      }
      await pollSleep(getInterval());
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
  const getInterval =
    typeof intervalMs === "function" ? intervalMs : () => intervalMs;

  async function loop() {
    while (true) {
      try {
        const value = await refreshFn();
        store.set(value);
      } catch (error) {
        console.error("Error during refresh:", error);
      }
      await pollSleep(getInterval());
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
      const info = (await broker_rpc("get_user_info_by_cred", [
        { secret },
      ])) as any;
      if (!info) {
        throw new Error("no such user");
      }
      console.log("new info", info, secret);
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
    "connection_status", // localStorage key
    fetchConnectionStatus,
    () => pollInterval(1000),
    "disconnected" // initial value
  );

export const traffic_history: Readable<number[]> = selfRefreshingStore(
  async () => {
    const gate = await native_gate();
    const v: number[] = (await gate.daemon_rpc("stat_history", [
      "traffic",
    ])) as any;
    if (v.length > 0) {
      v.pop();
    }
    // Pad the array with zeros at the beginning to reach a length of 600
    const padLength = Math.max(0, 600 - v.length);
    const paddedArray = [...Array(padLength).fill(0), ...v];

    return paddedArray;
  },
  1000,
  []
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
    allow_direct: get(pref_allow_direct),
    listen_all: get(pref_listen_all),
    proxy_autoconf: get(pref_proxy_autoconf),
    global_vpn: get(pref_global_vpn),
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
