import BaseAgent from './baseAgent.js';

export default class ExecutorAgent extends BaseAgent {
  constructor(options = {}) {
    super({
      name: options.name ?? 'executor',
      systemPrompt:
        options.systemPrompt ??
        'You are an implementation specialist that executes planned steps with precision and returns concise status updates.',
      metrics: options.metrics,
      model: options.model,
      maxTokens: options.maxTokens ?? 1024,
    });
  }

  async executeStep(step, context = []) {
    this.metrics?.increment('executor:steps');

    if (!this.online) {
      return this.offlineExecution(step);
    }

    const response = await this.sendMessage({
      prompt: `You are executing step #${step.id}: ${step.description}.\nProvide a short status update and outline any outputs or follow-up actions.`,
      context,
    });

    if (response.offline) {
      return this.offlineExecution(step);
    }

    return {
      id: step.id,
      status: 'completed',
      detail: response.text,
    };
  }

  offlineExecution(step) {
    return {
      id: step.id,
      status: 'completed',
      detail: `Simulated completion for step #${step.id}: ${step.description}`,
    };
  }

  async simulateResponse({ prompt }) {
    return `Simulated execution response for prompt: ${prompt}`;
  }
}
