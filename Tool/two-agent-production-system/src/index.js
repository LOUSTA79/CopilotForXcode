import 'dotenv/config';
import chalk from 'chalk';
import ora from 'ora';
import PlannerAgent from './agents/plannerAgent.js';
import ExecutorAgent from './agents/executorAgent.js';
import Orchestrator from './orchestration/orchestrator.js';
import Metrics from './monitoring/metrics.js';
import { startDashboardServer } from './monitoring/dashboard-server.js';

const goal = process.argv.slice(2).join(' ') || 'Deliver a production-ready two-agent workflow with monitoring.';

async function main() {
  const metrics = new Metrics();
  const planner = new PlannerAgent({ metrics });
  const executor = new ExecutorAgent({ metrics });

  const orchestrator = new Orchestrator({ planner, executor, metrics });
  startDashboardServer(metrics);

  const spinner = ora('Coordinating agents...').start();
  try {
    const result = await orchestrator.run(goal);
    spinner.succeed('Agents finished execution.');

    console.log(chalk.green('\nSummary:'));
    for (const outcome of result.results) {
      console.log(` - Step #${outcome.id}: ${outcome.status} (${Math.round(outcome.durationMs)}ms)`);
      console.log(`   Detail: ${outcome.detail}`);
    }

    console.log(chalk.bold(`\nGoal: ${goal}`));
    console.log(chalk.bold('Status: Completed'));
  } catch (error) {
    spinner.fail('Agent orchestration failed.');
    console.error(chalk.red(error.stack || error.message));
    process.exitCode = 1;
  }
}

main();
