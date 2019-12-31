import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
const Stats = require('stats-js');
import {Line} from "./Line";
const WebAudioAnalyser = require('web-audio-analyser');
const soundmanager = require('soundmanager2');

let audioAnalyser: any;
let audio: any;
let lines: Line[];
let renderer: THREE.WebGLRenderer; 
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let controls: OrbitControls;
let stats: any;

const wave_num = 22;
const line_put_width = 8;
const SIZE = [Math.max(window.innerHeight, window.innerWidth) / 5, 30];

init();
onResize();

function init(): void{
  stats = initStats();

  renderer = new THREE.WebGLRenderer( {
      antialias : true
  } );

  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.set(0, 350, -170);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 450;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0, 0.00155 );

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

function start(): void{
  document.getElementById('st_btn')!.remove();
  audioAnalyser = WebAudioAnalyser(audio._a);
  audioAnalyser.analyser.fftSize = 4096;
  createLines(wave_num, line_put_width);
  shuffleLines(lines);
  update();
}

function createLines(wave_num: number, line_put_width: number): void{
  lines = new Array(wave_num)
  for (let i = lines.length - 1; i >= 0; i--) {
    lines[i] = new Line(-SIZE[1]/2 + i*0, line_put_width, 50, i, SIZE, audioAnalyser.frequencies())
    scene.add(lines[i].mesh);
  }  
}

function shuffleLines(lines: Line[]): void{
  for (let i = lines.length - 1; i >= 0; i--){
    let rand = Math.floor( Math.random() * ( i + 1 ) );
    let tmp = lines[i].mesh.position.z
    lines[i].mesh.position.z = lines[rand].mesh.position.z;
    lines[rand].mesh.position.z = tmp;
  }
}

function update(): void{
  stats.update();

  if(!renderer) {
    requestAnimationFrame(update);
    return;
  }

  for (let i = 0; i < lines.length; i++) {
    if(lines[i]){
      lines[i].update(audioAnalyser.frequencies(), i);
      lines[i].rotation(1, 1, -64, -64 + (wave_num - 1) * line_put_width);
    }
  }
  
  requestAnimationFrame(update);
  renderer.render(scene, camera);
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
const enum EventName {
    LOAD = "load",
    CLICK = "click",
    MOUSE_MOVE = "mousemove",
    RESIZE = "resize"
}
st_btn.addEventListener(EventName.CLICK, () => startClick());

function onResize(): void{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener(EventName.RESIZE, () => onResize());


