import { EventsManager } from "./EventsManager.js";

class CanvasManager {
  #ctx;
  #canvas;
  #imageData;
  #eventsManager;
  constructor({ target, height, width }) {
    this.#canvas = null;
    this.#ctx = null;
    this.height = height;
    this.width = width;
    this.target = target;
    this.#imageData = null;
    this.#eventsManager = new EventsManager();
  }

  changeDimensions(height, width) {
    this.height = this.height;
    this.width = this.width;
  }

  changeTarget(target) {
    this.target = target;
  }

  showCanvas() {
    this.#canvas = document.createElement("canvas");
    this.#ctx = this.#canvas.getContext("2d");
    this.target.append(this.#canvas);
    this.#canvas.height = this.height;
    this.#canvas.width = this.width;
    this.#canvas.style.height = this.height + "px";
    this.#canvas.style.width = this.width + "px";
    this.#imageData = this.#ctx.getImageData(0, 0, this.width, this.height);
  }

  render() {
    this.#ctx.putImageData(this.#imageData, 0, 0);
  }

  putPixel({ x, y, color }) {
    let { x: px, y: py } = this.#mapCoordinates(x, y);
    let { r, g, b } = color;
    const index = (py * this.width + px) * 4;
    this.#imageData.data[index] = r; // R
    this.#imageData.data[index + 1] = g; // G
    this.#imageData.data[index + 2] = b; // B
    this.#imageData.data[index + 3] = 255; // A (opacity)
  }

  clearCanvas() {
    if (this.#canvas) {
      this.#ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  destroyCanvas() {
    if (this.#canvas) {
      this.#canvas.remove();
    }
    this.#canvas = null;
    this.disableMouseMovements();
  }

  enableMouseMovements({ onpointerdownCb, onpointerupCb, onpointermoveCb }) {
    if (!this.#canvas) {
      console.warn(
        "Use showCanvas() method of CanvasManager to create canvas first"
      );
      return;
    }
    this.#eventsManager.subscribeEvent({
      element: this.#canvas,
      eventName: "pointerdown",
      callback: (e) => {
        onpointerdownCb(e);
      },
      signalName: "PointerDownEvent",
    });
    this.#eventsManager.subscribeEvent({
      element: this.#canvas,
      eventName: "pointerup",
      callback: (e) => {
        onpointerupCb(e);
      },
      signalName: "PointerUpEvent",
    });
    this.#eventsManager.subscribeEvent({
      element: this.#canvas,
      eventName: "pointermove",
      callback: (e) => {
        onpointermoveCb(e);
      },
      signalName: "PointerMoveEvent",
    });
  }

  disableMouseMovements() {
    this.#eventsManager.unsubScribeEvent("PointerDownEvent");
    this.#eventsManager.unsubScribeEvent("PointerUpEvent");
    this.#eventsManager.unsubScribeEvent("PointerMoveEvent");
  }

  #mapCoordinates(x, y) {
    return {
      x: this.width / 2 + x,
      y: this.height / 2 - y,
    };
  }

  #getCSSColorStringInRGBFormat({ r, g, b }) {
    return `rgb(${r ?? 255},${g ?? 255},${b ?? 255})`;
  }
}

export { CanvasManager };
