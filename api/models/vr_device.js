/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const vrdevice = sequelize.define('vr_device', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
        },
        'kode': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null"
        },
        'is_active': {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            comment: "null"
        },
        'created_at': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'updated_at': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'deleted_at': {
            type: DataTypes.DATE,
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
        'deleted_by': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
    }, {
        tableName: 'vr_device'
    });

    sequelizePaginate.paginate(vrdevice)
    return vrdevice
}