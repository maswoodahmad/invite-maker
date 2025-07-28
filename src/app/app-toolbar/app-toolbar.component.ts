import { Component, effect, Input } from '@angular/core';
import { TOOLBAR_CONFIG, ToolbarItem, ToolbarMode } from '../../assets/toolbar-config';
import { CommonModule } from '@angular/common';
import { CanvasService } from '../services/canvas.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-app-toolbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './app-toolbar.component.html',
  styleUrl: './app-toolbar.component.scss',
})
export class AppToolbarComponent {
  @Input() mode!: string;

  get tools(): ToolbarItem[] {
    if (this.mode) {
      return TOOLBAR_CONFIG[this.mode as ToolbarMode];
    } else return [];
  }

  fontSize: number = 5;
  scaleY: number = 1;



  constructor(private canvasService: CanvasService) {
    effect(() => {
      const style = this.canvasService.textStyleSignal();
      this.fontSize = style?.fontSize || 16;
      this.fontSize = this.roundOff(this.fontSize);
      this.scaleY = style?.scaleY ?? 1;

      // this.cdr.markForCheck(); // good for OnPush
    });
  }

  ngOnInit(): void {
    // this.lastFontSize = this.fontSize;

    // const text = this.
    // canvasService?.textStyleSignal();
    // this.fontSize = text ? text.fontSize * text.scaleY : 16;
    // this.scaleY = text?.scaleY ?? 1;
    // console.log("font sizes and scale", this.fontSize, this.scaleY);
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
    // Only apply if value actually changed

      this.canvasService.updateTextProperties({ fontSize: this.fontSize });
      //this.lastFontSize = this.fontSize;

  }

  roundOff(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  ngOnDestroy() {
    this.onStyleChange(); // Final update if not already done
  }
}
