import React from "react";
import { IonText } from "@ionic/react";

export var arrs = {};

arrs["en-US"] = {
  accinfo: "Login info",
  account: "Account",
  advanced: "Advanced",
  amount: "Amount",
  autoconn: "Auto-connect",
  autoconnblurb: "Connect when the Geph app starts",
  autoproxy: "Auto-configure proxy",
  autoproxyblurb: "May not work outside major browsers",
  cancel: "Cancel",
  captcha: "CAPTCHA",
  connected: "Connected",
  connectedblurb: "Enjoy an open Internet!",
  connecting: "Connecting",
  core: "Highsec",
  date: "Date",
  disconnected: "Disconnected",
  downstream: "Downstream",
  err403: "You're not allowed on this exit. An upgrade may be needed.",
  errBadCaptcha: "CAPTCHA wrong",
  errExists: "User already exists",
  exitserver: "Exit location:",
  expiry: "Expiration date",
  extend: "Add more time",
  freelimit: "Free account limit:",
  general: "General",
  http: "HTTP proxy",
  langname: "English",
  language: "Language",
  locations: "Locations",
  loginblurb: "Log in with existing account",
  logout: "Log out",
  logs: "Logs",
  netactivity: "Network activity",
  network: "Network",
  nomoretx: "No more transactions",
  overview: "Overview",
  password: "Password",
  passwordConfirm: "Confirm password",
  plusblurb: (
    <>
      Unlimited speed for <b>&euro;5/month</b>
    </>
  ),
  pwdmismatch: "Passwords do not match",
  registerblurb: "Create a new account",
  restartblurb: "Restart Geph to apply language",
  seePlans: "See plans",
  selectExit: "Exit selection",
  settings: "Settings",
  socks5: "SOCKS5 proxy",
  subscription: "Subscription",
  txlog: "Past transactions",
  unameillegal: "Username must be 5 to 100 alphanumeric characters",
  unlockUnlimitedSpeed: "Unlock unlimited speed",
  updateDownload: "Download",
  updateInfo: "A new version is available!",
  updateLater: "Remind me later",
  upgradeToPlus: "Upgrade to Plus",
  upgrade: "Buy Plus!",
  upstream: "Upstream",
  macpacblurb:
    "Geph requires your password to set proxy settings the first time it is started.",
  username: "Username",
  coreblurb: (
    <span>
      <b>Highsec</b> exits are located in the safest jurisdictions
    </span>
  ),
  plus: "Plus",
  paid: "Plus",
  free: "Free",
  tcp: "Use TCP mode",
  tcpblurb: (
    <>
      <b>Experimental feature</b>. Reconnect to apply.
    </>
  ),

  countries: {
    bg: "Bulgaria",
    ch: "Switzerland",
    ca: "Canada",
    jp: "Japan",
    sg: "Singapore",
    us: "USA"
  },

  cities: {
    dal: "Dallas",
    ewr: "Newark",
    gva: "Geneva",
    mtl: "Montreal",
    sfo: "San Francisco",
    sgp: "Singapore",
    sof: "Sofia",
    tyo: "Tokyo"
  }
};

arrs["zh-CN"] = {
  accinfo: "登录信息",
  account: "用户",
  advanced: "高级",
  amount: "金额",
  autoconn: "自动连接",
  autoconnblurb: "开启迷雾通时自动连接",
  autoproxy: "自动设置代理",
  autoproxyblurb: "主流浏览器之外可能需要手动设定",
  cancel: "取消",
  captcha: "验证码",
  connected: "连接成功",
  connectedblurb: "尽享自由的网络！",
  updateDownload: "下载",
  updateInfo: "迷雾通新版本已发布！",
  updateLater: "之后提醒",
  connecting: "连接中",
  date: "日期",
  disconnected: "未连接",
  downstream: "下行",
  err403: "您没有资格登录这个出口端！",
  errBadCaptcha: "验证码错误",
  errExists: "用戶已经存在！",
  exitserver: "出口端位置",
  expiry: "到期时间",
  extend: "延长Plus用户",
  freelimit: "免费用户限速：",
  general: "通用",
  http: "HTTP代理端口",
  langname: "简体中文",
  language: "语言",
  loginblurb: "用已有账户登陆",
  logout: "登出",
  netactivity: "网络使用",
  overview: "概览",
  password: "密码",
  passwordConfirm: "确认密码",
  macpacblurb: "迷雾通第一次连接时，需要您的密码以更改代理设置。",
  plusblurb: (
    <>
      流畅看高清！<b>解除限速&euro;5/月</b>
    </>
  ),
  pwdmismatch: "密码和之前输入的不一样",
  registerblurb: "创建新账户",
  restartblurb: "关闭、重启迷雾通后将使用选择的语言",
  seePlans: "升级",
  settings: "设置",
  socks5: "SOCKS5代理端口",
  subscription: "用户等级",
  txlog: "付费记录",
  unameillegal: "用户名必须为5-100个字母或数字",
  unlockUnlimitedSpeed: "享受无限速度",
  upgrade: "马上购买！",
  upgradeToPlus: "升级至Plus",
  upstream: "上行",
  username: "用户名",
  tcp: "使用TCP模式",
  tcpblurb: (
    <>
      <b>实验性功能</b>。重新连接后生效。
    </>
  ),

  upgradeblurb: (
    <span>
      升级至Plus用户，享受
      <b>
        <IonText color="primary">超快速度</IonText>
      </b>
      ！
    </span>
  ),

  selectExit: "选择出口端",
  locations: "位置",
  core: "高隐私",
  coreblurb: (
    <span>
      <b>高隐私</b>出口端位于网络最安全的地域
    </span>
  ),
  plus: "付费",
  paid: "付费",
  free: "免费",

  countries: {
    bg: "保加利亚",
    ca: "加拿大",
    jp: "日本",
    sg: "新加坡",
    us: "美国",
    ch: "瑞士"
  },

  cities: {
    dal: "达拉斯",
    ewr: "纽瓦克",
    mtl: "蒙特利尔",
    sfo: "旧金山",
    sgp: "新加坡",
    sof: "索菲亚",
    tyo: "东京",
    gva: "日内瓦"
  }
};

arrs["zh-TW"] = {
  accinfo: "登錄信息",
  account: "用戶",
  advanced: "高級",
  amount: "金額",
  autoconn: "自動連接",
  autoconnblurb: "開啓迷霧通時自動連接",
  autoproxy: "自動設置代理",
  autoproxyblurb: "主流浏覽器之外可能需要手動設定",
  cancel: "取消",
  captcha: "驗證碼",
  connected: "連接成功",
  connectedblurb: "盡享自由的網絡！",
  connecting: "連接中",
  date: "日期",
  disconnected: "未連接",
  downstream: "下行",
  err403: "您沒有資格登錄這個出口端！",
  errBadCaptcha: "驗證碼錯誤",
  errExists: "用戶已經存在！",
  exitserver: "出口端位置",
  expiry: "到期時間",
  extend: "延長Plus用戶",
  freelimit: "免費用戶限速：",
  general: "通用",
  http: "HTTP代理端口",
  langname: "繁體中文",
  updateDownload: "下載",
  updateInfo: "迷霧通新版本已發佈！",
  updateLater: "之後提醒",
  language: "語言",
  loginblurb: "用已有賬戶登陸",
  macpacblurb: "迷霧通第一次連接時，需要您的密碼以更改代理設置。",
  logout: "登出",
  netactivity: "網絡使用",
  overview: "概覽",
  password: "密碼",
  passwordConfirm: "確認密碼",
  plusblurb: (
    <>
      流暢看高清！<b>解除限速&euro;5/月</b>
    </>
  ),
  pwdmismatch: "密碼和之前輸入的不一樣",
  registerblurb: "創建新賬戶",
  restartblurb: "關閉、重啓迷霧通後將使用選擇的語言",
  seePlans: "升級",
  settings: "設置",
  socks5: "SOCKS5代理端口",
  subscription: "用戶等級",
  txlog: "付費記錄",
  unameillegal: "用戶名必須為5-100個字母或數字",
  unlockUnlimitedSpeed: "享受無限速度",
  upgrade: "馬上購買！",
  upgradeToPlus: "升級至Plus",
  upstream: "上行",
  username: "用戶名",
  tcp: "使用TCP模式",
  tcpblurb: (
    <>
      <b>實驗性功能</b>。重新連接後生效。
    </>
  ),

  upgradeblurb: (
    <span>
      升級至Plus用戶，享受
      <b>
        <IonText color="primary">超快速度</IonText>
      </b>
      ！
    </span>
  ),

  selectExit: "選擇出口端",
  locations: "位置",
  core: "高隱私",
  coreblurb: (
    <span>
      <b>高隱私</b>出口端位于網絡最安全的地域
    </span>
  ),
  plus: "付費",
  paid: "付費",
  free: "免費",

  countries: {
    bg: "保加利亞",
    ca: "加拿大",
    jp: "日本",
    sg: "新加坡",
    us: "美國",
    ch: "瑞士"
  },

  cities: {
    dal: "達拉斯",
    ewr: "紐瓦克",
    mtl: "蒙特利爾",
    sfo: "舊金山",
    sgp: "新加坡",
    sof: "索菲亞",
    tyo: "東京",
    gva: "日內瓦"
  }
};

if (!localStorage.getItem("prefs.lang")) {
  localStorage.setItem("prefs.lang", navigator.language);
}
export const getl10n = () => {
  let lang = localStorage.getItem("prefs.lang");
  if (lang !== "zh-CN" && lang !== "zh-TW") {
    lang = "en-US";
  }
  let l10n = arrs[lang];
  return [lang, l10n];
};
