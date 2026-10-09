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
 * Note: Needs fine-tuning based on actual UI resolutions.
 */
export const GENSHIN_1080P_GRID: GridConfig = {
  columns: 7,
  rows: 4,
  startX: 240,   // approximate X start
  startY: 180,   // approximate Y start
  cellWidth: 120,
  cellHeight: 140,
  gapX: 16,
  gapY: 16,
};

export async function sliceGridFromImage(
  file: File, 
  config: GridConfig = GENSHIN_1080P_GRID
): Promise<{ icon: ImageBitmap, quantityArea: ImageBitmap }[]> {
  const imageBitmap = await createImageBitmap(file);
  
  // TODO: Scale calculations if image is not exactly 1920x1080
  const scaleX = imageBitmap.width / 1920;
  const scaleY = imageBitmap.height / 1080;

  const cells: { icon: ImageBitmap, quantityArea: ImageBitmap }[] = [];

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.columns; col++) {
      const x = (config.startX + col * (config.cellWidth + config.gapX)) * scaleX;
      const y = (config.startY + row * (config.cellHeight + config.gapY)) * scaleY;
      const w = config.cellWidth * scaleX;
      const h = config.cellHeight * scaleY;

      // Extract just the inner icon (ignoring borders and quantity)
      const iconRect = {
        x: x + w * 0.1,
        y: y + h * 0.1,
        width: w * 0.8,
        height: h * 0.6 // Top 60% contains the icon
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
