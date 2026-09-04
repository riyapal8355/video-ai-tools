"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  User,
  Settings,
  CreditCard,
  Key,
  Shield,
  Sparkles,
  ChevronRight,
  Gem,
} from "lucide-react";

interface UserMenuDropdownProps {
  placement?: "left-rail" | "top-bar";
}

export default function UserMenuDropdown({ placement = "left-rail" }: UserMenuDropdownProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center font-bold text-white text-base shadow-md border-2 border-[#1e2a44] hover:border-purple-400 hover:scale-105 transition-all cursor-pointer"
        title={`${user.name} (${user.email})`}
      >
        {user.avatarInitial}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            placement === "left-rail"
              ? "left-14 bottom-0"
              : "right-0 top-12"
          } w-72 bg-[#0d1222] border border-[#22304f] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl`}
        >
          {/* User Header */}
          <div className="p-3 bg-[#131b2e] rounded-xl border border-[#1f2c49] mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base ring-2 ring-purple-400/30">
                {user.avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  {user.name}
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 font-medium">
                    {user.plan}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Credits bar */}
            <div className="mt-3 pt-2.5 border-t border-[#1c2843]">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 text-amber-300">
                  <Gem size={12} /> AI Credits
                </span>
                <span className="text-white font-bold">
                  {user.credits} / {user.maxCredits}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#1a253c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-purple-500"
                  style={{ width: `${(user.credits / user.maxCredits) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-0.5 text-xs text-slate-300">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#162035] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <User size={15} className="text-slate-400" /> Account Profile
              </span>
              <ChevronRight size={13} className="text-slate-500" />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#162035] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <CreditCard size={15} className="text-slate-400" /> Subscription & Billing
              </span>
              <ChevronRight size={13} className="text-slate-500" />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#162035] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Key size={15} className="text-slate-400" /> API Keys & Webhooks
              </span>
              <ChevronRight size={13} className="text-slate-500" />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#162035] hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Settings size={15} className="text-slate-400" /> Workspace Settings
              </span>
              <ChevronRight size={13} className="text-slate-500" />
            </button>
          </div>

          <div className="my-1.5 h-[1px] bg-[#1a253c]"></div>

          {/* Logout Action */}
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs font-semibold cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out / Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
