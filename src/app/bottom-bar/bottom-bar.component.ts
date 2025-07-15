import { Component, OnInit } from '@angular/core';
import { CanvasZoomService } from '../services/canvas-zoom.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss'
})
export class BottomBarComponent implements OnInit {
  zoomPercent: number = 100;

  constructor(public zoomService: CanvasZoomService) {}

  ngOnInit(): void {
    const currentZoom = this.zoomService.getZoom();
    this.zoomPercent = Math.round(currentZoom * 100);
  }

  onZoomSliderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const zoom = parseInt(input.value, 10) / 100;
    this.zoomPercent = Math.round(zoom * 100);
    this.zoomService.zoomTo(zoom);
  }

  zoomIn() {
    this.zoomService.zoomIn();
    this.updateZoomPercent();
  }

  zoomOut() {
    this.zoomService.zoomOut();
    this.updateZoomPercent();
  }

  resetZoom() {
    this.zoomService.resetZoom();
    this.zoomPercent = 100;
  }

  zoomToFit() {
    this.zoomService.zoomToFit();
    this.updateZoomPercent();
  }

  private updateZoomPercent() {
    this.zoomPercent = Math.round(this.zoomService.getZoom() * 100);
  }
}
