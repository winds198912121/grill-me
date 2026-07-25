/**
 * Execution Roadmap — Ticket 4.
 *
 * Phase workflows, PoC plan, phased rollout steps, decision gates.
 * Integrates Ticket 1 (cost/comparison) + Ticket 2 (tools/gates).
 */

import type { Phase, Tier } from "../comparison-engine/types";
import type { ArtifactType } from "../quality-gate/types";

export interface WorkflowStep {
  phase: Phase;
  /** AI role in this phase */
  aiRole: string;
  /** Human role in this phase */
  humanRole: string;
  /** Input artifact (what AI consumes) */
  inputFrom: string;
  /** Output artifacts (what AI produces) */
  outputArtifacts: ArtifactType[];
  /** Which AI tier is used at this phase */
  recommendedTier: Tier;
}

export interface PoCScope {
  /** Number of interfaces for PoC evaluation */
  interfaceCount: { min: number; max: number };
  /** Interface categories to cover */
  categories: string[];
  /** Timeline anchor: during which phase */
  duringPhase: Phase;
  /** Duration in weeks */
  durationWeeks: number;
  /** What constitutes success */
  successCriteria: string[];
  /** Tiers to evaluate */
  evaluateTiers: Tier[];
}

export interface RolloutStep {
  order: 1 | 2 | 3 | 4;
  title: string;
  /** Which AI tier is adopted at this step */
  tier: Tier;
  /** When this step happens */
  timing: string;
  /** What is delivered */
  action: string;
  /** Decision gate: what must be true to proceed */
  gate: string;
}

export interface DecisionGate {
  id: string;
  /** After which rollout step */
  afterStep: number;
  question: string;
  /** Criteria for pass / fail */
  passCriteria: string[];
  failCriteria: string[];
  /** What happens if fail */
  fallback: string;
}

export interface ExecutionRoadmap {
  /** Phase-by-phase AI-assisted workflow */
  workflows: WorkflowStep[];
  /** PoC evaluation plan */
  poc: PoCScope;
  /** Phased rollout steps (1–4) */
  rollout: RolloutStep[];
  /** Decision gates between rollout steps */
  decisionGates: DecisionGate[];
}
