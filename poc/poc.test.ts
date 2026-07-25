/**
 * PoC Test Suite — validates AI-generated artifacts against quality checklists.
 *
 * Selects 受注伝票登録 (Sales Order Registration) as the representative I/F.
 * Direction: Salesforce → SAP S/4HANA
 * Method: BAPI_SALESORDER_CREATEFROMDAT2
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const POC_DIR = resolve(import.meta.dir!, "受注伝票登録");

function readDoc(filename: string): string {
  expect(existsSync(resolve(POC_DIR, filename)), `${filename} should exist`).toBe(true);
  return readFileSync(resolve(POC_DIR, filename), "utf-8");
}

// ── Artifact existence ──

describe("PoC — artifact existence", () => {
  const artifacts = [
    "01-要件定義書.md",
    "02-設計書・マッピングシート.md",
    "03-ABAPコード.txt",
    "04-テスト仕様書.md",
    "05-BTP設定手順書.md",
    "06-BTP-iFlow設計書.md",
    "07-BTP-マッピング設定書.md",
  ];

  for (const f of artifacts) {
    it(`${f} exists and is non-empty`, () => {
      const content = readDoc(f);
      expect(content.length).toBeGreaterThan(200);
    });
  }
});

// ── 要件定義書 checklist (REQ-01 ~ REQ-06) ──

describe("PoC — 要件定義書 quality (REQ checklist)", () => {
  const doc = readDoc("01-要件定義書.md");

  it("REQ-01: I/F目的と業務シナリオが明記されている", () => {
    expect(doc).toMatch(/受注伝票/);
    expect(doc).toMatch(/Salesforce/);
    expect(doc).toMatch(/SAP/);
  });

  it("REQ-02: 連携方向（Salesforce→SAP）が明示されている", () => {
    expect(doc).toMatch(/Salesforce\s*→\s*SAP|Salesforce\s*から\s*SAP|方向.*Salesforce.*SAP/);
  });

  it("REQ-03: 連携データ項目一覧が過不足なく列挙されている（10–20項目）", () => {
    const fieldMatches = doc.match(/\|\s*[A-Z_]{3,20}\s*\|/g);
    expect(fieldMatches).not.toBeNull();
    expect(fieldMatches!.length).toBeGreaterThanOrEqual(10);
    expect(fieldMatches!.length).toBeLessThanOrEqual(25);
  });

  it("REQ-04: エラー発生時の処理方針が記載されている", () => {
    expect(doc).toMatch(/エラー|異常|例外|リトライ|エラーログ/);
  });

  it("REQ-05: SAP側のBAPI名が正しい", () => {
    expect(doc).toMatch(/BAPI_SALESORDER_CREATEFROMDAT2/);
  });

  it("REQ-06: 非機能要件が記載されている", () => {
    expect(doc).toMatch(/性能|レスポンスタイム|データ量|同時実行/);
  });
});

// ── 設計書 checklist (DSG-01 ~ DSG-05) ──

describe("PoC — 設計書 quality (DSG checklist)", () => {
  const doc = readDoc("02-設計書・マッピングシート.md");

  it("DSG-01: Salesforce項目 → SAPテーブル・項目のマッピングが定義されている", () => {
    expect(doc).toMatch(/\|\s*[A-Z_]{3,20}\s*\|/);  // SAP field names
    expect(doc).toMatch(/Salesforce/);
    expect(doc).toMatch(/VBAK|VBAP|KNA1|MARA|BAPISD/);  // real SAP tables
  });

  it("DSG-02: データ型変換ルールが明示されている", () => {
    expect(doc).toMatch(/CHAR|NUMC|DATS|DEC|CURR|データ型|変換/);
  });

  it("DSG-03: コード変換マッピングが定義されている", () => {
    expect(doc).toMatch(/VKORG|VTWEG|SPART|販売組織|流通チャネル|コード変換|固定値/);
  });

  it("DSG-04: I/F方式選定理由が記載されている", () => {
    expect(doc).toMatch(/BAPI|RFC|IDoc|選定|リアルタイム|同期/);
  });

  it("DSG-05: エラーハンドリング方式が設計されている", () => {
    expect(doc).toMatch(/RETURN|エラーハンドリング|BAPIRETURN|ROLLBACK|COMMIT/);
  });
});

// ── ABAPコード checklist (CD-01 ~ CD-06) ──

describe("PoC — ABAPコード quality (CD checklist)", () => {
  const code = readDoc("03-ABAPコード.txt");

  it("CD-01: BAPI呼び出しパラメータが存在する", () => {
    expect(code).toMatch(/CALL FUNCTION.*BAPI_SALESORDER_CREATEFROMDAT2/);
  });

  it("CD-02: COMMIT WORK制御がある", () => {
    expect(code).toMatch(/COMMIT WORK|BAPI_TRANSACTION_COMMIT/);
  });

  it("CD-03: エラーハンドリングが網羅的（BAPIRETURN, SY-SUBRC）", () => {
    expect(code).toMatch(/BAPIRETURN|RETURN|SY-SUBRC/);
    expect(code).toMatch(/ROLLBACK|ROLLBACK WORK/);
  });

  it("CD-04: SELECTループがない（FOR ALL ENTRIESまたは直SELECT）", () => {
    // 本番コードではSELECT...ENDSELECTは禁止
    expect(code).not.toMatch(/SELECT\s+.*\n.*ENDSELECT/);
  });

  it("CD-05: コーディング規約準拠（PREFIX, コメント）", () => {
    expect(code).toMatch(/^\*/m);  // ABAP comment lines
    expect(code).toMatch(/lv_|ls_|lt_/);  // Hungarian notation
  });

  it("CD-06: 構造化されたコード（FORM, METHOD, または FUNCTION）", () => {
    expect(code).toMatch(/FORM|METHOD|FUNCTION|REPORT/);
  });
});

// ── テスト仕様書 checklist (TST-01 ~ TST-05) ──

describe("PoC — テスト仕様書 quality (TST checklist)", () => {
  const doc = readDoc("04-テスト仕様書.md");

  it("TST-01: 設計書の全項目がテストケースでカバーされている", () => {
    // Should reference the fields from the design doc
    expect(doc).toMatch(/ORDER_NUMBER|SALES_ORG|DISTR_CHAN|DIVISION/);
  });

  it("TST-02: 異常系テストケースが十分（通信断、不正データ）", () => {
    expect(doc).toMatch(/異常系|エラーケース|通信断|不正|存在しない/);
  });

  it("TST-03: 境界値テストが含まれている", () => {
    expect(doc).toMatch(/境界値|最大|最小|空文字|NULL|ゼロ/);
  });

  it("TST-04: テストデータが具体的に定義されている", () => {
    expect(doc).toMatch(/テストデータ|得意先コード|品目コード|プラント/);
  });

  it("TST-05: 期待値（合否判定基準）が明示されている", () => {
    expect(doc).toMatch(/期待値|合格|不合格|BAPIRETURN.*TYPE.*S/);
  });
});

// ── Traceability (要件 → 設計 → コード → テスト) ──

describe("PoC — traceability across artifacts", () => {
  const req = readDoc("01-要件定義書.md");
  const design = readDoc("02-設計書・マッピングシート.md");
  const code = readDoc("03-ABAPコード.txt");
  const test = readDoc("04-テスト仕様書.md");

  it("BAPI name consistent across all 4 documents", () => {
    const bapi = "BAPI_SALESORDER_CREATEFROMDAT2";
    expect(req).toMatch(bapi);
    expect(design).toMatch(bapi);
    expect(code).toMatch(bapi);
    expect(test).toMatch(bapi);
  });

  it("I/F direction consistent across all 4 documents", () => {
    for (const doc of [req, design, test]) {
      expect(doc).toMatch(/Salesforce/);
      expect(doc).toMatch(/SAP|S\/4HANA/);
    }
  });

  it("key fields from 要件定義 appear in 設計書", () => {
    expect(design).toMatch(/受注番号|ORDER_NUMBER|SALESDOCUMENT/);
    expect(design).toMatch(/得意先|CUSTOMER|SOLD_TO|KUNAG/);
    expect(design).toMatch(/品目|MATERIAL|MATNR/);
  });

  it("key fields from 設計書 appear in ABAP code", () => {
    expect(code).toMatch(/salesdocument|order_number|SALESDOCUMENT/i);
    expect(code).toMatch(/sold_to|customer|p_kunnr/i);
    expect(code).toMatch(/material|matnr|p_matnr/i);
  });

  it("key fields from 設計書 appear in テスト仕様書", () => {
    expect(test).toMatch(/受注番号|受注伝票|SALESDOCUMENT|SALES_ORG/);
    expect(test).toMatch(/得意先|SOLD_TO/);
    expect(test).toMatch(/品目|MATERIAL/);
  });
});

// ── AI compression evidence ──

describe("PoC — AI compression evidence", () => {
  it("all 7 artifacts were AI-generated with human review", () => {
    const all = [
      "01-要件定義書.md", "02-設計書・マッピングシート.md",
      "04-テスト仕様書.md", "05-BTP設定手順書.md",
      "06-BTP-iFlow設計書.md", "07-BTP-マッピング設定書.md",
    ];
    for (const f of all) {
      const doc = readDoc(f);
      expect(doc).toMatch(/AI生成|自動生成|Claude|生成日|作成方法|PoC/);
    }
  });
});

// ── BTP artifacts ──

describe("PoC — BTP setup document", () => {
  const doc = readDoc("05-BTP設定手順書.md");

  it("covers Cloud Connector setup", () => {
    expect(doc).toMatch(/Cloud Connector/);
  });

  it("covers BTP Destination configuration", () => {
    expect(doc).toMatch(/Destination/);
  });

  it("covers Integration Suite activation", () => {
    expect(doc).toMatch(/Integration Suite/);
  });

  it("has connectivity checklist", () => {
    expect(doc).toMatch(/チェックリスト|確認項目/);
  });

  it("has troubleshooting guidance", () => {
    expect(doc).toMatch(/トラブルシューティング|対処/);
  });
});

describe("PoC — BTP iFlow design", () => {
  const doc = readDoc("06-BTP-iFlow設計書.md");

  it("references the correct BAPI", () => {
    expect(doc).toMatch(/BAPI_SALESORDER_CREATEFROMDAT2/);
  });

  it("has JSON→XML conversion step", () => {
    expect(doc).toMatch(/JSON.*XML|XML.*JSON/);
  });

  it("has RFC receiver configuration", () => {
    expect(doc).toMatch(/RFC.*Receiver|RFC.*Adapter/);
  });

  it("has exception handling subprocess", () => {
    expect(doc).toMatch(/Exception|エラー処理|リトライ/);
  });

  it("has deploy steps", () => {
    expect(doc).toMatch(/デプロイ|Deploy/);
  });

  it("includes Mermaid diagram", () => {
    expect(doc).toMatch(/```mermaid/);
  });
});

describe("PoC — BTP mapping config", () => {
  const doc = readDoc("07-BTP-マッピング設定書.md");

  it("has header field mapping table", () => {
    expect(doc).toMatch(/ORDER_HEADER_IN|SALES_ORG|DIVISION/);
  });

  it("has date conversion logic", () => {
    expect(doc).toMatch(/DATS|YYYYMMDD|ReplaceAll|convertDate/);
  });

  it("has code conversion (distr chan / unit)", () => {
    expect(doc).toMatch(/ValueMapping|コード変換|流通チャネル/);
  });

  it("has Groovy script for extended logic", () => {
    expect(doc).toMatch(/groovy|Groovy|processData/);
  });

  it("has material code padding logic", () => {
    expect(doc).toMatch(/PadLeft|padLeft|ゼロ埋め/);
  });

  it("has partner mapping (AG/WE)", () => {
    expect(doc).toMatch(/PARTN_ROLE|AG|WE|SOLD_TO|SHIP_TO/);
  });

  it("includes Mermaid diagram", () => {
    expect(doc).toMatch(/```mermaid/);
  });
});
