export type AspectRatioId = 'poster' | 'story' | 'square' | 'landscape' | 'flyer';

export interface AspectRatioPreset {
  id: AspectRatioId;
  name: string;
  width: number;
  height: number;
  label: string;
}

export type ElementType = 'text' | 'shape' | 'image' | 'badge' | 'line' | 'qr';

export type ShapeType = 'rectangle' | 'circle' | 'star' | 'star-burst' | 'triangle' | 'hexagon' | 'diamond' | 'heart' | 'pill';

export type BadgeType = 'sale-pill' | 'vintage-ticket' | 'ribbon' | 'burst-badge' | 'neon-tag' | 'stamp';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  locked?: boolean;
  hidden?: boolean;
  name: string;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle?: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number; // in px
  lineHeight: number; // multiplier e.g. 1.1
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  stroke?: {
    color: string;
    width: number;
  };
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius?: number;
  gradient?: {
    type: 'linear' | 'radial';
    colors: [string, string];
    angle: number;
  };
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  borderRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  filters?: {
    brightness?: number; // 0 to 200, default 100
    contrast?: number; // 0 to 200, default 100
    saturation?: number; // 0 to 200, default 100
    blur?: number; // in px
    grayscale?: number; // 0 to 100
    sepia?: number; // 0 to 100
    invert?: number; // 0 to 100
  };
}

export interface BadgeElement extends BaseElement {
  type: 'badge';
  badgeType: BadgeType;
  primaryText: string;
  secondaryText?: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  fontSize: number;
}

export interface LineElement extends BaseElement {
  type: 'line';
  strokeColor: string;
  strokeWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

export interface QrElement extends BaseElement {
  type: 'qr';
  value: string;
  darkColor: string;
  lightColor: string;
  title?: string;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement | BadgeElement | LineElement | QrElement;

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  color: string;
  gradient?: {
    colors: [string, string];
    angle: number;
    type: 'linear' | 'radial';
  };
  imageUrl?: string;
  imageOpacity?: number;
  imageBlur?: number;
  pattern?: 'dots' | 'grid' | 'grain' | 'stripes' | 'none';
  patternOpacity?: number;
}

export interface PosterProject {
  id: string;
  title: string;
  aspectRatio: AspectRatioId;
  width: number;
  height: number;
  background: BackgroundConfig;
  elements: CanvasElement[];
  updatedAt: number;
}

export interface PosterTemplate {
  id: string;
  title: string;
  category: 'music' | 'events' | 'promo' | 'minimal' | 'quote' | 'business' | 'creative';
  categoryLabel: string;
  aspectRatio: AspectRatioId;
  width: number;
  height: number;
  thumbnailBg: string;
  previewDescription: string;
  background: BackgroundConfig;
  elements: CanvasElement[];
}
