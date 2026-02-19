// ==============================================================================
// MongoDB Replica Set Initialization Script
// ==============================================================================
// Initializes MongoDB replica set for Project Nyra
//
// Note: This script runs as part of docker-entrypoint-initdb.d
// It only executes on first container startup
// ==============================================================================

print('>>> Initializing MongoDB Replica Set <<<');

// Wait for MongoDB to be ready
sleep(5000);

try {
  // Check if replica set is already initialized
  const rsStatus = rs.status();
  print('Replica set already initialized:', rsStatus.set);
} catch (e) {
  print('Replica set not initialized. Initializing now...');

  // Initialize replica set
  const config = {
    _id: process.env.MONGO_REPLICA_SET_NAME || 'rs0',
    members: [
      {
        _id: 0,
        host: 'mongodb:27017',
        priority: 2
      }
    ]
  };

  const result = rs.initiate(config);
  print('Replica set initialization result:', JSON.stringify(result, null, 2));

  // Wait for replica set to be ready
  print('Waiting for replica set to become PRIMARY...');
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    try {
      const status = rs.status();
      const primary = status.members.find(m => m.stateStr === 'PRIMARY');

      if (primary) {
        print('Replica set is now PRIMARY');
        print('Replica set status:', JSON.stringify(status, null, 2));
        break;
      }
    } catch (err) {
      // Ignore errors during initialization
    }

    sleep(2000);
    attempts++;
  }

  if (attempts >= maxAttempts) {
    print('WARNING: Replica set did not become PRIMARY within timeout');
  }
}

print('>>> MongoDB Replica Set initialization complete <<<');
