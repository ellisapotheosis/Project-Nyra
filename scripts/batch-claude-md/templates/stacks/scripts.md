## Automation Scripts Guidelines

### Script Organization
- Separate by purpose (setup, deployment, maintenance)
- Use consistent naming conventions
- Include documentation headers
- Version control all scripts

### PowerShell Scripts
```powershell
# Script header with purpose
param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Logging function
function Write-Log {
    param($Message, $Type = "INFO")
    Write-Host "[$Type] $Message"
}

# Main execution
try {
    Write-Log "Starting process..."
    # Script logic here
} catch {
    Write-Log $_.Exception.Message "ERROR"
    exit 1
}
```

### Bash Scripts
```bash
#!/bin/bash
set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/script.log"

# Logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Main execution
main() {
    log "Starting process..."
    # Script logic here
}

main "$@"
```

### Error Handling
- Proper exit codes
- Meaningful error messages
- Rollback mechanisms
- Idempotent operations

### Configuration
- Environment variables
- Config files
- Command-line arguments
- Sensible defaults

### Testing
- Dry-run mode
- Verbose output option
- Unit tests where appropriate
- Integration tests

### Documentation
- Purpose and usage
- Prerequisites
- Parameters and options
- Examples
- Troubleshooting

### Best Practices
- Use strict error handling
- Validate inputs
- Log all operations
- Make scripts idempotent
- Use version control
- Regular maintenance
