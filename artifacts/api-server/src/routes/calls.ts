import { Router, type IRouter } from "express";
import { db, roomsTable, callRequestsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  GetCallRequestParams,
  CreateCallRequestBody,
  CreateCallRequestParams,
  UpdateCallRequestParams,
  UpdateCallRequestBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeCallRequest(cr: typeof callRequestsTable.$inferSelect) {
  return { ...cr, createdAt: cr.createdAt.toISOString() };
}

/** GET /rooms/:roomId/call — get the latest pending call request */
router.get("/rooms/:roomId/call", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["roomId"]) ? req.params["roomId"][0] : req.params["roomId"];
  const params = GetCallRequestParams.safeParse({ roomId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pending] = await db
    .select()
    .from(callRequestsTable)
    .where(
      and(
        eq(callRequestsTable.roomId, params.data.roomId),
        eq(callRequestsTable.status, "pending"),
      ),
    )
    .orderBy(desc(callRequestsTable.createdAt))
    .limit(1);

  res.json({ callRequest: pending ? serializeCallRequest(pending) : null });
});

/** POST /rooms/:roomId/call — create a call request (ring the other side) */
router.post("/rooms/:roomId/call", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["roomId"]) ? req.params["roomId"][0] : req.params["roomId"];
  const params = CreateCallRequestParams.safeParse({ roomId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateCallRequestBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  // Verify room exists
  const [room] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, params.data.roomId));

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const [callRequest] = await db
    .insert(callRequestsTable)
    .values({
      roomId: params.data.roomId,
      initiatedBy: body.data.initiatedBy,
    })
    .returning();

  req.log.info(
    { roomId: params.data.roomId, callId: callRequest!.id },
    "Call request created",
  );
  res.status(201).json(serializeCallRequest(callRequest!));
});

/** PATCH /rooms/:roomId/call/:callId — answer or decline a call */
router.patch("/rooms/:roomId/call/:callId", async (req, res): Promise<void> => {
  const rawRoomId = Array.isArray(req.params["roomId"])
    ? req.params["roomId"][0]
    : req.params["roomId"];
  const rawCallId = Array.isArray(req.params["callId"])
    ? req.params["callId"][0]
    : req.params["callId"];

  const params = UpdateCallRequestParams.safeParse({
    roomId: rawRoomId,
    callId: rawCallId,
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateCallRequestBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [updated] = await db
    .update(callRequestsTable)
    .set({ status: body.data.status })
    .where(
      and(
        eq(callRequestsTable.id, params.data.callId),
        eq(callRequestsTable.roomId, params.data.roomId),
      ),
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Call request not found" });
    return;
  }

  req.log.info(
    { roomId: params.data.roomId, callId: params.data.callId, status: body.data.status },
    "Call request updated",
  );
  res.json(serializeCallRequest(updated));
});

export default router;
