// Core types representing a multi-page design project
import * as fabric from 'fabric';
export interface DesignProject {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  pages: DesignPage[];
  settings: ProjectSettings;
  autoSave: boolean;
}

export interface DesignPage {
  id: string;
  name: string; // Optional label like "Page 1"
  canvasData: fabric.Object[] | any; // Fabric JSON (from canvas.toJSON())
  thumbnail?: string; // Optional preview image (e.g., data URL)
}

export interface ProjectSettings {
  width: number;      // canvas width in px
  height: number;     // canvas height in px
  backgroundColor: string; // default background color
  snapToGrid?: boolean;
  gridSize?: number;
}

// Metadata for tabs
export interface ProjectTab {
  projectId: string;
  tabId: string;
  activePageId: string;
  title: string;
  isActive: boolean;
}

// For storing/loading project data (e.g. from file or backend)
export interface ProjectStorage {
  saveProject(project: DesignProject): Promise<void>;
  loadProject(id: string): Promise<DesignProject>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<DesignProject[]>;
  importProject(json: string): DesignProject;
  exportProject(project: DesignProject): string;
}

// UI interaction state (optional)
export interface UIState {
  openTabs: ProjectTab[];
  activeTabId: string;
  selectedPageId: string;
  showSidebar: boolean;
  zoomLevel: number;
}

export interface DesignSize {
  name: string;
  width: number;   // in pixels
  height: number;  // in pixels
  label: string;   // e.g. "A4 (210mm x 297mm)"
}

export type PageNumberPosition = 'bottom-left' | 'bottom-center' | 'bottom-right';





export interface CustomFabricObject extends fabric.Object {
  id?: string;
  name?: string;
  locked?: boolean;
  hidden?: boolean;
  selected?: boolean;
  number?: number;
  data?: any;
  pageNumber?: number;
  tyep?: string;

}

export type SidebarView =
  | 'design'
  | 'text'
  | 'elements'
  | 'uploads'
  | 'projects'
  | 'tools'
  | 'pages'
  |'fonts'
  | null;

export interface CustomCanvasObject extends fabric.Canvas {
  number?: number;
  selected?: boolean;
  }


export interface AppFont {
  name: string; // e.g. 'Roboto'
  url?: string; // external link if lazy loaded
  isLoaded?: boolean;
  isPopular?: boolean;
  previewText?: string;
}

export interface AppLanguage {
  code?: string; // e.g. 'hindi'
  label: string; // label

}

export interface CanvasLayer {
  id: string;
  name?: string;
  object: fabric.Object;
  hidden: boolean;
  locked: boolean;
  preview?: string; // dataURL or asset
}


export type ToolbarMode = 'text' | 'image' | 'shape' | 'page' | null;
