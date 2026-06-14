import mongoose, { Schema, type HydratedDocument } from "mongoose";
import { IPermission } from "../types/auth.types";

export type IPermissionDocument = HydratedDocument<IPermission>;

const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "read", "update", "delete", "manage"],
    },
    description: {
      type: String,
      required: true,
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

// Compound index for resource and action
PermissionSchema.index({ resource: 1, action: 1 });

export const Permission = mongoose.model<IPermission>(
  "Permission",
  PermissionSchema
);
