#!/usr/bin/env node
const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

function checkPort(port) {
  return new Promise((resolve) => {
    const tryListen = (host) => {
      const server = net.createServer();
      const onError = (err) => {
        server.close?.();
        if (host === '::') {
          // Fallback to IPv4 check
          tryListen('0.0.0.0');
        } else {
          resolve(false);
        }
      };
      const onListening = () => {
        server.close(() => resolve(true));
      };
      server.once('error', onError);
      server.once('listening', onListening);
      try {
        server.listen(port, host);
      } catch (e) {
        onError(e);
      }
    };
    tryListen('::');
  });
}

async function findFreePort(start) {
  let p = start;
  for (let i = 0; i < 200; i++, p++) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await checkPort(p);
    if (ok) return p;
  }
  return 0;
}

(async () => {
  const base = parseInt(process.env.PORT || process.env.NEXT_PORT || '3000', 10) || 3000;
  const port = await findFreePort(base);
  if (!port) {
    console.error(`No free port found in range ${base}-${base + 200}`);
    process.exit(1);
  }
  console.log(`→ Using port ${port} (base ${base}).`);
  const args = ['dev', '-p', String(port), ...process.argv.slice(2)];

  // Use the local Next.js binary
  const nextCmd = process.platform === 'win32'
    ? path.join(__dirname, '..', 'node_modules', '.bin', 'next.cmd')
    : path.join(__dirname, '..', 'node_modules', '.bin', 'next');

  const child = spawn(nextCmd, args, { stdio: 'inherit', env: { ...process.env, PORT: String(port) } });
  child.on('exit', (code) => process.exit(code ?? 0));
})();