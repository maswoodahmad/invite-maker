import { CanvasService } from './../services/canvas.service';
import { ModeService } from './../services/mode.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DesignSize } from '../interface/interface';
import { SidebarStateService } from '../services/sidebar-state.service';
import { TooltipDirective } from '../shared/tooltip.directive';

@Component({
  selector: 'app-project-toolbar',
  standalone: true,
  imports: [FormsModule, CommonModule, TooltipDirective],
  templateUrl: './project-toolbar.component.html',
})
export class ProjectToolbarComponent {
  @Input() projectName = 'Untitled Project';
  @Input() lastSaved: Date = new Date();

  @Output() save = new EventEmitter<void>();
  @Output() rename = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() undoAction = new EventEmitter<void>();
  @Output() redoAction = new EventEmitter<void>();
  @Output() menuOpen = new EventEmitter<boolean>();
  @Output() modeChange = new EventEmitter<'viewing' | 'editing'>();
  @Input() isMobile: boolean = false;

  mode: 'viewing' | 'editing' = 'editing';
  mobileMenuOpen = false;
  sizes: DesignSize[] = [
    { name: 'A4', width: 794, height: 1123, label: 'A4 (210mm × 297mm)' },
    {
      name: 'Card',
      width: 600,
      height: 350,
      label: 'Business Card (3.5in × 2in)',
    },
    {
      name: 'Poster',
      width: 1240,
      height: 1754,
      label: 'Poster A3 (297mm × 420mm)',
    },
    {
      name: 'Square',
      width: 1000,
      height: 1000,
      label: 'Square (1000px × 1000px)',
    },
    { name: 'Custom', width: 1000, height: 1000, label: 'Custom Size' }, // 🆕
  ];

  isMenuOpen = false;
  modeLabel!: string;
  showModeBanner: boolean = false;

  constructor(
    private sidebarService: SidebarStateService,
    private modeService: ModeService,
    private canvasService : CanvasService
  ) {}

  saveProject() {
    this.save.emit();
  }

  renameProject() {
    this.rename.emit();
  }

  deleteProject() {
    this.delete.emit();
  }

  duplicateProject() {
    this.duplicate.emit();
  }

  undo() {
    this.canvasService.onUndo();
  }

  redo() {
    this.canvasService.onRedo();
  }

  toggleShareMenu() {
    // Implement dropdown if needed
  }
  applyCustomSize() {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    this.isMenuOpen && this.sidebarService.toggleSidebar('menu');
    !this.isMenuOpen && this.sidebarService.toggleSidebar('menu');

    this.menuOpen.emit(this.isMenuOpen);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  onModeChange(newMode: 'editing' | 'viewing') {
    this.modeService.setMode(newMode);
    setTimeout(() => {
      this.showModeBanner = false;
    }, 2000); // 2 seconds
  }
}
