const express = require('express');
const { Transaction } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openRouterService');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { userId: req.userId }, order: [['date', 'DESC']] });
    res.json(transactions);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    res.json(transaction);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.userId });
    res.status(201).json(transaction);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    await transaction.update(req.body);
    res.json(transaction);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    await transaction.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ai/classify', auth, async (req, res) => {
  try {
    const { transactionData } = req.body;
    const result = await callOpenRouter(
      `Classify this cryptocurrency transaction and determine its tax implications:\n${JSON.stringify(transactionData)}\n\nProvide: 1) Transaction type classification 2) Tax category (capital gains, income, etc.) 3) Short-term vs long-term 4) Estimated tax impact 5) Any special considerations`,
      'You are an expert cryptocurrency tax advisor. Provide clear, actionable tax classifications for crypto transactions.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
