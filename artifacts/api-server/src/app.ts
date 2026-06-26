import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import type { IncomingMessage, ServerResponse } from "http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

// Handle CJS/ESM interop — some bundlers resolve the default export differently
const createPinoHttp = typeof pinoHttp === "function"
  ? pinoHttp
  : (pinoHttp as unknown as { default: typeof pinoHttp }).default;

const app: Express = express();

app.use(
  createPinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string; method?: string; url?: string }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse & { statusCode?: number }) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve static assets from the video-call frontend build folder
const publicPath = path.resolve(__dirname, "../../video-call/dist/public");
app.use(express.static(publicPath));

// Fallback all other client-side routes to index.html
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.resolve(publicPath, "index.html"), (err) => {
    if (err) {
      next();
    }
  });
});

export default app;
