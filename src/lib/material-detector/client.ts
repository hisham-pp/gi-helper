/**
 * Public scanning API for the browser.
 *
 *   const client = new MaterialScanClient();
 *   const { detection, recognition } = await client.scan(file, {}, { signal, onProgress });
 *   const recognition = await client.recognize(file, editedGrids);
 *
 * Work runs in a Web Worker when available (falling back to the main thread
 * otherwise) and the reference bank stays loaded between calls. The engines
 * are synchronous, so cancelling an in-flight request terminates the worker;
 * the next request starts a fresh one.
 */
import type { DetectedGrid } from "../grid-detector/types";
import { isMaterialDetectionError, MaterialDetectionError, toMaterialDetectionError } from "./engine/errors";
import type { MaterialRecognitionResult, RecognitionSettings, ScanResult, ScanSettings } from "./types";
import type { ScanProgress, ScanWorkerRequest, ScanWorkerResponse } from "./worker-protocol";

export interface ScanOptions {
  signal?: AbortSignal;
  onProgress?: (progress: ScanProgress) => void;
}

interface Pending {
  resolve: (r: unknown) => void;
  reject: (e: MaterialDetectionError) => void;
  onProgress?: (progress: ScanProgress) => void;
}

type RequestBody = ScanWorkerRequest extends infer R ? (R extends { id: number } ? Omit<R, "id"> : never) : never;

const cancelled = () => new MaterialDetectionError("CANCELLED", "Scanning was cancelled.");

export class MaterialScanClient {
  private worker: Worker | null = null;
  private workerUnavailable = false;
  private readonly pending = new Map<number, Pending>();
  private nextId = 1;

  /** Detects the grids in a screenshot and recognises every card. */
  scan(blob: Blob, settings: Partial<ScanSettings> = {}, options: ScanOptions = {}): Promise<ScanResult> {
    const name = blob instanceof File ? blob.name : undefined;
    return this.request<ScanResult>({ kind: "scan", blob, name, settings }, options, async () => {
      const { scanBlob } = await import("./run");
      return scanBlob(blob, name, settings, options.onProgress);
    });
  }

  /** Recognises the cards of already-detected (possibly edited) grids. */
  recognize(
    blob: Blob,
    grids: DetectedGrid[],
    settings: Partial<RecognitionSettings> = {},
    options: ScanOptions = {},
  ): Promise<MaterialRecognitionResult> {
    const name = blob instanceof File ? blob.name : undefined;
    return this.request<MaterialRecognitionResult>({ kind: "recognize", blob, name, grids, settings }, options, async () => {
      const { recognizeBlob } = await import("./run");
      return recognizeBlob(blob, name, grids, settings, options.onProgress);
    });
  }

  /** Starts loading the reference bank ahead of the first scan. Never rejects. */
  preload(): void {
    this.request<null>({ kind: "preload" }, {}, async () => {
      const { loadReferenceBank } = await import("./browser");
      await loadReferenceBank();
      return null;
    }).catch(() => undefined);
  }

  /** Cancels everything in flight and releases the worker. */
  dispose(): void {
    this.terminate(cancelled());
  }

  private request<T>(body: RequestBody, options: ScanOptions, fallback: () => Promise<T>): Promise<T> {
    const { signal, onProgress } = options;
    if (signal?.aborted) return Promise.reject(cancelled());
    const worker = this.ensureWorker();
    if (!worker) return this.onMainThread(fallback, signal);

    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      // Terminating is the only way to stop a synchronous computation.
      const onAbort = () => this.terminate(cancelled());
      signal?.addEventListener("abort", onAbort, { once: true });
      this.pending.set(id, {
        resolve: (r) => {
          signal?.removeEventListener("abort", onAbort);
          resolve(r as T);
        },
        reject: (e) => {
          signal?.removeEventListener("abort", onAbort);
          reject(e);
        },
        onProgress,
      });
      worker.postMessage({ ...body, id } as ScanWorkerRequest);
    });
  }

  private ensureWorker(): Worker | null {
    if (this.worker) return this.worker;
    if (this.workerUnavailable || typeof Worker === "undefined") return null;
    try {
      const worker = new Worker(new URL("./scan.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<ScanWorkerResponse>) => {
        const msg = event.data;
        const p = this.pending.get(msg.id);
        if (!p) return; // stale response from a request that was cancelled
        if (msg.type === "progress") {
          p.onProgress?.({ stage: msg.stage, done: msg.done, total: msg.total });
          return;
        }
        this.pending.delete(msg.id);
        if (msg.type === "done") p.resolve(msg.result);
        else p.reject(new MaterialDetectionError(msg.error.code, msg.error.message));
      };
      worker.onerror = (event) => {
        event.preventDefault();
        this.terminate(new MaterialDetectionError("PROCESSING_FAILED", "The scanning worker stopped unexpectedly."));
      };
      this.worker = worker;
      return worker;
    } catch {
      this.workerUnavailable = true;
      return null;
    }
  }

  private terminate(reason: MaterialDetectionError) {
    this.worker?.terminate();
    this.worker = null;
    for (const p of this.pending.values()) p.reject(reason);
    this.pending.clear();
  }

  private async onMainThread<T>(run: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    try {
      // Loaded on demand so the engines are only bundled into the worker
      // chunk unless a browser without Worker support actually needs them.
      const result = await run();
      if (signal?.aborted) throw cancelled();
      return result;
    } catch (err) {
      if (isMaterialDetectionError(err)) throw err;
      throw toMaterialDetectionError(err);
    }
  }
}
