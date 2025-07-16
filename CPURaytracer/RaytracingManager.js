import mathServices from "./mathServices.js";

class RaytracingManager {
  constructor({
    viewportHeight,
    viewportWidth,
    canvasHeight,
    canvasWidth,
    distanceFromCameraToViewport,
    cameraPosition,
    shapeData,
    putPixelCallback,
    onCompleteCallback,
    lightData,
    noIntersectionColor,
  }) {
    this.viewportHeight = viewportHeight;
    this.viewportWidth = viewportWidth;
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.distanceFromCameraToViewport = distanceFromCameraToViewport;
    this.cameraPosition = cameraPosition;
    this.shapeData = shapeData;
    this.putPixelCallback = putPixelCallback;
    this.onCompleteCallback = onCompleteCallback;
    this.lightData = lightData;
    this.noIntersectionColor = noIntersectionColor;
  }

  #calculateLighting(color, intersectionPoint, normalToShapeSurface) {
    if (!intersectionPoint) {
      return color;
    }
    let intensity = 0.0;
    for (let light of this.lightData) {
      if (light.type === "ambient") {
        intensity += light.intensity;
      } else {
        let lightVector = null;
        if (light.type === "point") {
          lightVector = mathServices.subtractVectors(
            light.position,
            intersectionPoint
          );
        } else if (light.type === "directional") {
          lightVector = light.direction;
        }
        let dotProductOfNormalAndLightVector = mathServices.dotProduct(
          lightVector,
          normalToShapeSurface
        );
        let magnitudeOfLightVector =
          mathServices.magnitudeOfVector(lightVector);
        let magnitudeOfNormalVector =
          mathServices.magnitudeOfVector(normalToShapeSurface);
        intensity +=
          light.intensity *
          (dotProductOfNormalAndLightVector /
            (magnitudeOfLightVector * magnitudeOfNormalVector));
      }
    }
    return {
      r: color.r * intensity,
      g: color.g * intensity,
      b: color.b * intensity,
    };
  }

  #calculateDirectionVector(viewportPosition) {
    return mathServices.subtractVectors(viewportPosition, this.cameraPosition);
  }

  #traceRay({ tMin, tMax, directionVector }) {
    let closestT = Number.POSITIVE_INFINITY;
    let closestShape = null;
    for (let shape of this.shapeData) {
      let { t1, t2 } = this.#intersectRayWithSphere({
        directionVector: directionVector,
        shape: shape,
      });
      if (t1 >= tMin && t1 <= tMax && t1 < closestT) {
        closestT = t1;
        closestShape = shape;
      }
      if (t2 >= tMin && t2 <= tMax && t2 < closestT) {
        closestT = t2;
        closestShape = shape;
      }
    }
    if (closestShape === null) {
      return {
        color: this.noIntersectionColor,
        intersectionPoint: null,
        normalToShapeSurface: null,
      };
    }
    let intersectionPoint = mathServices.addVectors(
      this.cameraPosition,
      mathServices.scaleVector(directionVector, closestT)
    );
    let closestShapeColor = closestShape.color;
    let normalToShapeSurface = mathServices.normalizeVector(
      mathServices.subtractVectors(intersectionPoint, closestShape.center)
    );
    return {
      color: closestShapeColor,
      intersectionPoint: intersectionPoint,
      normalToShapeSurface: normalToShapeSurface,
    };
  }

  #intersectRayWithSphere({ directionVector, shape }) {
    let radius = shape.radius;
    let centerToCameraVector = mathServices.subtractVectors(
      this.cameraPosition,
      shape.center
    );

    let a = mathServices.dotProduct(directionVector, directionVector);
    let b = 2 * mathServices.dotProduct(centerToCameraVector, directionVector);
    let c =
      mathServices.dotProduct(centerToCameraVector, centerToCameraVector) -
      radius ** 2;

    let { t1, t2 } = mathServices.quadraticEquationRoots(a, b, c);
    return {
      t1: t1 ?? Number.POSITIVE_INFINITY,
      t2: t2 ?? Number.POSITIVE_INFINITY,
    };
  }

  changeCameraPosition({ x, y, z }) {
    this.cameraPosition = { x: x, y: y, z: z };
  }

  startRaytracing() {
    let startX = -(this.canvasWidth / 2);
    let endX = this.canvasWidth / 2;
    let startY = -(this.canvasHeight / 2);
    let endY = this.canvasHeight / 2;
    let ratioW = this.viewportWidth / this.canvasWidth;
    let ratioH = this.viewportHeight / this.canvasHeight;
    for (let i = startX; i <= endX; i++) {
      for (let j = startY; j <= endY; j++) {
        let { color, intersectionPoint, normalToShapeSurface } = this.#traceRay(
          {
            tMin: 1,
            tMax: Number.POSITIVE_INFINITY,
            directionVector: this.#calculateDirectionVector({
              x: i * ratioW,
              y: j * ratioH,
              z: this.distanceFromCameraToViewport,
            }),
          }
        );
        let colorWithIntensityAdjusted = this.#calculateLighting(
          color,
          intersectionPoint,
          normalToShapeSurface
        );
        this.putPixelCallback(i, j, colorWithIntensityAdjusted);
      }
    }
    this.onCompleteCallback();
  }
}

export { RaytracingManager };
