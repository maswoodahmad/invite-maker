import { CanvasService } from './../services/canvas.service';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  ChangeDetectionStrategy,
  Inject,
  PLATFORM_ID,
  HostListener
} from '@angular/core';
import * as fabric from 'fabric';
import { CanvasManagerService } from '../services/canvas-manager.service';
import { CanvasClipboardService } from '../services/canvas-clipboard.service';
import { CanvasPage } from '../interface/interface';

@Component({
  selector: 'app-canvas-view',
  templateUrl: './canvas-view.component.html',
  styleUrls: ['./canvas-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasViewComponent implements AfterViewInit {
  @ViewChild('canvasEl', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // @Input() width = 400;   // Default A4
  // @Input() height = 400;
  @Input() data: CanvasPage | any;


  canvas!: fabric.Canvas;
  @Input() isActive = false;


  readonly A4_WIDTH = 794;
  readonly A4_HEIGHT = 1123;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private canvasService: CanvasService,
    protected canvasManagerService: CanvasManagerService,
    private canvasClipboardService: CanvasClipboardService
  ) { }



   tempData = {
    width: this.A4_WIDTH, height: this.A4_HEIGHT,
    name: 'canvas',
    label: 'canvas'
   }
  viewportWidth = 1400
  viewportHeight = 700;

  ngAfterViewInit(): void {

      if (!isPlatformBrowser(this.platformId)) return;

      const el = this.canvasRef.nativeElement;

      // Set desired canvas size
      el.width = this.A4_WIDTH;
      el.height = this.A4_HEIGHT;

      // Clean up any old fabric.Canvas instance if exists
      const existingCanvas =  this.canvasManagerService.getCanvasById(this.data.id);
      if (existingCanvas) {
        existingCanvas.dispose(); // This clears event listeners and removes bindings
      }

      // Create fresh canvas instance
      this.canvas = new fabric.Canvas(el, {
        preserveObjectStacking: true,
        selection: true,
      });

      // Register and set canvas
      this.canvasManagerService.registerCanvas(this.data.id, this.canvas);
      this.canvasService.setCanvas(this.canvas);
      this.canvasManagerService.setActiveCanvasById(this.data.id);

      // Load design JSON (if present)
      if (this.data.data) {
        this.canvas.loadFromJSON(this.data.data).then(() => {
          this.canvas.renderAll();

          if (this.data.isLocked) {
            this.onLockToggle(this.data);
          }
        });
      } else {
        this.canvas.renderAll();
      }

      // Init and center
      this.canvasService.initCanvas(this.canvas);
      this.viewportWidth = window.innerWidth;
      this.viewportHeight = window.innerHeight;
      this.canvasService.resizeAndCenterCanvas({
        ...this.tempData,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
      });



  }

  getCanvasInstance(): fabric.Canvas {
    return this.canvas;
  }
  transformStyle = {
    transform: 'translateX(0px)',
    transition: 'transform 0.3s ease'
  };

  shiftCanvasToRight(shiftAmount: number): void {
    this.transformStyle = {
      transform: `translateX(${shiftAmount}px)`,
      transition: 'transform 0.3s ease'
    };
    console.log('Shifted canvas by:', shiftAmount);
  }


  @HostListener('window:keydown.control.c', ['$event'])
  handleCopy(e: KeyboardEvent) {
    e.preventDefault();
    console.log("copy pressed");
    this.canvasClipboardService.copy(this.canvas);
  }

  @HostListener('window:keydown.control.x', ['$event'])
  handleCut(e: KeyboardEvent) {
    e.preventDefault();
    console.log("cut pressed");
    this.canvasClipboardService.cut(this.canvas);
  }

  @HostListener('window:keydown.control.v', ['$event'])
  handlePaste(e: KeyboardEvent) {
    e.preventDefault();
    console.log("paste pressed");
    this.canvasClipboardService.paste(this.canvas);
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'c':
          event.preventDefault();
          this.canvasClipboardService.copy(this.canvas);
          break;
        case 'x':
          event.preventDefault();
          this.canvasClipboardService.cut(this.canvas);
          break;
        case 'v':
          event.preventDefault();
          this.canvasClipboardService.paste(this.canvas);
          break;
        case 'backspace':
          event.preventDefault();
          this.canvasClipboardService.deleteSelected(this.canvas);
          break;
      }
    }
  }

  ngOnDestroy() {
    const canvas = this.canvasService.getCanvas();
    if (canvas) {
      canvas.dispose(); // Properly destroy canvas and remove listeners
      this.canvasService.setCanvas(null); // Clear signal to avoid stale state
    }
  }



  @HostListener('window:resize', ['$event'])
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.canvasService.resizeAndCenterCanvas({ ...this.tempData, viewportWidth: this.viewportWidth, viewportHeight: this.viewportHeight });
    }
  }


  onLockToggle(updatedCanvas: CanvasPage) {
    const shouldLock = !!updatedCanvas.isLocked;


    const canvas = this.canvasManagerService.getCanvasById(updatedCanvas.id);
    if (!canvas) return;

    // Lock/unlock movement
    canvas.getObjects().forEach(obj => {
      obj.lockMovementX = shouldLock;
      obj.lockMovementY = shouldLock;
      obj.selectable = !shouldLock;
      obj.evented = !shouldLock;
    });

    console.log("islocked", shouldLock)
    canvas.getObjects().forEach(obj => {
      console.log('Object:', obj, {
        selectable: obj.selectable,
        evented: obj.evented,
        lockMovementX: obj.lockMovementX,
        lockMovementY: obj.lockMovementY
      });
    });

    // Disable selection and interaction if locked
    canvas.selection = !shouldLock;
    canvas.skipTargetFind = shouldLock;

    // Clear active object
    canvas.discardActiveObject();
    canvas.renderAll();
  }

}
