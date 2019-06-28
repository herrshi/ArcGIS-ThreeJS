import Accessor from "esri/core/Accessor";
import { whenOnce } from "esri/core/watchUtils";
import EsriMap from "esri/Map";
import SceneView from "esri/views/SceneView";
// import CarExternalRenderer from "@/widgets/app/CarExternalRenderer";
// import Bookmarks from "@/widgets/Bookmarks";
import CameraInfo from "@/widgets/CameraInfo";
// import CoordinateConversion from "esri/widgets/CoordinateConversion";


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
  @property() map: EsriMap;

  constructor(params?: Partial<AppParams>) {
    super(params);
    whenOnce(this, "view").then(() => {
      this.onload();
    });
  }

  onload() {
    // const carRenderer: CarExternalRenderer = new CarExternalRenderer(this.view);
    // externalRenderers.add(this.view, carRenderer);

    this.view.ui.remove("attribution");
    // const ccWidget = new CoordinateConversion({
    //   view: this.view
    // });
    // this.view.ui.add(ccWidget, "bottom-left");

    const cameraInfo = new CameraInfo({
      view: this.view
    });
    this.view.ui.add(cameraInfo, "top-right");
  }
}

export default AppViewModel;
