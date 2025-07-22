import { CanvasService } from './../services/canvas.service';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  ChangeDetectionStrategy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import * as fabric from 'fabric';
import { CanvasManagerService } from '../services/canvas-manager.service';

@Component({
  selector: 'app-canvas-view',
  templateUrl: './canvas-view.component.html',
  styleUrls: ['./canvas-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasViewComponent implements AfterViewInit {
  @ViewChild('canvasEl', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() width = 794;   // Default A4
  @Input() height = 1123;
  @Input() data: any;


  canvas!: fabric.Canvas;
  @Input() isActive = false;



  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private canvasService: CanvasService,
    protected canvasManagerService: CanvasManagerService
  ) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.canvasRef.nativeElement;

    el.width = this.width;
    el.height = this.height;

    this.canvas = new fabric.Canvas(el, {
      preserveObjectStacking: true,
      selection: true,
    });

    if (this.data) {
      this.canvas.loadFromJSON(this.data, () => this.canvas.renderAll());
    }

    this.canvasService.setCanvas(this.canvas);

    this.canvasManagerService.registerCanvas(this.canvas);

    this.canvasService.initCanvas(this.canvas);



    // this.canvas.on('mouse:down', (e) => {
    //   if (!e.target) {
    //     // No object clicked — entire canvas is selected
    //     this.canvasManagerService.setActiveCanvas(this.canvas); // still mark it active
    //     this.canvasManagerService.setCanvasFocusState('full');
    //   } else {
    //     this.canvasManagerService.setCanvasFocusState('object');
    //   }
    // });

    // Optional: Add zoom/pan init here or expose service later
  }

  getCanvasInstance(): fabric.Canvas {
    return this.canvas;
  }
  transformStyle = {
    transform: 'translateX(0px)',
    transition: 'transform 0.3s ease'
  };

  shiftCanvasToRight(shiftAmount: number): void {
    this.transformStyle = {
      transform: `translateX(${shiftAmount}px)`,
      transition: 'transform 0.3s ease'
    };
    console.log('Shifted canvas by:', shiftAmount);
  }
}
