/**
 * Design System Tokens for Voicify
 * Now using the shared design system for consistency across platforms
 */

import { Colors, Typography, BorderRadius, Shadows, Spacing } from '../../../shared/design-system';

export const designTokens = {
  // Colors from shared design system
  colors: {
    // Primary brand colors - using shared system
    primary: Colors.primary,
    secondary: Colors.secondary,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    
    // Gradient definitions - using shared system
    gradients: Colors.gradients,
    
    // Theme colors - using shared system
    light: Colors.light,
    dark: Colors.dark,
    
    // Voice avatar colors (app-specific)
    avatar: [
      Colors.primary[500], Colors.success[400], Colors.primary[400], Colors.success[300], 
      Colors.warning[400], Colors.primary[300], Colors.primary[600], Colors.primary[700],
      Colors.success[500], Colors.warning[500], Colors.error[400], Colors.success[400],
      Colors.primary[700], Colors.primary[300], Colors.error[500], Colors.success[300]
    ],
  },

  // Typography system - using shared design system
  typography: Typography,

  // Spacing system - using shared design system  
  spacing: Spacing,

  // Border radius system - using shared design system
  borderRadius: BorderRadius,

  // Shadow system - using shared design system
  shadows: Shadows,

  // Breakpoints - web-specific but consistent with mobile approach
  breakpoints: {
    mobile: '0px',
    tablet: '768px', 
    desktop: '1024px',
    wide: '1280px',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Type exports for TypeScript support
export type DesignTokens = typeof designTokens;
export type ColorPalette = typeof designTokens.colors;
export type SpacingScale = typeof designTokens.spacing;