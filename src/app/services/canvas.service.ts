import { Injectable, signal } from '@angular/core';
import * as fabric from 'fabric';
import {
  CanvasLayer,
  CustomFabricObject,
  PageNumberPosition
} from '../interface/interface';

@Injectable({ providedIn: 'root' })
export class CanvasService {
  private canvasSignal = signal<fabric.Canvas | null>(null);
  private pageNumberPosition: PageNumberPosition = 'bottom-right';

  readonly layersSignal = signal<CanvasLayer[]>([]);

  lastPosition = { x: 100, y: 100 };
  offsetStep = 30;

  setCanvas(canvas: fabric.Canvas) {
    this.canvasSignal.set(canvas);

    // Setup event listeners for layer tracking
    canvas.on('object:added', () => this.refreshLayers());
    canvas.on('object:removed', () => this.refreshLayers());
    canvas.on('object:modified', () => this.refreshLayers());

    // Initial fetch
    this.refreshLayers();
  }

  getCanvas(): fabric.Canvas | null {
    return this.canvasSignal();
  }

  getPageNumberPosition(): PageNumberPosition {
    return this.pageNumberPosition;
  }

  getAndUpdateObjectPosition(canvas: fabric.Canvas): { x: number; y: number } {
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
    const canvas = this.getCanvas();
    if (!canvas) return;

    this.pageNumberPosition = position;
    this.addDynamicPageNumbers(canvas, canvas.getWidth(), canvas.getHeight());
  }

  addDynamicPageNumbers(canvas: fabric.Canvas, pageWidth: number, pageHeight: number) {
    const totalPagesVertical = Math.floor(canvas.getHeight() / pageHeight);
    const totalPagesHorizontal = Math.floor(canvas.getWidth() / pageWidth);

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
          originX: 'center',
          originY: 'bottom',
        });

        (pageText as CustomFabricObject).data = { isPageNumber: true };
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

  async getLayers(): Promise<CanvasLayer[]> {
    const canvas = this.getCanvas();
    if (!canvas) return [];

    const customObjects = canvas.getObjects() as CustomFabricObject[];

    const layers = await Promise.all(
      customObjects.map(async (obj, index) => ({
        id: obj.id || String(index),
        name: obj.name,
        object: obj,
        hidden: !obj.visible,
        locked: obj.lockMovementX && obj.lockMovementY,
        preview: await this.generatePreview(obj),
      }))
    );

    return layers;
  }

  async refreshLayers() {
    const layers = await this.getLayers();
    this.layersSignal.set(layers);
  }

  selectObject(obj: CustomFabricObject) {
    this.getCanvas()?.setActiveObject(obj);
    this.getCanvas()?.renderAll();
    this.unlockObject(obj)
  }

  toggleVisibility(obj: fabric.Object) {
    obj.visible = !obj.visible;
    this.getCanvas()?.renderAll();
    this.refreshLayers(); // Update visibility in layers
  }

  toggleLock(obj: fabric.Object):boolean {
    const isLocked = obj.lockMovementX && obj.lockMovementY;

    if (isLocked) {
      this.unlockObject(obj);
      return !isLocked;

    }

    obj.selectable = isLocked;
    obj.evented = !isLocked;
    obj.lockMovementX = !isLocked;
    obj.lockMovementY = !isLocked;

    // ✅ Resizing
    obj.lockScalingX = !isLocked;
    obj.lockScalingY = !isLocked;
    obj.hasControls = !isLocked;

    this.getCanvas()?.renderAll();
    this.refreshLayers(); // Update lock state in layers
    return !isLocked;
  }




  generatePreview(obj: fabric.Object, size = 96): Promise<string> {
    return new Promise((resolve) => {
      const tempCanvasElement = document.createElement('canvas');
      const tempCanvas = new fabric.StaticCanvas(tempCanvasElement, {
        width: size,
        height: size,
        backgroundColor: 'transparent', // or 'black' or 'white'
      });

      obj.clone().then((cloned: fabric.Object) => {
        // Optional padding
        const padding = 8;
        const maxWidth = size - padding * 2;
        const maxHeight = size - padding * 2;

        const bounds = cloned.getBoundingRect();

        // Calculate scale to fit within padded square
        const scale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);

        // Apply scale
        cloned.scale(cloned.scaleX! * scale);

        // Center the object using originX/Y
        cloned.set({
          originX: 'center',
          originY: 'center',
          left: size / 2,
          top: size / 2,
        });

        tempCanvas.add(cloned);
        tempCanvas.renderAll();

        const dataUrl = tempCanvas.toDataURL({
          multiplier: 1,
          format: 'png',
        });

        resolve(dataUrl);
      });
    });
  }



  initCanvas(canvas: fabric.Canvas) {
    this.canvasSignal.set(canvas);

    canvas.on('object:added', () => this.refreshLayers());
    canvas.on('object:removed', () => this.refreshLayers());
    canvas.on('object:modified', () => this.refreshLayers());
  }





  unlockObject(obj: fabric.Object):boolean {
  const isLocked = obj.lockMovementX && obj.lockMovementY;



    obj.selectable = true;
    obj.evented = true;

    obj.hasControls = true;
    obj.hasBorders = true;

    obj.lockMovementX = false;
    obj.lockMovementY = false;
    obj.lockScalingX = false;
    obj.lockScalingY = false;
    obj.lockRotation = false;


  this.getCanvas()?.renderAll();
  this.refreshLayers(); // Update lock state in layers
  return !isLocked;
}


}

