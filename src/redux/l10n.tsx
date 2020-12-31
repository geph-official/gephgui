import React from "react";
import { GlobalState } from ".";
import detectNearestBrowserLocale from "detect-nearest-browser-locale";

const enUSBindings = {
  fmtDaysLeft: (days: string) => (
    <>
      Plus expires in <b>{days}</b> days
    </>
  ),
  fmtDaysLeftShort: (days: string) => (
    <>
      <b>{days}</b> days left
    </>
  ),
  you: "You",
  announcements: "News",
  accinfo: "Login info",
  account: "Account",
  advanced: "Advanced",
  amount: "Amount",
  listenall: "Listen on all interfaces",
  listenallblurb: "Shares Geph with other computers on the same network",
  autoconn: "Auto-connect",
  autoconnblurb: "Connect when the Geph app starts",
  autoproxy: "Auto-configure proxy",
  autoproxyblurb: "May not work outside major browsers",
  cancel: "Cancel",
  captcha: "CAPTCHA",
  connect: "Connect",
  disconnect: "Disconnect",
  connected: "Connected",
  details: "Details",
  connectedblurb: "Enjoy an open Internet!",
  connecting: "Connecting",
  feedback: "Debug pack",
  feedbackblurb: "Use the debug pack to report problems with Geph.",
  loggingin: "Logging in...",
  geph: "Geph",
  core: "Highsec",
  clipboard: "Logs copied to clipboard",
  date: "Date",
  disconnected: "Disconnected",
  downstream: "Downstream",
  err403: "You're not allowed on this exit. An upgrade may be needed.",
  errBadCaptcha: "CAPTCHA wrong",
  errBadCred: "Incorrect username or password. Please try again.",
  errExists: "User already exists",
  exitserver: "Exit location:",
  expiry: "Expiration date",
  extend: "Extend",
  freelimit: "Free account limit:",
  general: "General",
  http: "HTTP proxy",
  debuglogs: "Debug logs",
  langname: "English",
  language: "Language",
  locations: "Locations",
  errBadNet: "Network failed",
  loginblurb: "Log in with existing account",
  logout: "Log out",
  logs: "Logs",
  netactivity: "Network activity",
  network: "Network",
  nomoretx: "No more transactions",
  choose: "Choose",
  overview: "Overview",
  plusonly: "Plus only",
  password: "Password",
  passwordConfirm: "Confirm password",
  syncing: "Syncing network info...",
  plusblurb: (
    <>
      Unlimited speed for <b>&euro;5/month</b>
    </>
  ),
  pwdmismatch: "Passwords do not match",
  registerblurb: "Create a new account",
  show: "Show",
  hide: "Hide",
  feedbackbutton: "Export debug pack",
  restartblurb: "Restart Geph to apply language",
  seePlans: "See plans",
  selectExit: "Change location",
  settings: "Settings",
  manage: "Manage",
  socks5: "SOCKS5 proxy",
  subscription: "Subscription",
  txlog: "Past transactions",
  subinfoblurb: "Connect to Geph to manage subscription",
  unameillegal: "Username must be 5 to 100 alphanumeric characters",
  unlockUnlimitedSpeed: "Get unlimited speed",
  updateDownload: "Download",
  updateInfo: "A new version is available!",
  updateLater: "Remind me later",
  upgradeToPlus: "Upgrade to Plus",
  version: "Version",
  upgrade: "Buy Plus!",
  forcebridges: "Always use bridges",
  export: "Export",
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
  tcpblurb: "Use strong anti-censorship regardless of location",
  vpn: "Use global VPN",
  vpnblurb: "Not available on macOS",
  excludeapps: "Exclude apps",
  excludeappsblurb: "Let apps bypass Geph",
  excludecn: "Exclude Chinese traffic",
  excludecnblurb: "Does not apply to VPN traffic",

  selectExcludedApps: "Select excluded apps",

  countries: {
    bg: "Bulgaria",
    ch: "Switzerland",
    ca: "Canada",
    jp: "Japan",
    sg: "Singapore",
    us: "United States",
    hk: "Hong Kong",
    fi: "Finland",
    tw: "Taiwan",
  } as Record<string, string>,

  cities: {
    dal: "Dallas",
    ewr: "Newark",
    gva: "Geneva",
    mtl: "Montreal",
    sfo: "San Francisco",
    pdx: "Portland",
    sgp: "Singapore",
    sof: "Sofia",
    tpe: "Taipei",
    hel: "Helsinki",
    tyo: "Tokyo",
    hkgnt: "New Territories",
  } as Record<string, string>,
};

const zhCNBindings = {
  fmtDaysLeft: (days: string) => (
    <>
      迷雾通Plus剩余<b>{days}</b>天到期
    </>
  ),
  fmtDaysLeftShort: (days: string) => (
    <>
      剩余<b>{days}</b>天
    </>
  ),
  you: "您",
  accinfo: "登录信息",
  account: "用户",
  debuglogs: "调试日志",
  advanced: "高级",
  amount: "金额",
  autoconn: "自动连接",
  autoconnblurb: "开启迷雾通时自动连接",
  feedback: "调试包",
  announcements: "通知",
  autoproxy: "自动设置代理",
  autoproxyblurb: "主流浏览器之外可能需要手动设定",
  cancel: "取消",
  captcha: "验证码",
  connect: "连接",
  disconnect: "断开",
  connected: "连接成功",
  connectedblurb: "尽享自由的网络！",
  updateDownload: "下载",
  details: "细节",
  syncing: "正在同步网络信息",
  updateInfo: "迷雾通新版本已发布！",
  updateLater: "之后提醒",
  choose: "选择",
  errBadCred: "用戶名或密码错误，请重试",
  vpn: "使用全局VPN",
  vpnblurb: "实验性功能！暂不支持macOS",
  listenall: "监听所有网络接口",
  listenallblurb: "与同一网络上的其他计算机共享迷雾通",
  connecting: "连接中",
  loggingin: "正在登录...",
  date: "日期",
  feedbackblurb: "向客服反映问题时，请发送调试包",
  disconnected: "未连接",
  downstream: "下行",
  err403: "您没有资格登录这个出口端！",
  errBadCaptcha: "验证码错误",
  clipboard: "日志已存入剪贴板",
  errBadNet: "网络故障",
  geph: "迷雾通",
  manage: "管理",
  feedbackbutton: "导出调试包",
  errExists: "用戶已经存在！",
  subinfoblurb: "管理帐号需要连接迷雾通",
  exitserver: "出口端位置",
  expiry: "到期时间",
  plusonly: "付费专用",
  extend: "延长",
  freelimit: "免费用户限速：",
  general: "通用",
  forcebridges: "强制使用桥接",
  http: "HTTP代理端口",
  langname: "简体中文",
  language: "语言",
  loginblurb: "用已有账户登陆",
  logout: "登出",
  export: "导出",
  netactivity: "网络使用",
  show: "显示",
  version: "版本",
  hide: "隐藏",
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
  network: "网络",
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
  tcpblurb: "在所有地区开启强力反封锁",
  excludecn: "中国流量分流",
  excludecnblurb: "不适用于全局VPN流量",
  excludeapps: "应用例外",
  excludeappsblurb: "允许特定应用绕过迷雾通联网",

  selectExcludedApps: "选择例外应用",

  upgradeblurb: (
    <span>
      升级至Plus用户，享受
      <b>超快速度</b>！
    </span>
  ),

  selectExit: "更改位置",
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
    ch: "瑞士",
    hk: "香港",
    tw: "台湾",
    fi: "芬兰",
  } as Record<string, string>,

  cities: {
    dal: "达拉斯",
    ewr: "纽瓦克",
    mtl: "蒙特利尔",
    sfo: "旧金山",
    sgp: "新加坡",
    pdx: "波特兰",
    sof: "索菲亚",
    tyo: "东京",
    gva: "日内瓦",
    tpe: "台北",
    hkgnt: "新界",
    hel: "赫尔辛基",
  } as Record<string, string>,
};

const zhTWBindings = {
  fmtDaysLeft: (days: string) => (
    <>
      迷霧通Plus剩餘<b>{days}</b>天到期
    </>
  ),
  fmtDaysLeftShort: (days: string) => (
    <>
      剩餘<b>{days}</b>天
    </>
  ),
  you: "您",
  accinfo: "登錄信息",
  account: "用戶",
  advanced: "高級",
  amount: "金額",
  show: "顯示",
  hide: "隱藏",
  announcements: "通知",
  autoconn: "自動連接",
  syncing: "正在同步網絡信息...",
  connect: "連接",
  disconnect: "斷開",
  debuglogs: "調試日誌",
  details: "細節",
  autoconnblurb: "開啓迷霧通時自動連接",
  plusonly: "付費專用",
  autoproxy: "自動設置代理",
  vpn: "使用全局VPN",
  vpnblurb: "實驗性功能！暫不支持macOS",
  listenall: "監聽一切網絡接口",
  listenallblurb: "與同一網絡上的其他計算機共享迷霧通",
  autoproxyblurb: "主流浏覽器之外可能需要手動設定",
  errBadCred: "用戶名或密碼錯誤，請重試",
  cancel: "取消",
  export: "導出",
  captcha: "驗證碼",
  connected: "連接成功",
  version: "版本",
  connectedblurb: "盡享自由的網絡！",
  subinfoblurb: "管理帳號需連接迷霧通",
  clipboard: "日誌已存入剪貼板",
  choose: "選擇",
  network: "網絡",
  connecting: "連接中",
  date: "日期",
  disconnected: "未連接",
  downstream: "下行",
  feedbackblurb: "向客服反映問題時，請發送調試包",
  feedbackbutton: "導出調試包",
  err403: "您沒有資格登錄這個出口端！",
  errBadCaptcha: "驗證碼錯誤",
  feedback: "調試包",
  loggingin: "正在登錄...",
  errExists: "用戶已經存在！",
  manage: "管理",
  errBadNet: "網絡故障",
  exitserver: "出口端位置",
  geph: "迷霧通",
  expiry: "到期時間",
  extend: "延長",
  forcebridges: "強制使用橋接",
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
  tcpblurb: "在所有地區開啟強力反封鎖",
  excludeapps: "應用例外",
  excludeappsblurb: "允許特定應用繞過迷霧通聯網",
  excludecn: "中國流量分流",
  excludecnblurb: "不適用於全局VPN流量",

  selectExcludedApps: "選擇例外應用",

  upgradeblurb: (
    <span>
      升級至Plus用戶，享受
      <b>超快速度</b>！
    </span>
  ),

  selectExit: "更改位置",
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
    tw: "台灣",
    fi: "芬蘭",
    ch: "瑞士",
    hk: "香港",
  } as Record<string, string>,

  cities: {
    dal: "達拉斯",
    ewr: "紐瓦克",
    mtl: "蒙特利爾",
    sfo: "舊金山",
    sgp: "新加坡",
    sof: "索菲亞",
    pdx: "波特蘭",
    hel: "赫爾辛基",
    tyo: "東京",
    tpe: "台北",
    gva: "日內瓦",
    hkgnt: "新界",
  } as Record<string, string>,
};
export const getl10n = (lang: string) => {
  switch (lang) {
    case "zh-TW":
      return zhTWBindings;
    case "zh-CN":
      return zhCNBindings;
    default:
      return enUSBindings;
  }
};

export const l10nSelector = (state: GlobalState) =>
  getl10n(langSelector(state));

export const langSelector = (state: GlobalState) =>
  state.prefState.lang ? state.prefState.lang : defaultLang();

export const defaultLang = () =>
  detectNearestBrowserLocale(["en-US", "zh-TW", "zh-CN"]) as string;
