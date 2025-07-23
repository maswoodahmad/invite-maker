
import { CanvasManagerService } from './../services/canvas-manager.service';
import { Component, OnInit } from '@angular/core';
import { CustomCanvasObject, CustomFabricObject, PageNumberPosition } from '../interface/interface';
import { CanvasService } from '../services/canvas.service';
import { SidebarStateService } from '../services/sidebar-state.service';
import * as fabric from 'fabric';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-page-number-settings',
  imports: [FormsModule, CommonModule],
  templateUrl: './page-number-settings.component.html',
  styleUrl: './page-number-settings.component.scss'
})
export class PageNumberSettingsComponent {
  positions: PageNumberPosition[] = ['bottom-left', 'bottom-center', 'bottom-right'];
  selected: PageNumberPosition;

  allPages: CustomCanvasObject[] = [];
  togglePageSelector: boolean = false;

  constructor(private canvasService: CanvasService,
     private sidebarState:SidebarStateService,
    private canvasManagerService: CanvasManagerService,
    private CanvasManagerService: CanvasManagerService
  ) {
    this.selected = this.canvasService.getPageNumberPosition();
  }

  totalPages: number = 0;
  ngOnInit() {
    this.totalPages = this.canvasManagerService.getAllCanvases().length;
    this.allPages = this.canvasManagerService.getAllCanvases();
  }

  onPositionChange(position: PageNumberPosition) {
    this.selected = position;
    this.canvasService.setPageNumberPosition(position);
  }

  closeSidebar() {
    this.sidebarState.close('text');
  }

  pageSelection() {
    this.allPages = this.canvasManagerService.getAllCanvases();


  }

  applySelectedPages() {
    const selectedPages = this.allPages.filter(p => p.selected).map(p => p.number);

    this.togglePageSelector = false;
  }







}
