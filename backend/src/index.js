const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// ─── Environment Validation ───────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL environment variable is not set. Refusing to start.');
  process.exit(1);
}
if (!process.env.OPENROUTER_API_KEY) {
  console.warn('[WARN] OPENROUTER_API_KEY is not set. AI features will not function correctly.');
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('[FATAL] JWT_SECRET must contain at least 32 characters. Refusing to start.');
  process.exit(1);
}
if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
  console.error('[FATAL] ENCRYPTION_KEY must contain at least 32 characters. Refusing to start.');
  process.exit(1);
}

const sequelize = require('./config/database');
const { logger } = require('./services/logger');
const { apiRateLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const portfolioRoutes = require('./routes/portfolio');
const taxReportRoutes = require('./routes/taxReports');
const miningStakingRoutes = require('./routes/miningStaking');
const defiRoutes = require('./routes/defi');
const nftRoutes = require('./routes/nft');
const taxLossHarvestRoutes = require('./routes/taxLossHarvest');
const auditRoutes = require('./routes/audit');
const crossBorderRoutes = require('./routes/crossBorder');
const complianceRoutes = require('./routes/compliance');
const aiCenterRoutes = require('./routes/aiCenter');
const aiNewRoutes = require('./routes/aiNew');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS — origin from env (comma-separated list); falls back to permissive for dev.
const corsOriginsEnv = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
const corsOrigins = corsOriginsEnv
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : true,
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// Global rate limiter
app.use('/api/', apiRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/tax-reports', taxReportRoutes);
app.use('/api/mining-staking', miningStakingRoutes);
app.use('/api/defi', defiRoutes);
app.use('/api/nft', nftRoutes);
app.use('/api/tax-loss-harvest', taxLossHarvestRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/cross-border', crossBorderRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/governed-tax-runs', require('./routes/governedTaxRuns'));
app.use('/api/ai', aiCenterRoutes);
app.use('/api/ai', aiNewRoutes);






app.use('/api/ai', require('./routes/multijurisdiction'));
app.use('/api/ai', require('./routes/regulatoryScenario'));
app.use('/api/ai', require('./routes/defiAutomation'));
app.use('/api/ai', require('./routes/liabilityForecast'));
app.use('/api/ai', require('./routes/taxOptimization'));

// === Custom Views (4 new features: 2 VIZ + 2 NON-VIZ) ===
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/wash-sale-exposure', require('./routes/washSaleExposure'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack, url: req.url });
  res.status(500).json({ error: 'Internal server error' });
});

async function ensureAiChatsAiResults() {
  // Best-effort: ensure the new ai_results JSONB column on ai_chats exists.
  try {
    await sequelize.query(
      'ALTER TABLE ai_chats ADD COLUMN IF NOT EXISTS ai_results JSONB'
    );
  } catch (e) {
    logger.warn('ensureAiChatsAiResults skipped', { error: e.message });
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected.');
    await sequelize.sync({ alter: false });
    logger.info('Models synced.');
    await ensureAiChatsAiResults();
// Generated gap routers are deliberately quarantined and are not mounted.

    app.listen(PORT, () => {
      logger.info(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start:', { error: error.message });
    process.exit(1);
  }
}

start();
