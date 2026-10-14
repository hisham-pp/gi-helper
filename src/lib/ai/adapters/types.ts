export type AiProviderId = "gemini" | "openai" | "claude" | "grok" | "custom";

export interface VisionScanOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface RawExtractedItem {
  id?: string;
  name?: string;
  quantity: number;
}

export interface SupportedModelMeta {
  id: string;
  label: string;
  recommended?: boolean;
  description?: string;
}

export interface AiVisionAdapter {
  readonly providerId: AiProviderId;
  readonly displayName: string;
  readonly defaultModel: string;
  readonly supportedModels: SupportedModelMeta[];
  readonly description: string;
  readonly docsUrl: string;
  readonly defaultBaseUrl?: string;

  scanImage(
    imageData: string,
    options: VisionScanOptions,
  ): Promise<RawExtractedItem[]>;

  testConnection(
    options: VisionScanOptions,
  ): Promise<{ success: boolean; message: string }>;
}

let visionPrompt: Promise<string> | null = null;

/**
 * The vision system prompt, with the material reference list built from the
 * 300 KB catalog. Loaded on first use (a scan, on the server), so code that
 * only reads adapter names and defaults (the browser) doesn't bundle it.
 */
export function inventoryVisionPrompt(): Promise<string> {
  visionPrompt ??= import("../prompts").then((m) => m.getVisionSystemPrompt());
  return visionPrompt;
}

export function extractJsonFromResponse(rawText: string): any {
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned);
}

export function parseImageBase64(imageInput: string): {
  mimeType: string;
  base64Data: string;
  dataUrl: string;
} {
  if (imageInput.startsWith("data:")) {
    const match = imageInput.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return {
        mimeType: match[1],
        base64Data: match[2],
        dataUrl: imageInput,
      };
    }
  }

  return {
    mimeType: "image/jpeg",
    base64Data: imageInput,
    dataUrl: `data:image/jpeg;base64,${imageInput}`,
  };
}
