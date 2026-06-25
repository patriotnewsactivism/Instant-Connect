import { Router, type IRouter } from "express";
import { db, roomsTable, messagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SendMessageBody, GetMessagesParams, MarkMessagesReadParams } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeMessage(msg: typeof messagesTable.$inferSelect) {
  return { ...msg, createdAt: msg.createdAt.toISOString() };
}

router.get("/rooms/:roomId/messages", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["roomId"]) ? req.params["roomId"][0] : req.params["roomId"];
  const params = GetMessagesParams.safeParse({ roomId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [room] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, params.data.roomId));

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.roomId, params.data.roomId))
    .orderBy(desc(messagesTable.createdAt));

  res.json(messages.map(serializeMessage));
});

router.post("/rooms/:roomId/messages", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["roomId"]) ? req.params["roomId"][0] : req.params["roomId"];

  const [room] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, raw));

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      roomId: raw,
      senderName: parsed.data.senderName,
      content: parsed.data.content,
      type: parsed.data.type ?? "text",
    })
    .returning();

  req.log.info({ roomId: raw, messageId: message!.id }, "Message sent");
  res.status(201).json(serializeMessage(message!));
});

router.post("/rooms/:roomId/messages/read", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["roomId"]) ? req.params["roomId"][0] : req.params["roomId"];
  const params = MarkMessagesReadParams.safeParse({ roomId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const updated = await db
    .update(messagesTable)
    .set({ read: true })
    .where(eq(messagesTable.roomId, params.data.roomId))
    .returning();

  res.json({ updated: updated.length });
});

export default router;
