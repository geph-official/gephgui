// this module will eventually be a wrapper for every platform.
// right now it only supports Electron

import axios from "axios";
import { exit } from "process";
import semver from "semver";
import { getl10n } from "./redux/l10n";

export const platform = "rpc" in window ? "desktop" : "android";

function convertRemToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

window["rpc"].call("set_conversion_factor", convertRemToPixels(1) / 16);

export var version = "";

export function getVersion() {
  return "0.0.0";
}

export function exportLogs() {}

export function startUpdateChecks(l10n) {}

var DAEMON_RUNNING = false;

export function getPlatform() {
  return platform;
}

export function isWindows() {
  return false;
}

export async function syncStatus(uname, pwd, force) {
  const sync_id = await window["rpc"].call(
    "start_sync_status",
    uname,
    pwd,
    force
  );
  for (;;) {
    const result = await window["rpc"].call("check_sync_status", sync_id);
    if (result) {
      if ("error" in result) {
        throw result.error;
      }
      return result;
    }
    await sleep(100);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseSync(lala) {
  // sort free vs plus
  let [accInfo, allExits, freeExits] = lala;
  for (let exit of allExits) {
    exit.plus_only = true;
  }
  for (let freeExit of freeExits) {
    // crazy inefficient but it's fine
    for (let exit of allExits) {
      if (exit.hostname === freeExit.hostname) {
        exit.plus_only = false;
      }
    }
  }
  return [accInfo, allExits];
}

// spawn geph-client in binder proxy mode
export async function startBinderProxy() {
  await window["rpc"].call("start_binder_proxy");
}

// stop the binder proxy by handle
export async function stopBinderProxy(pid) {
  await window["rpc"].call("stop_binder_proxy");
}

// spawn the geph-client daemon
export async function startDaemon(
  exitName,
  username,
  password,
  listenAll,
  forceBridges,
  useTCP,
  autoProxy,
  bypassChinese,
  vpn,
  excludeAppsJson
) {
  await window["rpc"].call("start_daemon", {
    username: username,
    password: password,
    exit_name: exitName,
    use_tcp: useTCP,
    force_bridges: forceBridges,
    vpn: vpn,
    exclude_prc: bypassChinese,
    autoproxy: autoProxy,
  });
}

export var isAdmin = false;

// kill the daemon
export async function stopDaemon() {
  try {
    await axios.get("http://127.0.0.1:9809/kill");
  } catch {
  } finally {
    await window["rpc"].call("stop_daemon");
  }
}
