# User Setup Guidance

Welcome to the Project Nyra user setup documentation. This directory contains step-by-step guides for tasks that require manual intervention during and after system setup.

---

## 📚 Available Guides

### 🎯 [POST-CONSOLIDATION-GUIDE.md](POST-CONSOLIDATION-GUIDE.md)
**Comprehensive manual setup guide** covering all post-consolidation tasks.

**What's Inside**:
- ✅ MCP server authentication setup (Infisical, Bitwarden)
- ✅ Environment variable configuration
- ✅ Docker registry authentication
- ✅ Database initialization and verification
- ✅ Comprehensive troubleshooting section
- ✅ Rollback and recovery procedures
- ✅ Advanced configuration options

**Who Should Use This**:
- First-time setup users
- Troubleshooting configuration issues
- Understanding the complete setup process

**Estimated Time**: 30-60 minutes (first-time setup)

---

### ⚡ [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
**One-page quick reference card** for common commands and tasks.

**What's Inside**:
- ⚡ Essential commands for quick access
- ⚡ Port reference table
- ⚡ Common troubleshooting fixes
- ⚡ Emergency recovery commands
- ⚡ Setup completion checklist

**Who Should Use This**:
- Experienced users needing quick reference
- During troubleshooting for command lookup
- As a printed reference card

**Estimated Time**: 5 minutes (reference lookup)

---

## 🚀 Getting Started

### New Users (First Time Setup)

**Recommended Path**:
1. Read [Quick Reference](QUICK-REFERENCE.md) for overview (5 min)
2. Follow [Post-Consolidation Guide](POST-CONSOLIDATION-GUIDE.md) step-by-step (30-60 min)
3. Keep Quick Reference open for command lookup

### Experienced Users (Returning)

**Recommended Path**:
1. Use [Quick Reference](QUICK-REFERENCE.md) for commands
2. Refer to [Post-Consolidation Guide](POST-CONSOLIDATION-GUIDE.md) troubleshooting section if issues arise

---

## 📋 What Requires Manual Setup?

These tasks **cannot be automated** because they require:
- External service authentication
- Secure credential generation
- User-specific API keys
- Manual security verification

### 1. Authentication & Credentials
- **Infisical**: Login and project initialization
- **Bitwarden**: Vault setup and API credentials
- **Anthropic**: API key generation
- **Docker Registries**: Authentication tokens

### 2. Configuration
- **Environment Variables**: Secret generation and .env file setup
- **Database Credentials**: Password generation and storage
- **API Keys**: Obtaining keys from external services

### 3. Verification
- **Health Checks**: Ensuring all services are operational
- **Database Initialization**: Creating databases and users
- **End-to-End Testing**: Validating complete system functionality

---

## 🗂️ Document Structure

```
user-setup-guidance/
├── README.md                      ← You are here
├── POST-CONSOLIDATION-GUIDE.md    ← Comprehensive guide
└── QUICK-REFERENCE.md             ← Quick reference card
```

---

## 🎯 Quick Decision Tree

**Choose your path:**

```
Are you setting up for the first time?
├─ Yes → Start with POST-CONSOLIDATION-GUIDE.md
│         Follow step-by-step instructions
│         Use QUICK-REFERENCE.md for command lookup
│
└─ No → Already configured?
    ├─ Need to troubleshoot?
    │  └─ POST-CONSOLIDATION-GUIDE.md → Troubleshooting section
    │
    ├─ Need a command?
    │  └─ QUICK-REFERENCE.md → Command tables
    │
    └─ Need to reconfigure?
       └─ POST-CONSOLIDATION-GUIDE.md → Rollback section
```

---

## 📖 Related Documentation

### Core Documentation
- [Main README](../../README.md) - Project overview
- [Architecture](../architecture/system-architecture.md) - System design
- [Deployment Guide](../deployment/PRODUCTION-DEPLOYMENT-GUIDE.md) - Production setup

### Operational Guides
- [Environment Variables](../environment/ENVIRONMENT_VARIABLES.md) - Variable reference
- [Infrastructure Status](../infra/INFRASTRUCTURE_STATUS.md) - System status
- [Troubleshooting](../troubleshooting/MASTER-TROUBLESHOOTING.md) - Issue resolution

### Integration Guides
- [Infisical Integration](../integration/INFISICAL_INTEGRATION_SUMMARY.md) - Secrets management
- [Docker Setup](../deployment/DOCKER-STATUS-REPORT.md) - Container orchestration
- [MCP Status](../deployment/MCP-STATUS-REPORT.md) - MCP server status

---

## 🆘 Support & Help

### Before Requesting Help

1. **Check the guides above** - Most common issues are covered
2. **Run diagnostic scripts**:
   ```bash
   ./scripts/health-check.sh        # Check all services
   ./scripts/validate-env.sh        # Validate configuration
   ```
3. **Check service logs**:
   ```bash
   docker-compose logs -f           # View all logs
   docker logs <container-name>     # Specific container
   ```

### Getting Support

**GitHub Issues**: https://github.com/mhenry3164/Project-Nyra/issues

**When reporting issues, include**:
- Which guide you were following
- Which step you're stuck on
- Error messages (sanitize secrets!)
- Output from health-check script
- Your environment (OS, Docker version)

### Self-Help Resources

1. **Search existing issues**: https://github.com/mhenry3164/Project-Nyra/issues
2. **Check troubleshooting section**: [POST-CONSOLIDATION-GUIDE.md](POST-CONSOLIDATION-GUIDE.md#troubleshooting)
3. **Review logs**: Most issues are visible in container logs

---

## ✅ Setup Success Criteria

You've completed setup successfully when:

- [ ] All Docker containers show "healthy" status
- [ ] Health check script passes all tests
- [ ] API endpoints respond correctly
- [ ] Databases are initialized and accessible
- [ ] MCP servers are responding
- [ ] Integration tests pass
- [ ] You can access the web interface

**Verify with**:
```bash
# Quick verification
docker-compose ps                    # All should be "Up (healthy)"
./scripts/health-check.sh            # Should show "ALL SYSTEMS OPERATIONAL"
curl http://localhost:8001/health    # Should return 200 OK
```

---

## 🔄 Keeping Documentation Updated

This documentation reflects the state of the system as of **2026-01-16**.

**If you find issues**:
1. Check if there's already a GitHub issue
2. If not, create a new issue with label `documentation`
3. Include the document name and specific section

**Contributing updates**:
- Fork the repository
- Update documentation
- Submit pull request with description of changes

---

## 📝 Document Versions

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| POST-CONSOLIDATION-GUIDE.md | 1.0.0 | 2026-01-16 | ✅ Current |
| QUICK-REFERENCE.md | 1.0.0 | 2026-01-16 | ✅ Current |
| README.md (this file) | 1.0.0 | 2026-01-16 | ✅ Current |

---

## 🎓 Learning Path

**Recommended learning progression**:

1. **Beginner** (Day 1)
   - Read this README
   - Follow POST-CONSOLIDATION-GUIDE.md
   - Complete basic setup

2. **Intermediate** (Week 1)
   - Explore [Architecture Docs](../architecture/)
   - Review [API Documentation](../api/)
   - Understand service interactions

3. **Advanced** (Month 1)
   - Review [Deployment Guide](../deployment/)
   - Study [Infrastructure Docs](../infra/)
   - Implement multi-PC setup

---

## 💡 Tips for Success

### During Setup
- ✅ **Take your time** - Don't rush through steps
- ✅ **Save credentials** - Keep a secure note of generated secrets
- ✅ **Create backups** - Before making major changes
- ✅ **Test incrementally** - Verify each section before moving on
- ✅ **Read error messages** - They usually indicate the problem

### After Setup
- ✅ **Create regular backups** - Use `./scripts/backup-all.sh`
- ✅ **Monitor health** - Regular health checks
- ✅ **Keep documentation handy** - Bookmark quick reference
- ✅ **Update secrets periodically** - Security best practice
- ✅ **Stay updated** - Watch for documentation updates

---

## 🚀 Next Steps After Setup

Once you've completed the setup:

1. **Explore the System**
   - Access web interface: http://localhost:3000
   - Try API endpoints: http://localhost:7000/tools
   - View monitoring: http://localhost:9090

2. **Read User Guides**
   - [User Guide](../guides/USER-GUIDE.md) (if available)
   - [API Documentation](../api/README.md)
   - [Workflow Examples](../workflows/)

3. **Configure Monitoring**
   - Set up Grafana dashboards
   - Configure alerts
   - Review metrics

4. **Production Preparation** (if applicable)
   - Review [Deployment Guide](../deployment/PRODUCTION-DEPLOYMENT-GUIDE.md)
   - Set up automated backups
   - Configure high availability

---

**Happy Setting Up! 🎉**

If you encounter any issues, remember:
- Check the troubleshooting section
- Review service logs
- Don't hesitate to ask for help

**Document Maintained By**: Project Nyra Team
**Version**: 1.0.0
**Last Updated**: 2026-01-16
