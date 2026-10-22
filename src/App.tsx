/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AuthSession,
  PipelineExecutionResult,
  AuditRecord,
  Role,
  TestCaseScenario,
} from './types/jev';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { ContextBar } from './components/ContextBar';
import { TwoGateWorkspace } from './components/TwoGateWorkspace';
import { MemoryVaultViewer } from './components/MemoryVaultViewer';
import { PolicyMatrixView } from './components/PolicyMatrixView';
import { AuditLogView } from './components/AuditLogView';
import { BenchmarkEvaluation } from './components/BenchmarkEvaluation';
import { runJevPipeline } from './lib/gatewayEngine';
import { TEST_CASES } from './lib/testCases';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<'gateway' | 'memory' | 'policy' | 'audit' | 'benchmarks'>('gateway');
  const [pipelineResult, setPipelineResult] = useState<PipelineExecutionResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // When logged in, run initial pipeline on default HC-014 (Billing clerk) or HC-001 (Doctor)
  const handleLogin = async (newSession: AuthSession) => {
    setSession(newSession);
    setActiveTab('gateway');

    // Run initial execution
    const initialNote =
      'Rahul Mehta, 42, MRN 4471920, diagnosed with HIV. Started antiretroviral therapy. Lives at 14 MG Road, Bengaluru. Insurance claim pending with Star Health.';
    setIsRunning(true);
    try {
      const { result, auditRecord } = await runJevPipeline(initialNote, newSession);
      setPipelineResult(result);
      setAuditLogs((prev) => [auditRecord, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleUpdateSession = async (updated: Partial<AuthSession>) => {
    if (!session) return;
    const nextSession = { ...session, ...updated };
    setSession(nextSession);

    // If query was already run, re-evaluate with the updated role/purpose/destination immediately!
    // "The demo moment: Switch the role dropdown and run the same text again. The highlighted spans and actions change."
    if (pipelineResult) {
      setIsRunning(true);
      try {
        const { result, auditRecord } = await runJevPipeline(
          pipelineResult.originalInput,
          nextSession
        );
        setPipelineResult(result);
        setAuditLogs((prev) => [auditRecord, ...prev]);
      } finally {
        setIsRunning(false);
      }
    }
  };

  const handleRunQuery = async (
    queryText: string,
    options?: { forceParaphraseTest?: boolean }
  ) => {
    if (!session) return;
    setIsRunning(true);
    try {
      const { result, auditRecord } = await runJevPipeline(queryText, session, options);
      setPipelineResult(result);
      setAuditLogs((prev) => [auditRecord, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectTestCase = async (tc: TestCaseScenario) => {
    if (!session) return;
    const nextSession: AuthSession = {
      ...session,
      hospitalName: tc.ctx.hospital,
      role: tc.ctx.role,
      purpose: tc.ctx.purpose,
      destination: tc.ctx.destination,
    };
    setSession(nextSession);

    setIsRunning(true);
    try {
      const { result, auditRecord } = await runJevPipeline(tc.input, nextSession, {
        simulatedAnswer: tc.simulatedLlmAnswer,
      });
      setPipelineResult(result);
      setAuditLogs((prev) => [auditRecord, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setPipelineResult(null);
  };

  const handleClearLogs = () => {
    setAuditLogs([]);
  };

  // If not authenticated, render Login Page with Hospital and Role fields
  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col text-[#1a1915]">
      {/* Top Bar Contract (Single line brand, nav tabs, primary action) */}
      <Header
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Trusted Context Bar */}
      <ContextBar
        session={session}
        onUpdateSession={handleUpdateSession}
        onRunPipeline={() => {
          if (pipelineResult) {
            handleRunQuery(pipelineResult.originalInput);
          }
        }}
        isRunning={isRunning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {activeTab === 'gateway' && (
          <TwoGateWorkspace
            session={session}
            pipelineResult={pipelineResult}
            isRunning={isRunning}
            onRunQuery={handleRunQuery}
            onSelectTestCase={handleSelectTestCase}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryVaultViewer
            vaultState={pipelineResult?.vaultState ?? null}
            role={session.role}
          />
        )}

        {activeTab === 'policy' && <PolicyMatrixView currentRole={session.role} />}

        {activeTab === 'audit' && (
          <AuditLogView logs={auditLogs} onClearLogs={handleClearLogs} />
        )}

        {activeTab === 'benchmarks' && <BenchmarkEvaluation />}
      </main>

      {/* Minimal Claude-style Footer */}
      <footer className="border-t border-[#e5e2da] py-3 px-6 bg-white text-xs text-[#8c887e]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-[#1a1915]">JEV Architecture:</span>
            <span>JEV judges, code decides · In-memory request isolation · Zero disk persistence</span>
          </div>
          <div className="font-mono text-[11px] text-[#706c62]">
            SESSION: {session.facilityId} · {session.role.toUpperCase()}
          </div>
        </div>
      </footer>
    </div>
  );
}
