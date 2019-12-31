import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const Stats = require('stats-js');
import {Line} from "./Line";
const WebAudioAnalyser = require('web-audio-analyser');
const soundmanager = require('soundmanager2');


var audioAnalyser: any;
var audio: any;
var lines: Line[];
var renderer: THREE.WebGLRenderer; 
var camera: THREE.PerspectiveCamera;
var scene: THREE.Scene;
var stats: any;
var SIZE: number[];

const wave_num = 22;
const line_put_width = 8;

init();
onResize();
window.onresize = onResize;

function init(): void{
  var counter = 0;
  stats = initStats();

  renderer = new THREE.WebGLRenderer( {
      antialias : true
  } );

  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  document.body.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.set(0, 350, -170);
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 450;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0, 0.00155 );

  SIZE = [Math.max(window.innerHeight, window.innerWidth) / 5, 30]

  soundManager.setup({
    onready: function() {
      document.getElementById('st_btn')!.classList.remove('button-loading');
      document.getElementById('st_btn')!.innerText = "Start";
    },
  });
}

function initStats(): void {
    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms
    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("Stats-output")!.appendChild(stats.domElement);
    return stats;
}

function start() {
  document.getElementById('st_btn')!.remove();
  audioAnalyser = WebAudioAnalyser(audio._a);
  audioAnalyser.analyser.fftSize = 4096;
  createLines(wave_num, line_put_width);
  update();
}

function createLines(wave_num: number, line_put_width: number): void{
  lines = new Array(wave_num)
  for (var i = lines.length - 1; i >= 0; i--) {
    lines[i] = new Line(-SIZE[1]/2 + i*0, line_put_width, 50, i, SIZE, audioAnalyser.frequencies())
    scene.add(lines[i].mesh);
  };

  //lines position shuffle
  for (var i = lines.length - 1; i >= 0; i--){
    var rand = Math.floor( Math.random() * ( i + 1 ) );
    var tmp = lines[i].mesh.position.z
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
  
  for (var i = 0; i < lines.length; i++) {
    if(lines[i]){
      lines[i].update(audioAnalyser.frequencies(), i);
      lines[i].rotation(1, 1, -64, -64 + (wave_num - 1) * line_put_width);
    }
  }  

  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

function startClick() {
  audio = soundManager.createSound({
    id: 'music',
    url: 'mp3/Dusty Noise.mp3',
    onload: () => start()
    //whileloading: () => {
    //  var perc = Math.round((this.bytesLoaded / this.bytesTotal) * 100);
    //  if(document.getElementById('st_btn')) document.getElementById('st_btn')!.innerText = 'loading ' + perc + "%";
    //}
    // other options here..
  });
  audio.play();
  //window.audio = audio;
}

var st_btn = document.getElementById('st_btn')!;
const enum EventName {
    LOAD = "load",
    CLICK = "click",
    MOUSE_MOVE = "mousemove"
}
st_btn.addEventListener(EventName.CLICK, () => startClick());


function onResize(): void{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}


