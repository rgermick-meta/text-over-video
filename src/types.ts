export interface RiveAnimation {
  id: string;
  name: string;
  src: string;
  thumbnail: string;
  artboard?: string;
  stateMachine?: string;
}

export interface VideoClip {
  id: string;
  name: string;
  src: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
}

export type TextAnimation = 'none' | 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'bounce' | 'zoom' | 'pulse' | 'marqueeLeft' | 'marqueeRight';

export interface TextElement {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textAlign: 'left' | 'center' | 'right';
  position: {
    x: number; // percentage
    y: number; // percentage
  };
  width: number; // pixels
  rotation: number;
  opacity: number;
  letterSpacing: number;
  lineHeight: number;
  visible: boolean;
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
  background: {
    enabled: boolean;
    color: string;
    padding: number;
    borderRadius: number;
    opacity?: number;
    gradient?: {
      enabled: boolean;
      colors: [string, string];
      angle: number;
    };
    stroke?: {
      enabled: boolean;
      color: string;
      width: number;
    };
    shadow?: {
      enabled: boolean;
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
  };
  gradient: {
    enabled: boolean;
    colors: [string, string];
    angle: number;
  };
  animation: TextAnimation;
  animationDuration: number;
  animationDistance?: number; // percentage for directional animations (optional for backward compatibility)
}

