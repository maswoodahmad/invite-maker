import { Injectable } from '@angular/core';
import * as fabric  from 'fabric';

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {
  private canvasMap = new Map<string, fabric.Canvas>();
  private activeCanvasId: string | null = null;
  private focusState: 'object' | 'full' = 'object';

  /**
   * Registers a canvas instance under a unique page ID.
   */
  registerCanvas(pageId: string, canvas: fabric.Canvas): void {
    this.canvasMap.set(pageId, canvas);
  }

  /**
   * Removes canvas when no longer needed.
   */
  unregisterCanvas(pageId: string): void {
    this.canvasMap.delete(pageId);
    if (this.activeCanvasId === pageId) {
      this.activeCanvasId = null;
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
      this.activeCanvasId = pageId;
    }
  }

  /**
   * Get the currently active canvas
   */
  getActiveCanvas(): fabric.Canvas | null {
    return this.activeCanvasId ? this.canvasMap.get(this.activeCanvasId) || null : null;
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
}
