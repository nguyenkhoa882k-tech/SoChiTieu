// Material Design 3 inspired modern palette
export const lightPalette = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  primary: '#6750A4',
  secondary: '#625B71',
  tertiary: '#7D5260',
  text: '#1C1B1F',
  muted: '#49454F',
  border: '#E6E1E5',
  success: '#2E7D32',
  danger: '#D32F2F',
  accent: '#6750A4',
  warning: '#F57C00',
  info: '#0277BD',
  // Surfaces
  surface: '#FFFFFF',
  surfaceVariant: '#E7E0EC',
  // Elevation & shadows
  elevation1: 'rgba(103, 80, 164, 0.05)',
  elevation2: 'rgba(103, 80, 164, 0.08)',
  elevation3: 'rgba(103, 80, 164, 0.11)',
};

export const darkPalette = {
  background: '#1C1B1F',
  card: '#2B2930',
  primary: '#D0BCFF',
  secondary: '#CCC2DC',
  tertiary: '#EFB8C8',
  text: '#E6E1E5',
  muted: '#CAC4D0',
  border: '#49454F',
  success: '#81C784',
  danger: '#EF5350',
  accent: '#D0BCFF',
  warning: '#FFB74D',
  info: '#4FC3F7',
  // Surfaces
  surface: '#2B2930',
  surfaceVariant: '#49454F',
  // Elevation & shadows
  elevation1: 'rgba(208, 188, 255, 0.05)',
  elevation2: 'rgba(208, 188, 255, 0.08)',
  elevation3: 'rgba(208, 188, 255, 0.11)',
};

export type ThemePalette = typeof lightPalette;
