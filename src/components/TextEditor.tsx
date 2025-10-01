import React, { useState } from 'react';
import { TextElement, TextAnimation } from '../types';
import { FONT_CATEGORIES, COLOR_PALETTES, TEXT_STYLE_PRESETS, loadGoogleFont } from '../utils/googleFonts';

interface TextEditorProps {
  textElements: TextElement[];
  selectedTextId: string | null;
  onAddText: () => void;
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
  onDeleteText: (id: string) => void;
  onDuplicateText: (text: TextElement) => void;
  onSelectText: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onApplyPreset: (presetName: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  textElements,
  selectedTextId,
  onAddText,
  onUpdateText,
  onDeleteText,
  onDuplicateText,
  onSelectText,
  onToggleVisibility,
  onApplyPreset,
}) => {
  const selectedText = textElements.find(t => t.id === selectedTextId);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [activeFontCategory, setActiveFontCategory] = useState<keyof typeof FONT_CATEGORIES>('modern');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [activeColorPalette, setActiveColorPalette] = useState<keyof typeof COLOR_PALETTES>('modern');
  const [showPresets, setShowPresets] = useState(false);

  const animations: { value: TextAnimation; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'fadeIn', label: 'Fade In' },
    { value: 'slideUp', label: 'Slide Up' },
    { value: 'slideDown', label: 'Slide Down' },
    { value: 'slideLeft', label: 'Slide Left' },
    { value: 'slideRight', label: 'Slide Right' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'marqueeLeft', label: 'Marquee Left ←' },
    { value: 'marqueeRight', label: 'Marquee Right →' },
  ];

  const presetCategories = ['Headers', 'Special', 'Body', 'Fun', 'Elegant'];

  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="text-white font-bold text-xl">Text Editor</h4>
          <p className="text-gray-400 text-sm mt-1">Create and style text overlays</p>
        </div>
        <button
          onClick={onAddText}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Text
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {/* Text Layers List */}
        <div className="space-y-2">
          <h5 className="text-gray-300 text-sm font-medium mb-2">Text Layers</h5>
          {textElements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm italic mb-2">No text added yet</p>
              <p className="text-gray-600 text-xs">Click "Add Text" to start</p>
            </div>
          ) : (
            textElements.map((text) => (
              <div
                key={text.id}
                className={`p-3 rounded-lg transition-all ${
                  selectedTextId === text.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 truncate cursor-pointer" 
                    onClick={() => onSelectText(text.id)}
                  >
                    <p className="text-sm font-medium truncate">{text.text || 'Empty text'}</p>
                    <p className="text-xs opacity-75">{text.fontFamily} • {text.fontSize}px</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {/* Visibility Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(text.id);
                      }}
                      className="p-1 hover:bg-black/20 rounded transition-colors"
                      title={text.visible ? 'Hide' : 'Show'}
                    >
                      {text.visible ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    {/* Duplicate Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateText(text);
                      }}
                      className="p-1 hover:bg-purple-500 rounded transition-colors"
                      title="Duplicate (Cmd/Ctrl+D)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteText(text.id);
                      }}
                      className="p-1 hover:bg-red-500 rounded transition-colors"
                      title="Delete (Del/Backspace)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Style Presets */}
        {selectedText && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-gray-300 text-sm font-medium">Quick Style Presets</h5>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs text-pink-400 hover:text-pink-300"
              >
                {showPresets ? 'Hide' : 'Show All'}
              </button>
            </div>
            
            {showPresets && (
              <div className="space-y-3 mb-4">
                {presetCategories.map(category => (
                  <div key={category}>
                    <p className="text-xs text-gray-500 mb-2">{category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {TEXT_STYLE_PRESETS.filter(p => p.category === category).map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => onApplyPreset(preset.name)}
                          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-colors text-left"
                          style={{ fontFamily: preset.settings.fontFamily }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Selected Text */}
            <div className="space-y-4">
              <h5 className="text-gray-300 text-sm font-medium">Edit Text</h5>

              {/* Text Input */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Text Content</label>
                <textarea
                  value={selectedText.text}
                  onChange={(e) => onUpdateText(selectedText.id, { text: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Enter your text..."
                />
              </div>

              {/* Font Family with Categories */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Font Family</label>
                <div className="relative">
                  <button
                    onClick={() => setShowFontPicker(!showFontPicker)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 hover:border-pink-500 text-left flex items-center justify-between transition-colors"
                    style={{ fontFamily: selectedText.fontFamily }}
                  >
                    <span>{selectedText.fontFamily}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showFontPicker && (
                    <div className="absolute z-10 w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-xl">
                      {/* Font Categories */}
                      <div className="flex border-b border-gray-600 overflow-x-auto">
                        {(Object.keys(FONT_CATEGORIES) as Array<keyof typeof FONT_CATEGORIES>).map((category) => (
                          <button
                            key={category}
                            onClick={() => setActiveFontCategory(category)}
                            className={`px-3 py-2 text-xs capitalize whitespace-nowrap transition-colors ${
                              activeFontCategory === category
                                ? 'bg-pink-500 text-white'
                                : 'text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      {/* Font List */}
                      <div className="max-h-60 overflow-y-auto">
                        {FONT_CATEGORIES[activeFontCategory].map((font) => (
                          <button
                            key={font}
                            onClick={() => {
                              loadGoogleFont(font);
                              onUpdateText(selectedText.id, { fontFamily: font });
                              setShowFontPicker(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-600 text-white transition-colors"
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Font Size & Text Formatting Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Size: {selectedText.fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={selectedText.fontSize}
                    onChange={(e) => onUpdateText(selectedText.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Format</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdateText(selectedText.id, { bold: !selectedText.bold })}
                      className={`flex-1 px-2 py-1 rounded font-bold text-sm transition-colors ${
                        selectedText.bold ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => onUpdateText(selectedText.id, { italic: !selectedText.italic })}
                      className={`flex-1 px-2 py-1 rounded italic text-sm transition-colors ${
                        selectedText.italic ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      I
                    </button>
                    <button
                      onClick={() => onUpdateText(selectedText.id, { underline: !selectedText.underline })}
                      className={`flex-1 px-2 py-1 rounded underline text-sm transition-colors ${
                        selectedText.underline ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      U
                    </button>
                  </div>
                </div>
              </div>

              {/* Color with Palette Picker */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedText.color}
                    onChange={(e) => onUpdateText(selectedText.id, { color: e.target.value })}
                    className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-600"
                  />
                  <button
                    onClick={() => setShowColorPalette(!showColorPalette)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 rounded-lg transition-colors"
                  >
                    Color Palettes
                  </button>
                </div>
                {showColorPalette && (
                  <div className="mt-2 bg-gray-700 rounded-lg p-3">
                    <div className="flex gap-1 mb-2 overflow-x-auto">
                      {(Object.keys(COLOR_PALETTES) as Array<keyof typeof COLOR_PALETTES>).map((palette) => (
                        <button
                          key={palette}
                          onClick={() => setActiveColorPalette(palette)}
                          className={`px-2 py-1 text-xs capitalize whitespace-nowrap rounded transition-colors ${
                            activeColorPalette === palette ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {palette}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {COLOR_PALETTES[activeColorPalette].map((color) => (
                        <button
                          key={color}
                          onClick={() => onUpdateText(selectedText.id, { color })}
                          className="w-8 h-8 rounded-lg border-2 border-gray-600 hover:border-white transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Letter Spacing & Line Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Letter Space: {selectedText.letterSpacing}px</label>
                  <input
                    type="range"
                    min="-5"
                    max="20"
                    value={selectedText.letterSpacing}
                    onChange={(e) => onUpdateText(selectedText.id, { letterSpacing: parseInt(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Line Height: {selectedText.lineHeight}</label>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={selectedText.lineHeight}
                    onChange={(e) => onUpdateText(selectedText.id, { lineHeight: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>

              {/* Text Align & Opacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Alignment</label>
                  <div className="flex gap-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => onUpdateText(selectedText.id, { textAlign: align })}
                        className={`flex-1 px-2 py-2 rounded text-xs transition-colors ${
                          selectedText.textAlign === align ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {align === 'left' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />}
                          {align === 'center' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />}
                          {align === 'right' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />}
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Opacity: {Math.round(selectedText.opacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedText.opacity}
                    onChange={(e) => onUpdateText(selectedText.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>

              {/* Rotation */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Rotation: {selectedText.rotation}°</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selectedText.rotation}
                  onChange={(e) => onUpdateText(selectedText.id, { rotation: parseInt(e.target.value) })}
                  className="w-full accent-pink-500"
                />
              </div>

              {/* Effects Section */}
              <div className="border-t border-gray-700 pt-4 space-y-4">
                <h5 className="text-gray-300 text-sm font-medium">Effects</h5>

                {/* Gradient Text */}
                <div className="bg-gray-700/50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Gradient
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedText.gradient.enabled}
                        onChange={(e) =>
                          onUpdateText(selectedText.id, {
                            gradient: { ...selectedText.gradient, enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  {selectedText.gradient.enabled && (
                    <div className="space-y-2 pl-6 border-l-2 border-pink-500">
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedText.gradient.colors[0]}
                          onChange={(e) =>
                            onUpdateText(selectedText.id, {
                              gradient: { ...selectedText.gradient, colors: [e.target.value, selectedText.gradient.colors[1]] },
                            })
                          }
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="color"
                          value={selectedText.gradient.colors[1]}
                          onChange={(e) =>
                            onUpdateText(selectedText.id, {
                              gradient: { ...selectedText.gradient, colors: [selectedText.gradient.colors[0], e.target.value] },
                            })
                          }
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Angle: {selectedText.gradient.angle}°</label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={selectedText.gradient.angle}
                          onChange={(e) =>
                            onUpdateText(selectedText.id, {
                              gradient: { ...selectedText.gradient, angle: parseInt(e.target.value) },
                            })
                          }
                          className="w-full accent-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Drop Shadow */}
                <div className="bg-gray-700/50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Drop Shadow
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedText.shadow.enabled}
                        onChange={(e) =>
                          onUpdateText(selectedText.id, {
                            shadow: { ...selectedText.shadow, enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  {selectedText.shadow.enabled && (
                    <div className="space-y-2 pl-6 border-l-2 border-pink-500">
                      <input
                        type="color"
                        value={selectedText.shadow.color}
                        onChange={(e) =>
                          onUpdateText(selectedText.id, {
                            shadow: { ...selectedText.shadow, color: e.target.value },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer"
                      />
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Blur: {selectedText.shadow.blur}px</label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={selectedText.shadow.blur}
                          onChange={(e) =>
                            onUpdateText(selectedText.id, {
                              shadow: { ...selectedText.shadow, blur: parseInt(e.target.value) },
                            })
                          }
                          className="w-full accent-pink-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">X: {selectedText.shadow.offsetX}</label>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            value={selectedText.shadow.offsetX}
                            onChange={(e) =>
                              onUpdateText(selectedText.id, {
                                shadow: { ...selectedText.shadow, offsetX: parseInt(e.target.value) },
                              })
                            }
                            className="w-full accent-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Y: {selectedText.shadow.offsetY}</label>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            value={selectedText.shadow.offsetY}
                            onChange={(e) =>
                              onUpdateText(selectedText.id, {
                                shadow: { ...selectedText.shadow, offsetY: parseInt(e.target.value) },
                              })
                            }
                            className="w-full accent-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Stroke */}
                <div className="bg-gray-700/50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Text Stroke
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedText.stroke.enabled}
                        onChange={(e) =>
                          onUpdateText(selectedText.id, {
                            stroke: { ...selectedText.stroke, enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  {selectedText.stroke.enabled && (
                    <div className="space-y-2 pl-6 border-l-2 border-pink-500">
                      <input
                        type="color"
                        value={selectedText.stroke.color}
                        onChange={(e) =>
                          onUpdateText(selectedText.id, {
                            stroke: { ...selectedText.stroke, color: e.target.value },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer"
                      />
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Width: {selectedText.stroke.width}px</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={selectedText.stroke.width}
                          onChange={(e) =>
                            onUpdateText(selectedText.id, {
                              stroke: { ...selectedText.stroke, width: parseInt(e.target.value) },
                            })
                          }
                          className="w-full accent-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Background */}
                <div className="bg-gray-700/50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      Background
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedText.background.enabled}
                        onChange={(e) =>
                          onUpdateText(selectedText.id, {
                            background: { ...selectedText.background, enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  {selectedText.background.enabled && (
                    <div className="space-y-2 pl-6 border-l-2 border-pink-500">
                      <input
                        type="color"
                        value={selectedText.background.color}
                        onChange={(e) =>
                          onUpdateText(selectedText.id, {
                            background: { ...selectedText.background, color: e.target.value },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer"
                      />
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Padding: {selectedText.background.padding}px</label>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={selectedText.background.padding}
                          onChange={(e) =>
                            onUpdateText(selectedText.id, {
                              background: { ...selectedText.background, padding: parseInt(e.target.value) },
                            })
                          }
                          className="w-full accent-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Radius: {selectedText.background.borderRadius}px</label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={selectedText.background.borderRadius}
                          onChange={(e) =>
                            onUpdateText(selectedText.id, {
                              background: { ...selectedText.background, borderRadius: parseInt(e.target.value) },
                            })
                          }
                          className="w-full accent-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Animation Section */}
              <div className="border-t border-gray-700 pt-4 space-y-4">
                <h5 className="text-gray-300 text-sm font-medium">Animation</h5>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Animation Type</label>
                  <select
                    value={selectedText.animation}
                    onChange={(e) => onUpdateText(selectedText.id, { animation: e.target.value as TextAnimation })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
                  >
                    {animations.map((anim) => (
                      <option key={anim.value} value={anim.value}>
                        {anim.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedText.animation !== 'none' && (
                  <div>
                    {selectedText.animation === 'marqueeLeft' || selectedText.animation === 'marqueeRight' ? (
                      <>
                        <label className="block text-gray-300 text-sm mb-2">
                          Scroll Speed: {Math.round((30 / selectedText.animationDuration) * 10) / 10}
                          <span className="text-gray-400 text-xs ml-2">
                            (1 = slow, 10 = fast)
                          </span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={30 / selectedText.animationDuration}
                          onChange={(e) => {
                            const speed = parseFloat(e.target.value);
                            const duration = 30 / speed;
                            onUpdateText(selectedText.id, { animationDuration: duration });
                          }}
                          className="w-full accent-pink-500"
                        />
                      </>
                    ) : (
                      <>
                        <label className="block text-gray-300 text-sm mb-2">
                          Duration: {selectedText.animationDuration}s
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.1"
                          value={selectedText.animationDuration}
                          onChange={(e) => onUpdateText(selectedText.id, { animationDuration: parseFloat(e.target.value) })}
                          className="w-full accent-pink-500"
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

