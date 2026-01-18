save the script above as Make-NyraVSCodePack.ps1



run:



powershell -ExecutionPolicy Bypass -File .\\Make-NyraVSCodePack.ps1





you’ll get nyra-vscode-and-scaffold.zip in that same folder.



Extract it into the root of your Project-Nyra repo (it already includes the folder structure + .vscode-profiles).



how to use the profiles (two clicks)



install extensions (fast):



powershell -ExecutionPolicy Bypass -File .\\.vscode-profiles\\install-profiles.ps1 -ProfileName 'Default-AllAround'





VS Code → Profiles → Import from file → pick:



.vscode-profiles/Default-AllAround.code-profile (primary),



.vscode-profiles/AI-Stack.code-profile (secondary setup),



.vscode-profiles/Default-Light.code-profile (light).



Yesss, you can swap profiles per workspace or per task. And because they’re project-scoped files, anyone on your team gets the same setup.



notes on Kilo Code + Claude-Flow (via MCP)



Kilo Code: install its VS Code extension from Marketplace. If you send me the exact Marketplace ID, I’ll append it to all three profiles so it auto-installs.



Claude-Flow / Agents SDK: install in the repo (dev dependency) so your flows always use pinned versions. Example:



cd <YOUR\_REPO\_ROOT>

npm init -y

npm i -D anthropic-agents-sdk  # (or the exact package you’re using)





To connect VS Code → your Claude-Flow MCP:



you generally drive flows/tools from inside Claude Code (not from VS Code settings).



For project MCP servers (Tavily, KG, Qdrant, GitHub), we’ll keep using project-scoped config files (.mcp.project.json etc.) in your repo — you already have those from our earlier steps.



repo structure — your ideas, condensed (noob-friendly, dev-correct)



I took your scaffolding drafts and trimmed them into a structure that’s powerful but navigable:



Project-Nyra/

├─ .vscode-profiles/                 # Profiles \& installer (this message gave you these)

├─ nyra-metamcp/                     # Central MCP proxy/config

├─ nyra-core/                        # Shared TS types/schemas/utils

├─ nyra-orchestration/               # Each framework owns its subdir

│  ├─ claude-flow/

│  ├─ anthropic-agents-sdk/

│  ├─ langgraph/

│  ├─ autogen2/

│  ├─ praisonai/

│  ├─ claude-code-development-kit/

│  └─ gemini-assistant/

├─ nyra-memory/

│  ├─ qdrant/

│  └─ neo4j/

├─ nyra-mcp/                         # General MCP servers \& compose

├─ nyra-agents/

│  └─ definitions/claude-agents/     # code-agent.json, research-agent.json, writing-agent.json

├─ config/

│  └─ environments/development/      # metamcp.json, agents.json, memory.json, orchestration.json

├─ scripts/

│  └─ setup/                         # bootstrap scripts (Windows-first)

├─ claude/

│  └─ flows/                         # flow yamls (research-to-pr.yaml provided)

└─ docs/

&nbsp;  └─ overview.md





Everything lives next to its owner (your preference).



No over-splitting into micro-folders until you actually need it.



Easy to navigate for “mortgage-broker-by-day, system-architect-by-night” mode.



extra: quick profile swap cheats

\# install extensions for primary profile

powershell -ExecutionPolicy Bypass -File .\\.vscode-profiles\\install-profiles.ps1 -ProfileName 'Default-AllAround'



\# swap to AI profile later

powershell -ExecutionPolicy Bypass -File .\\.vscode-profiles\\install-profiles.ps1 -ProfileName 'AI-Stack'





Then VS Code → Profiles → Import the matching .code-profile file (extensions + settings combo).

