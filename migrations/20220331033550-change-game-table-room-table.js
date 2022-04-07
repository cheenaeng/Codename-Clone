'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // "categories" table needs to be created first because "items" references "categories".
    await queryInterface.removeColumn('games', 'current_team');
    await queryInterface.removeColumn('games', 'starting_team');
    await queryInterface.addColumn('games', 'cards',{
      type:Sequelize.JSON
    });
     await queryInterface.addColumn('rooms', 'team_chosen',{
      type:Sequelize.JSON
    });

  },

  down: async (queryInterface, Sequelize) => {
    // Items table needs to be dropped first because Items references Categories
    await queryInterface.addColumn('games', 'current_team');
    await queryInterface.addColumn('games', 'starting_team');
    await queryInterface.removeColumn('games', 'cards');
    await queryInterface.removeColumn('rooms', 'team_chosen');
  }
}