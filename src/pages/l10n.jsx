import React from "react";
import { IonText } from "@ionic/react";

export var arrs = {};

arrs["en-US"] = {
  langname: "English",
  accinfo: "Account info",
  account: "Account",
  amount: "Amount",
  cancel: "Cancel",
  autoconn: "Auto-connect",
  autoconnblurb: "Connect when the Geph app starts",
  general: "General",
  language: "Language",
  connected: "Connected",
  settings: "Settings",
  connectedblurb: "Enjoy an open Internet!",
  socks5: "SOCKS5 proxy",
  autoproxy: "Auto-configure proxy",
  autoproxyblurb: "May not work outside major browsers",
  connecting: "Connecting",
  date: "Date",
  http: "HTTP proxy",
  disconnected: "Disconnected",
  advanced: "Advanced",
  downstream: "Downstream",
  exitserver: "Exit location:",
  expiry: "Expiration date",
  extend: "Extend",
  restartblurb: "Restart Geph to apply language",
  freelimit: "Free account limit:",
  logout: "Log out",
  netactivity: "Network activity",
  nomoretx: "No more transactions",
  overview: "Overview",
  password: "Password",
  loginblurb: "Log in with existing account",
  registerblurb: "Create a new account",
  subscription: "Subscription",
  txlog: "Past transactions",
  upstream: "Upstream",
  username: "Username",

  plusblurb: "More locations and unlimited speed for $3.98/mth",

  selectExit: "Exit selection",
  locations: "Locations",
  core: "Highsec",
  coreblurb: (
    <span>
      <b>Highsec</b> exits are located in the safest jurisdictions
    </span>
  ),
  plus: "Plus",
  paid: "Plus",
  free: "Free",

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
  accinfo: "用户信息",
  amount: "金额",
  cancel: "取消",
  password: "密码",
  loginblurb: "用已有账户登陆",
  registerblurb: "创建新账户",
  connected: "连接成功",
  connectedblurb: "尽享自由的网络！",
  connecting: "连接中...",
  date: "日期",
  logout: "登出",
  restartblurb: "关闭、重启迷雾通后将使用选择的语言",
  disconnected: "未连接",
  advanced: "高级",
  downstream: "下行",
  langname: "简体中文",
  language: "语言",
  general: "通用",
  socks5: "SOCKS5代理端口",
  http: "HTTP代理端口",
  autoconn: "自动连接",
  autoproxy: "自动设置代理",
  autoproxyblurb: "主流浏览器之外可能需要手动设定",
  autoconnblurb: "开启迷雾通时自动连接",
  expiry: "到期时间",
  exitserver: "出口端位置",
  settings: "设置",
  account: "用户",
  freelimit: "免费用户限速：",
  subscription: "用户类型",
  netactivity: "网络使用",
  overview: "概览",
  upstream: "上行",
  extend: "延长",
  username: "用户名",
  upgrade: "马上升级",
  plusblurb: "更多位置、没有限速。低至$3.98/月",
  txlog: "付费记录",

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
  paid: "Plus",
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
  accinfo: "用戶信息",
  amount: "金額",
  cancel: "取消",
  connected: "連接成功",
  connectedblurb: "盡享自由的網絡！",
  connecting: "連接中...",
  date: "日期",
  logout: "登出",
  restartblurb: "關閉、重啟迷霧通後將使用選擇的語言",
  disconnected: "未連接",
  advanced: "高級",
  downstream: "下行",
  langname: "繁體中文",
  language: "語言",
  general: "通用",
  socks5: "SOCKS5代理端口",
  http: "HTTP代理端口",
  autoconn: "自動連接",
  autoproxy: "自動設置代理",
  autoproxyblurb: "主流瀏覽器之外可能需要手動設定",
  autoconnblurb: "開啟迷霧通時自動連接",
  expiry: "到期時間",
  exitserver: "出口端位置",
  settings: "設置",
  account: "用戶",
  freelimit: "免費用戶限速：",
  subscription: "用戶類型",
  netactivity: "網絡使用",
  overview: "概覽",
  upstream: "上行",
  extend: "延長",
  username: "用戶名",
  upgrade: "馬上升級",
  plusblurb: "更多位置、沒有限速。低至$3.98/月",
  txlog: "付費記錄",

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
      <b>高隱私</b>出口端位於網絡最安全的地域
    </span>
  ),
  paid: "Plus",
  free: "免費",

  countries: {
    bg: "保加利亞",
    ca: "加拿大",
    jp: "日本",
    sg: "新加坡",
    us: "美國"
  },

  cities: {
    dal: "達拉斯",
    ewr: "紐瓦克",
    mtl: "蒙特利爾",
    sfo: "舊金山",
    sgp: "新加坡",
    sof: "索菲亞",
    tyo: "東京"
  }
};

if (!localStorage.getItem("prefs.lang")) {
  localStorage.setItem("prefs.lang", "zh-CN");
}

export var lang = localStorage.getItem("prefs.lang");
if (lang !== "zh-CN" && lang !== "zh-TW") {
  lang = "en-US";
}
export var l10n = arrs[lang];
