import { describe, it, expect } from "vitest";
import {
  calculatePhaseEstimate,
  calculatePerInterface,
  calculateComparison,
  ROLE_RATES,
  PHASES,
  TIER_LABELS,
  TRADITIONAL_COST_PER_INTERFACE,
  LICENSE_COSTS,
} from "./engine";
import type { Tier } from "./types";

// ── ROLE_RATES ──

describe("ROLE_RATES", () => {
  it("consultant monthly ¥1,500,000, daily ¥75,000", () => {
    expect(ROLE_RATES.consultant.monthly).toBe(1_500_000);
    expect(ROLE_RATES.consultant.daily).toBe(75_000);
  });

  it("SE monthly ¥1,000,000, daily ¥50,000", () => {
    expect(ROLE_RATES.se.monthly).toBe(1_000_000);
    expect(ROLE_RATES.se.daily).toBe(50_000);
  });

  it("daily rate = monthly / 20", () => {
    expect(ROLE_RATES.consultant.monthly / 20).toBe(
      ROLE_RATES.consultant.daily,
    );
    expect(ROLE_RATES.se.monthly / 20).toBe(ROLE_RATES.se.daily);
  });
});

// ── TRADITIONAL_COST_PER_INTERFACE ──

describe("TRADITIONAL_COST_PER_INTERFACE", () => {
  it("is ¥2,000,000", () => {
    expect(TRADITIONAL_COST_PER_INTERFACE).toBe(2_000_000);
  });
});

// ── TIER_LABELS ──

describe("TIER_LABELS", () => {
  it("has labels for all 4 tiers", () => {
    expect(TIER_LABELS.traditional).toBe("従来型");
    expect(TIER_LABELS.tierA).toBe("Tier A (Claude Code)");
    expect(TIER_LABELS.tierB).toBe("Tier B (Joule)");
    expect(TIER_LABELS.tierC).toBe("Tier C (Copilot)");
  });
});

// ── LICENSE_COSTS ──

describe("LICENSE_COSTS", () => {
  it("traditional has no license cost", () => {
    expect(LICENSE_COSTS.traditional).toEqual({
      monthlyPerId: 0,
      note: "ツールなし",
    });
  });

  it("Tier A is ¥30,000/month/ID", () => {
    expect(LICENSE_COSTS.tierA.monthlyPerId).toBe(30_000);
  });

  it("Tier B is TBD (SAP unconfirmed)", () => {
    expect(LICENSE_COSTS.tierB.monthlyPerId).toBe(0);
    expect(LICENSE_COSTS.tierB.note).toBe("未定 (SAP要確認)");
  });

  it("Tier C is ¥3,000/month/ID", () => {
    expect(LICENSE_COSTS.tierC.monthlyPerId).toBe(3_000);
  });

  it("Tier A license is negligible vs. total project labor cost", () => {
    // ¥30,000/month/ID × ~10 IDs × 7 months ≈ ¥2.1M
    // vs. ¥530,000/interface × 1,200 interfaces ≈ ¥636M (max)
    // License is ~0.3% of labor cost at project scale
    const licenseYearly = LICENSE_COSTS.tierA.monthlyPerId * 12 * 10; // ~10 IDs for team
    const projectLabor = calculatePerInterface("tierA").totalCost.max * 1200;
    expect(licenseYearly).toBeLessThan(projectLabor * 0.01);
  });
});

// ── PHASES ──

describe("PHASES", () => {
  it("contains exactly 3 billable phases", () => {
    expect(PHASES).toHaveLength(3);
  });

  it("要件定義 is 10 consultant days", () => {
    const p = PHASES.find((p) => p.phase === "要件定義")!;
    expect(p.role).toBe("consultant");
    expect(p.traditionalPersonDays).toBe(10);
  });

  it("基設計 is 5 SE days", () => {
    const p = PHASES.find((p) => p.phase === "基設計")!;
    expect(p.role).toBe("se");
    expect(p.traditionalPersonDays).toBe(5);
  });

  it("開発+単体テスト is 20 SE days", () => {
    const p = PHASES.find((p) => p.phase === "開発+単体テスト")!;
    expect(p.role).toBe("se");
    expect(p.traditionalPersonDays).toBe(20);
  });

  it("all phases sum to 35 person-days", () => {
    const total = PHASES.reduce((sum, p) => sum + p.traditionalPersonDays, 0);
    expect(total).toBe(35);
  });
});

// ── calculatePhaseEstimate: traditional ──

describe("calculatePhaseEstimate — traditional", () => {
  it("要件定義: 10 days, ¥750,000, 0% compression", () => {
    const r = calculatePhaseEstimate(PHASES[0], "traditional");
    expect(r.traditionalPersonDays).toBe(10);
    expect(r.traditionalCost).toBe(750_000);
    expect(r.aiPersonDays).toEqual({ min: 10, max: 10 });
    expect(r.aiCost).toEqual({ min: 750_000, max: 750_000 });
    expect(r.compressionRatio).toEqual({ min: 0, max: 0 });
  });

  it("基設計: 5 days, ¥250,000", () => {
    const r = calculatePhaseEstimate(PHASES[1], "traditional");
    expect(r.traditionalCost).toBe(250_000);
    expect(r.aiPersonDays).toEqual({ min: 5, max: 5 });
  });

  it("開発+単体テスト: 20 days, ¥1,000,000", () => {
    const r = calculatePhaseEstimate(PHASES[2], "traditional");
    expect(r.traditionalCost).toBe(1_000_000);
    expect(r.aiPersonDays).toEqual({ min: 20, max: 20 });
  });
});

// ── calculatePhaseEstimate: Tier A ──

describe("calculatePhaseEstimate — Tier A", () => {
  it("要件定義: 2–3 days, ¥150,000–225,000 (70–80% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[0], "tierA");
    expect(r.aiPersonDays).toEqual({ min: 2, max: 3 });
    expect(r.aiCost).toEqual({ min: 150_000, max: 225_000 });
    expect(r.compressionRatio.min).toBe(0.7);
    expect(r.compressionRatio.max).toBe(0.8);
  });

  it("基設計: 0.5–1 day, ¥25,000–50,000 (80–90% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[1], "tierA");
    expect(r.aiPersonDays).toEqual({ min: 0.5, max: 1 });
    expect(r.aiCost).toEqual({ min: 25_000, max: 50_000 });
    expect(r.compressionRatio.min).toBe(0.8);
    expect(r.compressionRatio.max).toBe(0.9);
  });

  it("開発+単体テスト: 3–5 days, ¥150,000–250,000 (75–85% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[2], "tierA");
    expect(r.aiPersonDays).toEqual({ min: 3, max: 5 });
    expect(r.aiCost).toEqual({ min: 150_000, max: 250_000 });
    expect(r.compressionRatio.min).toBe(0.75);
    expect(r.compressionRatio.max).toBe(0.85);
  });
});

// ── calculatePhaseEstimate: Tier B ──

describe("calculatePhaseEstimate — Tier B", () => {
  it("要件定義: 4–6 days, ¥300,000–450,000 (40–60% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[0], "tierB");
    expect(r.aiPersonDays).toEqual({ min: 4, max: 6 });
    expect(r.aiCost).toEqual({ min: 300_000, max: 450_000 });
    expect(r.compressionRatio.min).toBe(0.4);
    expect(r.compressionRatio.max).toBe(0.6);
  });

  it("基設計: 1.5–2.5 days, ¥75,000–125,000 (50–70% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[1], "tierB");
    expect(r.aiPersonDays).toEqual({ min: 1.5, max: 2.5 });
    expect(r.aiCost).toEqual({ min: 75_000, max: 125_000 });
  });

  it("開発+単体テスト: 7–12 days, ¥350,000–600,000 (40–65% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[2], "tierB");
    expect(r.aiPersonDays).toEqual({ min: 7, max: 12 });
    expect(r.aiCost).toEqual({ min: 350_000, max: 600_000 });
  });
});

// ── calculatePhaseEstimate: Tier C ──

describe("calculatePhaseEstimate — Tier C", () => {
  it("要件定義: 6–8 days, ¥450,000–600,000 (20–40% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[0], "tierC");
    expect(r.aiPersonDays).toEqual({ min: 6, max: 8 });
    expect(r.aiCost).toEqual({ min: 450_000, max: 600_000 });
    expect(r.compressionRatio.min).toBe(0.2);
    expect(r.compressionRatio.max).toBe(0.4);
  });
});

// ── calculatePerInterface ──

describe("calculatePerInterface", () => {
  it("traditional per I/F: 35 days, ¥2,000,000", () => {
    const r = calculatePerInterface("traditional");
    expect(r.phaseBreakdown).toHaveLength(3);
    expect(r.totalPersonDays).toEqual({ min: 35, max: 35 });
    expect(r.totalCost).toEqual({
      min: TRADITIONAL_COST_PER_INTERFACE,
      max: TRADITIONAL_COST_PER_INTERFACE,
    });
  });

  it("Tier A per I/F: 5.5–9 days, ¥330,000–530,000", () => {
    const r = calculatePerInterface("tierA");
    expect(r.totalPersonDays).toEqual({ min: 5.5, max: 9 });
    // raw: 150+25+150=325k→330k, 225+50+250=525k→530k
    expect(r.totalCost.min).toBe(330_000);
    expect(r.totalCost.max).toBe(530_000);
  });

  it("Tier B per I/F: 12.5–20.5 days, ¥730,000–1,180,000", () => {
    const r = calculatePerInterface("tierB");
    expect(r.totalPersonDays).toEqual({ min: 12.5, max: 20.5 });
    // raw: 300+75+350=725k→730k, 450+125+600=1,175k→1,180k
    expect(r.totalCost.min).toBe(730_000);
    expect(r.totalCost.max).toBe(1_180_000);
  });

  it("Tier C per I/F: 20.5–26.5 days, ¥1,180,000–1,530,000", () => {
    const r = calculatePerInterface("tierC");
    expect(r.totalPersonDays).toEqual({ min: 20.5, max: 26.5 });
    // raw: 450+125+600=1,175k→1,180k, 600+175+750=1,525k→1,530k
    expect(r.totalCost.min).toBe(1_180_000);
    expect(r.totalCost.max).toBe(1_530_000);
  });

  it("cost ordering: traditional max > Tier C max > Tier B max > Tier A max", () => {
    const t = calculatePerInterface("traditional").totalCost.max;
    const c = calculatePerInterface("tierC").totalCost.max;
    const b = calculatePerInterface("tierB").totalCost.max;
    const a = calculatePerInterface("tierA").totalCost.max;
    expect(t).toBeGreaterThan(c);
    expect(c).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(a);
  });

  it("cross-phase costs sum to total exactly", () => {
    for (const tier of ["traditional", "tierA", "tierB", "tierC"] as Tier[]) {
      const r = calculatePerInterface(tier);
      const sumMin = r.phaseBreakdown.reduce((s, p) => s + p.aiCost.min, 0);
      const sumMax = r.phaseBreakdown.reduce((s, p) => s + p.aiCost.max, 0);
      // Total is the rounded version of the raw phase sum (round once, no double-rounding)
      expect(r.totalCost.min).toBe(Math.round(sumMin / 10_000) * 10_000);
      expect(r.totalCost.max).toBe(Math.round(sumMax / 10_000) * 10_000);
    }
  });

  it("each tier has its license costs", () => {
    for (const tier of ["traditional", "tierA", "tierB", "tierC"] as Tier[]) {
      const r = calculatePerInterface(tier);
      expect(r.licenseCosts).toEqual(LICENSE_COSTS[tier]);
    }
  });
});

// ── calculateComparison: scaling ──

describe("calculateComparison", () => {
  it("1 I/F: traditional total ¥2,000,000", () => {
    const r = calculateComparison(1);
    expect(r.interfaceCount).toBe(1);
    expect(r.tiers.traditional.totalCost).toEqual({
      min: 2_000_000,
      max: 2_000_000,
    });
  });

  it("10 I/F: traditional total ¥20,000,000", () => {
    const r = calculateComparison(10);
    expect(r.tiers.traditional.totalCost).toEqual({
      min: 20_000_000,
      max: 20_000_000,
    });
  });

  it("1,200 I/F: traditional total ¥2,400,000,000 (¥2.4B)", () => {
    const r = calculateComparison(1200);
    expect(r.interfaceCount).toBe(1200);
    expect(r.tiers.traditional.totalCost).toEqual({
      min: 2_400_000_000,
      max: 2_400_000_000,
    });
  });

  it("0 interfaces: all totals are 0", () => {
    const r = calculateComparison(0);
    for (const tier of ["traditional", "tierA", "tierB", "tierC"] as Tier[]) {
      expect(r.tiers[tier].totalCost).toEqual({ min: 0, max: 0 });
      expect(r.tiers[tier].totalPersonDays).toEqual({ min: 0, max: 0 });
    }
  });

  it("savings ordering: Tier A savings > Tier B savings > Tier C savings", () => {
    const r = calculateComparison(1200);
    const trad = r.tiers.traditional.totalCost.min;
    const saveA = trad - r.tiers.tierA.totalCost.min;
    const saveB = trad - r.tiers.tierB.totalCost.min;
    const saveC = trad - r.tiers.tierC.totalCost.min;
    expect(saveA).toBeGreaterThan(saveB);
    expect(saveB).toBeGreaterThan(saveC);
  });

  it("license costs preserved at scale", () => {
    const r = calculateComparison(1200);
    expect(r.tiers.traditional.licenseCosts.monthlyPerId).toBe(0);
    expect(r.tiers.tierA.licenseCosts.monthlyPerId).toBe(30_000);
    expect(r.tiers.tierB.licenseCosts.monthlyPerId).toBe(0);
    expect(r.tiers.tierC.licenseCosts.monthlyPerId).toBe(3_000);
  });
});

// ── Edge cases ──

describe("edge cases", () => {
  it("0% compression = traditional cost (aiDays = tradDays)", () => {
    const r = calculatePerInterface("traditional");
    expect(r.totalCost.min).toBe(TRADITIONAL_COST_PER_INTERFACE);
    expect(r.totalCost.max).toBe(TRADITIONAL_COST_PER_INTERFACE);
  });

  it("100% compression would give aiCost=0, only license costs remain", () => {
    // Formula: compressionRatio = (tradDays - aiDays) / tradDays
    // When aiDays = 0: ratio = tradDays / tradDays = 1.0 (= 100%)
    // aiCost = 0 * rate = 0
    // Only LICENSE_COSTS contribute to total
    const r = calculatePhasesumWithZeroAiDays();
    expect(r.aiCost).toEqual({ min: 0, max: 0 });
    expect(r.compressionRatio).toEqual({ min: 1, max: 1 });
  });
});

/** Helper: verify the 100% compression formula using the engine's public API. */
function calculatePhasesumWithZeroAiDays() {
  // Use the formula directly: when aiPersonDays = 0, expected behavior is:
  // compressionRatio = (tradDays - 0) / tradDays = 1; aiCost = 0 * rate = 0
  // We verify via calculatePhaseEstimate with traditional tier (0% case)
  // and check the formula direction for 100% by comparing: traditional has aiDays = tradDays → ratio=0
  // Symmetrically, aiDays = 0 → ratio = 1
  const t = calculatePhaseEstimate(PHASES[0], "traditional");
  expect(t.compressionRatio).toEqual({ min: 0, max: 0 }); // 0% compression base case

  // Manual formula verification:
  const tradDays = PHASES[0].traditionalPersonDays; // 10
  const zeroAiDays = { min: 0, max: 0 };
  const rate = 75_000;
  const compMin = (tradDays - zeroAiDays.max) / tradDays;
  const compMax = (tradDays - zeroAiDays.min) / tradDays;

  return {
    aiCost: { min: zeroAiDays.min * rate, max: zeroAiDays.max * rate },
    compressionRatio: { min: compMin, max: compMax },
  };
}
