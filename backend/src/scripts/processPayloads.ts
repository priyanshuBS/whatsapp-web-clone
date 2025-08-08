import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDB from "../config/database";
import { ProcessedMessage } from "../models/processedMessage.model";
import { processedMessageSchema } from "../validations/processedMessage.schema";

const PAYLOADS_DIR = path.join(__dirname, "../payloads");

const processPayloadFile = async (filePath: string) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const payload = JSON.parse(fileContent);

    if (payload.payload_type !== "whatsapp_webhook") return;

    const entry = payload.metaData?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) return;

    if (value.messages?.length > 0) {
      const message = value.messages[0];
      const contact = value.contacts?.[0];
      const from = message.from;
      const waId = contact?.wa_id || from;
      const businessNumber = value.metadata?.display_phone_number;

      const isIncoming = from === waId;
      const to = isIncoming ? businessNumber : waId;
      const direction = isIncoming ? "incoming" : "outgoing";

      const data = {
        messageId: message.id,
        waId,
        contactName: contact?.profile?.name || "Unknown",
        from,
        to,
        body: message.text?.body || "",
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        direction,
        rawPayload: payload,
      };

      const parsed = processedMessageSchema.safeParse(data);

      if (!parsed.success) {
        console.error(`Validation failed for message: ${message.id}`);
        console.error(parsed.error.format());
        return;
      }

      await ProcessedMessage.updateOne(
        { messageId: parsed.data.messageId },
        { $setOnInsert: parsed.data },
        { upsert: true }
      );

      console.log(`Message saved: ${data.messageId}`);
    }

    if (value.statuses?.length > 0) {
      const status = value.statuses[0];
      const updatedFields: any = {
        status: status.status,
        statusUpdatedAt: new Date(parseInt(status.timestamp) * 1000),
      };

      if (status.meta_msg_id) updatedFields.metaMsgId = status.meta_msg_id;
      if (status.gs_id) updatedFields.gsId = status.gs_id;

      if (status.conversation) {
        updatedFields.conversation = {
          id: status.conversation.id,
          origin: status.conversation.origin?.type,
          expiration: status.conversation.expiration_timestamp
            ? new Date(
                parseInt(status.conversation.expiration_timestamp) * 1000
              )
            : undefined,
        };
      }

      if (status.pricing) {
        updatedFields.pricing = {
          billable: status.pricing.billable,
          category: status.pricing.category,
          pricing_model: status.pricing.pricing_model,
          type: status.pricing.type,
        };
      }

      const updated = await ProcessedMessage.findOneAndUpdate(
        { messageId: status.id },
        { $set: updatedFields },
        { new: true }
      );

      if (updated) {
        console.log(`Status updated for messageId: ${status.id}`);
      } else {
        console.warn(`No message found to update for ID: ${status.id}`);
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
};

const processAllPayloads = async () => {
  await connectDB();

  const files = fs
    .readdirSync(PAYLOADS_DIR)
    .filter((file) => file.endsWith(".json"));
  for (const file of files) {
    const filePath = path.join(PAYLOADS_DIR, file);
    await processPayloadFile(filePath);
  }

  mongoose.connection.close();
};

processAllPayloads();
