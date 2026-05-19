'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tax_reports', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      tax_year: { type: Sequelize.INTEGER, allowNull: false },
      total_gains: { type: Sequelize.DECIMAL(18, 2) },
      total_losses: { type: Sequelize.DECIMAL(18, 2) },
      net_gain_loss: { type: Sequelize.DECIMAL(18, 2) },
      short_term_gains: { type: Sequelize.DECIMAL(18, 2) },
      long_term_gains: { type: Sequelize.DECIMAL(18, 2) },
      report_data: { type: Sequelize.JSONB },
      status: { type: Sequelize.STRING, defaultValue: 'draft' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    await queryInterface.addIndex('tax_reports', ['user_id', 'tax_year'], { unique: false });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tax_reports');
  },
};
