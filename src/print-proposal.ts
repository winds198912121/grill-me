/**
 * print-proposal.ts
 *
 * Reads all 5 modules and prints a complete proposal document.
 * Run: bun run src/print-proposal.ts
 * Output: ai-assisted-implementation-proposal.md (overwritten)
 */

import { writeFileSync } from "node:fs";
import { calculateComparison, calculatePerInterface, TIER_LABELS } from "./comparison-engine/engine";
import { TOOL_CATALOG } from "./tool-catalog/catalog";
import { QUALITY_GATE_PROTOCOL, getAllPhaseGates } from "./quality-gate/protocol";
import { POSITIONING } from "./competitive-positioning/positioning";
import { ROADMAP } from "./execution-roadmap/roadmap";
import type { Tier, Phase } from "./comparison-engine/types";

const INTERFACE_COUNT = 1200;

// ── Helpers ──────────────────────────────────────────────────────────────────

// All monetary values in 万円 (man-yen) for consistency.
// 1 億円 = 10,000 万円
const fmt = (n: number): string => {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}億円`;
  return `${(n / 10_000).toFixed(0)}万円`;
};

const tierOrder: Tier[] = ["traditional", "tierA", "tierB", "tierC"];

const range = (min: number, max: number): string => min === max ? `${min}` : `${min}–${max}`;
const rangeYen = (min: number, max: number): string => min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;

function print() {
  const cmp = calculateComparison(INTERFACE_COUNT);
  const lines: string[] = [];

  // ── 1. 概要 ────────────────────────────────────────────────────────────────
  lines.push("# AI活用によるSAP S/4HANA移行プロジェクト 効率化提案書");
  lines.push("");
  lines.push(`**作成日**: 2026年7月25日`);
  lines.push(`**対象I/F数**: ${INTERFACE_COUNT.toLocaleString()}本`);
  lines.push("");

  lines.push("## 1. エグゼクティブサマリー");
  lines.push("");
  lines.push(POSITIONING.executiveSummary);
  lines.push("");

  // ── システム全体構成図 ────────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## 2. 全体システム構成図");
  lines.push("");
  lines.push("```mermaid");
  lines.push("flowchart TB");
  lines.push("  subgraph Users[ユーザー層]");
  lines.push("    direction LR");
  lines.push('    SU["営業担当<br/>1,800ユーザー<br/>(Salesforce経由)"]');
  lines.push('    AU["経理担当<br/>直接SAP利用"]');
  lines.push("  end");
  lines.push("");
  lines.push('  subgraph SF[Salesforce 層]');
  lines.push('    direction TB');
  lines.push('    SO["受注入力画面<br/>Sales Order Entry"]');
  lines.push('    PO["購買発注入力画面<br/>Purchase Order Entry"]');
  lines.push('    MD["マスタデータ管理画面<br/>Master Data Mgmt"]');
  lines.push("  end");
  lines.push("");
  lines.push('  subgraph BTP["SAP BTP (Middleware | マッピング・連携基盤)"]');
  lines.push('    direction TB');
  lines.push('    subgraph BTP_IF["約1,200 I/F (Integration Suite / CPI)"]');
  lines.push('    IF1["会計I/F<br/>約840本<br/>仕訳伝票・債権債務"]');
  lines.push('    IF2["販売I/F<br/>受注伝票・出荷"]');
  lines.push('    IF3["購買I/F・マスタI/F<br/>発注伝票・得意先/仕入先"]');
  lines.push('    end');
  lines.push('    subgraph BTP_API["API Management"]');
  lines.push('    API1["Salesforce ↔ BTP<br/>REST/SOAP API"]');
  lines.push('    API2["BTP ↔ S/4HANA<br/>RFC/BAPI/IDoc"]');
  lines.push('    end');
  lines.push('    subgraph BTP_MAP["マッピング・変換"]');
  lines.push('    MAP1["項目マッピング<br/>Salesforce項目→SAP項目"]');
  lines.push('    MAP2["データ型変換<br/>日付・コード・単位"]');
  lines.push('    MAP3["エラーハンドリング<br/>再送・キュー管理"]');
  lines.push('    end');
  lines.push("  end");
  lines.push("");
  lines.push('  subgraph SAP["SAP S/4HANA 層"]');
  lines.push('    direction TB');
  lines.push('    FI["会計モジュール (FI)<br/>総勘定元帳・債権債務"]');
  lines.push('    SD["販売管理 (SD)<br/>受注・出荷・請求"]');
  lines.push('    MM["購買管理 (MM)<br/>発注・入庫・請求照合"]');
  lines.push('    MDM["マスタデータ<br/>得意先・仕入先・品目"]');
  lines.push("  end");
  lines.push("");
  lines.push('  subgraph AI[AI支援開発パイプライン]');
  lines.push('    direction LR');
  lines.push('    CE["① コスト比較<br/>エンジン<br/>Seam 1"]');
  lines.push('    CT["② ツール選定<br/>＋品質ゲート<br/>Seam 2"]');
  lines.push('    CP["③ 競合優位性<br/>＋実行ロードマップ"]');
  lines.push("  end");
  lines.push("");
  lines.push('  subgraph Gates["品質ゲート (Seam 2)"]');
  lines.push('    direction LR');
  lines.push('    G1["要件定義ゲート<br/>ｺﾝｻﾙﾀﾝﾄ承認"] --> G2["基本設計ゲート<br/>SE承認"] --> G3["開発+単体<br/>テストゲート<br/>SE承認"]');
  lines.push("  end");
  lines.push("");
  lines.push("  SU --> SO");
  lines.push("  SU --> PO");
  lines.push("  SU --> MD");
  lines.push("  AU --> SAP");
  lines.push("  SO --> API1");
  lines.push("  PO --> API1");
  lines.push("  MD --> API1");
  lines.push("  API1 --> MAP1");
  lines.push("  MAP1 --> MAP2");
  lines.push("  MAP2 --> IF1");
  lines.push("  MAP2 --> IF2");
  lines.push("  MAP2 --> IF3");
  lines.push("  IF1 --> API2");
  lines.push("  IF2 --> API2");
  lines.push("  IF3 --> API2");
  lines.push("  API2 --> FI");
  lines.push("  API2 --> SD");
  lines.push("  API2 --> MM");
  lines.push("  API2 --> MDM");
  lines.push("  MAP3 -.-> API1");
  lines.push("  AI -.-> BTP");
  lines.push("  Gates -.-> SF");
  lines.push("  Gates -.-> SAP");
  lines.push("");
  lines.push('  style Users fill:#e1f5fe');
  lines.push('  style SF fill:#fff9c4');
  lines.push('  style BTP fill:#ffccbc');
  lines.push('  style BTP_IF fill:#ffe0b2');
  lines.push('  style BTP_API fill:#ffecb3');
  lines.push('  style BTP_MAP fill:#fff3e0');
  lines.push('  style SAP fill:#c8e6c9');
  lines.push('  style AI fill:#e1bee7');
  lines.push('  style Gates fill:#bdbdbd');
  lines.push("```");
  lines.push("");
  lines.push("**ポイント**:");
  lines.push("");
  lines.push("- **1,800人の営業担当者はSalesforceのみを操作**し、SAPを直接触らない");
  lines.push("- **経理担当者のみSAP画面を直接利用**（会計業務）");
  lines.push("- **SAP BTP** が Salesforce と S/4HANA 間の Middleware。API Management / Integration Suite / マッピング変換を担う");
  lines.push("- **約1,200本のI/F**がBTP上でデータ連携を実行（本プロジェクトの主要開発対象）");
  lines.push("- **AI支援開発パイプライン**が全フェーズ（要件定義〜テスト）を効率化");
  lines.push("- **3つの品質ゲート**でAI生成成果物を人間がレビュー・承認");
  lines.push("");

  // ── 3. コスト比較 ──────────────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## 3. コスト比較");
  lines.push("");

  lines.push(`従来型開発とAI支援開発（3階層）のコスト比較。対象I/F数: ${INTERFACE_COUNT}本。`);
  lines.push("");
  lines.push("| 方式 | 総工数 | 総費用 | 従来比削減額 | ツール費用 |");
  lines.push("|------|--------|--------|-------------|-----------|");
  for (const tier of tierOrder) {
    const t = cmp.tiers[tier];
    const tradCost = cmp.tiers.traditional.totalCost.min;
    const saving = tier === "traditional" ? "-" : fmt(tradCost - t.totalCost.min);
    const license = t.licenseCosts.monthlyPerId > 0
      ? `¥${t.licenseCosts.monthlyPerId.toLocaleString()}/月/ID`
      : t.licenseCosts.note;
    lines.push(
      `| ${TIER_LABELS[tier]} | ${t.totalPersonDays.max.toLocaleString()}人日 | ${rangeYen(t.totalCost.min, t.totalCost.max)} | ${saving} | ${license} |`
    );
  }
  lines.push("");

  // Per-phase breakdown (per-interface, not scaled)
  const perIface: Record<Tier, ReturnType<typeof calculatePerInterface>> = {
    traditional: calculatePerInterface("traditional"),
    tierA: calculatePerInterface("tierA"),
    tierB: calculatePerInterface("tierB"),
    tierC: calculatePerInterface("tierC"),
  };

  lines.push("### フェーズ別内訳（1本あたり）");
  lines.push("");
  const header = "| フェーズ | 担当 | 従来 | Tier A | Tier B | Tier C |";
  const sep =    "|----------|------|------|--------|--------|--------|";
  lines.push(header);
  lines.push(sep);

  for (const phase of ["要件定義", "基本設計", "開発+単体テスト"] as Phase[]) {
    const trad = perIface.traditional.phaseBreakdown.find(p => p.phase === phase)!;
    const tA = perIface.tierA.phaseBreakdown.find(p => p.phase === phase)!;
    const tB = perIface.tierB.phaseBreakdown.find(p => p.phase === phase)!;
    const tC = perIface.tierC.phaseBreakdown.find(p => p.phase === phase)!;

    const role = trad.role === "consultant" ? "ｺﾝｻﾙ" : "SE";
    lines.push(
      `| ${phase} | ${role} | ${trad.traditionalPersonDays}日(${fmt(trad.traditionalCost)}) | ${range(tA.aiPersonDays.min, tA.aiPersonDays.max)}日(${rangeYen(tA.aiCost.min, tA.aiCost.max)}) | ${range(tB.aiPersonDays.min, tB.aiPersonDays.max)}日(${rangeYen(tB.aiCost.min, tB.aiCost.max)}) | ${range(tC.aiPersonDays.min, tC.aiPersonDays.max)}日(${rangeYen(tC.aiCost.min, tC.aiCost.max)}) |`
    );
  }
  // Total row (per-interface)
  lines.push(
    `| **合計** | | **${perIface.traditional.totalPersonDays.max}日(${fmt(perIface.traditional.totalCost.min)})** | **${range(perIface.tierA.totalPersonDays.min, perIface.tierA.totalPersonDays.max)}日(${rangeYen(perIface.tierA.totalCost.min, perIface.tierA.totalCost.max)})** | **${range(perIface.tierB.totalPersonDays.min, perIface.tierB.totalPersonDays.max)}日(${rangeYen(perIface.tierB.totalCost.min, perIface.tierB.totalCost.max)})** | **${range(perIface.tierC.totalPersonDays.min, perIface.tierC.totalPersonDays.max)}日(${rangeYen(perIface.tierC.totalCost.min, perIface.tierC.totalCost.max)})** |`
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── 見積もり計算方式 ────────────────────────────────────────────────────────
  const tradCost = cmp.tiers.traditional.totalCost.min;
  const tA_cost = cmp.tiers.tierA.totalCost;
  const tA_save = tradCost - tA_cost.min;
  const tradDays = perIface.traditional.totalPersonDays.max;
  const tA_days = perIface.tierA.totalPersonDays;

  lines.push("### 見積もりの考え方");
  lines.push("");

  // Core logic: before/after in one table
  const p1 = perIface.traditional.phaseBreakdown[0];
  const p2 = perIface.traditional.phaseBreakdown[1];
  const p3 = perIface.traditional.phaseBreakdown[2];
  const a1 = perIface.tierA.phaseBreakdown[0];
  const a2 = perIface.tierA.phaseBreakdown[1];
  const a3 = perIface.tierA.phaseBreakdown[2];

  lines.push("| 工程 | 担当 | 単価 | 従来 | Tier A | 削減 |");
  lines.push("|------|------|------|------|--------|------|");
  lines.push(`| 要件定義 | ｺﾝｻﾙ | 7.5万円/日 | ${p1.traditionalPersonDays}日（${fmt(p1.traditionalCost)}） | ${a1.aiPersonDays.min}日（${fmt(a1.aiCost.min)}） | −${p1.traditionalPersonDays - a1.aiPersonDays.max}日（${Math.round((1 - a1.aiPersonDays.max/p1.traditionalPersonDays)*100)}%） |`);
  lines.push(`| 基本設計 | SE | 5.0万円/日 | ${p2.traditionalPersonDays}日（${fmt(p2.traditionalCost)}） | ${a2.aiPersonDays.min}日（${fmt(a2.aiCost.min)}） | −${p2.traditionalPersonDays - a2.aiPersonDays.max}日（${Math.round((1 - a2.aiPersonDays.max/p2.traditionalPersonDays)*100)}%） |`);
  lines.push(`| 開発+単体 | SE | 5.0万円/日 | ${p3.traditionalPersonDays}日（${fmt(p3.traditionalCost)}） | ${a3.aiPersonDays.min}日（${fmt(a3.aiCost.min)}） | −${p3.traditionalPersonDays - a3.aiPersonDays.max}日（${Math.round((1 - a3.aiPersonDays.max/p3.traditionalPersonDays)*100)}%） |`);
  lines.push(`| **1本合計** | | | **${tradDays}人日（${fmt(perIface.traditional.totalCost.min)}）** | **${tA_days.min}人日（${fmt(perIface.tierA.totalCost.min)}）** | **−${tradDays - tA_days.max}人日（${Math.round((1 - tA_days.max/tradDays)*100)}%）** |`);
  lines.push("");
  lines.push(`| | 1本あたり | 1,200本 |`);
  lines.push(`|------|---------|--------|`);
  lines.push(`| **従来** | ${fmt(perIface.traditional.totalCost.min)} | ${fmt(tradCost)} |`);
  lines.push(`| **Tier A** | ${fmt(perIface.tierA.totalCost.min)} | ${fmt(tA_cost.min)} |`);
  lines.push(`| **差額** | −${fmt(perIface.traditional.totalCost.min - perIface.tierA.totalCost.min)} | **−${fmt(tA_save)}（${Math.round(tA_save/tradCost*100)}%）** |`);
  lines.push("");

  // ── 4. AIツール選定ガイド ──────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## 4. AIツール選定ガイド");
  lines.push("");

  lines.push("### 4.1 3階層比較");
  lines.push("");
  lines.push("| | Tier A (Claude Code) | Tier B (Joule) | Tier C (Copilot) |");
  lines.push("|------|------|------|------|");
  lines.push(`| **ベンダー** | ${TOOL_CATALOG.capabilities.tierA.vendor} | ${TOOL_CATALOG.capabilities.tierB.vendor} | ${TOOL_CATALOG.capabilities.tierC.vendor} |`);
  lines.push(`| **精度** | ${TOOL_CATALOG.capabilities.tierA.precision} | ${TOOL_CATALOG.capabilities.tierB.precision} | ${TOOL_CATALOG.capabilities.tierC.precision} |`);
  lines.push(`| **成熟度** | ${TOOL_CATALOG.capabilities.tierA.maturity} | ${TOOL_CATALOG.capabilities.tierB.maturity} | ${TOOL_CATALOG.capabilities.tierC.maturity} |`);
  lines.push(`| **日立承認** | ${TOOL_CATALOG.capabilities.tierA.approvalStatus} | ${TOOL_CATALOG.capabilities.tierB.approvalStatus} | ${TOOL_CATALOG.capabilities.tierC.approvalStatus} |`);
  lines.push(`| **ライセンス** | ${TOOL_CATALOG.capabilities.tierA.licensing.note} | ${TOOL_CATALOG.capabilities.tierB.licensing.note} | ${TOOL_CATALOG.capabilities.tierC.licensing.note} |`);
  lines.push(`| **データ配置** | ${TOOL_CATALOG.capabilities.tierA.dataResidency} | ${TOOL_CATALOG.capabilities.tierB.dataResidency} | ${TOOL_CATALOG.capabilities.tierC.dataResidency} |`);
  lines.push("");

  // Tier details
  for (const tier of ["tierA", "tierB", "tierC"] as Tier[]) {
    const cap = TOOL_CATALOG.capabilities[tier];
    lines.push(`### 4.${tier === "tierA" ? "2" : tier === "tierB" ? "3" : "4"} ${cap.label}`);
    lines.push("");
    lines.push("**強み**:");
    for (const s of cap.strengths) lines.push(`- ${s}`);
    lines.push("");
    lines.push("**制約**:");
    for (const l of cap.limitations) lines.push(`- ${l}`);
    lines.push("");
    lines.push("**生成可能な成果物**: " + cap.supportedDeliverables.join("、"));
    lines.push("");
  }

  // ── 4. データプライバシー ──────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## 5. データプライバシー保証");
  lines.push("");
  lines.push("すべてのAIツールは、契約上「顧客データをモデル学習に使用しない」ことを保証しています。");
  lines.push("");
  lines.push("| ツール | 保証内容 | 契約根拠 |");
  lines.push("|--------|---------|---------|");
  for (const tier of ["tierA", "tierB", "tierC"] as Tier[]) {
    const p = TOOL_CATALOG.privacyEvidence[tier];
    lines.push(`| ${p.vendor} | ${p.guarantee.substring(0, 60)}... | ${p.contractualBasis} |`);
  }
  lines.push("");

  // Full privacy details
  for (const tier of ["tierA", "tierB", "tierC"] as Tier[]) {
    const p = TOOL_CATALOG.privacyEvidence[tier];
    lines.push(`### ${p.vendor}`);
    lines.push("");
    lines.push(`**保証**: ${p.guarantee}`);
    lines.push("");
    lines.push(`**契約根拠**: ${p.contractualBasis}`);
    lines.push("");
    lines.push(`**データフロー**: ${p.dataFlowDescription}`);
    lines.push("");
  }

  // ── 5. 品質ゲートプロトコル ────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## 6. 品質ゲートプロトコル（Seam 2）");
  lines.push("");
  lines.push("すべてのAI生成成果物は、**人間のレビューと承認**を経て次の工程に進みます。");
  lines.push("");

  const gates = getAllPhaseGates();
  for (const gate of gates) {
    lines.push(`### ${gate.phase}ゲート`);
    lines.push("");
    lines.push(`- **レビュー担当**: ${gate.reviewer}`);
    lines.push(`- **確認成果物**: ${gate.artifactsChecked.join("、")}`);
    lines.push(`- **完了条件**: ${gate.exitCriteria}`);
    lines.push(`- **承認形式**: ${gate.signOffFormat}`);
    lines.push("");

    lines.push("**レビューチェックリスト**:");
    lines.push("");
    for (const ref of gate.checklistRefs) {
      const cl = QUALITY_GATE_PROTOCOL.checklists[ref];
      lines.push(`#### ${ref}`);
      lines.push(`AIの役割: ${cl.aiRole}`);
      lines.push(`人間の役割: ${cl.humanRole}`);
      lines.push("");
      for (const item of cl.items) {
        lines.push(`- **${item.id}**: ${item.description}`);
        lines.push(`  → 確認ポイント: ${item.lookFor}`);
      }
      lines.push("");
    }
  }

  // ── 6. 競合優位性 ─────────────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## 7. 競合優位性");
  lines.push("");

  lines.push("### 実証済みのAI開発力");
  lines.push("");
  for (const demo of POSITIONING.demoEvidence) {
    lines.push(`#### ${demo.title}`);
    lines.push("");
    lines.push(`- **内容**: ${demo.what}`);
    lines.push(`- **所要時間**: ${demo.timeRequired}`);
    lines.push(`- **使用ツール**: ${demo.toolsUsed}`);
    lines.push(`- **証明すること**: ${demo.proves}`);
    lines.push("");
  }

  lines.push("### 競合他社への反論");
  lines.push("");
  for (const r of POSITIONING.rebuttals) {
    lines.push(`**想定反論**: 「${r.competitorClaim}」`);
    lines.push("");
    lines.push(`**当社回答**: ${r.rebuttal}`);
    lines.push("");
  }

  // ── 7. 実行ロードマップ ────────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## 8. 実行ロードマップ");
  lines.push("");

  lines.push("### 8.1 フェーズ別 AI ワークフロー");
  lines.push("");
  for (const w of ROADMAP.workflows) {
    const tierLabel = TIER_LABELS[w.recommendedTier];
    lines.push(`**${w.phase}** (推奨ツール: ${tierLabel})`);
    lines.push("");
    lines.push(`- 入力: ${w.inputFrom}`);
    lines.push(`- AIの役割: ${w.aiRole}`);
    lines.push(`- 人間の役割: ${w.humanRole}`);
    lines.push(`- 成果物: ${w.outputArtifacts.join("、")}`);
    lines.push("");
  }

  lines.push("### 8.2 PoC計画");
  lines.push("");
  lines.push(`- **対象I/F数**: ${ROADMAP.poc.interfaceCount.min}–${ROADMAP.poc.interfaceCount.max}本`);
  lines.push(`- **実施時期**: ${ROADMAP.poc.duringPhase}フェーズ（約${ROADMAP.poc.durationWeeks}週間）`);
  lines.push(`- **評価対象AI**: ${ROADMAP.poc.evaluateTiers.map(t => TIER_LABELS[t]).join("、")}`);
  lines.push("");
  lines.push("**対象カテゴリ**:");
  for (const cat of ROADMAP.poc.categories) lines.push(`- ${cat}`);
  lines.push("");
  lines.push("**成功基準**:");
  for (const sc of ROADMAP.poc.successCriteria) lines.push(`- ${sc}`);
  lines.push("");

  lines.push("### 8.3 段階的導入");
  lines.push("");
  lines.push("| Step | 内容 | ツール | 時期 | 判断ゲート |");
  lines.push("|------|------|--------|------|-----------|");
  for (const step of ROADMAP.rollout) {
    lines.push(`| ${step.order} | ${step.title} | ${TIER_LABELS[step.tier]} | ${step.timing} | ${step.gate.substring(0, 40)}... |`);
  }
  lines.push("");

  lines.push("### 8.4 判断ゲート");
  lines.push("");
  for (const dg of ROADMAP.decisionGates) {
    lines.push(`**${dg.id}**: ${dg.question}`);
    lines.push("");
    lines.push("- 合格条件:");
    for (const p of dg.passCriteria) lines.push(`  - ${p}`);
    lines.push("- 不合格条件:");
    for (const f of dg.failCriteria) lines.push(`  - ${f}`);
    lines.push(`- 不合格時の対応: ${dg.fallback}`);
    lines.push("");
  }

  // ── 8. 次ステップ ──────────────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## 9. 次ステップ");
  lines.push("");
  lines.push("- [ ] クライアントとのAI活用方針すり合わせ");
  lines.push("- [ ] 日立内でのClaude Code利用承認プロセス開始");
  lines.push("- [ ] Joule Studio 評価用環境の準備（SAP共有ID活用）");
  lines.push("- [ ] PoC計画の具体化（対象インターフェース10–20本の先行評価）");

  return lines.join("\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────

const output = print();
const outPath = new URL("../ai-assisted-implementation-proposal.md", import.meta.url).pathname;

writeFileSync(outPath, output, "utf-8");
console.log(`Proposal written to ${outPath}`);
console.log(`  ${output.split("\n").length} lines`);
