import React from 'react';
import { AuthSession, Role, Destination } from '../types/jev';
import { Building2, ShieldAlert, Cpu } from 'lucide-react';

interface ContextBarProps {
  session: AuthSession;
  onUpdateSession: (updated: Partial<AuthSession>) => void;
  onRunPipeline: () => void;
  isRunning: boolean;
}

const ROLES: Array<{ id: Role; label: string }> = [
  { id: 'doctor', label: 'Doctor (Care)' },
  { id: 'billing', label: 'Billing Clerk' },
  { id: 'researcher', label: 'Researcher (Stats)' },
  { id: 'support_agent', label: 'Banking Agent' },
  { id: 'developer', label: 'Developer / IT' },
];

export const ContextBar: React.FC<ContextBarProps> = ({
  session,
  onUpdateSession,
  onRunPipeline,
  isRunning,
}) => {
  return (
    <div className="bg-white border-b border-[#e5e2da] px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side: Hospital and Authenticated Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-[#1a1915]">
            <Building2 className="w-3.5 h-3.5 text-[#8c887e]" />
            <span className="font-serif">{session.hospitalName}</span>
          </div>

          <span className="text-[#d0ccc2]">·</span>

          {/* Role Dropdown (The Demo Moment: Switch role to see actions flip immediately!) */}
          <div className="flex items-center gap-2">
            <span className="text-[#706c62] uppercase tracking-wider text-[11px] font-mono">
              Role:
            </span>
            <select
              value={session.role}
              onChange={(e) => {
                const nextRole = e.target.value as Role;
                let nextPurpose = session.purpose;
                if (nextRole === 'doctor') nextPurpose = "Summarize Rahul's history for tomorrow's rounds";
                else if (nextRole === 'billing') nextPurpose = 'Draft the insurance claim letter for Rahul Mehta';
                else if (nextRole === 'researcher') nextPurpose = 'How many patients started ART this year?';
                else if (nextRole === 'developer') nextPurpose = 'Debug database connection logs and auth errors';
                else if (nextRole === 'support_agent') nextPurpose = 'Explain loan rejection reason for customer';
                onUpdateSession({ role: nextRole, purpose: nextPurpose });
              }}
              className="px-2.5 py-1 bg-[#faf9f5] border border-[#dcd8ce] rounded-md font-medium text-xs text-[#1a1915] focus:outline-none focus:border-[#1a1915]"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#d0ccc2]">·</span>

          {/* Operational Purpose Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-[#706c62] uppercase tracking-wider text-[11px] font-mono">
              Purpose:
            </span>
            <input
              type="text"
              value={session.purpose}
              onChange={(e) => onUpdateSession({ purpose: e.target.value })}
              className="px-2 py-1 bg-[#faf9f5] border border-[#dcd8ce] rounded-md text-xs text-[#1a1915] w-full max-w-sm focus:outline-none focus:border-[#1a1915]"
              placeholder="Operational reason for AI request"
            />
          </div>

          <span className="text-[#d0ccc2]">·</span>

          {/* Destination Segmented Control */}
          <div className="flex items-center gap-2">
            <span className="text-[#706c62] uppercase tracking-wider text-[11px] font-mono">
              Dest:
            </span>
            <div className="flex items-center gap-0.5 bg-[#f0ede6] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => onUpdateSession({ destination: 'internal' as Destination })}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                  session.destination === 'internal'
                    ? 'bg-white text-[#1a1915] font-semibold shadow-xs'
                    : 'text-[#66635a] hover:text-[#1a1915]'
                }`}
              >
                Internal
              </button>
              <button
                type="button"
                onClick={() => onUpdateSession({ destination: 'external' as Destination })}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                  session.destination === 'external'
                    ? 'bg-amber-100 text-amber-900 font-semibold shadow-xs'
                    : 'text-[#66635a] hover:text-[#1a1915]'
                }`}
              >
                External
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Execution Trigger */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#8c887e]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#b45309]" />
            <span>Two-Gate Enforcement Active</span>
          </div>

          <button
            onClick={onRunPipeline}
            disabled={isRunning}
            className="px-4 py-1.5 bg-[#1a1915] hover:bg-[#33312c] disabled:opacity-50 text-[#faf9f5] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isRunning ? 'Processing Gates...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
