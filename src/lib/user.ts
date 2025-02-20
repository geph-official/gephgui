import { get, writable, type Writable } from "svelte/store";
import { persistentWritable } from "./prefs";
import { native_gate } from "../native-gate";

/**
 * The current valid secret
 */
export const curr_valid_secret: Writable<string | null> = persistentWritable(
  "secret",
  null
);

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
};

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
 * Single store to track both account status and connection status.
 * It's null by default or if the secret is null.
 */
export const app_status: Writable<AppStatus | null> =
  selfRefreshingStore<AppStatus | null>(
    async () => {
      const secret = get(curr_valid_secret);
      if (!secret) {
        // If there's no valid secret, return null
        return null;
      }

      const gate = await native_gate();

      // Get status
      const stats = {
        total_users: (await gate.daemon_rpc("stat_history", [
          "total_users",
        ])) as number[],
        total_mbps: (await gate.daemon_rpc("stat_history", [
          "total_users",
        ])) as number[],
      };

      // Get account info
      const userInfo: any = await gate.daemon_rpc("user_info", [secret]);
      const account: AccountStatus = userInfo;

      // If the daemon isn't running, assume disconnected
      if (!(await gate.is_running())) {
        return {
          account,
          connection: "disconnected",
          stats,
        };
      }

      // Otherwise get connection info
      const info: any = await gate.daemon_rpc("conn_info", []);
      if (info.state === "Connected") {
        return {
          account,
          connection: {
            bridge: `${info.protocol}://${info.bridge}`,
            exit: info.exit.c2e_listen.split(":")[0],
            country: "us",
          },
          stats,
        };
      } else {
        return {
          account,
          connection: "connecting",
          stats,
        };
      }
    },
    500, // refresh interval in ms
    null
  );

// A simple store to open or close a payments modal
export const paymentsOpen: Writable<boolean> = writable(false);
