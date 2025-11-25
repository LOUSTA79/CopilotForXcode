import EventEmitter from 'node:events';
import { performance } from 'node:perf_hooks';
import Table from 'cli-table3';
import chalk from 'chalk';

export default class Orchestrator extends EventEmitter {
  constructor({ planner, executor, metrics }) {
    super();
    this.planner = planner;
    this.executor = executor;
    this.metrics = metrics;
  }

  async run(goal) {
    this.metrics?.increment('orchestrator:runs');
    this.emit('start', { goal });

    const plan = await this.planner.plan(goal);
    this.metrics?.setGauge('plan:steps', plan.length);

    this.emit('plan', { plan });
    this.printPlan(plan);

    const stepResults = [];
    for (const step of plan) {
      const start = performance.now();
      this.metrics?.increment('executor:pending');
      this.emit('step:start', step);

      const result = await this.executor.executeStep(step, stepResults);

      const durationMs = performance.now() - start;
      this.metrics?.timing('step:duration_ms', durationMs);
      this.metrics?.increment('executor:completed');
      this.metrics?.setGauge('executor:last_duration_ms', Math.round(durationMs));

      this.emit('step:complete', { step, result, durationMs });
      stepResults.push({ ...result, durationMs });
    }

    const summary = {
      goal,
      plan,
      results: stepResults,
    };

    this.metrics?.increment('orchestrator:completed');
    this.emit('complete', summary);
    return summary;
  }

  printPlan(plan) {
    if (!plan.length) {
      console.log(chalk.red('Planner returned an empty plan.'));
      return;
    }

    const table = new Table({ head: ['#', 'Step', 'Rationale'] });
    for (const step of plan) {
      table.push([step.id, step.description, step.rationale ?? '']);
    }

    console.log(chalk.cyan('\nExecution Plan:'));
    console.log(table.toString());
  }
}
