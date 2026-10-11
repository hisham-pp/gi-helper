const n = 1024;
const numMaterials = 475;
const target = new Float32Array(n);
const templates: Float32Array[] = [];
for (let i = 0; i < numMaterials; i++) {
  templates.push(new Float32Array(n));
}

// Benchmark
const start = performance.now();
for (let rep = 0; rep < 100; rep++) {
  let bestScore = -1,
    bestIdx = -1;
  for (let i = 0; i < numMaterials; i++) {
    const t = templates[i];
    let dot = 0;
    for (let j = 0; j < n; j++) {
      dot += target[j] * t[j];
    }
    if (dot > bestScore) {
      bestScore = dot;
      bestIdx = i;
    }
  }
}
const elapsed = performance.now() - start;
console.log(
  `100 full searches across ${numMaterials} materials took ${elapsed.toFixed(1)}ms (${(elapsed / 100).toFixed(3)}ms per cell)`,
);
