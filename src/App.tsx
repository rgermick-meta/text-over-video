import { useState, useEffect, useRef } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { TextEditor } from './components/TextEditor';
import { VideoPicker } from './components/VideoPicker';
import { AIStyleChat } from './components/AIStyleChat';
import { SAMPLE_VIDEOS } from './data/animations';
import { TextElement, VideoClip } from './types';
import { loadAllGoogleFonts, TEXT_STYLE_PRESETS } from './utils/googleFonts';
import { loadCustomPresets } from './utils/presetManager';
import html2canvas from 'html2canvas';

function App() {
  const [selectedVideo, setSelectedVideo] = useState<VideoClip>(
    SAMPLE_VIDEOS[0]
  );
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextIds, setSelectedTextIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'text' | 'video'>('text');
  const [copiedText, setCopiedText] = useState<TextElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Undo/Redo state
  const [history, setHistory] = useState<TextElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  const [pendingHistoryUpdate, setPendingHistoryUpdate] = useState(false);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load all Google Fonts on mount
    loadAllGoogleFonts();

    // Check for shared state in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(sharedData));
        
        // Restore video selection
        if (decodedData.videoId) {
          const video = SAMPLE_VIDEOS.find(v => v.id === decodedData.videoId);
          if (video) {
            setSelectedVideo(video);
          }
        }
        
        // Restore text elements
        if (decodedData.textElements && Array.isArray(decodedData.textElements)) {
          setTextElements(decodedData.textElements);
        }
        
        // Clean up URL without reloading page
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error loading shared data:', error);
      }
    }
  }, []);

  // Commit current state to history (called immediately for discrete actions)
  const commitToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(textElements)));
    
    // Limit history to 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
    setPendingHistoryUpdate(false);
    
    // Clear any pending timeout
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
  };

  // Track changes to textElements for undo/redo with debouncing
  useEffect(() => {
    if (!isUndoRedoAction && !pendingHistoryUpdate) {
      // Clear existing timeout
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      
      // Debounce history updates by 500ms for continuous actions like dragging
      historyTimeoutRef.current = setTimeout(() => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(textElements)));
        
        // Limit history to 50 states to prevent memory issues
        if (newHistory.length > 50) {
          newHistory.shift();
        } else {
          setHistoryIndex(historyIndex + 1);
        }
        
        setHistory(newHistory);
        historyTimeoutRef.current = null;
      }, 500);
    }
    setIsUndoRedoAction(false);
    
    // Cleanup timeout on unmount
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, [textElements]);

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      setIsUndoRedoAction(true);
      setHistoryIndex(historyIndex - 1);
      setTextElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoAction(true);
      setHistoryIndex(historyIndex + 1);
      setTextElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  useEffect(() => {
    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is editing text or typing in an input
      const target = e.target as HTMLElement;
      if (target.contentEditable === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Undo with Cmd/Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo with Cmd/Ctrl+Shift+Z
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Arrow keys to move selected text(s)
      if (selectedTextIds.length > 0 && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        if (!videoRef) return;

        // Calculate pixel step based on shift key (1px or 10px)
        const pixelStep = e.shiftKey ? 10 : 1;
        
        // Convert pixel movement to percentage based on video container dimensions
        // Using the video player's aspect ratio (9:16)
        const containerWidth = videoRef.clientHeight * (9 / 16); // aspect ratio 9:16
        const containerHeight = videoRef.clientHeight;
        
        const percentX = (pixelStep / containerWidth) * 100;
        const percentY = (pixelStep / containerHeight) * 100;

        let deltaX = 0;
        let deltaY = 0;

        switch (e.key) {
          case 'ArrowLeft':
            deltaX = -percentX;
            break;
          case 'ArrowRight':
            deltaX = percentX;
            break;
          case 'ArrowUp':
            deltaY = -percentY;
            break;
          case 'ArrowDown':
            deltaY = percentY;
            break;
        }

        // Move all selected elements using batch update
        const batchUpdates: Record<string, Partial<TextElement>> = {};
        selectedTextIds.forEach(id => {
          const selectedText = textElements.find(t => t.id === id);
          if (selectedText) {
            const newX = Math.max(0, Math.min(100, selectedText.position.x + deltaX));
            const newY = Math.max(0, Math.min(100, selectedText.position.y + deltaY));
            batchUpdates[id] = { position: { x: newX, y: newY } };
          }
        });
        handleBatchUpdateText(batchUpdates);
      }

      // Delete selected text(s)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextIds.length > 0) {
          e.preventDefault();
          handleDeleteMultiple(selectedTextIds);
        }
      }

      // Copy selected text(s)
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (selectedTextIds.length === 1) {
          const textToCopy = textElements.find(t => t.id === selectedTextIds[0]);
          if (textToCopy) {
            e.preventDefault();
            setCopiedText(textToCopy);
          }
        }
      }

      // Select all text elements
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedTextIds(textElements.map(t => t.id));
      }

      // Paste/duplicate copied text
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (copiedText) {
          e.preventDefault();
          // Commit current state before pasting
          setPendingHistoryUpdate(true);
          if (historyTimeoutRef.current) {
            clearTimeout(historyTimeoutRef.current);
            historyTimeoutRef.current = null;
          }
          
          const newText: TextElement = {
            ...copiedText,
            id: `text-${Date.now()}`,
            position: {
              x: copiedText.position.x + 5,
              y: copiedText.position.y + 5,
            },
            animationDistance: copiedText.animationDistance ?? 100,
            background: {
              ...copiedText.background,
              opacity: copiedText.background.opacity ?? 0.5,
            },
          };
          setTextElements(prev => [...prev, newText]);
          setSelectedTextIds([newText.id]);
          
          // Commit immediately after pasting
          setTimeout(commitToHistory, 0);
        }
      }

      // Duplicate with Cmd/Ctrl+D
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        if (selectedTextIds.length > 0) {
          e.preventDefault();
          handleDuplicateMultiple(selectedTextIds);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextIds, textElements, copiedText, videoRef, historyIndex, history]);

  const handleSelectVideo = (video: VideoClip) => {
    setSelectedVideo(video);
  };

  const handleAddText = () => {
    // Commit current state before adding new text
    setPendingHistoryUpdate(true);
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
    
    // Use properties from the first selected text or most recent text element
    const templateText = selectedTextIds.length > 0
      ? textElements.find(t => t.id === selectedTextIds[0])
      : textElements[textElements.length - 1];

    const defaultTemplate: Omit<TextElement, 'id'> = {
      text: 'New Text',
      fontFamily: 'Poppins',
      fontSize: 48,
      color: '#ffffff',
      bold: false,
      italic: false,
      underline: false,
      textAlign: 'center',
      position: { x: 50, y: 50 },
      width: 300,
      rotation: 0,
      opacity: 1,
      letterSpacing: 0,
      lineHeight: 1.2,
      visible: true,
      shadow: {
        enabled: true,
        color: '#000000',
        blur: 10,
        offsetX: 2,
        offsetY: 2,
      },
      stroke: {
        enabled: false,
        color: '#000000',
        width: 2,
      },
      background: {
        enabled: false,
        color: '#000000',
        padding: 12,
        borderRadius: 8,
        opacity: 0.5,
        gradient: {
          enabled: false,
          colors: ['#FF006E', '#8B5CF6'],
          angle: 135,
        },
        stroke: {
          enabled: false,
          color: '#ffffff',
          width: 2,
        },
        shadow: {
          enabled: false,
          color: '#000000',
          blur: 10,
          offsetX: 0,
          offsetY: 4,
        },
      },
      gradient: {
        enabled: false,
        colors: ['#FF006E', '#FFBE0B'],
        angle: 45,
      },
      animation: 'fadeIn',
      animationDuration: 1,
      animationDistance: 100,
    };

    const newText: TextElement = templateText
      ? {
          ...templateText,
          id: `text-${Date.now()}`,
          text: 'New Text',
          position: {
            x: Math.min(templateText.position.x + 5, 95),
            y: Math.min(templateText.position.y + 5, 95),
          },
          animationDistance: templateText.animationDistance ?? 100,
          background: {
            ...templateText.background,
            opacity: templateText.background.opacity ?? 0.5,
          },
        }
      : {
          ...defaultTemplate,
          id: `text-${Date.now()}`,
        };

    setTextElements([...textElements, newText]);
    setSelectedTextIds([newText.id]);
    
    // Commit immediately after adding
    setTimeout(commitToHistory, 0);
  };

  const handleUpdateText = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev =>
      prev.map((text) =>
        text.id === id ? { ...text, ...updates } : text
      )
    );
  };

  const handleBatchUpdateText = (updates: Record<string, Partial<TextElement>>) => {
    setTextElements(prev =>
      prev.map((text) =>
        updates[text.id] ? { ...text, ...updates[text.id] } : text
      )
    );
  };

  const handleDeleteText = (id: string) => {
    // Commit current state before deleting
    setPendingHistoryUpdate(true);
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
    
    setTextElements(textElements.filter((text) => text.id !== id));
    setSelectedTextIds(prev => prev.filter(selectedId => selectedId !== id));
    
    // Commit immediately after deleting
    setTimeout(commitToHistory, 0);
  };

  const handleDeleteMultiple = (ids: string[]) => {
    // Commit current state before deleting
    setPendingHistoryUpdate(true);
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
    
    setTextElements(textElements.filter((text) => !ids.includes(text.id)));
    setSelectedTextIds([]);
    
    // Commit immediately after deleting
    setTimeout(commitToHistory, 0);
  };

  const handleDuplicateText = (textToDuplicate: TextElement) => {
    // Commit current state before duplicating
    setPendingHistoryUpdate(true);
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
    
    const newText: TextElement = {
      ...textToDuplicate,
      id: `text-${Date.now()}`,
      position: {
        x: textToDuplicate.position.x + 5,
        y: textToDuplicate.position.y + 5,
      },
      animationDistance: textToDuplicate.animationDistance ?? 100,
      background: {
        ...textToDuplicate.background,
        opacity: textToDuplicate.background.opacity ?? 0.5,
      },
    };
    setTextElements([...textElements, newText]);
    setSelectedTextIds([newText.id]);
    
    // Commit immediately after duplicating
    setTimeout(commitToHistory, 0);
  };

  const handleDuplicateMultiple = (ids: string[]) => {
    // Commit current state before duplicating
    setPendingHistoryUpdate(true);
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
    
    const newTexts: TextElement[] = ids
      .map((id, index) => {
        const textToDuplicate = textElements.find(t => t.id === id);
        if (!textToDuplicate) return null;
        
        const newText: TextElement = {
          ...textToDuplicate,
          id: `text-${Date.now()}-${index}`,
          position: {
            x: textToDuplicate.position.x + 5,
            y: textToDuplicate.position.y + 5,
          },
          animationDistance: textToDuplicate.animationDistance ?? 100,
          background: {
            ...textToDuplicate.background,
            opacity: textToDuplicate.background.opacity ?? 0.5,
          },
        };
        return newText;
      })
      .filter((t): t is TextElement => t !== null);
    
    setTextElements([...textElements, ...newTexts]);
    setSelectedTextIds(newTexts.map(t => t.id));
    
    // Commit immediately after duplicating
    setTimeout(commitToHistory, 0);
  };

  const handleTextPositionChange = (id: string, position: { x: number; y: number }) => {
    handleUpdateText(id, { position });
  };

  const handleToggleVisibility = (id: string) => {
    const text = textElements.find(t => t.id === id);
    if (text) {
      handleUpdateText(id, { visible: !text.visible });
    }
  };

  const handleApplyPreset = (presetName: string) => {
    if (selectedTextIds.length === 0) return;

    // Commit current state before applying preset
    setPendingHistoryUpdate(true);
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    // Search in both built-in and custom presets
    const customPresets = loadCustomPresets();
    const allPresets = [...TEXT_STYLE_PRESETS, ...customPresets];
    const preset = allPresets.find(p => p.name === presetName);
    
    if (!preset) return;

    // Reset all style properties to defaults, then apply preset
    const updates: Partial<TextElement> = {
      // Core text properties from preset
      fontFamily: preset.settings.fontFamily,
      fontSize: preset.settings.fontSize,
      bold: preset.settings.bold,
      color: preset.settings.color,
      letterSpacing: preset.settings.letterSpacing,
      
      // Reset shadow to default (or apply preset value)
      shadow: preset.settings.shadow || {
        enabled: false,
        color: '#000000',
        blur: 10,
        offsetX: 2,
        offsetY: 2,
      },
      
      // Reset stroke to default (or apply preset value)
      stroke: preset.settings.stroke || {
        enabled: false,
        color: '#000000',
        width: 2,
      },
      
      // Reset background to default (or apply preset value)
      background: preset.settings.background || {
        enabled: false,
        color: '#000000',
        padding: 16,
        borderRadius: 8,
        opacity: 0.5,
        gradient: {
          enabled: false,
          colors: ['#000000', '#333333'],
          angle: 90,
        },
        stroke: {
          enabled: false,
          color: '#ffffff',
          width: 2,
        },
        shadow: {
          enabled: false,
          color: '#000000',
          blur: 5,
          offsetX: 2,
          offsetY: 2,
        },
      },
      
      // Reset gradient to default (or apply preset value)
      gradient: preset.settings.gradient || {
        enabled: false,
        colors: ['#FF006E', '#FFBE0B'],
        angle: 45,
      },
      
      // Reset animation to default (or apply preset value)
      animation: (preset.settings.animation as TextElement['animation']) || 'none',
      animationDuration: preset.settings.animationDuration ?? 1.0,
      animationDistance: preset.settings.animationDistance ?? 100,
    };

    // Apply preset to all selected elements
    selectedTextIds.forEach(id => {
      handleUpdateText(id, updates);
    });
    
    // Commit immediately after applying preset
    setTimeout(commitToHistory, 0);
  };

  const handleSelectText = (id: string | null, multiSelect?: boolean, rangeSelect?: boolean) => {
    if (id === null) {
      setSelectedTextIds([]);
      return;
    }

    if (rangeSelect && selectedTextIds.length > 0) {
      // Shift-click: Select range from last selected to clicked item
      const lastSelectedId = selectedTextIds[selectedTextIds.length - 1];
      const lastIndex = textElements.findIndex(t => t.id === lastSelectedId);
      const clickedIndex = textElements.findIndex(t => t.id === id);
      
      if (lastIndex !== -1 && clickedIndex !== -1) {
        const start = Math.min(lastIndex, clickedIndex);
        const end = Math.max(lastIndex, clickedIndex);
        const rangeIds = textElements.slice(start, end + 1).map(t => t.id);
        setSelectedTextIds(rangeIds);
      }
    } else if (multiSelect) {
      // Cmd/Ctrl-click: Toggle selection
      if (selectedTextIds.includes(id)) {
        setSelectedTextIds(prev => prev.filter(selectedId => selectedId !== id));
      } else {
        setSelectedTextIds(prev => [...prev, id]);
      }
    } else {
      // Normal click: Select only this item
      setSelectedTextIds([id]);
    }
  };

  const handleRefresh = () => {
    // Restart video and replay non-marquee animations
    if (videoRef) {
      videoRef.currentTime = 0;
      videoRef.play();
    }
    
    // Increment refresh key to force remount (this will now only affect non-marquee elements)
    setRefreshKey(prev => prev + 1);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleShare = async () => {
    try {
      // Create shareable data object
      const shareData = {
        videoId: selectedVideo.id,
        textElements: textElements,
      };
      
      // Encode data to URL parameter
      const encodedData = encodeURIComponent(JSON.stringify(shareData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard! 🎉\n\nYou can paste and share this link with anyone.');
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  const handleDownloadScreenshot = async () => {
    if (!videoContainerRef.current) return;

    try {
      // Find the video canvas element (the inner div with video and text overlays)
      const videoCanvas = videoContainerRef.current.querySelector('[data-video-canvas="true"]') as HTMLElement;
      if (!videoCanvas) return;

      // Capture the actual rendered pixels using html2canvas
      const canvas = await html2canvas(videoCanvas, {
        backgroundColor: null,
        scale: 2, // Higher quality screenshot
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedVideo.name.replace(/\.[^/.]+$/, '')}-screenshot-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');

    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
      {/* Left Panel - Text/Video Editor */}
      <div className="lg:w-[400px] flex-shrink-0 flex flex-col gap-4">
        {/* Tab Switcher */}
        <div className="bg-gray-800 rounded-xl p-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'text'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              <span className="text-xs">Text</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">Video</span>
            </div>
          </button>
          </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'text' ? (
            <TextEditor
              textElements={textElements}
              selectedTextIds={selectedTextIds}
              onAddText={handleAddText}
              onUpdateText={handleUpdateText}
              onDeleteText={handleDeleteText}
              onDuplicateText={handleDuplicateText}
              onSelectText={handleSelectText}
              onToggleVisibility={handleToggleVisibility}
              onApplyPreset={handleApplyPreset}
            />
          ) : (
            <VideoPicker
              videos={SAMPLE_VIDEOS}
              selectedVideo={selectedVideo}
              onSelectVideo={handleSelectVideo}
            />
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden p-6 gap-4">
        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`text-white p-3 rounded-lg font-medium transition-all shadow-lg ${
              historyIndex <= 0 
                ? 'bg-gray-700 opacity-50 cursor-not-allowed' 
                : 'bg-gray-800 hover:bg-gray-700 hover:shadow-xl'
            }`}
            title="Undo (Cmd/Ctrl+Z)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          {/* Redo Button */}
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`text-white p-3 rounded-lg font-medium transition-all shadow-lg ${
              historyIndex >= history.length - 1 
                ? 'bg-gray-700 opacity-50 cursor-not-allowed' 
                : 'bg-gray-800 hover:bg-gray-700 hover:shadow-xl'
            }`}
            title="Redo (Cmd/Ctrl+Shift+Z)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          <button
            onClick={handleRefresh}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            title="Restart video and replay animations"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={handlePlayPause}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            title={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleDownloadScreenshot}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            title="Download screenshot of current frame"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={handleShare}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            title="Share your design"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        <div ref={videoContainerRef} className="w-full max-w-md h-full rounded-2xl overflow-hidden shadow-2xl">
          <VideoPlayer
            videoUrl={selectedVideo.src}
            textElements={textElements}
            selectedTextIds={selectedTextIds}
            onTextPositionChange={handleTextPositionChange}
            onSelectText={handleSelectText}
            onUpdateText={handleUpdateText}
            onBatchUpdateText={handleBatchUpdateText}
            onVideoReady={setVideoRef}
            refreshTrigger={refreshKey}
          />
        </div>
      </div>

      {/* Right Panel - AI Style Assistant */}
      <div className="lg:w-[380px] flex-shrink-0 h-full">
        <AIStyleChat
          selectedTextIds={selectedTextIds}
          textElements={textElements}
          onUpdateText={handleUpdateText}
          onDuplicateText={handleDuplicateText}
          videoTitle={selectedVideo.name}
          videoElement={videoRef}
        />
      </div>
    </div>
  );
}

export default App;
