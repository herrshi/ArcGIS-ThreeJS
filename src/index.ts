import "./config";

import App from "./widgets/App";

class TGISMap {
  public static async createMap() {
    const app = new App({
      appName: "三维地图",
      container: document.getElementById("app") as HTMLElement
    });
  }
}

(window as any).TGISMap = TGISMap;

