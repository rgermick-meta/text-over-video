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
  const [resizeSide, setResizeSide] = useState<'left' | 'right'>('right');
  const [editingId, setEditingId] = useState<string | null>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [rotationCenter, setRotationCenter] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
      // For left handle, invert the delta (dragging left increases width)
      const adjustedDelta = resizeSide === 'left' ? -deltaX : deltaX;
      const newWidth = Math.max(50, resizeStartWidth + adjustedDelta);
      onUpdateText(resizingId, { width: newWidth });
    }

    if (rotatingId && containerRef.current) {
      // Calculate angle between center point and mouse position
      const deltaX = e.clientX - rotationCenter.x;
      const deltaY = e.clientY - rotationCenter.y;
      // Calculate angle in degrees (0° is right, 90° is down)
      // We adjust by -90° so that 0° is up
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
      onUpdateText(rotatingId, { rotation: Math.round(angle) });
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
    setRotatingId(null);
  };

  const handleResizeStart = (e: React.MouseEvent, textId: string, currentWidth: number, side: 'left' | 'right') => {
    e.stopPropagation();
    setResizingId(textId);
    setResizeStartWidth(currentWidth);
    setResizeStartX(e.clientX);
    setResizeSide(side);
    onSelectText(textId);
  };

  const handleRotateStart = (e: React.MouseEvent, textId: string) => {
    e.stopPropagation();
    if (containerRef.current) {
      // Get the center point of the text element
      const target = e.currentTarget.parentElement;
      if (target) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setRotationCenter({ x: centerX, y: centerY });
        setRotatingId(textId);
        onSelectText(textId);
      }
    }
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
      // Convert HTML content to text while preserving line breaks
      let content = editRef.current.innerHTML;
      // Replace <br> tags with newlines
      content = content.replace(/<br\s*\/?>/gi, '\n');
      // Replace </div><div> with newlines (some browsers use divs for line breaks)
      content = content.replace(/<\/div><div>/gi, '\n');
      // Remove all other HTML tags
      content = content.replace(/<[^>]*>/g, '');
      // Decode HTML entities
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      content = tempDiv.textContent || tempDiv.innerText || '';
      
      const trimmedContent = content.trim();
      if (trimmedContent) {
        onUpdateText(textId, { text: trimmedContent });
      }
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Convert newlines to <br> tags for contentEditable display
  const textToHtml = (text: string) => {
    return text.replace(/\n/g, '<br>');
  };

  const getContainerStyles = (text: TextElement): React.CSSProperties => {
    const isMarquee = text.animation === 'marqueeLeft' || text.animation === 'marqueeRight';
    
    // Apply rotation to container for all text types
    let transform = '';
    if (isMarquee) {
      transform = text.rotation !== 0 
        ? `translateY(-50%) rotate(${text.rotation}deg)` 
        : 'translateY(-50%)';
    } else {
      // For non-marquee, apply both centering and rotation
      transform = text.rotation !== 0
        ? `translate(-50%, -50%) rotate(${text.rotation}deg)`
        : 'translate(-50%, -50%)';
    }
    
    const styles: React.CSSProperties & { [key: string]: any } = {
      position: 'absolute',
      left: isMarquee ? '0' : `${text.position.x}%`,
      top: `${text.position.y}%`,
      transform,
      opacity: text.opacity,
      cursor: 'move',
      userSelect: 'none',
      width: isMarquee ? '100%' : `${text.width}px`,
      display: text.visible ? 'block' : 'none',
      overflow: isMarquee ? 'hidden' : 'visible',
    };

    // For marquee, apply background to the full-width container
    if (isMarquee && text.background.enabled) {
      const opacity = text.background.opacity ?? 0.5;
      
      // Check if gradient is enabled
      if (text.background.gradient?.enabled) {
        // Apply gradient background with opacity
        const color1 = text.background.gradient.colors[0];
        const color2 = text.background.gradient.colors[1];
        const angle = text.background.gradient.angle;
        
        // Convert hex colors to rgba with opacity
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        styles.background = `linear-gradient(${angle}deg, rgba(${r1}, ${g1}, ${b1}, ${opacity}), rgba(${r2}, ${g2}, ${b2}, ${opacity}))`;
      } else {
        // Apply solid color with opacity
        const hexColor = text.background.color;
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        styles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      
      styles.padding = `${text.background.padding}px 0`;
      
      // Background stroke (border) for marquee
      if (text.background.stroke?.enabled) {
        styles.borderTop = `${text.background.stroke.width}px solid ${text.background.stroke.color}`;
        styles.borderBottom = `${text.background.stroke.width}px solid ${text.background.stroke.color}`;
      }
      
      // Background shadow (box-shadow) for marquee
      if (text.background.shadow?.enabled) {
        styles.boxShadow = `${text.background.shadow.offsetX}px ${text.background.shadow.offsetY}px ${text.background.shadow.blur}px ${text.background.shadow.color}`;
      }
    }

    return styles;
  };

  const getMarqueeWrapperStyles = (text: TextElement): React.CSSProperties => {
    const styles: React.CSSProperties & { [key: string]: any } = {
      display: 'inline-flex',
      animation: `${text.animation} ${text.animationDuration}s linear infinite`,
      whiteSpace: 'nowrap',
      willChange: 'transform',
    };
    return styles;
  };

  // Get styles for the background wrapper (padding, border, shadow, background color/gradient)
  const getBackgroundWrapperStyles = (text: TextElement): React.CSSProperties => {
    const isMarquee = text.animation === 'marqueeLeft' || text.animation === 'marqueeRight';
    const styles: React.CSSProperties = {
      display: 'block',
      width: '100%',
      position: 'relative',
    };
    
    // Rotation is now handled by the container, not here

    // Background - only for non-marquee (marquee background is on container)
    if (text.background.enabled && !isMarquee) {
      const opacity = text.background.opacity ?? 0.5;
      
      // If text gradient is also enabled, we need to handle layering differently
      // Use a pseudo-element via a wrapper approach instead
      if (!text.gradient.enabled) {
        // Only apply background directly if no text gradient
        if (text.background.gradient?.enabled) {
          // Apply gradient background with opacity
          const color1 = text.background.gradient.colors[0];
          const color2 = text.background.gradient.colors[1];
          const angle = text.background.gradient.angle;
          
          // Convert hex colors to rgba with opacity
          const r1 = parseInt(color1.slice(1, 3), 16);
          const g1 = parseInt(color1.slice(3, 5), 16);
          const b1 = parseInt(color1.slice(5, 7), 16);
          const r2 = parseInt(color2.slice(1, 3), 16);
          const g2 = parseInt(color2.slice(3, 5), 16);
          const b2 = parseInt(color2.slice(5, 7), 16);
          
          styles.background = `linear-gradient(${angle}deg, rgba(${r1}, ${g1}, ${b1}, ${opacity}), rgba(${r2}, ${g2}, ${b2}, ${opacity}))`;
        } else {
          // Apply solid color with opacity
          const hexColor = text.background.color;
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);
          styles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
      }
      
      styles.padding = `${text.background.padding}px`;
      styles.borderRadius = `${text.background.borderRadius}px`;
      
      // Background stroke (border)
      if (text.background.stroke?.enabled) {
        styles.border = `${text.background.stroke.width}px solid ${text.background.stroke.color}`;
      }
      
      // Background shadow (box-shadow)
      if (text.background.shadow?.enabled) {
        styles.boxShadow = `${text.background.shadow.offsetX}px ${text.background.shadow.offsetY}px ${text.background.shadow.blur}px ${text.background.shadow.color}`;
      }
    }

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
      styles.paddingRight = '30px'; // Space between duplicate text copies
    }

    // Apply non-marquee animations
    if (!isMarquee && text.animation !== 'none') {
      // Pulse and bounce should loop infinitely
      const shouldLoop = text.animation === 'pulse' || text.animation === 'bounce';
      styles.animation = `${text.animation} ${text.animationDuration}s ease-out ${shouldLoop ? 'infinite' : ''}`;
      styles.animationFillMode = 'both';
      // Set animation distance and rotation for animations
      styles['--animation-distance'] = `${text.animationDistance || 100}%`;
      styles['--rotation'] = `${text.rotation}deg`;
    }
    // Note: Rotation is always handled by the container, not by text content styles

    // Gradient text
    if (text.gradient.enabled) {
      styles.backgroundImage = `linear-gradient(${text.gradient.angle}deg, ${text.gradient.colors[0]}, ${text.gradient.colors[1]})`;
      styles.WebkitBackgroundClip = 'text';
      styles.backgroundClip = 'text';
      styles.WebkitTextFillColor = 'transparent';
      styles.color = 'transparent';
      styles.backgroundSize = '100% 100%';
      styles.backgroundRepeat = 'no-repeat';
      // Remove box-decoration-break so gradient flows across entire text
      
      // When gradient is enabled, use filter drop-shadow instead of text-shadow
      if (text.shadow.enabled) {
        styles.filter = `drop-shadow(${text.shadow.offsetX}px ${text.shadow.offsetY}px ${text.shadow.blur}px ${text.shadow.color})`;
      }
    } else {
      styles.color = text.color;
      
      // Text shadow (only works without gradient)
      if (text.shadow.enabled) {
        styles.textShadow = `${text.shadow.offsetX}px ${text.shadow.offsetY}px ${text.shadow.blur}px ${text.shadow.color}`;
      }
    }

    // Text stroke
    if (text.stroke.enabled && !text.gradient.enabled) {
      styles.WebkitTextStroke = `${text.stroke.width}px ${text.stroke.color}`;
      styles.paintOrder = 'stroke fill';
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
          // Use stable keys to prevent animations from replaying on video loop
          // Only include refreshTrigger to replay on manual refresh
          const elementKey = `${text.id}-${text.animation}-${text.animationDuration}-${refreshTrigger}`;
          const isMarquee = text.animation === 'marqueeLeft' || text.animation === 'marqueeRight';
          
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
              onMouseEnter={() => setHoveredId(text.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {isMarquee && editingId !== text.id ? (
                // For marquee, render multiple copies for seamless looping
                <div style={getMarqueeWrapperStyles(text)}>
                  <div style={getTextContentStyles(text)}>
                    {text.text}
                  </div>
                  <div style={getTextContentStyles(text)}>
                    {text.text}
                  </div>
                  <div style={getTextContentStyles(text)}>
                    {text.text}
                  </div>
                  <div style={getTextContentStyles(text)}>
                    {text.text}
                  </div>
                </div>
              ) : (
                // For non-marquee or when editing
                // Only use wrapper when background is enabled to avoid gradient text issues
                text.background.enabled ? (
                  <div style={getBackgroundWrapperStyles(text)}>
                    {/* When both text and background gradients are enabled, add background layer */}
                    {text.gradient.enabled && text.background.gradient?.enabled && (() => {
                      const opacity = text.background.opacity ?? 0.5;
                      const color1 = text.background.gradient.colors[0];
                      const color2 = text.background.gradient.colors[1];
                      const angle = text.background.gradient.angle;
                      const r1 = parseInt(color1.slice(1, 3), 16);
                      const g1 = parseInt(color1.slice(3, 5), 16);
                      const b1 = parseInt(color1.slice(5, 7), 16);
                      const r2 = parseInt(color2.slice(1, 3), 16);
                      const g2 = parseInt(color2.slice(3, 5), 16);
                      const b2 = parseInt(color2.slice(5, 7), 16);
                      return (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(${angle}deg, rgba(${r1}, ${g1}, ${b1}, ${opacity}), rgba(${r2}, ${g2}, ${b2}, ${opacity}))`,
                          borderRadius: `${text.background.borderRadius}px`,
                          zIndex: -1,
                        }} />
                      );
                    })()}
                    {text.gradient.enabled && !text.background.gradient?.enabled && text.background.color && (() => {
                      const opacity = text.background.opacity ?? 0.5;
                      const hexColor = text.background.color;
                      const r = parseInt(hexColor.slice(1, 3), 16);
                      const g = parseInt(hexColor.slice(3, 5), 16);
                      const b = parseInt(hexColor.slice(5, 7), 16);
                      return (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
                          borderRadius: `${text.background.borderRadius}px`,
                          zIndex: -1,
                        }} />
                      );
                    })()}
                    {editingId === text.id ? (
                      <div
                        ref={editRef}
                        contentEditable={true}
                        suppressContentEditableWarning
                        onBlur={() => {
                          handleSaveEdit(text.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            handleCancelEdit();
                          } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSaveEdit(text.id);
                          }
                        }}
                        style={{
                          ...getTextContentStyles(text),
                          outline: '2px solid rgba(236, 72, 153, 0.5)',
                          outlineOffset: '2px',
                          position: 'relative',
                          zIndex: 1,
                        }}
                        dangerouslySetInnerHTML={{ __html: textToHtml(text.text) }}
                      />
                    ) : (
                      <div
                        style={{
                          ...getTextContentStyles(text),
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {text.text}
                      </div>
                    )}
                  </div>
                ) : editingId === text.id ? (
                  <div
                    ref={editRef}
                    contentEditable={true}
                    suppressContentEditableWarning
                    onBlur={() => {
                      handleSaveEdit(text.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelEdit();
                      } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSaveEdit(text.id);
                      }
                    }}
                    style={{
                      ...getTextContentStyles(text),
                      outline: '2px solid rgba(236, 72, 153, 0.5)',
                      outlineOffset: '2px',
                    }}
                    dangerouslySetInnerHTML={{ __html: textToHtml(text.text) }}
                  />
                ) : (
                  <div
                    style={{
                      ...getTextContentStyles(text),
                    }}
                  >
                    {text.text}
                  </div>
                )
              )}
              
              {/* Resize handles */}
              {selectedTextId === text.id && !editingId && (
                <>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, text.id, text.width, 'right')}
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
                    onMouseDown={(e) => handleResizeStart(e, text.id, text.width, 'left')}
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
              
              {/* Rotation handle - shows on hover or when rotating */}
              {(hoveredId === text.id || rotatingId === text.id) && selectedTextId === text.id && !editingId && (
                <>
                  {/* Invisible connector to prevent hover gap */}
                  <div
                    onMouseEnter={() => setHoveredId(text.id)}
                    style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '30px',
                      height: '30px',
                      zIndex: 9,
                      pointerEvents: 'auto',
                    }}
                  />
                  <div
                    onMouseDown={(e) => handleRotateStart(e, text.id)}
                    onMouseEnter={() => setHoveredId(text.id)}
                    style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '20px',
                      background: '#8b5cf6',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: rotatingId === text.id ? 'grabbing' : 'grab',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      pointerEvents: 'auto',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                  </div>
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

