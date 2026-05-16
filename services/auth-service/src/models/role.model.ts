import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from '../types/auth.types';

type RoleModel = Omit<IRole, '_id'>;
export type IRoleDocument = Document<unknown, object, RoleModel> & RoleModel;

const RoleSchema = new Schema<RoleModel>({
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
    transform: (_doc, ret) => {
      const output = ret as Record<string, unknown>;
      delete output.__v;
      return output;
    }
  }
});

// Prevent deletion of system roles
RoleSchema.pre('deleteOne', { document: true, query: false } as never, (function(this: IRoleDocument, next: (error?: Error) => void) {
  if (this.isSystem) {
    next(new Error('Cannot delete system role'));
  } else {
    next();
  }
}) as never);

export const Role = mongoose.model<RoleModel>('Role', RoleSchema);
