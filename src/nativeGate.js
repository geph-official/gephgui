// this module will eventually be a wrapper for every platform.
// right now it only supports Electron

import exits from "./pages/exitList";
import axios from "axios";
import { getl10n } from "./pages/l10n";

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

  const { dialog } = window.require("electron").remote;
  const { shell } = window.require("electron");
  const { app } = window.require("electron").remote;

  var dialogShowed = false;
  version = app.getVersion();
  let currentVersion = version;

  async function checkForUpdates() {
    const updateURLs = [
      "https://raw.githubusercontent.com/geph-official/geph-autoupdate/master/stable.json",
      "https://gitlab.com/bunsim/geph-autoupdate/raw/master/stable.json"
    ];
    if (/TEST/.test(currentVersion)) {
      return;
    }

    try {
      let response = await axios.get(updateURLs[Math.random() > 0.5 ? 1 : 0]);
      let data = response.data;
      let meta = data[getOsName()];
      console.log(meta);
      const [lang, l10n] = getl10n();
      if (meta.Latest !== currentVersion && !dialogShowed) {
        dialogShowed = true;
        let dialogOpts = {
          type: "info",
          buttons: [l10n["updateDownload"], l10n["updateLater"]],
          message:
            l10n["updateInfo"] +
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
    } finally {
    }
  }
  checkForUpdates();
  setInterval(checkForUpdates, 60 * 60 * 1000);
}

var daemonPID = null;

// set essential prefs if they don't exist
if (!localStorage.getItem("prefs.autoProxy")) {
  localStorage.setItem("prefs.autoProxy", "true");
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
  const { remote } = window.require("electron");
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
  return spawn(getBinaryPath() + "geph-client" + binExt(), [
    "-binderProxy",
    "127.0.0.1:23456"
  ]);
}

// stop the binder proxy by handle
export function stopBinderProxy(pid) {
  if (!isElectron) {
    window.Android.jsStopProxBinder(pid);
    return;
  }
  pid.kill();
}

// spawn the geph-client daemon
export async function startDaemon() {
  const [lang, l10n] = getl10n();

  let exitname = localStorage.getItem("prefs.exit");
  let exit = exits[exitname];
  if (!isElectron) {
    window.Android.jsStartDaemon(
      localStorage.getItem("prefs.uname"),
      localStorage.getItem("prefs.pwd"),
      exitname,
      exit.key,
      localStorage.getItem("prefs.useTCP") === "true" ? true : false,
      localStorage.getItem("prefs.forceBridges") === "true" ? true : false
    );
    return;
  }
  if (daemonPID != null) {
    return;
  }
  if (exit === undefined) {
    alert("undefined exit?!");
    electron.exit();
  }
  daemonPID = spawn(
    getBinaryPath() + "geph-client" + binExt(),
    [
      "-username",
      localStorage.getItem("prefs.uname"),
      "-password",
      localStorage.getItem("prefs.pwd"),
      "-exitName",
      exitname,
      "-exitKey",
      exit.key,
      "-useTCP",
      localStorage.getItem("prefs.useTCP") === "true" ? "true" : "false",
      "-forceBridges",
      localStorage.getItem("prefs.forceBridges") === "true" ? "true" : "false"
    ],
    { stdio: "ignore" }
  );
  daemonPID.on("close", code => {
    if (code % 256 === 403 % 256) {
      alert(l10n.err403);
    }
    if (daemonPID !== null) {
      daemonPID = null;
    }
  });
  if (localStorage.getItem("prefs.autoProxy") === "true") {
    // on macOS, elevate pac permissions
    if (os.platform() === "darwin") {
      await elevatePerms();
    }
    // Don't use the pac executable on Windoze!
    if (os.platform() === "win32") {
      console.log("Win32, using alternative proxy enable");
      spawn(getBinaryPath() + "ProxyToggle.exe", ["127.0.0.1:9910"]);
    } else {
      spawn(getBinaryPath() + "pac" + binExt(), [
        "on",
        "http://127.0.0.1:9809/proxy.pac"
      ]);
    }
  }
}

// kill the daemon
export function stopDaemon() {
  if (!isElectron) {
    window.Android.jsStopDaemon();
    return;
  }
  if (daemonPID != null) {
    let dp = daemonPID;
    daemonPID = null;
    dp.kill();
  }
  if (os.platform() === "win32") {
    spawn(getBinaryPath() + "ProxyToggle.exe", []);
  } else {
    spawn(getBinaryPath() + "pac" + binExt(), ["off"]);
  }
}

// kill the daemon when we exit
window.onbeforeunload = function(e) {
  if (daemonPID != null) {
    return false;
  }
};

function arePermsCorrect() {
  const fs = window.require("fs");
  let stats = fs.statSync(getBinaryPath() + "pac");
  console.log("UID of pac is", stats.uid, ", root is zero");
  return stats.uid == 0;
}

function forceElevatePerms() {
  return new Promise((resolve, reject) => {
    const [lang, l10n] = getl10n();
    const spawn = window.require("child_process").spawn;
    let lol = spawn(getBinaryPath() + "cocoasudo", [
      "--prompt=" + l10n["macpacblurb"],
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
