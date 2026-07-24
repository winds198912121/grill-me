/**
 * Tool Catalog — Structured capability and privacy data for all 4 tiers.
 */

import type { Tier } from "../comparison-engine/types";
import type {
  ToolCapability,
  DataPrivacyEvidence,
  ToolCatalog,
  Deliverable,
} from "./types";

// ── Capabilities ─────────────────────────────────────────────────────────────

const TRADITIONAL: ToolCapability = {
  tier: "traditional",
  label: "従来型開発",
  vendor: "なし",
  precision: "なし",
  dataResidency: "N/A",
  licensing: {
    costPerIdPerMonth: 0,
    billingModel: "N/A",
    note: "ツール費用なし",
  },
  approvalStatus: "該当なし",
  supportedDeliverables: [],
  maturity: "なし",
  strengths: [
    "実績のある手法、監査対応が確立されている",
    "チーム全員が経験済み",
    "追加ツールの習得・承認不要",
  ],
  limitations: [
    "工数削減効果なし",
    "1,200本のI/F開発に膨大な人月が必要",
    "ドキュメント間の不整合リスクが高い",
  ],
};

const TIER_A: ToolCapability = {
  tier: "tierA",
  label: "Tier A (Claude Code)",
  vendor: "Anthropic",
  precision: "最高",
  dataResidency: "顧客端末上で処理、データはクラウドに蓄積されない",
  licensing: {
    costPerIdPerMonth: 30_000,
    billingModel: "月額サブスクリプション（トークンベース）",
    note: "最大$200/月/ID。開発用途では事実上無制限。",
  },
  approvalStatus: "要申請",
  supportedDeliverables: [
    "要件定義書",
    "設計書・マッピングシート",
    "ABAPコード",
    "テスト仕様書",
    "エラー調査",
    "UI生成(Fiori)",
  ],
  maturity: "実用段階",
  strengths: [
    "設計書・コード・テスト仕様書を一括生成、全レイヤーで整合性保持",
    "Salesforce画面のスクリーンショットからI/F設計書を自動作成",
    "エラー発生時に直接画面操作で原因特定・修正",
    "Fiori画面を2時間でゼロから生成（Ryu-san実績）",
  ],
  limitations: [
    "日立社内でのセキュリティ承認が必要",
    "SAPネイティブではない（汎用AIツール）",
    "利用には一定のAI活用スキルが必要",
  ],
};

const TIER_B: ToolCapability = {
  tier: "tierB",
  label: "Tier B (Joule + Joule Studio)",
  vendor: "SAP",
  precision: "高",
  dataResidency: "SAP BTP環境内で完結、SAPエコシステム外にデータ流出なし",
  licensing: {
    costPerIdPerMonth: 0,
    billingModel: "未定",
    note: "SAPに確認要。Joule Studioは無償の可能性あり（開発者・アプリ実行は従量制と発表）。",
  },
  approvalStatus: "評価要(共有IDあり)",
  supportedDeliverables: [
    "要件定義書",
    "設計書・マッピングシート",
    "ABAPコード",
    "テスト仕様書",
    "エラー調査",
  ],
  maturity: "GA前(2026 Q3)",
  strengths: [
    "SAPネイティブ統合 — S/4HANA, BTPとシームレス連携",
    "51種のJouleアシスタント + 224種のJouleエージェントが標準提供予定",
    "データがSAP BTP内に留まり、既存のSAPデータ処理契約の範囲内",
    "Joule Studioでカスタムエージェント開発が可能",
  ],
  limitations: [
    "2026年Q3 GA予定 — 現時点では一般提供前",
    "実機での精度・性能が未評価",
    "ライセンス費用が未確定",
    "日立社内にJoule開発の実績なし",
  ],
};

const TIER_C: ToolCapability = {
  tier: "tierC",
  label: "Tier C (GitHub Copilot)",
  vendor: "Microsoft / GitHub",
  precision: "低",
  dataResidency: "エンタープライズデータ保護（EDP）適用時、プロンプト・レスポンス非保持",
  licensing: {
    costPerIdPerMonth: 3_000,
    billingModel: "月額サブスクリプション",
    note: "$20/月/ID",
  },
  approvalStatus: "承認済み",
  supportedDeliverables: [
    "要件定義書",
    "設計書・マッピングシート",
    "ABAPコード",
    "テスト仕様書",
  ],
  maturity: "補助ツール",
  strengths: [
    "日立社内で既に承認済み、即時利用開始可能",
    "コーディング補助として全SEが使用可能",
    "月額$20/IDと低コスト",
  ],
  limitations: [
    "設計書生成の精度が低い（人間の修正が必須）",
    "コードスニペット生成が中心、エンドツーエンドの文書生成不可",
    "Claude Codeと比較して精度が約半分（Ryu-san評価）",
    "Fiori UI生成不可",
  ],
};

// ── Privacy Evidence ─────────────────────────────────────────────────────────

const PRIVACY_TRADITIONAL: DataPrivacyEvidence = {
  tier: "traditional",
  vendor: "なし",
  trainsOnCustomerData: false,
  guarantee: "ツール不使用のため該当なし",
  contractualBasis: "N/A",
  dataFlowDescription: "N/A",
};

const PRIVACY_TIER_A: DataPrivacyEvidence = {
  tier: "tierA",
  vendor: "Anthropic",
  trainsOnCustomerData: false,
  guarantee:
    "Anthropic利用規約に「顧客データをモデル学習に使用しない」と明記。エンタープライズ契約でデータ処理アドエンダム（DPA）提供可。",
  contractualBasis:
    "Anthropic Commercial Terms of Service §5 (Data Use); Enterprise DPA available",
  dataFlowDescription:
    "Claude Codeはユーザーのローカル端末上でコード・ドキュメントを読み取り、AI処理のためAPI経由でAnthropicサーバーに送信。処理後、データはクラウドに蓄積されず、モデル学習にも使用されない。",
};

const PRIVACY_TIER_B: DataPrivacyEvidence = {
  tier: "tierB",
  vendor: "SAP",
  trainsOnCustomerData: false,
  guarantee:
    "JouleはSAP BTP環境内で動作し、顧客のSAPシステム外にデータが流出しない。SAPの既存のデータ処理契約（DPA）の範囲内でカバーされる。",
  contractualBasis:
    "SAP Data Processing Agreement (標準SAP契約に含まれる); SAP Trust Center",
  dataFlowDescription:
    "JouleはSAP BTP上のAIサービスとして動作。顧客データはSAP BTPテナント内に留まり、SAPエコシステム外に送信されない。",
};

const PRIVACY_TIER_C: DataPrivacyEvidence = {
  tier: "tierC",
  vendor: "Microsoft / GitHub",
  trainsOnCustomerData: false,
  guarantee:
    "GitHub Copilot Enterprise Data Protection (EDP) により、プロンプト・コードスニペット・レスポンスは保持されず、モデル学習に使用されない。",
  contractualBasis:
    "GitHub Copilot Trust Center; Microsoft Enterprise Data Protection policy",
  dataFlowDescription:
    "CopilotはIDEプラグインとして動作。コードコンテキストがMicrosoftサーバーに送信されるが、EDP有効時は非保持・非学習。",
};

// ── Catalog ──────────────────────────────────────────────────────────────────

export const TOOL_CATALOG: ToolCatalog = {
  capabilities: {
    traditional: TRADITIONAL,
    tierA: TIER_A,
    tierB: TIER_B,
    tierC: TIER_C,
  },
  privacyEvidence: {
    traditional: PRIVACY_TRADITIONAL,
    tierA: PRIVACY_TIER_A,
    tierB: PRIVACY_TIER_B,
    tierC: PRIVACY_TIER_C,
  },
};

// ── Accessors ────────────────────────────────────────────────────────────────

export function getCapability(tier: Tier): ToolCapability {
  return TOOL_CATALOG.capabilities[tier];
}

export function getPrivacyEvidence(tier: Tier): DataPrivacyEvidence {
  return TOOL_CATALOG.privacyEvidence[tier];
}

export function getSupportedDeliverables(tier: Tier): Deliverable[] {
  return TOOL_CATALOG.capabilities[tier].supportedDeliverables;
}
