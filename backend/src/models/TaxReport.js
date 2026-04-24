const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaxReport = sequelize.define('TaxReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  taxYear: { type: DataTypes.INTEGER, allowNull: false, field: 'tax_year' },
  totalGains: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_gains' },
  totalLosses: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_losses' },
  netGainLoss: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'net_gain_loss' },
  shortTermGains: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'short_term_gains' },
  longTermGains: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'long_term_gains' },
  totalIncome: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_income' },
  estimatedTax: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'estimated_tax' },
  costBasisMethod: { type: DataTypes.ENUM('FIFO', 'LIFO', 'HIFO', 'ACB', 'SpecificID'), defaultValue: 'FIFO', field: 'cost_basis_method' },
  status: { type: DataTypes.ENUM('draft', 'generated', 'reviewed', 'filed'), defaultValue: 'draft' },
  country: { type: DataTypes.STRING, defaultValue: 'US' },
  aiSummary: { type: DataTypes.TEXT, field: 'ai_summary' },
  aiRecommendations: { type: DataTypes.TEXT, field: 'ai_recommendations' }
}, { tableName: 'tax_reports', timestamps: true });

module.exports = TaxReport;
