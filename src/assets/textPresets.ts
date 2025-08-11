export interface TextPreset {
  defaultText?:string;
  fontSize: number;
  fontWeight: string;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
  left?: number;
  top?: number;
}

export const TextPresets: Record<string, TextPreset> = {
  heading: {
    defaultText: 'Heading',
    fontSize: 32,
    fontWeight: 'bold',
    fill: '#000',
    fontStyle: 'normal',
    
  },
  subheading: {
    defaultText: 'Subheading',
    fontSize: 24,
    fontWeight: '500',
    fill: '#333',
    fontStyle: 'normal',
  },
  body: {
    defaultText: 'Body',
    fontSize: 16,
    fontWeight: '300',
    fill: '#444',
    fontStyle: 'normal',
  },
  paragraph: {
    defaultText: 'Your paragraph text',
    fontSize: 18,
    fontWeight: '300',
    fill: '#444',
    fontStyle: 'normal',
  },
};
