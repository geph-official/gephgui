import "svelte-material-ui/bare.css";
import "./inter-font/inter.css";
import "./vazirmatn-font/vazirmatn.css";
import "./app.css";
import "./uPlot.min.css";
import App from "./App.svelte";
import {
  auto as autoDark,
  enable as enableDark,
  disable as disableDark,
} from "darkreader";
import { pref_lightdark } from "./lib/prefs";

const app = new App({
  target: document.getElementById("app") as any,
});

const setDark = (value: any) => {
  const darkTheme = {
    brightness: 100,
    contrast: 90,
    sepia: 0,
  };
  if (value === "auto") {
    autoDark(darkTheme);
  } else if (value === "dark") {
    enableDark(darkTheme);
  } else if (value === "light") {
    disableDark();
  }
};

pref_lightdark.subscribe(setDark);

// HACK to get rid of ugly hover and focus indicators, especially on mobile
window.addEventListener("load", (_) => {
  try {
    // prevent exception on browsers not supporting DOM styleSheets properly
    for (var si in document.styleSheets) {
      var styleSheet = document.styleSheets[si] as any;
      if (!styleSheet.rules) continue;

      for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
        if (!styleSheet.rules[ri].selectorText) continue;

        if (styleSheet.rules[ri].selectorText.match(":focus")) {
          styleSheet.deleteRule(ri);
        }

        if (styleSheet.rules[ri].selectorText.match(":hover")) {
          styleSheet.deleteRule(ri);
        }

        styleSheet.insertRule(":focus-visible { outline: none } ");
      }
    }
  } catch (ex) {
    console.error(ex);
  }
});

export default app;
