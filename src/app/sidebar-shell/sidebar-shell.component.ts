import { CommonModule, NgSwitch } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TemplateLoaderService } from '../services/template-loader.service';
import { TemplateSidebarComponent } from '../template-sidebar/template-sidebar.component';
import { ElementSidebarComponent } from '../element-sidebar/element-sidebar.component';
import { TextSidebarComponent } from '../text-sidebar/text-sidebar.component';

@Component({
  selector: 'app-sidebar-shell',
  imports: [NgSwitch, TemplateSidebarComponent, ElementSidebarComponent, CommonModule, TextSidebarComponent],
  templateUrl: './sidebar-shell.component.html',
  styleUrl: './sidebar-shell.component.scss',
  host: {
    'class': 'fixed top-14 bottom-10 left-20 w-[340px] z-40 bg-white shadow overflow-y-auto'
  }
})
export class SidebarShellComponent {
  @Input() activePanel: 'design' | 'text' | 'elements' | 'uploads' | 'projects' | 'tools' | null = null;
  

  @Output() closed = new EventEmitter<void>();
}
