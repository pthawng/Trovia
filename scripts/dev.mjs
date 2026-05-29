import { existsSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = join(rootDir, 'backend');
const frontendDir = join(rootDir, 'frontend');
const isWindows = process.platform === 'win32';
const pnpm = isWindows ? 'pnpm.cmd' : 'pnpm';
const args = new Set(process.argv.slice(2));

const children = new Set();
let shuttingDown = false;

function log(scope, message) {
  console.log(`[${scope}] ${message}`);
}

function commandExists(command) {
  const probe = isWindows ? 'where' : 'command';
  const args = isWindows ? [command] : ['-v', command];
  const result = spawnSync(probe, args, { stdio: 'ignore', shell: !isWindows });
  return result.status === 0;
}

function resolveSpawn(command, args) {
  if (isWindows && command.endsWith('.cmd')) {
    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', command, ...args],
    };
  }

  return { command, args };
}

function run(command, args, options = {}) {
  const label = options.label ?? command;
  const resolved = resolveSpawn(command, args);
  const result = spawnSync(resolved.command, resolved.args, {
    cwd: options.cwd ?? rootDir,
    env: { ...process.env, ...(options.env ?? {}) },
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw new Error(`${label} failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`${label} exited with code ${result.status}`);
  }
}

function start(command, args, options = {}) {
  const scope = options.scope ?? command;
  const resolved = resolveSpawn(command, args);
  const child = spawn(resolved.command, resolved.args, {
    cwd: options.cwd ?? rootDir,
    env: { ...process.env, ...(options.env ?? {}) },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    detached: !isWindows,
  });

  children.add(child);

  child.stdout.on('data', (chunk) => prefixOutput(scope, chunk));
  child.stderr.on('data', (chunk) => prefixOutput(scope, chunk));

  child.on('exit', (code, signal) => {
    children.delete(child);
    if (!shuttingDown && code !== 0) {
      log(scope, `stopped unexpectedly (${signal ?? `code ${code}`})`);
      shutdown(1);
    }
  });

  child.on('error', (error) => {
    children.delete(child);
    if (!shuttingDown) {
      log(scope, error.message);
      shutdown(1);
    }
  });

  return child;
}

function prefixOutput(scope, chunk) {
  const text = chunk.toString().replace(/\r?\n$/, '');
  if (!text) return;

  for (const line of text.split(/\r?\n/)) {
    console.log(`[${scope}] ${line}`);
  }
}

function ensureEnvFile(serviceDir) {
  const envPath = join(serviceDir, '.env');
  const examplePath = join(serviceDir, '.env.example');

  if (!existsSync(envPath) && existsSync(examplePath)) {
    copyFileSync(examplePath, envPath);
    log('env', `created ${envPath} from .env.example`);
  }
}

function ensureDependencies(serviceName, serviceDir) {
  if (existsSync(join(serviceDir, 'node_modules'))) {
    return;
  }

  log(serviceName, 'node_modules missing, installing dependencies');
  run(pnpm, ['install', '--frozen-lockfile'], {
    cwd: serviceDir,
    label: `${serviceName} install`,
  });
}

function dockerInspectHealth(containerName) {
  const result = spawnSync(
    'docker',
    ['inspect', '--format', '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}', containerName],
    { cwd: backendDir, encoding: 'utf8' },
  );

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim();
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function waitForDatabase() {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    const status = dockerInspectHealth('trovia-postgres');
    if (status === 'healthy' || status === 'running') {
      log('db', `PostgreSQL is ${status}`);
      return;
    }

    log('db', `waiting for PostgreSQL${status ? ` (${status})` : ''}`);
    await wait(2_000);
  }

  throw new Error('PostgreSQL did not become ready within 60 seconds');
}

function stopChild(child) {
  if (child.exitCode !== null || child.killed) {
    return;
  }

  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
  }
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  log('dev', 'stopping services');

  for (const child of children) {
    stopChild(child);
  }

  process.exit(exitCode);
}

async function main() {
  if (args.has('--help') || args.has('-h')) {
    console.log('Usage: dev.cmd [--check] [--prepare]');
    console.log('');
    console.log('  --check    Validate local prerequisites without starting services.');
    console.log('  --prepare  Start PostgreSQL and sync Prisma, then exit.');
    return;
  }

  if (args.has('--version') || args.has('-v')) {
    console.log('trovia-home-hub dev runner');
    return;
  }

  log('dev', 'starting Trovia local stack');

  if (!commandExists(pnpm)) {
    throw new Error('pnpm was not found. Install pnpm first, then run pnpm dev again.');
  }

  if (!commandExists('docker')) {
    throw new Error('Docker was not found. Start Docker Desktop or install Docker first.');
  }

  if (args.has('--check')) {
    log('dev', 'all prerequisites are available');
    return;
  }

  ensureEnvFile(backendDir);
  ensureEnvFile(frontendDir);
  ensureDependencies('backend', backendDir);
  ensureDependencies('frontend', frontendDir);

  log('db', 'starting PostgreSQL container');
  run('docker', ['compose', 'up', '-d'], { cwd: backendDir, label: 'docker compose up' });
  await waitForDatabase();

  log('backend', 'generating Prisma client');
  run(pnpm, ['prisma', 'generate'], { cwd: backendDir, label: 'prisma generate' });

  log('backend', 'syncing Prisma schema to local database');
  run(pnpm, ['prisma', 'db', 'push', '--skip-generate'], {
    cwd: backendDir,
    label: 'prisma db push',
  });

  if (args.has('--prepare')) {
    log('dev', 'local services are prepared');
    return;
  }

  start(pnpm, ['run', 'start:dev'], { cwd: backendDir, scope: 'backend' });
  start(pnpm, ['run', 'dev', '--host', '0.0.0.0'], { cwd: frontendDir, scope: 'frontend' });

  log('dev', 'frontend: http://localhost:5173');
  log('dev', 'backend:  http://localhost:3001/api');
  log('dev', 'swagger:  http://localhost:3001/api/docs');
  log('dev', 'press Ctrl+C to stop the app processes');
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (error) => {
  console.error(error.message);
  shutdown(1);
});
process.on('unhandledRejection', (error) => {
  console.error(error instanceof Error ? error.message : error);
  shutdown(1);
});

main().catch((error) => {
  console.error(error.message);
  shutdown(1);
});
