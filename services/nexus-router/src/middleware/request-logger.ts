import { Request, Response, NextFunction } from "express";
import { createLogger } from "@nyra/shared";

const logger = createLogger("nexus-router:http");

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const { method, url, ip } = req;

  logger.info("request start", {
    method,
    url,
    ip,
    userAgent: req.get("user-agent"),
  });

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const duration = Date.now() - startTime;

    logger.info("request complete", {
      method,
      url,
      statusCode: res.statusCode,
      duration,
      ip,
    });

    return originalJson(body);
  };

  // Handle response finish for non-JSON responses
  res.on("finish", () => {
    if (!res.headersSent) {
      return;
    }

    const duration = Date.now() - startTime;

    // Skip logging if already logged via json override
    if (res.get("Content-Type")?.includes("application/json")) {
      return;
    }

    logger.info("request complete", {
      method,
      url,
      statusCode: res.statusCode,
      duration,
      ip,
    });
  });

  next();
}
