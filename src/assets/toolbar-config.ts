export type ToolbarMode = 'text' | 'image' | 'shape' | 'page';

export interface ToolbarItem {
  type:
    | 'dropdown'
    | 'stepper'
    | 'color'
    | 'toggle'
    | 'align'
    | 'button'
  | 'slider'
  | 'font-size';
  label: string;
  icon: string;
  key: string;
}

export const TOOLBAR_CONFIG: Record<ToolbarMode, ToolbarItem[]> = {
  text: [
    { type: 'dropdown', label: 'Font', icon: '', key: 'fontFamily' },
    { type: 'font-size', label: 'Size', icon: '', key: 'fontSize' },
    { type: 'color', label: 'Color', icon: './assets/icons/text-color.svg', key: 'fill' },
    { type: 'toggle', label: 'Bold', icon: './assets/icons/bold.svg', key: 'bold' },
    { type: 'toggle', label: 'Italic', icon: './assets/icons/italic.svg', key: 'italic' },
    {
      type: 'toggle',
      label: 'Underline',
      icon: 'underline.svg',
      key: 'underline',
    },
    {
      type: 'toggle',
      label: 'Strikethrough',
      icon: 'strike.svg',
      key: 'linethrough',
    },
    { type: 'align', label: 'Alignment', icon: 'align.svg', key: 'textAlign' },
    { type: 'button', label: 'Effects', icon: '', key: 'effects' },
    { type: 'button', label: 'Animate', icon: '', key: 'animate' },
    { type: 'button', label: 'Position', icon: '', key: 'position' },
    {
      type: 'button',
      label: 'Copy Style',
      icon: 'paint.svg',
      key: 'copyStyle',
    },
  ],
  image: [
    { type: 'button', label: 'Edit', icon: 'edit.svg', key: 'editImage' },
    { type: 'slider', label: 'Opacity', icon: 'opacity.svg', key: 'opacity' },
    { type: 'button', label: 'Crop', icon: 'crop.svg', key: 'crop' },
    { type: 'button', label: 'Position', icon: '', key: 'position' },
  ],
  shape: [
    { type: 'color', label: 'Fill', icon: 'fill.svg', key: 'fill' },
    { type: 'color', label: 'Border', icon: 'border.svg', key: 'stroke' },
    { type: 'slider', label: 'Border Width', icon: '', key: 'strokeWidth' },
    { type: 'button', label: 'Position', icon: '', key: 'position' },
  ],
  page: [
    { type: 'button', label: 'Background', icon: 'bg.svg', key: 'background' },
    { type: 'button', label: 'Resize', icon: 'resize.svg', key: 'resize' },
    {
      type: 'button',
      label: 'Templates',
      icon: 'template.svg',
      key: 'templates',
    },
  ],
};
