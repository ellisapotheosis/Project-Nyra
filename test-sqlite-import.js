#!/usr/bin/env node
// Test better-sqlite3 import and functionality

console.log('[TEST] Starting better-sqlite3 verification...\n');

try {
  console.log('[1] Attempting to import better-sqlite3...');
  const Database = require('better-sqlite3');
  console.log('    [OK] Module loaded\n');

  console.log('[2] Creating in-memory database...');
  const db = new Database(':memory:');
  console.log('    [OK] Database created\n');

  console.log('[3] Testing basic query...');
  db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
  db.exec('INSERT INTO test (name) VALUES ("test")');
  const result = db.prepare('SELECT * FROM test').all();
  console.log('    [OK] Query executed, result:', result);
  console.log('    [OK] Data retrieval working\n');

  console.log('[4] Checking version information...');
  const info = db.prepare("SELECT sqlite_version() as version").get();
  console.log('    SQLite version:', info.version);
  console.log('    [OK] Version check passed\n');

  db.close();

  console.log('========================================================');
  console.log('[SUCCESS] All better-sqlite3 tests passed!');
  console.log('[OK] SQLite memory system is fully functional');
  console.log('========================================================\n');
  
  process.exit(0);
} catch (error) {
  console.error('\n[ERROR] Test failed!');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('\nRecommendations:');
  console.error('  1. Ensure Visual Studio Build Tools are installed');
  console.error('  2. Run: pnpm store prune && pnpm install --force');
  console.error('  3. Run: pnpm rebuild better-sqlite3');
  console.error('  4. Check Node.js version: node --version');
  process.exit(1);
}
