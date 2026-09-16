'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('user_roles', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            roleId: {
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS fkey_constraint_role_user;'
        );

        await queryInterface.addConstraint('user_roles', ['roleId'], {
            type: 'foreign key',
            name: 'fkey_constraint_role_user',
            references: { //Required field
                table: 'roles',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'no action'
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS fkey_constraint_user_role;'
        );

        await queryInterface.addConstraint('user_roles', ['userId'], {
            type: 'foreign key',
            name: 'fkey_constraint_user_role',
            references: { //Required field
                table: 'users',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'no action'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            'ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS fkey_constraint_role_user;'
        );

        await queryInterface.addConstraint('user_roles', ['roleId'], {
            type: 'foreign key',
            name: 'fkey_constraint_role_user',
            references: { //Required field
                table: 'roles',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'no action'
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS fkey_constraint_user_role;'
        );

        await queryInterface.addConstraint('user_roles', ['userId'], {
            type: 'foreign key',
            name: 'fkey_constraint_user_role',
            references: { //Required field
                table: 'users',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'no action'
        });

        await queryInterface.dropTable('user_roles');
    }
};
