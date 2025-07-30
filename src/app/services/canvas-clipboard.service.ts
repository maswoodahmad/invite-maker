import { CanvasManagerService } from './canvas-manager.service';
import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
import { CanvasService } from './canvas.service';
import { CustomCanvasObject, CustomFabricObject } from '../interface/interface';

@Injectable({ providedIn: 'root' })
export class CanvasClipboardService {
  private clipboard: fabric.Object | null = null;

  constructor(private canvasManagerService : CanvasManagerService) {}

  copy() {

    const activeCanvas = this.canvasManagerService.getActiveCanvas();
    const activeObject = activeCanvas?.getActiveObject() as CustomFabricObject;
    if (!activeObject) return;

    activeObject.clone().then((cloned: fabric.Object) => {
      this.clipboard = cloned;
    });

    console.log(this.clipboard);
  }

  cut() {


    const canvas =  this.canvasManagerService.getActiveCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObject();

    if (!active) return;

    if (active.type === 'activeSelection') {
      const group = active as fabric.ActiveSelection;

      const objects = group.getObjects();
      const clones: fabric.Object[] = [];

      // Clone each object
      objects.forEach((obj) => {
        obj.clone().then((cloned) => {
          clones.push(cloned);
        });
      });

      // Remove from canvas
      group.forEachObject(obj => canvas?.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();

      // Create clipboard group
      this.clipboard = new fabric.ActiveSelection(clones, { canvas });
    } else {
      active.clone().then((cloned) => {
        this.clipboard = cloned;
      });
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }

  paste2(canvas: fabric.Canvas) {
    if (!this.clipboard) return;

    this.clipboard.clone().then((clonedObj: fabric.Object) => {
      canvas.discardActiveObject();

      if (clonedObj.type === 'activeSelection') {
        // When pasting a group of objects
        clonedObj = clonedObj as fabric.ActiveSelection;
        clonedObj.canvas = canvas;

        (this.clipboard as fabric.ActiveSelection).forEachObject(obj => {
          obj.set({
            left: (obj.left || 0) + 20,
            top: (obj.top || 0) + 20,
            evented: true,
          });
          canvas.add(obj);
        });

        const selection = new fabric.ActiveSelection(clonedObj.toObject(), {
          canvas: canvas,
        });

        canvas.setActiveObject(selection);
      } else {
        // Single object paste
        clonedObj.set({
          left: (clonedObj.left || 0) + 20,
          top: (clonedObj.top || 0) + 20,
          evented: true,
        });
        canvas.add(clonedObj);
        canvas.setActiveObject(clonedObj);
      }

      canvas.requestRenderAll();
    });
  }

  paste() {
    const canvas = this.canvasManagerService.getActiveCanvas();
    if (!canvas) return;

    this.clipboard?.clone().then((cloned: fabric.Object | fabric.Group) => {
      const offset = 20;

      if (cloned instanceof fabric.Group) {
        const items = cloned.getObjects().map(obj => {
          obj.set({
            left: (obj.left ?? 0) + offset,
            top: (obj.top ?? 0) + offset,
            evented: true,
            selectable: true,
          });
          return obj;
        });

        // Remove the group wrapper — DO NOT add cloned directly
        // Add objects individually
        canvas.add(...items);

        // Wrap into ActiveSelection for user interaction
        const selection = new fabric.ActiveSelection(items, { canvas });
        canvas.setActiveObject(selection);
      } else {
        // Single object paste
        cloned.set({
          left: (cloned.left ?? 0) + offset,
          top: (cloned.top ?? 0) + offset,
          evented: true,
          selectable: true,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
      }

      canvas.requestRenderAll();
    });
  }


  deleteSelected() {

    const canvas = this.canvasManagerService.getActiveCanvas();

    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;

    if (active.type === 'activeSelection') {
      (active as fabric.ActiveSelection).forEachObject((obj) => {
        canvas.remove(obj);
      });
    } else {
      canvas.remove(active);
    }

    canvas.discardActiveObject();
    canvas.renderAll();
  }
}
