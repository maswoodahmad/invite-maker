import { CanvasManagerService } from './../services/canvas-manager.service';
import {
  ChangeDetectorRef,
  Component,
  effect,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  TOOLBAR_CONFIG,
  ToolbarItem,
  ToolbarMode,
} from '../../assets/toolbar-config';
import { CommonModule } from '@angular/common';
import { CanvasService } from '../services/canvas.service';
import { FormsModule } from '@angular/forms';
import { SidebarStateService } from '../services/sidebar-state.service';
import { TooltipDirective } from '../shared/tooltip.directive';
import { debounce } from 'lodash';

@Component({
  selector: 'app-app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './app-toolbar.component.html',
  styleUrl: './app-toolbar.component.scss',
})
export class AppToolbarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode!: string;

  toolbarConfig: ToolbarItem[] = [];

  currentColor: any;
  elementType: any;

  isFillOpen = false;
  isTextBgOpen = false;

  bold: string = 'normal';
  italic: string = 'normal';
  underLine: boolean = false;
  linethrough: boolean = false;

  fontSize: number = 16;
  scaleY: number = 1;
  textAlign: string | undefined = 'left';
  showSeekbarForOpacity: boolean = false;
  currentTransparency = 0;

  constructor(
    private canvasService: CanvasService,
    private sidebarState: SidebarStateService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const style = this.canvasService.textStyleSignal();
      this.fontSize = this.roundOff(style?.fontSize || 16);
      this.scaleY = style?.scaleY ?? 1;

      this.bold = style?.fontWeight || 'normal';
      this.italic = style?.fontStyle || 'normal';
      this.underLine = style?.underline ?? false;
      this.linethrough = style?.linethrough ?? false;
      this.textAlign = style?.textAlign;
      this.currentTransparency = (1 - (style?.opacity ?? 1)) * 100;
      this.updateActiveToolbarStates();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.updateToolbarConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode']) {
      this.updateToolbarConfig();
    }
  }

  ngOnDestroy(): void {
    this.onStyleChange();
    this.showSeekbarForOpacity = false;
  }

  updateToolbarConfig(): void {
    if (!this.mode) return;

    const config = TOOLBAR_CONFIG[this.mode as ToolbarMode] || [];
    this.toolbarConfig = config.map((item: ToolbarItem) => {
      // Assign actions here
      if (item.key === 'fill' || item.key === 'text_bg') {
        item.action = (key: string) => this.openColorPanel(key);
      }
      if (['bold', 'italic', 'underline', 'linethrough'].includes(item.key)) {
        item.action = (key: string) => this.toggleActions(key);
      }
      if (['super', 'sub'].includes(item.key)) {
        item.action = (key: string) =>
          this.handleSubSupScript(key as 'sub' | 'super');
      }
      if (item.key === 'transparency') {
        item.action = (key: string) => this.openTransparencySeekbar(key);
      }
      if (item.key === 'position') {
        item.action = (key: string) => this.openPositionSidebar();
      }
      return item;
    });

    // Update state after assigning
    this.updateActiveToolbarStates();
  }

  updateActiveToolbarStates(): void {
    this.toolbarConfig = this.toolbarConfig.map((item: ToolbarItem) => {
      let active = false;
      switch (item.key) {
        case 'bold':
          active = this.bold === 'bold';
          break;
        case 'italic':
          active = this.italic === 'italic';
          break;
        case 'underline':
          active = this.underLine === true;
          break;
        case 'linethrough':
          active = this.linethrough === true;
          break;
      }
      return { ...item, active };
    });
  }

  onToolbarItemClick(item: ToolbarItem): void {
    if (item.action) {
      item.action(item.key);
    }
  }

  toggleActions(key: string): void {
    this.canvasService.toggleActions(key);
  }

  openColorPanel(key: string): void {
    const isSameKey =
      this.sidebarState.current === 'color' &&
      this.sidebarState.config?.text === key;

    if (isSameKey) {
      this.sidebarState.close('color');
      return;
    }

    const config: any = {
      color: this.currentColor,
      text: key,
      ...(key === 'text_bg' ? { backgroundMode: true } : {}),
    };

    this.sidebarState.open('color', config);
  }

  increaseFontSize(): void {
    this.fontSize += 1;
    this.canvasService.updateTextProperties({
      fontSize: this.fontSize / this.scaleY,
    });
  }

  reducefontSizeChange(): void {
    this.fontSize -= 1;
    this.canvasService.updateTextProperties({
      fontSize: this.fontSize / this.scaleY,
    });
  }

  onStyleChange(): void {
    this.canvasService.updateTextProperties({
      fontSize: this.fontSize / this.scaleY,
    });
  }

  roundOff(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  alignmentArray = ['left', 'center', 'right', 'justify'];
  index = 0;
  applyTextAlign() {
    this.index = this.alignmentArray.indexOf(this.textAlign || 'left');
    this.index = ++this.index % this.alignmentArray.length;
    this.textAlign = this.alignmentArray[this.index];
    this.canvasService.updateTextProperties({
      textAlign: this.textAlign,
    });
  }

  handleSubSupScript(mode: 'sub' | 'super') {
    this.canvasService.applySubOrSuperScript(mode);
  }

  // onOpacityChange(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   let value = parseFloat(input.value);

  //   // Clamp between 0 and 100
  //   value = Math.max(0, Math.min(100, value));

  //   // Convert to 0.0 - 1.0 for Fabric.js

  //   this.canvasService.updateTextProperties({
  //     opacity: 1 - fabricOpacity,
  //   });
  // }

  openTransparencySeekbar(key: any) {
    this.showSeekbarForOpacity = !this.showSeekbarForOpacity;
  }

  // In your component

  onTransparencyChange = debounce((value: number) => {
    this.canvasService.updateTextProperties({
      opacity: 1 - value / 100,
    });
  }, 200);

  onTransparencyInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.currentTransparency = value;
    this.onTransparencyChange(value);
  }

  openPositionSidebar() {
    this.sidebarState.open('position');
  }
}
