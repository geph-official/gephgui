import { writable, type Writable } from "svelte/store";

import { persistentWritable } from "./prefs";
import { native_gate } from "../native-gate";

/**
 * The current valid secret
 */
export const curr_valid_secret: Writable<string | null> = persistentWritable(
  "secret",
  null
);

type ConnStatus =
  | { bridge: string | null; exit: string }
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
        return {
          bridge: info.bridge,
          exit: info.exit.c2e_listen,
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

  // Function to start the refreshing process
  const start = async () => {
    try {
      // First update immediately
      const value = await refreshFn();
      store.set(value);
    } catch (error) {
      console.error("Error during refresh:", error);
    }

    // Continue updating on an interval
    intervalId = setInterval(async () => {
      try {
        const value = await refreshFn();
        store.set(value);
      } catch (error) {
        console.error("Error during refresh:", error);
      }
    }, intervalMs);
  };

  // Start refreshing when the store is created
  start();

  // Return the writable store with additional control methods
  return store;
}
