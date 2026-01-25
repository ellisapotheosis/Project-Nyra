// Simple SQLite test to verify better-sqlite3 is working
console.log('Node.js version:', process.version);

try {
    const Database = require('better-sqlite3');
    const db = new Database(':memory:');
    
    // Test basic operations
    db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    const insert = db.prepare('INSERT INTO test (name) VALUES (?)');
    insert.run('test-value');
    
    const select = db.prepare('SELECT * FROM test WHERE name = ?');
    const result = select.get('test-value');
    
    console.log('✅ SQLite test: SUCCESS');
    console.log('✅ Database operations: SUCCESS');
    console.log('✅ Test result:', result);
    
    db.close();
} catch (error) {
    console.log('❌ SQLite test: FAILED');
    console.log('❌ Error:', error.message);
    console.log('❌ Stack:', error.stack);
}