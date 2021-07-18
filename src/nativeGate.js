// this module will eventually be a wrapper for every platform.
// right now it only supports Electron

import axios from "axios";
import { exit } from "process";
import semver from "semver";
import { getl10n } from "./redux/l10n";

let electron;
let os;
let spawn;
let spawnSync;

let isElectron = false;

if ("require" in window) {
  electron = window.require("electron");
  os = window.require("os");
  spawn = window.require("child_process").spawn;
  spawnSync = window.require("child_process").spawnSync;
  isElectron = true;
}

export const platform = isElectron ? "electron" : "android";

export var version = "";

export function getVersion() {
  if (platform === "electron") {
    const { app } = window.require("electron").remote;
    return app.getVersion();
  }
  return "0.0.0";
}

export function electronTempDirectory() {
  const { app } = window.require("electron").remote;
  return app.getPath("temp");
}

var globl10n;

// export the logs.
export function exportLogs() {
  const lala = new Date().toISOString().replaceAll(":", "-");
  let fname = "debuglogs-" + lala + ".txt";
  if (platform === "electron") {
    const { ipcRenderer } = window.require("electron");
    // download file into that path
    ipcRenderer.send("exportLogs", {
      filename: localStorage.getItem("logFile"),
    });
  } else {
    window.Android.jsExportLogs(fname);
  }
}

export function startUpdateChecks(l10n) {
  globl10n = l10n;
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
        "https://gitlab.com/bunsim/geph-autoupdate/raw/master/stable.json",
        "https://f001.backblazeb2.com/file/geph4-dl/stable.json",
      ];
      if (/TEST/.test(currentVersion)) {
        return;
      }
      if (window.require("electron").remote.getGlobal("process").env.NOUPDATE) {
        return;
      }

      try {
        let response = await axios.get(
          updateURLs[Math.floor(Math.random() * updateURLs.length)]
        );
        let data = response.data;
        let meta = data[getOsName()];
        if (semver.gt(meta.Latest, currentVersion) && !dialogShowed) {
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
              ")",
          };
          let { response, _ } = await dialog.showMessageBox(dialogOpts);
          if (response === 0) {
            shell.openExternal(meta.Mirrors[0]);
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
      }
    }
    checkForUpdates();
    setInterval(checkForUpdates, 60 * 60 * 1000);
  }
}

var DAEMON_RUNNING = false;

export function getPlatform() {
  return platform;
}

export function isWindows() {
  return platform === "electron" && os.platform() === "win32";
}

function binExt() {
  if (os.platform() === "win32") {
    return ".exe";
  } else {
    return "";
  }
}

export function daemonRunning() {
  return DAEMON_RUNNING;
}

function getBinaryPath() {
  // return "";
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

export function syncStatus(uname, pwd, force) {
  if (!isElectron) {
    return new Promise((resolve, reject) => {
      window._CALLBACK = (v) => {
        const lala = JSON.parse(atob(v));
        if (lala.error) {
          reject(lala.error);
        } else {
          resolve(parseSync(lala));
        }
      };
      window.Android.jsCheckAccount(uname, pwd, force, "window._CALLBACK");
    });
  }
  let jsonBuffer = "";
  return new Promise((resolve, reject) => {
    console.log("checking account");
    let pid = spawn(
      getBinaryPath() + "geph4-client" + binExt(),
      ["sync", "--username", uname, "--password", pwd].concat(
        force ? ["--force"] : []
      )
    );

    pid.stdout.on("data", (data) => {
      jsonBuffer += data.toString();
    });
    pid.on("close", (code) => {
      const lala = JSON.parse(jsonBuffer);
      if (lala.error) {
        reject(lala.error);
      } else {
        resolve(parseSync(lala));
      }
    });

    setTimeout(() => {
      pid.kill();
    }, 20000);
  });
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
export function startBinderProxy() {
  if (!isElectron) {
    let x = window.Android.jsStartProxBinder();
    return x;
  }
  return spawn(
    getBinaryPath() + "geph4-client" + binExt(),
    ["binder-proxy", "--listen", "127.0.0.1:23456"],
    {
      stdio: "inherit",
    }
  );
}

// stop the binder proxy by handle
export async function stopBinderProxy(pid) {
  if (!isElectron) {
    window.Android.jsStopProxBinder(pid);
    return;
  }
  pid.kill();
}

function isOSWin64() {
  var arch = require("arch");
  return arch() == "x64" && os.platform() === "win32";
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
  if (!isElectron) {
    window.Android.jsStartDaemon(
      username,
      password,
      exitName,
      listenAll,
      forceBridges,
      useTCP,
      bypassChinese,
      excludeAppsJson
    );
    return;
  }

  if (vpn) {
    await startDaemonVpn(
      exitName,
      username,
      password,
      forceBridges,
      useTCP,
      listenAll
    );
    return;
  }
  if (daemonRunning()) {
    throw "daemon started when it really shouldn't be";
  }
  const lala = new Date().toISOString().replaceAll(":", "-");
  let logFile = electronTempDirectory() + `/geph4-logs-${lala}.txt`;
  localStorage.setItem("logFile", logFile);

  let daemonPID = spawn(
    getBinaryPath() + "geph4-client" + (isOSWin64() ? "64" : "") + binExt(),
    [
      "connect",
      "--username",
      username,
      "--password",
      password,
      "--exit-server",
      exitName,
      "--socks5-listen",
      listenAll ? "0.0.0.0:9909" : "127.0.0.1:9909",
      "--http-listen",
      listenAll ? "0.0.0.0:9910" : "127.0.0.1:9910",
      "--log-file",
      logFile,
    ]
      .concat(forceBridges ? ["--use-bridges"] : [])
      .concat(useTCP ? ["--use-tcp"] : [])
      .concat(bypassChinese ? ["--exclude-prc"] : []),
    {
      detached: false,
    }
  );

  daemonPID.stdout.on("data", (data) => {
    console.log(`geph4-client stdout: ${data}`);
  });

  daemonPID.stderr.on("data", (data) => {
    console.log(`geph4-client stderr: ${data}`);
  });

  daemonPID.on("exit", (_) => {
    DAEMON_RUNNING = false;
  });

  DAEMON_RUNNING = true;

  if (autoProxy) {
    proxySet = true;
    // on macOS, elevate pac permissions
    if (os.platform() === "darwin") {
      await elevatePacHelper();
    }
    // Don't use the pac executable on Windoze!
    if (os.platform() === "win32") {
      console.log("Win32, using alternative proxy enable");
      spawnSync(
        getBinaryPath() + "winproxy-stripped.exe",
        ["-proxy", "http://127.0.0.1:9910"],
        {
          stdio: "ignore",
        }
      );
      spawnSync(
        getBinaryPath() + "winproxy-stripped.exe",
        ["-autoproxy", "http://127.0.0.1:9809/proxy.pac"],
        {
          stdio: "ignore",
        }
      );
    } else {
      spawn(
        getBinaryPath() + "pac" + binExt(),
        ["on", "http://127.0.0.1:9809/proxy.pac"],
        {
          stdio: "ignore",
        }
      );
    }
  }
}

// starts VPN mode
async function startDaemonVpn(
  exitName,
  username,
  password,
  forceBridges,
  useTCP,
  listenAll
) {
  if (os.platform() !== "linux" && os.platform() !== "win32") {
    alert("VPN mode only supported on Linux and Windows");
    return;
  }
  const lala = new Date().toISOString().replaceAll(":", "-");
  let logFile = electronTempDirectory() + `/geph4-logs-${lala}.txt`;
  localStorage.setItem("logFile", logFile);

  let isUnix = os.platform() !== "win32";

  if (isUnix) {
    spawnSync(getBinaryPath() + "escalate-helper");
  }
  let pid = spawn(
    isUnix ? "/opt/geph4-vpn-helper" : getBinaryPath() + "geph4-vpn-helper.exe",
    [
      isUnix
        ? "/opt/geph4-client"
        : getBinaryPath() + "geph4-client" + (isOSWin64() ? "64" : "") + ".exe",
      "connect",
      "--username",
      username,
      "--password",
      password,
      "--exit-server",
      exitName,
      "--stdio-vpn",
      "--socks5-listen",
      listenAll ? "0.0.0.0:9909" : "127.0.0.1:9909",
      "--http-listen",
      listenAll ? "0.0.0.0:9910" : "127.0.0.1:9910",
      "--log-file",
      logFile,
    ]
      .concat(forceBridges ? ["--use-bridges"] : [])
      .concat(useTCP ? ["--use-tcp"] : [])
      .concat(
        isUnix
          ? [
              "--dns-listen",
              "127.0.0.1:15353",
              "--credential-cache",
              "/tmp/geph4-ngcreds",
            ]
          : []
      ),
    { detached: false }
  );
  console.log(pid);
  pid.stdout.on("data", (data) => {
    console.log(`geph4-vpn-helper stdout: ${data}`);
  });

  pid.stderr.on("data", (data) => {
    console.log(`geph4-vpn-helper stderr: ${data}`);
  });

  pid.on("exit", (_) => {
    DAEMON_RUNNING = false;
  });
  DAEMON_RUNNING = true;
  vpnSet = true;
}

var vpnSet = false;

export var isAdmin = false;

if (isElectron) {
  const { remote } = window.require("electron");
  const isElevated = remote.require("is-elevated");
  (async () => {
    isAdmin = await isElevated();
  })();
}

var proxySet = false;

// kill the daemon
export async function stopDaemon() {
  if (vpnSet) {
    vpnSet = false;
    spawn("/opt/geph4-vpn-helper", [], {
      stdio: "inherit",
    });
  }
  try {
    await axios.get("http://127.0.0.1:9809/kill");
  } catch {}
  if (!isElectron) {
    return;
  }
  if (os.platform() === "win32") {
    spawn(getBinaryPath() + "winproxy-stripped.exe", ["-unproxy"]);
  } else {
    spawn(getBinaryPath() + "pac" + binExt(), ["off"]);
  }
  DAEMON_RUNNING = false;
}

// kill the daemon when we exit
if (isElectron) {
  window.onbeforeunload = function (e) {
    if (daemonRunning()) {
      e.preventDefault();
      e.returnValue = false;
      if (window) {
        const { remote } = window.require("electron");
        remote.BrowserWindow.getAllWindows()[0].hide();
      }
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

function macElevatePerms() {
  return new Promise((resolve, reject) => {
    const spawn = window.require("child_process").spawn;
    let lol = spawn(getBinaryPath() + "cocoasudo", [
      "--prompt=" + globl10n["macpacblurb"],
      getBinaryPath() + "pac",
      "setuid",
    ]);
    console.log(
      "** PAC path is " + getBinaryPath() + "pac" + ", trying to elevate **"
    );
    lol.stderr.on("data", (data) => console.log(`stderr: ${data}`));
    lol.on("close", (code) => {
      resolve(code);
    });
  });
}

async function elevatePacHelper() {
  const fs = window.require("fs");
  let stats = fs.statSync(getBinaryPath() + "pac");
  if (!arePermsCorrect()) {
    console.log(
      "We have to elevate perms for pac. But to prevent running into that infamous problem, we clear setuid bits first"
    );
    const spawnSync = window.require("child_process").spawnSync;
    spawnSync("/bin/chmod", ["ug-s", getBinaryPath() + "pac"]);
    console.log("Setuid cleared on pac, now we run cocoasudo!");
    await macElevatePerms();
  }
}
