import "svelte-material-ui/bare.css";
import "./app.css";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app") as any,
});

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
      }
    }
  } catch (ex) {}
});

export default app;
