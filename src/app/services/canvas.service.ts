// canvas.service.ts
import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
import { CustomFabricObject, PageNumberPosition } from '../interface/interface';



@Injectable({ providedIn: 'root' })
export class CanvasService {
  private canvas: fabric.Canvas | null = null;
  private pageNumberPosition: PageNumberPosition = 'bottom-right';

  setCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  getCanvas(): fabric.Canvas | null {
    return this.canvas;
  }

  lastPosition = { x: 100, y: 100 };
  offsetStep = 30;

  getPageNumberPosition():PageNumberPosition{
    return this.pageNumberPosition;
  }

 



  getAndUpdateObjectPosition(canvas: fabric.Canvas): { x: number, y: number } {
    const current = { ...this.lastPosition };
    this.lastPosition.x += this.offsetStep;
    this.lastPosition.y += this.offsetStep;


    if (
      this.lastPosition.x > canvas.getWidth() - 200 ||
      this.lastPosition.y > canvas.getHeight() - 200
    ) {

      this.lastPosition = { x: 100, y: 100 };
    }

    return current;
  }



  setPageNumberPosition(position: PageNumberPosition) {
    if (!this.canvas) return;
    this.pageNumberPosition = position;
    this.addDynamicPageNumbers(this.canvas, this.canvas.getWidth(), this.canvas.getHeight());
  }


  addDynamicPageNumbers(
    canvas: fabric.Canvas,
    pageWidth: number,
    pageHeight: number
  ) {
    const totalPagesVertical = Math.floor(canvas.getHeight() / pageHeight);
    const totalPagesHorizontal = Math.floor(canvas.getWidth() / pageWidth);

    // Remove previous page numbers
    canvas.getObjects().forEach((obj) => {
      const customObj = obj as CustomFabricObject;
      if (customObj.data?.isPageNumber) {
        canvas.remove(customObj);
      }
    });

    let pageNum = 1;

    for (let y = 0; y < totalPagesVertical; y++) {
      for (let x = 0; x < totalPagesHorizontal; x++) {
        const { left, top, originX } = this.getPageNumberCoords(x, y, pageWidth, pageHeight);

        const pageText = new fabric.Text(`Page ${pageNum++}`, {
          fontSize: 24,
          fill: '#666',
          selectable: false,
          evented: false,
          left,
          top,
          originX: 'center',  // fallback to 'center'
          originY: 'bottom',
        });

        // Extend with custom data
        (pageText as CustomFabricObject).data = {
          isPageNumber: true,
        };

        canvas.add(pageText);
      }
    }

    canvas.requestRenderAll();
  }

  getPageNumberCoords(pageX: number, pageY: number, pageWidth: number, pageHeight: number) {
    const margin = 40;
    const baseLeft = pageX * pageWidth;
    const baseTop = (pageY + 1) * pageHeight;

    switch (this.pageNumberPosition) {
      case 'bottom-left':
        return { left: baseLeft + margin, top: baseTop - margin, originX: 'left' };
      case 'bottom-center':
        return { left: baseLeft + pageWidth / 2, top: baseTop - margin, originX: 'center' };
      case 'bottom-right':
      default:
        return { left: baseLeft + pageWidth - margin, top: baseTop - margin, originX: 'right' };
    }
  }

}
