// this module will eventually be a wrapper for every platform.
// right now it only supports Electron

import axios from "axios";
import {
  getl10n
} from "./redux/l10n";

let electron;
let os;
let spawn;

let isElectron = false;

if ("require" in window) {
  electron = window.require("electron");
  os = window.require("os");
  spawn = window.require("child_process").spawn;
  isElectron = true;
}

export const platform = isElectron ? "electron" : "android";

export var version = "";

export function getVersion() {
  if (platform === "electron") {
    const {
      app
    } = window.require("electron").remote;
    return app.getVersion();
  }
  return "0.0.0";
}

var globl10n;

export function startUpdateChecks(l10n) {
  globl10n = l10n
  if (platform === "electron") {
    function getOsName() {
      if (os.platform() === "linux") {
        if (os.arch() === "x64") {
          return "Linux64";
        } else {
          return "Linux32";
        }
      } else if (os.platform() === "win32") {
        return "Windows";
      } else if (os.platform() === "darwin") {
        return "MacOS";
      }
      return "";
    }

    const {
      dialog
    } = window.require("electron").remote;
    const {
      shell
    } = window.require("electron");
    const {
      app
    } = window.require("electron").remote;

    var dialogShowed = false;
    version = app.getVersion();
    let currentVersion = version;

    async function checkForUpdates() {
      const updateURLs = [
        "https://gitlab.com/bunsim/geph-autoupdate/raw/master/stable.json"
      ];
      if (/TEST/.test(currentVersion)) {
        return;
      }
      if (window.require("electron").remote.getGlobal("process").env.NOUPDATE) {
        return;
      }

      try {
        let response = await axios.get(updateURLs[0]);
        let data = response.data;
        let meta = data[getOsName()];
        if (meta.Latest !== currentVersion && !dialogShowed) {
          dialogShowed = true;
          let dialogOpts = {
            type: "info",
            buttons: [l10n["updateDownload"], l10n["updateLater"]],
            message: l10n["updateInfo"] +
              "\n" +
              "(" +
              currentVersion +
              " => " +
              meta.Latest +
              ")"
          };
          dialog.showMessageBox(dialogOpts, response => {
            if (response === 0) {
              shell.openExternal(meta.Mirrors[0]);
            }
          });
        }
      } catch (e) {
        console.log(e);
      } finally {}
    }
    checkForUpdates();
    setInterval(checkForUpdates, 60 * 60 * 1000);
  }
}

var daemonPID = null;

export function getPlatform() {
  return platform;
}

function binExt() {
  if (os.platform() === "win32") {
    return ".exe";
  } else {
    return "";
  }
}

export function daemonRunning() {
  return daemonPID != null;
}

function getBinaryPath() {
  const {
    remote
  } = window.require("electron");
  const myPath = remote.app.getAppPath();
  if (os.platform() == "linux") {
    if (os.arch() == "x64") {
      return myPath + "/binaries/linux-x64/";
    } else {
      return myPath + "/binaries/linux-ia32/";
    }
  } else if (os.platform() == "win32") {
    return myPath + "/binaries/win-ia32/";
  } else if (os.platform() == "darwin") {
    return myPath + "/binaries/mac-x64/";
  }
  throw "UNKNOWN OS";
}

export function checkAccount(uname, pwd) {
  if (!isElectron) {
    return new Promise((resolve, reject) => {
      window._CALLBACK = resolve;
      window.Android.jsCheckAccount(uname, pwd, "window._CALLBACK");
    });
  }
  return new Promise((resolve, reject) => {
    console.log("checking account");
    let pid = spawn(getBinaryPath() + "geph-client" + binExt(), [
      "-username",
      uname,
      "-password",
      pwd,
      "-loginCheck"
    ]);
    pid.on("close", code => {
      resolve(code);
    });
  });
}

// spawn geph-client in binder proxy mode
export function startBinderProxy() {
  if (!isElectron) {
    let x = window.Android.jsStartProxBinder();
    return x;
  }
  return spawn(
    getBinaryPath() + "geph-client" + binExt(),
    ["-binderProxy", "127.0.0.1:23456"], {
      stdio: "inherit"
    }
  );
}

// stop the binder proxy by handle
export function stopBinderProxy(pid) {
  if (!isElectron) {
    window.Android.jsStopProxBinder(pid);
    return;
  }
  pid.kill("SIGKILL");
}

// spawn the geph-client daemon
export async function startDaemon(
  exitName,
  exitKey,
  username,
  password,
  useTCP,
  forceBridges,
  autoProxy
) {
  if (!isElectron) {
    window.Android.jsStartDaemon(
      username,
      password,
      exitName,
      exitKey,
      useTCP,
      forceBridges
    );
    return;
  }
  if (daemonPID !== null) {
    throw "daemon started when it really shouldn't be";
  }
  daemonPID = spawn(
    getBinaryPath() + "geph-client" + binExt(),
    [
      "-username",
      username,
      "-password",
      password,
      "-exitName",
      exitName,
      "-exitKey",
      exitKey,
      "-useTCP=" + useTCP,
      "-forceBridges=" + forceBridges
    ], {
      stdio: "inherit"
    }
  );
  daemonPID.on("close", code => {
    if (daemonPID !== null) {
      daemonPID = null;
    }
  });
  if (autoProxy) {
    // on macOS, elevate pac permissions
    if (os.platform() === "darwin") {
      await elevatePerms();
    }
    // Don't use the pac executable on Windoze!
    if (os.platform() === "win32") {
      console.log("Win32, using alternative proxy enable");
      spawn(getBinaryPath() + "ProxyToggle.exe", ["127.0.0.1:9910"], {
        stdio: "ignore"
      });
    } else {
      spawn(
        getBinaryPath() + "pac" + binExt(),
        ["on", "http://127.0.0.1:9809/proxy.pac"], {
          stdio: "ignore"
        }
      );
    }
  }
}

// kill the daemon
export async function stopDaemon() {
  try {
    await axios.get("http://localhost:9809/kill")
  } catch {

  }
  // before anything else, send a kill request
  if (!isElectron) {
    //window.Android.jsStopDaemon();
    return;
  }
  if (daemonPID != null) {
    let dp = daemonPID;
    daemonPID = null;
    dp.kill("SIGKILL");
  }
  if (os.platform() === "win32") {
    spawn(getBinaryPath() + "ProxyToggle.exe", []);
  } else {
    spawn(getBinaryPath() + "pac" + binExt(), ["off"]);
  }
}

// kill the daemon when we exit
if (isElectron) {
  window.onbeforeunload = function (e) {
    if (daemonPID != null) {
      e.preventDefault()
      e.returnValue = false;
      const {
        remote
      } = window.require("electron");
      remote.BrowserWindow.getFocusedWindow().hide();
      return false;
    }
  };
}

function arePermsCorrect() {
  const fs = window.require("fs");
  let stats = fs.statSync(getBinaryPath() + "pac");
  console.log("UID of pac is", stats.uid, ", root is zero");
  return stats.uid == 0;
}

function forceElevatePerms() {
  return new Promise((resolve, reject) => {
    const spawn = window.require("child_process").spawn;
    let lol = spawn(getBinaryPath() + "cocoasudo", [
      "--prompt=" + globl10n["macpacblurb"],
      getBinaryPath() + "pac",
      "setuid"
    ]);
    console.log(
      "** PAC path is " + getBinaryPath() + "pac" + ", trying to elevate **"
    );
    lol.stderr.on("data", data => console.log(`stderr: ${data}`));
    lol.on("close", code => {
      resolve(code);
    });
  });
}

async function elevatePerms() {
  const fs = window.require("fs");
  let stats = fs.statSync(getBinaryPath() + "pac");
  if (!arePermsCorrect()) {
    console.log(
      "We have to elevate perms for pac. But to prevent running into that infamous problem, we clear setuid bits first"
    );
    const spawnSync = window.require("child_process").spawnSync;
    spawnSync("/bin/chmod", ["ug-s", getBinaryPath() + "pac"]);
    console.log("Setuid cleared on pac, now we run cocoasudo!");
    await forceElevatePerms();
  }
}