# GitHub Connector for ChatGPT Developer Mode

## Overview

This guide walks you through integrating the GitHub MCP connector into ChatGPT Developer Mode. Once configured, ChatGPT can access all your GitHub repositories and perform operations like creating branches, opening pull requests, managing issues, and more—all with built-in security auditing and compliance logging.

## Prerequisites

Before starting:

1. **Active ChatGPT Developer Mode Subscription**
   - Visit [chat.openai.com/dashboard/developers](https://chat.openai.com/dashboard/developers)
   - Verify you have "Developer Mode" enabled

2. **Nexus Router Running**
   - GitHub connector deployed and accessible at `https://nexus.projectnyra.com`
   - Health endpoint returning 200 OK: `curl https://nexus.projectnyra.com/health`

3. **Valid GitHub Token**
   - Personal Access Token with appropriate scopes
   - Token configured in Nexus Router environment

4. **Cloudflare Tunnel Token**
   - Tunnel set up to expose Nexus Router publicly
   - URL: `https://nexus.projectnyra.com`

## Step 1: Prepare the Connector Configuration

### 1.1 Test Local Connectivity

First, verify the connector is working locally:

```bash
# Test MCP initialization
curl -X POST http://localhost:7000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "ChatGPT",
        "version": "1.0"
      }
    }
  }'
```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {},
      "prompts": {}
    },
    "serverInfo": {
      "name": "Nexus MCP Router",
      "version": "1.0.0"
    }
  }
}
```

### 1.2 Test Tool Discovery

```bash
curl -X POST http://localhost:7000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' | jq '.result.tools | length'
```

Should return a count of 50+ available GitHub tools.

### 1.3 Test Tool Execution

```bash
# Test a simple read operation (list repositories for authenticated user)
curl -X POST http://localhost:7000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "search_repositories",
      "arguments": {
        "query": "user:YOUR_USERNAME sort:stars"
      }
    }
  }' | jq '.result | keys'
```

## Step 2: Configure ChatGPT Developer Mode Connector

### 2.1 Access Developer Settings

1. Navigate to [ChatGPT Developer Mode](https://chat.openai.com/dashboard/developers)
2. Click **"Create New Connector"** or **"Add MCP Server"**
3. Select **"Server-Sent Events (SSE)"** as the protocol

### 2.2 Enter Connector Details

Fill in the following information:

**Connector Name**:
```
GitHub MCP Connector
```

**Description**:
```
Access your GitHub repositories, manage issues, create pull requests, and perform repository operations with full audit logging.
```

**Protocol**:
```
Server-Sent Events (SSE) + JSON-RPC 2.0
```

**SSE Endpoint URL**:
```
https://nexus.projectnyra.com/mcp
```

**Authentication Type**:
```
Bearer Token (Optional - Nexus Router handles GitHub auth)
```

### 2.3 Configure Transport Settings

Set the following options in the connector configuration:

```json
{
  "protocol": "sse-jsonrpc",
  "endpoint": "https://nexus.projectnyra.com/mcp",
  "headers": {
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
  },
  "timeout": 30000,
  "retries": 3,
  "heartbeat": {
    "enabled": true,
    "interval": 30000
  },
  "cors": {
    "allowCredentials": true
  }
}
```

### 2.4 Test Connection

Click **"Test Connection"** in ChatGPT Developer Mode.

Expected behavior:
- Connection established (SSE handshake successful)
- Server sends connection acknowledgment
- Heartbeat received every 30 seconds
- Tool list retrieved successfully

## Step 3: Verify GitHub Tools Are Available

### 3.1 In ChatGPT Interface

1. Open a new ChatGPT conversation
2. Ensure GitHub connector is selected/enabled
3. Type: `What GitHub tools are available?`

ChatGPT should respond with:
```
I have access to the following GitHub tools:

READ OPERATIONS:
- search_repositories - Search GitHub repositories
- search_code - Search code across repositories
- search_issues - Find issues across repositories
- get_user - Get user profile information
- get_repository - Get repository details
- list_repository_files - List files in repository
- get_file_contents - Get file content
- list_commit_history - View commit history
...and 40+ more tools

WRITE OPERATIONS (Audit Logged):
- create_branch - Create a new branch
- create_pull_request - Open a pull request
- create_issue - Create an issue
- merge_pull_request - Merge a PR
- create_or_update_file - Create or update files
- delete_file - Delete files
...and more write operations
```

### 3.2 Test a Simple Operation

Ask ChatGPT:
```
List the top 5 repositories I've starred, showing name and star count.
```

ChatGPT should:
1. Use `search_repositories` tool with your auth
2. Parse the results
3. Display the top 5 repositories in a formatted list

## Step 4: Security Configuration

### 4.1 Understand Audit Logging

All GitHub write operations are automatically logged with:
- **Timestamp**: When the operation occurred
- **Operation**: Which GitHub action (create_branch, merge_pull_request, etc.)
- **Status**: Success or failure
- **Duration**: How long the operation took
- **User**: ChatGPT session identifier
- **Redacted Parameters**: All sensitive data removed

### 4.2 Review Audit Logs

Access audit logs via the Nexus Router:

```bash
# SSH into the Nexus Router host
ssh your-host.com

# View recent GitHub operations
tail -20 /var/log/nexus-router/mcp-audit/github-operations.jsonl | jq .

# Search for specific operations
grep "create_pull_request" /var/log/nexus-router/mcp-audit/github-operations.jsonl | jq .
```

### 4.3 Set Up Alerts (Optional)

Configure monitoring to alert on:
- High rate of GitHub operations (potential abuse)
- Failed operations (potential issues)
- Specific sensitive operations (branch deletions, force pushes)

See [Production Deployment Guide](./GITHUB-CONNECTOR-PRODUCTION-DEPLOYMENT.md#monitoring-and-alerting) for detailed monitoring setup.

## Step 5: Test Common Operations

### 5.1 Reading Data

Ask ChatGPT these questions to test read operations:

```
1. "Show me all open issues in the project-nyra repository"
2. "List all pull requests with the 'bug' label"
3. "What was the last commit message in main branch?"
4. "Show recent commit history for the last week"
5. "List all branches in the repository"
```

### 5.2 Creating Resources

Test write operations (with caution):

```
1. "Create a new branch called 'feature/test-github-connector' from main"
2. "Create an issue titled 'Test GitHub Connector' with description: 'This is a test from ChatGPT'"
3. "List the new branch and issue you just created"
```

Then manually clean up:
```bash
# Delete the test branch
git push origin --delete feature/test-github-connector

# Close the test issue in GitHub UI
```

### 5.3 Complex Operations

Try more sophisticated tasks:

```
"I need to create a pull request that:
- Branches from main as 'feature/github-connector-test'
- Includes a test commit message
- Creates a PR with title 'Test GitHub Connector'
- Sets description to 'This PR tests ChatGPT GitHub integration'"
```

Then:
1. Review the PR in GitHub
2. Verify it was created correctly
3. Close/delete it

## Step 6: Common Workflows

### 6.1 Issue Triage Workflow

```
ChatGPT: "I have 5 new issues to triage. Please:
1. Search for all open issues with 'needs-triage' label
2. Get details for each one
3. Add appropriate labels based on priority/type
4. Post a comment on critical issues"
```

### 6.2 Code Review Workflow

```
ChatGPT: "Review the pull requests that have been waiting longest:
1. List all open PRs sorted by oldest first
2. For each PR, get changed files and commit messages
3. Identify potential issues or improvements
4. Post review comments if problems found"
```

### 6.3 Branch Management Workflow

```
ChatGPT: "Help me clean up old branches:
1. List all branches except main
2. For each branch older than 30 days, check if there's an associated PR
3. Create a summary of stale branches
4. Delete the ones that are fully merged"
```

### 6.4 Release Workflow

```
ChatGPT: "Prepare for v2.0 release:
1. Create a release branch from main
2. Search for issues labeled 'v2.0'
3. Create a summary of all PRs merged since v1.0
4. Create a draft release with the summary"
```

## Troubleshooting

### Connection Issues

**Problem**: "Cannot connect to GitHub connector"

**Solutions**:
1. Verify Nexus Router is running: `curl https://nexus.projectnyra.com/health`
2. Check Cloudflare tunnel status
3. Verify TLS certificate is valid: `openssl s_client -connect nexus.projectnyra.com:443`
4. Check ChatGPT Developer Mode settings for correct URL

**Problem**: "SSE connection keeps disconnecting"

**Solutions**:
1. Verify heartbeat is working (30-second intervals)
2. Check firewall/proxy doesn't kill long-lived connections
3. Increase connection timeout in connector settings
4. Check server logs for connection errors

### Authentication Issues

**Problem**: "Insufficient permissions" or "Unauthorized" errors

**Solutions**:
1. Verify GitHub token is valid: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`
2. Check token has required scopes (repo, repo_status, public_repo)
3. Verify token hasn't expired
4. Create new token with proper permissions if needed

### Tool Execution Issues

**Problem**: "Tool call failed" or "Method not found"

**Solutions**:
1. Verify tool name is spelled correctly
2. Check required parameters are provided: `curl -X POST ... | jq '.result.tools[] | select(.name=="create_pull_request")'`
3. Review tool documentation in output of `tools/list`
4. Check error message for specific parameter requirements

**Problem**: "Rate limit exceeded"

**Solutions**:
1. Wait before retrying (GitHub API rate limits reset hourly)
2. Check rate limit status: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit | jq .`
3. Consolidate multiple operations into fewer API calls
4. Contact GitHub for higher rate limits if needed

### Audit Logging Issues

**Problem**: "Operations not appearing in audit logs"

**Solutions**:
1. Verify audit logging is enabled: `echo $MCP_AUDIT_LOGGING_ENABLED`
2. Check log file path has write permissions: `ls -la /var/log/nexus-router/mcp-audit/`
3. Verify operations are write operations (reads aren't logged)
4. Check log file for recent entries: `tail /var/log/nexus-router/mcp-audit/github-operations.jsonl`

## Best Practices

### 1. Security

- **Never share audit logs** with unauthorized users
- **Review sensitive operations** in ChatGPT conversations before executing
- **Use least-privilege tokens** with only required GitHub scopes
- **Rotate GitHub tokens regularly** (every 90 days recommended)
- **Monitor audit logs** for unusual activity

### 2. Operational

- **Test in non-production repos first**
- **Always create a test branch** for PRs before attempting on main
- **Review operations** before confirming in ChatGPT
- **Keep conversations focused** to avoid accidental commands
- **Archive important conversations** for compliance records

### 3. Performance

- **Batch operations when possible** (multiple files in one PR)
- **Avoid querying large repositories** with unfiltered searches
- **Use specific filters** for issue/PR searches
- **Cache frequently accessed data** by creating a summary at start of session

### 4. Compliance

- **Maintain audit logs** for regulatory compliance
- **Document decision rationale** in PR descriptions and commit messages
- **Use consistent naming conventions** for branches and commits
- **Archive conversations** containing significant decisions
- **Review access patterns** regularly

## Advanced Configuration

### Custom Tool Parameters

For specific GitHub operations, you can configure timeout and retry behavior:

```json
{
  "tools": {
    "create_pull_request": {
      "timeout": 60000,
      "retries": 5,
      "description": "Allow more time for PR creation with retry"
    },
    "merge_pull_request": {
      "requiresConfirmation": true,
      "description": "Require explicit confirmation for merge operations"
    }
  }
}
```

### Rate Limiting Configuration

Control how aggressively ChatGPT can use the connector:

```json
{
  "rateLimiting": {
    "requestsPerMinute": 60,
    "requestsPerHour": 1000,
    "burstLimit": 10,
    "retryAfter": 60
  }
}
```

### Audit Logging Configuration

Fine-tune audit behavior:

```json
{
  "auditLogging": {
    "enabled": true,
    "logLevel": "info",
    "redactSecrets": true,
    "maxLogSize": "100MB",
    "retentionDays": 90,
    "captureResponses": true,
    "truncateAt": 5000
  }
}
```

## Monitoring and Compliance

### 1. Review Audit Logs Regularly

```bash
# Daily review script
#!/bin/bash
YESTERDAY=$(date -d "yesterday" '+%Y-%m-%d')
echo "GitHub operations for $YESTERDAY:"
grep "$YESTERDAY" /var/log/nexus-router/mcp-audit/github-operations.jsonl | jq .
```

### 2. Alert on Critical Operations

```bash
# Alert on merge operations
grep "merge_pull_request" /var/log/nexus-router/mcp-audit/github-operations.jsonl | \
  jq 'select(.success == true)'
```

### 3. Compliance Reporting

Generate compliance reports:

```bash
# Count operations by type
grep -o '"tool":"[^"]*"' /var/log/nexus-router/mcp-audit/github-operations.jsonl | \
  sort | uniq -c | sort -rn
```

## Support

For issues or questions:

1. **Check logs**: Review audit logs and error messages
2. **Test locally**: Verify connector works with curl before troubleshooting ChatGPT
3. **Review documentation**:
   - [Production Deployment Guide](./GITHUB-CONNECTOR-PRODUCTION-DEPLOYMENT.md)
   - [Setup Report & Verification](./GITHUB-CONNECTOR-SETUP-REPORT.md)
   - [Security Integration](./SECURITY-INTEGRATION.md)
4. **Contact team**: Escalate to infrastructure team if issue persists

## References

- **GitHub MCP Server**: https://github.com/modelcontextprotocol/servers/tree/main/src/github
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **ChatGPT Developer Mode**: https://chat.openai.com/dashboard/developers
- **Nexus Router**: [Nexus Router Documentation](./README.md)
- **GitHub API**: https://docs.github.com/en/rest

---

**Last Updated**: 2026-05-11
**Version**: 1.0
**Status**: Production Ready
