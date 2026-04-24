const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NFTTransaction = sequelize.define('NFTTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  nftName: { type: DataTypes.STRING, allowNull: false, field: 'nft_name' },
  collection: { type: DataTypes.STRING },
  type: { type: DataTypes.ENUM('purchase', 'sale', 'mint', 'airdrop', 'gift', 'royalty'), allowNull: false },
  cryptocurrency: { type: DataTypes.STRING, defaultValue: 'ETH' },
  amount: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
  valueUSD: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: 'value_usd' },
  gasFee: { type: DataTypes.DECIMAL(18, 8), defaultValue: 0, field: 'gas_fee' },
  marketplace: { type: DataTypes.STRING },
  tokenId: { type: DataTypes.STRING, field: 'token_id' },
  contractAddress: { type: DataTypes.STRING, field: 'contract_address' },
  chain: { type: DataTypes.STRING, defaultValue: 'Ethereum' },
  date: { type: DataTypes.DATE, allowNull: false },
  costBasis: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'cost_basis' },
  gainLoss: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'gain_loss' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'nft_transactions', timestamps: true });

module.exports = NFTTransaction;
