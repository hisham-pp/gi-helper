/**
 * OCR of the panel's text fields with Tesseract (tesseract.js: Tesseract
 * compiled to WebAssembly, running in its own Web Worker in the browser and
 * in worker threads in Node). One Tesseract worker per language, started on
 * first use; the browser loads the engine and the language data from our
 * own /ocr/ folder (see browser.ts), Node from node_modules.
 */
import type { GrayImage } from "./engine/capture";

export type OcrLanguage = "eng" | "chi_sim";

export interface OcrRequest {
  lang: OcrLanguage;
  /** One word (short text such as "+9" reads best this way), one line, or a block of lines. */
  mode: "word" | "line" | "block";
  /** Only these characters (e.g. digits for a value). */
  whitelist?: string;
}

/** What the reader needs from an OCR engine; tests can pass a fake. */
export interface PanelOcr {
  read(image: GrayImage, request: OcrRequest): Promise<string>;
  dispose(): Promise<void>;
}

export interface TesseractOptions {
  /** Folder (or URL) holding `<lang>.traineddata.gz`, per language. */
  langPath: (lang: OcrLanguage) => string;
  /** tesseract.js' worker script (browser). */
  workerPath?: string;
  /** Folder with the tesseract.js-core WebAssembly builds (browser). */
  corePath?: string;
}

/** Binary PGM: Tesseract's image reader takes it as is, in every environment. */
export function encodePgm(image: GrayImage): Uint8Array {
  const header = new TextEncoder().encode(`P5\n${image.width} ${image.height}\n255\n`);
  const out = new Uint8Array(header.length + image.data.length);
  out.set(header, 0);
  out.set(image.data, header.length);
  return out;
}

type TesseractWorker = import("tesseract.js").Worker;

export function createTesseractOcr(options: TesseractOptions): PanelOcr {
  const workers = new Map<OcrLanguage, Promise<TesseractWorker>>();
  /** Each worker runs one request at a time (parameters, then recognition). */
  const queues = new Map<OcrLanguage, Promise<unknown>>();

  const worker = (lang: OcrLanguage) => {
    let w = workers.get(lang);
    if (!w) {
      w = import("tesseract.js").then(({ createWorker, OEM }) =>
        createWorker(lang, OEM.LSTM_ONLY, {
          langPath: options.langPath(lang),
          ...(options.workerPath ? { workerPath: options.workerPath, workerBlobURL: false } : {}),
          ...(options.corePath ? { corePath: options.corePath } : {}),
          gzip: true,
          // The browser caches our files over HTTP; no second copy in IndexedDB.
          cacheMethod: "none",
        }),
      );
      // A failed start (e.g. offline) is retried on the next request.
      w.catch(() => workers.delete(lang));
      workers.set(lang, w);
    }
    return w;
  };

  return {
    async read(image, request) {
      const w = await worker(request.lang);
      const run = async () => {
        const { PSM } = await import("tesseract.js");
        await w.setParameters({
          tessedit_pageseg_mode: { word: PSM.SINGLE_WORD, line: PSM.SINGLE_LINE, block: PSM.SINGLE_BLOCK }[request.mode],
          tessedit_char_whitelist: request.whitelist ?? "",
          // The panel's text is ~30-40 px tall once scaled: tell Tesseract so it doesn't guess.
          user_defined_dpi: "300",
        });
        const { data } = await w.recognize(encodePgm(image) as unknown as Buffer);
        return data.text;
      };
      const prev = queues.get(request.lang) ?? Promise.resolve();
      const next = prev.then(run, run);
      queues.set(
        request.lang,
        next.catch(() => undefined),
      );
      return next;
    },
    async dispose() {
      const all = [...workers.values()];
      workers.clear();
      queues.clear();
      await Promise.all(all.map((w) => w.then((x) => x.terminate()).catch(() => undefined)));
    },
  };
}
