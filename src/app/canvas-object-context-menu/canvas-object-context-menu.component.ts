// canvas-object-context-menu.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-canvas-object-context-menu',
  standalone: true,
  templateUrl: './canvas-object-context-menu.component.html',
  styleUrls: ['./canvas-object-context-menu.component.scss'],
  imports: [CommonModule]
})
export class CanvasObjectContextMenuComponent {
  @Input() visible: boolean = false;
  @Input() position: { top: number; left: number } = { top: 0, left: 0 };

  @Output() copy = new EventEmitter<void>();
  @Output() paste = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() align = new EventEmitter<void>();
  @Output() comment = new EventEmitter<void>();
  @Output() link = new EventEmitter<void>();
  @Output() lock = new EventEmitter<void>();
  @Output() onUnlock = new EventEmitter<void>();
  @Output() setBackground = new EventEmitter<void>();
  @Output() applyColors = new EventEmitter<void>();
  @Output() info = new EventEmitter<void>();
  @Output() onSendBackward = new EventEmitter<void>();
  @Output() onSendToBack = new EventEmitter<void>();
  @Output() onBringForward = new EventEmitter<void>();
  @Output() onBringToFront = new EventEmitter<void>();

  emitAndClose(event: EventEmitter<void>): void {
    event.emit();
    this.visible = false;
  }
}



