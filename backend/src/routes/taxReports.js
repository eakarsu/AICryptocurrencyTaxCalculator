const express = require('express');
const { TaxReport, Transaction } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openRouterService');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const reports = await TaxReport.findAll({ where: { userId: req.userId }, order: [['taxYear', 'DESC']] });
    res.json(reports);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const report = await TaxReport.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json(report);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const report = await TaxReport.create({ ...req.body, userId: req.userId });
    res.status(201).json(report);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const report = await TaxReport.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!report) return res.status(404).json({ error: 'Not found' });
    await report.update(req.body);
    res.json(report);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await TaxReport.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!report) return res.status(404).json({ error: 'Not found' });
    await report.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ai/generate', auth, async (req, res) => {
  try {
    const { taxYear, costBasisMethod } = req.body;
    const transactions = await Transaction.findAll({ where: { userId: req.userId, taxYear: taxYear || 2025 } });
    const result = await callOpenRouter(
      `Generate a comprehensive cryptocurrency tax report for tax year ${taxYear || 2025} using ${costBasisMethod || 'FIFO'} cost basis method.\n\nTransactions:\n${JSON.stringify(transactions)}\n\nProvide: 1) Total capital gains/losses 2) Short-term vs long-term breakdown 3) Income from mining/staking 4) Estimated tax liability 5) Form 8949 summary 6) Schedule D summary 7) Tax-saving recommendations`,
      'You are an expert cryptocurrency tax preparer. Generate detailed, accurate tax reports following IRS guidelines for cryptocurrency taxation.'
    );
    res.json({ report: result.content, model: result.model, usage: result.usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
