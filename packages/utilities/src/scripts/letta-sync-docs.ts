import fs from 'fs';
import path from 'path';
import { MockLettaClient } from '@nyra/integration-adapters';

/**
 * Letta Document Indexer
 * Recursively reads the docs/ folder and syncs architectural context to Letta/mem0.
 */
async function syncDocsToLetta() {
  console.log("📂 Starting Letta Architectural Indexing...");

  const orchestrator = new MockLettaClient();
  const docsDir = path.join(process.cwd(), 'docs');

  async function processDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        if (file === 'archive' || file === 'node_modules') continue;
        await processDirectory(fullPath);
      } else if (file.endsWith('.md')) {
        console.log(`  → Indexing: ${file}`);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Sync to Letta/mem0
        await orchestrator.syncContext('system-architecture', {
          docName: file,
          category: path.basename(dir),
          content: content.substring(0, 1000) // Chunking for mock
        });
      }
    }
  }

  try {
    await processDirectory(docsDir);
    console.log("\n✅ Letta Indexing Complete. AI Cluster context is synchronized.");
  } catch (error) {
    console.error("❌ Indexing Failed:", error);
  }
}

syncDocsToLetta();
