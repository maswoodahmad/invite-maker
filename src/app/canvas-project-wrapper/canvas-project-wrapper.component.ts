import { CanvasControlService } from './../services/canvas-control.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FabricEditorComponent } from '../fabric-editor/fabric-editor.component';
import { CanvasViewComponent } from '../canvas-view/canvas-view.component';

@Component({
  selector: 'app-canvas-project-wrapper',
  imports: [CommonModule,  CanvasViewComponent],
  templateUrl: './canvas-project-wrapper.component.html',
  styleUrl: './canvas-project-wrapper.component.scss'
})
export class CanvasProjectWrapperComponent {
  @ViewChild('scrollWrapper') scrollWrapperRef!: ElementRef<HTMLDivElement>;

  constructor(private canvasControlService : CanvasControlService) {}

  ngAfterViewInit() {

    this.canvasControlService.registerInstance(this);

  }

  pages = [{ id: 1, template: 'A4', data: {} }];
  sidebarOffset = 0;

  addPage() {
    this.pages.push({ id: this.pages.length + 1, template: 'A4', data: {} });
  }

  shiftLayout(offset: number) {
    this.sidebarOffset = offset;
  }

pageWidth = 794; // A4 default
pageHeight = 1123;
  pageData = null;

  transformStyle = {
    transform: 'translateX(0px)',
    transition: 'transform 0.3s ease'
  };

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
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transition: 'transform 0.3s ease'
    };

    console.log('Applied transform:', this.transformStyle);
  }

  restoreCanvasTransform(): void {
    this.transformStyle = {
      transform: `translate(0px, 0px) scale(1)`,
      transition: 'transform 0.3s ease'
    };

    console.log('✅ Restored canvas to original position');
  }
}
