const sequelize = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');
const Portfolio = require('./Portfolio');
const TaxReport = require('./TaxReport');
const MiningStaking = require('./MiningStaking');
const DeFiActivity = require('./DeFiActivity');
const NFTTransaction = require('./NFTTransaction');
const TaxLossHarvest = require('./TaxLossHarvest');
const AuditLog = require('./AuditLog');
const CrossBorderTax = require('./CrossBorderTax');
const ComplianceCheck = require('./ComplianceCheck');
const AIChat = require('./AIChat');

// Associations
User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Portfolio, { foreignKey: 'user_id' });
Portfolio.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(TaxReport, { foreignKey: 'user_id' });
TaxReport.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(MiningStaking, { foreignKey: 'user_id' });
MiningStaking.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(DeFiActivity, { foreignKey: 'user_id' });
DeFiActivity.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(NFTTransaction, { foreignKey: 'user_id' });
NFTTransaction.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(TaxLossHarvest, { foreignKey: 'user_id' });
TaxLossHarvest.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CrossBorderTax, { foreignKey: 'user_id' });
CrossBorderTax.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ComplianceCheck, { foreignKey: 'user_id' });
ComplianceCheck.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AIChat, { foreignKey: 'user_id' });
AIChat.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Transaction,
  Portfolio,
  TaxReport,
  MiningStaking,
  DeFiActivity,
  NFTTransaction,
  TaxLossHarvest,
  AuditLog,
  CrossBorderTax,
  ComplianceCheck,
  AIChat
};
