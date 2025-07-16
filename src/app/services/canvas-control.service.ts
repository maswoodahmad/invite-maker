import { Injectable } from "@angular/core";
import { FabricEditorComponent } from "../fabric-editor/fabric-editor.component";
import { CanvasProjectWrapperComponent } from "../canvas-project-wrapper/canvas-project-wrapper.component";

@Injectable({ providedIn: 'root' })
export class CanvasControlService {
  private editorInstance: CanvasProjectWrapperComponent | null = null;

  registerInstance(instance: CanvasProjectWrapperComponent) {
    this.editorInstance = instance;
  }

  shiftCanvasIntoViewport( templateWidth: number,
    templateHeight: number,
    availableWidth: number,
    availableHeight: number) {
    this.editorInstance?.shiftCanvasIntoViewport(
      templateWidth,
      templateHeight,
      availableWidth,
      availableHeight);
  }

  restoreCanvasTransform(): void {
    this.editorInstance?.restoreCanvasTransform();
  }


}
