import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export default class CarLoader {
  static loadMTL(path: string, objName: string) {
    return new Promise((resolve, reject) => {
      const mtlLoader: MTLLoader = new MTLLoader();
      mtlLoader.setPath(path);
      mtlLoader.load(
        objName + ".mtl",
        materialCreator => {
          materialCreator.preload();

          const objLoader: OBJLoader = new OBJLoader();
          objLoader.setMaterials(materialCreator as any);
          objLoader.setPath(path);
          objLoader.load(
            objName + ".obj",
            group => {
              resolve(group);
            },
            undefined,
            error => {
              reject(error);
            }
          );
        },
        undefined,
        error => {
          reject(error);
        }
      );
    });
  }
}
