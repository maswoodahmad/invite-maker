import { Component, EventEmitter, Output } from '@angular/core';
import { TemplateService } from '../services/template.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-size-popup',
  imports: [FormsModule],
  templateUrl: './page-size-popup.component.html',

})
export class PageSizePopupComponent {
  width: number = 595;   // Default A4 width in px
  height: number = 842;  // Default A4 height in px


  @Output() close = new EventEmitter<void>();

  submit() {
    this.selectTemplate();
    this.close.emit(); // Optional: close popup
  }

  constructor(private templateService: TemplateService) { }

  selectTemplate() {
    this.templateService.emitTemplateSelected({ width: this.width, height: this.height });
  }
}
