const express = require('express');
const { DeFiActivity } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openRouterService');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await DeFiActivity.findAll({ where: { userId: req.userId }, order: [['date', 'DESC']] });
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await DeFiActivity.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await DeFiActivity.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await DeFiActivity.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await DeFiActivity.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ai/analyze', auth, async (req, res) => {
  try {
    const items = await DeFiActivity.findAll({ where: { userId: req.userId } });
    const result = await callOpenRouter(
      `Analyze these DeFi activities for tax implications:\n${JSON.stringify(items)}\n\nProvide: 1) Tax classification for each activity type 2) Taxable events identification 3) Impermanent loss analysis 4) Gas fee deductions 5) Complex DeFi tax scenarios (wrapping, bridging, flash loans) 6) Recommended reporting approach`,
      'You are an expert in DeFi taxation. Analyze complex DeFi transactions and provide clear tax guidance following current IRS positions on DeFi activities.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
