import { LayerService } from './../services/layer.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  Renderer2,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayerPanelComponent } from '../canvas/layer-panel.component';

import { CanvasService } from '../services/canvas.service';

import * as fabric from 'fabric';
import { CustomFabricObject } from '../interface/interface';

@Component({
  selector: 'app-position',
  standalone: true,
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss'],
  imports: [CommonModule, FormsModule, LayerPanelComponent],
})
export class PositionComponent implements AfterViewInit, OnChanges {
  @Input() triggerElement!: HTMLElement;
  @Input() visible = false;
  activeTab: 'position' | 'layers' = 'position';
  width!: number;
  height!: number;
  x = 0;
  y = 0;
  rotate = 0;

  isRatioLocked: boolean = true;
  ratio: number = 1;
  angle: number = 0;

  @ViewChild('container') containerRef!: ElementRef;

  constructor(
    private renderer: Renderer2,
    protected layerService: LayerService,
    private canvasService: CanvasService
  ) {
    effect(() => {
      const { width, height } = this.canvasService.renderedDimensions();
      this.width = Math.round(width);
      this.height = Math.round(height);
      this.ratio = width / height;
    });
  }

  ngAfterViewInit() {
    this.setPosition();
    const canvas = this.canvasService.getCanvas();
    const activeObj = canvas?.getActiveObject() as CustomFabricObject;

    if (!canvas || !activeObj) return;
    this.width = Math.round( activeObj.renderedWidth || 0);
    this.height = Math.round(activeObj.renderedHeight || 0);
    this.ratio = this.width / this.height;
    this.x = activeObj.left ?? 0;
    this.y = activeObj.top ?? 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue && this.triggerElement) {
      setTimeout(() => this.setPosition(), 0);
    }
  }

  setPosition() {
    if (!this.triggerElement || !this.containerRef?.nativeElement) return;

    const triggerRect = this.triggerElement.getBoundingClientRect();
    const container = this.containerRef.nativeElement;

    const top = triggerRect.bottom + window.scrollY + 8; // +8px spacing
    const left = triggerRect.left + window.scrollX;

    this.renderer.setStyle(container, 'position', 'absolute');
    this.renderer.setStyle(container, 'top', `${top}px`);
    this.renderer.setStyle(container, 'left', `${left}px`);
  }

  selectedVertical: 'top' | 'middle' | 'bottom' = 'middle'; // default

  setVerticalAlignment(position: 'top' | 'middle' | 'bottom') {
    this.selectedVertical = position;

    const canvas = this.canvasService.getCanvas();
    const textbox = canvas?.getActiveObject();

    if (textbox && canvas && textbox.type === 'textbox') {
      this.canvasService.alignTextbox(
        textbox as fabric.Textbox,
        canvas,
        position
      );
    }
  }

  selectedHorizontal: 'left' | 'center' | 'right' = 'center'; // default

  setAHorizontalAlignment(position: 'left' | 'center' | 'right') {
    this.selectedHorizontal = position;

    const canvas = this.canvasService.getCanvas();
    const obj = canvas?.getActiveObject();

    if (obj && canvas && obj.type === 'textbox') {
      this.canvasService.setHorizontalAlignment(
        obj as fabric.Textbox,
        canvas,
        position
      );
    }
  }

  onChangeDimensionsAndPositions(value: number, label: string): void {
    const canvas = this.canvasService.getCanvas();
    const activeObj = canvas?.getActiveObject();

    if (!canvas || !activeObj) return;

    const originalWidth = activeObj.width!;
    const originalHeight = activeObj.height!;

    switch (label.toLowerCase()) {
      case 'x':
        activeObj.set('left', value);
        this.x = value;
        break;

      case 'y':
        activeObj.set('top', value);
        this.y = value;
        break;

      case 'width': {
        const newScaleX = value / originalWidth;
        activeObj.set('scaleX', newScaleX);

        this.width = value;

        if (this.isRatioLocked) {
          activeObj.set('scaleY', newScaleX);
          this.height = Math.round(originalHeight * newScaleX);
        }
        break;
      }

      case 'height': {
        const newScaleY = value / originalHeight;

        activeObj.set('scaleY', newScaleY);
        this.height = value;

        if (this.isRatioLocked) {
          activeObj.set('scaleX', newScaleY);
          this.width = Math.round(originalWidth * newScaleY);
        }
        break;
      }

      case 'rotation':
      case 'angle':
        activeObj.set('angle', value);
        this.angle = value;
        break;

      default:
        console.warn('Unknown label:', label);
        return;
    }

    activeObj.setCoords();
    canvas.requestRenderAll();
  }

  toggleRatio() {
    this.isRatioLocked = !this.isRatioLocked;
  }
}
