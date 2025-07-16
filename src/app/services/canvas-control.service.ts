import { Injectable } from "@angular/core";
import { FabricEditorComponent } from "../fabric-editor/fabric-editor.component";

@Injectable({ providedIn: 'root' })
export class CanvasControlService {
  private editorInstance: FabricEditorComponent | null = null;

  registerInstance(instance: FabricEditorComponent) {
    this.editorInstance = instance;
  }

  shiftCanvasToRight(shift: number) {
    this.editorInstance?.shiftCanvasToRight(shift);
  }
}
