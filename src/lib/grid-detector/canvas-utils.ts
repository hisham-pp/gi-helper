export interface CanvasAnalysisContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;
  origW: number;
  origH: number;
  targetW: number;
  targetH: number;
}

export interface ImageGradientProfiles {
  gradXProfile: Float32Array;
  gradYProfile: Float32Array;
  colVariances: Float32Array;
  rowVariances: Float32Array;
}

/**
 * Creates an analysis canvas scaled appropriately to keep CV execution < 50ms.
 */
export function createAnalysisCanvas(
  source: ImageBitmap | HTMLCanvasElement | HTMLImageElement,
  maxDim = 1400,
): CanvasAnalysisContext {
  const origW = source.width;
  const origH = source.height;

  const maxSide = Math.max(origW, origH);
  const scale = maxSide > maxDim ? maxDim / maxSide : 1.0;
  const targetW = Math.max(1, Math.round(origW * scale));
  const targetH = Math.max(1, Math.round(origH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  ctx.drawImage(source, 0, 0, targetW, targetH);
  return { canvas, ctx, scale, origW, origH, targetW, targetH };
}

/**
 * Computes luminance, horizontal and vertical edge gradients, and column/row variances.
 */
export function computeGradientsAndVariance(
  analysisCtx: CanvasAnalysisContext,
): ImageGradientProfiles {
  const { ctx, targetW, targetH } = analysisCtx;
  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  // Grayscale conversion
  const gray = new Uint8Array(targetW * targetH);
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const idx = (y * targetW + x) * 4;
      gray[y * targetW + x] = Math.round(
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2],
      );
    }
  }

  const gradXProfile = new Float32Array(targetW);
  const gradYProfile = new Float32Array(targetH);
  const colVariances = new Float32Array(targetW);
  const rowVariances = new Float32Array(targetH);

  // Column-wise gradients and luminance variance
  for (let x = 1; x < targetW - 1; x++) {
    let colGradSum = 0;
    let colLumSum = 0;
    let colLumSqSum = 0;
    for (let y = 1; y < targetH - 1; y++) {
      const cur = gray[y * targetW + x];
      const prevX = gray[y * targetW + (x - 1)];
      const nextX = gray[y * targetW + (x + 1)];
      colGradSum += Math.abs(nextX - prevX);
      colLumSum += cur;
      colLumSqSum += cur * cur;
    }
    gradXProfile[x] = colGradSum / targetH;
    const mean = colLumSum / targetH;
    colVariances[x] = Math.sqrt(Math.max(0, colLumSqSum / targetH - mean * mean));
  }

  // Row-wise gradients and luminance variance
  for (let y = 1; y < targetH - 1; y++) {
    let rowGradSum = 0;
    let rowLumSum = 0;
    let rowLumSqSum = 0;
    for (let x = 1; x < targetW - 1; x++) {
      const cur = gray[y * targetW + x];
      const prevY = gray[(y - 1) * targetW + x];
      const nextY = gray[(y + 1) * targetW + x];
      rowGradSum += Math.abs(nextY - prevY);
      rowLumSum += cur;
      rowLumSqSum += cur * cur;
    }
    gradYProfile[y] = rowGradSum / targetW;
    const mean = rowLumSum / targetW;
    rowVariances[y] = Math.sqrt(Math.max(0, rowLumSqSum / targetW - mean * mean));
  }

  return { gradXProfile, gradYProfile, colVariances, rowVariances };
}
