export type GradientOrientation = 'vertical' | 'horizontal' | 'diagonal';

export type GradientTemplate = {
  id: string;
  name: string;
  colors: string[];
  orientation: GradientOrientation;
};

export const PRESET_GRADIENTS: GradientTemplate[] = [
  {
    id: 'sunrise-glow',
    name: 'Sunrise Glow',
    colors: ['#ff9a9e', '#fad0c4'],
    orientation: 'diagonal',
  },
  {
    id: 'electric-flare',
    name: 'Electric Flare',
    colors: ['#a18cd1', '#fbc2eb'],
    orientation: 'vertical',
  },
  {
    id: 'aqua-waves',
    name: 'Aqua Waves',
    colors: ['#43cea2', '#185a9d'],
    orientation: 'horizontal',
  },
  {
    id: 'sunset-rush',
    name: 'Sunset Rush',
    colors: ['#ff512f', '#dd2476'],
    orientation: 'diagonal',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    colors: ['#f6d365', '#fda085'],
    orientation: 'vertical',
  },
  {
    id: 'neon-forest',
    name: 'Neon Forest',
    colors: ['#13547a', '#80d0c7'],
    orientation: 'horizontal',
  },
  {
    id: 'twilight',
    name: 'Twilight',
    colors: ['#0f2027', '#203a43', '#2c5364'],
    orientation: 'vertical',
  },
  {
    id: 'voltage',
    name: 'Voltage',
    colors: ['#b92b27', '#1565C0'],
    orientation: 'diagonal',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: ['#232526', '#414345'],
    orientation: 'horizontal',
  },
  {
    id: 'popsicle',
    name: 'Popsicle',
    colors: ['#fcb69f', '#ffecd2'],
    orientation: 'vertical',
  },
];

export const CUSTOM_GRADIENTS_STORAGE_KEY = 'customGradientTemplates';
