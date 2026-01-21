const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\Dev\\Projects\\Repos\\Project-Nyra';

// Validation results
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: 3,
    valid: 0,
    warnings: 0,
    errors: 0
  },
  files: []
};

// Validate .claude-flow/mcp.json
function validateClaudeFlowConfig() {
  const filePath = path.join(projectRoot, '.claude-flow', 'mcp.json');
  const fileResult = {
    path: '.claude-flow/mcp.json',
    absolutePath: filePath,
    valid: true,
    errors: [],
    warnings: [],
    info: {}
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content);

    fileResult.info.jsonValid = true;
    fileResult.info.serverCount = Object.keys(config.mcpServers || {}).length;
    fileResult.info.servers = [];

    // Validate structure
    if (!config.mcpServers) {
      fileResult.errors.push('Missing required field: mcpServers');
      fileResult.valid = false;
    } else {
      Object.entries(config.mcpServers).forEach(([name, server]) => {
        const serverInfo = { name, hasCommand: false, hasArgs: false, hasDescription: false, envVars: [] };

        if (!server.command) {
          fileResult.warnings.push(`Server "${name}": Missing command field`);
        } else {
          serverInfo.hasCommand = true;
        }

        if (!Array.isArray(server.args)) {
          fileResult.warnings.push(`Server "${name}": Missing or invalid args field`);
        } else {
          serverInfo.hasArgs = true;
          serverInfo.argsCount = server.args.length;
        }

        if (!server.description) {
          fileResult.warnings.push(`Server "${name}": Missing description field`);
        } else {
          serverInfo.hasDescription = true;
        }

        // Check for environment variables
        if (server.env) {
          Object.entries(server.env).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('${')) {
              const match = value.match(/\$\{([^}]+)\}/);
              if (match) {
                serverInfo.envVars.push({ key, placeholder: match[1], isSet: !!process.env[match[1]] });
                if (!process.env[match[1]]) {
                  fileResult.warnings.push(`Server "${name}": Environment variable ${match[1]} not set`);
                }
              }
            }
          });
        }

        fileResult.info.servers.push(serverInfo);
      });
    }

    if (fileResult.errors.length > 0) {
      fileResult.valid = false;
      results.summary.errors += fileResult.errors.length;
    }
    if (fileResult.warnings.length > 0) {
      results.summary.warnings += fileResult.warnings.length;
    }
    if (fileResult.valid) {
      results.summary.valid++;
    }

  } catch (error) {
    fileResult.valid = false;
    fileResult.errors.push(`Failed to parse: ${error.message}`);
    results.summary.errors++;
  }

  results.files.push(fileResult);
}

// Validate .claude/.roo/mcp.json
function validateRooConfig() {
  const filePath = path.join(projectRoot, '.claude', '.roo', 'mcp.json');
  const fileResult = {
    path: '.claude/.roo/mcp.json',
    absolutePath: filePath,
    valid: true,
    errors: [],
    warnings: [],
    info: {}
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content);

    fileResult.info.jsonValid = true;
    fileResult.info.serverCount = Object.keys(config.mcpServers || {}).length;
    fileResult.info.servers = [];

    if (!config.mcpServers) {
      fileResult.errors.push('Missing required field: mcpServers');
      fileResult.valid = false;
    } else {
      Object.entries(config.mcpServers).forEach(([name, server]) => {
        const serverInfo = { name, type: null, hasRequired: true };

        if (server.url) {
          serverInfo.type = 'http';
          serverInfo.url = server.url;

          // Check for Composio URLs
          if (server.url.includes('composio.dev')) {
            serverInfo.isComposio = true;
            const agentMatch = server.url.match(/agent=([^&]+)/);
            if (agentMatch) {
              serverInfo.agent = agentMatch[1];
            }
          }
        } else if (server.command) {
          serverInfo.type = 'stdio';
          serverInfo.hasCommand = !!server.command;
          serverInfo.hasArgs = Array.isArray(server.args);

          // Check for environment variable placeholders in args
          if (server.args) {
            server.args.forEach(arg => {
              if (typeof arg === 'string' && arg.includes('${env:')) {
                const match = arg.match(/\$\{env:([^}]+)\}/);
                if (match) {
                  const envVar = match[1];
                  if (!process.env[envVar]) {
                    fileResult.warnings.push(`Server "${name}": Environment variable ${envVar} not set`);
                  }
                }
              }
            });
          }
        } else {
          fileResult.errors.push(`Server "${name}": Missing both command and url fields`);
          fileResult.valid = false;
          serverInfo.hasRequired = false;
        }

        // Check for alwaysAllow field
        if (server.alwaysAllow) {
          serverInfo.alwaysAllowCount = server.alwaysAllow.length;
        }

        fileResult.info.servers.push(serverInfo);
      });
    }

    if (fileResult.errors.length > 0) {
      fileResult.valid = false;
      results.summary.errors += fileResult.errors.length;
    }
    if (fileResult.warnings.length > 0) {
      results.summary.warnings += fileResult.warnings.length;
    }
    if (fileResult.valid) {
      results.summary.valid++;
    }

  } catch (error) {
    fileResult.valid = false;
    fileResult.errors.push(`Failed to parse: ${error.message}`);
    results.summary.errors++;
  }

  results.files.push(fileResult);
}

// Validate configs/nyra-nexus-router.json
function validateNexusRouterConfig() {
  const filePath = path.join(projectRoot, 'configs', 'nyra-nexus-router.json');
  const fileResult = {
    path: 'configs/nyra-nexus-router.json',
    absolutePath: filePath,
    valid: true,
    errors: [],
    warnings: [],
    info: {}
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content);

    fileResult.info.jsonValid = true;
    fileResult.info.routerName = config.nexus_router?.name;
    fileResult.info.version = config.nexus_router?.version;
    fileResult.info.listenPort = config.nexus_router?.listen?.port;

    // Validate required sections
    const requiredSections = ['nexus_router', 'aggregated_servers', 'fuzzy_search', 'routing', 'endpoints', 'global_settings'];
    requiredSections.forEach(section => {
      if (!config[section]) {
        fileResult.errors.push(`Missing required section: ${section}`);
        fileResult.valid = false;
      }
    });

    // Count servers by category
    if (config.aggregated_servers) {
      const categories = {};
      let totalServers = 0;

      Object.entries(config.aggregated_servers).forEach(([category, servers]) => {
        const serverCount = Object.keys(servers).length;
        categories[category] = serverCount;
        totalServers += serverCount;

        // Validate each server
        Object.entries(servers).forEach(([name, server]) => {
          if (!server.type) {
            fileResult.warnings.push(`Server "${name}" in category "${category}": Missing type field`);
          }

          if (server.type === 'http' && !server.url) {
            fileResult.errors.push(`Server "${name}": HTTP type requires url field`);
            fileResult.valid = false;
          }

          if (server.type === 'stdio' && !server.command) {
            fileResult.errors.push(`Server "${name}": STDIO type requires command field`);
            fileResult.valid = false;
          }

          // Check for environment variable placeholders
          if (server.env) {
            Object.entries(server.env).forEach(([key, value]) => {
              if (typeof value === 'string' && value.includes('${')) {
                const match = value.match(/\$\{([^}]+)\}/);
                if (match) {
                  const envVar = match[1];
                  if (!process.env[envVar]) {
                    fileResult.warnings.push(`Server "${name}": Environment variable ${envVar} not set`);
                  }
                }
              }
            });
          }
        });
      });

      fileResult.info.categories = categories;
      fileResult.info.totalServers = totalServers;
    }

    // Validate fuzzy search config
    if (config.fuzzy_search) {
      if (!config.fuzzy_search.algorithm) {
        fileResult.warnings.push('Fuzzy search: Missing algorithm field');
      }
      fileResult.info.fuzzySearchEnabled = config.fuzzy_search.enabled;
      fileResult.info.fuzzySearchAlgorithm = config.fuzzy_search.algorithm;
    }

    // Validate endpoints
    if (config.endpoints) {
      fileResult.info.endpointCount = Object.keys(config.endpoints).length;
      fileResult.info.endpoints = Object.keys(config.endpoints);
    }

    if (fileResult.errors.length > 0) {
      fileResult.valid = false;
      results.summary.errors += fileResult.errors.length;
    }
    if (fileResult.warnings.length > 0) {
      results.summary.warnings += fileResult.warnings.length;
    }
    if (fileResult.valid) {
      results.summary.valid++;
    }

  } catch (error) {
    fileResult.valid = false;
    fileResult.errors.push(`Failed to parse: ${error.message}`);
    results.summary.errors++;
  }

  results.files.push(fileResult);
}

// Run all validations
validateClaudeFlowConfig();
validateRooConfig();
validateNexusRouterConfig();

// Output results
console.log(JSON.stringify(results, null, 2));
