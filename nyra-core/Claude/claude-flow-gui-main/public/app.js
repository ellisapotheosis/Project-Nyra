// Global variables
let config = {};
let sparcModes = {};
let currentCommand = '';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadConfiguration();
    await loadSparcModes();
    checkSystemStatus();
    loadHistory();
    loadWorkflows();
});

// Event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Quick commands
    document.querySelectorAll('.quick-cmd').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setGeneratedCommand(e.target.dataset.cmd);
        });
    });
    
    // Command builders
    document.getElementById('generate-sparc-btn').addEventListener('click', generateSparcCommand);
    document.getElementById('generate-claude-btn').addEventListener('click', generateClaudeCommand);
    document.getElementById('generate-memory-btn').addEventListener('click', generateMemoryCommand);
    
    // Command actions
    document.getElementById('copy-command').addEventListener('click', copyCommand);
    document.getElementById('save-favorite').addEventListener('click', saveFavorite);
    
    // Setup actions
    document.getElementById('setup-repo-btn').addEventListener('click', setupRepository);
    document.getElementById('init-project-btn').addEventListener('click', initializeProject);
    
    // Memory operation toggle
    document.getElementById('memory-operation').addEventListener('change', toggleMemoryValue);
    
    // Workflow actions
    document.getElementById('add-step-btn').addEventListener('click', addWorkflowStep);
    document.getElementById('save-workflow-btn').addEventListener('click', saveWorkflow);
}

// Tab switching
function switchTab(tabName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // Load tab-specific data
    if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'workflows') {
        loadWorkflows();
    }
}

// Configuration
async function loadConfiguration() {
    try {
        const response = await fetch('/api/config');
        config = await response.json();
        document.getElementById('repo-url').value = config.repoUrl;
        document.getElementById('install-path').value = config.installPath;
        document.getElementById('project-path').value = config.projectPath || '';
    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
}

async function saveConfiguration() {
    config.repoUrl = document.getElementById('repo-url').value;
    config.installPath = document.getElementById('install-path').value;
    config.projectPath = document.getElementById('project-path').value;
    
    try {
        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
    } catch (error) {
        console.error('Failed to save configuration:', error);
    }
}

// Load SPARC modes
async function loadSparcModes() {
    try {
        const response = await fetch('/api/sparc-modes');
        sparcModes = await response.json();
        
        const select = document.getElementById('sparc-mode-select');
        select.innerHTML = '<option value=\"auto\">Auto (Orchestrator)</option>';
        
        Object.entries(sparcModes).forEach(([key, description]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${key} - ${description.split(' - ')[0]}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load SPARC modes:', error);
    }
}

// System status checks
async function checkSystemStatus() {
    // Check Claude Code
    try {
        const response = await fetch('/api/check-claude-code');
        const result = await response.json();
        
        const statusEl = document.getElementById('claude-code-status');
        const detailEl = document.getElementById('claude-code-detail');
        
        if (result.installed) {
            statusEl.textContent = `Claude Code: ✓ ${result.version}`;
            statusEl.className = 'status-text success';
            detailEl.textContent = `Installed: ${result.version}`;
        } else {
            statusEl.textContent = 'Claude Code: Not installed';
            statusEl.className = 'status-text error';
            detailEl.textContent = 'Not installed. Please install Claude Code first.';
        }
    } catch (error) {
        document.getElementById('claude-code-status').textContent = 'Claude Code: Error checking';
    }
    
    // Check Claude Flow
    try {
        const response = await fetch('/api/check-claude-flow');
        const result = await response.json();
        
        const statusEl = document.getElementById('claude-flow-status');
        const detailEl = document.getElementById('claude-flow-detail');
        
        if (result.installed) {
            statusEl.textContent = `Claude Flow: ✓ ${result.version}`;
            statusEl.className = 'status-text success';
            detailEl.textContent = `Installed: ${result.version}`;
        } else {
            statusEl.textContent = 'Claude Flow: Not installed';
            statusEl.className = 'status-text warning';
            detailEl.textContent = 'Not installed globally. Will use npx.';
        }
    } catch (error) {
        document.getElementById('claude-flow-status').textContent = 'Claude Flow: Error checking';
    }
}

// Command generators
async function generateSparcCommand() {
    const mode = document.getElementById('sparc-mode-select').value;
    const prompt = document.getElementById('sparc-prompt').value.trim();
    
    if (!prompt) {
        alert('Please enter a prompt');
        return;
    }
    
    const options = {
        nonInteractive: document.getElementById('opt-non-interactive').checked,
        enablePermissions: document.getElementById('opt-enable-permissions').checked,
        ui: document.getElementById('opt-ui').checked
    };
    
    try {
        const response = await fetch('/api/generate-command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                baseCommand: 'sparc',
                mode: mode === 'auto' ? null : mode,
                prompt,
                options
            })
        });
        
        const result = await response.json();
        setGeneratedCommand(result.command);
        showCommandExplanation('SPARC', mode, prompt);
    } catch (error) {
        console.error('Failed to generate command:', error);
    }
}

async function generateClaudeCommand() {
    const prompt = document.getElementById('claude-prompt').value.trim();
    
    if (!prompt) {
        alert('Please enter a task description');
        return;
    }
    
    const options = {
        coverage: document.getElementById('coverage').value,
        agents: document.getElementById('agents').value,
        research: document.getElementById('opt-research').checked
    };
    
    try {
        const response = await fetch('/api/generate-command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                baseCommand: 'claude',
                prompt,
                options
            })
        });
        
        const result = await response.json();
        setGeneratedCommand(result.command);
        showCommandExplanation('Claude Spawn', null, prompt);
    } catch (error) {
        console.error('Failed to generate command:', error);
    }
}

async function generateMemoryCommand() {
    const operation = document.getElementById('memory-operation').value;
    const key = document.getElementById('memory-key').value.trim();
    const value = document.getElementById('memory-value').value.trim();
    
    if (!key && operation !== 'export') {
        alert('Please enter a key or search term');
        return;
    }
    
    try {
        const response = await fetch('/api/generate-command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                baseCommand: 'memory',
                mode: operation,
                prompt: operation === 'store' ? `${key} \"${value}\"` : key
            })
        });
        
        const result = await response.json();
        setGeneratedCommand(result.command);
        showCommandExplanation('Memory', operation, key);
    } catch (error) {
        console.error('Failed to generate command:', error);
    }
}

function toggleMemoryValue() {
    const operation = document.getElementById('memory-operation').value;
    const valueInput = document.getElementById('memory-value');
    
    if (operation === 'store') {
        valueInput.style.display = 'block';
        valueInput.required = true;
    } else {
        valueInput.style.display = 'none';
        valueInput.required = false;
    }
}

// Command display and actions
function setGeneratedCommand(command) {
    currentCommand = command;
    document.getElementById('generated-command').textContent = command;
}

function showCommandExplanation(type, mode, prompt) {
    const explanationEl = document.getElementById('command-explanation');
    let explanation = `<strong>${type} Command:</strong> `;
    
    if (type === 'SPARC') {
        if (mode) {
            explanation += `Uses ${mode} mode - ${sparcModes[mode] || 'Specialized AI mode'}`;
        } else {
            explanation += 'Uses auto orchestrator to determine best approach';
        }
    } else if (type === 'Claude Spawn') {
        explanation += 'Spawns Claude with enhanced capabilities and project context';
    } else if (type === 'Memory') {
        explanation += `Performs ${mode} operation on Claude Flow's persistent memory`;
    }
    
    explanationEl.innerHTML = explanation;
}

async function copyCommand() {
    if (!currentCommand) return;
    
    try {
        await navigator.clipboard.writeText(currentCommand);
        const btn = document.getElementById('copy-command');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    } catch (error) {
        console.error('Failed to copy command:', error);
    }
}

async function saveFavorite() {
    if (!currentCommand) return;
    
    const name = prompt('Enter a name for this favorite:');
    if (!name) return;
    
    const description = prompt('Enter a description (optional):') || '';
    
    try {
        await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: currentCommand,
                name,
                description
            })
        });
        
        alert('Saved to favorites!');
        if (document.querySelector('.tab-content.active').id === 'history-tab') {
            loadHistory();
        }
    } catch (error) {
        console.error('Failed to save favorite:', error);
    }
}

// Repository setup
async function setupRepository() {
    const setupBtn = document.getElementById('setup-repo-btn');
    const outputEl = document.getElementById('setup-output');
    
    setupBtn.disabled = true;
    outputEl.innerHTML = '<span class=\"warning\">Setting up repository...</span>';
    
    try {
        await saveConfiguration();
        
        const response = await fetch('/api/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                repoUrl: config.repoUrl,
                installPath: config.installPath
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            outputEl.innerHTML = `<span class=\"success\">${result.message}</span>`;
        } else {
            outputEl.innerHTML = `<span class=\"error\">Error: ${result.error}</span>`;
        }
    } catch (error) {
        outputEl.innerHTML = `<span class=\"error\">Error: ${error.message}</span>`;
    } finally {
        setupBtn.disabled = false;
    }
}

async function initializeProject() {
    const projectPath = document.getElementById('project-path').value.trim();
    if (!projectPath) {
        alert('Please enter a project path');
        return;
    }
    
    const initBtn = document.getElementById('init-project-btn');
    const outputEl = document.getElementById('project-output');
    
    initBtn.disabled = true;
    outputEl.innerHTML = '<span class=\"warning\">Initializing Claude Flow...</span>';
    
    try {
        await saveConfiguration();
        
        const response = await fetch('/api/init-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectPath,
                sparcMode: true
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            outputEl.innerHTML = `<span class=\"success\">${result.message}</span><pre>${result.output}</pre>`;
        } else {
            outputEl.innerHTML = `<span class=\"error\">Error: ${result.error}</span>`;
        }
    } catch (error) {
        outputEl.innerHTML = `<span class=\"error\">Error: ${error.message}</span>`;
    } finally {
        initBtn.disabled = false;
    }
}

// History and favorites
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const history = await response.json();
        
        // Load favorites
        const favoritesEl = document.getElementById('favorites-list');
        favoritesEl.innerHTML = '';
        
        history.favorites.forEach(favorite => {
            const div = document.createElement('div');
            div.className = 'favorite-item';
            div.innerHTML = `
                <div class="favorite-header">
                    <h4>${favorite.name}</h4>
                    <button class="remove-favorite" data-id="${favorite.id}">×</button>
                </div>
                <p class="favorite-description">${favorite.description}</p>
                <code class="favorite-command">${favorite.command}</code>
                <button class="use-favorite" data-command="${favorite.command}">Use Command</button>
            `;
            favoritesEl.appendChild(div);
        });
        
        // Load recent commands
        const historyEl = document.getElementById('history-list');
        historyEl.innerHTML = '';
        
        history.commands.slice(0, 20).forEach(cmd => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-header">
                    <span class="history-time">${new Date(cmd.timestamp).toLocaleString()}</span>
                    <span class="history-mode">${cmd.mode || 'N/A'}</span>
                </div>
                <code class="history-command">${cmd.command}</code>
                <button class="use-history" data-command="${cmd.command}">Use Command</button>
            `;
            historyEl.appendChild(div);
        });
        
        // Add event listeners
        document.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => removeFavorite(e.target.dataset.id));
        });
        
        document.querySelectorAll('.use-favorite, .use-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                setGeneratedCommand(e.target.dataset.command);
                switchTab('builder');
            });
        });
        
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

async function removeFavorite(id) {
    try {
        await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
        loadHistory();
    } catch (error) {
        console.error('Failed to remove favorite:', error);
    }
}

// Workflow management
async function loadWorkflows() {
    try {
        const response = await fetch('/api/workflows');
        const workflows = await response.json();
        
        const workflowListEl = document.getElementById('workflow-list');
        workflowListEl.innerHTML = '';
        
        workflows.templates.forEach(workflow => {
            const div = document.createElement('div');
            div.className = 'workflow-card';
            div.innerHTML = `
                <div class="workflow-header">
                    <h3>${workflow.name}</h3>
                    <div class="workflow-actions">
                        <button class="execute-workflow" data-id="${workflow.id}">Execute</button>
                        <button class="delete-workflow" data-id="${workflow.id}">Delete</button>
                    </div>
                </div>
                <p class="workflow-description">${workflow.description}</p>
                <div class="workflow-steps-preview">
                    <strong>Steps:</strong> ${workflow.steps.map(s => s.mode).join(' → ')}
                </div>
            `;
            workflowListEl.appendChild(div);
        });
        
        // Add event listeners
        document.querySelectorAll('.execute-workflow').forEach(btn => {
            btn.addEventListener('click', (e) => executeWorkflow(e.target.dataset.id));
        });
        
        document.querySelectorAll('.delete-workflow').forEach(btn => {
            btn.addEventListener('click', (e) => deleteWorkflow(e.target.dataset.id));
        });
        
    } catch (error) {
        console.error('Failed to load workflows:', error);
    }
}

function addWorkflowStep() {
    const stepList = document.getElementById('step-list');
    const stepDiv = document.createElement('div');
    stepDiv.className = 'workflow-step';
    stepDiv.innerHTML = `
        <select class="step-mode">
            ${Object.entries(sparcModes).map(([key, desc]) => 
                `<option value="${key}">${key} - ${desc.split(' - ')[0]}</option>`
            ).join('')}
        </select>
        <input type="text" class="step-prompt" placeholder="Prompt with {variables}">
        <button class="remove-step">Remove</button>
    `;
    stepList.appendChild(stepDiv);
    
    stepDiv.querySelector('.remove-step').addEventListener('click', () => {
        stepDiv.remove();
    });
}

async function saveWorkflow() {
    const name = document.getElementById('workflow-name').value.trim();
    const description = document.getElementById('workflow-description').value.trim();
    
    if (!name) {
        alert('Please enter a workflow name');
        return;
    }
    
    const steps = [];
    document.querySelectorAll('.workflow-step').forEach(stepEl => {
        const mode = stepEl.querySelector('.step-mode').value;
        const prompt = stepEl.querySelector('.step-prompt').value.trim();
        if (mode && prompt) {
            steps.push({ mode, prompt });
        }
    });
    
    if (steps.length === 0) {
        alert('Please add at least one step');
        return;
    }
    
    try {
        await fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workflow: { name, description, steps }
            })
        });
        
        // Clear form
        document.getElementById('workflow-name').value = '';
        document.getElementById('workflow-description').value = '';
        document.getElementById('step-list').innerHTML = '';
        
        loadWorkflows();
        alert('Workflow saved!');
    } catch (error) {
        console.error('Failed to save workflow:', error);
    }
}

async function deleteWorkflow(id) {
    if (!confirm('Delete this workflow?')) return;
    
    try {
        await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
        loadWorkflows();
    } catch (error) {
        console.error('Failed to delete workflow:', error);
    }
}

function executeWorkflow(id) {
    // This would show the workflow executor
    // For now, just show an alert
    alert('Workflow execution UI coming soon! This will guide you through each step.');