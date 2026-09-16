/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const vr_lhr_pelanggaran = sequelize.define('vr_lhr_pelanggaran', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'tgl_capture': {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "null"
        },
        'no_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img2_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img3_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img4_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_plat_depan_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_plat_belakang_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img2_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img3_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img4_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_plat_depan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_plat_belakang_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'device_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'is_verifikasi': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'berat_timbang': {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "null"
        },
        'panjang_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "null"
        },
        'lebar_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "null"
        },
        'tinggi_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "null"
        },
        'foh_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "null"
        },
        'roh_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "null"
        },
        'is_plat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'kd_referensi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'id_referensi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'id_gol_ai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'is_active': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
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
        'is_blue': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'masa_berlaku_blue': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'vcode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'rfid': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'last_id': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
    },{
        tableName: 'jt_vr_data'
    })

    vr_lhr_pelanggaran.associate = function (models) {
        vr_lhr_pelanggaran.belongsTo(models.vr_device, {
            foreignKey: 'device_id',
            as: 'device'
        });
        vr_lhr_pelanggaran.belongsTo(models.t_gol_ai, {
            foreignKey: 'id_gol_ai',
            as: 'gol_ai'
        });
        vr_lhr_pelanggaran.belongsTo(models.t_lokasi, {
            foreignKey: 'kode_uppkb',
            as: 'lhr_pelanggaran_uppkb',
            targetKey: 'kode'
        });
    }
    sequelizePaginate.paginate(vr_lhr_pelanggaran)
    return vr_lhr_pelanggaran
}