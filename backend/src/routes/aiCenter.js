const express = require('express');
const { body, validationResult } = require('express-validator');
const { AIChat, Transaction, Portfolio, TaxReport, MiningStaking, DeFiActivity, NFTTransaction, TaxLossHarvest } = require('../models');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openRouterService');
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

// Apply AI rate limiter to all AI routes (after auth)
router.use(auth);
router.use(aiRateLimiter);

// ─── AI Chat ────────────────────────────────────────────────────────────────
router.post('/chat', [
  body('message').notEmpty().withMessage('message is required').isString().isLength({ max: 5000 }),
  body('sessionId').optional().isString().isLength({ max: 100 }),
  body('feature').optional().isString().isLength({ max: 50 }),
], async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const { message, sessionId, feature } = req.body;
    const sid = sessionId || `session_${Date.now()}`;

    await AIChat.create({ userId: req.userId, sessionId: sid, role: 'user', message, feature: feature || 'general' });

    const result = await callOpenRouter(message, SYSTEM_PROMPT);

    await AIChat.create({ userId: req.userId, sessionId: sid, role: 'assistant', message: result.content, feature: feature || 'general', tokens: result.usage?.total_tokens || 0 });

    logTaxDecision(req.userId, 'AI_CHAT', { sessionId: sid, model: result.model });
    res.json({ response: result.content, sessionId: sid, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── AI Tax Planning ─────────────────────────────────────────────────────────
router.post('/tax-planning', async (req, res) => {
  try {
    const [transactions, portfolio, reports] = await Promise.all([
      Transaction.findAll({ where: { userId: req.userId }, limit: 10 }),
      Portfolio.findAll({ where: { userId: req.userId } }),
      TaxReport.findAll({ where: { userId: req.userId } }),
    ]);
    const result = await callOpenRouter(
      `Create a comprehensive tax planning strategy based on this data:\n\nTransactions: ${JSON.stringify(transactions.slice(0, 10))}\nPortfolio: ${JSON.stringify(portfolio)}\nPrevious Reports: ${JSON.stringify(reports)}\n\nProvide: 1) Year-end tax planning strategies 2) Estimated tax liability 3) Optimization opportunities 4) Timing strategies for trades 5) Retirement account considerations 6) Charitable giving strategies with crypto`,
      SYSTEM_PROMPT
    );
    logTaxDecision(req.userId, 'AI_TAX_PLANNING', { model: result.model });
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Cost Basis Optimizer ────────────────────────────────────────────────────
router.post('/cost-basis-optimize', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { userId: req.userId }, limit: 15 });
    const result = await callOpenRouter(
      `Optimize cost basis methods for these cryptocurrency transactions:\n${JSON.stringify(transactions)}\n\nCompare FIFO, LIFO, HIFO, and Specific Identification methods. Provide: 1) Tax impact under each method 2) Best method recommendation 3) Lot selection strategies 4) Documentation requirements 5) Method switching considerations`,
      SYSTEM_PROMPT
    );
    logTaxDecision(req.userId, 'AI_COST_BASIS', { model: result.model });
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Wash Sale Analyzer ──────────────────────────────────────────────────────
router.post('/wash-sale-check', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { userId: req.userId }, order: [['date', 'DESC']], limit: 15 });
    const result = await callOpenRouter(
      `Analyze these transactions for potential wash sale violations:\n${JSON.stringify(transactions)}\n\nProvide: 1) Identified wash sale scenarios 2) 30-day window analysis 3) Substantially identical asset assessment 4) Impact on loss deductions 5) Current IRS stance on crypto wash sales 6) Strategies to avoid wash sales`,
      SYSTEM_PROMPT
    );
    logTaxDecision(req.userId, 'AI_WASH_SALE_CHECK', { model: result.model });
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Portfolio Tax Risk ───────────────────────────────────────────────────────
router.post('/portfolio-tax-risk', async (req, res) => {
  try {
    const [portfolio, harvests] = await Promise.all([
      Portfolio.findAll({ where: { userId: req.userId } }),
      TaxLossHarvest.findAll({ where: { userId: req.userId } }),
    ]);
    const result = await callOpenRouter(
      `Analyze portfolio risk with tax implications:\n\nPortfolio: ${JSON.stringify(portfolio)}\nHarvesting Opportunities: ${JSON.stringify(harvests)}\n\nProvide: 1) Concentration risk analysis 2) Tax-adjusted returns 3) After-tax portfolio optimization 4) Rebalancing with tax efficiency 5) Risk-adjusted harvesting priorities`,
      SYSTEM_PROMPT
    );
    logTaxDecision(req.userId, 'AI_PORTFOLIO_RISK', { model: result.model });
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Regulatory Updates ───────────────────────────────────────────────────────
router.post('/regulatory-updates', async (req, res) => {
  try {
    const result = await callOpenRouter(
      `Provide a comprehensive overview of the latest cryptocurrency tax regulations and updates:\n\n1) Recent IRS guidance on crypto taxation\n2) New reporting requirements (Form 1099-DA, broker reporting)\n3) International regulatory changes\n4) DeFi-specific regulatory developments\n5) NFT tax classification updates\n6) Upcoming regulatory changes to watch\n7) State-level crypto tax regulations`,
      SYSTEM_PROMPT
    );
    logTaxDecision(req.userId, 'AI_REGULATORY', { model: result.model });
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Full Summary ─────────────────────────────────────────────────────────────
router.post('/full-summary', async (req, res) => {
  try {
    const [transactions, portfolio, defi, nft, mining] = await Promise.all([
      Transaction.findAll({ where: { userId: req.userId }, limit: 10 }),
      Portfolio.findAll({ where: { userId: req.userId } }),
      DeFiActivity.findAll({ where: { userId: req.userId }, limit: 10 }),
      NFTTransaction.findAll({ where: { userId: req.userId }, limit: 10 }),
      MiningStaking.findAll({ where: { userId: req.userId }, limit: 10 }),
    ]);
    const result = await callOpenRouter(
      `Generate a comprehensive cryptocurrency tax summary dashboard:\n\nTransactions: ${JSON.stringify(transactions)}\nPortfolio: ${JSON.stringify(portfolio)}\nDeFi: ${JSON.stringify(defi)}\nNFTs: ${JSON.stringify(nft)}\nMining/Staking: ${JSON.stringify(mining)}\n\nProvide: 1) Executive summary 2) Total tax liability estimate 3) Key metrics and KPIs 4) Action items 5) Risk areas 6) Optimization opportunities`,
      SYSTEM_PROMPT
    );
    logTaxDecision(req.userId, 'AI_FULL_SUMMARY', { model: result.model });
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Chat History (paginated) ─────────────────────────────────────────────────
router.get('/chat-history', [
  require('express-validator').query('page').optional().isInt({ min: 1 }),
  require('express-validator').query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;
    const { count, rows } = await AIChat.findAndCountAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
