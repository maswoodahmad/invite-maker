import { CanvasObjectToolbarComponent } from './../canvas-object-toolbar/canvas-object-toolbar.component';
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
  EventEmitter,
  Output,
} from '@angular/core';
import * as fabric from 'fabric';
import { Subscription } from 'rxjs';

import { CanvasService } from '../services/canvas.service';
import { CanvasManagerService } from '../services/canvas-manager.service';
import { CanvasClipboardService } from '../services/canvas-clipboard.service';
import { ModeService } from '../services/mode.service';
import { CanvasPage } from '../interface/interface';
import { TOOLBAR_CONFIG, ToolbarMode } from '../../assets/toolbar-config';
import { CanvasObjectContextMenuComponent } from '../canvas-object-context-menu/canvas-object-context-menu.component';

@Component({
  selector: 'app-canvas-view',
  standalone: true,
  imports: [
    CommonModule,
    CanvasObjectToolbarComponent,
    CanvasObjectContextMenuComponent,
  ],
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
    protected canvasService: CanvasService,
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

    this.canvasService.resizeAndCenterCanvas({
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

    // In your Angular component or JS setup
    this.canvas.on('mouse:down', (event) => {
      if (!event.target) {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      }
    });

    this.canvas.on('mouse:down', (e) => {
      const activeObj = this.canvas.getActiveObject();

      if (!e.target) {
        // Clicked on empty space, clear selection
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      } else if (activeObj && activeObj !== e.target) {
        // Clicked on a different object — manually switch selection
        this.canvas.setActiveObject(e.target);
        this.canvas.requestRenderAll();
      }
    });

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

  contextMenuVisible = false;
  contextMenuPosition = { top: 0, left: 0 };

  toolbarPosition = { top: 0, left: 0 };

  @ViewChild('canvasWrapeprEl', { static: true })
  canvasScrollWrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvaswrapper', { static: true })
  canvasOuterRef!: ElementRef<HTMLDivElement>;

  openContextMenu(event: MouseEvent): void {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const menuWidth = 256;
    const estimatedMenuHeight = 220;
    const padding = 8;

    let left = event.clientX - wrapperRect.left;
    let top = event.clientY - wrapperRect.top;

    // Clamp horizontally
    if (left + menuWidth > wrapperRect.width) {
      left = wrapperRect.width - menuWidth - padding;
    }

    // Clamp vertically
    const maxTop = wrapperRect.height - estimatedMenuHeight - padding;
    top = Math.min(top, maxTop);
    top = Math.max(top, padding); // prevent going above too

    this.contextMenuPosition = { top, left };
    this.contextMenuVisible = true;

    event.preventDefault();
    event.stopPropagation();
  }

  updateToolbarPosition(object: fabric.Object) {
    if (!this.canvasScrollWrapperRef?.nativeElement || !object || !this.canvas)
      return;

    const wrapper = this.canvasScrollWrapperRef.nativeElement as HTMLElement;
    const zoom = this.canvas.getZoom();

    const objRect = object.getBoundingRect(); // ✅ true = absolute on canvas
    const wrapperRect = wrapper.getBoundingClientRect();

    const scrollLeft = wrapper.scrollLeft;
    const scrollTop = wrapper.scrollTop;

    const toolbarHeight = 40;
    const gap = 8;

    // ✅ Convert object position to wrapper-relative
    const topInWrapper = objRect.top * zoom - scrollTop;
    const leftInWrapper =
      (objRect.left + objRect.width / 2) * zoom - scrollLeft;

    const topAbove = topInWrapper - toolbarHeight - gap;
    const topBelow = topInWrapper + objRect.height * zoom + gap;

    const isAboveVisible = topAbove > 0;
    const isBelowVisible = topBelow + toolbarHeight < wrapper.clientHeight;

    const top = isAboveVisible
      ? topAbove
      : isBelowVisible
      ? topBelow
      : Math.max(0, topAbove);

    // ✅ Set centered, visible position
    this.toolbarPosition = {
      top,
      left: leftInWrapper,
    };
  }

  onCopy(): void {
    console.log('copy triggered');
  }

  onPaste(): void {
    console.log('paste triggered');
  }

  onAlign(): void {
    console.log('align triggered');
  }

  onComment(): void {
    console.log('comment triggered');
  }

  onLink(): void {
    console.log('link triggered');
  }

  onSetBackground(): void {
    console.log('background triggered');
  }

  onApplyColors(): void {
    console.log('color triggered');
  }

  onInfo(): void {
    console.log('info triggered');
  }

  deleteObject() {
    //throw new Error('Method not implemented.');
  }
  lockObject() {
   // throw new Error('Method not implemented.');
  }
  duplicateObject() {
   // throw new Error('Method not implemented.');
  }
  sendBackward() {
   // throw new Error('Method not implemented.');
  }
  sendToBack() {
   // throw new Error('Method not implemented.');
  }
  bringForward() {
   // throw new Error('Method not implemented.');
  }
  bringToFront() {
    //throw new Error('Method not implemented.');
  }
}
