import {
  Directive, ElementRef, Input, HostListener, Renderer2, OnDestroy, OnInit
} from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('appTooltip') tooltipText = '';
  private tooltipEl!: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.createTooltip();
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hideTooltip();
  }

  createTooltip() {
    this.tooltipEl = this.renderer.createElement('div');
    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipEl, text);

    this.renderer.setStyle(this.tooltipEl, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipEl, 'bottom', '100%');
    this.renderer.setStyle(this.tooltipEl, 'left', '50%');
    this.renderer.setStyle(this.tooltipEl, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(this.tooltipEl, 'margin-bottom', '6px');
    this.renderer.setStyle(this.tooltipEl, 'background-color', '#1f2937'); // Tailwind gray-800
    this.renderer.setStyle(this.tooltipEl, 'color', 'white');
    this.renderer.setStyle(this.tooltipEl, 'padding', '4px 8px');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipEl, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipEl, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '100');
    this.renderer.setStyle(this.tooltipEl, 'opacity', '0');
    this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipEl, 'transition', 'opacity 0.15s ease-in-out');

    this.renderer.appendChild(this.el.nativeElement, this.tooltipEl);
  }

  showTooltip() {
    this.renderer.setStyle(this.tooltipEl, 'opacity', '1');
  }

  hideTooltip() {
    this.renderer.setStyle(this.tooltipEl, 'opacity', '0');
  }

  ngOnDestroy() {
    if (this.tooltipEl) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipEl);
    }
  }
}
