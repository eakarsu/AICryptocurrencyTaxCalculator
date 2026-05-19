const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Transaction } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openRouterService');
const { logTaxDecision, logComplianceFlag } = require('../services/logger');
const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  }
  return null;
}

function handleSequelizeError(res, error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Duplicate entry', fields: error.fields });
  }
  if (error.name === 'SequelizeValidationError') {
    return res.status(422).json({ error: 'Validation error', details: error.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Invalid reference', detail: error.parent?.detail });
  }
  return res.status(500).json({ error: 'Database error', message: error.message });
}

// ─── Compliance Checkers ────────────────────────────────────────────────────

async function checkWashSale(transaction) {
  if (transaction.type !== 'sell') return { flagged: false };

  const thirtyDaysBefore = new Date(transaction.date);
  thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
  const thirtyDaysAfter = new Date(transaction.date);
  thirtyDaysAfter.setDate(thirtyDaysAfter.getDate() + 30);

  const repurchase = await Transaction.findOne({
    where: {
      userId: transaction.userId,
      cryptocurrency: transaction.cryptocurrency,
      type: 'buy',
      date: { [Op.between]: [thirtyDaysBefore, thirtyDaysAfter] },
      id: { [Op.ne]: transaction.id },
    },
  });

  if (repurchase) {
    return {
      flagged: true,
      reason: `Potential wash sale: repurchased ${transaction.cryptocurrency} within 30 days (tx ${repurchase.id} on ${repurchase.date})`,
    };
  }
  return { flagged: false };
}

function checkHighGain(transaction) {
  if (transaction.type !== 'sell') return { flagged: false };
  const costBasis = parseFloat(transaction.fee || 0);
  const proceeds = parseFloat(transaction.totalValue || 0);
  const gain = proceeds - costBasis;
  if (gain > 10000) {
    return { flagged: true, reason: `High-gain transaction: realized gain of $${gain.toFixed(2)} exceeds $10,000 threshold` };
  }
  return { flagged: false };
}

async function runComplianceChecks(savedTransaction) {
  const reasons = [];
  let washSaleFlagged = false;
  let highGainFlagged = false;

  const washSale = await checkWashSale(savedTransaction);
  if (washSale.flagged) {
    washSaleFlagged = true;
    reasons.push(washSale.reason);
    logComplianceFlag(savedTransaction.userId, savedTransaction.id, 'WASH_SALE', washSale.reason);
  }

  const highGain = checkHighGain(savedTransaction);
  if (highGain.flagged) {
    highGainFlagged = true;
    reasons.push(highGain.reason);
    logComplianceFlag(savedTransaction.userId, savedTransaction.id, 'HIGH_GAIN', highGain.reason);
  }

  if (reasons.length > 0) {
    await savedTransaction.update({ washSaleFlagged, highGainFlagged, flagReasons: reasons });
  }

  return { washSaleFlagged, highGainFlagged, flagReasons: reasons };
}

// ─── Validation Rules ───────────────────────────────────────────────────────

const transactionValidation = [
  body('type')
    .notEmpty().withMessage('type is required')
    .isIn(['buy','sell','transfer','swap','airdrop','mining','staking','nft_purchase','nft_sale','defi_yield','gift_received','gift_sent','fork','ico','margin_trade'])
    .withMessage('type must be a valid transaction type'),
  body('cryptocurrency')
    .notEmpty().withMessage('cryptocurrency is required')
    .isString().isLength({ max: 10 }).withMessage('cryptocurrency max 10 chars'),
  body('amount')
    .notEmpty().withMessage('amount is required')
    .isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
  body('pricePerUnit')
    .notEmpty().withMessage('pricePerUnit is required')
    .isFloat({ gt: 0 }).withMessage('pricePerUnit must be a positive number'),
  body('totalValue')
    .notEmpty().withMessage('totalValue is required')
    .isFloat({ gt: 0 }).withMessage('totalValue must be a positive number'),
  body('date')
    .notEmpty().withMessage('date is required')
    .isISO8601().withMessage('date must be ISO8601 format'),
  body('fee').optional().isFloat({ min: 0 }).withMessage('fee must be >= 0'),
  body('exchange').optional().isString().isLength({ max: 100 }),
  body('notes').optional().isString().isLength({ max: 2000 }),
];

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/transactions — paginated
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('sortOrder').optional().isIn(['ASC', 'DESC', 'asc', 'desc']),
], async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const order = (req.query.sortOrder || 'DESC').toUpperCase();
    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      where: { userId: req.userId },
      order: [['date', order]],
      limit,
      offset,
    });

    res.json({
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    handleSequelizeError(res, error);
  }
});

// GET /api/transactions/flagged
router.get('/flagged', auth, async (req, res) => {
  try {
    const flagged = await Transaction.findAll({
      where: {
        userId: req.userId,
        [Op.or]: [{ washSaleFlagged: true }, { highGainFlagged: true }],
      },
      order: [['date', 'DESC']],
    });
    res.json({ data: flagged, total: flagged.length });
  } catch (error) {
    handleSequelizeError(res, error);
  }
});

// GET /api/transactions/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    res.json(transaction);
  } catch (error) {
    handleSequelizeError(res, error);
  }
});

// POST /api/transactions
router.post('/', auth, transactionValidation, async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.userId });
    logTaxDecision(req.userId, 'TRANSACTION_CREATED', { transactionId: transaction.id, type: transaction.type, amount: transaction.amount, cryptocurrency: transaction.cryptocurrency });

    // Async compliance checks (don't block response)
    const flags = await runComplianceChecks(transaction);

    res.status(201).json({ ...transaction.toJSON(), complianceFlags: flags });
  } catch (error) {
    handleSequelizeError(res, error);
  }
});

// PUT /api/transactions/:id
router.put('/:id', auth, [
  body('amount').optional().isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
  body('date').optional().isISO8601().withMessage('date must be ISO8601 format'),
], async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    await transaction.update(req.body);
    logTaxDecision(req.userId, 'TRANSACTION_UPDATED', { transactionId: transaction.id });
    res.json(transaction);
  } catch (error) {
    handleSequelizeError(res, error);
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    await transaction.destroy();
    logTaxDecision(req.userId, 'TRANSACTION_DELETED', { transactionId: req.params.id });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    handleSequelizeError(res, error);
  }
});

// POST /api/transactions/ai/classify
router.post('/ai/classify', auth, [
  body('transactionData').notEmpty().withMessage('transactionData is required'),
], async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const { transactionData } = req.body;
    const result = await callOpenRouter(
      `Classify this cryptocurrency transaction and determine its tax implications:\n${JSON.stringify(transactionData)}\n\nProvide: 1) Transaction type classification 2) Tax category (capital gains, income, etc.) 3) Short-term vs long-term 4) Estimated tax impact 5) Any special considerations`,
      'You are an expert cryptocurrency tax attorney and CPA. Provide accurate tax guidance following IRS Notice 2014-21, Rev. Rul. 2023-14, and current Form 1099-DA requirements.'
    );
    logTaxDecision(req.userId, 'AI_CLASSIFY', { model: result.model });
    res.json({ analysis: result.content, model: result.model, usage: result.usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
