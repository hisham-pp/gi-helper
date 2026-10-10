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
 * Standard 16:9 Genshin Inventory layout approximations (calibrated at 1080p base: 1920x1080)
 * Scaled to 2800x1272: startX=347, startY=175, cellWidth=180, cellHeight=223, gapX=35, gapY=33
 */
export const GENSHIN_1080P_GRID: GridConfig = {
  columns: 7,
  rows: 5,
  startX: 295,
  startY: 149,
  cellWidth: 153,
  cellHeight: 189,
  gapX: 30,
  gapY: 28,
};

/**
 * Detects if the uploaded image is a single cropped material rather than a full inventory grid.
 * A full Genshin inventory grid is at least 7 columns wide (~936px minimum).
 * If the image is small (width < 650 or height < 450) or roughly square/portrait (aspect ratio < 1.25),
 * it is a single cropped material or cell.
 */
export function isSingleItemImage(width: number, height: number): boolean {
  return width < 650 || height < 450 || width / height < 1.25;
}

/**
 * Automatically calculates the calibrated grid configuration for any given image
 * resolution and aspect ratio (e.g., 4K, 1440p, Ultrawide 21:9, Mobile, or Single Item Crop).
 * Genshin Impact scales its inventory UI based on the screen's height.
 */
export function autoDetectGrid(width: number, height: number): GridConfig {
  // If the user uploaded a cropped image of a single material, treat it as 1 cell!
  if (isSingleItemImage(width, height)) {
    return {
      columns: 1,
      rows: 1,
      startX: 0,
      startY: 0,
      cellWidth: width,
      cellHeight: height,
      gapX: 0,
      gapY: 0,
    };
  }

  // UI scales based on height relative to 1080p
  const scale = height / 1080;
  const startY = Math.round(149 * scale);
  const cellH  = Math.round(189 * scale);
  const gapY   = Math.round(28 * scale);
  const maxRows = Math.floor((height - startY) / (cellH + gapY));

  // Genshin centers its 16:9 safe-zone UI within the ultrawide frame.
  // For standard 16:9 screens, emptySpaceX is 0 and startX is unchanged.
  const safeZoneWidth = height * (16 / 9);
  const emptySpaceX = Math.max(0, (width - safeZoneWidth) / 2);

  return {
    columns: 7,
    rows: Math.min(6, Math.max(3, maxRows)),
    startX: Math.round(emptySpaceX + 295 * scale),
    startY,
    cellWidth: Math.round(153 * scale),
    cellHeight: cellH,
    gapX: Math.round(30 * scale),
    gapY,
  };
}

export interface DetailedCellSlice {
  row: number;
  col: number;
  index: number;
  cellRect: { x: number; y: number; width: number; height: number };
  iconRect: { x: number; y: number; width: number; height: number };
  starRect: { x: number; y: number; width: number; height: number };
  quantityRect: { x: number; y: number; width: number; height: number };
  cellBitmap: ImageBitmap;
  iconBitmap: ImageBitmap;
  starBitmap: ImageBitmap;
  quantityBitmap: ImageBitmap;
}

export async function sliceDetailedGridFromBitmap(
  imageBitmap: ImageBitmap,
  config?: GridConfig,
): Promise<DetailedCellSlice[]> {
  const activeConfig =
    config || autoDetectGrid(imageBitmap.width, imageBitmap.height);
  const cells: DetailedCellSlice[] = [];

  // Special case: Single Item Crop (1x1)
  if (activeConfig.columns === 1 && activeConfig.rows === 1) {
    const w = imageBitmap.width;
    const h = imageBitmap.height;
    const isCellLike = h >= w * 1.05; // Portrait cell (e.g. 180x223 or 120x140)

    const cellRect = { x: 0, y: 0, width: w, height: h };
    const iconRect = isCellLike
      ? {
          x: Math.round(w * 0.06),
          y: Math.round(h * 0.05),
          width: Math.max(1, Math.round(w * 0.88)),
          height: Math.max(1, Math.round(h * 0.65)),
        }
      : {
          x: 0,
          y: 0,
          width: w,
          height: h,
        };
    const starRect = isCellLike
      ? {
          x: Math.round(w * 0.04),
          y: Math.round(h * 0.69),
          width: Math.max(1, Math.round(w * 0.92)),
          height: Math.max(1, Math.round(h * 0.17)),
        }
      : {
          x: 0,
          y: 0,
          width: w,
          height: h,
        };
    const quantityRect = {
      x: Math.round(w * 0.05),
      y: Math.round(h * 0.86),
      width: Math.max(1, Math.round(w * 0.90)),
      height: Math.max(1, Math.round(h * 0.13)),
    };

    try {
      const [cellBitmap, iconBitmap, starBitmap, quantityBitmap] = await Promise.all([
        createImageBitmap(imageBitmap, 0, 0, w, h),
        createImageBitmap(
          imageBitmap,
          iconRect.x,
          iconRect.y,
          iconRect.width,
          iconRect.height,
        ),
        createImageBitmap(
          imageBitmap,
          starRect.x,
          starRect.y,
          starRect.width,
          starRect.height,
        ),
        createImageBitmap(
          imageBitmap,
          quantityRect.x,
          quantityRect.y,
          quantityRect.width,
          quantityRect.height,
        ),
      ]);

      cells.push({
        row: 0,
        col: 0,
        index: 0,
        cellRect,
        iconRect,
        starRect,
        quantityRect,
        cellBitmap,
        iconBitmap,
        starBitmap,
        quantityBitmap,
      });
    } catch (e) {
      console.error("Failed to slice single item crop", e);
    }

    return cells;
  }

  let index = 0;

  for (let row = 0; row < activeConfig.rows; row++) {
    for (let col = 0; col < activeConfig.columns; col++) {
      const x = Math.max(
        0,
        activeConfig.startX +
          col * (activeConfig.cellWidth + activeConfig.gapX),
      );
      const y = Math.max(
        0,
        activeConfig.startY +
          row * (activeConfig.cellHeight + activeConfig.gapY),
      );
      const w = activeConfig.cellWidth;
      const h = activeConfig.cellHeight;

      const cellRect = { x, y, width: w, height: h };
      const iconRect = {
        x: Math.round(x + w * 0.06),
        y: Math.round(y + h * 0.05),
        width: Math.max(1, Math.round(w * 0.88)),
        height: Math.max(1, Math.round(h * 0.65)),
      };
      const starRect = {
        x: Math.round(x + w * 0.04),
        y: Math.round(y + h * 0.69),
        width: Math.max(1, Math.round(w * 0.92)),
        height: Math.max(1, Math.round(h * 0.17)),
      };
      const quantityRect = {
        x: Math.round(x + w * 0.05),
        y: Math.round(y + h * 0.86),
        width: Math.max(1, Math.round(w * 0.90)),
        height: Math.max(1, Math.round(h * 0.13)),
      };

      try {
        const [cellBitmap, iconBitmap, starBitmap, quantityBitmap] = await Promise.all([
          createImageBitmap(
            imageBitmap,
            cellRect.x,
            cellRect.y,
            cellRect.width,
            cellRect.height,
          ),
          createImageBitmap(
            imageBitmap,
            iconRect.x,
            iconRect.y,
            iconRect.width,
            iconRect.height,
          ),
          createImageBitmap(
            imageBitmap,
            starRect.x,
            starRect.y,
            starRect.width,
            starRect.height,
          ),
          createImageBitmap(
            imageBitmap,
            quantityRect.x,
            quantityRect.y,
            quantityRect.width,
            quantityRect.height,
          ),
        ]);

        cells.push({
          row,
          col,
          index: index++,
          cellRect,
          iconRect,
          starRect,
          quantityRect,
          cellBitmap,
          iconBitmap,
          starBitmap,
          quantityBitmap,
        });
      } catch (e) {
        console.error("Failed to slice detailed cell", row, col, e);
      }
    }
  }

  return cells;
}

export async function sliceGridFromImage(
  file: File,
  config?: GridConfig,
): Promise<
  { icon: ImageBitmap; starArea: ImageBitmap; quantityArea: ImageBitmap; cellBitmap: ImageBitmap }[]
> {
  const imageBitmap = await createImageBitmap(file);
  const detailed = await sliceDetailedGridFromBitmap(imageBitmap, config);

  return detailed.map((d) => ({
    icon: d.iconBitmap,
    starArea: d.starBitmap,
    quantityArea: d.quantityBitmap,
    cellBitmap: d.cellBitmap,
  }));
}
