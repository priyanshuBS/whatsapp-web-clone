import mongoose, { Schema } from "mongoose";
import { IProcessedMessage } from "../types/processedMessage.interface";

const pricingSchema = new Schema(
  {
    billable: { type: Boolean },
    category: {
      type: String,
      enum: ["utility", "authentication", "marketing", "service"],
    },
    pricing_model: {
      type: String,
      enum: ["CBP", "PMP"],
    },
    type: {
      type: String,
      enum: ["regular", "template"],
    },
  },
  { _id: false }
);

const conversationSchema = new Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    origin: {
      type: String,
      enum: ["user_initiated", "business_initiated", "referral_conversion"],
      default: "user_initiated",
    },
    expiration: {
      type: Date,
    },
  },
  { _id: false }
);

const processedMessageSchema = new Schema<IProcessedMessage>(
  {
    messageId: {
      type: String,
      required: [true, "Message ID is required"],
      unique: true,
      trim: true,
    },
    waId: {
      type: String,
      required: [true, "WhatsApp ID (waId) is required"],
      match: [/^\d{10,15}$/, "Invalid waId format"],
    },
    contactName: {
      type: String,
      trim: true,
      default: "Unknown",
    },
    from: {
      type: String,
      required: [true, "Sender (from) is required"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "Receiver (to) is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Message body is required"],
      trim: true,
    },
    timestamp: {
      type: Date,
      required: [true, "Timestamp is required"],
    },
    direction: {
      type: String,
      enum: {
        values: ["incoming", "outgoing"],
        message: "Direction must be 'incoming' or 'outgoing'",
      },
      required: [true, "Message direction is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["sent", "delivered", "read", "none"],
        message: "Status must be one of: sent, delivered, read, none",
      },
      default: "none",
    },
    statusUpdatedAt: {
      type: Date,
    },
    metaMsgId: {
      type: String,
      trim: true,
    },
    gsId: {
      type: String,
      trim: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
    },
    pricing: {
      type: pricingSchema,
    },
    conversation: {
      type: conversationSchema,
    },
  },
  { timestamps: true, collection: "processed_messages" }
);

export const ProcessedMessage = mongoose.model<IProcessedMessage>(
  "ProcessedMessage",
  processedMessageSchema
);
