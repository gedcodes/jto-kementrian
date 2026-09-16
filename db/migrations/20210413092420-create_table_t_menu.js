'use strict';

module.exports = {
  up: async(queryInterface, Sequelize) => {
		await queryInterface.createTable('t_menu', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			parent_id: {
				type: Sequelize.INTEGER
			},
			no_urut: {
				type: Sequelize.INTEGER
			},
			title: {
				type: Sequelize.STRING
			},
			alias: {
				type: Sequelize.STRING
			},      
			path: {
				type: Sequelize.STRING,
			},
			icon: {
				type: Sequelize.STRING,
			},
			group: {
				type: Sequelize.BOOLEAN,
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

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('t_menu');
  }
};
