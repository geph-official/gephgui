import MockRss from "./native-gate-mock-rss";
import MockLogs from "./native-gate-mock-logs";

/**
 * An object that represents the communication interface with the native side of a Geph frontend.
 */
export interface NativeGate {
  /**
   * Starts the daemon. Only resolves when the daemon is confirmed to be running.
   */
  start_daemon(daemon_args: DaemonArgs): Promise<void>;

  /**
   * Stops the daemon. Only resolves when the daemon is confirmed to have stopped running.
   */
  stop_daemon(): Promise<void>;

  /**
   * Obtains whether the *daemon* is running
   */
  is_running(): Promise<boolean>;

  /**
   * Obtains whether the *connection* is working
   */
  is_connected(): Promise<boolean>;

  /**
   * Calls the daemon RPC endpoint
   */
  daemon_rpc(method: string, args: any[]): Promise<unknown>;

  /**
   * Calls the binder RPC endpoint
   */
  binder_rpc(method: string, args: any[]): Promise<unknown>;

  /**
   * Purges all caches
   */
  purge_caches(username: string, password: string): Promise<void>;

  /**
   * Obtains the current user information
   */
  sync_user_info(username: string, password: string): Promise<SubscriptionInfo>;

  /**
   * Obtains the list of all exits
   */
  sync_exits(username: string, password: string): Promise<ExitDescriptor[]>;

  /**
   * Gets the list of apps
   */
  sync_app_list(): Promise<AppDescriptor[]>;

  /**
   * Exports debug pack
   */
  export_debug_pack(): Promise<void>;

  /**
   * Obtains the icon of an app
   */
  get_app_icon_url(id: string): Promise<string>;

  /**
   * Whether this platform supports listening on all interfaces
   */
  supports_listen_all: boolean;

  /**
   * Whether this platform supports app whitelists
   */
  supports_app_whitelist: boolean;

  /**
   * Whether this platform supports the PRC whitelist
   */
  supports_prc_whitelist: boolean;

  /**
   * Whether this platform supports proxy configuration
   */
  supports_proxy_conf: boolean;

  /**
   * Whether this platform supports VPN configuration
   */
  supports_vpn_conf: boolean;

  /**
   * Whether this platform supports autoupdates
   */
  supports_autoupdate: boolean;

  /**
   * Obtains native info, for debugging. The return type may be extended, and should not guide application logic.
   */
  get_native_info(): Promise<NativeInfo>;
}

/**
 * Exit descriptor
 */
export interface ExitDescriptor {
  hostname: string;
  signing_key: string;
  country_code: string;
  city_code: string;
  allowed_levels: Level[];
  load: number;
}

/**
 * App descriptor
 */

export interface AppDescriptor {
  id: string;
  friendly_name: string;
}

/**
 * Arguments passed to start the Geph daemon.
 */
export interface DaemonArgs {
  // core arguments
  username: string;
  password: string;

  // connection stuff
  exit_hostname: string;
  force_bridges: boolean;

  // platform-specific arguments
  app_whitelist: string[];
  prc_whitelist: boolean;
  vpn_mode: boolean;
  listen_all: boolean;
  proxy_autoconf: boolean;
}

/**
 * Native information.
 */
export interface NativeInfo {
  platform_type: "windows" | "macos" | "linux" | "android" | "ios";
  platform_details: string;
  version: string;
}

/**
 * User info
 */
export interface SubscriptionInfo {
  level: Level;
  expires: Date | null;
}

export interface SubscriptionInfoSerializable {
  level: Level;
  expires_unix: number | null;
}

export const subinfo_serialize = (
  nfo: SubscriptionInfo
): SubscriptionInfoSerializable => {
  return {
    level: nfo.level,
    expires_unix: nfo.expires ? nfo.expires.getTime() : null,
  };
};

export const subinfo_deserialize = (
  nfo: SubscriptionInfoSerializable
): SubscriptionInfo => {
  return {
    level: nfo.level,
    expires: nfo.expires_unix ? new Date(nfo.expires_unix) : null,
  };
};

type Level = "free" | "plus";

function mock_native_gate(): NativeGate {
  let connected = false;
  let running = false;
  return {
    start_daemon: async () => {
      running = true;
      await random_sleep();
      setTimeout(() => (connected = true), 1000);
    },
    stop_daemon: async () => {
      await random_sleep();
      connected = false;
      running = false;
    },
    is_connected: async () => {
      return connected;
    },
    is_running: async () => {
      return running;
    },
    sync_user_info: async (username, password) => {
      await random_sleep();

      if (username !== "bunsim") {
        throw "incorrect username";
      }
      return {
        level: "free",
        expires: null,
      };
    },

    purge_caches: async (username, password) => {
      await random_sleep();
    },

    daemon_rpc: async (method, args) => {
      if (method === "basic_stats") {
        return {
          last_ping: 100.0,
          last_loss: 0.1,
          protocol: "sosistab-tls",
          address: "0.0.0.0:12345",
          total_recv_bytes: 1000000,
          total_send_bytes: 1,
        };
      } else if (method === "get_logs") {
        return MockLogs;
      } else {
        let pts = Array(400).fill(0);
        for (let i = 0; i < 400; i++) {
          pts[i] = [1665865337 + i, Math.random() * 50000];
        }
        return pts;
      }
    },

    binder_rpc: async (method, args) => {
      if (method === "get_captcha") {
        return {
          captcha_id: "lelol",
          png_data:
            "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAM1BMVEWA2HEdwgUkwwBCxS5RxT1YyE5szGJ/0HiQ1YmZ2JSh2p2v363B5b7R68/b79js9+z///9HPSCbAAAAAXRSTlMAQObYZgAAAOxJREFUOMuFk1cWhCAMRWmhCYT9r3akSRv0fciRXEIKIYQQxuhfMUaSDtbK3AB91YeD5KIC4gp4y+n1QLmBu9iE+g8gMQ5ybAVgst/ECoS4SM+AypuVwuQNZyAHaMoSCi4nIEdw8ewChUmL3YEuvJQAfgTQSJfD8PoBxiRQ9pIFqIAd7X6koQC832GuKZxQC6X6kVSlDNVv7YVuNU67Mv/JnK5v3VTlFuuXmmMDaib6CLAYFAUF7gRIW96Ajlvjlze7dB42YH5blm5Ay+exbwAFP0SYgH0uwDrntFAeDkAfmjJ7X6P3PbwvSDL/AIYAHEpiL5B+AAAAAElFTkSuQmCC",
        };
      } else if (method === "register_user") {
        return true;
      } else if (method === "get_announcements") {
        return MockRss;
      } else {
        throw "idk";
      }
    },

    sync_exits: async (username, password) => {
      await random_sleep();
      return [
        {
          hostname: "us-hio-03.exits.geph.io",
          city_code: "pdx",
          country_code: "us",
          signing_key:
            "e0c3af135a4c835c1b7b9df3e01be4b69a1c00e948d12bf4df2c33e08d4cecff",
          allowed_levels: ["free", "plus"],
          load: 0.99,
        },
        {
          hostname: "us-hio-04.exits.geph.io",
          city_code: "pdx",
          country_code: "us",
          signing_key:
            "e0c3af135a4c835c1b7b9df3e01be4b69a1c00e948d12bf4df2c33e08d4cecff",
          allowed_levels: ["free", "plus"],
          load: 0.78,
        },
        {
          hostname: "us-hio-04.exits.geph.io",
          city_code: "pdx",
          country_code: "us",
          signing_key:
            "e0c3af135a4c835c1b7b9df3e01be4b69a1c00e948d12bf4df2c33e08d4cecff",
          allowed_levels: ["free", "plus"],
          load: 0.78,
        },
        {
          hostname: "us-hio-03.exits.geph.io",
          city_code: "pdx",
          country_code: "us",
          signing_key:
            "e0c3af135a4c835c1b7b9df3e01be4b69a1c00e948d12bf4df2c33e08d4cecff",
          allowed_levels: ["free", "plus"],
          load: 0.78,
        },
        {
          hostname: "us-hio-05.exits.geph.io",
          city_code: "pdx",
          country_code: "us",
          signing_key:
            "e0c3af135a4c835c1b7b9df3e01be4b69a1c00e948d12bf4df2c33e08d4cecff",
          allowed_levels: ["free", "plus"],
          load: 0.78,
        },
        {
          hostname: "us-hio-06.exits.geph.io",
          city_code: "pdx",
          country_code: "us",
          signing_key:
            "e0c3af135a4c835c1b7b9df3e01be4b69a1c00e948d12bf4df2c33e08d4cecff",
          allowed_levels: ["free", "plus"],
          load: 0.78,
        },
        {
          hostname: "sg-sgp-04.exits.geph.io",
          city_code: "sgp",
          country_code: "sg",
          signing_key:
            "5b97a2927dc59acec57784a03e620f2c7b595f01e1030d3f7c1aef76d378f83c",
          allowed_levels: ["plus"],
          load: 0.1,
        },
      ];
    },

    sync_app_list: async () => {
      await random_sleep();
      return [
        {
          id: "com.tencent.mm",
          friendly_name: "WeChat",
        },
        {
          id: "com.tencent.mmm",
          friendly_name: "MeChat",
        },
      ];
    },

    get_app_icon_url: async (id) => {
      await random_sleep();
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAM1BMVEWA2HEdwgUkwwBCxS5RxT1YyE5szGJ/0HiQ1YmZ2JSh2p2v363B5b7R68/b79js9+z///9HPSCbAAAAAXRSTlMAQObYZgAAAOxJREFUOMuFk1cWhCAMRWmhCYT9r3akSRv0fciRXEIKIYQQxuhfMUaSDtbK3AB91YeD5KIC4gp4y+n1QLmBu9iE+g8gMQ5ybAVgst/ECoS4SM+AypuVwuQNZyAHaMoSCi4nIEdw8ewChUmL3YEuvJQAfgTQSJfD8PoBxiRQ9pIFqIAd7X6koQC832GuKZxQC6X6kVSlDNVv7YVuNU67Mv/JnK5v3VTlFuuXmmMDaib6CLAYFAUF7gRIW96Ajlvjlze7dB42YH5blm5Ay+exbwAFP0SYgH0uwDrntFAeDkAfmjJ7X6P3PbwvSDL/AIYAHEpiL5B+AAAAAElFTkSuQmCC";
    },

    async export_debug_pack() {
      alert("do something:");
    },

    supports_listen_all: true,
    supports_app_whitelist: true,
    supports_proxy_conf: true,
    supports_vpn_conf: true,
    supports_prc_whitelist: true,
    supports_autoupdate: false,
    async get_native_info() {
      return {
        platform_type: "linux",
        platform_details: "MockLinux Trololol",
        version: "0.0.0-mock",
      };
    },
  };
}

async function random_sleep() {
  await new Promise((r) => setTimeout(r, Math.random() * 5000));
}

export async function native_gate(): Promise<NativeGate> {
  if (
    import.meta.env.MODE === "development" &&
    !window.hasOwnProperty("NATIVE_GATE")
  ) {
    window["NATIVE_GATE"] = mock_native_gate();
  }
  while (!window.hasOwnProperty("NATIVE_GATE")) {
    await new Promise((r) => setTimeout(r, 100));
  }
  return window["NATIVE_GATE"] as NativeGate;
}
