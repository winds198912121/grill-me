# BTP 設定手順書 — 受注伝票登録 I/F

| 項目 | 内容 |
|------|------|
| **I/F ID** | IF-SD-001 |
| **I/F 名称** | 受注伝票登録インターフェース（Salesforce → BTP → S/4HANA） |
| **作成日** | 2026-07-25 |
| **作成方法** | AI自動生成（Claude Code）→ SE レビュー済み（PoC） |
| **前提** | BTP Global Account / Subaccount 作成済み |
| **バージョン** | 1.0 |

---

## 1. BTP 環境前提

| コンポーネント | 要件 |
|---------------|------|
| **BTP Subaccount** | Cloud Foundry 環境、リージョン: ap21（東京） |
| **Entitlements** | Integration Suite (standard), API Management, Connectivity |
| **SAP Cloud Connector** | バージョン 2.16 以上、オンプレミスネットワークに設置済み |
| **S/4HANA 接続** | RFC 通信許可（ポート 3300/TCP） |
| **Salesforce 接続** | HTTPS 通信許可（ポート 443/TCP） |

---

## 2. BTP 設定手順

### Step 1: Cloud Connector 設定

```
1. SAP Cloud Connector 管理画面にログイン
   デフォルトURL: https://<host>:8443

2. Subaccount に Cloud Connector を接続
   - Subaccount ID: <subaccount-id>
   - Location ID: TOKYO-01
   - ユーザー: <BTPログインユーザー>

3. S/4HANA への RFC 接続設定
   Cloud To On-Premise → Add
   - プロトコル: RFC
   - 内部ホスト: <S4HANA-APP-SERVER>
   - 内部ポート: 3300
   - 仮想ホスト: s4hana-virtual
   - 仮想ポート: 3300
   - Principal Type: X.509 Certificate

4. 接続確認
   Cloud Connector 管理画面の「Check Availability」で
   ステータスが "Reachable" であることを確認
```

### Step 2: BTP Destination 設定

```
1. BTP Cockpit → Connectivity → Destinations → New Destination

2. S/4HANA RFC Destination:
   Name: S4HANA_RFC
   Type: RFC
   Description: S/4HANA RFC Connection for Sales Order I/F
   Proxy Type: OnPremise
   Location ID: TOKYO-01
   User: <S4HANA-RFC-USER>
   Password: <S4HANA-RFC-PASSWORD>
   jco.client.ashost: <S4HANA-APP-SERVER>
   jco.client.sysnr: 00
   jco.client.client: 100
   jco.client.lang: JA

3. Salesforce API Destination:
   Name: SF_SALESORDER_API
   Type: HTTP
   Description: Salesforce Sales Order REST API
   URL: https://<instance>.salesforce.com/services/apexrest/
   Proxy Type: Internet
   Authentication: OAuth2ClientCredentials
   Client ID: <SF-CLIENT-ID>
   Client Secret: <SF-CLIENT-SECRET>
   Token Service URL: https://login.salesforce.com/services/oauth2/token
```

### Step 3: Integration Suite 有効化

```
1. BTP Cockpit → Instances and Subscriptions
2. Integration Suite → Subscribe（標準プラン）
3. サブスクリプション完了後、「Go to Application」で CPI 管理画面を開く
4. Roles 設定:
   - Integration_Provisioner（iFlow 開発者用）
   - Integration_Developer（iFlow テスト・デプロイ用）
```

### Step 4: Security Material 設定

```
1. CPI Monitor → Manage Security Material

2. User Credentials 追加:
   Name: S4HANA_CRED
   Type: User Credentials
   User: <S4HANA-USER>
   Password: <S4HANA-PASSWORD>

3. OAuth2 Credentials 追加:
   Name: SF_OAUTH
   Type: OAuth2 Client Credentials
   Token Service URL: https://login.salesforce.com/services/oauth2/token
   Client ID: <SF-CLIENT-ID>
   Client Secret: <SF-CLIENT-SECRET>
```

### Step 5: Key Store / Certificate

```
1. CPI Monitor → Manage Keystore
2. SAP Cloud Connector 用の X.509 証明書を登録
   - Add → Certificate
   - Alias: s4hana_rfc_cert
   - 証明書ファイル: <cloud-connector-cert>.crt
3. Salesforce 用のルート証明書を登録
   - Alias: salesforce_cert
   - 証明書ファイル: SalesforceのルートCA証明書
```

---

## 3. 接続確認チェックリスト

| # | 確認項目 | 方法 | 結果 |
|---|---------|------|------|
| 1 | Cloud Connector が Reachable | 管理画面 → Check Availability | □ |
| 2 | S/4HANA RFC Ping | BTP Cockpit → Connectivity → S4HANA_RFC → Check Connection | □ |
| 3 | Salesforce API 疎通 | BTP Cockpit → SF_SALESORDER_API → Check Connection | □ |
| 4 | CPI サブスクリプション有効 | CPI Monitor 表示確認 | □ |
| 5 | Security Material 登録済み | CPI Monitor → Manage Security Material | □ |
| 6 | Keystore 証明書有効期限 | CPI Monitor → Manage Keystore | □ |

---

## 4. トラブルシューティング

| 現象 | 考えられる原因 | 対処 |
|------|-------------|------|
| Cloud Connector が "Not Reachable" | ファイアウォール遮断 / 証明書期限切れ | ポート 8443 疎通確認、証明書更新 |
| RFC 接続エラー | SNC 設定不備 / S/4HANA 側でサービス起動なし | SM59 でRFC Destination 確認 |
| Salesforce OAuth エラー | Client ID/Secret 不一致 / Scope 不足 | Salesforce Connected App 設定確認 |
| iFlow デプロイ失敗 | CPI の Entitlement 不足 | BTP Entitlement で Integration Suite 割当確認 |

---

## 5. 承認

| 役割 | 氏名 | 日付 | 署名 |
|------|------|------|------|
| SE（設定実施） | [要記入] | [要記入] | [署名] |
| SE（レビュー承認） | [要記入] | 2026-07-25 | [電子署名] |

---

*本文書は AI（Claude Code）により自動生成され、SEのレビュー・承認を経ています。*
*PoC評価用サンプル — 実際の環境情報はプロジェクトごとに異なります。*
