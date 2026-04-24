const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ComplianceCheck = sequelize.define('ComplianceCheck', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  checkType: { type: DataTypes.ENUM('kyc', 'aml', 'tax_filing', 'reporting', 'sanctions', 'travel_rule', 'record_keeping', 'form_8949', 'schedule_d', 'fbar'), allowNull: false, field: 'check_type' },
  status: { type: DataTypes.ENUM('passed', 'failed', 'warning', 'pending', 'expired'), defaultValue: 'pending' },
  jurisdiction: { type: DataTypes.STRING, defaultValue: 'US' },
  description: { type: DataTypes.TEXT },
  details: { type: DataTypes.TEXT },
  deadline: { type: DataTypes.DATE },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  aiRecommendation: { type: DataTypes.TEXT, field: 'ai_recommendation' },
  resolvedAt: { type: DataTypes.DATE, field: 'resolved_at' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'compliance_checks', timestamps: true });

module.exports = ComplianceCheck;
