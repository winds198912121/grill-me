/**
 * Competitive Positioning — "Why Hitachi" narrative for the proposal.
 */

import type { CompetitivePositioning } from "./types";

export const POSITIONING: CompetitivePositioning = {
  executiveSummary:
    "日立システムズは、SAP S/4HANA移行プロジェクトにおいて、従来型の人手による開発ではなく、" +
    "AI支援開発を全フェーズにわたって適用することで、1,200本のインターフェース開発の工数を最大85%削減し、" +
    "プロジェクトコストを¥2.4Bから¥378M–618Mへと劇的に圧縮します。" +
    "Claude Code、Joule、GitHub Copilotの3層のAIツールを段階的に導入することで、リスクを最小化しながら" +
    "即時効果を発揮します。" +
    "これは単なる提案ではなく、既に実証された手法です — " +
    "当社のAIエンジニアはFiori画面を2時間で生成し、フル機能のWebサイトを1週間で構築した実績があります。" +
    "他社が従来型開発で見積もる中、日立だけがAIで次のステージの開発効率を提案できます。",

  claims: [
    {
      id: "claim-ai-differentiator",
      claim:
        "AI支援開発が競合他社との決定的な差別化要因 — 他社が従来型の人手開発で見積もる中、日立だけが全フェーズでAIを活用した工数圧縮を提案",
      evidence:
        "従来型開発¥2.4Bに対し、Tier A (Claude Code)を用いると¥378M–618M（75–85%削減）。" +
        "Tier C (Copilot)だけでも¥1.41B–1.81B（25–40%削減）。" +
        "いずれも、ツールライセンス費用（月額¥3,000–¥30,000/ID）は削減効果に対して無視できる水準。",
      supportedBy: ["demo-fiori-2h", "demo-website-1w"],
    },
    {
      id: "claim-proven-track-record",
      claim:
        "AI活用は机上の空論ではない — 当社には実践的なAI開発の実績とノウハウがある",
      evidence:
        "Ryu-san（当社AIエンジニア）は日々Claude Code、Codex、DeepSeekを活用した開発を実践。" +
        "Fioriレポート画面を設計から完成まで2時間で生成（従来は1–2ヶ月）。" +
        "SAP知識共有サイトをAIと共同で1週間で構築（従来見積もり¥7M、実際のAIコストは$20/月のみ）。" +
        "Salesforceの画面を貼り付けるだけでSAPとのI/Fマニュアルを5分で自動生成。",
      supportedBy: ["demo-fiori-2h", "demo-website-1w", "demo-interface-mapping"],
    },
    {
      id: "claim-phased-de-risk",
      claim:
        "段階的導入によりリスクを最小化 — いきなり全量AI化ではなく、評価→検証→本格採用の3ステップ",
      evidence:
        "Step 1: 承認済みのCopilot（Tier C）を即時展開し、コーディング補助として効果を発揮。" +
        "Step 2: 要件定義期間中にClaude Code（Tier A）のPoCを実施し、設計書自動生成の効果を実証。" +
        "Step 3: 同時期にJoule Studio（Tier B）を評価し、SAPネイティブ統合の優位性を確認。" +
        "Step 4: 評価結果に基づき本格採用するAIツールを決定。" +
        "全ステップに人間レビューゲート（Quality Gate Protocol）を設け、監査対応を保証。",
      supportedBy: ["demo-interface-mapping"],
    },
    {
      id: "claim-data-sovereignty",
      claim:
        "顧客の業務データはAIに学習されない — 3層すべてのAIツールでデータ保護を契約上保証",
      evidence:
        "Anthropic (Claude Code): 利用規約で「顧客データのモデル学習不使用」を明記。" +
        "SAP (Joule): データはSAP BTP環境内に留まり外部流出なし。" +
        "Microsoft (Copilot): Enterprise Data Protectionによりプロンプト・コードの非保持・非学習。" +
        "すべてのAI生成成果物は人間レビューゲートを通過し、トレーサビリティを確保。",
      supportedBy: ["demo-interface-mapping"],
    },
  ],

  demoEvidence: [
    {
      id: "demo-fiori-2h",
      title: "Fioriレポート画面のAI生成（2時間）",
      what:
        "S/4HANA上でCDS ViewからFiori Elementsのレポート画面を、AI (Claude Code) と共同で設計から完成まで2時間で生成。" +
        "CDS View、Interface View、Projection View、Fiori Launchpad設定を含む全工程をAIが支援。",
      timeRequired: "2時間（従来1–2ヶ月）",
      toolsUsed: "Claude Code, SAP S/4HANA (トレーニング環境)",
      proves:
        "AI支援により、SAP Fiori開発の工数を95%以上削減可能。設計書生成→実装→テストの全工程でAIの実用性を証明。",
    },
    {
      id: "demo-website-1w",
      title: "SAP知識共有サイトのフルスクラッチ構築（1週間）",
      what:
        "SAP案件情報、トレーニング資料、ナレッジベースを含むフル機能のWebサイトを、" +
        "AI (Claude Code) と共同でゼロから1週間で構築。データベース設計からフロントエンド実装、" +
        "ユーザー認証まで含む。",
      timeRequired: "1週間（従来見積もり¥7M、2–3ヶ月）",
      toolsUsed: "Claude Code ($20/月プラン)",
      proves:
        "AI 1台 + エンジニア 1人で、従来チーム開発の数十倍の速度でシステム構築が可能。" +
        "ツール費用は労働コスト削減額の0.1%未満。",
    },
    {
      id: "demo-interface-mapping",
      title: "Salesforce→SAP I/F設計の瞬時生成",
      what:
        "Salesforceの受注入力画面のスクリーンショットとSAP DDICテーブル構造をAIに投入。" +
        "AIがフィールドマッピングシート、設計書、接続手順書（0から最後まで）を約5分で生成。",
      timeRequired: "約5分（従来1–2週間）",
      toolsUsed: "Claude Code, SAP DDIC",
      proves:
        "本プロジェクトの主要工数であるSalesforce↔SAPインターフェース開発において、" +
        "AIが設計フェーズを事実上ゼロにできることを実証。1,200本のI/F開発に直接適用可能。",
    },
  ],

  rebuttals: [
    {
      id: "rebuttal-ai-quality",
      competitorClaim:
        "AIが生成する成果物は品質が不安定で、結局人間がすべて修正しなければならない",
      rebuttal:
        "当社のQuality Gate Protocolにより、すべてのAI生成成果物は人間のレビューと承認を経て次の工程に進む。" +
        "Claude Code (Tier A) の精度は他ツールを大きく上回り、設計書は一発で完成レベルに達する（Ryu-san実証済み）。" +
        "ただし、AIは「草案生成」が役割であり、最終判断は常に人間が行う — " +
        "このハイブリッドモデルは品質を落とさず速度だけを上げる。",
      backedBy: ["demo-fiori-2h", "demo-interface-mapping", "claim-proven-track-record"],
    },
    {
      id: "rebuttal-data-learning",
      competitorClaim:
        "AIに顧客の業務データを渡すと、そのデータがAIの学習に使われ、情報漏洩のリスクがある",
      rebuttal:
        "本提案の3層すべてのAIツールは、契約上「顧客データをモデル学習に使用しない」ことを保証している。" +
        "Anthropic (Claude Code) は利用規約で明記し、エンタープライズDPAも提供。" +
        "SAP JouleはBTP環境内でデータが完結し、外部に送信されない。" +
        "Microsoft CopilotはEnterprise Data Protectionで保護される。" +
        "これは「約束」ではなく、各社の法的拘束力のある契約条項に基づく。",
      backedBy: ["claim-data-sovereignty"],
    },
    {
      id: "rebuttal-traditional-safer",
      competitorClaim:
        "従来型の人手開発のほうが安全・確実で、AIのような不確定要素に依存すべきではない",
      rebuttal:
        "従来型開発は「安全」ではない — 人手による設計書・コード・テスト仕様書の不整合がむしろ品質リスク。" +
        "AIの最大の利点は、要件定義書を単一の情報源として、設計書・コード・テスト仕様書を一貫生成することで、" +
        "人為的な不整合を排除できること。さらに、Tier C (Copilot) は即時利用可能であり、" +
        "リスクゼロでAI効果を試せる。AIを使わないリスク（予算超過、工期遅延、競合他社への敗北）のほうが大きい。",
      backedBy: ["claim-phased-de-risk", "demo-interface-mapping"],
    },
    {
      id: "rebuttal-sap-unknown",
      competitorClaim:
        "AIはSAPの専門知識を持たず、SAP特有の複雑な業務ロジックやBAPIの仕様を正しく理解できない",
      rebuttal:
        "Claude CodeはSAP ABAP、BAPI、IDoc、DDICなどのSAP固有技術を十分に理解している。" +
        "Ryu-sanのデモでは、AIがCDS View、BAPI呼び出し、Fiori Elementsの全工程を正確に生成した。" +
        "さらに、SAPネイティブのJoule (Tier B) はSAP BTP環境内で動作し、SAP固有の知識を前提としている。" +
        "本プロジェクトでは、AIの出力を必ずSEがSAP DDICで実在確認するレビューゲートを設けるため、誤ったテーブル名やBAPI名が残ることはない。",
      backedBy: ["demo-fiori-2h", "claim-proven-track-record"],
    },
  ],
};

// ── Accessors ────────────────────────────────────────────────────────────────

export function getClaims() {
  return POSITIONING.claims;
}

export function getDemoEvidence() {
  return POSITIONING.demoEvidence;
}

export function getRebuttals() {
  return POSITIONING.rebuttals;
}

export function getElevatorPitch() {
  return POSITIONING.executiveSummary;
}
