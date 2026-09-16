/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const config_sinkronisasi = sequelize.define('t_config_sinkronisasi', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kode': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'domain_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'ip_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'port': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },                                 
        'created_at': {
            type: DataTypes.DATE,
            allowNull: true,
            //defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            comment: "null"
        },
        'updated_at': {
            type: DataTypes.DATE,
            allowNull: true,
            //defaultValue: sequelize.literal('NOW() ON UPDATE NOW()'),
            comment: "null"
        },  
        'deleted_at': {
            type: DataTypes.DATE,
            allowNull: true,
            //defaultValue: sequelize.literal('NOW() ON UPDATE NOW()'),
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
        'deleted_by': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        }
    }, {
        tableName: 'jt_config_sinkronisasi'
    });

    sequelizePaginate.paginate(config_sinkronisasi)

    return config_sinkronisasi;
};
