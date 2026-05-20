import mongoose, { Schema, type HydratedDocument } from "mongoose";
import { IUser } from "../types/auth.types";

export type IUserDocument = HydratedDocument<IUser>;

const OAuthProviderSchema = new Schema(
  {
    provider: { type: String, enum: ["google", "microsoft"], required: true },
    providerId: { type: String, required: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isMfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      select: false,
    },
    roles: [
      {
        type: String,
        default: ["user"],
      },
    ],
    permissions: [
      {
        type: String,
      },
    ],
    oauthProviders: [OAuthProviderSchema],
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        delete ret.password;
        delete ret.mfaSecret;
        return ret;
      },
    },
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>("User", UserSchema);
