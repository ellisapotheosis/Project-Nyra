import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    }
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    }
  }
};

export default databaseConfig;
