import { PrismaClient } from "@prisma/client";
import { createLogger } from "@nyra/shared";

const logger = createLogger("mortgage-assistant-api:database");

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: any) => {
    logger.debug("prisma query", {
      query: e.query,
      duration: `${e.duration}ms`,
    });
  });
}

prisma.$on("error" as never, (e: any) => {
  logger.error("prisma error", { error: String(e) });
});

prisma.$on("warn" as never, (e: any) => {
  logger.warn("prisma warning", { warning: String(e) });
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("database connection error", { error: String(error) });
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error("database disconnection error", { error: String(error) });
  }
};

export default prisma;
