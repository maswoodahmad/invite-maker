import { UndoRedoService } from './undo-redo.service';
import { title } from 'process';
import {
  computed,
  Injectable,
  signal,
  PLATFORM_ID,
  Inject,
  HostListener,
} from '@angular/core';
import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import {
  CanvasLayer,
  CustomFabricObject,
  HorizontalAlign,
  PageNumberPosition,
  VerticalPosition,
} from '../interface/interface';
import { isPlatformBrowser } from '@angular/common';
import { CanvasManagerService } from './canvas-manager.service';
import { ToolbarItem, ToolbarMode } from '../../assets/toolbar-config';
import { ColorPaletteService } from './color-palette.service';
import { debounce } from 'lodash';

@Injectable({ providedIn: 'root' })
export class CanvasService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private canvasManager: CanvasManagerService,
    private colorService: ColorPaletteService,
    private undoRedoService: UndoRedoService
  ) {
    this.canvasManager.getActiveCanvasId$().subscribe((id) => {
      if (id) this.activeCanvasId.set(id);
    });
  }
  private pageNumberPosition: PageNumberPosition = 'bottom-right';

  readonly selectedObjectSignal = signal<fabric.Object | null>(null);

  readonly renderedDimensions = signal({ width: 0, height: 0 });

  isLoadingCanvasData: boolean = false;

  updateRenderedDimensions(width: number, height: number) {
    this.renderedDimensions.set({ width, height });
  }

  private debouncedUpdate = debounce((canvas: fabric.Canvas) => {
    this.colorService.updateFromCanvas(canvas); // ✅ safe access
    const activeObject = canvas.getActiveObject() as CustomFabricObject;
    if (activeObject) {
      const scaleX = activeObject?.scaleX ?? 1;
      const scaleY = activeObject?.scaleY ?? 1;

      const renderedWidth = (activeObject?.width ?? 0) * scaleX;
      const renderedHeight = (activeObject.height ?? 0) * scaleY;
      activeObject.renderedHeight = renderedHeight;
      activeObject.renderedWidth = renderedWidth;
      this.updateRenderedDimensions(renderedWidth, renderedHeight);
    }
  }, 100); // ✅ debounce interval in ms,

  private layersStore = signal<Map<string, CanvasLayer[]>>(new Map());
  private objectToLayerIdsMap = new Map<string, Set<string>>();
  activeCanvasId = signal<string | null>(null);

  lastPosition = { x: 100, y: 100 };
  offsetStep = 30;

  // Computed layer signal for currently active canvas
  layersSignal = computed(() => {
    // console.log('this ran', this.activeCanvasId());
    const id = this.activeCanvasId();
    // console.log("active layers", this.layersStore().get(id));
    if (id) return this.layersStore().get(id);
    else return [];
  });

  readonly activeObjectSignal = signal<any>(null);

  setActiveObjectSignal(obj: fabric.Object | null) {
    this.activeObjectSignal.set(obj);
  }

  readonly isActiveToolbarSignal = signal<boolean>(false);

  get isToolbarActive() {
    return this.isActiveToolbarSignal();
  }

  textStyleSignal = signal<{
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    underline: boolean;
    linethrough: boolean;
    overline: boolean;
    fill: string;
    textAlign: string;
    scaleX: number;
    scaleY: number;
    opacity: number;
    width: number;
    height: number;
    renderedWidth?: number;
    renderedHeight?: number;
  } | null>(null);

  imageStyleSignal = signal<{
    scaleX: number;
    scaleY: number;
    angle: number;
    opacity: number;
    flipX: boolean;
    flipY: boolean;
    left: number;
    top: number;
    width: number;
    height: number;
    cropX: number;
    cropY: number;
    stroke: string | fabric.TFiller | null;
    strokeWidth: number;
    strokeUniform: boolean;
    shadow: string | null;
    skewX: number;
    skewY: number;
    clipPath: any;
    visible: boolean;
    selectable: boolean;
    evented: boolean;
    src: string;
    renderedWidth?: number;
    renderedHeight?: number;
  }>({
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    opacity: 1,
    flipX: false,
    flipY: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    cropX: 0,
    cropY: 0,
    stroke: null,
    strokeWidth: 0,
    strokeUniform: false,
    shadow: null,
    skewX: 0,
    skewY: 0,
    clipPath: null,
    visible: true,
    selectable: true,
    evented: true,
    src: '',
  });

  get textStyleBox() {
    return this.textStyleSignal();
  }

  getCanvas(): fabric.Canvas | null {
    return this.canvasManager.getActiveCanvas();
  }

  getPageNumberPosition(): PageNumberPosition {
    return this.pageNumberPosition;
  }

  setPageNumberPosition(position: PageNumberPosition) {
    const canvas = this.getCanvas();
    if (!canvas) return;

    this.pageNumberPosition = position;
    this.addDynamicPageNumbers(canvas, canvas.getWidth(), canvas.getHeight());
  }

  getPageNumberCoords(x: number, y: number, w: number, h: number) {
    const margin = 40;
    const left = x * w;
    const top = (y + 1) * h;

    switch (this.pageNumberPosition) {
      case 'bottom-left':
        return { left: left + margin, top: top - margin, originX: 'left' };
      case 'bottom-center':
        return { left: left + w / 2, top: top - margin, originX: 'center' };
      default:
        return { left: left + w - margin, top: top - margin, originX: 'right' };
    }
  }

  addDynamicPageNumbers(
    canvas: fabric.Canvas,
    pageWidth: number,
    pageHeight: number
  ) {
    const cols = Math.floor(canvas.getWidth() / pageWidth);
    const rows = Math.floor(canvas.getHeight() / pageHeight);

    // Remove previous page numbers
    canvas.getObjects().forEach((obj) => {
      const co = obj as CustomFabricObject;
      if (co.data?.isPageNumber) canvas.remove(co);
    });

    let count = 1;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const { left, top, originX } = this.getPageNumberCoords(
          x,
          y,
          pageWidth,
          pageHeight
        );
        const text = new fabric.Text(`Page ${count++}`, {
          fontSize: 24,
          fill: '#666',
          selectable: false,
          evented: false,
          originX: 'center',
          originY: 'bottom',
          left,
          top,
        });
        (text as CustomFabricObject).data = { isPageNumber: true };
        canvas.add(text);
      }
    }

    canvas.requestRenderAll();
  }

  getObjectById(id: string): fabric.Object | undefined {
    return this.getCanvas()
    ?.getObjects()
    .find((obj) => (obj as any).id === id);
  }

  getLayersForCanvas(canvasId: string): CanvasLayer[] {
    return this.layersStore().get(canvasId) || [];
  }

  updateLayersForCanvas(canvasId: string, layers: CanvasLayer[]) {
    const newMap = new Map(this.layersStore());
    newMap.set(canvasId, layers);
    this.layersStore.set(newMap);
  }

  async getLayers(): Promise<CanvasLayer[]> {
    const canvas = this.canvasManager.getActiveCanvas();
    if (!canvas) return [];

    const customObjects = canvas.getObjects() as CustomFabricObject[];

    const layers = await Promise.all(
      [...customObjects].reverse().map(async (obj, index) => {
        const preview = await this.generatePreview(obj); // Use clone for preview
        return {
          id: obj.id || String(index),
          name: obj.name,
          object: obj, // ✅ keep actual canvas object
          hidden: !obj.visible,
          locked: obj.lockMovementX && obj.lockMovementY,
          preview: preview,
        };
      })
    );

    return layers;
  }

  async refreshLayers() {
    const canvasId = this.activeCanvasId();
    if (!canvasId) return;
    const layers = await this.getLayers();
    const map = new Map(this.layersStore());
    map.set(canvasId, layers);
    this.layersStore.set(map);
  }

  generatePreview(obj: fabric.Object, size = 96): Promise<string> {
    return new Promise((resolve) => {
      const tempCanvas = new fabric.StaticCanvas(undefined, {
        width: size,
        height: size,
        backgroundColor: 'transparent',
      });

      obj.clone().then((cloned) => {
        const padding = 8;
        const maxW = size - padding * 2;
        const maxH = size - padding * 2;

        const bounds = cloned.getBoundingRect();
        const scale = Math.min(maxW / bounds.width, maxH / bounds.height);
        cloned.scale(cloned.scaleX! * scale);

        cloned.set({
          originX: 'center',
          originY: 'center',
          left: size / 2,
          top: size / 2,
        });

        tempCanvas.add(cloned);
        tempCanvas.renderAll();

        resolve(tempCanvas.toDataURL({ multiplier: 1, format: 'png' }));
      });
    });
  }
  private debouncedSaveState = debounce(
    (id: string, canvas: fabric.Canvas) => {
      this.undoRedoService.saveState(id, canvas);
    },
    300 // ms debounce to avoid undo spam
  );

  initCanvasEvents(
    canvas: fabric.Canvas,
    setToolbarVisible: (visible: boolean) => void
  ) {
    const handleSync = () => {
      this.refreshLayers();
      this.syncToolbarWithActiveObject(canvas.getActiveObject());
    };

    const handleSelection = (obj: fabric.Object | null) => {
      this.setActiveObjectSignal(obj);
      this.syncToolbarWithActiveObject(obj);
    };

    const handleChange = () => {
      this.debouncedUpdate(canvas);

      // Avoid saving state during undo/redo or initial load
      if (this.undoRedoService.isRestoringState || this.isLoadingCanvasData)
        return;

      const id = this.activeCanvasId();
      if (!id) return;

      this.debouncedSaveState(id, canvas);
    };

    // Object lifecycle events
    const objectEvents: (keyof fabric.CanvasEvents)[] = [
      'object:added',
      'object:modified',
      'object:removed',
    ];

    objectEvents.forEach((evt) => {
      canvas.on(evt, () => {
        handleSync();
        handleChange();
      });
    });

    // Selection events
    canvas.on('selection:created', (e) =>
      handleSelection(e.selected?.[0] || null)
    );
    canvas.on('selection:updated', (e) =>
      handleSelection(e.selected?.[0] || null)
    );
    canvas.on('selection:cleared', () => handleSelection(null));

    // Mouse events
    canvas.on('mouse:down', (e) => {
      setToolbarVisible(true);
      this.syncToolbarWithActiveObject(e.target || null);
    });

    // Optional: keep UI in sync after programmatic changes
    canvas.on('after:render', () => this.debouncedUpdate(canvas));
  }

  toggleVisibility(obj: fabric.Object) {
    obj.visible = !obj.visible;
    this.getCanvas()?.renderAll();
    this.refreshLayers();
  }

  toggleLock(obj: fabric.Object): boolean {
    const isLocked = obj.lockMovementX && obj.lockMovementY;
    isLocked ? this.unlockObject(obj) : this.lockObject(obj);
    this.refreshLayers();
    return !isLocked;
  }

  unlockObject(obj: fabric.Object): boolean {
    obj.set({
      selectable: true,
      evented: true,
      hasControls: true,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
    });

    const canvas = this.getCanvas();
    canvas?.discardActiveObject();
    canvas?.setActiveObject(obj);
    canvas?.renderAll();
    return true;
  }

  lockObject(obj: fabric.Object): boolean {
    obj.set({
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: true,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });

    const canvas = this.getCanvas();
    canvas?.discardActiveObject();
    canvas?.setActiveObject(obj);
    canvas?.renderAll();
    return true;
  }

  selectObject(layer: CustomFabricObject) {
    const canvas = this.getCanvas();
    if (!canvas) return;

    const canvasObject = canvas
    .getObjects()
    .find((obj: any) => obj.id === layer.id);

    if (canvasObject) {
      canvasObject.selectable = true;
      canvasObject.evented = true;
      canvasObject.visible = true;
      canvasObject.set({
        stroke: 'red',
        strokeWidth: 3,
        opacity: 0.5,
      });

      canvas.setActiveObject(canvasObject);
      // canvas.bringToFront(canvasObject); // optional
      canvas.renderAll();
    } else {
      console.warn('Object not found on canvas for id:', layer.id);
    }
  }

  getAndUpdateObjectPosition(canvas: fabric.Canvas): { x: number; y: number } {
    const current = { ...this.lastPosition };
    this.lastPosition.x += this.offsetStep;
    this.lastPosition.y += this.offsetStep;

    if (
      this.lastPosition.x > canvas.getWidth() - 200 ||
      this.lastPosition.y > canvas.getHeight() - 200
    ) {
      this.lastPosition = { x: 100, y: 100 };
    }

    return current;
  }

  resizeAndCenterCanvas(config: {
    width: number;
    height: number;
    name: string;
    label: string;
    viewportWidth: number;
    viewportHeight: number;
    canvas: fabric.Canvas;
  }) {
    if (!isPlatformBrowser(this.platformId)) return;

    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;

    const canvasEl = wrapper.querySelector('canvas') as HTMLCanvasElement;
    if (!canvasEl) return;

    const vw = config.viewportWidth ?? window.innerWidth;
    const vh = config.viewportHeight ?? window.innerHeight;

    const scale = Math.min(
      (vw - 64) / config.width,
      (vh - 120) / config.height
    );

    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = 'top center';
    wrapper.style.marginTop = `${(vh - config.height * scale) / 2}px`;

    return scale;
  }

  resizeAndCenterCanvas2(config: {
    viewportWidth: number;
    viewportHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    zoomLevel: number;
  }) {
    const wrapper = document.getElementById('canvas-wrapper-parent');
    const zoomable = document.getElementById('canvas-zoomable');

    if (!wrapper || !zoomable) return;

    const scaledWidth = config.canvasWidth * config.zoomLevel;
    const scaledHeight = config.canvasHeight * config.zoomLevel;

    const scrollLeft = (scaledWidth - wrapper.clientWidth) / 2;
    const scrollTop = (scaledHeight - wrapper.clientHeight) / 2;

    // wrapper.scrollTo({
    //   top: scrollTop,
    //   left: scrollLeft,
    //   behavior: 'smooth',
    // });
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

  setActiveToolbar() {
    this.isActiveToolbarSignal.set(false);
  }

  syncActiveObject() {
    const canvas = this.canvasManager.getActiveCanvas();
    const obj = canvas?.getActiveObject();
    if (obj) {
      this.activeObjectSignal.set(this.showToolbarFor(obj.type));
      this.setTextBoxSignal(obj);
      this.isActiveToolbarSignal.set(true);
    } else {
      this.activeObjectSignal.set(null);
      this.isActiveToolbarSignal.set(false);
    }
  }

  setTextBoxSignal(target: any) {
    if (target?.type === 'textbox') {
      const textbox = target as fabric.Textbox;
      this.textStyleSignal.set({
        fontSize: textbox.fontSize * (textbox.scaleY ?? 1),
        fontFamily: textbox.fontFamily || 'Arial',
        fontWeight: (textbox.fontWeight as any) || 'normal',
        fontStyle: (textbox.fontStyle as any) || 'normal',
        underline: !!textbox.underline,
        linethrough: !!textbox.linethrough,
        overline: !!textbox.overline,
        fill: (textbox.fill as string) || '#000000',
        textAlign: textbox.textAlign || 'left',
        scaleX: textbox.scaleX || 1,
        scaleY: textbox.scaleY || 1,
        opacity: textbox.opacity || 1,
        width: textbox.width,
        height: textbox.height,
      });
    } else if (target?.type === 'image') {
      const image = target as fabric.Image;
      this.imageStyleSignal.set({
        scaleX: image.scaleX ?? 1,
        scaleY: image.scaleY ?? 1,
        angle: image.angle ?? 0,
        opacity: image.opacity ?? 1,
        flipX: image.flipX ?? false,
        flipY: image.flipY ?? false,
        left: image.left ?? 0,
        top: image.top ?? 0,
        width: image.width ?? 0,
        height: image.height ?? 0,
        cropX: image.cropX ?? 0,
        cropY: image.cropY ?? 0,
        stroke: image.stroke ?? null,
        strokeWidth: image.strokeWidth ?? 0,
        strokeUniform: image.strokeUniform ?? false,
        shadow: image.shadow?.toString?.() ?? null,
        skewX: image.skewX ?? 0,
        skewY: image.skewY ?? 0,
        clipPath: image.clipPath ?? null,
        visible: image.visible ?? true,
        selectable: image.selectable ?? true,
        evented: image.evented ?? true,
        src: image.getSrc?.() ?? '',
      });
    } else {
      this.textStyleSignal.set(null);
    }
    // console.log('signal value after change', this.textStyleBox?.fontSize);
  }

  updateTextProperties(props: Partial<fabric.Textbox>) {
    const canvas = this.canvasManager.getActiveCanvas();
    const obj = canvas?.getActiveObject();

    if (obj && obj.type === 'textbox') {
      obj.set(props);
      canvas?.requestRenderAll();

      // Update signal after applying changes
      const textbox = obj as fabric.Textbox;
      this.textStyleSignal.set({
        fontSize: textbox.fontSize! * (textbox.scaleY ?? 1),
        fontFamily: textbox.fontFamily!,
        fontWeight: textbox.fontWeight as any,
        fontStyle: textbox.fontStyle as any,
        underline: !!textbox.underline,
        linethrough: !!textbox.linethrough,
        overline: !!textbox.overline,
        fill: textbox.fill as string,
        textAlign: textbox.textAlign,
        scaleX: textbox.scaleX,
        scaleY: textbox.scaleY,
        opacity: textbox.opacity || 0,
        width: textbox.width,
        height: textbox.height,
      });
    }

    console.log('signal value after change', this.textStyleBox?.fontSize);
  }

  updateActiveObjectProperties(object?: fabric.FabricObject) {
    const canvas = this.canvasManager.getActiveCanvas();
    let obj = object;
    if (!obj) {
      obj = canvas?.getActiveObject();
    }

    if (!obj) return;

    switch (obj.type) {
      case 'textbox':
        const textbox = obj as fabric.Textbox;
        this.textStyleSignal.set({
          fontSize: textbox.fontSize * (textbox.scaleY ?? 1),
          fontFamily: textbox.fontFamily ?? 'Arial',
          fontWeight: textbox.fontWeight as any,
          fontStyle: textbox.fontStyle as any,
          underline: !!textbox.underline,
          linethrough: !!textbox.linethrough,
          overline: !!textbox.overline,
          fill: textbox.fill as string,
          textAlign: textbox.textAlign,
          scaleX: textbox.scaleX,
          scaleY: textbox.scaleY,
          opacity: textbox.opacity || 1,
          width: textbox.width,
          height: textbox.height,
        });
        break;

      // case 'rect':
      // case 'circle':
      // case 'triangle':
      // case 'polygon':
      //   const shape = obj as fabric.Object;
      //   this.shapeStyleSignal.set({
      //     fill: shape.fill as string,
      //     stroke: shape.stroke as string,
      //     strokeWidth: shape.strokeWidth ?? 1,
      //     opacity: shape.opacity ?? 1,
      //     angle: shape.angle ?? 0,
      //     scaleX: shape.scaleX ?? 1,
      //     scaleY: shape.scaleY ?? 1,
      //   });
      //   break;

      case 'image':
        const image = obj as fabric.Image;
        this.imageStyleSignal.set({
          scaleX: image.scaleX ?? 1,
          scaleY: image.scaleY ?? 1,
          angle: image.angle ?? 0,
          opacity: image.opacity ?? 1,
          flipX: image.flipX ?? false,
          flipY: image.flipY ?? false,
          left: image.left ?? 0,
          top: image.top ?? 0,
          width: image.width ?? 0,
          height: image.height ?? 0,
          cropX: image.cropX ?? 0,
          cropY: image.cropY ?? 0,
          stroke: image.stroke ?? null,
          strokeWidth: image.strokeWidth ?? 0,
          strokeUniform: image.strokeUniform ?? false,
          shadow: image.shadow?.toString?.() ?? null,
          skewX: image.skewX ?? 0,
          skewY: image.skewY ?? 0,
          clipPath: image.clipPath ?? null,
          visible: image.visible ?? true,
          selectable: image.selectable ?? true,
          evented: image.evented ?? true,
          src: image.getSrc?.() ?? '',
        });
        break;

      default:
        console.warn(`Unhandled object type: ${obj.type}`);
    }
  }

  syncToolbarWithActiveObject(obj: fabric.Object | undefined | null) {
    if (!obj) {
      this.activeObjectSignal.set('page');
      this.setTextBoxSignal(null);
      this.isActiveToolbarSignal.set(true);
      return;
    }

    this.activeObjectSignal.set(this.showToolbarFor(obj.type));
    this.setTextBoxSignal(obj); // updates text styles
    this.updateActiveObjectProperties();
  }

  toggleActions(key: string): void {
    const canvas = this.canvasManager.getActiveCanvas();
    const obj = canvas?.getActiveObject() as fabric.Textbox;

    if (!obj || obj.type !== 'textbox') return;

    const current = this.textStyleSignal();

    if (!current) return;

    let updatedProps: Partial<fabric.Textbox> = {};

    switch (key) {
      case 'bold':
        updatedProps.fontWeight =
          current.fontWeight === 'bold' ? 'normal' : 'bold';
        break;
      case 'italic':
        updatedProps.fontStyle =
          current.fontStyle === 'italic' ? 'normal' : 'italic';
        break;
      case 'underline':
        updatedProps.underline = !current.underline;
        break;
      case 'linethrough':
        updatedProps.linethrough = !current.linethrough;
        break;
      case 'overline':
        updatedProps.overline = !current.overline;
        break;
      default:
        return;
    }

    this.updateTextProperties(updatedProps);
  }
  applySubOrSuperScript(mode: 'sub' | 'super') {
    const canvas = this.canvasManager.getActiveCanvas();
    const obj = canvas?.getActiveObject();

    if (obj && obj.type === 'textbox') {
      const textObj = obj as fabric.IText;
      const selectionStart = textObj.selectionStart ?? 0;
      const selectionEnd = textObj.selectionEnd ?? 0;

      if (selectionStart === selectionEnd) return; // Nothing selected

      const baseFontSize = textObj.fontSize ?? 40;
      const isSub = mode === 'sub';
      const offset = isSub ? baseFontSize * 0.2 : -baseFontSize * 0.3;
      const newFontSize = baseFontSize * 0.7;

      let toggleOff = true;

      // Check if already applied to entire selection
      for (let i = selectionStart; i < selectionEnd; i++) {
        const style = textObj.getSelectionStyles(i, i + 1)[0] ?? {};
        const isAlreadyApplied =
          Math.abs((style.deltaY ?? 0) - offset) < 1 &&
          Math.abs((style.fontSize ?? baseFontSize) - newFontSize) < 1;
        if (!isAlreadyApplied) {
          toggleOff = false;
          break;
        }
      }

      // Apply or Remove the styles
      for (let i = selectionStart; i < selectionEnd; i++) {
        if (toggleOff) {
          // Reset to default style
          textObj.setSelectionStyles(
            {
              fontSize: baseFontSize,
              deltaY: 0,
            },
            i,
            i + 1
          );
        } else {
          // Apply sub/super
          textObj.setSelectionStyles(
            {
              fontSize: newFontSize,
              deltaY: offset,
            },
            i,
            i + 1
          );
        }
      }

      textObj.canvas?.renderAll();
    }
  }

  alignTextbox(
    textbox: fabric.Textbox,
    canvas: fabric.Canvas,
    vertical: 'top' | 'middle' | 'bottom'
  ) {
    textbox.set({
      originX: 'center',
      left: canvas.getWidth() / 2,
    });

    if (vertical === 'top') {
      textbox.set({
        originY: 'top',
        top: 40, // or any top padding
      });
    } else if (vertical === 'middle') {
      textbox.set({
        originY: 'center',
        top: canvas.getHeight() / 2,
      });
    } else if (vertical === 'bottom') {
      textbox.set({
        originY: 'bottom',
        top: canvas.getHeight() - 40, // bottom padding
      });
    }

    textbox.setCoords();
    canvas.requestRenderAll();
  }

  setHorizontalAlignment(
    textbox: fabric.Textbox,
    canvas: fabric.Canvas,
    align: HorizontalAlign
  ) {
    // Align text inside the textbox
    textbox.textAlign = align;

    // Set origin for accurate placement
    if (align === 'left') {
      textbox.set({ originX: 'left', left: 0 });
    } else if (align === 'center') {
      textbox.set({
        originX: 'center',
        left: canvas.getWidth() / 2,
      });
    } else if (align === 'right') {
      textbox.set({
        originX: 'right',
        left: canvas.getWidth(),
      });
    }

    textbox.setCoords();
    canvas.requestRenderAll();
  }

  /**
   * Aligns a textbox horizontally and vertically on a resizable canvas.
   */
  setTextAlignment(
    textbox: fabric.Textbox,
    canvas: fabric.Canvas,
    hAlign: HorizontalAlign,
    vPosition: VerticalPosition
  ) {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Horizontal alignment (text alignment and position)
    switch (hAlign) {
      case 'left':
        textbox.set({
          left: 0,
          textAlign: 'left',
          originX: 'left',
        });
        break;
      case 'center':
        textbox.set({
          left: canvasWidth / 2,
          textAlign: 'center',
          originX: 'center',
        });
        break;
      case 'right':
        textbox.set({
          left: canvasWidth,
          textAlign: 'right',
          originX: 'right',
        });
        break;
    }

    // Vertical positioning (based on top Y position)
    const padding = 10;
    switch (vPosition) {
      case 'top':
        textbox.set({ top: padding, originY: 'top' });
        break;
      case 'middle':
        textbox.set({ top: canvasHeight / 2, originY: 'center' });
        break;
      case 'bottom':
        textbox.set({ top: canvasHeight - padding, originY: 'bottom' });
        break;
    }

    textbox.setCoords(); // Update object bounds
    canvas.requestRenderAll(); // Re-render canvas
  }

  updateImageProperties(props: Partial<fabric.Image>) {
    const canvas = this.canvasManager.getActiveCanvas();
    const obj = canvas?.getActiveObject();

    if (obj && obj.type === 'image') {
      obj.set(props);
      canvas?.requestRenderAll();

      // Update signal after applying changes
      const image = obj as fabric.Image;
      this.imageStyleSignal.set({
        scaleX: image.scaleX ?? 1,
        scaleY: image.scaleY ?? 1,
        angle: image.angle ?? 0,
        opacity: image.opacity ?? 1,
        flipX: image.flipX ?? false,
        flipY: image.flipY ?? false,
        left: image.left ?? 0,
        top: image.top ?? 0,
        width: image.width ?? 0,
        height: image.height ?? 0,
        cropX: image.cropX ?? 0,
        cropY: image.cropY ?? 0,
        stroke: image.stroke ?? null,
        strokeWidth: image.strokeWidth ?? 0,
        strokeUniform: image.strokeUniform ?? false,
        shadow: image.shadow?.toString?.() ?? null,
        skewX: image.skewX ?? 0,
        skewY: image.skewY ?? 0,
        clipPath: image.clipPath ?? null,
        visible: image.visible ?? true,
        selectable: image.selectable ?? true,
        evented: image.evented ?? true,
        src: image.getSrc?.() ?? '',
      });
    }

    console.log('signal value after change', this.imageStyleSignal);
  }
  updateObjects(options: {
    props?: Partial<fabric.Textbox>;
    imageProps?: Partial<fabric.Image>;
  }) {
    const canvas = this.canvasManager.getActiveCanvas();
    const obj = canvas?.getActiveObject();

    if (!obj) return;

    switch (obj.type) {
      case 'textbox':
        if (options.props) {
          this.updateTextProperties(options.props);
        }
        break;
      case 'image':
        if (options.imageProps) {
          this.updateImageProperties(options.imageProps);
        }
        break;
      default:
        return;
    }
  }

  updateSignalOnScale() {
    const activeObject = this.getCanvas()?.getActiveObject();
    if (!activeObject) return;

    // Textbox update
    if (activeObject.type === 'textbox') {
      const style = this.textStyleSignal();
      if (!style) return;

      this.updateTextProperties({
        width: (style.scaleX || 1) * (style.width || 1),
        height: (style.scaleY || 1) * (style.height || 1),
      });
    }
    // Image update
    else if (activeObject.type === 'image') {
      const style = this.imageStyleSignal();
      if (!style) return;

      this.updateImageProperties({
        width: (style.scaleX || 1) * (style.width || 1),
        height: (style.scaleY || 1) * (style.height || 1),
      });
    }
  }

  onUndo() {
    const id = this.canvasManager.getActiveCanvasId();
    const canvas = this.canvasManager.getActiveCanvas();
    if (id && canvas) this.undoRedoService.undo(id, canvas);
  }

  onRedo() {
    const id = this.canvasManager.getActiveCanvasId();
    const canvas = this.canvasManager.getActiveCanvas();
    if (id && canvas) this.undoRedoService.redo(id, canvas);
  }

  saveState() {
    const id = this.canvasManager.getActiveCanvasId();
    const canvas = this.canvasManager.getActiveCanvas();
    if (id && canvas) this.undoRedoService.saveState(id, canvas);
  }

  loadCanvasData() {
    this.isLoadingCanvasData = true;

    // this.canvasService.getCanvasData().subscribe({
    //   next: (data) => {
    //     this.fabricCanvas.loadFromJSON(data, () => {
    //       this.isLoadingCanvasData = false;
    //     });
    //   },
    //   error: () => {
    //     this.isLoadingCanvasData = false;
    //   },
    // });
  }
}
