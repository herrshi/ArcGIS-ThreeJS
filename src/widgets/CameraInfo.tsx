import {
  declared,
  subclass,
  property
} from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import Point from "esri/geometry/Point";
import SceneView from "esri/views/SceneView";
import watchUtils from "esri/core/watchUtils";
import webMercatorUtils from "esri/geometry/support/webMercatorUtils";

interface Center {
  heading: number;
  tilt: number;
  position: Point;
}

interface State extends Center {
  interacting: boolean;
}

interface Style {
  textShadow: string;
}

const CSS = {
  base: "TGIS-widgets-cameraInfo"
};

@subclass("TGIS.Widgets.CameraInfo")
class CameraInfo extends declared(Widget) {
  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------
  constructor(params?: any) {
    super(params);
    this.view = params.view;
    this._onViewChanged();
// this._onViewChanged = this._onViewChanged.bind(this);
  }

  postInitialize() {
    // watchUtils.init(this, "view.interacting, view.camera", () => {
    //   this._onViewChanged();
    // });
  }

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  view
  //----------------------------------
  @property()
  @renderable()
  view: SceneView;

  //----------------------------------
  //  state
  //----------------------------------
  @property()
  @renderable()
  state: State;

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------
  render() {
    // console.log("render");
    let { heading, tilt, position } = this.state;
    const styles: Style = {
      textShadow: this.state.interacting
        ? "-1px 0 red, 0 1px red, 1px 0 red, 0 -1px red"
        : ""
    };
    // if (this.view.spatialReference && this.view.spatialReference.isWebMercator) {
    //   position = new Point(webMercatorUtils.webMercatorToGeographic(position));
    // }
    return (
      <div
        bind={this}
        class={CSS.base}
        style={styles}
        afterCreate={this._onAfterCreate}
      >
        <p>heading: {Number(heading).toFixed(3)}</p>
        <p>tilt: {Number(tilt).toFixed(3)}</p>
        <p>x: {Number(position.x).toFixed(6)}</p>
        <p>y: {Number(position.y).toFixed(6)}</p>
        <p>z: {Number(position.z).toFixed(6)}</p>
      </div>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------
  private _onViewChanged() {
    console.log(typeof this.view);
    let { interacting, camera } = this.view;
    this.state = {
      heading: camera.heading,
      tilt: camera.tilt,
      position: camera.position,
      interacting: interacting
    };
  }

  private _onAfterCreate() {
    console.log("create complete");
  }
}

export default CameraInfo;
