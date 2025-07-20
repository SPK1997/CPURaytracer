import { CanvasManager } from "./CPURaytracer/src/CanvasManager.js";
import { RaytracingManager } from "./CPURaytracer/src/RaytracingManager.js";

let previousClientX = null;
let moveTimeout = null;
let canvasHeight = 400;
let canvasWidth = 400;
let distanceFromCameraToViewport = 1;
let cameraPosition = { x: 0, y: 0, z: 0 };
let shapeData = [
  {
    center: { x: 0, y: -1, z: 3 },
    radius: 1,
    color: { r: 255, g: 0, b: 0 },
    specular: 500,
  },
  {
    center: { x: -1.5, y: 0.5, z: 3 },
    radius: 1,
    color: { r: 255, g: 255, b: 255 },
    specular: 500,
    reflective: 0.9,
  },
  {
    center: { x: 1.5, y: 1, z: 3 },
    radius: 1,
    color: { r: 0, g: 255, b: 0 },
    specular: 800,
  },
];

// GENERATE 882 Spheres in a 3D Grid
// let shapeData = [];
// let gridSize = 10;
// let spacing = 1.8;

// for (let x = -gridSize; x <= gridSize; x++) {
//   for (let y = -gridSize; y <= gridSize; y++) {
//     for (let z = 0; z < 2; z++) {
//       shapeData.push({
//         center: { x: x * spacing, y: y * spacing, z: z * spacing + 3 },
//         radius: 0.8,
//         color: {
//           r: Math.floor(Math.random() * 256),
//           g: Math.floor(Math.random() * 256),
//           b: Math.floor(Math.random() * 256),
//         },
//         specular: Math.floor(Math.random() * 1000),
//         reflective: Math.random() * 0.5,
//       });
//     }
//   }
// }

let lightData = [
  {
    type: "ambient",
    intensity: 0.2,
  },
  {
    type: "point",
    intensity: 0.6,
    position: { x: 2, y: 1, z: 0 },
  },
  {
    type: "directional",
    intensity: 0.2,
    direction: { x: 1, y: 4, z: 4 },
  },
];

let cm = new CanvasManager({
  target: document.getElementById("root"),
  height: canvasHeight,
  width: canvasWidth,
});
cm.showCanvas();
cm.enableMouseMovements({
  onpointerdownCb: (e) => {
    previousClientX = e.clientX;
  },
  onpointerupCb: async (e) => {
    previousClientX = null;
    for (let step = 30; step >= 1; step -= 1) {
      await rm.startRaytracing(step);
      cm.render();
    }
  },
  onpointermoveCb: (e) => {
    if (!previousClientX) return;
    let deltaClientX = e.clientX - previousClientX;
    let angleX = deltaClientX * 0.001;
    rm.cameraAngle = angleX;
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(async () => {
      await rm.startRaytracing(100); // Render low-res while moving
      cm.render();
    }, 20); // ~50 FPS
  },
});

let rm = new RaytracingManager({
  canvasHeight: canvasHeight,
  canvasWidth: canvasWidth,
  cameraPosition: cameraPosition,
  distanceFromCameraToViewport: distanceFromCameraToViewport,
  shapeData: shapeData,
  lightData: lightData,
  noIntersectionColor: { r: 255, g: 255, b: 255 },
  reflectiveRecursionLimit: 10,
  putPixelCallback: (x, y, color) => {
    cm.putPixel({
      x: x,
      y: y,
      color: color,
    });
  },
});

rm.startRaytracing().then(
  () => {
    cm.render();
  },
  (err) => {
    console.log(err);
  }
);
