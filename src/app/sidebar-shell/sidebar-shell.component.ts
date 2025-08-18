import { CommonModule, NgSwitch } from '@angular/common';
import { Component, effect, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { TemplateLoaderService } from '../services/template-loader.service';
import { TemplateSidebarComponent } from '../template-sidebar/template-sidebar.component';
import { ElementSidebarComponent } from '../element-sidebar/element-sidebar.component';
import { TextSidebarComponent } from '../text-sidebar/text-sidebar.component';
import { CanvasControlService } from '../services/canvas-control.service';
import { SidebarView } from '../interface/interface';
import { SidebarStateService } from '../services/sidebar-state.service';
import { PageNumberSettingsComponent } from '../page-number-settings/page-number-settings.component';
import { FontSelectorComponent } from '../font-selector/font-selector.component';
import { UploadComponent } from '../upload/upload.component';
import { ColorComponent } from '../color/color.component';
import { PositionComponent } from '../position/position.component';
import { ShapesComponent } from "../shapes/shapes.component";


@Component({
  selector: 'app-sidebar-shell',
  imports: [NgSwitch,
    TemplateSidebarComponent,
    ElementSidebarComponent,
    CommonModule,
    TextSidebarComponent,
    PageNumberSettingsComponent,
    FontSelectorComponent,
    UploadComponent,
    ColorComponent,
    PositionComponent, ShapesComponent],
  templateUrl: './sidebar-shell.component.html',

  styleUrl: './sidebar-shell.component.scss',

})
export class SidebarShellComponent {

  @Input() isMobile = false;
  @ViewChild('sidebarShell', { static: true }) sidebarRef!: ElementRef<HTMLCanvasElement>;
  config: any;

  constructor(private canvasControlService: CanvasControlService, public sidebarState: SidebarStateService){}

  activeSidebar: SidebarView = null;

  drawerState: 'full' | 'half' | 'closed' = 'full';

  sidebarWidth!: number;

  ngOnInit() {

    this.sidebarState.activeSidebar$.subscribe(type => {
      if (type?.view) {
        this.activeSidebar = type.view;
      }
      this.config = type?.config


      const isOpen = type != null;

      setTimeout(() => {
        this.canvasControlService.adjustCanvasPosition(isOpen);
      },);



    })

  this.sidebarWidth = this.sidebarRef?.nativeElement?.offsetWidth + 80;

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
    this.sidebarState.close(this.activeSidebar); // Whatever your close logic is
  }



}
