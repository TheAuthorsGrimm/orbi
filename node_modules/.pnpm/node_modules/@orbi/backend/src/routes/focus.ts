import { Router } from "express";
import { listSessions, createSession, updateSession, getStats } from "../controllers/focusController";

const router = Router();

router.get("/", listSessions);
router.get("/stats", getStats);
router.post("/", createSession);
router.patch("/:id", updateSession);

export default router;
