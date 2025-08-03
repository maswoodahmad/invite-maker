import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Input,
  HostListener,
  Renderer2,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Inject,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('appTooltip') tooltipText = '';
  private tooltipEl!: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.createTooltip();
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.setTooltipPosition();
    this.renderer.setStyle(this.tooltipEl, 'opacity', '1');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.tooltipEl, 'opacity', '0');
  }

  createTooltip() {
    this.tooltipEl = this.renderer.createElement('div');
    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipEl, text);

    this.renderer.setStyle(this.tooltipEl, 'position', 'fixed'); // Use fixed for screen-aware positioning
    this.renderer.setStyle(this.tooltipEl, 'background-color', '#1f2937');
    this.renderer.setStyle(this.tooltipEl, 'color', 'white');
    this.renderer.setStyle(this.tooltipEl, 'padding', '4px 8px');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipEl, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipEl, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipEl, 'opacity', '0');
    this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none');
    this.renderer.setStyle(
      this.tooltipEl,
      'transition',
      'opacity 0.15s ease-in-out'
    );

    this.renderer.appendChild(document.body, this.tooltipEl);
  }

  setTooltipPosition() {
    const hostEl = this.el.nativeElement;
    const rect = hostEl.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    const spacing = 8;
    let top = rect.top - tooltipRect.height - spacing;
    let placeAbove = true;

    // Check if there's room above; if not, place below
    if (top < 0) {
      top = rect.bottom + spacing;
      placeAbove = false;
    }

    const left = rect.left + rect.width / 2 - tooltipRect.width / 2;

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${Math.max(left, 8)}px`);
  }

  ngOnDestroy() {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
    }
  }
}
