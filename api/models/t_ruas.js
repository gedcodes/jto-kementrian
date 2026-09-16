/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const ruas = sequelize.define('t_ruas', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kode': {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_ruas': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'wim_last_calibrate': {
            type: DataTypes.DATE,
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
        },
    }, {
        tableName: 'jt_ruas'
    });

    sequelizePaginate.paginate(ruas)

    return ruas;
};
