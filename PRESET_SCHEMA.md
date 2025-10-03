# Text Style Preset Schema

This document describes the JSON schema for text style presets that can be imported and exported in the Video+Text application.

## Schema Overview

Presets are stored as an array of preset objects. Each preset object follows this structure:

```json
[
  {
    "name": "My Custom Preset",
    "category": "Custom",
    "settings": {
      "fontFamily": "Poppins",
      "fontSize": 48,
      "bold": true,
      "color": "#ffffff",
      "letterSpacing": 2,
      "shadow": {
        "enabled": true,
        "color": "#000000",
        "blur": 10,
        "offsetX": 2,
        "offsetY": 2
      },
      "stroke": {
        "enabled": false,
        "color": "#000000",
        "width": 2
      },
      "background": {
        "enabled": false,
        "color": "#000000",
        "padding": 12,
        "borderRadius": 8,
        "opacity": 0.8,
        "gradient": {
          "enabled": false,
          "colors": ["#000000", "#333333"],
          "angle": 90
        },
        "stroke": {
          "enabled": false,
          "color": "#ffffff",
          "width": 2
        },
        "shadow": {
          "enabled": false,
          "color": "#000000",
          "blur": 5,
          "offsetX": 2,
          "offsetY": 2
        }
      },
      "gradient": {
        "enabled": false,
        "colors": ["#FF006E", "#FFBE0B"],
        "angle": 45
      },
      "animation": "fadeIn",
      "animationDuration": 1,
      "animationDistance": 100
    }
  }
]
```

## Field Descriptions

### Top-Level Fields (Required)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Unique name for the preset |
| `category` | string | ✅ | Category to group presets (e.g., "Headers", "Body", "Custom") |
| `settings` | object | ✅ | Style settings for the preset |

### Settings Fields (Required)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fontFamily` | string | ✅ | Font family name (should be a Google Font) |
| `fontSize` | number | ✅ | Font size in pixels (12-120) |
| `bold` | boolean | ✅ | Whether text is bold |
| `color` | string | ✅ | Text color in hex format (e.g., "#ffffff") |
| `letterSpacing` | number | ✅ | Letter spacing in pixels |

### Settings Fields (Optional)

#### Animation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `animation` | string | ❌ | Animation type: 'none', 'fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'bounce', 'zoom', 'pulse', 'marqueeLeft', 'marqueeRight' |
| `animationDuration` | number | ❌ | Animation duration in seconds |
| `animationDistance` | number | ❌ | Distance percentage for directional animations (e.g., 100 for 100%) |

#### Shadow

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `shadow.enabled` | boolean | ✅ | Whether shadow is enabled |
| `shadow.color` | string | ✅ | Shadow color in hex format or rgba |
| `shadow.blur` | number | ✅ | Shadow blur radius in pixels |
| `shadow.offsetX` | number | ✅ | Shadow horizontal offset in pixels |
| `shadow.offsetY` | number | ✅ | Shadow vertical offset in pixels |

#### Stroke

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stroke.enabled` | boolean | ✅ | Whether text stroke is enabled |
| `stroke.color` | string | ✅ | Stroke color in hex format |
| `stroke.width` | number | ✅ | Stroke width in pixels |

#### Background

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `background.enabled` | boolean | ✅ | Whether background is enabled |
| `background.color` | string | ✅ | Background color in hex format |
| `background.padding` | number | ✅ | Background padding in pixels |
| `background.borderRadius` | number | ✅ | Background border radius in pixels |
| `background.opacity` | number | ❌ | Background opacity (0-1) |
| `background.gradient` | object | ❌ | Gradient settings for the background |
| `background.gradient.enabled` | boolean | ✅ | Whether gradient is enabled on background |
| `background.gradient.colors` | array[string, string] | ✅ | Two colors for gradient in hex format |
| `background.gradient.angle` | number | ✅ | Gradient angle in degrees (0-360) |
| `background.stroke` | object | ❌ | Stroke/border settings for the background |
| `background.stroke.enabled` | boolean | ✅ | Whether stroke is enabled on background |
| `background.stroke.color` | string | ✅ | Stroke color in hex format |
| `background.stroke.width` | number | ✅ | Stroke width in pixels |
| `background.shadow` | object | ❌ | Shadow settings for the background |
| `background.shadow.enabled` | boolean | ✅ | Whether shadow is enabled on background |
| `background.shadow.color` | string | ✅ | Shadow color in hex format or rgba |
| `background.shadow.blur` | number | ✅ | Shadow blur radius in pixels |
| `background.shadow.offsetX` | number | ✅ | Shadow horizontal offset in pixels |
| `background.shadow.offsetY` | number | ✅ | Shadow vertical offset in pixels |

#### Gradient

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `gradient.enabled` | boolean | ✅ | Whether gradient is enabled |
| `gradient.colors` | array[string, string] | ✅ | Two colors for gradient in hex format |
| `gradient.angle` | number | ✅ | Gradient angle in degrees (0-360) |

## Example Presets

### Simple Text Preset

```json
[
  {
    "name": "Clean White",
    "category": "Basic",
    "settings": {
      "fontFamily": "Poppins",
      "fontSize": 48,
      "bold": false,
      "color": "#ffffff",
      "letterSpacing": 0
    }
  }
]
```

### Preset with Shadow

```json
[
  {
    "name": "Shadow Hero",
    "category": "Headers",
    "settings": {
      "fontFamily": "Bebas Neue",
      "fontSize": 72,
      "bold": true,
      "color": "#ffffff",
      "letterSpacing": 3,
      "shadow": {
        "enabled": true,
        "color": "#000000",
        "blur": 20,
        "offsetX": 4,
        "offsetY": 4
      }
    }
  }
]
```

### Preset with Gradient

```json
[
  {
    "name": "Rainbow Gradient",
    "category": "Special",
    "settings": {
      "fontFamily": "Montserrat",
      "fontSize": 60,
      "bold": true,
      "color": "#FF006E",
      "letterSpacing": 1,
      "gradient": {
        "enabled": true,
        "colors": ["#FF006E", "#FFBE0B"],
        "angle": 45
      },
      "stroke": {
        "enabled": true,
        "color": "#ffffff",
        "width": 2
      }
    }
  }
]
```

### Full Featured Preset

```json
[
  {
    "name": "Premium Style",
    "category": "Custom",
    "settings": {
      "fontFamily": "Playfair Display",
      "fontSize": 56,
      "bold": true,
      "color": "#ffffff",
      "letterSpacing": 2,
      "shadow": {
        "enabled": true,
        "color": "rgba(0,0,0,0.8)",
        "blur": 15,
        "offsetX": 3,
        "offsetY": 3
      },
      "stroke": {
        "enabled": true,
        "color": "#000000",
        "width": 2
      },
      "background": {
        "enabled": true,
        "color": "rgba(0,0,0,0.6)",
        "padding": 16,
        "borderRadius": 12
      },
      "gradient": {
        "enabled": true,
        "colors": ["#FF006E", "#8B5CF6"],
        "angle": 135
      },
      "animation": "fadeIn",
      "animationDuration": 1.5,
      "animationDistance": 100
    }
  }
]
```

## Import/Export Usage

### Exporting Presets

1. Click the Import/Export button in the Style Presets section
2. Click "Export All" to download all your custom presets as a JSON file
3. The file will be named `text-presets-[timestamp].json`

### Importing Presets

1. Click the Import/Export button in the Style Presets section
2. Click "Import" and select a JSON file
3. The app will validate the format and merge new presets
4. Duplicate preset names will be skipped

### Validation

The app validates imported presets to ensure:
- Valid JSON format
- Required fields are present
- Field types match the schema
- Color values are in valid hex format
- Numeric values are within acceptable ranges

## Tips

- **Category Names**: Use consistent category names to keep presets organized
- **Font Families**: Ensure font families are available in Google Fonts
- **Colors**: Use hex format (#RRGGBB) or rgba format for colors
- **Unique Names**: Each preset must have a unique name
- **Optional Fields**: You can omit optional effect fields if not needed

## Troubleshooting

**Import fails with "Invalid JSON format"**
- Check that your JSON is properly formatted
- Use a JSON validator like jsonlint.com

**Import fails with "Missing required fields"**
- Ensure all required fields are present in each preset
- Check spelling of field names (case-sensitive)

**Preset doesn't look right**
- Verify font family name matches Google Fonts exactly
- Check that color values are in hex format
- Ensure numeric values are reasonable

## Storage

Custom presets are stored in browser localStorage under the key `videotext_custom_presets`. Clearing browser data will remove custom presets. Always export important presets as backup!

