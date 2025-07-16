import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-sidebar',
  imports: [FormsModule, CommonModule],
  templateUrl: './text-sidebar.component.html',
  styleUrl: './text-sidebar.component.scss'
})
export class TextSidebarComponent {
  searchQuery: string = '';
  activeFilter: string | null = null;

  onSearch() {
    this.activeFilter = this.searchQuery.trim() || null;
  }

  applyCategoryFilter(category: string) {
    this.searchQuery = category;
    this.onSearch();
  }

  textItems = [
    { name: 'Heading', category: 'Default' },
    { name: 'Subheading', category: 'Default' },
    { name: 'Body', category: 'Default' },
    { name: 'Page numbers', category: 'Dynamic' },
  ];

  getFilteredTextItems() {
    return this.textItems.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.activeFilter = null;
    this.onSearch(); // Optionally reset filtered list
  }
}
