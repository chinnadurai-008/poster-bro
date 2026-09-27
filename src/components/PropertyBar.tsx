import React from 'react';
import {
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  BadgeElement,
  LineElement,
  QrElement,
} from '../types/poster';
import { FONT_OPTIONS, POPULAR_COLORS } from '../data/assets';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Copy,
  Trash2,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronsDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PropertyBarProps {
  element: CanvasElement | null;
  onUpdateElement: (updated: Partial<CanvasElement>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAlignCanvas: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

export const PropertyBar: React.FC<PropertyBarProps> = ({
  element,
  onUpdateElement,
  onDuplicate,
  onDelete,
  onAlignCanvas,
  onBringToFront,
  onSendToBack,
}) => {
  if (!element) {
    return (
      <div className="h-11 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between text-xs text-neutral-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
          <span>Canvas Active · Click any element to inspect & edit properties</span>
        </div>
        <div className="text-[11px] text-neutral-500 hidden sm:block">
          Use Shift+Drag to keep ratio · Arrow keys to nudge (Shift = 10px) · Del to remove
        </div>
      </div>
    );
  }

  return (
    <div className="h-11 bg-neutral-900 border-b border-neutral-800 px-3 flex items-center justify-between text-xs text-neutral-200 shrink-0 overflow-x-auto custom-scrollbar gap-2 z-10">
      <div className="flex items-center gap-2">
        {/* Element Type Indicator */}
        <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-semibold text-orange-400 uppercase tracking-wider shrink-0">
          {element.type}
        </span>

        {/* TEXT SPECIFIC CONTROLS */}
        {element.type === 'text' && (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Font Family */}
            <select
              value={(element as TextElement).fontFamily}
              onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            {/* Font Size */}
            <div className="flex items-center bg-neutral-800 rounded border border-neutral-700">
              <input
                type="number"
                min="10"
                max="240"
                value={(element as TextElement).fontSize}
                onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) })}
                className="w-12 px-1.5 py-1 text-xs bg-transparent text-center text-white outline-none"
              />
              <span className="text-[10px] text-neutral-400 pr-1.5">px</span>
            </div>

            {/* Color */}
            <div className="flex items-center gap-1 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
              <input
                type="color"
                value={(element as TextElement).color}
                onChange={(e) => onUpdateElement({ color: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                title="Text Color"
              />
            </div>

            {/* Bold / Italic / Uppercase */}
            <div className="flex items-center bg-neutral-800 rounded border border-neutral-700">
              <button
                onClick={() =>
                  onUpdateElement({
                    fontWeight: (element as TextElement).fontWeight === 'bold' || (element as TextElement).fontWeight === '900' ? '400' : 'bold',
                  })
                }
                className={`p-1 rounded ${
                  (element as TextElement).fontWeight === 'bold' || (element as TextElement).fontWeight === '900'
                    ? 'text-orange-400 bg-neutral-700'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Toggle Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  onUpdateElement({
                    fontStyle: (element as TextElement).fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                className={`p-1 rounded ${
                  (element as TextElement).fontStyle === 'italic'
                    ? 'text-orange-400 bg-neutral-700'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Toggle Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  onUpdateElement({
                    textTransform: (element as TextElement).textTransform === 'uppercase' ? 'none' : 'uppercase',
                  })
                }
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                  (element as TextElement).textTransform === 'uppercase'
                    ? 'text-orange-400 bg-neutral-700'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Uppercase toggle"
              >
                AA
              </button>
            </div>

            {/* Text Alignment */}
            <div className="flex items-center bg-neutral-800 rounded border border-neutral-700">
              {(['left', 'center', 'right'] as const).map((align) => {
                const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                return (
                  <button
                    key={align}
                    onClick={() => onUpdateElement({ textAlign: align })}
                    className={`p-1 rounded ${
                      (element as TextElement).textAlign === align
                        ? 'text-orange-400 bg-neutral-700'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title={`Align ${align}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            {/* Letter Spacing */}
            <div className="hidden lg:flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
              <span className="text-[10px] text-neutral-400">Track:</span>
              <input
                type="number"
                min="-2"
                max="20"
                value={(element as TextElement).letterSpacing || 0}
                onChange={(e) => onUpdateElement({ letterSpacing: Number(e.target.value) })}
                className="w-10 bg-transparent text-white text-xs outline-none text-center"
              />
            </div>
          </div>
        )}

        {/* SHAPE SPECIFIC CONTROLS */}
        {element.type === 'shape' && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Fill Color */}
            <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
              <span className="text-[10px] text-neutral-400">Fill:</span>
              <input
                type="color"
                value={(element as ShapeElement).fillColor === 'transparent' ? '#ffffff' : (element as ShapeElement).fillColor}
                onChange={(e) => onUpdateElement({ fillColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <button
                onClick={() => onUpdateElement({ fillColor: 'transparent' })}
                className="text-[9px] px-1 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300 ml-1"
                title="Make Transparent Fill"
              >
                None
              </button>
            </div>

            {/* Stroke Color & Width */}
            <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
              <span className="text-[10px] text-neutral-400">Border:</span>
              <input
                type="color"
                value={(element as ShapeElement).strokeColor === 'transparent' ? '#ffffff' : (element as ShapeElement).strokeColor}
                onChange={(e) => onUpdateElement({ strokeColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="number"
                min="0"
                max="30"
                value={(element as ShapeElement).strokeWidth}
                onChange={(e) => onUpdateElement({ strokeWidth: Number(e.target.value) })}
                className="w-10 bg-transparent text-white text-xs outline-none text-center"
              />
              <span className="text-[10px] text-neutral-400">px</span>
            </div>

            {/* Border Radius for Rectangles */}
            {((element as ShapeElement).shape === 'rectangle' || (element as ShapeElement).shape === 'pill') && (
              <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
                <span className="text-[10px] text-neutral-400">Round:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={(element as ShapeElement).borderRadius || 0}
                  onChange={(e) => onUpdateElement({ borderRadius: Number(e.target.value) })}
                  className="w-10 bg-transparent text-white text-xs outline-none text-center"
                />
              </div>
            )}
          </div>
        )}

        {/* IMAGE SPECIFIC CONTROLS */}
        {element.type === 'image' && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Border Radius */}
            <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
              <span className="text-[10px] text-neutral-400">Round:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={(element as ImageElement).borderRadius || 0}
                onChange={(e) => onUpdateElement({ borderRadius: Number(e.target.value) })}
                className="w-10 bg-transparent text-white text-xs outline-none text-center"
              />
            </div>

            {/* Filter Brightness & Contrast */}
            <div className="hidden lg:flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
              <span className="text-[10px] text-neutral-400">Brightness:</span>
              <input
                type="range"
                min="50"
                max="150"
                value={(element as ImageElement).filters?.brightness ?? 100}
                onChange={(e) =>
                  onUpdateElement({
                    filters: {
                      ...(element as ImageElement).filters,
                      brightness: Number(e.target.value),
                    },
                  })
                }
                className="w-16 accent-orange-500"
              />
            </div>
          </div>
        )}

        {/* BADGE SPECIFIC CONTROLS */}
        {element.type === 'badge' && (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={(element as BadgeElement).primaryText}
              onChange={(e) => onUpdateElement({ primaryText: e.target.value })}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none w-28"
              placeholder="Primary Text"
            />
            <input
              type="text"
              value={(element as BadgeElement).secondaryText || ''}
              onChange={(e) => onUpdateElement({ secondaryText: e.target.value })}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none w-28"
              placeholder="Subtitle"
            />
            <div className="flex items-center gap-1 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
              <input
                type="color"
                value={(element as BadgeElement).bgColor}
                onChange={(e) => onUpdateElement({ bgColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                title="Badge Background Color"
              />
            </div>
          </div>
        )}

        {/* LINE SPECIFIC CONTROLS */}
        {element.type === 'line' && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
              <span className="text-[10px] text-neutral-400">Color:</span>
              <input
                type="color"
                value={(element as LineElement).strokeColor}
                onChange={(e) => onUpdateElement({ strokeColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="number"
                min="1"
                max="20"
                value={(element as LineElement).strokeWidth}
                onChange={(e) => onUpdateElement({ strokeWidth: Number(e.target.value) })}
                className="w-10 bg-transparent text-white text-xs outline-none text-center"
              />
            </div>
            <select
              value={(element as LineElement).lineStyle}
              onChange={(e) => onUpdateElement({ lineStyle: e.target.value as any })}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        )}

        {/* QR SPECIFIC CONTROLS */}
        {element.type === 'qr' && (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={(element as QrElement).value}
              onChange={(e) => onUpdateElement({ value: e.target.value })}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white outline-none w-48"
              placeholder="QR Target Link"
            />
            <div className="flex items-center gap-1 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
              <input
                type="color"
                value={(element as QrElement).darkColor}
                onChange={(e) => onUpdateElement({ darkColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                title="QR Code Color"
              />
            </div>
          </div>
        )}

        {/* Universal Opacity */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
          <span className="text-[10px] text-neutral-400">Opacity:</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={element.opacity ?? 1}
            onChange={(e) => onUpdateElement({ opacity: Number(e.target.value) })}
            className="w-14 accent-orange-500"
          />
        </div>
      </div>

      {/* RIGHT SIDE: ALIGNMENT & LAYER ACTIONS */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Align to Canvas */}
        <div className="flex items-center bg-neutral-800 rounded border border-neutral-700">
          <button
            onClick={() => onAlignCanvas('center')}
            className="px-2 py-1 text-neutral-400 hover:text-white text-[11px] rounded"
            title="Center Horizontally"
          >
            Center H
          </button>
          <button
            onClick={() => onAlignCanvas('middle')}
            className="px-2 py-1 text-neutral-400 hover:text-white text-[11px] rounded"
            title="Center Vertically"
          >
            Center V
          </button>
        </div>

        {/* Bring to front / back */}
        <div className="flex items-center bg-neutral-800 rounded border border-neutral-700">
          <button
            onClick={onBringToFront}
            className="p-1 text-neutral-400 hover:text-white rounded"
            title="Bring to Front"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onSendToBack}
            className="p-1 text-neutral-400 hover:text-white rounded"
            title="Send to Back"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Duplicate */}
        <button
          onClick={onDuplicate}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded border border-neutral-700 transition-colors"
          title="Duplicate Element (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Lock */}
        <button
          onClick={() => onUpdateElement({ locked: !element.locked })}
          className={`p-1.5 rounded border transition-colors ${
            element.locked
              ? 'bg-amber-950/60 border-amber-600 text-amber-400'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
          }`}
          title={element.locked ? 'Unlock Element' : 'Lock Element'}
        >
          {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="p-1.5 bg-neutral-800 hover:bg-red-900/60 hover:border-red-700 text-neutral-400 hover:text-red-300 rounded border border-neutral-700 transition-colors"
          title="Delete Element (Backspace)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
