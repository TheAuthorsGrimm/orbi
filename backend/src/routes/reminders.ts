import { Router } from "express";
import { listReminders, createReminder, updateReminder, deleteReminder } from "../controllers/reminderController";
import { requireFull } from "../middleware/auth";

const router = Router();

router.get("/", requireFull, listReminders);
router.post("/", requireFull, createReminder);
router.patch("/:id", requireFull, updateReminder);
router.delete("/:id", requireFull, deleteReminder);

export default router;
