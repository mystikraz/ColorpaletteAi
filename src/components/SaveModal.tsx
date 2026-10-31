import React, { useState, useEffect } from 'react';
import { Check, Download, Image as ImageIcon, X, Sparkles, FolderHeart } from 'lucide-react';
import { ColorSwatch, CustomerDetails, HousePreset } from '../types';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: HousePreset;
  paintedZones: Record<string, ColorSwatch>;
  usedColors: ColorSwatch[];
  customer: CustomerDetails;
  onOpenGallery: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  preset,
  paintedZones,
  usedColors,
  customer,
  onOpenGallery,
}) => {
  const [phase, setPhase] = useState<'saving' | 'complete'>('saving');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPhase('saving');
      // Mimic video's "Saving to gallery..." animation timing (800ms)
      const timer = setTimeout(() => {
        setPhase('complete');
        generateDownloadablePreview();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const generateDownloadablePreview = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (canvas) {
      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.95));
    }
  };

  const downloadHighResImage = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `Bihani_Makeover_${customer.name.replace(/\s+/g, '_')}_${preset.name.replace(/\s+/g, '_')}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const downloadSideBySideCard = () => {
    const originalImg = new Image();
    originalImg.crossOrigin = 'anonymous';
    originalImg.src = preset.imageSrc;

    originalImg.onload = () => {
      const activeCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (!activeCanvas) return;

      const exportCanvas = document.createElement('canvas');
      const w = activeCanvas.width;
      const h = activeCanvas.height;
      exportCanvas.width = w * 2 + 40;
      exportCanvas.height = h + 180;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      // Clean white background card
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Header Brand
      ctx.fillStyle = '#0f3f45';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('BIHANI PAINTS — COLOR VISUALIZER SPECIFICATION', 24, 42);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Client: ${customer.name.toUpperCase()}  |  Location: ${customer.address}  |  Contact: ${customer.contact}`, 24, 70);

      // Draw original on left
      ctx.drawImage(originalImg, 20, 95, w, h);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(28, 105, 90, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('ORIGINAL', 38, 122);

      // Draw painted on right
      ctx.drawImage(activeCanvas, w + 20, 95, w, h);
      ctx.fillStyle = 'rgba(20,122,130,0.85)';
      ctx.fillRect(w + 28, 105, 90, 26);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PAINTED', w + 44, 122);

      // Footer with used color codes
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('SELECTED BIHANI SHADE SPECIFICATIONS:', 24, h + 130);

      let offsetX = 24;
      usedColors.forEach((c) => {
        ctx.fillStyle = c.hex;
        ctx.fillRect(offsetX, h + 142, 22, 22);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${c.code} (${c.name})`, offsetX + 30, h + 158);
        offsetX += 240;
      });

      const link = document.createElement('a');
      link.download = `Bihani_JobSheet_${customer.name}_${Date.now()}.jpg`;
      link.href = exportCanvas.toDataURL('image/jpeg', 0.95);
      link.click();
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === 'saving' ? (
          // Exact dialog matching video: Spinner + "Saving to gallery..."
          <div className="py-10 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-semibold text-slate-800">
              Saving to gallery...
            </p>
          </div>
        ) : (
          // Success State + Quick Export Options
          <div className="flex flex-col items-center">
            {/* Green check circle */}
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              House Preview Saved!
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Saved under project record for <strong className="text-slate-700 capitalize">{customer.name}</strong> ({customer.address}).
            </p>

            {/* Preview Thumbnail */}
            {previewDataUrl && (
              <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 mb-4 shadow-inner">
                <img src={previewDataUrl} alt="Saved preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Used shades list */}
            {usedColors.length > 0 && (
              <div className="w-full bg-slate-50 rounded-xl p-2.5 mb-4 border border-slate-100 flex items-center justify-between text-left text-xs">
                <span className="font-semibold text-slate-600">Selected Shades:</span>
                <div className="flex items-center gap-1.5">
                  {usedColors.map((c) => (
                    <span
                      key={c.code}
                      style={{ backgroundColor: c.hex }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-2xs"
                      title={c.name}
                    >
                      {c.code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="w-full space-y-2">
              <button
                onClick={downloadHighResImage}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Painted Image (JPG)</span>
              </button>

              <button
                onClick={downloadSideBySideCard}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
              >
                <ImageIcon className="w-4 h-4 text-teal-700" />
                <span>Download Before & After Job Sheet</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenGallery();
                }}
                className="w-full py-2 text-teal-700 hover:text-teal-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FolderHeart className="w-4 h-4" />
                <span>Open Saved Gallery</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-3 text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
