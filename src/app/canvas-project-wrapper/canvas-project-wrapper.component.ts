import { ModeService } from './../services/mode.service';

import { CanvasControlService } from './../services/canvas-control.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, ElementRef, HostListener, Inject, Input, PLATFORM_ID, signal, Signal, ViewChild } from '@angular/core';
import { FabricEditorComponent } from '../fabric-editor/fabric-editor.component';
import { CanvasViewComponent } from '../canvas-view/canvas-view.component';
import { AppToolbarComponent } from '../app-toolbar/app-toolbar.component';
import { PagesToolbarComponent } from '../pages-toolbar/pages-toolbar.component';
import { TemplateService } from '../services/template.service';
import { LayerPanelComponent } from '../canvas/layer-panel.component';
import { CanvasService } from '../services/canvas.service';
import * as fabric from 'fabric'
import { CanvasPage, CustomFabricObject } from '../interface/interface';
import { v4 as uuidv4 } from 'uuid';
import { CanvasManagerService } from '../services/canvas-manager.service';
import { TOOLBAR_CONFIG, ToolbarMode } from '../../assets/toolbar-config';

@Component({
  selector: 'app-canvas-project-wrapper',
  imports: [
    CommonModule,
    CanvasViewComponent,
    AppToolbarComponent,
    PagesToolbarComponent,
    LayerPanelComponent,
  ],
  templateUrl: './canvas-project-wrapper.component.html',
  styleUrl: './canvas-project-wrapper.component.scss',
})
export class CanvasProjectWrapperComponent {
  @ViewChild('scrollWrapper') scrollWrapperRef!: ElementRef<HTMLDivElement>;
  activeObjectType!: Signal<ToolbarMode>;
  title: string = 'Add page title';
  showFloatingToolbar!: boolean;
  editorMode!: ToolbarMode;

  focusedCanvasId = signal<string | null>(null);
  isTouchScrolling!: boolean;

  constructor(
    private canvasControlService: CanvasControlService,
    private templateService: TemplateService,
    public canvasService: CanvasService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private canvasManagerService: CanvasManagerService,
    private modeService: ModeService
  ) {}

  isSidebarOpen = false;

  isViewOnly = false;
  toolbarConfig = TOOLBAR_CONFIG;
  toolbarPresets!: ToolbarMode;

  @ViewChild('canvasElement', { read: ElementRef })
  canvasContainerRef!: ElementRef;

  @ViewChild('toolbar', { read: ElementRef })
  toolbarContainerRef!: ElementRef;

  @ViewChild('canvasWrapeprEl')
  canvasWrapperRef!: ElementRef;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.templateService.templateSelected$.subscribe((template) => {
      this.pageWidth = template.width;
      this.pageHeight = template.height;
      this.addPage();
    });

    setTimeout(() => {
      this.calculateAndShiftCanvas();
    });

    this.modeService.mode$.subscribe(
      (mode) => (this.isViewOnly = 'viewing' == mode)
    );
  }

  showToolbar = true;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.canvasControlService.registerInstance(this);
    document.addEventListener('mousedown', this.handleDocumentClick);
  }

  isLayerPanelVisible = false;

  sidebarWidth = 0;

  pageNames: string[] = [];

  pages: CanvasPage[] = [
    {
      id: uuidv4(),
      title: 'Cover Page',
      template: 'A4',
      width: 794,
      height: 1123,
      createdBy: 'Touheed',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVisible: true,
      isLocked: false,
    },
  ];

  sidebarOffset = 0;

  activePageIndex = 0;

  addPage(canvasPage?: CanvasPage) {
    if (this.isViewOnly) return;
    if (canvasPage) {
      this.pages.push(canvasPage);
      this.focusedCanvasId.set(canvasPage.id);
    } else {
      const id = uuidv4();
      this.pages.push({
        id: id,
        title: this.title,
        template: 'A4',
        width: 794,
        height: 1123,
        data: {}, // serialized fabric JSON
        createdBy: 'Touheed',
        createdAt: new Date(),
        updatedAt: new Date(),
        isVisible: true,
        background: 'white',
      });
      this.activePageIndex = this.pages.length - 1;
      this.focusedCanvasId.set(id);
    }
  }

  shiftLayout(offset: number) {
    this.sidebarOffset = offset;
  }

  pageWidth = 1000; // A4 default
  pageHeight = 500;
  pageData = null;

  transformStyle = {
    transform: 'translateX(0px)',
    transition: 'transform 0.3s ease',
  };

  transformStyleForToolbar = {
    transform: 'translateX(0px)',
    transition: 'transform 0.3s ease',
  };
  toolbarOffset = 0;

  shiftCanvasIntoViewport(
    templateWidth: number,
    templateHeight: number,
    availableWidth: number,
    availableHeight: number
  ): void {
    // ✅ 1. Calculate best-fit scale to fully fit canvas in available viewport
    // const scaleX = availableWidth / templateWidth;
    // const scaleY = availableHeight / templateHeight;
    // const scale = Math.min(scaleX, scaleY, 1); // Never upscale beyond 100%
    // // ✅ 2. Center the canvas using leftover space
    // const translateX = (availableWidth - templateWidth * scale) / 2;
    // const translateY = (availableHeight - templateHeight * scale) / 2;
    // // ✅ 3. Apply transform style
    // this.transformStyle = {
    //   transform: `translateX(${translateX + this.sidebarOffset}px) scale(${scale})`,
    //   transition: 'transform 0.3s ease'
    // };
    // this.toolbarOffset = 0;
    // console.log('Applied transform:', this.transformStyle);
  }

  genericUpdate(updatedPage: CanvasPage) {
    const index = this.pages.findIndex((p) => p.id === updatedPage.id);
    if (index !== -1) {
      this.pages[index] = updatedPage;
    }
    console.log(this.pages[index]);
  }

  onTitleUpdated(updatedPage: CanvasPage) {
    this.genericUpdate(updatedPage);
  }

  onHidePage(updatedPage: CanvasPage) {
    this.genericUpdate(updatedPage);
  }

  calculateAndShiftCanvas(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const sidebar = document.getElementById('sidebar');

    const headerHeight = header?.offsetHeight || 0;
    const footerHeight = footer?.offsetHeight || 0;
    const sidebarWidth = sidebar?.offsetWidth || 0;

    const totalWidth = window.innerWidth;
    const totalHeight = window.innerHeight;

    const availableWidth = totalWidth - sidebarWidth;
    const availableHeight = totalHeight - headerHeight - footerHeight;

    const templateWidth = this.pageWidth || 1000;
    const templateHeight = this.pageHeight || 1000;

    const scaleX = availableWidth / templateWidth;
    const scaleY = availableHeight / templateHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Never upscale beyond 100%

    // ✅ 2. Center the canvas using leftover space
    const translateX = (availableWidth - templateWidth * scale) / 2;
    const translateY = (availableHeight - templateHeight * scale) / 2;

    // ✅ 3. Apply transform style
    this.transformStyle = {
      transform: `scale(${scale})`,
      transition: 'transform 0.3s ease',
    };
    this.toolbarOffset = 0;
    this.sidebarWidth = 340;

    console.log('Applied transform:', this.transformStyle);
  }

  restoreCanvasTransform(): void {
    this.transformStyle = {
      transform: `translateX(0px) scale(1)`,
      transition: 'transform 0.3s ease',
    };

    this.transformStyleForToolbar = {
      transform: `translate(0px, 0px) scale(1)`,
      transition: 'transform 0.3s ease',
    };

    const sidebarWidth = -420; // or your actual sidebar width
    this.toolbarOffset = sidebarWidth / 2; // shift right by half sidebar

    console.log('✅ Restored canvas to original position');
  }

  ngOnChanges() {
    this.updateToolbarOffset();
  }

  updateToolbarOffset() {
    const sidebarWidth = 420; // or your actual sidebar width
    this.toolbarOffset = sidebarWidth / 2;
  }

  onDeletePage(): void {
    if (this.isViewOnly) return;
    if (this.pages.length <= 1) return;
    this.pages.splice(this.activePageIndex, 1);
    this.activePageIndex = Math.max(0, this.activePageIndex - 1);
  }

  onDuplicatePage(updatedPage: CanvasPage) {
    if (this.isViewOnly) return;
    console.log('📥 Received duplicated page in parent:', updatedPage);
    this.addPage(updatedPage);
  }

  onRenamePage(): void {
    if (this.isViewOnly) return;
    this.pageNames[this.activePageIndex] = 'newName';
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateAndShiftCanvas();
  }

  onPageUp(index: number) {
    if (this.isViewOnly) return;
    if (index > 0) {
      [this.pages[index - 1], this.pages[index]] = [
        this.pages[index],
        this.pages[index - 1],
      ];
    }
  }

  onPageDown(index: number) {
    if (this.isViewOnly) return;
    if (index < this.pages.length - 1) {
      [this.pages[index + 1], this.pages[index]] = [
        this.pages[index],
        this.pages[index + 1],
      ];
    }
  }

  onLockToggle(updatedCanvas: CanvasPage) {
    if (this.isViewOnly) return;
    const shouldLock = !!updatedCanvas.isLocked;
    this.genericUpdate(updatedCanvas);

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

  // showToolbarFor(obj: string) {
  //   if (obj === 'background') {
  //     this.toolbarPresets = 'page';
  //   } else if (obj === 'textbox') {
  //     this.toolbarPresets = 'text';
  //   } else if (obj === 'image') {
  //     this.toolbarPresets = 'image';
  //   } else if (obj === 'rect' || obj === 'circle' || obj === 'triangle') {
  //     this.toolbarPresets = 'shape';
  //   }
  // }

  // handleClickOutside = (event: MouseEvent) => {
  //   const canvasEl = this.canvasContainerRef.nativeElement as HTMLElement;
  //   if (!canvasEl.contains(event.target as Node)) {
  //     // Clicked outside canvas container
  //     this.showToolbar = false;
  //   }
  // };

  // ngOnDestroy(): void {
  //   document.removeEventListener('click', this.handleClickOutside, true);
  // }

  handleCanvasClick(event: { mode: ToolbarMode; showToolbar: boolean }) {
    this.showFloatingToolbar = event.showToolbar;
    this.editorMode = event.mode;
  }

  handleDocumentClick = (event: MouseEvent) => {
    const canvasEl = this.canvasContainerRef?.nativeElement;
    const toolbarEl = this.toolbarContainerRef?.nativeElement;
    const canvasWrapperEl = this.canvasWrapperRef?.nativeElement;

    const target = event.target as Node;

    if (
      canvasWrapperEl?.contains(target) && // clicked inside wrapper
      !canvasEl?.contains(target) && // not on canvas
      !toolbarEl?.contains(target) // not on toolbar
    ) {
      console.log('📌 Clicked outside the canvas but inside wrapper!');
      if (this.canvasService.activeObjectSignal() !== 'null') {
        this.canvasService.setActiveToolbar();
      }
    }
  };

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.removeEventListener('mousedown', this.handleDocumentClick);
  }

  get isToolbarVisible() {
    return this.canvasService.isToolbarActive;
  }

  focusCanvas(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.isViewOnly || this.focusedCanvasId() === id) return;
    this.focusedCanvasId.set(id);
  }

  isFocused(id: string): boolean {
    console.log(id, ' focused', this.focusedCanvasId());
    console.log('is focused or not ', this.focusedCanvasId() === id);
    return this.focusedCanvasId() === id;
  }

  @HostListener('document:click', ['$event'])
  onGlobalClick(event: MouseEvent) {
    const clickedInsideCanvas = this.canvasContainerRef?.nativeElement.contains(
      event.target as Node
    );
    const clickedAddBtn = (event.target as HTMLElement).closest('.add-btn');
    console.log('Clicked outside any canvas or .add-btn');

    if (!clickedInsideCanvas && !clickedAddBtn) {
      this.focusedCanvasId.set(null); // only remove border
    }
  }

  // onTouchStart = () => {
  //   this.isTouchScrolling = true;
  //    const canvas = this.canvasManagerService.getActiveCanvas();
  //   if (canvas) {
  //     canvas.selection = false;
  //     canvas.skipTargetFind = true;
  //   }
  // };

  // onTouchEnd = () => {
  //   this.isTouchScrolling = false;
  //  const  canvas = this.canvasManagerService.getActiveCanvas();
  //   if (canvas) {
  //     canvas.selection = true;
  //     canvas.skipTargetFind = false;
  //   }
  // };

  zoomLevel = 1;

  @HostListener('wheel', ['$event'])
  onZoomCanvas(event: WheelEvent) {
    const zoomable = (event.target as HTMLElement).closest(
      '#canvas-wrapper-parent'
    );
    if (event.ctrlKey && zoomable) {
      event.preventDefault();

      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      this.zoomLevel = Math.min(Math.max(this.zoomLevel + delta, 0.2), 3); // Clamp zoom
      
    }
  }
  
}
