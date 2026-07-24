/**
 * Tool Catalog — Seam 2 (Quality Gate Protocol consumes this)
 *
 * Structured capability and privacy data for each AI tier.
 */

import type { Tier } from "../comparison-engine/types";

export type PrecisionLevel = "最高" | "高" | "中" | "低" | "なし";
export type ApprovalStatus = "承認済み" | "要申請" | "共有IDあり" | "該当なし";
export type MaturityLevel = "実用段階" | "GA前(2026 Q3)" | "補助ツール" | "なし";

export type Deliverable =
  | "要件定義書"
  | "設計書・マッピングシート"
  | "ABAPコード"
  | "テスト仕様書"
  | "エラー調査"
  | "UI生成(Fiori)";

export interface ToolCapability {
  tier: Tier;
  label: string;
  vendor: string;
  precision: PrecisionLevel;
  dataResidency: string;
  licensing: {
    costPerIdPerMonth: number;
    billingModel: string;
    note: string;
  };
  approvalStatus: ApprovalStatus;
  supportedDeliverables: Deliverable[];
  maturity: MaturityLevel;
  strengths: string[];
  limitations: string[];
}

export interface DataPrivacyEvidence {
  tier: Tier;
  vendor: string;
  trainsOnCustomerData: boolean;
  guarantee: string;
  contractualBasis: string;
  dataFlowDescription: string;
}

export interface ToolCatalog {
  capabilities: Record<Tier, ToolCapability>;
  privacyEvidence: Record<Tier, DataPrivacyEvidence>;
}
