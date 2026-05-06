// =============================================================
// Stripe Subscription Service
// Handles Orbi tier billing in CAD
// =============================================================

import Stripe from "stripe";
import { OrbiTier, TIER_PRICING_CAD } from "@orbi/types";
import { User } from "../models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

// Stripe Price IDs (set these in .env after creating in Stripe dashboard)
const PRICE_IDS: Record<OrbiTier, string | null> = {
  [OrbiTier.FREE]:  null,
  [OrbiTier.AGENT]: process.env.STRIPE_PRICE_AGENT!,
  [OrbiTier.FULL]:  process.env.STRIPE_PRICE_FULL!,
};

// -----------------------------------------------------------
// Create Checkout Session
// -----------------------------------------------------------
export async function createCheckoutSession(
  userId: string,
  targetTier: OrbiTier.AGENT | OrbiTier.FULL
): Promise<string> {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Ensure Stripe customer exists
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.displayName,
      metadata: { orbiUserId: userId },
    });
    customerId = customer.id;
    await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: PRICE_IDS[targetTier]!, quantity: 1 }],
    mode: "subscription",
    currency: "cad",
    success_url: `${process.env.WEB_URL}/settings/subscription?success=true`,
    cancel_url: `${process.env.WEB_URL}/settings/subscription?cancelled=true`,
    metadata: { userId, targetTier },
  });

  return session.url!;
}

// -----------------------------------------------------------
// Handle Stripe Webhook Events
// -----------------------------------------------------------
export async function handleWebhookEvent(
  payload: Buffer,
  signature: string
): Promise<void> {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, targetTier } = session.metadata || {};
      if (userId && targetTier) {
        await User.findByIdAndUpdate(userId, {
          tier: targetTier,
          stripeSubscriptionId: session.subscription,
        });
        console.log(`✅ Upgraded user ${userId} to ${targetTier}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await User.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { tier: OrbiTier.FREE, stripeSubscriptionId: null }
      );
      console.log(`⬇️  Subscription cancelled, downgraded to free`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(`⚠️  Payment failed for customer: ${invoice.customer}`);
      // TODO: send dunning email
      break;
    }
  }
}

// -----------------------------------------------------------
// Get Billing Portal URL
// -----------------------------------------------------------
export async function getBillingPortalUrl(userId: string): Promise<string> {
  const user = await User.findById(userId);
  if (!user?.stripeCustomerId) throw new Error("No billing account found");

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.WEB_URL}/settings/subscription`,
  });

  return session.url;
}
