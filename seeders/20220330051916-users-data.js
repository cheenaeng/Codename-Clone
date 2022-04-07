'use strict';

module.exports = {
  up: async (queryInterface) => {
    const hostList= [
      {
        username: 'spongebob',
        email:'123@gmail.com', 
        password:'password',
        created_at: new Date(),
        updated_at: new Date(),
      }, 
    ];

    // Insert categories before items because items reference categories
    let hosts = await queryInterface.bulkInsert(
      'hosts',
      hostList,
      { returning: true }
    );
  },

  down: async (queryInterface) => {
    // Delete item before category records because items reference categories
    await queryInterface.bulkDelete('hosts', null, {});
  },
};