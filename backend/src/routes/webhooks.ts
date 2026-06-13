import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { User } from "../models/User";
import { OrbiTier } from "@orbi/types";

const router = Router();

router.post("/stripe", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-03-31.basil" });
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    res.status(400).json({ error: "Webhook signature verification failed" });
    return;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, tier } = session.metadata || {};
      if (userId && tier) {
        await User.findByIdAndUpdate(userId, {
          tier: tier as OrbiTier,
          stripeSubscriptionId: session.subscription,
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await User.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { tier: OrbiTier.FREE, stripeSubscriptionId: null }
      );
      break;
    }
  }

  res.json({ received: true });
});

export default router;
