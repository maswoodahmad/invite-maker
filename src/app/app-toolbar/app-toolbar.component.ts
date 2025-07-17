import { Component, Input } from '@angular/core';
import { TOOLBAR_CONFIG } from '../../assets/toolbar-config';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-toolbar',
  imports: [CommonModule],
  templateUrl: './app-toolbar.component.html',
  styleUrl: './app-toolbar.component.scss'
})
export class AppToolbarComponent {
  @Input() mode: 'text' | 'image' | 'shape' | 'page' = 'text';

  get tools() {
    return TOOLBAR_CONFIG[this.mode];
  }
}
