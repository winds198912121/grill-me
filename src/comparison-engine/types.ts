/**
 * Cost Comparison Engine — Seam 1
 *
 * Pure functions that convert scope, roles, rates, and AI compression ratios
 * into comparative cost estimates for Traditional / Tier A / Tier B / Tier C.
 */

export type Phase = "要件定義" | "基設計" | "開発+単体テスト";
export type Role = "consultant" | "se";
export type Tier = "traditional" | "tierA" | "tierB" | "tierC";

export interface PhaseConfig {
  phase: Phase;
  role: Role;
  traditionalPersonDays: number;
}

export interface CompressionRange {
  min: number;
  max: number;
}

export interface LicenseCosts {
  monthlyPerId: number;
  note: string;
}

export interface PhaseEstimate {
  phase: Phase;
  role: Role;
  traditionalPersonDays: number;
  traditionalCost: number;
  aiPersonDays: CompressionRange;
  aiCost: CompressionRange;
  compressionRatio: CompressionRange;
}

export interface TierSummary {
  tier: Tier;
  phaseBreakdown: PhaseEstimate[];
  totalPersonDays: CompressionRange;
  totalCost: CompressionRange;
  licenseCosts: LicenseCosts;
}

export interface ComparisonResult {
  interfaceCount: number;
  tiers: Record<Tier, TierSummary>;
}
