import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ColorResponse } from '../interface/interface';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  constructor(private http: HttpClient) {}

  getColors(): Observable<ColorResponse> {
    return this.http.get<ColorResponse>('/assets/colors.json');
  }
}
