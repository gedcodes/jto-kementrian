/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const vr_pelanggaran = sequelize.define('vr_pelanggaran', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'tgl_pelanggaran': {
            type: DataTypes.DATE,
            allowNull: false
        },
        'kd_pelanggaran': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'no_ref': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'regu_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'shift_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'no_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'no_uji': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'tgl_uji': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'tgl_masa_berlaku': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'nama_pemilik': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'alamat_pemilik': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'toleransi_komoditi': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'toleransi_uppkb': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'berat_timbang': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'jbi_uji': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'kelebihan_berat': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'prosen_lebih': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'jbb_uji': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'jbkb_uji': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'mst_uji': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'jenis_kendaraan_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'jenis_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'sumbu_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'sumbu': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'kategori_kepemilikan_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'asal_kota_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'tujuan_kota_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'asal_kode_kota': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'tujuan_kode_kota': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'is_gandengan': {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        'gandengan_no_uji': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'gandengan_tgl_uji': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'gandengan_masa_berlaku': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'gandengan_jbi_uji': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'gandengan_jbki': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'komoditi_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'pemilik_komoditi': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'alamat_pemilik_komoditi': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'no_surat_jalan': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'device_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'petugas_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        }, 
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        'is_verified': {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        'verified_at': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'verified_by': {
            type: DataTypes.INTEGER,
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
        'keterangan': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'panjang_utama': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'panjang_toleransi': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'panjang_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'panjang_lebih': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'lebar_utama': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'lebar_toleransi': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'lebar_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'lebar_lebih': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'tinggi_utama': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'tinggi_toleransi': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'tinggi_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'tinggi_lebih': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'foh_utama': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'foh_toleransi': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'foh_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'foh_lebih': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'roh_utama': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'roh_toleransi': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'roh_ukur': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'roh_lebih': {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        'qrcode_name': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'qrcode_url': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'is_print': {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        'print_url': {
            type: DataTypes.STRING,
            allowNull: true
        },
        'tgl_capture': {
            type: DataTypes.DATE,
            allowNull: true
        },
        'sync_to_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        'sync_from_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
    },{
        tableName: 'vr_pelanggaran'
    })

    vr_pelanggaran.associate = function (models) {
        vr_pelanggaran.belongsTo(models.t_regu, {
            foreignKey: 'regu_id',
            as: 'pelanggaran_regu'
        });
        vr_pelanggaran.belongsTo(models.t_shift, {
            foreignKey: 'shift_id',
            as: 'pelanggaran_shift'
        });
        vr_pelanggaran.belongsTo(models.t_petugas, {
            foreignKey: 'petugas_id',
            as: 'pelanggaran_petugas'
        });
        vr_pelanggaran.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'pelanggaran_bptd'
        });
        vr_pelanggaran.belongsTo(models.t_lokasi, {
            foreignKey: 'kode_uppkb',
            as: 'pelanggaran_uppkb',
            targetKey:'kode'
        });
        vr_pelanggaran.belongsTo(models.vr_device, {
            foreignKey: 'device_id',
            as: 'pelanggaran_device',
        });
        vr_pelanggaran.hasMany(models.vr_detail_capture, {
            foreignKey: 'pelanggaran_id',
            as:'pelanggaran_capture',
            sourceKey: 'id'
        });
        vr_pelanggaran.hasMany(models.vr_detail_pelanggaran, {
            foreignKey: 'pelanggaran_id',
            as:'pelanggaran_detail',
            sourceKey: 'id'
        });
        vr_pelanggaran.hasMany(models.vr_detail_pasal, {
            foreignKey: 'pelanggaran_id',
            as:'pelanggaran_pasal',
            sourceKey: 'id'
        })
    }
    sequelizePaginate.paginate(vr_pelanggaran)
    return vr_pelanggaran
}