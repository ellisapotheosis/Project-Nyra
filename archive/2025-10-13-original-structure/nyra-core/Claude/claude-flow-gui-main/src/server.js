const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const os = require('os');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();
const PORT = process.env.PORT || 3456;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// WebSocket server
const server = app.listen(PORT, () => {
  console.log(`Claude Flow Command Builder running at http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Configuration
const CONFIG_PATH = path.join(__dirname, '../config/claude-flow.json');
const WORKFLOWS_PATH = path.join(__dirname, '../config/workflows.json');
const HISTORY_PATH = path.join(__dirname, '../config/command-history.json');

// SPARC modes configuration
const SPARC_MODES = {
  'spec-pseudocode': 'Specification & Pseudocode - Plan implementation approach',
  'architect': 'System Architecture - Design system structure',
  'code': 'Clean Code Implementation - Write modular code',
  'backend-only': 'Backend Development - Server-side focus',
  'frontend-only': 'Frontend Development - UI/UX implementation',
  'tdd': 'Test-Driven Development - Write tests first',
  'debug': 'Debugging & Optimization - Fix issues',
  'security-review': 'Security Analysis - Find vulnerabilities',
  'integration': 'System Integration - Connect components',
  'refactor-maintainability': 'Code Refactoring - Improve maintainability',
  'performance-optimizer': 'Performance Tuning - Optimize speed',
  'docs-writer': 'Documentation - Create docs',
  'devops': 'DevOps & CI/CD - Deployment setup',
  'code-reviewer': 'Code Review - Analyze code quality',
  'ux-designer': 'UX Design - User experience',
  'qa': 'Quality Assurance - Test thoroughly',
  'project-manager': 'Project Management - Organize tasks'
};

// Load configuration
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      repoUrl: 'https://github.com/ruvnet/claude-code-flow.git',
      installPath: path.join(os.homedir(), 'claude-flow-repo'),
      currentBranch: 'main',
      projectPath: process.cwd(),
      defaultMode: 'sparc'
    };
  }
}

// Save configuration
async function saveConfig(config) {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Load workflows
async function loadWorkflows() {
  try {
    const data = await fs.readFile(WORKFLOWS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      templates: [
        {
          id: 'full-feature',
          name: 'Full Feature Development',
          description: 'Complete feature from spec to deployment',
          steps: [
            { mode: 'spec-pseudocode', prompt: 'Plan {feature} implementation' },
            { mode: 'architect', prompt: 'Design {feature} architecture' },
            { mode: 'tdd', prompt: 'Implement {feature} with tests' },
            { mode: 'integration', prompt: 'Integrate {feature} with existing system' },
            { mode: 'docs-writer', prompt: 'Document {feature}' }
          ]
        },
        {
          id: 'bug-fix',
          name: 'Bug Fix Workflow',
          description: 'Debug and fix issues systematically',
          steps: [
            { mode: 'debug', prompt: 'Investigate {issue}' },
            { mode: 'code', prompt: 'Fix {issue}' },
            { mode: 'tdd', prompt: 'Add tests for {issue} fix' }
          ]
        }
      ]
    };
  }
}

// Save workflows
async function saveWorkflows(workflows) {
  await fs.mkdir(path.dirname(WORKFLOWS_PATH), { recursive: true });
  await fs.writeFile(WORKFLOWS_PATH, JSON.stringify(workflows, null, 2));
}

// Load command history
async function loadHistory() {
  try {
    const data = await fs.readFile(HISTORY_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { commands: [], favorites: [] };
  }
}

// Save command history
async function saveHistory(history) {
  await fs.mkdir(path.dirname(HISTORY_PATH), { recursive: true });
  await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2));
}

// API Routes

// Get configuration
app.get('/api/config', async (req, res) => {
  const config = await loadConfig();
  res.json(config);
});

// Save configuration
app.post('/api/config', async (req, res) => {
  try {
    await saveConfig(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SPARC modes
app.get('/api/sparc-modes', (req, res) => {
  res.json(SPARC_MODES);
});

// Clone or update repository
app.post('/api/setup', async (req, res) => {
  const { repoUrl, installPath } = req.body;
  const git = simpleGit();
  
  try {
    // Check if directory exists
    try {
      await fs.access(installPath);
      // Directory exists, pull latest
      const repo = simpleGit(installPath);
      await repo.pull();
      res.json({ success: true, message: 'Repository updated successfully' });
    } catch {
      // Directory doesn't exist, clone
      await git.clone(repoUrl, installPath);
      res.json({ success: true, message: 'Repository cloned successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize Claude Flow in project
app.post('/api/init-project', async (req, res) => {
  const { projectPath, sparcMode } = req.body;
  
  try {
    const config = await loadConfig();
    const command = `cd "${projectPath}" && npx claude-flow init ${sparcMode ? '--sparc' : ''}`;
    
    const { stdout, stderr } = await execPromise(command);
    
    res.json({ 
      success: true, 
      message: 'Claude Flow initialized in project',
      output: stdout || stderr
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if Claude Code is installed
app.get('/api/check-claude-code', async (req, res) => {
  try {
    const { stdout } = await execPromise('claude --version');
    res.json({ installed: true, version: stdout.trim() });
  } catch (error) {
    res.json({ installed: false });
  }
});

// Check if Claude Flow is installed
app.get('/api/check-claude-flow', async (req, res) => {
  try {
    const { stdout } = await execPromise('npx claude-flow --version');
    res.json({ installed: true, version: stdout.trim() });
  } catch (error) {
    res.json({ installed: false });
  }
});

// Generate command
app.post('/api/generate-command', async (req, res) => {
  const { 
    baseCommand, 
    mode, 
    prompt, 
    options = {} 
  } = req.body;
  
  let command = 'npx claude-flow';
  
  // Add base command
  if (baseCommand === 'sparc') {
    command += ' sparc';
    if (mode && mode !== 'auto') {
      command += ` run ${mode}`;
    }
  } else if (baseCommand === 'claude') {
    command += ' claude spawn';
  } else if (baseCommand === 'memory') {
    command += ` memory ${mode}`;
  }
  
  // Add prompt
  if (prompt) {
    command += ` "${prompt}"`;
  }
  
  // Add options
  if (options.coverage) {
    command += ` --coverage ${options.coverage}`;
  }
  if (options.research) {
    command += ' --research';
  }
  if (options.nonInteractive) {
    command += ' --non-interactive';
  }
  if (options.enablePermissions) {
    command += ' --enable-permissions';
  }
  if (options.ui) {
    command += ' --ui';
  }
  if (options.agents) {
    command += ` --agents ${options.agents}`;
  }
  
  // Save to history
  const history = await loadHistory();
  history.commands.unshift({
    command,
    timestamp: new Date().toISOString(),
    mode,
    prompt
  });
  history.commands = history.commands.slice(0, 50); // Keep last 50
  await saveHistory(history);
  
  res.json({ command });
});

// Get command history
app.get('/api/history', async (req, res) => {
  const history = await loadHistory();
  res.json(history);
});

// Add to favorites
app.post('/api/favorites', async (req, res) => {
  const { command, name, description } = req.body;
  const history = await loadHistory();
  
  history.favorites.push({
    id: Date.now().toString(),
    command,
    name,
    description,
    timestamp: new Date().toISOString()
  });
  
  await saveHistory(history);
  res.json({ success: true });
});

// Remove from favorites
app.delete('/api/favorites/:id', async (req, res) => {
  const history = await loadHistory();
  history.favorites = history.favorites.filter(f => f.id !== req.params.id);
  await saveHistory(history);
  res.json({ success: true });
});

// Get workflows
app.get('/api/workflows', async (req, res) => {
  const workflows = await loadWorkflows();
  res.json(workflows);
});

// Save workflow
app.post('/api/workflows', async (req, res) => {
  const { workflow } = req.body;
  const workflows = await loadWorkflows();
  
  workflow.id = Date.now().toString();
  workflows.templates.push(workflow);
  
  await saveWorkflows(workflows);
  res.json({ success: true, id: workflow.id });
});

// Delete workflow
app.delete('/api/workflows/:id', async (req, res) => {
  const workflows = await loadWorkflows();
  workflows.templates = workflows.templates.filter(w => w.id !== req.params.id);
  await saveWorkflows(workflows);
  res.json({ success: true });
});

// Execute workflow step
app.post('/api/workflows/execute-step', async (req, res) => {
  const { step, variables } = req.body;
  let prompt = step.prompt;
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  const command = `npx claude-flow sparc run ${step.mode} "${prompt}"`;
  res.json({ command });
});

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});