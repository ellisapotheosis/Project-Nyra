# CLAUDE.md Template: JavaScript/Node.js Development

**Language**: JavaScript (ES6+)
**Runtime**: Node.js {{NODE_VERSION}}
**Package Manager**: {{PACKAGE_MANAGER}} (npm/yarn/pnpm)
**Framework**: {{FRAMEWORK}} (Express/Fastify/NestJS)

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**JavaScript projects use coordinated development:**

1. **Backend Lead**: Server-side development
2. **Frontend Lead**: Client-side development
3. **DevOps Lead**: Deployment and infrastructure
4. **QA Lead**: Testing and quality

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn JavaScript-focused agents
npx @claude-flow/cli@latest agent spawn -t coder --name backend-lead --capabilities "nodejs,express,databases"
npx @claude-flow/cli@latest agent spawn -t coder --name frontend-lead --capabilities "javascript,dom,bundlers"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Node Version**: {{NODE_VERSION}} (16+)
- **Framework**: {{FRAMEWORK}}
- **Package Manager**: {{PACKAGE_MANAGER}}
- **Database**: {{DATABASE}}

## 🔧 JavaScript/Node.js Project Structure

### Backend Structure (Express/Fastify)
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── products.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── productController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   └── emailService.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── errorCodes.js
│   │   └── validators.js
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env.example
├── package.json
└── README.md
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── features/
│   │   └── layouts/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   ├── constants/
│   ├── config/
│   └── main.js
├── public/
├── tests/
├── vite.config.js
├── package.json
└── README.md
```

## 🐝 Swarm Orchestration

### Phase 1: Setup & Configuration
- **Duration**: 1-2 days
- **Agents**: DevOps Lead, Backend Lead
- **Output**: Project initialized, dependencies configured

### Phase 2: Core Features
- **Duration**: 5-10 days
- **Agents**: Backend Lead, Frontend Lead (parallel)
- **Focus**: API endpoints, UI components

### Phase 3: Integration & Testing
- **Duration**: 5-10 days
- **Agents**: All teams
- **Focus**: Full-stack testing, optimization

### Phase 4: Deployment
- **Duration**: 2-3 days
- **Agents**: DevOps Lead
- **Focus**: Production setup, monitoring

## 🧠 Memory Management

### Store Node.js Best Practices
```bash
npx @claude-flow/cli@latest memory store --key "nodejs-patterns-{{PROJECT_NAME}}" \
  --value "Async patterns, middleware stack, error handling" \
  --namespace javascript --tags "nodejs,patterns"
```

## 🚀 Development Workflow

### Package Management Setup
```bash
# Initialize project
npm init -y
# or
pnpm init

# Install dependencies
npm install express axios dotenv

# Install dev dependencies
npm install --save-dev eslint prettier jest nodemon

# Create scripts in package.json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "build": "echo 'No build needed for Node.js'",
    "start": "node src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write src/**/*.js"
  }
}
```

### Express Server Example
```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(require('./middleware/requestLogger'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
```

### Async/Await Pattern
```javascript
// Service layer with async/await
async function getUserWithOrders(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const orders = await Order.find({ userId });
    user.orders = orders;

    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
}

// Controller using the service
router.get('/:id', async (req, res, next) => {
  try {
    const user = await getUserWithOrders(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});
```

### Environment Configuration
```javascript
// src/config/env.js
require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  API_URL: process.env.API_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};
```

## ✅ Testing Strategy

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
};
```

### Unit Tests Example
```javascript
// tests/unit/services/userService.test.js
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!',
      };

      const result = await createUser(userData);

      expect(result.id).toBeDefined();
      expect(result.email).toBe(userData.email);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Duplicate User',
        password: 'SecurePass123!',
      };

      await expect(createUser(userData)).rejects.toThrow('Email already exists');
    });
  });
});
```

## 📊 Performance Optimization

### Memory Leaks Prevention
```javascript
// Use connection pooling for databases
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Cleanup listeners
process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
```

### Async Operations Optimization
```javascript
// Use Promise.all for parallel operations
async function getCompleteUserData(userId) {
  const [user, orders, preferences] = await Promise.all([
    User.findById(userId),
    Order.find({ userId }),
    UserPreferences.findOne({ userId }),
  ]);

  return { user, orders, preferences };
}
```

## 🎯 Performance Targets

- Server startup: <1s
- Average response time: <200ms
- Memory usage: <200MB
- Database queries: <100ms

## 📋 Node.js Setup Checklist

- [ ] Node.js version configured
- [ ] Package manager chosen
- [ ] Dependencies installed
- [ ] Environment configuration set up
- [ ] Database connection configured
- [ ] Authentication system implemented
- [ ] API routes created
- [ ] Error handling middleware configured
- [ ] Logging system set up
- [ ] Tests framework configured
- [ ] Linting and formatting set up
- [ ] Deployment pipeline configured
- [ ] Monitoring configured

---

**Generated from**: claude-flow CLAUDE.md JavaScript/Node.js Template
