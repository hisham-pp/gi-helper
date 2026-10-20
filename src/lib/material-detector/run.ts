/**
 * Pipeline orchestration for screenshot scanning.
 * Delegated to the unified scanner orchestrator in lib/scanner/engine/scan-orchestrator.
 */
export {
  scanBlob,
  scanBitmap,
  scanDecoded,
  recognizeBlob,
} from "../scanner/engine/scan-orchestrator";
