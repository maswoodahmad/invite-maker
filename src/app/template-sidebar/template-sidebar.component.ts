import {
  Component,
  OnInit,
  HostListener,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  output,
  Output,
  EventEmitter
} from '@angular/core';
import {
  CommonModule,
  NgFor,
  NgIf
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  TemplateService,
  Template
} from '../services/template.service';
import {
  CanvasZoomService
} from '../services/canvas-zoom.service';
import { PageSizePopupComponent } from '../page-size-popup/page-size-popup.component';


@Component({
  selector: 'app-template-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, CommonModule, PageSizePopupComponent],
  templateUrl: './template-sidebar.component.html',
  styleUrls: ['./template-sidebar.component.scss']
})
export class TemplateSidebarComponent implements OnInit {
  activeTab: 'templates' | 'myDesigns' = 'templates';
  searchQuery = '';
  selectedTag = 'all';
  availableTags = ['all', 'birthday', 'resume', 'poster', 'social', 'print', 'document'];

  filteredTemplates: Template[] = [];
  openContextTemplate: Template | null = null;







  contextMenuStyle: { top: string; left: string } = { top: '0px', left: '0px' };

  constructor(
    private templateService: TemplateService,
    private zoomService: CanvasZoomService
  ) { }

  @ViewChild('contextMenuRef') contextMenuRef!: ElementRef<HTMLElement>;

  templates: Template[] = [
    {
      id: 'a4',
      name: 'A4 (Portrait)',
      width: 2480,
      height: 3508,
      previewUrl: 'assets/templates/a4-preview.png',
      tags: ['print', 'document'],
      category: 'Standard Sizes'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },
    {
      id: 'poster',
      name: 'Poster (24x36 in)',
      width: 7200,
      height: 10800,
      previewUrl: 'assets/templates/poster-preview.png',
      tags: ['poster', 'large', 'event'],
      category: 'Posters',
      author: 'Maswood'
    },

    {
      id: 'square',
      name: 'Square (1080x1080)',
      width: 1080,
      height: 1080,
      previewUrl: 'assets/templates/square-preview.png',
      tags: ['social', 'instagram'],
      category: 'Social Media',
      author: 'Maswood'
    },
    {
      id: 'custom',
      name: 'Custom Size',
      width: 0,
      height: 0,
      isCustom: true,
      tags: ['custom'],
      category: 'Custom',
      author: 'Maswood'
    }
  ];

  ngOnInit(): void {
    this.filteredTemplates = [...this.templates];

    // Close context menu on outside click
    window.addEventListener('click', () => {
      this.openContextTemplate = null;
    });
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredTemplates = this.templates.filter(template =>
      template.name.toLowerCase().includes(q) ||
      template.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }

  filterTemplatesByTag(tag: string): void {
    this.selectedTag = tag;
    this.searchQuery = '';
    if (tag === 'all') {
      this.filteredTemplates = [...this.templates];
    } else {
      this.filteredTemplates = this.templates.filter(t => t.tags.includes(tag));
    }
  }

  clearTagFilter(): void {
    this.selectedTag = 'all';
    this.filteredTemplates = [...this.templates];
  }

  useTemplate(template: Template) {
    console.log('Selected template:', template);
    //this.zoomService.refreshLayoutAndRecenter(template.width, template.height);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/templates/placeholder.png';
  }



  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.openContextTemplate = null;
  }

 



  toggleContextMenu(event: MouseEvent, template: Template): void {
    event.stopPropagation();

    if (this.openContextTemplate === template) {
      this.openContextTemplate = null;
      return;
    }

    this.openContextTemplate = template;
    const button = event.currentTarget as HTMLElement;

    setTimeout(() => {
      const header = document.querySelector('app-project-toolbar') as HTMLElement;
      const footer = document.querySelector('app-bottom-bar') as HTMLElement;

      const headerHeight = header?.offsetHeight || 0;
      const footerHeight = footer?.offsetHeight || 0;




      const rect = button.getBoundingClientRect();
      // ... do your logic
      let menuHeight = 200;
      if (this.contextMenuRef) {
        menuHeight = this.contextMenuRef.nativeElement.offsetHeight;
        console.log('Context menu height:', menuHeight);
      }




      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Default position (below the button)
      let top = rect.top + scrollY;

      // Clamp if it goes below viewport
      const maxTop = viewportHeight - menuHeight - footerHeight - 8 - headerHeight;
      if (rect.top + menuHeight > maxTop) {
        top = Math.max(scrollY + headerHeight + 8, maxTop); // never go above header
      }

      const left = rect.right;

      this.contextMenuStyle = {
        top: `${top}px`,
        left: `${left - 60}px`
      };
    }, 0); // wait for next render so menu DOM is present
  }


  ngOnDestroy(): void {
    window.removeEventListener('click', this.handleOutsideClick);
  }

  handleOutsideClick = () => {
    this.openContextTemplate = null;
  };


  showPagePopup = false;




}
