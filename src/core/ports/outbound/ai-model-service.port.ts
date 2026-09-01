/**
 * ============================================================================
 * ARCHITECTURE LAYER: Outbound / Driven Port (CONTRACT)
 * ============================================================================
 * 
 * WHY IS THIS CRITICAL FOR AI AGENT SYSTEMS?
 * In AI development, LLM providers and models change rapidly:
 * - Today you might use OpenAI (GPT-4o)
 * - Tomorrow you might switch to Anthropic Claude 3.7 or Google Gemini 2.5
 * - In local development / offline, you might run local Ollama (Llama 3)
 * 
 * By defining `IAIModelService` as a Port, your application core does NOT care
 * which model or SDK is running. You simply plug in a different adapter!
 */

export interface AIExecutionResult {
  output: string;
  tokensUsed: number;
  modelUsed: string;
  executionTimeMs: number;
}

export interface IAIModelService {
  /**
   * Executes a prompt / task instructions against an AI model provider.
   */
  generateResponse(prompt: string, modelOverride?: string): Promise<AIExecutionResult>;

  /**
   * Returns the default model identifier for this provider.
   */
  getDefaultModel(): string;
}
