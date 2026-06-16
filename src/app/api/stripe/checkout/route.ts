import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const schema = z.object({ tier: z.enum(["agent", "full"]) });

function appUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "tier required" }, { status: 400 });
    }
    const priceId =
      parsed.data.tier === "agent" ? process.env.STRIPE_PRICE_AGENT : process.env.STRIPE_PRICE_FULL;
    if (!priceId) {
      return NextResponse.json({ success: false, error: "Stripe price not configured" }, { status: 500 });
    }

    const stripe = getStripe();
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.displayName });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
    }

    const base = appUrl(req);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/#/settings?upgraded=1`,
      cancel_url: `${base}/#/pricing?cancelled=1`,
      metadata: { userId: user.id, tier: parsed.data.tier },
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
