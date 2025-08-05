import { ColorService } from './../services/color.service';
import { SidebarStateService } from './../services/sidebar-state.service';
import { Component, effect, EventEmitter, Input, Output } from '@angular/core';
import { ColorPaletteService } from '../services/color-palette.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ColorResponse } from '../interface/interface';
import { FormsModule } from '@angular/forms';
import { NumberArrayPipe } from '../../pipes/number-array.pipe';
import { colors, normalColors, } from '../../assets/colors';
import { CanvasManagerService } from '../services/canvas-manager.service';
import * as fabric from 'fabric'
import { TooltipDirective } from '../shared/tooltip.directive';




@Component({
  selector: 'app-color',
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './color.component.html',
  styleUrl: './color.component.scss',
})
export class ColorComponent {
  documentColors: string[] = [];
  brandColors: string[] = [];
  photoColors: string[] = [];
  defaultSolidColors: { name: string; value: string }[] = [];
  @Input() config!: any;
  headerText!: string;
  activeColor!: string;

  @Output() selectedColorEmitter = new EventEmitter<String>();
  selectedColor!: string;
  availalableColors!: string[];

  pickedColor!: string;
  colorsPerRow = 6;

  constructor(
    private colorPaletteService: ColorPaletteService,
    private http: HttpClient,
    private sidebarStateService: SidebarStateService,
    private colorService: ColorService,
    private canavasManager: CanvasManagerService
  ) {
    effect(() => {
      let colors = this.colorPaletteService.palette();
      console.log(colors);
      this.documentColors = colors;
    });
  }
  hoveredColor: string | null = null;

  // component.ts

  // emitColor( event :any) {
  //   this.selectedColorEmitter.emit(event);
  // }

  //selectedColor: string | null = null;

  ngOnInit(): void {
    if (this.config.text === 'text_bg') {
      this.defaultSolidColors = normalColors;
      console.log(this.defaultSolidColors);
    } else {
      this.defaultSolidColors = colors;
      console.log(this.defaultSolidColors);
    }

    // this.colorService.getColors().subscribe((colors: ColorResponse) => {
    //   console.log('Fetched colors:', colors);
    //   this.defaultSolidColors = colors.defaultSolidColors;
    //   this.photoColors = colors.photoColors;
    //   this.brandColors = colors.brandColors;
    //   this.documentColors = colors.documentColors;
    // });
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.onColorPickedHelper(color);
    // this.selectedColorEmitter.emit(color);
  }

  onColorPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;

    this.pickedColor = color;
    this.documentColors.push(color); // or handle it your own way
    this.onColorPickedHelper(color);

    // Optionally select the new color immediately
    this.selectColor(color);
  }

  onColorPickedHelper(color: string) {
    const canvas = this.canavasManager.getActiveCanvas();
    const active = canvas?.getActiveObject();

    if (!active) return;

    if (active.type === 'activeSelection') {
      // Apply color to each object
      (active as fabric.ActiveSelection).getObjects().forEach((obj) => {
        this.applyColor(obj, color);
      });
    } else {
      // Apply color to single object
      this.applyColor(active, color);
    }

    canvas?.requestRenderAll();
  }

  // applyColor(obj: fabric.Object, color: string) {
  //   if (
  //     obj instanceof fabric.Rect ||
  //     obj instanceof fabric.Circle ||
  //     obj instanceof fabric.Triangle ||
  //     obj instanceof fabric.Polygon ||
  //     obj instanceof fabric.Path ||
  //     obj instanceof fabric.Line ||
  //     obj instanceof fabric.Text ||
  //     obj instanceof fabric.IText ||
  //     obj instanceof fabric.Textbox
  //   ) {
  //     obj.set('fill', color);
  //   }

  //   //obj.canvas?.requestRenderAll();
  // }

  applyColor(obj: fabric.Object, input: string) {
    if (!obj || !input) return;

    const isGradient = input.startsWith('linear-gradient');

    if (isGradient) {
      const gradient = this.parseColorOrGradient(
        input,
        obj.width ?? 0,
        obj.height ?? 0
      );
      if (gradient) {
        console.log(gradient);
        if (this.config.text == 'text_bg') {
          obj.set('backgroundColor', gradient);
        } else {
          obj.set('fill', gradient);
        }
      }
    } else {
      if (this.config.text == 'text_bg') {
        obj.set('backgroundColor', input);
      } else {
        obj.set('fill', input);
      }
    }

    obj.canvas?.requestRenderAll();
  }

  parseColorOrGradient(
    css: string,
    width: number,
    height: number
  ): string | fabric.Gradient<'linear'> | null {
    const match = css.match(/^linear-gradient\((.*)\)$/i);
    if (!match) return null;

    const parts = match[1].split(/,(?![^\(]*\))/); // ✅ splits only outside of rgb(...)

    // direction and color stops
    let direction = parts.shift()?.trim() || 'to right';
    const colorStops: fabric.ColorStop[] = [];

    parts.forEach((part, index) => {
      const [color, offset] = part.trim().split(/\s+(?=[\d.]+%?$)/);
      colorStops.push({
        offset: offset ? parseFloat(offset) / 100 : index / (parts.length - 1),
        color: color.trim(),
      });
    });

    // direction mapping to coordinates
    const coordsMap: Record<string, fabric.GradientCoords<'linear'>> = {
      'to right': { x1: 0, y1: 0, x2: width, y2: 0 },
      'to left': { x1: width, y1: 0, x2: 0, y2: 0 },
      'to bottom': { x1: 0, y1: 0, x2: 0, y2: height },
      'to top': { x1: 0, y1: height, x2: 0, y2: 0 },
    };

    const coords = coordsMap[direction.toLowerCase()] ?? coordsMap['to right'];

    return new fabric.Gradient<'linear'>({
      type: 'linear',
      coords,
      gradientUnits: 'pixels',
      colorStops,
    });
  }

  closeSidebar() {
    this.sidebarStateService.close("color");
  }
}
