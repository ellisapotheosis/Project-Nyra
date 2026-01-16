// ==============================================================================
// MongoDB User Creation Script
// ==============================================================================
// Creates application users with appropriate roles and permissions
//
// Users:
//   - nyra_app_user: Application user (readWrite on nyra database)
//   - nyra_readonly_user: Read-only user for analytics and reporting
//   - nyra_backup_user: Backup user (backup and restore permissions)
//
// Note: Passwords should be provided via environment variables
// ==============================================================================

print('>>> Creating MongoDB users <<<');

// Switch to admin database for user creation
db = db.getSiblingDB('admin');

// ==============================================================================
// APPLICATION USER (Read/Write)
// ==============================================================================

try {
  db.createUser({
    user: process.env.MONGO_APP_USER || 'nyra_app_user',
    pwd: process.env.MONGO_APP_PASSWORD || 'changeme',
    roles: [
      { role: 'readWrite', db: 'nyra' },
      { role: 'readWrite', db: 'nyra_logs' },
      { role: 'readWrite', db: 'nyra_cache' }
    ]
  });
  print('✓ Created application user: nyra_app_user');
} catch (e) {
  if (e.code === 51003) {
    print('⚠ Application user already exists');
  } else {
    print('✗ Error creating application user:', e.message);
  }
}

// ==============================================================================
// READ-ONLY USER (Analytics)
// ==============================================================================

try {
  db.createUser({
    user: process.env.MONGO_READONLY_USER || 'nyra_readonly_user',
    pwd: process.env.MONGO_READONLY_PASSWORD || 'changeme',
    roles: [
      { role: 'read', db: 'nyra' },
      { role: 'read', db: 'nyra_logs' },
      { role: 'read', db: 'nyra_cache' }
    ]
  });
  print('✓ Created read-only user: nyra_readonly_user');
} catch (e) {
  if (e.code === 51003) {
    print('⚠ Read-only user already exists');
  } else {
    print('✗ Error creating read-only user:', e.message);
  }
}

// ==============================================================================
// BACKUP USER
// ==============================================================================

try {
  db.createUser({
    user: process.env.MONGO_BACKUP_USER || 'nyra_backup_user',
    pwd: process.env.MONGO_BACKUP_PASSWORD || 'changeme',
    roles: [
      { role: 'backup', db: 'admin' },
      { role: 'restore', db: 'admin' }
    ]
  });
  print('✓ Created backup user: nyra_backup_user');
} catch (e) {
  if (e.code === 51003) {
    print('⚠ Backup user already exists');
  } else {
    print('✗ Error creating backup user:', e.message);
  }
}

// ==============================================================================
// VERIFICATION
// ==============================================================================

print('>>> Listing all users <<<');
const users = db.getUsers();
users.users.forEach(user => {
  print(`User: ${user.user}, Roles: ${JSON.stringify(user.roles)}`);
});

print('>>> MongoDB user creation complete <<<');
