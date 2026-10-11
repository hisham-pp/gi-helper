import { AiVisionAdapter, AiProviderId } from "./types";
import { GeminiVisionAdapter } from "./gemini-adapter";
import { OpenAiVisionAdapter } from "./openai-adapter";
import { ClaudeVisionAdapter } from "./claude-adapter";
import { GrokVisionAdapter } from "./grok-adapter";
import { CustomVisionAdapter } from "./custom-adapter";

export * from "./types";
export * from "./gemini-adapter";
export * from "./openai-adapter";
export * from "./claude-adapter";
export * from "./grok-adapter";
export * from "./custom-adapter";

const adapters = new Map<string, AiVisionAdapter>();

const geminiAdapter = new GeminiVisionAdapter();
const openAiAdapter = new OpenAiVisionAdapter();
const claudeAdapter = new ClaudeVisionAdapter();
const grokAdapter = new GrokVisionAdapter();
const customAdapter = new CustomVisionAdapter();

adapters.set(geminiAdapter.providerId, geminiAdapter);
adapters.set(openAiAdapter.providerId, openAiAdapter);
adapters.set(claudeAdapter.providerId, claudeAdapter);
adapters.set(grokAdapter.providerId, grokAdapter);
adapters.set(customAdapter.providerId, customAdapter);

/**
 * Register a new custom adapter at runtime
 */
export function registerAiAdapter(adapter: AiVisionAdapter): void {
  adapters.set(adapter.providerId, adapter);
}

/**
 * Get an adapter by its provider id (defaulting to Gemini)
 */
export function getAiAdapter(providerId: string = "gemini"): AiVisionAdapter {
  const adapter = adapters.get(providerId);
  if (!adapter) {
    return geminiAdapter;
  }
  return adapter;
}

/**
 * List all supported AI Vision Adapters
 */
export function listSupportedAdapters(): AiVisionAdapter[] {
  return [geminiAdapter, openAiAdapter, claudeAdapter, grokAdapter, customAdapter];
}
