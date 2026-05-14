'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('portfolios', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      cryptocurrency: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.DECIMAL(18, 8), allowNull: false },
      average_cost: { type: Sequelize.DECIMAL(18, 2) },
      current_price: { type: Sequelize.DECIMAL(18, 2) },
      exchange: { type: Sequelize.STRING },
      wallet_address: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('portfolios', ['user_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('portfolios');
  },
};
