import externalRenderers = require("esri/views/3d/externalRenderers");
import esri = __esri;
import * as THREE from "three";
import SceneView from "esri/views/SceneView";
import SpatialReference from "esri/geometry/SpatialReference";
import ModelLoader from "../../lib/ModelLoader";
import CoordTransform from "../../lib/coordtransform";

//轨迹点信息
interface TrackPointAttr {
  //轨迹点坐标
  pos: Array<number>;
  //时间
  time: number;
  //到下一个点所需的速度
  vel?: Array<number>;
}

//实时点信息
interface RTPointAttr {
  //实时位置
  pos: Array<number>;
  //车头角度
  angel: number;
}

export default class CarExternalRenderer {
  view: SceneView;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sun: THREE.DirectionalLight;
  ambient: THREE.AmbientLight;

  car: THREE.Object3D;
  //车辆模型距离地面高度
  carHeight: number = 10;
  //车辆缩放比例
  carScale: number = 20;

  markerLine: THREE.Mesh;
  markerPointer: THREE.Mesh;

  //轨迹时间和当前时间的差值
  timeOffset: number;
  //轨迹点列表
  positionHistory: Array<TrackPointAttr> = [];
  //以经过的点列表
  estHistory: Array<TrackPointAttr> = [];

  //是否追踪视角
  cameraTracking: boolean = true;
  cameraInitialized: boolean = false;
  viewZooming: boolean = false;

  //用于处理点击判断
  rayCaster: THREE.Raycaster;

  currentPointIndex: number = 0;

  constructor(view: SceneView) {
    this.view = view;
    // if (this.view.environment.lighting) {
    //   this.view.environment.lighting.cameraTrackingEnabled = false;
    // }
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
    console.time("车辆载入完成");
    ModelLoader.loadMTLModel("./static/car/", "car3")
      .then(car => {
        this.car = car as THREE.Object3D;
        this.car.name = "Car";
        //车辆水平放置
        this.car.rotateX(Math.PI / 2);
        this.car.scale.set(this.carScale, this.carScale, this.carScale);
        this.scene.add(this.car);
        console.timeEnd("车辆载入完成");

        //标线
        const commonMat: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({
          color: 0x2194ce,
          // wireframe: true
        });
        // commonMat.transparent = true;
        commonMat.opacity = 0.5;

        this.markerLine = new THREE.Mesh(
          new THREE.CylinderBufferGeometry(10, 10, 2000, 32),
          commonMat
        );
        this.markerLine.rotateX(Math.PI / 2);
        this.markerLine.name = "markerLine";
        this.scene.add(this.markerLine);

        this.markerPointer = new THREE.Mesh(
          new THREE.OctahedronBufferGeometry(200),
          commonMat
        );
        this.markerPointer.scale.set(1, 1, 2);
        // this.markerPointer.rotateX(-Math.PI / 2);
        // this.markerCone.rotateY(Math.PI / 2);
        this.markerPointer.name = "markerPointer";
        this.scene.add(this.markerPointer);
      })
      .catch(error => {
        console.error("车辆载入失败", error);
      });

    console.time("轨迹数据载入完成");
    this.loadTrack().then(() => {
      console.timeEnd("轨迹数据载入完成");
      this.queryCarPosition();
    });

    //点击事件
    this.rayCaster = new THREE.Raycaster();
    this.view.container.addEventListener("mousedown", event => {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.rayCaster.setFromCamera(mouse, this.camera);
      const intersects: Array<
        THREE.Intersection
      > = this.rayCaster.intersectObjects(this.scene.children, true);
      console.log(intersects);
      if (intersects.length >= 1) {
        // const clickObject: THREE.Object3D = intersects[0].object;
        this.cameraTracking = !this.cameraTracking;
        this.viewZooming = true;
        this.view
          .goTo({
            tilt: this.cameraTracking ? 70 : 0,
            zoom: this.cameraTracking ? 14 : 13
          })
          .then(() => {
            this.viewZooming = false;
          });
      }
    });

    context.resetWebGLState();
  }

  markerPointerHeight: number = 2300;
  markerPointerDir: number = 1;

  render(context: esri.RenderContext) {
    const camera = context.camera;

    this.camera.position.set(camera.eye[0], camera.eye[1], camera.eye[2]);
    this.camera.up.set(camera.up[0], camera.up[1], camera.up[2]);
    this.camera.lookAt(
      new THREE.Vector3(camera.center[0], camera.center[1], camera.center[2])
    );

    if (this.car) {
      let { pos: posEst, angel: angelEst } = this.computeCarPosition();

      let renderPos = [0, 0, 0];
      externalRenderers.toRenderCoordinates(
        this.view,
        posEst,
        0,
        SpatialReference.WGS84,
        renderPos,
        0,
        1
      );
      this.car.position.set(renderPos[0], renderPos[1], renderPos[2]);
      //调整车头方向
      this.car.rotation.y = -angelEst;

      this.markerLine.position.set(renderPos[0], renderPos[1], 1200);

      this.markerPointerHeight += this.markerPointerDir;
      if (this.markerPointerHeight >= 2400) {
        this.markerPointerDir = -1;
      }
      if (this.markerPointerHeight <= 2200) {
        this.markerPointerDir = 1;
      }
      this.markerPointer.position.set(renderPos[0], renderPos[1], this.markerPointerHeight);

      //镜头追踪
      if (this.cameraTracking && !this.view.interacting && !this.viewZooming) {
        if (this.cameraInitialized) {
          this.view.goTo({
            target: [posEst[0], posEst[1]]
          });
        } else {
          this.view
            .goTo({
              target: [posEst[0], posEst[1]],
              zoom: 14
            })
            .then(() => {
              this.cameraInitialized = true;
            });
        }
      }
    }

    this.camera.projectionMatrix.fromArray(camera.projectionMatrix as any);

    const l = context.sunLight;
    this.sun.position.set(l.direction[0], l.direction[1], l.direction[2]);
    this.sun.intensity = l.diffuse.intensity;
    this.sun.color = new THREE.Color(
      l.diffuse.color[0],
      l.diffuse.color[1],
      l.diffuse.color[2]
    );

    this.ambient.intensity = l.ambient.intensity;
    this.ambient.color = new THREE.Color(
      l.ambient.color[0],
      l.ambient.color[1],
      l.ambient.color[2]
    );

    this.renderer.state.reset();
    this.renderer.render(this.scene, this.camera);
    externalRenderers.requestRender(this.view);
    context.resetWebGLState();
  }

  loadTrack() {
    return new Promise((resolve, reject) => {
      fetch("./static/data/10-xj.csv")
        .then(response => {
          return response.text();
        })
        .then(data => {
          const dataList: Array<string> = data.split(/[\n\r]+/);
          dataList.forEach((positionInfo, index) => {
            const posInfoData: Array<string> = positionInfo.split(",");
            const time = new Date(posInfoData[1]).getTime();
            if (index === 0) {
              this.timeOffset = Math.round((Date.now() - time) / 1000);
            }
            const pos: Array<number> = CoordTransform.wgs84togcj02(
              Number(posInfoData[2]),
              Number(posInfoData[3])
            );
            this.positionHistory.push({
              pos,
              time: time / 1000
            });
          });
          //增加起始点
          this.estHistory.push({
            pos: [...this.positionHistory[0].pos, this.carHeight],
            time: this.positionHistory[0].time,
            vel: [0, 0]
          });
          this.currentPointIndex = 1;
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  queryCarPosition() {
    let vel: Array<number> = [0, 0];
    const current: TrackPointAttr = this.positionHistory[
      this.currentPointIndex
    ];
    const next: TrackPointAttr = this.positionHistory[
      this.currentPointIndex + 1
    ];
    //下次调用的时间
    const nextTime: number = next.time - current.time;

    if (this.estHistory.length > 0) {
      const last: TrackPointAttr = this.positionHistory[
        this.currentPointIndex - 1
      ];
      const deltaT: number = current.time - last.time;
      const vLon: number = (current.pos[0] - last.pos[0]) / deltaT;
      const vLat: number = (current.pos[1] - last.pos[1]) / deltaT;
      vel = [vLon, vLat];
    }

    this.estHistory.push({
      pos: [...current.pos, this.carHeight],
      time: current.time,
      vel
    });
    this.currentPointIndex++;

    setTimeout(() => {
      this.queryCarPosition();
    }, nextTime * 1000);
  }

  lastPosition: Array<number>;
  lastTime: number;

  computeCarPosition(): RTPointAttr {
    if (this.estHistory.length >= 2) {
      const now: number = Date.now() / 1000 - this.timeOffset;
      const entry1: TrackPointAttr = this.estHistory[
        this.estHistory.length - 1
      ];

      if (!this.lastPosition) {
        this.lastPosition = entry1.pos;
        this.lastTime = entry1.time;
      }

      // compute a new estimated position
      if (entry1.vel) {
        const dt1 = now - entry1.time;
        const est1 = [
          entry1.pos[0] + dt1 * entry1.vel[0],
          entry1.pos[1] + dt1 * entry1.vel[1]
        ];

        const dPos = [
          est1[0] - this.lastPosition[0],
          est1[1] - this.lastPosition[1]
        ];

        // compute required velocity to reach newly estimated position
        // but cap the actual velocity to 1.2 times the currently estimated ISS velocity
        let dt = now - this.lastTime;
        if (dt === 0) {
          dt = 1.0 / 1000;
        }

        const catchupVel =
          Math.sqrt(dPos[0] * dPos[0] + dPos[1] * dPos[1]) / dt;
        const maxVel =
          1.2 *
          Math.sqrt(
            entry1.vel[0] * entry1.vel[0] + entry1.vel[1] * entry1.vel[1]
          );
        const factor = catchupVel <= maxVel ? 1.0 : maxVel / catchupVel;

        // move the current position towards the estimated position
        const newPos = [
          this.lastPosition[0] + dPos[0] * factor,
          this.lastPosition[1] + dPos[1] * factor,
          entry1.pos[2]
        ];

        this.lastPosition = newPos;
        this.lastTime = now;

        return { pos: newPos, angel: Math.atan2(entry1.vel[0], entry1.vel[1]) };
      }
    }

    return { pos: [0, 0, 0], angel: 0 };
  }
}
