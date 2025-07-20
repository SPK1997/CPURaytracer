import {
  Vector3 as _Vector3,
  Color as _Color,
  Pixel as _Pixel,
  RaytracingManagerProps as _RaytracingManagerProps,
  Matrix3x3 as _Matrix3x3,
} from "./TypesAndInterfaces";
import { RaytracingManager } from "../src/RaytracingManager.js";
import { CanvasManager } from "../src/CanvasManager.js";

export { RaytracingManager, CanvasManager };

// Dummy runtime values to allow non-type import
export const Pixel: undefined = undefined;
export const Vector3: undefined = undefined;
export const Color: undefined = undefined;
export const RaytracingManagerProps: undefined = undefined;
export const Matrix3x3: undefined = undefined;

// Actual types
export type Pixel = _Pixel;
export type Vector3 = _Vector3;
export type Color = _Color;
export type RaytracingManagerProps = _RaytracingManagerProps;
export type Matrix3x3 = _Matrix3x3;
