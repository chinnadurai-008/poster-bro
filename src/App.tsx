/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PosterProject,
  CanvasElement,
  AspectRatioId,
  ShapeType,
  BackgroundConfig,
  PosterTemplate,
  TextElement,
  ShapeElement,
  ImageElement,
  BadgeElement,
  LineElement,
  QrElement,
} from './types/poster';
import { PRESET_TEMPLATES } from './data/templates';
import { ASPECT_RATIOS, PRESET_BADGES } from './data/assets';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertyBar } from './components/PropertyBar';
import { ExportModal } from './components/ExportModal';
import { TemplateModal } from './components/TemplateModal';

const STORAGE_KEY = 'poster_bro_active_project_v1';

export default function App() {
  // Initial project state from default template or localStorage
  const [project, setProject] = useState<PosterProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved project:', e);
    }
    const defaultTemplate = PRESET_TEMPLATES[0];
    return {
      id: 'poster-' + Date.now(),
      title: defaultTemplate.title,
      aspectRatio: defaultTemplate.aspectRatio,
      width: defaultTemplate.width,
      height: defaultTemplate.height,
      background: defaultTemplate.background,
      elements: defaultTemplate.elements,
      updatedAt: Date.now(),
    };
  });

  // Selection & Zoom
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(0.85);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<PosterProject[]>([project]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isHistoryAction = useRef<boolean>(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);

  // Push to history when project state changes (throttled)
  const pushState = useCallback((newProject: PosterProject) => {
    if (isHistoryAction.current) {
      isHistoryAction.current = false;
      return;
    }
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newProject];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Autosave error:', e);
    }
  }, [project]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isHistoryAction.current = true;
      const targetState = history[historyIndex - 1];
      setHistoryIndex((prev) => prev - 1);
      setProject(targetState);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isHistoryAction.current = true;
      const targetState = history[historyIndex + 1];
      setHistoryIndex((prev) => prev + 1);
      setProject(targetState);
    }
  }, [history, historyIndex]);

  // Adjust zoom automatically based on screen height
  useEffect(() => {
    const handleResize = () => {
      const availableH = window.innerHeight - 130;
      const calculatedZoom = Math.min(1.1, Math.max(0.4, (availableH * 0.88) / project.height));
      setZoom(Math.round(calculatedZoom * 100) / 100);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [project.height]);

  // Keyboard Shortcuts (Undo, Redo, Delete, Duplicate)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (isInput) return;

      // Delete element
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
        e.preventDefault();
        handleDeleteElement(selectedId);
        return;
      }

      // Duplicate: Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        handleDuplicateSelected();
        return;
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [selectedId, handleUndo, handleRedo]);

  // Update elements
  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    setProject((prev) => {
      const updatedElements = prev.elements.map((el) => {
        if (el.id === id) {
          return { ...el, ...updates } as CanvasElement;
        }
        return el;
      });
      const newProj = { ...prev, elements: updatedElements, updatedAt: Date.now() };
      return newProj;
    });
  };

  const handleUpdateSelected = (updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    handleUpdateElement(selectedId, updates);
  };

  // Duplicate Selected Element
  const handleDuplicateSelected = () => {
    if (!selectedId) return;
    const target = project.elements.find((el) => el.id === selectedId);
    if (!target) return;

    const newId = `elem-${Date.now()}`;
    const duplicated: CanvasElement = {
      ...target,
      id: newId,
      name: `${target.name} Copy`,
      x: Math.min(project.width - target.width, target.x + 24),
      y: Math.min(project.height - target.height, target.y + 24),
    };

    const newProj = {
      ...project,
      elements: [...project.elements, duplicated],
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    setSelectedId(newId);
  };

  // Delete Element
  const handleDeleteElement = (id: string) => {
    const newProj = {
      ...project,
      elements: project.elements.filter((el) => el.id !== id),
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    if (selectedId === id) setSelectedId(null);
  };

  // Toggle Lock
  const handleToggleLock = (id: string) => {
    const target = project.elements.find((el) => el.id === id);
    if (!target) return;
    handleUpdateElement(id, { locked: !target.locked });
  };

  // Toggle Hide
  const handleToggleHide = (id: string) => {
    const target = project.elements.find((el) => el.id === id);
    if (!target) return;
    handleUpdateElement(id, { hidden: !target.hidden });
  };

  // Move Layer
  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const index = project.elements.findIndex((el) => el.id === id);
    if (index === -1) return;

    const newElements = [...project.elements];
    if (direction === 'up' && index < newElements.length - 1) {
      // Swap with next
      const temp = newElements[index];
      newElements[index] = newElements[index + 1];
      newElements[index + 1] = temp;
    } else if (direction === 'down' && index > 0) {
      // Swap with previous
      const temp = newElements[index];
      newElements[index] = newElements[index - 1];
      newElements[index - 1] = temp;
    }

    const newProj = { ...project, elements: newElements, updatedAt: Date.now() };
    setProject(newProj);
    pushState(newProj);
  };

  const handleBringToFront = () => {
    if (!selectedId) return;
    const target = project.elements.find((el) => el.id === selectedId);
    if (!target) return;
    const filtered = project.elements.filter((el) => el.id !== selectedId);
    const newProj = { ...project, elements: [...filtered, target], updatedAt: Date.now() };
    setProject(newProj);
    pushState(newProj);
  };

  const handleSendToBack = () => {
    if (!selectedId) return;
    const target = project.elements.find((el) => el.id === selectedId);
    if (!target) return;
    const filtered = project.elements.filter((el) => el.id !== selectedId);
    const newProj = { ...project, elements: [target, ...filtered], updatedAt: Date.now() };
    setProject(newProj);
    pushState(newProj);
  };

  // Alignment to Canvas
  const handleAlignCanvas = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedId) return;
    const el = project.elements.find((item) => item.id === selectedId);
    if (!el) return;

    let updates: Partial<CanvasElement> = {};
    if (alignment === 'left') updates = { x: 40 };
    if (alignment === 'center') updates = { x: Math.round((project.width - el.width) / 2) };
    if (alignment === 'right') updates = { x: project.width - el.width - 40 };
    if (alignment === 'top') updates = { y: 40 };
    if (alignment === 'middle') updates = { y: Math.round((project.height - el.height) / 2) };
    if (alignment === 'bottom') updates = { y: project.height - el.height - 40 };

    handleUpdateElement(selectedId, updates);
  };

  // Add Element Actions
  const handleAddText = (variant: 'heading' | 'subheading' | 'body' | 'neon' = 'heading') => {
    const id = `text-${Date.now()}`;
    let newElement: TextElement;

    if (variant === 'heading') {
      newElement = {
        id,
        type: 'text',
        name: 'Poster Title',
        text: 'HEADLINE',
        fontFamily: 'Bebas Neue',
        fontSize: 72,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: 4,
        lineHeight: 0.9,
        textTransform: 'uppercase',
        x: Math.round((project.width - 400) / 2),
        y: Math.round(project.height * 0.2),
        width: 400,
        height: 80,
        rotation: 0,
        opacity: 1,
      };
    } else if (variant === 'subheading') {
      newElement = {
        id,
        type: 'text',
        name: 'Subtitle',
        text: 'SPECIAL GUEST & LIVE PERFORMANCE',
        fontFamily: 'Outfit',
        fontSize: 18,
        fontWeight: '700',
        color: '#f97316',
        textAlign: 'center',
        letterSpacing: 2,
        lineHeight: 1.2,
        textTransform: 'uppercase',
        x: Math.round((project.width - 440) / 2),
        y: Math.round(project.height * 0.35),
        width: 440,
        height: 40,
        rotation: 0,
        opacity: 1,
      };
    } else if (variant === 'neon') {
      newElement = {
        id,
        type: 'text',
        name: 'Neon Glow Text',
        text: 'NIGHT PULSE',
        fontFamily: 'Righteous',
        fontSize: 60,
        fontWeight: '700',
        color: '#f43f5e',
        textAlign: 'center',
        letterSpacing: 3,
        lineHeight: 1,
        textTransform: 'uppercase',
        shadow: {
          color: 'rgba(244, 63, 94, 0.8)',
          blur: 24,
          offsetX: 0,
          offsetY: 2,
        },
        x: Math.round((project.width - 420) / 2),
        y: Math.round(project.height * 0.25),
        width: 420,
        height: 70,
        rotation: 0,
        opacity: 1,
      };
    } else {
      newElement = {
        id,
        type: 'text',
        name: 'Body Paragraph',
        text: 'Join us for an unforgettable evening of art, design, and auditory wonders. Doors open at 7:00 PM.',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 14,
        fontWeight: '400',
        color: '#d4d4d8',
        textAlign: 'center',
        letterSpacing: 0.5,
        lineHeight: 1.6,
        x: Math.round((project.width - 400) / 2),
        y: Math.round(project.height * 0.5),
        width: 400,
        height: 60,
        rotation: 0,
        opacity: 1,
      };
    }

    const newProj = {
      ...project,
      elements: [...project.elements, newElement],
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    setSelectedId(id);
  };

  const handleAddShape = (shape: ShapeType) => {
    const id = `shape-${Date.now()}`;
    const size = shape === 'circle' || shape === 'star' || shape === 'star-burst' ? 180 : 200;
    const newShape: ShapeElement = {
      id,
      type: 'shape',
      name: `${shape.charAt(0).toUpperCase() + shape.slice(1)} Shape`,
      shape,
      fillColor: shape === 'star' ? '#f59e0b' : shape === 'star-burst' ? '#06b6d4' : '#f97316',
      strokeColor: 'transparent',
      strokeWidth: 0,
      borderRadius: shape === 'pill' ? 999 : shape === 'rectangle' ? 8 : 0,
      x: Math.round((project.width - size) / 2),
      y: Math.round((project.height - size) / 2),
      width: size,
      height: shape === 'pill' ? 60 : size,
      rotation: 0,
      opacity: 1,
    };

    const newProj = {
      ...project,
      elements: [...project.elements, newShape],
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    setSelectedId(id);
  };

  const handleAddBadge = (badge: typeof PRESET_BADGES[0]) => {
    const id = `badge-${Date.now()}`;
    const newBadge: BadgeElement = {
      id,
      type: 'badge',
      name: `${badge.title} Badge`,
      badgeType: badge.type as any,
      primaryText: badge.title,
      secondaryText: badge.subtitle,
      bgColor: badge.bg,
      textColor: badge.text,
      accentColor: badge.accent,
      fontSize: 14,
      x: Math.round((project.width - 220) / 2),
      y: Math.round(project.height * 0.1),
      width: 220,
      height: 48,
      rotation: 0,
      opacity: 1,
    };

    const newProj = {
      ...project,
      elements: [...project.elements, newBadge],
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    setSelectedId(id);
  };

  const handleAddImage = (url: string, name?: string) => {
    const id = `img-${Date.now()}`;
    const newImg: ImageElement = {
      id,
      type: 'image',
      name: name || 'Poster Image',
      src: url,
      borderRadius: 12,
      strokeColor: '#ffffff',
      strokeWidth: 0,
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        invert: 0,
      },
      x: Math.round((project.width - 320) / 2),
      y: Math.round((project.height - 240) / 2),
      width: 320,
      height: 240,
      rotation: 0,
      opacity: 1,
    };

    const newProj = {
      ...project,
      elements: [...project.elements, newImg],
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    setSelectedId(id);
  };

  const handleAddLine = () => {
    const id = `line-${Date.now()}`;
    const newLine: LineElement = {
      id,
      type: 'line',
      name: 'Divider Line',
      strokeColor: '#f97316',
      strokeWidth: 2,
      lineStyle: 'solid',
      x: Math.round((project.width - 300) / 2),
      y: Math.round(project.height * 0.45),
      width: 300,
      height: 4,
      rotation: 0,
      opacity: 1,
    };

    const newProj = {
      ...project,
      elements: [...project.elements, newLine],
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    setSelectedId(id);
  };

  const handleAddQr = (value: string) => {
    const id = `qr-${Date.now()}`;
    const newQr: QrElement = {
      id,
      type: 'qr',
      name: 'Event QR Code',
      value: value || 'https://posterbro.app',
      darkColor: '#09090b',
      lightColor: '#ffffff',
      title: 'SCAN FOR DETAILS',
      x: Math.round((project.width - 120) / 2),
      y: Math.round(project.height * 0.75),
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
    };

    const newProj = {
      ...project,
      elements: [...project.elements, newQr],
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    setSelectedId(id);
  };

  // Update Background
  const handleUpdateBackground = (bgUpdates: Partial<BackgroundConfig>) => {
    const newBg = { ...project.background, ...bgUpdates };
    const newProj = { ...project, background: newBg, updatedAt: Date.now() };
    setProject(newProj);
    pushState(newProj);
  };

  // Change Aspect Ratio
  const handleAspectRatioChange = (ratioId: AspectRatioId) => {
    const preset = ASPECT_RATIOS.find((r) => r.id === ratioId);
    if (!preset) return;

    const scaleFactorX = preset.width / project.width;
    const scaleFactorY = preset.height / project.height;

    // Rescale element positions to fit nicely
    const scaledElements = project.elements.map((el) => ({
      ...el,
      x: Math.round(el.x * scaleFactorX),
      y: Math.round(el.y * scaleFactorY),
      width: Math.round(el.width * Math.min(scaleFactorX, 1.2)),
      height: Math.round(el.height * Math.min(scaleFactorY, 1.2)),
    }));

    const newProj: PosterProject = {
      ...project,
      aspectRatio: ratioId,
      width: preset.width,
      height: preset.height,
      elements: scaledElements,
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
  };

  // Load Template
  const handleSelectTemplate = (template: PosterTemplate) => {
    const newProj: PosterProject = {
      id: 'poster-' + Date.now(),
      title: template.title,
      aspectRatio: template.aspectRatio,
      width: template.width,
      height: template.height,
      background: template.background,
      elements: template.elements.map((el) => ({
        ...el,
        id: `${el.id}-${Math.random().toString(36).substring(2, 6)}`,
      })),
      updatedAt: Date.now(),
    };
    setProject(newProj);
    pushState(newProj);
    setSelectedId(null);
  };

  // New Blank Poster
  const handleNewPoster = () => {
    if (confirm('Create a new blank poster? Your current canvas will be cleared.')) {
      const newProj: PosterProject = {
        id: 'poster-' + Date.now(),
        title: 'Untitled Poster',
        aspectRatio: 'poster',
        width: 600,
        height: 800,
        background: {
          type: 'solid',
          color: '#0f172a',
          pattern: 'none',
        },
        elements: [],
        updatedAt: Date.now(),
      };
      setProject(newProj);
      pushState(newProj);
      setSelectedId(null);
    }
  };

  const selectedElement = project.elements.find((el) => el.id === selectedId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        title={project.title}
        onTitleChange={(title) => setProject((prev) => ({ ...prev, title }))}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomChange={setZoom}
        onResetZoom={() => {
          const availableH = window.innerHeight - 130;
          setZoom(Math.round(((availableH * 0.88) / project.height) * 100) / 100);
        }}
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onNewPoster={handleNewPoster}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddBadge={handleAddBadge}
          onAddImage={handleAddImage}
          onAddLine={handleAddLine}
          onAddQr={handleAddQr}
          background={project.background}
          onUpdateBackground={handleUpdateBackground}
          elements={project.elements}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onDeleteElement={handleDeleteElement}
          onToggleLock={handleToggleLock}
          onToggleHide={handleToggleHide}
          onMoveLayer={handleMoveLayer}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
        />

        {/* Center Canvas Area + Property Bar */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Contextual Properties Inspector */}
          <PropertyBar
            element={selectedElement}
            onUpdateElement={handleUpdateSelected}
            onDuplicate={handleDuplicateSelected}
            onDelete={() => selectedId && handleDeleteElement(selectedId)}
            onAlignCanvas={handleAlignCanvas}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
          />

          {/* Interactive Drag-and-Drop Canvas Viewport */}
          <Canvas
            project={project}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onUpdateElement={handleUpdateElement}
            zoom={zoom}
          />
        </div>
      </div>

      {/* Export / Download Modal */}
      {isExportOpen && (
        <ExportModal
          project={project}
          onClose={() => setIsExportOpen(false)}
          onImportProject={(imported) => {
            setProject(imported);
            pushState(imported);
            setSelectedId(null);
          }}
        />
      )}

      {/* Templates Chooser Modal */}
      {isTemplatesOpen && (
        <TemplateModal
          currentProject={project}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setIsTemplatesOpen(false)}
        />
      )}
    </div>
  );
}
