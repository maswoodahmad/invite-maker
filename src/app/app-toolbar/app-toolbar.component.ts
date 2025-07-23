import { Component, Input } from '@angular/core';
import { TOOLBAR_CONFIG } from '../../assets/toolbar-config';
import { CommonModule } from '@angular/common';
import { LayerPanelComponent } from '../canvas/layer-panel.component';
import { ToolbarMode } from '../interface/interface';

@Component({
  selector: 'app-app-toolbar',
  imports: [CommonModule],
  templateUrl: './app-toolbar.component.html',
  styleUrl: './app-toolbar.component.scss'
})
export class AppToolbarComponent {
  @Input() mode!: ToolbarMode;

  get tools() {
    if (this.mode) {
      return TOOLBAR_CONFIG[this.mode];
    }else return []

  }
}
