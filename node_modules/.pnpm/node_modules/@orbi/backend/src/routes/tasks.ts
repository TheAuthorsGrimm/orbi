import { Router } from "express";
import {
  listTasks, getTask, createTask, updateTask, deleteTask,
  decomposeTaskHandler, updateStep,
} from "../controllers/taskController";
import { requireAgent } from "../middleware/auth";

const router = Router();

router.get("/", listTasks);
router.post("/", createTask);
router.get("/:id", getTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/decompose", requireAgent, decomposeTaskHandler);
router.patch("/:id/steps/:stepId", updateStep);

export default router;
