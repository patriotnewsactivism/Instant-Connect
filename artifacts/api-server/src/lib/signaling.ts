import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";
import { logger } from "./logger";

interface Client {
  ws: WebSocket;
  roomId: string;
  role: "host" | "guest";
}

interface SignalingMessage {
  type: string;
  roomId?: string;
  role?: "host" | "guest";
  sdp?: unknown;
  candidate?: unknown;
}

const clients = new Map<string, Client[]>();

function getRoom(roomId: string): Client[] {
  if (!clients.has(roomId)) {
    clients.set(roomId, []);
  }
  return clients.get(roomId)!;
}

function broadcastToRoom(roomId: string, message: object, excludeWs?: WebSocket) {
  const room = getRoom(roomId);
  const data = JSON.stringify(message);
  for (const client of room) {
    if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

export function setupSignaling(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    let roomId: string | null = null;
    let role: "host" | "guest" | null = null;

    ws.on("message", (raw) => {
      let msg: SignalingMessage;
      try {
        msg = JSON.parse(raw.toString()) as SignalingMessage;
      } catch {
        return;
      }

      if (msg.type === "join") {
        roomId = msg.roomId ?? null;
        role = msg.role ?? null;
        if (!roomId || !role) return;

        const room = getRoom(roomId);
        room.push({ ws, roomId, role });

        logger.info({ roomId, role }, "Client joined room");

        broadcastToRoom(roomId, { type: "peer-joined", role }, ws);
        return;
      }

      if (!roomId) return;

      if (msg.type === "offer" || msg.type === "answer" || msg.type === "ice-candidate") {
        broadcastToRoom(roomId, msg, ws);
        return;
      }

      if (msg.type === "leave") {
        handleLeave(ws, roomId, role);
        roomId = null;
        role = null;
        return;
      }
    });

    ws.on("close", () => {
      if (roomId) {
        handleLeave(ws, roomId, role);
      }
    });

    ws.on("error", (err) => {
      logger.error({ err }, "WebSocket error");
    });
  });

  logger.info("WebSocket signaling server initialized");
}

function handleLeave(ws: WebSocket, roomId: string, role: string | null) {
  const room = getRoom(roomId);
  const idx = room.findIndex((c) => c.ws === ws);
  if (idx !== -1) room.splice(idx, 1);

  if (room.length === 0) {
    clients.delete(roomId);
    logger.info({ roomId }, "Room closed");
  } else {
    broadcastToRoom(roomId, { type: "peer-left", role });
  }
}
