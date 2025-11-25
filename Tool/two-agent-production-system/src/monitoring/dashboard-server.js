import http from 'node:http';
import express from 'express';
import chalk from 'chalk';
import { WebSocketServer } from 'ws';
import Metrics from './metrics.js';

const DEFAULT_PORT = Number.parseInt(process.env.MONITOR_PORT ?? '3050', 10);

export function startDashboardServer(metricsInstance = new Metrics(), options = {}) {
  const port = options.port ?? DEFAULT_PORT;
  const metrics = metricsInstance;

  const app = express();
  app.get('/metrics', (_req, res) => {
    res.json(metrics.snapshot());
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'snapshot', data: metrics.snapshot() }));

    const handler = (snapshot) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({ type: 'update', data: snapshot }));
      }
    };

    metrics.on('update', handler);

    socket.on('close', () => {
      metrics.off('update', handler);
    });
  });

  server.listen(port, () => {
    console.log(chalk.green(`📊 Monitoring dashboard available at http://localhost:${port}`));
  });

  return { app, server, wss };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const metrics = new Metrics();
  startDashboardServer(metrics);
  console.log(chalk.blue('Standalone monitoring server started. Waiting for metrics...'));
}
