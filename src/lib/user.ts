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

export type AccountStatus =
  | { level: "plus"; expiry: number }
  | { level: "free" };

export const curr_account_status: Writable<AccountStatus | null> =
  selfRefreshingStore<AccountStatus | null>(
    async () => {
      const gate = await native_gate();
      const resp: any = await gate.daemon_rpc("user_info", [
        get(curr_valid_secret),
      ]);
      console.log(resp);
      return resp;
    },
    5000,
    null
  );

type ConnStatus =
  | { bridge: string | null; exit: string; country: string }
  | "disconnected"
  | "connecting"
  | null;

/**
 * The current connection status
 */
export const curr_conn_status: Writable<ConnStatus> =
  selfRefreshingStore<ConnStatus>(
    async () => {
      const gate = await native_gate();
      if (!(await gate.is_running())) {
        return "disconnected";
      }
      const info: any = await gate.daemon_rpc("conn_info", []);
      if (await gate.is_connected()) {
        console.log(info);
        return {
          bridge: info.protocol + "://" + info.bridge,
          exit: info.exit.c2e_listen.split(":")[0],
          country: "us",
        };
      } else {
        return "connecting";
      }
    },
    500,
    null
  );

/**
 * Creates a self-refreshing store that calls an async function at a given interval.
 * @param refreshFn - The asynchronous function to refresh the store's value.
 * @param intervalMs - Refresh interval in milliseconds.
 * @param initialValue - The initial value of the store.
 */
export function selfRefreshingStore<T>(
  refreshFn: () => Promise<T>,
  intervalMs: number,
  initialValue: T
): Writable<T> {
  const store = writable(initialValue);
  let intervalId: ReturnType<typeof setInterval>;

  let isRefreshing = false;
  const refresh = async () => {
    if (isRefreshing) {
      // Skip if the previous execution is still ongoing
      console.warn("Skipping refresh: previous execution still in progress");
      return;
    }

    isRefreshing = true;
    try {
      const value = await refreshFn();
      store.set(value);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      isRefreshing = false;
    }
  };

  // Function to start the refreshing process
  const start = () => {
    // Perform an immediate refresh
    refresh();

    // Set up the interval for periodic refresh
    intervalId = setInterval(refresh, intervalMs);
  };

  // Start refreshing when the store is created
  start();

  // Return the writable store with additional control methods
  return store;
}
