import { get, writable, type Writable } from "svelte/store";
import {
  persistentWritable,
  pref_app_whitelist,
  pref_block_ads,
  pref_block_adult,
  pref_exit_constraint_derived,
  pref_global_vpn,
  pref_listen_all,
  pref_proxy_autoconf,
  pref_use_prc_whitelist,
} from "./prefs";
import {
  native_gate,
  type DaemonArgs,
  type ExitDescriptor,
} from "../native-gate";
import { LRUCache } from "lru-cache";

/**
 * The current valid secret
 */
export const curr_valid_secret: Writable<string | null> = persistentWritable(
  "secret",
  null
);

/****************
 * Language
 ****************/
// We'll assume you have or will create a store for the current language.
// For now, default to "en" if none is specified.
export const curr_lang: Writable<string> = persistentWritable("lang", "en");

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

const newsCache = new LRUCache<string, NewsItem[]>({
  max: 5,
  ttl: 60 * 60 * 1000, // 1 hour
  fetchMethod: async (lang, oldValue, { signal }) => {
    const gate = await native_gate();
    const resp = (await gate.daemon_rpc("latest_news", [lang])) as NewsItem[];
    return resp;
  },
});

async function fetchNews(lang: string): Promise<NewsItem[]> {
  return newsCache.fetch(lang) as any;
}

const serverListCache = new LRUCache<string, ExitDescriptor[]>({
  max: 1,
  ttl: 5 * 60 * 1000,
  fetchMethod: async (dummy, oldValue, { signal }) => {
    const gate = await native_gate();
    const exitList: ExitDescriptor[] = (await gate.daemon_rpc(
      "exit_list",
      []
    )) as any;
    return exitList;
  },
});

// Combined app status types
export type AccountStatus =
  | { level: "Plus"; expiry: number }
  | { level: "Free" };

export type ConnectionStatus =
  | { bridge: string | null; exit: string; country: string }
  | "disconnected"
  | "connecting";

export type AppStatus = {
  account: AccountStatus;
  connection: ConnectionStatus;
  stats: {
    total_users: number[];
    total_mbps: number[];
  };
  news: NewsItem[];
  exits: ExitDescriptor[];
};

interface Stats {
  total_users: number[];
  total_mbps: number[];
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
  intervalMs: number,
  initialValue: T
): Writable<T> {
  const store = writable(initialValue);

  async function loop() {
    while (true) {
      try {
        const value = await refreshFn();
        store.set(value);
      } catch (error) {
        console.error("Error during refresh:", error);
      }
      // Sleep for intervalMs
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  // Start the background task
  loop();

  return store;
}

/**
 * Stats cache: 10 minutes.
 */
const statsCache = new LRUCache<string, Stats>({
  max: 1,
  ttl: 10 * 60 * 1000,
  ignoreFetchAbort: true,
  allowStaleOnFetchAbort: true,
  fetchMethod: async (_) => {
    const gate = await native_gate();
    return {
      total_users: (await gate.daemon_rpc("stat_history", [
        "total_users",
      ])) as number[],
      total_mbps: (await gate.daemon_rpc("stat_history", [
        "total_mbps",
      ])) as number[],
    };
  },
});

/**
 * Account status cache: 1 minute, keyed by secret.
 */
const accountStatusCache = new LRUCache<string, AccountStatus>({
  max: 100,
  ttl: 1 * 60 * 1000,
  ignoreFetchAbort: true,
  allowStaleOnFetchAbort: true,
  fetchMethod: async (secret, oldValue, { signal }) => {
    const gate = await native_gate();
    return (await gate.daemon_rpc("user_info", [secret])) as AccountStatus;
  },
});

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
    return {
      bridge: `${info.protocol} ${info.bridge.split(":")[0]}`,
      exit: info.exit.c2e_listen.split(":")[0],
      country: info.exit.country,
    };
  } else {
    return "connecting";
  }
}

/**
 * Single store to track account, connection, stats, and news.
 * Returns null if the secret is missing.
 */
export const app_status: Writable<AppStatus | null> =
  selfRefreshingStore<AppStatus | null>(
    async () => {
      const secret = get(curr_valid_secret);
      if (!secret) {
        return null;
      }

      // fetch language from store
      const lang = get(curr_lang);

      // Run all fetch operations in parallel
      const [stats, account, connection, news, exits] = await Promise.all([
        statsCache.fetch("stats"),
        accountStatusCache.fetch(secret),
        fetchConnectionStatus(),
        fetchNews(lang),
        serverListCache.fetch("exits"),
      ]);

      return {
        account,
        connection,
        stats,
        news,
        exits,
      };
    },
    500, // refresh interval in ms
    null
  );

export const startDaemonArgs = async (): Promise<DaemonArgs | null> => {
  const secret = get(curr_valid_secret);
  if (!secret) {
    return null;
  }
  const whitelistApps = Object.keys(get(pref_app_whitelist)).filter(
    (key) => get(pref_app_whitelist)[key]
  );

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
    listen_all: get(pref_listen_all),
    proxy_autoconf: get(pref_proxy_autoconf),
    global_vpn: get(pref_global_vpn),
  };
};

// A simple store to open or close a payments modal
export const paymentsOpen: Writable<boolean> = writable(false);
