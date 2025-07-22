import { Injectable } from '@angular/core';
import { AppFont, AppLanguage } from '../interface/interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FontService {


  constructor(private http: HttpClient) { }



  loadFont(font: AppFont): void {
    if (font.isLoaded || !font.url) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = font.url;
    document.head.appendChild(link);

    font.isLoaded = true;
  }




  getFonts(): Observable<AppFont[]> {
    return this.http.get<AppFont[]>('/assets/fonts.json');
  }

  getFontUrl(font: string): string {
    const family = font.replace(/ /g, '+');
    return `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  }

  getLangauge(): Observable<AppLanguage[]> {
    return this.http.get<AppLanguage[]>('/assets/language.json');
  }

}
