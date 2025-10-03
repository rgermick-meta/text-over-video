import { TextStylePreset } from './googleFonts';

// JSON Schema for text style presets (for validation and documentation)
export const PRESET_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Text Style Preset',
  type: 'object',
  required: ['name', 'category', 'settings'],
  properties: {
    name: {
      type: 'string',
      description: 'Unique name for the preset',
    },
    category: {
      type: 'string',
      description: 'Category to group presets (e.g., Headers, Body, Fun, Special, Elegant)',
    },
    settings: {
      type: 'object',
      required: ['fontFamily', 'fontSize', 'bold', 'color', 'letterSpacing'],
      properties: {
        fontFamily: { type: 'string' },
        fontSize: { type: 'number', minimum: 12, maximum: 120 },
        bold: { type: 'boolean' },
        color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        letterSpacing: { type: 'number' },
        animation: { 
          type: 'string',
          enum: ['none', 'fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'bounce', 'zoom', 'pulse', 'marqueeLeft', 'marqueeRight']
        },
        animationDuration: { type: 'number', minimum: 0.1 },
        animationDistance: { type: 'number', minimum: 0 },
        shadow: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            color: { type: 'string' },
            blur: { type: 'number' },
            offsetX: { type: 'number' },
            offsetY: { type: 'number' },
          },
        },
        stroke: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            color: { type: 'string' },
            width: { type: 'number' },
          },
        },
        background: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            color: { type: 'string' },
            padding: { type: 'number' },
            borderRadius: { type: 'number' },
            opacity: { type: 'number' },
            gradient: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                colors: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 2,
                  maxItems: 2,
                },
                angle: { type: 'number' },
              },
            },
            stroke: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                color: { type: 'string' },
                width: { type: 'number' },
              },
            },
            shadow: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                color: { type: 'string' },
                blur: { type: 'number' },
                offsetX: { type: 'number' },
                offsetY: { type: 'number' },
              },
            },
          },
        },
        gradient: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            colors: {
              type: 'array',
              items: { type: 'string' },
              minItems: 2,
              maxItems: 2,
            },
            angle: { type: 'number' },
          },
        },
      },
    },
  },
};

const STORAGE_KEY = 'videotext_custom_presets';

/**
 * Load custom presets from localStorage
 */
export const loadCustomPresets = (): TextStylePreset[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const presets = JSON.parse(stored);
    return Array.isArray(presets) ? presets : [];
  } catch (error) {
    console.error('Error loading custom presets:', error);
    return [];
  }
};

/**
 * Save custom presets to localStorage
 */
export const saveCustomPresets = (presets: TextStylePreset[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving custom presets:', error);
    throw new Error('Failed to save presets. Storage might be full.');
  }
};

/**
 * Add a new custom preset
 */
export const addCustomPreset = (preset: TextStylePreset): void => {
  const customPresets = loadCustomPresets();
  
  // Check for duplicate names
  const exists = customPresets.some(p => p.name === preset.name);
  if (exists) {
    throw new Error(`A preset named "${preset.name}" already exists.`);
  }
  
  customPresets.push(preset);
  saveCustomPresets(customPresets);
};

/**
 * Update an existing custom preset
 */
export const updateCustomPreset = (oldName: string, preset: TextStylePreset): void => {
  const customPresets = loadCustomPresets();
  const index = customPresets.findIndex(p => p.name === oldName);
  
  if (index === -1) {
    throw new Error(`Preset "${oldName}" not found.`);
  }
  
  // Check for duplicate names (if name changed)
  if (oldName !== preset.name) {
    const exists = customPresets.some(p => p.name === preset.name);
    if (exists) {
      throw new Error(`A preset named "${preset.name}" already exists.`);
    }
  }
  
  customPresets[index] = preset;
  saveCustomPresets(customPresets);
};

/**
 * Delete a custom preset
 */
export const deleteCustomPreset = (name: string): void => {
  const customPresets = loadCustomPresets();
  const filtered = customPresets.filter(p => p.name !== name);
  saveCustomPresets(filtered);
};

/**
 * Export presets as JSON string
 */
export const exportPresets = (presets: TextStylePreset[]): string => {
  return JSON.stringify(presets, null, 2);
};

/**
 * Import presets from JSON string
 */
export const importPresets = (jsonString: string): TextStylePreset[] => {
  try {
    const presets = JSON.parse(jsonString);
    
    if (!Array.isArray(presets)) {
      throw new Error('Invalid format: Expected an array of presets');
    }
    
    // Basic validation
    for (const preset of presets) {
      if (!preset.name || !preset.category || !preset.settings) {
        throw new Error('Invalid preset format: Missing required fields (name, category, settings)');
      }
      
      const s = preset.settings;
      if (!s.fontFamily || typeof s.fontSize !== 'number' || 
          typeof s.bold !== 'boolean' || !s.color || 
          typeof s.letterSpacing !== 'number') {
        throw new Error(`Invalid preset "${preset.name}": Missing required settings fields`);
      }
    }
    
    return presets;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
};

/**
 * Merge imported presets with existing ones
 * Returns the count of newly added presets
 */
export const mergeImportedPresets = (importedPresets: TextStylePreset[]): number => {
  const customPresets = loadCustomPresets();
  const existingNames = new Set(customPresets.map(p => p.name));
  
  let addedCount = 0;
  for (const preset of importedPresets) {
    if (!existingNames.has(preset.name)) {
      customPresets.push(preset);
      addedCount++;
    }
  }
  
  if (addedCount > 0) {
    saveCustomPresets(customPresets);
  }
  
  return addedCount;
};

/**
 * Create preset from current text element settings
 */
export const createPresetFromSettings = (
  name: string,
  category: string,
  settings: TextStylePreset['settings']
): TextStylePreset => {
  return {
    name,
    category,
    settings,
  };
};

