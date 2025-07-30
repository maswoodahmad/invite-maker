import { v4 as uuidv4 } from 'uuid';
import * as fabric from 'fabric';

export class CustomTextBox extends fabric.Textbox {
  id: string;
  name: string;

  constructor(text: string, options: Partial<fabric.Textbox> = {}) {
    super(text, options);
    this.id = (options as any).id ?? uuidv4();
    this.name = 'textbox';
  }


}

