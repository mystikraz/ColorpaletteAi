import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HouseCanvas } from './components/HouseCanvas';
import { ColorSelectorBar } from './components/ColorSelectorBar';
import { UsedColorsBar } from './components/UsedColorsBar';
import { CustomerDetailsCard } from './components/CustomerDetailsCard';
import { ColorPaletteModal } from './components/ColorPaletteModal';
import { SaveModal } from './components/SaveModal';
import { AiEnhanceModal } from './components/AiEnhanceModal';
import { GalleryModal } from './components/GalleryModal';
import { BIHANI_COLORS } from './data/bihaniColors';
import { HOUSE_PRESETS } from './data/housePresets';
import { ColorSwatch, CustomerDetails, HousePreset, SavedProject } from './types';
import { Check } from 'lucide-react';

const STORAGE_SAVED_PROJECTS = 'bihani_paints_saved_projects_v1';
const STORAGE_CUSTOMER_INFO = 'bihani_paints_customer_info_v1';

export const App: React.FC = () => {
  // Presets & Active State
  const [presets, setPresets] = useState<HousePreset[]>(HOUSE_PRESETS);
  const [currentPreset, setCurrentPreset] = useState<HousePreset>(HOUSE_PRESETS[0]);

  // Active Selected Color (defaulting to 2434C from the reference video)
  const [activeColor, setActiveColor] = useState<ColorSwatch>(BIHANI_COLORS[0]);

  // Map of zoneId -> ColorSwatch
  const [paintedZones, setPaintedZones] = useState<Record<string, ColorSwatch>>({});

  // Used Colors history row
  const [usedColors, setUsedColors] = useState<ColorSwatch[]>([]);

  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<Array<{ paintedZones: Record<string, ColorSwatch>; usedColors: ColorSwatch[] }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ paintedZones: Record<string, ColorSwatch>; usedColors: ColorSwatch[] }>>([]);

  // Customer details (exact default from video)
  const [customer, setCustomer] = useState<CustomerDetails>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOMER_INFO);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'dilip',
      address: 'bharatpur',
      contact: '9855024639',
      submittedDate: 'Sep 28, 2026',
      receivedDate: 'Sep 28, 2026',
      notes: 'Exterior front elevation recoloring with Bihani Weatherproof Emulsion',
    };
  });

  // Saved Projects Gallery
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Modal Visibility States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAiEnhanceOpen, setIsAiEnhanceOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Interactive View Modes
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [isViewingOriginal, setIsViewingOriginal] = useState(false);

  // Video-authentic Save Toast notification
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Save customer info to local storage
  const handleUpdateCustomer = (updated: CustomerDetails) => {
    setCustomer(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOMER_INFO, JSON.stringify(updated));
    } catch {}
  };

  // Push current state to undo history before mutative change
  const recordHistory = useCallback(() => {
    setUndoStack((prev) => [
      ...prev.slice(-25), // keep last 25 steps
      { paintedZones: { ...paintedZones }, usedColors: [...usedColors] },
    ]);
    setRedoStack([]); // clear redo stack on new action
  }, [paintedZones, usedColors]);

  // Handle painting a specific architectural zone on tap
  const handleZonePainted = (zoneId: string, color: ColorSwatch) => {
    recordHistory();

    setPaintedZones((prev) => ({
      ...prev,
      [zoneId]: color,
    }));

    // Add to used colors if not already present
    setUsedColors((prev) => {
      if (prev.some((c) => c.code === color.code)) return prev;
      return [...prev, color];
    });
  };

  // Undo Handler
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack((prev) => [
      ...prev,
      { paintedZones: { ...paintedZones }, usedColors: [...usedColors] },
    ]);

    setPaintedZones(previousState.paintedZones);
    setUsedColors(previousState.usedColors);
    setUndoStack(newUndoStack);
  };

  // Redo Handler
  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack((prev) => [
      ...prev,
      { paintedZones: { ...paintedZones }, usedColors: [...usedColors] },
    ]);

    setPaintedZones(nextState.paintedZones);
    setUsedColors(nextState.usedColors);
    setRedoStack(newRedoStack);
  };

  // Reset / Clear all painted zones
  const handleReset = () => {
    if (Object.keys(paintedZones).length === 0) return;
    recordHistory();
    setPaintedZones({});
    setUsedColors([]);
  };

  // Toggle or glance at original
  const handleViewOriginal = () => {
    if (Object.keys(paintedZones).length === 0) return;
    setIsViewingOriginal((prev) => !prev);
  };

  // Save to Gallery & Trigger Toast matching video
  const handleSaveToGallery = () => {
    setIsSaveModalOpen(true);

    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    const thumbnail = canvas ? canvas.toDataURL('image/jpeg', 0.85) : currentPreset.imageSrc;

    const newProject: SavedProject = {
      id: `proj_${Date.now()}`,
      title: `${currentPreset.name} - ${customer.name}`,
      timestamp: Date.now(),
      imageThumbnail: thumbnail,
      presetId: currentPreset.id,
      paintedZones: (Object.entries(paintedZones) as [string, ColorSwatch][]).map(([zoneId, color]) => ({ zoneId, color })),
      usedColors: [...usedColors],
      customer: { ...customer },
    };

    const updated = [newProject, ...savedProjects];
    setSavedProjects(updated);
    try {
      localStorage.setItem(STORAGE_SAVED_PROJECTS, JSON.stringify(updated));
    } catch {}

    // Show green check toast matching video after dialog animation completes
    setTimeout(() => {
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 4500);
    }, 1200);
  };

  // Load a previously saved project
  const handleLoadProject = (project: SavedProject) => {
    const matchingPreset = presets.find((p) => p.id === project.presetId) || presets[0];
    setCurrentPreset(matchingPreset);

    const zoneMap: Record<string, ColorSwatch> = {};
    project.paintedZones.forEach((pz) => {
      zoneMap[pz.zoneId] = pz.color;
    });

    setPaintedZones(zoneMap);
    setUsedColors(project.usedColors || []);
    if (project.usedColors && project.usedColors[0]) {
      setActiveColor(project.usedColors[0]);
    }
    setCustomer(project.customer);
    setUndoStack([]);
    setRedoStack([]);
  };

  // Delete saved project
  const handleDeleteProject = (id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    try {
      localStorage.setItem(STORAGE_SAVED_PROJECTS, JSON.stringify(updated));
    } catch {}
  };

  // Handle uploading custom photo
  const handleUploadCustomPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const customPreset: HousePreset = {
        id: `custom_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, '').slice(0, 20),
        tagline: 'Custom Uploaded House Photo',
        category: 'exterior',
        imageSrc: dataUrl,
        baseWidth: 640,
        baseHeight: 480,
        zones: [],
      };
      setPresets((prev) => [customPreset, ...prev]);
      setCurrentPreset(customPreset);
      setPaintedZones({});
      setUsedColors([]);
      setUndoStack([]);
      setRedoStack([]);
    };
    reader.readAsDataURL(file);
  };

  // Apply complete AI-curated palette
  const handleApplyAiPalette = (colorMap: Record<string, ColorSwatch>) => {
    recordHistory();
    setPaintedZones(colorMap);
    const uniqueColors = Object.values(colorMap).filter(
      (v, i, a) => a.findIndex((t) => t.code === v.code) === i
    );
    setUsedColors(uniqueColors);
    if (uniqueColors[0]) {
      setActiveColor(uniqueColors[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentPreset={currentPreset}
        presets={presets}
        onSelectPreset={(preset) => {
          setCurrentPreset(preset);
          setPaintedZones({});
          setUsedColors([]);
          setUndoStack([]);
          setRedoStack([]);
        }}
        onUploadCustomPhoto={handleUploadCustomPhoto}
        isComparisonMode={isComparisonMode}
        onToggleComparison={() => setIsComparisonMode(!isComparisonMode)}
        onOpenAiEnhance={() => setIsAiEnhanceOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        savedCount={savedProjects.length}
      />

      {/* Main Visualizer Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col items-center">
        {/* Interactive Canvas Viewer */}
        <HouseCanvas
          preset={currentPreset}
          activeColor={activeColor}
          paintedZones={isViewingOriginal ? {} : paintedZones}
          onZonePainted={handleZonePainted}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSaveToGallery}
          onReset={handleReset}
          isComparisonMode={isComparisonMode}
          onOpenAiEnhance={() => setIsAiEnhanceOpen(true)}
        />

        {/* Color Selector Bar matching reference video */}
        <ColorSelectorBar
          activeColor={activeColor}
          onOpenPaletteModal={() => setIsPaletteOpen(true)}
          originalImageSrc={currentPreset.imageSrc}
          onViewOriginal={handleViewOriginal}
          hasPaintedZones={Object.keys(paintedZones).length > 0}
        />

        {/* Used Colors Row (appears once colors are applied, matching video) */}
        <UsedColorsBar
          usedColors={usedColors}
          activeColor={activeColor}
          onSelectColor={(color) => setActiveColor(color)}
        />

        {/* Customer Details Card (dilip, bharatpur, 9855024639 matching video) */}
        <CustomerDetailsCard
          customer={customer}
          onUpdateCustomer={handleUpdateCustomer}
        />
      </main>

      {/* Video-Authentic Green Check Toast: "✓ House Preview saved to gallery" */}
      {showSaveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-teal-800 text-white px-4 py-2.5 rounded-xl shadow-lg border border-teal-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
          </div>
          <span>House Preview saved to gallery</span>
        </div>
      )}

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        activeColor={activeColor}
        onSelectColor={(color) => setActiveColor(color)}
      />

      {/* Save & Export Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        preset={currentPreset}
        paintedZones={paintedZones}
        usedColors={usedColors}
        customer={customer}
        onOpenGallery={() => setIsGalleryOpen(true)}
      />

      {/* AI Architectural Finish & Consultation Modal */}
      <AiEnhanceModal
        isOpen={isAiEnhanceOpen}
        onClose={() => setIsAiEnhanceOpen(false)}
        preset={currentPreset}
        usedColors={usedColors}
        onApplyPalette={handleApplyAiPalette}
      />

      {/* Saved Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        savedProjects={savedProjects}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
};

export default App;
