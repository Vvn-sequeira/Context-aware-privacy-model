import React from 'react';
import { Role } from '../types/jev';
import { DEFAULT_POLICY_TABLE } from '../lib/policy';
import { ShieldCheck, Code, Check, ShieldAlert } from 'lucide-react';

interface PolicyMatrixViewProps {
  currentRole: Role;
}

export const PolicyMatrixView: React.FC<PolicyMatrixViewProps> = ({ currentRole }) => {
  const rows = [
    {
      category: 'Patient name, MRN (identifier)',
      doctor: 'ALLOW',
      billing: 'ALLOW',
      researcher: 'MASK',
      support_agent: 'MASK',
      developer: 'MASK',
      external: 'MASK',
      note: 'Doctors and billing staff need patient identity for care/claims; researchers receive de-identified cohorts.',
    },
    {
      category: 'Diagnosis tied to a person (health)',
      doctor: 'ALLOW',
      billing: 'MASK',
      researcher: 'MASK',
      support_agent: 'BLOCK',
      developer: 'BLOCK',
      external: 'BLOCK',
      note: 'Treating physicians need diagnosis for clinical rounds. Billing & external destinations are prohibited.',
    },
    {
      category: 'Residential Address (identifier)',
      doctor: 'ALLOW',
      billing: 'MASK',
      researcher: 'BLOCK',
      support_agent: 'MASK',
      developer: 'MASK',
      external: 'BLOCK',
      note: 'Home address is not required for insurance claims or statistical research.',
    },
    {
      category: 'Account number (financial)',
      doctor: 'MASK',
      billing: 'MASK',
      researcher: 'BLOCK',
      support_agent: 'MASK',
      developer: 'BLOCK',
      external: 'BLOCK',
      note: 'Financial account numbers partially masked to retain only last 4 digits.',
    },
    {
      category: 'API key, password (credential)',
      doctor: 'BLOCK',
      billing: 'BLOCK',
      researcher: 'BLOCK',
      support_agent: 'BLOCK',
      developer: 'BLOCK',
      external: 'BLOCK',
      note: 'Always sensitive. Zero tolerance across all roles and external endpoints.',
    },
    {
      category: 'Salary of a named person (hr)',
      doctor: 'MASK',
      billing: 'MASK',
      researcher: 'MASK',
      support_agent: 'MASK',
      developer: 'BLOCK',
      external: 'BLOCK',
      note: 'Individual compensation is private. General salary bands without a named person are relaxed to ALLOW.',
    },
  ];

  const getActionBadge = (action: string) => {
    if (action === 'ALLOW') {
      return (
        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
          ALLOW
        </span>
      );
    }
    if (action.startsWith('MASK')) {
      return (
        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
          {action}
        </span>
      );
    }
    return (
      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
        BLOCK
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-6">
        <div className="max-w-3xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#b45309] font-medium">
            Deterministic Decision Engine
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1a1915] mt-1">
            Policy Table & Contextual Resolution Matrix
          </h2>
          <p className="text-xs text-[#66635a] mt-2 leading-relaxed">
            "JEV judges, code decides. The model supplies facts about the text; the final action
            always comes from the policy table." Decisions are computed deterministically in code,
            making them 100% testable, predictable, and immune to prompt injection attacks.
          </p>
        </div>
      </div>

      {/* The Matrix Table */}
      <div className="bg-white border border-[#e5e2da] rounded-xl overflow-hidden shadow-xs">
        <div className="bg-[#faf9f5] border-b border-[#e5e2da] px-6 py-3 flex items-center justify-between">
          <h3 className="font-serif text-sm font-semibold text-[#1a1915]">
            Role-Based Action Mapping (ALLOW &lt; MASK &lt; BLOCK)
          </h3>
          <span className="text-xs text-[#706c62] font-mono">
            Active Session Role: <strong className="text-[#1a1915] font-sans">[{currentRole.toUpperCase()}]</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e5e2da] bg-[#fbfaf7] text-[#706c62] font-mono text-[11px] uppercase">
                <th className="py-3 px-4 font-medium">Data Category</th>
                <th
                  className={`py-3 px-4 font-medium ${
                    currentRole === 'doctor' ? 'bg-[#ede9e0] text-[#1a1915] font-bold' : ''
                  }`}
                >
                  Doctor (Care)
                </th>
                <th
                  className={`py-3 px-4 font-medium ${
                    currentRole === 'billing' ? 'bg-[#ede9e0] text-[#1a1915] font-bold' : ''
                  }`}
                >
                  Billing Clerk
                </th>
                <th
                  className={`py-3 px-4 font-medium ${
                    currentRole === 'researcher' ? 'bg-[#ede9e0] text-[#1a1915] font-bold' : ''
                  }`}
                >
                  Researcher
                </th>
                <th
                  className={`py-3 px-4 font-medium ${
                    currentRole === 'support_agent' ? 'bg-[#ede9e0] text-[#1a1915] font-bold' : ''
                  }`}
                >
                  Banking Agent
                </th>
                <th
                  className={`py-3 px-4 font-medium ${
                    currentRole === 'developer' ? 'bg-[#ede9e0] text-[#1a1915] font-bold' : ''
                  }`}
                >
                  Developer
                </th>
                <th className="py-3 px-4 font-medium bg-amber-50/60 text-amber-900">
                  External Dest
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#faf9f5] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#1a1915]">
                    <div>{row.category}</div>
                    <div className="text-[10px] text-[#8c887e] font-normal mt-0.5">{row.note}</div>
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      currentRole === 'doctor' ? 'bg-[#f7f5ef] font-semibold' : ''
                    }`}
                  >
                    {getActionBadge(row.doctor)}
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      currentRole === 'billing' ? 'bg-[#f7f5ef] font-semibold' : ''
                    }`}
                  >
                    {getActionBadge(row.billing)}
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      currentRole === 'researcher' ? 'bg-[#f7f5ef] font-semibold' : ''
                    }`}
                  >
                    {getActionBadge(row.researcher)}
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      currentRole === 'support_agent' ? 'bg-[#f7f5ef] font-semibold' : ''
                    }`}
                  >
                    {getActionBadge(row.support_agent)}
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      currentRole === 'developer' ? 'bg-[#f7f5ef] font-semibold' : ''
                    }`}
                  >
                    {getActionBadge(row.developer)}
                  </td>
                  <td className="py-3 px-4 bg-amber-50/40">
                    {getActionBadge(row.external)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Logic Reference (Directly from Page 9 of the Guide) */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-[#b45309]" />
          <h4 className="font-serif text-sm font-semibold text-[#1a1915]">
            Reference Decision Logic in Code (JEV Developer Guide Page 9)
          </h4>
        </div>
        <pre className="p-4 bg-[#faf9f5] border border-[#e8e5dc] rounded-lg text-xs font-mono text-[#1a1915] overflow-x-auto leading-relaxed">
{`ORDER = {"ALLOW": 0, "MASK": 1, "BLOCK": 2}
ALWAYS_SENSITIVE = {"credential"}

def decide(j, ctx, table):
    row = table.get(j["category"], {})
    base = row.get(ctx["role"], "MASK")     # fail closed
    dest = row.get("external", "MASK") if ctx["destination"] == "external" else "ALLOW"
    action = max(base, dest, key=ORDER.get)

    # Tighten: if JEV says span is not needed for the task
    if not j["needed_for_task"] and action == "ALLOW":
        action = "MASK"

    # Relax: if general knowledge or public info not tied to a specific person
    if not j["about_specific_person"] and j["category"] not in ALWAYS_SENSITIVE:
        action = "ALLOW"

    return action`}
        </pre>
      </div>
    </div>
  );
};
