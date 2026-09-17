"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Gem,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  CreditCard,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  tier: string;
  monthlyPriceUsd: number;
  monthlyCredits: number;
  maxResolution: string;
  watermark: boolean;
  features: string[];
}

interface TopupItem {
  id: string;
  credits: number;
  priceUsd: number;
  name: string;
}

interface SubscriptionBillingModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubscriptionBillingModal({
  onClose,
  onSuccess,
}: SubscriptionBillingModalProps) {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [topups, setTopups] = useState<TopupItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState("starter");
  const [creditBalance, setCreditBalance] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v2/billing/plans");
      const data = await res.json();
      if (data.plans) setPlans(data.plans);
      if (data.topups) setTopups(data.topups);
      if (data.currentPlan) setCurrentPlan(data.currentPlan);
      if (typeof data.creditBalance === "number") setCreditBalance(data.creditBalance);
    } catch (err) {
      console.error("Failed to load billing plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await fetch("/api/v2/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: tier }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        if (data.checkoutUrl.includes("session_id=")) {
          await fetch("/api/v2/billing/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "checkout.session.completed",
              data: {
                object: {
                  metadata: { planTier: tier },
                },
              },
            }),
          });
          setMessage("🎉 Successfully subscribed to " + tier.toUpperCase() + " plan!");
          await fetchPlans();
          if (onSuccess) onSuccess();
        } else {
          window.location.href = data.checkoutUrl;
        }
      } else if (data.error) {
        setMessage("Error: " + data.error);
      }
    } catch (err: any) {
      setMessage("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTopup = async (packId: string) => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await fetch("/api/v2/billing/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditPackId: packId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("🎉 Added " + data.addedCredits + " credits! New balance: " + data.newBalance);
        setCreditBalance(data.newBalance);
        if (onSuccess) onSuccess();
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (err: any) {
      setMessage("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/v2/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.portalUrl) {
        setMessage("Billing portal opened. Invoices and payment methods are managed here.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090d16] border border-[#1b253b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#141c2e] bg-[#0c1220]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Gem size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Subscription & Credits Management
              </h2>
              <p className="text-xs text-slate-400">
                Current Plan: <span className="font-semibold text-cyan-400 uppercase">{currentPlan}</span> • Available Credits:{" "}
                <span className="font-bold text-amber-300">{creditBalance}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#162035] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {message && (
            <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-300 flex items-center justify-between animate-in fade-in">
              <span>{message}</span>
              <button onClick={() => setMessage(null)} className="text-cyan-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Pricing Tier Cards */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              Upgrade or Change Monthly Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans
                .filter((p) => p.tier !== "free")
                .map((plan) => {
                  const isCurrent = currentPlan.toLowerCase() === plan.tier.toLowerCase();
                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? "bg-gradient-to-b from-[#131f38] to-[#0d1629] border-cyan-500/80 shadow-lg shadow-cyan-500/10"
                          : "bg-[#0c1222] border-[#18233a] hover:border-[#223354]"
                      }`}
                    >
                      {plan.tier === "pro" && (
                        <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-md">
                          Most Popular
                        </span>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-base">{plan.name}</h4>
                        <span className="text-xs text-amber-300 font-mono font-bold flex items-center gap-1">
                          <Gem size={12} /> {plan.monthlyCredits}/mo
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className="text-2xl font-black text-white">${plan.monthlyPriceUsd}</span>
                        <span className="text-xs text-slate-400 font-medium"> / month</span>
                      </div>

                      <ul className="space-y-2 mb-6 flex-1">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <Check size={14} className="text-cyan-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSubscribe(plan.tier)}
                        disabled={isCurrent || actionLoading}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          isCurrent
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 cursor-default"
                            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95"
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check size={14} /> Active Plan
                          </>
                        ) : (
                          <>
                            Upgrade to {plan.name} <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Instant Credit Packs Top-Up */}
          <div className="pt-2 border-t border-[#141d30]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                One-Time Credit Pack Top-Ups
              </h3>
              <span className="text-xs text-slate-400">Instant provision into workspace balance</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topups.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-[#0c1222] border border-[#18233a] hover:border-amber-500/50 p-4 rounded-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm mb-1">
                      <Gem size={14} /> {pack.credits}
                    </div>
                    <div className="text-xs text-slate-400 mb-3">{pack.name}</div>
                  </div>
                  <button
                    onClick={() => handleTopup(pack.id)}
                    disabled={actionLoading}
                    className="w-full py-1.5 rounded-lg bg-[#141e33] hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-1"
                  >
                    Buy for ${pack.priceUsd}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0a0f1c] border-t border-[#141d30] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>256-Bit SSL Encrypted & Stripe Secured Billing</span>
          </div>
          <button
            onClick={handleOpenPortal}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#162035] transition-colors"
          >
            <CreditCard size={14} />
            <span>Customer Portal & Invoices</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}