"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Bot, MessageSquare } from "lucide-react";

export default function AskRhysWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; text: string }[]>([
    {
      role: "assistant",
      text: "Hi Riya! I'm Rhys, your AI Video Copilot. How can I help you create your next viral video today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Great idea! For "${userMsg}", I can generate a 30-second high-conversion script and recommend the best avatar tone. Should we open the AI Studio editor?`,
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Top Right Header Pill */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 bg-[#121829] hover:bg-[#182138] border border-[#222f4c] hover:border-[#32456e] px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-md group cursor-pointer"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#0c1220]">
            👨‍💻
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0c1220]"></span>
        </div>
        <span className="text-xs font-medium text-slate-200 group-hover:text-white">
          Ask Rhys
        </span>
      </button>

      {/* AI Copilot Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md h-[600px] bg-[#0c111e] border border-[#222f4d] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#121829] border-b border-[#202c49] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    👨‍💻
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0c111e]"></span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    Rhys AI Copilot <Sparkles size={14} className="text-cyan-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400">Your AI Video & Script Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a233a]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 text-xs">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                        : "bg-[#141b2e] border border-[#233152] text-slate-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="px-4 py-2 border-t border-[#1a243d] flex gap-1.5 overflow-x-auto">
              {["Generate TikTok Script", "Suggest Avatars", "Translate video"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setInput(chip);
                  }}
                  className="text-[10px] bg-[#141d31] hover:bg-[#1f2c4a] text-blue-300 border border-blue-900/40 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#101625] border-t border-[#1a243d] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Rhys to write a script or build a video..."
                className="flex-1 bg-[#151c2e] border border-[#23304e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors shadow-md shadow-blue-600/20"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
