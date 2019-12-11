// import "react-app-polyfill/ie9";
// import "react-app-polyfill/stable";

// // POLYFILLS    <script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script>
// import "core-js";
// import cssVars from "css-vars-ponyfill";
// import "@webcomponents/webcomponentsjs/webcomponents-bundle";

import { fetch as fetchPolyfill } from "whatwg-fetch";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
// cssVars({
//   // Connect MutationObserver
//   watch: true
// });
window.fetch = fetchPolyfill;

ReactDOM.render(<App />, document.getElementById("root"));
