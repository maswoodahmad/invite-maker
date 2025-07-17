import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import * as fabric from 'fabric'; // works with v5 and v6 in Angular
import { CanvasObjectToolbarComponent } from '../canvas-object-toolbar/canvas-object-toolbar.component';
import { RecentUploadsService } from '../recent-uploads.service';
import { deleteIcon } from '../../assets/icons/delete-icon';
import { FormsModule } from '@angular/forms'
import { CanvasZoomService } from '../services/canvas-zoom.service';
import { TOOLBAR_CONFIG } from '../../assets/toolbar-config';
import { CanvasObjectContextMenuComponent } from '../canvas-object-context-menu/canvas-object-context-menu.component';
import { CanvasControlService } from '../services/canvas-control.service';









@Component({
  selector: 'app-fabric-editor',
  standalone: true,
  imports: [CommonModule, CanvasObjectToolbarComponent, FormsModule , CanvasObjectContextMenuComponent],
  templateUrl: './fabric-editor.component.html',
  styleUrls: ['./fabric-editor.component.scss'],
})
export class FabricEditorComponent implements AfterViewInit, OnDestroy {

  canvas!: fabric.Canvas;
  @Input() template!: string;  // e.g., 'A4', 'Poster', 'Card'
  @Input() data: any;
  zoom = 1;
  isPanning = false;
  lastPosX = 0;
  lastPosY = 0;
  gridSize = 20;
  selectedObject: fabric.Object | null = null;
  toolbarPosition = { top: 0, left: 0 };

  zoomPercent = 100;

  contextMenuVisible = false;
  contextMenuPosition = { top: 0, left: 0 };

  toolbarConfig = TOOLBAR_CONFIG;



  @ViewChild('canvasWrapper', { static: true }) canvasWrapper!: ElementRef;

  @ViewChild('canvasScrollWrapper') canvasScrollWrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasOuter') canvasOuterRef!: ElementRef<HTMLDivElement>;
  toolbarPresets!: {  type: string; label: string; icon: string; key: string }[];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    public uploads: RecentUploadsService,

    private cdr: ChangeDetectorRef,
    private zoomService: CanvasZoomService,
    private canvasControlService: CanvasControlService
  ) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    //this.canvasControlService.registerInstance(this);

    const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
    const wrapper = canvasEl.parentElement as HTMLElement;

    // Resize canvas to fit container
    canvasEl.width = wrapper.clientWidth;
    canvasEl.height = wrapper.clientHeight;

    this.canvas = new fabric.Canvas(canvasEl, {
      preserveObjectStacking: true,
      selection: true,
    });

   // this.drawGrid(this.gridSize);
    this.addSnapToGrid();
    this.enablePanning();
    this.makeResponsive();

    this.canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      this.selectedObject = obj;
      if (obj) this.updateToolbarPosition(obj);
    });

    this.canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      this.selectedObject = obj;
      if (obj) this.updateToolbarPosition(obj);
    });

    this.canvas.on('selection:cleared', () => {
      this.selectedObject = null;
    });

    this.canvas.on('object:moving', (e) => {
      if (e.target === this.selectedObject) {
        this.updateToolbarPosition(e.target);
      }
    });

    this.canvas.on('object:scaling', (e) => {
      if (e.target === this.selectedObject) {
        this.updateToolbarPosition(e.target);
      }
    });

    this.canvas.on('object:modified', (e) => {
      if (e.target === this.selectedObject) {
        this.updateToolbarPosition(e.target);
      }
    });

    this.canvas.on('mouse:down', (e) => {
      if (!e.target) {
        // 🟦 User clicked on empty canvas area
        this.selectedObject = null; // or null if you prefer
        this.showToolbarFor('background'); // Your function to handle toolbar rendering
      } else {
        // 🟥 An object was clicked
        this.selectedObject = e.target;
        this.showToolbarFor(e.target);
      }
    });

    this.canvasScrollWrapperRef.nativeElement.addEventListener('scroll', () => {
      if (this.selectedObject) {
        this.updateToolbarPosition(this.selectedObject);
      }
    });


    this.canvas.on('object:moving', (e) => this.updateToolbarPosition(e.target));
    this.canvas.on('mouse:wheel', () => {

      setTimeout(() => {
        if(this.selectedObject)  this.updateToolbarPosition(this.selectedObject)
      }, 50);
});
    this.canvas.on('after:render', () => {
  if( this.selectedObject)
  this.updateToolbarPosition(this.selectedObject);
    });




    const img = new Image();
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png';

    img.onload = () => {
      const fabricImg = new fabric.Image(img, {
        left: 500,
        top: 500,
        scaleX: 0.5,
        scaleY: 0.5,
      });
      this.attachDeleteControl(fabricImg);
      this.canvas.add(fabricImg);
    }

    this.zoomService.init(this.canvas);
    this.zoomService.refreshLayoutAndRecenter(this.canvasScrollWrapperRef.nativeElement, this.canvasOuterRef.nativeElement)

    // OPTIONAL: Test image (remove in prod)
  }

  makeResponsive(): void {
    const container = document.querySelector('.canvas-container-wrapper') as HTMLElement;
    if (!container) return;

    const scale = container.clientWidth / this.canvas.width!;
    this.canvas.setZoom(scale);
    this.canvas.setDimensions({
      width: this.canvas.width! * scale,
      height: this.canvas.height! * scale,
    });
    this.canvas.renderAll();

    window.addEventListener('resize', () => this.makeResponsive());
  }

  drawGrid(size: number): void {
    const designArea = new fabric.Rect({
      width: 794,
      height: 1123,
      fill: '#fff',
      selectable: false,
      evented: false,
      stroke: '#ddd',
      strokeDashArray: [5, 5],
      originX: 'center',
      originY: 'center',
      left: this.canvas.getWidth() / 2,
      top: this.canvas.getHeight() / 2,
    });
    this.canvas.add(designArea);
  }

  addSnapToGrid(): void {
    this.canvas.on('object:moving', (opt) => {
      const obj = opt.target!;
      obj.set({
        left: Math.round(obj.left! / this.gridSize) * this.gridSize,
        top: Math.round(obj.top! / this.gridSize) * this.gridSize,
      });
    });
  }

  enablePanning(): void {
    this.canvas.on('mouse:down', (opt) => {
      if (!opt.target) {
        this.isPanning = true;
        const evt = opt.e as MouseEvent | TouchEvent;
        this.lastPosX = 'touches' in evt ? evt.touches[0].clientX : (evt as MouseEvent).clientX;
        this.lastPosY = 'touches' in evt ? evt.touches[0].clientY : (evt as MouseEvent).clientY;
      }
    });

    this.canvas.on('mouse:move', (opt) => {
      if (this.isPanning) {
        const evt = opt.e as MouseEvent | TouchEvent;
        const clientX = 'touches' in evt ? evt.touches[0].clientX : (evt as MouseEvent).clientX;
        const clientY = 'touches' in evt ? evt.touches[0].clientY : (evt as MouseEvent).clientY;
        this.canvas.relativePan(new fabric.Point(clientX - this.lastPosX, clientY - this.lastPosY));
        this.lastPosX = clientX;
        this.lastPosY = clientY;
      }
    });

    this.canvas.on('mouse:up', () => {
      this.isPanning = false;
    });
  }

  addText(): void {
    const text = new fabric.IText('Tap to edit', {
      left: 50,
      top: 50,
      fontSize: 20,
      fill: '#000',
    });
    this.canvas.add(text);
  }

  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      // 🔐 Save to recent uploads (you likely have this service already)
      this.uploads.save(dataUrl); // save to localStorage

      const img = new Image();
      img.onload = () => {
        const fabricImg = new fabric.Image(img, {
          left: 50,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });

        this.attachDeleteControl(fabricImg);


        this.canvas.add(fabricImg);
        this.canvas.renderAll();
      };

      img.onerror = () => {
        console.error('❌ Image failed to load');
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      console.error('❌ FileReader error');
    };

    reader.readAsDataURL(file);
  }

  zoomIn(): void {
    this.zoom = Math.min(this.zoom + 0.1, 2);
    this.canvas.setZoom(this.zoom);
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoom - 0.1, 0.3);
    this.canvas.setZoom(this.zoom);
  }

  exportCanvas(): void {
    const dataUrl = this.canvas.toDataURL({ format: 'png', multiplier: 1 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'invitation.png';
    link.click();
  }

  addImageFromHistory(dataUrl: string): void {
    const img = new Image();
    img.onload = () => {
      const fabricImg = new fabric.Image(img, {
        left: 50,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
      });

      this.attachDeleteControl(fabricImg);
      this.canvas.add(fabricImg);
      this.canvas.renderAll();
    };
    img.onerror = () => {
      console.error('❌ Failed to load image from history');
    };
    img.src = dataUrl;
  }

  deleteObjectTouch(_eventData: any, transform: any) {
    const canvas = transform.target.canvas;
    canvas.remove(transform.target);
    canvas.requestRenderAll();
  }

  renderIcon(ctx: any, left: any, top: any, _styleOverride: any, fabricObject: any) {
    const iconSize = 24;
    const img = new Image();
    img.src = deleteIcon;
    const size = 50;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  attachDeleteControl(fabricObject: any): void {
    fabricObject.controls['deleteControl'] = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: this.deleteObjectTouch,
      render: this.renderIcon,
    });
  }

  deleteObject(): void {
    if (this.selectedObject) {
      this.canvas.remove(this.selectedObject);
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
      this.selectedObject = null;
    }
  }



  duplicateObject(): void {
    if (!this.selectedObject) return;

    this.selectedObject.clone().then((cloned: fabric.Object) => {
      cloned.set({
        left: (this.selectedObject!.left || 0) + 20,
        top: (this.selectedObject!.top || 0) + 20,
      });

      this.canvas.add(cloned);
      this.canvas.setActiveObject(cloned);
      this.canvas.requestRenderAll();
    });
  }

  sendBackward(): void {
    if (!this.selectedObject) return;
    const objects = this.canvas.getObjects();
    const index = objects.indexOf(this.selectedObject);
    if (index > 0) {
      [objects[index - 1], objects[index]] = [objects[index], objects[index - 1]];
      this.refreshCanvas(objects);
    }
  }

  sendToBack(): void {
    if (!this.selectedObject) return;
    const objects = this.canvas.getObjects();
    const index = objects.indexOf(this.selectedObject);
    if (index > 0) {
      objects.splice(index, 1);
      objects.unshift(this.selectedObject);
      this.refreshCanvas(objects);
    }
  }

  bringForward(): void {
    if (!this.selectedObject) return;
    const objects = this.canvas.getObjects();
    const index = objects.indexOf(this.selectedObject);
    if (index < objects.length - 1) {
      [objects[index], objects[index + 1]] = [objects[index + 1], objects[index]];
      this.refreshCanvas(objects);
    }
  }

  bringToFront(): void {
    if (!this.selectedObject) return;
    const objects = this.canvas.getObjects();
    const index = objects.indexOf(this.selectedObject);
    if (index !== -1 && index < objects.length - 1) {
      objects.splice(index, 1);
      objects.push(this.selectedObject);
      this.refreshCanvas(objects);
    }
  }

  private refreshCanvas(objects: fabric.Object[]): void {
    this.canvas.clear();
    objects.forEach(obj => this.canvas.add(obj));
    if (this.selectedObject) {
      this.canvas.setActiveObject(this.selectedObject);
    }
    this.canvas.requestRenderAll();
  }



  updateToolbarPosition(object: fabric.Object) {
    if (!this.canvasScrollWrapperRef?.nativeElement || !object || !this.canvas) return;

    const wrapper = this.canvasScrollWrapperRef.nativeElement as HTMLElement;
    const zoom = this.canvas.getZoom();

    const objRect = object.getBoundingRect(); // ✅ true = absolute on canvas
    const wrapperRect = wrapper.getBoundingClientRect();

    const scrollLeft = wrapper.scrollLeft;
    const scrollTop = wrapper.scrollTop;

    const toolbarHeight = 40;
    const gap = 8;

    // ✅ Convert object position to wrapper-relative
    const topInWrapper = (objRect.top * zoom) - scrollTop;
    const leftInWrapper = ((objRect.left + objRect.width / 2) * zoom) - scrollLeft;

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

  lockObject(): void {
    if (!this.selectedObject) return;

    this.selectedObject.selectable = true;
    this.selectedObject.evented = true;

    this.selectedObject.lockMovementX = true;
    this.selectedObject.lockMovementY = true;
    this.selectedObject.lockScalingX = true;
    this.selectedObject.lockScalingY = true;
    this.selectedObject.lockRotation = true;

    this.contextMenuVisible = false;


    this.canvas.requestRenderAll();
  }

  unlockObject(): void {
    if (!this.selectedObject) return;

    this.selectedObject.selectable = true;
    this.selectedObject.evented = true;

    this.selectedObject.hasControls = true;
    this.selectedObject.hasBorders = true;

    this.selectedObject.lockMovementX = false;
    this.selectedObject.lockMovementY = false;
    this.selectedObject.lockScalingX = false;
    this.selectedObject.lockScalingY = false;
    this.selectedObject.lockRotation = false;

    this.canvas.requestRenderAll();
  }


  moveObjectToIndex(object: fabric.Object, targetIndex: number): void {
    const objects = this.canvas.getObjects();

    const currentIndex = objects.indexOf(object);
    if (currentIndex === -1 || targetIndex === currentIndex) return;

    // Remove object
    objects.splice(currentIndex, 1);

    // Clamp index to safe range
    const newIndex = Math.max(0, Math.min(objects.length, targetIndex));

    // Insert at new index
    objects.splice(newIndex, 0, object);

    // FULL reset: clear canvas and re-add all in new order
    this.canvas.clear(); // remove everything
    objects.forEach(obj => this.canvas.add(obj)); // re-add all in new order

    this.canvas.setActiveObject(object);
    this.canvas.requestRenderAll();
  }


   // Default 100%

onZoomSliderChange(event: Event): void {
  const percent = +(event.target as HTMLInputElement).value;
  this.zoom = percent / 100;
  this.canvas.setZoom(this.zoom);
  this.canvas.requestRenderAll();
}

  ngOnDestroy(): void {
    this.canvas?.dispose();
  }



  selectedObjectType: 'text' | 'image' | 'shape' | 'background' | null = null;

  onObjectSelected(obj: fabric.Object): void {
    this.selectedObject = obj;

    if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
      this.selectedObjectType = 'text';
    } else if (obj.type === 'image') {
      this.selectedObjectType = 'image';
    } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') {
      this.selectedObjectType = 'shape';
    } else if (obj === this.canvas.backgroundImage) {
      this.selectedObjectType = 'background';
    } else {
      this.selectedObjectType = null;
    }
  }


  showToolbarFor(obj: any) {
    if (obj === 'background') {
      this.toolbarPresets = this.toolbarConfig['page'];
    } else if (obj.type === 'textbox') {
      this.toolbarPresets = this.toolbarConfig['text'];
    } else if (obj.type === 'image') {
      this.toolbarPresets = this.toolbarConfig['image'];
    } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') {
      this.toolbarPresets = this.toolbarConfig['shape'];
    }
  }
  // This will be bound to your canvas container
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

}

