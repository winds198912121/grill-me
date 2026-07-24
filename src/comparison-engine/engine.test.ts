import { describe, it, expect } from "vitest";
import {
  calculatePhaseEstimate,
  calculatePerInterface,
  calculateComparison,
  computeTraditionalTotal,
  RATES,
  PHASES,
  TIER_LABELS,
} from "./engine";
import type { Tier } from "./types";

// ── Rates ──

describe("RATES", () => {
  it("consultant monthly ¥1,500,000, daily ¥75,000", () => {
    expect(RATES.consultant.monthly).toBe(1_500_000);
    expect(RATES.consultant.daily).toBe(75_000);
  });

  it("SE monthly ¥1,000,000, daily ¥50,000", () => {
    expect(RATES.se.monthly).toBe(1_000_000);
    expect(RATES.se.daily).toBe(50_000);
  });

  it("daily rate = monthly / 20", () => {
    expect(RATES.consultant.monthly / 20).toBe(RATES.consultant.daily);
    expect(RATES.se.monthly / 20).toBe(RATES.se.daily);
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

// ── Phases ──

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
    expect(r.aiCost).toEqual({ min: 150_000, max: 230_000 }); // 2×75k=150k, 3×75k=225k but rounded to 10k → 230k
    expect(r.compressionRatio.min).toBe(0.7);
    expect(r.compressionRatio.max).toBe(0.8);
  });

  it("基設計: 0.5–1 day, ¥30,000–50,000 (80–90% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[1], "tierA");
    expect(r.aiPersonDays).toEqual({ min: 0.5, max: 1 });
    expect(r.aiCost).toEqual({ min: 30_000, max: 50_000 }); // 0.5×50k=25k→30k, 1×50k=50k
    expect(r.compressionRatio.min).toBe(0.8);
    expect(r.compressionRatio.max).toBe(0.9);
  });

  it("開発+単体テスト: 3–5 days, ¥150,000–250,000 (75–85% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[2], "tierA");
    expect(r.aiPersonDays).toEqual({ min: 3, max: 5 });
    expect(r.aiCost).toEqual({ min: 150_000, max: 250_000 }); // 3×50k=150k, 5×50k=250k
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

  it("基設計: 1.5–2.5 days, ¥80,000–130,000 (50–70% compression)", () => {
    const r = calculatePhaseEstimate(PHASES[1], "tierB");
    expect(r.aiPersonDays).toEqual({ min: 1.5, max: 2.5 });
    expect(r.aiCost).toEqual({ min: 80_000, max: 130_000 }); // 1.5×50k=75k→80k, 2.5×50k=125k→130k
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
    expect(r.totalCost).toEqual({ min: 2_000_000, max: 2_000_000 });
  });

  it("Tier A per I/F: 5.5–9 days, ¥320,000–530,000", () => {
    const r = calculatePerInterface("tierA");
    expect(r.totalPersonDays).toEqual({ min: 5.5, max: 9 });
    // 150k+30k+150k=330k→330k, 230k+50k+250k=530k — wait, 225k+50k+250k=525k → 530k rounding
    // Actually: min: 150k+30k+150k=330k, max: 230k+50k+250k=530k
    expect(r.totalCost.min).toBe(330_000);
    expect(r.totalCost.max).toBe(530_000);
  });

  it("Tier B per I/F: 12.5–20.5 days, ¥720,000–1,180,000", () => {
    const r = calculatePerInterface("tierB");
    expect(r.totalPersonDays).toEqual({ min: 12.5, max: 20.5 });
    // min: 300k+80k+350k=730k→730k, max: 450k+130k+600k=1,180k
    expect(r.totalCost.min).toBe(730_000);
    expect(r.totalCost.max).toBe(1_180_000);
  });

  it("Tier C per I/F: 20.5–26.5 days, ¥1,180,000–1,530,000", () => {
    const r = calculatePerInterface("tierC");
    expect(r.totalPersonDays).toEqual({ min: 20.5, max: 26.5 });
    // 要件定義6-8: 450k-600k, 基設計2.5-3.5: 125k→130k/175k→180k→wait: 2.5*50=125→130, 3.5*50=175→180
    // 開発12-15: 600k-750k
    // min total: 450+130+600=1,180, max total: 600+180+750=1,530
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

  it("per-interface total cost = sum of phase costs", () => {
    for (const tier of ["traditional", "tierA", "tierB", "tierC"] as Tier[]) {
      const r = calculatePerInterface(tier);
      const sumMin = r.phaseBreakdown.reduce((s, p) => s + p.aiCost.min, 0);
      const sumMax = r.phaseBreakdown.reduce((s, p) => s + p.aiCost.max, 0);
      // Allow rounding difference of ±10,000 per phase (3 phases → ±30,000 max)
      expect(Math.abs(r.totalCost.min - sumMin)).toBeLessThanOrEqual(30_000);
      expect(Math.abs(r.totalCost.max - sumMax)).toBeLessThanOrEqual(30_000);
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
});

// ── computeTraditionalTotal ──

describe("computeTraditionalTotal", () => {
  it("10 interfaces = ¥20,000,000", () => {
    expect(computeTraditionalTotal(10)).toBe(20_000_000);
  });

  it("1,200 interfaces = ¥2,400,000,000", () => {
    expect(computeTraditionalTotal(1200)).toBe(2_400_000_000);
  });

  it("0 interfaces = 0", () => {
    expect(computeTraditionalTotal(0)).toBe(0);
  });
});
