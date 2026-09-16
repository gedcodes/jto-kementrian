/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const detailramcek = sequelize.define('t_detailramcek', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'regu_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'shift_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'petugas_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        }, 
        'nama_penguji': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'no_reg_penguji': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'nama_ppns': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'no_skep': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },                                
        'no_pemeriksaan': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'kode_trx': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        }, 
        'kode_uppkb': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        }, 
        'no_kendaraan': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },                        
        'tgl_pemeriksaan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },  
        'nama_pengemudi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'umur_pengemudi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },                        
        'nokend_value': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'nokend_sesuai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kartu_izin_value': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kartu_izin_berlaku': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kartu_izin_sesuai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kartu_uji_value': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kartu_uji_tidak_berlaku': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kartu_uji_tidak_sesuai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'sim_a': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'sim_b1': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'sim_b2': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'sim_tidak_sesuai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_utama_kendaraan_dekat': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_utama_kendaraan_dekat_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_utama_kendaraan_dekat_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_utama_kendaraan_jauh': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_utama_kendaraan_jauh_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_utama_kendaraan_jauh_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_petunjuk_arah_depan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_petunjuk_arah_depan_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_petunjuk_arah_depan_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_petunjuk_arah_belakang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_petunjuk_arah_belakang_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_petunjuk_arah_belakang_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_rem': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_rem_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_rem_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_mundur': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_mundur_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_mundur_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_rem_utama': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_rem_parkir': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_kaca_depan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_ban_depan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_ban_depan_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_ban_depan_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_ban_belakang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_ban_belakang_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kondisi_ban_belakang_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'sabuk_keselamatan_pengemudi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'plakat_dan_simbol': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'dimensi_muatan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'pengukuran_kecepatan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_depan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_depan_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_depan_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_belakang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_belakang_kiri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_belakang_kanan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'kaca_spion': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        }, 
        'kaca_spion_tidak_sesuai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'penghapus_kaca': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'penghapus_kaca_tidak_sesuai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'klakson': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'klakson_tidak_sesuai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'sabuk_keselamatan_pengemudi_teknis_penunjang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'sabuk_keselamatan_pengemudi_teknis_penunjang_tidak_laik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'segitiga_pengaman': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'dongkrak': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'pembuka_roda': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_senter': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lampu_senter_tidak_berfungsi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'status_kesimpulan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'diijinkan_operasional': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'peringatan_dan_perbaikan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'tilang_dan_dilarang_operasional': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'dilarang_operasional': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'catatan': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 0,
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
        'deleted_by': {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        tableName: 'jt_detail_ramcek'
    });

    detailramcek.beforeCreate(ramcek => ramcek.id = uuidv4());

    detailramcek.associate = function (models) {
        detailramcek.belongsTo(models.t_lokasi, {
            foreignKey: 'kode_uppkb',
            as: 'detailramcek_uppkb',
            targetKey:'kode'
        });
        detailramcek.belongsTo(models.t_kendaraan, {
            foreignKey: 'no_kendaraan',
            as: 'detailramcek_kendaraan',
            targetKey:'no_reg_kend'
        });
        // detailramcek.belongsTo(models.t_komoditi, {
        //     foreignKey: 'komoditi_id',
        //     as: 'detailramcekkomoditi'
        // });
    };

    sequelizePaginate.paginate(detailramcek)

    return detailramcek;
};
