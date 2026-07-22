import "./inter-font/inter.css";
import "./vazirmatn-font/vazirmatn.css";
import "./app.css";
import "./uPlot.min.css";
import { mount } from "svelte";
import App from "./App.svelte";
import {
  auto as autoDark,
  enable as enableDark,
  disable as disableDark,
} from "darkreader";
import { pref_lightdark } from "./lib/prefs";

// Cached daemon state persisted by an older version can hydrate in a shape the
// current UI cannot render, which would otherwise throw during mount and leave
// the window permanently blank. These keys are pure caches (refetched from the
// daemon every poll tick), so on a mount crash they are dropped and the page
// retried once; the sessionStorage flag stops a reload loop when the crash has
// some other cause.
const CACHED_STATE_KEYS = [
  "connection_status",
  "connection_status_1",
  "app_status_1",
];
const RECOVERY_FLAG = "mount_crash_recovery";

let app;
try {
  app = mount(App, {
    target: document.getElementById("app") as HTMLElement,
  });
  sessionStorage.removeItem(RECOVERY_FLAG);
} catch (err) {
  if (!sessionStorage.getItem(RECOVERY_FLAG)) {
    sessionStorage.setItem(RECOVERY_FLAG, "1");
    for (const key of CACHED_STATE_KEYS) {
      localStorage.removeItem(key);
    }
    location.reload();
  } else {
    const pre = document.createElement("pre");
    pre.style.cssText =
      "padding: 1rem; white-space: pre-wrap; word-break: break-word";
    pre.textContent = `Geph failed to start: ${err}`;
    document.getElementById("app")?.replaceChildren(pre);
  }
  throw err;
}

// // HACK to get rid of ugly hover and focus indicators, especially on mobile
// window.addEventListener("load", (_) => {
//   try {
//     // prevent exception on browsers not supporting DOM styleSheets properly
//     for (var si in document.styleSheets) {
//       var styleSheet = document.styleSheets[si] as any;
//       if (!styleSheet.rules) continue;

//       for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
//         if (!styleSheet.rules[ri].selectorText) continue;

//         if (styleSheet.rules[ri].selectorText.match(":focus")) {
//           styleSheet.deleteRule(ri);
//         }

//         // if (styleSheet.rules[ri].selectorText.match(":hover")) {
//         //   styleSheet.deleteRule(ri);
//         // }

//         // styleSheet.insertRule(":focus-visible { outline: none } ");
//       }
//     }
//   } catch (ex) {
//     console.error(ex);
//   }
// });

export default app;
