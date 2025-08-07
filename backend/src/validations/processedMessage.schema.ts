import { z } from "zod";

const pricingSchema = z.object({
  billable: z.boolean().optional(),
  category: z
    .enum(["utility", "authentication", "marketing", "service"])
    .optional(),
  pricing_model: z.enum(["CBP", "PMP"]).optional(),
  type: z.enum(["regular", "template"]).optional(),
});

const conversationSchema = z.object({
  id: z.string().trim().optional(),
  origin: z
    .enum(["user_initiated", "business_initiated", "referral_conversion"])
    .optional(),
  expiration: z.coerce.date().optional(),
});

export const processedMessageSchema = z.object({
  messageId: z.string().min(1, "Message ID is required").trim(),
  waId: z.string().regex(/^\d{10,15}$/, "waId must be a valid WhatsApp number"),
  contactName: z.string().optional().default("Unknown"),
  from: z.string().min(1, "Sender (from) is required").trim(),
  to: z.string().min(1, "Receiver (to) is required").trim(),
  body: z.string().min(1, "Message body is required").trim(),
  timestamp: z.coerce.date().refine((d) => !isNaN(d.getTime()), {
    message: "Invalid timestamp",
  }),
  direction: z.enum(["incoming", "outgoing"]),
  status: z
    .enum(["sent", "delivered", "read", "none"])
    .optional()
    .default("none"),
  statusUpdatedAt: z.coerce.date().optional(),
  metaMsgId: z.string().trim().optional(),
  gsId: z.string().trim().optional(),
  rawPayload: z.object({}).catchall(z.unknown()).optional(),
  pricing: pricingSchema.optional(),
  conversation: conversationSchema.optional(),
});
