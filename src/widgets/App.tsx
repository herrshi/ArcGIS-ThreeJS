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
      });
    });
  }
}

export default App;
