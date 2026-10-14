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

export class ClaudeVisionAdapter implements AiVisionAdapter {
  readonly providerId: AiProviderId = "claude";
  readonly displayName = "Anthropic Claude";
  readonly defaultModel = "claude-sonnet-5-5";
  readonly description =
    "State-of-the-art visual reasoning using Claude Sonnet, Haiku or Opus.";
  readonly docsUrl = "https://console.anthropic.com/settings/keys";

  readonly supportedModels: SupportedModelMeta[] = [
    {
      id: "claude-sonnet-5-5",
      label: "Claude Sonnet 5.5 (Recommended)",
      recommended: true,
      description: "Exceptional visual understanding and detailed recognition.",
    },
    {
      id: "claude-haiku-5-5",
      label: "Claude Haiku 5.5 (Fast & Lightweight)",
      description: "Lightning-fast visual analysis with low latency.",
    },
    {
      id: "claude-opus-5-5",
      label: "Claude Opus 5.5",
      description: "Deep analytical reasoning.",
    },
  ];

  async scanImage(
    imageData: string,
    options: VisionScanOptions,
  ): Promise<RawExtractedItem[]> {
    const { apiKey, model } = options;
    const activeModel = model || this.defaultModel;
    const { mimeType, base64Data } = parseImageBase64(imageData);

    const baseUrl = options.baseUrl || "https://api.anthropic.com/v1";
    const url = `${baseUrl.replace(/\/$/, "")}/messages`;

    // Ensure mimeType is supported by Claude (image/jpeg, image/png, image/gif, image/webp)
    const validMime =
      mimeType === "image/png" ||
      mimeType === "image/jpeg" ||
      mimeType === "image/webp" ||
      mimeType === "image/gif"
        ? mimeType
        : "image/jpeg";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model: activeModel,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: validMime,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: await inventoryVisionPrompt(),
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Anthropic API error (${response.status}): ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        }
      } catch {}
      throw new Error(message);
    }

    const data = await response.json();
    const textContent = data?.content?.[0]?.text;

    if (!textContent) {
      throw new Error("Claude returned an empty response.");
    }

    const parsedJson = extractJsonFromResponse(textContent);
    if (!parsedJson || !Array.isArray(parsedJson.items)) {
      throw new Error(
        "Invalid response format from Claude: missing 'items' array.",
      );
    }

    return parsedJson.items;
  }

  async testConnection(
    options: VisionScanOptions,
  ): Promise<{ success: boolean; message: string }> {
    const { apiKey, model } = options;
    const activeModel = model || this.defaultModel;
    const baseUrl = options.baseUrl || "https://api.anthropic.com/v1";
    const url = `${baseUrl.replace(/\/$/, "")}/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: activeModel,
          max_tokens: 10,
          messages: [{ role: "user", content: "ping" }],
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
        message: `Successfully connected to Claude (${activeModel})!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to connect to Anthropic API endpoint.",
      };
    }
  }
}
