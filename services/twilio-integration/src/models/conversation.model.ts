import mongoose, { Schema, Document } from "mongoose";
import { Conversation, ConversationMessage } from "../types/twilio.types";

export interface ConversationDocument
  extends Omit<Conversation, "id">, Document {}

const MessageSchema = new Schema<ConversationMessage>({
  id: { type: String, required: true },
  conversationId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  body: { type: String, required: true },
  direction: { type: String, enum: ["inbound", "outbound"], required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  mediaUrls: [{ type: String }],
});

const ConversationSchema = new Schema<ConversationDocument>(
  {
    phoneNumber: { type: String, required: true, index: true },
    contactName: { type: String },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },
    messages: [MessageSchema],
    startedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ConversationSchema.index({ phoneNumber: 1, status: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export const ConversationModel = mongoose.model<ConversationDocument>(
  "Conversation",
  ConversationSchema
);
