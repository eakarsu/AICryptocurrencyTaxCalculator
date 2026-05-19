const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AIChat = sequelize.define('AIChat', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  sessionId: { type: DataTypes.STRING, allowNull: false, field: 'session_id' },
  role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  feature: { type: DataTypes.STRING, defaultValue: 'general' },
  tokens: { type: DataTypes.INTEGER, defaultValue: 0 },
  ai_results: { type: DataTypes.JSONB, allowNull: true, field: 'ai_results' }
}, { tableName: 'ai_chats', timestamps: true });

module.exports = AIChat;
