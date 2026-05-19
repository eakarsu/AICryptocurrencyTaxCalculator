'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      type: {
        type: Sequelize.ENUM('buy','sell','transfer','swap','airdrop','mining','staking','nft_purchase','nft_sale','defi_yield','gift_received','gift_sent','fork','ico','margin_trade'),
        allowNull: false
      },
      cryptocurrency: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.DECIMAL(18, 8), allowNull: false },
      price_per_unit: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      total_value: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      fee: { type: Sequelize.DECIMAL(18, 8), defaultValue: 0 },
      exchange: { type: Sequelize.STRING },
      wallet_address: { type: Sequelize.STRING },
      tx_hash: { type: Sequelize.STRING },
      date: { type: Sequelize.DATE, allowNull: false },
      notes: { type: Sequelize.TEXT },
      category: { type: Sequelize.STRING },
      tax_year: { type: Sequelize.INTEGER },
      // Compliance flags
      wash_sale_flagged: { type: Sequelize.BOOLEAN, defaultValue: false },
      high_gain_flagged: { type: Sequelize.BOOLEAN, defaultValue: false },
      flag_reasons: { type: Sequelize.JSONB, defaultValue: [] },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('transactions', ['user_id']);
    await queryInterface.addIndex('transactions', ['date']);
    await queryInterface.addIndex('transactions', ['cryptocurrency']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('transactions');
  },
};
