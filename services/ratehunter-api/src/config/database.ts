import { PrismaClient } from "@prisma/client";
import { createLogger } from "@nyra/shared";

const logger = createLogger("ratehunter-api:database");

const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: any) => {
    logger.debug("prisma query", {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("failed to connect to database", { error: String(error) });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error("failed to disconnect from database", {
      error: String(error),
    });
    throw error;
  }
};

export default prisma;
