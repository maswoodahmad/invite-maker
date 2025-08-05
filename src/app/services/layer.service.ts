import { computed, Injectable, signal, Signal } from '@angular/core';
import { CanvasLayer } from '../interface/interface';
import { CanvasManagerService } from './canvas-manager.service';
import * as fabric from 'fabric';

@Injectable({ providedIn: 'root' })
export class LayerService {
  // Map canvasId => CanvasLayer[]
  private layerMap = signal<Map<string, CanvasLayer[]>>(new Map());

  // Active canvasId (signal)
  private activeCanvasId = signal<string | null>(null);

  private activeCanvas!: fabric.Canvas | null;

  constructor(private canvasManager: CanvasManagerService) {
    // Sync activeCanvasId from canvasManager
    this.canvasManager.getActiveCanvasId$().subscribe((id) => {
      this.activeCanvasId.set(id);
    });
  }

  /** Get all layers for current active canvas */
  readonly activeCanvasLayers = computed(() => {
    const id = this.activeCanvasId();
    if (!id) return [];
    return this.layerMap().get(id) || [];
  });

  /** Add or update a layer for a specific canvas */
  upsertLayer(canvasId: string, layer: CanvasLayer) {
    const map = new Map(this.layerMap());
    const layers = map.get(canvasId) || [];

    const index = layers.findIndex((l) => l.id === layer.id);
    if (index >= 0) {
      layers[index] = layer; // Update
    } else {
      layers.push(layer); // Add new
    }

    map.set(canvasId, layers);
    this.layerMap.set(map);
  }

  /** Remove a layer from a specific canvas */
  removeLayer(canvasId: string, layerId: string) {
    const map = new Map(this.layerMap());
    const layers = map.get(canvasId)?.filter((l) => l.id !== layerId) || [];
    map.set(canvasId, layers);
    this.layerMap.set(map);
  }

  /** Clear all layers for a canvas (optional) */
  clearLayers(canvasId: string) {
    const map = new Map(this.layerMap());
    map.set(canvasId, []);
    this.layerMap.set(map);
  }

  /** Set entire list of layers (e.g., after sync from canvas) */
  setLayers(canvasId: string, layers: CanvasLayer[]) {
    const map = new Map(this.layerMap());
    map.set(canvasId, layers);
    this.layerMap.set(map);
  }

  sendToBack(): void {
    this.activeCanvas = this.canvasManager.getActiveCanvas();
    const selectedObject = this.activeCanvas?.getActiveObject();
    if (!selectedObject) return;
    const objects = this.activeCanvas?.getObjects();
    const index = objects?.indexOf(selectedObject);

    if (objects && index && index > 0) {
      objects.splice(index, 1);
      objects.unshift(selectedObject);
      this.refreshCanvas(objects, selectedObject);
    }
  }
  sendBackward(): void {
    this.activeCanvas = this.canvasManager.getActiveCanvas();
    const selectedObject = this.activeCanvas?.getActiveObject();
    if (!selectedObject) return;

    const objects = this.activeCanvas?.getObjects();
    const index = objects?.indexOf(selectedObject);

    if (objects && index && index > 0) {
      this.sendToIndex(index - 1);
    }
  }

  sendToIndex(targetIndex?: number): void {
    this.activeCanvas = this.canvasManager.getActiveCanvas();
    const selectedObject = this.activeCanvas?.getActiveObject();
    if (!selectedObject) return;

    const objects = this.activeCanvas?.getObjects();
    const currentIndex = objects?.indexOf(selectedObject);

    if (
      !objects ||
      currentIndex === -1 ||
      targetIndex === undefined ||
      targetIndex === currentIndex ||
      currentIndex ===undefined
    )
      return;

    // Remove and reinsert at target index
    objects.splice(currentIndex, 1);
    objects.splice(targetIndex, 0, selectedObject);

    this.refreshCanvas(objects, selectedObject);
  }


  bringForward(): void {
    this.activeCanvas = this.canvasManager.getActiveCanvas();
    const selectedObject = this.activeCanvas?.getActiveObject();
    if (!selectedObject) return;

    const objects = this.activeCanvas?.getObjects();
    const index = objects?.indexOf(selectedObject);

    if (objects && index &&  index < objects.length - 1) {
      this.sendToIndex(index + 1);
    }
  }

  bringToFront(): void {
    this.activeCanvas = this.canvasManager.getActiveCanvas();
    const selectedObject = this.activeCanvas?.getActiveObject();

    if (!selectedObject) return;
    const objects = this.activeCanvas?.getObjects();
    const index = objects?.indexOf(selectedObject);
    if (objects && index && index !== -1 && index < objects.length - 1) {
      objects.splice(index, 1);
      objects.push(selectedObject);
      this.refreshCanvas(objects, selectedObject);
    }
  }

  private refreshCanvas(
    objects: fabric.Object[],
    selectedObject: fabric.Object
  ): void {
    this.activeCanvas = this.canvasManager.getActiveCanvas();

    this.activeCanvas?.clear();

    objects.forEach((obj) => this.activeCanvas?.add(obj));
    if (selectedObject) {
      this.activeCanvas?.setActiveObject(selectedObject);
    }
    this.activeCanvas?.requestRenderAll();
  }
}
