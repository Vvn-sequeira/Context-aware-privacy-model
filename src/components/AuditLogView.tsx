import React, { useState } from 'react';
import { AuditRecord } from '../types/jev';
import { FileText, ShieldAlert, CheckCircle, Clock, Eye, Copy, Check } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditRecord[];
  onClearLogs: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onClearLogs }) => {
  const [selectedLog, setSelectedLog] = useState<AuditRecord | null>(logs[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (log: AuditRecord) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#b45309] font-medium">
              Compliance & Security Verification
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1a1915] mt-1">
              Zero-Leak Masked Audit Log
            </h2>
            <p className="text-xs text-[#66635a] mt-1 leading-relaxed max-w-2xl">
              "A log that stores the raw secret creates a new leak." Every transaction is logged
              with masked tokens only, paired with the exact JEV reason, policy decision, Gate 2
              verdict, and stage latencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#706c62]">
              {logs.length} logged records
            </span>
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-xs text-[#b45309] hover:underline cursor-pointer"
              >
                Clear Log History
              </button>
            )}
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white border border-[#e5e2da] rounded-xl p-10 text-center text-[#706c62]">
          <FileText className="w-8 h-8 mx-auto mb-2 text-[#8c887e]" />
          <h3 className="font-serif text-sm font-semibold text-[#1a1915]">
            No Audit Records Yet
          </h3>
          <p className="text-xs text-[#706c62] mt-1">
            Run requests through the gateway to generate immutable compliance records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Logs List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {logs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              const hasMask = log.spans.some((s) => s.action === 'MASK');
              const hasBlock = log.spans.some((s) => s.action === 'BLOCK');

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'border-[#1a1915] ring-1 ring-[#1a1915] shadow-xs'
                      : 'border-[#e8e5dc] hover:border-[#cfcbc0]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#706c62] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1a1915]">{log.id}</span>
                      <span>·</span>
                      <span>{new Date(log.time).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#f0ede6] text-[#1a1915] font-medium">
                        {log.role.toUpperCase()}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          log.destination === 'external'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {log.destination.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#1a1915] font-medium line-clamp-1 mb-2">
                    Purpose: <span className="font-normal text-[#55524b]">{log.purpose}</span>
                  </div>

                  {/* Masked spans count */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#f0ede6] text-[11px] font-mono">
                    {log.spans.map((s, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded border ${
                          s.action === 'ALLOW'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : s.action === 'MASK'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {s.masked}: {s.action}
                      </span>
                    ))}

                    <span className="ml-auto text-[#8c887e]">
                      Gate2: {log.gate2.jev_verdict} ({log.gate2.code_hits} hits)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Log Detail Inspector (5 cols) */}
          <div className="lg:col-span-5">
            {selectedLog && (
              <div className="bg-white border border-[#e5e2da] rounded-xl overflow-hidden sticky top-20 shadow-xs">
                <div className="bg-[#faf9f5] border-b border-[#e5e2da] px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#706c62] block">
                      Audit Record Inspector
                    </span>
                    <h3 className="font-serif text-sm font-semibold text-[#1a1915]">
                      {selectedLog.id}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy(selectedLog)}
                    className="p-1.5 hover:bg-[#ede9e0] rounded text-[#706c62] transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Copy audit JSON"
                  >
                    {copiedId === selectedLog.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-mono">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-mono">JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#8c887e] block mb-1">
                      Raw Audit Record (Page 18 Spec)
                    </span>
                    <pre className="p-3 bg-[#faf9f5] border border-[#e8e5dc] rounded-lg text-[11px] font-mono text-[#1a1915] overflow-x-auto leading-relaxed max-h-72">
{JSON.stringify(
  {
    time: selectedLog.time,
    hospital: selectedLog.hospital,
    role: selectedLog.role,
    purpose: selectedLog.purpose,
    destination: selectedLog.destination,
    spans: selectedLog.spans,
    gate2: selectedLog.gate2,
    latency_ms: selectedLog.latency_ms,
  },
  null,
  2
)}
                    </pre>
                  </div>

                  <div className="bg-[#fbfaf7] border border-[#e8e5dc] rounded-lg p-3 text-[11px] text-[#6e6b62] space-y-1">
                    <div className="font-medium text-[#1a1915] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>Latency Breakdown</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 font-mono text-[10px]">
                      <div>Detect: {selectedLog.latency_ms.detect}ms</div>
                      <div>JEV Pre: {selectedLog.latency_ms.jev_pre}ms</div>
                      <div>Main LLM: {selectedLog.latency_ms.llm}ms</div>
                      <div>Gate 2: {selectedLog.latency_ms.gate2}ms</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
