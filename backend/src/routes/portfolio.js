const express = require('express');
const { Portfolio } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openRouterService');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await Portfolio.findAll({ where: { userId: req.userId }, order: [['totalInvested', 'DESC']] });
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Portfolio.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await Portfolio.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Portfolio.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Portfolio.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ai/analyze', auth, async (req, res) => {
  try {
    const holdings = await Portfolio.findAll({ where: { userId: req.userId } });
    const result = await callOpenRouter(
      `Analyze this cryptocurrency portfolio and provide tax-optimized recommendations:\n${JSON.stringify(holdings)}\n\nProvide: 1) Portfolio health assessment 2) Tax efficiency score 3) Rebalancing suggestions for tax optimization 4) Risk assessment 5) Unrealized gains/losses summary`,
      'You are an expert cryptocurrency portfolio analyst and tax advisor. Provide comprehensive portfolio analysis with tax optimization strategies.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
