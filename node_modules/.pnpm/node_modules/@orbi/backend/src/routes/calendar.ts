import { Router } from "express";
import { getEvents, getAuthUrl, handleCallback } from "../controllers/calendarController";
import { requireFull } from "../middleware/auth";

const router = Router();

router.get("/auth-url", getAuthUrl);
router.get("/callback", handleCallback);
router.get("/events", requireFull, getEvents);

export default router;
