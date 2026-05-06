import { Router } from "express";
import { getSubscription, createCheckout, createPortal } from "../controllers/subscriptionController";

const router = Router();

router.get("/", getSubscription);
router.post("/checkout", createCheckout);
router.post("/portal", createPortal);

export default router;
