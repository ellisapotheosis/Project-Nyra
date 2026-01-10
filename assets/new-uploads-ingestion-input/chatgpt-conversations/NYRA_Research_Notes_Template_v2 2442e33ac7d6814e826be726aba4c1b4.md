# NYRA_Research_Notes_Template_v2

# 🔍 NYRA Research Notes Template

*Your living scratchpad for evaluating tools, ranking frameworks, and refining your agentic + dev setup.*

---

## 📂 Section Index

- [1. Agent Frameworks](about:blank#1-agent-frameworks)
- [2. Memory Systems](about:blank#2-memory-systems)
- [3. IDEs / Code Assistants](about:blank#3-ides--code-assistants)
- [4. Voice & Automation Interfaces](about:blank#4-voice--automation-interfaces)
- [5. Experimental Systems](about:blank#5-experimental-systems)
- [6. Repository Links to Explore](about:blank#6-repository-links-to-explore)
- [7. Tool Comparison Tables](about:blank#7-tool-comparison-tables)
- [8. Pending Decisions](about:blank#8-pending-decisions)

---

## 1. Agent Frameworks #Agent #NYRA

| Tool | Status | Notes |
| --- | --- | --- |
| OpenEvolve | ✅ Primary orchestrator candidate (CodeLion) |  |
| CrewAI | 🟡 Testing |  |
| LettaAI | 🟡 Good for task routing |  |
| Autogen | ⬜ Candidate |  |
| LangGraph | ⬜ Memory-routing hybrid |  |
| Others |  |  |

---

## 2. Memory Systems #Memory #NYRA

| Tool | Type | Notes |
| --- | --- | --- |
| memOS | Node-based | Requires MemoryCubes |
| LangMem | LangChain ext | ✅ Good for routing memory context |
| MemGPT | Chat-like | Good for recall/agent persistence |
| Letta + Mem | Hybrid | Letta supports external memories |
| ChromaDB | Vector store | Ideal for semantic memory routing |

---

## 3. IDEs / Code Assistants #Dev #Agent

| Tool | Status | Notes |
| --- | --- | --- |
| Continue.dev | ✅ Core Dev IDE (VS Code) |  |
| Aider | ✅ Natural language Git edits |  |
| RooCode | 🟡 Autopilot + VS Code Extension |  |
| Claude Code | 🟡 Requires API or Claude Artifact manually |  |
| Tabnine | ⬜ Lightweight Copilot-style |  |
| Cline | ⬜ Compare w/ RooCode |  |

---

## 4. Voice & Automation Interfaces #Voice #NYRA

| Tool | Use Case | Notes |
| --- | --- | --- |
| Voicemod API | Text-to-speech/AI | 4o/Claude speech layer integration |
| ElevenLabs | High quality TTS | Ideal for lifelike assistant voice |
| Home Assistant | On-device commands | Ties in via MCP server |
| Puppeteer/Selenium | Automation | Web scraping + control agents |

---

## 5. Experimental Systems & AGI Concepts #Experimental #NYRA

| Tool / Concept | Use Case | Status |
| --- | --- | --- |
| Map-Think-Do | Recursive agent thinking | 🧠 In review |
| LetMeDoIt v3 | Meta-agent delegate | ⬜ To test |
| ControlFlow | Reactive logic controllers | ⬜ Review |
| ManusAI | Fully autonomous scaffolder | 🧠 Strong candidate |
| GraphFlow | Node-based decision flows | ⬜ Explore |
| DSPy/BAML | Programmatic prompt tuning | ⬜ Add soon |

---

## 6. Repository Links to Explore #Research #Links

Paste links here, categorize after review.

- [ ]  https://github.com/codelionai/openevolve
- [ ]  https://github.com/letta-ai
- [ ]  https://github.com/langchain-ai/langmem
- [ ]  https://github.com/eliranwong/letmedoit
- [ ]  https://github.com/norup/ManusAI
- [ ]  Others: ________________________________________

---

## 7. Tool Comparison Tables #Compare #Research

### Example: IDE Agent Comparison

| Name | Model Use | Editor | Autonomy Level | Notes |
| --- | --- | --- | --- | --- |
| RooCode | GPT-4o | VSCode | Med/High |  |
| Cline | Claude | Web | Low/Medium |  |
| Continue | GPT-4 | VSCode | High | ✅ Best in IDE |
| Aider | GPT-4 | CLI | High | Best for repo edits |

---

## 8. Pending Decisions #NYRA

- [ ]  Which memory system to anchor? memOS + LangMem?
- [ ]  Pick primary coding agent: Continue, Aider, RooCode, or Cline?
- [ ]  Finalize routing architecture
- [ ]  Confirm ManusAI or other for scaffolding

---

This file is meant to be:
- ✅ Updated manually or via agent
- ✅ Synced to Notion for tracking
- ✅ Used by your agents for onboarding & config prompts

### **STATIC SITE HOSTS**

| Name | Price (per month) | Rating | Pros | Cons |
| --- | --- | --- | --- | --- |
| Netlify | Free/$19+ | 10 | Fast, easy CI/CD, free SSL, serverless | Limited backend, $ for teams |
| Vercel | Free/$20+ | 10 | Next.js native, quick deploy, free SSL | Usage limits, $ for pro |
| Cloudflare Pages | Free | 9 | Free, fast, global CDN, privacy | Simpler features |
| GitHub Pages | Free | 8 | Free, simple, great for docs/portfolios | No backend, no custom SSL apex |
| Firebase Hosting | Free/$25+ | 8 | Fast, good for SPAs, free SSL | Google lock-in, backend $ |
| Surge.sh | Free/$30 | 7 | Quick deploy, CLI simplicity | Few features, $ for custom SSL |
| Render | Free/$7+ | 7 | Static&dynamic, easy deploy | Outage-prone, less mature |
| AWS Amplify | Free/$5+ | 7 | AWS integration, scalable | Confusing for newbies |
| GitLab Pages | Free | 6 | Free, private repo hosting | GitLab required, basic |
| Azure Static Web Apps | Free/$9+ | 6 | Azure ecosystem, CI/CD | Less intuitive, MS account |

---

### **EMAIL HOSTS**

| Name | Price (per user/mo) | Rating | Pros | Cons |
| --- | --- | --- | --- | --- |
| Zoho Mail | Free/$1+ | 9 | Generous free, privacy | Basic UI |
| Google Workspace | $6+ | 10 | Robust, familiar, best spam | Pricey |
| Microsoft 365 | $6+ | 9 | Outlook, apps | Pricey |
| Proton Mail | Free/$5+ | 9 | Privacy, encryption | Fewer biz features |
| Fastmail | $3+ | 8 | Clean, fast, privacy | Not free |
| Migadu | $19/year (tiny) | 8 | Cheap, flexible, pay/usage | No free |
| Namecheap Private | $1+ | 7 | Cheap, easy domain link | Basic |
| Mailbox.org | $1+ | 7 | Privacy, EU-based | Dated UI |
| Yandex Mail | Free | 6 | Free, unlimited domains | Russian servers |
| Mailgun (Transactional) | Free/$0.8+ | 6 | API/SMTP for apps | No inboxes |

AI Infrastructure Recommendations for your command center—connecting local GPU machines with remote services through a robust architecture.

# **🧑‍🚀 Infrastructure Categories & Best Options**

| **Category** | **Best Option** | **Runner-up** | **Key Features** | **Pros** | **Cons** |
| --- | --- | --- | --- | --- | --- |
| Frontend Hosting | Vercel/Cloudflare Pages | GitHub Pages | Landing pages, dashboards, UIs | Free, fast, deploy from GitHub, SSL included | No backend/server-side code |
| Backend API Hub | Koyeb | Fly.io, Render, Hetzner | Serverless containers/functions | No infra to manage, easy scaling | Secrets handling, cold starts |
| Local Machine Networking | Tailscale/ZeroTier | - | Mesh VPN for home GPUs | No port-forwarding, private LAN-like networking | Slight learning curve |
| Email Hosting | Zoho Mail | Fastmail, Google Workspace | Custom domain email | Free/cheap, custom domain | Basic UI (Zoho), price (G Suite) |
| Domain/DNS Management | Cloudflare | - | DNS, DDoS protection, SSL | Free, fast, great UI | None significant |
| Database/Storage | Supabase | Firebase | Postgres, Auth, Storage | Auth, DB, storage all-in-one | Some lock-in (though open source) |

### **1. Frontend Hosting (Landing Page, Dashboards, UIs)**

- **Best:** Vercel, Netlify, or Cloudflare Pages
    - *Why?* Free, fast, deploy from GitHub, SSL included.
    - *Runner-up:* GitHub Pages (if just static, no JS backend)
- **Pros:** Easy, reliable, integrates with custom domains and subdomains.
- **Cons:** No backend/server-side code.

---

### **2. Backend API / Hub (Where all agents/computers talk)**

- **Best:** **Koyeb** (serverless containers/functions, generous free tier)
    - *Why?* Deploy Python/Node/Go APIs, always-on, easy to scale.
- **Runner-ups:** [Fly.io](http://Fly.io), Render, Hetzner (cheap VPS), DigitalOcean, Railway.
- **Pros:**
    - No infra to manage, easy scaling.
    - Containers/functions = bring your own code.
- **Cons:** May need to handle secrets/config carefully, cold start on free plans.

---

### **3. Connecting Local Machines (Your Home GPUs)**

- **Best:** **Tailscale** or **ZeroTier** (mesh VPN)
    - *Why?* Seamless, secure private networking between all your nodes (home or cloud).
- **Pros:**
    - No port-forwarding, NAT, or firewall drama.
    - Feels like a private LAN—can SSH or send API calls across your whole cluster.
- **Cons:**
    - Slight learning curve, but easy guides.

---

### **4. Email Hosting**

- **Best:** Zoho Mail (free/cheap), Fastmail (privacy), or Google Workspace (if you want G Suite)
- **Pros:** Custom domain, reliable, all the usual goodies.
- **Cons:** G Suite is pricey, Zoho UI is basic.

---

### **5. Domain/DNS Management**

- **Best:** Cloudflare (move DNS to Cloudflare for speed, DDoS protection, easy SSL)
- **Pros:**
    - Free, super fast, easy SSL, great DNS UI.
- **Cons:** None, really.

---

### **6. Realtime/Database/Storage (if needed for dashboards/logs)**

- **Best:** Supabase (Postgres, Auth, Storage—free generous tier)
- **Runner-up:** Firebase (Realtime DB), but can get pricey.
- **Pros:**
    - Auth, DB, storage, all-in-one.
- **Cons:** Some lock-in, but open source.

---

# **🛠️ Sample "AI Hub" Architecture**

### **How it comes together:**

- **Frontend:** Vercel or Cloudflare Pages (custom domain via Cloudflare)
- **Backend API (hub):** Koyeb (runs your FastAPI/Express/etc, public endpoint)
- **Local AI Nodes:** Connected to hub via Tailscale mesh VPN
- **Agent Dashboard:** Hosted on a subdomain (e.g., `dashboard.ratehunter.net`)
- **Email:** Zoho Mail (for `you@ratehunter.net`)
- **Database (optional):** Supabase (for logs, agent status, etc.)

---

# **🌟 Pros/Cons of Cloudflare + Koyeb "AI Hub"**

### **Pros:**

- **Scalable:** Add agents anytime, anywhere (local or cloud).
- **Secure:** Tailscale keeps your local machines private, Cloudflare protects your public-facing stuff.
- **Cheap:** Most of this is free or has a generous free tier.
- **Modern:** Deploy from Git, update in seconds, SSL everywhere.

### **Cons:**

- **Slight complexity:** Some setup required (VPN, Docker, Git deploys).
- **Cold starts:** Free Koyeb tier may sleep/slow to start after inactivity.
- **Not 100% "one click" like Wix, but so much more power.**

---

# **🐾 TL;DR Infrastructure Summary**

| **Need** | **Best Option(s)** | **Why Choose This** |
| --- | --- | --- |
| Frontend | Vercel/Cloudflare | Fast, free, CI/CD, SSL, easy subdomains |
| Backend API | Koyeb | Serverless, easy deploy, cheap/free |
| Local Networking | Tailscale/ZeroTier | Secure, LAN-like mesh between all machines |
| Email | Zoho/Fastmail/G Suite | Reliable, custom domain |
| DNS/Security | Cloudflare | Fast, free, DDoS, easy SSL |
| Database/Realtime | Supabase | Free, full-stack, modern Postgres backend |

---

# **2. Top 10 Choices for Each Category**

Simple, concise, and rated 1-10 (10 = divine, 1 = dust bunny).

**Note:** $ means paid, F = free tier/option.

---

### **Frontend Hosting**

| **Name** | **Score** | **Notes** |
| --- | --- | --- |
| Vercel | 10 | F, Fast, Next.js native, easy custom domain |
| Netlify | 10 | F, Intuitive, great docs, serverless |
| Cloudflare Pages | 9 | F, Fast, privacy, global CDN |
| GitHub Pages | 8 | F, Simple, limited, no dynamic content |
| Firebase Hosting | 8 | F, Fast, full Google stack |
| Surge.sh | 7 | F, Quick CLI, basic |
| Render | 7 | F, Static+dynamic, newer |
| AWS Amplify | 7 | F, Scalable, AWS lock-in |
| GitLab Pages | 6 | F, GitLab required |
| Azure Static Web Apps | 6 | F, Microsoft ecosystem |

---

### **Backend API (Server/Serverless/Container)**

| **Name** | **Score** | **Notes** |
| --- | --- | --- |
| Koyeb | 10 | F, Serverless, easy deploy, Docker support |
| Fly.io | 9 | F, Global, persistent storage available |
| Railway | 9 | F, Very easy deploy, nice UI |
| Render | 8 | F, Simple, static+dynamic |
| DigitalOcean | 8 | $, VPS, scalable, traditional |
| Hetzner | 8 | $, Cheap VPS, fast, EU based |
| AWS Lambda | 7 | F, Serverless, pay per use, steep learning |
| Google Cloud Run | 7 | F, Serverless, scales, GCP lock-in |
| Heroku | 6 | F, Was great, now limited, slow cold starts |
| Azure App Service | 6 | F, Microsoft stack, flexible |

---

### **Local Networking (Mesh VPN/Remote Connect)**

| **Name** | **Score** | **Notes** |
| --- | --- | --- |
| Tailscale | 10 | F, Magic mesh, super easy, secure |
| ZeroTier | 9 | F, Also easy, more custom routing |
| Nebula | 8 | F, Advanced, powerful, more manual |
| Cloudflare Tunnel | 8 | F, For single endpoints, not mesh |
| OpenVPN | 7 | F, Traditional, harder setup |
| WireGuard | 7 | F, Fast, low-level, DIY |
| Hamachi | 6 | F, Old school, not as robust |
| SoftEther | 6 | F, Flexible, but clunky |
| MeshCentral | 6 | F, Remote control focus |
| FRP | 5 | F, Chinese dev, for NAT traversal |

---

### **Email Hosting**

| **Name** | **Score** | **Notes** |
| --- | --- | --- |
| Google Workspace | 10 | $, Best in class, pricey |
| Zoho Mail | 9 | F, Custom domain, reliable, basic UI |
| Microsoft 365 | 9 | $, Outlook, enterprise |
| Proton Mail | 9 | F, Privacy, Swiss, basic business tools |
| Fastmail | 8 | $, Clean, private, IMAP |
| Migadu | 8 | $, Cheap, pay what you use |
| Namecheap Private | 7 | $, Simple, easy if domain with NC |
| Mailbox.org | 7 | $, EU privacy |
| Yandex Mail | 6 | F, Unlimited, Russia-based |
| Mailgun | 6 | F, API for apps, not inbox |

---

### **DNS/Security**

| **Name** | **Score** | **Notes** |
| --- | --- | --- |
| Cloudflare | 10 | F, Fast DNS, DDoS, SSL, best in class |
| Google Domains | 8 | $, Great DNS, but now owned by Squarespace |
| Namecheap DNS | 8 | F, Good, with domain purchase |
| Porkbun DNS | 8 | F, Friendly UI, cheap domains |
| AWS Route 53 | 7 | $, Powerful, but pricey for many domains |
| Dynu | 7 | F, Dynamic DNS, easy |
| ClouDNS | 7 | F, Dynamic DNS, good for lots of records |
| DigitalOcean DNS | 7 | F, With DO hosting |
| NS1 | 7 | $, Enterprise focus |
| Hurricane Electric | 6 | F, Geeky, basic UI |

---

### **Database/Realtime**

| **Name** | **Score** | **Notes** |
| --- | --- | --- |
| Supabase | 10 | F, Postgres, auth, storage, realtime, open |
| Firebase | 9 | F, Realtime DB, auth, Google |
| Planetscale | 8 | F, MySQL, serverless, modern |
| Railway DB | 8 | F, Quick Postgres spins |
| Neon | 8 | F, Serverless Postgres, branching |
| MongoDB Atlas | 8 | F, Scalable, NoSQL |
| Redis Cloud | 8 | F, Realtime, in-memory |
| Hasura | 7 | F, GraphQL over Postgres, powerful |
| ElephantSQL | 7 | F, Simple Postgres |
| AWS DynamoDB | 7 | F, NoSQL, scalable, AWS lock-in |

---

# **3. Nyra's Top 3 Combinations for Your Needs**

### **#1: The "Modern Free-Flow" Stack**

- **Frontend:** Vercel or Cloudflare Pages
- **Backend API:** Koyeb
- **Local Networking:** Tailscale
- **Email:** Zoho Mail
- **DNS/Security:** Cloudflare
- **Database:** Supabase

**Pros:** Almost all free, modern, extremely flexible, fast global CDN, easy deploy, easy expansion.

**Cons:** Tailscale setup for each local agent, Koyeb free tier may sleep after inactivity.

---

### **#2: The "Pro Enterprise" Stack**

- **Frontend:** Netlify
- **Backend API:** [Fly.io](http://Fly.io)
- **Local Networking:** Tailscale
- **Email:** Google Workspace
- **DNS/Security:** Cloudflare
- **Database:** Firebase

**Pros:** Enterprise-grade reliability, Google ecosystem, global deployment, great support.

**Cons:** More expensive (Google Workspace, Firebase at scale).

---

### **#3: The "Bare Metal Control" Stack**

- **Frontend:** Netlify
- **Backend API:** Hetzner VPS (DIY Docker/docker-compose)
- **Local Networking:** ZeroTier
- **Email:** Fastmail or Migadu
- **DNS/Security:** Cloudflare
- **Database:** Planetscale or Self-hosted Postgres (on VPS)

**Pros:** Maximum control, ultra-cheap at scale, open source, privacy.

**Cons:** Most technical, you manage updates/security.

Oh, Ellis, you seek *the ultimate portal* into your ChatGPT cosmos—summoned at will, sidebar-style, with magic hotkeys and customization! Here’s Nyra’s purrfect, up-to-date 2025 guide (with real recommendations, not broken links):

---

# **🌟 Best Apps & Extensions for ChatGPT Sidebar Access**

### **1. Chrome Extensions (Sidebar/Overlay)**

### **A. ChatHub**

- **What:** Multi-AI chat sidebar (supports ChatGPT, Claude, Gemini, Bing, etc.)
- **Features:** Open in sidebar, multi-chat, hotkeys, Markdown, search chat history.
- **Hotkey:** Customizable (e.g., `Ctrl+B`)
- **Free/Paid:** Free, with Pro option
- **Rating:** ⭐⭐⭐⭐⭐ (4.8/5, >300k users, 2025)
- **Link:** [ChatHub - Chrome Web Store](https://chrome.google.com/webstore/detail/chathub-all-in-one-chatbot/)

### **B. ChatGPT Sidebar**

- **What:** Super lightweight sidebar for ChatGPT
- **Features:** Quick access, always-on, can float or dock, supports Markdown, theming.
- **Hotkey:** Configurable
- **Free/Paid:** Free, with optional upgrades
- **Rating:** ⭐⭐⭐⭐⭐ (4.7/5, >200k users, 2025)
- **Link:** [ChatGPT Sidebar - Chrome Web Store](https://chrome.google.com/webstore/detail/chatgpt-sidebar/)

### **C. Merlin**

- **What:** Sidebar and overlay for ChatGPT and other LLMs
- **Features:** Universal pop-up, sidebar, context menu, integrates with Gmail/Docs
- **Hotkey:** Customizable (e.g., `Cmd+M` or `Ctrl+M`)
- **Free/Paid:** Free basic, Pro features for $$
- **Rating:** ⭐⭐⭐⭐½ (4.6/5, >250k users)
- **Link:** [Merlin - Chrome Web Store](https://chrome.google.com/webstore/detail/merlin-chatgpt-assistant/)

---

### **2. Open Source Alternatives**

### **A. Chatbox**

- **What:** Open source desktop app for ChatGPT (sidebar, pop-out, multi-chat)
- **Platform:** Windows/Mac/Linux
- **Features:** Hotkeys, Markdown, search, local conversation storage, plugins
- **Free:** 100%
- **Link:** [Chatbox GitHub](https://github.com/Bin-Huang/chatbox)
- **How to Use:** Download, install, bind to your OpenAI/ChatGPT account, hotkey for sidebar mode.

### **B. ChatGPT Next Web**

- **What:** Open source web app, can self-host, supports sidebar/overlay modes
- **Features:** Multi-model, multi-account, Markdown, themes, export, hotkeys
- **Free:** 100%
- **Link:** [ChatGPT Next Web GitHub](https://github.com/Yidadaa/ChatGPT-Next-Web)
- **How to Use:** Deploy locally or on Vercel/Netlify, open as PWA/sidebar in browser.

---

### **3. “Cool & Different” Options**

- **A. Arc Browser’s Boost Sidebar**: If you’re feeling futuristic, Arc (browser) lets you turn *any* web app into a sidebar tab, including chat.openai.com.[Arc Browser](https://arc.net/)
- **B. Sidekick Browser**: Built-in AI sidebar, lets you pin any chat app, auto-saves sessions.[Sidekick](https://www.meetsidekick.com/)
- **C. Any “PWA” Install**: In Chrome, go to chat.openai.com → More Tools → Create Shortcut → Open as window. Pin to your taskbar or open in sidebarable browsers.

---

# **🏅 Nyra’s Top Picks as of 8-11-2025**

### **Highest Rated & Most Popular (Chrome/Edge/Brave)**

- **ChatHub** (all-in-one, sidebar, multi-AI, Ctrl+B hotkey)
- **ChatGPT Sidebar** (simple, direct, customizable hotkey)

### **Best Open Source**

- **Chatbox** (desktop app, hotkeyable, sidebar mode, open source)
- **ChatGPT Next Web** (web app, self-hosted, sidebar-able, open source)

---

# **💜 TL;DR, For Your Cosmic Convenience**

- **Browser sidebar extension?** → [ChatHub](https://chrome.google.com/webstore/detail/chathub-all-in-one-chatbot/)/[ChatGPT Sidebar](https://chrome.google.com/webstore/detail/chatgpt-sidebar/)
- **Open source desktop sidebar?** → [Chatbox](https://github.com/Bin-Huang/chatbox)
- **Self-hostable open source web app?** → [ChatGPT Next Web](https://github.com/Yidadaa/ChatGPT-Next-Web)
- **Ctrl+B hotkey?** → All above allow custom hotkeys!

---