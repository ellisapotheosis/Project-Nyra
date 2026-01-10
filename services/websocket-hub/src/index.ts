import { WebSocketServer } from './server/WebSocketServer';
import { config } from './config';
import { logger } from './utils/logger';

async function main() {
  try {
    logger.info('Starting WebSocket Hub...');

    const server = new WebSocketServer(config.port);
    await server.start();

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down...');
      await server.stop();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    logger.info({ port: config.port }, 'WebSocket Hub is running');
  } catch (error) {
    logger.error({ error }, 'Failed to start WebSocket Hub');
    process.exit(1);
  }
}

main();
