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
  putPixelCallback?: (x: number, y: number, color: Color) => void;
  shapeData?: any[];
  lightData?: any[];
  noIntersectionColor?: Color;
}

export interface SubscribeEventParams {
  element: HTMLElement;
  eventName: string;
  callback: EventListenerOrEventListenerObject;
  signalName: string;
}

export interface EnableMouseMovementsArgs {
  onpointerdownCb: (e: PointerEvent) => void;
  onpointerupCb: (e: PointerEvent) => void;
  onpointermoveCb: (e: PointerEvent) => void;
}
