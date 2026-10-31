export type ColorCategory = 'exterior' | 'interior' | 'pastels' | 'accents' | 'neutrals' | 'earth';

export interface ColorSwatch {
  code: string;       // e.g. "2434C", "2412D", "2280C"
  name: string;       // e.g. "Monsoon Teal", "Azure Horizon"
  hex: string;        // e.g. "#1e7a82"
  category: ColorCategory;
  sheen?: 'matte' | 'eggshell' | 'satin' | 'gloss';
}

export interface ArchitecturalZone {
  id: string;
  name: string;
  // Normalized polygon coordinates (0..1) relative to image width and height
  points: [number, number][];
  defaultColorHex?: string;
  depthShadow?: number; // 0..1 multiplier for shadow preservation
}

export interface HousePreset {
  id: string;
  name: string;
  tagline: string;
  category: 'exterior' | 'interior';
  imageSrc: string;
  zones: ArchitecturalZone[];
  // Dimensions for coordinate mapping
  baseWidth: number;
  baseHeight: number;
}

export interface PaintedZone {
  zoneId: string;
  color: ColorSwatch;
}

export interface CustomerDetails {
  name: string;
  address: string;
  contact: string;
  submittedDate: string;
  receivedDate: string;
  notes?: string;
}

export interface SavedProject {
  id: string;
  title: string;
  timestamp: number;
  imageThumbnail: string; // base64 or url
  presetId?: string;
  paintedZones: PaintedZone[];
  usedColors: ColorSwatch[];
  customer: CustomerDetails;
}

export interface RecolorHistoryState {
  paintedZones: Record<string, ColorSwatch>;
  usedColors: ColorSwatch[];
}
