// this module will eventually be a wrapper for every platform.
// right now it only supports Electron

import exits from "./pages/exitList";
import { l10n } from "./pages/l10n";

const electron = window.require("electron");
const os = window.require("os");
const spawn = window.require("child_process").spawn;

var daemonPID = null;

// set essential prefs if they don't exist
if (!localStorage.getItem("prefs.autoProxy")) {
  localStorage.setItem("prefs.autoProxy", "true");
}

function getBinaryPath() {
  if (os.platform() == "linux") {
    if (os.arch() == "x64") {
      return __dirname + "/assets/binaries/linux-x64/";
    } else {
      return __dirname + "/assets/binaries/linux-ia32/";
    }
  } else if (os.platform() == "win32") {
    return __dirname + "/assets/binaries/win-ia32/";
  } else if (os.platform() == "darwin") {
    return __dirname + "/assets/binaries/mac-x64/";
  }
  throw "UNKNOWN OS";
}

function binExt() {
  if (os.platform() == "win32") {
    return ".exe";
  } else {
    return "";
  }
}

export function daemonRunning() {
  return daemonPID != null;
}

export function checkAccount(uname, pwd) {
  return new Promise((resolve, reject) => {
    console.log("checking account");
    let pid = spawn(/*getBinaryPath() +*/ "geph-client" + binExt(), [
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

// spawn the geph-client daemon
export function startDaemon(onLogLine) {
  if (daemonPID != null) {
    return;
  }
  let exitname = localStorage.getItem("prefs.exit");
  let exit = exits[exitname];
  if (exit === undefined) {
    alert("undefined exit?!");
    electron.exit();
  }
  daemonPID = spawn("geph-client" + binExt(), [
    "-username",
    localStorage.getItem("prefs.uname"),
    "-password",
    localStorage.getItem("prefs.pwd"),
    "-exitName",
    exitname,
    "-exitKey",
    exit.key
  ]);
  daemonPID.stderr.on("data", data => {
    if (onLogLine) {
      onLogLine(data.toString());
    }
  });
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
      spawn("ProxyToggle.exe", ["127.0.0.1:8780"]);
    } else {
      spawn("pac" + binExt(), ["on", "http://127.0.0.1:8790/proxy.pac"]);
    }
  }
}

// kill the daemon
export function stopDaemon() {
  if (daemonPID != null) {
    let dp = daemonPID;
    daemonPID = null;
    dp.kill();
  }
  if (os.platform() === "win32") {
    spawn("ProxyToggle.exe", []);
  } else {
    spawn("pac" + binExt(), ["off"]);
  }
}

// kill the daemon when we exit
window.onbeforeunload = function(e) {
  if (daemonPID != null) {
    return false;
  }
};
