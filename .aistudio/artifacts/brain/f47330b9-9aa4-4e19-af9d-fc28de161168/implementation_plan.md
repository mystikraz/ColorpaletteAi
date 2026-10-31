# Bihani Paints AI House Color Visualizer

An interactive web application for **Bihani Paints** that empowers homeowners, architects, and paint dealers to visualize exterior and interior house colors instantly. Users can upload house photos or choose modern architectural presets, tap on specific wall segments to repaint them with preserved lighting and shadows, preview authentic Bihani paint codes, switch between before-and-after views, and generate photorealistic AI-enhanced renders for download.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions have been confirmed based on your responses:
> - **Recoloring Engine**: **Hybrid Instant Tap-to-Paint with AI Photorealistic Enhancement** — instant zero-latency canvas segment painting with realistic lighting/texture preservation, paired with an on-demand server-side Gemini AI photorealistic finish.
> - **Branding & Catalog**: **Bihani Paints** — authentic shade codes (e.g., `2434C`, `2252C`, `2412D`, `2280C`, `2474T`), official palette categories (Weatherproof Exterior, Luxury Emulsion, Pastel Nuances, Vibrant Accents), and brand visual identity.
> - **Core Workflow**: **Visualizer with Before-and-After Comparison & Image Download** — interactive split slider, used colors chip row, undo/redo history, customer job note display (as seen in the reference video), and high-resolution export.

---

## 1. Overview & Core Concept

- **What It Does**: Users upload an image of a house (or pick sample templates, including the contemporary two-story villa from the reference video), select any color from the Bihani shade library, and tap any architectural segment (main walls, accent columns, parapets, trim) to immediately recolor it. The app preserves organic wall textures, directional sunlight, and shadows. Users can slide between original and painted views, inspect used shades, and export polished before/after presentation cards.
- **Target Audience**: Homeowners choosing colors for their homes, paint dealers and color consultants guiding clients in Bharatpur and nationwide, and contractors presenting digital shade recommendations.
- **Key Value**: Replaces swatch guesswork with instant interactive digital visualization, matches the exact mobile touch UX demonstrated in the reference video, and guarantees crisp edge boundaries without spilling onto windows, doors, lawns, or sky.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Photo Ingestion**:
   - Upload any exterior or interior house photo (JPEG, PNG, WebP) with drag-and-drop or camera capture.
   - Or choose from pre-calibrated architectural presets (including the white contemporary villa featured in the reference video).
2. **Interactive Tap-to-Paint**:
   - Tap **"Select Color"** to open the Bihani Color Palette modal. Search by shade code or browse categorized swatches.
   - Tap on any wall section on the canvas. The engine detects architectural boundaries and recolors the segment instantly using multiply/luminosity shadow preservation.
   - The selected shade is added to the **"Used Colors"** quick-access bar beneath the viewer for rapid multi-tone styling (e.g. primary wall, accent band, balcony parapet).
3. **Comparison & Verification**:
   - Tap **"Original"** thumbnail for a quick glance back, or switch on the interactive **Before / After Split Slider** to inspect precision edge fidelity.
   - Undo and Redo buttons allow risk-free experimentation across previous color iterations.
4. **AI Photorealistic Refinement**:
   - Tap **"AI Realistic Finish"** to trigger a server-side Gemini multimodal pass that refines micro-textures, specular highlights, and paint sheen (matte, eggshell, satin, or gloss).
5. **Customer Details & Gallery Save**:
   - Customer info drawer (Name, Address, Contact, Dates) matching the reference video.
   - Tap **"Save"** to trigger the animated "Saving to gallery..." dialog and toast, and download high-resolution PNGs or side-by-side comparison sheets.

### Visual Identity & Theme

- **Aesthetic Direction**: Crisp, modern Nepalese paint brand UI with professional colorimetry aesthetics. Clean white canvas (`bg-slate-50`), rich slate typography, and vibrant Bihani teal accents (`#0f766e` / `#0d9488`).
- **Typography**: `Plus Jakarta Sans` for clean, professional headers and wordmarks; `Manrope` for legible body prose; tabular numerals (`font-mono`) for exact color codes and phone numbers.
- **Zero-Pill Discipline**: Metadata (shade names, customer details, timestamps) rendered in clean unboxed typography with typographic dot separators (`·`). Buttons and swatches are functional tactile controls with subtle shadows.
- **Mobile & Desktop Presence**: Mobile-first ergonomics with minimum 44px touch hitboxes for one-handed operation, expanding elegantly into a balanced dual-column studio on desktop (viewer canvas on left, swatch & project control palette on right).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid Instant Tap-to-Paint + AI Enhancement Pass
- **Chosen Approach**: Combine an instant client-side HTML5 Canvas segmentation engine with an optional server-side Gemini AI photorealistic enhancement pass (`gemini-3.8-flash` via `@google/genai`).
- **Why**: Pure AI generation takes several seconds per color change, which breaks the playful, snappy tap-to-paint feeling shown in the reference video. The client canvas provides zero-latency (<16ms) instant repainting on tap, while the AI button delivers magazine-quality photorealistic rendering on demand.
- **Alternatives Considered**: Pure AI per click (too slow for rapid color experimentation); pure client-side without AI (misses subtle light reflections and atmospheric depth).

### Decision 2: Edge-Preserving Architectural Segmentation
- **Chosen Approach**: Intelligent flood-fill & boundary edge detection with tolerance sliders for uploaded images, complemented by exact vector segmentation masks for the built-in reference villa.
- **Why**: Ensures walls, balcony recesses, and columns can be painted independently without bleeding into wood doors, tinted windows, foliage, or sky.

### Decision 3: Authentic Bihani Paints Color Palette
- **Chosen Approach**: Curated palette containing the exact shade codes featured in the reference video (`2434C`, `2252C`, `2412D`, `2280C`, `2474T`, `2413C`, `2398C`, `2483C`, `2469C`, etc.) organized across exterior, interior, neutrals, and accents, with search-by-code functionality.
- **Why**: Provides 100% fidelity to the reference video and authentic paint retail workflows.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Bihani Paints Web Visualizer                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Bihani Paints Brand Mark ── Nav & Presets ── Export & AI Button   │
├──────────────────────────────────────┬──────────────────────────────────────┤
│          Interactive Canvas          │          Color & Tool Studio         │
│  ┌────────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │  House Image Display Canvas    │  │  │ Current Color Display          │  │
│  │  - Tap segment recoloring      │  │  │ [ Swatch Code ] [ Original ]   │  │
│  │  - Lighting/shadow layer       │  │  └────────────────────────────────┘  │
│  │  - Split Before/After Slider   │  │  ┌────────────────────────────────┐  │
│  │  - Undo / Redo / Zoom / Pan    │  │  │ Used Colors Bar (Recent chips) │  │
│  └────────────────────────────────┘  │  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │ Customer Details Panel         │  │  │ Bihani Palette Modal / Drawer  │  │
│  │ (Dilip, Bharatpur, Contact)    │  │  │ - Search by code or shade name │  │
│  └────────────────────────────────┘  │  │ - Category filter tabs         │  │
│                                      │  └────────────────────────────────┘  │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                  │
                                  ▼
               Express Server Proxy (/api/gemini/*)
                                  │
                                  ▼
                  @google/genai (Gemini 3.8 Flash)
```

### Core Data Models

- **`ColorSwatch`**:
  ```ts
  interface ColorSwatch {
    code: string;       // e.g. "2434C", "2412D"
    name: string;       // e.g. "Monsoon Teal", "Azure Sky"
    hex: string;        // e.g. "#1e6878"
    category: 'exterior' | 'interior' | 'accents' | 'pastels' | 'earth';
    sheen: 'matte' | 'satin' | 'gloss';
  }
  ```
- **`PaintedLayer`**:
  ```ts
  interface PaintedLayer {
    segmentId: string;
    color: ColorSwatch;
    maskData: ImageData | Path2D;
    timestamp: number;
  }
  ```
- **`CustomerJob`**:
  ```ts
  interface CustomerJob {
    customerName: string;
    address: string;
    contact: string;
    submittedDate: string;
    receivedDate: string;
    notes?: string;
  }
  ```

---

## 5. Verification Plan

1. **Interactive Segmentation Test**: Verify that tapping on different wall segments in the reference villa and uploaded photos recolors only the targeted wall without bleeding into windows, doors, or trees.
2. **Color Palette Test**: Verify search filtering by code (e.g., typing `2434` or `2412`) instantly filters the grid.
3. **Used Colors & History**: Verify that each applied color appears in the "Used Colors" row and clicking "Undo" reverts step by step.
4. **Before/After Split Test**: Verify smooth dragging of the comparison slider between the original house and the recolored house.
5. **AI Enhancement & Export**: Test the server-side Gemini enhancement endpoint and ensure image download outputs high-resolution results.
