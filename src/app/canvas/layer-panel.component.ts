import { Component, inject, Input, Signal, computed } from '@angular/core';
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

  layerText = "";

  isLayerPanelVisible = false;




  toggleLayerPanel() {
    this.isLayerPanelVisible = !this.isLayerPanelVisible;
    this.layerText = this.layerText.length == 0 ? "Layers" : "";
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
