import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import * as fabric from 'fabric';

import { CanvasService } from '../services/canvas.service';
import { CanvasManagerService } from './../services/canvas-manager.service';
import { SidebarStateService } from '../services/sidebar-state.service';

import { TextPreset, TextPresets } from '../../assets/textPresets';
import { assignMetadata } from '../utils/fabric-object-utils';

@Component({
  selector: 'app-text-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-sidebar.component.html',
  styleUrl: './text-sidebar.component.scss',
})
export class TextSidebarComponent {
  searchQuery: string = '';
  activeFilter: string | null = null;
  fontSettings = TextPresets['paragraph'];

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
  ) {}

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
    return this.textItems.filter((item) =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  private measureTextWidth(
    canvas: fabric.Canvas,
    text: string,
    fontSize: number,
    fontFamily: string,
    fontWeight?: string
  ): number {
    const ctx = canvas.getContext();
    ctx.font = `${fontWeight || ''} ${fontSize}px ${fontFamily}`;
    return Math.max(
      ...text.split('\n').map((line) => ctx.measureText(line).width)
    );
  }

  addTextBox(text?: string): void {
    const canvas = this.canvasManagerService.getActiveCanvas();
    if (!canvas) return;

    const lastPosition = this.canvasService.getAndUpdateObjectPosition(canvas);
    const defaultText = text || 'Your paragraph text';

    // Apply font settings with fallbacks
    const fontFamily = this.fontSettings?.fontFamily || 'PlayList Script';
    const fontWeight = this.fontSettings?.fontWeight || '900';
    const fontSize = this.fontSettings?.fontSize || 50;

    // Measure required width
    const textWidth = this.measureTextWidth(
      canvas,
      defaultText,
      fontSize,
      fontFamily,
      fontWeight
    );

    // Create textbox
    const textbox = new fabric.Textbox(defaultText, {
      ...this.fontSettings,
      width: textWidth + 10, // padding

      fontFamily,
      fontWeight,
      fontSize,
      textTransform: 'uppercase',
      editable: true,
      selectable: true,
      evented: true,
      objectCaching: false,
    });

    assignMetadata(textbox, {
      name: this.fontSettings?.defaultText || 'my-text',
    });

    canvas.centerObject(textbox);
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();

    // Debug click logging (optional)
    canvas.getObjects().forEach((obj) => {
      obj.on('mousedown', () => {
        console.log('Object clicked:', obj.type, obj, obj.left, obj.top);
      });
    });

    // Sync active object after render
    requestAnimationFrame(() => {
      this.canvasService.syncActiveObject();
    });
  }

  chooseFontWeight(event: MouseEvent) {
    const label = (event.target as HTMLElement).innerText.trim().toLowerCase();
    const preset = TextPresets[label];

    this.fontSettings = preset;

    this.addTextBox(this.fontSettings.defaultText);
    this.fontSettings = TextPresets['paragraph'];
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
