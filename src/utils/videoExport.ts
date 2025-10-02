import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { TextElement } from '../types';

/**
 * Wait for a font to be loaded
 */
const waitForFont = async (fontFamily: string): Promise<void> => {
  try {
    await document.fonts.load(`16px "${fontFamily}"`);
  } catch (error) {
    console.warn(`Failed to load font: ${fontFamily}`);
  }
};

/**
 * Render a text element to a canvas with all styling applied
 */
const renderTextToCanvas = async (
  text: TextElement,
  canvasWidth: number,
  canvasHeight: number
): Promise<HTMLCanvasElement> => {
  // Ensure font is loaded before rendering
  await waitForFont(text.fontFamily);
  
  const canvas = document.createElement('canvas');
  
  // Set canvas size to video dimensions
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  const ctx = canvas.getContext('2d', { alpha: true })!;
  
  // Clear canvas (transparent background)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Calculate position
  const x = (text.position.x / 100) * canvasWidth;
  const y = (text.position.y / 100) * canvasHeight;
  
  // Save context for transformations
  ctx.save();
  
  // Apply rotation
  ctx.translate(x, y);
  ctx.rotate((text.rotation * Math.PI) / 180);
  
  // Set font properties
  const fontWeight = text.bold ? 'bold' : 'normal';
  const fontStyle = text.italic ? 'italic' : 'normal';
  ctx.font = `${fontStyle} ${fontWeight} ${text.fontSize}px "${text.fontFamily}", sans-serif`;
  ctx.letterSpacing = `${text.letterSpacing}px`;
  
  // Measure text for alignment
  const lines = text.text.split('\n');
  const lineHeight = text.fontSize * text.lineHeight;
  const totalHeight = lines.length * lineHeight;
  
  // Apply global opacity
  ctx.globalAlpha = text.opacity;
  
  lines.forEach((line, index) => {
    const metrics = ctx.measureText(line);
    const lineWidth = metrics.width;
    
    // Calculate x position based on alignment
    let lineX = 0;
    if (text.textAlign === 'center') {
      lineX = -lineWidth / 2;
    } else if (text.textAlign === 'right') {
      lineX = -lineWidth;
    }
    
    const lineY = (index * lineHeight) - (totalHeight / 2);
    
    // Draw background if enabled
    if (text.background.enabled) {
      ctx.save();
      
      const padding = text.background.padding;
      const bgX = lineX - padding;
      const bgY = lineY - text.fontSize + padding;
      const bgWidth = lineWidth + (padding * 2);
      const bgHeight = text.fontSize + (padding * 2);
      
      // Background shadow
      if (text.background.shadow?.enabled) {
        ctx.shadowColor = text.background.shadow.color;
        ctx.shadowBlur = text.background.shadow.blur;
        ctx.shadowOffsetX = text.background.shadow.offsetX;
        ctx.shadowOffsetY = text.background.shadow.offsetY;
      }
      
      // Background fill (solid or gradient)
      if (text.background.gradient?.enabled) {
        const angle = (text.background.gradient.angle * Math.PI) / 180;
        const x1 = bgX + Math.cos(angle) * bgWidth;
        const y1 = bgY + Math.sin(angle) * bgHeight;
        const gradient = ctx.createLinearGradient(bgX, bgY, x1, y1);
        gradient.addColorStop(0, text.background.gradient.colors[0]);
        gradient.addColorStop(1, text.background.gradient.colors[1]);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = text.background.color;
      }
      
      // Apply background opacity
      ctx.globalAlpha = (text.background.opacity ?? 0.5) * text.opacity;
      
      // Draw rounded rectangle
      const radius = text.background.borderRadius;
      ctx.beginPath();
      ctx.moveTo(bgX + radius, bgY);
      ctx.lineTo(bgX + bgWidth - radius, bgY);
      ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius);
      ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius);
      ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight);
      ctx.lineTo(bgX + radius, bgY + bgHeight);
      ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius);
      ctx.lineTo(bgX, bgY + radius);
      ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
      ctx.closePath();
      ctx.fill();
      
      // Background stroke
      if (text.background.stroke?.enabled) {
        ctx.strokeStyle = text.background.stroke.color;
        ctx.lineWidth = text.background.stroke.width;
        ctx.stroke();
      }
      
      ctx.restore();
      ctx.globalAlpha = text.opacity;
    }
    
    // Apply text shadow
    if (text.shadow.enabled && !text.gradient.enabled) {
      ctx.shadowColor = text.shadow.color;
      ctx.shadowBlur = text.shadow.blur;
      ctx.shadowOffsetX = text.shadow.offsetX;
      ctx.shadowOffsetY = text.shadow.offsetY;
    }
    
    // Draw text stroke (rounded corners using multiple shadows)
    if (text.stroke.enabled && !text.gradient.enabled) {
      const strokeWidth = text.stroke.width;
      const steps = Math.max(8, Math.round(strokeWidth * 3));
      
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // Create stroke effect using shadows
      for (let i = 0; i < steps; i++) {
        const angle = (i * 2 * Math.PI) / steps;
        const offsetX = Math.cos(angle) * strokeWidth;
        const offsetY = Math.sin(angle) * strokeWidth;
        
        ctx.save();
        ctx.shadowColor = text.stroke.color;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = offsetX;
        ctx.shadowOffsetY = offsetY;
        ctx.fillStyle = text.color;
        ctx.fillText(line, lineX, lineY);
        ctx.restore();
      }
    }
    
    // Draw main text
    if (text.gradient.enabled) {
      // Create gradient
      const angle = (text.gradient.angle * Math.PI) / 180;
      const x1 = lineX;
      const y1 = lineY - text.fontSize;
      const x2 = lineX + Math.cos(angle) * lineWidth;
      const y2 = lineY + Math.sin(angle) * text.fontSize;
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, text.gradient.colors[0]);
      gradient.addColorStop(1, text.gradient.colors[1]);
      ctx.fillStyle = gradient;
      
      // For gradient text with shadow, use a filter approach
      if (text.shadow.enabled) {
        ctx.save();
        ctx.shadowColor = text.shadow.color;
        ctx.shadowBlur = text.shadow.blur;
        ctx.shadowOffsetX = text.shadow.offsetX;
        ctx.shadowOffsetY = text.shadow.offsetY;
        ctx.fillText(line, lineX, lineY);
        ctx.restore();
      } else {
        ctx.fillText(line, lineX, lineY);
      }
    } else {
      ctx.fillStyle = text.color;
      ctx.fillText(line, lineX, lineY);
    }
  });
  
  ctx.restore();
  
  return canvas;
};

/**
 * Initialize FFmpeg instance
 */
export const loadFFmpeg = async (): Promise<FFmpeg> => {
  const ffmpeg = new FFmpeg();
  
  // Enable logging for debugging
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });
  
  try {
    console.log('Loading FFmpeg core files from local directory...');
    
    // Load ffmpeg.wasm from local files - use direct URLs
    await ffmpeg.load({
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm',
    });
    
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg loading failed:', error);
    throw new Error(`Failed to load FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Process video with text overlays using Canvas-rendered PNGs
 */
export const processVideoWithText = async (
  videoUrl: string,
  textElements: TextElement[],
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  console.log('Starting video processing...');
  const ffmpeg = await loadFFmpeg();
  console.log('FFmpeg loaded successfully');
  
  // Set up progress callback
  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }
  
  // Fetch input video
  console.log('Fetching video:', videoUrl);
  const videoData = await fetchFile(videoUrl);
  await ffmpeg.writeFile('input.mp4', videoData);
  console.log('Video written to FFmpeg filesystem');
  
  // Video dimensions (9:16 aspect ratio)
  const videoWidth = 1080;
  const videoHeight = 1920;
  
  // Filter only visible text elements
  const visibleTexts = textElements.filter(t => t.visible);
  
  if (visibleTexts.length === 0) {
    // No text overlays, just copy the video
    await ffmpeg.exec(['-i', 'input.mp4', '-c', 'copy', 'output.mp4']);
  } else {
    console.log(`Rendering ${visibleTexts.length} text overlay(s)...`);
    
    // Render each text element to a canvas and convert to PNG
    const overlayFiles: string[] = [];
    
    for (let i = 0; i < visibleTexts.length; i++) {
      const text = visibleTexts[i];
      console.log(`Rendering text ${i + 1}/${visibleTexts.length}: "${text.text.substring(0, 20)}..."`);
      
      const canvas = await renderTextToCanvas(text, videoWidth, videoHeight);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      // Write PNG to FFmpeg filesystem
      const filename = `overlay_${i}.png`;
      const arrayBuffer = await blob.arrayBuffer();
      await ffmpeg.writeFile(filename, new Uint8Array(arrayBuffer));
      overlayFiles.push(filename);
      console.log(`Overlay ${i + 1} written: ${filename} (${(blob.size / 1024).toFixed(2)} KB)`);
    }
    
    // Build FFmpeg filter complex for overlaying images
    // Chain overlay filters for each PNG
    let filterComplex = '';
    
    for (let i = 0; i < overlayFiles.length; i++) {
      const isLast = i === overlayFiles.length - 1;
      const inputLabel = i === 0 ? '0:v' : `v${i}`;
      const overlayInput = `${i + 1}:v`;
      const outputLabel = isLast ? '' : `v${i + 1}`;
      
      if (i > 0) filterComplex += ';';
      filterComplex += `[${inputLabel}][${overlayInput}]overlay=0:0`;
      if (!isLast) filterComplex += `[${outputLabel}]`;
    }
    
    // Build FFmpeg command
    const ffmpegArgs = [
      '-i', 'input.mp4',
      ...overlayFiles.flatMap(f => ['-i', f]),
      '-filter_complex', filterComplex,
      '-c:a', 'copy', // Copy audio without re-encoding
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p', // Ensure compatibility
      'output.mp4'
    ];
    
    console.log('Filter complex:', filterComplex);
    console.log('Processing video with FFmpeg...');
    
    // Process video with overlays
    await ffmpeg.exec(ffmpegArgs);
    
    console.log('Video processing complete!');
    
    // Clean up overlay files
    for (const file of overlayFiles) {
      await ffmpeg.deleteFile(file);
    }
  }
  
  // Read output file
  const data = await ffmpeg.readFile('output.mp4');
  
  // Clean up
  await ffmpeg.deleteFile('input.mp4');
  await ffmpeg.deleteFile('output.mp4');
  
  // Convert to blob
  return new Blob([data], { type: 'video/mp4' });
};

/**
 * Trigger download of video blob
 */
export const downloadVideo = (blob: Blob, filename: string = 'video-with-text.mp4') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

