import { Router, type IRouter } from "express";
import { randomBytes } from "crypto";
import { db, roomsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateRoomBody, GetRoomParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/rooms", async (req, res): Promise<void> => {
  const parsed = CreateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = randomBytes(6).toString("hex");
  const [room] = await db
    .insert(roomsTable)
    .values({ id, hostName: parsed.data.hostName, active: true })
    .returning();

  req.log.info({ roomId: id }, "Room created");
  res.status(201).json({ ...room, createdAt: room!.createdAt.toISOString() });
});

router.get("/rooms/:roomId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["roomId"]) ? req.params["roomId"][0] : req.params["roomId"];
  const params = GetRoomParams.safeParse({ roomId: raw });
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

  res.json({ ...room, createdAt: room.createdAt.toISOString() });
});

export default router;
