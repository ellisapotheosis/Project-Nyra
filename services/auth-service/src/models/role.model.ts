import mongoose, { Schema, type HydratedDocument } from "mongoose";
import { IRole } from "../types/auth.types";

export type IRoleDocument = HydratedDocument<IRole>;

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent deletion of system roles
RoleSchema.pre(
  "deleteOne",
  { document: true, query: true },
  function (this: IRoleDocument) {
    if (this.isSystem) {
      throw new Error("Cannot delete system role");
    }
  }
);

export const Role = mongoose.model<IRole>("Role", RoleSchema);
