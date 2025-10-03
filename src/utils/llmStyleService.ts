import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextElement, TextAnimation } from '../types';
import { TEXT_STYLE_PRESETS, ALL_FONTS, FONT_METADATA } from './googleFonts';

interface StyleInterpretation {
  updates: Partial<TextElement>;
  explanation: string;
  confidence: number; // 0-100
  suggestedPreset?: string;
  clarificationNeeded?: string;
  action?: 'duplicate'; // Special actions beyond just styling
}

// Initialize Gemini
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Please set VITE_GEMINI_API_KEY in your .env file');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Smart preset matching
function findMatchingPreset(userRequest: string): typeof TEXT_STYLE_PRESETS[0] | null {
  const request = userRequest.toLowerCase();
  
  // Check for exact preset name matches
  for (const preset of TEXT_STYLE_PRESETS) {
    if (request.includes(preset.name.toLowerCase())) {
      return preset;
    }
  }
  
  // Check for keyword matches
  const keywords: Record<string, string> = {
    'hero': 'Hero Title',
    'subtitle': 'Subtle Subtitle',
    'neon': 'Neon Glow',
    'retro': 'Retro Vibes',
    'elegant': 'Elegant Script',
  };
  
  for (const [keyword, presetName] of Object.entries(keywords)) {
    if (request.includes(keyword)) {
      const preset = TEXT_STYLE_PRESETS.find(p => p.name === presetName);
      if (preset) return preset;
    }
  }
  
  return null;
}

// Validation and safety checks
function validateStyleInterpretation(
  interpretation: any,
  currentElement: TextElement
): StyleInterpretation {
  const validated: StyleInterpretation = {
    updates: {},
    explanation: interpretation.explanation || 'Style updated',
    confidence: Math.min(100, Math.max(0, interpretation.confidence || 50))
  };

  if (interpretation.updates) {
    const updates = interpretation.updates;

    // Text content (allow any string)
    if (typeof updates.text === 'string') {
      validated.updates.text = updates.text;
    }

    // Font validation
    if (updates.fontFamily) {
      if (ALL_FONTS.includes(updates.fontFamily)) {
        validated.updates.fontFamily = updates.fontFamily;
      } else {
        // Try case-insensitive match
        const matchedFont = ALL_FONTS.find(f => f.toLowerCase() === updates.fontFamily!.toLowerCase());
        if (matchedFont) {
          validated.updates.fontFamily = matchedFont;
        } else {
          console.warn(`Font "${updates.fontFamily}" not found in available fonts. Available fonts:`, ALL_FONTS.slice(0, 10));
        }
      }
    }

    // Font size validation (reasonable bounds)
    if (typeof updates.fontSize === 'number') {
      validated.updates.fontSize = Math.min(200, Math.max(10, updates.fontSize));
    }

    // Color validation (hex format)
    if (updates.color && /^#[0-9A-Fa-f]{6}$/i.test(updates.color)) {
      validated.updates.color = updates.color;
    }

    // Boolean properties
    ['bold', 'italic', 'underline', 'visible'].forEach(prop => {
      if (typeof updates[prop] === 'boolean') {
        (validated.updates as any)[prop] = updates[prop];
      }
    });

    // Text align
    if (updates.textAlign && ['left', 'center', 'right'].includes(updates.textAlign)) {
      validated.updates.textAlign = updates.textAlign;
    }

    // Numeric properties with bounds
    if (typeof updates.opacity === 'number') {
      validated.updates.opacity = Math.min(1, Math.max(0, updates.opacity));
    }
    if (typeof updates.rotation === 'number') {
      validated.updates.rotation = Math.min(180, Math.max(-180, updates.rotation));
    }
    if (typeof updates.letterSpacing === 'number') {
      validated.updates.letterSpacing = Math.min(30, Math.max(-10, updates.letterSpacing));
    }
    if (typeof updates.lineHeight === 'number') {
      validated.updates.lineHeight = Math.min(3, Math.max(0.5, updates.lineHeight));
    }
    if (typeof updates.width === 'number') {
      validated.updates.width = Math.min(2000, Math.max(50, updates.width));
    }

    // Position (percentage-based, 0-100)
    // Keep more conservative bounds to prevent text from going off-screen
    // Since text boxes have width, we need to leave room on the right/bottom edges
    if (updates.position && typeof updates.position === 'object') {
      validated.updates.position = {
        // Max 90% to leave room for text box width (prevents off-screen right edge)
        x: typeof updates.position.x === 'number' ? Math.min(90, Math.max(5, updates.position.x)) : currentElement.position.x,
        // Max 90% to leave room for text box height (prevents off-screen bottom edge)
        y: typeof updates.position.y === 'number' ? Math.min(90, Math.max(5, updates.position.y)) : currentElement.position.y
      };
    }

    // Complex objects (shadow, stroke, gradient, background)
    if (updates.shadow && typeof updates.shadow === 'object') {
      validated.updates.shadow = {
        ...currentElement.shadow,
        ...updates.shadow,
        blur: Math.min(100, Math.max(0, updates.shadow.blur || currentElement.shadow.blur)),
        offsetX: Math.min(50, Math.max(-50, updates.shadow.offsetX ?? currentElement.shadow.offsetX)),
        offsetY: Math.min(50, Math.max(-50, updates.shadow.offsetY ?? currentElement.shadow.offsetY))
      };
    }

    if (updates.stroke && typeof updates.stroke === 'object') {
      validated.updates.stroke = {
        ...currentElement.stroke,
        ...updates.stroke
      };
    }

    // Extrusion validation
    if (updates.extrusion && typeof updates.extrusion === 'object') {
      validated.updates.extrusion = {
        ...currentElement.extrusion,
        ...updates.extrusion,
        depth: typeof updates.extrusion.depth === 'number' 
          ? Math.min(50, Math.max(1, updates.extrusion.depth))
          : currentElement.extrusion.depth,
        angle: typeof updates.extrusion.angle === 'number'
          ? updates.extrusion.angle % 360
          : currentElement.extrusion.angle
      };
    }

    if (updates.gradient && typeof updates.gradient === 'object') {
      validated.updates.gradient = {
        ...currentElement.gradient,
        ...updates.gradient
      };
    }

    if (updates.background && typeof updates.background === 'object') {
      validated.updates.background = {
        ...currentElement.background,
        ...updates.background
      };
    }

    // Animation validation
    const validAnimations: TextAnimation[] = ['none', 'fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'bounce', 'zoom', 'pulse', 'marqueeLeft', 'marqueeRight'];
    if (updates.animation && validAnimations.includes(updates.animation)) {
      validated.updates.animation = updates.animation;
    }
    if (typeof updates.animationDuration === 'number') {
      validated.updates.animationDuration = Math.min(5, Math.max(0.1, updates.animationDuration));
    }
    if (typeof updates.animationDistance === 'number') {
      validated.updates.animationDistance = Math.min(300, Math.max(10, updates.animationDistance));
    }
  }

  // Copy over optional fields
  if (interpretation.suggestedPreset) {
    validated.suggestedPreset = interpretation.suggestedPreset;
  }
  if (interpretation.clarificationNeeded) {
    validated.clarificationNeeded = interpretation.clarificationNeeded;
  }
  if (interpretation.action === 'duplicate') {
    validated.action = interpretation.action;
  }

  return validated;
}

// Analyze video frame using Gemini Vision
export const analyzeVideoFrame = async (videoElement: HTMLVideoElement): Promise<string> => {
  console.log('🎥 Starting video analysis...');
  console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
  console.log('Video current time:', videoElement.currentTime);
  console.log('Video readyState:', videoElement.readyState);
  
  try {
    // Wait for video to be ready if it's not loaded yet
    if (videoElement.readyState < 2 || videoElement.videoWidth === 0) {
      console.log('⏳ Video not ready yet, waiting for metadata...');
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Timeout waiting for video to load'));
        }, 5000);
        
        const cleanup = () => {
          videoElement.removeEventListener('loadeddata', checkReady);
          videoElement.removeEventListener('canplay', checkReady);
        };
        
        const checkReady = () => {
          if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
            clearTimeout(timeout);
            cleanup();
            console.log('✅ Video is now ready!');
            resolve();
          }
        };
        
        videoElement.addEventListener('loadeddata', checkReady);
        videoElement.addEventListener('canplay', checkReady);
        checkReady(); // Check immediately in case it's already ready
      });
    }
    
    console.log('📸 Capturing frame at dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
    
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(videoElement, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const imageSizeKB = Math.round(imageData.length / 1024);
    console.log('✅ Canvas snapshot created, image size:', imageSizeKB, 'KB');
    
    // Validate we have a real image (empty canvas would be very small)
    if (imageSizeKB < 1) {
      throw new Error('Canvas appears to be empty - video may not be loaded properly');
    }
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    console.log('✅ Gemini model initialized');
    
    const prompt = `Analyze this video frame and provide:
1. Main subjects/objects and their approximate positions (top/middle/bottom, left/center/right)
2. Dominant colors with hex codes (3-5 colors)
3. Overall mood/aesthetic
4. Any text or visual elements that stand out

Format as a concise description suitable for styling text overlays.`;

    console.log('📤 Sending image to Gemini Vision API...');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData.split(',')[1]
        }
      }
    ]);
    
    const analysisText = result.response.text();
    console.log('📥 Received analysis from Gemini:', analysisText);
    console.log('✅ Video analysis complete!');
    
    return analysisText;
  } catch (error) {
    console.error('❌ Video analysis error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return `Video analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const interpretStyleRequest = async (
  userRequest: string,
  currentElement: TextElement,
  context?: {
    videoTitle?: string;
    otherElements?: TextElement[];
    previousRequest?: string;
    videoAnalysis?: string;
  }
): Promise<StyleInterpretation> => {
  
  // First, check if user request matches existing presets
  const matchingPreset = findMatchingPreset(userRequest);
  if (matchingPreset) {
    return {
      updates: matchingPreset.settings as Partial<TextElement>,
      explanation: `Applied "${matchingPreset.name}" preset`,
      confidence: 95,
      suggestedPreset: matchingPreset.name
    };
  }

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
    }
  });

  // Create a rich font catalog with descriptions for AI selection
  const fontCatalog = FONT_METADATA.map(font => 
    `${font.name}: ${font.description} [${font.useCases.slice(0, 3).join(', ')}]`
  ).join('\n');
  
  const contextInfo = context ? `
VIDEO CONTEXT: ${context.videoTitle || 'Unknown'}
OTHER TEXT ELEMENTS: ${context.otherElements?.length || 0}
PREVIOUS REQUEST: ${context.previousRequest || 'None'}

VIDEO CONTENT ANALYSIS:
${context.videoAnalysis || 'Not available'}
` : '';

  const prompt = `You are an expert text styling assistant. Interpret the user's natural language request and translate it to specific style changes.

${contextInfo}

CURRENT TEXT: "${currentElement.text}"

CURRENT STYLE:
Font: ${currentElement.fontFamily}, Size: ${currentElement.fontSize}px, Color: ${currentElement.color}
Bold: ${currentElement.bold}, Italic: ${currentElement.italic}, Underline: ${currentElement.underline}
Text Align: ${currentElement.textAlign}
Letter Spacing: ${currentElement.letterSpacing}px, Line Height: ${currentElement.lineHeight}
Opacity: ${currentElement.opacity}, Rotation: ${currentElement.rotation}°
Position: x=${currentElement.position.x}%, y=${currentElement.position.y}%
Width: ${currentElement.width}px
Shadow: ${currentElement.shadow.enabled ? `${currentElement.shadow.color} (blur: ${currentElement.shadow.blur})` : 'None'}
Stroke: ${currentElement.stroke.enabled ? `${currentElement.stroke.color} (${currentElement.stroke.width}px)` : 'None'}
Background: ${currentElement.background.enabled ? 'Yes' : 'No'}
Gradient: ${currentElement.gradient.enabled ? 'Yes' : 'No'}
Animation: ${currentElement.animation}

USER REQUEST: "${userRequest}"

AVAILABLE FONTS - Choose the best match based on style description:
${fontCatalog}

FONT SELECTION GUIDE:
- Match user's stylistic intent (e.g., "movie poster" → Bebas Neue, "video game" → Press Start 2P, "typewriter" → Courier Prime)
- Consider tone and aesthetic (bold/elegant/playful/technical/vintage/modern)
- Look at use cases in brackets for quick matching
- Examples:
  * "Make it look like a video game" → Press Start 2P
  * "Movie poster style" → Bebas Neue or Anton
  * "Comic book text" → Bangers
  * "Typewriter" → Courier Prime or Special Elite
  * "Futuristic" → Orbitron or Exo 2
  * "Horror movie" → Creepster or Nosifer
  * "Western saloon" → Rye or Fredericka the Great
  * "80s retro" → Righteous or Audiowide
  * "Elegant wedding" → Great Vibes or Allura
  * "Professional business" → Poppins or Inter

STYLE INTERPRETATION GUIDE:

TEXT CONTENT CHANGES:
- "change text to X" → { text: "X" }
- "make it say X" → { text: "X" }
- "translate to [language]" → Translate the CURRENT TEXT to the requested language, return { text: "translated text" }
- For translation: Use your language capabilities to translate accurately, preserve line breaks
- User can request to change the actual text content

SPECIAL ACTIONS:
- If user says "duplicate", "dupe", "copy", "clone", "make a copy" → Set action: "duplicate" in response (this will create a copy of the element)
- IMPORTANT: For duplicate requests, ALWAYS include "action": "duplicate" in the JSON response
- Example responses for duplicate:
  * "dupe this" → { "action": "duplicate", "explanation": "Creating a duplicate of the current text", "confidence": 100 }
  * "copy it" → { "action": "duplicate", "explanation": "Duplicating the text element", "confidence": 100 }
- NOTE: Do NOT include any updates when action is duplicate, only the action field

USING VIDEO CONTENT ANALYSIS:
- Use the VIDEO CONTENT ANALYSIS to extract colors, understand subjects, and position text
- "make it the same color as [object]" → Extract color from video analysis
- "position it near [subject]" → Use subject position to set position.x and position.y (keep within 5-90% range)
- "match the mood" → Use aesthetic description to inform styling
- "use colors from the video" → Extract hex codes from the analysis
- Examples:
  * "make it the color of the alien" → Extract green color from analysis → { color: "#ABC123" }
  * "position above the astronaut" → If astronaut is at middle-center → { position: { x: 50, y: 30 } }
  * "position at bottom" → Use safe bottom position → { position: { x: 50, y: 85 } }
  * "match the space aesthetic" → Use dark colors, modern fonts
  * "use the dominant color" → Extract first dominant color → { color: "#..." }
- IMPORTANT: Always keep position.x and position.y within 5-90% range to prevent off-screen text

IMPORTANT - FONT CHANGES:
- ONLY change fontFamily if the user EXPLICITLY requests a font change or style change
- DO NOT change fonts based on language or translation requests
- DO NOT make cultural assumptions (e.g., Japanese text ≠ Asian fonts, Spanish text ≠ specific cultural fonts)
- Translation requests should ONLY change the text property, NOT the font
- Examples where fonts should NOT change:
  * "translate to Spanish" → { text: "Spanish translation" } (NO fontFamily)
  * "translate to Japanese" → { text: "Japanese translation" } (NO fontFamily)
  * "change text to Hola" → { text: "Hola" } (NO fontFamily)
- Examples where fonts SHOULD change:
  * "make it look Japanese" or "use an Asian font" → { fontFamily: appropriate font }
  * "horror movie font" → { fontFamily: "Creepster" }
  * "use a script font" → { fontFamily: script font }

STYLING:

BASIC TEXT PROPERTIES:
- "bigger/larger" → increase fontSize by 20-40%
- "smaller" → decrease fontSize by 20-30%
- "bold/strong/thick" → { bold: true }
- "italic/slanted" → { italic: true }
- "underline" → { underline: true }
- "remove bold" or "not bold" → { bold: false }
- "remove italic" or "no italic" → { italic: false }
- "remove underline" or "no underline" → { underline: false }

TEXT ALIGNMENT:
- "align left" or "left align" → { textAlign: "left" }
- "align center" or "center align" or "center it" or "center the text" → { textAlign: "center" }
- "align right" or "right align" → { textAlign: "right" }
- IMPORTANT: Always use lowercase: "left", "center", "right" (not "Left" or "Center")

SPACING & DIMENSIONS:
- "letter spacing 10" or "10px letter spacing" → { letterSpacing: 10 }
- "tighter spacing" → decrease letterSpacing by 5-10
- "wider spacing" → increase letterSpacing by 5-10
- "line height 1.5" or "1.5 line height" → { lineHeight: 1.5 }
- "tighter lines" → decrease lineHeight by 0.2-0.3
- "more space between lines" → increase lineHeight by 0.2-0.3
- "width 400" or "400px wide" → { width: 400 }
- "make it wider" → increase width by 100-200px
- "make it narrower" → decrease width by 100-200px

OPACITY & VISIBILITY:
- "50% opacity" or "opacity 0.5" → { opacity: 0.5 }
- "more transparent" → decrease opacity by 0.2-0.3
- "more opaque" or "less transparent" → increase opacity by 0.2-0.3
- "fully opaque" → { opacity: 1 }
- "hide this" or "make invisible" → { visible: false }
- "show this" or "make visible" → { visible: true }

ROTATION:
- "rotate 15 degrees" → { rotation: 15 }
- "tilt" → rotation: 10-20 degrees
- "rotate" → rotation: number (positive = clockwise, negative = counter-clockwise, range -180 to 180)

EFFECTS (ADD & REMOVE):
- "subtle/minimal/clean" → remove effects, neutral colors, simple font
- "dramatic/bold/impactful" → large size, bold, shadow, possibly gradient
- "glow/neon" → shadow: { enabled: true, blur: 20-30, color: bright, offsetX: 0, offsetY: 0 }
- "remove shadow" or "no shadow" or "remove glow" → shadow: { enabled: false }
- "outline/stroke/border" → stroke: { enabled: true, color: contrasting, width: 2-4 }
- "remove outline" or "no stroke" → stroke: { enabled: false }
- "background" → background: { enabled: true, color: requested, opacity: 0.8, padding: 12-20, borderRadius: 8 }
- "remove background" or "no background" → background: { enabled: false }
- "text gradient" → gradient: { enabled: true, colors: [color1, color2], angle: 90 or 45 }
- "remove gradient" or "no gradient" or "solid color" → gradient: { enabled: false }
- "remove animation" or "no animation" or "static" → animation: "none"

ANIMATION:
- "animation" → animation: "fadeIn" or "slideUp" etc., animationDuration: 1-2
- "marquee/scroll/scrolling" → animation: "marqueeLeft" or "marqueeRight", animationDuration: 2-5 (longer for scrolling effect)
- "move/position" → position: { x: percentage (5-90), y: percentage (5-90) }
  * "move down" → increase y by 5-10% (keep within 5-90% range)
  * "move up" → decrease y by 5-10% (keep within 5-90% range)
  * "move left" → decrease x by 5-10% (keep within 5-90% range)
  * "move right" → increase x by 5-10% (keep within 5-90% range)
  * "center" → x: 50, y: 50
  * CRITICAL: All positions must stay within 5-90% to prevent off-screen text
  * Position is percentage-based where 0,0 is top-left and 100,100 is bottom-right
- "professional/business/corporate" → clean fonts (Poppins, Inter), neutral colors, minimal effects
- "fun/playful/quirky" → fun fonts (Fredoka One, Pacifico), bright colors
- "elegant/classy/sophisticated" → elegant fonts (Cinzel, Playfair Display), refined effects
- "movie title/cinematic" → display fonts (Bebas Neue), large size, dramatic shadow
- "retro/vintage" → earth tones, specific fonts, possible stroke
- Color names → translate to hex (red: #FF0000, blue: #0000FF, pink: #FF69B4, purple: #8B5CF6, green: #00FF00, yellow: #FFFF00, orange: #FFA500, white: #FFFFFF, black: #000000)

3D TEXT EFFECTS:

**3D Shadow Effect** (layered shadow for depth):
- "3D" or "3D effect" or "make it 3D" or "look 3D" or "pop out" → Create depth using layered shadows:
  * shadow: { enabled: true, offsetX: 4, offsetY: 4, blur: 0, color: "#000000" }
  * stroke: { enabled: true, color: "#FFFFFF", width: 2 } (optional, for extra pop)
  * IMPORTANT: For 3D, blur should be 0 and offsetX/offsetY should be 4-8px for depth
  * The shadow color should contrast with text color (dark text = light shadow, light text = dark shadow)
- "3D with color" → Same as above but use a colored shadow instead of black/white
- "subtle 3D" → offsetX: 2, offsetY: 2, blur: 0
- "extreme 3D" or "deep 3D" → offsetX: 8, offsetY: 8, blur: 0

**3D Extrusion Effect** (stacked layers for thick 3D):
- "3D extrusion" or "extruded text" or "thick 3D" or "layered 3D" → Create thick 3D depth:
  * extrusion: { enabled: true, depth: 10, color: "#000000", angle: 135 }
  * depth: number of layers (1-50, typically 5-15)
  * angle: direction of extrusion in degrees (0-360, where 0=right, 90=down, 180=left, 270=up)
  * color: color of the extruded layers (usually darker shade of main color or black)
  * Examples:
    - "extrude to the bottom right" → { extrusion: { enabled: true, depth: 10, color: "#000000", angle: 135 } }
    - "extrude down" → { extrusion: { enabled: true, depth: 10, color: "#000000", angle: 90 } }
    - "blue text with red extrusion" → { color: "#0000FF", extrusion: { enabled: true, depth: 12, color: "#FF0000", angle: 135 } }
- "remove extrusion" or "no extrusion" → { extrusion: { enabled: false } }

IMPORTANT: Effects MUST have "enabled: true" to appear! This applies when ADDING or CHANGING effects:
- "add blue background" → { background: { enabled: true, color: "#0000FF", opacity: 0.8, padding: 12, borderRadius: 8 } }
- "add red outline" → { stroke: { enabled: true, color: "#FF0000", width: 2 } }
- "make stroke yellow" or "change outline to yellow" → { stroke: { enabled: true, color: "#FFFF00" } } (MUST include enabled: true!)
- "make shadow blue" → { shadow: { enabled: true, color: "#0000FF" } } (MUST include enabled: true!)
- "blue-purple gradient background" → { background: { enabled: true, gradient: { enabled: true, colors: ["#0000FF", "#8B5CF6"], angle: 135 }, opacity: 0.8, padding: 12, borderRadius: 8 } }
- "pink to yellow text gradient" → { gradient: { enabled: true, colors: ["#FF69B4", "#FFFF00"], angle: 90 } }
- "rotate 15 degrees" → { rotation: 15 }
- "fade in animation" → { animation: "fadeIn", animationDuration: 1.5 }
- "slide up animation" → { animation: "slideUp", animationDuration: 1, animationDistance: 100 }
- "marquee animation" or "scrolling text" → { animation: "marqueeLeft", animationDuration: 3 } (or "marqueeRight")
- "move down a bit" → { position: { x: CURRENT_X, y: CURRENT_Y + 5 } }
- "move to the left" → { position: { x: CURRENT_X - 10, y: CURRENT_Y } }
- "center it" → { position: { x: 50, y: 50 } }
- "10px letter spacing" → { letterSpacing: 10 }
- "wider letter spacing" → { letterSpacing: CURRENT + 5 }
- "line height 1.5" → { lineHeight: 1.5 }
- "make it italic and underlined" → { italic: true, underline: true }
- "remove underline" → { underline: false }
- "remove shadow" → { shadow: { enabled: false } }
- "remove outline" → { stroke: { enabled: false } }
- "no animation" → { animation: "none" }
- "center align the text" → { textAlign: "center" }
- "left align" → { textAlign: "left" }
- "right align" → { textAlign: "right" }
- "50% opacity" → { opacity: 0.5 }
- "width 500" → { width: 500 }
- "hide this" → { visible: false }
- "translate to Spanish" → { text: "[translation of current text to Spanish]" } (NO fontFamily change!)
- "translate to Japanese" → { text: "[translation of current text to Japanese]" } (NO fontFamily change!)
- "make it say hello in French" → { text: "Bonjour" } (NO fontFamily change!)

CRITICAL NOTES:
- Background gradients need BOTH background.enabled AND background.gradient.enabled = true
- Text gradients need gradient.enabled = true (separate from background gradient!)
- Rotation is a simple number property, not an object
- Animations require the animation property name exactly as shown (fadeIn, slideUp, slideDown, etc.)
- When modifying stroke/shadow/background/gradient properties (even just changing color/size), ALWAYS include enabled: true in the object!

COMMON EFFECT PATTERNS:

TEXT FORMATTING:
- Bold + Italic + Underline: { bold: true, italic: true, underline: true }
- Letter spacing: letterSpacing: number (pixels, range -10 to 30)
- Line height: lineHeight: number (multiplier, range 0.5 to 3, where 1.2 = 120% of font size)
- Width: width: number (pixels, range 50 to 2000)
- Opacity: opacity: number (0 to 1, where 0.5 = 50% transparent)
- Text alignment: textAlign: 'left' | 'center' | 'right'
- Visibility: visible: boolean (true = shown, false = hidden)

EFFECTS:
- Glow effect: shadow { enabled: true, color: matching, blur: 15-30, offsetX: 0, offsetY: 0 }
- Drop shadow: shadow { enabled: true, color: '#000000', blur: 10-20, offsetX: 3-5, offsetY: 3-5 }
- **3D shadow effect**: shadow { enabled: true, color: contrasting, blur: 0, offsetX: 4-6, offsetY: 4-6 }, stroke { enabled: true, color: '#FFFFFF', width: 2 }
  * KEY: blur must be 0 for 3D! offsetX/offsetY create the depth layers
  * Light text → dark shadow (#000000), dark text → light shadow (or matching dark color)
  * Example: { shadow: { enabled: true, offsetX: 5, offsetY: 5, blur: 0, color: "#000000" }, stroke: { enabled: true, color: "#FFFFFF", width: 2 } }
- **3D extrusion effect**: extrusion { enabled: true, depth: 10, color: '#000000', angle: 135 }
  * Creates thick layered 3D depth by stacking copies of the text
  * Example: { extrusion: { enabled: true, depth: 12, color: "#000000", angle: 135 } }
  * Remove: { extrusion: { enabled: false } }
- Outline/stroke: stroke { enabled: true, color: contrasting, width: 2-4 }
- Change stroke color: stroke { enabled: true, color: newColor } (enabled MUST be true!)
- Change shadow color: shadow { enabled: true, color: newColor } (enabled MUST be true!)
- Change extrusion: extrusion { enabled: true, color: newColor, depth: number, angle: degrees } (enabled MUST be true!)
- Text gradient: gradient { enabled: true, colors: [color1, color2], angle: 90 }
- Neon text: gradient { enabled: true, colors: ['#FF10F0', '#39FF14'], angle: 45 }, stroke { enabled: true }, shadow { enabled: true }
- Solid background: background { enabled: true, color: color, opacity: 0.8, padding: 12, borderRadius: 8 }
- Gradient background: background { enabled: true, gradient: { enabled: true, colors: [color1, color2], angle: 135 }, opacity: 0.8, padding: 12, borderRadius: 8 }

TRANSFORMS:
- Rotation: rotation: number (positive = clockwise, negative = counter-clockwise, range -180 to 180)

ANIMATIONS:
- Fade in: animation: 'fadeIn', animationDuration: 1.5
- Slide up: animation: 'slideUp', animationDuration: 1, animationDistance: 100
- Marquee/scrolling: animation: 'marqueeLeft' or 'marqueeRight', animationDuration: 2-5 (longer duration = slower scroll)
- Position moves: position: { x: percentage, y: percentage } where 5-90 represents safe screen position
  * Move down: { position: { x: current_x, y: current_y + 10 } }
  * Move up: { position: { x: current_x, y: current_y - 10 } }
  * Move left: { position: { x: current_x - 10, y: current_y } }
  * Move right: { position: { x: current_x + 10, y: current_y } }
  * Center: { position: { x: 50, y: 50 } }
  * Top-left: { position: { x: 10, y: 10 } }
  * Top-center: { position: { x: 50, y: 15 } }
  * Bottom-center: { position: { x: 50, y: 85 } }
  * IMPORTANT: Keep within 5-90% range to prevent text going off-screen

CRITICAL RULES:
1. Effects need enabled: true in their objects - THIS IS MANDATORY FOR VISIBILITY!
   - When changing ANY property of stroke/shadow/background/gradient, ALWAYS include enabled: true
   - Example: Changing stroke color yellow → { stroke: { enabled: true, color: "#FFFF00" } }
   - Example: Making shadow bigger → { shadow: { enabled: true, blur: 30 } }
2. Background gradients: set BOTH background.enabled AND background.gradient.enabled to true
3. Text gradients: set gradient.enabled to true (this is SEPARATE from background.gradient!)
4. Rotation: just a number property, NOT an object
5. Animation: use exact animation names: 'fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'bounce', 'zoom', 'pulse', 'marqueeLeft', 'marqueeRight'
6. Position: use percentage values (5-90) for x and y to keep text on-screen. Current position is shown above. For relative moves, add/subtract from current position.
   - IMPORTANT: Values are clamped to 5-90% to prevent text from going off-screen edges
   - Small move = ±5%
   - Medium move = ±10-15%
   - Large move = ±20-30%
   - Center position = x: 50, y: 50
   - Avoid positioning near edges (below 5% or above 90%)
7. Numeric properties (letterSpacing, lineHeight, width, opacity, rotation, fontSize) are direct number values:
   - "10px letter spacing" → { letterSpacing: 10 } NOT { letterSpacing: { value: 10 } }
   - "line height 1.5" → { lineHeight: 1.5 } NOT { lineHeight: { value: 1.5 } }
   - These are simple number properties, not objects!
8. Removing/disabling properties:
   - To remove effects, set enabled: false → { shadow: { enabled: false } }
   - To remove boolean properties, set to false → { bold: false, italic: false, underline: false }
   - To remove animation → { animation: "none" }
   - User requests like "remove X", "no X", "without X" mean disabling that feature
9. **FONT CHANGES - BE CONSERVATIVE**:
   - ONLY include fontFamily in updates if user EXPLICITLY requests a font/style change
   - DO NOT change fonts for translation requests
   - DO NOT make cultural/linguistic font assumptions
   - If unsure whether user wants font change, DON'T include fontFamily

EXISTING PRESETS (suggest if close match):
${TEXT_STYLE_PRESETS.map(p => `- ${p.name} (${p.category})`).join('\n')}

RULES:
1. Only modify properties directly related to the request
2. **DO NOT change fonts unless explicitly requested** - translation/content changes should NOT change fontFamily
3. If request is vague/ambiguous, set confidence < 60 and provide clarificationNeeded
4. Be proportional - "slightly bigger" vs "much bigger" matters
5. Maintain readability - don't make text too small or low contrast
6. Consider existing style - build on it rather than completely replace
7. For colors: use proper hex codes with # prefix
8. If user mentions a preset name, suggest using that preset instead
9. For translations: Use your language capabilities to translate accurately, maintain formatting
10. Confidence scoring:
   - 90-100: Very clear request, definitive interpretation
   - 70-89: Clear request, good interpretation
   - 50-69: Some ambiguity, but reasonable guess
   - <50: Too vague, need clarification

Respond with ONLY valid JSON in this exact format:
{
  "updates": {
    // Only include properties that should change (can include "text": "new content")
    // For duplicate actions, leave this empty or omit it
  },
  "explanation": "Brief explanation of what you changed and why",
  "confidence": 85,
  "action": "duplicate" // REQUIRED for duplicate/copy requests! Set to "duplicate" when user wants to copy the element
}

IMPORTANT FOR DUPLICATE REQUESTS:
- If user says "duplicate", "dupe", "copy", "clone", etc., you MUST include "action": "duplicate"
- For duplicate, the "updates" field should be empty {}
- Example: { "action": "duplicate", "explanation": "Duplicating the text element", "confidence": 100 }

IMPORTANT: Ensure all JSON is valid. Numbers should be numbers, not strings. Colors must have # prefix.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                      responseText.match(/(\{[\s\S]*\})/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[1]);
    
    // Log what the AI returned for debugging
    console.log('🤖 AI Response:', {
      action: parsed.action,
      hasUpdates: !!parsed.updates,
      updateKeys: Object.keys(parsed.updates || {}),
      confidence: parsed.confidence,
      updates: parsed.updates
    });
    
    if (parsed.updates?.fontFamily) {
      console.log('AI suggested font:', parsed.updates.fontFamily);
    }
    
    if (parsed.updates?.textAlign) {
      console.log('📐 AI suggested textAlign:', parsed.updates.textAlign);
    }
    
    if (parsed.action) {
      console.log('🎬 Action detected in parsed response:', parsed.action);
    }
    
    // Validate the response
    const validated = validateStyleInterpretation(parsed, currentElement);
    
    // Log what was validated
    if (validated.action) {
      console.log('✅ Action validated:', validated.action);
    }
    
    if (validated.updates.fontFamily) {
      console.log('✅ Validated font:', validated.updates.fontFamily);
    }
    
    if (validated.updates.textAlign) {
      console.log('✅ Validated textAlign:', validated.updates.textAlign);
    }
    
    console.log('✅ Final validated updates:', validated.updates);
    
    return validated;
  } catch (error) {
    console.error('LLM interpretation error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      throw error;
    }
    throw new Error('Failed to interpret style request. Please try being more specific.');
  }
};

// Helper for iterative refinement
export const refineStyleWithFeedback = async (
  originalRequest: string,
  currentElement: TextElement,
  feedback: 'too_much' | 'too_little' | 'wrong_direction' | string,
  previousInterpretation: StyleInterpretation
): Promise<StyleInterpretation> => {
  const refinementPrompt = `The user said: "${originalRequest}"
You made these changes: ${JSON.stringify(previousInterpretation.updates)}
User feedback: "${feedback}"

Adjust the interpretation based on this feedback. If "too_much", reduce the changes by 30-50%. If "too_little", increase by 30-50%.`;

  return interpretStyleRequest(refinementPrompt, currentElement, {
    previousRequest: originalRequest
  });
};

// Test API key connectivity
export const testApiKey = async (): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite'
    });

    const result = await model.generateContent('Say "OK" if you can read this.');
    const response = result.response.text();
    
    if (response) {
      return {
        success: true,
        message: `✅ API Key is working! Response: "${response.substring(0, 50)}${response.length > 50 ? '...' : ''}"`
      };
    } else {
      return {
        success: false,
        message: '❌ API returned empty response',
        error: 'Empty response'
      };
    }
  } catch (error) {
    console.error('API Key test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('REFERRER_BLOCKED') || errorMessage.includes('referer')) {
      return {
        success: false,
        message: '❌ Localhost Blocked',
        error: 'Your API key blocks requests from localhost.\n\nFix:\n1. Go to: https://console.cloud.google.com/apis/credentials\n2. Click your API key\n3. Under "Website restrictions", select "None"\n4. Save and wait 1-2 minutes\n5. Try again'
      };
    } else if (errorMessage.includes('SERVICE_DISABLED') || errorMessage.includes('not been used')) {
      return {
        success: false,
        message: '❌ API Not Enabled',
        error: 'The Generative Language API is not enabled for this project.\n\nFix: Get a new API key from https://aistudio.google.com/app/apikey\nMake sure to choose "Create API key in new project"'
      };
    } else if (errorMessage.includes('API key') || errorMessage.includes('403')) {
      return {
        success: false,
        message: '❌ Invalid API Key',
        error: 'Please check your VITE_GEMINI_API_KEY in .env file'
      };
    } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      return {
        success: false,
        message: '❌ Rate limit or quota exceeded',
        error: errorMessage
      };
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        success: false,
        message: '❌ Network error',
        error: 'Check your internet connection'
      };
    } else {
      return {
        success: false,
        message: '❌ API test failed',
        error: errorMessage
      };
    }
  }
};

