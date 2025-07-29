import { CanvasService } from './../services/canvas.service';
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
  signal,
  Output,
  EventEmitter,
  Renderer2,
} from '@angular/core';
import * as fabric from 'fabric';
import { CanvasManagerService } from '../services/canvas-manager.service';
import { CanvasClipboardService } from '../services/canvas-clipboard.service';
import { CanvasPage } from '../interface/interface';
import { Subscription } from 'rxjs';
import { TOOLBAR_CONFIG, ToolbarMode } from '../../assets/toolbar-config';
import { AppToolbarComponent } from '../app-toolbar/app-toolbar.component';
import { ModeService } from '../services/mode.service';

@Component({
  selector: 'app-canvas-view',
  imports: [CommonModule],
  templateUrl: './canvas-view.component.html',
  styleUrls: ['./canvas-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasViewComponent implements AfterViewInit {
  @ViewChild('canvasEl', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasPorject', { static: true })
  canvasWrapperRef!: ElementRef<HTMLCanvasElement>;

  // @Input() width = 400;   // Default A4
  // @Input() height = 400;
  @Input() data: CanvasPage | any;

  canvas!: fabric.Canvas;
  //@Input() isActive = false;

  readonly A4_WIDTH = 1080;
  readonly A4_HEIGHT = 1920;

  zoomLevel = 0.28;

  toolbarConfig = TOOLBAR_CONFIG;
  toolbarPresets!: ToolbarMode;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    protected canvasService: CanvasService,
    protected canvasManagerService: CanvasManagerService,
    private canvasClipboardService: CanvasClipboardService,
    private modeService: ModeService,
    private renderer: Renderer2
  ) {}

  tempData = {
    width: this.A4_WIDTH,
    height: this.A4_HEIGHT,
    name: 'canvas',
    label: 'canvas',
  };
  viewportWidth = 1400;
  viewportHeight = 700;

  CANVAS_WIDTH = 1080;
  CANVAS_HEIGHT = 1920;

  private sub!: Subscription;

  isTouchScrolling = false;

  showToolbar = false;

  isActive!: boolean;
  isViewOnly = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    console.log('height', window.innerHeight);

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
    console.log('height', window.innerHeight);

    const el = this.canvasRef.nativeElement;

    // Set desired canvas size
    el.width = this.CANVAS_WIDTH ;
    el.height = this.CANVAS_HEIGHT ;

    // Clean up any old fabric.Canvas instance if exists
    const existingCanvas = this.canvasManagerService.getCanvasById(
      this.data.id
    );
    if (existingCanvas) {
      existingCanvas.dispose(); // This clears event listeners and removes bindings
    }

    // Create fresh canvas instance
    this.canvas = new fabric.Canvas(el, {
      preserveObjectStacking: true,
      backgroundColor: 'white',
      selection: !this.isViewOnly,

    });
//56 + 52 +

    // Register and set canvas
    this.canvasManagerService.registerCanvas(this.data.id, this.canvas);
    this.registerMouseClickOnCanvas();

    // Load design JSON (if present)
    if (this.data.data) {
      this.loadCanvasFromExistingData();
    } else {
      this.canvas.backgroundColor = 'white';
      this.canvas.renderAll.bind(this.canvas);
      this.canvas.selection = !this.isViewOnly;
      this.canvas.renderAll();
    }

    console.log('canavs with id created', this.data?.id);
    // Init and center
    // this.canvasService.initCanvas(this.canvas);
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.canvasService.resizeAndCenterCanvas({
      ...this.tempData,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
      canvas : this.canvas
    });

    this.canvas.on('selection:created', (e: any) => {
      const selected = e.selected;
      if (selected && selected.length > 0) {
        const target = selected[0];
        target.set({
          borderColor: '#7f00ff',
          cornerColor: '#ffffff',
          cornerStrokeColor: '#7f00ff',
          cornerSize: 12,
          transparentCorners: false,
        });
        this.canvas.requestRenderAll();
      }
    });

    this.canvas.on('selection:updated', (e: any) => {
      const selected = e.selected;
      if (selected && selected.length > 0) {
        const target = selected[0];
        target.set({
          borderColor: '#7f00ff',
          cornerColor: '#ffffff',
          cornerStrokeColor: '#7f00ff',
          cornerSize: 12,
          transparentCorners: false,
        });
        this.canvas.requestRenderAll();
      }
    });

    fabric.InteractiveFabricObject.ownDefaults = {
      ...fabric.InteractiveFabricObject.ownDefaults,

      // Corners
      cornerStyle: 'circle',
      cornerColor: '#00CFFF', // Aqua/sky blue corner fill
      cornerStrokeColor: '#0078FF', // Darker blue outline
      cornerSize: 10,
      touchCornerSize: 14,
      cornerDashArray: null, // solid corners for better visibility

      // Borders
      borderColor: '#FFB300', // Bright amber border for selected object
      borderDashArray: [5, 3],
      borderScaleFactor: 2.5,
      hasBorders: true,
      borderOpacityWhenMoving: 0.4,

      // Selection
      selectionBackgroundColor: 'rgba(0, 0, 0, 0.03)', // subtle background to highlight selection

      // Padding and Controls
      padding: 10,
      transparentCorners: false,
      hasControls: true,

      // Interactivity
      selectable: true,
      evented: true,
      perPixelTargetFind: false,
      activeOn: 'down',

      // Cursor customization
      hoverCursor: 'pointer',
      moveCursor: 'move',

      // Locks are left flexible for UI controls to toggle
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockSkewingX: false,
      lockSkewingY: false,
      lockScalingFlip: false,
    };

    // this.canvas.on('mouse:down', (e) => {
    //   this.showToolbar = true;
    //   if (!e.target) {
    //     console.log('🟦 Empty canvas clicked');
    //     this.showToolbarFor('background');
    //   } else {
    //     this.showToolbarFor(e.target.type); // your method to update selection
    //   }

    // });

    this.canvasService.initCanvasEvents(
      this.canvas,
      (visible) => (this.showToolbar = visible)
    );
  }

  getCanvasInstance(): fabric.Canvas {
    return this.canvas;
  }
  transformStyle = {
    transform: 'translateX(0px)',
    transition: 'transform 0.3s ease',
  };

  shiftCanvasToRight(shiftAmount: number): void {
    this.transformStyle = {
      transform: `translateX(${shiftAmount}px)`,
      transition: 'transform 0.3s ease',
    };
    console.log('Shifted canvas by:', shiftAmount);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
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

  ngOnDestroy() {
    const canvas = this.canvasService.getCanvas();
    if (canvas) {
      canvas.dispose(); // Properly destroy canvas and remove listeners
      //this.canvasManagerService.registerCanvas(null); // Clear signal to avoid stale state
    }
    this.sub?.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.canvasService.resizeAndCenterCanvas({
        ...this.tempData,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
        canvas : this.canvas
      });
    }
  }

  onLockToggle(updatedCanvas: CanvasPage) {
    const shouldLock = !!updatedCanvas.isLocked;

    const canvas = this.canvasManagerService.getCanvasById(updatedCanvas.id);
    if (!canvas) return;

    // Lock/unlock movement
    canvas.getObjects().forEach((obj) => {
      obj.lockMovementX = shouldLock;
      obj.lockMovementY = shouldLock;
      obj.selectable = !shouldLock;
      obj.evented = !shouldLock;
    });

    console.log('islocked', shouldLock);
    canvas.getObjects().forEach((obj) => {
      console.log('Object:', obj, {
        selectable: obj.selectable,
        evented: obj.evented,
        lockMovementX: obj.lockMovementX,
        lockMovementY: obj.lockMovementY,
      });
    });

    // Disable selection and interaction if locked
    canvas.selection = !shouldLock;
    canvas.skipTargetFind = shouldLock;

    // Clear active object
    canvas.discardActiveObject();
    canvas.renderAll();
  }

  showToolbarFor(obj: any) {
    let mode!: ToolbarMode;
    if (obj == null) {
      mode = 'page';
    } else if (obj === 'textbox') {
      mode = 'text';
    } else if (obj === 'image') {
      mode = 'image';
    } else if (obj === 'rect' || obj === 'circle' || obj === 'triangle') {
      mode = 'shape';
    }
    return mode;
  }

  loadCanvasFromExistingData() {
    this.canvas.loadFromJSON(this.data.data).then(() => {
      // Set background color if it's not saved in JSON
      this.canvas.backgroundColor = this.data.background ?? 'white';
      (this.canvas.selection = !this.isViewOnly),
        this.canvas.renderAll.bind(this.canvas);

      if (this.data.isLocked) {
        this.onLockToggle(this.data);
      }

      this.canvas.renderAll();
    });
  }

  registerMouseClickOnCanvas() {
    this.canvas.on('mouse:down', () => {
      console.log('[Canvas] Mouse down on canvas with ID:', this.data.id);
      this.canvasManagerService.setActiveCanvasById('null'); // clear
      this.canvasManagerService.setActiveCanvasById(this.data.id);
      this.canvasService.activeCanvasId.set('');
      this.canvasService.activeCanvasId.set(this.data.id);
    });
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart() {
    this.canvas.selection = false;
    this.canvas.skipTargetFind = true;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd() {
    this.canvas.selection = true;
    this.canvas.skipTargetFind = false;
  }
}
