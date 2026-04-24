const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CrossBorderTax = sequelize.define('CrossBorderTax', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  country: { type: DataTypes.STRING, allowNull: false },
  taxResidency: { type: DataTypes.STRING, allowNull: false, field: 'tax_residency' },
  cryptocurrency: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
  valueUSD: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'value_usd' },
  localCurrencyValue: { type: DataTypes.DECIMAL(18, 2), field: 'local_currency_value' },
  localCurrency: { type: DataTypes.STRING, field: 'local_currency' },
  taxTreaty: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'tax_treaty' },
  reportingRequired: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'reporting_required' },
  fbarRequired: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'fbar_required' },
  fatcaReporting: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'fatca_reporting' },
  date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'compliant', 'needs_review', 'reported'), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'cross_border_taxes', timestamps: true });

module.exports = CrossBorderTax;
