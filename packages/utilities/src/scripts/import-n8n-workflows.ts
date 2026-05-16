import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

const WORKFLOWS_DIR = path.join(process.cwd(), 'docs/n8n-consolidation/internal-workflows');

async function importWorkflows() {
  if (!N8N_API_KEY) {
    console.error('❌ N8N_API_KEY is required in .env');
    return;
  }

  const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
  console.log(`🚀 Found ${files.length} workflows to import...`);

  for (const file of files) {
    try {
      const workflowData = JSON.parse(fs.readFileSync(path.join(WORKFLOWS_DIR, file), 'utf-8'));
      
      console.log(`📦 Importing: ${workflowData.name || file}...`);
      
      const response = await fetch(`${N8N_URL.replace(/\/$/, '')}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Successfully imported: ${workflowData.name} (ID: ${result.id})`);
      } else {
        console.error(`❌ Failed to import ${file}:`, result.message || JSON.stringify(result));
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
}

importWorkflows();
