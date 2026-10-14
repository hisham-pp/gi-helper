import { NextRequest, NextResponse } from "next/server";
import {
  executeAiVisionScan,
  testAiApiConnection,
} from "@/lib/ai/vision-scanner";
import {
  getAiAdapter,
  listSupportedAdapters,
  resolveAdapterModel,
} from "@/lib/ai/adapters";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    providers: Object.fromEntries(
      listSupportedAdapters().map((adapter) => [
        adapter.providerId,
        {
          hasKey: false,
          defaultModel: adapter.defaultModel,
          defaultBaseUrl: adapter.defaultBaseUrl ?? "",
        },
      ]),
    ),
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

    // API Key Resolution:
    // AI keys can ONLY be read from user configuration (stored in client localStorage / settings modal)
    // Server environment keys are completely disabled.
    const resolvedApiKey =
      requestApiKey && String(requestApiKey).trim()
        ? String(requestApiKey).trim()
        : "";

    const activeModel = resolveAdapterModel(adapter, model);

    const activeBaseUrl =
      (baseUrl && String(baseUrl).trim()) || adapter.defaultBaseUrl;

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

    const causeMsg = String(error.cause?.message || error.cause?.code || "");
    const isTimeout =
      error.name === "TimeoutError" ||
      causeMsg.includes("TIMEOUT") ||
      causeMsg.includes("Timeout") ||
      String(error.message || "")
        .toLowerCase()
        .includes("timeout");

    const errorMessage = isTimeout
      ? "AI Vision scan request timed out while waiting for model response. Please try scanning again or switch to a faster model such as Gemini Flash."
      : causeMsg
        ? `${error.message || "Scan failed"}: ${causeMsg}`
        : error.message || "An unexpected error occurred during AI scanning.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}
