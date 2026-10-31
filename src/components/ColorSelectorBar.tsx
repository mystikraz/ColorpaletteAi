import React from 'react';
import { ColorSwatch } from '../types';

interface ColorSelectorBarProps {
  activeColor: ColorSwatch;
  onOpenPaletteModal: () => void;
  originalImageSrc: string;
  onViewOriginal: () => void;
  hasPaintedZones: boolean;
}

export const ColorSelectorBar: React.FC<ColorSelectorBarProps> = ({
  activeColor,
  onOpenPaletteModal,
  originalImageSrc,
  onViewOriginal,
  hasPaintedZones,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto mt-2 px-1 grid grid-cols-12 gap-3 items-stretch">
      {/* "Select Color (Tap to select Color)" Card */}
      <div className="col-span-8 sm:col-span-9 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-slate-700">
            Select Color <span className="text-slate-400 font-normal">(Tap to select Color)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500 uppercase">
            {activeColor.name}
          </span>
        </div>

        {/* Big Tap Button displaying active color and code */}
        <button
          onClick={onOpenPaletteModal}
          style={{ backgroundColor: activeColor.hex }}
          className="w-full h-12 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center shadow-xs hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden group"
          title="Click to open full Bihani color palette"
        >
          <span className="drop-shadow-sm font-mono tracking-wider text-sm">
            {activeColor.code}
          </span>
          <span className="absolute right-3 text-[11px] font-sans font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
            Change Color →
          </span>
        </button>
      </div>

      {/* "Original" Card with thumbnail */}
      <div className="col-span-4 sm:col-span-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between items-center text-center">
        <span className="text-[12px] font-semibold text-slate-700 mb-2">
          Original
        </span>

        <button
          onClick={onViewOriginal}
          className="w-full h-12 rounded-xl overflow-hidden border border-slate-200 hover:border-teal-500 relative cursor-pointer group transition-all"
          title="Click to toggle or glance at original unpainted house"
        >
          <img
            src={originalImageSrc}
            alt="Original house"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
          {hasPaintedZones && (
            <span className="absolute bottom-0.5 right-1 text-[9px] bg-slate-900/70 text-white px-1 rounded-sm font-medium">
              View
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
