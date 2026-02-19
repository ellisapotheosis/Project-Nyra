// ==============================================================================
// MongoDB Collections and Indexes Creation Script
// ==============================================================================
// Creates initial collections with validation schemas and indexes
//
// Collections:
//   - audit_logs: System audit trail
//   - agent_memory: AI agent memory and context storage
//   - workflows: Workflow definitions and state
//   - cache: Application cache data (TTL indexed)
//
// ==============================================================================

print('>>> Creating MongoDB collections and indexes <<<');

// Switch to nyra database
db = db.getSiblingDB('nyra');

// ==============================================================================
// AUDIT LOGS COLLECTION
// ==============================================================================

try {
  db.createCollection('audit_logs', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['timestamp', 'action', 'user_id', 'resource'],
        properties: {
          timestamp: {
            bsonType: 'date',
            description: 'must be a date and is required'
          },
          action: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          user_id: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          resource: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          metadata: {
            bsonType: 'object',
            description: 'additional metadata'
          }
        }
      }
    },
    capped: true,
    size: 1073741824, // 1GB cap
    max: 1000000      // Max 1 million documents
  });
  print('✓ Created audit_logs collection');

  // Create indexes
  db.audit_logs.createIndex({ timestamp: -1 });
  db.audit_logs.createIndex({ user_id: 1, timestamp: -1 });
  db.audit_logs.createIndex({ action: 1, timestamp: -1 });
  print('✓ Created indexes on audit_logs');
} catch (e) {
  print('⚠ audit_logs collection already exists or error:', e.message);
}

// ==============================================================================
// AGENT MEMORY COLLECTION
// ==============================================================================

try {
  db.createCollection('agent_memory', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['agent_id', 'created_at'],
        properties: {
          agent_id: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          context: {
            bsonType: 'object',
            description: 'agent context data'
          },
          memory_type: {
            enum: ['short_term', 'long_term', 'episodic', 'semantic'],
            description: 'type of memory'
          },
          created_at: {
            bsonType: 'date',
            description: 'must be a date and is required'
          },
          expires_at: {
            bsonType: 'date',
            description: 'expiration date for temporary memory'
          }
        }
      }
    }
  });
  print('✓ Created agent_memory collection');

  // Create indexes
  db.agent_memory.createIndex({ agent_id: 1, created_at: -1 });
  db.agent_memory.createIndex({ memory_type: 1 });
  db.agent_memory.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index
  print('✓ Created indexes on agent_memory');
} catch (e) {
  print('⚠ agent_memory collection already exists or error:', e.message);
}

// ==============================================================================
// WORKFLOWS COLLECTION
// ==============================================================================

try {
  db.createCollection('workflows', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['workflow_id', 'status', 'created_at'],
        properties: {
          workflow_id: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          status: {
            enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
            description: 'workflow status'
          },
          definition: {
            bsonType: 'object',
            description: 'workflow definition'
          },
          state: {
            bsonType: 'object',
            description: 'current workflow state'
          },
          created_at: {
            bsonType: 'date',
            description: 'must be a date and is required'
          },
          updated_at: {
            bsonType: 'date',
            description: 'last update timestamp'
          }
        }
      }
    }
  });
  print('✓ Created workflows collection');

  // Create indexes
  db.workflows.createIndex({ workflow_id: 1 }, { unique: true });
  db.workflows.createIndex({ status: 1, updated_at: -1 });
  print('✓ Created indexes on workflows');
} catch (e) {
  print('⚠ workflows collection already exists or error:', e.message);
}

// ==============================================================================
// CACHE COLLECTION (TTL)
// ==============================================================================

try {
  db.createCollection('cache');
  print('✓ Created cache collection');

  // Create TTL index (expire after 24 hours by default)
  db.cache.createIndex({ created_at: 1 }, { expireAfterSeconds: 86400 });
  db.cache.createIndex({ key: 1 }, { unique: true });
  print('✓ Created indexes on cache (with TTL)');
} catch (e) {
  print('⚠ cache collection already exists or error:', e.message);
}

// ==============================================================================
// LOGS DATABASE
// ==============================================================================

db = db.getSiblingDB('nyra_logs');

try {
  db.createCollection('application_logs', {
    capped: true,
    size: 2147483648, // 2GB cap
    max: 5000000      // Max 5 million documents
  });
  print('✓ Created application_logs collection');

  db.application_logs.createIndex({ timestamp: -1 });
  db.application_logs.createIndex({ level: 1, timestamp: -1 });
  print('✓ Created indexes on application_logs');
} catch (e) {
  print('⚠ application_logs collection already exists or error:', e.message);
}

// ==============================================================================
// VERIFICATION
// ==============================================================================

print('>>> Listing collections in nyra database <<<');
db = db.getSiblingDB('nyra');
const collections = db.getCollectionNames();
collections.forEach(coll => {
  const stats = db[coll].stats();
  print(`Collection: ${coll}, Documents: ${stats.count}, Size: ${stats.size} bytes`);
});

print('>>> MongoDB collections and indexes creation complete <<<');
