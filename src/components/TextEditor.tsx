import React, { useState, useEffect, useRef } from 'react';
import { TextElement, TextAnimation } from '../types';
import { FONT_CATEGORIES, COLOR_PALETTES, TEXT_STYLE_PRESETS, loadGoogleFont, TextStylePreset } from '../utils/googleFonts';
import { 
  loadCustomPresets, 
  addCustomPreset, 
  deleteCustomPreset, 
  exportPresets, 
  importPresets, 
  mergeImportedPresets, 
  createPresetFromSettings 
} from '../utils/presetManager';

// Number Slider Component with direct input
interface NumberSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

const NumberSlider: React.FC<NumberSliderProps> = ({ label, value, min, max, step = 1, unit = '', onChange }) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    } else {
      setInputValue(value.toString());
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      return;
    }

    // Arrow key controls: up/down = ±1, shift+up/down = ±10
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const increment = e.shiftKey ? 10 : 1;
      const delta = e.key === 'ArrowUp' ? increment : -increment;
      const newValue = Math.max(min, Math.min(max, value + delta));
      onChange(newValue);
    }
  };

  const isActive = isHovered || isFocused;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-300 text-sm">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className={`w-14 text-xs px-2 py-1 rounded text-right transition-all ${
              isActive
                ? 'bg-gray-700 text-white border border-gray-600 focus:border-pink-500 focus:outline-none'
                : 'bg-transparent text-gray-400 border border-transparent cursor-default font-mono'
            }`}
            readOnly={!isActive}
          />
          {unit && <span className="text-gray-400 text-xs w-4">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-pink-500"
      />
    </div>
  );
};

interface TextEditorProps {
  textElements: TextElement[];
  selectedTextIds: string[];
  onAddText: () => void;
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
  onDeleteText: (id: string) => void;
  onDuplicateText: (text: TextElement) => void;
  onSelectText: (id: string | null, multiSelect?: boolean, rangeSelect?: boolean) => void;
  onToggleVisibility: (id: string) => void;
  onApplyPreset: (presetName: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  textElements,
  selectedTextIds,
  onAddText,
  onUpdateText,
  onDeleteText,
  onDuplicateText,
  onSelectText,
  onToggleVisibility,
  onApplyPreset,
}) => {
  // Get first selected text for editing (when single selection), or null for multi-selection
  const selectedText = selectedTextIds.length === 1 
    ? textElements.find(t => t.id === selectedTextIds[0]) 
    : null;
  const isMultiSelect = selectedTextIds.length > 1;
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [activeFontCategory, setActiveFontCategory] = useState<keyof typeof FONT_CATEGORIES>('modern');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [activeColorPalette, setActiveColorPalette] = useState<keyof typeof COLOR_PALETTES>('modern');
  const [showPresets, setShowPresets] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<string>('smileys');
  const [customPresets, setCustomPresets] = useState<TextStylePreset[]>([]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState('Custom');
  const [showImportExport, setShowImportExport] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom presets on mount
  useEffect(() => {
    setCustomPresets(loadCustomPresets());
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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

  const emojiCategories: Record<string, { label: string; emojis: string[] }> = {
    smileys: {
      label: '😀 Smileys',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '🫠', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😶‍🌫️', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
    },
    gestures: {
      label: '👋 Gestures',
      emojis: ['👋', '🤚', '🖐', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁', '👅', '👄', '🫦']
    },
    people: {
      label: '👤 People',
      emojis: ['👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '🧔‍♂️', '🧔‍♀️', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '🧑‍🦰', '👩‍🦱', '🧑‍🦱', '👩‍🦳', '🧑‍🦳', '👩‍🦲', '🧑‍🦲', '👱‍♀️', '👱‍♂️', '🧓', '👴', '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍⚖️', '👨‍⚖️', '👩‍⚖️', '🧑‍🌾', '👨‍🌾', '👩‍🌾', '🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍🔧', '👨‍🔧', '👩‍🔧', '🧑‍🏭', '👨‍🏭', '👩‍🏭', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🎤', '👨‍🎤', '👩‍🎤', '🧑‍🎨', '👨‍🎨', '👩‍🎨', '🧑‍✈️', '👨‍✈️', '👩‍✈️', '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧑‍🚒', '👨‍🚒', '👩‍🚒', '👮', '👮‍♂️', '👮‍♀️', '🕵', '🕵️‍♂️', '🕵️‍♀️', '💂', '💂‍♂️', '💂‍♀️', '🥷', '👷', '👷‍♂️', '👷‍♀️', '🫅', '🤴', '👸', '👳', '👳‍♂️', '👳‍♀️', '👲', '🧕', '🤵', '🤵‍♂️', '🤵‍♀️', '👰', '👰‍♂️', '👰‍♀️', '🤰', '🫃', '🫄', '🤱', '👩‍🍼', '👨‍🍼', '🧑‍🍼']
    },
    hearts: {
      label: '❤️ Hearts',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❤️‍🔥', '❤️‍🩹', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💋', '😍', '🥰', '😘', '😻', '💑', '💏', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '💑', '👩‍❤️‍💋‍👨', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩']
    },
    animals: {
      label: '🐶 Animals',
      emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🦭', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔']
    },
    food: {
      label: '🍕 Food',
      emojis: ['🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🫘', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽', '🥣', '🥡', '🥢', '🧂']
    },
    activities: {
      label: '⚽ Activities',
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🏋️‍♂️', '🏋️‍♀️', '🤼', '🤼‍♂️', '🤼‍♀️', '🤸', '🤸‍♂️', '🤸‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🤺', '🤾', '🤾‍♂️', '🤾‍♀️', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🏇', '🧘', '🧘‍♂️', '🧘‍♀️', '🏄', '🏄‍♂️', '🏄‍♀️', '🏊', '🏊‍♂️', '🏊‍♀️', '🤽', '🤽‍♂️', '🤽‍♀️', '🚣', '🚣‍♂️', '🚣‍♀️', '🧗', '🧗‍♂️', '🧗‍♀️', '🚵', '🚵‍♂️', '🚵‍♀️', '🚴', '🚴‍♂️', '🚴‍♀️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹', '🤹‍♂️', '🤹‍♀️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟', '🎯', '🎳', '🎮', '🎰', '🧩']
    },
    travel: {
      label: '✈️ Travel',
      emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲', '⛱', '🏖', '🏝', '🏜', '🌋', '⛰', '🏔', '🗻', '🏕', '⛺', '🛖', '🏠', '🏡', '🏘', '🏚', '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩', '🛤', '🛣', '🗾', '🎑', '🏞', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙', '🌃', '🌌', '🌉', '🌁']
    },
    objects: {
      label: '💡 Objects',
      emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🪫', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '🪪', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒', '🛠', '⛏', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🪆', '🖼', '🪞', '🪟', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
    },
    nature: {
      label: '🌸 Nature',
      emojis: ['💐', '🌸', '💮', '🪷', '🏵', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪹', '🪺', '🍄', '🌰', '🐚', '🪸', '🪨', '⛰', '🏔', '❄️', '☃️', '⛄', '🌬', '💨', '🌪', '🌫', '🌊', '💧', '💦', '☔', '🌂', '⛱', '⚡', '☄️', '🔥', '💥', '✨', '🌟', '⭐', '🌠', '🌌', '☁️', '⛅', '🌤', '🌥', '🌦', '🌧', '⛈', '🌩', '🌨', '☀️', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⚫', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲']
    },
    symbols: {
      label: '🔥 Symbols',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💬', '👁️‍🗨️', '🗨', '🗯', '💭', '💤', '💮', '♨️', '💈', '🛑', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕡', '🕖', '🕢', '🕗', '🕣', '🕘', '🕤', '🕙', '🕥', '🕚', '🕦', '⭐', '🌟', '💫', '✨', '☄️', '💥', '🔥', '🌪', '🌈', '☀️', '🌤', '⛅', '🌥', '☁️', '🌦', '🌧', '⛈', '🌩', '🌨', '❄️', '☃️', '⛄', '🌬', '💨', '💧', '💦', '🫧', '☔', '☂️', '🌊', '🌫', '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '⚡', '🔥', '💥', '💫', '✨', '☀️', '🌙', '⭐', '🌟', '💫', '✅', '❌', '⭕', '❗', '❓', '❕', '❔', '‼️', '⁉️', '〰️', '💱', '💲', '⚕️', '♻️', '⚜️', '🔱', '📛', '🔰', '⭕', '✅', '☑️', '✔️', '❌', '❎', '➕', '➖', '➗', '➰', '➿', '〽️', '✳️', '✴️', '❇️', '©️', '®️', '™️', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔠', '🔡', '🔢', '🔣', '🔤', '🅰️', '🆎', '🅱️', '🆑', '🆒', '🆓', 'ℹ️', '🆔', 'Ⓜ️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯', '🉐', '🈹', '🈚', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️']
    },
    flags: {
      label: '🏳️ Flags',
      emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿', '🇩🇪', '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷', '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵', '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾', '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇳', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺', '🇼🇫', '🇼🇸', '🇽🇰', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿']
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    if (!selectedText) return;
    
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = selectedText.text;
      const newText = text.slice(0, start) + emoji + text.slice(end);
      
      onUpdateText(selectedText.id, { text: newText });
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + emoji.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      // Fallback: append emoji
      onUpdateText(selectedText.id, { text: selectedText.text + emoji });
    }
  };

  const handleSavePreset = () => {
    if (!selectedText || !newPresetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    try {
      const preset = createPresetFromSettings(
        newPresetName.trim(),
        newPresetCategory,
        {
          fontFamily: selectedText.fontFamily,
          fontSize: selectedText.fontSize,
          bold: selectedText.bold,
          color: selectedText.color,
          letterSpacing: selectedText.letterSpacing,
          shadow: selectedText.shadow.enabled ? selectedText.shadow : undefined,
          stroke: selectedText.stroke.enabled ? selectedText.stroke : undefined,
          background: selectedText.background.enabled ? {
            enabled: selectedText.background.enabled,
            color: selectedText.background.color,
            padding: selectedText.background.padding,
            borderRadius: selectedText.background.borderRadius,
            opacity: selectedText.background.opacity,
            gradient: selectedText.background.gradient,
            stroke: selectedText.background.stroke,
            shadow: selectedText.background.shadow,
          } : undefined,
          gradient: selectedText.gradient.enabled ? selectedText.gradient : undefined,
          animation: selectedText.animation !== 'none' ? selectedText.animation : undefined,
          animationDuration: selectedText.animation !== 'none' ? selectedText.animationDuration : undefined,
          animationDistance: selectedText.animationDistance,
        }
      );

      addCustomPreset(preset);
      setCustomPresets(loadCustomPresets());
      setNewPresetName('');
      setNewPresetCategory('Custom');
      setShowSavePreset(false);
      alert(`Preset "${preset.name}" saved successfully!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save preset');
    }
  };

  const handleDeletePreset = (presetName: string) => {
    if (!confirm(`Delete preset "${presetName}"?`)) return;
    
    try {
      deleteCustomPreset(presetName);
      setCustomPresets(loadCustomPresets());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete preset');
    }
  };

  const handleExportPresets = () => {
    const allCustomPresets = loadCustomPresets();
    if (allCustomPresets.length === 0) {
      alert('No custom presets to export');
      return;
    }

    const jsonString = exportPresets(allCustomPresets);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-presets-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const importedPresets = importPresets(jsonString);
        const addedCount = mergeImportedPresets(importedPresets);
        
        setCustomPresets(loadCustomPresets());
        alert(`Successfully imported ${addedCount} new preset(s). ${importedPresets.length - addedCount} duplicate(s) were skipped.`);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to import presets');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Combine built-in and custom presets
  const allPresets = [...TEXT_STYLE_PRESETS, ...customPresets];
  const allCategories = ['Headers', 'Special', 'Body', 'Fun', 'Elegant', 'Custom', ...Array.from(new Set(customPresets.map(p => p.category).filter(c => c !== 'Custom')))];

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
                  selectedTextIds.includes(text.id)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 truncate cursor-pointer" 
                    onClick={(e) => onSelectText(text.id, e.metaKey || e.ctrlKey, e.shiftKey)}
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
        {selectedTextIds.length > 0 && (
          <div className="border-t border-gray-700 pt-4 pb-4 border-b">
            {isMultiSelect && (
              <div className="mb-3 bg-purple-600/20 border border-purple-500/50 rounded-lg p-3">
                <p className="text-purple-200 text-sm font-medium">
                  🎨 {selectedTextIds.length} items selected
                </p>
                <p className="text-purple-300 text-xs mt-1">
                  Presets and styles will apply to all selected items
                </p>
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 text-gray-300 hover:text-pink-400 transition-colors cursor-pointer"
                title={showPresets ? 'Collapse presets' : 'Expand presets'}
              >
                <h5 className="text-sm font-medium">Style Presets</h5>
                <svg 
                  className={`w-4 h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => setShowImportExport(!showImportExport)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                title="Import/Export presets"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>

            {/* Import/Export Section */}
            {showImportExport && (
              <div className="mb-3 bg-gray-700/50 rounded-lg p-3 space-y-2">
                <p className="text-xs text-gray-400 mb-2">Manage Presets</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportPresets}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                  >
                    Export All
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                  >
                    Import
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportPresets}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 italic">
                  {customPresets.length} custom preset(s) saved
                </p>
              </div>
            )}

            {/* Save Current Style Button */}
            <button
              onClick={() => setShowSavePreset(!showSavePreset)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs px-3 py-2 rounded-lg transition-all mb-3 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Current Style as Preset
            </button>

            {/* Save Preset Form */}
            {showSavePreset && (
              <div className="mb-3 bg-gray-700/50 rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset name"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={newPresetCategory}
                  onChange={(e) => setNewPresetCategory(e.target.value)}
                  placeholder="Category (e.g., Custom)"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePreset}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSavePreset(false);
                      setNewPresetName('');
                      setNewPresetCategory('Custom');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {showPresets && (
              <div className="space-y-3 mb-4">
                {allCategories.filter(category => allPresets.some(p => p.category === category)).map(category => (
                  <div key={category}>
                    <p className="text-xs text-gray-500 mb-2">{category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {allPresets.filter(p => p.category === category).map(preset => {
                        const isCustom = customPresets.some(cp => cp.name === preset.name);
                        return (
                          <div key={preset.name} className="relative group">
                            <button
                              onClick={() => onApplyPreset(preset.name)}
                              className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-colors text-left"
                              style={{ fontFamily: preset.settings.fontFamily }}
                            >
                              {preset.name}
                            </button>
                            {isCustom && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePreset(preset.name);
                                }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded p-1 transition-all"
                                title="Delete custom preset"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Selected Text */}
            <div className="space-y-4">
              {isMultiSelect ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-2">
                    📝 Multi-selection editing
                  </p>
                  <p className="text-gray-500 text-xs">
                    Apply presets or use keyboard shortcuts to manipulate all selected items.
                    Select a single item to edit individual properties.
                  </p>
                </div>
              ) : selectedText ? (
                <>
              {/* Text Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-300 text-sm">Text Content</label>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      showEmojiPicker 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title="Add emoji"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={selectedText.text}
                    onChange={(e) => onUpdateText(selectedText.id, { text: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Enter your text..."
                  />
                  
                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <div 
                      ref={emojiPickerRef} 
                      className="absolute left-0 right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl overflow-hidden flex flex-col"
                      style={{ zIndex: 50, maxHeight: '300px' }}
                    >
                      {/* Emoji Category Tabs */}
                      <div className="flex justify-between border-b border-gray-600 bg-gray-800 flex-shrink-0">
                        {Object.entries(emojiCategories).map(([key, category]) => (
                          <button
                            key={key}
                            onClick={() => setActiveEmojiCategory(key)}
                            className={`flex-1 py-1.5 text-lg whitespace-nowrap transition-colors ${
                              activeEmojiCategory === key
                                ? 'bg-pink-500'
                                : 'hover:bg-gray-600'
                            }`}
                            title={category.label}
                          >
                            {category.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                      
                      {/* Emoji Grid */}
                      <div className="p-2 overflow-y-auto custom-scrollbar flex-1" style={{ minHeight: 0 }}>
                        <div className="grid grid-cols-8 gap-1">
                          {emojiCategories[activeEmojiCategory].emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                handleInsertEmoji(emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="text-xl hover:bg-gray-600 rounded p-1 transition-colors aspect-square flex items-center justify-center"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                  <NumberSlider
                    label="Size"
                    value={selectedText.fontSize}
                    min={12}
                    max={120}
                    unit="px"
                    onChange={(val) => onUpdateText(selectedText.id, { fontSize: Math.round(val) })}
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
                  <NumberSlider
                    label="Letter Space"
                    value={selectedText.letterSpacing}
                    min={-5}
                    max={20}
                    unit="px"
                    onChange={(val) => onUpdateText(selectedText.id, { letterSpacing: Math.round(val) })}
                  />
                </div>
                <div>
                  <NumberSlider
                    label="Line Height"
                    value={selectedText.lineHeight}
                    min={0.8}
                    max={2.5}
                    step={0.1}
                    onChange={(val) => onUpdateText(selectedText.id, { lineHeight: val })}
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
                  <NumberSlider
                    label="Opacity"
                    value={Math.round(selectedText.opacity * 100)}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(val) => onUpdateText(selectedText.id, { opacity: val / 100 })}
                  />
                </div>
              </div>

              {/* Rotation */}
              <div>
                <NumberSlider
                  label="Rotation"
                  value={selectedText.rotation}
                  min={-180}
                  max={180}
                  unit="°"
                  onChange={(val) => onUpdateText(selectedText.id, { rotation: Math.round(val) })}
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
                        <NumberSlider
                          label="Angle"
                          value={selectedText.gradient.angle}
                          min={0}
                          max={360}
                          unit="°"
                          onChange={(val) =>
                            onUpdateText(selectedText.id, {
                              gradient: { ...selectedText.gradient, angle: Math.round(val) },
                            })
                          }
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
                        <NumberSlider
                          label="Blur"
                          value={selectedText.shadow.blur}
                          min={0}
                          max={50}
                          unit="px"
                          onChange={(val) =>
                            onUpdateText(selectedText.id, {
                              shadow: { ...selectedText.shadow, blur: Math.round(val) },
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <NumberSlider
                            label="X"
                            value={selectedText.shadow.offsetX}
                            min={-20}
                            max={20}
                            onChange={(val) =>
                              onUpdateText(selectedText.id, {
                                shadow: { ...selectedText.shadow, offsetX: Math.round(val) },
                              })
                            }
                          />
                        </div>
                        <div>
                          <NumberSlider
                            label="Y"
                            value={selectedText.shadow.offsetY}
                            min={-20}
                            max={20}
                            onChange={(val) =>
                              onUpdateText(selectedText.id, {
                                shadow: { ...selectedText.shadow, offsetY: Math.round(val) },
                              })
                            }
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
                        <NumberSlider
                          label="Width"
                          value={selectedText.stroke.width}
                          min={1}
                          max={10}
                          unit="px"
                          onChange={(val) =>
                            onUpdateText(selectedText.id, {
                              stroke: { ...selectedText.stroke, width: Math.round(val) },
                            })
                          }
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
                        <NumberSlider
                          label="Opacity"
                          value={Math.round((selectedText.background.opacity ?? 0.5) * 100)}
                          min={0}
                          max={100}
                          unit="%"
                          onChange={(val) =>
                            onUpdateText(selectedText.id, {
                              background: { ...selectedText.background, opacity: val / 100 },
                            })
                          }
                        />
                      </div>
                      
                      {/* Background Gradient */}
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-gray-400 text-xs">Gradient</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedText.background.gradient?.enabled ?? false}
                              onChange={(e) =>
                                onUpdateText(selectedText.id, {
                                  background: { 
                                    ...selectedText.background, 
                                    gradient: { 
                                      enabled: e.target.checked,
                                      colors: selectedText.background.gradient?.colors ?? ['#FF006E', '#8B5CF6'],
                                      angle: selectedText.background.gradient?.angle ?? 135,
                                    }
                                  },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                        {selectedText.background.gradient?.enabled && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedText.background.gradient.colors[0]}
                                onChange={(e) =>
                                  onUpdateText(selectedText.id, {
                                    background: { 
                                      ...selectedText.background, 
                                      gradient: { 
                                        ...selectedText.background.gradient!, 
                                        colors: [e.target.value, selectedText.background.gradient!.colors[1]]
                                      }
                                    },
                                  })
                                }
                                className="w-10 h-8 rounded cursor-pointer"
                              />
                              <input
                                type="color"
                                value={selectedText.background.gradient.colors[1]}
                                onChange={(e) =>
                                  onUpdateText(selectedText.id, {
                                    background: { 
                                      ...selectedText.background, 
                                      gradient: { 
                                        ...selectedText.background.gradient!, 
                                        colors: [selectedText.background.gradient!.colors[0], e.target.value]
                                      }
                                    },
                                  })
                                }
                                className="w-10 h-8 rounded cursor-pointer"
                              />
                            </div>
                            <div>
                              <NumberSlider
                                label="Angle"
                                value={selectedText.background.gradient.angle}
                                min={0}
                                max={360}
                                unit="°"
                                onChange={(val) =>
                                  onUpdateText(selectedText.id, {
                                    background: { 
                                      ...selectedText.background, 
                                      gradient: { 
                                        ...selectedText.background.gradient!, 
                                        angle: Math.round(val)
                                      }
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <NumberSlider
                          label="Padding"
                          value={selectedText.background.padding}
                          min={0}
                          max={40}
                          unit="px"
                          onChange={(val) =>
                            onUpdateText(selectedText.id, {
                              background: { ...selectedText.background, padding: Math.round(val) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <NumberSlider
                          label="Radius"
                          value={selectedText.background.borderRadius}
                          min={0}
                          max={50}
                          unit="px"
                          onChange={(val) =>
                            onUpdateText(selectedText.id, {
                              background: { ...selectedText.background, borderRadius: Math.round(val) },
                            })
                          }
                        />
                      </div>
                      
                      {/* Background Stroke */}
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-gray-400 text-xs">Stroke</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedText.background.stroke?.enabled ?? false}
                              onChange={(e) =>
                                onUpdateText(selectedText.id, {
                                  background: { 
                                    ...selectedText.background, 
                                    stroke: { 
                                      enabled: e.target.checked,
                                      color: selectedText.background.stroke?.color ?? '#ffffff',
                                      width: selectedText.background.stroke?.width ?? 2,
                                    }
                                  },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                        {selectedText.background.stroke?.enabled && (
                          <div className="space-y-2">
                            <input
                              type="color"
                              value={selectedText.background.stroke.color}
                              onChange={(e) =>
                                onUpdateText(selectedText.id, {
                                  background: { 
                                    ...selectedText.background, 
                                    stroke: { ...selectedText.background.stroke!, color: e.target.value }
                                  },
                                })
                              }
                              className="w-full h-6 rounded cursor-pointer"
                            />
                            <div>
                              <NumberSlider
                                label="Width"
                                value={selectedText.background.stroke.width}
                                min={1}
                                max={10}
                                unit="px"
                                onChange={(val) =>
                                  onUpdateText(selectedText.id, {
                                    background: { 
                                      ...selectedText.background, 
                                      stroke: { ...selectedText.background.stroke!, width: Math.round(val) }
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Background Shadow */}
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-gray-400 text-xs">Shadow</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedText.background.shadow?.enabled ?? false}
                              onChange={(e) =>
                                onUpdateText(selectedText.id, {
                                  background: { 
                                    ...selectedText.background, 
                                    shadow: { 
                                      enabled: e.target.checked,
                                      color: selectedText.background.shadow?.color ?? '#000000',
                                      blur: selectedText.background.shadow?.blur ?? 10,
                                      offsetX: selectedText.background.shadow?.offsetX ?? 0,
                                      offsetY: selectedText.background.shadow?.offsetY ?? 4,
                                    }
                                  },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                        {selectedText.background.shadow?.enabled && (
                          <div className="space-y-2">
                            <input
                              type="color"
                              value={selectedText.background.shadow.color}
                              onChange={(e) =>
                                onUpdateText(selectedText.id, {
                                  background: { 
                                    ...selectedText.background, 
                                    shadow: { ...selectedText.background.shadow!, color: e.target.value }
                                  },
                                })
                              }
                              className="w-full h-6 rounded cursor-pointer"
                            />
                            <div>
                              <NumberSlider
                                label="Blur"
                                value={selectedText.background.shadow.blur}
                                min={0}
                                max={50}
                                unit="px"
                                onChange={(val) =>
                                  onUpdateText(selectedText.id, {
                                    background: { 
                                      ...selectedText.background, 
                                      shadow: { ...selectedText.background.shadow!, blur: Math.round(val) }
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <NumberSlider
                                  label="X"
                                  value={selectedText.background.shadow.offsetX}
                                  min={-20}
                                  max={20}
                                  onChange={(val) =>
                                    onUpdateText(selectedText.id, {
                                      background: { 
                                        ...selectedText.background, 
                                        shadow: { ...selectedText.background.shadow!, offsetX: Math.round(val) }
                                      },
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <NumberSlider
                                  label="Y"
                                  value={selectedText.background.shadow.offsetY}
                                  min={-20}
                                  max={20}
                                  onChange={(val) =>
                                    onUpdateText(selectedText.id, {
                                      background: { 
                                        ...selectedText.background, 
                                        shadow: { ...selectedText.background.shadow!, offsetY: Math.round(val) }
                                      },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
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
                  <>
                    <div>
                      {selectedText.animation === 'marqueeLeft' || selectedText.animation === 'marqueeRight' ? (
                        <>
                          <div className="text-gray-400 text-xs mb-1">(1 = slow, 10 = very fast)</div>
                          <NumberSlider
                            label="Scroll Speed"
                            value={Math.round(Math.sqrt(120 / selectedText.animationDuration) * 10) / 10}
                            min={1}
                            max={10}
                            step={0.5}
                            onChange={(speed) => {
                              const duration = 120 / (speed * speed);
                              onUpdateText(selectedText.id, { animationDuration: duration });
                            }}
                          />
                        </>
                      ) : (
                        <NumberSlider
                          label="Duration"
                          value={selectedText.animationDuration}
                          min={0.1}
                          max={3}
                          step={0.1}
                          unit="s"
                          onChange={(val) => onUpdateText(selectedText.id, { animationDuration: val })}
                        />
                      )}
                    </div>

                    {/* Animation Distance for directional animations */}
                    {(selectedText.animation === 'slideUp' || 
                      selectedText.animation === 'slideDown' || 
                      selectedText.animation === 'slideLeft' || 
                      selectedText.animation === 'slideRight') && (
                      <div>
                        <NumberSlider
                          label="Distance"
                          value={selectedText.animationDistance || 100}
                          min={20}
                          max={200}
                          step={10}
                          unit="%"
                          onChange={(val) => onUpdateText(selectedText.id, { animationDistance: Math.round(val) })}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

