import esri = __esri;
import { aliasOf, declared, property, subclass } from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";

import EsriMap from "esri/Map";
import SceneView from "esri/views/SceneView";
import Widget from "esri/widgets/Widget";

import AppViewModel, { AppParams } from "@/widgets/App/AppViewModel";

import AppConfig from "@/AppConfig";
// import TileLayer from "esri/layers/TileLayer";

// import { Header } from "./Header";

interface AppViewParams extends AppParams, esri.WidgetProperties {}

const CSS = {
  base: "main",
  webmap: "webmap"
};

@subclass("app.widgets.webmapview")
export default class App extends declared(Widget) {
  @property() viewModel = new AppViewModel();

  @aliasOf("viewModel.map") map: EsriMap;

  @aliasOf("viewModel.view") view: SceneView;

  constructor(params: Partial<AppViewParams>) {
    super(params);
  }

  render() {
    return (
      <div class={CSS.base}>
        {/*{Header({ appName: this.appName })}*/}
        <div class={CSS.webmap} bind={this} afterCreate={this.onAfterCreate} />
      </div>
    );
  }

  private onAfterCreate(element: HTMLDivElement) {
    const appConfig = AppConfig.appConfig;
    import("@/data/app").then(({map}) => {
      this.map = map;
      this.view = new SceneView({
        map: this.map,
        container: element,
        viewingMode: "local",
        camera: appConfig.map.options.camera
        // camera: {
        //   heading: 0,
        //   tilt: 70,
        //   position: {
        //     latitude: 39.569704,
        //     longitude: 116.433877,
        //     z: 13000
        //   }
        // }
      });

    });
  }
}
