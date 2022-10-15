import type { ExitDescriptor } from "../native-gate";
import { writable, type Writable } from "svelte/store";

export function persistentWritable<T>(
  storage_name: string,
  default_value: T
): Writable<T> {
  let initString = localStorage.getItem(storage_name);
  let initValue: any = null;
  try {
    if (initString === null) {
      initValue = default_value;
    } else {
      initValue = JSON.parse(initString);
    }
  } catch {
    initValue = default_value;
  }
  let w = writable(initValue);
  w.subscribe((value: T) => {
    // console.log("storing", value);
    localStorage.setItem(storage_name, JSON.stringify(value));
  });
  return w;
}

/**
 * The current username and password.
 */
export const pref_userpwd: Writable<{
  username: string;
  password: string;
} | null> = persistentWritable("userpwd", null);

/**
 * Selected exit
 */
export const pref_selected_exit: Writable<ExitDescriptor | null> =
  persistentWritable("selected_exit", null);

/**
 * Selected routing mode
 */
export const pref_routing_mode: Writable<"auto" | "bridges"> =
  persistentWritable("routing_mode", "auto");

/**
 * Selected routing mode
 */
export const pref_global_vpn: Writable<boolean> = persistentWritable(
  "global_vpn",
  false
);

/**
 * Whether or not to autoconf proxies.
 */
export const pref_proxy_autoconf: Writable<boolean> = persistentWritable(
  "proxy_autoconf",
  true
);

/**
 * Whether or not to use the app whitelist.
 */
export const pref_use_app_whitelist: Writable<boolean> = persistentWritable(
  "use_app_whitelist",
  false
);

/**
 * Whether or not to use the PRC whitelist.
 */
export const pref_use_prc_whitelist: Writable<boolean> = persistentWritable(
  "use_prc_whitelist",
  false
);

/**
 * The app whitelist.
 */
export const pref_app_whitelist: Writable<{ [key: string]: boolean }> =
  persistentWritable("app_whitelist", {});
