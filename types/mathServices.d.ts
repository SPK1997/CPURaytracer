import { Vector3, Matrix3x3 } from "./TypesAndInterfaces.ts";

declare const vectorUtils: {
  subtractVectors(v1: Vector3, v2: Vector3): Vector3;
  addVectors(v1: Vector3, v2: Vector3): Vector3;
  dotProduct(v1: Vector3, v2: Vector3): number;
  scaleVector(v: Vector3, k: number): Vector3;
  magnitudeOfVector(v: Vector3): number;
  normalizeVector(v: Vector3): Vector3;
  transformVector(vec: Vector3, matrix: Matrix3x3): Vector3;
  rotateVectorAroundYaxis(v: Vector3, angle: number): Vector3;
  quadraticEquationRoots(
    a: number,
    b: number,
    c: number
  ): { t1: number | null; t2: number | null };
};

export default vectorUtils;
