import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UploadedImage } from './interface/interface';



@Injectable({
  providedIn: 'root',
})
export class RecentUploadsService {
  private key = 'recentImages';
  private maxImages = 10;
  private ttlMs = 2 * 24 * 60 * 60 * 1000;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  save(uploaded: UploadedImage): void {
    if (!this.isBrowser()) return;

    const now = Date.now();
    const aspect = uploaded.naturalWidth / uploaded.naturalHeight;

    // Rebuild object to ensure consistency
    const image: UploadedImage = {
      ...uploaded,
      selected: false, // always reset on save
      addedAt: uploaded.addedAt ?? now,
      aspect,
    };

    const existing: UploadedImage[] = this.loadRaw().filter(
      (img) => now - img.addedAt < this.ttlMs
    );

    const updated = [image, ...existing.slice(0, this.maxImages - 1)];
    localStorage.setItem(this.key, JSON.stringify(updated));
  }

  get(): UploadedImage[] {
    if (!this.isBrowser()) return [];
    const now = Date.now();
    return this.loadRaw().filter((img) => now - img.addedAt < this.ttlMs);
  }

  clear(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.key);
    }
  }

  private loadRaw(): UploadedImage[] {
    if (!this.isBrowser()) return [];
    const json = localStorage.getItem(this.key);
    try {
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }
}
