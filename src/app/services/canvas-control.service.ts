import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { FabricEditorComponent } from "../fabric-editor/fabric-editor.component";
import { CanvasProjectWrapperComponent } from "../canvas-project-wrapper/canvas-project-wrapper.component";
import { isPlatformBrowser } from "@angular/common";

@Injectable({ providedIn: 'root' })
export class CanvasControlService {
  private editorInstance: CanvasProjectWrapperComponent | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object){}

  registerInstance(instance: CanvasProjectWrapperComponent) {
    this.editorInstance = instance;
  }

  shiftCanvasIntoViewport(templateWidth: number,
    templateHeight: number,
    availableWidth: number,
    availableHeight: number) {
    this.editorInstance?.shiftCanvasIntoViewport(
      templateWidth,
      templateHeight,
      availableWidth,
      availableHeight);
  }

  restoreCanvasTransform(): void {
    this.editorInstance?.restoreCanvasTransform();
  }

  updateToolbarOffset(): void {
    this.editorInstance?.updateToolbarOffset();
  }


  adjustCanvasPosition(wasOpen: boolean) {
    if (!isPlatformBrowser(this.platformId)) return;
    const header = document.querySelector('app-header') as HTMLElement;
    const footer = document.querySelector('app-footer') as HTMLElement;
    const mainSidebar = document.querySelector('app-sidebar') as HTMLElement;
    const templateSidebar = document.querySelector('app-template-sidebar') as HTMLElement;

    const headerHeight = header?.offsetHeight || 0;
    const footerHeight = footer?.offsetHeight || 0;
    const mainSidebarWidth = mainSidebar?.offsetWidth || 0;
    const templateSidebarWidth = templateSidebar?.offsetWidth || 340;

    const effectiveTemplateSidebarWidth = wasOpen ? 0 : templateSidebarWidth;

    // Calculate current viewport available to canvas
    const availableWidth = window.innerWidth - mainSidebarWidth - effectiveTemplateSidebarWidth;

    const availableHeight = window.innerHeight - headerHeight - footerHeight;

    const templateWidth = 794;
    const templateHeight = 1123;

    if (wasOpen) {
      this.restoreCanvasTransform();
    } else {
      this.shiftCanvasIntoViewport(
        templateWidth,
        templateHeight,
        availableWidth,
        availableHeight
      );
      this.updateToolbarOffset();
    }



  }
}
