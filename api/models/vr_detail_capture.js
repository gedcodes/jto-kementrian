/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const vr_detail_capture = sequelize.define('vr_detail_capture', {
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
        'jt_vr_data_id': {
            type: DataTypes.UUID,
            allowNull: false
        },
        'img_name': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img2_name': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img3_name': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img4_name': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img_plat_depan_name': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img_plat_belakang_name': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img_url': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img2_url': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img3_url': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img4_url': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img_plat_depan_url': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'img_plat_belakang_name': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'kd_pelanggaran': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'tgl_capture': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'is_plat': {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        'is_active': {
            type: DataTypes.BOOLEAN,
            allowNull: true
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
        tableName: 'vr_detail_capture'
    })

    sequelizePaginate.paginate(vr_detail_capture)
    return vr_detail_capture
}