import { auth } from "@clerk/nextjs/server";
import { PrismaClient, User, Role } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async getCurrentUser(): Promise<(User & { role: Role }) | null> {
    const session = auth();
    const clerkId = session.userId;

    if (!clerkId) return null;

    return (await this.prisma.user.findUnique({
      where: { id: clerkId }, // Assuming internal ID matches or we use a clerkId field
      include: { role: true },
    })) as (User & { role: Role }) | null;
  }

  async requireAuth(): Promise<User & { role: Role }> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }
    return user;
  }

  async requireRole(allowedRoles: string[]): Promise<User & { role: Role }> {
    const user = await this.requireAuth();
    if (!allowedRoles.includes(user.role.name)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    return user;
  }
}
