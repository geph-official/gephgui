import "svelte-material-ui/bare.css";
import "./app.css";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app") as any,
});

export default app;
