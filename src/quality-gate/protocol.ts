/**
 * Quality Gate Protocol — Seam 2
 *
 * Invariant: no AI-generated artifact passes to the next phase
 * without human review and documented sign-off.
 *
 * Applies uniformly across all AI tiers and all project phases.
 */

import type { Phase } from "../comparison-engine/types";
import type {
  ArtifactType,
  GateDefinition,
  ReviewChecklist,
  QualityGateProtocol,
} from "./types";

// ── Review Checklists per Artifact Type ─────────────────────────────────────

const REQUIREMENTS_CHECKLIST: ReviewChecklist = {
  artifactType: "要件定義書",
  reviewer: "コンサルタント",
  aiRole: "I/Fパターンテンプレートから要件定義書の草案を自動生成",
  humanRole:
    "網羅性・正確性の確認、クライアントとの合意形成、不足項目の追加",
  items: [
    {
      id: "REQ-01",
      description: "I/Fの目的と業務シナリオが明確に記載されているか",
      lookFor:
        "受注伝票登録・購買発注伝票登録など、業務シナリオ名が明記されていること",
    },
    {
      id: "REQ-02",
      description: "連携方向（Salesforce→SAP / SAP→Salesforce / 双方向）が明示されているか",
      lookFor: "データフロー図または明示的な方向指定",
    },
    {
      id: "REQ-03",
      description: "連携データ項目の一覧が過不足なく列挙されているか",
      lookFor:
        "必須項目・任意項目の区別、データ型・桁数の指定",
    },
    {
      id: "REQ-04",
      description: "エラー発生時の処理方針が記載されているか",
      lookFor:
        "リトライ回数、エラーログ出力先、異常時の業務フロー",
    },
    {
      id: "REQ-05",
      description: "SAP側のトランザクションコード・BAPI名が正しいか",
      lookFor:
        "AIが生成したBAPI名が実在するか、SAP DDICで確認",
    },
    {
      id: "REQ-06",
      description: "非機能要件（性能・可用性・セキュリティ）が記載されているか",
      lookFor:
        "想定データ量、レスポンスタイム目標、暗号化要件",
    },
  ],
};

const DESIGN_CHECKLIST: ReviewChecklist = {
  artifactType: "設計書・マッピングシート",
  reviewer: "SE",
  aiRole:
    "Salesforce画面スクリーンショット + SAP DDICテーブル構造から、フィールドマッピングシートと設計書を自動生成",
  humanRole:
    "マッピングの妥当性検証、SAPテーブル・項目の実在確認、業務ロジック検証",
  items: [
    {
      id: "DSG-01",
      description: "全Salesforce項目に対応するSAPテーブル・項目が存在するか",
      lookFor:
        "DDICトランザクション(SE11/SE16N)で各テーブル・項目が実在することを確認",
    },
    {
      id: "DSG-02",
      description: "データ型変換ルールが明示されているか（日付形式、数値桁数など）",
      lookFor:
        "Salesforce Date → SAP DATS、Salesforce Number(15,2) → SAP DEC 15-2 など",
    },
    {
      id: "DSG-03",
      description: "コード変換マッピングが定義されているか（例: 販売組織コード）",
      lookFor:
        "固定値変換・参照テーブル変換の区別、変換テーブルの指定",
    },
    {
      id: "DSG-04",
      description: "インターフェース方式（BAPI/RFC/IDoc）の選定理由が記載されているか",
      lookFor:
        "リアルタイム性・データ量・エラーハンドリング要件に基づく選定根拠",
    },
    {
      id: "DSG-05",
      description: "エラーハンドリング方式が設計されているか（戻り値チェック、例外処理）",
      lookFor:
        "BAPI RETURN構造の確認、IDoc STATUS確認、例外テーブルへの書き込みロジック",
    },
  ],
};

const CODE_CHECKLIST: ReviewChecklist = {
  artifactType: "ABAPコード",
  reviewer: "SE",
  aiRole:
    "設計書を入力として、ABAPコード（BAPI/RFC呼び出し、IDoc設定、エラーハンドリング）を自動生成",
  humanRole:
    "コードレビュー、パフォーマンス確認、セキュリティチェック、コーディング規約準拠確認",
  items: [
    {
      id: "CD-01",
      description: "BAPI/RFC呼び出しパラメータが設計書と一致しているか",
      lookFor:
        "IMPORT/EXPORT/TABLEパラメータの過不足、データ型の一致",
    },
    {
      id: "CD-02",
      description: "COMMIT WORK / ROLLBACK WORKの制御が適切か",
      lookFor:
        "正常時COMMIT、異常時ROLLBACK、LUW境界の適切な設定",
    },
    {
      id: "CD-03",
      description: "エラーハンドリングが網羅的か（BAPI RETURN、SY-SUBRC）",
      lookFor:
        "全BAPI呼び出し後のRETURN構造チェック、SY-SUBRC <> 0の処理",
    },
    {
      id: "CD-04",
      description: "パフォーマンス上の問題がないか（SELECTループ、FOR ALL ENTRIESの適切な使用）",
      lookFor:
        "SELECT ... ENDSELECTの不在、FOR ALL ENTRIES + ORDER BYの組み合わせ",
    },
    {
      id: "CD-05",
      description: "SQLインジェクション対策が施されているか",
      lookFor:
        "動的SQLの最小化、入力値のエスケープまたはバインド変数の使用",
    },
    {
      id: "CD-06",
      description: "コーディング規約に準拠しているか",
      lookFor:
        "命名規則（プレフィックス）、コメント記述、モジュール化の粒度",
    },
  ],
};

const TEST_CHECKLIST: ReviewChecklist = {
  artifactType: "テスト仕様書",
  reviewer: "SE",
  aiRole:
    "要件定義書・設計書からテスト仕様書（正常系・異常系・境界値）を自動生成",
  humanRole:
    "境界値・異常系の追加、テストデータの妥当性確認、テスト実行と結果確認",
  items: [
    {
      id: "TST-01",
      description: "設計書の全項目がテストケースでカバーされているか",
      lookFor:
        "トレーサビリティマトリクスでの設計項目→テストケースの網羅確認",
    },
    {
      id: "TST-02",
      description: "異常系テストケースが十分か（通信断、SAPダウン、不正データ）",
      lookFor:
        "RFC接続エラー、BAPI戻り値エラー、データ型不一致、必須項目欠落のテスト",
    },
    {
      id: "TST-03",
      description: "境界値テストが含まれているか（最大桁数、ゼロ値、NULL）",
      lookFor:
        "数値項目の最大値・最小値・ゼロ、文字項目の最大長・空文字",
    },
    {
      id: "TST-04",
      description: "テストデータが本番データを模擬できているか",
      lookFor:
        "バリエーションのあるテストデータ、マスタデータの事前準備手順",
    },
    {
      id: "TST-05",
      description: "期待値が明確で、合否判定が自動化可能か",
      lookFor:
        "期待されるSAP側のデータ状態（テーブル値）、BAPI戻り値の期待コード",
    },
  ],
};

// ── Gate Definitions per Phase ───────────────────────────────────────────────

const GATE_REQUIREMENTS: GateDefinition = {
  phase: "要件定義",
  reviewer: "コンサルタント",
  artifactsChecked: ["要件定義書"],
  exitCriteria:
    "全I/Fの要件定義書が生成され、コンサルタントによるレビュー・修正・承認が完了していること。クライアントとの合意形成が完了していること。",
  signOffFormat:
    "要件定義書の承認欄にコンサルタントの電子署名＋日付。クライアント承認は別途議事録またはメールで確認。",
  checklistRefs: ["要件定義書"],
};

const GATE_DESIGN: GateDefinition = {
  phase: "基本設計",
  reviewer: "SE",
  artifactsChecked: ["設計書・マッピングシート"],
  exitCriteria:
    "全I/Fの設計書・マッピングシートが生成され、SEによるSAPテーブル・項目の実在確認および業務ロジック検証が完了していること。",
  signOffFormat:
    "設計書の承認欄にSEの電子署名＋日付。マッピングシートはレビュー済みチェック欄にSEのイニシャル。",
  checklistRefs: ["設計書・マッピングシート"],
};

const GATE_DEVELOPMENT: GateDefinition = {
  phase: "開発+単体テスト",
  reviewer: "SE",
  artifactsChecked: ["ABAPコード", "テスト仕様書"],
  exitCriteria:
    "全I/FのABAPコードが生成・レビュー・単体テスト完了していること。テスト仕様書に基づくテストが実行され、全ケースが合格していること。",
  signOffFormat:
    "コードレビュー記録（ツールまたはExcel）にSEの署名。テスト結果報告書にSEの承認サイン＋日付。",
  checklistRefs: ["ABAPコード", "テスト仕様書"],
};

// ── Protocol ─────────────────────────────────────────────────────────────────

export const QUALITY_GATE_PROTOCOL: QualityGateProtocol = {
  gates: {
    要件定義: GATE_REQUIREMENTS,
    基本設計: GATE_DESIGN,
    "開発+単体テスト": GATE_DEVELOPMENT,
  },
  checklists: {
    "要件定義書": REQUIREMENTS_CHECKLIST,
    "設計書・マッピングシート": DESIGN_CHECKLIST,
    "ABAPコード": CODE_CHECKLIST,
    "テスト仕様書": TEST_CHECKLIST,
  },
};

// ── Accessors ────────────────────────────────────────────────────────────────

export function getGate(phase: Phase): GateDefinition {
  return QUALITY_GATE_PROTOCOL.gates[phase];
}

export function getChecklist(artifact: ArtifactType): ReviewChecklist {
  return QUALITY_GATE_PROTOCOL.checklists[artifact];
}

/** All phase gates in project order. */
export function getAllPhaseGates(): GateDefinition[] {
  return [
    QUALITY_GATE_PROTOCOL.gates["要件定義"],
    QUALITY_GATE_PROTOCOL.gates["基本設計"],
    QUALITY_GATE_PROTOCOL.gates["開発+単体テスト"],
  ];
}

