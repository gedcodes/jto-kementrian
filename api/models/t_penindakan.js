/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');
module.exports = function (sequelize, DataTypes) {
    const penindakan = sequelize.define('t_penindakan', {
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
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },        
        'pengadilan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },          
        'petugas_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        }, 
        'gol_sim_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'asal_kota_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        }, 
        'tujuan_kota_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'sanksi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'kejaksaan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'kejaksaan_kode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        },
        'pengadilan_kode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        },                                                         
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kode_penindakan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },  
        'tgl_penindakan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },                
        'tgl_sidang': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'jam_sidang': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },  
        'no_sim': {
            type: DataTypes.STRING(60),
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
        'umur_pengemudi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'no_telp_pengemudi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jenis_kelamin': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'warna_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },                        
        'nama_ppns': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_skep': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kode_briva': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'etilang_ticket_id': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },        
        'status_penindakan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'keterangan_tindakan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kategori_jenis_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kategori_jenis_kendaraan_id': {
            type: DataTypes.INTEGER,
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
        'sync_to_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        tableName: 'jt_penindakan'
    });
    penindakan.beforeCreate(tindakan => tindakan.id = uuidv4());
    penindakan.associate = function (models) {
        penindakan.belongsTo(models.t_regu, {
            foreignKey: 'regu_id',
            as: 'penindakan_regu'
        });
        penindakan.belongsTo(models.t_shift, {
            foreignKey: 'shift_id',
            as: 'penindakan_shift'
        });        
        penindakan.belongsTo(models.t_petugas, {
            foreignKey: 'petugas_id',
            as: 'penindakan_petugas'
        });
        penindakan.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'penindakan_bptd'
        });                
        penindakan.belongsTo(models.t_lokasi, {
            foreignKey: 'kode_uppkb',
            as: 'penindakan_uppkb',
            targetKey:'kode'
        });
        penindakan.belongsTo(models.t_kota_kab, {
            foreignKey: 'asal_kota_id',
            as: 'penindakanAsalKota',
        });
        penindakan.belongsTo(models.t_kota_kab, {
            foreignKey: 'tujuan_kota_id',
            as: 'penindakanTujuanKota',
        });
        penindakan.belongsTo(models.t_pengadilan, {
            foreignKey: 'pengadilan_id',
            as: 'penindakanPengadilan',
        });
        penindakan.belongsTo(models.t_kejaksaan, {
            foreignKey: 'kejaksaan_id',
            as: 'penindakanKejaksaan',
        });        
        penindakan.belongsTo(models.t_gol_sim, {
            foreignKey: 'gol_sim_id',
            as: 'penindakanGolSim',
        });
        penindakan.belongsTo(models.t_sanksi, {
            foreignKey: 'sanksi_id',
            as: 'penindakanSanksiMelanggar',
        });

        penindakan.hasMany(models.t_pelanggaran, {
            foreignKey: 'kode_trx',
            as: 'penindakanPelanggaran',
            sourceKey:'kode_trx',
        });

        penindakan.hasMany(models.t_detailpenindakan_pasal, {
            foreignKey: 'kode_penindakan',
            as: 'penindakanDetailPasal',
            sourceKey:'kode_penindakan',
        });

        penindakan.hasMany(models.t_detailpenindakan_sanksi, {
            foreignKey: 'kode_penindakan',
            as: 'penindakanDetailSanksi',
            sourceKey:'kode_penindakan',
        });
        
        penindakan.hasMany(models.t_detailpenindakan_sitaan, {
            foreignKey: 'kode_penindakan',
            as: 'penindakanDetailSitaan',
            sourceKey:'kode_penindakan',
        });

        penindakan.belongsTo(models.t_kendaraan, {
            foreignKey: 'no_kendaraan',
            as: 'penindakan_kendaraan',
            targetKey:'no_reg_kend'
        }); 
    }

    sequelizePaginate.paginate(penindakan)

    return penindakan;
};
