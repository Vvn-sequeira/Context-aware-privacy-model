import {
  PolicyAction,
  PolicyDecisionResult,
  Role,
  SpanCategory,
  VaultItem,
  MemoryVaultState,
} from '../types/jev';

/**
 * In-Memory Request Vault
 * "Keep the vault in memory for the request only, and never write it to the log or disk."
 * Replaces sensitive values with tokens ([PERSON_1], [CONDITION_1]) before main LLM.
 */

// Simulated memory address generation for educational & inspection fidelity
function generateMemAddress(offset: number): string {
  const base = 0x7ffee4b20000;
  const addr = (base + offset * 0x38).toString(16).toUpperCase();
  return `0x${addr}`;
}

const CATEGORY_TOKEN_MAP: Record<SpanCategory, string> = {
  identifier: 'IDENTIFIER',
  health: 'CONDITION',
  financial: 'ACCOUNT',
  credential: 'KEY',
  hr: 'HR_RECORD',
  business: 'BUSINESS_CONFIDENTIAL',
  other: 'ENTITY',
};

export function createMemoryVault(
  originalText: string,
  decisions: PolicyDecisionResult[],
  role: Role
): {
  sanitizedText: string;
  vaultState: MemoryVaultState;
} {
  const requestId = `req_${Math.random().toString(36).substring(2, 9)}`;
  const sessionId = `mem_vault_${Date.now().toString(36)}`;
  const counts: Record<string, number> = {};
  const items: VaultItem[] = [];

  // Sort decisions by starting offset in descending order so replacements don't shift earlier indices
  const sorted = [...decisions].sort((a, b) => {
    // If start positions are identical or approximate, preserve order
    return b.spanText.length - a.spanText.length;
  });

  let sanitized = originalText;
  let totalBytes = 0;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const val = item.spanText;
    const cat = item.category;
    const action = item.action;

    const prefix =
      cat === 'identifier' && /mrn|\d{7}/i.test(val)
        ? 'MRN'
        : cat === 'identifier' && /road|street|bengaluru/i.test(val)
        ? 'ADDRESS'
        : cat === 'identifier'
        ? 'PERSON'
        : CATEGORY_TOKEN_MAP[cat] || 'ENTITY';

    counts[prefix] = (counts[prefix] || 0) + 1;
    const token = `[${prefix}_${counts[prefix]}]`;

    const byteLen = new TextEncoder().encode(val).length + 32; // payload + overhead
    totalBytes += byteLen;

    const vaultEntry: VaultItem = {
      id: item.spanId,
      token,
      value: val,
      category: cat,
      action,
      memoryAddress: generateMemAddress(i + 1),
      allocatedBytes: byteLen,
      start: 0,
      end: 0,
      viewerAllowed: action === 'ALLOW',
    };

    items.push(vaultEntry);

    // Apply substitution based on deterministic policy action:
    // ALLOW: original value passes untouched
    // MASK: replaced by safe token placeholder
    // BLOCK: stripped and marked [withheld]
    if (action === 'MASK') {
      const esc = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      sanitized = sanitized.replace(new RegExp(esc, 'g'), token);
    } else if (action === 'BLOCK') {
      const esc = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      sanitized = sanitized.replace(new RegExp(esc, 'g'), '[withheld]');
    }
  }

  const vaultState: MemoryVaultState = {
    sessionId,
    requestId,
    totalAllocatedBytes: totalBytes,
    items,
    quarantineActive: true,
    purgedOnComplete: false,
    createdAt: Date.now(),
  };

  return {
    sanitizedText: sanitized,
    vaultState,
  };
}

/**
 * Rehydrate function matching JEV Guide Page 16:
 * def rehydrate(answer, vault, viewer_allowed):
 *   for item in vault:
 *     if item["action"] == "MASK" and viewer_allowed(item):
 *       answer = answer.replace(item["token"], item["value"])
 *   return answer
 *
 * "The rehydrate rule only restores what policy already allowed.
 * Masked values unauthorized for this viewer remain masked tokens."
 */
export function rehydrateAnswer(
  answer: string,
  vault: VaultItem[],
  viewerRole: Role
): string {
  let rehydrated = answer;

  for (const item of vault) {
    if (item.action === 'ALLOW' || (item.action === 'MASK' && item.viewerAllowed)) {
      // Re-insert authorized values
      rehydrated = rehydrated.replaceAll(item.token, item.value);
    }
  }

  return rehydrated;
}
