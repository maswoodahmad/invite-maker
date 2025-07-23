
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
import { CustomFabricObject, ToolbarMode } from '../interface/interface';

@Component({
  selector: 'app-canvas-project-wrapper',
  imports: [CommonModule, CanvasViewComponent, AppToolbarComponent, PagesToolbarComponent, LayerPanelComponent],
  templateUrl: './canvas-project-wrapper.component.html',
  styleUrl: './canvas-project-wrapper.component.scss'
})
export class CanvasProjectWrapperComponent {
  @ViewChild('scrollWrapper') scrollWrapperRef!: ElementRef<HTMLDivElement>;
  activeObjectType!: Signal<ToolbarMode>;

  constructor(private canvasControlService: CanvasControlService, private templateService: TemplateService,
    public canvasService: CanvasService,
    @Inject(PLATFORM_ID) private platformId: Object,

  ) { }





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

 




  pageNames: string[] = [];

  pages = [{ id: 1, template: 'A4', data: {} }];
  sidebarOffset = 0;

  activePageIndex = 0;

  addPage(template?: { width: number; height: number; }) {
    this.pages.push({ id: this.pages.length + 1, template: 'A4', data: {} });
    this.activePageIndex = this.pages.length - 1;
  }

  shiftLayout(offset: number) {
    this.sidebarOffset = offset;
  }

  pageWidth = 1000 ; // A4 default
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
    availableHeight: number
  ): void {
    // ✅ 1. Calculate best-fit scale to fully fit canvas in available viewport
    const scaleX = availableWidth / templateWidth;
    const scaleY = availableHeight / templateHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Never upscale beyond 100%

    // ✅ 2. Center the canvas using leftover space
    const translateX = (availableWidth - templateWidth * scale) / 2;
    const translateY = (availableHeight - templateHeight * scale) / 2;

    // ✅ 3. Apply transform style
    this.transformStyle = {
      transform: `translateX(${translateX}px) scale(${scale})`,
      transition: 'transform 0.3s ease'
    };
    this.toolbarOffset = 0;

    console.log('Applied transform:', this.transformStyle);
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

  onDuplicatePage() {this.addPage()}

  onRenamePage(): void {
    this.pageNames[this.activePageIndex] = 'newName';
  }


  @HostListener('window:resize')
  onResize() {
    this.calculateAndShiftCanvas();
  }
}
