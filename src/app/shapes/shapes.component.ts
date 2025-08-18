import {  ShapeItem, ShapeLibrary } from './../interface/interface';
import { ElementSidebarComponent } from './../element-sidebar/element-sidebar.component';
import { SidebarStateService } from './../services/sidebar-state.service';
import { Component } from '@angular/core';

import * as shapes from '../../assets/shapes';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-shapes',
  imports: [FormsModule, CommonModule],
  templateUrl: './shapes.component.html',
  styleUrl: './shapes.component.scss',
})
export class ShapesComponent extends ElementSidebarComponent {
  elementShapes!: ShapeLibrary;
  constructor(
    private sidebarStateService: SidebarStateService,
    private sanitizer: DomSanitizer
  ) {
    super(sidebarStateService);
    this.elementShapes = shapes.shapeLibrary;
    this.elementShapes.shapes.forEach((cat) =>
      cat.items.forEach((item) => {
        item.svgHtml = this.sanitizer.bypassSecurityTrustHtml(item.svg) as SafeHtml;
      })
    );
  }

  // Sanitize all SVGs once at initialization

  close() {
    this.sidebarStateService.open('elements');
  }

  searchQuery: string = '';

  selectShape2(_t22: ShapeItem) {
    console.log('selectedshape', _t22);
  }
}
