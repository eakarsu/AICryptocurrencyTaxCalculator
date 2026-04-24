const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MiningStaking = sequelize.define('MiningStaking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  type: { type: DataTypes.ENUM('mining', 'staking', 'liquidity_providing', 'yield_farming'), allowNull: false },
  cryptocurrency: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
  valueAtReceipt: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'value_at_receipt' },
  currentValue: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'current_value' },
  platform: { type: DataTypes.STRING },
  pool: { type: DataTypes.STRING },
  apy: { type: DataTypes.DECIMAL(8, 2) },
  date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'completed', 'pending'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'mining_staking', timestamps: true });

module.exports = MiningStaking;
