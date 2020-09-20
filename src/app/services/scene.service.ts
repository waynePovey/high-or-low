import { Injectable } from '@angular/core';
import { CubeTexture, MeshBuilder, Scene, StandardMaterial, Texture } from '@babylonjs/core';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  constructor() { }

  public createSkybox(scene: Scene): void {
    const sbMesh = MeshBuilder.CreateBox('skyBox', { size: 1000 }, scene);
    const sbMat = new StandardMaterial('skyBox', scene);
    sbMat.backFaceCulling = false;
    sbMesh.material = sbMat;
    sbMesh.infiniteDistance = true;
    sbMat.reflectionTexture = new CubeTexture('assets/textures/skybox/skybox', scene);
    sbMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    sbMat.disableLighting = true;
  }
}
