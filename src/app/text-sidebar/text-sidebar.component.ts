import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import * as fabric from 'fabric';

import { CanvasService } from '../services/canvas.service';
import { CanvasManagerService } from './../services/canvas-manager.service';
import { SidebarStateService } from '../services/sidebar-state.service';

import { TextPreset, TextPresets } from '../../assets/textPresets';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-text-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-sidebar.component.html',
  styleUrl: './text-sidebar.component.scss'
})
export class TextSidebarComponent {
  searchQuery: string = '';
  activeFilter: string | null = null;
  fontSettings!: TextPreset;

  textItems = [
    { name: 'Heading', category: 'Default' },
    { name: 'Subheading', category: 'Default' },
    { name: 'Body', category: 'Default' },
    { name: 'Page numbers', category: 'Dynamic' },
  ];

  constructor(
    private canvasService: CanvasService,
    private canvasManagerService: CanvasManagerService,
    private sidebarState: SidebarStateService
  ) { }

  onSearch() {
    this.activeFilter = this.searchQuery.trim() || null;
  }

  applyCategoryFilter(category: string) {
    this.searchQuery = category;
    this.onSearch();
  }

  clearSearch() {
    this.searchQuery = '';
    this.activeFilter = null;
    this.onSearch();
  }

  getFilteredTextItems() {
    return this.textItems.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addTextBox(): void {
    const canvas = this.canvasManagerService.getActiveCanvas();
    if (!canvas) return;

    const lastPosition = this.canvasService.getAndUpdateObjectPosition(canvas);
    const textbox = new fabric.Textbox("Birthday", {
      left: lastPosition.x,
      top: lastPosition.y,
      fontFamily: 'PlayList Script',
      fontWeight: '900',
      fontSize: 50,
      textTransform: 'uppercase',
      editable: true,
      selectable: true,
      evented: true
    });

    (textbox as any).id = uuidv4();

    setTimeout(() => {
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      canvas.requestRenderAll();
    }, 100);

    console.log('Object:', textbox);
    console.log('Selectable:', textbox.selectable, 'Has controls:', textbox.hasControls);
  }

  chooseFontWeight(event: MouseEvent) {
    const label = (event.target as HTMLElement).innerText.trim().toLowerCase();
    const preset = TextPresets[label];

    const canvas = this.canvasService.getCanvas();
    const active = canvas?.getActiveObject() as fabric.Textbox;

    if (!canvas || !active || !preset) return;

    active.set({
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fontStyle: preset.fontStyle,
    });

    canvas.requestRenderAll();
  }

  // Sidebar interactions
  openSidebar() {
    this.sidebarState.open('text');
  }

  togglePages() {
    this.sidebarState.toggleSidebar('text');
  }

  openPageSidebar() {
    this.sidebarState.open('pages');
  }

  openFontComp() {
    this.sidebarState.open('fonts');
  }
}
