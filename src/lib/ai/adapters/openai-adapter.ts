import {
  AiVisionAdapter,
  VisionScanOptions,
  RawExtractedItem,
  SupportedModelMeta,
  inventoryVisionPrompt,
  parseImageBase64,
  extractJsonFromResponse,
} from "./types";

export class OpenAiVisionAdapter implements AiVisionAdapter {
  readonly providerId = "openai";
  readonly displayName = "OpenAI";
  readonly defaultModel = "gpt-4o-mini";
  readonly description =
    "Powerful multimodal vision using GPT-4o-mini or GPT-4o (supports OpenAI-compatible custom endpoints).";
  readonly docsUrl = "https://platform.openai.com/api-keys";

  readonly supportedModels: SupportedModelMeta[] = [
    {
      id: "gpt-4o-mini",
      label: "GPT-4o Mini (Fast & Cost Efficient)",
      recommended: true,
      description: "Fast multimodal reasoning and OCR.",
    },
    {
      id: "gpt-4o",
      label: "GPT-4o (Omni Flagship)",
      description: "High-precision multimodal reasoning.",
    },
  ];

  async scanImage(
    imageData: string,
    options: VisionScanOptions,
  ): Promise<RawExtractedItem[]> {
    const { apiKey, model } = options;
    const activeModel = model || this.defaultModel;
    const { dataUrl } = parseImageBase64(imageData);

    const baseUrl = options.baseUrl || "https://api.openai.com/v1";
    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
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
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `OpenAI API error (${response.status}): ${response.statusText}`;
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
      throw new Error("OpenAI returned an empty response.");
    }

    const parsedJson = extractJsonFromResponse(textContent);
    if (!parsedJson || !Array.isArray(parsedJson.items)) {
      throw new Error(
        "Invalid response format from OpenAI: missing 'items' array.",
      );
    }

    return parsedJson.items;
  }

  async testConnection(
    options: VisionScanOptions,
  ): Promise<{ success: boolean; message: string }> {
    const { apiKey, model } = options;
    const activeModel = model || this.defaultModel;
    const baseUrl = options.baseUrl || "https://api.openai.com/v1";
    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
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
        message: `Successfully connected to OpenAI (${activeModel})!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to connect to OpenAI API endpoint.",
      };
    }
  }
}
