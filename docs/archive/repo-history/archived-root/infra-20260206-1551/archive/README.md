# Infrastructure Archive

This directory contains archived infrastructure configurations from previous implementations.

## Contents

### nyra-infra-old/
**Archived**: 2026-01-16
**Reason**: Consolidated into main `infra/` folder
**Size**: 526KB
**Files**: 106

**Contents**:
- `legacy-infra/` - Previous infrastructure setup
- `nyra-stack-v6_2/` - Version 6.2 of the Nyra stack
- `nyra-stack-orchestrator/` - CASI Stack orchestrator
- `compose/` - Old Docker Compose files (superseded by `infra/docker/`)
- `metamcp-gateway/` - MetaMCP gateway configurations
- `MCP-Servers/` - MCP server implementations
- `postgres/` - PostgreSQL initialization scripts
- `docker/` - Old Docker configurations
- `tasks/` - Task automation scripts
- `.env.example` - Environment variable template (outdated)
- `README.md` - Original documentation
- `open-webui-compose.yml` - Open WebUI compose file

### Why Archived?

1. **Quality**: Current `infra/docker/` implementation is production-ready with:
   - Proper YAML structure
   - Health checks
   - Resource limits
   - Comprehensive logging
   - Security hardening

2. **Completeness**: Current implementation includes:
   - Multiple deployment environments (dev/full/prod)
   - Comprehensive observability stack
   - Production-grade configurations
   - Proper documentation

3. **Conflicts**: Old compose files had:
   - Malformed YAML syntax
   - Missing health checks
   - No resource management
   - Incomplete configurations

### Restoration

If you need to reference or restore any archived configuration:

```bash
# View archived content
cd infra/archive/nyra-infra-old
ls -la

# Copy specific file back
cp compose/compose.mcp.yml ../../docker/docker-compose.mcp-legacy.yml

# Compare versions
diff compose/compose.mcp.yml ../../docker/docker-compose.mcp.yml
```

### Related Documentation

- **Current Infrastructure**: `../docker/README.md`
- **Consolidation Log**: `../CONSOLIDATION-LOG.md`
- **Environment Setup**: `../.env.example`

---

**Note**: This archive is maintained for historical reference and potential recovery scenarios. The current `infra/` implementation should be used for all active development and deployments.
