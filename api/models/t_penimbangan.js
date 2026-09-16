/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const penimbangan = sequelize.define('t_penimbangan', {
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
        'kode_trx': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null",
            unique: true,
        },
        'regu_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_regu',
                key: 'id'
            }
        },
        'shift_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'petugas_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'timbangan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'tgl_penimbangan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'tgl_antrian': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'no_kendaraan': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'no_uji': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'tgl_uji': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'tgl_masa_berlaku': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'nama_pemilik': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'alamat_pemilik': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jenis_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'sumbu': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'sumbu_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'asal_kota_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'tujuan_kota_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'asal_kode_kota': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'tujuan_kode_kota': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'is_surat_tilang': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'no_ba_tilang': {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "null"
        },
        'toleransi_komoditi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'toleransi_uppkb': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kategori_kepemilikan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'berat_timbang': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'jbi_uji': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'jbb_uji': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'jbkb_uji': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'mst_uji': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'kelebihan_berat': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'prosen_lebih': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'use_toleransi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'is_gandengan': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'is_transaksi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'device_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'komoditi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kategori_komoditi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'nama_pengemudi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'alamat_pengemudi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jenis_kendaraan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'gol_sim_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'no_sim': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'pemilik_komoditi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'alamat_pemilik_komoditi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_surat_jalan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'is_melanggar': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'is_tindakan': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'is_transfer': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'status_transfer': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'gandengan_no_uji': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'gandengan_tgl_uji': {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "null"
        },
        'gandengan_masa_berlaku': {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "null"
        },
        'gandengan_jbi_uji': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'gandengan_jbki': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'panjang_utama': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'panjang_toleransi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'panjang_ukur': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'panjang_lebih': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'lebar_utama': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'lebar_toleransi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'lebar_ukur': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'lebar_lebih': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'tinggi_utama': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'tinggi_toleransi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'tinggi_ukur': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'tinggi_lebih': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'foh_utama': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'foh_toleransi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'foh_ukur': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'foh_lebih': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'roh_utama': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'roh_toleransi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'roh_ukur': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'roh_lebih': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'wim_berat': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'wim_panjang': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'wim_lebar': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'wim_tinggi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'wim_foh': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'wim_roh': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'wim_kec': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null",
            defaultValue: 0
        },
        'foto_depan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_depan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_belakang': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_belakang_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_kiri': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_kiri_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_kanan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_kanan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'plate_no_img_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'plate_no_img_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'plate_no_confidance': {
            type: DataTypes.STRING,
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
        },
        'is_verifikasi': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        freezeTableName: true,
        tableName: 'jt_penimbangan'
    });

    //penimbangan.removeAttribute("id");
    penimbangan.beforeCreate(timbang => timbang.id = uuidv4());
    penimbangan.associate = function (models) {
        penimbangan.belongsTo(models.t_regu, {
            foreignKey: 'regu_id',
            as: 'penimbangan_regu'
        });
        penimbangan.belongsTo(models.t_shift, {
            foreignKey: 'shift_id',
            as: 'penimbangan_shift'
        });
        penimbangan.belongsTo(models.t_petugas, {
            foreignKey: 'petugas_id',
            as: 'penimbangan_petugas'
        });
        penimbangan.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'penimbangan_bptd'
        });
        penimbangan.belongsTo(models.t_lokasi, {
            foreignKey: 'kode_uppkb',
            as: 'penimbangan_uppkb',
            targetKey: 'kode'
        });
        penimbangan.belongsTo(models.t_timbangan, {
            foreignKey: 'timbangan_id',
            as: 'penimbangan_platform',
        });
        penimbangan.belongsTo(models.t_kota_kab, {
            foreignKey: 'asal_kota_id',
            as: 'penimbanganAsalKota',
        });
        penimbangan.belongsTo(models.t_kota_kab, {
            foreignKey: 'tujuan_kota_id',
            as: 'penimbanganTujuanKota',
        });
        penimbangan.belongsTo(models.t_komoditi, {
            foreignKey: 'komoditi_id',
            as: 'penimbanganKomoditi',
        });
        penimbangan.belongsTo(models.t_kategori_komoditi, {
            foreignKey: 'kategori_komoditi_id',
            as: 'penimbanganKatKomoditi',
        });
        penimbangan.belongsTo(models.t_kategori_kepemilikan, {
            foreignKey: 'kategori_kepemilikan_id',
            as: 'penimbanganKatKepemilikan',
        });
        penimbangan.belongsTo(models.t_kendaraan, {
            foreignKey: 'no_kendaraan',
            as: 'penimbangan_kendaraan',
            targetKey: 'no_reg_kend'
        });
        penimbangan.hasMany(models.t_detailmuatan, {
            foreignKey: 'kode_trx',
            as: 'penimbanganDetailMuatan',
            sourceKey: 'kode_trx',
        });
        penimbangan.hasMany(models.t_detaildokumen, {
            foreignKey: 'kode_trx',
            as: 'penimbanganDetailDokumen',
            sourceKey: 'kode_trx',
        });
        penimbangan.hasMany(models.t_pelanggaran, {
            foreignKey: 'kode_trx',
            as: 'penimbanganPelanggaran',
            sourceKey: 'kode_trx',
        });
        // penimbangan.hasMany(models.t_toleransi_komoditi, {
        //     foreignKey: 'penimbangan_id',
        //     as: 'tolkatkomoditi'
        // });
    };

    sequelizePaginate.paginate(penimbangan)



    return penimbangan;
};
