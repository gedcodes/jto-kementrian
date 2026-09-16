'use strict';
const moment = require('moment')
const bcrypt = require('bcrypt')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [{
      username: 'marktel',
      kontak_person: '02273356239',
      email: 'marktel.rnd@gmail.com',
      password: bcrypt.hashSync("marktel123456", 10),
      is_active: true,
      created_at: moment().toDate(),
      updated_at: moment().toDate(),
      created_by: 1,
      updated_by: 1
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
