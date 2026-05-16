import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function hasCommand(command) {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(probe, [command], { stdio: 'ignore' }).status === 0;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  process.exit(typeof result.status === 'number' ? result.status : 1);
}

if (existsSync('pnpm-lock.yaml') && hasCommand('pnpm')) {
  run('pnpm', ['-r', '--if-present', 'lint']);
}

if (hasCommand('npm')) {
  run('npm', ['run', 'lint', '--workspaces', '--if-present']);
}

console.error('Neither pnpm nor npm is available to run workspace lint.');
process.exit(1);
