export const TOOLBAR_CONFIG = {
  text: {
    toolbar: [
      {
        icon: 'edit',
        label: 'Edit',
        type: 'panel',
        action: 'editText'
      },
      {
        icon: 'font',
        label: 'Font Family',
        type: 'dropdown',
        action: 'changeFont'
      },
      {
        icon: 'font-size',
        label: 'Font Size',
        type: 'numberInput',
        action: 'changeFontSize'
      },
      {
        icon: 'color',
        label: 'Color',
        type: 'colorPicker',
        action: 'changeFontColor'
      },
      {
        icon: 'bold',
        label: 'Bold',
        type: 'toggle',
        action: 'toggleBold'
      },
      {
        icon: 'italic',
        label: 'Italic',
        type: 'toggle',
        action: 'toggleItalic'
      },
      {
        icon: 'underline',
        label: 'Underline',
        type: 'toggle',
        action: 'toggleUnderline'
      },
      {
        icon: 'align',
        label: 'Align',
        type: 'group',
        options: ['left', 'center', 'right', 'justify'],
        action: 'textAlign'
      },
      {
        icon: 'effects',
        label: 'Effects',
        type: 'panel',
        action: 'openTextEffects'
      },
      {
        icon: 'position',
        label: 'Position',
        type: 'panel',
        action: 'openPositionPanel'
      },
      {
        icon: 'paint',
        label: 'Styles',
        type: 'panel',
        action: 'openStylePanel'
      }
    ]
  },
  image: {
    toolbar: [
      {
        icon: 'edit-image',
        label: 'Edit',
        type: 'panel',
        action: 'editImage'
      },
      {
        icon: 'bg-remover',
        label: 'BG Remover',
        type: 'pro',
        action: 'removeBackground'
      },
      {
        icon: 'flip',
        label: 'Flip',
        type: 'group',
        options: ['horizontal', 'vertical'],
        action: 'flipImage'
      },
      {
        icon: 'color',
        label: 'Tint',
        type: 'colorPicker',
        action: 'tintImage'
      },
      {
        icon: 'align',
        label: 'Align',
        type: 'panel',
        action: 'openAlignPanel'
      },
      {
        icon: 'position',
        label: 'Position',
        type: 'panel',
        action: 'openPositionPanel'
      },
      {
        icon: 'paint',
        label: 'Styles',
        type: 'panel',
        action: 'openStylePanel'
      }
    ]
  },
  background: {
    toolbar: [
      {
        icon: 'color',
        label: 'Color',
        type: 'colorPicker',
        action: 'changeBackgroundColor'
      },
      {
        icon: 'position',
        label: 'Position',
        type: 'panel',
        action: 'openPositionPanel'
      },
      {
        icon: 'paint',
        label: 'Styles',
        type: 'panel',
        action: 'openStylePanel'
      }
    ]
  },
  shape: {
    toolbar: [
      {
        icon: 'edit-shape',
        label: 'Edit',
        type: 'panel',
        action: 'editShape'
      },
      {
        icon: 'color',
        label: 'Fill Color',
        type: 'colorPicker',
        action: 'changeFillColor'
      },
      {
        icon: 'border-color',
        label: 'Border Color',
        type: 'colorPicker',
        action: 'changeStrokeColor'
      },
      {
        icon: 'border-width',
        label: 'Border Width',
        type: 'slider',
        min: 0,
        max: 10,
        action: 'changeStrokeWidth'
      },
      {
        icon: 'corner-round',
        label: 'Corner Radius',
        type: 'slider',
        min: 0,
        max: 100,
        action: 'adjustCornerRadius'
      },
      {
        icon: 'flip',
        label: 'Flip',
        type: 'group',
        options: ['horizontal', 'vertical'],
        action: 'flipShape'
      },
      {
        icon: 'align',
        label: 'Align',
        type: 'panel',
        action: 'openAlignPanel'
      },
      {
        icon: 'position',
        label: 'Position',
        type: 'panel',
        action: 'openPositionPanel'
      },
      {
        icon: 'paint',
        label: 'Styles',
        type: 'panel',
        action: 'openStylePanel'
      }
    ]
  }
};
