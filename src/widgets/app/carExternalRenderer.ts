import * as THREE from "three";
import SceneView from "esri/views/SceneView";

const carExternalRenderer = class {
  view: SceneView;

  constructor (view: SceneView) {
    this.view = view;
    this.view.environment.lighting!.cameraTrackingEnabled = false;
  };

  private renderer: THREE.WebGLRenderer;


  get externalRenderer() {
    return {
      // renderer: null,
      camera: null,
      scene: null,

      ambient: null,
      sun: null,

      car: null,
      carScale: 100,
      carHeight: 50,
      carMaterial: new THREE.MeshLambertMaterial({ color: 0x6ca8f3 }),
      carFocusMaterial: new THREE.MeshLambertMaterial({ color: 0xe03110 }),

      cameraPositionInitialized: false,
      //轨迹点列表
      positionHistory: [],
      //以经过的点列表
      estHistory: [],

      region: null,

      rayCaster: null,

      //camera是否追踪车辆
      cameraTracing: true,

      setup: (context: any) => {
        this.renderer = new THREE.WebGLRenderer({
          context: context.gl,
          premultipliedAlpha: false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setViewport(0, 0, this.view.width, this.view.height);
      }
    }
  }




};

export default carExternalRenderer;
