/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const streaming = sequelize.define('t_streaming', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null"
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null"
        },
        'kode': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'lokasi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'lokasi_kode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kotakab': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'provinsi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'bptd': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'akses_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'layout': {
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
        },
        'is_lhr': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'webrtc_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
    }, {
        tableName: 'jt_streaming'
    });

    sequelizePaginate.paginate(streaming)

    return streaming;
};
