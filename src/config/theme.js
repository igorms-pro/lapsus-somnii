/**
 * Theme Configuration
 * Colors, fonts, and design tokens
 */

export const THEME = {
  // Colors
  colors: {
    // World colors
    enfance: {
      primary: '#FFB6C1',
      secondary: '#87CEEB',
      background: '#FFF8DC',
    },
    adolescence: {
      primary: '#FF1493',
      secondary: '#00CED1',
      background: '#2F4F4F',
    },
    etudes: {
      primary: '#4169E1',
      secondary: '#FFD700',
      background: '#F0F8FF',
    },
    vieAdulte: {
      primary: '#696969',
      secondary: '#A9A9A9',
      background: '#DCDCDC',
    },
    sagesse: {
      primary: '#DAA520',
      secondary: '#DDA0DD',
      background: '#F5DEB3',
    },
    
    // UI colors
    text: '#000000',
    textLight: '#FFFFFF',
    success: '#4CAF50',
    danger: '#F44336',
    warning: '#FF9800',
  },
  
  // Typography
  fonts: {
    regular: 'System',
    bold: 'System',
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
};

export default THEME;

