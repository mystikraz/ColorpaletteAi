import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Undo, Redo, Download, ZoomIn, ZoomOut, RotateCcw, Eye, Sparkles } from 'lucide-react';
import { ArchitecturalZone, ColorSwatch, HousePreset } from '../types';
import { renderPresetRecolor, floodFillRecolor, drawSplitComparison } from '../utils/canvasColorEngine';

interface HouseCanvasProps {
  preset: HousePreset;
  activeColor: ColorSwatch;
  paintedZones: Record<string, ColorSwatch>;
  onZonePainted: (zoneId: string, color: ColorSwatch) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onReset: () => void;
  isComparisonMode: boolean;
  onOpenAiEnhance: () => void;
}

export const HouseCanvas: React.FC<HouseCanvasProps> = ({
  preset,
  activeColor,
  paintedZones,
  onZonePainted,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onReset,
  isComparisonMode,
  onOpenAiEnhance,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tapRipple, setTapRipple] = useState<{ x: number; y: number; active: boolean } | null>(null);

  // Load the current house preset image
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = preset.imageSrc;

    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error('Failed to load image:', preset.imageSrc);
      setImageLoaded(false);
    };
  }, [preset.imageSrc]);

  // Main canvas rendering function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    // Set canvas dimensions matching preset aspect ratio
    canvas.width = preset.baseWidth;
    canvas.height = preset.baseHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize offscreen buffer for painted state
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const offscreen = offscreenCanvasRef.current;
    offscreen.width = preset.baseWidth;
    offscreen.height = preset.baseHeight;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    // Render painted version to offscreen buffer
    renderPresetRecolor(
      offCtx,
      img,
      preset.zones,
      paintedZones,
      !isComparisonMode ? hoveredZone : null
    );

    if (isComparisonMode) {
      // Split Before & After view
      drawSplitComparison(ctx, img, offscreen, splitRatio);
    } else {
      // Standard interactive mode
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreen, 0, 0);
    }
  }, [preset, paintedZones, hoveredZone, isComparisonMode, splitRatio, imageLoaded]);

  // Re-render when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Helper to map click/touch coordinate to canvas space (0..1)
  const getNormalizedCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    return [normX, normY];
  };

  // Find architectural zone containing normalized coordinate
  const findZoneAtPoint = (normX: number, normY: number): ArchitecturalZone | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const pxX = normX * canvas.width;
    const pxY = normY * canvas.height;

    // Check zones in reverse so front layers take precedence
    for (let i = preset.zones.length - 1; i >= 0; i--) {
      const zone = preset.zones[i];
      const poly = zone.points.map(([x, y]) => [x * canvas.width, y * canvas.height] as [number, number]);

      // Point-in-polygon test
      let inside = false;
      for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
        const xi = poly[a][0], yi = poly[a][1];
        const xj = poly[b][0], yj = poly[b][1];
        const intersect = ((yi > pxY) !== (yj > pxY)) && (pxX < ((xj - xi) * (pxY - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }

      if (inside) return zone;
    }
    return null;
  };

  // Canvas click / tap handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isComparisonMode) return;

    const coords = getNormalizedCoordinates(e);
    if (!coords) return;

    const [normX, normY] = coords;
    const zone = findZoneAtPoint(normX, normY);

    // Trigger visual ripple effect
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setTapRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      });
      setTimeout(() => setTapRipple(null), 400);
    }

    if (zone) {
      onZonePainted(zone.id, activeColor);
    } else if (preset.id === 'custom_upload') {
      // Fallback for custom uploaded photo: flood-fill clicked wall
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const pxX = Math.round(normX * canvas.width);
          const pxY = Math.round(normY * canvas.height);
          floodFillRecolor(ctx, pxX, pxY, activeColor);
          onZonePainted(`custom_${Date.now()}`, activeColor);
        }
      }
    }
  };

  // Hover detection for architectural zone outline
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isComparisonMode) {
      if (isDraggingSplit) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const ratio = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
          setSplitRatio(ratio);
        }
      }
      return;
    }

    const coords = getNormalizedCoordinates(e);
    if (!coords) {
      setHoveredZone(null);
      return;
    }

    const [normX, normY] = coords;
    const zone = findZoneAtPoint(normX, normY);
    setHoveredZone(zone ? zone.id : null);
  };

  // Touch split dragging
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isComparisonMode && isDraggingSplit) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && e.touches[0]) {
        const ratio = Math.max(0.05, Math.min(0.95, (e.touches[0].clientX - rect.left) / rect.width));
        setSplitRatio(ratio);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Canvas Container */}
      <div className="relative w-full max-w-xl mx-auto bg-slate-900/5 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 aspect-4/3 flex items-center justify-center">
        {!imageLoaded ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-600">Loading house image...</p>
          </div>
        ) : (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseDown={() => isComparisonMode && setIsDraggingSplit(true)}
              onMouseUp={() => isComparisonMode && setIsDraggingSplit(false)}
              onMouseLeave={() => {
                setHoveredZone(null);
                setIsDraggingSplit(false);
              }}
              onTouchStart={() => isComparisonMode && setIsDraggingSplit(true)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => isComparisonMode && setIsDraggingSplit(false)}
              className={`w-full h-full object-contain ${
                isComparisonMode ? 'cursor-ew-resize' : 'cursor-crosshair'
              }`}
            />

            {/* Tap indicator ripple animation */}
            {tapRipple && tapRipple.active && (
              <span
                className="absolute w-8 h-8 rounded-full border-2 border-teal-400 bg-teal-400/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping"
                style={{ left: tapRipple.x, top: tapRipple.y }}
              />
            )}
          </div>
        )}

        {/* Floating Zoom and Reset Controls (top right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-1.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
            className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
            className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hovered Zone Name badge (bottom left) */}
        {hoveredZone && !isComparisonMode && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xs pointer-events-none">
            {preset.zones.find((z) => z.id === hoveredZone)?.name || 'Architectural Segment'}
          </div>
        )}
      </div>

      {/* Toolbar underneath image matching video: Undo, Redo, Save */}
      <div className="w-full max-w-xl mx-auto mt-2 px-2 flex items-center justify-end gap-6 py-1">
        {/* Undo button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex flex-col items-center gap-0.5 text-xs font-semibold cursor-pointer transition-colors ${
            canUndo ? 'text-slate-700 hover:text-teal-700' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Undo previous color change"
        >
          <Undo className="w-4 h-4" />
          <span className="text-[11px]">Undo</span>
        </button>

        {/* Redo button */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex flex-col items-center gap-0.5 text-xs font-semibold cursor-pointer transition-colors ${
            canRedo ? 'text-slate-700 hover:text-teal-700' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Redo color change"
        >
          <Redo className="w-4 h-4" />
          <span className="text-[11px]">Redo</span>
        </button>

        {/* Save button */}
        <button
          onClick={onSave}
          className="flex flex-col items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-teal-700 cursor-pointer transition-colors"
          title="Save house preview to gallery and download"
        >
          <Download className="w-4 h-4" />
          <span className="text-[11px]">Save</span>
        </button>
      </div>
    </div>
  );
};
