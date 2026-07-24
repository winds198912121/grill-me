# SPEC 0001: AI-Assisted Implementation Proposal for SAP S/4HANA Migration

**Status**: ready-for-agent
**Created**: 2026-07-24
**Parent ADR**: [ADR 0001](../adr/0001-ai-assisted-comparison-framework.md)
**Domain Glossary**: [CONTEXT.md](../../CONTEXT.md)

---

## Problem Statement

日立システムズ is preparing a competitive proposal for a client migrating from SAP ECC to S/4HANA, with Salesforce serving as the front-end for ~1,800 sales users. The project involves developing approximately 1,200 interfaces (I/F) between Salesforce and SAP S/4HANA, covering accounting (~70%), sales orders, purchase orders, and master data.

The client faces four constraints that make a traditional implementation approach non-viable:

1. **Budget insufficient**: Traditional development at ¥2,000,000 per interface (35 person-days: 10 consultant + 25 SE) totals ¥2.4 billion for 1,200 interfaces, exceeding the client's budget. The client wants to minimize cost as much as possible.
2. **Competitive bid**: Other vendors are bidding; Hitachi needs a clear differentiator.
3. **AI data privacy fear**: The client is worried that AI tools will learn from or retain their business data.
4. **Audit and quality concerns**: The client needs assurance that AI-generated deliverables meet audit traceability standards (要件 → 設計 → コード → テスト) and that quality will not degrade compared to traditional methods.
5. **Security**: Data must not leave approved environments.

The proposal deadline is August 14, 2026. Draft materials are needed by the first week of August.

## Solution

A proposal document that presents a side-by-side comparison of **traditional implementation vs. three tiers of AI-assisted implementation** across all project phases. The proposal quantifies cost savings (absolute yen), demonstrates data privacy compliance, and provides a phased adoption roadmap — allowing the client to choose their risk tolerance while seeing clear evidence that AI assistance makes the project financially viable.

The proposal is built around two core seams:

- **Seam 1 — Comparison Engine**: A pure calculation that converts scope (1,200 I/F) × phase breakdown × role rates × AI compression ratios into comparative cost and timeline estimates for four approaches (Traditional, Tier A Claude Code, Tier B Joule, Tier C Copilot).
- **Seam 2 — Quality Gate Protocol**: A cross-cutting invariant that no AI-generated artifact passes to the next phase without human review and sign-off. Defines the review gate shape (reviewer, checklist, exit criteria) applied uniformly across all tiers and all phases.

## User Stories

### Cost Comparison & Decision Making

1. As a client CFO, I want to see the total cost of traditional implementation vs. AI-assisted implementation side-by-side, so that I can understand the budget impact of each approach.
2. As a client CIO, I want to compare the timeline compression achievable with each AI tier, so that I can assess whether the 7-month constraint is realistic.
3. As a client IT manager, I want to see per-interface cost breakdowns by phase (要件定義, 設計, 開発+テスト), so that I know exactly where the savings come from.
4. As a Hitachi project manager, I want the comparison to use credible compression ratios that I can defend if challenged, so that the proposal survives client scrutiny.
5. As a client procurement lead, I want to understand the tool licensing costs for each AI tier separately from the labor costs, so that I can evaluate TCO.

### Tool Selection & Capability

6. As a client IT architect, I want to understand what each AI tier can and cannot do, so that I can make an informed choice about which tool to adopt.
7. As a Hitachi SE, I want to know which AI tool is approved for use now (Tier C Copilot) vs. which requires evaluation (Tier B Joule) vs. which requires security approval (Tier A Claude Code), so that I can start work immediately with the approved tool.
8. As a client security officer, I want to see documented proof that each AI tool does not train on or retain customer business data, so that I can approve the approach.
9. As a Hitachi consultant, I want to know the precision differences between tiers (Claude Code highest, Copilot weakest), so that I set appropriate expectations with the client.
10. As a client SAP architect, I want to understand whether Joule (Tier B) integrates natively with our S/4HANA environment and SAP BTP, so that I can evaluate if the SAP-native option justifies waiting for GA in Q3 2026.

### Data Privacy & Audit

11. As a client auditor, I want to see that every AI-generated deliverable goes through a human review gate with documented sign-off, so that the audit trail remains intact.
12. As a client compliance officer, I want to verify that the traceability chain from 要件定義書 → 設計書 → ABAPコード → テスト仕様書 is preserved when AI generates these artifacts, so that regulatory audits do not fail.
13. As a client data protection officer, I want contractual assurance that Claude Code (Anthropic) does not use our business data for model training, so that our data sovereignty is protected.
14. As a client data protection officer, I want confirmation that Joule operates within the SAP BTP boundary and data never leaves the SAP ecosystem, so that our existing SAP data governance applies.
15. As a client data protection officer, I want verification that GitHub Copilot Enterprise Data Protection prevents our prompts and code from being used for training, so that Microsoft's standard data handling meets our requirements.

### Quality Assurance

16. As a client QA lead, I want to understand the defect rate expectation for AI-generated code vs. human-written code, so that I can plan testing effort appropriately.
17. As a Hitachi SE, I want a clear checklist for reviewing AI-generated ABAP code (BAPI call correctness, IDoc field mapping, error handling completeness), so that I don't miss quality issues.
18. As a Hitachi consultant, I want a review checklist for AI-generated 要件定義書 to verify completeness and correctness, so that the client receives accurate specifications.
19. As a client business stakeholder, I want assurance that AI-generated field mappings between Salesforce screens and SAP tables are validated against the actual SAP DDIC, so that interfaces don't fail in production.
20. As a Hitachi SE, I want AI-generated 設計書 to include explicit mapping of every Salesforce field to its corresponding SAP table.field, with data type conversion rules, so that the mapping is auditable.

### Phase-by-Phase Workflow

21. As a Hitachi consultant during 要件定義, I want AI to draft requirement specification documents from interface pattern templates (受注→受注伝票登録, 購買発注→購買伝票登録, etc.), so that I only need to review and adjust rather than write from scratch.
22. As a Hitachi SE during 基設計, I want to provide a Salesforce screen screenshot and SAP DDIC table structure to the AI and receive a complete field mapping sheet and design document, so that I spend time validating rather than drafting.
23. As a Hitachi SE during 開発, I want to provide the 設計書 to the AI and receive generated ABAP code (BAPI/RFC calls, IDoc configuration, error handling), so that I can focus on code review and testing.
24. As a Hitachi SE during 単体テスト, I want AI to generate test specification documents from the 要件定義書 and 設計書, so that test cases are consistent with the requirements.
25. As a Hitachi SE, I want the AI to generate test cases covering boundary conditions and error paths, so that manual test design effort is reduced.

### Change Management During Development

26. As a Hitachi consultant, when a requirement changes, I want to update the 要件定義書 and have the AI regenerate all downstream artifacts (設計書, コード, テスト仕様書) consistently, so that change propagation is automated rather than manual.
27. As a client project sponsor, I want to know that a requirement change in one interface does not create ripple-effect inconsistencies across the other 1,199 interfaces, so that the project remains manageable.

### PoC & Evaluation

28. As a Hitachi project manager, I want to define a PoC scope (10–20 representative interfaces) to evaluate Joule Studio during the 要件定義 phase, so that we have real data before committing to Tier B for full-scale development.
29. As a client decision maker, I want the proposal to include a clear decision gate after the PoC evaluation — criteria for whether to proceed with Joule or default to Tier A or C — so that we are not locked into an unproven tool.
30. As a Hitachi SE, I want the PoC to cover at least one accounting interface, one sales order interface, and one master data interface, so that the evaluation covers the full scope pattern.

### Approval & Rollout

31. As a Hitachi PM, I want a phased adoption roadmap (Step 1: Copilot immediate, Step 2: Claude Code PoC during 要件定義, Step 3: Joule evaluation during 要件定義, Step 4: full adoption for 設計〜開発), so that we start generating value immediately while evaluating more powerful options.
32. As a Hitachi security team member, I want to understand the approval process required for Claude Code within Hitachi Systems, so that we can initiate it in parallel with proposal preparation.
33. As a client procurement lead, I want to understand that Claude Code licensing (~$200/month/ID max) is negligible compared to the labor savings, so that the licensing cost does not become a blocker.

### Competitive Differentiation

34. As a Hitachi sales lead, I want the AI-assisted approach positioned as our key differentiator against competitors who are likely proposing traditional development, so that we win the bid.
35. As a client evaluator, I want to see that Hitachi has hands-on experience with AI-assisted development (Ryu-san's demonstrated Fiori screen generation in 2 hours, full website built in 1 week), so that the proposal is backed by evidence, not just claims.

### Documentation & Deliverables

36. As a client document controller, I want all AI-generated deliverables to be in the same formats we already use (Word for specifications, Excel for mapping sheets), so that no new tooling or processes are required on our side.
37. As a Hitachi SE, I want the AI to produce consistent formatting across all 1,200 interface documents, so that document quality is uniform regardless of which SE reviews which interface.

## Implementation Decisions

### 1. Three-Tier Comparison Model

The proposal compares four approaches: Traditional + three AI tiers (A: Claude Code, B: Joule, C: Copilot). This is a menu — the client selects their risk tolerance. The three-tier model was chosen over a single recommendation because the tools have different approval statuses, maturity levels, and data residency stories. Presenting all three lets the client make an informed choice while positioning Tier A as the recommended high-water mark and Tier C as the safe fallback available today.

### 2. Compression Ratios Are Presented as Ranges

Compression ratios for each tier are expressed as a range (e.g., "70–85% reduction"), not a single number. Rationale: precision varies by tool maturity (Tier A is production-proven by Ryu-san; Tier B is unproven pre-GA; Tier C is documented as weaker). Ranges maintain credibility by acknowledging uncertainty and avoiding false precision.

### 3. UAT Is Excluded from Billable Scope

結合テスト and UAT are performed by the client and are not part of Hitachi's billable estimate. This boundary was explicitly confirmed. The AI comparison covers only: 要件定義 (consultant), 基設計 (SE), 開発+単体テスト (SE).

### 4. Per-Interface Cost Is the Unit of Comparison

All estimates are expressed per-interface before scaling to 1,200. This makes the math auditable: if the client challenges the total, they can trace it back to the per-interface number. It also allows rescaling if the interface count changes during 要件定義.

### 5. Human Review Gate Is Mandatory, Not Optional

The Quality Gate Protocol is not a suggestion — it is the control that makes AI-generated deliverables auditable. Every artifact crosses a gate with: (a) a named reviewer role, (b) a defined checklist, (c) documented sign-off. No AI-generated artifact proceeds without a gate pass.

### 6. Single Source of Truth for Traceability

The 要件定義書 is the single source of truth. AI generates all downstream artifacts (設計書, ABAPコード, テスト仕様書) from it. When a requirement changes, updating the 要件定義書 and regenerating ensures all layers stay consistent. This directly addresses the audit traceability concern.

### 7. PoC for Tier B (Joule) Before Commitment

Joule Studio is scheduled for GA in Q3 2026. The proposal commits only to evaluating it during the 要件定義 phase, not to using it for full-scale development. A decision gate after PoC determines whether Tier B proceeds. If Joule underperforms, Tier A (Claude Code) is the fallback.

### 8. Cost Rates Are Fixed and Disclosed

Consultant: ¥1,500,000/month (¥75,000/day). SE: ¥1,000,000/month (¥50,000/day). These are disclosed in the proposal so the client can verify the math themselves. Transparency builds trust.

### 9. Tool Licensing Costs Are Separated from Labor Costs

AI tool licenses are shown separately in the comparison. This prevents the client from conflating a ¥30,000/month Claude Code license with the ¥1.8B labor savings it enables. The licensing is presented as a footnote to the labor comparison — it's a rounding error at this scale.

### 10. Data Privacy Argument Follows Vendor-by-Vendor Format

Each AI tier has a dedicated data privacy section with vendor-specific evidence (contractual terms, data flow diagrams, processing boundaries). This directness addresses the client's stated primary fear. No generic "AI is safe" narrative — each vendor is cited by name with their specific guarantees.

## Testing Decisions

### What Makes a Good Test for This Spec

This is a proposal document, not executable software. A "good test" validates that the proposal is **internally consistent** (numbers sum correctly), **externally defensible** (compression ratios have evidence), and **complete** (every client concern mapped to a section). Testing is manual review against objective criteria — there is no test suite.

### Comparison Engine Validation

The Comparison Engine (Seam 1) is tested by verifying:

- **Cross-phase consistency**: (要件定義 cost) + (設計 cost) + (開発+テスト cost) = total cost per interface, for each of the 4 approaches
- **Rate correctness**: person-days × daily rate = cost per phase
- **Scaling correctness**: per-interface cost × 1,200 = total project cost
- **Compression ratio bounds**: each ratio falls in [0, 1]; Tier A ratios > Tier B ratios > Tier C ratios (tool precision ordering)
- **Edge case**: 0% compression = traditional cost; 100% compression = only tool license cost
- **Rounding**: All yen values rounded to nearest 10,000 (no false precision)

### Quality Gate Completeness

The Quality Gate Protocol (Seam 2) is tested by verifying that for each project phase, all four gate fields are populated: (reviewer, artifacts checked, checklist items ≥ 3, sign-off format).

### Prior Art

The comparison table format follows the structure established in ADR 0001 and the proposal draft. The three-tier model and compression ratios are already documented there. This spec formalizes what was implicit.

## Out of Scope

- **結合テスト and UAT**: Client responsibility, not Hitachi-billable
- **Joule licensing model**: Unknown — SAP to be contacted separately; the proposal notes this as TBD
- **Hitachi internal security approval process for Claude Code**: Separate track, parallel to proposal preparation
- **SAP Basis / infrastructure setup**: Not part of this proposal
- **Salesforce UI development**: Salesforce screens are built by the Salesforce team, not covered by this proposal
- **S/4HANA version upgrade (ECC → S/4)**: The technical migration itself; this proposal covers only the interface development
- **Actual AI tool implementation**: This spec covers the proposal document, not the actual AI integration into the development workflow
- **Training SEs on AI tools**: Assumed to happen, but not scoped here
- **Client-side change management / organizational adoption**: Out of scope for this proposal

## Further Notes

- The proposal should be written in Japanese (client is Japanese) but the domain glossary (CONTEXT.md) and ADRs are in English for Hitachi internal reference.
- If the client asks for a live demo during the proposal review, Ryu-san's Fiori screen generation demo (2 hours from scratch) is the recommended showcase — it provides visceral proof of Tier A capability.
- The PoC scope (10–20 interfaces) should be selected to cover all three interface categories: accounting, sales, and master data. At least one complex multi-table interface should be included.
- Compression ratios should be revisited after the PoC. If Joule performs better than the conservative estimate (50–60%), Tier B becomes more competitive and may become the recommended path due to SAP-native integration.
- The proposal deadline (August 14) and draft deadline (first week of August) are hard constraints. The spec and proposal doc should be finalized by July 31 to allow internal review.
