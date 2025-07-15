import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DesignSize } from '../interface/interface';

@Component({
  selector: 'app-project-toolbar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './project-toolbar.component.html',
})
export class ProjectToolbarComponent {
  @Input() projectName = 'Untitled Project';
  @Input() lastSaved: Date = new Date();

  @Output() save = new EventEmitter<void>();
  @Output() rename = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() undoAction = new EventEmitter<void>();
  @Output() redoAction = new EventEmitter<void>();


   sizes: DesignSize[] = [
    { name: 'A4', width: 794, height: 1123, label: 'A4 (210mm × 297mm)' },
    { name: 'Card', width: 600, height: 350, label: 'Business Card (3.5in × 2in)' },
    { name: 'Poster', width: 1240, height: 1754, label: 'Poster A3 (297mm × 420mm)' },
    { name: 'Square', width: 1000, height: 1000, label: 'Square (1000px × 1000px)' },
    { name: 'Custom', width: 1000, height: 1000, label: 'Custom Size' },  // 🆕
  ];

  saveProject() {
    this.save.emit();
  }

  renameProject() {
    this.rename.emit();
  }

  deleteProject() {
    this.delete.emit();
  }

  duplicateProject() {
    this.duplicate.emit();
  }

  undo() {
    this.undoAction.emit();
  }

  redo() {
    this.redoAction.emit();
  }

  toggleShareMenu() {
    // Implement dropdown if needed
  }
  applyCustomSize(){}
}
