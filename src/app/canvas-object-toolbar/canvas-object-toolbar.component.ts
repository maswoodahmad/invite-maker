import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as fabric from 'fabric';
import { CanvasObjectContextMenuComponent } from '../canvas-object-context-menu/canvas-object-context-menu.component';

@Component({
  selector: 'app-canvas-object-toolbar',
  imports: [CommonModule],
  templateUrl: './canvas-object-toolbar.component.html',
  styleUrl: './canvas-object-toolbar.component.scss'
})
export class CanvasObjectToolbarComponent {
  @Input() object: fabric.Object | null = null;

@Output() onDelete = new EventEmitter<void>();
@Output() onDuplicate = new EventEmitter<void>();
@Output() onLock = new EventEmitter<void>();
@Output() onUnlock = new EventEmitter<void>();
@Output() onContextMenu = new EventEmitter<MouseEvent>();
@Output() onCopy = new EventEmitter<void>();
@Output() onPaste = new EventEmitter<void>();
@Output() onAlign = new EventEmitter<void>();
@Output() onComment = new EventEmitter<void>();
@Output() onLink = new EventEmitter<void>();
@Output() onSetBackground = new EventEmitter<void>();
@Output() onApplyColors = new EventEmitter<void>();
@Output() onInfo = new EventEmitter<void>();
@Output() onBringToFront = new EventEmitter<void>();
@Output() onBringForward = new EventEmitter<void>();
@Output() onSendToBack = new EventEmitter<void>();
@Output() onSendBackward = new EventEmitter<void>();




contextMenuVisible = false;
contextMenuPosition = { top: 0, left: 0 };

isLocked(obj: fabric.Object | null | undefined): boolean {

  const isLocked =  !!obj &&
  obj.lockMovementX &&
  obj.lockMovementY &&
  obj.lockScalingX &&
  obj.lockScalingY &&
  obj.lockRotation;
  if(isLocked) {
    this.contextMenuVisible = false;
  }

  return isLocked;


}



  toggleContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuVisible = !this.contextMenuVisible
    this.contextMenuPosition = {
      top: event.clientY,
      left: event.clientX
    };
  }



}

