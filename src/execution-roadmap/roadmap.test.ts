import { describe, it, expect } from "vitest";
import { ROADMAP } from "./roadmap";

const ALL_PHASES = ["要件定義", "基本設計", "開発+単体テスト"] as const;

describe("ROADMAP — workflows", () => {
  it("has workflow steps for all 3 billable phases", () => {
    const phases = ROADMAP.workflows.map((w) => w.phase);
    for (const phase of ALL_PHASES) {
      expect(phases, `missing workflow for phase: ${phase}`).toContain(phase);
    }
  });

  it("every workflow has aiRole and humanRole defined", () => {
    for (const w of ROADMAP.workflows) {
      expect(w.aiRole.length).toBeGreaterThan(0);
      expect(w.humanRole.length).toBeGreaterThan(0);
    }
  });

  it("every workflow has at least one output artifact", () => {
    for (const w of ROADMAP.workflows) {
      expect(w.outputArtifacts.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every workflow has a recommended AI tier", () => {
    for (const w of ROADMAP.workflows) {
      expect(["tierA", "tierB", "tierC", "traditional"]).toContain(
        w.recommendedTier,
      );
    }
  });

  it("workflow phases are in project order", () => {
    expect(ROADMAP.workflows[0].phase).toBe("要件定義");
    expect(ROADMAP.workflows[1].phase).toBe("基本設計");
    expect(ROADMAP.workflows[2].phase).toBe("開発+単体テスト");
  });

  it("要件定義 input comes from client/Salesforce, not a previous phase", () => {
    const req = ROADMAP.workflows.find((w) => w.phase === "要件定義")!;
    expect(req.inputFrom).not.toBe("基本設計");
    expect(req.inputFrom).not.toBe("開発+単体テスト");
  });

  it("design phase outputs include 設計書・マッピングシート", () => {
    const design = ROADMAP.workflows.find((w) => w.phase === "基本設計")!;
    expect(design.outputArtifacts).toContain("設計書・マッピングシート");
  });

  it("development phase outputs include ABAPコード", () => {
    const dev = ROADMAP.workflows.find(
      (w) => w.phase === "開発+単体テスト",
    )!;
    expect(dev.outputArtifacts).toContain("ABAPコード");
    expect(dev.outputArtifacts).toContain("テスト仕様書");
  });
});

describe("ROADMAP — PoC", () => {
  it("covers 10–20 interfaces", () => {
    expect(ROADMAP.poc.interfaceCount.min).toBeGreaterThanOrEqual(10);
    expect(ROADMAP.poc.interfaceCount.max).toBeLessThanOrEqual(20);
  });

  it("covers at least 3 interface categories", () => {
    expect(ROADMAP.poc.categories.length).toBeGreaterThanOrEqual(3);
  });

  it("includes accounting interfaces", () => {
    expect(
      ROADMAP.poc.categories.some((c) => c.includes("会計")),
    ).toBe(true);
  });

  it("includes sales order interfaces", () => {
    expect(
      ROADMAP.poc.categories.some(
        (c) => c.includes("受注") || c.includes("販売"),
      ),
    ).toBe(true);
  });

  it("includes master data interfaces", () => {
    expect(
      ROADMAP.poc.categories.some(
        (c) => c.includes("マスタ") || c.includes("購買"),
      ),
    ).toBe(true);
  });

  it("PoC happens during 要件定義 phase", () => {
    expect(ROADMAP.poc.duringPhase).toBe("要件定義");
  });

  it("PoC has at least 3 success criteria", () => {
    expect(ROADMAP.poc.successCriteria.length).toBeGreaterThanOrEqual(3);
  });

  it("PoC evaluates both Tier A and Tier B", () => {
    expect(ROADMAP.poc.evaluateTiers).toContain("tierA");
    expect(ROADMAP.poc.evaluateTiers).toContain("tierB");
  });

  it("PoC duration is 4–8 weeks", () => {
    expect(ROADMAP.poc.durationWeeks).toBeGreaterThanOrEqual(4);
    expect(ROADMAP.poc.durationWeeks).toBeLessThanOrEqual(8);
  });
});

describe("ROADMAP — rollout", () => {
  it("has exactly 4 rollout steps in order 1–4", () => {
    expect(ROADMAP.rollout).toHaveLength(4);
    expect(ROADMAP.rollout.map((s) => s.order)).toEqual([1, 2, 3, 4]);
  });

  it("Step 1 uses Tier C (Copilot) — immediate", () => {
    const step1 = ROADMAP.rollout.find((s) => s.order === 1)!;
    expect(step1.tier).toBe("tierC");
    expect(step1.timing).toMatch(/即時|即日|直ちに|すぐ/);
  });

  it("Step 2 uses Tier A (Claude Code) — PoC during 要件定義", () => {
    const step2 = ROADMAP.rollout.find((s) => s.order === 2)!;
    expect(step2.tier).toBe("tierA");
    expect(step2.timing).toMatch(/要件定義/);
  });

  it("Step 3 uses Tier B (Joule) — evaluation", () => {
    const step3 = ROADMAP.rollout.find((s) => s.order === 3)!;
    expect(step3.tier).toBe("tierB");
  });

  it("Step 4 is full adoption decision", () => {
    const step4 = ROADMAP.rollout.find((s) => s.order === 4)!;
    expect(step4.timing).toMatch(/設計|開発/);
  });

  it("every rollout step has a decision gate description", () => {
    for (const step of ROADMAP.rollout) {
      expect(step.gate.length).toBeGreaterThan(0);
    }
  });
});

describe("ROADMAP — decision gates", () => {
  it("has at least 2 decision gates", () => {
    expect(ROADMAP.decisionGates.length).toBeGreaterThanOrEqual(2);
  });

  it("has a PoC decision gate with pass/fail criteria", () => {
    const pocGate = ROADMAP.decisionGates.find((g) =>
      g.id.includes("poc"),
    );
    expect(pocGate).toBeDefined();
    expect(pocGate!.passCriteria.length).toBeGreaterThanOrEqual(1);
    expect(pocGate!.failCriteria.length).toBeGreaterThanOrEqual(1);
    expect(pocGate!.fallback.length).toBeGreaterThan(0);
  });

  it("has a Tier B (Joule) evaluation gate", () => {
    const jouleGate = ROADMAP.decisionGates.find(
      (g) => g.id.includes("joule") || g.question.includes("Joule"),
    );
    expect(jouleGate).toBeDefined();
  });

  it("fallback paths lead to Tier A when Tier B fails", () => {
    const jouleGate = ROADMAP.decisionGates.find(
      (g) => g.id.includes("joule") || g.question.includes("Joule"),
    );
    expect(jouleGate!.fallback).toMatch(/Tier A|Claude Code|tierA/);
  });
});
