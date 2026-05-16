import mongoose, { Schema, Document } from 'mongoose';
import { IPermission } from '../types/auth.types';

type PermissionModel = Omit<IPermission, '_id'>;
export type IPermissionDocument = Document<unknown, object, PermissionModel> & PermissionModel;

const PermissionSchema = new Schema<PermissionModel>({
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
    transform: (_doc, ret) => {
      const output = ret as Record<string, unknown>;
      delete output.__v;
      return output;
    }
  }
});

// Compound index for resource and action
PermissionSchema.index({ resource: 1, action: 1 });

export const Permission = mongoose.model<PermissionModel>('Permission', PermissionSchema);
