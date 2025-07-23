import workerSource from "../dist/raytracingworker.bundle.js";

class RaytracingManager {
  #viewportHeight;
  #viewportWidth;
  #workers;
  #pixelBuffer;
  #pixelBufferOffset;
  #progressiveRenderingStep;
  #animationFrameId;
  #cameraAngle;
  constructor(props) {
    this.canvasHeight = props.canvasHeight;
    this.canvasWidth = props.canvasWidth;
    this.#viewportHeight = 1;
    this.#viewportWidth =
      (this.canvasWidth / this.canvasHeight) * this.#viewportHeight;
    this.distanceFromCameraToViewport = props.distanceFromCameraToViewport;
    this.cameraPosition = props.cameraPosition;
    this.reflectiveRecursionLimit = props.reflectiveRecursionLimit || 0;
    this.putPixelCallback =
      props.putPixelCallback ||
      function () {
        console.warn("putPixelCallback is not provided to Raytracing Manager");
      };
    this.shapeData =
      props.shapeData && props.shapeData.length ? props.shapeData : [];
    if (!this.shapeData.length) {
      console.warn("shapeData is not provided to Raytracing Manager");
    }
    this.lightData =
      props.lightData && props.lightData.length ? props.lightData : [];
    if (!this.lightData.length) {
      console.warn("lightData is not provided to Raytracing Manager");
    }
    this.noIntersectionColor = props.noIntersectionColor || {
      r: 0,
      g: 0,
      b: 0,
    };
    if (!props.noIntersectionColor) {
      console.warn(
        "noIntersectionColor is not provided to Raytracing Manager. Default Value of {r:0, g:0, b:0} is used"
      );
    }
    this.#workers = null;
    this.#pixelBuffer = [];
    this.#pixelBufferOffset = (this.canvasHeight * this.canvasWidth) / 100;
    this.#progressiveRenderingStep = 10;
    this.#animationFrameId = null;
    this.#cameraAngle = 0;
  }

  #spawnWorkers(numCores) {
    const blob = new Blob([workerSource], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    this.#workers = Array.from(
      { length: numCores },
      () =>
        new Worker(workerUrl, {
          type: "module",
        })
    );
  }

  #destroyWorkers() {
    if (this.#workers) {
      this.#workers.forEach((worker) => worker.terminate());
    }
    this.#workers = null;
  }

  async #startRaytracing(allPixels) {
    const numCores = navigator.hardwareConcurrency || 4;
    if (!this.#workers) {
      this.#spawnWorkers(numCores);
    }

    const ratioW = this.#viewportWidth / this.canvasWidth;
    const ratioH = this.#viewportHeight / this.canvasHeight;

    // Divide pixels into chunks for each worker
    const chunkSize = Math.ceil(allPixels.length / numCores);
    const pixelChunks = Array.from({ length: numCores }, (_, i) =>
      allPixels.slice(i * chunkSize, (i + 1) * chunkSize)
    );

    // Send chunks to workers in parallel
    const results = await Promise.all(
      pixelChunks.map((chunk, i) => {
        return new Promise((resolve, reject) => {
          const worker = this.#workers[i];
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
            cameraAngle: this.#cameraAngle,
          });
        });
      })
    );

    // Flatten and render pixels
    results.flat().forEach((pixelData) => {
      this.#pixelBuffer.push(pixelData);
      let lengthOfPixelBuffer = this.#pixelBuffer.length;
      if (lengthOfPixelBuffer >= this.#pixelBufferOffset) {
        this.putPixelCallback(this.#pixelBuffer.slice(0, lengthOfPixelBuffer));
        this.#pixelBuffer = this.#pixelBuffer.slice(lengthOfPixelBuffer);
      }
    });
  }

  #getPixelsForPass(startX, endX, startY, endY, pixelOffsets, pass, step) {
    const pixels = [];
    const { x: xOffset, y: yOffset } = pixelOffsets[pass];
    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        if (
          (x - startX) % step === xOffset &&
          (y - startY) % step === yOffset
        ) {
          pixels.push({ x, y });
        }
      }
    }
    return pixels;
  }

  #generatePixelOffsets(step) {
    // Generate all offset combinations once
    const pixelOffsets = [];
    for (let y = 0; y < step; y++) {
      for (let x = 0; x < step; x++) {
        pixelOffsets.push({ x, y });
      }
    }
    return pixelOffsets;
  }

  lookAt(angle) {
    this.stop();
    this.#cameraAngle += angle;
    this.start();
  }

  start() {
    this.#pixelBuffer = [];
    return new Promise((resolve) => {
      const startX = -(this.canvasWidth / 2);
      const endX = this.canvasWidth / 2;
      const startY = -(this.canvasHeight / 2);
      const endY = this.canvasHeight / 2;

      let currentPass = 0;
      let totalPasses =
        this.#progressiveRenderingStep * this.#progressiveRenderingStep;
      const passes = Array.from({ length: totalPasses }, (_, i) => i);
      passes.sort(() => Math.random() - 0.5); // shuffle
      const pixelOffsets = this.#generatePixelOffsets(
        this.#progressiveRenderingStep
      );
      const _renderPass = async () => {
        if (currentPass >= totalPasses) {
          this.#destroyWorkers();
          this.putPixelCallback(this.#pixelBuffer.slice(0));
          resolve();
          return;
        }
        const pass = passes[currentPass];
        const pixels = this.#getPixelsForPass(
          startX,
          endX,
          startY,
          endY,
          pixelOffsets,
          pass,
          this.#progressiveRenderingStep
        );
        await this.#startRaytracing(pixels);

        currentPass++;
        this.#animationFrameId = requestAnimationFrame(_renderPass);
      };
      _renderPass();
    });
  }

  stop() {
    window.cancelAnimationFrame(this.#animationFrameId);
    this.#animationFrameId = null;
    this.#destroyWorkers();
  }
}

export { RaytracingManager };
