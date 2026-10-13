import { GridConfig, DetailedCellSlice } from "./types";
import { calculateSafeZoneGrid } from "./safe-zone";

/**
 * Slices detailed individual cell regions from an ImageBitmap according to a GridConfig.
 */
export async function sliceDetailedGridFromBitmap(
  imageBitmap: ImageBitmap,
  config?: GridConfig,
): Promise<DetailedCellSlice[]> {
  const activeConfig =
    config || calculateSafeZoneGrid(imageBitmap.width, imageBitmap.height);
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
      width: Math.max(1, Math.round(w * 0.9)),
      height: Math.max(1, Math.round(h * 0.13)),
    };

    try {
      const [cellBitmap, iconBitmap, starBitmap, quantityBitmap] =
        await Promise.all([
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
        activeConfig.startX + col * (activeConfig.cellWidth + activeConfig.gapX),
      );
      const y = Math.max(
        0,
        activeConfig.startY + row * (activeConfig.cellHeight + activeConfig.gapY),
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
        width: Math.max(1, Math.round(w * 0.9)),
        height: Math.max(1, Math.round(h * 0.13)),
      };

      try {
        const [cellBitmap, iconBitmap, starBitmap, quantityBitmap] =
          await Promise.all([
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

/**
 * Utility to slice cells directly from a File object.
 */
export async function sliceGridFromImage(
  file: File,
  config?: GridConfig,
): Promise<
  {
    icon: ImageBitmap;
    starArea: ImageBitmap;
    quantityArea: ImageBitmap;
    cellBitmap: ImageBitmap;
    row: number;
    col: number;
    index: number;
  }[]
> {
  const imageBitmap = await createImageBitmap(file);
  const detailed = await sliceDetailedGridFromBitmap(imageBitmap, config);

  return detailed.map((d) => ({
    icon: d.iconBitmap,
    starArea: d.starBitmap,
    quantityArea: d.quantityBitmap,
    cellBitmap: d.cellBitmap,
    row: d.row,
    col: d.col,
    index: d.index,
  }));
}
