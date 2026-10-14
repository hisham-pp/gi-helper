import {
  AiVisionAdapter,
  VisionScanOptions,
  RawExtractedItem,
  SupportedModelMeta,
  inventoryVisionPrompt,
  parseImageBase64,
  extractJsonFromResponse,
} from "./types";

function resolveGeminiModel(model?: string): string {
  if (!model) {
    return "gemini-flash-latest";
  }
  return model.replace(/^models\//, "");
}

export class GeminiVisionAdapter implements AiVisionAdapter {
  readonly providerId = "gemini";
  readonly displayName = "Google Gemini";
  readonly defaultModel = "gemini-flash-latest";
  readonly description =
    "Fast, accurate multimodal vision with a free tier available (via Google AI Studio).";
  readonly docsUrl = "https://aistudio.google.com/app/apikey";

  readonly supportedModels: SupportedModelMeta[] = [
    {
      id: "gemini-flash-latest",
      label: "Gemini Flash Latest (Recommended)",
      recommended: true,
      description: "Always the newest Flash model, so it never goes stale.",
    },
    {
      id: "gemini-3.8-flash",
      label: "Gemini 3.8 Flash",
      description: "Fast multimodal vision with high accuracy.",
    },
    {
      id: "gemini-3.5-flash-lite",
      label: "Gemini 3.5 Flash-Lite (Cheapest)",
      description: "Lightweight, low-cost multimodal model.",
    },
  ];

  private async executeGenerate(
    url: string,
    mimeType: string,
    base64Data: string,
  ): Promise<Response> {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
              {
                text: await inventoryVisionPrompt(),
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1,
        },
      }),
    });
  }

  async scanImage(
    imageData: string,
    options: VisionScanOptions,
  ): Promise<RawExtractedItem[]> {
    const { apiKey, model } = options;
    let activeModel = resolveGeminiModel(model || this.defaultModel);
    const { mimeType, base64Data } = parseImageBase64(imageData);

    const baseUrl =
      options.baseUrl || "https://generativelanguage.googleapis.com";
    let url = `${baseUrl.replace(/\/$/, "")}/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

    let response = await this.executeGenerate(url, mimeType, base64Data);

    // If model was not found or retired, automatically fallback to gemini-flash-latest
    if (!response.ok && activeModel !== "gemini-flash-latest") {
      const errorText = await response.text();
      if (
        response.status === 404 ||
        errorText.includes("not found") ||
        errorText.includes("no longer available")
      ) {
        console.warn(
          `Gemini model ${activeModel} not found or retired. Retrying with gemini-flash-latest...`,
        );
        activeModel = "gemini-flash-latest";
        url = `${baseUrl.replace(/\/$/, "")}/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
        response = await this.executeGenerate(url, mimeType, base64Data);
      } else {
        let message = `Gemini API error (${response.status}): ${response.statusText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.error?.message) message = parsed.error.message;
        } catch {}
        throw new Error(message);
      }
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Gemini API error (${response.status}): ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        }
      } catch {}
      throw new Error(message);
    }

    const data = await response.json();
    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsedJson = extractJsonFromResponse(textContent);
    if (!parsedJson || !Array.isArray(parsedJson.items)) {
      throw new Error(
        "Invalid response format from Gemini: missing 'items' array.",
      );
    }

    return parsedJson.items;
  }

  async testConnection(
    options: VisionScanOptions,
  ): Promise<{ success: boolean; message: string }> {
    const { apiKey, model } = options;
    let activeModel = resolveGeminiModel(model || this.defaultModel);
    const baseUrl =
      options.baseUrl || "https://generativelanguage.googleapis.com";

    const testPing = async (m: string) => {
      const url = `${baseUrl.replace(/\/$/, "")}/v1beta/models/${m}:generateContent?key=${apiKey}`;
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "ping" }] }],
        }),
      });
    };

    try {
      let response = await testPing(activeModel);

      // Auto-fallback if specific model is retired or not found
      if (!response.ok && activeModel !== "gemini-flash-latest") {
        const errorBody = await response.text();
        if (
          response.status === 404 ||
          errorBody.includes("not found") ||
          errorBody.includes("no longer available")
        ) {
          activeModel = "gemini-flash-latest";
          response = await testPing(activeModel);
        } else {
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
      }

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
        message: `Successfully connected to Gemini (${activeModel})!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to connect to Gemini API endpoint.",
      };
    }
  }
}
