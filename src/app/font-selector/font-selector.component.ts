import { FontService } from './../services/font.service';
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
  effect,
} from '@angular/core';
import { SidebarStateService } from '../services/sidebar-state.service';
import { AppFont, AppLanguage } from '../interface/interface';
import { CanvasControlService } from '../services/canvas-control.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasService } from '../services/canvas.service';

@Component({
  selector: 'app-font-selector',
  templateUrl: './font-selector.component.html',
  styleUrls: ['./font-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class FontSelectorComponent implements OnInit, AfterViewInit {
  searchTerm = '';
  fonts: AppFont[] = [];
  filteredFonts: AppFont[] = [];
  isLoadingMore: boolean = false;
  showFilters = false;
  selectedFont!: AppFont | null;
  selectedLanguage: AppLanguage = { code: 'en', label: 'English' };
  searchText: string = '';
  languageOptions: Record<string, string> = {};

  private searchDebounceTimer: any;

  // 👇 reference to each preview element
  @ViewChildren('fontPreview') fontPreviews!: QueryList<ElementRef>;

  constructor(
    private sidebarState: SidebarStateService,
    private fontService: FontService,
    private canvasControlService: CanvasControlService,
    private canvasService: CanvasService
  ) {
    effect(() => {
      this.selectedFont = fontService.selectedFontSignal();
    });
  }

  ngOnInit() {
    this.fontService.getPopularFonts().subscribe((fonts) => {
      this.fonts = fonts;
      this.filteredFonts = fonts; // initialize
      setTimeout(
        () => this.canvasControlService.adjustCanvasPosition(true),
        350
      );
    });

    this.languageOptions = this.fontService.getLangauge();

    this.fontService.getFonts({ sort: 'popular', limit: 100 }).subscribe((fonts) => {

    })

    // this.fontService.getLangauge().subscribe((lang) => {
    //   this.languageOptions = lang;
    //   setTimeout(
    //     () => this.canvasControlService.adjustCanvasPosition(true),
    //     350
    //   );
    // });
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const fontUrl = el.getAttribute('data-font-url');
            const fontName = el.getAttribute('data-font-name');

            if (fontUrl) {
              this.loadFont(fontUrl); // inject <link> if not already loaded
            }
            if (fontName) {
              el.style.fontFamily = fontName; // apply font to preview
            }

            observer.unobserve(entry.target); // stop once applied
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all preview elements
    this.fontPreviews.changes.subscribe(() => {
      this.fontPreviews.forEach((preview) =>
        observer.observe(preview.nativeElement)
      );
    });

    // also observe initial set
    this.fontPreviews.forEach((preview) =>
      observer.observe(preview.nativeElement)
    );
  }

  onSearchChange(value: string) {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.onSearch(value); // call actual search function
    }, 300); // 300ms debounce
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.filteredFonts = this.fonts.filter((font) =>
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
    this.fontService.updateSelectedFontSignal(font);
    this.selectedFont = font;
    this.canvasService.updateTextProperties({
      fontFamily: font?.name,
    });
  }

  onClose() {
    this.sidebarState.open('text');
  }

  applyFilters() {
    this.showFilters = !this.showFilters;
  }
  showPro = false;
  showFree = true;
}
