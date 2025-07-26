
import { CanvasControlService } from './../services/canvas-control.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, ElementRef, HostListener, Inject, Input, PLATFORM_ID, Signal, ViewChild } from '@angular/core';
import { FabricEditorComponent } from '../fabric-editor/fabric-editor.component';
import { CanvasViewComponent } from '../canvas-view/canvas-view.component';
import { AppToolbarComponent } from '../app-toolbar/app-toolbar.component';
import { PagesToolbarComponent } from '../pages-toolbar/pages-toolbar.component';
import { TemplateService } from '../services/template.service';
import { LayerPanelComponent } from '../canvas/layer-panel.component';
import { CanvasService } from '../services/canvas.service';
import * as fabric from 'fabric'
import { CanvasPage, CustomFabricObject, ToolbarMode } from '../interface/interface';
import { v4 as uuidv4 } from 'uuid';
import { CanvasManagerService } from '../services/canvas-manager.service';

@Component({
  selector: 'app-canvas-project-wrapper',
  imports: [CommonModule, CanvasViewComponent, AppToolbarComponent, PagesToolbarComponent, LayerPanelComponent],
  templateUrl: './canvas-project-wrapper.component.html',
  styleUrl: './canvas-project-wrapper.component.scss'
})
export class CanvasProjectWrapperComponent {
  @ViewChild('scrollWrapper') scrollWrapperRef!: ElementRef<HTMLDivElement>;
  activeObjectType!: Signal<ToolbarMode>;
  title: string = 'Add page title'

  constructor(private canvasControlService: CanvasControlService, private templateService: TemplateService,
    public canvasService: CanvasService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private canvasManagerService : CanvasManagerService

  ) { }


  isSidebarOpen = false;


  ngOnInit() {
    this.templateService.templateSelected$.subscribe(template => {
      this.pageWidth = template.width;
      this.pageHeight = template.height;
      this.addPage();
    });

    setTimeout(() => {
      this.calculateAndShiftCanvas();
    })
    this.activeObjectType = computed((): ToolbarMode => {
      const obj = this.canvasService.activeObjectSignal();
      if (!obj) return null;

      if (obj instanceof fabric.Textbox) return 'text';
      if (obj instanceof fabric.Image) return 'image';
      if (obj instanceof fabric.Rect || obj instanceof fabric.Circle) return 'shape';
      // Add page-related check if needed
      return null;
    });






  }

  ngAfterViewInit() {

    this.canvasControlService.registerInstance(this);

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
      isLocked : false
    }
  ];


  sidebarOffset = 0;

  activePageIndex = 0;

  addPage(canvasPage?: CanvasPage) {

    if (canvasPage) {
      this.pages.push(canvasPage)
    } else {
      this.pages.push({
        id: uuidv4(),
        title: this.title,
        template: 'A4', width: 794,
        height: 1123,
        data: {}, // serialized fabric JSON
        createdBy: 'Touheed',
        createdAt: new Date(),
        updatedAt: new Date(),
        isVisible: true
      });
      this.activePageIndex = this.pages.length - 1;
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
    transition: 'transform 0.3s ease'
  };

  transformStyleForToolbar = {
    transform: 'translateX(0px)',
    transition: 'transform 0.3s ease'
  };
  toolbarOffset = 0;


  shiftCanvasIntoViewport(
    templateWidth: number,
    templateHeight: number,
    availableWidth: number,
    availableHeight: number,

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
    const index = this.pages.findIndex(p => p.id === updatedPage.id);
    if (index !== -1) {
      this.pages[index] = updatedPage;
    }
    console.log(this.pages[index])
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
      transition: 'transform 0.3s ease'
    };
    this.toolbarOffset = 0;
    this.sidebarWidth = 340;

    console.log('Applied transform:', this.transformStyle);


  }



  restoreCanvasTransform(): void {
    this.transformStyle = {
      transform: `translateX(0px) scale(1)`,
      transition: 'transform 0.3s ease'
    };

    this.transformStyleForToolbar = {
      transform: `translate(0px, 0px) scale(1)`,
      transition: 'transform 0.3s ease'
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
    if (this.pages.length <= 1) return;
    this.pages.splice(this.activePageIndex, 1);
    this.activePageIndex = Math.max(0, this.activePageIndex - 1);

  }

  onDuplicatePage(updatedPage: CanvasPage) {
    console.log('📥 Received duplicated page in parent:', updatedPage);
     this.addPage(updatedPage);
  }

  onRenamePage(): void {
    this.pageNames[this.activePageIndex] = 'newName';
  }


  @HostListener('window:resize')
  onResize() {
    this.calculateAndShiftCanvas();
  }

  onPageUp(index: number) {
    if (index > 0) {
      [this.pages[index - 1], this.pages[index]] = [this.pages[index], this.pages[index - 1]];
    }
  }

  onPageDown(index: number) {
    if (index < this.pages.length - 1) {
      [this.pages[index + 1], this.pages[index]] = [this.pages[index], this.pages[index + 1]];
    }
  }

  onLockToggle(updatedCanvas: CanvasPage) {
    const shouldLock = !!updatedCanvas.isLocked;
    this.genericUpdate(updatedCanvas);

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
