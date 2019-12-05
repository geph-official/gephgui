// this module will eventually be a wrapper for every platform.
// right now it only supports Electron

import exits from "./pages/exitList";
import { l10n } from "./pages/l10n";
import axios from "axios";

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

if (platform === "electron") {
  // on macOS, elevate pac permissions
  if (os.platform() === "darwin") {
    elevatePerms();
  }

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
  var currentVersion = app.getVersion();

  async function checkForUpdates() {
    const updateURL =
      "https://raw.githubusercontent.com/geph-official/geph-autoupdate/master/stable.json";
    try {
      let response = await axios.get(updateURL);
      let data = response.data;
      let meta = data[getOsName()];
      console.log(meta);
      if (meta.Latest != currentVersion && !dialogShowed) {
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
      alert(e);
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
export function startDaemon() {
  let exitname = localStorage.getItem("prefs.exit");
  let exit = exits[exitname];
  if (!isElectron) {
    window.Android.jsStartDaemon(
      localStorage.getItem("prefs.uname"),
      localStorage.getItem("prefs.pwd"),
      exitname,
      exit.key
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
  daemonPID = spawn(getBinaryPath() + "geph-client" + binExt(), [
    "-username",
    localStorage.getItem("prefs.uname"),
    "-password",
    localStorage.getItem("prefs.pwd"),
    "-exitName",
    exitname,
    "-exitKey",
    exit.key
  ]);
  daemonPID.on("close", code => {
    if (code % 256 === 403 % 256) {
      alert(l10n.err403);
    }
    if (daemonPID !== null) {
      daemonPID = null;
    }
  });
  if (localStorage.getItem("prefs.autoProxy") === "true") {
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
  const spawn = window.require("child_process").spawn;
  let lol = spawn(getBinaryPath() + "cocoasudo", [
    "--prompt=" + l10n["macPacMsg"],
    getBinaryPath() + "pac",
    "setuid"
  ]);
  console.log(
    "** PAC path is " + getBinaryPath() + "pac" + ", trying to elevate **"
  );
  lol.stderr.on("data", data => console.log(`stderr: ${data}`));
}

function elevatePerms() {
  const fs = window.require("fs");
  let stats = fs.statSync(getBinaryPath() + "pac");
  if (!arePermsCorrect()) {
    console.log(
      "We have to elevate perms for pac. But to prevent running into that infamous problem, we clear setuid bits first"
    );
    const spawnSync = window.require("child_process").spawnSync;
    spawnSync("/bin/chmod", ["ug-s", getBinaryPath() + "pac"]);
    console.log("Setuid cleared on pac, now we run cocoasudo!");
    forceElevatePerms();
  }
}
