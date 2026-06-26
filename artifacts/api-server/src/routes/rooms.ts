import { Router, type IRouter } from "express";
import { randomBytes } from "crypto";
import { db, roomsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateRoomBody, GetRoomParams, VerifyPinParams, VerifyPinBody } from "@workspace/api-zod";

const router: IRouter = Router();

/** Convert a DB room row into the API response shape (never expose raw pin). */
function serializeRoom(room: typeof roomsTable.$inferSelect) {
  const { pin, ...rest } = room;
  return { ...rest, createdAt: rest.createdAt.toISOString(), hasPin: !!pin };
}

router.post("/rooms", async (req, res): Promise<void> => {
  const parsed = CreateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = randomBytes(6).toString("hex");
  const [room] = await db
    .insert(roomsTable)
    .values({
      id,
      hostName: parsed.data.hostName,
      pin: parsed.data.pin ?? null,
      active: true,
    })
    .returning();

  req.log.info({ roomId: id }, "Room created");
  res.status(201).json(serializeRoom(room!));
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

  res.json(serializeRoom(room));
});

router.post("/rooms/:roomId/verify-pin", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["roomId"]) ? req.params["roomId"][0] : req.params["roomId"];
  const params = VerifyPinParams.safeParse({ roomId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = VerifyPinBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
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

  // If room has no pin, any attempt is invalid
  if (!room.pin) {
    res.status(401).json({ error: "Room does not use a PIN" });
    return;
  }

  const valid = room.pin === body.data.pin;
  if (!valid) {
    res.status(401).json({ error: "Wrong PIN" });
    return;
  }

  res.json({ valid: true });
});

export default router;
