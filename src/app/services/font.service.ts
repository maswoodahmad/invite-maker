import { Injectable, signal } from '@angular/core';
import { AppFont, AppLanguage } from '../interface/interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LanguageSubsetMap } from './../../assets/langugae';
@Injectable({
  providedIn: 'root',
})
export class FontService {
  constructor(private http: HttpClient) {}

  readonly selectedFontSignal = signal<AppFont | null>(null);

  loadFont(font: AppFont): void {
    if (font.isLoaded || !font.url) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = font.url;
    document.head.appendChild(link);

    font.isLoaded = true;
  }

  getPopularFonts(): Observable<AppFont[]> {
    return this.http.get<AppFont[]>('/assets/top-fonts.json');
  }

  getFontUrl(font: string): string {
    const family = font.replace(/ /g, '+');
    return `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  }

  getLangauge() {
    return LanguageSubsetMap;
  }

  getFonts(params: {
    sort?: string;
    family?: string;
    subset?: string;
    category?: string;
    effect?: string;
    limit?: number;
  }): Observable<[]> {
    return this.http.get<[]>('http://localhost:8080/api/fonts', {
      params,
    });
  }

  updateSelectedFontSignal(value:any) {
    this.selectedFontSignal.set(value);
  }
}
