import { NextRequest, NextResponse } from "next/server";
import {
  executeAiVisionScan,
  testAiApiConnection,
} from "@/lib/ai/vision-scanner";
import { getAiAdapter } from "@/lib/ai/adapters";

export async function GET() {
  return NextResponse.json({
    providers: {
      gemini: {
        hasKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
        defaultModel: process.env.GEMINI_MODEL || "gemini-flash-latest",
      },
      openai: {
        hasKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
        defaultModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
        defaultBaseUrl: process.env.OPENAI_BASE_URL || "",
      },
      claude: {
        hasKey: Boolean(
          (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY)?.trim(),
        ),
        defaultModel: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      },
      grok: {
        hasKey: Boolean(
          (process.env.GROK_API_KEY || process.env.XAI_API_KEY)?.trim(),
        ),
        defaultModel: process.env.GROK_MODEL || "grok-2-vision-1212",
        defaultBaseUrl: process.env.GROK_BASE_URL || "https://api.x.ai/v1",
      },
      custom: {
        hasKey: Boolean(process.env.CUSTOM_AI_API_KEY?.trim()),
        defaultModel:
          process.env.CUSTOM_AI_MODEL || "qwen/qwen-2-vl-72b-instruct",
        defaultBaseUrl:
          process.env.CUSTOM_AI_BASE_URL || "https://openrouter.ai/api/v1",
      },
    },
  });
}

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

    // API Key, Model, and BaseUrl Resolution:
    // User configuration from request payload (saved in localStorage) has HIGHEST priority
    // Server environment variables act as fallback
    let envKey: string | undefined;
    let envModel: string | undefined;
    let envBaseUrl: string | undefined;

    switch (provider) {
      case "gemini":
        envKey = process.env.GEMINI_API_KEY;
        envModel = process.env.GEMINI_MODEL;
        break;
      case "openai":
        envKey = process.env.OPENAI_API_KEY;
        envModel = process.env.OPENAI_MODEL;
        envBaseUrl = process.env.OPENAI_BASE_URL;
        break;
      case "claude":
        envKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
        envModel = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL;
        break;
      case "grok":
        envKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
        envModel = process.env.GROK_MODEL || process.env.XAI_MODEL;
        envBaseUrl = process.env.GROK_BASE_URL || process.env.XAI_BASE_URL;
        break;
      case "custom":
        envKey = process.env.CUSTOM_AI_API_KEY;
        envModel = process.env.CUSTOM_AI_MODEL;
        envBaseUrl = process.env.CUSTOM_AI_BASE_URL;
        break;
    }

    const resolvedApiKey =
      (requestApiKey && String(requestApiKey).trim()) || envKey;

    const activeModel =
      (model && String(model).trim()) ||
      (envModel && String(envModel).trim()) ||
      adapter.defaultModel;

    const activeBaseUrl =
      (baseUrl && String(baseUrl).trim()) ||
      (envBaseUrl && String(envBaseUrl).trim()) ||
      adapter.defaultBaseUrl;

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
        baseUrl: activeBaseUrl,
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
      baseUrl: activeBaseUrl,
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
