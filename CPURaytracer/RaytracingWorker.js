import mathServices from "./mathServices.js";
let lightData, noIntersectionColor, shapeData;
self.onmessage = (e) => {
  const {
    shapeData: sData,
    lightData: lData,
    noIntersectionColor: noIntColor,
    tMin,
    tMax,
    originVector,
    pixels,
    ratioW,
    ratioH,
    distanceFromCameraToViewport,
    recursionLimit,
  } = e.data;

  lightData = lData;
  noIntersectionColor = noIntColor;
  shapeData = sData;

  const result = pixels.map(({ x, y }) => {
    const directionVector = mathServices.subtractVectors(
      {
        x: x * ratioW,
        y: y * ratioH,
        z: distanceFromCameraToViewport,
      },
      originVector
    );

    let rotatedDirectionVector = mathServices.rotateVectorAroundYaxis(
      directionVector,
      Math.PI / 20
    );
    const color = traceRay({
      tMin: tMin,
      tMax: tMax,
      originVector: originVector,
      directionVector: rotatedDirectionVector,
      recursionLimit: recursionLimit,
    });

    return {
      canvasPixelX: x,
      canvasPixelY: y,
      color,
    };
  });

  self.postMessage(result);
};

function calculateReflectedRay(reverseIncomingRay, normalToShapeSurface) {
  let reflectedRayVector = mathServices.subtractVectors(
    mathServices.scaleVector(
      mathServices.scaleVector(normalToShapeSurface, 2),
      mathServices.dotProduct(normalToShapeSurface, reverseIncomingRay)
    ),
    reverseIncomingRay
  );
  return reflectedRayVector;
}

function calculateLighting({
  color,
  intersectionPoint,
  normalToShapeSurface,
  reverseDirectionVector,
  specular,
}) {
  if (!intersectionPoint) {
    return color;
  }
  let intensity = 0.0,
    tMax,
    tMin = 0.001;
  for (let light of lightData) {
    if (light.type === "ambient") {
      intensity += light.intensity;
    } else {
      let lightVector = null;
      if (light.type === "point") {
        lightVector = mathServices.subtractVectors(
          light.position,
          intersectionPoint
        );
        tMax = 1;
      } else if (light.type === "directional") {
        lightVector = light.direction;
        tMax = Number.POSITIVE_INFINITY;
      }

      //shaodows
      let { closestShape: lightBlockingShape } = closestIntersection({
        tMin: tMin,
        tMax: tMax,
        originVector: intersectionPoint,
        directionVector: lightVector,
      });
      if (lightBlockingShape !== null) {
        continue;
      }

      //diffuse reflection
      let dotProductOfNormalAndLightVector = mathServices.dotProduct(
        lightVector,
        normalToShapeSurface
      );
      if (dotProductOfNormalAndLightVector > 0) {
        let magnitudeOfLightVector =
          mathServices.magnitudeOfVector(lightVector);
        let magnitudeOfNormalVector =
          mathServices.magnitudeOfVector(normalToShapeSurface);
        intensity +=
          light.intensity *
          (dotProductOfNormalAndLightVector /
            (magnitudeOfLightVector * magnitudeOfNormalVector));
      }

      // specular reflection
      if (specular !== -1) {
        let reflectedRayVector = calculateReflectedRay(
          lightVector,
          normalToShapeSurface
        );
        let dotProductOfReflectedRayVectorAndReverseDirectionVector =
          mathServices.dotProduct(reflectedRayVector, reverseDirectionVector);

        if (dotProductOfReflectedRayVectorAndReverseDirectionVector > 0) {
          let magnitudeOfReflectedRayVector =
            mathServices.magnitudeOfVector(reflectedRayVector);
          let magnitudeOfReverseDirectionVector =
            mathServices.magnitudeOfVector(reverseDirectionVector);
          intensity +=
            light.intensity *
            (dotProductOfReflectedRayVectorAndReverseDirectionVector /
              (magnitudeOfReflectedRayVector *
                magnitudeOfReverseDirectionVector)) **
              specular;
        }
      }
    }
  }
  return {
    r: color.r * intensity,
    g: color.g * intensity,
    b: color.b * intensity,
  };
}

function closestIntersection({ tMin, tMax, originVector, directionVector }) {
  let closestT = Number.POSITIVE_INFINITY;
  let closestShape = null;
  for (let shape of shapeData) {
    let { t1, t2 } = intersectRayWithSphere({
      originVector: originVector,
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
  return { closestT: closestT, closestShape: closestShape };
}

function traceRay({
  tMin,
  tMax,
  originVector,
  directionVector,
  recursionLimit,
}) {
  let { closestShape, closestT } = closestIntersection({
    tMin,
    tMax,
    originVector,
    directionVector,
  });
  if (closestShape === null) {
    return noIntersectionColor;
  }
  let intersectionPoint = mathServices.addVectors(
    originVector,
    mathServices.scaleVector(directionVector, closestT)
  );
  let closestShapeColor = closestShape.color;
  let normalToShapeSurface = mathServices.normalizeVector(
    mathServices.subtractVectors(intersectionPoint, closestShape.center)
  );

  let reverseDirectionVector = mathServices.subtractVectors(
    { x: 0, y: 0, z: 0 },
    directionVector
  );

  // reflection
  if (
    recursionLimit <= 0 ||
    !closestShape.reflective ||
    closestShape.reflective === 0.0 ||
    closestShape.reflective <= 0
  ) {
    return calculateLighting({
      color: closestShapeColor,
      intersectionPoint: intersectionPoint,
      normalToShapeSurface: normalToShapeSurface,
      reverseDirectionVector: reverseDirectionVector,
      specular: closestShape.specular ?? -1,
    });
  }
  let reflectedRayVector = calculateReflectedRay(
    reverseDirectionVector,
    normalToShapeSurface
  );
  let iOptions = {
    tMin: 0.001,
    tMax: Number.POSITIVE_INFINITY,
    originVector: intersectionPoint,
    directionVector: reflectedRayVector,
    recursionLimit: recursionLimit - 1,
  };
  let reflectedColor = traceRay(iOptions);
  let newMixedColor = {
    r:
      closestShapeColor.r * (1 - closestShape.reflective) +
      reflectedColor.r * closestShape.reflective,
    g:
      closestShapeColor.g * (1 - closestShape.reflective) +
      reflectedColor.g * closestShape.reflective,
    b:
      closestShapeColor.b * (1 - closestShape.reflective) +
      reflectedColor.b * closestShape.reflective,
  };
  return calculateLighting({
    color: newMixedColor,
    intersectionPoint: intersectionPoint,
    normalToShapeSurface: normalToShapeSurface,
    reverseDirectionVector: reverseDirectionVector,
    specular: closestShape.specular ?? -1,
  });
}

function intersectRayWithSphere({ directionVector, originVector, shape }) {
  let radius = shape.radius;
  let centerToOriginVector = mathServices.subtractVectors(
    originVector,
    shape.center
  );

  let a = mathServices.dotProduct(directionVector, directionVector);
  let b = 2 * mathServices.dotProduct(centerToOriginVector, directionVector);
  let c =
    mathServices.dotProduct(centerToOriginVector, centerToOriginVector) -
    radius ** 2;

  let { t1, t2 } = mathServices.quadraticEquationRoots(a, b, c);
  return {
    t1: t1 ?? Number.POSITIVE_INFINITY,
    t2: t2 ?? Number.POSITIVE_INFINITY,
  };
}
