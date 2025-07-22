import { Component, inject, Input, Signal, computed } from '@angular/core';
import { CanvasService } from '../services/canvas.service';
import { CanvasLayer } from '../interface/interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layer-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layer-panel.component.html',
})
export class LayerPanelComponent {
  private canvasService = inject(CanvasService);
  layersSignal = this.canvasService.layersSignal;

  isLocked = false;
  isVisible = true;

  isLayerPanelVisible = false;

  fetchData() {
    this.layers;
    this.isLayerPanelVisible = !this.isLayerPanelVisible;
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

   this.isLocked =  this.canvasService.toggleLock(layer.object);
  }
}
