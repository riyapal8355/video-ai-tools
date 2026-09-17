"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Shield,
  History,
  Plus,
  Trash2,
  Copy,
  Check,
  Lock,
  Mail,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

interface MemberItem {
  id: string;
  role: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuditLogItem {
  id: string;
  action: string;
  targetType: string;
  createdAt: string;
  actorUser: {
    name: string;
    email: string;
  };
}

export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
  workspaceId,
}: WorkspaceSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"members" | "invite" | "security" | "audit">("members");

  // Members state
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("creator");
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Security state
  const [enforceMfa, setEnforceMfa] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState("");
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [ssoProvider, setSsoProvider] = useState("google");
  const [savingSecurity, setSavingSecurity] = useState(false);

  // Audit state
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.warn("Load members error:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchSecurity = async () => {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/security`);
      if (res.ok) {
        const data = await res.json();
        if (data.security) {
          setEnforceMfa(data.security.enforceMfa || false);
          setAllowedDomains(data.security.allowedDomains || "");
          setSsoEnabled(data.security.ssoEnabled || false);
          setSsoProvider(data.security.ssoProvider || "google");
        }
      }
    } catch (err) {
      console.warn("Load security settings error:", err);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/audit_log`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn("Load audit logs error:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchSecurity();
      fetchLogs();
    }
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) return;
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setInviteResult(data.inviteLink);
        setInviteEmail("");
        fetchMembers();
      }
    } catch (err) {
      console.error("Invite error:", err);
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (err) {
      console.error("Role update error:", err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (err) {
      console.error("Remove member error:", err);
    }
  };

  const handleSaveSecurity = async () => {
    setSavingSecurity(true);
    try {
      await fetch(`/api/v1/workspaces/${workspaceId}/security`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enforceMfa,
          allowedDomains,
          ssoEnabled,
          ssoProvider,
        }),
      });
      alert("Workspace security policies updated successfully!");
    } catch (err) {
      console.error("Save security error:", err);
    } finally {
      setSavingSecurity(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2742] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Workspace Team & Security</h3>
              <p className="text-xs text-slate-400">
                Manage team permissions, role-based access, SSO, and compliance audit logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs Row */}
        <div className="flex gap-4 border-b border-[#1c2742] pb-3 mb-5">
          {[
            { id: "members", label: "Team Members", icon: Users },
            { id: "invite", label: "Invite Teammate", icon: Plus },
            { id: "security", label: "Security & SSO", icon: Shield },
            { id: "audit", label: "Audit Logs", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 relative transition-colors cursor-pointer ${
                  isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MEMBERS */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No other members found in workspace.
              </div>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-[#111728] border border-[#1e2a44] rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {m.user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{m.user.name}</h5>
                      <p className="text-[10px] text-slate-400">{m.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      className="bg-[#0c111e] border border-[#202c49] text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="developer">Developer</option>
                      <option value="creator">Creator</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: INVITE */}
        {activeTab === "invite" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Teammate Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Workspace Role & Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "super_admin", label: "Super Admin", desc: "Full control over billing, security & users" },
                  { id: "developer", label: "Developer", desc: "Content creation + API keys & webhooks" },
                  { id: "creator", label: "Creator", desc: "Builds avatar videos, voices, and projects" },
                  { id: "viewer", label: "Viewer", desc: "Read-only preview and review access" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setInviteRole(r.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      inviteRole === r.id
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-[#121828] border-[#202c49] text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{r.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSendInvite}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Mail size={14} />
              <span>Send Teammate Invitation</span>
            </button>

            {inviteResult && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Check size={14} /> Invitation Created! Shareable Link:
                </span>
                <div className="flex items-center gap-2 bg-[#0c111e] p-2 rounded-lg border border-[#1d2b48]">
                  <input
                    type="text"
                    readOnly
                    value={inviteResult}
                    className="w-full bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteResult);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-4">
            {/* MFA Enforcement */}
            <div
              onClick={() => setEnforceMfa(!enforceMfa)}
              className="p-3.5 bg-[#121828] border border-[#202c49] hover:border-[#2b3a5f] rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock size={13} className="text-cyan-400" />
                  <span>Enforce Two-Factor Authentication (MFA / 2FA)</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Require all workspace members to complete authenticator verification on sign-in
                </p>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                  enforceMfa ? "bg-cyan-500 justify-end" : "bg-slate-700 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-slate-950 shadow-sm"></div>
              </div>
            </div>

            {/* Allowed Domains */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Company Email Domain Matching (Auto-Join)
              </label>
              <input
                type="text"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                placeholder="e.g. acme.com, acmecorp.io"
                className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Colleagues with matching email domains will be automatically routed to this workspace upon signup.
              </p>
            </div>

            {/* SSO / SAML */}
            <div className="p-3.5 bg-[#121828] border border-[#202c49] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield size={13} className="text-emerald-400" />
                    <span>Single Sign-On (SSO / SAML 2.0 / OIDC)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Enterprise identity federation via Okta, Microsoft Entra ID, or Google
                  </p>
                </div>
                <div
                  onClick={() => setSsoEnabled(!ssoEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                    ssoEnabled ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-slate-950 shadow-sm"></div>
                </div>
              </div>

              {ssoEnabled && (
                <div className="pt-2 border-t border-[#1d2a45] flex gap-2">
                  {["google", "okta", "entra"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSsoProvider(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors capitalize cursor-pointer ${
                        ssoProvider === p
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-[#0c111e] border-[#22304f] text-slate-400"
                      }`}
                    >
                      {p === "entra" ? "Microsoft Entra" : p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSecurity}
              disabled={savingSecurity}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              {savingSecurity ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Save Security Policies</span>
            </button>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No audit entries recorded yet.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-[#111728] border border-[#1e2a44] rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-cyan-400 font-bold">{log.action}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Actor: {log.actorUser.name} ({log.actorUser.email})
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-6 border-t border-[#1c2742]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#18233a] hover:bg-[#202e4d] text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
