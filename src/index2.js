import * as THREE from "three";
import OBJLoader from "three/examples/js/loaders/OBJLoader";
import GLTFLoader from "three/examples/js/loaders/GLTFLoader";
import DRACOLoader from "three/examples/js/loaders/DRACOLoader";
import OrbitControls from "three/examples/js/controls/OrbitControls";
import fenty from "./assets/Fenty/3D Model/Fenty Version/fentyObj.obj";
import yellowFlower from "./assets/fleurs/yellow.png";
import fond1 from "./assets/fleurs/fond.jpg";
import fond2 from "./assets/fleurs/fond2.jpg";
import fond3 from "./assets/fleurs/fond3.jpg";
import RefractingSphere from "./RefractingSphere";
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

const Detector = {
  canvas: !!window.CanvasRenderingContext2D,
  webgl: (function () {
    try {
      return (
        !!window.WebGLRenderingContext &&
        !!document.createElement("canvas").getContext("experimental-webgl")
      );
    } catch (e) {
      return false;
    }
  })(),
  workers: !!window.Worker,
  fileapi: window.File && window.FileReader && window.FileList && window.Blob,

  getWebGLErrorMessage: function () {
    var element = document.createElement("div");
    element.id = "webgl-error-message";
    element.style.fontFamily = "monospace";
    element.style.fontSize = "13px";
    element.style.fontWeight = "normal";
    element.style.textAlign = "center";
    element.style.background = "#fff";
    element.style.color = "#000";
    element.style.padding = "1.5em";
    element.style.width = "400px";
    element.style.margin = "5em auto 0";

    if (!this.webgl) {
      element.innerHTML = window.WebGLRenderingContext
        ? [
            'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
            'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.',
          ].join("\n")
        : [
            'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
            'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.',
          ].join("\n");
    }

    return element;
  },

  addGetWebGLMessage: function (parameters) {
    var parent, id, element;

    parameters = parameters || {};

    parent =
      parameters.parent !== undefined ? parameters.parent : document.body;
    id = parameters.id !== undefined ? parameters.id : "oldie";

    element = Detector.getWebGLErrorMessage();
    element.id = id;

    parent.appendChild(element);
  },
};

/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: July 2013 (three.js v59dev)
*/

// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
// var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var refractSphere,
  refractSphereCamera,
  refractSphereCamera2,
  chromeMaterial,
  refractMaterial; // for refract material
var count = 0;
let refra, refra2;

init();
animate();

// FUNCTIONS
function init() {
  // SCENE
  scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45,
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
    NEAR = 0.1,
    FAR = 20000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0, 150, 400);
  camera.lookAt(scene.position);

  //BACKGROUND
  var urls = [fond1, fond1, fond2, fond2, fond3, fond3];
  var skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);
  var materialArray = [];
  for (var i = 0; i < 6; i++)
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(urls[i]),
        side: THREE.BackSide,
      })
    );
  var skyBox = new THREE.Mesh(skyGeometry, materialArray);
  scene.add(skyBox);

  // RENDERER
  if (Detector.webgl) renderer = new THREE.WebGLRenderer({ antialias: true });
  else renderer = new THREE.CanvasRenderer();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);

  // EVENTS
  //   THREEx.WindowResize(renderer, camera);
  //   THREEx.FullScreen.bindKey({ charCode: "m".charCodeAt(0) });
  // CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(0, 250, 0);
  scene.add(light);

  var ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(100, 750, 0.5).normalize();
  scene.add(directionalLight);
  // FLOOR
  var floorTexture = new THREE.TextureLoader().load(yellowFlower);
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);
  var floorMaterial = new THREE.MeshBasicMaterial({
    map: floorTexture,
    side: THREE.DoubleSide,
  });
  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -240.5;
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);
  
  ////////////
  // CUSTOM //
  ////////////

  // var sphereGeom = new THREE.SphereGeometry(80, 64, 32);
  // refractSphereCamera = new THREE.CubeCamera(0.1, 5000, 512);
  // scene.add(refractSphereCamera);
  // refractSphereCamera2 = new THREE.CubeCamera(0.1, 5000, 512);
  // scene.add(refractSphereCamera2);
  // // refractSphereCamera.renderTarget.mapping = THREE.CubeRefractionMapping;
  // // refractSphereCamera2.renderTarget.mapping = THREE.CubeRefractionMapping;
  // refractMaterial = new THREE.MeshBasicMaterial({
  //   // color: 0xccccff,
  //   color: 0xc06c00,
  //   envMap: refractSphereCamera.renderTarget.texture,
  //   refractionRatio: 0.99,
  //   reflectivity: 0.9,
  // });

  // refractMaterial.envMap.mapping = THREE.CubeRefractionMapping;
  // refractSphere = new THREE.Mesh(sphereGeom, refractMaterial);
  // refractSphere.position.set(0, 50, 0);
  // refractSphereCamera.position.set(refractSphere.position);
  // refractSphereCamera2.position.set(refractSphere.position);
  // scene.add(refractSphere);

  refra = new RefractingSphere({
    size: 150,
    refractionRatio: 0.985,
    getCamera: () => {
      return camera;
    },
  });

  scene.add(refra.refractSphereCamera);
  scene.add(refra.refractSphereCamera2);
  scene.add(refra.mesh);
  scene.add(refra.sphere);
  
  refra2 = new RefractingSphere({
    size: 50,
    refractionRatio: 0.93,
    getCamera: () => {
      return camera;
    },
  });
  scene.add(refra2.refractSphereCamera);
  scene.add(refra2.refractSphereCamera2);
  scene.add(refra2.mesh);
  // scene.add(refra2.sphere);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function update() {
  //   if (keyboard.pressed("z")) {
  //     // do something
  //   }

  controls.update();
  //   stats.update();
}

function render() {
  // move the CubeCamera to the position of the object
  //    that has a reflective surface, "take a picture" in each direction
  //    and apply it to the surface.
  // need to hide surface before and after so that it does not
  //    "get in the way" of the camera

  // refractSphere.visible = false;
  // if (count % 2 === 0) {
  //   refractMaterial.envMap = refractSphereCamera.renderTarget.texture;
  //   refractSphereCamera2.position.copy(refractSphere.position);
  //   refractSphereCamera2.update(renderer, scene);
  // } else {
  //   refractMaterial.envMap = refractSphereCamera2.renderTarget.texture;
  //   refractSphereCamera.position.copy(refractSphere.position);
  //   refractSphereCamera.update(renderer, scene);
  // }
  // count++;
  // refractSphere.visible = true;
  refra.update(renderer, scene);
  // renderer.render(scene, camera);
  refra2.update(renderer, scene);

  renderer.render(scene, camera);
}
