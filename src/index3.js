import * as THREE from "three";
import OBJLoader from "three/examples/js/loaders/OBJLoader";
import GLTFLoader from "three/examples/js/loaders/GLTFLoader";
import DRACOLoader from "three/examples/js/loaders/DRACOLoader";
import OrbitControls from "three/examples/js/controls/OrbitControls";
import fenty from "./assets/Fenty/3D Model/Fenty Version/fentyObj.obj";
import fond1 from "./assets/fleurs/fond.jpg";
import fond2 from "./assets/fleurs/fond2.jpg";
import fond3 from "./assets/fleurs/fond3.jpg";
import { Refractor } from "./Refractor.js";
import { WaterRefractionShader } from "./waterShader.js";
import water from "./assets/waterdudv.jpg";
var camera, scene, renderer;
var plane;
var mouse,
  raycaster,
  isShiftDown = false;
var controls;
var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;
var refractor;
var clock;
var objects = [];
init();
render();

function init() {
  clock = new THREE.Clock();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(500, 800, 1300);
  camera.lookAt(0, 0, 0);

  var urls = [fond1, fond1, fond2, fond2, fond3, fond3];

  var textureCube = new THREE.CubeTextureLoader().load(urls);
  textureCube.mapping = THREE.CubeRefractionMapping;

  scene = new THREE.Scene();
  scene.background = textureCube;

  // instantiate a loader
  var loader = new THREE.OBJLoader();

  // load a resource
  loader.load(
    // resource URL
    fenty,
    // called when resource is loaded
    function (object) {
      // scene.add(object);
      // camera.lookAt(object.position);
      console.log(object);

      // refractor solution
      var refractorGeometry = object.children[1].geometry.clone();
      refractor = new Refractor(refractorGeometry, {
        color: 0xc06c00,
        textureWidth: 1024,
        textureHeight: 1024,
        envMap: textureCube,
        shader: WaterRefractionShader,
      });

      scene.add(refractor);

      var dudvMap = new THREE.TextureLoader().load(water);

      dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;
      refractor.material.uniforms["tDudv"].value = dudvMap;
      refractor.rotateX(-Math.PI / 2);
      refractor.position.set(0, 10, 5);

      console.log(refractor);
      // envmap solution
      var cubeMaterial3 = new THREE.MeshPhongMaterial({
        color: 0xc06c00,
        envMap: textureCube,
        refractionRatio: 0.98,
        reflectivity: 0.9,
      });
      var materialRouge = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      object.children.forEach((child) => {
        child.position.set(0, 100, 5);
        child.rotateX(-Math.PI / 2);
      });

      object.children[0].material = cubeMaterial3;
      object.children[0].position.set(20,100,0)
      scene.add(object.children[0]);
      // object.children[1].material = cubeMaterial3;

      // object.children[2].material = materialRouge;
      // object.children[3].material = materialRouge;
      // var materialBleu = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      // object.children[4].material = materialBleu;
      // object.children[5].material = materialBleu;
      // object.children[6].material = materialBleu;
      // var materialJaune = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      // object.children[7].material = materialJaune;
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

  // cubes

  cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
  cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xfeb74c,
    // map: new THREE.TextureLoader().load("textures/square.png"),
  });

  // grid

  var gridHelper = new THREE.GridHelper(1000, 20);
  scene.add(gridHelper);

  //

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  );
  scene.add(plane);

  objects.push(plane);

  // lights

  var ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.update();
  //   document.addEventListener("mousemove", onDocumentMouseMove, false);
  //   document.addEventListener("mousedown", onDocumentMouseDown, false);
  //   document.addEventListener("keydown", onDocumentKeyDown, false);
  //   document.addEventListener("keyup", onDocumentKeyUp, false);

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  requestAnimationFrame(render);
  controls.update();

  refractor
    ? (refractor.material.uniforms["time"].value += clock.getDelta())
    : null;
  renderer.render(scene, camera);
}
