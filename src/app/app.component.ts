import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, style, state, transition, animate } from '@angular/animations';

import { SidebarComponent } from './sidebar/sidebar.component';
import { ProjectToolbarComponent } from './project-toolbar/project-toolbar.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { TemplateSidebarComponent } from './template-sidebar/template-sidebar.component';
import { CanvasZoomService } from './services/canvas-zoom.service';
import { FabricEditorComponent } from './fabric-editor/fabric-editor.component';
import { CanvasControlService } from './services/canvas-control.service';
import { SidebarShellComponent } from './sidebar-shell/sidebar-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    ProjectToolbarComponent,
    BottomBarComponent,

    SidebarShellComponent

    // Add other sidebar modules when needed
  ],
  animations: [
    trigger('slideFade', [
      state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
      state('hidden', style({ transform: 'translateX(-100%)', opacity: 0 })),
      transition('hidden => visible', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('200ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('150ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
  activeSidebar: 'design' | 'text' | 'elements' | 'uploads' | 'projects' | 'tools' | null = null;
  sidebarWidth = 80; // initial icon sidebar width
  @ViewChild(FabricEditorComponent) canvasComponent!: FabricEditorComponent;


  @ViewChild('dynamicSidebar') dynamicSidebarRef!: ElementRef<HTMLElement>;

  templateSidebarWidth: number = 400;

  constructor(private cdr: ChangeDetectorRef, private zoomService: CanvasZoomService, private canvasControlService: CanvasControlService) { }



  ngAfterViewInit(): void {
    // Wait for sidebar to render
    setTimeout(() => this.updateSidebarWidth(), 50);
  }

  private previousSidebarVisible = false;


  @ViewChild(TemplateSidebarComponent) templateSidebarRef!: TemplateSidebarComponent;



  // ngAfterViewChecked(): void {
  //   const sideToolBar = document.querySelector('app-template-sidebar') as HTMLElement;

  //   const isNowVisible = !!sideToolBar;
  //   if (isNowVisible && !this.previousSidebarVisible) {
  //     // Sidebar just became visible

  //     this.templateSidebarWidth = sideToolBar.offsetWidth;

  //     const mainSidebar = document.querySelector('app-sidebar') as HTMLElement;
  //     const mainSidebarWidth = mainSidebar?.offsetWidth || 0;

  //     const templateWidth = 794;
  //     const templateHeight = 1123;

  //     this.canvasControlService.shiftCanvasIntoViewport(
  //       templateWidth,
  //       templateHeight,
  //       mainSidebarWidth,
  //       this.templateSidebarWidth
  //     );
  //   }

  //   this.previousSidebarVisible = isNowVisible;
  // }

  // toggleSidebar(type: typeof this.activeSidebar) {
  //   this.activeSidebar = this.activeSidebar === type ? null : type;

  //   // Wait for DOM to reflect sidebar visibility
  //   setTimeout(() => {
  //     const mainSidebar = document.querySelector('app-sidebar') as HTMLElement;
  //     const mainSidebarWidth = mainSidebar?.offsetWidth || 0;

  //     const templateSidebarWidth =
  //       this.templateSidebarRef?.nativeElement?.offsetWidth || 0;

  //     const templateWidth = 794;
  //     const templateHeight = 1123;

  //     this.canvasControlService.shiftCanvasIntoViewport(
  //       templateWidth,
  //       templateHeight,
  //       mainSidebarWidth,
  //       templateSidebarWidth
  //     );
  //   }, 300); // match your animation duration
  // }

  toggleSidebar(type: typeof this.activeSidebar) {
    const wasOpen = this.activeSidebar === type;
    this.activeSidebar = wasOpen ? null : type;
    setTimeout(() => this.adjustCanvasPosition(wasOpen), 350);
    // Delay any layout logic to wait for sidebar to appear in DOM
    // delay must match your animation + DOM render timing
  }

  adjustCanvasPosition(wasOpen: boolean) {
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
      this.canvasControlService.restoreCanvasTransform();
    } else {
      this.canvasControlService.shiftCanvasIntoViewport(
        templateWidth,
        templateHeight,
        availableWidth,
        availableHeight
      );
      this.canvasControlService.updateToolbarOffset();
    }


    if (wasOpen) {
      console.log('Sidebar was closed → expanding canvas');
    } else {
      console.log('Sidebar was opened → reducing canvas space');
    }
  }

  updateSidebarWidth() {
    const dynamicEl = this.dynamicSidebarRef?.nativeElement;

    this.sidebarWidth = this.activeSidebar && dynamicEl
      ? 80 + (dynamicEl.offsetWidth || 340)
      : 80;

    this.cdr.markForCheck(); // ensures Angular reflects new layout
  }

  getCanvasMarginLeft(): string {
    return `${this.sidebarWidth}px`;
  }


}
