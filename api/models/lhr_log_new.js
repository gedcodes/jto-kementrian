/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const lhrlognew = sequelize.define('lhr_log_new', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null",
            unique: true,
        },
        'date_time': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'ip_address': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null",
            unique: true,
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'sensor_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'kode_sensor': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        },
        'desk_sensor': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        },
        'desk_lane': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        },
        'measure_line': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'lane': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_0': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_1': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_2': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_3': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_4': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_5': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_6': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_7': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'class_8': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'headway': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'gap': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'speed_85th': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'speed_avg': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'occupancy': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'date_time_device': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'created_at': {
            type: DataTypes.DATE, //'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',//
            allowNull: true,
            //defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            comment: "null"
        },
        'updated_at': {
            type: DataTypes.DATE, //'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',//
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
        'deleted_by': {
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
        'sync_to_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        freezeTableName: true,
        tableName: 'lhr_log_new'
    });


    sequelizePaginate.paginate(lhrlognew)



    return lhrlognew;
};
