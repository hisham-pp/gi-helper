import {
  AiVisionAdapter,
  AiProviderId,
  VisionScanOptions,
  RawExtractedItem,
  SupportedModelMeta,
  INVENTORY_VISION_PROMPT,
  parseImageBase64,
  extractJsonFromResponse,
} from "./types";

export class GrokVisionAdapter implements AiVisionAdapter {
  readonly providerId: AiProviderId = "grok";
  readonly displayName = "xAI Grok";
  readonly defaultModel = "grok-2-vision-1212";
  readonly description =
    "Next-gen multimodal reasoning with xAI Grok 2 Vision.";
  readonly docsUrl = "https://console.x.ai";
  readonly defaultBaseUrl = "https://api.x.ai/v1";

  readonly supportedModels: SupportedModelMeta[] = [
    {
      id: "grok-2-vision-1212",
      label: "Grok 2 Vision (Recommended)",
      recommended: true,
      description:
        "Flagship xAI vision model for high-fidelity OCR and perception.",
    },
    {
      id: "grok-vision-beta",
      label: "Grok Vision Beta",
      description: "Experimental xAI vision model.",
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
              { type: "text", text: INVENTORY_VISION_PROMPT },
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
      let message = `xAI Grok API error (${response.status}): ${response.statusText}`;
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
      throw new Error("Grok returned an empty response.");
    }

    const parsedJson = extractJsonFromResponse(textContent);
    if (!parsedJson || !Array.isArray(parsedJson.items)) {
      throw new Error(
        "Invalid response format from Grok: missing 'items' array.",
      );
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
        message: `Successfully connected to xAI Grok (${activeModel})!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to connect to xAI Grok endpoint.",
      };
    }
  }
}
