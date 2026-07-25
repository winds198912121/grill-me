/**
 * Execution Roadmap — Ticket 4.
 *
 * Phase workflows, PoC plan, phased rollout steps, decision gates.
 * Integrates Ticket 1 (comparison engine) + Ticket 2 (tools + quality gates).
 */

import type { ExecutionRoadmap } from "./types";

export const ROADMAP: ExecutionRoadmap = {
  // ── Phase-by-Phase Workflows ───────────────────────────────────────────────

  workflows: [
    {
      phase: "要件定義",
      aiRole:
        "I/Fパターンテンプレート（受注伝票登録、購買発注伝票登録、マスタデータ連携など）をもとに、" +
        "AIが要件定義書の草案を自動生成。コンサルタントは内容レビューと修正のみ。",
      humanRole:
        "AI草案の網羅性・正確性の確認。SAP BAPI/トランザクションの実在確認。" +
        "クライアントとの合意形成。不足項目の追加。要件定義書の最終承認。",
      inputFrom: "Salesforce画面設計書、業務要件ヒアリング結果、I/F一覧",
      outputArtifacts: ["要件定義書"],
      recommendedTier: "tierA",
    },
    {
      phase: "基本設計",
      aiRole:
        "Salesforce画面のスクリーンショット + SAP DDICテーブル構造をAIに投入し、" +
        "フィールドマッピングシートと設計書を自動生成。" +
        "データ型変換ルール、コード変換マッピング、I/F方式選定根拠を含む。",
      humanRole:
        "SAPテーブル・項目の実在確認（SE11/SE16N）。" +
        "マッピングの妥当性検証。業務ロジックの確認。" +
        "設計書のレビューと承認。",
      inputFrom: "要件定義書、Salesforce画面定義、SAP DDIC",
      outputArtifacts: ["設計書・マッピングシート"],
      recommendedTier: "tierA",
    },
    {
      phase: "開発+単体テスト",
      aiRole:
        "設計書を入力として、ABAPコード（BAPI/RFC呼び出し、IDoc設定、エラーハンドリング）と" +
        "単体テスト仕様書（正常系・異常系・境界値）を自動生成。",
      humanRole:
        "コードレビュー（BAPIパラメータ、COMMIT/ROLLBACK制御、エラーハンドリング）。" +
        "パフォーマンス確認（SELECTループ、FOR ALL ENTRIES）。" +
        "セキュリティチェック（SQLインジェクション対策）。" +
        "テスト実行と結果確認。",
      inputFrom: "設計書・マッピングシート、SAP開発環境",
      outputArtifacts: ["ABAPコード", "テスト仕様書"],
      recommendedTier: "tierA",
    },
  ],

  // ── PoC Plan ───────────────────────────────────────────────────────────────

  poc: {
    interfaceCount: { min: 10, max: 20 },
    categories: [
      "会計I/F（仕訳伝票登録、債権・債務管理）",
      "受注I/F（受注伝票登録、出荷指示）",
      "購買I/F・マスタデータI/F（購買発注伝票登録、得意先・仕入先マスタ連携）",
    ],
    duringPhase: "要件定義",
    durationWeeks: 6,
    evaluateTiers: ["tierA", "tierB"],
    successCriteria: [
      "AI生成された要件定義書の品質が、コンサルタントのレビューで「軽微な修正のみで承認可能」レベルに達すること",
      "AI生成された設計書・マッピングシートのフィールドマッピングが、SAP DDIC実在確認でエラー率5%未満であること",
      "AIによる設計書生成速度が、人手作成と比較して80%以上の時間短縮を達成すること",
      "Joule Studio (Tier B) の出力品質がClaude Code (Tier A) の50%以上であること（SAPネイティブ統合の優位性と合わせて総合評価）",
    ],
  },

  // ── Rollout Steps ──────────────────────────────────────────────────────────

  rollout: [
    {
      order: 1,
      title: "Tier C (Copilot) 即時展開",
      tier: "tierC",
      timing: "即時（提案承認後、即日利用開始可能）",
      action:
        "GitHub Copilotのエンタープライズライセンスを全SEに展開。" +
        "コーディング補助、コードレビュー補助、ドキュメント作成補助として利用開始。" +
        "日立社内で承認済みのため、追加のセキュリティ審査不要。",
      gate: "全SEのライセンス発行完了。Copilot利用ガイドラインの周知。利用開始後1週間で全SEが基本操作を習得。",
    },
    {
      order: 2,
      title: "Tier A (Claude Code) PoC",
      tier: "tierA",
      timing: "要件定義フェーズ開始と同時（Step 1の1週間後を目安）",
      action:
        "Claude Codeのライセンス（$200/月/ID 最大）をPoCメンバー（2–3名）に発行。" +
        "対象I/F 10–20本の要件定義書・設計書をAIで生成し、人手作成と品質・速度を比較。" +
        "日立社内のセキュリティ承認プロセスを並行して進める。",
      gate: "PoCの成功基準（4項目）をすべて満たすこと。セキュリティ承認の目処が立つこと。→ Decision Gate: poc-result へ",
    },
    {
      order: 3,
      title: "Tier B (Joule Studio) 評価",
      tier: "tierB",
      timing: "要件定義フェーズ中盤（Step 2と並行して開始）",
      action:
        "SAP共有IDを活用し、Joule Studioで同じPoC対象I/Fの設計書生成を試行。" +
        "Claude Code (Tier A) との出力品質・SAP統合性を比較評価。" +
        "SAPにJoule商用ライセンスの費用・条件を確認。",
      gate: "Jouleの品質がClaude Codeの50%以上であり、SAPネイティブ統合による追加価値が認められること。ライセンス費用がプロジェクト予算内であること。→ Decision Gate: joule-eval へ",
    },
    {
      order: 4,
      title: "本格採用AIツールの決定と全量展開",
      tier: "tierA",
      timing: "基本設計フェーズ開始時（要件定義完了後）",
      action:
        "PoC評価結果に基づき、本格採用するAIツールを決定。" +
        "決定したツールのライセンスを全開発メンバーに展開。" +
        "残りの約1,180本のI/F開発にAI支援を全面適用。" +
        "Quality Gate Protocolに従い、全成果物の人間レビューを継続。",
      gate: "採用AIツールが決定済み。全SEのライセンス発行完了。フェーズ別AIワークフローがチーム全員に周知済み。",
    },
  ],

  // ── Decision Gates ─────────────────────────────────────────────────────────

  decisionGates: [
    {
      id: "poc-result",
      afterStep: 2,
      question:
        "Claude Code (Tier A) のPoC結果が成功基準を満たしているか？",
      passCriteria: [
        "要件定義書の品質が「軽微な修正のみで承認可能」レベル",
        "設計書のフィールドマッピングエラー率5%未満",
        "設計書生成速度が人手比80%以上の時間短縮",
        "日立セキュリティ承認の目処あり",
      ],
      failCriteria: [
        "AI生成物の品質が人間のレビュー負荷をむしろ増大させるレベル",
        "セキュリティ承認が得られない見込み",
      ],
      fallback:
        "Tier C (Copilot) を補助ツールとして継続使用し、設計・開発は従来型の人手中心で進める。" +
        "ただし、Claude Codeのセキュリティ承認が得られ次第、改めて導入を検討。",
    },
    {
      id: "joule-eval",
      afterStep: 3,
      question:
        "Joule Studio (Tier B) を本格採用するか、Claude Code (Tier A) を継続するか？",
      passCriteria: [
        "Jouleの出力品質がClaude Codeの50%以上",
        "SAPネイティブ統合による明確な追加価値（BTP連携、SAP標準エージェントの再利用など）がある",
        "商用ライセンス費用がプロジェクト予算内（またはSAPの無償/割引プログラムが適用可能）",
        "Joule StudioがGA済みで安定稼働している（2026年Q3のGAスケジュールに遅延がない）",
      ],
      failCriteria: [
        "Jouleの品質がClaude Codeの50%未満",
        "商用ライセンスが予算超過",
        "Joule StudioのGAが遅延し、プロジェクトスケジュールに影響",
      ],
      fallback:
        "Tier A (Claude Code) を本格採用。" +
        "Jouleは次期フェーズ（後続モジュール展開時）に再評価。" +
        "Claude Codeの実績で十分な工数削減が達成可能（75–85%削減）。",
    },
  ],
};
