import { IAIModelService, AIExecutionResult } from '../../../core/ports/outbound/ai-model-service.port.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Driven / Outbound Adapter (OUTSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHAT IS THIS FILE?
 * A Simulated AI Model Service implementing `IAIModelService`.
 * 
 * WHY USE A SIMULATED ADAPTER?
 * 1. Zero API Keys Required: The project runs instantly without needing a paid OpenAI key.
 * 2. Deterministic & Fast: Tests and demos run smoothly offline.
 * 3. Swap-Ready: In production, you would create an `OpenAIModelService` or `GeminiModelService`
 *    implementing the EXACT same `IAIModelService` interface!
 */
export class SimulatedAIAgentService implements IAIModelService {
  private readonly defaultModel: string;

  constructor(defaultModel: string = 'gemini-2.5-flash-simulated') {
    this.defaultModel = defaultModel;
  }

  public getDefaultModel(): string {
    return this.defaultModel;
  }

  public async generateResponse(prompt: string, modelOverride?: string): Promise<AIExecutionResult> {
    const startTime = Date.now();
    const model = modelOverride || this.defaultModel;

    // Simulate AI processing delay (150ms - 400ms for realistic feel)
    await new Promise(resolve => setTimeout(resolve, 250));

    const lowerPrompt = prompt.toLowerCase();
    let generatedOutput = '';

    if (lowerPrompt.includes('code') || lowerPrompt.includes('function') || lowerPrompt.includes('typescript')) {
      generatedOutput = `[AI Agent Analysis]\nGoal: Generate TypeScript Solution\n\n\`\`\`typescript\n// Auto-generated response for prompt: "${prompt}"\nexport function solveTask(): { status: string; timestamp: string } {\n  return {\n    status: "SUCCESS",\n    timestamp: new Date().toISOString()\n  };\n}\n\`\`\`\n\nExecution completed with zero runtime warnings.`;
    } else if (lowerPrompt.includes('summary') || lowerPrompt.includes('summarize') || lowerPrompt.includes('explain')) {
      generatedOutput = `[AI Agent Summary]\nAnalysis of prompt: "${prompt}"\n\nKey Insights:\n1. Problem decomposed into primary and secondary adapters.\n2. Invariants preserved at the domain boundary.\n3. Business logic decoupled from external infrastructure.\n\nRecommendation: Proceed with standard hexagonal architecture deployment.`;
    } else if (lowerPrompt.includes('plan') || lowerPrompt.includes('agent')) {
      generatedOutput = `[AI Autonomous Agent Plan]\nTask: "${prompt}"\n\nPhase 1: Environment inspection & dependency checks [DONE]\nPhase 2: Context gathering & schema validation [DONE]\nPhase 3: Synthesizing solution [DONE]\n\nOutcome: Plan formulated and verified. Ready for execution.`;
    } else {
      generatedOutput = `[AI Agent Response - Model: ${model}]\nProcessed instruction: "${prompt}"\n\nResult:\nThe requested AI task has been analyzed and successfully completed. All output parameters satisfied specifications.`;
    }

    const executionTimeMs = Date.now() - startTime;
    const estimatedTokens = Math.ceil(prompt.length / 4) + Math.ceil(generatedOutput.length / 4) + 42;

    return {
      output: generatedOutput,
      tokensUsed: estimatedTokens,
      modelUsed: model,
      executionTimeMs,
    };
  }
}
