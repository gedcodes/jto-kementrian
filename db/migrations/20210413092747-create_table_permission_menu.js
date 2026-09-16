'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('permission_menu', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            menu_id: {
                type: Sequelize.INTEGER
            },
            permission_id: {
                type: Sequelize.INTEGER
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
                allowNull: true,
                type: Sequelize.INTEGER
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

        await queryInterface.sequelize.query(
            'ALTER TABLE permission_menu DROP CONSTRAINT IF EXISTS fkey_constraint_menu_t_menu;'
        );
        await queryInterface.addConstraint('permission_menu', ['menu_id'], {
            type: 'foreign key',
            name: 'fkey_constraint_menu_t_menu',
            references: { //Required field
                table: 't_menu',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'no action'
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE permission_menu DROP CONSTRAINT IF EXISTS fkey_constraint_permission;'
        );
        await queryInterface.addConstraint('permission_menu', ['permission_id'], {
            type: 'foreign key',
            name: 'fkey_constraint_permission',
            references: { //Required field
                table: 'permission',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'no action'
        });
    },

    down: async (queryInterface, Sequelize) => {

        //await queryInterface.removeConstraint('permission_menu', 'fkey_constraint_menu_t_menu');
        //await queryInterface.removeConstraint('permission_menu', 'fkey_constraint_permission');
        await queryInterface.sequelize.query(
            'ALTER TABLE permission_menu DROP CONSTRAINT IF EXISTS fkey_constraint_menu_t_menu;'
        );
        await queryInterface.addConstraint('permission_menu', ['menu_id'], {
            type: 'foreign key',
            name: 'fkey_constraint_menu_t_menu',
            references: { //Required field
                table: 't_menu',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'no action'
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE permission_menu DROP CONSTRAINT IF EXISTS fkey_constraint_permission;'
        );
        await queryInterface.addConstraint('permission_menu', ['permission_id'], {
            type: 'foreign key',
            name: 'fkey_constraint_permission',
            references: { //Required field
                table: 'permission',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'no action'
        });

        await queryInterface.dropTable('permission_menu');
    }
};
