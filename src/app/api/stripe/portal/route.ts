import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function appUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user.stripeCustomerId) {
      return NextResponse.json({ success: false, error: "No active subscription" }, { status: 400 });
    }
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl(req)}/#/settings`,
    });
    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
