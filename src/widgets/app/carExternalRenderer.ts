import esri = __esri;
import * as THREE from "three";
import SceneView from "esri/views/SceneView";


export default class CarExternalRenderer {
  view: SceneView;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sun: THREE.DirectionalLight;
  ambient: THREE.AmbientLight;

  car: THREE.Object3D;

  constructor(view: SceneView) {
    this.view = view;
    if (this.view.environment.lighting) {
      this.view.environment.lighting.cameraTrackingEnabled = false;
    }
  }

  setup(context: esri.RenderContext) {
    this.renderer = new THREE.WebGLRenderer({
      context: context.gl,
      premultipliedAlpha: false
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setViewport(0, 0, this.view.width, this.view.height);
    this.renderer.autoClearDepth = false;
    this.renderer.autoClearStencil = false;
    this.renderer.autoClearColor = false;

    const originalSetRenderTarget = this.renderer.setRenderTarget.bind(
      this.renderer
    );
    this.renderer.setRenderTarget = renderTarget => {
      originalSetRenderTarget(renderTarget);
      if (renderTarget === null) {
        context.bindRenderTarget();
      }
    };

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera();
    this.scene.add(this.camera);

    // setup scene lighting
    this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
    this.scene.add(this.sun);



    const carMeshUrl: string = "./src/assets/Porsche_911_GT2.obj";
    const loader: THREE.ObjectLoader = new THREE.ObjectLoader(THREE.DefaultLoadingManager);
    loader.load(carMeshUrl, object => {
      this.car = object;
      console.log(this.car);
    }, undefined, error => {
      console.error("Error loading Car mesh. ", error);
    });

  }

  render(context: esri.RenderContext) {
    // console.log("render");
  }
}
