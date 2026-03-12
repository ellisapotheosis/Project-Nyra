import { execSync } from 'node:child_process';

const bins = ['ruflo', 'claude-flow', 'agentdb', 'agentic-flow'];
for (const bin of bins) {
  try {
    const out = execSync(`${bin} --version`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    console.log(`${bin}: ${out}`);
  } catch {
    console.log(`${bin}: unavailable`);
  }
}
