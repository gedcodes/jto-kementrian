/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const t_rfid_log = sequelize.define('t_rfid_log', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'rfid': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'rfid_ip': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'no_kendaraan': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },  
        'is_used': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
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
        tableName: 'jt_rfid_log'
    });

    sequelizePaginate.paginate(t_rfid_log)

    return t_rfid_log;
};
