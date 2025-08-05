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
  action?: (key: string) => void;
  active?: boolean;
  options?: {
    value: string; icon: string
  }[]
}

export const TOOLBAR_CONFIG: Record<ToolbarMode, ToolbarItem[]> = {
  text: [
    { type: 'dropdown', label: 'Font', icon: '', key: 'fontFamily' },
    { type: 'font-size', label: 'Size', icon: '', key: 'fontSize' },
    {
      type: 'color',
      label: 'Color',
      icon: './assets/icons/a.svg',
      key: 'fill',
    },
    {
      type: 'color',
      label: 'Text Background Color',
      icon: './assets/icons/square-a.svg',
      key: 'text_bg',
    },
    {
      type: 'toggle',
      label: 'Bold',
      icon: './assets/icons/bold.svg',
      key: 'bold',
      action: undefined,
    },
    {
      type: 'toggle',
      label: 'Italic',
      icon: './assets/icons/italic.svg',
      key: 'italic',
      action: undefined,
    },

    {
      type: 'toggle',
      label: 'Underline',
      icon: './assets/icons/underline.svg',
      key: 'underline',
      action: undefined,
    },
    {
      type: 'toggle',
      label: 'Strikethrough',
      icon: './assets/icons/strikethrough.svg',
      key: 'linethrough',
      action: undefined,
    },
    {
      type: 'align',
      label: 'Alignment',
      icon: 'align.svg', // Optional base icon
      key: 'textAlign',
      options: [
        { value: 'left', icon: 'align-left.svg' },
        { value: 'center', icon: 'align-center.svg' },
        { value: 'right', icon: 'align-right.svg' },
        { value: 'justify', icon: 'align-justify.svg' },
      ],
    },

    { type: 'button', label: 'Effects', icon: '', key: 'effects' },
    {
      type: 'button',
      label: 'Subscript',
      icon: './assets/icons/subscript.svg',
      key: 'sub',
      action: undefined,
    },
    {
      type: 'button',
      label: 'Superscript',
      icon: './assets/icons/superscript.svg',
      key: 'super',
      action: undefined,
    },
    {
      type: 'stepper',
      label: 'Transparency',
      icon: './assets/icons/transparency.svg',
      key: 'transparency',
      action: undefined,
    },

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



