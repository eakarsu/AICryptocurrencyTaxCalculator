const winston = require('winston');
const path = require('path');

const logDir = path.resolve(__dirname, '../../../logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'crypto-tax-calculator' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      maxsize: 50 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});

// Tax decision audit logger — always written for compliance
function logTaxDecision(userId, action, details) {
  logger.info('TAX_DECISION', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
}

// Flag event logger
function logComplianceFlag(userId, transactionId, flag, reason) {
  logger.warn('COMPLIANCE_FLAG', {
    userId,
    transactionId,
    flag,
    reason,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { logger, logTaxDecision, logComplianceFlag };
