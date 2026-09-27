import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PosterProject,
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  BadgeElement,
  LineElement,
  QrElement,
} from '../types/poster';
import { generateQrMatrix } from '../utils/qrCode';

interface CanvasProps {
  project: PosterProject;
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  zoom: number;
}

type DragMode = 'move' | 'resize' | 'rotate' | null;
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const Canvas: React.FC<CanvasProps> = ({
  project,
  selectedId,
  onSelectElement,
  onUpdateElement,
  zoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialElemState, setInitialElemState] = useState<CanvasElement | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }>({});

  const selectedElement = project.elements.find((el) => el.id === selectedId) || null;

  // Clear text editing when selection changes
  useEffect(() => {
    if (selectedId !== editingTextId) {
      setEditingTextId(null);
    }
  }, [selectedId, editingTextId]);

  // Handle Drag Move / Resize / Rotate
  const handleMouseDown = (
    e: React.MouseEvent,
    element: CanvasElement,
    mode: DragMode,
    handle: ResizeHandle | null = null
  ) => {
    if (element.locked) return;
    e.stopPropagation();

    onSelectElement(element.id);
    setDragMode(mode);
    setActiveHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialElemState({ ...element });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragMode || !selectedElement || !initialElemState) return;

      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      if (dragMode === 'move') {
        let newX = Math.round(initialElemState.x + deltaX);
        let newY = Math.round(initialElemState.y + deltaY);

        // Snap logic (to canvas center and edges)
        const snapThreshold = 8;
        const centerX = project.width / 2;
        const centerY = project.height / 2;
        const elemCenterX = newX + initialElemState.width / 2;
        const elemCenterY = newY + initialElemState.height / 2;

        const activeSnaps: { x?: number; y?: number } = {};

        // Horizontal center snap
        if (Math.abs(elemCenterX - centerX) < snapThreshold) {
          newX = Math.round(centerX - initialElemState.width / 2);
          activeSnaps.x = centerX;
        }
        // Vertical middle snap
        if (Math.abs(elemCenterY - centerY) < snapThreshold) {
          newY = Math.round(centerY - initialElemState.height / 2);
          activeSnaps.y = centerY;
        }

        setSnapLines(activeSnaps);

        onUpdateElement(selectedElement.id, {
          x: newX,
          y: newY,
        });
      } else if (dragMode === 'resize' && activeHandle) {
        let { x, y, width, height } = initialElemState;
        const isShift = e.shiftKey;
        const aspectRatio = width / (height || 1);

        if (activeHandle.includes('e')) {
          width = Math.max(20, initialElemState.width + deltaX);
        }
        if (activeHandle.includes('s')) {
          height = Math.max(20, initialElemState.height + deltaY);
        }
        if (activeHandle.includes('w')) {
          const newW = Math.max(20, initialElemState.width - deltaX);
          x = initialElemState.x + (initialElemState.width - newW);
          width = newW;
        }
        if (activeHandle.includes('n')) {
          const newH = Math.max(20, initialElemState.height - deltaY);
          y = initialElemState.y + (initialElemState.height - newH);
          height = newH;
        }

        if (isShift) {
          if (activeHandle.includes('e') || activeHandle.includes('w')) {
            height = width / aspectRatio;
          } else {
            width = height * aspectRatio;
          }
        }

        onUpdateElement(selectedElement.id, {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        });
      } else if (dragMode === 'rotate') {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const canvasCenterX = rect.left + (initialElemState.x + initialElemState.width / 2) * zoom;
        const canvasCenterY = rect.top + (initialElemState.y + initialElemState.height / 2) * zoom;

        const rad = Math.atan2(e.clientY - canvasCenterY, e.clientX - canvasCenterX);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;

        // Shift key snaps to 15 degree increments
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }

        onUpdateElement(selectedElement.id, {
          rotation: deg % 360,
        });
      }
    },
    [dragMode, selectedElement, initialElemState, dragStart, zoom, activeHandle, onUpdateElement, project.width, project.height]
  );

  const handleMouseUp = useCallback(() => {
    setDragMode(null);
    setActiveHandle(null);
    setInitialElemState(null);
    setSnapLines({});
  }, []);

  useEffect(() => {
    if (dragMode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragMode, handleMouseMove, handleMouseUp]);

  // Keyboard shortcut delete / nudge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement || editingTextId) return;

      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, { x: selectedElement.x - step });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, { x: selectedElement.x + step });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, { y: selectedElement.y - step });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, { y: selectedElement.y + step });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, editingTextId, onUpdateElement]);

  const bg = project.background;

  return (
    <div
      className="flex-1 bg-neutral-950 overflow-auto flex items-center justify-center p-8 relative select-none"
      onClick={() => onSelectElement(null)}
    >
      {/* Background Dots Canvas Workspace Mesh */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4b5563_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Scaled Poster Container */}
      <div
        ref={containerRef}
        style={{
          width: project.width,
          height: project.height,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
        className="relative shrink-0 overflow-hidden transition-transform duration-75"
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(null);
        }}
      >
        {/* Poster Backdrop */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundColor: bg.color || '#09090b',
            backgroundImage:
              bg.type === 'gradient' && bg.gradient
                ? `linear-gradient(${bg.gradient.angle || 135}deg, ${bg.gradient.colors[0]}, ${bg.gradient.colors[1]})`
                : undefined,
          }}
        >
          {bg.type === 'image' && bg.imageUrl && (
            <img
              src={bg.imageUrl}
              alt="Backdrop"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              style={{
                opacity: bg.imageOpacity ?? 0.8,
                filter: bg.imageBlur ? `blur(${bg.imageBlur}px)` : undefined,
              }}
            />
          )}

          {/* Texture Overlay */}
          {bg.pattern === 'dots' && (
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
          )}
          {bg.pattern === 'grid' && (
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
          )}
          {bg.pattern === 'grain' && (
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-black/30" />
          )}
        </div>

        {/* Snap Guide Lines */}
        {snapLines.x !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-50 pointer-events-none shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            style={{ left: snapLines.x }}
          />
        )}
        {snapLines.y !== undefined && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-cyan-400 z-50 pointer-events-none shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            style={{ top: snapLines.y }}
          />
        )}

        {/* Elements Rendering in Layer Order */}
        {project.elements.map((el) => {
          if (el.hidden) return null;
          const isSelected = selectedId === el.id;

          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                transform: `rotate(${el.rotation || 0}deg)`,
                opacity: el.opacity ?? 1,
                cursor: el.locked ? 'default' : 'move',
              }}
              onMouseDown={(e) => handleMouseDown(e, el, 'move')}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement(el.id);
              }}
              className="group"
            >
              {/* Element Content */}
              {renderElementContent(el, editingTextId, setEditingTextId, (val) =>
                onUpdateElement(el.id, { text: val } as Partial<TextElement>)
              )}

              {/* Selection Bounding Box & Handles */}
              {isSelected && !el.locked && (
                <div className="absolute -inset-1 border-2 border-orange-500 pointer-events-none z-40">
                  {/* Rotation Stalk & Handle */}
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full cursor-grab active:cursor-grabbing pointer-events-auto shadow-sm flex items-center justify-center hover:scale-125 transition-transform"
                    title="Drag to Rotate (Shift = 15°)"
                    onMouseDown={(e) => handleMouseDown(e, el, 'rotate')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-orange-500 pointer-events-none" />

                  {/* 8 Resize Handles */}
                  {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeHandle[]).map((handle) => {
                    const positions: Record<ResizeHandle, string> = {
                      nw: '-top-1.5 -left-1.5 cursor-nwse-resize',
                      n: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                      ne: '-top-1.5 -right-1.5 cursor-nesw-resize',
                      e: 'top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize',
                      se: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
                      s: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                      sw: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
                      w: 'top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize',
                    };

                    return (
                      <div
                        key={handle}
                        className={`absolute w-3 h-3 bg-white border-2 border-orange-500 rounded-sm pointer-events-auto hover:bg-orange-500 transition-colors ${positions[handle]}`}
                        onMouseDown={(e) => handleMouseDown(e, el, 'resize', handle)}
                      />
                    );
                  })}

                  {/* Dimension pill */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-orange-300 text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                    {Math.round(el.width)} × {Math.round(el.height)}
                    {el.rotation ? ` · ${Math.round(el.rotation)}°` : ''}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function renderElementContent(
  el: CanvasElement,
  editingTextId: string | null,
  setEditingTextId: (id: string | null) => void,
  onTextChange: (newText: string) => void
) {
  if (el.type === 'text') {
    const textEl = el as TextElement;
    const isEditing = editingTextId === el.id;

    if (isEditing) {
      return (
        <textarea
          autoFocus
          value={textEl.text}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={() => setEditingTextId(null)}
          className="w-full h-full p-0 bg-transparent resize-none border-0 outline-none leading-none"
          style={{
            fontFamily: `"${textEl.fontFamily}", sans-serif`,
            fontSize: `${textEl.fontSize}px`,
            fontWeight: textEl.fontWeight,
            fontStyle: textEl.fontStyle,
            color: textEl.color,
            textAlign: textEl.textAlign,
            letterSpacing: `${textEl.letterSpacing || 0}px`,
            lineHeight: textEl.lineHeight || 1.15,
            textTransform: textEl.textTransform || 'none',
          }}
        />
      );
    }

    return (
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditingTextId(el.id);
        }}
        className="w-full h-full select-none flex flex-col justify-start"
        style={{
          fontFamily: `"${textEl.fontFamily}", sans-serif`,
          fontSize: `${textEl.fontSize}px`,
          fontWeight: textEl.fontWeight,
          fontStyle: textEl.fontStyle,
          color: textEl.color,
          textAlign: textEl.textAlign,
          letterSpacing: `${textEl.letterSpacing || 0}px`,
          lineHeight: textEl.lineHeight || 1.15,
          textTransform: textEl.textTransform || 'none',
          textShadow: textEl.shadow
            ? `${textEl.shadow.offsetX}px ${textEl.shadow.offsetY}px ${textEl.shadow.blur}px ${textEl.shadow.color}`
            : undefined,
          WebkitTextStroke: textEl.stroke && textEl.stroke.width > 0
            ? `${textEl.stroke.width}px ${textEl.stroke.color}`
            : undefined,
          whiteSpace: 'pre-wrap',
        }}
      >
        {textEl.text}
      </div>
    );
  }

  if (el.type === 'shape') {
    const shapeEl = el as ShapeElement;
    const fill = shapeEl.fillColor;
    const stroke = shapeEl.strokeColor;
    const strokeWidth = shapeEl.strokeWidth;

    if (shapeEl.shape === 'rectangle' || shapeEl.shape === 'pill') {
      const radius = shapeEl.shape === 'pill' ? 9999 : shapeEl.borderRadius || 0;
      return (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: fill,
            borderColor: stroke,
            borderWidth: `${strokeWidth}px`,
            borderRadius: `${radius}px`,
          }}
        />
      );
    }

    if (shapeEl.shape === 'circle') {
      return (
        <div
          className="w-full h-full rounded-full"
          style={{
            backgroundColor: fill,
            borderColor: stroke,
            borderWidth: `${strokeWidth}px`,
          }}
        />
      );
    }

    if (shapeEl.shape === 'star') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon
            points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    }

    if (shapeEl.shape === 'star-burst') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon
            points="50,0 60,18 78,7 80,27 99,26 90,44 100,58 84,67 87,87 69,87 63,100 48,93 34,100 30,86 12,85 17,66 0,55 12,43 1,24 21,26 23,6 40,19"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    }

    if (shapeEl.shape === 'triangle') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="50,5 95,95 5,95" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }

    if (shapeEl.shape === 'diamond') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="50,5 95,50 50,95 5,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    }
  }

  if (el.type === 'image') {
    const imgEl = el as ImageElement;
    const filters = imgEl.filters
      ? [
          imgEl.filters.brightness !== undefined ? `brightness(${imgEl.filters.brightness}%)` : '',
          imgEl.filters.contrast !== undefined ? `contrast(${imgEl.filters.contrast}%)` : '',
          imgEl.filters.saturation !== undefined ? `saturate(${imgEl.filters.saturation}%)` : '',
          imgEl.filters.blur ? `blur(${imgEl.filters.blur}px)` : '',
          imgEl.filters.grayscale ? `grayscale(${imgEl.filters.grayscale}%)` : '',
          imgEl.filters.sepia ? `sepia(${imgEl.filters.sepia}%)` : '',
        ]
          .filter(Boolean)
          .join(' ')
      : undefined;

    return (
      <img
        src={imgEl.src}
        alt={imgEl.alt || 'Poster Graphic'}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover pointer-events-none"
        style={{
          borderRadius: `${imgEl.borderRadius || 0}px`,
          borderColor: imgEl.strokeColor,
          borderWidth: imgEl.strokeWidth ? `${imgEl.strokeWidth}px` : undefined,
          filter: filters,
        }}
      />
    );
  }

  if (el.type === 'badge') {
    const badgeEl = el as BadgeElement;
    const isPill = badgeEl.badgeType === 'sale-pill';
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center shadow-md border-2 pointer-events-none ${
          isPill ? 'rounded-full' : 'rounded-lg'
        }`}
        style={{
          backgroundColor: badgeEl.bgColor,
          borderColor: badgeEl.accentColor,
          color: badgeEl.textColor,
        }}
      >
        <div
          className="font-extrabold uppercase tracking-wider leading-none text-center"
          style={{ fontSize: `${badgeEl.fontSize}px`, fontFamily: 'Outfit, sans-serif' }}
        >
          {badgeEl.primaryText}
        </div>
        {badgeEl.secondaryText && (
          <div
            className="font-semibold uppercase tracking-wider opacity-90 leading-none text-center mt-1"
            style={{
              fontSize: `${Math.max(9, badgeEl.fontSize * 0.6)}px`,
              color: badgeEl.accentColor,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {badgeEl.secondaryText}
          </div>
        )}
      </div>
    );
  }

  if (el.type === 'line') {
    const lineEl = el as LineElement;
    return (
      <div className="w-full h-full flex items-center pointer-events-none">
        <div
          className="w-full"
          style={{
            borderTopColor: lineEl.strokeColor,
            borderTopWidth: `${lineEl.strokeWidth}px`,
            borderTopStyle: lineEl.lineStyle,
          }}
        />
      </div>
    );
  }

  if (el.type === 'qr') {
    const qrEl = el as QrElement;
    const matrix = generateQrMatrix(qrEl.value || 'https://posterbro.app', 25);
    return (
      <div
        className="w-full h-full p-2 rounded-lg flex flex-col items-center justify-center shadow-md pointer-events-none"
        style={{ backgroundColor: qrEl.lightColor }}
      >
        <div className="w-full h-full grid grid-cols-25 gap-[0.5px]">
          {matrix.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  backgroundColor: cell ? qrEl.darkColor : 'transparent',
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
}
