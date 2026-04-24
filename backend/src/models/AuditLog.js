const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  action: { type: DataTypes.STRING, allowNull: false },
  entity: { type: DataTypes.STRING, allowNull: false },
  entityId: { type: DataTypes.INTEGER, field: 'entity_id' },
  details: { type: DataTypes.TEXT },
  riskLevel: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'low', field: 'risk_level' },
  flagged: { type: DataTypes.BOOLEAN, defaultValue: false },
  aiAnalysis: { type: DataTypes.TEXT, field: 'ai_analysis' },
  ipAddress: { type: DataTypes.STRING, field: 'ip_address' },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'audit_logs', timestamps: true });

module.exports = AuditLog;
