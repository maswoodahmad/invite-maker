
import { CanvasManagerService } from './../services/canvas-manager.service';
import { Component, Inject, PLATFORM_ID,  ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as fabric from 'fabric'
import { UploadedImage } from '../interface/interface';
import { RecentUploadsService } from '../recent-uploads.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SidebarStateService } from '../services/sidebar-state.service';
import { CanvasService } from '../services/canvas.service';







@Component({
  standalone: true,
  selector: 'app-upload',
  imports: [FormsModule, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {

  images: UploadedImage[] = [

  ];


  rows: any;

  canvas!: fabric.Canvas | null;
  searchQuery = '';
  filteredImages: UploadedImage []= [];
  constructor(@Inject(PLATFORM_ID) private platformId: Object,private canvasService: CanvasService, private recentUploadsService: RecentUploadsService, private sidebarState : SidebarStateService){}

  ngOnInit() {
    this.canvas =  this.canvasService.getCanvas();
    this.filteredImages = [...this.images];
    this.images = this.recentUploadsService.get();

    this.rows = this.calculateRows(this.images);

    // Close context menu on outside click

  }

  columnImages: any[][] = [];



  splitImagesIntoColumns(columns: number) {
    this.columnImages = Array.from({ length: columns }, () => []);

    this.images.forEach((img, i) => {
      const colIndex = i % columns;
      this.columnImages[colIndex].push(img);
    });
  }


  openContextMenu(image: UploadedImage) {
    // show custom context menu (optional enhancement)
    console.log('Context menu for:', image.dataUrl);
  }


  addImageToCanvas(dataUrl: string): void {
    const img = new Image();
    img.src = dataUrl;
      img.onload = () => {
        const fabricImg = new fabric.Image(img, {
          left: 50,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });


        this.canvas?.add(fabricImg);
        this.canvas?.renderAll();
      };
      img.onerror = () => {
        console.error('❌ Failed to load image from history');
      };

  }


  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredImages = this.images.filter(img =>
      img.name?.toLowerCase().includes(q) ||
      img.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }


  onUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const name = file.name;
      const tags = this.extractTagsFromName(name); // Optional

      const img = new Image();
      img.onload = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        this.recentUploadsService.save(dataUrl, naturalWidth, naturalHeight, name, tags);
        this.images = this.recentUploadsService.get();
        this.rows = this.calculateRows(this.images); // 👈 update rows
        this.onSearch();
      };


      img.src = dataUrl;
      (input as HTMLInputElement).value = '';
    };

    reader.readAsDataURL(file);
  }

  extractTagsFromName(name: string): string[] {
    const baseName = name.split('.')[0].toLowerCase();

    const tags: string[] = [];

    if (baseName.includes('birthday')) tags.push('birthday');
    if (baseName.includes('wedding')) tags.push('wedding');
    if (baseName.includes('personal')) tags.push('personal');
    if (baseName.includes('celebration')) tags.push('celebration');

    return tags;
  }


  calculateRows(images: UploadedImage[], containerWidth = 340, maxPerRow = 4): UploadedImage[][] {
    const rows: UploadedImage[][] = [];
    let index = 0;

    while (index < images.length) {
      let row: UploadedImage[] = [];
      let totalAspect = 0;
      let count = 0;

      // Add up to maxPerRow images to the row
      while (count < maxPerRow && index < images.length) {
        const img = images[index];
        const aspect = img.naturalWidth / img.naturalHeight;
        row.push({ ...img, aspect });
        totalAspect += aspect;
        index++;
        count++;
      }

      // Calculate new height so row fits containerWidth
      const targetHeight = containerWidth / totalAspect;

      // Assign displayWidth/Height based on aspect
      row = row.map(img => ({
        ...img,
        displayWidth: img.aspect * targetHeight,
        displayHeight: targetHeight,
      }));

      rows.push(row);
    }

    return rows;
  }

  calculateRowHeight(images: { naturalWidth: number, naturalHeight: number }[], containerWidth: number): number {
  const totalAspect = images.reduce((sum, img) => {
    return sum + img.naturalWidth / img.naturalHeight;
  }, 0);

  return containerWidth / totalAspect;
}

}

