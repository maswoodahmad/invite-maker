import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { FabricEditorComponent } from "../fabric-editor/fabric-editor.component";
import { CanvasProjectWrapperComponent } from "../canvas-project-wrapper/canvas-project-wrapper.component";
import { isPlatformBrowser } from "@angular/common";
import { SidebarStateService } from "./sidebar-state.service";

@Injectable({ providedIn: 'root' })
export class CanvasControlService {
  private editorInstance: CanvasProjectWrapperComponent | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object

  ) { }


  registerInstance(instance: CanvasProjectWrapperComponent) {
    this.editorInstance = instance;
  }

  shiftCanvasIntoViewport(templateWidth: number,
    templateHeight: number,
    availableWidth: number,
    availableHeight: number,
    isNowOpen: boolean
  ) {
    this.editorInstance?.shiftCanvasIntoViewport(
      templateWidth,
      templateHeight,
      availableWidth,
      availableHeight,

    );
  }

  restoreCanvasTransform(): void {
    this.editorInstance?.restoreCanvasTransform();
  }

  updateToolbarOffset(): void {
    this.editorInstance?.updateToolbarOffset();
  }

  adjustCanvasPosition(isOpen: boolean) {
    if (!isPlatformBrowser(this.platformId)) return;

    const header = document.querySelector('#app-header') as HTMLElement;
    const footer = document.querySelector('#app-footer') as HTMLElement;
    const mainSidebar = document.querySelector('#main-side-bar') as HTMLElement;
    const templateSidebar = document.querySelector('#side-nav-bar') as HTMLElement;

    const headerHeight = header?.offsetHeight || 0;
    const footerHeight = footer?.offsetHeight || 0;
    const mainSidebarWidth = mainSidebar?.offsetWidth || 0;
    const templateSidebarWidth = templateSidebar?.offsetWidth || 340;

    const effectiveTemplateSidebarWidth = isOpen ? templateSidebarWidth : 0;

    const availableWidth = window.innerWidth  - effectiveTemplateSidebarWidth;
    const availableHeight = window.innerHeight - headerHeight - footerHeight;

    const templateWidth = 794;
    const templateHeight = 1123;

    if (isOpen) {
      // Opened
      this.shiftCanvasIntoViewport(templateWidth, templateHeight, availableWidth, availableHeight, true);
      this.updateToolbarOffset();
      console.log('Sidebar opened → shrinking canvas');
    } else if (!isOpen ) {
      // Closed
     // this.restoreCanvasTransform();
      console.log('Sidebar closed → restoring canvas');
    } else {
      // Sidebar switched or unchanged → Do nothing or minimal action
      console.log('Sidebar unchanged or switched → skipping adjustment');
    }
  }


}
