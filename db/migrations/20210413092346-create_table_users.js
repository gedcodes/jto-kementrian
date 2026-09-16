'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			nama_lengkap: {
				type: Sequelize.STRING
			},
			kontak_person: {
				type: Sequelize.STRING(30)
			},
			email: {
				type: Sequelize.STRING,
                allowNull: false,
                unique: true
			},
			password: {
				type: Sequelize.STRING
			},
			last_login: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn('now')
			},
			register_date: {
				type: Sequelize.DATEONLY,
				allowNull: false,
				defaultValue: Sequelize.fn('now')
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
		  await queryInterface.dropTable('users');
	}
};
