# Step-by-step (Warp 2.0 friendly)

> Run these from the **root of your Project-Nyra repo**

## 0) One command
### mac/linux
```bash
./scripts/run-all.sh
```
### windows
```powershell
.\scripts\run-all.ps1
```

## 1) Login Gemini CLI
- **OAuth**: run `gemini` → choose **Login with Google** (browser pops).  
- Or **Vertex**:  
  ```bash
  export GOOGLE_API_KEY="YOUR_VERTEX_KEY"
  export GOOGLE_GENAI_USE_VERTEXAI=true
  gemini
  ```
- Or **AI Studio**:  
  ```bash
  export GEMINI_API_KEY="YOUR_AI_STUDIO_KEY"
  gemini
  ```

## 2) Use your two Google projects (cheap mode)
Edit `.env` created by the script (copied from `.env.modes/.env.cheap-gemini`):
```
VERTEX_PROJECT_1=first-project-id
VERTEX_LOCATION_1=us-central1
VERTEX_PROJECT_2=second-project-id
VERTEX_LOCATION_2=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/abs/path/service-account-1.json
```
> Keep the second project ready; use `gemini-flash-alt` alias if you want to deliberately route to it.

Now (re)start the router:
```bash
docker compose -f docker/litellm/docker-compose.yml up -d
```

## 3) Warp 2.0 Agents usage
- Open **Warp** → enable **AI** → press `CMD/CTRL + I` to enter Agent Mode.
- Prompt example:
  > bootstrap nyra by running `./scripts/run-all.sh`, then open a new pane and run `gemini -p "inventory my repo"` and stream the output back here.

## 4) Index your code (optional but recommended)
```bash
uvx --from git+https://github.com/oraios/serena serena project index
codanna index . --progress
```

## 5) Deterministic codemods
- `Ctrl+Alt+B` in VS Code (task) or:
```bash
npx claude-flow@alpha booster batch "src/**/*.ts" --instructions "Add 'use client' at top of Next.js client components"
```

## 6) Switch modes
```bash
./scripts/nyra-mode.sh balanced-mix
./scripts/nyra-mode.sh offline-ollama
```

## Troubleshooting
- `gemini` not found? Reopen terminal (so PATH picks up npm globals).
- Vertex creds: set `GOOGLE_APPLICATION_CREDENTIALS` to a JSON key if OAuth isn’t used.
- Docker errors: restart Docker Desktop.
