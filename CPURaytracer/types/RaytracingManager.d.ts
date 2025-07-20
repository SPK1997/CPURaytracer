import {
  Vector3,
  Color,
  RaytracingManagerProps,
} from "./TypesAndInterfaces.ts";

export declare class RaytracingManager {
  constructor(props: RaytracingManagerProps);

  startRaytracing(step?: number): Promise<void>;

  cameraAngle: number;
  canvasHeight: number;
  canvasWidth: number;
  distanceFromCameraToViewport: number;
  cameraPosition: Vector3;
  reflectiveRecursionLimit: number;
  putPixelCallback?: (x: number, y: number, color: Color) => void;
  shapeData: any[];
  lightData: any[];
  noIntersectionColor: Color;
}
