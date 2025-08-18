import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as shapes from '../../assets/shapes';
import { SidebarStateService } from '../services/sidebar-state.service';
import { ShapeItem } from '../interface/interface';

@Component({
  selector: 'app-element-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './element-sidebar.component.html',
  styleUrls: ['./element-sidebar.component.scss'],
})
export class ElementSidebarComponent {

  constructor(private sidebarState: SidebarStateService) {

  }
  tabs = ['Frame', 'Shape', 'Circle', 'Line', 'Logo'];
  activeTab = 'Shape';

  recentElements = [
    { type: 'image', src: 'path/to/daisy.png' },
    { type: 'template', preview: 'path/to/backtoschool.jpg' },
    // ...
  ];

  shapes = ['rect', 'square', 'line', 'dashed', 'circle'];
  graphics = [
    { type: 'leaf', src: 'path/to/leaf.svg' },
    { type: 'abstract1', src: 'path/to/abstract1.svg' },
  ];

  aiPrompts = [
    'A cute anime cat in a forest with flowers',
    'Gothic castle surrounded by dinosaurs',
  ];

  selectShape(shape: string) {
    console.log('Selected shape:', shape);
    // Add to canvas logic here
  }

  openShapeComp() {
    this.sidebarState.open('shapes');
  }
}
