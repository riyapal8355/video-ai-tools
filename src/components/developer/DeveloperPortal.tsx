"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  Key,
  Webhook,
  Terminal,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Send,
  RefreshCw,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import AskRhysWidget from "../dashboard/AskRhysWidget";

interface ApiKeyItem {
  id: string;
  label: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface WebhookEndpointItem {
  id: string;
  url: string;
  secret: string;
  subscribedEvents: string;
  createdAt: string;
  _count?: { deliveries: number };
}

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks" | "docs">("keys");

  // API Keys state
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("Production API Key");
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Webhooks state
  const [endpoints, setEndpoints] = useState<WebhookEndpointItem[]>([]);
  const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://example.com/api/webhooks/vidoai");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "video.render.completed",
    "video_translate.completed",
    "batch.completed",
  ]);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Sandbox state
  const [sandboxPrompt, setSandboxPrompt] = useState(
    "Hello from the VidoAI Developer API! Automated video generation is now live."
  );
  const [sandboxExecuting, setSandboxExecuting] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxStatusPoll, setSandboxStatusPoll] = useState<any>(null);

  // Fetch API keys
  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/v1/developer/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.warn("Failed to load API keys:", err);
    }
  };

  // Fetch Webhook endpoints
  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/v1/developer/webhooks");
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.endpoints || []);
      }
    } catch (err) {
      console.warn("Failed to load webhooks:", err);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchWebhooks();
  }, []);

  const handleCreateKey = async () => {
    try {
      const res = await fetch("/api/v1/developer/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newKeyLabel }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedRawKey(data.apiKey.rawKey);
        fetchKeys();
      }
    } catch (err) {
      console.error("Create API Key error:", err);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
      const res = await fetch(`/api/v1/developer/keys/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error("Revoke API Key error:", err);
    }
  };

  const handleAddWebhook = async () => {
    try {
      const res = await fetch("/api/v1/developer/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          subscribedEvents: selectedEvents.join(","),
        }),
      });
      if (res.ok) {
        setIsAddWebhookOpen(false);
        fetchWebhooks();
      }
    } catch (err) {
      console.error("Add webhook error:", err);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Delete this webhook endpoint?")) return;
    try {
      const res = await fetch(`/api/v1/developer/webhooks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchWebhooks();
      }
    } catch (err) {
      console.error("Delete webhook error:", err);
    }
  };

  // Run Sandbox API Call
  const handleExecuteSandbox = async () => {
    setSandboxExecuting(true);
    setSandboxResponse(null);
    setSandboxStatusPoll(null);

    try {
      const res = await fetch("/api/v2/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_inputs: [
            {
              character: { type: "avatar" },
              voice: { type: "text", input_text: sandboxPrompt },
              background: { type: "color", value: "#0c111e" },
            },
          ],
          dimension: { width: 1280, height: 720 },
          aspect_ratio: "16:9",
          test: false,
        }),
      });

      const data = await res.json();
      setSandboxResponse(JSON.stringify(data, null, 2));

      if (data?.data?.video_id) {
        const videoId = data.data.video_id;
        // Poll status 2 times
        setTimeout(async () => {
          const pollRes = await fetch(`/api/v2/video_status/${videoId}`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            setSandboxStatusPoll(pollData);
          }
        }, 1500);
      }
    } catch (err: any) {
      setSandboxResponse(JSON.stringify({ error: err?.message }, null, 2));
    } finally {
      setSandboxExecuting(false);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <div className="w-full px-10 pt-7 pb-4 flex items-center justify-between border-b border-[#141b2c] z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Code2 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Developer Platform & API
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Programmatic video generation, webhooks, and REST endpoints for your software
            </p>
          </div>
        </div>

        <AskRhysWidget />
      </div>

      {/* Tabs Row */}
      <div className="px-10 pt-4 flex gap-6 border-b border-[#141b2c] bg-[#090d16]">
        {[
          { id: "keys", label: "API Keys", icon: Key },
          { id: "webhooks", label: "Webhooks", icon: Webhook },
          { id: "docs", label: "API Reference & Sandbox", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold flex items-center gap-2 transition-all relative cursor-pointer ${
                isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-10 py-6 flex-1 space-y-6 pb-20">
        {/* TAB 1: API KEYS */}
        {activeTab === "keys" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Active API Keys</h3>
                <p className="text-xs text-slate-400">
                  Authenticate your server requests using the{" "}
                  <code className="bg-[#121828] text-cyan-300 px-1.5 py-0.5 rounded text-[11px] font-mono">
                    X-Api-Key
                  </code>{" "}
                  HTTP header
                </p>
              </div>
              <button
                onClick={() => {
                  setCreatedRawKey(null);
                  setIsCreateKeyOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Generate New API Key</span>
              </button>
            </div>

            {/* Keys Table / Cards */}
            <div className="rounded-2xl border border-[#1a253e] bg-[#0c111e] overflow-hidden">
              {keys.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active API keys found. Generate your first key to start making requests.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111827] text-slate-400 border-b border-[#1a253e]">
                    <tr>
                      <th className="p-3.5 font-bold">Key Label</th>
                      <th className="p-3.5 font-bold">Key Prefix</th>
                      <th className="p-3.5 font-bold">Created At</th>
                      <th className="p-3.5 font-bold">Last Used</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17223b] text-slate-300">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-[#101726]">
                        <td className="p-3.5 font-bold text-white">{k.label}</td>
                        <td className="p-3.5 font-mono text-cyan-400">{k.keyPrefix}</td>
                        <td className="p-3.5 text-slate-400">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleTimeString() : "Never"}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Revoke Key"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quickstart Callout */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/60 border border-[#1e293b] flex items-start gap-3 text-xs">
              <Key size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white mb-1">API Key Best Practices</h4>
                <p className="text-slate-400 leading-relaxed">
                  Never expose your API key in client-side code, public GitHub repositories, or browser bundles. Always call VidoAI API endpoints from your backend service or cloud functions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEBHOOKS */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Webhook Endpoints</h3>
                <p className="text-xs text-slate-400">
                  Receive cryptographically signed HMAC-SHA256 HTTP POST notifications when videos finish rendering
                </p>
              </div>
              <button
                onClick={() => setIsAddWebhookOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Register Webhook Endpoint</span>
              </button>
            </div>

            {/* Endpoints List */}
            <div className="space-y-3">
              {endpoints.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-[#1a253e] bg-[#0c111e] text-slate-500 text-xs">
                  No webhook endpoints configured. Add an endpoint URL to receive render events.
                </div>
              ) : (
                endpoints.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-4 rounded-2xl border border-[#1a253e] bg-[#0c111e] flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{ep.url}</span>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>Secret: {ep.secret.slice(0, 10)}...</span>
                        <span>•</span>
                        <span>Events: {ep.subscribedEvents}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteWebhook(ep.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-colors cursor-pointer"
                        title="Delete Webhook"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* HMAC Signature Guide */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/60 border border-[#1e293b] space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-400" />
                <span>Verifying Webhook Signatures</span>
              </h4>
              <p className="text-slate-400 leading-relaxed font-sans">
                Every webhook event includes an{" "}
                <code className="text-cyan-300 font-mono">X-VidoAI-Signature</code> header computed as:
              </p>
              <pre className="p-2.5 rounded-xl bg-[#090d16] font-mono text-[11px] text-cyan-300 overflow-x-auto border border-[#18233b]">
                crypto.createHmac(&apos;sha256&apos;, secret).update(rawBody).digest(&apos;hex&apos;)
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: API REFERENCE & SANDBOX */}
        {activeTab === "docs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Interactive Sandbox */}
            <div className="space-y-4 bg-[#0c111e] border border-[#1a253e] rounded-3xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#18233b]">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Live API Request Tester</h3>
                </div>
                <span className="text-[10px] bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-md font-mono font-bold">
                  POST /api/v2/video/generate
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Video Voiceover Script
                </label>
                <textarea
                  value={sandboxPrompt}
                  onChange={(e) => setSandboxPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-[#111728] border border-[#202c49] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none font-mono"
                />
              </div>

              <button
                onClick={handleExecuteSandbox}
                disabled={sandboxExecuting}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {sandboxExecuting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Execute API Request</span>
                  </>
                )}
              </button>

              {sandboxResponse && (
                <div className="space-y-2 pt-2 border-t border-[#18233b]">
                  <span className="text-[11px] font-bold text-slate-400">Response (202 Accepted):</span>
                  <pre className="p-3 bg-[#080c14] border border-[#18233b] rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
                    {sandboxResponse}
                  </pre>
                </div>
              )}

              {sandboxStatusPoll && (
                <div className="space-y-2 pt-2 border-t border-[#18233b]">
                  <span className="text-[11px] font-bold text-slate-400">Status Poll (GET /api/v2/video_status):</span>
                  <pre className="p-3 bg-[#080c14] border border-[#18233b] rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                    {JSON.stringify(sandboxStatusPoll, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Right Column: Code Snippets */}
            <div className="space-y-4 bg-[#0c111e] border border-[#1a253e] rounded-3xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#18233b]">
                <h3 className="text-sm font-bold text-white">SDK & cURL Code Snippets</h3>
                <span className="text-[10px] text-slate-400 font-mono">REST JSON</span>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400">cURL Example</span>
                <pre className="p-3 bg-[#080c14] border border-[#18233b] rounded-xl text-[10.5px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`curl -X POST https://api.vidoai.com/api/v2/video/generate \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: vido_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -d '{
    "video_inputs": [{
      "voice": { "input_text": "Hello world" }
    }],
    "aspect_ratio": "16:9"
  }'`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400">JavaScript / TypeScript (Fetch)</span>
                <pre className="p-3 bg-[#080c14] border border-[#18233b] rounded-xl text-[10.5px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`const res = await fetch("https://api.vidoai.com/api/v2/video/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": process.env.VIDOAI_API_KEY
  },
  body: JSON.stringify({
    video_inputs: [{ voice: { input_text: "Personalized message" } }]
  })
});
const { data } = await res.json();
console.log("Job ID:", data.video_id);`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE API KEY MODAL */}
      {isCreateKeyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1322] border border-[#22304f] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2742] mb-4">
              <h3 className="text-base font-bold text-white">Create Developer API Key</h3>
              <button
                onClick={() => setIsCreateKeyOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {!createdRawKey ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Key Label / Identifier
                  </label>
                  <input
                    type="text"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Backend Production Server"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#1c2742]">
                  <button
                    onClick={() => setIsCreateKeyOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Generate Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                  ⚠️ Make sure to copy your API key now. You will not be able to view it again.
                </div>

                <div className="flex items-center gap-2 bg-[#121828] border border-[#202c49] p-2.5 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={createdRawKey}
                    className="w-full bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdRawKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="p-1.5 bg-[#1a253e] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded-lg transition-colors cursor-pointer"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="flex justify-end pt-3 border-t border-[#1c2742]">
                  <button
                    onClick={() => setIsCreateKeyOpen(false)}
                    className="px-5 py-2 bg-cyan-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    I Have Saved My Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REGISTER WEBHOOK MODAL */}
      {isAddWebhookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1322] border border-[#22304f] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2742] mb-4">
              <h3 className="text-base font-bold text-white">Register Webhook Endpoint</h3>
              <button
                onClick={() => setIsAddWebhookOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Webhook Payload Destination URL
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Subscribed Events
                </label>
                <div className="space-y-2">
                  {[
                    "video.render.completed",
                    "video.render.failed",
                    "video_translate.completed",
                    "batch.completed",
                  ].map((evt) => {
                    const isChecked = selectedEvents.includes(evt);
                    return (
                      <label
                        key={evt}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedEvents(selectedEvents.filter((e) => e !== evt));
                          } else {
                            setSelectedEvents([...selectedEvents, evt]);
                          }
                        }}
                        className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-[#121828] border border-[#1f2b48]"
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                            isChecked
                              ? "bg-cyan-500 border-cyan-500 text-slate-950"
                              : "border-slate-600 bg-transparent"
                          }`}
                        >
                          {isChecked && <Check size={12} className="stroke-[3]" />}
                        </div>
                        <span className="font-mono text-[11px]">{evt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1c2742]">
                <button
                  onClick={() => setIsAddWebhookOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWebhook}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Register Endpoint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
