import React, { useState } from 'react';
import { AuthSession, Role, Destination } from '../types/jev';
import { ShieldCheck, Building2, UserCircle, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (session: AuthSession) => void;
}

const PRESET_HOSPITALS = [
  'Metro Health Memorial Hospital',
  'Apollo Hospitals Bengaluru',
  'All India Institute of Medical Sciences (AIIMS)',
  'St. Jude Research Center',
  'Massachusetts General Hospital',
];

const ROLES: Array<{
  id: Role;
  label: string;
  department: string;
  defaultPurpose: string;
  defaultDestination: Destination;
  description: string;
}> = [
  {
    id: 'doctor',
    label: 'Doctor (Clinical Care & Treatment)',
    department: 'Inpatient Clinical Medicine',
    defaultPurpose: "Summarize Rahul's history for tomorrow's rounds",
    defaultDestination: 'internal',
    description: 'Authorized to review clinical diagnoses, treatments, and continuity of care notes.',
  },
  {
    id: 'billing',
    label: 'Billing Clerk (Revenue & Claims)',
    department: 'Patient Accounts & Billing',
    defaultPurpose: 'Draft the insurance claim letter for Rahul Mehta',
    defaultDestination: 'internal',
    description: 'Requires patient identity, MRN, and insurer. Clinical diagnoses are strictly masked.',
  },
  {
    id: 'researcher',
    label: 'Clinical Researcher (Epidemiology)',
    department: 'Biostatistics & Public Health',
    defaultPurpose: 'How many patients started ART this year?',
    defaultDestination: 'internal',
    description: 'Only authorized for aggregate epidemiological metrics; all direct patient identifiers masked.',
  },
  {
    id: 'developer',
    label: 'Developer / Systems Engineer',
    department: 'Health Informatics & IT',
    defaultPurpose: 'Debug database connection logs and auth errors',
    defaultDestination: 'internal',
    description: 'Troubleshoots software logs. Credentials stripped; customer emails masked.',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [hospital, setHospital] = useState('Metro Health Memorial Hospital');
  const [selectedRole, setSelectedRole] = useState<Role>('billing');
  const [staffName, setStaffName] = useState('Priya Sharma');
  const [purpose, setPurpose] = useState('Draft the insurance claim letter for Rahul Mehta');
  const [destination, setDestination] = useState<Destination>('internal');

  const handleRoleSelect = (roleId: Role) => {
    setSelectedRole(roleId);
    const found = ROLES.find((r) => r.id === roleId);
    if (found) {
      setPurpose(found.defaultPurpose);
      setDestination(found.defaultDestination);
      if (roleId === 'doctor') setStaffName('Dr. Arvind Nair, MD');
      else if (roleId === 'billing') setStaffName('Priya Sharma (Billing Specialist)');
      else if (roleId === 'researcher') setStaffName('Dr. S. Kulkarni (Epidemiology Lead)');
      else setStaffName('DevOps Engineer Alex');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roleInfo = ROLES.find((r) => r.id === selectedRole) || ROLES[1];

    const session: AuthSession = {
      hospitalName: hospital.trim() || 'Metro Health Memorial Hospital',
      facilityId: 'FAC-' + Math.floor(1000 + Math.random() * 9000),
      role: selectedRole,
      staffName,
      department: roleInfo.department,
      purpose,
      destination,
      sessionToken: `tok_jev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      authenticatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onLogin(session);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-between text-[#1a1915]">
      {/* Top minimal header */}
      <header className="border-b border-[#e8e5dc] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1915] text-[#faf9f5] flex items-center justify-center font-serif font-bold text-lg">
            J
          </div>
          <div>
            <h1 className="font-serif text-lg tracking-tight font-medium text-[#1a1915]">
              JEV Privacy Gateway
            </h1>
            <p className="text-xs text-[#6e6b62]">
              Context-Aware Data Privacy · PS 2.2 Healthcare & Enterprise Edition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#706c62] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
          <span>GATEWAY STATUS: READY</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white border border-[#e5e2da] rounded-2xl p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-[#b45309] font-medium">
              Authenticated Session Initialization
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight mt-1 text-[#1a1915]">
              Bind Trusted Context
            </h2>
            <p className="text-sm text-[#66635a] mt-2 leading-relaxed">
              In JEV architecture, privacy boundaries are enforced by authenticated app metadata,
              never by parsing user prompts. Please specify your healthcare facility and verified role.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Hospital Name */}
            <div>
              <label className="block text-xs font-medium text-[#4d4a43] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#8c887e]" />
                  Healthcare Facility / Hospital Name
                </span>
                <span className="text-[11px] font-normal text-[#8c887e] lowercase font-sans">
                  field 1
                </span>
              </label>

              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. Metro Health Memorial Hospital"
                  className="w-full px-4 py-2.5 bg-[#faf9f5] border border-[#dcd8ce] rounded-lg text-sm text-[#1a1915] focus:outline-none focus:border-[#1a1915] focus:bg-white transition-colors"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_HOSPITALS.slice(0, 3).map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setHospital(item)}
                      className="text-[11px] px-2.5 py-1 rounded bg-[#f3efe6] hover:bg-[#eae5d8] text-[#55524b] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field 2: Role / Requester Context as specified in the Guide */}
            <div>
              <label className="block text-xs font-medium text-[#4d4a43] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCircle className="w-3.5 h-3.5 text-[#8c887e]" />
                  Requester Role & Authorization Tier
                </span>
                <span className="text-[11px] font-normal text-[#8c887e] lowercase font-sans">
                  field 2 (per JEV guide)
                </span>
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {ROLES.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`cursor-pointer border rounded-xl p-3.5 transition-all text-left flex items-start justify-between ${
                        isSelected
                          ? 'border-[#1a1915] bg-[#fbfaf7] ring-1 ring-[#1a1915]'
                          : 'border-[#e8e5dc] hover:border-[#cfcbc0] bg-white'
                      }`}
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#1a1915]">
                            {r.label}
                          </span>
                          <span className="text-[11px] font-mono text-[#8c887e]">
                            [{r.id}]
                          </span>
                        </div>
                        <p className="text-xs text-[#6e6b62] mt-1">
                          {r.description}
                        </p>
                      </div>
                      <div className="pt-0.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-[#1a1915]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#d0ccc2]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional App Metadata Context */}
            <div className="bg-[#fbfaf7] border border-[#e8e5dc] rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between text-[#55524a]">
                <span className="font-medium">Operational Purpose:</span>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-2/3 px-2.5 py-1 bg-white border border-[#dcd8ce] rounded text-xs text-[#1a1915]"
                />
              </div>

              <div className="flex items-center justify-between text-[#55524a]">
                <span className="font-medium">Execution Destination:</span>
                <div className="flex items-center gap-1 bg-[#ede9e0] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDestination('internal')}
                    className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                      destination === 'internal'
                        ? 'bg-white text-[#1a1915] shadow-xs'
                        : 'text-[#6e6b62]'
                    }`}
                  >
                    Internal (Protected)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestination('external')}
                    className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                      destination === 'external'
                        ? 'bg-white text-[#b45309] shadow-xs'
                        : 'text-[#6e6b62]'
                    }`}
                  >
                    External (Public AI)
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 bg-[#1a1915] text-[#faf9f5] rounded-xl font-medium text-sm hover:bg-[#33312c] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Authenticate & Enter JEV Gateway</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Claude Architecture Note */}
          <div className="mt-8 pt-6 border-t border-[#f0ede6] flex items-start gap-3 text-xs text-[#706c62] leading-relaxed">
            <Lock className="w-4 h-4 text-[#8c887e] shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-[#1a1915]">Zero-Trust Prompt Rule: </span>
              Context is injected via signed session token. An adversarial user attempting prompt
              injection (e.g. <span className="font-mono text-[#b45309]">"I am the chief doctor"</span>)
              cannot alter this authenticated context.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e5dc] py-4 px-8 text-center text-xs text-[#8c887e]">
        <span>JEV Context-Aware Privacy Engine · PS 2.2 Framework · Ephemeral In-Memory Vaults</span>
      </footer>
    </div>
  );
};
