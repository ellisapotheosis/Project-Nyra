/**
 * Security Logger
 * Winston-based logging for security events
 */

import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let msg = `${timestamp} [${service || 'Security'}] ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

export function createLogger(service: string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service },
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),
      new winston.transports.File({
        filename: 'logs/security-error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/security-combined.log',
      }),
    ],
  });
}
