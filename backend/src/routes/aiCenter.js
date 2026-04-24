const express = require('express');
const { AIChat, Transaction, Portfolio, TaxReport, MiningStaking, DeFiActivity, NFTTransaction, TaxLossHarvest, AuditLog, CrossBorderTax, ComplianceCheck } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openRouterService');
const router = express.Router();

// AI Chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId, feature } = req.body;
    const sid = sessionId || `session_${Date.now()}`;

    await AIChat.create({ userId: req.userId, sessionId: sid, role: 'user', message, feature: feature || 'general' });

    const result = await callOpenRouter(
      message,
      'You are an expert AI cryptocurrency tax advisor. Help users understand crypto taxation, provide guidance on tax strategies, explain regulations, and answer questions about their cryptocurrency tax obligations. Be specific, accurate, and helpful.'
    );

    await AIChat.create({ userId: req.userId, sessionId: sid, role: 'assistant', message: result.content, feature: feature || 'general', tokens: result.usage?.total_tokens || 0 });

    res.json({ response: result.content, sessionId: sid, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Tax Planning
router.post('/tax-planning', auth, async (req, res) => {
  try {
    const [transactions, portfolio, reports] = await Promise.all([
      Transaction.findAll({ where: { userId: req.userId } }),
      Portfolio.findAll({ where: { userId: req.userId } }),
      TaxReport.findAll({ where: { userId: req.userId } })
    ]);
    const result = await callOpenRouter(
      `Create a comprehensive tax planning strategy based on this data:\n\nTransactions: ${JSON.stringify(transactions.slice(0, 10))}\nPortfolio: ${JSON.stringify(portfolio)}\nPrevious Reports: ${JSON.stringify(reports)}\n\nProvide: 1) Year-end tax planning strategies 2) Estimated tax liability 3) Optimization opportunities 4) Timing strategies for trades 5) Retirement account considerations 6) Charitable giving strategies with crypto`,
      'You are an expert cryptocurrency tax planner. Create comprehensive, personalized tax strategies.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Cost Basis Optimizer
router.post('/cost-basis-optimize', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { userId: req.userId } });
    const result = await callOpenRouter(
      `Optimize cost basis methods for these cryptocurrency transactions:\n${JSON.stringify(transactions.slice(0, 15))}\n\nCompare FIFO, LIFO, HIFO, and Specific Identification methods. Provide: 1) Tax impact under each method 2) Best method recommendation 3) Lot selection strategies 4) Documentation requirements 5) Method switching considerations`,
      'You are an expert in cryptocurrency cost basis optimization. Compare different cost basis methods and recommend the most tax-efficient approach.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Wash Sale Analyzer
router.post('/wash-sale-check', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { userId: req.userId }, order: [['date', 'DESC']] });
    const result = await callOpenRouter(
      `Analyze these transactions for potential wash sale violations:\n${JSON.stringify(transactions.slice(0, 15))}\n\nProvide: 1) Identified wash sale scenarios 2) 30-day window analysis 3) Substantially identical asset assessment 4) Impact on loss deductions 5) Current IRS stance on crypto wash sales 6) Strategies to avoid wash sales`,
      'You are an expert in cryptocurrency wash sale rules. Analyze transactions for potential wash sale issues and provide guidance.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Portfolio Risk & Tax Analysis
router.post('/portfolio-tax-risk', auth, async (req, res) => {
  try {
    const [portfolio, harvests] = await Promise.all([
      Portfolio.findAll({ where: { userId: req.userId } }),
      TaxLossHarvest.findAll({ where: { userId: req.userId } })
    ]);
    const result = await callOpenRouter(
      `Analyze portfolio risk with tax implications:\n\nPortfolio: ${JSON.stringify(portfolio)}\nHarvesting Opportunities: ${JSON.stringify(harvests)}\n\nProvide: 1) Concentration risk analysis 2) Tax-adjusted returns 3) After-tax portfolio optimization 4) Rebalancing with tax efficiency 5) Risk-adjusted harvesting priorities`,
      'You are an expert portfolio analyst specializing in tax-efficient cryptocurrency investing.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Regulatory Updates
router.post('/regulatory-updates', auth, async (req, res) => {
  try {
    const result = await callOpenRouter(
      `Provide a comprehensive overview of the latest cryptocurrency tax regulations and updates:\n\n1) Recent IRS guidance on crypto taxation\n2) New reporting requirements (Form 1099-DA, broker reporting)\n3) International regulatory changes\n4) DeFi-specific regulatory developments\n5) NFT tax classification updates\n6) Upcoming regulatory changes to watch\n7) State-level crypto tax regulations`,
      'You are an expert in cryptocurrency tax regulations. Provide the latest regulatory updates and their implications for crypto taxpayers.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Generate Full Summary
router.post('/full-summary', auth, async (req, res) => {
  try {
    const [transactions, portfolio, defi, nft, mining] = await Promise.all([
      Transaction.findAll({ where: { userId: req.userId }, limit: 10 }),
      Portfolio.findAll({ where: { userId: req.userId } }),
      DeFiActivity.findAll({ where: { userId: req.userId }, limit: 10 }),
      NFTTransaction.findAll({ where: { userId: req.userId }, limit: 10 }),
      MiningStaking.findAll({ where: { userId: req.userId }, limit: 10 })
    ]);
    const result = await callOpenRouter(
      `Generate a comprehensive cryptocurrency tax summary dashboard:\n\nTransactions: ${JSON.stringify(transactions)}\nPortfolio: ${JSON.stringify(portfolio)}\nDeFi: ${JSON.stringify(defi)}\nNFTs: ${JSON.stringify(nft)}\nMining/Staking: ${JSON.stringify(mining)}\n\nProvide: 1) Executive summary 2) Total tax liability estimate 3) Key metrics and KPIs 4) Action items 5) Risk areas 6) Optimization opportunities`,
      'You are an expert cryptocurrency tax advisor. Create a comprehensive executive summary of the user\'s crypto tax position.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Chat history
router.get('/chat-history', auth, async (req, res) => {
  try {
    const chats = await AIChat.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']], limit: 50 });
    res.json(chats);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
