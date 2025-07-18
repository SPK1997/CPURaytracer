class RaytracingManager {
  constructor(props) {
    this.viewportHeight = props.viewportHeight;
    this.viewportWidth = props.viewportWidth;
    this.canvasHeight = props.canvasHeight;
    this.canvasWidth = props.canvasWidth;
    this.distanceFromCameraToViewport = props.distanceFromCameraToViewport;
    this.cameraPosition = props.cameraPosition;
    this.reflectiveRecursionLimit = props.reflectiveRecursionLimit || 0;
    this.putPixelCallback =
      props.putPixelCallback ||
      function () {
        console.warn("putPixelCallback is missing in RaytracingManager");
      };
    this.onCompleteCallback =
      props.onCompleteCallback ||
      function () {
        console.warn("onCompleteCallback is missing in RaytracingManager");
      };
    this.shapeData =
      props.shapeData && props.shapeData.length ? props.shapeData : [];
    this.lightData =
      props.lightData && props.lightData.length ? props.lightData : [];
    this.noIntersectionColor = props.noIntersectionColor || {
      r: 0,
      g: 0,
      b: 0,
    };
  }

  async startRaytracing() {
    const numCores = navigator.hardwareConcurrency || 4;
    const workers = Array.from(
      { length: numCores },
      () => new Worker("./CPURaytracer/RaytracingWorker.js", { type: "module" })
    );

    const startX = -(this.canvasWidth / 2);
    const endX = this.canvasWidth / 2;
    const startY = -(this.canvasHeight / 2);
    const endY = this.canvasHeight / 2;

    const ratioW = this.viewportWidth / this.canvasWidth;
    const ratioH = this.viewportHeight / this.canvasHeight;

    // Collect all pixels
    const allPixels = [];
    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        allPixels.push({ x, y });
      }
    }

    // Divide pixels into chunks for each worker
    const chunkSize = Math.ceil(allPixels.length / numCores);
    const pixelChunks = Array.from({ length: numCores }, (_, i) =>
      allPixels.slice(i * chunkSize, (i + 1) * chunkSize)
    );

    // Send chunks to workers in parallel
    const results = await Promise.all(
      pixelChunks.map((chunk, i) => {
        return new Promise((resolve, reject) => {
          const worker = workers[i];
          worker.onerror = (e) => reject(e);
          worker.onmessage = (e) => resolve(e.data);
          worker.postMessage({
            shapeData: this.shapeData,
            lightData: this.lightData,
            noIntersectionColor: this.noIntersectionColor,
            tMin: 1,
            tMax: Number.POSITIVE_INFINITY,
            originVector: this.cameraPosition,
            pixels: chunk,
            ratioW,
            ratioH,
            distanceFromCameraToViewport: this.distanceFromCameraToViewport,
            recursionLimit: this.reflectiveRecursionLimit,
          });
        });
      })
    );

    // Flatten and render pixels
    results.flat().forEach((pixelData) => {
      this.putPixelCallback(
        pixelData.canvasPixelX,
        pixelData.canvasPixelY,
        pixelData.color
      );
    });

    // Cleanup
    workers.forEach((worker) => worker.terminate());
    this.onCompleteCallback();
  }
}

export { RaytracingManager };
