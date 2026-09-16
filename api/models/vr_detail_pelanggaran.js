/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const vr_detail_pelanggaran = sequelize.define('vr_detail_pelanggaran', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'pelanggaran_id': {
            type: DataTypes.UUID,
            allowNull: false
        },
        'jenis_pelanggaran_id': {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        'kode_pelanggaran': {
            type: DataTypes.STRING,
            allowNull: false
        },
        'kd_pelanggaran': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'deskripsi': {
            type: DataTypes.STRING,
            allowNull: false
        },
        'is_active': {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        'created_at': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'updated_at': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'deleted_at': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'created_by': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'updated_by': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'deleted_by': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    },{
        tableName: 'vr_detail_pelanggaran'
    })

    sequelizePaginate.paginate(vr_detail_pelanggaran)
    return vr_detail_pelanggaran
}