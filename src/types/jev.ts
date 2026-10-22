/**
 * JEV Context-Aware Data Privacy Gateway Types
 * Based on the JEV Developer Guide specification.
 */

export type Role = 'doctor' | 'billing' | 'researcher' | 'support_agent' | 'developer';

export type Destination = 'internal' | 'external';

export type SpanCategory =
  | 'health'
  | 'financial'
  | 'hr'
  | 'business'
  | 'credential'
  | 'identifier'
  | 'other';

export type PolicyAction = 'ALLOW' | 'MASK' | 'BLOCK';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AuthSession {
  hospitalName: string;
  facilityId: string;
  role: Role;
  staffName: string;
  department: string;
  purpose: string;
  destination: Destination;
  sessionToken: string;
  authenticatedAt: string;
}

export interface DetectedSpan {
  id: string;
  start: number;
  end: number;
  text: string;
  suggestedEntity: string;
  detector: 'regex' | 'ner' | 'dictionary' | 'rule';
  confidence: number;
}

export interface JevJudgment {
  span: string;
  category: SpanCategory;
  about_specific_person: boolean;
  needed_for_task: boolean;
  risk: RiskLevel;
  reason: string;
}

export interface PolicyDecisionResult {
  spanId: string;
  spanText: string;
  category: SpanCategory;
  judgment: JevJudgment;
  action: PolicyAction;
  ruleExplanation: string;
}

export interface VaultItem {
  id: string;
  token: string;
  value: string;
  category: SpanCategory;
  action: PolicyAction;
  memoryAddress: string;
  allocatedBytes: number;
  start: number;
  end: number;
  viewerAllowed: boolean;
}

export interface MemoryVaultState {
  sessionId: string;
  requestId: string;
  totalAllocatedBytes: number;
  items: VaultItem[];
  quarantineActive: boolean;
  purgedOnComplete: boolean;
  createdAt: number;
}

export interface Gate2CodeHit {
  value: string;
  matchType: 'exact' | 'reformatted' | 'partial';
  category: SpanCategory;
  token: string;
}

export interface Gate2Leak {
  text: string;
  reveals: string;
  reason: string;
}

export interface Gate2Result {
  code_hits: Gate2CodeHit[];
  jev_verdict: 'SECURE' | 'NOT_SECURE';
  leaks: Gate2Leak[];
  redactedOutput: string;
  passed: boolean;
}

export interface PipelineExecutionResult {
  requestId: string;
  timestamp: string;
  originalInput: string;
  context: {
    hospital: string;
    role: Role;
    purpose: string;
    destination: Destination;
  };
  detectedSpans: DetectedSpan[];
  judgments: JevJudgment[];
  decisions: PolicyDecisionResult[];
  sanitizedInput: string;
  vaultState: MemoryVaultState;
  rawLlmOutput: string;
  gate2Result: Gate2Result;
  finalViewerOutput: string;
  isBlocked: boolean;
  blockedReason?: string;
  latency_ms: {
    detect: number;
    jev_pre: number;
    llm: number;
    gate2: number;
    total: number;
  };
}

export interface AuditRecord {
  id: string;
  time: string;
  hospital: string;
  role: Role;
  purpose: string;
  destination: Destination;
  spans: Array<{
    type: string;
    masked: string;
    action: PolicyAction;
    risk: RiskLevel;
    reason: string;
  }>;
  gate2: {
    code_hits: number;
    jev_verdict: 'SECURE' | 'NOT_SECURE';
  };
  latency_ms: {
    detect: number;
    jev_pre: number;
    llm: number;
    gate2: number;
    total: number;
  };
}

export interface TestCaseScenario {
  id: string;
  title: string;
  domain: 'healthcare' | 'banking' | 'developer';
  type: 'positive' | 'negative' | 'adversarial';
  description: string;
  ctx: {
    hospital: string;
    role: Role;
    purpose: string;
    destination: Destination;
  };
  input: string;
  simulatedLlmAnswer?: string;
  expect: {
    must_show: string[];
    must_hide: string[];
    expectedActionSummary: string;
  };
}
