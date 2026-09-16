/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');
module.exports = function (sequelize, DataTypes) {
    const etilang = sequelize.define('t_etilang', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'kode_penindakan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'courtTrialDate': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null",
            field: 'courtTrialDate',
        },
        'vehiclePlateNumber': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'vehiclePlateNumber',
        },
        'weighBridgeCode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'weighBridgeCode',
        },
        'areaOfTicket': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'areaOfTicket',
        },
        'province': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'courtCode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'courtCode',
        },
        'attorneyCode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'attorneyCode',
        },
        'confiscatedType': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            field: 'confiscatedType',
        },
        'name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'age': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'gender': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'identityType': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'identityType',
        },
        'identityNumber': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'identityNumber',
        },
        'phoneNumber': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'phoneNumber',
        },
        'noSkep': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'noSkep',
        },
        'vehicleType': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'vehicleType',
        },
        'vehicleColor': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'vehicleColor',
        },
        'vehicleBrand': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            field: 'vehicleBrand',
        },
        'articles': {
            type: DataTypes.STRING,
            comment: "null"
        },
        'resp_ticket_id': {
            type: DataTypes.STRING,
            comment: "null"
        },
        'resp_msg': {
            type: DataTypes.STRING,
            comment: "null"
        },
        'brivaCode': {
            type: DataTypes.STRING,
            comment: "null",
            field: 'brivaCode',
        },
        'bank_id': {
            type: DataTypes.INTEGER,
            comment: "null",
        },
        'nama_bank': {
            type: DataTypes.STRING,
            comment: "null",
        },
        'no_rek': {
            type: DataTypes.STRING,
            comment: "null",
        },
        'atas_nama': {
            type: DataTypes.STRING,
            comment: "null",
        },
        'no_blanko': {
            type: DataTypes.STRING,
            comment: "null",
        },
        'denda_maks': {
            type: DataTypes.DOUBLE,
            comment: "null",
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
        'sync_to_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        tableName: 'jt_etilang'
    });

    sequelizePaginate.paginate(etilang)

    return etilang;
};
