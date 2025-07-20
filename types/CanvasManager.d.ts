import { Pixel } from "./TypesAndInterfaces.ts";

export declare class CanvasManager {
  constructor(params: { target: HTMLElement; height: number; width: number });

  height: number;
  width: number;
  target: HTMLElement;

  changeDimensions(height: number, width: number): void;

  changeTarget(target: HTMLElement): void;

  showCanvas(): void;

  render(): void;

  putPixel(pixel: Pixel): void;

  clearCanvas(): void;

  destroyCanvas(): void;
}
