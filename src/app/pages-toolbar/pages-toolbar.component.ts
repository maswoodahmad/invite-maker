import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasPage } from '../interface/interface';
import { v4 as uuidv4 } from 'uuid';
import { CanvasService } from '../services/canvas.service';
import { TooltipDirective } from '../shared/tooltip.directive';
import { ModeService } from '../services/mode.service';
import { title } from 'process';


@Component({
  selector: 'app-pages-toolbar',
  imports: [FormsModule, CommonModule, TooltipDirective],
  templateUrl: './pages-toolbar.component.html',
  styleUrl: './pages-toolbar.component.scss',
})
export class PagesToolbarComponent {
  placeHolderText: string = 'Add page title';
  isViewOnly: boolean = false;
  constructor(
    private canvasService: CanvasService,
    private modeService: ModeService
  ) {}

  // page-toolbar.component.ts
  @Output() addPage = new EventEmitter<void>();
  @Output() deletePage = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<CanvasPage>();
  @Output() hide = new EventEmitter<CanvasPage>();
  @Output() moveUp = new EventEmitter<void>();
  @Output() moveDown = new EventEmitter<void>();
  @Input() pageNumber!: number | string;
  @Input() pageInfo!: CanvasPage;
  @Output() lock = new EventEmitter<CanvasPage>();

  @Output() titleChange = new EventEmitter<CanvasPage>();

  @Input() totalPages!: number;

  isHidden = false;
  isLocked = false;

  value = '';

  onBlur() {
    if (this.isViewOnly) return;
    if (this.value.trim().length === 0) {
      this.typed = false;
    }

    const toEmitInfo = this.constructPageInfo({ title: this.value });
    this.titleChange.emit(toEmitInfo);
  }

  canvasObjects: any;

  ngOnInit() {
    this.getObjects();
    this.modeService.mode$.subscribe(
      (mode) => (this.isViewOnly = mode == 'viewing')
    );
  }

  duplicatePage() {
    const currentCanvas = this.canvasService.getCanvas();
    const objectCount = currentCanvas?.getObjects().length;
    console.log(currentCanvas?.getObjects());

    if (currentCanvas) {
      const canvasJSON = JSON.parse(JSON.stringify(currentCanvas.toJSON()));
      const toEmitInfo = this.constructPageInfo({
        id: uuidv4(),
        createdAt: new Date(),
        data: canvasJSON,
      });
      this.duplicate.emit(toEmitInfo);
    }
  }

  onFocus() {
    this.typed = true;
  }

  onHideClick() {
     const toEmitInfo = this.constructPageInfo({
       isVisible: !this.pageInfo.isVisible,
     });
    this.hide.emit(toEmitInfo);
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
    console.log(currentCanvas?.getObjects());
    if (currentCanvas) {
      const canvasJSON = JSON.parse(JSON.stringify(currentCanvas.toJSON()));
        const toEmitInfo = this.constructPageInfo({
          id: uuidv4(),
          isLocked: !this.pageInfo.isLocked,
          data: canvasJSON,
        });
      this.lock.emit(toEmitInfo);
    }
  }



  constructPageInfo(overrides: Partial<CanvasPage> = {}): CanvasPage {
    const baseCanvas = this.pageInfo;

    const updated = Object.assign(
      Object.create(Object.getPrototypeOf(baseCanvas)), // preserve Canvas prototype
      baseCanvas, // copy base canvas data
      {
        ...overrides,
        title: overrides.title ?? this.value,
        updatedAt: overrides.updatedAt ?? new Date(),
      }
    );

    return updated;
  }
}
