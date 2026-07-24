# CONTEXT — SAP S/4HANA Migration × AI-Assisted Development

## Domain Glossary

### Project Scope

- **S/4HANA Migration**: Client moving from SAP ECC to S/4HANA. Initial scope is **accounting (会計) module**, with sales (販売管理), purchasing (購買管理), and master data interfaces.
- **Salesforce Front-End**: Salesforce serves as the UI layer for ~1,800 sales users. Sales users never touch SAP directly — all business data entry happens in Salesforce and is transferred to SAP via interfaces.
- **Interfaces (I/F)**: Data integration points between Salesforce and S/4HANA. Estimated at **1,200 interfaces**. ~70% are accounting-related; remainder covers sales orders (受注), purchase orders (購買発注), and master data.

### Roles

- **Consultant (コンサルタント)**: Performs 要件定義 (requirements definition). Monthly cost: ¥1,500,000. Daily rate: ~¥75,000.
- **SE (システムエンジニア)**: Performs 設計 (design), 開発 (development), テスト (testing). Monthly cost: ¥1,000,000. Daily rate: ~¥50,000.
- **Client (クライアント)**: Performs 結合テスト and UAT. Not a billable cost to Hitachi. Concerned about budget, AI data privacy, AI quality, audit readiness, and security.

### Project Phases

| Phase (Japanese) | Phase (English) | Key Deliverable | Traditional Role |
|---|---|---|---|
| 構想策定 | Concept | Project roadmap | — |
| 要件定義 | Requirements definition | 要件定義書 per interface (Word) | Consultant (10 days/interface) |
| 基設計 | Basic design | 設計書 / mapping sheets (Word + Excel) | SE (5 days/interface) |
| 開発 | Development | ABAP code, BAPI calls, IDoc config | SE (part of 20 days) |
| 単体テスト | Unit test | テスト仕様書 + results | SE (part of 20 days) |
| 結合テスト+UAT | Integration test + UAT | Test documentation | Client (30 days, batched) |
| 納品 | Delivery | Deployed interfaces, documentation | — |

### AI Tools (Three Tiers)

- **Tier A — Claude Code (Anthropic)**: Highest-precision AI for development. Can generate design docs, mapping specifications, ABAP code, and test cases in minutes. Does NOT train on customer data. ~¥30,000/month at $200 tier. Not yet approved at Hitachi.
- **Tier B — Joule + Joule Studio (SAP)**: SAP-native AI agent platform. 51 Joule Assistants and 224 Joule Agents planned. Joule Studio enters GA in Q3 2026. No training on customer data; data stays within SAP BTP. Licensing model unknown. Hitachi has shared user IDs available for testing.
- **Tier C — GitHub Copilot (Microsoft)**: Already approved at Hitachi. Weaker precision — suitable for code snippets, not reliable for design documents or end-to-end generation. ~¥3,000/month at $20 tier. Enterprise data protection available.

### Cost Model

- **Traditional per interface**: ¥2,000,000 (35 person-days: 10 consultant + 25 SE). Excludes UAT (client cost).
- **1200 interfaces total (traditional)**: ¥2,400,000,000 (2.4 billion yen).
- **Key metric**: Person-days per interface, compressed by AI assistance ratio.

### Client Concerns (Risk Areas)

- **Data Privacy (データプライバシー)**: Fear that AI models will learn/train on the client's business data. Addressed by contractual "no training" clauses from all three AI vendors.
- **AI Quality (AI品質)**: Fear of hallucinated field mappings, incorrect SAP table references, inconsistent outputs. Addressed by human review gates and traceability.
- **Audit Readiness (監査対応)**: Need to trace 要件 → 設計 → コード → テスト. AI advantage: generate all layers from single source of truth, maintaining consistency.
- **Security (セキュリティ)**: Data must not leave approved environments. Tier B (Joule/BTP) has the strongest story here natively.

### Competitive Context

- **Competitive bid**: Hitachi is competing against other vendors. AI-assisted approach is the key differentiator.
- **Proposal deadline**: August 14, 2026. Draft materials needed by first week of August.
- **7-month project timeline**: Applies to the 要件定義 phase and beyond.
