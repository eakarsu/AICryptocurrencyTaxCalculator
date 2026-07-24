const { sequelize, User, Transaction, Portfolio, TaxReport, MiningStaking, DeFiActivity, NFTTransaction, TaxLossHarvest, AuditLog, CrossBorderTax, ComplianceCheck } = require('../models');

function requireDemoPassword() {
  const password = process.env.DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD || process.env.DEMO_SEED_PASSWORD || '';
  if (password.length < 12 || password.length > 1024) throw new Error('DEMO_PASSWORD must contain 12-1024 characters');
  return password;
}

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // Create demo user
    const user = await User.create({
      email: 'demo@cryptotax.com',
      password: requireDemoPassword(),
      name: 'Demo User'
    });
    console.log('Demo user created.');

    // Seed Transactions (15+)
    await Transaction.bulkCreate([
      { userId: user.id, type: 'buy', cryptocurrency: 'Bitcoin', amount: 0.5, pricePerUnit: 42000, totalValue: 21000, fee: 0.0001, exchange: 'Coinbase', date: '2025-01-15', category: 'investment', taxYear: 2025, notes: 'Initial BTC purchase' },
      { userId: user.id, type: 'buy', cryptocurrency: 'Ethereum', amount: 5.0, pricePerUnit: 2800, totalValue: 14000, fee: 0.005, exchange: 'Binance', date: '2025-02-01', category: 'investment', taxYear: 2025, notes: 'ETH accumulation' },
      { userId: user.id, type: 'sell', cryptocurrency: 'Bitcoin', amount: 0.1, pricePerUnit: 48000, totalValue: 4800, fee: 0.0001, exchange: 'Coinbase', date: '2025-03-10', category: 'capital_gains', taxYear: 2025, notes: 'Partial BTC profit taking' },
      { userId: user.id, type: 'swap', cryptocurrency: 'Ethereum', amount: 2.0, pricePerUnit: 3200, totalValue: 6400, fee: 0.003, exchange: 'Uniswap', date: '2025-03-15', category: 'swap', taxYear: 2025, notes: 'ETH to USDC swap' },
      { userId: user.id, type: 'buy', cryptocurrency: 'Solana', amount: 50, pricePerUnit: 120, totalValue: 6000, fee: 0.01, exchange: 'Kraken', date: '2025-04-01', category: 'investment', taxYear: 2025, notes: 'SOL position entry' },
      { userId: user.id, type: 'staking', cryptocurrency: 'Ethereum', amount: 0.15, pricePerUnit: 3100, totalValue: 465, fee: 0, exchange: 'Lido', date: '2025-04-15', category: 'income', taxYear: 2025, notes: 'ETH staking rewards Q1' },
      { userId: user.id, type: 'buy', cryptocurrency: 'Cardano', amount: 5000, pricePerUnit: 0.45, totalValue: 2250, fee: 1.5, exchange: 'Binance', date: '2025-05-01', category: 'investment', taxYear: 2025, notes: 'ADA long-term hold' },
      { userId: user.id, type: 'sell', cryptocurrency: 'Solana', amount: 20, pricePerUnit: 95, totalValue: 1900, fee: 0.005, exchange: 'Kraken', date: '2025-05-20', category: 'capital_loss', taxYear: 2025, notes: 'SOL partial exit at loss' },
      { userId: user.id, type: 'airdrop', cryptocurrency: 'Arbitrum', amount: 1000, pricePerUnit: 1.20, totalValue: 1200, fee: 0, exchange: 'Arbitrum', date: '2025-06-01', category: 'income', taxYear: 2025, notes: 'ARB airdrop received' },
      { userId: user.id, type: 'buy', cryptocurrency: 'Polkadot', amount: 200, pricePerUnit: 7.50, totalValue: 1500, fee: 0.5, exchange: 'Coinbase', date: '2025-06-15', category: 'investment', taxYear: 2025, notes: 'DOT diversification' },
      { userId: user.id, type: 'mining', cryptocurrency: 'Bitcoin', amount: 0.002, pricePerUnit: 51000, totalValue: 102, fee: 0, exchange: 'NiceHash', date: '2025-07-01', category: 'income', taxYear: 2025, notes: 'BTC mining rewards July' },
      { userId: user.id, type: 'buy', cryptocurrency: 'Chainlink', amount: 100, pricePerUnit: 15.80, totalValue: 1580, fee: 0.3, exchange: 'Binance', date: '2025-07-10', category: 'investment', taxYear: 2025, notes: 'LINK oracle play' },
      { userId: user.id, type: 'nft_purchase', cryptocurrency: 'Ethereum', amount: 0.5, pricePerUnit: 3300, totalValue: 1650, fee: 0.02, exchange: 'OpenSea', date: '2025-08-01', category: 'nft', taxYear: 2025, notes: 'Bored Ape purchase' },
      { userId: user.id, type: 'sell', cryptocurrency: 'Chainlink', amount: 50, pricePerUnit: 18.50, totalValue: 925, fee: 0.15, exchange: 'Binance', date: '2025-08-15', category: 'capital_gains', taxYear: 2025, notes: 'LINK partial profit' },
      { userId: user.id, type: 'transfer', cryptocurrency: 'Bitcoin', amount: 0.2, pricePerUnit: 52000, totalValue: 10400, fee: 0.00005, exchange: 'Cold Wallet', date: '2025-09-01', category: 'transfer', taxYear: 2025, notes: 'BTC to cold storage' },
      { userId: user.id, type: 'buy', cryptocurrency: 'Avalanche', amount: 80, pricePerUnit: 28.50, totalValue: 2280, fee: 0.1, exchange: 'Kraken', date: '2025-09-10', category: 'investment', taxYear: 2025, notes: 'AVAX ecosystem entry' },
      { userId: user.id, type: 'defi_yield', cryptocurrency: 'USDC', amount: 150, pricePerUnit: 1.00, totalValue: 150, fee: 0, exchange: 'Aave', date: '2025-10-01', category: 'income', taxYear: 2025, notes: 'USDC lending yield' }
    ]);
    console.log('Transactions seeded.');

    // Seed Portfolio (15+)
    await Portfolio.bulkCreate([
      { userId: user.id, cryptocurrency: 'Bitcoin', symbol: 'BTC', amount: 0.4, avgBuyPrice: 42000, currentPrice: 52000, totalInvested: 16800, unrealizedGain: 4000, exchange: 'Coinbase', notes: 'Core BTC holding' },
      { userId: user.id, cryptocurrency: 'Ethereum', symbol: 'ETH', amount: 3.0, avgBuyPrice: 2800, currentPrice: 3400, totalInvested: 8400, unrealizedGain: 1800, exchange: 'Binance', notes: 'ETH staking position' },
      { userId: user.id, cryptocurrency: 'Solana', symbol: 'SOL', amount: 30, avgBuyPrice: 120, currentPrice: 105, totalInvested: 3600, unrealizedGain: -450, exchange: 'Kraken', notes: 'SOL high-growth bet' },
      { userId: user.id, cryptocurrency: 'Cardano', symbol: 'ADA', amount: 5000, avgBuyPrice: 0.45, currentPrice: 0.52, totalInvested: 2250, unrealizedGain: 350, exchange: 'Binance', notes: 'ADA long-term' },
      { userId: user.id, cryptocurrency: 'Polkadot', symbol: 'DOT', amount: 200, avgBuyPrice: 7.50, currentPrice: 8.20, totalInvested: 1500, unrealizedGain: 140, exchange: 'Coinbase', notes: 'DOT parachain play' },
      { userId: user.id, cryptocurrency: 'Chainlink', symbol: 'LINK', amount: 50, avgBuyPrice: 15.80, currentPrice: 18.50, totalInvested: 790, unrealizedGain: 135, exchange: 'Binance', notes: 'LINK oracle investment' },
      { userId: user.id, cryptocurrency: 'Avalanche', symbol: 'AVAX', amount: 80, avgBuyPrice: 28.50, currentPrice: 32.00, totalInvested: 2280, unrealizedGain: 280, exchange: 'Kraken', notes: 'AVAX subnet thesis' },
      { userId: user.id, cryptocurrency: 'Arbitrum', symbol: 'ARB', amount: 1000, avgBuyPrice: 0, currentPrice: 1.35, totalInvested: 0, unrealizedGain: 1350, exchange: 'Arbitrum', notes: 'Free airdrop tokens' },
      { userId: user.id, cryptocurrency: 'Polygon', symbol: 'MATIC', amount: 3000, avgBuyPrice: 0.85, currentPrice: 0.72, totalInvested: 2550, unrealizedGain: -390, exchange: 'Coinbase', notes: 'MATIC L2 position' },
      { userId: user.id, cryptocurrency: 'Uniswap', symbol: 'UNI', amount: 150, avgBuyPrice: 6.20, currentPrice: 7.80, totalInvested: 930, unrealizedGain: 240, exchange: 'Uniswap', notes: 'UNI governance tokens' },
      { userId: user.id, cryptocurrency: 'Aave', symbol: 'AAVE', amount: 10, avgBuyPrice: 92, currentPrice: 108, totalInvested: 920, unrealizedGain: 160, exchange: 'Aave', notes: 'AAVE DeFi core' },
      { userId: user.id, cryptocurrency: 'Cosmos', symbol: 'ATOM', amount: 120, avgBuyPrice: 9.50, currentPrice: 8.80, totalInvested: 1140, unrealizedGain: -84, exchange: 'Kraken', notes: 'ATOM IBC ecosystem' },
      { userId: user.id, cryptocurrency: 'Litecoin', symbol: 'LTC', amount: 15, avgBuyPrice: 72, currentPrice: 85, totalInvested: 1080, unrealizedGain: 195, exchange: 'Coinbase', notes: 'LTC silver to BTC gold' },
      { userId: user.id, cryptocurrency: 'Fantom', symbol: 'FTM', amount: 5000, avgBuyPrice: 0.38, currentPrice: 0.42, totalInvested: 1900, unrealizedGain: 200, exchange: 'Binance', notes: 'FTM DeFi chain' },
      { userId: user.id, cryptocurrency: 'USDC', symbol: 'USDC', amount: 5000, avgBuyPrice: 1.00, currentPrice: 1.00, totalInvested: 5000, unrealizedGain: 0, exchange: 'Aave', notes: 'Stablecoin lending' }
    ]);
    console.log('Portfolio seeded.');

    // Seed Tax Reports (15+)
    await TaxReport.bulkCreate([
      { userId: user.id, taxYear: 2025, totalGains: 4800, totalLosses: 1900, netGainLoss: 2900, shortTermGains: 2100, longTermGains: 800, totalIncome: 1917, estimatedTax: 1200, costBasisMethod: 'FIFO', status: 'draft', country: 'US', aiSummary: 'Moderate gains year with mining income' },
      { userId: user.id, taxYear: 2024, totalGains: 8500, totalLosses: 3200, netGainLoss: 5300, shortTermGains: 3800, longTermGains: 1500, totalIncome: 2400, estimatedTax: 2100, costBasisMethod: 'FIFO', status: 'filed', country: 'US', aiSummary: 'Strong gains year, filed on time' },
      { userId: user.id, taxYear: 2023, totalGains: 2100, totalLosses: 6500, netGainLoss: -4400, shortTermGains: 800, longTermGains: 1300, totalIncome: 1200, estimatedTax: 0, costBasisMethod: 'FIFO', status: 'filed', country: 'US', aiSummary: 'Bear market losses, carryforward available' },
      { userId: user.id, taxYear: 2025, totalGains: 1200, totalLosses: 400, netGainLoss: 800, shortTermGains: 600, longTermGains: 200, totalIncome: 465, estimatedTax: 380, costBasisMethod: 'HIFO', status: 'draft', country: 'US', aiSummary: 'HIFO method comparison Q1' },
      { userId: user.id, taxYear: 2025, totalGains: 3500, totalLosses: 1200, netGainLoss: 2300, shortTermGains: 1800, longTermGains: 500, totalIncome: 900, estimatedTax: 960, costBasisMethod: 'LIFO', status: 'draft', country: 'US', aiSummary: 'LIFO method comparison Q1-Q2' },
      { userId: user.id, taxYear: 2022, totalGains: 15000, totalLosses: 22000, netGainLoss: -7000, shortTermGains: 5000, longTermGains: 10000, totalIncome: 3500, estimatedTax: 0, costBasisMethod: 'FIFO', status: 'filed', country: 'US', aiSummary: 'Major losses during crypto winter' },
      { userId: user.id, taxYear: 2021, totalGains: 45000, totalLosses: 5000, netGainLoss: 40000, shortTermGains: 30000, longTermGains: 10000, totalIncome: 8000, estimatedTax: 15200, costBasisMethod: 'FIFO', status: 'filed', country: 'US', aiSummary: 'Bull market peak, significant gains' },
      { userId: user.id, taxYear: 2025, totalGains: 2800, totalLosses: 900, netGainLoss: 1900, shortTermGains: 1400, longTermGains: 500, totalIncome: 717, estimatedTax: 785, costBasisMethod: 'SpecificID', status: 'draft', country: 'US', aiSummary: 'Specific ID optimization test' },
      { userId: user.id, taxYear: 2024, totalGains: 6200, totalLosses: 2800, netGainLoss: 3400, shortTermGains: 2200, longTermGains: 1200, totalIncome: 1800, estimatedTax: 1560, costBasisMethod: 'HIFO', status: 'reviewed', country: 'US', aiSummary: 'HIFO reduced tax by $340 vs FIFO' },
      { userId: user.id, taxYear: 2025, totalGains: 500, totalLosses: 200, netGainLoss: 300, shortTermGains: 300, longTermGains: 0, totalIncome: 150, estimatedTax: 135, costBasisMethod: 'FIFO', status: 'draft', country: 'UK', aiSummary: 'UK tax calculation - CGT allowance' },
      { userId: user.id, taxYear: 2025, totalGains: 1800, totalLosses: 600, netGainLoss: 1200, shortTermGains: 900, longTermGains: 300, totalIncome: 400, estimatedTax: 480, costBasisMethod: 'ACB', status: 'draft', country: 'CA', aiSummary: 'Canadian ACB method calculation' },
      { userId: user.id, taxYear: 2024, totalGains: 3100, totalLosses: 1500, netGainLoss: 1600, shortTermGains: 1100, longTermGains: 500, totalIncome: 900, estimatedTax: 720, costBasisMethod: 'FIFO', status: 'filed', country: 'DE', aiSummary: 'German 1-year holding exemption applied' },
      { userId: user.id, taxYear: 2023, totalGains: 800, totalLosses: 4200, netGainLoss: -3400, shortTermGains: 500, longTermGains: 300, totalIncome: 600, estimatedTax: 0, costBasisMethod: 'FIFO', status: 'filed', country: 'AU', aiSummary: 'Australian CGT discount on long-term' },
      { userId: user.id, taxYear: 2025, totalGains: 950, totalLosses: 350, netGainLoss: 600, shortTermGains: 450, longTermGains: 150, totalIncome: 250, estimatedTax: 225, costBasisMethod: 'FIFO', status: 'draft', country: 'JP', aiSummary: 'Japan miscellaneous income classification' },
      { userId: user.id, taxYear: 2020, totalGains: 12000, totalLosses: 2000, netGainLoss: 10000, shortTermGains: 7000, longTermGains: 3000, totalIncome: 4000, estimatedTax: 4200, costBasisMethod: 'FIFO', status: 'filed', country: 'US', aiSummary: 'DeFi summer gains' }
    ]);
    console.log('Tax reports seeded.');

    // Seed Mining/Staking (15+)
    await MiningStaking.bulkCreate([
      { userId: user.id, type: 'staking', cryptocurrency: 'Ethereum', amount: 0.15, valueAtReceipt: 465, currentValue: 510, platform: 'Lido', pool: 'ETH 2.0', apy: 4.2, date: '2025-01-15', status: 'active', notes: 'ETH staking via Lido' },
      { userId: user.id, type: 'mining', cryptocurrency: 'Bitcoin', amount: 0.002, valueAtReceipt: 102, currentValue: 104, platform: 'NiceHash', apy: 0, date: '2025-02-01', status: 'completed', notes: 'GPU mining BTC' },
      { userId: user.id, type: 'staking', cryptocurrency: 'Cardano', amount: 45, valueAtReceipt: 20.25, currentValue: 23.40, platform: 'Daedalus', pool: 'BLOOM', apy: 5.1, date: '2025-02-15', status: 'active', notes: 'ADA staking rewards' },
      { userId: user.id, type: 'staking', cryptocurrency: 'Polkadot', amount: 8, valueAtReceipt: 60, currentValue: 65.60, platform: 'Fearless Wallet', pool: 'Validator1', apy: 14.5, date: '2025-03-01', status: 'active', notes: 'DOT nominated staking' },
      { userId: user.id, type: 'yield_farming', cryptocurrency: 'USDC', amount: 150, valueAtReceipt: 150, currentValue: 150, platform: 'Aave', pool: 'USDC Pool', apy: 3.8, date: '2025-03-15', status: 'active', notes: 'Stablecoin yield farming' },
      { userId: user.id, type: 'staking', cryptocurrency: 'Cosmos', amount: 12, valueAtReceipt: 114, currentValue: 105.60, platform: 'Keplr', pool: 'Cosmos Hub', apy: 18.2, date: '2025-04-01', status: 'active', notes: 'ATOM staking for airdrops' },
      { userId: user.id, type: 'liquidity_providing', cryptocurrency: 'ETH-USDC', amount: 0.5, valueAtReceipt: 1650, currentValue: 1720, platform: 'Uniswap V3', pool: 'ETH/USDC 0.3%', apy: 25.4, date: '2025-04-15', status: 'active', notes: 'Concentrated liquidity position' },
      { userId: user.id, type: 'mining', cryptocurrency: 'Ethereum Classic', amount: 1.5, valueAtReceipt: 37.50, currentValue: 39, platform: 'Ethermine', apy: 0, date: '2025-05-01', status: 'completed', notes: 'ETC GPU mining' },
      { userId: user.id, type: 'staking', cryptocurrency: 'Solana', amount: 2.5, valueAtReceipt: 300, currentValue: 262.50, platform: 'Marinade', pool: 'mSOL', apy: 6.8, date: '2025-05-15', status: 'active', notes: 'SOL liquid staking' },
      { userId: user.id, type: 'yield_farming', cryptocurrency: 'DAI', amount: 200, valueAtReceipt: 200, currentValue: 200, platform: 'Compound', pool: 'DAI Market', apy: 2.9, date: '2025-06-01', status: 'active', notes: 'Compound DAI lending' },
      { userId: user.id, type: 'staking', cryptocurrency: 'Avalanche', amount: 5, valueAtReceipt: 142.50, currentValue: 160, platform: 'Benqi', pool: 'sAVAX', apy: 7.2, date: '2025-06-15', status: 'active', notes: 'AVAX liquid staking' },
      { userId: user.id, type: 'mining', cryptocurrency: 'Litecoin', amount: 0.08, valueAtReceipt: 5.76, currentValue: 6.80, platform: 'LitecoinPool', apy: 0, date: '2025-07-01', status: 'completed', notes: 'Scrypt mining LTC' },
      { userId: user.id, type: 'liquidity_providing', cryptocurrency: 'BTC-ETH', amount: 0.01, valueAtReceipt: 520, currentValue: 545, platform: 'Curve', pool: 'tricrypto', apy: 12.3, date: '2025-07-15', status: 'active', notes: 'Curve tricrypto pool' },
      { userId: user.id, type: 'staking', cryptocurrency: 'Fantom', amount: 500, valueAtReceipt: 190, currentValue: 210, platform: 'SpookySwap', pool: 'FTM Validator', apy: 11.5, date: '2025-08-01', status: 'active', notes: 'FTM staking rewards' },
      { userId: user.id, type: 'yield_farming', cryptocurrency: 'WBTC-ETH', amount: 0.005, valueAtReceipt: 420, currentValue: 445, platform: 'SushiSwap', pool: 'WBTC/ETH Farm', apy: 8.7, date: '2025-08-15', status: 'active', notes: 'SushiSwap LP farming' }
    ]);
    console.log('Mining/Staking seeded.');

    // Seed DeFi Activities (15+)
    await DeFiActivity.bulkCreate([
      { userId: user.id, protocol: 'Uniswap V3', activityType: 'swap', tokenIn: 'ETH', amountIn: 2.0, tokenOut: 'USDC', amountOut: 6400, valueUSD: 6400, gasFee: 0.005, chain: 'Ethereum', date: '2025-01-20', taxImplication: 'Taxable disposal', notes: 'ETH to stablecoin swap' },
      { userId: user.id, protocol: 'Aave', activityType: 'lending', tokenIn: 'USDC', amountIn: 5000, tokenOut: 'aUSDC', amountOut: 5000, valueUSD: 5000, gasFee: 0.003, chain: 'Ethereum', date: '2025-02-05', taxImplication: 'Interest income taxable', notes: 'USDC deposit for lending' },
      { userId: user.id, protocol: 'Curve', activityType: 'liquidity_add', tokenIn: 'DAI-USDC-USDT', amountIn: 3000, tokenOut: '3CRV', amountOut: 2980, valueUSD: 3000, gasFee: 0.008, chain: 'Ethereum', date: '2025-02-20', taxImplication: 'LP token receipt - may be taxable', notes: 'Curve 3pool deposit' },
      { userId: user.id, protocol: 'Compound', activityType: 'borrowing', tokenIn: 'ETH', amountIn: 1.0, tokenOut: 'USDC', amountOut: 2500, valueUSD: 2500, gasFee: 0.004, chain: 'Ethereum', date: '2025-03-05', taxImplication: 'Borrowing generally not taxable', notes: 'Borrow USDC against ETH' },
      { userId: user.id, protocol: 'PancakeSwap', activityType: 'yield_farming', tokenIn: 'CAKE-BNB', amountIn: 100, tokenOut: 'CAKE', amountOut: 15, valueUSD: 45, gasFee: 0.001, chain: 'BSC', date: '2025-03-20', taxImplication: 'Farm rewards taxable as income', notes: 'CAKE farming rewards' },
      { userId: user.id, protocol: 'Lido', activityType: 'wrap', tokenIn: 'ETH', amountIn: 3.0, tokenOut: 'stETH', amountOut: 2.98, valueUSD: 9300, gasFee: 0.006, chain: 'Ethereum', date: '2025-04-05', taxImplication: 'Wrapping may be taxable', notes: 'ETH to stETH conversion' },
      { userId: user.id, protocol: 'Arbitrum Bridge', activityType: 'bridge', tokenIn: 'ETH', amountIn: 1.0, tokenOut: 'ETH', amountOut: 1.0, valueUSD: 3200, gasFee: 0.01, chain: 'Ethereum', date: '2025-04-20', taxImplication: 'Bridge generally not taxable', notes: 'Bridge ETH to Arbitrum' },
      { userId: user.id, protocol: 'dYdX', activityType: 'flash_loan', tokenIn: 'USDC', amountIn: 50000, tokenOut: 'USDC', amountOut: 50050, valueUSD: 50, gasFee: 0.002, chain: 'Ethereum', date: '2025-05-05', taxImplication: 'Profit taxable', notes: 'Flash loan arbitrage' },
      { userId: user.id, protocol: 'Uniswap V3', activityType: 'liquidity_remove', tokenIn: '3CRV', amountIn: 1000, tokenOut: 'USDC', amountOut: 1010, valueUSD: 1010, gasFee: 0.004, chain: 'Ethereum', date: '2025-05-20', taxImplication: 'Disposal of LP tokens taxable', notes: 'Partial LP withdrawal' },
      { userId: user.id, protocol: 'GMX', activityType: 'swap', tokenIn: 'USDC', amountIn: 2000, tokenOut: 'ETH', amountOut: 0.625, valueUSD: 2000, gasFee: 0.0005, chain: 'Arbitrum', date: '2025-06-05', taxImplication: 'Acquisition not taxable', notes: 'Buy ETH via GMX' },
      { userId: user.id, protocol: 'Aave', activityType: 'lending', tokenIn: 'WBTC', amountIn: 0.1, tokenOut: 'aWBTC', amountOut: 0.1, valueUSD: 5200, gasFee: 0.005, chain: 'Ethereum', date: '2025-06-20', taxImplication: 'Interest income taxable', notes: 'WBTC deposit on Aave' },
      { userId: user.id, protocol: 'Yearn', activityType: 'yield_farming', tokenIn: 'DAI', amountIn: 2000, tokenOut: 'yDAI', amountOut: 1950, valueUSD: 2000, gasFee: 0.007, chain: 'Ethereum', date: '2025-07-05', taxImplication: 'Vault deposit may be taxable', notes: 'Yearn DAI vault' },
      { userId: user.id, protocol: 'Convex', activityType: 'yield_farming', tokenIn: 'CRV', amountIn: 500, tokenOut: 'cvxCRV', amountOut: 500, valueUSD: 350, gasFee: 0.003, chain: 'Ethereum', date: '2025-07-20', taxImplication: 'Token conversion taxable', notes: 'CRV to cvxCRV' },
      { userId: user.id, protocol: 'WETH Contract', activityType: 'unwrap', tokenIn: 'WETH', amountIn: 0.5, tokenOut: 'ETH', amountOut: 0.5, valueUSD: 1650, gasFee: 0.001, chain: 'Ethereum', date: '2025-08-05', taxImplication: 'Unwrapping generally not taxable', notes: 'WETH to ETH' },
      { userId: user.id, protocol: 'Hop Protocol', activityType: 'bridge', tokenIn: 'USDC', amountIn: 3000, tokenOut: 'USDC', amountOut: 2995, valueUSD: 3000, gasFee: 0.002, chain: 'Optimism', date: '2025-08-20', taxImplication: 'Bridge fee deductible', notes: 'Bridge USDC to Optimism' },
      { userId: user.id, protocol: 'Balancer', activityType: 'liquidity_add', tokenIn: 'ETH-BAL-USDC', amountIn: 1500, tokenOut: 'BPT', amountOut: 1480, valueUSD: 1500, gasFee: 0.006, chain: 'Ethereum', date: '2025-09-01', taxImplication: 'LP provision may be taxable', notes: 'Balancer weighted pool' }
    ]);
    console.log('DeFi activities seeded.');

    // Seed NFT Transactions (15+)
    await NFTTransaction.bulkCreate([
      { userId: user.id, nftName: 'Bored Ape #7842', collection: 'BAYC', type: 'purchase', cryptocurrency: 'ETH', amount: 12.5, valueUSD: 41250, gasFee: 0.02, marketplace: 'OpenSea', tokenId: '7842', chain: 'Ethereum', date: '2025-01-10', costBasis: 41250, notes: 'Blue chip NFT purchase' },
      { userId: user.id, nftName: 'CryptoPunk #3100', collection: 'CryptoPunks', type: 'sale', cryptocurrency: 'ETH', amount: 45, valueUSD: 148500, gasFee: 0.015, marketplace: 'Larva Labs', tokenId: '3100', chain: 'Ethereum', date: '2025-02-14', costBasis: 85000, gainLoss: 63500, notes: 'Rare alien punk sold' },
      { userId: user.id, nftName: 'Doodle #4521', collection: 'Doodles', type: 'purchase', cryptocurrency: 'ETH', amount: 3.2, valueUSD: 10560, gasFee: 0.01, marketplace: 'OpenSea', tokenId: '4521', chain: 'Ethereum', date: '2025-03-01', costBasis: 10560, notes: 'Doodles collection add' },
      { userId: user.id, nftName: 'Art Blocks #789', collection: 'Fidenza', type: 'sale', cryptocurrency: 'ETH', amount: 8.5, valueUSD: 28050, gasFee: 0.018, marketplace: 'Art Blocks', tokenId: '789', chain: 'Ethereum', date: '2025-03-20', costBasis: 15000, gainLoss: 13050, notes: 'Generative art flip' },
      { userId: user.id, nftName: 'Moonbird #2341', collection: 'Moonbirds', type: 'mint', cryptocurrency: 'ETH', amount: 2.5, valueUSD: 8250, gasFee: 0.025, marketplace: 'Proof', tokenId: '2341', chain: 'Ethereum', date: '2025-04-05', costBasis: 8250, notes: 'Moonbird minted' },
      { userId: user.id, nftName: 'Azuki #5123', collection: 'Azuki', type: 'purchase', cryptocurrency: 'ETH', amount: 5.8, valueUSD: 19140, gasFee: 0.012, marketplace: 'Blur', tokenId: '5123', chain: 'Ethereum', date: '2025-04-25', costBasis: 19140, notes: 'Azuki anime NFT' },
      { userId: user.id, nftName: 'CloneX #8821', collection: 'CloneX', type: 'sale', cryptocurrency: 'ETH', amount: 4.2, valueUSD: 13860, gasFee: 0.008, marketplace: 'OpenSea', tokenId: '8821', chain: 'Ethereum', date: '2025-05-10', costBasis: 9000, gainLoss: 4860, notes: 'Nike metaverse NFT sold' },
      { userId: user.id, nftName: 'Pudgy Penguin #1234', collection: 'Pudgy Penguins', type: 'airdrop', cryptocurrency: 'ETH', amount: 0, valueUSD: 5200, gasFee: 0, marketplace: 'Airdrop', tokenId: '1234', chain: 'Ethereum', date: '2025-05-25', costBasis: 5200, notes: 'Free airdrop - taxable income' },
      { userId: user.id, nftName: 'DeGods #4567', collection: 'DeGods', type: 'purchase', cryptocurrency: 'SOL', amount: 25, valueUSD: 3000, gasFee: 0.005, marketplace: 'Magic Eden', tokenId: '4567', chain: 'Solana', date: '2025-06-10', costBasis: 3000, notes: 'Solana NFT purchase' },
      { userId: user.id, nftName: 'Otherdeed #9876', collection: 'Otherside', type: 'sale', cryptocurrency: 'ETH', amount: 1.8, valueUSD: 5940, gasFee: 0.01, marketplace: 'OpenSea', tokenId: '9876', chain: 'Ethereum', date: '2025-06-28', costBasis: 8500, gainLoss: -2560, notes: 'Sold at loss' },
      { userId: user.id, nftName: 'Milady #3333', collection: 'Milady', type: 'purchase', cryptocurrency: 'ETH', amount: 2.1, valueUSD: 6930, gasFee: 0.006, marketplace: 'Blur', tokenId: '3333', chain: 'Ethereum', date: '2025-07-15', costBasis: 6930, notes: 'Milady maker NFT' },
      { userId: user.id, nftName: 'Loot Bag #256', collection: 'Loot', type: 'gift', cryptocurrency: 'ETH', amount: 0, valueUSD: 1200, gasFee: 0, marketplace: 'Gift', tokenId: '256', chain: 'Ethereum', date: '2025-07-30', costBasis: 1200, notes: 'NFT received as gift' },
      { userId: user.id, nftName: 'Nouns #458', collection: 'Nouns', type: 'purchase', cryptocurrency: 'ETH', amount: 28, valueUSD: 92400, gasFee: 0.02, marketplace: 'Nouns Auction', tokenId: '458', chain: 'Ethereum', date: '2025-08-12', costBasis: 92400, notes: 'Nouns DAO governance NFT' },
      { userId: user.id, nftName: 'Cool Cat #7788', collection: 'Cool Cats', type: 'royalty', cryptocurrency: 'ETH', amount: 0.5, valueUSD: 1650, gasFee: 0, marketplace: 'OpenSea', tokenId: '7788', chain: 'Ethereum', date: '2025-08-25', costBasis: 0, gainLoss: 1650, notes: 'Creator royalty income' },
      { userId: user.id, nftName: 'Invisible Friends #999', collection: 'Invisible Friends', type: 'mint', cryptocurrency: 'ETH', amount: 0.25, valueUSD: 825, gasFee: 0.015, marketplace: 'Random', tokenId: '999', chain: 'Ethereum', date: '2025-09-05', costBasis: 825, notes: 'Free mint + gas only' }
    ]);
    console.log('NFT transactions seeded.');

    // Seed Tax Loss Harvest (15+)
    await TaxLossHarvest.bulkCreate([
      { userId: user.id, cryptocurrency: 'Solana', symbol: 'SOL', purchasePrice: 120, currentPrice: 95, amount: 30, unrealizedLoss: -750, potentialTaxSaving: 225, holdingPeriod: 120, replacementAsset: 'AVAX', washSaleRisk: false, status: 'opportunity', notes: 'SOL down 20% from entry' },
      { userId: user.id, cryptocurrency: 'Polygon', symbol: 'MATIC', purchasePrice: 0.85, currentPrice: 0.72, amount: 3000, unrealizedLoss: -390, potentialTaxSaving: 117, holdingPeriod: 180, replacementAsset: 'ARB', washSaleRisk: false, status: 'opportunity', notes: 'MATIC underperforming' },
      { userId: user.id, cryptocurrency: 'Cosmos', symbol: 'ATOM', purchasePrice: 9.50, currentPrice: 8.80, amount: 120, unrealizedLoss: -84, potentialTaxSaving: 25, holdingPeriod: 150, replacementAsset: 'DOT', washSaleRisk: false, status: 'watch', notes: 'Small loss, watching' },
      { userId: user.id, cryptocurrency: 'Filecoin', symbol: 'FIL', purchasePrice: 8.20, currentPrice: 5.40, amount: 100, unrealizedLoss: -280, potentialTaxSaving: 84, holdingPeriod: 200, replacementAsset: 'AR', washSaleRisk: false, status: 'opportunity', notes: 'Storage sector weakness' },
      { userId: user.id, cryptocurrency: 'Internet Computer', symbol: 'ICP', purchasePrice: 12.50, currentPrice: 8.90, amount: 50, unrealizedLoss: -180, potentialTaxSaving: 54, holdingPeriod: 250, replacementAsset: 'NEAR', washSaleRisk: false, status: 'opportunity', notes: 'ICP significant decline' },
      { userId: user.id, cryptocurrency: 'Algorand', symbol: 'ALGO', purchasePrice: 0.22, currentPrice: 0.15, amount: 5000, unrealizedLoss: -350, potentialTaxSaving: 105, holdingPeriod: 300, replacementAsset: 'HBAR', washSaleRisk: false, status: 'opportunity', notes: 'ALGO long-term loss' },
      { userId: user.id, cryptocurrency: 'Sandbox', symbol: 'SAND', purchasePrice: 0.65, currentPrice: 0.38, amount: 2000, unrealizedLoss: -540, potentialTaxSaving: 162, holdingPeriod: 280, replacementAsset: 'MANA', washSaleRisk: true, status: 'opportunity', notes: 'Metaverse tokens down' },
      { userId: user.id, cryptocurrency: 'Axie Infinity', symbol: 'AXS', purchasePrice: 9.80, currentPrice: 6.50, amount: 80, unrealizedLoss: -264, potentialTaxSaving: 79, holdingPeriod: 320, replacementAsset: 'IMX', washSaleRisk: false, status: 'opportunity', notes: 'Gaming token decline' },
      { userId: user.id, cryptocurrency: 'Decentraland', symbol: 'MANA', purchasePrice: 0.55, currentPrice: 0.32, amount: 3000, unrealizedLoss: -690, potentialTaxSaving: 207, holdingPeriod: 350, replacementAsset: 'SAND', washSaleRisk: true, status: 'opportunity', notes: 'MANA-SAND wash sale risk!' },
      { userId: user.id, cryptocurrency: 'Enjin', symbol: 'ENJ', purchasePrice: 0.42, currentPrice: 0.28, amount: 4000, unrealizedLoss: -560, potentialTaxSaving: 168, holdingPeriod: 400, replacementAsset: 'GALA', washSaleRisk: false, status: 'harvested', harvestDate: '2025-06-15', notes: 'Already harvested' },
      { userId: user.id, cryptocurrency: 'VeChain', symbol: 'VET', purchasePrice: 0.035, currentPrice: 0.022, amount: 50000, unrealizedLoss: -650, potentialTaxSaving: 195, holdingPeriod: 450, replacementAsset: 'IOTA', washSaleRisk: false, status: 'opportunity', notes: 'Supply chain token loss' },
      { userId: user.id, cryptocurrency: 'Theta', symbol: 'THETA', purchasePrice: 1.80, currentPrice: 1.15, amount: 500, unrealizedLoss: -325, potentialTaxSaving: 98, holdingPeriod: 500, replacementAsset: 'LPT', washSaleRisk: false, status: 'opportunity', notes: 'Video streaming token' },
      { userId: user.id, cryptocurrency: 'Zilliqa', symbol: 'ZIL', purchasePrice: 0.032, currentPrice: 0.018, amount: 30000, unrealizedLoss: -420, potentialTaxSaving: 126, holdingPeriod: 380, replacementAsset: 'ONE', washSaleRisk: false, status: 'expired', notes: 'Too small to harvest' },
      { userId: user.id, cryptocurrency: 'Harmony', symbol: 'ONE', purchasePrice: 0.025, currentPrice: 0.012, amount: 40000, unrealizedLoss: -520, potentialTaxSaving: 156, holdingPeriod: 420, replacementAsset: 'NEAR', washSaleRisk: false, status: 'opportunity', notes: 'ONE bridge hack impact' },
      { userId: user.id, cryptocurrency: 'Flow', symbol: 'FLOW', purchasePrice: 1.20, currentPrice: 0.72, amount: 800, unrealizedLoss: -384, potentialTaxSaving: 115, holdingPeriod: 360, replacementAsset: 'MINA', washSaleRisk: false, status: 'opportunity', notes: 'NBA Top Shot chain' }
    ]);
    console.log('Tax Loss Harvest seeded.');

    // Seed Audit Logs (15+)
    await AuditLog.bulkCreate([
      { userId: user.id, action: 'Large Transfer', entity: 'Transaction', entityId: 15, details: 'BTC transfer of 0.2 BTC ($10,400) to cold wallet', riskLevel: 'medium', flagged: false, date: '2025-09-01', notes: 'Self-transfer, properly documented' },
      { userId: user.id, action: 'High Value Sale', entity: 'NFTTransaction', entityId: 2, details: 'CryptoPunk sold for 45 ETH ($148,500)', riskLevel: 'high', flagged: true, date: '2025-02-14', notes: 'Large capital gain, needs Form 8949' },
      { userId: user.id, action: 'Multiple Exchanges', entity: 'Portfolio', entityId: 0, details: 'Activity across 5+ exchanges detected', riskLevel: 'medium', flagged: false, date: '2025-03-01', notes: 'Ensure all exchanges reported' },
      { userId: user.id, action: 'Airdrop Received', entity: 'Transaction', entityId: 9, details: 'ARB airdrop of 1000 tokens ($1,200)', riskLevel: 'low', flagged: false, date: '2025-06-01', notes: 'Income at fair market value' },
      { userId: user.id, action: 'DeFi Flash Loan', entity: 'DeFiActivity', entityId: 8, details: 'Flash loan of $50,000 USDC with $50 profit', riskLevel: 'high', flagged: true, date: '2025-05-05', notes: 'Complex transaction, audit red flag' },
      { userId: user.id, action: 'Cross-Chain Bridge', entity: 'DeFiActivity', entityId: 7, details: 'ETH bridged from Ethereum to Arbitrum', riskLevel: 'low', flagged: false, date: '2025-04-20', notes: 'Non-taxable transfer' },
      { userId: user.id, action: 'NFT Airdrop', entity: 'NFTTransaction', entityId: 8, details: 'Pudgy Penguin airdrop valued at $5,200', riskLevel: 'medium', flagged: false, date: '2025-05-25', notes: 'Taxable income event' },
      { userId: user.id, action: 'Staking Rewards', entity: 'MiningStaking', entityId: 1, details: 'ETH staking rewards accumulated', riskLevel: 'low', flagged: false, date: '2025-01-15', notes: 'Regular staking income' },
      { userId: user.id, action: 'Wash Sale Warning', entity: 'TaxLossHarvest', entityId: 7, details: 'SAND sold and MANA purchased within 30 days', riskLevel: 'high', flagged: true, date: '2025-07-01', notes: 'Potential wash sale violation' },
      { userId: user.id, action: 'Missing Cost Basis', entity: 'Transaction', entityId: 3, details: 'ETH swap on Uniswap missing complete cost basis', riskLevel: 'medium', flagged: true, date: '2025-03-15', notes: 'Need to reconstruct basis' },
      { userId: user.id, action: 'Foreign Exchange', entity: 'CrossBorderTax', entityId: 1, details: 'Crypto held on foreign exchange, FBAR may apply', riskLevel: 'high', flagged: true, date: '2025-04-01', notes: 'Check $10K threshold' },
      { userId: user.id, action: 'Mining Income', entity: 'MiningStaking', entityId: 2, details: 'BTC mining income of $102', riskLevel: 'low', flagged: false, date: '2025-02-01', notes: 'Small mining income, self-employment tax' },
      { userId: user.id, action: 'Gift NFT', entity: 'NFTTransaction', entityId: 12, details: 'Loot Bag NFT received as gift ($1,200)', riskLevel: 'medium', flagged: false, date: '2025-07-30', notes: 'Gift tax rules apply' },
      { userId: user.id, action: 'High Frequency Trading', entity: 'Transaction', entityId: 0, details: '50+ transactions in Q1 2025', riskLevel: 'medium', flagged: false, date: '2025-04-01', notes: 'May trigger trader status' },
      { userId: user.id, action: 'Year-End Review', entity: 'TaxReport', entityId: 1, details: 'Annual tax position review needed', riskLevel: 'low', flagged: false, date: '2025-12-01', notes: 'Schedule year-end planning' }
    ]);
    console.log('Audit logs seeded.');

    // Seed Cross-Border Taxes (15+)
    await CrossBorderTax.bulkCreate([
      { userId: user.id, country: 'United States', taxResidency: 'US', cryptocurrency: 'Bitcoin', amount: 0.4, valueUSD: 20800, localCurrencyValue: 20800, localCurrency: 'USD', taxTreaty: false, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-01-15', status: 'compliant', notes: 'Domestic BTC holding' },
      { userId: user.id, country: 'United Kingdom', taxResidency: 'US', cryptocurrency: 'Ethereum', amount: 1.0, valueUSD: 3400, localCurrencyValue: 2720, localCurrency: 'GBP', taxTreaty: true, reportingRequired: true, fbarRequired: true, fatcaReporting: true, date: '2025-02-01', status: 'needs_review', notes: 'ETH on UK exchange (Bitstamp UK)' },
      { userId: user.id, country: 'Germany', taxResidency: 'US', cryptocurrency: 'Bitcoin', amount: 0.1, valueUSD: 5200, localCurrencyValue: 4784, localCurrency: 'EUR', taxTreaty: true, reportingRequired: true, fbarRequired: true, fatcaReporting: true, date: '2025-03-01', status: 'pending', notes: 'BTC on German exchange' },
      { userId: user.id, country: 'Japan', taxResidency: 'US', cryptocurrency: 'Cardano', amount: 2000, valueUSD: 1040, localCurrencyValue: 156000, localCurrency: 'JPY', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-04-01', status: 'compliant', notes: 'ADA on Japanese exchange' },
      { userId: user.id, country: 'Singapore', taxResidency: 'US', cryptocurrency: 'Solana', amount: 20, valueUSD: 2100, localCurrencyValue: 2835, localCurrency: 'SGD', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-04-15', status: 'compliant', notes: 'SOL on Singapore exchange' },
      { userId: user.id, country: 'Canada', taxResidency: 'US', cryptocurrency: 'Ethereum', amount: 0.5, valueUSD: 1700, localCurrencyValue: 2295, localCurrency: 'CAD', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-05-01', status: 'compliant', notes: 'ETH on Canadian exchange' },
      { userId: user.id, country: 'Australia', taxResidency: 'US', cryptocurrency: 'Bitcoin', amount: 0.05, valueUSD: 2600, localCurrencyValue: 3900, localCurrency: 'AUD', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-05-15', status: 'pending', notes: 'Small BTC position in AU' },
      { userId: user.id, country: 'Switzerland', taxResidency: 'US', cryptocurrency: 'Polkadot', amount: 100, valueUSD: 820, localCurrencyValue: 738, localCurrency: 'CHF', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: true, date: '2025-06-01', status: 'needs_review', notes: 'DOT on Swiss exchange, FATCA' },
      { userId: user.id, country: 'UAE', taxResidency: 'US', cryptocurrency: 'Bitcoin', amount: 0.3, valueUSD: 15600, localCurrencyValue: 57252, localCurrency: 'AED', taxTreaty: false, reportingRequired: true, fbarRequired: true, fatcaReporting: true, date: '2025-06-15', status: 'needs_review', notes: 'No tax treaty, full reporting needed' },
      { userId: user.id, country: 'South Korea', taxResidency: 'US', cryptocurrency: 'Chainlink', amount: 50, valueUSD: 925, localCurrencyValue: 1202500, localCurrency: 'KRW', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-07-01', status: 'compliant', notes: 'LINK on Korean exchange' },
      { userId: user.id, country: 'Netherlands', taxResidency: 'US', cryptocurrency: 'Avalanche', amount: 40, valueUSD: 1280, localCurrencyValue: 1178, localCurrency: 'EUR', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-07-15', status: 'compliant', notes: 'AVAX on Dutch platform' },
      { userId: user.id, country: 'Brazil', taxResidency: 'US', cryptocurrency: 'Bitcoin', amount: 0.08, valueUSD: 4160, localCurrencyValue: 20800, localCurrency: 'BRL', taxTreaty: false, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-08-01', status: 'pending', notes: 'BTC on Brazilian exchange' },
      { userId: user.id, country: 'India', taxResidency: 'US', cryptocurrency: 'Polygon', amount: 1500, valueUSD: 1080, localCurrencyValue: 89640, localCurrency: 'INR', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-08-15', status: 'compliant', notes: 'MATIC on WazirX' },
      { userId: user.id, country: 'Hong Kong', taxResidency: 'US', cryptocurrency: 'Ethereum', amount: 0.8, valueUSD: 2720, localCurrencyValue: 21216, localCurrency: 'HKD', taxTreaty: false, reportingRequired: true, fbarRequired: false, fatcaReporting: true, date: '2025-09-01', status: 'needs_review', notes: 'ETH on HK exchange' },
      { userId: user.id, country: 'France', taxResidency: 'US', cryptocurrency: 'Uniswap', amount: 75, valueUSD: 585, localCurrencyValue: 538, localCurrency: 'EUR', taxTreaty: true, reportingRequired: true, fbarRequired: false, fatcaReporting: false, date: '2025-09-15', status: 'compliant', notes: 'UNI on French platform' }
    ]);
    console.log('Cross-border taxes seeded.');

    // Seed Compliance Checks (15+)
    await ComplianceCheck.bulkCreate([
      { userId: user.id, checkType: 'form_8949', status: 'pending', jurisdiction: 'US', description: 'Form 8949 - Sales and Dispositions of Capital Assets', details: 'Report all crypto sales, swaps, and dispositions', deadline: '2026-04-15', priority: 'critical', notes: 'Required for all crypto dispositions' },
      { userId: user.id, checkType: 'schedule_d', status: 'pending', jurisdiction: 'US', description: 'Schedule D - Capital Gains and Losses', details: 'Summary of all capital gains and losses from Form 8949', deadline: '2026-04-15', priority: 'critical', notes: 'Summarizes crypto capital gains' },
      { userId: user.id, checkType: 'fbar', status: 'warning', jurisdiction: 'US', description: 'FBAR - Foreign Bank Account Report (FinCEN 114)', details: 'Report foreign financial accounts exceeding $10,000', deadline: '2026-04-15', priority: 'high', notes: 'Required if foreign exchange balances exceed $10K' },
      { userId: user.id, checkType: 'tax_filing', status: 'pending', jurisdiction: 'US', description: 'Annual Tax Return Filing (Form 1040)', details: 'Include crypto income and gains in annual return', deadline: '2026-04-15', priority: 'critical', notes: 'Must answer crypto question on 1040' },
      { userId: user.id, checkType: 'reporting', status: 'passed', jurisdiction: 'US', description: '1099-MISC Reporting for Mining Income', details: 'Mining income exceeding $600 requires 1099 reporting', deadline: '2026-01-31', priority: 'medium', notes: 'Mining income below threshold' },
      { userId: user.id, checkType: 'record_keeping', status: 'warning', jurisdiction: 'US', description: 'Transaction Record Keeping', details: 'Maintain records of all crypto transactions for 7 years', priority: 'high', notes: 'Some DeFi transactions missing complete records' },
      { userId: user.id, checkType: 'kyc', status: 'passed', jurisdiction: 'US', description: 'KYC Verification on Exchanges', details: 'Ensure KYC is completed on all centralized exchanges', priority: 'medium', notes: 'All exchange KYC verified' },
      { userId: user.id, checkType: 'aml', status: 'passed', jurisdiction: 'US', description: 'Anti-Money Laundering Compliance', details: 'No suspicious transaction patterns detected', priority: 'medium', notes: 'Clean AML record' },
      { userId: user.id, checkType: 'sanctions', status: 'passed', jurisdiction: 'US', description: 'OFAC Sanctions Screening', details: 'No transactions with sanctioned addresses', priority: 'high', notes: 'All wallets clean' },
      { userId: user.id, checkType: 'travel_rule', status: 'pending', jurisdiction: 'US', description: 'Travel Rule Compliance ($3,000+ transfers)', details: 'Large transfers require sender/receiver information', priority: 'medium', notes: 'Check cold wallet transfers' },
      { userId: user.id, checkType: 'reporting', status: 'pending', jurisdiction: 'US', description: 'Form 1099-DA (New Crypto Broker Reporting)', details: 'New broker reporting requirements starting 2025', deadline: '2026-02-15', priority: 'high', notes: 'New requirement - verify exchange compliance' },
      { userId: user.id, checkType: 'tax_filing', status: 'passed', jurisdiction: 'US', description: 'Estimated Quarterly Tax Payments', details: 'Q1-Q3 estimated payments for crypto gains', deadline: '2025-09-15', priority: 'high', notes: 'Payments current through Q3' },
      { userId: user.id, checkType: 'record_keeping', status: 'failed', jurisdiction: 'US', description: 'DeFi Protocol Interaction Records', details: 'Complete records of all DeFi protocol interactions needed', priority: 'high', notes: 'Missing records for some Curve/Yearn interactions' },
      { userId: user.id, checkType: 'reporting', status: 'pending', jurisdiction: 'US', description: 'NFT Royalty Income Reporting', details: 'Creator royalties must be reported as ordinary income', deadline: '2026-04-15', priority: 'medium', notes: 'Cool Cat royalty income to report' },
      { userId: user.id, checkType: 'tax_filing', status: 'pending', jurisdiction: 'US', description: 'State Tax Filing (California)', details: 'California requires crypto gains reporting', deadline: '2026-04-15', priority: 'high', notes: 'CA conforms to federal crypto treatment' }
    ]);
    console.log('Compliance checks seeded.');

    console.log('\nAll seed data created successfully!');
    console.log('Demo login users provisioned from the local environment.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
