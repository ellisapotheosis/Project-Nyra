---
name: n8n-skills-catalog
description: Use to find the right n8n skill for a task, browse available skills, discover workflow patterns, or get an overview of all n8n automation capabilities
---

# n8n Skills Catalog

**When to use**: Need to find the right skill for a task, explore available capabilities, or get started with n8n automation.

## 🎯 Quick Skill Finder

### I need to...

**Fix n8n errors or issues**
→ Use: `n8n-best-practices`

- Code node errors
- HTTP request failures
- Environment variable issues
- Data flow problems

**Scrape websites**
→ Use: `anti-scraping`

- Bypass Cloudflare
- JavaScript rendering
- Multi-page scraping

**Integrate AI models**
→ Use: `ai-integration`

- OpenAI, Qwen, Claude
- Structured output parsing
- Content analysis

**Work with Notion**
→ Use: `notion-operations`

- Create/update pages
- Query databases
- Sync data

**Handle OAuth tokens**
→ Use: `oauth-automation`

- Auto-refresh tokens
- YouTube/Google APIs
- Prevent expiration

**Process videos**
→ Use: `video-processing`

- Extract subtitles
- Analyze content
- Generate timestamps

## 📚 All Available Skills

### 🔧 Core & Best Practices

**n8n-best-practices** ⭐ **START HERE**

- ES5 syntax requirements
- HTTP request patterns
- Environment variables
- Data flow patterns
- Common pitfalls
- Debugging strategies

**Location**: `/mnt/d/work/n8n_agent/n8n-skills/n8n-best-practices/`

### 🌐 Web Scraping

**anti-scraping**

- Cloudflare bypass
- Playwright automation
- Stealth configurations
- Screenshot debugging

**pagination**

- Multi-page scraping
- URL generation
- Batch processing

**html-parsing**

- Cheerio extraction
- CSS selectors
- Data extraction patterns

**Location**: `/mnt/d/work/n8n_agent/n8n-skills/anti-scraping/`, `pagination/`, `html-parsing/`

### 🤖 AI Integration

**ai-integration**

- Multi-provider support (OpenAI, Qwen, Claude)
- Structured output parsing
- Prompt engineering
- Schema validation
- Error handling

**idea-generation**

- Content clustering
- Batch processing
- Multilingual output
- Creative automation

**Location**: `/mnt/d/work/n8n_agent/n8n-skills/ai-integration/`, `idea-generation/`

### 📊 Data & Storage

**notion-operations**

- Complete CRUD operations
- All field types
- Database synchronization
- Query patterns
- Structured data design

**notion-link-analysis**

- URL → AI → Notion automation
- Content extraction
- Auto-tagging
- Knowledge management

**notion-database-sync**

- Sync between databases
- Deduplication
- Field mapping
- Status tracking

**Location**: `/mnt/d/work/n8n_agent/n8n-skills/notion-operations/`, `notion-link-analysis/`, `notion-database-sync/`

### 🔐 Authentication

**n8n-oauth-automation**

- OAuth token refresh
- Real-time updates
- Scheduled refresh
- Google/YouTube APIs
- Hybrid patterns

**Location**: `/mnt/d/work/n8n_agent/n8n-skills/n8n-oauth-automation/`

### 🎥 Media Processing

**video-processing**

- YouTube subtitle extraction
- VTT parsing
- Timestamp handling
- Screenshot generation
- Video metadata

**Location**: `/mnt/d/work/n8n_agent/n8n-skills/video-processing/`

### 🛠️ Utilities

**error-handling**

- Retry logic
- Exponential backoff
- Error classification

**data-processing**

- Deduplication
- Aggregation
- Data cleaning

**data-export**

- CSV generation
- Special character handling
- Encoding

**debugging**

- Data inspection
- Validation
- Quality checks

**feishu-integration**

- Feishu/Lark messaging
- Notifications
- Card messages

**Location**: `/mnt/d/work/n8n_agent/n8n-skills/error-handling/`, `data-processing/`, `data-export/`, `debugging/`, `feishu-integration/`

## 🔗 Common Workflow Patterns

### Pattern 1: Web Scraping Pipeline

```
anti-scraping → html-parsing → data-processing → data-export
```

**Use for**: E-commerce scraping, content collection, price monitoring

### Pattern 2: AI Content Analysis

```
input → ai-integration → notion-operations
```

**Use for**: Content analysis, auto-tagging, knowledge management

### Pattern 3: Video Intelligence

```
oauth-automation → video-processing → ai-integration → notion-operations
```

**Use for**: Video indexing, show notes, content summarization

### Pattern 4: Link Collection

```
webhook → notion-link-analysis → notion database
```

**Use for**: Research, content curation, inspiration collection

### Pattern 5: Database Sync

```
schedule → notion-database-sync → target database
```

**Use for**: Cross-database synchronization, data migration

## 🚀 Getting Started Guide

### Step 1: Identify Your Need

1. What are you trying to automate?
2. What data sources/APIs are involved?
3. What output do you need?

### Step 2: Find Relevant Skills

Use the Quick Skill Finder above or browse by category.

### Step 3: Read the Documentation

Each skill has detailed `SKILL.md` with:

- When to use it
- Quick start examples
- Complete patterns
- Troubleshooting

### Step 4: Check Best Practices FIRST

Always read `n8n-best-practices` before implementing:

- Avoid ES6 syntax errors
- Use correct HTTP patterns
- Handle environment variables properly

### Step 5: Combine Skills

Most complex workflows use multiple skills together.

## 📖 Documentation Structure

### For Each Skill

**Quick Reference**:

- `.claude/skills/{skill-name}/SKILL.md` - Claude Code skill
- Optimized for quick lookup during development

**Complete Documentation**:

- `/mnt/d/work/n8n_agent/n8n-skills/{skill-name}/README.md` - Full guide
- Code files (`.js`) - Copy-paste ready implementations
- Examples and templates

### Key Files to Read

**Essential** (Read First):

1. `n8n-best-practices/README.md` - Critical n8n patterns
2. `n8n-skills/README.md` - Complete skill catalog
3. `SKILLS_RETRIEVAL_GUIDE.md` - How to use skills effectively

**Project Level**:

- `/mnt/d/work/n8n_agent/CLAUDE.md` - Repository guide
- `/mnt/d/work/n8n_agent/n8n-skills/QUICK_START.md` - Quick start guide

## 🔍 How to Search for Solutions

### Method 1: By Problem

"I'm getting error X" → `n8n-best-practices`
"Need to scrape site Y" → `anti-scraping`
"OAuth token expired" → `oauth-automation`

### Method 2: By Technology

YouTube → `video-processing` + `oauth-automation`
Notion → `notion-operations`
AI/LLM → `ai-integration`
Cloudflare → `anti-scraping`

### Method 3: By Pattern

Single page → `anti-scraping` + `html-parsing`
Multi-page → Add `pagination`
With AI → Add `ai-integration`
Save to Notion → Add `notion-operations`

### Method 4: By Keyword

```bash
# Search in skills directory
grep -r "keyword" /mnt/d/work/n8n_agent/n8n-skills/*/README.md
```

## 💡 Tips for Success

### Golden Rules

1. **Check Best Practices FIRST** - Saves hours of debugging
2. **Use ES5 syntax only** - No arrow functions, template literals
3. **Use `require('https')`** - Not `$http` or `axios`
4. **Export environment variables** - Don't just `source`
5. **Preserve data flow** - Always spread previous data

### Common Mistakes to Avoid

- ❌ Using ES6 syntax in Code nodes
- ❌ Using `$http` for HTTP requests
- ❌ Not exporting environment variables
- ❌ Losing upstream data in transformations
- ❌ Hardcoding credentials

### When Stuck

1. Check `n8n-best-practices/README.md`
2. Search relevant skill documentation
3. Check error message against known issues
4. Test code outside n8n first
5. Simplify workflow to isolate problem

## 📊 Skills by Difficulty

**⭐ Easy (Start Here)**

- data-processing
- data-export
- debugging
- error-handling

**⭐⭐ Moderate**

- html-parsing
- pagination
- feishu-integration

**⭐⭐⭐ Intermediate**

- anti-scraping
- notion-operations
- ai-integration

**⭐⭐⭐⭐ Advanced**

- video-processing
- oauth-automation
- notion-database-sync

**⭐⭐⭐⭐⭐ Expert**

- n8n-best-practices (must know)
- Complete workflow architecture

## 🔗 Related Resources

**Full Skills Library**:
`/mnt/d/work/n8n_agent/n8n-skills/`

**Python Workflow Agent**:
`/mnt/d/work/n8n_agent/n8n-workflow-agent/`

**Repository Guide**:
`/mnt/d/work/n8n_agent/CLAUDE.md`

## 📞 How to Use This Catalog

**During Development**:

1. Problem occurs → Search this catalog
2. Find relevant skill
3. Read skill's SKILL.md
4. Check full README.md if needed
5. Copy code and adapt

**Planning New Workflow**:

1. List requirements
2. Map to skills using Quick Finder
3. Read each skill's documentation
4. Design workflow combining skills
5. Implement with best practices

**Learning**:

1. Start with `n8n-best-practices`
2. Try simple skills (data-export, debugging)
3. Progress to intermediate (anti-scraping, ai-integration)
4. Combine skills for complex workflows
5. Contribute back improvements

---

**Last Updated**: 2025-11-03
**Total Skills**: 14+
**Total Code Files**: 43+
**Lines of Documentation**: 8500+
