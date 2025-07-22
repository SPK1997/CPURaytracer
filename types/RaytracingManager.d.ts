import {
  Vector3,
  Color,
  RaytracingManagerProps,
  Pixel,
  Shape,
  Light,
} from "./TypesAndInterfaces";

export declare class RaytracingManager {
  constructor(props: RaytracingManagerProps);

  start(): Promise<void>;

  cameraAngle: number;
  canvasHeight: number;
  canvasWidth: number;
  distanceFromCameraToViewport: number;
  cameraPosition: Vector3;
  reflectiveRecursionLimit: number;
  putPixelCallback?: (props: Pixel[]) => void;
  shapeData: Shape[];
  lightData: Light[];
  noIntersectionColor: Color;
}
