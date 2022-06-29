import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import gradientVertexShader from './assets/shaders/gradient/vertex.glsl?raw';
import gradientFragmentShader from './assets/shaders/gradient/fragment.glsl?raw';
import { Clock } from 'three';

const canvas: HTMLCanvasElement = document.querySelector('#webgl-canvas')!;

// Get width and height of viewport. To be used throughout
const sizes: { width: number; height: number } = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Gui
 */

const gui = new GUI({
  width: 400,
});

const params = {
  color1: 0xF0F883,
  color2: 0xFFFFFF,
  color3: 0xBA70FF,
};

/**
 * Responsive
 */

// Resize the canvas and update the camera/renderer when the browser is resized
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update shader
  gradientPass.uniforms.u_resolution.value = getResolution();
});

const getResolution = () => {
  return new THREE.Vector2(sizes.width * renderer.getPixelRatio(), sizes.height * renderer.getPixelRatio());
}

/**
 * Scene
 */
const scene: THREE.Scene = new THREE.Scene();
scene.background = new THREE.Color('#ffffff');

/**
 * Camera
 */
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  75, // fov
  sizes.width / sizes.height, // aspect ratio
  0.1, // near value
  100 // far value
);
camera.position.z = 1; // position backwards from center
scene.add(camera);

/**
 * Renderer
 */
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true, // smooth edges
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // pixelratio at max 2
renderer.setSize(sizes.width, sizes.height); // canvas size

/**
 * Post processing
 */
const composer = new EffectComposer( renderer );

const gradientPass = new ShaderPass({
  vertexShader: gradientVertexShader,
  fragmentShader: gradientFragmentShader,
  uniforms:  {
    // Global
    u_resolution: {
      value: getResolution(),
    },
    u_time: { value: 0 },
    // Colors
    u_color1: {
      value: new THREE.Color(0xF0F883),
    },
    u_color2: {
      value: new THREE.Color(0xFFFFFF),
    },
    u_color3: {
      value: new THREE.Color(0xBA70FF),
    },
    // Rotation
    u_rotation_start: {
      value: 0,
    },
    u_rotation_amplitude: {
      value: 20,
    },
    u_rotation_speed: {
      value: 0.5,
    },
    // Left
    u_color_left_offset: {
      value: 1,
    },
    u_color_left_roundness: {
      value: 0.3,
    },
    u_color_left_roundness_offset: {
      value: 0,
    },
    // Right
    u_color_right_offset: {
      value: 1,
    },
    u_color_right_roundness: {
      value: 0.3,
    },
    u_color_right_roundness_offset: {
      value: 0.7,
    },
    // Grain
    u_grain_amount_r: {
      value: 0.1,
    },
    u_grain_amount_g: {
      value: 0.1,
    },
    u_grain_amount_b: {
      value: 0.1,
    },
    // Other
    u_middle: {
      value: 0.5,
    },
    u_easing: {
      value: 0.5,
    },
  },
});
composer.addPass( gradientPass );

/**
 * Gui params
 */

const guiColor = gui.addFolder('Color');
guiColor.addColor(params, 'color1').onChange(() => gradientPass.uniforms.u_color1.value.set(params.color1)).name('Left');
guiColor.addColor(params, 'color2').onChange(() => gradientPass.uniforms.u_color2.value.set(params.color2)).name('Middle');
guiColor.addColor(params, 'color3').onChange(() => gradientPass.uniforms.u_color3.value.set(params.color3)).name('Right');

const guiRotation = gui.addFolder('Rotation');
guiRotation.add(gradientPass.uniforms.u_rotation_start, 'value').min(0).max(360).step(0.1).name('Rotation start');
guiRotation.add(gradientPass.uniforms.u_rotation_amplitude, 'value').min(0).max(180).step(0.1).name('Rotation amplitude');
guiRotation.add(gradientPass.uniforms.u_rotation_speed, 'value').min(0).max(2).step(0.01).name('Rotation speed');

const guiLeft = gui.addFolder('Left')
guiLeft.add(gradientPass.uniforms.u_color_left_offset, 'value').min(0).max(2).step(0.01).name('Offset');
guiLeft.add(gradientPass.uniforms.u_color_left_roundness, 'value').min(0).max(2).step(0.01).name('Roundness');
guiLeft.add(gradientPass.uniforms.u_color_left_roundness_offset, 'value').min(0).max(6.28).step(0.01).name('Roundness offset');

const guiRight = gui.addFolder('Right')
guiRight.add(gradientPass.uniforms.u_color_right_offset, 'value').min(0).max(2).step(0.01).name('Offset');
guiRight.add(gradientPass.uniforms.u_color_right_roundness, 'value').min(0).max(2).step(0.01).name('Roundness');
guiRight.add(gradientPass.uniforms.u_color_right_roundness_offset, 'value').min(0).max(6.2).step(0.01).name('Roundness offset');

const guiGrain = gui.addFolder('Grain') ;
guiGrain.add(gradientPass.uniforms.u_grain_amount_r, 'value').min(0).max(0.3).step(0.001).name('Red');
guiGrain.add(gradientPass.uniforms.u_grain_amount_g, 'value').min(0).max(0.3).step(0.001).name('Green');
guiGrain.add(gradientPass.uniforms.u_grain_amount_b, 'value').min(0).max(0.3).step(0.001).name('Blue');

const guiOther = gui.addFolder('Other') ;
guiOther.add(gradientPass.uniforms.u_middle, 'value').min(0.2).max(0.8).step(0.01).name('Middle');

/**
 * Render loop
 */

const clock = new Clock();

const tick = (): void => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  gradientPass.uniforms.u_time.value = elapsedTime

  composer.render();
  window.requestAnimationFrame(tick);
};

tick();
