// canvas.service.ts
import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

@Injectable({ providedIn: 'root' })
export class CanvasService {
  private canvas: fabric.Canvas | null = null;

  setCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  getCanvas(): fabric.Canvas | null {
    return this.canvas;
  }

 
}
