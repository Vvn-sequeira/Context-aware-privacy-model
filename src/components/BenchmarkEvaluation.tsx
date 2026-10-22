import React from 'react';
import { BENCHMARK_RESULTS } from '../lib/benchmark';
import { BarChart3, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export const BenchmarkEvaluation: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-6">
        <div className="max-w-3xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#b45309] font-medium">
            Empirical Evaluation Plan (PS 2.2 Requirement)
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1a1915] mt-1">
            Comparative Benchmark: Four Architecture Evaluation
          </h2>
          <p className="text-xs text-[#66635a] mt-2 leading-relaxed">
            "Both error rates are needed. A system that blocks everything scores a zero leak rate
            and is useless; a system that allows everything scores a zero over-block rate and is unsafe."
            Here is the comparative performance across the labelled 60-case benchmark test suite.
          </p>
        </div>
      </div>

      {/* Main Benchmark Table */}
      <div className="bg-white border border-[#e5e2da] rounded-xl overflow-hidden shadow-xs">
        <div className="bg-[#faf9f5] border-b border-[#e5e2da] px-6 py-3 flex items-center justify-between">
          <h3 className="font-serif text-sm font-semibold text-[#1a1915]">
            Architectural System Comparison
          </h3>
          <span className="text-xs text-[#706c62] font-mono">
            Labelled Evaluation Set: 60 Multidomain Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e5e2da] bg-[#fbfaf7] text-[#706c62] font-mono text-[11px] uppercase">
                <th className="py-3 px-4 font-medium">System Architecture</th>
                <th className="py-3 px-4 font-medium">Leak Rate (Lower is Better)</th>
                <th className="py-3 px-4 font-medium">Over-Block Rate (Lower is Better)</th>
                <th className="py-3 px-4 font-medium">Avg Latency</th>
                <th className="py-3 px-4 font-medium">JSON Validity</th>
                <th className="py-3 px-4 font-medium">Core Vulnerability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {BENCHMARK_RESULTS.map((res, idx) => {
                const isJev = res.systemName.includes('JEV');

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isJev ? 'bg-amber-50/25 font-medium' : 'hover:bg-[#faf9f5]'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-[#1a1915]">
                      <div className="font-semibold flex items-center gap-1.5">
                        {isJev && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                        <span>{res.systemName}</span>
                      </div>
                      <div className="text-[10px] text-[#706c62] font-normal">{res.architecture}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold tabular-nums ${
                            res.leakRate < 5
                              ? 'text-emerald-700'
                              : res.leakRate > 40
                              ? 'text-rose-700'
                              : 'text-amber-800'
                          }`}
                        >
                          {res.leakRate.toFixed(1)}%
                        </span>
                        <div className="w-16 h-1.5 bg-[#eae7de] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              res.leakRate < 5 ? 'bg-emerald-600' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(res.leakRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold tabular-nums ${
                            res.overBlockRate < 5
                              ? 'text-emerald-700'
                              : res.overBlockRate > 30
                              ? 'text-rose-700'
                              : 'text-amber-800'
                          }`}
                        >
                          {res.overBlockRate.toFixed(1)}%
                        </span>
                        <div className="w-16 h-1.5 bg-[#eae7de] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              res.overBlockRate < 5 ? 'bg-emerald-600' : 'bg-amber-600'
                            }`}
                            style={{ width: `${Math.min(res.overBlockRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#1a1915] tabular-nums">
                      {res.avgLatencyMs.toFixed(1)}ms
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#1a1915] tabular-nums">
                      {res.jsonValidityRate.toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[#66635a] max-w-xs">
                      {res.vulnerability}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Selection Sizing Rationale (Page 11-12 of Guide) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e5e2da] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#b45309]" />
            <h4 className="font-serif text-sm font-semibold text-[#1a1915]">
              Why a Small Model (4B - 8B) for JEV Judge
            </h4>
          </div>
          <p className="text-xs text-[#66635a] leading-relaxed">
            "JEV runs at least twice per request, so it must be cheap and quick. The job is narrow:
            classify one span and emit a few dozen tokens of structured JSON. A small model, run locally
            or near edge, handles that in ~40ms without expensive cloud round-trips."
          </p>
        </div>

        <div className="bg-white border border-[#e5e2da] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-[#b45309]" />
            <h4 className="font-serif text-sm font-semibold text-[#1a1915]">
              Why Prompts Alone Are Not Privacy Systems
            </h4>
          </div>
          <p className="text-xs text-[#66635a] leading-relaxed">
            "The leak happens before the prompt. If raw data is sent to the model, it has already been
            exposed, whatever the prompt says. Prompts are not guarantees—injection and probabilistic
            generation can leak data at any time. Role checks must run in verifiable code."
          </p>
        </div>
      </div>
    </div>
  );
};
