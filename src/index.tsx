import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));

function clickLaboo() {
  let laboo = document.getElementById("labooyah");
  if (laboo !== null) {
    laboo.click();
  } else {
    console.log(laboo);
    setTimeout(clickLaboo, 300);
  }
}

setTimeout(clickLaboo, 500);
