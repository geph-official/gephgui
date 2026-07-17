import type {
  ExitConstraint,
  ExitDescriptor,
  SubscriptionInfo,
  SubscriptionInfoSerializable,
} from "../native-gate";
import { writable, type Writable } from "svelte/store";
import { persistentWritable } from "./persistent";

export type { ExitConstraint } from "../native-gate";

/**
 * The current exit constraint
 */
export const pref_exit_constraint: Writable<ExitConstraint> =
  persistentWritable("exit_constraint", "auto");

/**
 * Whether or not the wizard is active
 */
export const pref_wizard: Writable<boolean> = persistentWritable(
  "wizardddd",
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
 * Whether or not to allow direct connections.
 */
export const pref_allow_direct: Writable<boolean> = persistentWritable(
  "allow_direct",
  false
);

// Whether this is a pre-existing install: persistentWritable writes its value
// back on creation, so every install that has run before has this key. Must be
// checked BEFORE the stores below are created.
const is_existing_install = localStorage.getItem("global_vpn_2") !== null;

/**
 * Whether to do global vpn stuff
 */
export const pref_global_vpn: Writable<boolean> = persistentWritable(
  "global_vpn_2",
  true
);

/**
 * Whether the local SOCKS5/HTTP proxies are enabled at all. Existing installs
 * always had them listening, so they default to on; fresh installs are
 * VPN-only by default.
 */
export const pref_proxy_mode: Writable<boolean> = persistentWritable(
  "proxy_mode_1",
  is_existing_install
);

/**
 * SOCKS5 proxy port.
 */
export const pref_socks5_port: Writable<number> = persistentWritable(
  "socks5_port",
  9909
);

/**
 * HTTP proxy port.
 */
export const pref_http_port: Writable<number> = persistentWritable(
  "http_port",
  9910
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
  "proxy_autoconf_1",
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
export const pref_lightdark: Writable<"light" | "dark"> = persistentWritable(
  "lightdark2",
  "light"
);

/**
 * Whether the data collection notice has been shown
 */
export const pref_seen_data_collection: Writable<boolean> = persistentWritable(
  "seen_data_collection_1",
  false
);

/**
 * Whether the direct-connection-mode prompt has been shown.
 */
export const pref_seen_direct_prompt: Writable<boolean> = persistentWritable(
  "seen_direct_prompt_1",
  false
);
