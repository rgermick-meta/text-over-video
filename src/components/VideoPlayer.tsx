import React, { useRef, useEffect, useState } from 'react';
import { TextElement } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  textElements: TextElement[];
  selectedTextId: string | null;
  onTextPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSelectText: (id: string | null) => void;
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
  onVideoReady?: (video: HTMLVideoElement) => void;
  refreshTrigger?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  textElements,
  selectedTextId,
  onTextPositionChange,
  onSelectText,
  onUpdateText,
  onVideoReady,
  refreshTrigger = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editRef = useRef<HTMLDivElement>(null);

  const [videoLoopCount, setVideoLoopCount] = useState(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video autoplay failed:', error);
      });
      
      // Pass video ref to parent
      if (onVideoReady) {
        onVideoReady(videoRef.current);
      }

      // Listen for video loop events to replay non-marquee animations
      const video = videoRef.current;
      const handleTimeUpdate = () => {
        // Detect when video loops (time jumps backwards significantly)
        if (lastTimeRef.current > video.currentTime + 0.5) {
          // Video just looped, increment counter to replay non-marquee animations
          setVideoLoopCount(prev => prev + 1);
        }
        lastTimeRef.current = video.currentTime;
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [onVideoReady]);

  const handleMouseDown = (e: React.MouseEvent, textId: string, textPosition: { x: number; y: number }) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setDraggingId(textId);
    setDragOffset({
      x: clickX - textPosition.x,
      y: clickY - textPosition.y,
    });
    onSelectText(textId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
      const y = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

      onTextPositionChange(draggingId, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    }

    if (resizingId && containerRef.current) {
      const deltaX = e.clientX - resizeStartX;
      const newWidth = Math.max(50, resizeStartWidth + deltaX);
      onUpdateText(resizingId, { width: newWidth });
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
  };

  const handleResizeStart = (e: React.MouseEvent, textId: string, currentWidth: number) => {
    e.stopPropagation();
    setResizingId(textId);
    setResizeStartWidth(currentWidth);
    setResizeStartX(e.clientX);
    onSelectText(textId);
  };

  const handleDoubleClick = (e: React.MouseEvent, textId: string) => {
    e.stopPropagation();
    setEditingId(textId);
    onSelectText(textId);
    // Focus and select text after render
    setTimeout(() => {
      if (editRef.current) {
        editRef.current.focus();
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(editRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  };

  const handleSaveEdit = (textId: string) => {
    if (editRef.current) {
      const trimmedContent = editRef.current.textContent?.trim() || '';
      if (trimmedContent) {
        onUpdateText(textId, { text: trimmedContent });
      }
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const getContainerStyles = (text: TextElement): React.CSSProperties => {
    const isMarquee = text.animation === 'marqueeLeft' || text.animation === 'marqueeRight';
    
    const styles: React.CSSProperties & { [key: string]: any } = {
      position: 'absolute',
      left: isMarquee ? '0' : `${text.position.x}%`,
      top: `${text.position.y}%`,
      transform: isMarquee ? 'translateY(-50%)' : `translate(-50%, -50%) rotate(${text.rotation}deg)`,
      opacity: text.opacity,
      cursor: 'move',
      userSelect: 'none',
      width: isMarquee ? '100%' : `${text.width}px`,
      display: text.visible ? 'block' : 'none',
      '--rotation': `${text.rotation}deg`,
      overflow: isMarquee ? 'hidden' : 'visible',
    };

    // For marquee, apply background to the full-width container
    if (isMarquee && text.background.enabled) {
      styles.backgroundColor = text.background.color;
      styles.padding = `${text.background.padding}px 0`;
    }

    return styles;
  };

  const getMarqueeWrapperStyles = (text: TextElement): React.CSSProperties => {
    const styles: React.CSSProperties & { [key: string]: any } = {
      display: 'inline-flex',
      animation: `${text.animation} ${text.animationDuration}s linear infinite`,
      '--rotation': `${text.rotation}deg`,
    };
    return styles;
  };

  const getTextContentStyles = (text: TextElement): React.CSSProperties => {
    // For marquee animations, only break on explicit line breaks
    const isMarquee = text.animation === 'marqueeLeft' || text.animation === 'marqueeRight';
    
    const styles: React.CSSProperties & { [key: string]: any } = {
      fontFamily: text.fontFamily,
      fontSize: `${text.fontSize}px`,
      fontWeight: text.bold ? 'bold' : 'normal',
      fontStyle: text.italic ? 'italic' : 'normal',
      textDecoration: text.underline ? 'underline' : 'none',
      textAlign: text.textAlign,
      letterSpacing: `${text.letterSpacing}px`,
      lineHeight: text.lineHeight,
      whiteSpace: isMarquee ? 'pre' : 'pre-wrap',
      wordWrap: isMarquee ? 'normal' : 'break-word',
    };

    // For marquee, make it inline-block with margin for spacing between duplicates
    if (isMarquee) {
      styles.display = 'inline-block';
      styles.marginRight = '50px'; // Space between duplicate text copies
    }

    // Gradient text
    if (text.gradient.enabled) {
      styles.background = `linear-gradient(${text.gradient.angle}deg, ${text.gradient.colors[0]}, ${text.gradient.colors[1]})`;
      styles.WebkitBackgroundClip = 'text';
      styles.WebkitTextFillColor = 'transparent';
      styles.backgroundClip = 'text';
      // Ensure the background size covers the text
      styles.backgroundSize = '100%';
      styles.WebkitBoxDecorationBreak = 'clone';
    } else {
      styles.color = text.color;
    }

    // Text shadow
    if (text.shadow.enabled) {
      styles.textShadow = `${text.shadow.offsetX}px ${text.shadow.offsetY}px ${text.shadow.blur}px ${text.shadow.color}`;
    }

    // Text stroke
    if (text.stroke.enabled && !text.gradient.enabled) {
      styles.WebkitTextStroke = `${text.stroke.width}px ${text.stroke.color}`;
      styles.paintOrder = 'stroke fill';
    }

    // Background - only for non-marquee (marquee background is on container)
    if (text.background.enabled && !isMarquee) {
      styles.backgroundColor = text.background.color;
      styles.padding = `${text.background.padding}px`;
      styles.borderRadius = `${text.background.borderRadius}px`;
    }

    return styles;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full max-h-full bg-black overflow-hidden flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => onSelectText(null)}
    >
      <div className="relative w-full max-w-full max-h-full rounded-[20px] overflow-hidden" style={{ aspectRatio: '9/16' }}>
        {/* Base Video Layer */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
          loop
          playsInline
          muted
          autoPlay
        />

        {/* Text Overlays */}
        {textElements.map((text) => {
          // For marquee animations, use a stable key so animation doesn't restart
          // For other animations, include refreshTrigger and videoLoopCount to replay them
          const isMarquee = text.animation === 'marqueeLeft' || text.animation === 'marqueeRight';
          const elementKey = isMarquee 
            ? text.id 
            : `${text.id}-${text.animation}-${text.animationDuration}-${refreshTrigger}-${videoLoopCount}`;
          
          return (
          <div
            key={elementKey}
            style={getContainerStyles(text)}
            className="pointer-events-auto"
          >
            <div
              className={`relative transition-shadow ${
                selectedTextId === text.id ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-transparent shadow-lg' : ''
              }`}
              onMouseDown={(e) => !editingId && handleMouseDown(e, text.id, text.position)}
              onDoubleClick={(e) => handleDoubleClick(e, text.id)}
              onClick={(e) => {
                e.stopPropagation();
                if (!editingId) onSelectText(text.id);
              }}
            >
              {isMarquee && editingId !== text.id ? (
                // For marquee, render duplicated text in a wrapper with animation
                <div style={getMarqueeWrapperStyles(text)}>
                  <div style={getTextContentStyles(text)}>
                    {text.text}
                  </div>
                  <div style={getTextContentStyles(text)}>
                    {text.text}
                  </div>
                </div>
              ) : (
                // For non-marquee or when editing
                <div
                  ref={editingId === text.id ? editRef : null}
                  contentEditable={editingId === text.id}
                  suppressContentEditableWarning
                  onBlur={() => {
                    if (editingId === text.id) {
                      handleSaveEdit(text.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (editingId === text.id) {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelEdit();
                      } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSaveEdit(text.id);
                      }
                    }
                  }}
                  style={{
                    ...getTextContentStyles(text),
                    outline: editingId === text.id ? '2px solid rgba(236, 72, 153, 0.5)' : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  {text.text}
                </div>
              )}
              
              {/* Resize handles - always reserve space */}
              {selectedTextId === text.id && !editingId && (
                <>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, text.id, text.width)}
                    style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      background: '#ec4899',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'ew-resize',
                      zIndex: 10,
                    }}
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, text.id, text.width)}
                    style={{
                      position: 'absolute',
                      left: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      background: '#ec4899',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'ew-resize',
                      zIndex: 10,
                    }}
                  />
                </>
              )}
            </div>
          </div>
          );
        })}

      </div>
    </div>
  );
};

