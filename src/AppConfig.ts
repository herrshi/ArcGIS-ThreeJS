export default class AppConfig {
  private static instance: AppConfig;

  static getInstance(): AppConfig {
    if (!this.instance) {
      this.instance = new AppConfig();
    }

    return this.instance;
  }

  private _appConfig: any;

  getAppConfig() {
    return new Promise(resolve => {
      if (this._appConfig) {
        resolve(this._appConfig);
      } else {
        fetch("./static/config/config.json").then(response => {
          return response.json();
        }).then(appConfig => {
          this._appConfig = appConfig;
          resolve(appConfig);
        })
      }
    });
  }
}
