import { Component, inject, Input, Signal, computed, effect } from '@angular/core';
import { CanvasService } from '../services/canvas.service';
import { CanvasLayer, CustomFabricObject } from '../interface/interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layer-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layer-panel.component.html',
})
export class LayerPanelComponent {
  public canvasService = inject(CanvasService);
  layersSignal = this.canvasService.layersSignal;
  activeLayers: CanvasLayer[] = [];
  isLocked = false;
  isVisible = true;
  layerItems: CanvasLayer[] | undefined = [];

  constructor() {
    effect(() => {
      this.layerItems = this.canvasService.layersSignal();
    //  console.log("lassyrs items", this.layerItems);
    })
  }
  layerText = '';

  isLayerPanelVisible = false;

  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;

  onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Needed to allow drop
  }

  onDragEnter(index: number) {
    this.dragOverIndex = index;
  }

  onDragLeave(index: number) {
    if (this.dragOverIndex === index) {
      this.dragOverIndex = null;
    }
  }

  onDrop(event: DragEvent, dropIndex: number) {
    if (this.draggedIndex === null || !this.layersSignal()) return;


    if (this.layerItems) {
      const draggedItem = this.layerItems[this.draggedIndex];
      this.layerItems.splice(this.draggedIndex, 1);
      this.layerItems.splice(dropIndex, 0, draggedItem);

      this.draggedIndex = null;
      this.dragOverIndex = null;
    }
  }



  toggleLayerPanel() {
    this.isLayerPanelVisible = !this.isLayerPanelVisible;
    this.layerText = this.layerText.length == 0 ? 'Layers' : '';
  }

  get layers() {
    return this.layersSignal();
  }

  selectLayer(layer: CanvasLayer) {
    this.canvasService.selectObject(layer.object);
  }

  toggleVisibility(layer: CanvasLayer, event: Event) {
    event.stopPropagation();
    this.isVisible = !this.isVisible;
    this.canvasService.toggleVisibility(layer.object);
  }

  toggleLock(layer: CanvasLayer, event: Event) {
    event.stopPropagation();

    this.isLocked = this.canvasService.toggleLock(layer.object);
  }
}
