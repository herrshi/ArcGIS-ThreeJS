import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

let loadMTL = function(path: string, modelName: string) {
  return new Promise((resolve, reject) => {
    const mtlLoader: MTLLoader = new MTLLoader();
    mtlLoader.setPath(path);
    mtlLoader.load(
      modelName + ".mtl",
      materialCreator => {
        materialCreator.preload();

        const objLoader: OBJLoader = new OBJLoader();
        objLoader.setMaterials(materialCreator as any);
        objLoader.setPath(path);
        objLoader.load(
          modelName + ".obj",
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
};

export default {
  loadMTLModel: loadMTL
};
