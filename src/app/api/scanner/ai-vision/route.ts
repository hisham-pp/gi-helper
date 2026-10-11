import { NextRequest, NextResponse } from "next/server";
import {
  executeAiVisionScan,
  testAiApiConnection,
} from "@/lib/ai/vision-scanner";
import { getAiAdapter } from "@/lib/ai/adapters";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      provider = "gemini",
      model,
      baseUrl,
      apiKey: requestApiKey,
      image,
    } = body;

    const adapter = getAiAdapter(provider);

    // API Key Resolution:
    // User key from localStorage passed in request has HIGHEST priority (overrides env)
    // Server environment variables act as fallback
    let envKey: string | undefined;
    switch (provider) {
      case "gemini":
        envKey = process.env.GEMINI_API_KEY;
        break;
      case "openai":
        envKey = process.env.OPENAI_API_KEY;
        break;
      case "claude":
        envKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
        break;
      case "grok":
        envKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
        break;
      case "custom":
        envKey = process.env.CUSTOM_AI_API_KEY;
        break;
    }

    const resolvedApiKey =
      (requestApiKey && String(requestApiKey).trim()) || envKey;

    const activeModel = model || adapter.defaultModel;

    // 1. Connection Test Action
    if (action === "test") {
      if (!resolvedApiKey) {
        return NextResponse.json(
          {
            success: false,
            message: `Please enter an API Key for ${adapter.displayName} first.`,
          },
          { status: 400 },
        );
      }

      const testResult = await testAiApiConnection(provider, {
        apiKey: resolvedApiKey,
        model: activeModel,
        baseUrl,
      });

      return NextResponse.json(testResult);
    }

    // 2. Scan Action
    if (!resolvedApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: `No API Key found for ${adapter.displayName}. Please configure your API key in Scanner Settings (gear icon in the top right).`,
        },
        { status: 400 },
      );
    }

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image data provided for scanning." },
        { status: 400 },
      );
    }

    const { items, rawCount } = await executeAiVisionScan(image, provider, {
      apiKey: resolvedApiKey,
      model: activeModel,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      items,
      rawCount,
      provider: adapter.providerId,
      model: activeModel,
    });
  } catch (error: any) {
    console.error("AI Vision Scanner Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || "An unexpected error occurred during AI scanning.",
      },
      { status: 500 },
    );
  }
}
