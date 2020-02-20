// // POLYFILLS    <script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script>
import "core-js/stable";
import "core-js/es/map";
import "core-js/es/set";
import "web-animations-js";
import "regenerator-runtime/runtime";

// import "browser-polyfills";
// import "@webcomponents/webcomponentsjs/webcomponents-bundle";

import { fetch as fetchPolyfill } from "whatwg-fetch";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
window.fetch = fetchPolyfill;

ReactDOM.render(<App />, document.getElementById("root"));
