import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { PhotoDome } from "@babylonjs/core/Helpers/photoDome";

// Side-effects only imports allowing the standard material to be used as default.
import "@babylonjs/core/Materials/standardMaterial";


// Watch this in the Playground:  https://playground.babylonjs.com/#Y5JYYR#1

let canvas, engine, scene, camera, light;

const dome = Array(2);
const pano = ["360photo.jpg", "equirectangular.jpg", "earth.jpg", "mercator.jpg"];

let curr_dome = 0;
let curr_pano = 0;


function init ()
{
  setup();
  createPhotoDomes();
  addListeners();
}

function setup ()
{
  canvas = document.getElementById("3D");
  engine = new Engine(canvas, true, null, true);
  scene = new Scene(engine);

  camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);
  
  light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  engine.runRenderLoop(() => scene.render());
}

function createPhotoDomes ()
{
  // Create the two PhotoDomes
  for (let i=0; i<2; i++)
  {
    dome[i] = new PhotoDome(
      "dome" + i,
      null,
      {
        resolution: 32,
        size: 1000,
        useDirectMapping: false
      },
      scene
    );
  }

  const delta = 0.04;

  // Create onLoad event handlers
  for (let i=0; i<2; i++)
  {
    let domeI = dome[i];
    let domeJ = dome[1 ^ i];
    
    domeI.onLoaded = function ()
    {
      domeI.mesh.visibility = 1;
      domeI.mesh.material.alpha = 1;
      domeI.mesh.material.zOffset = 0;
      domeI.fovMultiplier = 1;
  
      domeJ.mesh.visibility = 1;
      domeJ.mesh.material.alpha = 1;
      domeJ.mesh.material.zOffset = -1;
      domeJ.fovMultiplier = 1;
  
      scene.onBeforeRenderObservable.clear();
      scene.onBeforeRenderObservable.add(() =>
      {
        domeJ.mesh.visibility -= delta;
        domeJ.mesh.material.alpha -= delta;
        domeJ.fovMultiplier -= delta;
        if (domeJ.mesh.material.alpha <= 0) scene.onBeforeRenderObservable.clear();
      });
    };
  }
}


function loadNextImage ()
{
  let url = "https:/playground.babylonjs.com/textures/" + pano[curr_pano];
  dome[curr_dome].photoTexture.updateURL(url, null, dome[curr_dome].onLoaded);
  curr_dome = 1 ^ curr_dome;
  if (++curr_pano == pano.length) curr_pano = 0;
}   


function addListeners ()
{
  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(
  new ExecuteCodeAction({
      trigger: ActionManager.OnKeyDownTrigger,
      parameter: 'x' //press "x" key
    },
    loadNextImage
  ));
}

console.log("BABYLONJS PHOTODOME TRANSITION SAMPLE");

// initialize
init();

// load first image
loadNextImage();

