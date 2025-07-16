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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    ProjectToolbarComponent,
    BottomBarComponent,
    TemplateSidebarComponent,

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

  @ViewChild(TemplateSidebarComponent, { read: ElementRef })
templateSidebarRef!: ElementRef<HTMLElement>;
  @ViewChild('dynamicSidebar') dynamicSidebarRef!: ElementRef<HTMLElement>;

  constructor(private cdr: ChangeDetectorRef,  private zoomService: CanvasZoomService, private canvasControlService: CanvasControlService) {}



  ngAfterViewInit(): void {
    // Wait for sidebar to render
    setTimeout(() => this.updateSidebarWidth(), 50);
  }

  toggleSidebar(type: typeof this.activeSidebar) {
    this.activeSidebar = this.activeSidebar === type ? null : type;
    console.log(this.activeSidebar)

    // Wait for sidebar animation & layout
    setTimeout(() => {
      this.updateSidebarWidth();


      const templateSidebar = document.querySelector('app-template-sidebar') as HTMLElement;
      const mainSidebar = document.querySelector('app-sidebar') as HTMLElement;
      const mainSidebarWidth = mainSidebar?.offsetWidth || 0;
  const shiftAmount = (templateSidebar?.offsetWidth || 0);
  this.canvasControlService.shiftCanvasToRight(shiftAmount + mainSidebarWidth);
  
}, 300); // match your animation duration
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
