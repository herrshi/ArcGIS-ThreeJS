import esri = __esri;
import * as THREE from "three";
import SceneView from "esri/views/SceneView";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";


export default class CarExternalRenderer {
  view: SceneView;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sun: THREE.DirectionalLight;
  ambient: THREE.AmbientLight;

  car: THREE.Group;

  constructor(view: SceneView) {
    this.view = view;
    if (this.view.environment.lighting) {
      this.view.environment.lighting.cameraTrackingEnabled = false;
    }
  }

  setup(context: esri.RenderContext) {
    //WebGLRenderer
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

    //光照
    this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
    this.scene.add(this.sun);

    //载入车辆模型
    const mtlLoader: MTLLoader = new MTLLoader();
    mtlLoader.setPath("./src/assets/car/");
    console.time("车辆材质载入完成");
    mtlLoader.load("car4.mtl", materialCreator => {
      console.timeEnd("车辆材质载入完成");
      materialCreator.preload();
      const objLoader: OBJLoader = new OBJLoader();
      objLoader.setMaterials(materialCreator as any);
      objLoader.setPath("./src/assets/car/");
      console.time("车辆模型载入完成");
      objLoader.load("car4.obj", group => {
        this.car = group;
        this.scene.add(this.car);
        console.timeEnd("车辆模型载入完成");
      }, () => {
        console.log("载入车辆模型中...");
      }, error => {
        console.error("载入车辆模型失败: ", error);
      });
    }, () => {
      console.log("载入车辆材质中...");
    }, error => {
      console.error("载入车辆材质失败: ", error);
    });

  }

  render(context: esri.RenderContext) {
    const camera = context.camera;

    this.camera.position.set(camera.eye[0], camera.eye[1], camera.eye[2]);

  }
}
