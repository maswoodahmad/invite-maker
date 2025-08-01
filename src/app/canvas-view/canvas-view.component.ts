import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  ChangeDetectionStrategy,
  Inject,
  PLATFORM_ID,
  HostListener,
  Renderer2,
  OnDestroy,
  OnInit,
} from '@angular/core';
import * as fabric from 'fabric';
import { Subscription } from 'rxjs';

import { CanvasService } from '../services/canvas.service';
import { CanvasManagerService } from '../services/canvas-manager.service';
import { CanvasClipboardService } from '../services/canvas-clipboard.service';
import { ModeService } from '../services/mode.service';
import { CanvasPage } from '../interface/interface';
import { TOOLBAR_CONFIG, ToolbarMode } from '../../assets/toolbar-config';

@Component({
  selector: 'app-canvas-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas-view.component.html',
  styleUrls: ['./canvas-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasViewComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvasEl', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasPorject', { static: true })
  canvasWrapperRef!: ElementRef<HTMLCanvasElement>;

  @Input() data!: CanvasPage;

  readonly A4_WIDTH = 540;
  readonly A4_HEIGHT = 960;

  readonly toolbarConfig = TOOLBAR_CONFIG;
  canvas!: fabric.Canvas;

  private sub!: Subscription;

  // UI / Canvas States
  isActive = false;
  isViewOnly = false;
  showToolbar = false;
  isTouchScrolling = false;

  // Default Canvas Config
  CANVAS_WIDTH = this.A4_WIDTH;
  CANVAS_HEIGHT = this.A4_HEIGHT;
  zoomLevel = 0.28;

  tempData = {
    width: this.A4_WIDTH,
    height: this.A4_HEIGHT,
    name: 'canvas',
    label: 'canvas',
  };

  viewportWidth = 1400;
  viewportHeight = 700;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private canvasService: CanvasService,
    private canvasManagerService: CanvasManagerService,
    private canvasClipboardService: CanvasClipboardService,
    private modeService: ModeService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.sub = this.canvasManagerService
    .getActiveCanvasId$()
    .subscribe((activeId) => {
      if (activeId) this.canvasService.activeCanvasId.set(activeId);
      this.isActive = activeId === this.data.id;
    });

    this.modeService.mode$.subscribe((mode) => {
      this.isViewOnly = mode === 'viewing';
      if (this.canvas) {
        this.canvas.selection = !this.isViewOnly;
        this.canvas.forEachObject((obj) => {
          obj.selectable = !this.isViewOnly;
          obj.evented = !this.isViewOnly;
        });
        this.canvas.renderAll();
      }
    });

    this.renderer.listen(this.canvasRef.nativeElement, 'touchstart', () => {
      this.isTouchScrolling = true;
      this.canvas.selection = false;
      this.canvas.skipTargetFind = true;
    });

    this.renderer.listen(this.canvasRef.nativeElement, 'touchend', () => {
      this.isTouchScrolling = false;
      this.canvas.selection = true;
      this.canvas.skipTargetFind = false;
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.canvasRef.nativeElement;
    el.width = this.CANVAS_WIDTH;
    el.height = this.CANVAS_HEIGHT;
    el.style.width = `${this.CANVAS_WIDTH}px`;
    el.style.height = `${this.CANVAS_HEIGHT}px`;

    const existingCanvas = this.canvasManagerService.getCanvasById(
      this.data.id
    );
    if (existingCanvas) existingCanvas.dispose();

    this.canvas = new fabric.Canvas(el, {
      preserveObjectStacking: true,
      backgroundColor: 'white',
      selection: !this.isViewOnly,
    });

    this.canvasManagerService.registerCanvas(this.data.id, this.canvas);
    this.registerMouseClickOnCanvas();

    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;

    const scale = this.canvasService.resizeAndCenterCanvas({
      ...this.tempData,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
      canvas: this.canvas,
    });

    // this.canvas.setDimensions({
    //   width: this.canvas.getWidth() * (scale || 1),
    //   height: this.canvas.getHeight() * (scale || 1),
    // });

    if (this.data.data) {
      this.loadCanvasFromExistingData();
    } else {
      this.canvas.backgroundColor = 'white';
      this.canvas.selection = !this.isViewOnly;
      this.canvas.renderAll();
    }

    this.canvas.on('selection:created', this.applySelectionStyle.bind(this));
    this.canvas.on('selection:updated', this.applySelectionStyle.bind(this));

    fabric.InteractiveFabricObject.ownDefaults = {
      ...fabric.InteractiveFabricObject.ownDefaults,
      cornerStyle: 'circle',
      cornerColor: '#00CFFF',
      cornerStrokeColor: '#0078FF',
      cornerSize: 10,
      touchCornerSize: 14,
      borderColor: '#FFB300',
      borderDashArray: [5, 3],
      borderScaleFactor: 2.5,
      hasBorders: true,
      borderOpacityWhenMoving: 0.4,
      selectionBackgroundColor: 'rgba(0, 0, 0, 0.03)',
      padding: 10,
      transparentCorners: false,
      hasControls: true,
      selectable: true,
      evented: true,
      perPixelTargetFind: false,
      activeOn: 'down',
      hoverCursor: 'pointer',
      moveCursor: 'move',
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockSkewingX: false,
      lockSkewingY: false,
      lockScalingFlip: false,
    };

    this.canvasService.initCanvasEvents(
      this.canvas,
      (visible) => (this.showToolbar = visible)
    );
  }

  ngOnDestroy(): void {
    this.canvas?.dispose();
    this.sub?.unsubscribe();
  }

  applySelectionStyle(e: any): void {
    const selected = e.selected;
    if (selected?.length) {
      selected[0].set({
        borderColor: '#7f00ff',
        cornerColor: '#ffffff',
        cornerStrokeColor: '#7f00ff',
        cornerSize: 12,
        transparentCorners: false,
      });
      this.canvas.requestRenderAll();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isViewOnly && (event.ctrlKey || event.metaKey)) {
      switch (event.key.toLowerCase()) {
        case 'c':
          event.preventDefault();
          this.canvasClipboardService.copy();
          break;
        case 'x':
          event.preventDefault();
          this.canvasClipboardService.cut();
          break;
        case 'v':
          event.preventDefault();
          this.canvasClipboardService.paste();
          break;
        case 'backspace':
          event.preventDefault();
          this.canvasClipboardService.deleteSelected();
          break;
      }
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(): void {
    this.canvas.selection = false;
    this.canvas.skipTargetFind = true;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(): void {
    this.canvas.selection = true;
    this.canvas.skipTargetFind = false;
  }

  getCanvasInstance(): fabric.Canvas {
    return this.canvas;
  }

  shiftCanvasToRight(shiftAmount: number): void {
    this.transformStyle = {
      transform: `translateX(${shiftAmount}px)`,
      transition: 'transform 0.3s ease',
    };
    console.log('Shifted canvas by:', shiftAmount);
  }

  transformStyle = {
    transform: 'translateX(0px)',
    transition: 'transform 0.3s ease',
  };

  onLockToggle(updatedCanvas: CanvasPage): void {
    const shouldLock = !!updatedCanvas.isLocked;
    const canvas = this.canvasManagerService.getCanvasById(updatedCanvas.id);
    if (!canvas) return;

    canvas.getObjects().forEach((obj) => {
      obj.lockMovementX = shouldLock;
      obj.lockMovementY = shouldLock;
      obj.selectable = !shouldLock;
      obj.evented = !shouldLock;
    });

    canvas.selection = !shouldLock;
    canvas.skipTargetFind = shouldLock;
    canvas.discardActiveObject();
    canvas.renderAll();
  }

  showToolbarFor(obj: any): ToolbarMode {
    if (!obj) return 'page';
    if (obj === 'textbox') return 'text';
    if (obj === 'image') return 'image';
    if (['rect', 'circle', 'triangle'].includes(obj)) return 'shape';
    return 'page';
  }

  loadCanvasFromExistingData(): void {
    this.canvas.loadFromJSON(this.data.data).then(() => {
      this.canvas.backgroundColor = this.data.background ?? 'white';
      if (this.data.isLocked) {
        this.onLockToggle(this.data);
      }
      this.canvas.renderAll();
    });
  }

  registerMouseClickOnCanvas(): void {
    this.canvas.on('mouse:down', () => {
      this.canvasManagerService.setActiveCanvasById('null');
      this.canvasManagerService.setActiveCanvasById(this.data.id);
      this.canvasService.activeCanvasId.set('');
      this.canvasService.activeCanvasId.set(this.data.id);
    });
  }

  

}
