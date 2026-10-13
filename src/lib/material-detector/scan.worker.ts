/**
 * Web Worker entry: grid detection and material recognition off the main
 * thread. Requests are processed one at a time; cancellation is done by the
 * client terminating the worker. The reference bank stays loaded between
 * requests.
 */
import { loadReferenceBank } from "./browser";
import { toMaterialDetectionError } from "./engine/errors";
import { recognizeBlob, scanBlob } from "./run";
import type { ScanWorkerRequest, ScanWorkerResponse } from "./worker-protocol";

// The project compiles against the DOM lib; describe the worker scope minimally.
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<ScanWorkerRequest>) => void) | null;
  postMessage(message: ScanWorkerResponse): void;
};

let queue: Promise<void> = Promise.resolve();

scope.onmessage = (event) => {
  const req = event.data;
  queue = queue.then(() => handle(req));
};

async function handle(req: ScanWorkerRequest) {
  const { id } = req;
  try {
    let result;
    if (req.kind === "preload") {
      await loadReferenceBank();
      result = null;
    } else if (req.kind === "scan") {
      result = await scanBlob(req.blob, req.name, req.settings, (p) => scope.postMessage({ id, type: "progress", ...p }));
    } else {
      result = await recognizeBlob(req.blob, req.name, req.grids, req.settings, (p) =>
        scope.postMessage({ id, type: "progress", ...p }),
      );
    }
    scope.postMessage({ id, type: "done", result });
  } catch (err) {
    const safe = toMaterialDetectionError(err);
    // Keep internal details in the worker console only.
    if (safe.code === "PROCESSING_FAILED") console.error("[material-detector]", err);
    scope.postMessage({ id, type: "error", error: { code: safe.code, message: safe.message } });
  }
}
