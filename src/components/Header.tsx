import React from 'react';
import { AuthSession } from '../types/jev';

interface HeaderProps {
  session: AuthSession;
  activeTab: 'gateway' | 'memory' | 'policy' | 'audit';
  setActiveTab: (tab: 'gateway' | 'memory' | 'policy' | 'audit') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-[#e5e2da] sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#gateway"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('gateway');
          }}
          className="font-serif text-lg font-semibold tracking-tight text-[#1a1915] whitespace-nowrap shrink-0 hover:text-[#b45309] transition-colors"
        >
          JEV Gateway
        </a>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#66635a]">
        <button
          onClick={() => setActiveTab('gateway')}
          className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'gateway'
              ? 'text-[#1a1915] font-semibold border-b-2 border-[#1a1915] pb-0.5'
              : 'hover:text-[#1a1915]'
          }`}
        >
          Two-Gate Pipeline
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'memory'
              ? 'text-[#1a1915] font-semibold border-b-2 border-[#1a1915] pb-0.5'
              : 'hover:text-[#1a1915]'
          }`}
        >
          In-Memory Vault
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'policy'
              ? 'text-[#1a1915] font-semibold border-b-2 border-[#1a1915] pb-0.5'
              : 'hover:text-[#1a1915]'
          }`}
        >
          Policy Matrix
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'audit'
              ? 'text-[#1a1915] font-semibold border-b-2 border-[#1a1915] pb-0.5'
              : 'hover:text-[#1a1915]'
          }`}
        >
          Audit Log
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onLogout}
          className="px-3.5 py-1.5 text-xs font-medium text-[#1a1915] bg-[#faf9f5] hover:bg-[#ede9e0] border border-[#dcd8ce] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Switch Context
        </button>
      </div>
    </header>
  );
};
