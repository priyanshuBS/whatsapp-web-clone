export interface Pricing {
  billable?: boolean;
  category?: "utility" | "authentication" | "marketing" | "service";
  pricing_model?: "CBP" | "PMP";
  type?: "regular" | "template";
}

export interface Conversation {
  id?: string;
  origin?: "user_initiated" | "business_initiated" | "referral_conversion";
  expiration?: Date;
}

export interface IProcessedMessage {
  messageId: string;
  waId: string;
  contactName?: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  direction: "incoming" | "outgoing";
  status?: "sent" | "delivered" | "read" | "none";
  statusUpdatedAt?: Date;
  metaMsgId?: string;
  gsId?: string;
  rawPayload?: Record<string, any>;
  pricing?: Pricing;
  conversation?: Conversation;
  createdAt?: Date;
  updatedAt?: Date;
}
