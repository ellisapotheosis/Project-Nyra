import { existsSync, promises as fs } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TEMPLATES_DIR = join(__dirname, '../../../docs/references/templates-library');
const WIKI_TEMPLATES_DIR = join(__dirname, '../../../docs/references/claude-flow-wiki');
const EXAMPLES_DIR = join(__dirname, '../../../docs/references/claude-flow-examples');

/**
 * Load tech stack specific rules from multiple sources
 * Priority: Custom templates → Wiki templates → Default
 */
async function getStackRules(profile) {
  if (!profile) return "";

  // Try custom templates first
  try {
    const customPath = join(TEMPLATES_DIR, 'stacks', `${profile}.md`);
    if (existsSync(customPath)) {
      const content = await fs.readFile(customPath, 'utf8');
      console.log(`✓ Loaded custom template: ${profile}.md`);
      return content;
    }
  } catch (e) {
    console.warn(`⚠️  Error reading custom template: ${e.message}`);
  }

  // Try wiki templates
  try {
    const wikiPath = join(WIKI_TEMPLATES_DIR, `CLAUDE-MD-${profile}.md`);
    if (existsSync(wikiPath)) {
      const content = await fs.readFile(wikiPath, 'utf8');
      console.log(`✓ Loaded wiki template: CLAUDE-MD-${profile}.md`);
      return content;
    }
  } catch (e) {
    console.warn(`⚠️  Error reading wiki template: ${e.message}`);
  }

  console.warn(`⚠️  Warning: No template found for '${profile}', using defaults`);
  return "# No specific guidelines available\n\nPlease add custom guidelines for this stack.";
}

/**
 * Load workflow examples from claude-flow examples
 */
async function getWorkflowExamples(profile) {
  try {
    const workflowsPath = join(EXAMPLES_DIR, '02-workflows');

    if (!existsSync(workflowsPath)) {
      return null;
    }

    // Load appropriate workflow based on profile
    const workflowFiles = await fs.readdir(workflowsPath);
    const matchingWorkflow = workflowFiles.find(f =>
      f.includes(profile) || f.includes('simple')
    );

    if (matchingWorkflow && matchingWorkflow.endsWith('.json')) {
      const workflowContent = await fs.readFile(
        join(workflowsPath, matchingWorkflow),
        'utf8'
      );
      return JSON.parse(workflowContent);
    }
  } catch (e) {
    console.warn(`⚠️  Could not load workflow examples: ${e.message}`);
  }
  return null;
}

/**
 * Load configuration examples from claude-flow examples
 */
async function getConfigExamples(profile) {
  try {
    const configPath = join(EXAMPLES_DIR, '01-configurations');

    if (!existsSync(configPath)) {
      return null;
    }

    // Load development config as default
    const devConfigPath = join(configPath, 'development-config.json');
    if (existsSync(devConfigPath)) {
      const configContent = await fs.readFile(devConfigPath, 'utf8');
      return JSON.parse(configContent);
    }
  } catch (e) {
    console.warn(`⚠️  Could not load config examples: ${e.message}`);
  }
  return null;
}

/**
 * Inject context variables into template content
 */
function injectContext(content, context) {
  let result = content;

  if (!context) return result;

  Object.keys(context).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const value = context[key];

    if (Array.isArray(value)) {
      result = result.replace(regex, value.join(', '));
    } else if (typeof value === 'object') {
      result = result.replace(regex, JSON.stringify(value, null, 2));
    } else {
      result = result.replace(regex, String(value));
    }
  });

  // Remove any remaining un-replaced placeholders
  result = result.replace(/{{[^}]+}}/g, '');

  return result;
}

/**
 * Generate memory-bank.md for context tracking
 */
async function generateMemoryBank(targetDir, context) {
  const memoryBankTemplate = `# Memory Bank - ${context.appName || 'Project'}

## Current Context
**Last Updated**: ${new Date().toISOString().split('T')[0]}

### Active Tasks
- [ ] Initial setup complete
- [ ] Development environment configured
- [ ] First feature implementation

### Recent Changes
- Initial project bootstrap

### Important Decisions
- Tech Stack: ${Array.isArray(context.techStack) ? context.techStack.join(', ') : context.techStack || 'N/A'}
- Architecture Pattern: TBD

### Known Issues
None yet

### Next Steps
1. Complete environment setup
2. Implement core features
3. Add tests

## Claude Flow Integration

### Agent Interactions
- **Last Agent**: bootstrap-agent
- **Purpose**: Project initialization

### Workflow Status
- Development: Not started
- Testing: Not started
- Deployment: Not started

## References
- See CLAUDE.md for AI context
- See .workflows/ for available workflows
`;

  const memoryBankPath = join(targetDir, 'memory-bank.md');
  await fs.writeFile(memoryBankPath, memoryBankTemplate);
  console.log(`✓ Generated memory-bank.md`);
}

/**
 * Generate workflow files from examples
 */
async function generateWorkflows(targetDir, profile, context) {
  const workflowsDir = join(targetDir, '.workflows');
  await fs.mkdir(workflowsDir, { recursive: true });

  // Load workflow examples
  const exampleWorkflow = await getWorkflowExamples(profile);

  // Generate development workflow
  const devWorkflow = {
    name: `${context.appName || 'Project'} Development`,
    description: "Standard development workflow",
    steps: [
      {
        name: "Feature Planning",
        agent: "planner",
        prompt: "Analyze requirements and create implementation plan"
      },
      {
        name: "Implementation",
        agent: "coder",
        prompt: "Implement feature following tech stack guidelines"
      },
      {
        name: "Testing",
        agent: "tester",
        prompt: "Create and run comprehensive tests"
      },
      {
        name: "Review",
        agent: "reviewer",
        prompt: "Review code quality and best practices"
      }
    ],
    ...(exampleWorkflow || {})
  };

  await fs.writeFile(
    join(workflowsDir, 'development.json'),
    JSON.stringify(devWorkflow, null, 2)
  );
  console.log(`✓ Generated development workflow`);
}

/**
 * Main function to generate context-aware files
 */
export async function copyTemplates(targetDir, options = {}) {
  const results = { success: true, copiedFiles: [], errors: [] };

  console.log(`\n📂 Bootstrapping: ${relative(process.cwd(), targetDir)}`);
  console.log(`   Profile: ${options.profile}`);

  try {
    // 1. Get stack-specific rules (from custom, wiki, or defaults)
    const stackRules = await getStackRules(options.profile);

    // 2. Load configuration examples
    const configExamples = await getConfigExamples(options.profile);

    // 3. Define files to generate
    const filesToGenerate = [
      { source: 'CLAUDE.md', destination: 'CLAUDE.md' }
    ];

    // 4. Process each file
    for (const file of filesToGenerate) {
      const sourcePath = join(__dirname, 'templates', file.source);
      const destPath = join(targetDir, file.destination);

      // Read base template
      if (!existsSync(sourcePath)) {
        console.error(`❌ Template source missing: ${sourcePath}`);
        continue;
      }

      let content = await fs.readFile(sourcePath, 'utf8');

      // Inject stack-specific rules
      content = content.replace('{{STACK_SPECIFIC_RULES}}', stackRules);

      // Inject context variables
      if (options.context) {
        content = injectContext(content, options.context);
      }

      // Ensure directory exists
      await fs.mkdir(dirname(destPath), { recursive: true });

      // Write customized file
      await fs.writeFile(destPath, content);
      console.log(`   ✓ Created ${file.destination}`);
      results.copiedFiles.push(destPath);
    }

    // 5. Generate memory bank (unless skipped)
    if (!options.skipMemory) {
      await generateMemoryBank(targetDir, options.context || {});
    }

    // 6. Generate workflows (unless skipped)
    if (!options.skipWorkflows) {
      await generateWorkflows(targetDir, options.profile, options.context || {});
    }

    // 7. Generate .env template
    const envTemplate = `# ${options.context?.appName || 'Application'} Environment Variables
# Generated: ${new Date().toISOString().split('T')[0]}

# Application
APP_NAME="${options.context?.appName || 'app'}"
APP_PORT=${options.context?.port || '3000'}
NODE_ENV=development

# Add your environment variables here
`;

    await fs.writeFile(join(targetDir, '.env.template'), envTemplate);
    console.log(`   ✓ Created .env.template`);

    console.log(`\n✨ Bootstrap complete for ${options.context?.appName || 'project'}`);

  } catch (err) {
    results.success = false;
    results.errors.push(err.message);
    console.error(`❌ Error processing ${targetDir}:`, err);
  }

  return results;
}

/**
 * Export for use as module
 */
export default { copyTemplates, getStackRules, getWorkflowExamples };
