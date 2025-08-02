import { FontService } from './../services/font.service';

import { Component, OnInit } from '@angular/core';
import { SidebarStateService } from '../services/sidebar-state.service';
import { AppFont, AppLanguage } from '../interface/interface';
import { CanvasControlService } from '../services/canvas-control.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-font-selector',
  templateUrl: './font-selector.component.html',
  styleUrls: ['./font-selector.component.scss'],
  standalone: true,
  imports :[CommonModule, FormsModule]
})
export class FontSelectorComponent implements OnInit {
  searchTerm = '';
  fonts: AppFont[] = [];
  filteredFonts: AppFont[] = [];
  isLoadingMore: boolean = false;

  selectedLanguage!: AppLanguage;
  searchText: string = '';
  languageOptions: AppLanguage[] = [];

  constructor(private sidebarState: SidebarStateService,
    private fontService: FontService,
    private canvasControlService: CanvasControlService
  ) { }

  ngOnInit() {




    this.fontService.getFonts().subscribe(fonts => {
      this.fonts = fonts;
      // applyFilters based on category, language, search, etc.
      const wasOpen = true;
      const isNowOpen = true;

      setTimeout(() => this.canvasControlService.adjustCanvasPosition(wasOpen), 350);
    });


    this.fontService.getLangauge().subscribe(lang => {
      this.languageOptions = lang;
      // applyFilters based on category, language, search, etc.
      const wasOpen = true;
      const isNowOpen = true;

      setTimeout(() => this.canvasControlService.adjustCanvasPosition(wasOpen), 350);
    });

  }


  onSearch(term: string) {
    this.searchTerm = term;
    this.filteredFonts = this.fonts.filter(font =>
      font.name.toLowerCase().includes(term.toLowerCase())
    );
  }

  loadFont(url: string) {
    if (!document.querySelector(`link[href="${url}"]`)) {
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }

  onFontSelect(font: AppFont) {
    this.loadFont(font.url!);
    // Emit event or apply font to selected canvas object
    console.log(`Font selected: ${font.name}`);
  }


  onClose() {
    this.sidebarState.close('text');
  }

  applyFilters() { }
  showPro = false;
  showFree = true;
}


