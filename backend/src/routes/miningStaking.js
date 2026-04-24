const express = require('express');
const { MiningStaking } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openRouterService');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await MiningStaking.findAll({ where: { userId: req.userId }, order: [['date', 'DESC']] });
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await MiningStaking.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await MiningStaking.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await MiningStaking.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await MiningStaking.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ai/analyze', auth, async (req, res) => {
  try {
    const items = await MiningStaking.findAll({ where: { userId: req.userId } });
    const result = await callOpenRouter(
      `Analyze these mining and staking activities for tax purposes:\n${JSON.stringify(items)}\n\nProvide: 1) Total income classification (ordinary income vs capital gains) 2) Fair market value at time of receipt 3) Cost basis for future dispositions 4) Reporting requirements 5) Optimization strategies for reducing tax burden`,
      'You are an expert in cryptocurrency mining and staking taxation. Provide detailed analysis following IRS guidance on crypto mining and staking income.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
