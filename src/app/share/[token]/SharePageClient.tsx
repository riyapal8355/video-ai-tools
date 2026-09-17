"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Clock, Film } from "lucide-react";

interface SharePageClientProps {
  projectId: string;
  projectName: string;
  videoUrl: string | null;
  scenes: any[];
  initialComments: any[];
}

export default function SharePageClient({
  projectId,
  projectName,
  videoUrl,
  scenes,
  initialComments,
}: SharePageClientProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v2/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          sceneIndex: selectedSceneIndex,
          timestampMs: selectedSceneIndex * 5000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Post comment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Columns: Video Player & Scenes */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-[#1e2a44] shadow-2xl relative flex items-center justify-center">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-8 space-y-2">
              <Film size={36} className="mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-white">Project Draft Preview</h4>
              <p className="text-xs text-slate-400">
                This project has {scenes.length} configured scenes. Final render is pending.
              </p>
            </div>
          )}
        </div>

        {/* Scene Cards Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Storyline Scenes ({scenes.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scenes.map((sc, i) => (
              <div
                key={sc.id}
                onClick={() => setSelectedSceneIndex(i)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedSceneIndex === i
                    ? "bg-cyan-500/10 border-cyan-500 shadow-md"
                    : "bg-[#0d1222] border-[#1e2a44] hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-white">Scene {i + 1}</span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock size={11} />
                    <span>{sc.durationSeconds}s</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {sc.scriptText || "(No script dialog)"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Comments Drawer */}
      <div className="space-y-4 bg-[#0c111e] border border-[#1e2a44] rounded-3xl p-5 flex flex-col h-[640px]">
        <div className="flex items-center justify-between pb-3 border-b border-[#18233b]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-cyan-400" />
            <span>Feedback & Comments ({comments.length})</span>
          </h3>
          <span className="text-[10px] bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
            Scene {selectedSceneIndex + 1}
          </span>
        </div>

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No comments yet. Leave the first feedback note on this scene!
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-[#111728] border border-[#1e2a44] rounded-2xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-cyan-400">{c.user?.name || "Guest"}</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    Scene {c.sceneIndex + 1}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{c.content}</p>
                <span className="text-[9px] text-slate-500 block pt-1">
                  {new Date(c.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* New Comment Input */}
        <div className="pt-3 border-t border-[#18233b] space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            placeholder={`Add a comment on Scene ${selectedSceneIndex + 1}...`}
            className="w-full bg-[#121828] border border-[#202c49] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
          />
          <button
            onClick={handlePostComment}
            disabled={isSubmitting || !newComment.trim()}
            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send size={13} />
            <span>Post Feedback</span>
          </button>
        </div>
      </div>
    </div>
  );
}
