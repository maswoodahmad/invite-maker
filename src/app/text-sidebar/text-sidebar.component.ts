import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasService } from '../services/canvas.service';


import * as fabric from 'fabric';
import { TextPreset, TextPresets } from '../../assets/textPresets';

@Component({
  selector: 'app-text-sidebar',
  imports: [FormsModule, CommonModule],
  templateUrl: './text-sidebar.component.html',
  styleUrl: './text-sidebar.component.scss'
})
export class TextSidebarComponent {
  searchQuery: string = '';
  activeFilter: string | null = null;

  constructor(private canvasService : CanvasService) {}

  onSearch() {
    this.activeFilter = this.searchQuery.trim() || null;
  }

  applyCategoryFilter(category: string) {
    this.searchQuery = category;
    this.onSearch();
  }

  textItems = [
    { name: 'Heading', category: 'Default' },
    { name: 'Subheading', category: 'Default' },
    { name: 'Body', category: 'Default' },
    { name: 'Page numbers', category: 'Dynamic' },
  ];

  fontSettings!: TextPreset;

  getFilteredTextItems() {
    return this.textItems.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.activeFilter = null;
    this.onSearch(); // Optionally reset filtered list
  }

  addTextBox(): void {
    const canvas = this.canvasService.getCanvas();
    const defaultFontSettings = {
      fontSize: 16,
      fontWeight: 'normal',
      fill: '#000',
    };

    if (canvas == null) return;
    console.log("Canvas:", canvas);
    console.log("Objects count before add:", canvas.getObjects().length);
    const textbox = new fabric.Textbox("Birthday", {
      fontFamily: 'PlayList Script',
      fontWeight: '900',
      fontSize: 50,
      textTransform: 'uppercase',
       left: 100,
       top: 200,
      // width: 550,
      // ...defaultFontSettings,
      // ...this.fontSettings

    });

    const textbox2 = new fabric.Textbox("Happy", {
      fontFamily: 'Pacifico',
      fontSize: 30,
      fontStyle: 'italic',
      textTransform: 'uppercase',
       left: 100,
       top: 100,
      // width: 550,
      // ...defaultFontSettings,
      // ...this.fontSettings

    });

    textbox.set({
      editable: true,
      selectable: true,
      evented: true,
    });

    canvas.setZoom(1);

    setTimeout(() => {
      canvas.add(textbox2)
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      console.log("Objects count before add:", canvas.getObjects().length);
      canvas.requestRenderAll();
    }, 100);

  }

  chooseFontWeight(event: MouseEvent) {

    const label = (event.target as HTMLElement).innerText.trim().toLocaleLowerCase();

    const canvas = this.canvasService.getCanvas();
    this.fontSettings = TextPresets[label];
    if (canvas) {
      const active = canvas?.getActiveObject() as fabric.Textbox;
      if (!active) return;

      active.set("fontSize", this.fontSettings.fontSize);
      active.set("fontWeight", this.fontSettings.fontSize);
      canvas.requestRenderAll();
    }

  }

}
