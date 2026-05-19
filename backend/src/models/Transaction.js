const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  type: { type: DataTypes.ENUM('buy', 'sell', 'transfer', 'swap', 'airdrop', 'mining', 'staking', 'nft_purchase', 'nft_sale', 'defi_yield', 'gift_received', 'gift_sent', 'fork', 'ico', 'margin_trade'), allowNull: false },
  cryptocurrency: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
  pricePerUnit: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'price_per_unit' },
  totalValue: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'total_value' },
  fee: { type: DataTypes.DECIMAL(18, 8), defaultValue: 0 },
  exchange: { type: DataTypes.STRING },
  walletAddress: { type: DataTypes.STRING, field: 'wallet_address' },
  txHash: { type: DataTypes.STRING, field: 'tx_hash' },
  date: { type: DataTypes.DATE, allowNull: false },
  notes: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  taxYear: { type: DataTypes.INTEGER, field: 'tax_year' },
  // Compliance flags
  washSaleFlagged: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'wash_sale_flagged' },
  highGainFlagged: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'high_gain_flagged' },
  flagReasons: { type: DataTypes.JSONB, defaultValue: [], field: 'flag_reasons' },
}, { tableName: 'transactions', timestamps: true });

module.exports = Transaction;
