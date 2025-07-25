export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Pixel {
  x: number;
  y: number;
  color: Color;
}

export type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export interface RaytracingManagerProps {
  canvasHeight: number;
  canvasWidth: number;
  distanceFromCameraToViewport: number;
  cameraPosition: Vector3;
  reflectiveRecursionLimit?: number;
  putPixelCallback?: (props: Pixel[]) => void;
  shapeData?: any[];
  lightData?: any[];
  noIntersectionColor?: Color;
}

export interface CanvasManagerProps {
  target: HTMLElement;
  height: number;
  width: number;
}

interface Sphere {
  center: Vector3;
  radius: number;
  color: Color;
  specular?: number;
  reflective?: number;
}

export type Shape = Sphere;

interface AmbientLight {
  type: string;
  intensity: number;
}

interface PointLight {
  type: string;
  intensity: number;
  position: Vector3;
}

interface DirectionalLight {
  type: string;
  intensity: number;
  direction: Vector3;
}

export type Light = AmbientLight | PointLight | DirectionalLight;

export interface PointerMovementsEventHandler {
  pointerdown: (e: PointerEvent) => void,
  pointerup: (e: PointerEvent) => void,
  pointermove: (e: PointerEvent) => void
}
