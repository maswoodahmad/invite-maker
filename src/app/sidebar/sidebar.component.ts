import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidebarView } from '../interface/interface';
import { SidebarStateService } from '../services/sidebar-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true, // ✅ this is required
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  @Input() active: SidebarView | undefined;


  constructor(private sidebarService: SidebarStateService) { }

  toggle(view: SidebarView) {
    this.sidebarService.toggleSidebar(view);
  }
}
