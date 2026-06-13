import { Router } from "express";
import { getProfile, updateProfile, updatePreferences, updatePersona } from "../controllers/userController";
import { requireFull } from "../middleware/auth";

const router = Router();

router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.patch("/me/preferences", updatePreferences);
router.patch("/me/persona", requireFull, updatePersona);

export default router;
