/* jshint indent: 2 */
'use strict';

const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    //return 
    const Users = sequelize.define('Users', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'petugas_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'username': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'email': {
            unique: true,
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nama_lengkap': {
            unique: true,
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kontak_person': {
            unique: true,
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'password': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'mac_address': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'ip_address': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'token': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'refresh_token': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'last_login': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'last_logout': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'is_login': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'role_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'register_date': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'created_at': {
            type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',//DataTypes.DATE,
            allowNull: false,
            //defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            comment: "null"
        },
        'updated_at': {
            type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',//DataTypes.DATE,
            allowNull: false,
            //defaultValue: sequelize.literal('NOW() ON UPDATE NOW()'),
            comment: "null"
        },
        'deleted_at': {
            type: DataTypes.DATE,
            allowNull: true,
            //defaultValue: sequelize.literal('NOW() ON UPDATE NOW()'),
            comment: "null"
        },
        'deleted_by': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'created_by': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'updated_by': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'is_active': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
            comment: "null"
        },
        'is_deleted': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'api_key': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'api_key_expired_at': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'api_key_created_at': {
            type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            allowNull: true,
            comment: "null"
        }
    }, {
        tableName: 'users'
    });

    Users.associate = function (models) {
        // associations can be defined here
        Users.belongsTo(models.t_petugas, {
            foreignKey: 'petugas_id',
            as: 'userpetugas'
        });

        Users.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_id',
            as: 'userlokasi'
        });

        Users.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'userbptd'
        });

        Users.belongsTo(models.roles, {
            foreignKey: 'role_id',
            as: 'userroles'
        });
    };

    sequelizePaginate.paginate(Users)

    return Users;
};
