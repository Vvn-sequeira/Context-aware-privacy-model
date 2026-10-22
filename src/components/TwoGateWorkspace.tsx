import React, { useState } from 'react';
import {
  AuthSession,
  PipelineExecutionResult,
  Role,
  TestCaseScenario,
} from '../types/jev';
import { TEST_CASES } from '../lib/testCases';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  Layers,
  Terminal,
} from 'lucide-react';

interface TwoGateWorkspaceProps {
  session: AuthSession;
  pipelineResult: PipelineExecutionResult | null;
  isRunning: boolean;
  onRunQuery: (queryText: string, options?: { forceParaphraseTest?: boolean }) => void;
  onSelectTestCase: (testCase: TestCaseScenario) => void;
}

export const TwoGateWorkspace: React.FC<TwoGateWorkspaceProps> = ({
  session,
  pipelineResult,
  isRunning,
  onRunQuery,
  onSelectTestCase,
}) => {
  const [inputText, setInputText] = useState(
    'Rahul Mehta, 42, MRN 4471920, diagnosed with HIV. Started antiretroviral therapy. Lives at 14 MG Road, Bengaluru. Insurance claim pending with Star Health.'
  );
  const [activeSubView, setActiveSubView] = useState<'visual' | 'sanitized' | 'gate2'>('visual');

  const handleTestSelect = (tc: TestCaseScenario) => {
    setInputText(tc.input);
    onSelectTestCase(tc);
  };

  const handleRun = () => {
    onRunQuery(inputText);
  };

  const handleRunParaphraseTest = () => {
    onRunQuery(inputText, { forceParaphraseTest: true });
  };

  return (
    <div className="space-y-6">
      {/* Test Scenarios Strip (From pages 7-8 and 19-20 of guide) */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#b45309] font-medium">
              Reference Evaluation Scenarios
            </span>
            <h3 className="font-serif text-sm font-semibold text-[#1a1915]">
              Select Document Test Case (PS 2.2 Benchmark)
            </h3>
          </div>
          <span className="text-xs text-[#706c62]">
            Click any scenario to load exact input, role, and context
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {TEST_CASES.slice(0, 6).map((tc) => {
            const isCurrent =
              session.role === tc.ctx.role &&
              session.destination === tc.ctx.destination &&
              inputText === tc.input;

            return (
              <button
                type="button"
                key={tc.id}
                onClick={() => handleTestSelect(tc)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#1a1915] bg-[#faf9f5] ring-1 ring-[#1a1915]'
                    : 'border-[#e8e5dc] hover:border-[#cfcbc0] bg-[#fbfaf7]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="font-semibold text-[#1a1915]">{tc.id}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] ${
                      tc.type === 'positive'
                        ? 'bg-emerald-50 text-emerald-800'
                        : tc.type === 'negative'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {tc.ctx.role.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#1a1915] line-clamp-1">
                  {tc.title}
                </div>
                <div className="text-[11px] text-[#706c62] line-clamp-2 mt-1 leading-snug">
                  {tc.expect.expectedActionSummary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Gate Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Input & Gate 1 Inspection (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-[#e5e2da] rounded-xl overflow-hidden shadow-xs">
            {/* Panel Header */}
            <div className="bg-[#faf9f5] border-b border-[#e5e2da] px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#b45309] uppercase tracking-wider block">
                  Gate 1: Inbound Processing
                </span>
                <h3 className="font-serif text-sm font-semibold text-[#1a1915]">
                  User Prompt & Evaluated Spans
                </h3>
              </div>

              {/* Sub-view toggles */}
              <div className="flex items-center gap-1 bg-[#ede9e0] p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveSubView('visual')}
                  className={`px-2.5 py-1 rounded transition-colors text-[11px] cursor-pointer ${
                    activeSubView === 'visual'
                      ? 'bg-white text-[#1a1915] font-medium shadow-xs'
                      : 'text-[#66635a]'
                  }`}
                >
                  Span Chips
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubView('sanitized')}
                  className={`px-2.5 py-1 rounded transition-colors text-[11px] cursor-pointer ${
                    activeSubView === 'sanitized'
                      ? 'bg-white text-[#1a1915] font-medium shadow-xs'
                      : 'text-[#66635a]'
                  }`}
                >
                  Sanitized (To LLM)
                </button>
              </div>
            </div>

            {/* Input textarea or sanitized view */}
            <div className="p-5">
              {activeSubView === 'sanitized' && pipelineResult ? (
                <div>
                  <div className="text-xs text-[#706c62] mb-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>Exact sanitized prompt delivered to the Main LLM:</span>
                  </div>
                  <pre className="p-4 bg-[#faf9f5] border border-[#e8e5dc] rounded-lg text-xs font-mono text-[#1a1915] whitespace-pre-wrap leading-relaxed">
                    {pipelineResult.sanitizedInput}
                  </pre>
                  <p className="text-[11px] text-[#706c62] mt-2">
                    Notice: Raw names, diagnoses, and addresses have been swapped with ephemeral memory tokens.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full p-3 bg-[#faf9f5] border border-[#dcd8ce] rounded-lg text-xs leading-relaxed text-[#1a1915] font-mono focus:outline-none focus:border-[#1a1915] focus:bg-white transition-colors"
                    placeholder="Enter clinical note, transaction record, or confidential query..."
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-[#706c62]">
                      Context: <strong className="text-[#1a1915] font-sans">{session.role.toUpperCase()}</strong> · Purpose: <span className="font-sans italic">{session.purpose}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRunParaphraseTest}
                        disabled={isRunning}
                        className="px-3 py-1.5 bg-[#f3efe6] hover:bg-[#eae5d8] border border-[#dcd8ce] text-[#55524b] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        title="Simulate Main LLM attempting to bypass tokens using paraphrase"
                      >
                        Test Paraphrase Leak
                      </button>

                      <button
                        type="button"
                        onClick={handleRun}
                        disabled={isRunning}
                        className="px-4 py-1.5 bg-[#1a1915] hover:bg-[#33312c] disabled:opacity-50 text-[#faf9f5] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        {isRunning ? 'Evaluating...' : 'Run Gate 1 & 2'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Detected Risks List (Matching Page 17 Example for Billing Clerk) */}
            {pipelineResult && (
              <div className="border-t border-[#e5e2da] p-5 bg-[#fbfaf7]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-[#706c62]">
                    Detected Risks & Gate 1 Policy Actions
                  </h4>
                  <span className="text-[11px] font-mono text-[#8c887e]">
                    {pipelineResult.decisions.filter((d) => d.action === 'MASK').length} masked ·{' '}
                    {pipelineResult.decisions.filter((d) => d.action === 'ALLOW').length} allowed ·{' '}
                    {pipelineResult.decisions.filter((d) => d.action === 'BLOCK').length} blocked
                  </span>
                </div>

                <div className="space-y-2">
                  {pipelineResult.decisions.map((item, idx) => {
                    const isAllow = item.action === 'ALLOW';
                    const isMask = item.action === 'MASK';
                    const isBlock = item.action === 'BLOCK';

                    return (
                      <div
                        key={idx}
                        className="bg-white border border-[#e8e5dc] rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-[#1a1915] truncate">
                              "{item.spanText}"
                            </span>
                            <span className="text-[10px] font-mono text-[#8c887e] uppercase">
                              [{item.category}]
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6e6b62] mt-0.5">
                            {item.judgment.reason}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {/* Chip with both explicit text and color */}
                          <span
                            className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded border ${
                              isAllow
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isMask
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {item.action}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 text-[11px] text-[#706c62] bg-[#f0ede6] p-2.5 rounded-lg font-mono">
                  Action taken:{' '}
                  <strong>
                    {pipelineResult.decisions.filter((d) => d.action === 'MASK').length} items masked
                  </strong>{' '}
                  in volatile memory before sending to model.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Gate 2 Inspection & Final Output (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-[#e5e2da] rounded-xl overflow-hidden shadow-xs">
            {/* Header */}
            <div className="bg-[#faf9f5] border-b border-[#e5e2da] px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#226738] uppercase tracking-wider block">
                  Gate 2: Outbound Inspection & Delivery
                </span>
                <h3 className="font-serif text-sm font-semibold text-[#1a1915]">
                  Model Output & Rehydrated View
                </h3>
              </div>

              {pipelineResult && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  {pipelineResult.gate2Result.passed ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>GATE 2: SECURE</span>
                    </span>
                  ) : (
                    <span className="text-rose-700 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>GATE 2: INTERCEPTED</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Output Panel (Page 17 specification) */}
            <div className="p-5">
              {!pipelineResult ? (
                <div className="py-12 text-center text-[#8c887e]">
                  <p className="text-xs">Awaiting execution. Run pipeline to inspect output.</p>
                </div>
              ) : pipelineResult.isBlocked ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs font-mono">
                  <strong>Blocked: </strong>
                  {pipelineResult.blockedReason}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Gate 2 Interception Alert if any */}
                  {!pipelineResult.gate2Result.passed && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Gate 2 Leak Intercepted & Auto-Redacted</span>
                      </div>
                      {pipelineResult.gate2Result.code_hits.length > 0 && (
                        <div className="text-[11px] text-amber-800 font-mono">
                          Step A Code Matches: {pipelineResult.gate2Result.code_hits.length} raw
                          values found in output.
                        </div>
                      )}
                      {pipelineResult.gate2Result.leaks.length > 0 && (
                        <div className="text-[11px] text-amber-800">
                          Step B JEV Post-Check: Caught paraphrase "
                          <span className="font-semibold underline">
                            {pipelineResult.gate2Result.leaks[0].text}
                          </span>
                          " ({pipelineResult.gate2Result.leaks[0].reason}).
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final rehydrated text shown to this viewer */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#706c62] mb-1.5">
                      <span className="font-medium text-[#1a1915]">
                        Authorized View for [{session.role.toUpperCase()}]:
                      </span>
                      <span className="text-[11px] font-mono">
                        Safe rehydration applied
                      </span>
                    </div>

                    <div className="p-4 bg-[#faf9f5] border border-[#e8e5dc] rounded-lg text-xs font-mono text-[#1a1915] whitespace-pre-wrap leading-relaxed shadow-inner">
                      {pipelineResult.finalViewerOutput}
                    </div>
                  </div>

                  {/* Raw LLM Response vs Sanitized comparison toggle */}
                  <div className="text-[11px] text-[#706c62] pt-2 border-t border-[#f0ede6]">
                    <div className="font-semibold text-[#1a1915] mb-1">Gate 2 Verification Details:</div>
                    <ul className="space-y-1 font-mono text-[10px]">
                      <li>• Step A (Exact/Reformatted Code Search): {pipelineResult.gate2Result.code_hits.length} hits</li>
                      <li>• Step B (JEV Semantic Paraphrase Check): {pipelineResult.gate2Result.jev_verdict}</li>
                      <li>• Rehydration: Only tokens authorized for {session.role} were restored</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Latency timing strip from page 18 */}
            {pipelineResult && (
              <div className="bg-[#faf9f5] border-t border-[#e5e2da] px-5 py-2.5 text-[11px] font-mono text-[#706c62] flex flex-wrap items-center justify-between gap-2">
                <span>LATENCIES:</span>
                <span className="tabular-nums">detect: {pipelineResult.latency_ms.detect}ms</span>
                <span>·</span>
                <span className="tabular-nums">jev_pre: {pipelineResult.latency_ms.jev_pre}ms</span>
                <span>·</span>
                <span className="tabular-nums">llm: {pipelineResult.latency_ms.llm}ms</span>
                <span>·</span>
                <span className="tabular-nums">gate2: {pipelineResult.latency_ms.gate2}ms</span>
                <span>·</span>
                <strong className="text-[#1a1915] tabular-nums">total: {pipelineResult.latency_ms.total}ms</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
