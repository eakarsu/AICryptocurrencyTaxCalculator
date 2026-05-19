const express = require('express');
const { body, validationResult } = require('express-validator');
const { Transaction, AIChat, MiningStaking, Portfolio } = require('../models');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openRouterService');
const { parseAIJson } = require('../services/parseAIJson');
const { logTaxDecision } = require('../services/logger');
const router = express.Router();

const SYSTEM_PROMPT = 'You are an expert cryptocurrency tax attorney and CPA. Provide accurate tax guidance following IRS Notice 2014-21, Rev. Rul. 2023-14, and current Form 1099-DA requirements.';

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  }
  return null;
}

// Apply auth + AI rate limiter to all routes
router.use(auth);
router.use(aiRateLimiter);

// ─── Tax Bracket Forecaster ──────────────────────────────────────────────────
// POST /api/ai/tax-bracket-forecaster
router.post('/tax-bracket-forecaster', [
  body('ytd_gains').notEmpty().isFloat({ min: 0 }).withMessage('ytd_gains must be a non-negative number'),
  body('ytd_losses').notEmpty().isFloat({ min: 0 }).withMessage('ytd_losses must be a non-negative number'),
  body('filing_status')
    .notEmpty()
    .isIn(['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'])
    .withMessage('filing_status must be one of: single, married_filing_jointly, married_filing_separately, head_of_household'),
  body('income').notEmpty().isFloat({ min: 0 }).withMessage('income must be a non-negative number'),
], async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const { ytd_gains, ytd_losses, filing_status, income } = req.body;
    const net_crypto_gains = parseFloat(ytd_gains) - parseFloat(ytd_losses);

    const result = await callOpenRouter(
      `Perform a detailed tax bracket forecast and quarterly payment analysis for this taxpayer:

Filing Status: ${filing_status}
Gross Income (non-crypto): $${income}
YTD Crypto Gains: $${ytd_gains}
YTD Crypto Losses: $${ytd_losses}
Net Crypto Gains: $${net_crypto_gains}

Provide a structured analysis with:
1) Current effective and marginal tax bracket based on total income ($${parseFloat(income) + net_crypto_gains})
2) Estimated total federal tax liability (include short-term vs long-term capital gains breakdown)
3) Estimated state tax exposure (note varies by state; provide typical range)
4) Quarterly estimated payment schedule (Q1–Q4 dates and amounts) under IRS safe harbor rules
5) Projected year-end tax liability if gains/losses continue at the same YTD pace
6) Recommended actions to reduce tax liability before year-end
7) Net Investment Income Tax (NIIT) applicability at 3.8%

Format amounts as dollar figures. Be specific and actionable.`,
      SYSTEM_PROMPT
    );

    const parsedBracket = parseAIJson(result.content);
    await AIChat.create({ userId: req.userId, sessionId: `bracket-${Date.now()}`, role: 'assistant', message: result.content, feature: 'tax_bracket_forecaster', tokens: result.usage?.total_tokens || 0, ai_results: parsedBracket });
    logTaxDecision(req.userId, 'AI_TAX_BRACKET_FORECAST', { filing_status, income, ytd_gains, ytd_losses });
    res.json({
      analysis: result.content,
      parsed: parsedBracket,
      inputs: { ytd_gains, ytd_losses, net_crypto_gains, filing_status, income },
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Donation Optimizer ───────────────────────────────────────────────────────
// POST /api/ai/donation-optimizer
router.post('/donation-optimizer', [
  body('portfolio').notEmpty().isArray({ min: 1 }).withMessage('portfolio must be a non-empty array'),
  body('portfolio.*.asset').notEmpty().isString().withMessage('Each portfolio item must have an asset name'),
  body('portfolio.*.amount').notEmpty().isFloat({ gt: 0 }).withMessage('Each portfolio item must have a positive amount'),
  body('portfolio.*.costBasis').notEmpty().isFloat({ min: 0 }).withMessage('Each portfolio item must have a costBasis'),
  body('portfolio.*.currentValue').notEmpty().isFloat({ min: 0 }).withMessage('Each portfolio item must have a currentValue'),
  body('charity_goals').notEmpty().isArray({ min: 1 }).withMessage('charity_goals must be a non-empty array'),
], async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const { portfolio, charity_goals } = req.body;

    const portfolioSummary = portfolio.map(p => ({
      ...p,
      unrealizedGain: (parseFloat(p.currentValue) - parseFloat(p.costBasis)).toFixed(2),
      gainPercent: (((parseFloat(p.currentValue) - parseFloat(p.costBasis)) / parseFloat(p.costBasis)) * 100).toFixed(1),
    }));

    const result = await callOpenRouter(
      `Optimize cryptocurrency charitable donations for maximum tax deduction:

Portfolio Holdings (with unrealized gains):
${JSON.stringify(portfolioSummary, null, 2)}

Charitable Goals:
${JSON.stringify(charity_goals, null, 2)}

Provide:
1) Which specific assets to donate and in what amounts to maximize the charitable deduction (prioritize highly appreciated assets to avoid capital gains)
2) Estimated fair market value deduction per donation
3) Capital gains tax avoided by donating appreciated crypto instead of selling
4) Qualified Opportunity Zone considerations if applicable
5) Donor-Advised Fund (DAF) strategy for bunching deductions
6) IRS Form 8283 requirements for non-cash charitable contributions > $500
7) Substantiation requirements (qualified appraisal, contemporaneous written acknowledgment)
8) Recommended timing (before year-end vs. next year based on income)
9) Total estimated tax benefit (deduction value + avoided capital gains tax)

Be specific about amounts and asset names from the portfolio provided.`,
      SYSTEM_PROMPT
    );

    logTaxDecision(req.userId, 'AI_DONATION_OPTIMIZER', { assetCount: portfolio.length });
    res.json({
      analysis: result.content,
      portfolioAnalyzed: portfolioSummary,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Audit Defense ────────────────────────────────────────────────────────────
// POST /api/ai/audit-defense
router.post('/audit-defense', [
  body('transaction_id').notEmpty().isInt({ gt: 0 }).withMessage('transaction_id must be a positive integer'),
], async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const { transaction_id } = req.body;

    const transaction = await Transaction.findOne({
      where: { id: parseInt(transaction_id), userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or does not belong to this user' });
    }

    const result = await callOpenRouter(
      `Draft a comprehensive IRS audit defense package for this cryptocurrency transaction:

Transaction Details:
${JSON.stringify(transaction.toJSON(), null, 2)}

Generate:
1) SUPPORTING NARRATIVE: A clear, factual, professional narrative explaining this transaction (who, what, when, where, why, how — from a taxpayer's perspective). Write in first person.

2) DOCUMENTATION CHECKLIST: List all records the taxpayer should gather:
   - Exchange records / confirmation emails
   - Blockchain transaction hash verification steps
   - Wallet records
   - Cost basis documentation
   - Prior year records if relevant

3) IRS RESPONSE TEMPLATE: A formal, professional letter template to respond to an IRS inquiry about this transaction. Include:
   - Proper IRS correspondence format
   - Reference to applicable IRC sections and IRS guidance (IRS Notice 2014-21, Rev. Rul. 2023-14)
   - Clear tax position statement
   - Attached evidence list

4) LEGAL ARGUMENTS: Key tax law arguments supporting the taxpayer's position

5) RISK ASSESSMENT: Likelihood of IRS scrutiny (Low/Medium/High) and why

Format clearly with section headers.`,
      SYSTEM_PROMPT
    );

    logTaxDecision(req.userId, 'AI_AUDIT_DEFENSE', { transactionId: transaction_id });
    res.json({
      transaction: transaction.toJSON(),
      auditDefensePackage: result.content,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── International Tax ────────────────────────────────────────────────────────
// POST /api/ai/international-tax
router.post('/international-tax', [
  body('countries').notEmpty().isArray({ min: 1 }).withMessage('countries must be a non-empty array'),
  body('countries.*').isString().isLength({ min: 2, max: 100 }).withMessage('Each country must be a valid string'),
  body('crypto_holdings').notEmpty().isArray({ min: 1 }).withMessage('crypto_holdings must be a non-empty array'),
  body('crypto_holdings.*.asset').notEmpty().isString().withMessage('Each holding must have an asset'),
  body('crypto_holdings.*.amount').notEmpty().isFloat({ gt: 0 }).withMessage('Each holding must have a positive amount'),
  body('crypto_holdings.*.value_usd').notEmpty().isFloat({ min: 0 }).withMessage('Each holding must have a value_usd'),
], async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const { countries, crypto_holdings } = req.body;

    const result = await callOpenRouter(
      `Provide comprehensive international cryptocurrency tax reporting requirements and obligations:

Countries of Nexus/Residence: ${countries.join(', ')}

Crypto Holdings:
${JSON.stringify(crypto_holdings, null, 2)}

For EACH country listed, provide:
1) REPORTING THRESHOLDS: Minimum holding/transaction amounts requiring reporting
2) FILING REQUIREMENTS: Specific forms, schedules, and deadlines
3) TAX TREATMENT: How crypto is classified (property, currency, commodity, security) and tax rates
4) FOREIGN ASSET REPORTING (if US taxpayer): FBAR (FinCEN 114), FATCA Form 8938, threshold analysis based on holdings
5) FATF/AML CONSIDERATIONS: Anti-money laundering reporting thresholds per country
6) DOUBLE TAXATION TREATIES: Relevant tax treaty provisions between the listed countries
7) CONTROLLED FOREIGN CORPORATION (CFC) RULES: If applicable
8) IMMEDIATE ACTION ITEMS: What the taxpayer should do now to stay compliant
9) PENALTIES FOR NON-COMPLIANCE: Key penalties in each jurisdiction

Total portfolio USD value: $${crypto_holdings.reduce((sum, h) => sum + parseFloat(h.value_usd || 0), 0).toFixed(2)}

Be jurisdiction-specific and highlight where the holdings cross reporting thresholds.`,
      SYSTEM_PROMPT
    );

    logTaxDecision(req.userId, 'AI_INTERNATIONAL_TAX', { countries, holdingCount: crypto_holdings.length });
    res.json({
      analysis: result.content,
      jurisdictions: countries,
      totalHoldingsUSD: crypto_holdings.reduce((sum, h) => sum + parseFloat(h.value_usd || 0), 0).toFixed(2),
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Earned Income Split Analyzer ────────────────────────────────────────────
// POST /api/ai/earned-income-split
router.post('/earned-income-split', [
  body('annual_trades').notEmpty().isInt({ min: 0 }).withMessage('annual_trades must be a non-negative integer'),
  body('gross_revenue').notEmpty().isFloat({ min: 0 }).withMessage('gross_revenue must be a non-negative number'),
  body('hours_per_week').notEmpty().isFloat({ min: 0, max: 168 }).withMessage('hours_per_week must be between 0 and 168'),
  body('home_office_pct').optional().isFloat({ min: 0, max: 100 }).withMessage('home_office_pct must be 0-100'),
  body('equipment_costs').optional().isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  try {
    const { annual_trades, gross_revenue, hours_per_week, home_office_pct = 0, equipment_costs = 0 } = req.body;
    const result = await callOpenRouter(
      `Analyze whether this active crypto trader should be treated as a self-employed business (Schedule C / Sec 475 trader status) versus capital gains treatment.

Inputs:
- Annual trades: ${annual_trades}
- Gross revenue: $${gross_revenue}
- Avg hours/week of trading activity: ${hours_per_week}
- Home office percentage: ${home_office_pct}%
- Equipment / data feed costs: $${equipment_costs}

Return ONLY a JSON object (no markdown, no commentary) with this structure:
{
  "trader_status_eligibility": "<eligible|borderline|not_eligible>",
  "trader_status_rationale": "<brief explanation citing the case law / IRS guidance basis>",
  "self_employment_tax_estimate": <number>,
  "capital_gains_tax_estimate": <number>,
  "se_vs_cg_net_difference": <number positive means SE saves money>,
  "recommended_treatment": "<self_employment|capital_gains|sec_475_mtm>",
  "deductible_business_expenses": ["<expense1>", "<expense2>"],
  "estimated_total_deductions": <number>,
  "qbi_deduction_eligible": <true|false>,
  "qbi_deduction_estimate": <number or 0>,
  "filing_changes_required": ["<change1>"],
  "audit_risk": "<low|medium|high>",
  "key_risks_and_caveats": ["<risk1>"],
  "next_action_steps": ["<step1>", "<step2>"]
}`,
      'You are an expert cryptocurrency tax attorney and CPA. Provide accurate tax guidance following IRS Notice 2014-21, Rev. Rul. 2023-14, and current Form 1099-DA requirements.'
    );
    const parsed = parseAIJson(result.content) || { raw_response: result.content, parse_error: true };
    await AIChat.create({ userId: req.userId, sessionId: `earned-income-${Date.now()}`, role: 'assistant', message: result.content, feature: 'earned_income_split', tokens: result.usage?.total_tokens || 0, ai_results: parsed });
    logTaxDecision(req.userId, 'AI_EARNED_INCOME_SPLIT', { annual_trades, gross_revenue, model: result.model });
    res.json({ analysis: parsed, raw: result.content, inputs: { annual_trades, gross_revenue, hours_per_week, home_office_pct, equipment_costs }, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Staking Reward Automator ────────────────────────────────────────────────
// POST /api/ai/staking-reward-automator
router.post('/staking-reward-automator', [
  body('protocols').optional().isArray(),
  body('include_history').optional().isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  try {
    const { protocols = [] } = req.body;
    const where = { userId: req.userId };
    const stakingHistory = await MiningStaking.findAll({ where, limit: 50, order: [['createdAt', 'DESC']] });
    const result = await callOpenRouter(
      `Categorize and value the following staking / mining rewards for tax reporting.

Filter to user-supplied protocols when provided; otherwise consider all rewards.
Requested protocols: ${JSON.stringify(protocols)}
Reward records (latest 50): ${JSON.stringify(stakingHistory)}

Return ONLY a JSON object (no prose, no markdown) with this structure:
{
  "summary": {
    "total_rewards_count": <number>,
    "total_fmv_at_receipt_usd": <number>,
    "total_ordinary_income_usd": <number>,
    "non_usd_rewards_count": <number>
  },
  "by_protocol": [
    {
      "protocol": "<name>",
      "asset": "<symbol>",
      "category": "<staking|mining|liquidity_mining|airdrop>",
      "rewards_count": <number>,
      "fmv_at_receipt_usd": <number>,
      "tax_treatment": "<ordinary_income|other>",
      "1099_form": "<1099-MISC|1099-NEC|none>"
    }
  ],
  "non_usd_reward_flags": [
    { "protocol": "<name>", "reason": "<why this needs manual review>" }
  ],
  "recommended_actions": ["<action1>", "<action2>"],
  "estimated_quarterly_estimated_payment_addition_usd": <number>
}`,
      'You are an expert cryptocurrency tax attorney and CPA. Provide accurate tax guidance following IRS Notice 2014-21, Rev. Rul. 2023-14, and current Form 1099-DA requirements.'
    );
    const parsed = parseAIJson(result.content) || { raw_response: result.content, parse_error: true };
    await AIChat.create({ userId: req.userId, sessionId: `staking-${Date.now()}`, role: 'assistant', message: result.content, feature: 'staking_reward_automator', tokens: result.usage?.total_tokens || 0, ai_results: parsed });
    logTaxDecision(req.userId, 'AI_STAKING_REWARD_AUTOMATOR', { protocols, recordCount: stakingHistory.length });
    res.json({ analysis: parsed, raw: result.content, recordCount: stakingHistory.length, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Carbon Offset Tax Credit Finder ─────────────────────────────────────────
// POST /api/ai/carbon-offset-tax-credit
router.post('/carbon-offset-tax-credit', [
  body('mining_kwh_year').optional().isFloat({ min: 0 }),
  body('mining_revenue_year').optional().isFloat({ min: 0 }),
  body('renewable_pct').optional().isFloat({ min: 0, max: 100 }),
  body('carbon_credits_purchased_usd').optional().isFloat({ min: 0 }),
  body('state').optional().isString().isLength({ min: 2, max: 50 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  try {
    const {
      mining_kwh_year = 0,
      mining_revenue_year = 0,
      renewable_pct = 0,
      carbon_credits_purchased_usd = 0,
      state = 'Unknown',
    } = req.body;
    const result = await callOpenRouter(
      `Identify carbon offset and clean energy tax credits available to a cryptocurrency mining operation.

Operation profile:
- Annual electricity (kWh): ${mining_kwh_year}
- Annual mining revenue: $${mining_revenue_year}
- Renewable energy share: ${renewable_pct}%
- Carbon credits purchased this year: $${carbon_credits_purchased_usd}
- US state of operation: ${state}

Return ONLY a JSON object (no markdown, no prose) with this structure:
{
  "applicable_federal_credits": [
    {
      "credit_name": "<e.g., IRC 45Q>",
      "description": "<short description>",
      "estimated_credit_value_usd": <number>,
      "qualification_notes": "<key qualification criteria>"
    }
  ],
  "applicable_state_credits": [
    {
      "credit_name": "<state credit>",
      "state": "${state}",
      "estimated_credit_value_usd": <number>
    }
  ],
  "carbon_offset_deduction_value_usd": <number>,
  "recommended_documentation": ["<doc1>", "<doc2>"],
  "ineligible_with_reason": [
    { "credit": "<name>", "reason": "<why>" }
  ],
  "total_estimated_tax_benefit_usd": <number>,
  "audit_risk_level": "<low|medium|high>",
  "next_steps": ["<step1>"]
}`,
      'You are an expert cryptocurrency tax attorney and CPA. Provide accurate tax guidance following IRS Notice 2014-21, Rev. Rul. 2023-14, and current Form 1099-DA requirements.'
    );
    const parsed = parseAIJson(result.content) || { raw_response: result.content, parse_error: true };
    await AIChat.create({ userId: req.userId, sessionId: `carbon-${Date.now()}`, role: 'assistant', message: result.content, feature: 'carbon_offset_tax_credit', tokens: result.usage?.total_tokens || 0, ai_results: parsed });
    logTaxDecision(req.userId, 'AI_CARBON_OFFSET_TAX_CREDIT', { state, mining_kwh_year, renewable_pct });
    res.json({ analysis: parsed, raw: result.content, inputs: { mining_kwh_year, mining_revenue_year, renewable_pct, carbon_credits_purchased_usd, state }, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Roth Conversion Simulator ───────────────────────────────────────────────
// POST /api/ai/roth-conversion-simulator
router.post('/roth-conversion-simulator', [
  body('traditional_ira_balance').notEmpty().isFloat({ min: 0 }).withMessage('traditional_ira_balance is required'),
  body('current_age').notEmpty().isInt({ min: 18, max: 100 }),
  body('annual_income').notEmpty().isFloat({ min: 0 }),
  body('filing_status').notEmpty().isIn(['single','married_filing_jointly','married_filing_separately','head_of_household']),
  body('crypto_unrealized_gains_usd').optional().isFloat(),
  body('conversion_amount_per_year').notEmpty().isFloat({ min: 0 }),
  body('years_to_convert').notEmpty().isInt({ min: 1, max: 30 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  try {
    const {
      traditional_ira_balance,
      current_age,
      annual_income,
      filing_status,
      crypto_unrealized_gains_usd = 0,
      conversion_amount_per_year,
      years_to_convert,
    } = req.body;
    const result = await callOpenRouter(
      `Model a multi-year traditional-IRA-to-Roth conversion strategy for a crypto investor and surface optimal timing.

Profile:
- Current age: ${current_age}
- Annual W-2 / business income: $${annual_income}
- Filing status: ${filing_status}
- Traditional IRA balance: $${traditional_ira_balance}
- Crypto unrealized gains (taxable on realization): $${crypto_unrealized_gains_usd}
- Planned conversion amount per year: $${conversion_amount_per_year}
- Years to spread the conversion: ${years_to_convert}

Return ONLY a JSON object (no markdown, no prose) with this structure:
{
  "yearly_schedule": [
    {
      "year_index": <1..N>,
      "conversion_amount_usd": <number>,
      "marginal_bracket_after_conversion": "<e.g., 24%>",
      "tax_due_on_conversion_usd": <number>,
      "irmaa_or_aca_impact": "<short note or null>"
    }
  ],
  "total_tax_paid_on_conversion_usd": <number>,
  "estimated_lifetime_tax_savings_usd": <number>,
  "pro_rata_rule_impact": "<short explanation>",
  "five_year_rule_warnings": ["<warning1>"],
  "best_year_to_accelerate_due_to_crypto_losses": "<year_index or null>",
  "recommendation": "<accelerate|spread_evenly|delay>",
  "key_assumptions": ["<assumption1>"],
  "caveats": ["<caveat1>"]
}`,
      'You are an expert cryptocurrency tax attorney and CPA. Provide accurate tax guidance following IRS Notice 2014-21, Rev. Rul. 2023-14, and current Form 1099-DA requirements.'
    );
    const parsed = parseAIJson(result.content) || { raw_response: result.content, parse_error: true };
    await AIChat.create({ userId: req.userId, sessionId: `roth-${Date.now()}`, role: 'assistant', message: result.content, feature: 'roth_conversion_simulator', tokens: result.usage?.total_tokens || 0, ai_results: parsed });
    logTaxDecision(req.userId, 'AI_ROTH_CONVERSION_SIMULATOR', { years_to_convert, conversion_amount_per_year });
    res.json({ analysis: parsed, raw: result.content, inputs: { traditional_ira_balance, current_age, annual_income, filing_status, crypto_unrealized_gains_usd, conversion_amount_per_year, years_to_convert }, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Auto-Categorize Transactions ────────────────────────────────────────────
// POST /api/ai/auto-categorize-transactions
router.post('/auto-categorize-transactions', [
  body('transactions').isArray({ min: 1 }).withMessage('transactions must be a non-empty array'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'OPENROUTER_API_KEY is not configured. AI features unavailable.' });
  }
  try {
    const { transactions } = req.body;
    const result = await callOpenRouter(
      `Classify each of these crypto transactions into one of: buy, sell, swap, airdrop, staking_reward, mining_reward, defi_yield, nft_purchase, nft_sale, transfer, gift, fork, other.

Transactions:
${JSON.stringify(transactions, null, 2)}

Return ONLY a JSON object (no markdown, no prose) with this structure:
{
  "classifications": [
    {
      "index": <0-based index>,
      "category": "<category>",
      "tax_treatment": "<short note: ordinary_income | capital_gain_short | capital_gain_long | non_taxable | other>",
      "confidence": "<low|medium|high>",
      "rationale": "<one short sentence>"
    }
  ],
  "summary": {
    "total_transactions": <number>,
    "by_category": { "<category>": <count> },
    "flagged_for_review": <count>
  }
}`,
      SYSTEM_PROMPT
    );
    const parsed = parseAIJson(result.content) || { raw_response: result.content, parse_error: true };
    await AIChat.create({ userId: req.userId, sessionId: `categorize-${Date.now()}`, role: 'assistant', message: result.content, feature: 'auto_categorize_transactions', tokens: result.usage?.total_tokens || 0, ai_results: parsed });
    logTaxDecision(req.userId, 'AI_AUTO_CATEGORIZE_TRANSACTIONS', { count: transactions.length });
    res.json({ analysis: parsed, raw: result.content, inputs: { count: transactions.length }, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Analyze DeFi Tax Implications ───────────────────────────────────────────
// POST /api/ai/analyze-defi-tax-implications
router.post('/analyze-defi-tax-implications', [
  body('protocol').notEmpty().isString().withMessage('protocol is required'),
  body('position_type').notEmpty().isString().withMessage('position_type is required (e.g. lending, lp, staking, yield_farming)'),
  body('asset').notEmpty().isString().withMessage('asset is required'),
  body('amount_usd').notEmpty().isFloat({ min: 0 }).withMessage('amount_usd must be a non-negative number'),
  body('duration_days').optional().isInt({ min: 0 }),
  body('rewards_received_usd').optional().isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'OPENROUTER_API_KEY is not configured. AI features unavailable.' });
  }
  try {
    const { protocol, position_type, asset, amount_usd, duration_days = 0, rewards_received_usd = 0 } = req.body;
    const result = await callOpenRouter(
      `Analyze the US federal tax implications of the following DeFi position and surface reporting requirements.

DeFi Position:
- Protocol: ${protocol}
- Position type: ${position_type}
- Asset: ${asset}
- Amount (USD): $${amount_usd}
- Duration (days): ${duration_days}
- Rewards received (USD): $${rewards_received_usd}

Return ONLY a JSON object (no markdown, no prose) with this structure:
{
  "tax_characterization": "<ordinary_income|capital_gain|loan_interest|other>",
  "taxable_events": [
    { "event": "<short description>", "trigger": "<when it triggers>", "amount_usd_estimate": <number> }
  ],
  "reporting_requirements": ["<form/schedule>"],
  "wash_sale_risk": "<none|low|medium|high>",
  "self_employment_tax_risk": "<none|low|medium|high>",
  "estimated_tax_liability_usd": <number>,
  "recommendations": ["<short recommendation>"],
  "irs_guidance_references": ["<notice/ruling>"]
}`,
      SYSTEM_PROMPT
    );
    const parsed = parseAIJson(result.content) || { raw_response: result.content, parse_error: true };
    await AIChat.create({ userId: req.userId, sessionId: `defi-tax-${Date.now()}`, role: 'assistant', message: result.content, feature: 'analyze_defi_tax_implications', tokens: result.usage?.total_tokens || 0, ai_results: parsed });
    logTaxDecision(req.userId, 'AI_ANALYZE_DEFI_TAX', { protocol, position_type, asset, amount_usd });
    res.json({ analysis: parsed, raw: result.content, inputs: { protocol, position_type, asset, amount_usd, duration_days, rewards_received_usd }, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
