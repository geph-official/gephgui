import type {
  ExitDescriptor,
  SubscriptionInfo,
  SubscriptionInfoSerializable,
} from "../native-gate";
import { derived, writable, type Readable, type Writable } from "svelte/store";
import { app_status } from "./user";

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
 * The current exit constraint
 */
export const pref_exit_constraint: Writable<ExitConstraint> =
  persistentWritable("exit_constraint", "auto");

/**
 * The current exit constraint, taking into account free/plus
 */
export const pref_exit_constraint_derived: Readable<ExitConstraint> = derived(
  [pref_exit_constraint, app_status],
  ([$pref_exit_constraint, $app_status]) => {
    if ($app_status?.account.level === "free") {
      return "auto";
    } else {
      return $pref_exit_constraint;
    }
  }
);

export type ExitConstraint = "auto" | { city: string; country: string };

/**
 * Whether or not the wizard is active
 */
export const pref_wizard: Writable<boolean> = persistentWritable(
  "wizarddd",
  true
);

export const user_info_store: Writable<SubscriptionInfoSerializable | null> =
  persistentWritable("user_info", null);

/**
 * Selected exit
 */
export const pref_selected_exit: Writable<ExitDescriptor | null> =
  persistentWritable("selected_exit_5", null);

/**
 * Selected routing mode
 */
export const pref_routing_mode: Writable<"auto" | "bridges" | "direct"> =
  persistentWritable("routing_mode", "auto");

/**
 * Whether to do global vpn stuff
 */
export const pref_global_vpn: Writable<boolean> = persistentWritable(
  "global_vpn",
  false
);

export const pref_block_ads: Writable<boolean> = persistentWritable(
  "block_ads",
  false
);

export const pref_block_adult: Writable<boolean> = persistentWritable(
  "block_adult",
  false
);

export const pref_block_gambling: Writable<boolean> = persistentWritable(
  "block_gambling",
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
 * Whether or not to listen to all interfaces.
 */
export const pref_listen_all: Writable<boolean> = persistentWritable(
  "listen_all",
  false
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

/**
 * Whether or not easter eggs are enabled
 */
export const pref_eastereggs: Writable<boolean> = writable(false);

/**
 * Dark mode: forced on, forced off, or auto
 */
export const pref_lightdark: Writable<"light" | "dark" | "auto"> =
  persistentWritable("lightdark", "auto");
