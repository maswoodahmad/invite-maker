import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true, // ✅ this is required
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  @Input() active: 'design' | 'elements' | 'text' | 'uploads' | 'projects' | 'tools' | null = null;
  @Output() toggle = new EventEmitter<typeof this.active>();
  

}
