import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SIDEBAR_ITEMS, SidebarView } from '../interface/interface';
import { SidebarStateService } from '../services/sidebar-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true, // ✅ this is required
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports : [CommonModule, FormsModule ]

})
export class SidebarComponent {

  @Input() active: SidebarView | undefined;
  sidebarItems = SIDEBAR_ITEMS;

  constructor(private sidebarService: SidebarStateService) { }

  toggle(view: any) {
    this.sidebarService.toggleSidebar(view);
  }

  @Input() position: 'left' | 'bottom' = 'left';




}
