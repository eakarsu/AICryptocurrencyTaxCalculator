const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  cryptocurrency: { type: DataTypes.STRING, allowNull: false },
  symbol: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
  avgBuyPrice: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'avg_buy_price' },
  currentPrice: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'current_price' },
  totalInvested: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_invested' },
  unrealizedGain: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'unrealized_gain' },
  exchange: { type: DataTypes.STRING },
  wallet: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'portfolios', timestamps: true });

module.exports = Portfolio;
