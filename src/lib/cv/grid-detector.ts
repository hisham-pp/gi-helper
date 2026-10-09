export interface GridCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridConfig {
  columns: number;
  rows: number;
  startX: number;
  startY: number;
  cellWidth: number;
  cellHeight: number;
  gapX: number;
  gapY: number;
}

/**
 * Standard 16:9 Genshin Inventory layout approximations (scaled to 1920x1080)
 */
export const GENSHIN_1080P_GRID: GridConfig = {
  columns: 7,
  rows: 4,
  startX: 240,   
  startY: 180,   
  cellWidth: 120,
  cellHeight: 140,
  gapX: 16,
  gapY: 16,
};

/**
 * Automatically calculates the perfect grid configuration for any given image
 * resolution and aspect ratio (e.g., 4K, 1440p, Ultrawide 21:9, Mobile).
 * Genshin Impact scales its UI based on the screen's height.
 */
export function autoDetectGrid(width: number, height: number): GridConfig {
  // UI scales based on height relative to 1080p
  const scale = height / 1080;

  // Calculate the 16:9 safe zone (Genshin anchors its UI to a 16:9 center on ultrawide displays)
  const safeZoneWidth = height * (16 / 9);
  
  // Calculate horizontal pillarbox if aspect ratio is wider than 16:9
  const emptySpaceX = Math.max(0, width - safeZoneWidth) / 2;

  // Base 1080p constants
  const baseCellWidth = 120;
  const baseCellHeight = 140;
  const baseGapX = 16;
  const baseGapY = 16;
  const baseColumns = 7;
  const baseRows = Math.floor((height - (180 * scale)) / ((baseCellHeight + baseGapY) * scale)); // Dynamically count visible rows

  // Calculate scaled configuration
  return {
    columns: baseColumns,
    rows: Math.min(5, Math.max(3, baseRows)), // usually 4 rows are fully visible, sometimes 5 on weird ratios
    startX: Math.round(emptySpaceX + (240 * scale)),
    startY: Math.round(180 * scale),
    cellWidth: Math.round(baseCellWidth * scale),
    cellHeight: Math.round(baseCellHeight * scale),
    gapX: Math.round(baseGapX * scale),
    gapY: Math.round(baseGapY * scale),
  };
}

export async function sliceGridFromImage(
  file: File, 
  config?: GridConfig
): Promise<{ icon: ImageBitmap, quantityArea: ImageBitmap }[]> {
  const imageBitmap = await createImageBitmap(file);
  
  // If no config provided, auto-calculate it based on the image dimensions
  const activeConfig = config || autoDetectGrid(imageBitmap.width, imageBitmap.height);

  const cells: { icon: ImageBitmap, quantityArea: ImageBitmap }[] = [];

  for (let row = 0; row < activeConfig.rows; row++) {
    for (let col = 0; col < activeConfig.columns; col++) {
      const x = activeConfig.startX + col * (activeConfig.cellWidth + activeConfig.gapX);
      const y = activeConfig.startY + row * (activeConfig.cellHeight + activeConfig.gapY);
      const w = activeConfig.cellWidth;
      const h = activeConfig.cellHeight;

      // Extract just the inner icon (ignoring borders and quantity)
      const iconRect = {
        x: x + w * 0.15,
        y: y + h * 0.15,
        width: w * 0.7,
        height: h * 0.55 // Tighter crop to remove rarity background
      };

      // Extract just the bottom strip for the quantity number
      const quantityRect = {
        x: x + w * 0.1,
        y: y + h * 0.75,
        width: w * 0.8,
        height: h * 0.2 // Bottom 20% contains the number
      };

      try {
        const iconSlice = await createImageBitmap(
          imageBitmap, 
          iconRect.x, iconRect.y, iconRect.width, iconRect.height
        );
        const quantitySlice = await createImageBitmap(
          imageBitmap,
          quantityRect.x, quantityRect.y, quantityRect.width, quantityRect.height
        );
        
        cells.push({ icon: iconSlice, quantityArea: quantitySlice });
      } catch (e) {
        console.error("Failed to slice cell", e);
      }
    }
  }

  return cells;
}
