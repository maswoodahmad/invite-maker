import { CommonModule, NgSwitch } from '@angular/common';
import { Component, effect, EventEmitter, HostListener, Input, Output } from '@angular/core';
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

  @Input() isMobile = false;

  constructor(private canvasControlService: CanvasControlService, public sidebarState: SidebarStateService){}

  activeSidebar: SidebarView = null;

  drawerState: 'full' | 'half' | 'closed' = 'full';


  ngOnInit() {

    this.sidebarState.activeSidebar$.subscribe(type => {
      this.activeSidebar = type;

      const isOpen = type != null;

      setTimeout(() => {
        this.canvasControlService.adjustCanvasPosition(isOpen);
      },);



    })
  }

  private touchStartY = 0;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    const deltaY = event.touches[0].clientY - this.touchStartY;
    if (deltaY > 100) {
      this.close();
    }
  }

  close() {
    this.sidebarState.close(null); // Whatever your close logic is
  }

  

}
