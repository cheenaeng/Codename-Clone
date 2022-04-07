'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // "categories" table needs to be created first because "items" references "categories".
    await queryInterface.createTable('hosts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      // created_at and updated_at are required
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

     await queryInterface.createTable('rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      room_code: {
        type: Sequelize.STRING,
      },
      host_id: {
        type: Sequelize.INTEGER,
        references:{
          model:'hosts', 
          key: 'id'
        }
      },
       players_number: {
        type: Sequelize.INTEGER
       },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      gamestate: {
        type: Sequelize.JSON,
        },
      room_id:{
        type:Sequelize.INTEGER, 
        references:{
          model: 'rooms', 
          key: 'id'
        }
      },
      current_team: {
        type:Sequelize.STRING
      }, 
      starting_team: {
        type:Sequelize.STRING
      }, 
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.createTable('hosts_games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      game_id: {
        type: Sequelize.INTEGER,
        references:{
          model: 'games', 
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        references:{
          model:'hosts', 
          key: 'id'
        }
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

      await queryInterface.createTable('gameusers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
      },
      is_spy: {
        type: Sequelize.BOOLEAN,
      },
       is_red: {
        type: Sequelize.BOOLEAN
       },
        room_id: {
        type: Sequelize.INTEGER, 
        references:{
          model:'rooms', 
          key:'id'
        }
       },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Items table needs to be dropped first because Items references Categories
    await queryInterface.dropTable('gameusers');
    await queryInterface.dropTable('hosts_games');
    await queryInterface.dropTable('hosts');
    await queryInterface.dropTable('rooms');
    await queryInterface.dropTable('games');

  },
};