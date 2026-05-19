// Custom Views routes for AICryptocurrencyTaxCalculator
// Provides 4 endpoints powering the 4 added features (2 VIZ + 2 NON-VIZ)
const express = require('express');
const router = express.Router();

// In-memory persistence for the tax-rules editor (CRUD) — non-blocking dependency on DB.
let taxRules = [
  {
    id: 'rule_us_short',
    jurisdiction: 'US',
    holdingPeriod: 'short',
    minDays: 0,
    maxDays: 365,
    rate: 0.37,
    description: 'US short-term capital gains (held <= 1 year) taxed as ordinary income.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_us_long',
    jurisdiction: 'US',
    holdingPeriod: 'long',
    minDays: 366,
    maxDays: 36500,
    rate: 0.20,
    description: 'US long-term capital gains (> 1 year), top bracket.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_uk_cgt',
    jurisdiction: 'UK',
    holdingPeriod: 'any',
    minDays: 0,
    maxDays: 36500,
    rate: 0.20,
    description: 'UK Capital Gains Tax on cryptoassets (higher band).',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_de_long',
    jurisdiction: 'DE',
    holdingPeriod: 'long',
    minDays: 366,
    maxDays: 36500,
    rate: 0.0,
    description: 'Germany — gains tax-free after 1 year private holding.',
    updatedAt: new Date().toISOString(),
  },
];

function nextId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// ─── VIZ 1: Realized gain/loss chart over a tax year ───────────────────────────
// Returns 12 monthly buckets with realized gains, realized losses, and net.
router.get('/realized-gainloss', (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const seedAssets = ['BTC', 'ETH', 'SOL', 'ADA', 'MATIC'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    // Deterministic pseudo-data driven by year so chart is stable per tax year.
    const series = months.map((m, idx) => {
      const seed = (year + idx * 37) % 97;
      const gains = Math.round(2500 + (seed * 173) % 18000);
      const losses = Math.round(-(800 + ((seed * 211) % 7500)));
      const net = gains + losses;
      const topAsset = seedAssets[(seed + idx) % seedAssets.length];
      return { month: m, monthIndex: idx + 1, realizedGains: gains, realizedLosses: losses, net, topAsset };
    });
    const summary = series.reduce((acc, s) => {
      acc.totalGains += s.realizedGains;
      acc.totalLosses += s.realizedLosses;
      acc.net += s.net;
      return acc;
    }, { totalGains: 0, totalLosses: 0, net: 0 });
    res.json({ year, currency: 'USD', series, summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── VIZ 2: Tax bracket heatmap (bracket x asset) ──────────────────────────────
// Returns a 2D matrix of estimated tax owed for combinations of bracket and asset.
router.get('/bracket-heatmap', (req, res) => {
  try {
    const brackets = [
      { name: '10%', rate: 0.10 },
      { name: '12%', rate: 0.12 },
      { name: '22%', rate: 0.22 },
      { name: '24%', rate: 0.24 },
      { name: '32%', rate: 0.32 },
      { name: '35%', rate: 0.35 },
      { name: '37%', rate: 0.37 },
    ];
    const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'MATIC', 'DOT', 'AVAX'];
    // Pseudo-realized gains per asset
    const baseGain = { BTC: 42000, ETH: 28000, SOL: 14500, ADA: 6200, MATIC: 4800, DOT: 5500, AVAX: 7400 };
    const matrix = brackets.map((b) =>
      assets.map((a) => {
        const owed = Math.round(baseGain[a] * b.rate);
        return { bracket: b.name, asset: a, rate: b.rate, gain: baseGain[a], taxOwed: owed };
      })
    );
    res.json({ brackets, assets, matrix });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── NON-VIZ 1: Form 8949 / 1099-style PDF (text rendering) ────────────────────
// Returns a printable form payload (HTML / structured) that the client renders to PDF.
router.get('/form-8949', (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    // Deterministic synthetic rows so the form looks populated.
    const rows = [
      { description: '0.50 BTC', dateAcquired: `02/14/${year - 1}`, dateSold: `06/01/${year}`, proceeds: 31500, cost: 21000, gainLoss: 10500, term: 'long' },
      { description: '4.00 ETH', dateAcquired: `08/03/${year - 1}`, dateSold: `04/22/${year}`, proceeds: 14800, cost: 8200, gainLoss: 6600, term: 'long' },
      { description: '120 SOL', dateAcquired: `01/05/${year}`, dateSold: `07/10/${year}`, proceeds: 18200, cost: 12100, gainLoss: 6100, term: 'short' },
      { description: '5000 ADA', dateAcquired: `11/22/${year - 1}`, dateSold: `03/15/${year}`, proceeds: 2900, cost: 4100, gainLoss: -1200, term: 'short' },
      { description: '0.20 BTC (lost)', dateAcquired: `04/01/${year}`, dateSold: `12/01/${year}`, proceeds: 9200, cost: 12500, gainLoss: -3300, term: 'short' },
    ];
    const totals = rows.reduce(
      (acc, r) => {
        acc.proceeds += r.proceeds;
        acc.cost += r.cost;
        acc.gainLoss += r.gainLoss;
        return acc;
      },
      { proceeds: 0, cost: 0, gainLoss: 0 }
    );
    res.json({
      form: 'Form 8949 + 1099-B Composite',
      taxYear: year,
      filer: { name: 'Demo Taxpayer', tin: 'XXX-XX-1234' },
      rows,
      totals,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── NON-VIZ 2: Tax rules editor — full CRUD ──────────────────────────────────
router.get('/tax-rules', (req, res) => {
  res.json({ data: taxRules, count: taxRules.length });
});

router.post('/tax-rules', (req, res) => {
  try {
    const body = req.body || {};
    const rule = {
      id: nextId('rule'),
      jurisdiction: body.jurisdiction || 'US',
      holdingPeriod: body.holdingPeriod || 'short',
      minDays: Number(body.minDays) || 0,
      maxDays: Number(body.maxDays) || 365,
      rate: Number(body.rate) || 0,
      description: body.description || '',
      updatedAt: new Date().toISOString(),
    };
    taxRules.push(rule);
    res.status(201).json(rule);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/tax-rules/:id', (req, res) => {
  const idx = taxRules.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  taxRules[idx] = { ...taxRules[idx], ...req.body, id: taxRules[idx].id, updatedAt: new Date().toISOString() };
  res.json(taxRules[idx]);
});

router.delete('/tax-rules/:id', (req, res) => {
  const before = taxRules.length;
  taxRules = taxRules.filter((r) => r.id !== req.params.id);
  if (taxRules.length === before) return res.status(404).json({ error: 'Rule not found' });
  res.json({ message: 'Deleted', id: req.params.id });
});

module.exports = router;
