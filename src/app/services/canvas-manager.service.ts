import { Injectable } from '@angular/core';
import * as fabric from 'fabric'

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {

  private canvases: fabric.Canvas[] = [];
  private activeIndex = 0;
  private focusState: 'object' | 'full' = 'object';

  registerCanvas(canvas: fabric.Canvas) {
    this.canvases.push(canvas);
  }

  getAllCanvases() {
    return this.canvases;
  }

  setActiveCanvas(canvas: fabric.Canvas) {
    this.activeIndex = this.canvases.indexOf(canvas);
  }

  getActiveCanvas() {
    return this.canvases[this.activeIndex];
  }

  setCanvasFocusState(state: 'object' | 'full') {
    this.focusState = state;
  }

  getCanvasFocusState() {
    return this.focusState;
  }

  focusNextCanvas() {
    if (this.activeIndex < this.canvases.length - 1) {
      this.activeIndex++;
      this.setFocusTo(this.canvases[this.activeIndex]);
    }
  }

  focusPreviousCanvas() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
      this.setFocusTo(this.canvases[this.activeIndex]);
    }
  }

  private setFocusTo(canvas: fabric.Canvas) {
    this.setActiveCanvas(canvas);
    canvas.wrapperEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.setCanvasFocusState('full'); // since whole canvas will be selected again
  }
}
