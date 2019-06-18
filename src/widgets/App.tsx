import esri = __esri;
import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";

import SceneView from "esri/views/SceneView";
import Widget from "esri/widgets/Widget";

import AppViewModel, { AppParams } from "@/widgets/App/AppViewModel";

import AppConfig from "@/AppConfig";

interface AppViewParams extends AppParams, esri.WidgetProperties {}

const CSS = {
  base: "main",
  webmap: "webmap"
};

@subclass("TGIS.Widgets.App")
class App extends declared(Widget) {
  @property() viewModel = new AppViewModel();

  @aliasOf("viewModel.view") view: SceneView;

  constructor(params: Partial<AppViewParams>) {
    super(params);
  }

  render() {
    return (
      <div class={CSS.base}>
        <div class={CSS.webmap} bind={this} afterCreate={this.onAfterCreate} />
      </div>
    );
  }

  private onAfterCreate(element: HTMLDivElement) {
    const appConfig = AppConfig.appConfig;
    import("@/data/app").then(({ map }) => {
      this.view = new SceneView({
        map: map,
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

export default App;
