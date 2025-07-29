import {
  computed,
  Injectable,
  signal,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import {
  CanvasLayer,
  CustomFabricObject,
  PageNumberPosition,
} from '../interface/interface';
import { isPlatformBrowser } from '@angular/common';
import { CanvasManagerService } from './canvas-manager.service';
import { ToolbarItem, ToolbarMode } from '../../assets/toolbar-config';

@Injectable({ providedIn: 'root' })
export class CanvasService {
  private pageNumberPosition: PageNumberPosition = 'bottom-right';

  private layersStore = signal<Map<string, CanvasLayer[]>>(new Map());
  activeCanvasId = signal<string | null>(null);

  lastPosition = { x: 100, y: 100 };
  offsetStep = 30;

  // Computed layer signal for currently active canvas
  layersSignal = computed(() => {
    console.log('this ran', this.activeCanvasId());
    const id = this.activeCanvasId();
    if (id) return this.layersStore().get(id);
    else return [];
  });

  readonly activeObjectSignal = signal<any>(null);

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
  } | null>(null);

  get textStyleBox() {
    return this.textStyleSignal();
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private canvasManager: CanvasManagerService
  ) {
    this.canvasManager.getActiveCanvasId$().subscribe((id) => {
      if (id) this.activeCanvasId.set(id);
    });
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
    const canvas = this.getCanvas();
    console.log('activce canvas', canvas);
    if (!canvas) return [];

    const customObjects = canvas.getObjects() as CustomFabricObject[];

    const layers = await Promise.all(
      customObjects.map(async (obj, index) => ({
        id: obj.id || String(index),
        name: obj.name,
        object: obj,
        hidden: !obj.visible,
        locked: obj.lockMovementX && obj.lockMovementY,
        preview: await this.generatePreview(obj),
      }))
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

  initCanvasEvents(
    canvas: fabric.Canvas,
    setToolbarVisible: (visible: boolean) => void
  ) {
    const sync = () => {
      this.refreshLayers();
      this.syncToolbarWithActiveObject(canvas.getActiveObject());
    };

    canvas.on('object:added', sync);
    canvas.on('object:removed', sync);
    canvas.on('object:modified', sync);

    canvas.on('selection:created', (e) =>
      this.syncToolbarWithActiveObject(e.selected?.[0])
    );

    canvas.on('selection:updated', (e) =>
      this.syncToolbarWithActiveObject(e.selected?.[0])
    );

    canvas.on('selection:cleared', () =>
      this.syncToolbarWithActiveObject(null)
    );

    canvas.on('mouse:down', (e) => {
      setToolbarVisible(true);
      this.syncToolbarWithActiveObject(e.target);
    });
  }

  // initCanvas(canvasInstance: fabric.Canvas) {
  //   const sync = () => this.refreshLayers();

  //   canvasInstance.on('object:added', sync);
  //   canvasInstance.on('object:removed', sync);
  //   canvasInstance.on('object:modified', sync);

  //   canvasInstance.on('selection:created', (e) =>
  //     this.activeObjectSignal.set(e.selected?.[0] || null)
  //   );
  //   canvasInstance.on('selection:updated', (e) =>
  //     this.activeObjectSignal.set(e.selected?.[0] || null)
  //   );
  //   canvasInstance.on('selection:cleared', () =>
  //     this.activeObjectSignal.set(null)
  //   );

  //   canvasInstance.on('mouse:down', (e) => {
  //     this.showToolbar = true;
  //     if (!e.target) {
  //       console.log('🟦 Empty canvas clicked');
  //       this.showToolbarFor('background');
  //     } else {
  //       this.showToolbarFor(e.target.type); // your method to update selection
  //     }
  //   });
  // }

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

  selectObject(obj: CustomFabricObject) {
    const canvas = this.getCanvas();
    if (!canvas) return;
    canvas.setActiveObject(obj);
    this.unlockObject(obj);
    canvas.renderAll();
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
    canvas : fabric.Canvas
  }) {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = config.canvas;

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

    setTimeout(() => {
      canvas.setWidth(canvas.getWidth() * scale);
      canvas.setHeight(canvas.getHeight() * scale);
      canvas.renderAll();
    })

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
        fontSize: textbox.fontSize *  (textbox.scaleY ?? 1),
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
      });
    } else {
      this.textStyleSignal.set(null); // hide toolbar if needed
    }
    console.log('signal value after change', this.textStyleBox?.fontSize);
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
        fontSize: textbox.fontSize! *  (textbox.scaleY ?? 1),
        fontFamily: textbox.fontFamily!,
        fontWeight: textbox.fontWeight as any,
        fontStyle: textbox.fontStyle as any,
        underline: !!textbox.underline,
        linethrough: !!textbox.linethrough,
        overline: !!textbox.overline,
        fill: textbox.fill as string,
        textAlign: textbox.textAlign,
        scaleX: textbox.scaleX,
        scaleY : textbox.scaleY
      });
    }

    console.log("signal value after change", this.textStyleBox?.fontSize);
  }

  updateActiveObjectProperties() {
    const canvas = this.canvasManager.getActiveCanvas();
    const obj = canvas?.getActiveObject();

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

      // case 'image':
      //   const image = obj as fabric.Image;
      //   this.imageStyleSignal.set({
      //     scaleX: image.scaleX ?? 1,
      //     scaleY: image.scaleY ?? 1,
      //     angle: image.angle ?? 0,
      //     opacity: image.opacity ?? 1,
      //     // any other image-specific props
      //   });
      //   break;

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
}
