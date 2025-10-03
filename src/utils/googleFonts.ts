// Import comprehensive font metadata with rich descriptions
import { FONT_CATEGORIES as FONT_CATS, ALL_FONT_NAMES } from './fontMetadata';

// Re-export for backwards compatibility
export const FONT_CATEGORIES = FONT_CATS;
export const ALL_FONTS = ALL_FONT_NAMES;

// Export metadata for AI font selection
export { FONT_METADATA, findFontsByStyle } from './fontMetadata';

// Curated color palettes for tasteful designs
export const COLOR_PALETTES = {
  classic: ['#FFFFFF', '#000000', '#FF0000', '#0000FF', '#FFFF00'],
  modern: ['#FFFFFF', '#1E1E1E', '#FF6B6B', '#4ECDC4', '#FFE66D'],
  pastel: ['#FFB5E8', '#B4E4FF', '#BFFCC6', '#FFF4CC', '#D4A5A5'],
  vibrant: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
  neon: ['#FF10F0', '#39FF14', '#00F0FF', '#FFFF00', '#FF3864'],
  earth: ['#8B7355', '#D4A373', '#E8DCC4', '#556B2F', '#8B4513'],
  ocean: ['#006994', '#1292B4', '#90DDF0', '#BEE4F0', '#1A5F7A'],
  sunset: ['#FF6B35', '#F7931E', '#FDC830', '#FE5F55', '#FAA916'],
};

// Pre-designed text style presets
export interface TextStylePreset {
  name: string;
  category: string;
  settings: {
    fontFamily: string;
    fontSize: number;
    bold: boolean;
    color: string;
    letterSpacing: number;
    shadow?: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number };
    stroke?: { enabled: boolean; color: string; width: number };
    background?: {
      enabled: boolean;
      color: string;
      padding: number;
      borderRadius: number;
      opacity?: number;
      gradient?: { enabled: boolean; colors: [string, string]; angle: number };
      stroke?: { enabled: boolean; color: string; width: number };
      shadow?: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number };
    };
    gradient?: { enabled: boolean; colors: [string, string]; angle: number };
    animation?: string;
    animationDuration?: number;
    animationDistance?: number;
  };
}

export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  {
    name: 'Bold Title',
    category: 'Headers',
    settings: {
      fontFamily: 'Bebas Neue',
      fontSize: 72,
      bold: true,
      color: '#FFFFFF',
      letterSpacing: 2,
      shadow: { enabled: true, color: '#000000', blur: 15, offsetX: 3, offsetY: 3 },
    },
  },
  {
    name: 'Elegant Header',
    category: 'Headers',
    settings: {
      fontFamily: 'Playfair Display',
      fontSize: 56,
      bold: true,
      color: '#FFFFFF',
      letterSpacing: 1,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 2, offsetY: 2 },
    },
  },
  {
    name: 'Modern Sans',
    category: 'Headers',
    settings: {
      fontFamily: 'Poppins',
      fontSize: 48,
      bold: true,
      color: '#FFFFFF',
      letterSpacing: 0,
      shadow: { enabled: true, color: '#000000', blur: 10, offsetX: 2, offsetY: 2 },
    },
  },
  {
    name: 'Impact Text',
    category: 'Headers',
    settings: {
      fontFamily: 'Anton',
      fontSize: 64,
      bold: true,
      color: '#FFFFFF',
      letterSpacing: 3,
      stroke: { enabled: true, color: '#000000', width: 3 },
    },
  },
  {
    name: 'Neon Glow',
    category: 'Special',
    settings: {
      fontFamily: 'Bungee',
      fontSize: 54,
      bold: false,
      color: '#FF10F0',
      letterSpacing: 2,
      shadow: { enabled: true, color: '#FF10F0', blur: 25, offsetX: 0, offsetY: 0 },
    },
  },
  {
    name: 'Gradient Pop',
    category: 'Special',
    settings: {
      fontFamily: 'Montserrat',
      fontSize: 60,
      bold: true,
      color: '#FF006E',
      letterSpacing: 1,
      gradient: { enabled: true, colors: ['#FF006E', '#FFBE0B'], angle: 45 },
      stroke: { enabled: true, color: '#FFFFFF', width: 2 },
    },
  },
  {
    name: 'Subtle Caption',
    category: 'Body',
    settings: {
      fontFamily: 'Inter',
      fontSize: 24,
      bold: false,
      color: '#FFFFFF',
      letterSpacing: 0.5,
      background: { enabled: true, color: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 8 },
    },
  },
  {
    name: 'Clean Body',
    category: 'Body',
    settings: {
      fontFamily: 'Poppins',
      fontSize: 28,
      bold: false,
      color: '#FFFFFF',
      letterSpacing: 0,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.8)', blur: 6, offsetX: 1, offsetY: 1 },
    },
  },
  {
    name: 'Quote Style',
    category: 'Body',
    settings: {
      fontFamily: 'Merriweather',
      fontSize: 32,
      bold: false,
      color: '#FFFFFF',
      letterSpacing: 0.5,
      background: { enabled: true, color: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 12 },
    },
  },
  {
    name: 'Playful Fun',
    category: 'Fun',
    settings: {
      fontFamily: 'Fredoka One',
      fontSize: 48,
      bold: false,
      color: '#FFE66D',
      letterSpacing: 1,
      stroke: { enabled: true, color: '#1E1E1E', width: 3 },
      shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 3, offsetY: 3 },
    },
  },
  {
    name: 'Handwritten',
    category: 'Fun',
    settings: {
      fontFamily: 'Permanent Marker',
      fontSize: 42,
      bold: false,
      color: '#FFFFFF',
      letterSpacing: 0,
      shadow: { enabled: true, color: '#000000', blur: 5, offsetX: 2, offsetY: 2 },
    },
  },
  {
    name: 'Script Fancy',
    category: 'Elegant',
    settings: {
      fontFamily: 'Dancing Script',
      fontSize: 52,
      bold: true,
      color: '#FFFFFF',
      letterSpacing: 0,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.6)', blur: 10, offsetX: 2, offsetY: 2 },
    },
  },
];

// Track which fonts have been loaded
const loadedFonts = new Set<string>();

// Load Google Fonts dynamically (individual or small batches)
export const loadGoogleFont = (fontFamily: string) => {
  // Check if already loaded
  if (loadedFonts.has(fontFamily)) {
    console.log(`Font "${fontFamily}" already loaded`);
    return;
  }
  
  const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/ /g, '+')}"]`);
  if (existingLink) {
    console.log(`Font "${fontFamily}" link already exists`);
    loadedFonts.add(fontFamily);
    return;
  }

  console.log(`Loading font "${fontFamily}" from Google Fonts`);
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  loadedFonts.add(fontFamily);
};

// Load fonts in batches to avoid URL length limits
// Google Fonts recommends max 10-15 fonts per request
export const loadAllGoogleFonts = () => {
  const BATCH_SIZE = 10;
  const batches: string[][] = [];
  
  // Split fonts into batches
  for (let i = 0; i < ALL_FONTS.length; i += BATCH_SIZE) {
    batches.push(ALL_FONTS.slice(i, i + BATCH_SIZE));
  }
  
  // Load each batch with a slight delay to prevent overwhelming the browser
  batches.forEach((batch, index) => {
    setTimeout(() => {
      const fontsQuery = batch.map(font => `family=${font.replace(/ /g, '+')}`).join('&');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?${fontsQuery}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Mark these fonts as loaded
      batch.forEach(font => loadedFonts.add(font));
    }, index * 100); // Stagger by 100ms
  });
};

