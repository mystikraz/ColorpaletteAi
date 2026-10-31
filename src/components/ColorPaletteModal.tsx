import React, { useState, useMemo } from 'react';
import { Palette, Search, X, Check } from 'lucide-react';
import { BIHANI_COLORS, COLOR_CATEGORIES } from '../data/bihaniColors';
import { ColorCategory, ColorSwatch } from '../types';

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeColor: ColorSwatch;
  onSelectColor: (color: ColorSwatch) => void;
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
  isOpen,
  onClose,
  activeColor,
  onSelectColor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ColorCategory | 'all'>('all');

  const filteredColors = useMemo(() => {
    return BIHANI_COLORS.filter((color) => {
      const matchesSearch =
        color.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || color.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching video */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Color Palette
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            aria-label="Close color palette"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar matching video */}
        <div className="px-4 sm:px-5 pt-3 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by color code or name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-600 focus:bg-white transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 sm:px-5 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {COLOR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Swatch Grid matching video */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 scrollbar-thin">
          {filteredColors.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-slate-500">No Bihani shades found matching "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs font-semibold text-teal-700 hover:underline"
              >
                View all shades
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {filteredColors.map((color) => {
                const isSelected = activeColor.code === color.code;
                return (
                  <button
                    key={color.code}
                    onClick={() => {
                      onSelectColor(color);
                      onClose();
                    }}
                    style={{ backgroundColor: color.hex }}
                    className={`h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center text-white relative shadow-xs hover:scale-[1.03] active:scale-95 transition-all cursor-pointer group ${
                      isSelected ? 'ring-3 ring-teal-500 ring-offset-2' : ''
                    }`}
                    title={`${color.code} - ${color.name} (${color.category})`}
                  >
                    <span className="font-mono font-bold text-xs sm:text-sm drop-shadow-sm tracking-wider">
                      {color.code}
                    </span>
                    <span className="text-[9px] text-white/80 font-medium truncate max-w-[85%] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {color.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white text-teal-800 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{filteredColors.length} authentic Bihani shades</span>
          <span className="text-teal-700 font-medium">Click any swatch to apply</span>
        </div>
      </div>
    </div>
  );
};
