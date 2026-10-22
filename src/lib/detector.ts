import { DetectedSpan } from '../types/jev';

/**
 * Cheap detector layer (simulating Presidio + NER + custom pattern engines)
 * Returns candidate sensitive spans for the JEV judge to evaluate in context.
 */
export function detectCandidateSpans(text: string): DetectedSpan[] {
  const spans: DetectedSpan[] = [];
  let idCounter = 1;

  const addSpan = (
    start: number,
    end: number,
    suggestedEntity: string,
    detector: 'regex' | 'ner' | 'dictionary' | 'rule',
    confidence: number
  ) => {
    // Avoid duplicate or completely enclosed overlaps
    const matchText = text.substring(start, end).trim();
    if (!matchText || matchText.length < 2) return;

    const exists = spans.some(
      (s) => (start >= s.start && end <= s.end) || (s.start >= start && s.end <= end)
    );
    if (!exists) {
      spans.push({
        id: `span_${idCounter++}`,
        start,
        end,
        text: text.substring(start, end),
        suggestedEntity,
        detector,
        confidence,
      });
    }
  };

  // 1. API Keys & Secrets
  const apiKeyRegex = /(?:sk-[A-Za-z0-9_\-]{20,}|AKIA[0-9A-Z]{16}|password\s*=\s*['"]?[^\s'";]+['"]?|secret_key\s*:\s*[^\s]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = apiKeyRegex.exec(text)) !== null) {
    addSpan(match.index, match.index + match[0].length, 'API_KEY_SECRET', 'regex', 0.95);
  }

  // 2. Medical Record Number (MRN)
  const mrnRegex = /(?:MRN[\s:#]*\b(\d{7})\b|\bMRN\s+\d{6,8}\b|\bmedical record[:\s]*(\d+)\b)/gi;
  while ((match = mrnRegex.exec(text)) !== null) {
    addSpan(match.index, match.index + match[0].length, 'MRN', 'regex', 0.9);
  }

  // 3. Indian / International Currency & Salary (e.g. ₹18 LPA, $120,000, 18 LPA)
  const salaryRegex = /(?:₹\s*\d+(?:\.\d+)?\s*(?:LPA|lakh|crore)?|\$\d[\d,]+(?:\s*k|\s*LPA)?|\b\d+\s*LPA\b)/gi;
  while ((match = salaryRegex.exec(text)) !== null) {
    addSpan(match.index, match.index + match[0].length, 'SALARY', 'regex', 0.85);
  }

  // 4. Credit card / Account numbers
  const cardRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b|\bacc(?:ount)?[\s#:]*\d{8,16}\b/gi;
  while ((match = cardRegex.exec(text)) !== null) {
    addSpan(match.index, match.index + match[0].length, 'ACCOUNT_OR_CARD', 'regex', 0.88);
  }

  // 5. Patient names and Person NER
  const personPatterns = [
    /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g,
    /\bRahul Mehta\b/g,
    /\bAnita(?:\s+Sharma)?\b/g,
    /\bJohn Doe\b/g,
    /\bRahul\b/g,
    /\bMehta\b/g,
  ];
  for (const regex of personPatterns) {
    while ((match = regex.exec(text)) !== null) {
      addSpan(match.index, match.index + match[0].length, 'PERSON', 'ner', 0.85);
    }
  }

  // 6. Medical Diagnoses & Regimens
  const medicalTerms = [
    /diagnosed with HIV/gi,
    /\bHIV diagnosis\b/gi,
    /\bHIV(?:\s+positive|\+)?\b/gi,
    /\bantiretroviral therapy\b/gi,
    /\bART therapy\b/gi,
    /\bART\b/gi,
    /\bchemotherapy\b/gi,
    /\bstage\s+[IV]+\s+cancer\b/gi,
    /\bcardiac arrest\b/gi,
    /\bacute myocardial infarction\b/gi,
    /\bschizophrenia\b/gi,
    /\btype 2 diabetes\b/gi,
  ];
  for (const regex of medicalTerms) {
    while ((match = regex.exec(text)) !== null) {
      addSpan(match.index, match.index + match[0].length, 'DIAGNOSIS_TREATMENT', 'dictionary', 0.92);
    }
  }

  // 7. Physical Addresses
  const addressRegex = /\b\d{1,4}\s+[A-Za-z0-9\s.,]+(?:Road|Street|Avenue|Lane|Nagar|Bengaluru|Bangalore|Delhi|Mumbai|NY|CA|Road, Bengaluru)\b/gi;
  while ((match = addressRegex.exec(text)) !== null) {
    addSpan(match.index, match.index + match[0].length, 'ADDRESS', 'rule', 0.82);
  }

  // 8. Insurance details
  const insuranceRegex = /\b(?:Star Health|Max Bupa|Blue Cross|Aetna|UnitedHealth|HDFC ERGO)\b/gi;
  while ((match = insuranceRegex.exec(text)) !== null) {
    addSpan(match.index, match.index + match[0].length, 'INSURER', 'dictionary', 0.8);
  }

  // 9. Confidential business / HR cues
  const confidentialRegex = /\b(?:unannounced acquisition|staging password|performance review|keep that quiet|credit score below threshold)\b/gi;
  while ((match = confidentialRegex.exec(text)) !== null) {
    addSpan(match.index, match.index + match[0].length, 'BUSINESS_CONFIDENTIAL', 'dictionary', 0.78);
  }

  return spans.sort((a, b) => a.start - b.start);
}
