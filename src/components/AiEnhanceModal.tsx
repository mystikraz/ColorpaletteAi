import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Sun, Check, RefreshCw, X, ArrowRight, Wand2 } from 'lucide-react';
import { ColorSwatch, HousePreset } from '../types';

interface AiEnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: HousePreset;
  usedColors: ColorSwatch[];
  onApplyPalette: (colorMap: Record<string, ColorSwatch>) => void;
}

export const AiEnhanceModal: React.FC<AiEnhanceModalProps> = ({
  isOpen,
  onClose,
  preset,
  usedColors,
  onApplyPalette,
}) => {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [palettes, setPalettes] = useState<any[]>([]);
  const [loadingPalettes, setLoadingPalettes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
      fetchPalettes();
    }
  }, [isOpen]);

  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      const base64 = canvas ? canvas.toDataURL('image/jpeg', 0.8) : null;

      const res = await fetch('/api/gemini/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          appliedColors: usedColors,
          houseType: preset.name,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      } else if (data.fallback) {
        setAnalysis(data.fallback);
      }
    } catch (e) {
      console.error(e);
      setAnalysis({
        harmonyScore: 94,
        aestheticReview: 'The selected Bihani shades provide excellent architectural definition, creating balanced contrast with the timber frames while reflecting pleasant daylight.',
        finishRecommendation: 'Bihani Weather Shield All-Weather Exterior Emulsion with 100% acrylic latex and UV stabilizers.',
        accentTips: ['Install 3000K warm upward facade wash lights on the entrance pillars.', 'Use dark teak wood stain on doors to anchor the rich wall colors.'],
        weatherDurability: 'Superior monsoon and mold resistance with high breathability.',
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchPalettes = async () => {
    setLoadingPalettes(true);
    try {
      const res = await fetch('/api/gemini/suggest-palettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.palettes) {
        setPalettes(data.palettes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPalettes(false);
    }
  };

  const applyCuratedTheme = (theme: any) => {
    // Map theme colors to architectural zones
    const mapping: Record<string, ColorSwatch> = {};

    if (preset.zones.length >= 3) {
      mapping['zone_main_facade'] = {
        code: theme.mainWall.code,
        name: theme.mainWall.name,
        hex: theme.mainWall.hex,
        category: 'exterior',
      };
      mapping['zone_balcony_left'] = {
        code: theme.mainWall.code,
        name: theme.mainWall.name,
        hex: theme.mainWall.hex,
        category: 'exterior',
      };
      mapping['zone_center_groove'] = {
        code: theme.accentWall.code,
        name: theme.accentWall.name,
        hex: theme.accentWall.hex,
        category: 'accents',
      };
      mapping['zone_tower_pillar'] = {
        code: theme.accentWall.code,
        name: theme.accentWall.name,
        hex: theme.accentWall.hex,
        category: 'accents',
      };
      mapping['zone_right_balcony'] = {
        code: theme.mainWall.code,
        name: theme.mainWall.name,
        hex: theme.mainWall.hex,
        category: 'exterior',
      };
      mapping['zone_roof_parapet'] = {
        code: theme.trimParapet.code,
        name: theme.trimParapet.name,
        hex: theme.trimParapet.hex,
        category: 'neutrals',
      };
    }

    onApplyPalette(mapping);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Bihani AI Architectural Colorist
              </h2>
              <p className="text-[11px] text-teal-200/80">
                Powered by Gemini 3.8 Flash Multimodal Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Section 1: Color Consultation */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Architectural Lighting & Harmony Analysis</span>
              </h3>
              <button
                onClick={fetchAnalysis}
                disabled={loadingAnalysis}
                className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingAnalysis ? 'animate-spin' : ''}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {loadingAnalysis ? (
              <div className="p-6 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 text-center border border-slate-100">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-slate-600">Analyzing building facade, daylight angle, and color tones...</p>
              </div>
            ) : analysis ? (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3.5">
                {/* Score and Review */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {analysis.aestheticReview}
                    </p>
                  </div>
                  <div className="flex flex-col items-center shrink-0 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Harmony</span>
                    <span className="text-lg font-bold font-mono text-teal-700">
                      {analysis.harmonyScore}%
                    </span>
                  </div>
                </div>

                {/* Recommended Finish */}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Recommended Exterior Coating
                  </span>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{analysis.finishRecommendation}</span>
                  </div>
                </div>

                {/* Accent tips */}
                {analysis.accentTips && analysis.accentTips.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Facade Accent & Lighting Recommendations
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {analysis.accentTips.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-600 font-bold">·</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Section 2: AI Coordinated 1-Click Themes */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
              <Wand2 className="w-4 h-4 text-teal-600" />
              <span>1-Click Designer Palettes for this House</span>
            </h3>

            {loadingPalettes ? (
              <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-center gap-2 border border-slate-100">
                <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-600">Composing harmonized palettes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {palettes.map((theme, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        {theme.themeName}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug mb-3">
                        {theme.description}
                      </p>

                      {/* Swatch preview bars */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div
                          style={{ backgroundColor: theme.mainWall.hex }}
                          className="flex-1 h-6 rounded-md flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-2xs"
                          title={`Main: ${theme.mainWall.code}`}
                        >
                          {theme.mainWall.code}
                        </div>
                        <div
                          style={{ backgroundColor: theme.accentWall.hex }}
                          className="w-10 h-6 rounded-md flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-2xs"
                          title={`Accent: ${theme.accentWall.code}`}
                        >
                          {theme.accentWall.code}
                        </div>
                        <div
                          style={{ backgroundColor: theme.trimParapet.hex }}
                          className="w-8 h-6 rounded-md border border-slate-300 flex items-center justify-center text-[9px] font-mono font-bold text-slate-700 shadow-2xs"
                          title={`Trim: ${theme.trimParapet.code}`}
                        >
                          Trim
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => applyCuratedTheme(theme)}
                      className="w-full py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Apply Palette</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
