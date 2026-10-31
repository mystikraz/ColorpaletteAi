import { HousePreset } from '../types';

export const HOUSE_PRESETS: HousePreset[] = [
  {
    id: 'bihani_villa_modern',
    name: 'Modern Two-Story Villa',
    tagline: 'Featured in Bihani Visualizer Video',
    category: 'exterior',
    imageSrc: '/house_sample_1.jpg',
    baseWidth: 504,
    baseHeight: 410,
    zones: [
      {
        id: 'zone_main_facade',
        name: 'Main Ground Floor Facade',
        defaultColorHex: '#f4f5f7',
        depthShadow: 0.85,
        points: [
          [0.08, 0.66],
          [0.55, 0.66],
          [0.55, 0.95],
          [0.08, 0.95]
        ]
      },
      {
        id: 'zone_balcony_left',
        name: 'Upper Left Bedroom & Balcony',
        defaultColorHex: '#f4f5f7',
        depthShadow: 0.8,
        points: [
          [0.07, 0.28],
          [0.39, 0.28],
          [0.39, 0.66],
          [0.07, 0.66]
        ]
      },
      {
        id: 'zone_center_groove',
        name: 'Center Textured Groove Panel',
        defaultColorHex: '#f4f5f7',
        depthShadow: 0.9,
        points: [
          [0.38, 0.38],
          [0.55, 0.38],
          [0.55, 0.66],
          [0.38, 0.66]
        ]
      },
      {
        id: 'zone_tower_pillar',
        name: 'Right Vertical Staircase Tower',
        defaultColorHex: '#f4f5f7',
        depthShadow: 0.85,
        points: [
          [0.54, 0.12],
          [0.74, 0.12],
          [0.74, 0.95],
          [0.54, 0.95]
        ]
      },
      {
        id: 'zone_right_balcony',
        name: 'Right Balcony & Column',
        defaultColorHex: '#f4f5f7',
        depthShadow: 0.85,
        points: [
          [0.73, 0.28],
          [0.87, 0.28],
          [0.87, 0.95],
          [0.73, 0.95]
        ]
      },
      {
        id: 'zone_roof_parapet',
        name: 'Top Roof Parapet & Cornice Trim',
        defaultColorHex: '#ffffff',
        depthShadow: 0.7,
        points: [
          [0.06, 0.26],
          [0.40, 0.26],
          [0.40, 0.31],
          [0.06, 0.31]
        ]
      }
    ]
  }
];
