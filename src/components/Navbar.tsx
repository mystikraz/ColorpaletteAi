import React from 'react';
import { ArrowLeft, Sparkles, SlidersHorizontal, FolderHeart, Upload, Home } from 'lucide-react';
import { HousePreset } from '../types';

interface NavbarProps {
  currentPreset: HousePreset;
  presets: HousePreset[];
  onSelectPreset: (preset: HousePreset) => void;
  onUploadCustomPhoto: (file: File) => void;
  isComparisonMode: boolean;
  onToggleComparison: () => void;
  onOpenAiEnhance: () => void;
  onOpenGallery: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPreset,
  presets,
  onSelectPreset,
  onUploadCustomPhoto,
  isComparisonMode,
  onToggleComparison,
  onOpenAiEnhance,
  onOpenGallery,
  savedCount,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomPhoto(e.target.files[0]);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top App Bar matching reference video styling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Video's authentic Back Arrow + "Visualize" title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-1.5 -ml-1 text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to home"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              BP
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 leading-none tracking-tight">
                Visualize
              </span>
              <span className="text-[11px] text-teal-700 font-semibold tracking-wide">
                Bihani Paints
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Preset Selector */}
          <div className="relative hidden md:block">
            <select
              value={currentPreset.id}
              onChange={(e) => {
                const found = presets.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 py-1.5 pl-3 pr-8 rounded-lg cursor-pointer transition-colors border border-transparent focus:border-teal-500 focus:outline-hidden"
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Upload own house photo"
          >
            <Upload className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">Upload Photo</span>
          </button>

          {/* Split Compare Toggle */}
          <button
            onClick={onToggleComparison}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              isComparisonMode
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
            title="Toggle Before / After Split Comparison Slider"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          {/* AI Color Consultation & Photorealistic Finish */}
          <button
            onClick={onOpenAiEnhance}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
            title="Get AI Architectural Finish Advice & Palette Recommendations"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>AI Advice</span>
          </button>

          {/* Gallery Button */}
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer relative"
            title="View saved designs"
          >
            <FolderHeart className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center -ml-0.5">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subtitle bar matching video: "Select a color and tap on image to paint it and enjoy" */}
      <div className="bg-slate-50/80 px-4 py-1.5 border-t border-slate-100">
        <p className="max-w-7xl mx-auto text-[12px] sm:text-xs text-slate-600 font-medium text-center">
          Select a color and tap on image to paint it and enjoy
        </p>
      </div>
    </header>
  );
};
