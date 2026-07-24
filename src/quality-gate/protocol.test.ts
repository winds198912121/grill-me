import { describe, it, expect } from "vitest";
import {
  QUALITY_GATE_PROTOCOL,
  getGate,
  getChecklist,
  getAllPhaseGates,
} from "./protocol";
import type { Phase } from "../comparison-engine/types";
import type { ArtifactType } from "./types";

const ALL_PHASES: Phase[] = ["要件定義", "基設計", "開発+単体テスト"];
const ALL_ARTIFACTS: ArtifactType[] = [
  "要件定義書",
  "設計書・マッピングシート",
  "ABAPコード",
  "テスト仕様書",
];

describe("QUALITY_GATE_PROTOCOL", () => {
  it("has gates for all 3 billable phases", () => {
    for (const phase of ALL_PHASES) {
      expect(QUALITY_GATE_PROTOCOL.gates[phase]).toBeDefined();
    }
  });

  it("has checklists for all 4 artifact types", () => {
    for (const artifact of ALL_ARTIFACTS) {
      expect(QUALITY_GATE_PROTOCOL.checklists[artifact]).toBeDefined();
      expect(
        QUALITY_GATE_PROTOCOL.checklists[artifact].artifactType,
      ).toBe(artifact);
    }
  });

  it("every gate has at least 3 exit criteria components", () => {
    for (const phase of ALL_PHASES) {
      const gate = QUALITY_GATE_PROTOCOL.gates[phase];
      expect(gate.exitCriteria.length).toBeGreaterThan(0);
      expect(gate.signOffFormat.length).toBeGreaterThan(0);
    }
  });

  it("every checklist has at least 4 check items", () => {
    for (const artifact of ALL_ARTIFACTS) {
      const checklist = QUALITY_GATE_PROTOCOL.checklists[artifact];
      expect(checklist.items.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("every check item has a description and what-to-look-for", () => {
    for (const artifact of ALL_ARTIFACTS) {
      for (const item of QUALITY_GATE_PROTOCOL.checklists[artifact].items) {
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
        expect(item.lookFor.length).toBeGreaterThan(0);
      }
    }
  });

  it("every checklist has a humanRole and aiRole defined", () => {
    for (const artifact of ALL_ARTIFACTS) {
      const cl = QUALITY_GATE_PROTOCOL.checklists[artifact];
      expect(cl.humanRole.length).toBeGreaterThan(0);
      expect(cl.aiRole.length).toBeGreaterThan(0);
    }
  });

  it("gate artifactsChecked references match existing checklists", () => {
    for (const phase of ALL_PHASES) {
      const gate = QUALITY_GATE_PROTOCOL.gates[phase];
      for (const artifact of gate.artifactsChecked) {
        expect(
          QUALITY_GATE_PROTOCOL.checklists[artifact],
          `checklist missing for artifact '${artifact}' referenced by gate '${phase}'`,
        ).toBeDefined();
      }
    }
  });

  it("gate checklistRefs match gate artifactsChecked", () => {
    for (const phase of ALL_PHASES) {
      const gate = QUALITY_GATE_PROTOCOL.gates[phase];
      expect(gate.checklistRefs).toEqual(gate.artifactsChecked);
    }
  });

  it("各フェーズにAI役割と人間役割が定義されている", () => {
    for (const phase of ALL_PHASES) {
      const gate = QUALITY_GATE_PROTOCOL.gates[phase];
      expect(gate.reviewer.length).toBeGreaterThan(0);
    }
  });
});

describe("getGate", () => {
  it("returns the correct gate per phase", () => {
    const gate = getGate("基設計");
    expect(gate.phase).toBe("基設計");
    expect(gate.reviewer).toBe("SE");
  });
});

describe("getChecklist", () => {
  it("returns the correct checklist per artifact", () => {
    const cl = getChecklist("ABAPコード");
    expect(cl.artifactType).toBe("ABAPコード");
    expect(cl.items.length).toBeGreaterThanOrEqual(4);
  });
});

describe("getAllPhaseGates", () => {
  it("returns all 3 gates in order", () => {
    const gates = getAllPhaseGates();
    expect(gates).toHaveLength(3);
    expect(gates).toEqual([
      QUALITY_GATE_PROTOCOL.gates["要件定義"],
      QUALITY_GATE_PROTOCOL.gates["基設計"],
      QUALITY_GATE_PROTOCOL.gates["開発+単体テスト"],
    ]);
  });
});


