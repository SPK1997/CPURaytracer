class CanvasManager {
  #ctx;
  #canvas;
  #imageData;
  #abortController;
  constructor({ target, height, width }) {
    this.#canvas = null;
    this.#ctx = null;
    this.height = height;
    this.width = width;
    this.target = target;
    this.#imageData = null;
    this.#abortController = null;
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

  enableMouseMovements(props) {
    if (!this.#canvas) {
      return;
    }
    this.#abortController = new AbortController();
    this.#canvas.addEventListener(
      "pointerdown",
      (e) => {
        props.pointerdown(e);
      },
      {
        signal: this.#abortController.signal,
      }
    );
    this.#canvas.addEventListener(
      "pointermove",
      (e) => {
        props.pointermove(e);
      },
      {
        signal: this.#abortController.signal,
      }
    );
    this.#canvas.addEventListener(
      "pointerup",
      (e) => {
        props.pointerup(e);
      },
      {
        signal: this.#abortController.signal,
      }
    );
  }

  disableMouseMovements() {
    this.#abortController.abort();
    this.#abortController = null;
  }

  putPixel(listOfPixels) {
    for (let { x, y, color } of listOfPixels) {
      let { x: px, y: py } = this.#mapCoordinates(x, y);
      let { r, g, b } = color;
      const index = (py * this.width + px) * 4;
      this.#imageData.data[index] = r; // R
      this.#imageData.data[index + 1] = g; // G
      this.#imageData.data[index + 2] = b; // B
      this.#imageData.data[index + 3] = 255; // A (opacity)
    }
    if (listOfPixels.length) {
      this.#ctx.putImageData(this.#imageData, 0, 0);
    }
  }

  clearCanvas() {
    if (this.#canvas) {
      this.#ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  destroyCanvas() {
    if (this.#canvas) {
      this.#canvas.remove();
      this.disableMouseMovements();
    }
    this.#canvas = null;
  }

  #mapCoordinates(x, y) {
    return {
      x: this.width / 2 + x,
      y: this.height / 2 - y,
    };
  }
}

export { CanvasManager };
