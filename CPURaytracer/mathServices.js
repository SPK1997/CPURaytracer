export default {
  subtractVectors(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
  },
  addVectors(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
  },
  dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  },
  scaleVector(v, k) {
    return {
      x: v.x * k,
      y: v.y * k,
      z: v.z * k,
    };
  },
  magnitudeOfVector(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  },

  normalizeVector(v) {
    let k = this.magnitudeOfVector(v);
    if (k === 0) {
      return v;
    }
    return this.scaleVector(v, 1 / k);
  },

  transformVector(vec, matrix) {
    let { x, y, z } = vec;
    return {
      x: x * matrix[0][0] + y * matrix[1][0] + z * matrix[2][0],
      y: x * matrix[0][1] + y * matrix[1][1] + z * matrix[2][1],
      z: x * matrix[0][2] + y * matrix[1][2] + z * matrix[2][2],
    };
  },

  rotateVectorAroundYaxis(v, angle) {
    let matrix = [
      [Math.cos(angle), 0, -Math.sin(angle)],
      [0, 1, 0],
      [Math.sin(angle), 0, Math.cos(angle)],
    ];
    let output = this.transformVector(v, matrix);
    return output;
  },

  quadraticEquationRoots(a, b, c) {
    let d = b ** 2 - 4 * a * c;
    if (d < 0) {
      return { t1: null, t2: null };
    }
    let t1 = (-b + Math.sqrt(d)) / (2 * a);
    let t2 = (-b - Math.sqrt(d)) / (2 * a);
    return {
      t1: t1,
      t2: t2,
    };
  },
};
