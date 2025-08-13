import { CanvasManagerService } from './canvas-manager.service';
import { CanvasLayer } from './../interface/interface';
import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
import { HistoryStack } from '../interface/interface';
@Injectable({ providedIn: 'root' })
export class UndoRedoService {
  constructor(private canvasManagerService: CanvasManagerService) {}

  private historyMap = new Map<string, HistoryStack>();
  private readonly MAX_HISTORY = 50; // prevent memory blowup
  isRestoringState = false;

  initCanvasHistory(canvasId: string, initialState: any) {
    this.historyMap.set(canvasId, {
      undoStack: [initialState],
      redoStack: [],
    });
  }

  saveState(canvasId: string, canvas: fabric.Canvas) {
    if (this.isRestoringState) return; // do nothing while restoring

    let history = this.historyMap.get(canvasId);
    if (!history) {
      history = { undoStack: [], redoStack: [] };
      this.historyMap.set(canvasId, history);
    }

    history.redoStack = []; // branching, so clear redo
    history.undoStack.push(canvas.toJSON());

    // Enforce max stack size
    if (history.undoStack.length > this.MAX_HISTORY) {
      history.undoStack.shift();
    }
  }

  undo(canvasId: string, canvas: fabric.Canvas) {
    const history = this.historyMap.get(canvasId);
    if (!history || history.undoStack.length < 2) return;

    const currentState = history.undoStack.pop();
    if (currentState) history.redoStack.push(currentState);

    const prevState = history.undoStack[history.undoStack.length - 1];
    this.restoreState(canvasId, canvas, prevState);
  }

  redo(canvasId: string, canvas: fabric.Canvas) {
    const history = this.historyMap.get(canvasId);
    if (!history || history.redoStack.length < 1) return;

    const nextState = history.redoStack.pop();
    if (!nextState) return;

    history.undoStack.push(nextState);
    this.restoreState(canvasId, canvas, nextState);
  }

  private restoreState(canvasId: string, canvas: fabric.Canvas, state: any) {
    this.isRestoringState = true;

    // Freeze rendering during load to avoid flashes
    canvas.renderOnAddRemove = false;

    // Ensure background color is already there before loading objects
    if (!canvas.backgroundColor) {
      canvas.backgroundColor = '#ffffff';
    }

    // Load JSON without intermediate rendering
    canvas.loadFromJSON(state, () => {
      this.setLastObjectActive(canvas);

      this.canvasManagerService.setActiveCanvas(canvas);
      this.canvasManagerService.setCanvasFocusState('full');

      // Resume rendering & force paint
      canvas.renderOnAddRemove = true;
      canvas.requestRenderAll();

      setTimeout(() => {
        this.isRestoringState = false;
      }, 0);
    });
  }

  private setLastObjectActive(canvas: fabric.Canvas) {
    const objects = canvas.getObjects();
    if (objects.length) {
      const lastObj = objects[objects.length - 1];
      canvas.setActiveObject(lastObj);
    }
  }
}
