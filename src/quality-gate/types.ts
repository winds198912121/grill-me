/**
 * Quality Gate Protocol — Seam 2
 *
 * Defines the invariant: no AI-generated artifact passes to the next
 * phase without human review and documented sign-off.
 *
 * Applies uniformly across all AI tiers and all project phases.
 */

import type { Phase } from "../comparison-engine/types";

export type ArtifactType =
  | "要件定義書"
  | "設計書・マッピングシート"
  | "ABAPコード"
  | "テスト仕様書";

export type ReviewerRole = "コンサルタント" | "SE" | "クライアント";

export interface CheckItem {
  id: string;
  description: string;
  /** What to look for when checking this item */
  lookFor: string;
}

export interface ReviewChecklist {
  artifactType: ArtifactType;
  reviewer: ReviewerRole;
  aiRole: string;
  humanRole: string;
  items: CheckItem[];
}

export interface GateDefinition {
  phase: Phase;
  reviewer: ReviewerRole;
  /** Artifacts that must pass review at this gate */
  artifactsChecked: ArtifactType[];
  exitCriteria: string;
  signOffFormat: string;
  /** Reference to the review checklist(s) used at this gate */
  checklistRefs: ArtifactType[];
}

export interface QualityGateProtocol {
  gates: Record<Phase, GateDefinition>;
  checklists: Record<ArtifactType, ReviewChecklist>;
}
