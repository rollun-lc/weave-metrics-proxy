import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const port = process.env.PORT || 3000;
const metricsFilePath = process.env.METRICS_FILE || './metrics.txt';

const server = createServer(async (req, res) => {
  if (req.url !== '/metrics') {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('not found');
    return;
  }

  try {
    const metrics = await readFile(metricsFilePath, 'utf8');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.end(metrics);
  } catch (err) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('metrics file not found');
  }
});

server.listen(port, () => {
  console.log(`Server running at on port ${port}`);
});

const signals = ['SIGINT', 'SIGTERM'];

signals.forEach((signal) => {
  process.on(signal, () => {
    server.close();
    process.exit(0);
  });
});
