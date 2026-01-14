import mongoose, { Schema, Document } from 'mongoose';
import { VoiceCallResponse } from '../types/twilio.types';

export interface CallDocument extends Omit<VoiceCallResponse, 'sid'>, Document {
  sid: string;
  recordingSid?: string;
  recordingUrl?: string;
  recordingDuration?: number;
  ivrPath?: string[];
  endedAt?: Date;
  cost?: number;
  metadata?: Record<string, any>;
}

const CallSchema = new Schema<CallDocument>(
  {
    sid: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    from: { type: String, required: true, index: true },
    direction: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
    duration: { type: String },
    price: { type: String },
    priceUnit: { type: String },
    recordingSid: { type: String },
    recordingUrl: { type: String },
    recordingDuration: { type: Number },
    ivrPath: [{ type: String }],
    endedAt: { type: Date },
    cost: { type: Number },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

CallSchema.index({ status: 1, dateCreated: -1 });
CallSchema.index({ direction: 1, dateCreated: -1 });

export const CallModel = mongoose.model<CallDocument>('Call', CallSchema);
