import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface RecentImage {
  dataUrl: string;
  addedAt: number;
}

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

  save(dataUrl: string): void {
    if (!this.isBrowser()) return;

    const now = Date.now();
    const image: RecentImage = { dataUrl, addedAt: now };

    const existing: RecentImage[] = this.loadRaw().filter(
      img => now - img.addedAt < this.ttlMs
    );

    const updated = [image, ...existing.slice(0, this.maxImages - 1)];
    localStorage.setItem(this.key, JSON.stringify(updated));
  }

  get(): RecentImage[] {
    if (!this.isBrowser()) return [];
    const now = Date.now();
    return this.loadRaw().filter(img => now - img.addedAt < this.ttlMs);
  }

  clear(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.key);
    }
  }

  private loadRaw(): RecentImage[] {
    if (!this.isBrowser()) return [];
    const json = localStorage.getItem(this.key);
    try {
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }
}