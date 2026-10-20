/**
 * Public detection API for the browser.
 *
 *   const client = new GridDetectionClient();
 *   const result = await client.detect(file, { sensitivity: 0.6 }, { signal });
 *
 * Detection runs in a Web Worker when available (falling back to the main
 * thread otherwise). The engine is synchronous, so cancelling an in-flight
 * request terminates the worker; the next request starts a fresh one.
 */
import { GridDetectionError, isGridDetectionError } from "./engine/errors";
import type { DetectionSettings, GridDetectionResult } from "./types";
import type { WorkerRequest, WorkerResponse } from "./worker-protocol";

interface Pending {
  resolve: (r: GridDetectionResult) => void;
  reject: (e: GridDetectionError) => void;
}

export interface DetectOptions {
  signal?: AbortSignal;
}

const cancelled = () =>
  new GridDetectionError("CANCELLED", "Detection was cancelled.");

export class GridDetectionClient {
  private worker: Worker | null = null;
  private workerUnavailable = false;
  private readonly pending = new Map<number, Pending>();
  private nextId = 1;

  detect(
    blob: Blob,
    settings: Partial<DetectionSettings> = {},
    options: DetectOptions = {},
  ): Promise<GridDetectionResult> {
    const { signal } = options;
    if (signal?.aborted) return Promise.reject(cancelled());
    const name = blob instanceof File ? blob.name : undefined;

    const worker = this.ensureWorker();
    if (!worker) return this.detectOnMainThread(blob, name, settings, signal);

    const id = this.nextId++;
    return new Promise<GridDetectionResult>((resolve, reject) => {
      const onAbort = () => {
        // Terminating is the only way to stop a synchronous computation.
        this.terminate(cancelled());
      };
      signal?.addEventListener("abort", onAbort, { once: true });
      this.pending.set(id, {
        resolve: (r) => {
          signal?.removeEventListener("abort", onAbort);
          resolve(r);
        },
        reject: (e) => {
          signal?.removeEventListener("abort", onAbort);
          reject(e);
        },
      });
      const request: WorkerRequest = { id, blob, name, settings };
      worker.postMessage(request);
    });
  }

  /** Cancels everything in flight and releases the worker. */
  dispose(): void {
    this.terminate(cancelled());
  }

  private ensureWorker(): Worker | null {
    if (this.worker) return this.worker;
    if (this.workerUnavailable || typeof Worker === "undefined") return null;
    try {
      const worker = new Worker(
        new URL("./detection.worker.ts", import.meta.url),
        {
          type: "module",
        },
      );
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const msg = event.data;
        const p = this.pending.get(msg.id);
        if (!p) return; // stale response from a request that was cancelled
        this.pending.delete(msg.id);
        if (msg.ok) p.resolve(msg.result);
        else
          p.reject(new GridDetectionError(msg.error.code, msg.error.message));
      };
      worker.onerror = (event) => {
        event.preventDefault();
        this.terminate(
          new GridDetectionError(
            "PROCESSING_FAILED",
            "The detection worker stopped unexpectedly.",
          ),
        );
      };
      this.worker = worker;
      return worker;
    } catch {
      this.workerUnavailable = true;
      return null;
    }
  }

  private terminate(reason: GridDetectionError) {
    this.worker?.terminate();
    this.worker = null;
    for (const p of this.pending.values()) p.reject(reason);
    this.pending.clear();
  }

  private async detectOnMainThread(
    blob: Blob,
    name: string | undefined,
    settings: Partial<DetectionSettings>,
    signal?: AbortSignal,
  ): Promise<GridDetectionResult> {
    try {
      // Loaded on demand so the engine is only bundled into the worker chunk
      // unless a browser without Worker support actually needs it here.
      const { detectFromBlob } = await import("./run");
      const result = await detectFromBlob(blob, name, settings);
      if (signal?.aborted) throw cancelled();
      return result;
    } catch (err) {
      if (isGridDetectionError(err)) throw err;
      throw new GridDetectionError(
        "PROCESSING_FAILED",
        "Grid detection failed unexpectedly.",
        err,
      );
    }
  }
}
