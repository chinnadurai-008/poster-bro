export const FONT_OPTIONS = [
  { id: 'Bebas Neue', name: 'Bebas Neue', category: 'Bold Display' },
  { id: 'Cinzel', name: 'Cinzel', category: 'Elegant Serif' },
  { id: 'Outfit', name: 'Outfit', category: 'Modern Geometric' },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'Classic Editorial' },
  { id: 'Righteous', name: 'Righteous', category: 'Retro / Pop' },
  { id: 'Syne', name: 'Syne', category: 'Avant-Garde' },
  { id: 'Montserrat', name: 'Montserrat', category: 'Clean Sans' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'Refined UI' },
  { id: 'Work Sans', name: 'Work Sans', category: 'Industrial Sans' },
  { id: 'Courier New', name: 'Courier New', category: 'Monospace' },
];

export const ASPECT_RATIOS = [
  { id: 'poster', name: 'Standard Poster', width: 600, height: 800, label: '3:4' },
  { id: 'story', name: 'Story / Reel', width: 540, height: 960, label: '9:16' },
  { id: 'square', name: 'Square / Album', width: 700, height: 700, label: '1:1' },
  { id: 'landscape', name: 'Landscape Banner', width: 960, height: 540, label: '16:9' },
  { id: 'flyer', name: 'Event Flyer', width: 640, height: 800, label: '4:5' },
] as const;

export const COLOR_PALETTES = [
  { name: 'Warm Sunset', colors: ['#ff5722', '#ff9800', '#ffd600', '#1a1016'] },
  { name: 'Neon Cyber', colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#090d16'] },
  { name: 'Monochrome Acid', colors: ['#ccff00', '#ffffff', '#737373', '#0a0a0a'] },
  { name: 'Vintage Cinema', colors: ['#d97706', '#dc2626', '#fef3c7', '#1c1917'] },
  { name: 'Nordic Clean', colors: ['#38bdf8', '#818cf8', '#f8fafc', '#0f172a'] },
  { name: 'Earth & Clay', colors: ['#ea580c', '#ca8a04', '#fed7aa', '#292524'] },
];

export const POPULAR_COLORS = [
  '#ffffff', '#000000', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
  '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#d946ef', '#f472b6', '#cbd5e1', '#64748b', '#334155', '#1e293b',
  '#ccff00', '#00f5d4', '#7b2cbf', '#ff007f'
];

export const STOCK_IMAGES = [
  {
    id: 'concert-live',
    name: 'Concert Lights & Crowd',
    url: '/src/assets/images/poster_music_concert_1790524843389.jpg',
    category: 'Music',
  },
  {
    id: 'abstract-texture',
    name: 'Contemporary Gradient Curves',
    url: '/src/assets/images/poster_texture_abstract_1790524827539.jpg',
    category: 'Abstract',
  },
];

export const PRESET_BADGES = [
  {
    type: 'sale-pill',
    title: '50% OFF',
    subtitle: 'LIMITED TIME',
    bg: '#ef4444',
    text: '#ffffff',
    accent: '#fee2e2',
  },
  {
    type: 'stamp',
    title: 'LIVE ON STAGE',
    subtitle: 'WORLD TOUR 2026',
    bg: '#f59e0b',
    text: '#000000',
    accent: '#ffffff',
  },
  {
    type: 'vintage-ticket',
    title: 'ADMIT ONE',
    subtitle: 'VIP ACCESS #042',
    bg: '#18181b',
    text: '#e4e4e7',
    accent: '#f43f5e',
  },
  {
    type: 'burst-badge',
    title: 'NEW RELEASE',
    subtitle: 'NOW STREAMING',
    bg: '#8b5cf6',
    text: '#ffffff',
    accent: '#c084fc',
  },
  {
    type: 'neon-tag',
    title: 'FREE ENTRY',
    subtitle: 'DOORS OPEN 8PM',
    bg: '#ccff00',
    text: '#0a0a0a',
    accent: '#000000',
  },
];
