class CanvasManager {
  #ctx;
  #canvas;
  #imageData;
  constructor({ target, height, width, bgColor }) {
    this.#canvas = null;
    this.#ctx = null;
    this.height = height;
    this.width = width;
    this.target = target;
    this.bgColor = bgColor;
    this.#imageData = null;
  }

  changeDimensions(height, width) {
    this.height = height ?? this.height;
    this.width = width ?? this.width;
  }

  changeTarget(target) {
    this.target = target;
  }

  changeBgColor(bgColor) {
    this.bgColor = bgColor;
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
    this.#canvas.style.backgroundColor = this.#getCSSColorStringInRGBFormat(
      this.bgColor
    );
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
    this.#imageData.data[index + 3] = 255; // A (fully opaque)
  }

  clearCanvas() {
    if (this.#canvas) {
      this.#ctx.clearReact(0, 0, this.width, this.height);
    }
  }

  destroyCanvas() {
    if (this.#canvas) {
      this.#canvas.remove();
    }
    this.#canvas = null;
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
