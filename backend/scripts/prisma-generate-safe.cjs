/* eslint-disable no-console */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function prismaClientDir() {
  return path.join(process.cwd(), 'node_modules', '.prisma', 'client');
}

function hasAnyQueryEngine() {
  const dir = prismaClientDir();
  try {
    const entries = fs.readdirSync(dir);
    return entries.some((f) => f.startsWith('query_engine-') && f.endsWith('.node'));
  } catch {
    return false;
  }
}

function cleanupTmpEngines() {
  const dir = prismaClientDir();
  try {
    const entries = fs.readdirSync(dir);
    for (const f of entries) {
      if (f.includes('query_engine-') && f.includes('.tmp')) {
        try {
          fs.unlinkSync(path.join(dir, f));
        } catch {
          // best effort
        }
      }
      if (f.includes('query_engine-windows.dll.node.tmp')) {
        try {
          fs.unlinkSync(path.join(dir, f));
        } catch {
          // best effort
        }
      }
    }
  } catch {
    // ignore
  }
}

cleanupTmpEngines();

const result = spawnSync('prisma', ['generate'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

if (result.status === 0) {
  process.exit(0);
}

// Windows Defender / file lock issues can cause EPERM renames while the engine already exists.
// If we already have an engine in place, proceed to allow app startup.
if (hasAnyQueryEngine()) {
  console.warn(
    '\n[prisma-generate-safe] prisma generate failed, but an existing query engine is present.\n' +
      'Continuing startup to avoid Windows file-lock EPERM issues.\n' +
      'If you changed schema.prisma, run `npm run prisma:generate` after closing any running node processes.\n',
  );
  process.exit(0);
}

process.exit(result.status ?? 1);
