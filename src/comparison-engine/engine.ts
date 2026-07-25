/**
 * Cost Comparison Engine — Seam 1
 *
 * Pure functions: scope × phases × rates × AI compression → cost comparison.
 * All monetary values in Japanese yen (¥).
 * Per-phase aiCost is exact (unrounded); totals are rounded to nearest ¥10,000.
 */

import type {
  Phase,
  Role,
  Tier,
  PhaseConfig,
  CompressionRange,
  PhaseEstimate,
  TierSummary,
  ComparisonResult,
  LicenseCosts,
} from "./types";

// ── Constants ───────────────────────────────────────────────────────────────

/** Billing rates. monthly / 20 working days = daily. */
export const ROLE_RATES = {
  consultant: { monthly: 1_500_000, daily: 75_000 },
  se: { monthly: 1_000_000, daily: 50_000 },
} as const;

/** Traditional cost per interface (all 3 phases, 35 person-days). */
export const TRADITIONAL_COST_PER_INTERFACE = 2_000_000;

/** Billable phases (excludes 結合テスト+UAT which is client responsibility). */
export const PHASES: PhaseConfig[] = [
  { phase: "要件定義", role: "consultant", traditionalPersonDays: 10 },
  { phase: "基本設計", role: "se", traditionalPersonDays: 5 },
  { phase: "開発+単体テスト", role: "se", traditionalPersonDays: 20 },
];

/**
 * AI-assisted person-days per tier per phase.
 * Traditional is the baseline (no reduction).
 * Source: ADR 0001 compression ratios.
 */
const AI_PERSON_DAYS: Record<Tier, Record<Phase, CompressionRange>> = {
  traditional: {
    要件定義: { min: 10, max: 10 },
    基本設計: { min: 5, max: 5 },
    "開発+単体テスト": { min: 20, max: 20 },
  },
  tierA: {
    要件定義: { min: 2, max: 2 },
    基本設計: { min: 3, max: 3 },
    "開発+単体テスト": { min: 5, max: 5 },
  },
  tierB: {
    要件定義: { min: 4, max: 6 },
    基本設計: { min: 1.5, max: 2.5 },
    "開発+単体テスト": { min: 7, max: 12 },
  },
  tierC: {
    要件定義: { min: 6, max: 8 },
    基本設計: { min: 2.5, max: 3.5 },
    "開発+単体テスト": { min: 12, max: 15 },
  },
};

/** Display labels for tiers. */
export const TIER_LABELS: Record<Tier, string> = {
  traditional: "従来型",
  tierA: "Tier A (Claude Code)",
  tierB: "Tier B (Joule)",
  tierC: "Tier C (Copilot)",
};

/** Monthly license costs per user ID. Negligible vs. labor savings. */
export const LICENSE_COSTS: Record<Tier, LicenseCosts> = {
  traditional: { monthlyPerId: 0, note: "ツールなし" },
  tierA: { monthlyPerId: 30_000, note: "最大$200/月/ID" },
  tierB: { monthlyPerId: 0, note: "未定 (SAP要確認)" },
  tierC: { monthlyPerId: 3_000, note: "$20/月/ID" },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const dailyRate = (role: Role): number =>
  role === "consultant"
    ? ROLE_RATES.consultant.daily
    : ROLE_RATES.se.daily;

const roundTo10k = (n: number): number => Math.round(n / 10_000) * 10_000;

// ── Exports ─────────────────────────────────────────────────────────────────

/**
 * Compute a single phase estimate for a given tier.
 * Phase-level aiCost is exact (unrounded); totals are rounded once.
 */
export function calculatePhaseEstimate(
  phaseConfig: PhaseConfig,
  tier: Tier,
): PhaseEstimate {
  const { phase, role, traditionalPersonDays: tradDays } = phaseConfig;
  const rate = dailyRate(role);
  const tradCost = tradDays * rate;
  const aiDays = AI_PERSON_DAYS[tier][phase];

  // Compression ratio = (traditional - ai) / traditional
  const compressionMin = (tradDays - aiDays.max) / tradDays;
  const compressionMax = (tradDays - aiDays.min) / tradDays;

  return {
    phase,
    role,
    traditionalPersonDays: tradDays,
    traditionalCost: tradCost,
    aiPersonDays: aiDays,
    aiCost: {
      min: aiDays.min * rate,
      max: aiDays.max * rate,
    },
    compressionRatio: {
      min: Math.round(compressionMin * 100) / 100,
      max: Math.round(compressionMax * 100) / 100,
    },
  };
}

/**
 * Calculate per-interface summary for a single tier (all 3 phases summed).
 * Total cost is rounded once from the raw phase sum.
 */
export function calculatePerInterface(tier: Tier): TierSummary {
  const phaseBreakdown = PHASES.map((p) => calculatePhaseEstimate(p, tier));

  const totalPersonDays: CompressionRange = {
    min: phaseBreakdown.reduce((s, p) => s + p.aiPersonDays.min, 0),
    max: phaseBreakdown.reduce((s, p) => s + p.aiPersonDays.max, 0),
  };

  const rawMin = phaseBreakdown.reduce((s, p) => s + p.aiCost.min, 0);
  const rawMax = phaseBreakdown.reduce((s, p) => s + p.aiCost.max, 0);

  const totalCost: CompressionRange = {
    min: roundTo10k(rawMin),
    max: roundTo10k(rawMax),
  };

  return {
    tier,
    phaseBreakdown,
    totalPersonDays,
    totalCost,
    licenseCosts: LICENSE_COSTS[tier],
  };
}

/**
 * Full comparison across all 4 tiers for N interfaces.
 */
export function calculateComparison(interfaceCount: number): ComparisonResult {
  const tiers = {
    traditional: scaleTier(
      calculatePerInterface("traditional"),
      interfaceCount,
    ),
    tierA: scaleTier(calculatePerInterface("tierA"), interfaceCount),
    tierB: scaleTier(calculatePerInterface("tierB"), interfaceCount),
    tierC: scaleTier(calculatePerInterface("tierC"), interfaceCount),
  };

  return { interfaceCount, tiers };
}

function scaleTier(summary: TierSummary, count: number): TierSummary {
  if (count === 0) {
    return {
      ...summary,
      phaseBreakdown: summary.phaseBreakdown.map((p) => ({
        ...p,
        traditionalCost: 0,
        aiCost: { min: 0, max: 0 },
      })),
      totalPersonDays: { min: 0, max: 0 },
      totalCost: { min: 0, max: 0 },
      licenseCosts: summary.licenseCosts,
    };
  }

  return {
    ...summary,
    phaseBreakdown: summary.phaseBreakdown.map((p) => ({
      ...p,
      traditionalCost: roundTo10k(p.traditionalCost * count),
      aiCost: {
        min: roundTo10k(p.aiCost.min * count),
        max: roundTo10k(p.aiCost.max * count),
      },
    })),
    totalPersonDays: {
      min: summary.totalPersonDays.min * count,
      max: summary.totalPersonDays.max * count,
    },
    totalCost: {
      min: roundTo10k(summary.totalCost.min * count),
      max: roundTo10k(summary.totalCost.max * count),
    },
    licenseCosts: summary.licenseCosts,
  };
}
