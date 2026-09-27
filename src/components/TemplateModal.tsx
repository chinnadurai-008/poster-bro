import React, { useState, useEffect } from 'react';
import { PosterTemplate, PosterProject } from '../types/poster';
import { PRESET_TEMPLATES } from '../data/templates';
import { X, Check, BookmarkPlus, Trash2 } from 'lucide-react';

interface TemplateModalProps {
  currentProject: PosterProject;
  onSelectTemplate: (template: PosterTemplate) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'music', label: 'Music & Concerts' },
  { id: 'minimal', label: 'Minimal & Bauhaus' },
  { id: 'business', label: 'Business & Tech' },
  { id: 'promo', label: 'Sale & Promo' },
  { id: 'creative', label: 'Movie & Film Noir' },
  { id: 'quote', label: 'Inspiration & Quotes' },
  { id: 'saved', label: 'My Saved' },
];

export const TemplateModal: React.FC<TemplateModalProps> = ({
  currentProject,
  onSelectTemplate,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [savedTemplates, setSavedTemplates] = useState<PosterTemplate[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load saved templates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('poster_bro_saved_templates');
      if (stored) {
        setSavedTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved templates', e);
    }
  }, []);

  const handleSaveCurrentAsTemplate = () => {
    const newTemplate: PosterTemplate = {
      id: `custom-${Date.now()}`,
      title: currentProject.title || 'My Custom Template',
      category: 'creative',
      categoryLabel: 'Custom Template',
      aspectRatio: currentProject.aspectRatio,
      width: currentProject.width,
      height: currentProject.height,
      thumbnailBg: currentProject.background.color || '#18181b',
      previewDescription: `Created by user · ${currentProject.elements.length} elements`,
      background: currentProject.background,
      elements: currentProject.elements,
    };

    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('poster_bro_saved_templates', JSON.stringify(updated));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save template', e);
    }
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    try {
      localStorage.setItem('poster_bro_saved_templates', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const allTemplates = [...savedTemplates, ...PRESET_TEMPLATES];

  const filteredTemplates = allTemplates.filter((t) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'saved') return t.id.startsWith('custom-');
    return t.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Poster Template Gallery</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose from designer-crafted presets or customize your own saved layouts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveCurrentAsTemplate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700/60 rounded-lg text-xs font-medium transition-colors"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Template Saved!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-orange-400" />
                  <span>Save Current as Template</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter categories */}
        <div className="px-6 py-2.5 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center gap-1 overflow-x-auto custom-scrollbar shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-neutral-800 text-orange-400 border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              {cat.label}
              {cat.id === 'saved' && savedTemplates.length > 0 && ` (${savedTemplates.length})`}
            </button>
          ))}
        </div>

        {/* Grid List */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-neutral-950">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <p className="text-sm">No templates found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-neutral-900/90 border border-neutral-800 hover:border-orange-500/80 rounded-xl overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/5"
                >
                  {/* Poster Thumbnail Visual */}
                  <div
                    className="relative aspect-[3/4] w-full flex items-center justify-center p-4 overflow-hidden border-b border-neutral-800"
                    style={{ background: template.thumbnailBg }}
                  >
                    {/* Background image preview if present */}
                    {template.background.imageUrl && (
                      <img
                        src={template.background.imageUrl}
                        alt={template.title}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                      />
                    )}

                    {/* Miniature preview card representation */}
                    <div className="relative z-10 w-full h-full flex flex-col justify-between p-3 pointer-events-none drop-shadow-md">
                      <div className="text-[10px] font-mono tracking-widest uppercase text-white/70">
                        {template.categoryLabel}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xl font-black text-white uppercase tracking-tight line-clamp-2 drop-shadow">
                          {template.title}
                        </div>
                        <div className="text-[10px] text-white/80 line-clamp-1">
                          {template.elements.find((e) => e.type === 'text')?.name || 'Customizable Layout'}
                        </div>
                      </div>
                      <div className="text-[9px] text-white/60 font-mono">
                        {template.width} × {template.height} px
                      </div>
                    </div>

                    {/* Delete button if saved */}
                    {template.id.startsWith('custom-') && (
                      <button
                        onClick={(e) => handleDeleteSaved(template.id, e)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-900/80 text-white rounded-md transition-colors z-20"
                        title="Delete saved template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Card Content & Action */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-1">
                        <span>{template.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{template.elements.length} Elements</span>
                      </div>
                      <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {template.previewDescription}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTemplate(template);
                        onClose();
                      }}
                      className="w-full py-2 px-3 bg-neutral-800 hover:bg-orange-500 hover:text-white text-neutral-200 font-semibold text-xs rounded-lg transition-all active:scale-95"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
