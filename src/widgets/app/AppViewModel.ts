import Accessor from "esri/core/Accessor";
import { whenOnce } from "esri/core/watchUtils";
import EsriMap from "esri/Map";
import SceneView from "esri/views/SceneView";
//externalRenderers使用import ... from ... 不起效
import externalRenderers = require("esri/views/3d/externalRenderers");
import CarExternalRenderer from "./carExternalRenderer";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

export interface AppParams {
  appName: string;
  map: EsriMap;
  view: SceneView;
}

@subclass("widgets.App.AppViewModel")
class AppViewModel extends declared(Accessor) {
  @property() appName: string;
  @property() map: EsriMap;
  @property() view: SceneView;

  constructor(params?: Partial<AppParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
  }

  onload() {
    let carRenderer: CarExternalRenderer = new CarExternalRenderer(this.view);
    externalRenderers.add(this.view, carRenderer);
  }
}

export default AppViewModel;
