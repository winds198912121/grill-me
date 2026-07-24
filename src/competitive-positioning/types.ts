/**
 * Competitive Positioning — Seam-level narrative module.
 *
 * Structured claims, evidence, and rebuttals that form the
 * "Why Hitachi" argument in the proposal.
 */

export interface DemoEvidence {
  id: string;
  title: string;
  what: string;
  timeRequired: string;
  toolsUsed: string;
  /** What this evidence proves to the client */
  proves: string;
}

export interface CompetitiveClaim {
  id: string;
  claim: string;
  /** How we back this claim with evidence */
  evidence: string;
  /** Which DemoEvidence IDs support this claim */
  supportedBy: string[];
}

export interface CounterClaimRebuttal {
  id: string;
  /** What a competitor might argue */
  competitorClaim: string;
  /** Our response */
  rebuttal: string;
  /** Which evidence or claim IDs back our rebuttal */
  backedBy: string[];
}

export interface CompetitivePositioning {
  /** The one-paragraph elevator pitch */
  executiveSummary: string;
  /** 3-5 core claims that differentiate Hitachi */
  claims: CompetitiveClaim[];
  /** Concrete demo evidence (Ryu-san's track record) */
  demoEvidence: DemoEvidence[];
  /** Anticipated competitor objections + our answers */
  rebuttals: CounterClaimRebuttal[];
}
