(function () {
  Math.clamp = function (a, b, c) {
    return Math.max(b, Math.min(c, a));
  };
})();
export default class RefractingSphere {
  constructor({ size, refractionRatio, getCamera }) {
    this.size = size;
    this.getCamera = getCamera;
    this.count = 0;
    this.sphereGeom = new THREE.SphereGeometry(this.size || 10, 64, 32);
    this.refractSphereCamera = new THREE.CubeCamera(0.1, 5000, 1024);
    this.refractSphereCamera2 = new THREE.CubeCamera(0.1, 5000, 1024);

    var geometry = new THREE.SphereGeometry(5, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.sphere = new THREE.Mesh(geometry, material);

    this.refractMaterial = new THREE.MeshPhongMaterial({
      // color: 0xccccff,
      color: 0xc06c00,

      envMap: this.refractSphereCamera.renderTarget.texture,
      refractionRatio: refractionRatio || 0.99,
      reflectivity: 0.9,
    });

    this.refractMaterial.envMap.mapping = THREE.CubeRefractionMapping;
    this.mesh = new THREE.Mesh(this.sphereGeom, this.refractMaterial);
    this.mesh.position.set(0, 0, 0);
    this.refractSphereCamera.position.set(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    );

    this.refractSphereCamera2.position.set(this.mesh.position);
  }
  cameraUpdate() {
    this.sphere.position.x = Math.clamp(
      0 + this.getCamera().position.x / 1.2,
      -this.size*2,
      this.size*2
    );
    this.sphere.position.y = Math.clamp(
      0 + this.getCamera().position.y / 1.2,
      -this.size*2,
      this.size*2
    );
    this.sphere.position.z = Math.clamp(
      0 + this.getCamera().position.z / 1.2,
      -this.size*2,
      this.size*2
    );
    this.refractSphereCamera.position.x = Math.clamp(
      0 + this.getCamera().position.x / 1.2,
      -this.size*2,
      this.size*2
    );
    this.refractSphereCamera.position.y = Math.clamp(
      0 + this.getCamera().position.y / 1.2,
      -this.size*2,
      this.size*2
    );
    this.refractSphereCamera.position.z = Math.clamp(
      0 + this.getCamera().position.z / 1.2,
      -this.size*2,
      this.size*2
    );
  }
  update(renderer, scene) {
    // this.mesh.position.z
    this.cameraUpdate();
    this.mesh.visible = false;
    // if (this.count % 2 === 0) {
    // this.refractMaterial.envMap = this.refractSphereCamera.renderTarget.texture;
    // this.refractSphereCamera2.position.copy(this.mesh.position);
    // this.refractSphereCamera2.update(renderer, scene);
    // } else {
    //   this.refractMaterial.envMap = this.refractSphereCamera2.renderTarget.texture;
    // this.refractSphereCamera.position.copy(this.mesh.position);
    this.refractSphereCamera.update(renderer, scene);
    // }
    this.mesh.visible = true;
    this.count++;
  }
}
