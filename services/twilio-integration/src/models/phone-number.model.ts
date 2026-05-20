import mongoose, { Schema, Document } from "mongoose";
import { PhoneNumber } from "../types/twilio.types";

export interface PhoneNumberDocument
  extends Omit<PhoneNumber, "sid">, Document {
  sid: string;
  assignedTo?: string;
  tags?: string[];
}

const PhoneNumberSchema = new Schema<PhoneNumberDocument>(
  {
    sid: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String, required: true, unique: true, index: true },
    friendlyName: { type: String, required: true },
    capabilities: {
      voice: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      mms: { type: Boolean, default: false },
      fax: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    dateCreated: { type: Date, default: Date.now },
    monthlyPrice: { type: String },
    priceUnit: { type: String },
    assignedTo: { type: String, index: true },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PhoneNumberModel = mongoose.model<PhoneNumberDocument>(
  "PhoneNumber",
  PhoneNumberSchema
);
