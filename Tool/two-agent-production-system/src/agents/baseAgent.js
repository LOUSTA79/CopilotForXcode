import { Anthropic } from '@anthropic-ai/sdk';
import EventEmitter from 'node:events';

export default class BaseAgent extends EventEmitter {
  constructor({ name, systemPrompt, metrics, model = 'claude-3-5-sonnet-20241022', maxTokens = 1024 }) {
    super();
    this.name = name;
    this.systemPrompt = systemPrompt;
    this.metrics = metrics;
    this.model = model;
    this.maxTokens = maxTokens;
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.client = this.apiKey ? new Anthropic({ apiKey: this.apiKey }) : null;
    this.online = Boolean(this.client);
  }

  async sendMessage({ prompt, context = [] }) {
    this.metrics?.increment(`${this.name}:requests`);

    if (!this.online) {
      const simulated = await this.simulateResponse({ prompt, context });
      this.emit('message', { prompt, response: simulated, offline: true });
      return { text: simulated, offline: true };
    }

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: this.systemPrompt,
        messages: [
          ...context,
          { role: 'user', content: prompt },
        ],
      });

      const text = response.content
        ?.map((fragment) => fragment.text ?? '')
        .join('')
        .trim();

      const payload = { text, raw: response, offline: false };
      this.emit('message', { prompt, response: payload });
      return payload;
    } catch (error) {
      this.metrics?.increment(`${this.name}:fallbacks`);
      const simulated = await this.simulateResponse({ prompt, context, error });
      const payload = { text: simulated, offline: true, error };
      this.emit('message', { prompt, response: payload, error });
      return payload;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async simulateResponse() {
    return 'Simulation not implemented.';
  }
}
