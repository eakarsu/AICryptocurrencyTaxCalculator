# Audit Apply Notes — AICryptocurrencyTaxCalculator

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_02.md` (lines 629-665).

The audit reports `has_ai_route=0`. Inspection shows ~17 AI endpoints across
`routes/aiCenter.js` (chat, tax-planning, cost-basis-optimize, wash-sale-check,
portfolio-tax-risk, regulatory-updates, full-summary, chat-history) and
`routes/aiNew.js` (tax-bracket-forecaster, donation-optimizer, audit-defense,
international-tax, earned-income-split, staking-reward-automator,
carbon-offset-tax-credit, roth-conversion-simulator). The audit metadata is
stale.

Per apply-pass policy (>15 AI endpoints → backlog-only), this pass is
**backlog-only**.

## Original audit recommendations

### Missing AI counterparts (audit, partly already satisfied)
- `/analyze-crypto-tax-strategy`, `/optimize-tax-loss-harvesting`,
  `/predict-tax-liability`, `/recommend-trading-for-tax-efficiency`,
  `/analyze-defi-tax-implications`, `/auto-categorize-transactions`,
  `/generate-tax-report`. Several are already covered by existing endpoints.

### Missing non-AI features
- Exchange API integrations (Coinbase, Kraken, Binance).
- Real-time price feed integration.
- CPA/accountant review workflow.
- Wallet/private-key security (assumed external).

### Custom feature suggestions
- Tax optimization engine.
- Predictive tax-liability forecasting.
- DeFi tax automation.
- Regulatory scenario modeling.
- Multi-jurisdiction tax optimization.

## Implemented in this pass

None. Backlog-only.

## Backlog (prioritized)

### Mechanical, low-risk
1. `/api/ai/auto-categorize-transactions` — given a list of raw transactions,
   classify each as buy/sell/swap/airdrop/staking/mining/defi/etc.
2. `/api/ai/analyze-defi-tax-implications` — given a DeFi position, return tax
   characterization.

### Needs product decision
- Persistence model for categorized batches (queue / async).
- "Generate tax report" workflow vs. existing `taxReports` route.

### Needs credentials / external SDK
- Exchange APIs (Coinbase, Kraken, Binance).
- Price feeds (CoinGecko, CoinMarketCap, Chainalysis).
- E-signature for CPA review workflow.

### Too risky / large refactor
- Multi-jurisdiction tax optimizer (jurisdiction-by-jurisdiction work).
- Wallet integrations and on-chain data ingestion.

## Apply pass 3 (frontend)

LEFT-AS-IS. FE already wired end-to-end. `frontend/src/services/api.js` exports `aiCenter` plus per-domain helpers (`transactions.aiClassify`, `portfolio.aiAnalyze`, `taxReports.aiGenerate`, `miningStaking.aiAnalyze`, `defi.aiAnalyze`, `nft.aiAnalyze`, `taxLossHarvest.aiOpportunities`, `audit.aiRiskAssessment`, `crossBorder.aiAnalyze`, `compliance.aiCheck`) covering every `aiCenter.js`/`aiNew.js`/per-resource AI endpoint. JWT bearer is set by an axios interceptor reading `localStorage.token`; 401 triggers logout redirect. AI pages: `pages/AICenterPage.js` and `pages/AIAdvancedPage.js`. No changes made.

## Apply pass 4 (mechanical backlog)

LEFT-AS-IS. Both items in the MECHANICAL backlog (`/api/ai/auto-categorize-transactions`, `/api/ai/analyze-defi-tax-implications`) are already implemented in `backend/src/routes/aiNew.js` (lines 491–587) with explicit `OPENROUTER_API_KEY` 503 guards, and the FE is wired in `frontend/src/services/api.js` (`autoCategorizeTransactions`, `analyzeDefiTaxImplications`) plus `frontend/src/pages/AIAdvancedPage.js` (entries `auto-categorize-transactions`, `analyze-defi-tax-implications`). Remaining backlog is NEEDS-CREDS (exchange APIs, price feeds, e-signature) or NEEDS-PRODUCT-DECISION (categorized-batch persistence, generate-tax-report workflow vs. existing `taxReports` route) or TOO-RISKY (multi-jurisdiction optimizer, wallet/on-chain ingestion). No changes made.
