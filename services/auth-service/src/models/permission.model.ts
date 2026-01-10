import mongoose, { Schema, Document } from 'mongoose';
import { IPermission } from '../types/auth.types';

export interface IPermissionDocument extends IPermission, Document {}

const PermissionSchema = new Schema<IPermissionDocument>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  resource: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage']
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for resource and action
PermissionSchema.index({ resource: 1, action: 1 });

export const Permission = mongoose.model<IPermissionDocument>('Permission', PermissionSchema);
