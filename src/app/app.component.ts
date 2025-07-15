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

  @ViewChild('dynamicSidebar') dynamicSidebarRef!: ElementRef<HTMLElement>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // Wait for sidebar to render
    setTimeout(() => this.updateSidebarWidth(), 50);
  }

  toggleSidebar(type: typeof this.activeSidebar) {
    this.activeSidebar = this.activeSidebar === type ? null : type;

    // Sidebar animation & width update after DOM update
    setTimeout(() => this.updateSidebarWidth(), 50);
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
