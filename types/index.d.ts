import {
  Vector3 as _Vector3,
  Color as _Color,
  Pixel as _Pixel,
  RaytracingManagerProps as _RaytracingManagerProps,
  CanvasManagerProps as _CanvasManagerProps,
  Matrix3x3 as _Matrix3x3,
  Light as _Light,
  Shape as _Shape,
  PointerMovementsEventHandler as _PointerMovementsEventHandler
} from "./TypesAndInterfaces";
import { RaytracingManager } from "./RaytracingManager";
import { CanvasManager } from "./CanvasManager";

// Dummy runtime values to allow non-type import
export const Pixel: undefined;
export const Vector3: undefined;
export const Color: undefined;
export const Matrix3x3: undefined;
export const Light: undefined;
export const Shape: undefined;
export const RaytracingManagerProps: undefined;
export const CanvasManagerProps: undefined;
export const EnablePointerMovementsProps: undefined
export { RaytracingManager, CanvasManager };

// Actual types
export type Pixel = _Pixel;
export type Vector3 = _Vector3;
export type Color = _Color;
export type RaytracingManagerProps = _RaytracingManagerProps;
export type CanvasManagerProps = _CanvasManagerProps;
export type Matrix3x3 = _Matrix3x3;
export type Light = _Light;
export type Shape = _Shape;
export type EnablePointerMovementsProps = _PointerMovementsEventHandler;
