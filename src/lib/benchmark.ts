export interface BenchmarkSystemResult {
  systemName: string;
  architecture: string;
  leakRate: number; // percentage
  overBlockRate: number; // percentage
  avgLatencyMs: number;
  jsonValidityRate: number; // percentage
  strengths: string;
  vulnerability: string;
}

export const BENCHMARK_RESULTS: BenchmarkSystemResult[] = [
  {
    systemName: 'Keyword Filter',
    architecture: 'Deny-list string matching in code',
    leakRate: 64.2,
    overBlockRate: 48.6,
    avgLatencyMs: 3.2,
    jsonValidityRate: 100,
    strengths: 'Sub-millisecond execution, zero LLM cost',
    vulnerability: 'Fails on any paraphrase, homophone, or slight spelling deviation; blocks harmless words.',
  },
  {
    systemName: 'Presidio Only',
    architecture: 'Regex patterns + standard spaCy NER',
    leakRate: 38.5,
    overBlockRate: 31.0,
    avgLatencyMs: 24.8,
    jsonValidityRate: 100,
    strengths: 'Catches structured entities (SSN, emails, credit cards, basic names)',
    vulnerability: 'Judges text in isolation. Masks data legitimate users need; misses diagnoses (HIV) and implied sensitivity.',
  },
  {
    systemName: 'Prompt-only LLM Guardrail',
    architecture: 'Instruction in system prompt with raw payload',
    leakRate: 27.4,
    overBlockRate: 14.2,
    avgLatencyMs: 340.0,
    jsonValidityRate: 94.1,
    strengths: 'Understands complex nuances when prompt is followed',
    vulnerability: 'The leak happens before the prompt: raw data already sent to LLM. Vulnerable to prompt injection ("I am the doctor").',
  },
  {
    systemName: 'JEV Two-Gate Pipeline',
    architecture: 'Cheap detectors + JEV Judge + Policy Matrix + Memory Vault + Gate 2',
    leakRate: 1.8,
    overBlockRate: 3.2,
    avgLatencyMs: 82.5,
    jsonValidityRate: 99.4,
    strengths: 'JEV judges, code decides. Context bound at session, raw secrets never leave memory, output paraphrase catch at Gate 2.',
    vulnerability: 'Requires defined role policy table; requires 2 model evaluations per round trip.',
  },
];
