import { Component, effect, Input } from '@angular/core';
import { TOOLBAR_CONFIG, ToolbarItem, ToolbarMode } from '../../assets/toolbar-config';
import { CommonModule } from '@angular/common';
import { CanvasService } from '../services/canvas.service';
import { FormsModule } from '@angular/forms';
import { SidebarStateService } from '../services/sidebar-state.service';
import { TooltipDirective } from '../shared/tooltip.directive';


@Component({
  selector: 'app-app-toolbar',
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './app-toolbar.component.html',
  styleUrl: './app-toolbar.component.scss',
})
export class AppToolbarComponent {
  @Input() mode!: string;
  currentColor: any;
  elementType: any;
  toolbarConfig: any;
  isFillOpen = false;
  isTextBgOpen = false;

  get tools(): ToolbarItem[] {
    if (this.mode) {
      return TOOLBAR_CONFIG[this.mode as ToolbarMode];
    } else return [];
  }

  fontSize: number = 5;
  scaleY: number = 1;

  constructor(
    private canvasService: CanvasService,
    private sidebarState: SidebarStateService
  ) {
    effect(() => {
      const style = this.canvasService.textStyleSignal();
      this.fontSize = style?.fontSize || 16;
      this.fontSize = this.roundOff(this.fontSize);
      this.scaleY = style?.scaleY ?? 1;

      // this.cdr.markForCheck(); // good for OnPush
    });
  }

  ngOnInit(): void {
    //this.lastFontSize = this.fontSize;
    const text = this.canvasService?.textStyleSignal();
    this.fontSize = text ? text.fontSize * text.scaleY : 16;
    this.scaleY = text?.scaleY ?? 1;
    console.log('font sizes and scale', this.fontSize, this.scaleY);
  }

  ngAfterViewInit(): void {
    this.toolbarConfig = this.tools;
    this.toolbarConfig.forEach((item: ToolbarItem) => {
      if (item.key === 'fill' || item.key === 'text_bg') {
        this.elementType = item.key;
        item.action = (key: string) => this.openColorPanel(key);
      }
    });
  }
  increaseFontSize() {
    this.fontSize = this.fontSize + 1;
    this.canvasService.updateTextProperties({
      fontSize: this.fontSize / this.scaleY,
    });
  }

  reducefontSizeChange() {
    this.fontSize = this.fontSize - 1;
    this.canvasService.updateTextProperties({
      fontSize: this.fontSize / this.scaleY,
    });
  }

  onStyleChange() {
    this.canvasService.updateTextProperties({ fontSize: this.fontSize });
    //this.lastFontSize = this.fontSize;
  }

  roundOff(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  ngOnDestroy() {
    this.onStyleChange();
  }

  openColorPanel(key: string): void {
    const isSameKey =
      this.sidebarState.current === 'color' &&
      this.sidebarState.config?.text === key;

    // If same button clicked again -> toggle (close)
    if (isSameKey) {
      this.sidebarState.close('color');
      return;
    }

    // If switching from one color-related option to another (e.g., fill → text_bg)
    const config: any = {
      color: this.currentColor,
      text: key,
      ...(key === 'text_bg' ? { backgroundMode: true } : {}), // Add custom config for text_bg
    };

    this.sidebarState.open('color', config);
  }

  // toolbar.component.ts
  onToolbarItemClick(item: ToolbarItem): void {
    if (item.action) {
      item.action(item.key);
    }
  }
}
