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
  daemon_rpc(method: string, args: any[]): Promise<any>;

  /**
   * Calls the binder RPC endpoint
   */
  binder_rpc(method: string, args: any[]): Promise<any>;

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
   * Obtains the icon of an app
   */
  get_app_icon_url(id: string): Promise<string>;

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
   * Obtains native info, for debugging. The return type may be extended, and should not guide application logic.
   */
  native_info: NativeInfo;
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
  daemon_version: string;
}

/**
 * User info
 */
export interface SubscriptionInfo {
  level: Level;
  expires: Date | null;
}

type Level = "free" | "plus";

function mock_native_gate(): NativeGate {
  let connected = false;
  let running = false;
  return {
    start_daemon: async () => {
      await random_sleep();
      running = true;
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
        expires: new Date(),
      };
    },

    daemon_rpc: async (method, args) => {
      if (method === "timeseries_stats") {
        return [
          [1665865259, 84.0],
          [1665865260, 297.0],
          [1665865261, 18822.0],
          [1665865262, 34475.0],
          [1665865263, 47603.0],
          [1665865264, 22921.0],
          [1665865265, 2606.0],
          [1665865266, 1520.0],
          [1665865267, 4976.0],
          [1665865268, 15525.0],
          [1665865269, 347.0],
          [1665865270, 15922.0],
          [1665865271, 5356.0],
          [1665865272, 9643.0],
          [1665865273, 1299.0],
          [1665865274, 315100.0],
          [1665865275, 66768.0],
          [1665865276, 2706.0],
          [1665865277, 3863.0],
          [1665865278, 1884.0],
          [1665865279, 3324.0],
          [1665865280, 5705.0],
          [1665865281, 1099784.0],
          [1665865282, 750376.0],
          [1665865283, 3987.0],
          [1665865284, 128.0],
          [1665865285, 8295.0],
          [1665865286, 10396.0],
          [1665865287, 6619.0],
          [1665865288, 3056.0],
          [1665865289, 145967.0],
          [1665865290, 604117.0],
          [1665865291, 143625.0],
          [1665865292, 2317.0],
          [1665865293, 701.0],
          [1665865294, 7799.0],
          [1665865295, 186663.0],
          [1665865296, 3043.0],
          [1665865297, 148229.0],
          [1665865298, 3342.0],
          [1665865299, 79060.0],
          [1665865300, 69233.0],
          [1665865301, 9522.0],
          [1665865302, 145100.0],
          [1665865303, 1842.0],
          [1665865304, 2885.0],
          [1665865305, 722720.0],
          [1665865306, 576107.0],
          [1665865307, 880.0],
          [1665865308, 2661.0],
          [1665865309, 2942.0],
          [1665865310, 3085.0],
          [1665865311, 10164.0],
          [1665865312, 3654.0],
          [1665865313, 14566.0],
          [1665865314, 146106.0],
          [1665865315, 52269.0],
          [1665865316, 45245.0],
          [1665865317, 33149.0],
          [1665865318, 706482.0],
          [1665865319, 37353.0],
          [1665865320, 653722.0],
          [1665865321, 35454.0],
          [1665865322, 513.0],
          [1665865323, 66339.0],
          [1665865324, 34432.0],
          [1665865325, 54155.0],
          [1665865326, 4792.0],
          [1665865327, 58755.0],
          [1665865328, 15658.0],
          [1665865329, 48653.0],
          [1665865330, 56441.0],
          [1665865331, 20827.0],
          [1665865332, 768049.0],
          [1665865333, 18383.0],
          [1665865334, 58295.0],
          [1665865335, 711.0],
          [1665865336, 594590.0],
          [1665865337, 47519.0],
          [1665865338, 29976.0],
          [1665865339, 31632.0],
          [1665865340, 24431.0],
          [1665865341, 32305.0],
          [1665865342, 27749.0],
        ];
      }
      throw "idk";
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
      } else {
        throw "idk";
      }
    },

    sync_exits: async (username, password) => {
      return [
        {
          hostname: "us-hio-03.exits.geph.io",
          city_code: "pdx",
          country_code: "us",
          signing_key:
            "e0c3af135a4c835c1b7b9df3e01be4b69a1c00e948d12bf4df2c33e08d4cecff",
          allowed_levels: ["free", "plus"],
        },
        {
          hostname: "sg-sgp-04.exits.geph.io",
          city_code: "sgp",
          country_code: "sg",
          signing_key:
            "5b97a2927dc59acec57784a03e620f2c7b595f01e1030d3f7c1aef76d378f83c",
          allowed_levels: ["plus"],
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

    supports_app_whitelist: true,
    supports_proxy_conf: true,
    supports_vpn_conf: true,
    supports_prc_whitelist: true,
    native_info: {
      platform_type: "linux",
      platform_details: "MockLinux Trololol",
      daemon_version: "0.0.0-mock",
    },
  };
}

if (!window.hasOwnProperty("NATIVE_GATE"))
  window["NATIVE_GATE"] = mock_native_gate();

async function random_sleep() {
  await new Promise((r) => setTimeout(r, Math.random() * 5000));
}

export function native_gate(): NativeGate {
  return window["NATIVE_GATE"] as NativeGate;
}
