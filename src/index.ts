import "./config";

import App from "./widgets/App";

export const app = new App({
  appName: "三维地图",
  container: document.getElementById("app") as HTMLElement
});
