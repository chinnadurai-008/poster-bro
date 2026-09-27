import React, { useState, useEffect, useRef } from 'react';
import { PosterProject } from '../types/poster';
import { renderPosterToCanvas, downloadPoster, copyPosterToClipboard } from '../utils/canvasRenderer';
import { X, Download, Copy, Check, FileJson, Printer, Loader2 } from 'lucide-react';

interface ExportModalProps {
  project: PosterProject;
  onClose: () => void;
  onImportProject: (project: PosterProject) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  onClose,
  onImportProject,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState<number>(2);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Generate preview
  useEffect(() => {
    let isCancelled = false;
    const genPreview = async () => {
      setIsLoading(true);
      try {
        const canvas = await renderPosterToCanvas(project, 1);
        if (!isCancelled) {
          setPreviewUrl(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        console.error('Failed to generate export preview:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    genPreview();
    return () => {
      isCancelled = true;
    };
  }, [project]);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await downloadPoster(project, format, scale);
    } catch (err) {
      console.error('Export download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    const success = await copyPosterToClipboard(project);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-project.json`);
    dlAnchor.click();
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.elements && parsed.width) {
          onImportProject(parsed);
          onClose();
        }
      } catch (err) {
        console.error('Invalid JSON project:', err);
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = async () => {
    const canvas = await renderPosterToCanvas(project, 2);
    const win = window.open('');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>${project.title} - Print</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL()}" onload="window.print();window.close()" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  const targetWidth = project.width * scale;
  const targetHeight = project.height * scale;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Export & Download Poster</h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span>{project.title}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{targetWidth} × {targetHeight} px</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Preview Pane */}
          <div className="flex-1 bg-neutral-950 p-6 flex items-center justify-center overflow-auto border-b md:border-b-0 md:border-r border-neutral-800">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                <span className="text-xs">Rendering high-res preview...</span>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Poster Preview"
                className="max-h-[50vh] md:max-h-[62vh] rounded shadow-lg object-contain border border-neutral-800"
              />
            ) : (
              <div className="text-xs text-neutral-500">Preview unavailable</div>
            )}
          </div>

          {/* Right Export Settings */}
          <div className="w-full md:w-80 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-5">
              {/* Format selection */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  Image Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormat('png')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                      format === 'png'
                        ? 'bg-neutral-800 border-orange-500 text-white shadow-sm'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                  <button
                    onClick={() => setFormat('jpeg')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                      format === 'jpeg'
                        ? 'bg-neutral-800 border-orange-500 text-white shadow-sm'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    JPEG (Compressed)
                  </button>
                </div>
              </div>

              {/* Resolution Scale */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  Export Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { scaleVal: 1, label: '1x Web' },
                    { scaleVal: 2, label: '2x HiDPI' },
                    { scaleVal: 3, label: '3x Print' },
                  ].map((res) => (
                    <button
                      key={res.scaleVal}
                      onClick={() => setScale(res.scaleVal)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                        scale === res.scaleVal
                          ? 'bg-neutral-800 border-orange-500 text-white shadow-sm'
                          : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-neutral-400">
                  Target size: <span className="font-mono text-neutral-200">{targetWidth} × {targetHeight} px</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <button
                  onClick={handleCopyClipboard}
                  className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white text-xs font-medium border border-neutral-700/60 transition-colors flex items-center justify-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-neutral-400" />
                      <span>Copy Image to Clipboard</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white text-xs font-medium border border-neutral-700/60 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-neutral-400" />
                  <span>Send to Printer</span>
                </button>
              </div>

              {/* JSON Project Backup */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <button
                  onClick={handleDownloadJson}
                  className="text-xs text-neutral-400 hover:text-orange-400 flex items-center gap-1.5 transition-colors"
                  title="Download editable project backup JSON"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Save Project JSON</span>
                </button>

                <input
                  type="file"
                  ref={jsonInputRef}
                  onChange={handleJsonUpload}
                  accept=".json"
                  className="hidden"
                  id="import-json"
                />
                <label
                  htmlFor="import-json"
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer transition-colors"
                >
                  Import Project
                </label>
              </div>
            </div>

            {/* Main Download Button */}
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:from-orange-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating {format.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download {format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
