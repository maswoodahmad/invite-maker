import { type Rect, type Canvas, Point } from 'fabric';


  const MIN_ZOOM = 0.05;
  const MAX_ZOOM = 8;
  const ZOOM_STEP = 0.05;

/**
 * Calculate best zoom to fit artboard in canvas viewport
 */
export const getArtboardCenterZoom = (canvas: Canvas, artboard: Rect) => {
  const widthRatio = (canvas.getWidth() / artboard.width) * 0.95;
  const heightRatio = (canvas.getHeight() / artboard.height) * 0.95;

  return Math.min(widthRatio, heightRatio);
};

/**
 * Center the artboard with calculated zoom
 */
export const centerArtboard = (canvas: Canvas, artboard: Rect) => {
  const zoom = getArtboardCenterZoom(canvas, artboard);
  canvas.setZoom(zoom);

  const offsetX = (canvas.getWidth() - artboard.width * zoom) / 2;
  const offsetY = (canvas.getHeight() - artboard.height * zoom) / 2;

  const vpt = canvas.viewportTransform!;
  vpt[4] = offsetX;
  vpt[5] = offsetY;

  canvas.requestRenderAll();
};

/**
 * Zoom in from center
 */
export const zoomIn = (canvas: Canvas) => {
  const zoom = canvas.getZoom() + ZOOM_STEP;
  canvas.zoomToPoint(
    new Point(canvas.getWidth() / 2, canvas.getHeight() / 2),
    zoom
  );
};

/**
 * Zoom out from center
 */
export const zoomOut = (canvas: Canvas) => {
  const zoom = canvas.getZoom() - ZOOM_STEP;
  canvas.zoomToPoint(
    new Point(canvas.getWidth() / 2, canvas.getHeight() / 2),
    zoom
  );
};
