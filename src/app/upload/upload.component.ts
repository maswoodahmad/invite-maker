
import { CanvasManagerService } from './../services/canvas-manager.service';
import { Component, effect, Inject, PLATFORM_ID,  ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as fabric from 'fabric'
import { UploadedImage } from '../interface/interface';
import { RecentUploadsService } from '../recent-uploads.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SidebarStateService } from '../services/sidebar-state.service';
import { CanvasService } from '../services/canvas.service';



import { filters } from 'fabric';

import Pica from 'pica';


@Component({
  standalone: true,
  selector: 'app-upload',
  imports: [FormsModule, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  [x: string]: any;
  images: UploadedImage[] = [];

  rows: any;
  Math = Math;
  scale: number = 1;

  canvas!: fabric.Canvas | null;
  searchQuery = '';
  filteredImages: UploadedImage[] = [];
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private canvasService: CanvasService,
    private recentUploadsService: RecentUploadsService,
    private sidebarState: SidebarStateService
  ) {
    effect(() => {
      this.scale = canvasService.scaleSignal();
    });
  }

  ngOnInit() {
    this.canvas = this.canvasService.getCanvas();
    // this.filteredImages = [...this.images];
    // this.images = this.recentUploadsService.get();

    // this.rows = this.calculateRows(this.images);
    this.canvas = this.canvasService.getCanvas();
    this.images = this.recentUploadsService.get();
    this.onSearch();

    this.filteredImages = [...this.images]; // initialize
    this.rows = this.calculateRows(this.filteredImages);
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

  async addImageToCanvas(dataUrl: string): Promise<void> {
    const img = new Image();
    img.src = dataUrl;

    img.onload = async () => {
      if (!this.canvas) return;

      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();
      const margin = 0.1;

      const availableWidth = canvasWidth * (1 - margin * 2);
      const availableHeight = canvasHeight * (1 - margin * 2);

      let fitScale = Math.min(
        availableWidth / img.width,
        availableHeight / img.height
      );
      fitScale = Math.min(1, fitScale);

      const targetWidth = img.width * fitScale;
      const targetHeight = img.height * fitScale;

      // Resize using Pica
      const offCanvas = document.createElement('canvas');
      offCanvas.width = targetWidth;
      offCanvas.height = targetHeight;

      const pica = Pica();
      await pica.resize(img, offCanvas);

      const resizedDataUrl = offCanvas.toDataURL();

      // Create Fabric image
   const fabricImg = await new Promise<fabric.Image>((resolve, reject) => {
     const tempImg = new Image();
     tempImg.crossOrigin = 'anonymous';
     tempImg.src = resizedDataUrl;

     tempImg.onload = () => {
       const imgInstance = new fabric.Image(tempImg, {
         originX: 'center',
         originY: 'center',
         objectCaching: false,
         noScaleCache: true,
         scaleX: 1,
         scaleY: 1,
         left: canvasWidth / 2,
         top: canvasHeight / 2,
       });
       resolve(imgInstance);
     };

     tempImg.onerror = (err) => reject(err);
   });

      this.canvas.add(fabricImg);
      this.canvas.requestRenderAll();
    };
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredImages = this.images.filter(
      (img) =>
        img.name?.toLowerCase().includes(q) ||
        img.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        img.extension?.toLowerCase().includes(q)
    );
    this.rows = this.calculateRows(this.filteredImages);
  }
  async onUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const name = file.name;
      const tags = this.extractTagsFromName(name);
      const extension = this.extractExtension(file);

      const img = new Image();
      img.onload = async () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const aspect = naturalWidth / naturalHeight;

        // 👇 Generate thumbnail
        const thumbnail = await this.generateThumbnail(file);

        const uploaded: UploadedImage = {
          dataUrl,
          thumbnail,
          selected: false,
          name,
          extension,
          tags,
          addedAt: Date.now(),
          naturalWidth,
          naturalHeight,
          aspect,
        };

        this.recentUploadsService.save(uploaded);
        this.images = this.recentUploadsService.get();
        this.rows = this.calculateRows(this.images);
        this.onSearch();
      };

      img.src = dataUrl;
      input.value = ''; // reset
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

  calculateRows(
    images: UploadedImage[],
    containerWidth = 340,
    maxPerRow = 4
  ): UploadedImage[][] {
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
      row = row.map((img) => ({
        ...img,
        displayWidth: img.aspect * targetHeight,
        displayHeight: targetHeight,
      }));

      rows.push(row);
    }

    return rows;
  }

  calculateRowHeight(
    images: { naturalWidth: number; naturalHeight: number }[],
    containerWidth: number
  ): number {
    const totalAspect = images.reduce((sum, img) => {
      return sum + img.naturalWidth / img.naturalHeight;
    }, 0);

    return containerWidth / totalAspect;
  }

  private extractExtension(file: File): string {
    const parts = file.name.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : 'unknown';
  }

  private generateThumbnail(file: File, maxSize = 100): Promise<string> {
    return new Promise((resolve, reject) => {
      // Special case: SVGs → just use original, scaled by CSS
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // Raster images (png, jpg, etc.)
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');

        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const width = img.width * scale;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

