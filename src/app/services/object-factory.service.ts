import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid'; // use `uuid` package

@Injectable({ providedIn: 'root' })
export class ObjectFactoryService {
  createText(text: string, options: Partial<fabric.TOptions<fabric.TextboxProps>> = {}): fabric.Textbox {
    const obj = new fabric.Textbox(text, {
      left: 100,
      top: 100,
      fontSize: 24,
      ...options,
    });

    (obj as any).id = uuidv4();
    return obj;
  }

  createRect(options: Partial<fabric.TOptions<fabric.RectProps>> = {}): fabric.Rect {
    const obj = new fabric.Rect({
      width: 100,
      height: 100,
      fill: 'red',
      ...options,
    });

    (obj as any).id = uuidv4();
    return obj;
  }


}
