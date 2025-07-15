import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

@Injectable({
  providedIn: 'root'
})
export class UndoRedoService {

  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private canvas!: fabric.Canvas;

  private debounceTimer: any;

  // Local Storage keys (can be made project-specific if needed)
  private readonly LS_KEY_UNDO = 'inviteapp-undo-stack';
  private readonly LS_KEY_REDO = 'inviteapp-redo-stack';

  init(canvas: fabric.Canvas) {
    this.canvas = canvas;

    this.loadLocalStorage();

    if (this.undoStack.length === 0) {
      this.saveState();
    }

  }

  loadLocalStorage() {
    const undo = localStorage.getItem('inviteapp-undo-stack');
    const redo = localStorage.getItem('inviteapp-redo-stack');

    this.undoStack = undo ? JSON.parse(undo) : [];
    this.redoStack = redo ? JSON.parse(redo) : [];

    if (this.undoStack.length > 0) {
      this.loadState(this.undoStack[this.undoStack.length - 1]);
    }

  }
  loadState(state: string) {
    if (!this.canvas) return;

    this.canvas.loadFromJSON(state, () => {
      this.canvas.renderAll();
    });
  }


  saveState() {
    if (!this.canvas) return;

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const json = this.canvas.toJSON();
      this.undoStack.push(JSON.stringify(json));
      this.redoStack = [];
      this.persistStacks();
    }, 250); // debounce delay
  }

  undo() {
    if (this.undoStack.length < 2) return;

    const current = this.undoStack.pop()!;
    this.redoStack.push(current);

    const prev = this.undoStack[this.undoStack.length - 1];
    this.loadState(prev);
    this.persistStacks();
  }

  redo() {
    if (this.redoStack.length === 0) return;

    const state = this.redoStack.pop()!;
    this.undoStack.push(state);

    this.loadState(state);
    this.persistStacks();
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    localStorage.removeItem(this.LS_KEY_UNDO);
    localStorage.removeItem(this.LS_KEY_REDO);
  }


  private persistStacks() {
    localStorage.setItem(this.LS_KEY_UNDO, JSON.stringify(this.undoStack));
    localStorage.setItem(this.LS_KEY_REDO, JSON.stringify(this.redoStack));
  }

  constructor() { }
}
