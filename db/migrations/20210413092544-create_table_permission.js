'use strict';

module.exports = {
  up: async(queryInterface, Sequelize) => {
		await queryInterface.createTable('permission', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.STRING
			},
			alias: {
				type: Sequelize.STRING
			},      
			created_at: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE
			},
			created_by: {
				type: Sequelize.INTEGER,
				allowNull: true   
			},
			updated_by: {
				type: Sequelize.INTEGER,
				allowNull: true 
			},
			is_active: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true
			}
		});
  },

  down: async(queryInterface, Sequelize) => {
    await queryInterface.dropTable('permission');
  }
};
