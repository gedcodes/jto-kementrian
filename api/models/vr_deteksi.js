/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const vr_deteksi = sequelize.define('vr_deteksi', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'tgl_deteksi': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'jml_deteksi': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null"
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
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
    }, {
        tableName: 'vr_deteksi'
    });

    sequelizePaginate.paginate(vr_deteksi)
    return vr_deteksi
}