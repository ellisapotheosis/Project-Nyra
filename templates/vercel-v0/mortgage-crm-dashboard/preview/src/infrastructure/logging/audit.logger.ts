import { PrismaClient } from "@prisma/client";

export interface AuditEvent {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  constructor(private prisma: PrismaClient) {}

  async log(event: AuditEvent): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        changes: event.changes,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: new Date(),
      },
    });
  }
}
