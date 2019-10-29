import { fetch as fetchPolyfill } from "whatwg-fetch";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
window.fetch = fetchPolyfill;

ReactDOM.render(<App />, document.getElementById("root"));
