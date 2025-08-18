import { ShapeLibrary } from '../app/interface/interface';

export const shapeLibrary: ShapeLibrary = {
  shapes: [
    {
      category: 'Line',
      items: [
        {
          id: 'line-straight',
          name: 'Straight Line',
          svg: "<svg viewBox='0 0 100 100'><line x1='10' y1='90' x2='90' y2='10' stroke='black' stroke-width='5'/></svg>",
        },
        {
          id: 'line-horizontal',
          name: 'Horizontal Line',
          svg: "<svg viewBox='0 0 100 100'><line x1='10' y1='50' x2='90' y2='50' stroke='black' stroke-width='5'/></svg>",
        },
        {
          id: 'line-vertical',
          name: 'Vertical Line',
          svg: "<svg viewBox='0 0 100 100'><line x1='50' y1='10' x2='50' y2='90' stroke='black' stroke-width='5'/></svg>",
        },
        {
          id: 'line-arrow',
          name: 'Arrow Line',
          svg: "<svg viewBox='0 0 100 100'><defs><marker id='arrow' markerWidth='10' markerHeight='10' refX='5' refY='3' orient='auto'><path d='M0,0 L0,6 L9,3 z' fill='black'/></marker></defs><line x1='10' y1='90' x2='90' y2='10' stroke='black' stroke-width='5' marker-end='url(#arrow)'/></svg>",
        },
        {
          id: 'line-dashed',
          name: 'Dashed Line',
          svg: "<svg viewBox='0 0 100 100'><line x1='10' y1='50' x2='90' y2='50' stroke='black' stroke-width='5' stroke-dasharray='10,5'/></svg>",
        },
        {
          id: 'line-curved',
          name: 'Curved Line',
          svg: "<svg viewBox='0 0 100 100'><path d='M10,80 Q50,10 90,80' stroke='black' stroke-width='5' fill='transparent'/></svg>",
        },
      ],
    },

    {
      category: 'Basic',
      items: [
        {
          id: 'circle',
          name: 'Circle',
          svg: "<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='black'/></svg>",
        },
        {
          id: 'square',
          name: 'Square',
          svg: "<svg viewBox='0 0 100 100'><rect x='10' y='10' width='80' height='80' fill='black'/></svg>",
        },
        {
          id: 'rectangle',
          name: 'Rectangle',
          svg: "<svg viewBox='0 0 120 80'><rect width='120' height='80' fill='black'/></svg>",
        },
        {
          id: 'triangle',
          name: 'Triangle',
          svg: "<svg viewBox='0 0 100 100'><polygon points='50,10 90,90 10,90' fill='black'/></svg>",
        },
        {
          id: 'ellipse',
          name: 'Ellipse',
          svg: "<svg viewBox='0 0 120 100'><ellipse cx='60' cy='50' rx='50' ry='30' fill='black'/></svg>",
        },
      ],
    },
    {
      category: 'Arrows',
      items: [
        {
          id: 'arrow-right',
          name: 'Right Arrow',
          svg: "<svg viewBox='0 0 100 100'><polygon points='10,50 70,50 70,20 90,60 70,100 70,70 10,70' fill='black'/></svg>",
        },
        {
          id: 'arrow-left',
          name: 'Left Arrow',
          svg: "<svg viewBox='0 0 100 100'><polygon points='90,50 30,50 30,20 10,60 30,100 30,70 90,70' fill='black'/></svg>",
        },
        {
          id: 'arrow-up',
          name: 'Up Arrow',
          svg: "<svg viewBox='0 0 100 100'><polygon points='50,10 90,70 70,70 70,90 30,90 30,70 10,70' fill='black'/></svg>",
        },
        {
          id: 'arrow-down',
          name: 'Down Arrow',
          svg: "<svg viewBox='0 0 100 100'><polygon points='50,90 90,30 70,30 70,10 30,10 30,30 10,30' fill='black'/></svg>",
        },
      ],
    },
    {
      category: 'Stars & Symbols',
      items: [
        {
          id: 'star',
          name: 'Star',
          svg: "<svg viewBox='0 0 100 100'><polygon points='50,10 61,40 95,40 67,60 78,90 50,70 22,90 33,60 5,40 39,40' fill='black'/></svg>",
        },
        {
          id: 'heart',
          name: 'Heart',
          svg: "<svg viewBox='0 0 100 100'><path d='M50 90 L20 50 A15 15 0 0 1 50 20 A15 15 0 0 1 80 50 Z' fill='black'/></svg>",
        },
        {
          id: 'diamond',
          name: 'Diamond',
          svg: "<svg viewBox='0 0 100 100'><polygon points='50,5 95,50 50,95 5,50' fill='black'/></svg>",
        },
        {
          id: 'plus',
          name: 'Plus',
          svg: "<svg viewBox='0 0 100 100'><rect x='40' y='10' width='20' height='80' fill='black'/><rect x='10' y='40' width='80' height='20' fill='black'/></svg>",
        },
        {
          id: 'minus',
          name: 'Minus',
          svg: "<svg viewBox='0 0 100 100'><rect x='10' y='45' width='80' height='10' fill='black'/></svg>",
        },
      ],
    },
    {
      category: 'Geometric',
      items: [
        {
          id: 'pentagon',
          name: 'Pentagon',
          svg: "<svg viewBox='0 0 100 100'><polygon points='50,10 90,40 75,90 25,90 10,40' fill='black'/></svg>",
        },
        {
          id: 'hexagon',
          name: 'Hexagon',
          svg: "<svg viewBox='0 0 100 100'><polygon points='25,10 75,10 95,50 75,90 25,90 5,50' fill='black'/></svg>",
        },
        {
          id: 'octagon',
          name: 'Octagon',
          svg: "<svg viewBox='0 0 100 100'><polygon points='35,5 65,5 95,35 95,65 65,95 35,95 5,65 5,35' fill='black'/></svg>",
        },
        {
          id: 'parallelogram',
          name: 'Parallelogram',
          svg: "<svg viewBox='0 0 120 100'><polygon points='20,10 110,10 100,90 10,90' fill='black'/></svg>",
        },
        {
          id: 'trapezoid',
          name: 'Trapezoid',
          svg: "<svg viewBox='0 0 120 100'><polygon points='30,10 90,10 110,90 10,90' fill='black'/></svg>",
        },
      ],
    },
    {
      category: 'UI/Icons',
      items: [
        {
          id: 'check',
          name: 'Check Mark',
          svg: "<svg viewBox='0 0 100 100'><polyline points='20,55 40,75 80,25' fill='none' stroke='black' stroke-width='10'/></svg>",
        },
        {
          id: 'cross',
          name: 'Cross',
          svg: "<svg viewBox='0 0 100 100'><line x1='20' y1='20' x2='80' y2='80' stroke='black' stroke-width='10'/><line x1='80' y1='20' x2='20' y2='80' stroke='black' stroke-width='10'/></svg>",
        },
        {
          id: 'play',
          name: 'Play Button',
          svg: "<svg viewBox='0 0 100 100'><polygon points='30,20 80,50 30,80' fill='black'/></svg>",
        },
        {
          id: 'pause',
          name: 'Pause Button',
          svg: "<svg viewBox='0 0 100 100'><rect x='25' y='20' width='15' height='60' fill='black'/><rect x='60' y='20' width='15' height='60' fill='black'/></svg>",
        },
        {
          id: 'stop',
          name: 'Stop Button',
          svg: "<svg viewBox='0 0 100 100'><rect x='20' y='20' width='60' height='60' fill='black'/></svg>",
        },
      ],
    },
  ],
};
