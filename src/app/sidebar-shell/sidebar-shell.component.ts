import { CommonModule, NgSwitch } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TemplateLoaderService } from '../services/template-loader.service';
import { TemplateSidebarComponent } from '../template-sidebar/template-sidebar.component';
import { ElementSidebarComponent } from '../element-sidebar/element-sidebar.component';
import { TextSidebarComponent } from '../text-sidebar/text-sidebar.component';
import { CanvasControlService } from '../services/canvas-control.service';
import { SidebarView } from '../interface/interface';
import { SidebarStateService } from '../services/sidebar-state.service';
import { PageNumberSettingsComponent } from '../page-number-settings/page-number-settings.component';
import { FontSelectorComponent } from '../font-selector/font-selector.component';


@Component({
  selector: 'app-sidebar-shell',
  imports: [NgSwitch,
     TemplateSidebarComponent,
     ElementSidebarComponent,
     CommonModule,
    TextSidebarComponent,
    PageNumberSettingsComponent,
     FontSelectorComponent

  ],
  templateUrl: './sidebar-shell.component.html',

  styleUrl: './sidebar-shell.component.scss',
  host: {
    'class': 'fixed top-14 bottom-10 left-20 w-[340px] z-40 bg-white shadow overflow-y-auto'
  }
})
export class SidebarShellComponent {


  constructor(private canvasControlService: CanvasControlService, public sidebarState: SidebarStateService){}

  activeSidebar: SidebarView = null;



  ngOnInit() {
    this.sidebarState.activeSidebar$.subscribe((view: SidebarView | null) => {
      const wasOpen = this.activeSidebar !== null;
      this.activeSidebar = view;
      setTimeout(() => this.adjustCanvasPosition(wasOpen), 350);
    });
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
}
