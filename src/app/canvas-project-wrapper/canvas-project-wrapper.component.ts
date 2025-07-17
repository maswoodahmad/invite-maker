
import { CanvasControlService } from './../services/canvas-control.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FabricEditorComponent } from '../fabric-editor/fabric-editor.component';
import { CanvasViewComponent } from '../canvas-view/canvas-view.component';
import { AppToolbarComponent } from '../app-toolbar/app-toolbar.component';
import { PagesToolbarComponent } from '../pages-toolbar/pages-toolbar.component';

@Component({
  selector: 'app-canvas-project-wrapper',
  imports: [CommonModule, CanvasViewComponent, AppToolbarComponent, PagesToolbarComponent],
  templateUrl: './canvas-project-wrapper.component.html',
  styleUrl: './canvas-project-wrapper.component.scss'
})
export class CanvasProjectWrapperComponent {
  @ViewChild('scrollWrapper') scrollWrapperRef!: ElementRef<HTMLDivElement>;

  constructor(private canvasControlService: CanvasControlService) { }

  ngAfterViewInit() {

    this.canvasControlService.registerInstance(this);

  }

  pageNames: string[] = [];

  pages = [{ id: 1, template: 'A4', data: {} }];
  sidebarOffset = 0;

  activePageIndex = 0;

  addPage() {
    this.pages.push({ id: this.pages.length + 1, template: 'A4', data: {} });
    this.activePageIndex = this.pages.length - 1;
  }

  shiftLayout(offset: number) {
    this.sidebarOffset = offset;
  }

  pageWidth = 1000 * .5; // A4 default
  pageHeight = 500 * .5;
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
}
