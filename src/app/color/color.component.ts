import { Component } from '@angular/core';
import { ColorPaletteService } from '../services/color-palette.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-color',
  imports: [],
  templateUrl: './color.component.html',
  styleUrl: './color.component.scss',
})
export class ColorComponent {
  documentColors: string[] = [];
  brandColors: string[] = [];
  photoColors: string[] = [];
  defaultSolidColors: string[][] = [];


  constructor(private colorPaletteService: ColorPaletteService, private  http: HttpClient) {}

  // component.ts

  selectedColor: string | null = null;

  ngOnInit(): void {
    // this.documentColors = colors.documentColors;
    // this.brandColors = colors.brandColors;
    // this.photoColors = colors.photoColors;
    // this.defaultSolidColors = colors.defaultSolidColors;
    this.documentColors = this.colorPaletteService.palette();
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    console.log('Selected Color:', color);
  }

  getColors(): Observable<{ colors: string[] }> {
    return this.http.get<{ colors: string[] }>('/assets/colors.json');
  }
}
