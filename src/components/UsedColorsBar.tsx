import React from 'react';
import { History, Check } from 'lucide-react';
import { ColorSwatch } from '../types';

interface UsedColorsBarProps {
  usedColors: ColorSwatch[];
  activeColor: ColorSwatch;
  onSelectColor: (color: ColorSwatch) => void;
}

export const UsedColorsBar: React.FC<UsedColorsBarProps> = ({
  usedColors,
  activeColor,
  onSelectColor,
}) => {
  if (usedColors.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-3 px-1">
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Header matching video: history icon + "Used Colors" */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <History className="w-4 h-4 text-teal-700" />
          <span className="text-[12px] font-bold text-slate-800 tracking-tight">
            Used Colors
          </span>
          <span className="text-[11px] text-slate-400 font-medium ml-auto">
            {usedColors.length} applied
          </span>
        </div>

        {/* Horizontal scrollable swatch chips matching video */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {usedColors.map((color) => {
            const isSelected = activeColor.code === color.code;
            return (
              <button
                key={color.code}
                onClick={() => onSelectColor(color)}
                style={{ backgroundColor: color.hex }}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-white font-mono font-bold text-xs tracking-wider shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 relative border ${
                  isSelected ? 'border-teal-400 ring-2 ring-teal-500/40' : 'border-transparent'
                }`}
                title={`${color.code} - ${color.name}`}
              >
                {isSelected && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
                <span>{color.code}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
