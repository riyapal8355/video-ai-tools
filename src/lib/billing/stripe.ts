import { prisma } from "@/lib/db";

export interface PlanDefinition {
  id: string;
  name: string;
  tier: "free" | "starter" | "pro" | "enterprise";
  monthlyPriceUsd: number;
  monthlyCredits: number;
  maxResolution: string;
  watermark: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<string, PlanDefinition> = {
  free: {
    id: "plan_free",
    name: "Free Starter",
    tier: "free",
    monthlyPriceUsd: 0,
    monthlyCredits: 50,
    maxResolution: "720p",
    watermark: true,
    features: ["50 Credits / month", "720p Render Resolution", "Standard Avatar Library", "Community Support"],
  },
  starter: {
    id: "plan_starter",
    name: "Creator Tier",
    tier: "starter",
    monthlyPriceUsd: 29,
    monthlyCredits: 300,
    maxResolution: "1080p",
    watermark: false,
    features: ["300 Credits / month", "1080p Full HD Render", "No Watermark", "Instant Voice Cloning", "Fast Queue Priority"],
  },
  pro: {
    id: "plan_pro",
    name: "Business Pro",
    tier: "pro",
    monthlyPriceUsd: 89,
    monthlyCredits: 1200,
    maxResolution: "4k",
    watermark: false,
    features: ["1,200 Credits / month", "4K Ultra HD Render", "Custom Avatar Studio", "Multi-Track Studio Editor", "Full Developer API Access"],
  },
  enterprise: {
    id: "plan_enterprise",
    name: "Enterprise Custom",
    tier: "enterprise",
    monthlyPriceUsd: 299,
    monthlyCredits: 5000,
    maxResolution: "4k",
    watermark: false,
    features: ["5,000+ Credits / month", "Custom Digital Twins", "Dedicated SSO & SLA", "Unlimited Workspace Seats", "Dedicated Account Manager"],
  },
};

export interface CreditPackDefinition {
  id: string;
  credits: number;
  priceUsd: number;
  name: string;
}

export const CREDIT_TOPUPS: CreditPackDefinition[] = [
  { id: "topup_100", credits: 100, priceUsd: 10, name: "100 AI Credits" },
  { id: "topup_500", credits: 500, priceUsd: 45, name: "500 AI Credits" },
  { id: "topup_1500", credits: 1500, priceUsd: 120, name: "1,500 AI Credits" },
  { id: "topup_5000", credits: 5000, priceUsd: 350, name: "5,000 AI Credits" },
];

export async function createCheckoutSession(params: {
  workspaceId: string;
  userId: string;
  planTier?: string;
  creditPackId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const { workspaceId, userId, planTier, creditPackId, successUrl } = params;

  let amount = 0;
  let description = "";

  if (planTier && SUBSCRIPTION_PLANS[planTier]) {
    const plan = SUBSCRIPTION_PLANS[planTier];
    amount = plan.monthlyPriceUsd;
    description = "Subscription: " + plan.name + " ($" + plan.monthlyPriceUsd + "/mo)";
  } else if (creditPackId) {
    const pack = CREDIT_TOPUPS.find((p) => p.id === creditPackId);
    if (pack) {
      amount = pack.priceUsd;
      description = "Credit Top-Up: " + pack.name + " ($" + pack.priceUsd + ")";
    }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && !stripeKey.startsWith("sk_test_placeholder")) {
    try {
      const StripeModule = await import("stripe");
      const Stripe = StripeModule.default || StripeModule;
      // @ts-ignore
      const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: planTier ? "subscription" : "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: description },
              unit_amount: amount * 100,
              ...(planTier ? { recurring: { interval: "month" } } : {}),
            },
            quantity: 1,
          },
        ],
        metadata: { workspaceId, userId, planTier: planTier || "", creditPackId: creditPackId || "" },
        success_url: successUrl,
        cancel_url: params.cancelUrl,
      });

      return { checkoutUrl: session.url, sessionId: session.id };
    } catch (err) {
      console.warn("Stripe API call error, falling back to instant provision handler:", err);
    }
  }

  const sessionId = "cs_" + Math.random().toString(36).substring(2, 12);
  const delim = successUrl.includes("?") ? "&" : "?";
  const checkoutUrl = successUrl + delim + "session_id=" + sessionId + "&plan=" + (planTier || "") + "&pack=" + (creditPackId || "");

  return { checkoutUrl, sessionId };
}

export async function createCustomerPortalSession(params: {
  workspaceId: string;
  returnUrl: string;
}) {
  const returnUrl = params.returnUrl || "http://localhost:3000";
  return { portalUrl: returnUrl + "?portal=active" };
}

export async function processPaymentSuccess(params: {
  workspaceId: string;
  userId?: string;
  planTier?: string;
  creditPackId?: string;
}) {
  const { workspaceId, planTier, creditPackId } = params;

  if (planTier && SUBSCRIPTION_PLANS[planTier]) {
    const plan = SUBSCRIPTION_PLANS[planTier];
    const updatedWs = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { planTier: plan.tier },
    });

    const latest = await prisma.creditLedger.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
    const curBal = latest?.balanceAfter ?? 1000;
    const newBal = curBal + plan.monthlyCredits;

    await prisma.creditLedger.create({
      data: {
        workspaceId,
        delta: plan.monthlyCredits,
        balanceAfter: newBal,
        reason: "Subscription plan change to " + plan.name,
      },
    });

    return { updatedWs, addedCredits: plan.monthlyCredits, newBalance: newBal };
  }

  if (creditPackId) {
    const pack = CREDIT_TOPUPS.find((p) => p.id === creditPackId);
    if (pack) {
      const latest = await prisma.creditLedger.findFirst({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
      });
      const curBal = latest?.balanceAfter ?? 1000;
      const newBal = curBal + pack.credits;

      await prisma.creditLedger.create({
        data: {
          workspaceId,
          delta: pack.credits,
          balanceAfter: newBal,
          reason: "Credit pack top-up: " + pack.name,
        },
      });

      return { addedCredits: pack.credits, newBalance: newBal };
    }
  }

  return { addedCredits: 0 };
}