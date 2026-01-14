import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from '../types/auth.types';

export interface IRoleDocument extends IRole, Document {}

const RoleSchema = new Schema<IRoleDocument>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    required: true
  }],
  isSystem: {
    type: Boolean,
    default: false
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

// Prevent deletion of system roles
RoleSchema.pre('remove', function(next) {
  if (this.isSystem) {
    next(new Error('Cannot delete system role'));
  } else {
    next();
  }
});

export const Role = mongoose.model<IRoleDocument>('Role', RoleSchema);
