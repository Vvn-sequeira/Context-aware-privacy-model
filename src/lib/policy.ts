import { PolicyAction, Role, SpanCategory, JevJudgment } from '../types/jev';

export interface PolicyTableRow {
  doctor: PolicyAction;
  billing: PolicyAction;
  researcher: PolicyAction;
  support_agent: PolicyAction;
  developer: PolicyAction;
  external: PolicyAction;
}

export const ORDER: Record<PolicyAction, number> = {
  ALLOW: 0,
  MASK: 1,
  BLOCK: 2,
};

export const ALWAYS_SENSITIVE = new Set<SpanCategory>(['credential']);

/**
 * Standard deterministic Policy Table from JEV Developer Guide (Pages 8-9)
 */
export const DEFAULT_POLICY_TABLE: Record<SpanCategory, PolicyTableRow> = {
  identifier: {
    doctor: 'ALLOW',
    billing: 'ALLOW',
    researcher: 'MASK',
    support_agent: 'MASK',
    developer: 'MASK',
    external: 'MASK',
  },
  health: {
    doctor: 'ALLOW',
    billing: 'MASK',
    researcher: 'MASK',
    support_agent: 'BLOCK',
    developer: 'BLOCK',
    external: 'BLOCK',
  },
  financial: {
    doctor: 'MASK',
    billing: 'MASK',
    researcher: 'BLOCK',
    support_agent: 'MASK', // support agent sees reason/last4
    developer: 'BLOCK',
    external: 'BLOCK',
  },
  credential: {
    doctor: 'BLOCK',
    billing: 'BLOCK',
    researcher: 'BLOCK',
    support_agent: 'BLOCK',
    developer: 'BLOCK',
    external: 'BLOCK',
  },
  hr: {
    doctor: 'MASK',
    billing: 'MASK',
    researcher: 'MASK',
    support_agent: 'BLOCK',
    developer: 'BLOCK',
    external: 'BLOCK',
  },
  business: {
    doctor: 'MASK',
    billing: 'MASK',
    researcher: 'MASK',
    support_agent: 'MASK',
    developer: 'MASK',
    external: 'BLOCK',
  },
  other: {
    doctor: 'ALLOW',
    billing: 'ALLOW',
    researcher: 'ALLOW',
    support_agent: 'ALLOW',
    developer: 'ALLOW',
    external: 'MASK',
  },
};

/**
 * Deterministic Decision Function matching JEV specification (Page 9):
 * "JEV judges, code decides. The model supplies facts about the text;
 * the final action always comes from the policy table."
 */
export function decidePolicy(
  judgment: JevJudgment,
  ctx: { role: Role; destination: 'internal' | 'external' },
  table: Record<SpanCategory, PolicyTableRow> = DEFAULT_POLICY_TABLE
): { action: PolicyAction; ruleExplanation: string } {
  const row = table[judgment.category] || {
    doctor: 'MASK',
    billing: 'MASK',
    researcher: 'MASK',
    support_agent: 'MASK',
    developer: 'MASK',
    external: 'MASK',
  }; // Fail-closed rule

  // 1. Start from the table cell for the span's category and the requester's role
  const baseAction = row[ctx.role] ?? 'MASK';

  // 2. If destination is external, take stricter result
  const destAction = ctx.destination === 'external' ? (row.external ?? 'MASK') : 'ALLOW';
  let action: PolicyAction = ORDER[baseAction] >= ORDER[destAction] ? baseAction : destAction;

  let ruleExplanation = `Base policy for [${judgment.category}] with role [${ctx.role}] is ${baseAction}.`;
  if (ctx.destination === 'external' && ORDER[destAction] > ORDER[baseAction]) {
    ruleExplanation += ` Destination is external, tightened to ${destAction}.`;
  }

  // 3. If JEV says span is not needed for the task and result is ALLOW, tighten to MASK
  if (!judgment.needed_for_task && action === 'ALLOW') {
    action = 'MASK';
    ruleExplanation += ' Tightened to MASK because span is not needed for current task.';
  }

  // 4. If JEV says span is not about a specific person and is not a credential, relax to ALLOW
  if (!judgment.about_specific_person && !ALWAYS_SENSITIVE.has(judgment.category)) {
    action = 'ALLOW';
    ruleExplanation += ' Relaxed to ALLOW as span is general/public information, not tied to a specific person.';
  }

  return { action, ruleExplanation };
}
