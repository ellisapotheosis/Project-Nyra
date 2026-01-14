# 🧠 Project NYRA — Notion AI GraphRAG Conversion Directive (v1.0)
**Context:** This workspace contains Markdown pages (docs/) and CSV databases (databases/) from the **NYRA Master Pack v4_full**, plus artifacts produced by the **NYRA Orchestrator**. Your job is to **normalize content and emit GraphRAG-ready exports** for **Graphiti** and **FalkorDB**.

## 🔧 Objectives
1) Read all `.md` and `.csv` content under the NYRA page (including imported packs).
2) Extract **chunks**, **entities**, **relations**, **decisions**, **tasks**, and **artifacts**.
3) Produce **GraphRAG CSVs** and **Graphiti JSON** that match the schemas below.
4) Produce **FalkorDB/Neo4j import CSVs** + minimal Cypher snippets.
5) Keep **provenance** (source page, section, line range/heading).

## 📦 Inputs to scan
- `docs/Architecture_Overview` • `docs/Decision_Gates` • `docs/Views_Recipes` • `docs/GraphRAG_Schema` • `docs/Memory_Formats`
- Databases created from CSVs: **Agents**, **Tools**, **Memory_Systems**, **MCP_Servers**, **Orchestrators**, **Models**, **Prompts**, **Tasks**, **Spawnable_Micro_Agents**, **Tag_Dictionary**
- Any additional pages Ellis added (notes, research, run logs)
- Optional: outputs from Orchestrator under a page called **Runs** (if synced via scripts)

## 🧩 Canonical Extraction Rules
- **Chunking:** split by topic/intent; min ~300 tokens; preserve code blocks.
- **Entities:** components, agents, tools, stores, endpoints, repos, models (unique `id`, `type`, `name`, `aliases`, `tags`).
- **Relations:** `uses`, `depends_on`, `implements`, `produces`, `verifies`, `fixes`, `defined_in`, `duplicates`.
- **Artifacts:** code/config/prompt snippets with language, path (if known), and linked entities.
- **Decisions:** decision text, rationale, date, owners, status/tags.
- **Tasks:** task text, owner, status, priority, due, linked_entities.
- **Provenance:** always capture source page and heading, plus local index (e.g., `page:line` or `heading#fragment`).

## 🗃️ Output Targets (STRICT formats)

### 1) GraphRAG CSVs (Microsoft flavor)
- **nodes.csv** → `id,type,title,summary,text,tags,source`
- **edges.csv** → `src_id,dst_id,rel_type,weight,evidence_ids`
- **communities.csv** (optional) → `id,name,description,node_ids`
- **chunkmap.csv** → `chunk_id,node_id`

### 2) Graphiti JSON
```json
{
  "nodes":[{"id":"X","labels":["Entity","Tool"],"properties":{"name":"OpenHands","tags":["#NYRA","#Tool"]}}],
  "edges":[{"src":"A","dst":"B","type":"uses","properties":{"weight":0.9}}]
}
```

### 3) Falkor/Neo4j CSV + Cypher
- **nodes.csv** (same shape as GraphRAG nodes; extra columns allowed)
- **edges.csv** (same shape as GraphRAG edges; extra columns allowed)
- **import.cypher** (minimal):
```
USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///nodes.csv' AS row
MERGE (n:Node {id: row.id})
SET n.type=row.type, n.title=row.title, n.summary=row.summary, n.text=row.text, n.tags=split(row.tags,'|'), n.source=row.source;

USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///edges.csv' AS row
MATCH (a:Node {id: row.src_id}), (b:Node {id: row.dst_id})
MERGE (a)-[r:REL {type: row.rel_type}]->(b)
SET r.weight = toFloat(row.weight), r.evidence_ids = split(row.evidence_ids,'|');
```

## 🏷️ Tagging Discipline
Use multi‑select style tags like: `#NYRA`, `#Agent`, `#Memory`, `#MCP`, `#Dev`, `#WebApp`, `#Experimental`, `#GraphRAG`, `#Decision`, `#Artifact`, `#Task`.

## ✅ Validation
- No empty `id` fields.
- Every edge `src_id` and `dst_id` must exist in nodes.
- Evidence IDs refer to chunk IDs present in `chunkmap.csv`.
- Summaries ≤ 280 chars; fall back to first sentence if longer.

## 📤 Where to write results in Notion
- Create a page **`GraphRAG Exports`** under **NYRA**.
- Add sub‑pages:
  - `GraphRAG CSV (latest)` → include tables for **nodes**, **edges**, **communities**, **chunkmap**.
  - `Graphiti JSON (latest)` → code blocks with JSON.
  - `Falkor/Neo4j (latest)` → code blocks with `import.cypher` and links to CSVs.

## 🧪 Work plan for Notion AI (do this iteratively)
1) Crawl and catalog all NYRA content. Emit a high‑level index (pages + DB counts).
2) Extract entities/relations/decisions/tasks/artifacts with provenance.
3) Generate **nodes.csv**; then **chunkmap.csv**.
4) Generate **edges.csv** (only after node IDs exist).
5) Assemble Graphiti JSON.
6) Emit Neo4j/Falkor CSVs + `import.cypher`.
7) Run a self‑check: missing nodes, dangling edges, empty fields. Fix and re‑emit.
8) Summarize deltas since last run.

---
**Paste this entire instruction on a page titled “NYRA :: Notion AI GraphRAG Directive” and run Notion AI → “Edit or generate → Follow these instructions”.**
