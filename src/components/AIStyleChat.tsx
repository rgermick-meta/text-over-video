import React, { useState, useRef, useEffect } from 'react';
import { TextElement } from '../types';
import { interpretStyleRequest, refineStyleWithFeedback, analyzeVideoFrame } from '../utils/llmStyleService';
import { loadGoogleFont } from '../utils/googleFonts';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  confidence?: number;
  suggestedPreset?: string;
  updates?: Partial<TextElement>;
  action?: 'duplicate';
  timestamp: Date;
}

interface AIStyleChatProps {
  selectedTextIds: string[];
  textElements: TextElement[];
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
  onDuplicateText?: (text: TextElement) => void;
  videoTitle?: string;
  videoElement?: HTMLVideoElement | null;
}

export const AIStyleChat: React.FC<AIStyleChatProps> = ({
  selectedTextIds,
  textElements,
  onUpdateText,
  onDuplicateText,
  videoTitle,
  videoElement
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '👋 Hi! I can help you style your text with natural language. Try saying things like:\n\n• "Make it bigger and bold"\n• "Match the color of the alien"\n• "Position above the astronaut"\n• "Translate to Spanish"\n• "Use colors from the video"\n• "Duplicate this"\n\nSelect a text element to get started!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAnalyzedRef = useRef<string | null>(null); // Track which video was last analyzed

  const selectedText = selectedTextIds.length === 1 
    ? textElements.find(t => t.id === selectedTextIds[0]) 
    : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset video analysis when video changes
  useEffect(() => {
    if (videoTitle && hasAnalyzedRef.current !== videoTitle) {
      console.log('🎥 Video changed to:', videoTitle);
      setVideoAnalysis(null);
      setIsAnalyzingVideo(false);
      hasAnalyzedRef.current = null;
    }
  }, [videoTitle]);

  // Analyze video when it becomes available (runs once per video)
  useEffect(() => {
    const analyzeVideo = async () => {
      // Only analyze if we have a video element, haven't analyzed this video yet, and aren't currently analyzing
      if (videoElement && videoTitle && hasAnalyzedRef.current !== videoTitle && !isAnalyzingVideo) {
        setIsAnalyzingVideo(true);
        console.log('🎬 Starting analysis for:', videoTitle);
        console.log('Video element:', videoElement);
        console.log('Current readyState:', videoElement.readyState);
        console.log('Current dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
        
        try {
          const analysis = await analyzeVideoFrame(videoElement);
          setVideoAnalysis(analysis);
          hasAnalyzedRef.current = videoTitle; // Mark this video as analyzed
          console.log('✅ Video analysis complete for:', videoTitle);
          console.log('📊 Full analysis:', analysis);
          
          // Show success message inline in chat
          addMessage({
            type: 'system',
            content: `🎬 Video analyzed! I can now help with colors and positioning based on what's in "${videoTitle}".`
          });
        } catch (error) {
          console.error('❌ Failed to analyze video:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setVideoAnalysis(`Error: ${errorMessage}`);
          hasAnalyzedRef.current = `error-${videoTitle}`; // Mark as attempted to prevent retries
          
          // Show error message inline in chat
          addMessage({
            type: 'system',
            content: `⚠️ Could not analyze video: ${errorMessage}`
          });
        } finally {
          setIsAnalyzingVideo(false);
        }
      }
    };

    // Add a small delay to allow video to start loading
    const timeoutId = setTimeout(analyzeVideo, 500);
    return () => clearTimeout(timeoutId);
  }, [videoElement, videoTitle]); // Only depend on videoElement and videoTitle

  // Dynamic suggestions based on current text state and conversation history
  const getSmartSuggestions = (): string[] => {
    if (!selectedText) {
      return ['Select a text element first'];
    }

    const suggestions: string[] = [];
    
    // Video-aware suggestions if analysis is available
    if (videoAnalysis) {
      suggestions.push('Match video colors');
      suggestions.push('Use dominant color');
    }
    const recentMessages = messages.filter(m => m.type === 'user').slice(-3);
    const recentRequests = recentMessages.map(m => m.content.toLowerCase());

    // Context-aware text formatting - suggest opposite of current state
    if (selectedText.bold && !recentRequests.some(r => r.includes('bold'))) {
      suggestions.push('Remove bold');
    } else if (!selectedText.bold && !recentRequests.some(r => r.includes('bold'))) {
      suggestions.push('Make it bold');
    }

    if (selectedText.italic && !recentRequests.some(r => r.includes('italic'))) {
      suggestions.push('Remove italic');
    } else if (!selectedText.italic && !recentRequests.some(r => r.includes('italic'))) {
      suggestions.push('Make it italic');
    }

    if (selectedText.underline && !recentRequests.some(r => r.includes('underline'))) {
      suggestions.push('Remove underline');
    } else if (!selectedText.underline && !recentRequests.some(r => r.includes('underline'))) {
      suggestions.push('Add underline');
    }

    // Size adjustments based on context
    if (!recentRequests.some(r => r.includes('bigger') || r.includes('larger'))) {
      if (selectedText.fontSize < 60) {
        suggestions.push('Make it bigger');
      }
    }
    if (!recentRequests.some(r => r.includes('smaller'))) {
      if (selectedText.fontSize > 40) {
        suggestions.push('Make it smaller');
      }
    }

    // Effects - context-aware (add vs remove)
    if (selectedText.shadow.enabled && !recentRequests.some(r => r.includes('shadow') || r.includes('glow'))) {
      suggestions.push('Remove shadow');
    } else if (!selectedText.shadow.enabled && !recentRequests.some(r => r.includes('glow') || r.includes('shadow'))) {
      suggestions.push('Add a glow effect');
    }

    if (selectedText.stroke.enabled && !recentRequests.some(r => r.includes('outline') || r.includes('stroke'))) {
      suggestions.push('Remove outline');
    } else if (!selectedText.stroke.enabled && !recentRequests.some(r => r.includes('outline') || r.includes('stroke'))) {
      suggestions.push('Add an outline');
    }

    if (selectedText.background.enabled) {
      if (selectedText.background.gradient?.enabled && !recentRequests.some(r => r.includes('background'))) {
        suggestions.push('Remove background');
      } else if (!selectedText.background.gradient?.enabled && !recentRequests.some(r => r.includes('gradient'))) {
        suggestions.push('Make background gradient');
      }
    } else if (!selectedText.background.enabled && !recentRequests.some(r => r.includes('background'))) {
      suggestions.push('Add a background');
    }

    if (selectedText.gradient.enabled && !recentRequests.some(r => r.includes('gradient'))) {
      suggestions.push('Remove text gradient');
    } else if (!selectedText.gradient.enabled && !recentRequests.some(r => r.includes('gradient'))) {
      suggestions.push('Add text gradient');
    }

    // Alignment suggestions - context-aware
    if (selectedText.textAlign !== 'center' && !recentRequests.some(r => r.includes('align') || r.includes('center'))) {
      suggestions.push('Center align');
    } else if (selectedText.textAlign === 'center' && !recentRequests.some(r => r.includes('align'))) {
      suggestions.push('Align left');
    }

    // Opacity suggestions
    if (selectedText.opacity < 1 && !recentRequests.some(r => r.includes('opacity') || r.includes('transparent'))) {
      suggestions.push('Make fully opaque');
    }

    // Letter spacing suggestions
    if (selectedText.letterSpacing === 0 && !recentRequests.some(r => r.includes('spacing') || r.includes('letter'))) {
      suggestions.push('Add letter spacing');
    } else if (selectedText.letterSpacing > 0 && !recentRequests.some(r => r.includes('spacing'))) {
      suggestions.push('Tighter letter spacing');
    }

    // Animation suggestions
    if (selectedText.animation !== 'none' && !recentRequests.some(r => r.includes('animation'))) {
      suggestions.push('Remove animation');
    } else if (selectedText.animation === 'none' && !recentRequests.some(r => r.includes('animation') || r.includes('fade') || r.includes('slide'))) {
      suggestions.push('Add fade in animation');
    }

    // Rotation suggestions
    if (selectedText.rotation !== 0 && !recentRequests.some(r => r.includes('rotation') || r.includes('rotate') || r.includes('tilt'))) {
      suggestions.push('Reset rotation');
    }

    // Style presets based on current state
    if (selectedText.fontSize < 50 && !selectedText.bold) {
      suggestions.push('Movie title style');
    }

    if (selectedText.shadow.enabled || selectedText.stroke.enabled) {
      if (!selectedText.gradient.enabled) {
        suggestions.push('Add neon colors');
      }
    }

    // Font changes
    const modernFonts = ['Poppins', 'Montserrat', 'Inter', 'Raleway', 'Work Sans'];
    const displayFonts = ['Bebas Neue', 'Anton', 'Righteous', 'Oswald'];
    if (!modernFonts.includes(selectedText.fontFamily) && !displayFonts.includes(selectedText.fontFamily)) {
      suggestions.push('Use modern font');
    }

    // Color suggestions based on current color
    if (selectedText.color === '#ffffff' || selectedText.color === '#FFFFFF' || selectedText.color === '#fff') {
      suggestions.push('Make it colorful');
    }

    // If we have multiple effects, suggest simplifying
    const effectCount = [
      selectedText.shadow.enabled,
      selectedText.stroke.enabled,
      selectedText.background.enabled,
      selectedText.gradient.enabled,
      selectedText.bold,
      selectedText.italic,
      selectedText.underline
    ].filter(Boolean).length;

    if (effectCount >= 4) {
      suggestions.push('Make it cleaner');
    }

    // Always include a style preset option if we don't have many suggestions
    if (suggestions.length < 8) {
      suggestions.push('Professional style');
    }

    // Limit to 6 suggestions and prioritize earlier suggestions
    return suggestions.slice(0, 6);
  };

  const quickSuggestions = getSmartSuggestions();

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    }]);
  };

  const handleRequest = async (requestText?: string) => {
    const request = requestText || input;
    if (!request.trim()) return;

    if (!selectedText) {
      addMessage({
        type: 'system',
        content: '⚠️ Please select a text element first!'
      });
      return;
    }

    // Add user message
    addMessage({
      type: 'user',
      content: request
    });

    setInput('');
    setIsProcessing(true);

    try {
      console.log('🤖 Sending request to AI...');
      console.log('Request:', request);
      console.log('Video analysis available:', !!videoAnalysis);
      if (videoAnalysis) {
        console.log('📊 Passing video analysis to AI:', videoAnalysis.substring(0, 100) + '...');
      }
      
      const result = await interpretStyleRequest(request, selectedText, {
        videoTitle,
        otherElements: textElements,
        previousRequest: messages
          .filter(m => m.type === 'user')
          .slice(-1)[0]?.content,
        videoAnalysis: videoAnalysis || undefined
      });

      setLastResult(result);

      // If confidence is low, ask for clarification
      if (result.confidence < 50 && result.clarificationNeeded) {
        addMessage({
          type: 'assistant',
          content: `🤔 ${result.clarificationNeeded}`,
          confidence: result.confidence
        });
        setIsProcessing(false);
        return;
      }

      // Handle duplicate action
      console.log('🔍 Checking action:', result.action);
      if (result.action === 'duplicate') {
        console.log('✅ Duplicate action detected!');
        if (onDuplicateText) {
          console.log('📋 Calling onDuplicateText...');
          onDuplicateText(selectedText);
          addMessage({
            type: 'assistant',
            content: `✨ ${result.explanation}`,
            confidence: result.confidence,
            action: result.action
          });
        } else {
          console.log('❌ onDuplicateText not provided');
          addMessage({
            type: 'system',
            content: '⚠️ Duplicate feature is not available in this context.'
          });
        }
      } else {
        // If preset suggested, mention it
        if (result.suggestedPreset) {
          addMessage({
            type: 'assistant',
            content: `✨ ${result.explanation}\n\n💡 This matches the "${result.suggestedPreset}" preset!`,
            confidence: result.confidence,
            suggestedPreset: result.suggestedPreset,
            updates: result.updates
          });
        } else {
          addMessage({
            type: 'assistant',
            content: `✨ ${result.explanation}`,
            confidence: result.confidence,
            updates: result.updates
          });
        }

        // Load font if it's being changed
        if (result.updates.fontFamily) {
          console.log('Loading font:', result.updates.fontFamily);
          loadGoogleFont(result.updates.fontFamily);
        }

        // Apply the changes
        console.log('Applying updates:', result.updates);
        onUpdateText(selectedText.id, result.updates);
      }

    } catch (error) {
      addMessage({
        type: 'system',
        content: `❌ ${error instanceof Error ? error.message : 'Failed to process request'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefinement = async (feedback: string) => {
    if (!lastResult || !selectedText) return;

    setIsProcessing(true);
    try {
      const lastUserMessage = messages.filter(m => m.type === 'user').slice(-1)[0];
      const refined = await refineStyleWithFeedback(
        lastUserMessage.content,
        selectedText,
        feedback,
        lastResult
      );
      
      setLastResult(refined);
      
      addMessage({
        type: 'assistant',
        content: `✨ ${refined.explanation}`,
        confidence: refined.confidence,
        updates: refined.updates
      });

      // Load font if it's being changed
      if (refined.updates.fontFamily) {
        loadGoogleFont(refined.updates.fontFamily);
      }

      onUpdateText(selectedText.id, refined.updates);
    } catch (error) {
      addMessage({
        type: 'system',
        content: '❌ Failed to refine. Please try a new request.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if the last update contains numerical properties that can be refined
  const hasNumericalUpdates = (updates: any): boolean => {
    if (!updates) return false;
    
    const numericalProps = [
      'fontSize', 
      'letterSpacing', 
      'lineHeight', 
      'opacity', 
      'rotation', 
      'width',
      'animationDuration'
    ];
    
    // Check direct numerical properties
    if (numericalProps.some(prop => updates[prop] !== undefined)) {
      return true;
    }
    
    // Check nested numerical properties
    if (updates.shadow && (
      updates.shadow.offsetX !== undefined || 
      updates.shadow.offsetY !== undefined || 
      updates.shadow.blur !== undefined
    )) {
      return true;
    }
    
    if (updates.stroke?.width !== undefined) {
      return true;
    }
    
    if (updates.background && (
      updates.background.borderRadius !== undefined ||
      updates.background.padding !== undefined ||
      updates.background.opacity !== undefined ||
      updates.background.stroke?.width !== undefined
    )) {
      return true;
    }
    
    if (updates.extrusion && (
      updates.extrusion.depth !== undefined ||
      updates.extrusion.angle !== undefined
    )) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="bg-gray-800 rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h4 className="text-white font-bold text-xl mb-2">Style Assistant</h4>
        <p className="text-gray-400 text-sm">Describe the style you want in plain English</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : message.type === 'system'
                  ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-line text-sm">{message.content}</div>
              {message.confidence !== undefined && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <span className={`text-xs ${
                    message.confidence >= 80 ? 'text-green-300' :
                    message.confidence >= 60 ? 'text-yellow-300' :
                    'text-red-300'
                  }`}>
                    {message.confidence}% confident
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-gray-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (shown after AI response with numerical updates) */}
      {lastResult && messages.slice(-1)[0]?.type === 'assistant' && !isProcessing && hasNumericalUpdates(lastResult.updates) && (
        <div className="px-6 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleRefinement('too_much')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-2 rounded-lg transition-colors"
            >
              Too Much
            </button>
            <button
              onClick={() => handleRefinement('too_little')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-2 rounded-lg transition-colors"
            >
              Too Little
            </button>
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {!isProcessing && selectedText && (
        <div className="px-6 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                onClick={() => handleRequest(suggestion)}
                disabled={!selectedText || suggestion === 'Select a text element first'}
                className="bg-gray-700/80 hover:bg-gray-600 text-purple-300 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/20 hover:border-purple-400/40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-gray-700">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isProcessing) {
                handleRequest();
              }
            }}
            placeholder={selectedText ? "Describe what you want..." : "Select a text element first..."}
            disabled={isProcessing || !selectedText}
            className="w-full bg-gray-700 text-white px-4 py-3 pr-12 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleRequest()}
            disabled={isProcessing || !input.trim() || !selectedText}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        {!selectedText && (
          <p className="text-xs text-yellow-400 mt-2">
            ⚠️ Select a text element to start styling
          </p>
        )}
      </div>
    </div>
  );
};

