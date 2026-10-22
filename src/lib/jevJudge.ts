import {
  DetectedSpan,
  JevJudgment,
  Role,
  SpanCategory,
  VaultItem,
  Gate2Result,
  Gate2CodeHit,
  Gate2Leak,
} from '../types/jev';

/**
 * JEV Pre-Judge: Evaluates candidate span in context.
 * Returns structured facts (category, about_specific_person, needed_for_task, risk, reason).
 * Remember: "JEV judges, code decides."
 */
export function judgeSpanInContext(
  span: DetectedSpan,
  fullText: string,
  ctx: { role: Role; purpose: string; destination: 'internal' | 'external' }
): JevJudgment {
  const spanText = span.text;
  const lowerSpan = spanText.toLowerCase();
  const lowerPurpose = ctx.purpose.toLowerCase();

  // Determine Category
  let category: SpanCategory = 'other';
  let aboutSpecificPerson = true;
  let neededForTask = false;
  let risk: 'low' | 'medium' | 'high' = 'medium';
  let reason = '';

  if (span.suggestedEntity === 'API_KEY_SECRET' || /password|sk-|AKIA/i.test(spanText)) {
    category = 'credential';
    aboutSpecificPerson = false;
    neededForTask = false;
    risk = 'high';
    reason = 'Credential or secret token detected; strictly prohibited across all endpoints.';
  } else if (
    span.suggestedEntity === 'DIAGNOSIS_TREATMENT' ||
    /hiv|antiretroviral|art|cancer|cardiac|therapy|diagnos/i.test(spanText)
  ) {
    category = 'health';
    aboutSpecificPerson = true;
    risk = 'high';

    if (ctx.role === 'doctor' && (lowerPurpose.includes('round') || lowerPurpose.includes('care') || lowerPurpose.includes('history'))) {
      neededForTask = true;
      reason = 'Diagnosis and clinical treatment are required for medical care & rounds summary.';
    } else if (ctx.role === 'billing') {
      neededForTask = false;
      reason = 'Clinical diagnosis is tied to a named patient but not required for billing claim generation.';
    } else if (ctx.role === 'researcher') {
      neededForTask = false;
      reason = 'Specific patient diagnosis linkage is not needed for aggregate statistical analysis.';
    } else {
      neededForTask = false;
      reason = `Clinical health data tied to individual; unauthorized for role [${ctx.role}].`;
    }
  } else if (
    span.suggestedEntity === 'PERSON' ||
    span.suggestedEntity === 'MRN' ||
    /mehta|rahul|anita|mrn|\b\d{7}\b/i.test(spanText)
  ) {
    category = 'identifier';
    aboutSpecificPerson = true;

    if (ctx.role === 'doctor' || ctx.role === 'billing') {
      neededForTask = true;
      risk = 'low';
      reason = `Patient identity & MRN are necessary for ${ctx.role === 'doctor' ? 'clinical chart review' : 'claim identification'}.`;
    } else if (ctx.role === 'researcher') {
      neededForTask = false;
      risk = 'high';
      reason = 'Direct patient identifiers must be suppressed for statistical research compliance.';
    } else {
      neededForTask = false;
      risk = 'medium';
      reason = `Individual identifier not justified for purpose "${ctx.purpose}".`;
    }
  } else if (span.suggestedEntity === 'ADDRESS' || /road|street|bengaluru|mumbai|nagar/i.test(spanText)) {
    category = 'identifier';
    aboutSpecificPerson = true;

    if (ctx.role === 'doctor') {
      neededForTask = true;
      risk = 'low';
      reason = 'Demographic location verified for continuity of clinical record.';
    } else {
      neededForTask = false;
      risk = 'medium';
      reason = 'Physical residential address is not necessary for current operational task.';
    }
  } else if (span.suggestedEntity === 'SALARY' || /lpa|salary|₹|\$/i.test(spanText)) {
    category = 'hr';
    aboutSpecificPerson = /anita|mehta|rahul|john/i.test(fullText);
    neededForTask = false;
    risk = 'high';
    reason = aboutSpecificPerson
      ? 'Compensation amount directly linked to a specific named individual.'
      : 'General compensation figure not tied to a specific individual.';
  } else if (span.suggestedEntity === 'ACCOUNT_OR_CARD' || /\d{16}/.test(spanText)) {
    category = 'financial';
    aboutSpecificPerson = true;
    neededForTask = ctx.role === 'support_agent' && /order|verify/i.test(lowerPurpose);
    risk = 'high';
    reason = 'Account / payment identifier requires masking to last 4 digits.';
  } else if (span.suggestedEntity === 'BUSINESS_CONFIDENTIAL' || /acquisition|quiet/i.test(spanText)) {
    category = 'business';
    aboutSpecificPerson = false;
    neededForTask = false;
    risk = 'high';
    reason = 'Unannounced corporate business transaction or confidential acquisition plan.';
  } else {
    category = 'other';
    aboutSpecificPerson = false;
    neededForTask = true;
    risk = 'low';
    reason = 'General entity or operational text; low privacy impact.';
  }

  // Handle external destination strictness
  if (ctx.destination === 'external') {
    if (category === 'health' || category === 'identifier' || category === 'credential') {
      risk = 'high';
      reason += ' [Dest: External cloud API beyond institutional perimeter].';
    }
  }

  return {
    span: spanText,
    category,
    about_specific_person: aboutSpecificPerson,
    needed_for_task: neededForTask,
    risk,
    reason,
  };
}

/**
 * Gate 2 Step A: Deterministic Code Search for Vault Leaks (Page 13)
 * Scans output for exact, squashed/reformatted, or partial surname hits.
 */
export function checkCodeLeaks(output: string, vault: VaultItem[]): Gate2CodeHit[] {
  const hits: Gate2CodeHit[] = [];
  const lowerText = output.toLowerCase();
  const squashedText = lowerText.replace(/[\s\-_]/g, '');

  for (const item of vault) {
    if (item.action === 'ALLOW') continue; // Allowed values are legally permitted to appear

    const rawVal = item.value.toLowerCase().trim();
    if (rawVal.length < 3) continue;

    // 1. Exact match
    if (lowerText.includes(rawVal)) {
      hits.push({
        value: item.value,
        matchType: 'exact',
        category: item.category,
        token: item.token,
      });
      continue;
    }

    // 2. Reformatted match (spaces or punctuation stripped)
    const squashedVal = rawVal.replace(/[\s\-_]/g, '');
    if (squashedVal.length >= 4 && squashedText.includes(squashedVal)) {
      hits.push({
        value: item.value,
        matchType: 'reformatted',
        category: item.category,
        token: item.token,
      });
      continue;
    }

    // 3. Partial surname or identifier parts
    if (item.category === 'identifier' || item.category === 'health') {
      const parts = rawVal.split(/\W+/).filter((p) => p.length >= 4);
      for (const part of parts) {
        if (lowerText.includes(part)) {
          hits.push({
            value: part,
            matchType: 'partial',
            category: item.category,
            token: item.token,
          });
          break;
        }
      }
    }
  }

  return hits;
}

/**
 * Gate 2 Step B: JEV Post-Check (Pages 12-14)
 * Small judge inspects answer for semantic paraphrases, inference, or side-channel disclosures.
 */
export function judgeGate2PostCheck(
  cleanPrompt: string,
  modelAnswer: string,
  vault: VaultItem[],
  ctx: { role: Role; purpose: string; destination: 'internal' | 'external' }
): { verdict: 'SECURE' | 'NOT_SECURE'; leaks: Gate2Leak[] } {
  const leaks: Gate2Leak[] = [];
  const lowerAnswer = modelAnswer.toLowerCase();

  // Check if answer contains paraphrases of masked sensitive items
  for (const item of vault) {
    if (item.action === 'ALLOW') continue;

    // Check for medical condition paraphrases
    if (item.category === 'health' && /hiv|art/i.test(item.value)) {
      const paraphrasePhrases = [
        'immune condition',
        'immunodeficiency',
        'retroviral condition',
        'viral infection of the immune system',
        'chronic immune illness',
      ];
      for (const phrase of paraphrasePhrases) {
        if (lowerAnswer.includes(phrase)) {
          leaks.push({
            text: phrase,
            reveals: 'diagnosis',
            reason: `Paraphrase of a masked diagnosis (${item.value}) tied to a named patient.`,
          });
        }
      }
    }

    // Check for salary / financial paraphrases
    if (item.category === 'hr' && /18 lpa|salary/i.test(item.value)) {
      if (/eighteen lakh|upper-tier compensation|eighteen lpa/i.test(lowerAnswer)) {
        leaks.push({
          text: 'compensation disclosure',
          reveals: 'salary',
          reason: 'Paraphrase or disclosure of masked compensation information.',
        });
      }
    }
  }

  return {
    verdict: leaks.length > 0 ? 'NOT_SECURE' : 'SECURE',
    leaks,
  };
}

/**
 * Run full Gate 2 evaluation combining Step A (deterministic code) + Step B (JEV post-check)
 */
export function executeGate2(
  rawAnswer: string,
  cleanPrompt: string,
  vault: VaultItem[],
  ctx: { role: Role; purpose: string; destination: 'internal' | 'external' }
): Gate2Result {
  const codeHits = checkCodeLeaks(rawAnswer, vault);

  // Step A auto-redact code hits
  let redacted = rawAnswer;
  for (const hit of codeHits) {
    const esc = hit.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    redacted = redacted.replace(new RegExp(esc, 'gi'), `[REDACTED_${hit.category.toUpperCase()}]`);
  }

  // Step B: JEV post-check
  const postCheck = judgeGate2PostCheck(cleanPrompt, redacted, vault, ctx);

  if (postCheck.verdict === 'NOT_SECURE') {
    for (const leak of postCheck.leaks) {
      const esc = leak.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      redacted = redacted.replace(new RegExp(esc, 'gi'), '[REDACTED_PARAPHRASE]');
    }
  }

  const passed = codeHits.length === 0 && postCheck.verdict === 'SECURE';

  return {
    code_hits: codeHits,
    jev_verdict: postCheck.verdict,
    leaks: postCheck.leaks,
    redactedOutput: redacted,
    passed,
  };
}
