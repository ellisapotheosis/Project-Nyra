import mongoose, { Schema, Document } from 'mongoose';
import { ISession } from '../types/auth.types';

type SessionModel = Omit<ISession, '_id'>;
export type ISessionDocument = Document<unknown, object, SessionModel> & SessionModel;

const SessionSchema = new Schema<SessionModel>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      const output = ret as Record<string, unknown>;
      delete output.__v;
      return output;
    }
  }
});

// TTL index to automatically delete expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for queries
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ userId: 1, createdAt: -1 });

export const Session = mongoose.model<SessionModel>('Session', SessionSchema);
