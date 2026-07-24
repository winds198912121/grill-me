# ADR 0001: Three-Tier AI Comparison Framework for Proposal

**Date**: 2026-07-24
**Status**: Accepted

## Context

The client's SAP S/4HANA migration involves ~1,200 Salesforce ↔ SAP interfaces. Traditional implementation is estimated at ¥2,400,000,000 — exceeding the client's budget. We need to propose AI-assisted development as a cost-reduction strategy, comparing three AI tiers against the traditional baseline.

The client is in a competitive bid situation. Competitors are likely proposing traditional approaches. AI assistance is our key differentiator.

## Decision

We will present a **three-tier AI comparison** against traditional implementation:

| Tier | Tool | Data Residency | Hitachi Approval | Precision |
|------|------|---------------|------------------|-----------|
| A | Claude Code (Anthropic) | No training on customer data; runs locally | Not yet approved | Highest |
| B | Joule + Joule Studio (SAP) | SAP BTP ecosystem | Shared IDs available | Unknown (to be evaluated) |
| C | GitHub Copilot (Microsoft) | Enterprise data protection | Already approved | Weaker (code only) |

The comparison will cover **every project phase** with estimates for:
1. **Cost**: Yen per interface, compressed by AI
2. **Timeline**: Phase duration compression
3. **Quality**: Consistency and defect rate
4. **Documentation accuracy**: Traceability from 要件 → 設計 → コード → テスト

## Rationale

- **Three tiers give the client choice**: They can pick what fits their risk tolerance, from "safe and weak" (Copilot) to "powerful but needs approval" (Claude Code).
- **Tier B (Joule) is positioned as the strategic future option**: Evaluation during 要件定義 phase, not immediate commitment.
- **AI compression ratios** are estimated from Ryu-san's daily experience and publicly documented benchmarks. Conservative estimates maintain credibility.

## Consequences

- The proposal must include a dedicated **data privacy section** to address the client's primary concern.
- Compression ratios should be presented as **ranges** ("40–85% reduction") rather than precise claims, reflecting tool maturity differences.
- If the client greenlights a Joule POC during 要件定義, we can refine Tier B estimates with real data.
- Claude Code licensing ($200/month max) must be compared against the ¥2.4 billion traditional baseline to show ROI — even at 10x the list price, it's irrelevant compared to labor savings.

## AI Compression Ratios (per phase, per interface)

| Phase | Traditional (person-days) | Tier A (Claude Code) | Tier B (Joule) | Tier C (Copilot) |
|-------|--------------------------|---------------------|----------------|------------------|
| 要件定義 | 10 | 2–3 (70%↓) | 4–6 (50%↓) | 6–8 (30%↓) |
| 設計 | 5 | 0.5–1 (85%↓) | 1.5–2.5 (60%↓) | 2.5–3.5 (40%↓) |
| 開発+単体テスト | 20 | 3–5 (80%↓) | 7–12 (55%↓) | 12–15 (35%↓) |
| **Total billable** | **35** | **5.5–9** | **12.5–20.5** | **20.5–26.5** |
| **Cost per I/F** | **¥2,000,000** | **¥315,000–515,000** | **¥715,000–1,175,000** | **¥1,175,000–1,510,000** |
| **1200 I/F total** | **¥2.4B** | **¥378M–618M** | **¥858M–1.41B** | **¥1.41B–1.81B** |
