import test from "node:test";
import assert from "node:assert/strict";
import { findBestGridInCrop } from "../src/lib/grid-detector/grid-search";
import { findDominantPeriod } from "../src/lib/grid-detector/periodicity";

test("findBestGridInCrop correctly identifies 7x4 grid on 543x368 cropped inventory", () => {
  const origW = 543;
  const origH = 368;

  const mockContext = {
    canvas: {} as any,
    ctx: {} as any,
    scale: 1,
    origW,
    origH,
    targetW: origW,
    targetH: origH,
  };

  const gradXProfile = new Float32Array(origW);
  const gradYProfile = new Float32Array(origH);

  for (let c = 1; c < 7; c++) {
    const x = Math.round((c * origW) / 7);
    gradXProfile[x] = 25;
  }

  for (let r = 1; r < 4; r++) {
    const y = Math.round((r * origH) / 4);
    gradYProfile[y] = 25;
  }

  const profiles = {
    gradXProfile,
    gradYProfile,
    colVariances: new Float32Array(origW),
    rowVariances: new Float32Array(origH),
  };

  const result = findBestGridInCrop(mockContext, profiles);

  assert.ok(result, "Expected a valid grid candidate");
  assert.equal(result.columns, 7, "Should detect 7 columns");
  assert.equal(result.rows, 4, "Should detect 4 rows");
  assert.ok(result.aspectRatio >= 0.75 && result.aspectRatio <= 0.88, "Aspect ratio should match Genshin cards");
  assert.ok(result.confidence >= 85, "Confidence should be high");
});

test("findDominantPeriod identifies exact period on 1495x766 (7x3 grid)", () => {
  const W = 1495;
  const H = 766;
  const expectedTx = Math.round(W / 7); // ~214px
  const expectedTy = Math.round(H / 3); // ~255px

  // Generate periodic gradient signal with peaks every 214px
  const gradX = new Float32Array(W);
  for (let x = 0; x < W; x++) {
    const phase = x % expectedTx;
    if (phase < 6 || phase > expectedTx - 6) {
      gradX[x] = 30;
    } else {
      gradX[x] = 5;
    }
  }

  // Generate periodic gradient signal with peaks every 255px
  const gradY = new Float32Array(H);
  for (let y = 0; y < H; y++) {
    const phase = y % expectedTy;
    if (phase < 8 || phase > expectedTy - 8) {
      gradY[y] = 35;
    } else {
      gradY[y] = 4;
    }
  }

  const peakX = findDominantPeriod(gradX, 100, 350);
  const peakY = findDominantPeriod(gradY, 120, 350);

  const detectedCols = Math.round(W / peakX.lag);
  const detectedRows = Math.round(H / peakY.lag);

  assert.equal(detectedCols, 7, `Expected 7 columns, got ${detectedCols}`);
  assert.equal(detectedRows, 3, `Expected 3 rows, got ${detectedRows}`);
});
