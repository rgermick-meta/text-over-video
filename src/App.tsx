import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { TextEditor } from './components/TextEditor';
import { VideoPicker } from './components/VideoPicker';
import { SAMPLE_VIDEOS } from './data/animations';
import { TextElement, VideoClip } from './types';
import { loadAllGoogleFonts, TEXT_STYLE_PRESETS } from './utils/googleFonts';

function App() {
  const [selectedVideo, setSelectedVideo] = useState<VideoClip>(
    SAMPLE_VIDEOS[0]
  );
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'video'>('text');
  const [copiedText, setCopiedText] = useState<TextElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Load all Google Fonts on mount
    loadAllGoogleFonts();
  }, []);

  useEffect(() => {
    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is editing text or typing in an input
      const target = e.target as HTMLElement;
      if (target.contentEditable === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Delete selected text
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextId) {
          e.preventDefault();
          setTextElements(prev => prev.filter(text => text.id !== selectedTextId));
          setSelectedTextId(null);
        }
      }

      // Copy selected text
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (selectedTextId) {
          const textToCopy = textElements.find(t => t.id === selectedTextId);
          if (textToCopy) {
            e.preventDefault();
            setCopiedText(textToCopy);
          }
        }
      }

      // Paste/duplicate copied text
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (copiedText) {
          e.preventDefault();
          const newText: TextElement = {
            ...copiedText,
            id: `text-${Date.now()}`,
            position: {
              x: copiedText.position.x + 5,
              y: copiedText.position.y + 5,
            },
          };
          setTextElements(prev => [...prev, newText]);
          setSelectedTextId(newText.id);
        }
      }

      // Duplicate with Cmd/Ctrl+D
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        if (selectedTextId) {
          e.preventDefault();
          const textToDuplicate = textElements.find(t => t.id === selectedTextId);
          if (textToDuplicate) {
            const newText: TextElement = {
              ...textToDuplicate,
              id: `text-${Date.now()}`,
              position: {
                x: textToDuplicate.position.x + 5,
                y: textToDuplicate.position.y + 5,
              },
            };
            setTextElements(prev => [...prev, newText]);
            setSelectedTextId(newText.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextId, textElements, copiedText]);

  const handleSelectVideo = (video: VideoClip) => {
    setSelectedVideo(video);
  };

  const handleAddText = () => {
    // Use properties from the selected text or most recent text element
    const templateText = selectedTextId 
      ? textElements.find(t => t.id === selectedTextId)
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
        color: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 8,
      },
      gradient: {
        enabled: false,
        colors: ['#FF006E', '#FFBE0B'],
        angle: 45,
      },
      animation: 'fadeIn',
      animationDuration: 1,
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
        }
      : {
          ...defaultTemplate,
          id: `text-${Date.now()}`,
        };

    setTextElements([...textElements, newText]);
    setSelectedTextId(newText.id);
  };

  const handleUpdateText = (id: string, updates: Partial<TextElement>) => {
    setTextElements(
      textElements.map((text) =>
        text.id === id ? { ...text, ...updates } : text
      )
    );
  };

  const handleDeleteText = (id: string) => {
    setTextElements(textElements.filter((text) => text.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const handleDuplicateText = (textToDuplicate: TextElement) => {
    const newText: TextElement = {
      ...textToDuplicate,
      id: `text-${Date.now()}`,
      position: {
        x: textToDuplicate.position.x + 5,
        y: textToDuplicate.position.y + 5,
      },
    };
    setTextElements([...textElements, newText]);
    setSelectedTextId(newText.id);
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
    if (!selectedTextId) return;

    const preset = TEXT_STYLE_PRESETS.find(p => p.name === presetName);
    if (!preset) return;

    const updates: Partial<TextElement> = {
      fontFamily: preset.settings.fontFamily,
      fontSize: preset.settings.fontSize,
      bold: preset.settings.bold,
      color: preset.settings.color,
      letterSpacing: preset.settings.letterSpacing,
    };

    if (preset.settings.shadow) {
      updates.shadow = preset.settings.shadow;
    }
    if (preset.settings.stroke) {
      updates.stroke = preset.settings.stroke;
    }
    if (preset.settings.background) {
      updates.background = preset.settings.background;
    }
    if (preset.settings.gradient) {
      updates.gradient = preset.settings.gradient;
    }

    handleUpdateText(selectedTextId, updates);
  };

  const handleRefresh = () => {
    // Restart video and replay non-marquee animations
    if (videoRef) {
      videoRef.currentTime = 0;
      videoRef.play();
    }
    
    // Only update keys for non-marquee text elements to replay their animations
    setTextElements(prev => prev.map(text => {
      const isMarquee = text.animation === 'marqueeLeft' || text.animation === 'marqueeRight';
      // For non-marquee animations, we could add a timestamp to force replay
      // But since we're using stable keys for marquees, we need a different approach
      return text;
    }));
    
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

  return (
    <div className="h-screen bg-black flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
      {/* Control Panel */}
      <div className="lg:w-96 flex-shrink-0 flex flex-col gap-4">
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
              selectedTextId={selectedTextId}
              onAddText={handleAddText}
              onUpdateText={handleUpdateText}
              onDeleteText={handleDeleteText}
              onDuplicateText={handleDuplicateText}
              onSelectText={setSelectedTextId}
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
        </div>

        <div className="w-full max-w-md h-full rounded-2xl overflow-hidden shadow-2xl">
          <VideoPlayer
            videoUrl={selectedVideo.src}
            textElements={textElements}
            selectedTextId={selectedTextId}
            onTextPositionChange={handleTextPositionChange}
            onSelectText={setSelectedTextId}
            onUpdateText={handleUpdateText}
            onVideoReady={setVideoRef}
            refreshTrigger={refreshKey}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
