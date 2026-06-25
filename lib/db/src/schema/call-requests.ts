import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const callRequestsTable = pgTable("call_requests", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull(),
  initiatedBy: text("initiated_by").notNull(), // "host" | "guest"
  status: text("status").notNull().default("pending"), // "pending" | "answered" | "declined" | "expired"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCallRequestSchema = createInsertSchema(callRequestsTable).omit({
  id: true,
  createdAt: true,
  status: true,
});
export type InsertCallRequest = z.infer<typeof insertCallRequestSchema>;
export type CallRequest = typeof callRequestsTable.$inferSelect;
