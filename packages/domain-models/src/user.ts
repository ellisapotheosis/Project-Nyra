import { z } from "zod";
import { EntityIdSchema } from "./common";

export const RoleSchema = z.enum([
  "BORROWER",
  "BROKER",
  "ADMIN",
  "OPS",
  "AGENT",
]);
export type Role = z.infer<typeof RoleSchema>;

export const TeamSchema = z.object({
  id: EntityIdSchema.optional(),
  name: z.string().min(1),
  tenantId: EntityIdSchema.optional(),
});
export type Team = z.infer<typeof TeamSchema>;

export const UserSchema = z.object({
  id: EntityIdSchema.optional(),
  email: z.string().email(),
  displayName: z.string().min(1),
  teamIds: z.array(EntityIdSchema).default([]),
  roles: z.array(RoleSchema).min(1),
});
export type User = z.infer<typeof UserSchema>;
