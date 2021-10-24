// this module will eventually be a wrapper for every platform.
// right now it only supports Electron

import axios from "axios";
import { exit } from "process";
import semver from "semver";
import { getl10n } from "./redux/l10n";

export const platform = "rpc" in window ? "desktop" : "android";

if (!("rpc" in window)) {
  window["rpc"] = {};
  window["rpc"]["call"] = async (verb, ...args) =>
    JSON.parse(window.Android.executeRpc(verb, JSON.stringify(args)));
}

function convertRemToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

window["rpc"].call("set_conversion_factor", convertRemToPixels(1) / 16);

export var version = "";

export function getVersion() {
  return "0.0.0";
}

export function exportLogs() {
  const lala = new Date().toISOString().replaceAll(":", "-");
  let fname = "debuglogs-" + lala + ".txt";
  window["rpc"].call("export_logs", fname);
}

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
      console.log("gotten: " + JSON.stringify(result));
      if ("error" in result) {
        throw result.error;
      }
      return parseSync(result);
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
export async function stopBinderProxy() {
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
  excludeApps
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
    listen_all: listenAll,
    exclude_apps: excludeApps,
  });
}

export var isAdmin = false;

// kill the daemon
export async function stopDaemon() {
  try {
    axios.get("http://127.0.0.1:9809/kill");
  } finally {
    await window["rpc"].call("stop_daemon");
  }
}
