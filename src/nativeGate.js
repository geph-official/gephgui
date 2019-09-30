// this module will eventually be a wrapper for every platform.
// right now it only supports Electron

import exits from "./pages/exitList";

const electron = window.require("electron");
const os = window.require("os");
const spawn = window.require("child_process").spawn;

var daemonPID = null;

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
export function startDaemon() {
  if (daemonPID != null) {
    return;
  }
  let exitname = localStorage.getItem("prefs.exit");
  let exit = exits[exitname];
  if (exit === undefined) {
    alert("undefined exit?!");
    electron.exit();
  }
  daemonPID = spawn(/*getBinaryPath() +*/ "geph-client" + binExt(), [
    "-username",
    localStorage.getItem("prefs.uname"),
    "-password",
    localStorage.getItem("prefs.pwd"),
    "-exitName",
    exitname,
    "-exitKey",
    exit.key
  ]);
  daemonPID.stderr.on("data", data => console.log(`stderr: ${data}`));
  daemonPID.on("close", code => {
    if (daemonPID !== null) {
      daemonPID = null;
    }
  });
}

// kill the daemon
export function stopDaemon() {
  if (daemonPID != null) {
    let dp = daemonPID;
    daemonPID = null;
    dp.kill();
  }
}

// kill the daemon when we exit
window.onbeforeunload = function(e) {
  console.log("Cleaning up...");
  stopDaemon();
};
