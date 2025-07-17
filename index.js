import { CanvasManager } from "./CPURaytracer/CanvasManager.js";
import { RaytracingManager } from "./CPURaytracer/RaytracingManager.js";

let canvasHeight = 400;
let canvasWidth = 400;
let distanceFromCameraToViewport = 1;
let cameraPosition = { x: 0, y: 0, z: 0 };
let viewportHeight = 1;
let viewportWidth = 1;
let shapeData = [
  {
    center: { x: 0, y: -1, z: 3 },
    radius: 1,
    color: { r: 255, g: 0, b: 0 },
    specular: 500,
  },
  {
    center: { x: 2, y: 0, z: 4 },
    radius: 1,
    color: { r: 0, g: 0, b: 255 },
    specular: 1000,
  },
  {
    center: { x: -2, y: 0, z: 4 },
    radius: 1,
    color: { r: 0, g: 255, b: 0 },
    specular: 10,
  },
  {
    center: { x: 0, y: 2, z: 10 },
    radius: 2,
    color: { r: 0, g: 255, b: 255 },
  },
];
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

let rm = new RaytracingManager({
  viewportHeight: viewportHeight,
  viewportWidth: viewportWidth,
  canvasHeight: canvasHeight,
  canvasWidth: canvasWidth,
  cameraPosition: cameraPosition,
  distanceFromCameraToViewport: distanceFromCameraToViewport,
  shapeData: shapeData,
  lightData: lightData,
  noIntersectionColor: { r: 255, g: 255, b: 255 },
  putPixelCallback: (x, y, color) => {
    cm.putPixel({
      x: x,
      y: y,
      color: color,
    });
  },
  onCompleteCallback: () => {
    cm.render();
  },
});

rm.startRaytracing();
