import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-pages-toolbar',
  imports: [],
  templateUrl: './pages-toolbar.component.html',
  styleUrl: './pages-toolbar.component.scss'
})
export class PagesToolbarComponent {
  constructor() { }

  // page-toolbar.component.ts
  @Output() addPage = new EventEmitter<void>();
  @Output() deletePage = new EventEmitter<void>();
  @Output() duplicatePage = new EventEmitter<void>();
  @Output() renamePage = new EventEmitter<void>();

  rename() {
    this.renamePage.emit();
  }

}
