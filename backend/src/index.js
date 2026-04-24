const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sequelize = require('./config/database');

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

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

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
app.use('/api/ai', aiCenterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync();
    console.log('Models synced.');
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

start();
