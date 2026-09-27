import React, { useState, useRef } from 'react';
import {
  Type,
  Shapes,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Layers,
  QrCode,
  Upload,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  CanvasElement,
  ShapeType,
  BackgroundConfig,
  BadgeType,
} from '../types/poster';
import {
  POPULAR_COLORS,
  PRESET_BADGES,
  STOCK_IMAGES,
} from '../data/assets';

type SidebarTab = 'text' | 'shapes' | 'badges' | 'images' | 'background' | 'qr' | 'layers';

interface SidebarProps {
  onAddText: (variant?: 'heading' | 'subheading' | 'body' | 'neon') => void;
  onAddShape: (shape: ShapeType) => void;
  onAddBadge: (badge: typeof PRESET_BADGES[0]) => void;
  onAddImage: (url: string, name?: string) => void;
  onAddLine: () => void;
  onAddQr: (value: string) => void;
  background: BackgroundConfig;
  onUpdateBackground: (bg: Partial<BackgroundConfig>) => void;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onDeleteElement: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleHide: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onOpenTemplates: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAddText,
  onAddShape,
  onAddBadge,
  onAddImage,
  onAddLine,
  onAddQr,
  background,
  onUpdateBackground,
  elements,
  selectedId,
  onSelectElement,
  onDeleteElement,
  onToggleLock,
  onToggleHide,
  onMoveLayer,
  onOpenTemplates,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('text');
  const [qrInput, setQrInput] = useState('https://posterbro.app');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onAddImage(dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const navItems = [
    { id: 'text' as SidebarTab, label: 'Text', icon: Type },
    { id: 'shapes' as SidebarTab, label: 'Shapes', icon: Shapes },
    { id: 'badges' as SidebarTab, label: 'Badges', icon: Sparkles },
    { id: 'images' as SidebarTab, label: 'Images', icon: ImageIcon },
    { id: 'background' as SidebarTab, label: 'Backdrop', icon: Palette },
    { id: 'qr' as SidebarTab, label: 'QR Code', icon: QrCode },
    { id: 'layers' as SidebarTab, label: 'Layers', icon: Layers },
  ];

  return (
    <aside className="w-80 border-r border-neutral-800 bg-neutral-900/95 flex z-20 shrink-0 select-none overflow-hidden">
      {/* Mini Icon Strip */}
      <div className="w-16 border-r border-neutral-800 flex flex-col items-center py-3 gap-1 bg-neutral-950/60 shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'bg-neutral-800 text-orange-400 font-semibold shadow-inner'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Drawer Panel */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 custom-scrollbar text-neutral-200">
        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Add Typography
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => onAddText('heading')}
                  className="w-full py-3 px-3 bg-neutral-800/80 hover:bg-neutral-800 hover:border-neutral-700 border border-neutral-800 rounded-lg text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-['Bebas_Neue'] text-2xl tracking-wider text-white">
                      ADD POSTER TITLE
                    </div>
                    <div className="text-[11px] text-neutral-400">Large bold display headline</div>
                  </div>
                  <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => onAddText('subheading')}
                  className="w-full py-2.5 px-3 bg-neutral-800/80 hover:bg-neutral-800 hover:border-neutral-700 border border-neutral-800 rounded-lg text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-['Outfit'] font-bold text-sm tracking-wide text-neutral-200 uppercase">
                      Subheading / Tagline
                    </div>
                    <div className="text-[11px] text-neutral-400">Medium emphasis subtitle</div>
                  </div>
                  <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => onAddText('body')}
                  className="w-full py-2.5 px-3 bg-neutral-800/80 hover:bg-neutral-800 hover:border-neutral-700 border border-neutral-800 rounded-lg text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-['Plus_Jakarta_Sans'] text-xs text-neutral-300">
                      Body paragraph or event description details...
                    </div>
                    <div className="text-[11px] text-neutral-400">Standard descriptive prose</div>
                  </div>
                  <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => onAddText('neon')}
                  className="w-full py-3 px-3 bg-neutral-800/80 hover:bg-neutral-800 hover:border-neutral-700 border border-neutral-800 rounded-lg text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-['Righteous'] text-lg text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                      NEON GLOW HEADLINE
                    </div>
                    <div className="text-[11px] text-neutral-400">Cyberpunk & concert glow</div>
                  </div>
                  <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Decorative Lines
              </h3>
              <button
                onClick={onAddLine}
                className="w-full py-2 px-3 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-300 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Add Divider Line</span>
                <span className="w-12 h-0.5 bg-orange-400" />
              </button>
            </div>
          </div>
        )}

        {/* SHAPES TAB */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Geometric Shapes
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { shape: 'rectangle' as ShapeType, label: 'Rectangle' },
                { shape: 'pill' as ShapeType, label: 'Pill' },
                { shape: 'circle' as ShapeType, label: 'Circle' },
                { shape: 'star' as ShapeType, label: 'Star' },
                { shape: 'star-burst' as ShapeType, label: 'Burst' },
                { shape: 'triangle' as ShapeType, label: 'Triangle' },
                { shape: 'diamond' as ShapeType, label: 'Diamond' },
              ].map((item) => (
                <button
                  key={item.shape}
                  onClick={() => onAddShape(item.shape)}
                  className="h-20 bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg p-2 flex flex-col items-center justify-center gap-2 transition-colors group"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {item.shape === 'rectangle' && <div className="w-7 h-5 bg-orange-500/80 rounded-sm" />}
                    {item.shape === 'pill' && <div className="w-8 h-4 bg-amber-500/80 rounded-full" />}
                    {item.shape === 'circle' && <div className="w-7 h-7 bg-rose-500/80 rounded-full" />}
                    {item.shape === 'star' && (
                      <span className="text-2xl text-yellow-400 leading-none">★</span>
                    )}
                    {item.shape === 'star-burst' && (
                      <span className="text-2xl text-cyan-400 leading-none">✹</span>
                    )}
                    {item.shape === 'triangle' && (
                      <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-emerald-500" />
                    )}
                    {item.shape === 'diamond' && (
                      <div className="w-5 h-5 bg-violet-500 rotate-45" />
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 group-hover:text-white">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BADGES TAB */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Stickers & Badges
            </h3>
            <p className="text-[11px] text-neutral-400">
              Click any badge to place it directly onto your poster canvas.
            </p>

            <div className="space-y-2.5">
              {PRESET_BADGES.map((badge, idx) => (
                <button
                  key={idx}
                  onClick={() => onAddBadge(badge)}
                  className="w-full p-3 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-colors flex items-center justify-between group"
                >
                  <div
                    className="px-3 py-1.5 rounded-full flex flex-col items-center justify-center shadow-sm"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    <span className="font-extrabold text-xs tracking-wider uppercase font-['Outfit']">
                      {badge.title}
                    </span>
                    {badge.subtitle && (
                      <span
                        className="text-[9px] font-semibold tracking-wider uppercase opacity-90"
                        style={{ color: badge.accent }}
                      >
                        {badge.subtitle}
                      </span>
                    )}
                  </div>
                  <Plus className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Custom Upload
              </h3>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="w-full py-4 border-2 border-dashed border-neutral-700 hover:border-orange-500/80 rounded-xl bg-neutral-800/40 hover:bg-neutral-800/80 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-orange-400" />
                <span className="text-xs font-medium text-neutral-300">Upload Image / Photo</span>
                <span className="text-[10px] text-neutral-500">PNG, JPG, WebP supported</span>
              </label>
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Curated Poster Photos
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {STOCK_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => onAddImage(img.url, img.name)}
                    className="relative group rounded-lg overflow-hidden border border-neutral-800 hover:border-orange-500 transition-colors aspect-[3/4]"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-medium text-white truncate">{img.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BACKGROUND TAB */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Canvas Backdrop
            </h3>

            {/* Background Type */}
            <div className="grid grid-cols-3 gap-1 bg-neutral-800/70 p-1 rounded-lg">
              {(['solid', 'gradient', 'pattern'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onUpdateBackground({ type })}
                  className={`py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                    background.type === type
                      ? 'bg-neutral-700 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Solid Color Palette */}
            <div>
              <label className="text-[11px] text-neutral-400 mb-1.5 block">Solid Fill Color</label>
              <div className="grid grid-cols-6 gap-1.5">
                {POPULAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateBackground({ color: c })}
                    className={`w-7 h-7 rounded-md border transition-transform ${
                      background.color === c
                        ? 'border-white scale-110 shadow-sm'
                        : 'border-neutral-700/60 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={background.color}
                  onChange={(e) => onUpdateBackground({ color: e.target.value })}
                  className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-neutral-400">{background.color}</span>
              </div>
            </div>

            {/* Gradient Options */}
            {background.type === 'gradient' && (
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <div className="text-[11px] font-semibold text-neutral-300">Gradient Colors</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400">Color 1:</span>
                    <input
                      type="color"
                      value={background.gradient?.colors[0] || '#ef4444'}
                      onChange={(e) =>
                        onUpdateBackground({
                          gradient: {
                            colors: [e.target.value, background.gradient?.colors[1] || '#3b82f6'],
                            angle: background.gradient?.angle || 135,
                            type: 'linear',
                          },
                        })
                      }
                      className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400">Color 2:</span>
                    <input
                      type="color"
                      value={background.gradient?.colors[1] || '#991b1b'}
                      onChange={(e) =>
                        onUpdateBackground({
                          gradient: {
                            colors: [background.gradient?.colors[0] || '#ef4444', e.target.value],
                            angle: background.gradient?.angle || 135,
                            type: 'linear',
                          },
                        })
                      }
                      className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Gradient Angle</span>
                    <span className="font-mono">{background.gradient?.angle || 135}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={background.gradient?.angle || 135}
                    onChange={(e) =>
                      onUpdateBackground({
                        gradient: {
                          colors: background.gradient?.colors || ['#ef4444', '#991b1b'],
                          angle: Number(e.target.value),
                          type: 'linear',
                        },
                      })
                    }
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Pattern Overlay */}
            <div className="pt-2 border-t border-neutral-800">
              <label className="text-[11px] text-neutral-400 mb-1.5 block">Texture Pattern</label>
              <div className="grid grid-cols-4 gap-1">
                {(['none', 'dots', 'grid', 'grain'] as const).map((pat) => (
                  <button
                    key={pat}
                    onClick={() => onUpdateBackground({ pattern: pat })}
                    className={`py-1.5 text-xs font-medium rounded-md capitalize border transition-colors ${
                      background.pattern === pat
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QR CODE TAB */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Event QR Code
            </h3>
            <p className="text-[11px] text-neutral-400">
              Generate a vector QR code for event tickets, RSVP websites, Spotify playlists, or social links.
            </p>

            <div>
              <label className="text-[11px] text-neutral-300 mb-1 block">Destination URL / Text</label>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="https://example.com/tickets"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-orange-500"
              />
            </div>

            <button
              onClick={() => onAddQr(qrInput)}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add QR Code to Poster</span>
            </button>
          </div>
        )}

        {/* LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Layers ({elements.length})
              </h3>
              <span className="text-[10px] text-neutral-500">Top to Bottom order</span>
            </div>

            {elements.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                No elements on canvas. Add text, shapes, or templates to get started!
              </div>
            ) : (
              <div className="space-y-1">
                {[...elements].reverse().map((el, reverseIndex) => {
                  const isSelected = selectedId === el.id;
                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectElement(el.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
                        isSelected
                          ? 'bg-neutral-800 border-orange-500/80 text-white'
                          : 'bg-neutral-850/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] text-neutral-500 uppercase font-mono w-4 text-center">
                          {elements.length - reverseIndex}
                        </span>
                        <span className="truncate">{el.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Move Up */}
                        <button
                          onClick={() => onMoveLayer(el.id, 'up')}
                          className="p-1 text-neutral-400 hover:text-white rounded"
                          title="Bring Forward"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        {/* Move Down */}
                        <button
                          onClick={() => onMoveLayer(el.id, 'down')}
                          className="p-1 text-neutral-400 hover:text-white rounded"
                          title="Send Backward"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        {/* Lock */}
                        <button
                          onClick={() => onToggleLock(el.id)}
                          className={`p-1 rounded ${el.locked ? 'text-amber-400' : 'text-neutral-500 hover:text-white'}`}
                          title={el.locked ? 'Unlock Layer' : 'Lock Layer'}
                        >
                          {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                        {/* Hide */}
                        <button
                          onClick={() => onToggleHide(el.id)}
                          className={`p-1 rounded ${el.hidden ? 'text-neutral-600' : 'text-neutral-400 hover:text-white'}`}
                          title={el.hidden ? 'Show Layer' : 'Hide Layer'}
                        >
                          {el.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => onDeleteElement(el.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 rounded"
                          title="Delete Layer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
