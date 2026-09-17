"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Upload,
  FileSpreadsheet,
  Play,
  Download,
  AlertCircle,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface BatchPersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
}

const SAMPLE_CSV = `name,company,title
Sarah Connor,Cyberdyne Systems,Head of AI
Alex Mercer,BioGen Technologies,Lead Scientist
David Zhao,Zenith Capital,Managing Partner`;

export default function BatchPersonalizationModal({
  isOpen,
  onClose,
  onOpenStudio,
}: BatchPersonalizationModalProps) {
  const [batchName, setBatchName] = useState("Q3 Executive Outreach");
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [detectedVars, setDetectedVars] = useState<string[]>(["name", "company", "title"]);
  const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);

  // Job progress state
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [batchItems, setBatchItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse CSV rows on change
  useEffect(() => {
    try {
      const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(",").map((h) => h.trim());
        setDetectedVars(headers);

        const rows: Array<Record<string, string>> = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(",").map((v) => v.trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            obj[h] = vals[idx] || "";
          });
          rows.push(obj);
        }
        setParsedRows(rows);
      } else {
        setParsedRows([]);
        setDetectedVars([]);
      }
    } catch {
      setParsedRows([]);
    }
  }, [csvText]);

  // Poll status when activeBatchId is set
  useEffect(() => {
    if (!activeBatchId || batchStatus === "completed" || batchStatus === "failed") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v2/batch/${activeBatchId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.batchJob) {
            setBatchStatus(data.batchJob.status);
            setBatchItems(data.batchJob.items || []);
            if (data.batchJob.status === "completed" || data.batchJob.status === "failed") {
              clearInterval(interval);
            }
          }
        }
      } catch (err) {
        console.warn("Polling batch job error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeBatchId, batchStatus]);

  if (!isOpen) return null;

  const handleStartBatch = async () => {
    if (parsedRows.length === 0) {
      setErrorMessage("Please enter or upload valid CSV rows.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setBatchStatus("queued");

    try {
      const res = await fetch("/api/v2/batch/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: batchName,
          csvData: csvText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create batch job");
      }

      setActiveBatchId(data.id);
      setBatchStatus(data.status);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to queue batch job");
      setBatchStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const completedCount = batchItems.filter((item) => item.status === "completed").length;
  const totalCount = batchItems.length || parsedRows.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2742] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Batch Personalization Mode</h3>
              <p className="text-xs text-slate-400">
                Generate 100s of tailored avatar videos from CSV data in parallel
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

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!batchStatus ? (
          <div className="space-y-4">
            {/* Campaign Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Batch Campaign Title
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            {/* Detected Variables Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Detected Personalization Variables
                </label>
                <button
                  onClick={() => setCsvText(SAMPLE_CSV)}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer font-semibold"
                >
                  Load Sample CSV
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detectedVars.map((v) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold rounded-lg"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            {/* CSV Data / File Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  CSV Input (Headers + Rows)
                </label>
                <label className="text-[11px] text-slate-400 hover:text-white cursor-pointer flex items-center gap-1">
                  <Upload size={12} />
                  <span>Upload .csv File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={5}
                className="w-full bg-[#121828] border border-[#202c49] rounded-2xl p-3 text-xs text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-cyan-500"
                placeholder="name,company,title&#10;Alice,Acme,CEO"
              />
            </div>

            {/* Table Preview */}
            {parsedRows.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1.5">
                  Parsed Data Preview ({parsedRows.length} Rows)
                </span>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-[#1e2a44] bg-[#0c111e]">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#151f36] text-slate-300 sticky top-0">
                      <tr>
                        <th className="p-2 border-b border-[#22304f]">#</th>
                        {detectedVars.map((h) => (
                          <th key={h} className="p-2 border-b border-[#22304f] font-mono">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#17223b] text-slate-300">
                      {parsedRows.map((row, i) => (
                        <tr key={i} className="hover:bg-[#111827]">
                          <td className="p-2 text-slate-500">{i + 1}</td>
                          {detectedVars.map((h) => (
                            <td key={h} className="p-2 truncate max-w-[140px]">
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Live Progress & Multi-Video List */
          <div className="py-4 space-y-6">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                {batchStatus === "completed" ? (
                  <Check size={24} className="text-emerald-400" />
                ) : (
                  <RefreshCw size={20} className="animate-spin text-cyan-400" />
                )}
              </div>
              <h4 className="text-base font-bold text-white">
                {batchStatus === "completed"
                  ? "Batch Generation Complete!"
                  : `Generating Batch: ${completedCount} / ${totalCount} Videos`}
              </h4>
              <p className="text-xs text-slate-400">
                {batchStatus === "completed"
                  ? "All personalized videos rendered and ready for download"
                  : "Parallel workers generating audio and composing personalized frames..."}
              </p>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Campaign Render Progress</span>
                <span className="text-cyan-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-[#161f35] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Individual Video Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {batchItems.map((item, idx) => {
                let vars: Record<string, string> = {};
                try {
                  vars = JSON.parse(item.variablesJson);
                } catch {}

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-[#111728] border border-[#1e2a44] rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-white truncate">
                          {vars.name || `Recipient ${idx + 1}`}{" "}
                          {vars.company && (
                            <span className="text-slate-400 font-normal">({vars.company})</span>
                          )}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {item.outputVideoUrl ? item.outputVideoUrl : "Rendering scene frames..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === "completed" && item.outputVideoUrl ? (
                        <>
                          <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                            Ready
                          </span>
                          <a
                            href={item.outputVideoUrl}
                            download
                            className="p-1.5 bg-[#1a253e] hover:bg-cyan-500 hover:text-slate-950 rounded-lg text-slate-300 transition-colors"
                            title="Download Video"
                          >
                            <Download size={13} />
                          </a>
                        </>
                      ) : item.status === "failed" ? (
                        <span className="text-[10px] bg-red-500/15 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-md font-bold">
                          Failed
                        </span>
                      ) : (
                        <span className="text-[10px] bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                          <RefreshCw size={10} className="animate-spin" />
                          <span>Rendering</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#1c2742]">
          <span className="text-[11px] text-slate-400">
            {parsedRows.length} Videos • {parsedRows.length * 10} Credits total
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a] cursor-pointer"
            >
              {batchStatus === "completed" ? "Close" : "Cancel"}
            </button>
            {!batchStatus ? (
              <button
                onClick={handleStartBatch}
                disabled={isSubmitting || parsedRows.length === 0}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Queueing Batch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Generate Batch ({parsedRows.length})</span>
                  </>
                )}
              </button>
            ) : batchStatus === "completed" ? (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Done
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2 bg-[#18233a] text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed flex items-center gap-1.5"
              >
                <RefreshCw size={13} className="animate-spin text-cyan-400" />
                <span>Processing Batch...</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
