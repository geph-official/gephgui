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
   * Obtains whether the daemon is running
   */
  is_connected(): Promise<boolean>;

  /**
   * Obtains the current user information
   */
  sync_user_info(username: string, password: string): Promise<UserInfo>;

  /**
   *
   */

  /**
   * Whether this platform supports app whitelists
   */
  supports_app_whitelist: boolean;

  /**
   * Whether this platform supports proxy configuration
   */
  supports_proxy_conf: boolean;

  /**
   * Obtains native info, for debugging. The return type may be extended, and should not guide application logic.
   */
  native_info: NativeInfo;
}

/**
 * Arguments passed to start the Geph daemon.
 */
export interface DaemonArgs {
  // core arguments
  username: string;
  password: string;

  // platform-specific arguments
  app_whitelist: string[];
  china_whitelist: boolean;
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
export interface UserInfo {
  level: "free" | "plus";
  expires: Date | null;
}

function mock_native_gate(): NativeGate {
  let connected = false;
  return {
    start_daemon: async () => {
      await random_sleep();
      connected = true;
    },
    stop_daemon: async () => {
      await random_sleep();
      connected = false;
    },
    is_connected: async () => {
      return connected;
    },
    sync_user_info: async () => {
      await random_sleep();
      return {
        level: "plus",
        expires: new Date(),
      };
    },

    supports_app_whitelist: true,
    supports_proxy_conf: true,
    native_info: {
      platform_type: "linux",
      platform_details: "MockLinux Trololol",
      daemon_version: "0.0.0-mock",
    },
  };
}

window["NATIVE_GATE"] = mock_native_gate();

async function random_sleep() {
  await new Promise((r) => setTimeout(r, Math.random() * 5000));
}

export function native_gate(): NativeGate {
  return window["NATIVE_GATE"] as NativeGate;
}
