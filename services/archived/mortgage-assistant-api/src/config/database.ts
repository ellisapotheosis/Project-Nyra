import logger from '../utils/logger';

type PrismaLogEvent = 'query' | 'error' | 'info' | 'warn';

interface PrismaClientLike {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $on(event: PrismaLogEvent, callback: (event: unknown) => void): void;
}

type PrismaClientConstructor = new (options: unknown) => PrismaClientLike;

function loadPrismaClient(): PrismaClientConstructor {
  try {
    const prismaModule = require('@prisma/client') as { PrismaClient?: PrismaClientConstructor };
    if (prismaModule.PrismaClient) {
      return prismaModule.PrismaClient;
    }
  } catch {
    // Build-only environments may not have a generated Prisma client yet.
  }

  return class MissingPrismaClient implements PrismaClientLike {
    $on(): void {}

    async $connect(): Promise<void> {
      throw new Error('Prisma client is not generated. Run prisma generate with a Prisma 7 compatible config before starting this service.');
    }

    async $disconnect(): Promise<void> {}
  };
}

const PrismaClient = loadPrismaClient();

const prisma: PrismaClientLike = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (event) => {
    const queryEvent = event as { query?: string; duration?: number };
    logger.debug(`Query: ${queryEvent.query ?? 'unknown'}`);
    logger.debug(`Duration: ${queryEvent.duration ?? 0}ms`);
  });
}

prisma.$on('error', (event) => {
  logger.error('Prisma Error:', event);
});

prisma.$on('warn', (event) => {
  logger.warn('Prisma Warning:', event);
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Database disconnection error:', error);
  }
};

export default prisma;
