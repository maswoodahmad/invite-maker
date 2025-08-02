// color-palette.service.ts
import { Injectable, signal } from '@angular/core';
import * as fabric from 'fabric';

@Injectable({ providedIn: 'root' })
export class ColorPaletteService {
  private readonly _palette = signal<string[]>([]);
  readonly palette = this._palette.asReadonly();

  updateFromCanvas(canvas: fabric.Canvas) {
    const objects = canvas.getObjects();
    const colors = new Set<string>();

    objects.forEach((obj) => {
      if ('fill' in obj && obj.fill) {
        const fill = this.extractColor(obj.fill);
        if (fill) colors.add(fill);
      }

      if ('stroke' in obj && obj.stroke) {
        const stroke = this.extractColor(obj.stroke);
        if (stroke) colors.add(stroke);
      }
    });

    // Add canvas background if applicable
    if (typeof canvas.backgroundColor === 'string') {
      colors.add(canvas.backgroundColor);
    }

    this._palette.set(Array.from(colors));
  }

  private extractColor(style: any): string | null {
    if (typeof style === 'string') return style;
    if (style?.type === 'linear' || style?.type === 'radial') {
      return style.colorStops?.[0]?.color || null;
    }
    return null;
  }
}
