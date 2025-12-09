import MockRss from "./native-gate-mock-rss";
import MockLogs from "./native-gate-mock-logs";
import {
  pref_app_whitelist,
  pref_block_adult,
  type ExitConstraint,
} from "./lib/prefs";
import { curr_valid_secret } from "./lib/user";
import { get } from "svelte/store";

export interface NativeGate {
  start_daemon(daemon_args: DaemonArgs): Promise<void>;
  restart_daemon(daemon_args: DaemonArgs): Promise<void>;
  stop_daemon(): Promise<void>;
  is_running(): Promise<boolean>;
  daemon_rpc(method: string, args: any[]): Promise<unknown>;

  sync_app_list(): Promise<AppDescriptor[]>;
  export_debug_pack(email: string): Promise<void>;
  get_app_icon_url(id: string): Promise<string>;
  get_debug_pack(): Promise<string>;

  supports_listen_all: boolean;
  supports_app_whitelist: boolean;
  supports_prc_whitelist: boolean;
  supports_proxy_conf: boolean;
  supports_vpn_conf: boolean;
  supports_autoupdate: boolean;

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

export interface ExitMetadata {
  allowed_levels: Level[],
  category: "core" | "streaming"
}

/**
 * Network status dump 
 */
export interface NetStatus {
  exits: Record<string, [any, ExitDescriptor, ExitMetadata]>
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
  metadata: any;
  app_whitelist: string[];
  prc_whitelist: boolean;

  // connection stuff
  exit: ExitConstraint;

  // platform-specific arguments
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

type Level = "Free" | "Plus";

function random_fail() {
  if (Math.random() < 0.05) {
    throw "random fail";
  }
}

function mock_native_gate(): NativeGate {
  let connected = false;
  let running = false;
  return {
    start_daemon: async () => {
      random_fail();
      running = true;
      await random_sleep();
      setTimeout(() => (connected = true), 1000);
    },
    restart_daemon: async () => {
      random_fail();
      random_fail();
      random_fail();
      random_fail();
      running = true;
      await random_sleep();
    },
    stop_daemon: async () => {
      random_fail();
      await random_sleep();
      connected = false;
      running = false;
    },

    is_running: async () => {
      random_fail();
      return running;
    },

    async daemon_rpc(method, args) {
      random_fail();
      if ((MockDaemonRpc as any)[method]) {
        return (MockDaemonRpc as any)[method](...args);
      } else {
        throw new Error(`Unknown RPC method: ${method}`);
      }
    },

    sync_app_list: async () => {
      random_fail();
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
      random_fail();
      await random_sleep();
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAM1BMVEWA2HEdwgUkwwBCxS5RxT1YyE5szGJ/0HiQ1YmZ2JSh2p2v363B5b7R68/b79js9+z///9HPSCbAAAAAXRSTlMAQObYZgAAAOxJREFUOMuFk1cWhCAMRWmhCYT9r3akSRv0fciRXEIKIYQQxuhfMUaSDtbK3AB91YeD5KIC4gp4y+n1QLmBu9iE+g8gMQ5ybAVgst/ECoS4SM+AypuVwuQNZyAHaMoSCi4nIEdw8ewChUmL3YEuvJQAfgTQSJfD8PoBxiRQ9pIFqIAd7X6koQC832GuKZxQC6X6kVSlDNVv7YVuNU67Mv/JnK5v3VTlFuuXmmMDaib6CLAYFAUF7gRIW96Ajlvjlze7dB42YH5blm5Ay+exbwAFP0SYgH0uwDrntFAeDkAfmjJ7X6P3PbwvSDL/AIYAHEpiL5B+AAAAAElFTkSuQmCC";
    },

    async export_debug_pack(email) {
      alert("do something:");
    },

    async get_debug_pack() {
      random_fail();
      await random_sleep();
      return "hello\nworld";
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
        version: "0.0.0-mockk",
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
  if ((window as any)["NATIVE_GATE"]) {
    return (window as any)["NATIVE_GATE"] as NativeGate;
  }
  return new Promise<NativeGate>((resolve) => {
    const existing = (window as any)["NATIVE_GATE"];
    if (existing) {
      resolve(existing as NativeGate);
      return;
    }
    const handler = () => {
      if ((window as any)["NATIVE_GATE"]) {
        resolve((window as any)["NATIVE_GATE"] as NativeGate);
        window.removeEventListener("native_gate_ready", handler as any);
      }
    };
    window.addEventListener("native_gate_ready", handler as any, { once: true });
  });
}

export async function broker_rpc(method: string, params: any[]): Promise<any> {
  const gate = await native_gate();
  return gate.daemon_rpc("broker_rpc", [method, params]);
}

let mockRegisterProgress = 0.0;

const MockDaemonRpc = {
  async ab_test(_key: string, _secret: string) {
    return true;
  },

  async broker_rpc(method: string, params: any[]) {
    switch (method) {
      case "raw_price_points":
        return [
          [30, 500],
          [60, 1000],
        ];
      case "basic_price_points":
        return [
          [30, 200],
          [60, 400],
        ];
      case "basic_mb_limit":
        return 5000;
      case "payment_methods":
        return ["credit-card"];
      case "create_payment":
      case "create_basic_payment":
        return "https://payments.example.com";
      case "get_free_voucher":
        return {
          code: "freeplus",
          explanation: { en: "Enjoy free Plus time" },
        };
      case "redeem_voucher":
        return 30;
      case "call_geph_payments":
        return { result: 8 };
      case "upgrade_to_secret":
        return "12345678";
      case "get_user_info_by_cred":
        return {
          user_id: 12345,
          plus_expires_unix: Math.floor(Date.now() / 1000) + 86400 * 30,
          recurring: false,
          bw_consumption: null,
        };
      case "delete_account":
      case "upload_debug_pack":
        return null;
      default:
        throw new Error(`Unknown broker RPC: ${method}`);
    }
  },

  async start_registration() {
    mockRegisterProgress = 0.0;
    (async () => {
      while (mockRegisterProgress < 1.0) {
        await new Promise((r) => setTimeout(r, 100));
        mockRegisterProgress += 0.05;
      }
    })();
    return 0;
  },

  async poll_registration(i: number) {
    if (mockRegisterProgress < 1) {
      return { progress: mockRegisterProgress, secret: null };
    } else {
      return {
        progress: mockRegisterProgress,
        secret: "123456781234567812345678",
      };
    }
  },

  async delete_account(secret: string) {
    await random_sleep();
  },

  async check_secret(secret: string) {
    await random_sleep();
    return secret === "12345678";
  },

  async convert_legacy_account(username: string, password: string) {
    await random_sleep();
    return "12345678";
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

  async stat_history(stat: string) {
    return [1.0, 2.0, 1.0, 2.0, 1.0];
  },

  async recent_logs() {
    return MockLogs;
  },

  async net_status() {
    await random_sleep();
    return {
      "exits": {
        "hello": ["dummy", {
          c2e_listen: "0.0.0.0:1",
          b2e_listen: "0.0.0.0:2",
          country: "CA",
          city: "Montreal",
          load: 0.3,
          expiry: 10000000000,
        }, {allowed_levels: ["Free", "Plus"], category: "core"}],
        "world": ["dummy", {
          c2e_listen: "0.0.0.0:1",
          b2e_listen: "0.0.0.0:2",
          country: "US",
          city: "Miami",
          load: 0.3,
          expiry: 10000000000,
        }, {allowed_levels: ["Plus"], category: "core"}],
        "chele": ["dummy", {
          c2e_listen: "0.0.0.0:1",
          b2e_listen: "0.0.0.0:2",
          country: "TW",
          city: "Taipei",
          load: 0.3,
          expiry: 10000000000,
        }, {allowed_levels: ["Plus"], category: "streaming"}],
      }
    }
  },

  async conn_info() {
    return {
      state: "Connected",
      protocol: "sosistab3",
      bridge: "fake",
      exit: {
        c2e_listen: "0.0.0.0:1",
        b2e_listen: "0.0.0.0:2",
        country: "CA",
        city: "Montreal",
        load: 0.3,
        expiry: 10000000000,
      },
    };
  },

  async user_info(secret: string) {
    await random_sleep();
    // Mock a Plus account that expires soon (in 2 days), non-recurring
    const nowSec = Math.floor(Date.now() / 1000);
    return {
      level: "Plus",
      user_id: 12345,
      expiry: nowSec + 2 * 86400,
      recurring: false,
      bw_consumption: null,
    } as any;
  },

  async latest_news(lang: string) {
    await random_sleep();
    return Array(10)
      .fill({
        title: "Headline 1",
        date_unix: 100000000,
        important: true,
        contents:
          "<i>Boo boo</i> foobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku <a href='#blank'>sjlkdjf</a> sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; d<i>Boo boo</i> foobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku <a href='#blank'>sjlkdjf</a> sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; d<i>Boo boo</i> foobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku <a href='#blank'>sjlkdjf</a> sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; d<i>Boo boo</i> foobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku <a href='#blank'>sjlkdjf</a> sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; dfoobaria doo doo lalalbubuu kukukuku sjlkdjf sdfaoj sjdf slkafj selkfjlskdjf ksdjf; d",
      })
      .map((item, index) => ({
        ...item,
        title: `Headline ${index + 1} ` + lang,
        date_unix: 10000000000 + index * 86400, // Increment date by one day for each item
      }));
  },

  async get_free_voucher(secret: string) {
    return {
      code: "helloworldfree",
      explanation: {
        en: "Enjoy 24 hours of Plus to celebrate Geph 5.0!",
      },
    };
  },

  async redeem_voucher(secret: string, voucher_code: string) {
    random_fail();
    await random_sleep();
    // For testing: if voucher contains "invalid", return 0
    // otherwise return a random number of days between 1 and 90
    if (voucher_code.toLowerCase().includes("invalid")) {
      return 0;
    } else {
      return Math.floor(Math.random() * 90) + 1;
    }
  },

  async call_geph_payments(method: string, params: any[]) {
    if (method == 'eur_cny_fx_rate') {
      return 8;
    } else return 0;
  }
};
