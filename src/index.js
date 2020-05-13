import * as THREE from "three";
import OBJLoader from "three/examples/js/loaders/OBJLoader";
import GLTFLoader from "three/examples/js/loaders/GLTFLoader";
import DRACOLoader from "three/examples/js/loaders/DRACOLoader";
import OrbitControls from "three/examples/js/controls/OrbitControls";
import fenty from "./assets/Fenty/3D Model/Fenty Version/fentyObj.obj";
import fond1 from "./assets/fleurs/fond.jpg";
import fond2 from "./assets/fleurs/fond2.jpg";
import fond3 from "./assets/fleurs/fond3.jpg";
import noir from "./assets/noir.png";
import { Refractor } from "./Refractor.js";
import { WaterRefractionShader } from "./waterShader.js";
import water from "./assets/waterdudv.jpg";
import Refracting from "./Refracting";
var camera, scene, renderer, inside, outside;

init();
animate();

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
  var urls = [noir, noir, noir, noir, noir, noir];
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
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);
  // CONTROLS
  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  // GRID
  var gridHelper = new THREE.GridHelper(1000, 20);
  scene.add(gridHelper);
  // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(250, 200, 50);
  scene.add(light);
  var light2 = new THREE.PointLight(0xffffff);
  light2.position.set(50, -200, 250);
  scene.add(light2);
  var light3 = new THREE.PointLight(0xffffff);
  light3.position.set(-250, 200, -250);
  scene.add(light3);
  var light4 = new THREE.PointLight(0xffffff);
  light4.position.set(0, 0, 0);
  scene.add(light4);

  var ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  //   var directionalLight = new THREE.DirectionalLight(0xffffff);
  //   directionalLight.position.set(750, 100, 0.5).normalize();
  //   scene.add(directionalLight);

  //OBJECT
  var loader = new THREE.OBJLoader();

  // load a resource
  loader.load(
    // resource URL
    fenty,
    // called when resource is loaded
    function (object) {
      console.log(object);
      //   object.rotateX(-Math.PI / 2);
      //   scene.add(object);
      console.log(object.children);
    //   object.children.forEach((child, index) => {
        // if (index > 1) {
        //   console.log(index);
        //   let obj = object.children[2].clone();
        //   scene.add(obj);
        //   obj.rotateX(Math.PI * 1.5);
        //   obj.position.y += 40;
        //   let obj2 = object.children[3].clone();
        //   scene.add(obj2);
        //   obj2.rotateX(Math.PI * 1.5);
        //   obj2.position.y += 40;
        //   let obj3 = object.children[4].clone();
        //   scene.add(obj3);
        //   obj3.rotateX(Math.PI * 1.5);
        //   obj3.position.y += 40;
          let obj4 = object.children[5].clone();
          scene.add(obj4);
          obj4.rotateX(Math.PI * 1.5);
          obj4.position.y += 40;
        // }
    //   });

      let insideMesh = object.children[0].clone();
      insideMesh.scale.set(0.8, 0.8, 1);
      inside = new Refracting({
        mesh: insideMesh,
        size: 10,
        getCamera: () => {
          return camera;
        },
        color: 0x902c00,
        reflectivity: 0.3,
        side: THREE.BackSide,
      });
      scene.add(inside.refractSphereCamera);
      scene.add(inside.refractSphereCamera2);
      scene.add(inside.mesh);
      //   scene.add(inside.sphere);
      inside.mesh.rotateX(Math.PI * 1.5);
      inside.mesh.position.y += 40;
      outside = new Refracting({
        mesh: object.children[1].clone(),
        // refractionRatio: 1,
        zoomDistance: { x: 10000, y: 10000, z: 10000 },
        size: 10,
        getCamera: () => {
          return camera;
        },
        color: 0xe0e0e0,
      });
      scene.add(outside.refractSphereCamera);
      scene.add(outside.refractSphereCamera2);
      scene.add(outside.mesh);
      outside.mesh.rotateX(Math.PI * 1.5);
      outside.mesh.position.y += 40;
      // scene.add(outside.sphere);
    },
    // called when loading is in progresses
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened", error);
    }
  );
}

function animate() {
  requestAnimationFrame(animate);
  inside.update(renderer, scene);
  outside.update(renderer, scene);
  renderer.render(scene, camera);
}
