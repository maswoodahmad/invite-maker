import { Injectable } from '@angular/core';
import * as fabric  from 'fabric';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CanvasManagerService {
  private canvasMap = new Map<string, fabric.Canvas>();
  private activeCanvasId$ = new BehaviorSubject<string | null>(null);
  private focusState: 'object' | 'full' = 'object';
  private activeCanvas: fabric.Canvas | null = null;

  setActiveCanvas(canvas: fabric.Canvas) {
    this.activeCanvas = canvas;
  }

  constructor() {
    this.patchFabricToObject();
  }

  private patchFabricToObject() {
    const originalToObject = fabric.FabricObject.prototype.toObject;

    fabric.FabricObject.prototype.toObject = function (
      propertiesToInclude: string[] = []
    ) {
      return originalToObject.call(this, [
        'id',
        'name',
        ...propertiesToInclude,
      ]);
    };
  }

  /**
   * Registers a canvas instance under a unique page ID.
   */
  registerCanvas(id: string, canvas: fabric.Canvas): void {
    this.canvasMap.set(id, canvas);
    if (!this.activeCanvasId$.value) {
      this.activeCanvasId$.next(id); // auto-activate first one
    }
  }
  /**
   * Removes canvas when no longer needed.
   */
  unregisterCanvas(pageId: string): void {
    this.canvasMap.delete(pageId);
    if (this.activeCanvasId$.value === pageId) {
      this.activeCanvasId$.next(null);
    }
  }

  /**
   * Get all canvas instances
   */
  getAllCanvases(): fabric.Canvas[] {
    return Array.from(this.canvasMap.values());
  }

  /**
   * Get canvas by its unique page ID
   */
  getCanvasById(pageId: string): fabric.Canvas | undefined {
    return this.canvasMap.get(pageId);
  }

  /**
   * Mark a canvas as active using page ID
   */
  setActiveCanvasById(pageId: string): void {
    if (this.canvasMap.has(pageId)) {
      this.activeCanvasId$.next(pageId);
    }
  }

  /**
   * Get the currently active canvas
   */
  getActiveCanvas(): fabric.Canvas | null {
    return this.activeCanvasId$.value
      ? this.canvasMap.get(this.activeCanvasId$.value) || null
      : null;
  }

  getActiveCanvasId$() {
    return this.activeCanvasId$.asObservable();
  }

  /**
   * Set canvas focus mode (used for UI state)
   */
  setCanvasFocusState(state: 'object' | 'full') {
    this.focusState = state;
  }

  /**
   * Get current canvas focus mode
   */
  getCanvasFocusState(): 'object' | 'full' {
    return this.focusState;
  }

  /**
   * Scroll canvas into view and optionally mark it active
   */
  scrollToCanvas(pageId: string, makeActive = true) {
    const canvas = this.canvasMap.get(pageId);
    if (canvas) {
      canvas.wrapperEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (makeActive) {
        this.setActiveCanvasById(pageId);
        this.setCanvasFocusState('full');
      }
    }
  }

  disposeAll(): void {
    this.canvasMap.forEach((canvas) => {
      canvas.clear();
      canvas.dispose();
    });
    this.canvasMap.clear();
  }
}
function toSignal(arg0: Observable<string | null>, arg1: { initialValue: null; }) {
  throw new Error('Function not implemented.');
}

