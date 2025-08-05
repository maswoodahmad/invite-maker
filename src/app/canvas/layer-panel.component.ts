import { CanvasManagerService } from './../services/canvas-manager.service';
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

  constructor(private canvasManagerService: CanvasManagerService) {
    effect(() => {
      this.layerItems = this.canvasService.layersSignal();
      //  console.log("lassyrs items", this.layerItems);
    });
  }
  layerText = '';

  isLayerPanelVisible = false;

  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;

  selectedLayer: any;

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
    const canvas = this.canvasManagerService.getActiveCanvas();
    if (
      this.draggedIndex === null ||
      !this.layersSignal() ||
      !canvas ||
      !this.layerItems
    )
      return;

    // Move layer in the array
    const draggedItem = this.layerItems[this.draggedIndex];
    this.layerItems.splice(this.draggedIndex, 1);
    this.layerItems.splice(dropIndex, 0, draggedItem);

    // Rebuild canvas stacking order (reversed because of LIFO)
    const reversedLayers = [...this.layerItems].reverse();

    // Clear canvas and re-add objects in the reversed order
    canvas.clear();
    reversedLayers.forEach((item) => {
      canvas.add(item.object); // assuming each item has `.object` (FabricObject)
    });

    this.draggedIndex = null;
    this.dragOverIndex = null;

    canvas.renderAll();
  }

  toggleLayerPanel() {
    this.isLayerPanelVisible = !this.isLayerPanelVisible;
    this.layerText = this.layerText.length == 0 ? 'Layers' : '';
  }

  get layers() {
    return this.layersSignal();
  }

  selectLayer(layer: CanvasLayer) {
    this.selectedLayer = layer;
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
