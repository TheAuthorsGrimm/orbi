import { Request, Response } from "express";
import Stripe from "stripe";
import { User } from "../models/User";
import { OrbiTier } from "@orbi/types";

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-03-31.basil" });
}

export async function getSubscription(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId).select("tier stripeCustomerId stripeSubscriptionId");
  res.json({ success: true, data: user });
}

export async function createCheckout(req: Request, res: Response): Promise<void> {
  const { tier } = req.body as { tier: "agent" | "full" };
  const priceId = tier === "agent" ? process.env.STRIPE_PRICE_AGENT : process.env.STRIPE_PRICE_FULL;
  if (!priceId) { res.status(500).json({ success: false, error: "Stripe price not configured" }); return; }

  const user = await User.findById(req.userId);
  if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }

  const stripe = getStripe();
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.displayName });
    customerId = customer.id;
    await User.findByIdAndUpdate(req.userId, { stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.WEB_URL}/settings/subscription?success=true`,
    cancel_url: `${process.env.WEB_URL}/settings/subscription?canceled=true`,
    metadata: { userId: req.userId, tier },
  });

  res.json({ success: true, data: { url: session.url } });
}

export async function createPortal(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId);
  if (!user?.stripeCustomerId) {
    res.status(400).json({ success: false, error: "No active subscription" });
    return;
  }
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.WEB_URL}/settings/subscription`,
  });
  res.json({ success: true, data: { url: session.url } });
}
