const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaxLossHarvest = sequelize.define('TaxLossHarvest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  cryptocurrency: { type: DataTypes.STRING, allowNull: false },
  symbol: { type: DataTypes.STRING, allowNull: false },
  purchasePrice: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'purchase_price' },
  currentPrice: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'current_price' },
  amount: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
  unrealizedLoss: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'unrealized_loss' },
  potentialTaxSaving: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'potential_tax_saving' },
  holdingPeriod: { type: DataTypes.INTEGER, field: 'holding_period' },
  replacementAsset: { type: DataTypes.STRING, field: 'replacement_asset' },
  washSaleRisk: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'wash_sale_risk' },
  status: { type: DataTypes.ENUM('opportunity', 'harvested', 'expired', 'watch'), defaultValue: 'opportunity' },
  harvestDate: { type: DataTypes.DATE, field: 'harvest_date' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'tax_loss_harvests', timestamps: true });

module.exports = TaxLossHarvest;
