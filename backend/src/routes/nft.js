const express = require('express');
const { NFTTransaction } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openRouterService');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await NFTTransaction.findAll({ where: { userId: req.userId }, order: [['date', 'DESC']] });
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await NFTTransaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await NFTTransaction.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await NFTTransaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await NFTTransaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ai/analyze', auth, async (req, res) => {
  try {
    const items = await NFTTransaction.findAll({ where: { userId: req.userId } });
    const result = await callOpenRouter(
      `Analyze these NFT transactions for tax purposes:\n${JSON.stringify(items)}\n\nProvide: 1) Capital gains/losses for each NFT sale 2) Cost basis calculations including gas fees 3) Royalty income classification 4) Collectible tax rate considerations 5) NFT-specific tax strategies 6) Creator vs collector tax differences`,
      'You are an expert in NFT taxation. Provide detailed tax analysis for NFT transactions including minting, buying, selling, and royalty income.'
    );
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
