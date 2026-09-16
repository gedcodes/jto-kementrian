'use strict';
const moment = require('moment');
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('roles', [
      {
        nama: 'Admin',
        is_active: true,
        created_at: moment().toDate(),
        updated_at: moment().toDate(),
        created_by: 1,
        updated_by: 1
      },{
        nama: 'Operator',
        is_active: true,
        created_at: moment().toDate(),
        updated_at: moment().toDate(),
        created_by: 1,
        updated_by: 1        
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', null, {});
  }
};
