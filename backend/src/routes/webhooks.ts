import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { OrbiTier } from "@orbi/types";
import { getDb } from "../db/client";
import { users } from "../db/schema";

const router = Router();

router.post("/stripe", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    res.status(400).json({ error: "Webhook signature verification failed" });
    return;
  }

  const db = getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, tier } = session.metadata || {};
      if (userId && tier) {
        await db
          .update(users)
          .set({
            tier: tier as OrbiTier,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .update(users)
        .set({ tier: OrbiTier.FREE, stripeSubscriptionId: null, updatedAt: new Date() })
        .where(eq(users.stripeSubscriptionId, sub.id));
      break;
    }
  }

  res.json({ received: true });
});

export default router;
