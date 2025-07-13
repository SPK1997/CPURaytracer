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
