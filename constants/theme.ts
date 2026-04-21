import { MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

export const baloriTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D8C7B5',
    onPrimary: '#1A1918',
    primaryContainer: '#4A3F36',
    onPrimaryContainer: '#D8C7B5',

    secondary: '#67625C',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#4A4540',
    onSecondaryContainer: '#D8C7B5',

    tertiary: '#5175C3',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#3A5A9E',
    onTertiaryContainer: '#C8D6F0',

    background: '#1A1918',
    onBackground: '#D8C7B5',

    surface: '#1A1918',
    onSurface: '#D8C7B5',
    surfaceVariant: '#2A2827',
    onSurfaceVariant: '#9B9590',

    outline: '#67625C',
    outlineVariant: '#3A3836',

    elevation: {
      level0: 'transparent',
      level1: '#242220',
      level2: '#2A2827',
      level3: '#312F2D',
      level4: '#333130',
      level5: '#383634',
    },

    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFB4AB',

    inverseSurface: '#D8C7B5',
    inverseOnSurface: '#1A1918',
    inversePrimary: '#5C4F44',

    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.5)',

    surfaceDisabled: 'rgba(216, 199, 181, 0.12)',
    onSurfaceDisabled: 'rgba(216, 199, 181, 0.38)',
  },
};
