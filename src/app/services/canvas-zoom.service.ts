import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

@Injectable({
  providedIn: 'root'
})
export class CanvasZoomService {
  private canvas!: fabric.Canvas;

  layoutOffsets = {
    sidebar: 250,
    header: 100,
    footer: 50
  };

  init(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.attachMouseWheelZoom();

    // Default canvas size (big enough for any template)
    canvas.setWidth(2000);
    canvas.setHeight(2000);

    // Calculate layout component sizes
    const header = document.querySelector('app-project-toolbar') as HTMLElement;
    const sidebar = document.querySelector('app-sidebar') as HTMLElement;
    const footer = document.querySelector('app-bottom-bar') as HTMLElement;

    this.layoutOffsets.header = header?.offsetHeight || 100;
    this.layoutOffsets.sidebar = sidebar?.offsetWidth || 250;
    this.layoutOffsets.footer = footer?.offsetHeight || 50;

    const usableWidth = window.innerWidth - this.layoutOffsets.sidebar;
    const usableHeight = window.innerHeight - this.layoutOffsets.header - this.layoutOffsets.footer;

    // Design area size: A4 (default template)
    const a4Width = 794;
    const a4Height = 1123;

    // Create the design area (locked, not selectable)
    const designArea = new fabric.Rect({
      width: a4Width,
      height: a4Height,
      fill: '#fff',
      stroke: '#ccc',
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'center',
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      name: 'design-area'
    });
    canvas.add(designArea);

    // Zoom to fit the design area in viewport
    const zoomLevel = Math.min(usableWidth / a4Width, usableHeight / a4Height) * 0.9;
    canvas.setZoom(zoomLevel);

    // Center viewport around design
    setTimeout(() => {
      const wrapper = document.querySelector('.canvas-scroll-wrapper') as HTMLElement;
      if (!wrapper) return;

      const scrollLeft = (canvas.getWidth() * zoomLevel - wrapper.clientWidth) / 2;
      const scrollTop = (canvas.getHeight() * zoomLevel - wrapper.clientHeight) / 2;

      wrapper.scrollLeft = scrollLeft;
      wrapper.scrollTop = scrollTop;
    }, 100);

    canvas.requestRenderAll();
  }

  setLayoutOffsets(offsets: Partial<{ sidebar: number; header: number; footer: number }>) {
    this.layoutOffsets = { ...this.layoutOffsets, ...offsets };
  }

  recenterCanvas(templateWidth: number, templateHeight: number) {
    const usableWidth = window.innerWidth - this.layoutOffsets.sidebar;
    const usableHeight = window.innerHeight - this.layoutOffsets.header - this.layoutOffsets.footer;

    const zoom = Math.min(usableWidth / templateWidth, usableHeight / templateHeight) * 0.9;
    this.canvas.setZoom(zoom);

    setTimeout(() => {
      const wrapper = document.querySelector('.canvas-scroll-wrapper') as HTMLElement;
      if (!wrapper) return;

      const scrollLeft = (this.canvas.getWidth() * zoom - wrapper.clientWidth) / 2;
      const scrollTop = (this.canvas.getHeight() * zoom - wrapper.clientHeight) / 2;

      wrapper.scrollLeft = scrollLeft;
      wrapper.scrollTop = scrollTop;
    }, 50);
  }

  getZoom(): number {
    return this.canvas?.getZoom() || 1;
  }

  zoomTo(zoom: number) {
    zoom = Math.min(5, Math.max(0.1, zoom));
    const wrapper = document.querySelector('.canvas-scroll-wrapper') as HTMLElement;
    if (!wrapper) return;

    const scrollLeft = wrapper.scrollLeft;
    const scrollTop = wrapper.scrollTop;
    const centerX = scrollLeft + wrapper.clientWidth / 2;
    const centerY = scrollTop + wrapper.clientHeight / 2;

    const centerPoint = new fabric.Point(
      centerX / this.canvas.getZoom(),
      centerY / this.canvas.getZoom()
    );

    this.canvas.zoomToPoint(centerPoint, zoom);
    this.canvas.requestRenderAll();
  }

  attachMouseWheelZoom(): void {
    this.canvas.on('mouse:wheel', (opt) => {
      const event = opt.e as WheelEvent;
      if (!event.ctrlKey && !event.metaKey) return;

      const delta = event.deltaY;
      const zoomStep = 0.001;
      let zoom = this.canvas.getZoom() - delta * zoomStep;
      zoom = Math.max(0.1, Math.min(5, zoom));

      const wrapper = document.querySelector('.canvas-scroll-wrapper') as HTMLElement;
      const centerX = wrapper.scrollLeft + wrapper.clientWidth / 2;
      const centerY = wrapper.scrollTop + wrapper.clientHeight / 2;

      const centerPoint = new fabric.Point(
        centerX / this.canvas.getZoom(),
        centerY / this.canvas.getZoom()
      );

      this.canvas.zoomToPoint(centerPoint, zoom);
      this.canvas.requestRenderAll();

      event.preventDefault();
      event.stopPropagation();
    });
  }

  zoomIn() {
    this.zoomTo(this.getZoom() * 1.1);
  }

  zoomOut() {
    this.zoomTo(this.getZoom() / 1.1);
  }

  resetZoom() {
    this.zoomTo(1);
    this.canvas?.absolutePan(new fabric.Point(0, 0));
  }

  zoomToFit() {
    const objects = this.canvas.getObjects();
    if (!objects.length) return;

    const group = new fabric.Group(objects);
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    const scaleX = canvasWidth / group.width!;
    const scaleY = canvasHeight / group.height!;
    const fitScale = Math.min(scaleX, scaleY) * 0.8;

    this.zoomTo(fitScale);

    const centerX = (canvasWidth - group.width! * fitScale) / 2;
    const centerY = (canvasHeight - group.height! * fitScale) / 2;
    this.canvas.absolutePan(new fabric.Point(centerX, centerY));
  }


  // refreshLayoutAndRecenter(width?: number, height?: number): void {
  //   const header = document.querySelector('app-project-toolbar') as HTMLElement;
  //   const sidebar = document.querySelector('app-template-sidebar') as HTMLElement;
  //   const footer = document.querySelector('app-bottom-bar') as HTMLElement;

  //   const headerHeight = header?.offsetHeight || 0;
  //   const sidebarWidth = sidebar?.offsetWidth || 0;
  //   const footerHeight = footer?.offsetHeight || 0;

  //   this.setLayoutOffsets({
  //     sidebar: sidebarWidth,
  //     header: headerHeight,
  //     footer: footerHeight
  //   });

  //   // 🧠 Auto-detect width & height if not passed
  //   if (!width || !height) {
  //     const designArea = this.canvas.getObjects().find(
  //       obj => (obj as any).name === 'design-area'
  //     ) as fabric.Rect;

  //     width = designArea?.width ?? 800;
  //     height = designArea?.height ?? 600;
  //   }

  //   this.recenterCanvas(width, height);
  // }


  refreshLayoutAndRecenter(
    wrapper: HTMLElement,
    outer: HTMLElement,
    focusObject?: fabric.Object
  ) {
    const zoom = this.canvas.getZoom();

    setTimeout(() => {
      let scrollLeft: number;
      let scrollTop: number;

      const layoutOffsetLeft = this.layoutOffsets.sidebar || 0;

      if (focusObject) {
        const objRect = focusObject.getBoundingRect();
        scrollLeft =
          (objRect.left + objRect.width / 2) * zoom - wrapper.clientWidth / 2;
        scrollTop =
          (objRect.top + objRect.height / 2) * zoom - wrapper.clientHeight / 2;
      } else {
        // ✅ Fix: subtract left margin (sidebar) from canvas width
        const centerX = this.canvas.getWidth() * zoom / 2;
        const centerY = this.canvas.getHeight() * zoom / 2;

        scrollLeft = centerX - (wrapper.clientWidth / 2 - layoutOffsetLeft);
        scrollTop = centerY - wrapper.clientHeight / 2;
      }
      console.log('Scroll info', {
        wrapperScrollWidth: wrapper.scrollWidth,
        wrapperClientWidth: wrapper.clientWidth,
        scrollLeft,
      });

      wrapper.scrollTo({ top: scrollTop, left: scrollLeft, behavior: 'smooth' });
    }, 0);
  }

}
