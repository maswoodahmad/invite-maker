import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, Input, PLATFORM_ID, ViewChild, viewChild } from '@angular/core';
import * as fabric from 'fabric'
import { CanvasPage } from '../app/interface/interface';
@Component({
  selector: 'app-experimental-canvas',
  imports: [],
  templateUrl: './experimental-canvas.component.html',
  styleUrl: './experimental-canvas.component.scss',
})
export class ExperimentalCanvasComponent {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  CANVAS_WIDTH = 1080;
  CANVAS_HEIGHT = 1920;

  @Input() data: CanvasPage | any;
  canvas!: fabric.Canvas;
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrapper') wrapperRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.canvasRef.nativeElement;
    const wrapperEl = this.wrapperRef.nativeElement;

    // 1. Set intrinsic size (actual drawing resolution)
    el.width = this.CANVAS_WIDTH;
    el.height = this.CANVAS_HEIGHT;

    // 2. Set visible size via CSS (scaled down)
    const scale = 0.28;

    // 3. Create canvas instance
    this.canvas = new fabric.Canvas(el, {
      preserveObjectStacking: true,
      backgroundColor: 'black',
      selection: true,
    });

    const scaledWidth = this.CANVAS_WIDTH * scale;
    const scaledHeight = this.CANVAS_HEIGHT * scale;

    el.style.width = `${this.CANVAS_WIDTH * scale}px`;
    el.style.height = `${this.CANVAS_HEIGHT * scale}px`;

    wrapperEl.style.width = `${scaledWidth}px`;
    wrapperEl.style.height = `${scaledHeight}px`;
    // 4. Apply zoom so internal objects also scale properly
    this.canvas.setZoom(scale);

    // 5. Optional: Disable retina scaling (for pixel-perfect rendering)
    this.canvas.enableRetinaScaling = false;

    this.canvas.renderAll();
  }
}
