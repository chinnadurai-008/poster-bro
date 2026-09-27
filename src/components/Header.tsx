import React from 'react';
import { Logo } from './Logo';
import { Undo2, Redo2, Download, LayoutTemplate, Plus, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { AspectRatioId } from '../types/poster';
import { ASPECT_RATIOS } from '../data/assets';

interface HeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetZoom: () => void;
  aspectRatio: AspectRatioId;
  onAspectRatioChange: (aspectRatio: AspectRatioId) => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onNewPoster: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onTitleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  onResetZoom,
  aspectRatio,
  onAspectRatioChange,
  onOpenTemplates,
  onOpenExport,
  onNewPoster,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <Logo size="md" />
        <span className="hidden lg:inline-block w-px h-5 bg-neutral-800 mx-1" />
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-label="Poster Project Title"
          className="bg-transparent hover:bg-neutral-800/60 focus:bg-neutral-800 text-xs font-medium text-neutral-200 focus:text-white px-2.5 py-1.5 rounded-md outline-none transition-colors border border-transparent focus:border-neutral-700 w-36 sm:w-48 truncate"
          title="Click to rename poster"
        />
      </div>

      {/* Zone 2: 4-6 clean single-line navigation & canvas controls */}
      <nav className="flex items-center gap-1 sm:gap-2">
        {/* Templates button */}
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-orange-400" />
          <span>Templates</span>
        </button>

        {/* Aspect Ratio selector */}
        <div className="relative inline-block">
          <select
            value={aspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value as AspectRatioId)}
            className="appearance-none bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium px-2.5 py-1.5 pr-6 rounded-md cursor-pointer border border-neutral-700/60 outline-none transition-colors"
            title="Poster Aspect Ratio"
          >
            {ASPECT_RATIOS.map((ratio) => (
              <option key={ratio.id} value={ratio.id} className="bg-neutral-900 text-neutral-200">
                {ratio.name} ({ratio.label})
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-2.5 text-[9px] text-neutral-400">▼</span>
        </div>

        {/* Divider */}
        <span className="hidden sm:inline-block w-px h-4 bg-neutral-800 mx-0.5" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-neutral-850 p-0.5 rounded-md border border-neutral-800/80">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-neutral-400 hover:text-white disabled:text-neutral-600 hover:bg-neutral-800 disabled:hover:bg-transparent rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-neutral-400 hover:text-white disabled:text-neutral-600 hover:bg-neutral-800 disabled:hover:bg-transparent rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden md:flex items-center gap-0.5 bg-neutral-850 px-1 py-0.5 rounded-md border border-neutral-800/80 text-xs">
          <button
            onClick={() => onZoomChange(Math.max(0.3, zoom - 0.1))}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="w-11 text-center font-mono text-[11px] text-neutral-300 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={onResetZoom}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors ml-0.5"
            title="Reset Zoom to Fit"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewPoster}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/60 rounded-md transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Canvas</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 rounded-md shadow-sm transition-all whitespace-nowrap active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Poster</span>
        </button>
      </div>
    </header>
  );
};
