// size-selector.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
//import { DesignSizeService, DesignSize } from '../services/design-size.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-size-selector',
  standalone: true,
  templateUrl: './size-selector.component.html',
  imports: [FormsModule, CommonModule],
})
export class SizeSelectorComponent {
//  // sizes = this.designSizeService.getSizes();
//   selectedSize = 'A4';
//   customWidth = 1000;
//   customHeight = 1000;

//   @Output() sizeSelected = new EventEmitter<{ width: number; height: number }>();

//  // constructor(private designSizeService: DesignSizeService) {}

//   onSizeChange() {
//     if (this.selectedSize === 'Custom') return;
//     //const size = this.designSizeService.getSizeByName(this.selectedSize);
//     if (size) {
//       this.sizeSelected.emit({ width: size.width, height: size.height });
//     }
//   }

//   applyCustomSize() {
//     if (this.customWidth > 0 && this.customHeight > 0) {
//       this.sizeSelected.emit({ width: this.customWidth, height: this.customHeight });
//     }
//   }
}
