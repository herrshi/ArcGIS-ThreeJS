import esriConfig from "esri/config";

export default class AppConfig {

  private static _appConfig: any;

  static async loadAppConfig(configUrl: string) {
    try {
      const response = await fetch(configUrl);
      try {
        this._appConfig = await response.json();
        this.setEsriConfig();
      } catch (error) {
        console.error("配置文件解析错误.", error);
      }
    } catch (error) {
      console.error("配置文件读取错误.", error)
    }
  }

  static get appConfig() {
    return this._appConfig;
  }

  private static setEsriConfig() {
    const DEFAULT_WORKER_URL = (this._appConfig as any).loader.apiUrl;
    // const DEFAULT_LOADER_URL = `${DEFAULT_WORKER_URL}dojo/dojo-lite.js`;

    (esriConfig.workers as any).loaderUrl = `${DEFAULT_WORKER_URL}dojo/dojo-lite.js`;
    esriConfig.workers.loaderConfig = {
      baseUrl: `${DEFAULT_WORKER_URL}dojo`,
      packages: [
        { name: "esri", location: DEFAULT_WORKER_URL + "esri" },
        { name: "dojo", location: DEFAULT_WORKER_URL + "dojo" },
        { name: "dojox", location: DEFAULT_WORKER_URL + "dojox" },
        { name: "dijit", location: DEFAULT_WORKER_URL + "dijit" },
        { name: "dstore", location: DEFAULT_WORKER_URL + "dstore" },
        { name: "moment", location: DEFAULT_WORKER_URL + "moment" },
        { name: "@dojo", location: DEFAULT_WORKER_URL + "@dojo" },
        {
          name: "cldrjs",
          location: DEFAULT_WORKER_URL + "cldrjs",
          main: "dist/cldr"
        },
        {
          name: "globalize",
          location: DEFAULT_WORKER_URL + "globalize",
          main: "dist/globalize"
        },
        {
          name: "maquette",
          location: DEFAULT_WORKER_URL + "maquette",
          main: "dist/maquette.umd"
        },
        {
          name: "maquette-css-transitions",
          location: DEFAULT_WORKER_URL + "maquette-css-transitions",
          main: "dist/maquette-css-transitions.umd"
        },
        {
          name: "maquette-jsx",
          location: DEFAULT_WORKER_URL + "maquette-jsx",
          main: "dist/maquette-jsx.umd"
        },
        { name: "tslib", location: DEFAULT_WORKER_URL + "tslib", main: "tslib" }
      ]
    } as any;
  }
}
