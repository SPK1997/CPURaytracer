import { Pixel, CanvasManagerProps } from "./TypesAndInterfaces";

export declare class CanvasManager {
  constructor(params: CanvasManagerProps);

  height: number;
  width: number;
  target: HTMLElement;

  changeDimensions(height: number, width: number): void;

  changeTarget(target: HTMLElement): void;

  showCanvas(): void;

  putPixel(pixel: Pixel[]): void;

  clearCanvas(): void;

  destroyCanvas(): void;
}
