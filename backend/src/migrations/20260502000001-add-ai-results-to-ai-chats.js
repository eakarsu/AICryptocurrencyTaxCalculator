'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add ai_results JSONB column to ai_chats table.
    const table = await queryInterface.describeTable('ai_chats').catch(() => null);
    if (!table) return;
    if (!table.ai_results) {
      await queryInterface.addColumn('ai_chats', 'ai_results', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('ai_chats').catch(() => null);
    if (table && table.ai_results) {
      await queryInterface.removeColumn('ai_chats', 'ai_results');
    }
  },
};
