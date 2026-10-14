import {
  AiVisionAdapter,
  AiProviderId,
  VisionScanOptions,
  RawExtractedItem,
  SupportedModelMeta,
  inventoryVisionPrompt,
  parseImageBase64,
  extractJsonFromResponse,
} from "./types";

export class CustomVisionAdapter implements AiVisionAdapter {
  readonly providerId: AiProviderId = "custom";
  readonly displayName = "OpenAI-Compatible / Custom";
  readonly defaultModel = "google/gemini-3.8-flash";
  readonly description =
    "Connect to any OpenAI-compatible Vision API (e.g., OpenRouter, Local Ollama, vLLM, DeepSeek).";
  readonly docsUrl = "https://openrouter.ai/docs";
  readonly defaultBaseUrl = "https://openrouter.ai/api/v1";

  readonly supportedModels: SupportedModelMeta[] = [
    {
      id: "google/gemini-3.8-flash",
      label: "Gemini 3.8 Flash (OpenRouter)",
      recommended: true,
      description: "Fast multimodal model with strong OCR accuracy.",
    },
    {
      id: "qwen/qwen3.8-flash",
      label: "Qwen 3.8 Flash (OpenRouter)",
      description: "Fast and lightweight open vision model.",
    },
    {
      id: "custom",
      label: "Custom Model ID...",
      description:
        "Specify any custom model identifier supported by your endpoint.",
    },
  ];

  async scanImage(
    imageData: string,
    options: VisionScanOptions,
  ): Promise<RawExtractedItem[]> {
    const { apiKey, model } = options;
    const activeModel = model || this.defaultModel;
    const { dataUrl } = parseImageBase64(imageData);

    const baseUrl = options.baseUrl || this.defaultBaseUrl;
    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model: activeModel,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: await inventoryVisionPrompt() },
              {
                type: "image_url",
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Custom Vision API error (${response.status}): ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        }
      } catch {}
      throw new Error(message);
    }

    const data = await response.json();
    const textContent = data?.choices?.[0]?.message?.content;

    if (!textContent) {
      throw new Error("API returned an empty response.");
    }

    const parsedJson = extractJsonFromResponse(textContent);
    if (!parsedJson || !Array.isArray(parsedJson.items)) {
      throw new Error("Invalid response format: missing 'items' array.");
    }

    return parsedJson.items;
  }

  async testConnection(
    options: VisionScanOptions,
  ): Promise<{ success: boolean; message: string }> {
    const { apiKey, model } = options;
    const activeModel = model || this.defaultModel;
    const baseUrl = options.baseUrl || this.defaultBaseUrl;
    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        try {
          const parsed = JSON.parse(errorBody);
          if (parsed?.error?.message) {
            return { success: false, message: parsed.error.message };
          }
        } catch {}
        return {
          success: false,
          message: `Status ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        message: `Successfully connected to endpoint (${activeModel})!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to connect to custom API endpoint.",
      };
    }
  }
}
