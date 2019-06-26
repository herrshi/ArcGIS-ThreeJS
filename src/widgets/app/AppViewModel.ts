import Accessor from "esri/core/Accessor";
import { whenOnce } from "esri/core/watchUtils";
import SceneView from "esri/views/SceneView";
// import CarExternalRenderer from "@/widgets/app/CarExternalRenderer";
import Bookmarks from "@/widgets/Bookmarks";
import DemoWidget from "@/widgets/DemoWidget";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
/**externalRenderers使用import ... from ... 不起效*/
// import externalRenderers = require("esri/views/3d/externalRenderers");

export interface AppParams {
  view: SceneView;
}

@subclass("TGIS.Widgets.App.AppViewModel")
class AppViewModel extends declared(Accessor) {
  @property() view: SceneView;

  constructor(params?: Partial<AppParams>) {
    super(params);
    whenOnce(this, "view").then(() => {
      this.onload();
    });
  }

  onload() {
    this.view.ui.remove("attribution");
    // const carRenderer: CarExternalRenderer = new CarExternalRenderer(this.view);
    // externalRenderers.add(this.view, carRenderer);


    const demo = new DemoWidget({
      view: this.view
    });
    console.log(Bookmarks);
    const bookmarks = new Bookmarks({
      view: this.view
    });
    console.log(DemoWidget);

    this.view.ui.add(bookmarks, "top-right");
    console.log(this.view.ui);
  }
}

export default AppViewModel;
