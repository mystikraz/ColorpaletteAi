import { ArchitecturalZone, ColorSwatch } from '../types';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RgbColor {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function pointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Classifies if a pixel is a wall surface vs wooden trim, window glass, grass or sky.
 * Protects wood doors/frames, window reflection, and greenery from accidental recoloring.
 */
function isWallPixel(r: number, g: number, b: number): boolean {
  // Wood door & window frames: warm brownish tones (R significantly higher than B, high warmth)
  const isWood = (r > 60 && r > g * 1.15 && g > b * 1.1 && (r - b) > 35);
  if (isWood) return false;

  // Window frame dark trims
  const isDarkTrim = (r < 45 && g < 45 && b < 45);
  if (isDarkTrim) return false;

  // Sky: strong blue saturation (B > R + 25)
  const isSky = (b > 130 && b > r + 30 && b > g + 15);
  if (isSky) return false;

  // Lawn / Garden: distinct green (G > R + 15 && G > B + 15)
  const isGrass = (g > 60 && g > r + 15 && g > b + 15);
  if (isGrass) return false;

  // Very dark shadow voids
  if (r < 30 && g < 30 && b < 30) return false;

  return true;
}

/**
 * Repaints zones on the canvas based on preset architectural definitions.
 */
export function renderPresetRecolor(
  ctx: CanvasRenderingContext2D,
  originalImg: HTMLImageElement,
  zones: ArchitecturalZone[],
  paintedZones: Record<string, ColorSwatch>,
  activeZoneId?: string | null
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Draw base original photo
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(originalImg, 0, 0, width, height);

  // If no zones are painted, return base
  const paintedKeys = Object.keys(paintedZones);
  if (paintedKeys.length === 0 && !activeZoneId) {
    return;
  }

  // Get raw pixel data from original image
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Process painted zones
  for (const zone of zones) {
    const color = paintedZones[zone.id];
    if (!color) continue;

    const rgb = hexToRgb(color.hex);
    const poly = zone.points.map(([px, py]) => [px * width, py * height] as [number, number]);

    // Calculate bounding box for polygon to optimize loop
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (const [x, y] of poly) {
      if (x < minX) minX = Math.floor(x);
      if (x > maxX) maxX = Math.ceil(x);
      if (y < minY) minY = Math.floor(y);
      if (y > maxY) maxY = Math.ceil(y);
    }
    minX = Math.max(0, minX);
    maxX = Math.min(width - 1, maxX);
    minY = Math.max(0, minY);
    maxY = Math.min(height - 1, maxY);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (!pointInPolygon([x, y], poly)) continue;

        const idx = (y * width + x) * 4;
        const origR = data[idx];
        const origG = data[idx + 1];
        const origB = data[idx + 2];

        // Only recolor wall pixels, keep windows/wood/shadows untouched
        if (!isWallPixel(origR, origG, origB)) continue;

        // Relative luminance of the surface (0..1)
        const lum = (0.299 * origR + 0.587 * origG + 0.114 * origB) / 255;

        // Blend with target paint color while preserving highlights & shadows
        // Realistic paint formula: color * luminance multiplier with subtle contrast
        const lumMultiplier = Math.pow(lum, 0.95) * 1.15;
        const newR = Math.min(255, Math.max(0, rgb.r * lumMultiplier));
        const newG = Math.min(255, Math.max(0, rgb.g * lumMultiplier));
        const newB = Math.min(255, Math.max(0, rgb.b * lumMultiplier));

        // Smooth blend with original
        const alpha = 0.92;
        data[idx] = Math.round(newR * alpha + origR * (1 - alpha));
        data[idx + 1] = Math.round(newG * alpha + origG * (1 - alpha));
        data[idx + 2] = Math.round(newB * alpha + origB * (1 - alpha));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // If a zone is hovered/active, draw a subtle architectural guideline
  if (activeZoneId) {
    const activeZone = zones.find(z => z.id === activeZoneId);
    if (activeZone) {
      ctx.save();
      ctx.beginPath();
      const first = activeZone.points[0];
      ctx.moveTo(first[0] * width, first[1] * height);
      for (let i = 1; i < activeZone.points.length; i++) {
        const pt = activeZone.points[i];
        ctx.lineTo(pt[0] * width, pt[1] * height);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(20, 122, 130, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();

      ctx.fillStyle = 'rgba(20, 122, 130, 0.12)';
      ctx.fill();
      ctx.restore();
    }
  }
}

/**
 * Flood-fills a wall area on an uploaded image starting from a user tap coordinate.
 */
export function floodFillRecolor(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetColor: ColorSwatch,
  tolerance: number = 38
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const startIdx = (startY * width + startX) * 4;
  const baseR = data[startIdx];
  const baseG = data[startIdx + 1];
  const baseB = data[startIdx + 2];

  // Protect non-wall pixels
  if (!isWallPixel(baseR, baseG, baseB)) return;

  const rgb = hexToRgb(targetColor.hex);
  const visited = new Uint8Array(width * height);
  const queue: [number, number][] = [[startX, startY]];

  visited[startY * width + startX] = 1;

  function colorMatch(idx: number): boolean {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    if (!isWallPixel(r, g, b)) return false;

    const diff = Math.sqrt(
      (r - baseR) ** 2 +
      (g - baseG) ** 2 +
      (b - baseB) ** 2
    );
    return diff <= tolerance;
  }

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const idx = (y * width + x) * 4;
    const origR = data[idx];
    const origG = data[idx + 1];
    const origB = data[idx + 2];

    const lum = (0.299 * origR + 0.587 * origG + 0.114 * origB) / 255;
    const lumMultiplier = Math.pow(lum, 0.95) * 1.15;
    const newR = Math.min(255, Math.max(0, rgb.r * lumMultiplier));
    const newG = Math.min(255, Math.max(0, rgb.g * lumMultiplier));
    const newB = Math.min(255, Math.max(0, rgb.b * lumMultiplier));

    const alpha = 0.9;
    data[idx] = Math.round(newR * alpha + origR * (1 - alpha));
    data[idx + 1] = Math.round(newG * alpha + origG * (1 - alpha));
    data[idx + 2] = Math.round(newB * alpha + origB * (1 - alpha));

    // Neighbors 4-connectivity
    const neighbors: [number, number][] = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (colorMatch(nIdx)) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Draws the interactive before-and-after split view with draggable separator line.
 */
export function drawSplitComparison(
  targetCtx: CanvasRenderingContext2D,
  originalImg: HTMLImageElement,
  paintedCanvas: HTMLCanvasElement,
  splitRatio: number = 0.5
): void {
  const width = targetCtx.canvas.width;
  const height = targetCtx.canvas.height;
  const splitX = Math.round(width * splitRatio);

  targetCtx.clearRect(0, 0, width, height);

  // Draw original image on the left side
  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.rect(0, 0, splitX, height);
  targetCtx.clip();
  targetCtx.drawImage(originalImg, 0, 0, width, height);
  targetCtx.restore();

  // Draw painted canvas on the right side
  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.rect(splitX, 0, width - splitX, height);
  targetCtx.clip();
  targetCtx.drawImage(paintedCanvas, 0, 0, width, height);
  targetCtx.restore();

  // Draw vertical separator line
  targetCtx.save();
  targetCtx.strokeStyle = '#ffffff';
  targetCtx.lineWidth = 3;
  targetCtx.shadowColor = 'rgba(0,0,0,0.5)';
  targetCtx.shadowBlur = 4;
  targetCtx.beginPath();
  targetCtx.moveTo(splitX, 0);
  targetCtx.lineTo(splitX, height);
  targetCtx.stroke();

  // Draw handle icon in center
  const centerY = height / 2;
  targetCtx.fillStyle = '#ffffff';
  targetCtx.beginPath();
  targetCtx.arc(splitX, centerY, 16, 0, Math.PI * 2);
  targetCtx.fill();

  targetCtx.fillStyle = '#147a82';
  targetCtx.font = 'bold 12px sans-serif';
  targetCtx.textAlign = 'center';
  targetCtx.textBaseline = 'middle';
  targetCtx.fillText('‹ ›', splitX, centerY);

  // Labels: Original vs Painted
  targetCtx.font = '600 11px sans-serif';
  targetCtx.fillStyle = 'rgba(0,0,0,0.6)';
  targetCtx.fillRect(12, 12, 64, 22);
  targetCtx.fillStyle = '#ffffff';
  targetCtx.fillText('ORIGINAL', 44, 27);

  targetCtx.fillStyle = 'rgba(20,122,130,0.85)';
  targetCtx.fillRect(width - 86, 12, 74, 22);
  targetCtx.fillStyle = '#ffffff';
  targetCtx.fillText('PAINTED', width - 49, 27);

  targetCtx.restore();
}
