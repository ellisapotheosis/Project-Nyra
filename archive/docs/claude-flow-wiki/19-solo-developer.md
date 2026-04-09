# CLAUDE.md Template: Solo Developer

**Team Size**: 1 Person
**Scope**: Full-Stack Development
**Focus**: Speed & Simplicity
**Technology Stack**: {{TECH_STACK}}

## 🚨 MINIMAL SWARM SETUP

**Solo developers use lightweight coordination:**

```bash
# Single agent with self-coordination
npx @claude-flow/cli@latest agent spawn -t coder --name solo-dev --capabilities "full-stack,devops,qa"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Project Scope**: {{SCOPE}} (MVP/Startup/Side Project)
- **Target Users**: {{TARGET_USERS}}
- **Timeline**: {{TIMELINE}}

## 🔧 Solo Developer Workflow

### Simplified Project Structure
```
project/
├── src/
│   ├── app/
│   ├── components/
│   ├── utils/
│   ├── styles/
│   └── index.ts
├── tests/
├── docs/
├── .env.example
├── package.json
└── README.md
```

### Rapid Development Approach
```bash
# Start with boilerplate
npx create-next-app@latest {{PROJECT_NAME}}

# Install essentials only
npm install

# Start coding immediately
npm run dev

# Deploy early, iterate fast
npm run build && npm run deploy
```

## 🚀 Solo Developer Priorities

### Phase 1: MVP (1-2 weeks)
- Core feature implementation
- Basic UI/UX
- Essential backend logic

### Phase 2: Launch (1 week)
- Security basics
- Error handling
- Simple deployment

### Phase 3: Iteration (Ongoing)
- User feedback incorporation
- Bug fixes
- Performance optimization

## 🧠 Memory Management

### Store Solo Learnings
```bash
npx @claude-flow/cli@latest memory store --key "solo-learnings-{{PROJECT_NAME}}" \
  --value "What worked, what to avoid, productivity tips" \
  --namespace solo --tags "developer,learning"
```

## ✅ Simplified Testing

### Focus on Critical Paths
```
- User authentication
- Core business logic
- Payment processing (if applicable)
- Error scenarios
```

## 📊 Quality Targets (Realistic)

- Core functionality: 100% working
- Critical tests: 70%+ coverage
- Security: Basics covered
- Performance: Good enough

## 💡 Solo Tips

1. **Use No-Code/Low-Code**: Stripe, Auth0, Firebase
2. **Pick One Stack**: Don't context-switch
3. **Ship Fast**: MVP > perfection
4. **Auto-Deploy**: GitHub Actions + Vercel/Railway
5. **Monitor Basics**: Error tracking + analytics
6. **Keep Docs Simple**: README is enough initially

## 📋 Solo Developer Checklist

- [ ] Project initialized
- [ ] Core features implemented
- [ ] Basic tests passing
- [ ] Deployed to staging
- [ ] Production deployment ready
- [ ] Monitoring enabled
- [ ] Backup strategy
- [ ] Domain configured

---

**Generated from**: claude-flow CLAUDE.md Solo Developer Template
