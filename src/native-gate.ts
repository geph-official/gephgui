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
  c2e_listen: string;
  b2e_listen: string;
  country: string;
  city: string;
  load: number;
  expiry: number;
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
  secret: string;

  // connection stuff
  exit: string;

  // platform-specific arguments
  app_whitelist: string[];
  prc_whitelist: boolean;
  global_vpn: boolean;
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

    async daemon_rpc(method, args) {
      if ((MockDaemonRpc as any)[method]) {
        return (MockDaemonRpc as any)[method](...args);
      } else {
        throw new Error(`Unknown RPC method: ${method}`);
      }
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
    (window as any)["NATIVE_GATE"] = mock_native_gate();
  }
  while (!window.hasOwnProperty("NATIVE_GATE")) {
    await new Promise((r) => setTimeout(r, 100));
  }
  return (window as any)["NATIVE_GATE"] as NativeGate;
}

let mockRegisterProgress = 0.0;

const MockDaemonRpc = {
  async start_registration() {
    mockRegisterProgress = 0.0;
    (async () => {
      while (mockRegisterProgress < 1.0) {
        await new Promise((r) => setTimeout(r, 1000));
        mockRegisterProgress += 0.01;
      }
    })();
    return 1;
  },

  async poll_registration(i: number) {
    return mockRegisterProgress;
  },

  async check_secret(secret: string) {
    await random_sleep();
    return secret === "12345678";
  },

  async basic_stats() {
    return {
      last_ping: 100.0,
      last_loss: 0.1,
      protocol: "sosistab-tls",
      address: "0.0.0.0:12345",
      total_recv_bytes: 1000000,
      total_send_bytes: 1,
    };
  },

  async stat_num(stat: string) {
    return 1.0;
  },

  async recent_logs() {
    return MockLogs;
  },

  async exit_list() {
    await random_sleep();
    return [
      {
        c2e_listen: "0.0.0.0:1",
        b2e_listen: "0.0.0.0:2",
        country: "CAN",
        city: "Montreal",
        load: 0.3,
        expiry: 10000000000,
      },
      {
        c2e_listen: "0.0.0.0:1",
        b2e_listen: "0.0.0.0:2",
        country: "USA",
        city: "Miami",
        load: 0.3,
        expiry: 10000000000,
      },
    ];
  },

  async conn_info() {
    if (Math.random() < 0.1) {
      return { state: "Connecting" };
    } else {
      return {
        state: "Connected",
        protocol: "sosistab3",
        bridge: "fake",
        exit: {
          c2e_listen: "0.0.0.0:1",
          b2e_listen: "0.0.0.0:2",
          country: "CAN",
          city: "Montreal",
          load: 0.3,
          expiry: 10000000000,
        },
      };
    }
  },
};

