import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
const Stats = require('stats-js');
import {Lines} from "./Line";
import {Control} from "./Control";
const WebAudioAnalyser = require('web-audio-analyser');
const soundmanager = require('soundmanager2');

let audioAnalyser: any;
let audio: any;
let lines: Lines;
let renderer: THREE.WebGLRenderer; 
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let camera_controls: OrbitControls;
let controls: any;
let stats: any;

const wave_num = 22;
const width = 2;
const line_put_width = 8;
const fft_size = 4096;
const SIZE = [Math.max(window.innerHeight, window.innerWidth) / 5, 30];

init();
onResize();

function init(): void{
  stats = initStats();

  renderer = new THREE.WebGLRenderer( {antialias : true});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.set(0, 276, -132);
  camera_controls = new OrbitControls(camera, renderer.domElement);
  camera_controls.maxDistance = 450;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0, 0.00155);

  lines = new Lines(wave_num, width, line_put_width, fft_size, SIZE);

  controls = new Control(camera, lines.lines).initControls();

  soundManager.setup({
    onready: function() {
      document.getElementById('st_btn')!.classList.remove('button-loading');
      document.getElementById('st_btn')!.innerText = "Start";
    },
  });
}

function initStats(): void{
  const stats = new Stats();
  stats.setMode(0); 
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.getElementById("Stats-output")!.appendChild(stats.domElement);
  return stats;
}

function update(): void{
  stats.update();

  if(!renderer) {
    requestAnimationFrame(update);
    return;
  }

  lines.update(audioAnalyser.frequencies());
  lines.rotation();

  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

function start(): void{
  document.getElementById('st_btn')!.remove();
  audioAnalyser = WebAudioAnalyser(audio._a);
  audioAnalyser.analyser.fftSize = fft_size;
  lines.createLines(scene);
  lines.shuffleLines();
  update();
}

function startClick(): void{
  audio = soundManager.createSound({
    id: 'music',
    url: 'mp3/Dusty Noise.mp3',
    onload: () => start()
  });
  audio.play();
}
const st_btn = document.getElementById('st_btn')!;
st_btn.addEventListener("click", () => startClick());

function onResize(): void{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", () => onResize());



export class CustomSinCurve {
  public scale: number;

  constructor(scale:number){
    this.scale = scale;
  }

  public getPoint(t:number):THREE.Vector3 {
    var tx = t * 3 - 1.5;
    var ty = Math.sin( 2 * Math.PI * t );
    var tz = 0;
    return new THREE.Vector3( tx, ty, tz ).multiplyScalar(this.scale);
  }
}