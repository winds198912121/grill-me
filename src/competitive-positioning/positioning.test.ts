import { describe, it, expect } from "vitest";
import {
  POSITIONING,
  getClaims,
  getDemoEvidence,
  getRebuttals,
  getElevatorPitch,
} from "./positioning";

describe("POSITIONING", () => {
  it("has a non-empty executive summary", () => {
    expect(POSITIONING.executiveSummary.length).toBeGreaterThan(50);
  });

  it("has at least 3 competitive claims", () => {
    expect(POSITIONING.claims.length).toBeGreaterThanOrEqual(3);
  });

  it("has at least 2 demo evidence items (Ryu-san's track record)", () => {
    expect(POSITIONING.demoEvidence.length).toBeGreaterThanOrEqual(2);
  });

  it("has at least 3 competitor rebuttals", () => {
    expect(POSITIONING.rebuttals.length).toBeGreaterThanOrEqual(3);
  });

  it("every claim has a unique id", () => {
    const ids = POSITIONING.claims.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every claim has evidence and at least one supporting demo", () => {
    for (const claim of POSITIONING.claims) {
      expect(claim.evidence.length).toBeGreaterThan(0);
      expect(claim.supportedBy.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all claim supportedBy references point to existing demo evidence", () => {
    const demoIds = new Set(POSITIONING.demoEvidence.map((d) => d.id));
    for (const claim of POSITIONING.claims) {
      for (const ref of claim.supportedBy) {
        expect(
          demoIds.has(ref),
          `claim '${claim.id}' references demo '${ref}' which does not exist`,
        ).toBe(true);
      }
    }
  });

  it("every rebuttal has a competitor claim and our rebuttal", () => {
    for (const r of POSITIONING.rebuttals) {
      expect(r.competitorClaim.length).toBeGreaterThan(0);
      expect(r.rebuttal.length).toBeGreaterThan(0);
    }
  });

  it("all rebuttal backedBy references point to existing claims or demos", () => {
    const claimIds = new Set(POSITIONING.claims.map((c) => c.id));
    const demoIds = new Set(POSITIONING.demoEvidence.map((d) => d.id));
    const allIds = new Set([...claimIds, ...demoIds]);
    for (const r of POSITIONING.rebuttals) {
      for (const ref of r.backedBy) {
        expect(
          allIds.has(ref),
          `rebuttal '${r.id}' references '${ref}' which does not exist`,
        ).toBe(true);
      }
    }
  });

  it("all demo evidence has title, what, proves, and timeRequired", () => {
    for (const demo of POSITIONING.demoEvidence) {
      expect(demo.title.length).toBeGreaterThan(0);
      expect(demo.what.length).toBeGreaterThan(0);
      expect(demo.proves.length).toBeGreaterThan(0);
      expect(demo.timeRequired.length).toBeGreaterThan(0);
    }
  });

  it("one demo proves Fiori UI can be generated in hours not months", () => {
    const fioriDemo = POSITIONING.demoEvidence.find((d) =>
      d.title.includes("Fiori") || d.what.includes("Fiori"),
    );
    expect(fioriDemo).toBeDefined();
    expect(fioriDemo!.timeRequired).toMatch(/hour|時間|2/);
  });

  it("one claim addresses the 競合差別化 (competitive differentiation)", () => {
    const diffClaim = POSITIONING.claims.find(
      (c) =>
        c.claim.includes("差別化") ||
        c.claim.includes("競合") ||
        c.claim.includes("他社"),
    );
    expect(diffClaim).toBeDefined();
  });

  it("one rebuttal addresses competitor concerns about AI quality", () => {
    const qualityRebuttal = POSITIONING.rebuttals.find(
      (r) =>
        r.competitorClaim.includes("品質") ||
        r.competitorClaim.includes("精度") ||
        r.id.includes("quality"),
    );
    expect(qualityRebuttal).toBeDefined();
  });
});

describe("getClaims", () => {
  it("returns all claims", () => {
    expect(getClaims()).toEqual(POSITIONING.claims);
  });
});

describe("getDemoEvidence", () => {
  it("returns all demo evidence", () => {
    expect(getDemoEvidence()).toEqual(POSITIONING.demoEvidence);
  });
});

describe("getRebuttals", () => {
  it("returns all rebuttals", () => {
    expect(getRebuttals()).toEqual(POSITIONING.rebuttals);
  });
});

describe("getElevatorPitch", () => {
  it("returns the executive summary", () => {
    expect(getElevatorPitch()).toBe(POSITIONING.executiveSummary);
  });
});
