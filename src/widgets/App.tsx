import esri = __esri;

import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";

import EsriMap from "esri/Map";
// import MapView from "esri/views/MapView";
import SceneView from "esri/views/SceneView";
import externalRenderers from "esri/views/3d/externalRenderers";
import Widget from "esri/widgets/Widget";

import AppViewModel, { AppParams } from "./App/AppViewModel";

import { Header } from "./Header";

import * as THREE from "three";

interface AppViewParams extends AppParams, esri.WidgetProperties {}

const CSS = {
  base: "main",
  webmap: "webmap"
};

@subclass("app.widgets.webmapview")
export default class App extends declared(Widget) {
  @property() viewModel = new AppViewModel();

  @aliasOf("viewModel.appName") appName: string;

  @aliasOf("viewModel.map") map: EsriMap;

  @aliasOf("viewModel.view") view: SceneView;

  constructor(params: Partial<AppViewParams>) {
    super(params);
  }

  render() {
    return (
      <div class={CSS.base}>
        {Header({ appName: this.appName })}
        <div class={CSS.webmap} bind={this} afterCreate={this.onAfterCreate} />
      </div>
    );
  }

  private onAfterCreate(element: HTMLDivElement) {
    import("./../data/app").then(({ map }) => {
      this.map = map;
      this.view = new SceneView({
        map: this.map,
        container: element,
        viewingMode: "global",
        camera: {
          position: {
            x: -9932671,
            y: 2380007,
            z: 1687219,
            spatialReference: { wkid: 102100 }
          },
          heading: 0,
          tilt: 35
        }
      });
      this.view.when(() => {
        this.view.environment.lighting!.cameraTrackingEnabled = false;

        const issExternalRenderer = {
          renderer: null, // three.js renderer
          camera: null, // three.js camera
          scene: null, // three.js scene

          ambient: null, // three.js ambient light source
          sun: null, // three.js sun light source

          iss: null, // 空间站模型
          issScale: 40000, // scale for the iss model
          issMaterial: new THREE.MeshLambertMaterial({ color: 0xe03110 }), // 空间站模型material

          cameraPositionInitialized: false, // camera位置是否已初始化
          positionHistory: [], // 空间站轨迹

          markerMaterial: null, // 空间站轨迹点material
          markerGeometry: null, // 空间站轨迹geometry


        };

        externalRenderers.add(this.view, issExternalRenderer);
      });
    });
  }
}
