import assert from 'node:assert/strict';
import PlannerAgent from '../src/agents/plannerAgent.js';
import ExecutorAgent from '../src/agents/executorAgent.js';
import Orchestrator from '../src/orchestration/orchestrator.js';
import Metrics from '../src/monitoring/metrics.js';

async function run() {
  const metrics = new Metrics();
  const planner = new PlannerAgent({ metrics });
  const executor = new ExecutorAgent({ metrics });
  const orchestrator = new Orchestrator({ planner, executor, metrics });

  const summary = await orchestrator.run('Validate the two-agent production system.');

  assert.ok(Array.isArray(summary.plan), 'Plan should be an array');
  assert.ok(summary.plan.length >= 3, 'Plan should contain at least three steps');
  assert.ok(summary.results.every((step) => step.status === 'completed'));

  console.log('✅ Two-agent orchestration completed successfully.');
  console.log(`Generated ${summary.plan.length} steps.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
