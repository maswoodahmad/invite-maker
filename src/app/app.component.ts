import { CanvasService } from './services/canvas.service';
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
import { SidebarStateService } from './services/sidebar-state.service';
import { Subscription } from 'rxjs';
import { SidebarView } from './interface/interface';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';



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
  activeSidebar:SidebarView = null;
  sidebarWidth = 80; // initial icon sidebar width
  @ViewChild(FabricEditorComponent) canvasComponent!: FabricEditorComponent;

  readonly A4_WIDTH = 794;
  readonly A4_HEIGHT = 1123;




  @ViewChild('dynamicSidebar') dynamicSidebarRef!: ElementRef<HTMLElement>;

  templateSidebarWidth: number = 400;

  constructor(private cdr: ChangeDetectorRef, private zoomService: CanvasZoomService, private canvasControlService: CanvasControlService,
    public sidebarService: SidebarStateService,
    private breakpointObserver: BreakpointObserver,
    private canvasService : CanvasService
  ) { }



  ngAfterViewInit(): void {
    // Wait for sidebar to render
    //setTimeout(() => this.updateSidebarWidth(), 50);

  }

  isMobile = false;

  private previousSidebarVisible = false;
  private sub = Subscription.EMPTY;

  @ViewChild(TemplateSidebarComponent) templateSidebarRef!: TemplateSidebarComponent;


  ngOnInit() {
    // this.sidebarService.activeSidebar$.subscribe((type) => {
    //   const isOpen = type != null;
    //   this.canvasControlService.adjustCanvasPosition(isOpen);
    // });




    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });


  }








  updateSidebarWidth() {
    const dynamicEl = this.dynamicSidebarRef?.nativeElement;

    this.sidebarWidth = this.activeSidebar && dynamicEl
      ? 80 + (dynamicEl.offsetWidth || 340)
      : 80;

    this.cdr.markForCheck(); // ensures Angular reflects new layout
  }


  onMenuOpen(isOpen :boolean) {
    


  }

}
