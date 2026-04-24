const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeFiActivity = sequelize.define('DeFiActivity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  protocol: { type: DataTypes.STRING, allowNull: false },
  activityType: { type: DataTypes.ENUM('swap', 'liquidity_add', 'liquidity_remove', 'lending', 'borrowing', 'yield_farming', 'flash_loan', 'bridge', 'wrap', 'unwrap'), allowNull: false, field: 'activity_type' },
  tokenIn: { type: DataTypes.STRING, field: 'token_in' },
  amountIn: { type: DataTypes.DECIMAL(18, 8), field: 'amount_in' },
  tokenOut: { type: DataTypes.STRING, field: 'token_out' },
  amountOut: { type: DataTypes.DECIMAL(18, 8), field: 'amount_out' },
  valueUSD: { type: DataTypes.DECIMAL(18, 2), field: 'value_usd' },
  gasFee: { type: DataTypes.DECIMAL(18, 8), field: 'gas_fee' },
  chain: { type: DataTypes.STRING, defaultValue: 'Ethereum' },
  txHash: { type: DataTypes.STRING, field: 'tx_hash' },
  date: { type: DataTypes.DATE, allowNull: false },
  taxImplication: { type: DataTypes.STRING, field: 'tax_implication' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'defi_activities', timestamps: true });

module.exports = DeFiActivity;
