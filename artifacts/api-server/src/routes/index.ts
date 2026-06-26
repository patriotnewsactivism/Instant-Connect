import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roomsRouter from "./rooms";
import messagesRouter from "./messages";
import callsRouter from "./calls";

const router: IRouter = Router();

router.use(healthRouter);
router.use(roomsRouter);
router.use(messagesRouter);
router.use(callsRouter);

export default router;
