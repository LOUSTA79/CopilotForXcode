import BaseAgent from './baseAgent.js';

export default class PlannerAgent extends BaseAgent {
  constructor(options = {}) {
    super({
      name: options.name ?? 'planner',
      systemPrompt:
        options.systemPrompt ??
        'You are a senior technical planner that breaks high level goals into concise, actionable steps.',
      metrics: options.metrics,
      model: options.model,
      maxTokens: options.maxTokens ?? 2048,
    });
  }

  async plan(goal, context = []) {
    this.metrics?.increment('planner:plans');

    if (!this.online) {
      return this.offlinePlan(goal);
    }

    const response = await this.sendMessage({
      prompt: `Create a numbered execution plan for the following goal. Keep each step concise.\nGoal: ${goal}`,
      context,
    });

    if (response.offline) {
      return this.offlinePlan(goal);
    }

    const steps = this.parsePlan(response.text);
    if (steps.length === 0) {
      return this.offlinePlan(goal);
    }

    return steps;
  }

  parsePlan(text = '') {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => ({
        id: index + 1,
        description: line.replace(/^[0-9]+[).\-\s]*/, ''),
        rationale: 'Provided by planner',
      }));
  }

  offlinePlan(goal) {
    return [
      {
        id: 1,
        description: `Understand the goal: ${goal}`,
        rationale: 'Establish context and success criteria.',
      },
      {
        id: 2,
        description: 'Design an execution strategy with monitoring hooks.',
        rationale: 'Ensure each step can be observed in production.',
      },
      {
        id: 3,
        description: 'Execute and verify results iteratively.',
        rationale: 'Guarantee high quality output.',
      },
    ];
  }

  async simulateResponse({ prompt }) {
    return `Simulated plan for prompt: ${prompt}`;
  }
}
