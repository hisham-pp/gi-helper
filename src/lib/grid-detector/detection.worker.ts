/**
 * Web Worker entry: runs grid detection off the main thread so the React UI
 * stays responsive on large screenshots. One request at a time is processed;
 * cancellation is done by the client terminating the worker.
 */
import { toGridDetectionError } from "./engine/errors";
import { detectFromBlob } from "./run";
import type { WorkerRequest, WorkerResponse } from "./worker-protocol";

// The project compiles against the DOM lib; describe the worker scope minimally.
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

scope.onmessage = async (event) => {
  const { id, blob, name, settings } = event.data;
  try {
    const result = await detectFromBlob(blob, name, settings);
    scope.postMessage({ id, ok: true, result });
  } catch (err) {
    const safe = toGridDetectionError(err);
    // Keep internal details in the worker console only.
    if (safe.code === "PROCESSING_FAILED") console.error("[grid-detector]", err);
    scope.postMessage({ id, ok: false, error: { code: safe.code, message: safe.message } });
  }
};
