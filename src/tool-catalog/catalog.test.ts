import { describe, it, expect } from "vitest";
import {
  TOOL_CATALOG,
  getCapability,
  getPrivacyEvidence,
  getSupportedDeliverables,
} from "./catalog";
import type { Tier } from "../comparison-engine/types";

describe("TOOL_CATALOG", () => {
  it("has capability entries for all 4 tiers", () => {
    const tiers: Tier[] = ["traditional", "tierA", "tierB", "tierC"];
    for (const tier of tiers) {
      expect(TOOL_CATALOG.capabilities[tier]).toBeDefined();
      expect(TOOL_CATALOG.capabilities[tier].tier).toBe(tier);
    }
  });

  it("has privacy evidence entries for all 4 tiers", () => {
    const tiers: Tier[] = ["traditional", "tierA", "tierB", "tierC"];
    for (const tier of tiers) {
      expect(TOOL_CATALOG.privacyEvidence[tier]).toBeDefined();
      expect(TOOL_CATALOG.privacyEvidence[tier].tier).toBe(tier);
    }
  });

  it("no AI tier trains on customer data", () => {
    const aiTiers: Tier[] = ["tierA", "tierB", "tierC"];
    for (const tier of aiTiers) {
      const privacy = TOOL_CATALOG.privacyEvidence[tier];
      expect(
        privacy.trainsOnCustomerData,
        `${tier} must not train on customer data`,
      ).toBe(false);
    }
  });

  it("precision ordering: tierA > tierB > tierC > traditional", () => {
    const precisionRank: Record<string, number> = {
      "最高": 4,
      "高": 3,
      "中": 2,
      "低": 1,
      "なし": 0,
    };
    const a = precisionRank[TOOL_CATALOG.capabilities.tierA.precision];
    const b = precisionRank[TOOL_CATALOG.capabilities.tierB.precision];
    const c = precisionRank[TOOL_CATALOG.capabilities.tierC.precision];
    const t = precisionRank[TOOL_CATALOG.capabilities.traditional.precision];
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(c).toBeGreaterThan(t);
  });

  it("Tier C is 承認済み (already approved at Hitachi)", () => {
    expect(TOOL_CATALOG.capabilities.tierC.approvalStatus).toBe("承認済み");
  });

  it("Tier A requires approval at Hitachi", () => {
    expect(TOOL_CATALOG.capabilities.tierA.approvalStatus).toBe("要申請");
  });

  it("Tier B has shared IDs available for evaluation", () => {
    expect(TOOL_CATALOG.capabilities.tierB.approvalStatus).toBe("共有IDあり");
  });

  it("every tier has at least one strength and one limitation", () => {
    const tiers: Tier[] = ["traditional", "tierA", "tierB", "tierC"];
    for (const tier of tiers) {
      const cap = TOOL_CATALOG.capabilities[tier];
      expect(cap.strengths.length).toBeGreaterThan(0);
      expect(cap.limitations.length).toBeGreaterThan(0);
    }
  });

  it("every privacy evidence has a guarantee and contractual basis", () => {
    for (const tier of ["tierA", "tierB", "tierC"] as Tier[]) {
      const p = TOOL_CATALOG.privacyEvidence[tier];
      expect(p.guarantee.length).toBeGreaterThan(0);
      expect(p.contractualBasis.length).toBeGreaterThan(0);
      expect(p.dataFlowDescription.length).toBeGreaterThan(0);
    }
  });

  it("every AI tier supports 要件定義書 and 設計書 generation", () => {
    for (const tier of ["tierA", "tierB", "tierC"] as Tier[]) {
      const cap = TOOL_CATALOG.capabilities[tier];
      expect(cap.supportedDeliverables).toContain("要件定義書");
      expect(cap.supportedDeliverables).toContain("設計書・マッピングシート");
    }
  });

  it("Tier A supports all 6 deliverable types", () => {
    expect(TOOL_CATALOG.capabilities.tierA.supportedDeliverables.length).toBe(6);
  });

  it("Tier C does NOT support UI generation (Fiori)", () => {
    expect(
      TOOL_CATALOG.capabilities.tierC.supportedDeliverables,
    ).not.toContain("UI生成(Fiori)");
  });
});

describe("getCapability", () => {
  it("returns the capability for a valid tier", () => {
    const cap = getCapability("tierA");
    expect(cap.tier).toBe("tierA");
    expect(cap.vendor).toBe("Anthropic");
  });

  it("returns traditional capability", () => {
    const cap = getCapability("traditional");
    expect(cap.tier).toBe("traditional");
  });
});

describe("getPrivacyEvidence", () => {
  it("returns privacy evidence for every AI tier", () => {
    for (const tier of ["tierA", "tierB", "tierC"] as Tier[]) {
      const p = getPrivacyEvidence(tier);
      expect(p.trainsOnCustomerData).toBe(false);
    }
  });
});

describe("getSupportedDeliverables", () => {
  it("returns the list of deliverables for each tier", () => {
    const d = getSupportedDeliverables("tierA");
    expect(d).toContain("ABAPコード");
    expect(d).toContain("テスト仕様書");
  });
});
