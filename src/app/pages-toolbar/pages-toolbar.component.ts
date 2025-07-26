import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasPage } from '../interface/interface';
import { v4 as uuidv4 } from 'uuid';
import { CanvasService } from '../services/canvas.service';


@Component({
  selector: 'app-pages-toolbar',
  imports: [FormsModule, CommonModule],
  templateUrl: './pages-toolbar.component.html',
  styleUrl: './pages-toolbar.component.scss'
})
export class PagesToolbarComponent {
  placeHolderText: string = 'Add page title';
  constructor(private canvasService: CanvasService) { }

  // page-toolbar.component.ts
  @Output() addPage = new EventEmitter<void>();
  @Output() deletePage = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<CanvasPage>();
  @Output() hide = new EventEmitter<CanvasPage>();
  @Output() moveUp = new EventEmitter<void>;
  @Output() moveDown = new EventEmitter<void>;
  @Input() pageNumber!: number | string;
  @Input() pageInfo!: CanvasPage;
  @Output() lock = new EventEmitter<CanvasPage>;


  @Output() titleChange = new EventEmitter<CanvasPage>();

  @Input() totalPages!: number;

  isHidden = false;
  isLocked = false;

  value = ''

  onBlur() {


    if (this.value.trim().length === 0) {
      this.typed = false;
    }

    this.titleChange.emit({
      ...this.pageInfo,
      title: this.value
    });
  }

  canvasObjects: any;

  ngOnInit() {
    this.getObjects()
  }


  duplicatePage() {
    const currentCanvas = this.canvasService.getCanvas();
    const objectCount = currentCanvas?.getObjects().length;
    console.log(currentCanvas?.getObjects())

    if (currentCanvas) {

      const canvasJSON = JSON.parse(JSON.stringify(currentCanvas.toJSON()));
      this.duplicate.emit({
        ...this.pageInfo,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),

        data: canvasJSON
      });


    }

  }

  onFocus() {
    this.typed = true;
  }


  onHideClick() {

    this.hide.emit({
      ...this.pageInfo,
      isVisible: !this.pageInfo.isVisible
    });
  }





  typed = false;

  onInputChange(value: string) {
    this.typed = value.trim().length > 0;
  }
  ngOnChanges() {
    this.value = this.pageInfo?.title || '';
    this.isHidden = !this.pageInfo.isVisible;
    this.pageNumber = this.isHidden ? 'hidden' : this.pageNumber;
    this.isLocked = !this.pageInfo.isLocked;
    this.placeHolderText = !this.typed ? this.placeHolderText : '';
    this.getObjects();


  }

  getObjects() {
    const currentCanvas = this.canvasService.getCanvas();
    this.canvasObjects = currentCanvas?.getObjects();
  }

  onLock() {
    this.isLocked = !this.isLocked;

    const currentCanvas = this.canvasService.getCanvas();
    console.log(currentCanvas?.getObjects())
    if (currentCanvas) {

      const canvasJSON = JSON.parse(JSON.stringify(currentCanvas.toJSON()));
      this.lock.emit({ ...this.pageInfo, data: canvasJSON, isLocked: !this.pageInfo.isLocked });
    }



  }





}
