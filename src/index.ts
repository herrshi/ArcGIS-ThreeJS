// import "./config";
import AppConfig from "@/AppConfig";

import App from "@/widgets/App";

interface AppParam {
  configUrl: string,
  container?: string
}

class TGISMap {
  public static async createMap(param: AppParam) {
    await AppConfig.loadAppConfig(param.configUrl);
    // @ts-ignore
    const app = new App({
      appName: "三维地图",
      container: document.getElementById(param.container || "app") as HTMLElement
    });
  }
}

(window as any).TGISMap = TGISMap;

