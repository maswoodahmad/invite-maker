export interface TextPreset {
  fontSize: number;
  fontWeight: string;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
}

export const TextPresets: Record<string, TextPreset> = {
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    fill: '#000',
    fontStyle :'normal'
  },
  subheading: {
    fontSize: 24,
    fontWeight: '500',
    fill: '#333',
    fontStyle: 'normal'
  },
  body: {
    fontSize: 16,
    fontWeight: '300',
    fill: '#444',
    fontStyle: 'italic'
  }
};
