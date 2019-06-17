import Accessor from "esri/core/Accessor";
import { whenOnce } from "esri/core/watchUtils";
// import EsriMap from "esri/Map";
import SceneView from "esri/views/SceneView";
import CarExternalRenderer from "@/widgets/app/CarExternalRenderer";
import Bookmarks from "@/widgets/Bookmarks/Bookmarks";
import Expand from "esri/widgets/Expand";

import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
/**externalRenderers使用import ... from ... 不起效*/
import externalRenderers = require("esri/views/3d/externalRenderers");

export interface AppParams {
  // map: EsriMap;
  view: SceneView;
}

@subclass("widgets.App.AppViewModel")
class AppViewModel extends declared(Accessor) {
  // @property() map: EsriMap;
  @property() view: SceneView;

  constructor(params?: Partial<AppParams>) {
    super(params);
    whenOnce(this, "view").then(() => {
      this.onload();
    });
  }

  onload() {
    const carRenderer: CarExternalRenderer = new CarExternalRenderer(this.view);
    externalRenderers.add(this.view, carRenderer);
    console.log(11111);

    const bookmarks = new Bookmarks({
      view: this.view
    });

    const expand = new Expand({
      view: this.view,
      content: bookmarks
    });
    console.log(22222);


    this.view.ui.add(expand, "top-right");

  }
}

export default AppViewModel;
