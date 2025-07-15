import { Injectable } from "@angular/core";

export interface Template
 {
  id: string;
  name: string;
  tags: string[];
  width: number;
  height: number;
  previewUrl?: string;
  isCustom?: boolean;
  category: string;
  content?: any;
  author?: string;
}

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private templates: Template[] = [
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
      category: 'Posters'
    },
    {
      id: 'square',
      name: 'Square (1080x1080)',
      width: 1080,
      height: 1080,
      previewUrl: 'assets/templates/square-preview.png',
      tags: ['social', 'instagram'],
      category: 'Social Media'
    },
    {
      id: 'custom',
      name: 'Custom Size',
      width: 0,
      height: 0,
      previewUrl: 'assets/templates/square-preview.png',
      isCustom: true,
      tags: ['custom'],
      category: 'Custom'
    }
  ];

  getTemplates(): Template[] {
    return this.templates;
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }
}
