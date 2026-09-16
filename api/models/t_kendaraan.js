/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const kendaraan = sequelize.define('t_kendaraan', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'no_reg_kend': {
            type: DataTypes.STRING(12),
            allowNull: true,
            comment: "null"
        },
        'no_uji': {
            type: DataTypes.STRING,
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
        'lokasi_uji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tanggal_uji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'masa_berlaku_uji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'is_masa_berlaku': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'jenis_kend': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jenis_kendaraan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'sumbu_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'konfigurasi_sumbu': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kepemilikan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kepemilikan_val': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'berat_kosong': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbb': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbkb': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbki': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'mst': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'panjang_utama': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'lebar_utama': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'tinggi_utama': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'julur_depan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'julur_belakang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jarak_sumbu_1_2': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jarak_sumbu_2_3': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jarak_sumbu_3_4': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'dimensi_bak_tangki': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nomor_rangka': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'merek': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'bahan_bakar': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kelas': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'daya_angkut_orang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'daya_angkut_barang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'foto_kanan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_kiri': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_depan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_belakang': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_kanan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_kiri_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_depan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_belakang_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'blue_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'no_srut': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tgl_srut': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'no_mesin': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'tipe': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'tahun_rakit': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'isi_silinder': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'daya_motor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'ukuran_ban': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'keterangan_hasil_uji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'petugas_penguji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nrp_petugas_penguji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kepala_dinas': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'pangkat_kepala_dinas': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nip_kepala_dinas': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'unit_pelaksana_teknis': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'direktur': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'pangkat_direktur': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nip_direktur': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'etl_date': {
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
        }
    }, {
        tableName: 'jt_kendaraan'
    });

    kendaraan.associate = function (models) {
        kendaraan.hasMany(models.t_detaildimensi, {
            foreignKey: 'no_kendaraan',
            as: 'detaildimensi_kendaraan',
            targetKey: 'no_reg_kend'
        });

        kendaraan.hasMany(models.t_detailramcek, {
            foreignKey: 'no_kendaraan',
            as: 'detailramcek_kendaraan',
            targetKey: 'no_reg_kend'
        });

        kendaraan.hasMany(models.t_penimbangan, {
            foreignKey: 'no_kendaraan',
            as: 'penimbangan_kendaraan',
            targetKey: 'no_reg_kend'
        });

        kendaraan.hasMany(models.t_penindakan, {
            foreignKey: 'no_kendaraan',
            as: 'penindakan_kendaraan',
            targetKey: 'no_reg_kend'
        });

        // kendaraan.hasMany(models.t_komoditi, {
        //     foreignKey: 'kendaraan_id',
        //     as: 'katkomoditi'
        // });
        // kendaraan.hasMany(models.t_toleransi_komoditi, {
        //     foreignKey: 'kendaraan_id',
        //     as: 'tolkatkomoditi'
        // });
    };

    sequelizePaginate.paginate(kendaraan)

    return kendaraan;
};
