/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const lokasi = sequelize.define('t_lokasi', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kota_kab_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_kota_kab',
                key: 'id'
            }
        }, 
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_bptd',
                key: 'id'
            }
        },               
        'kode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            unique: true
        },
        'gen_kode': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },               
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'alamat_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'is_operasi': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },                
        'lat_pos': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'lon_pos': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'tahun_diresmikan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'luas_lahan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kapasitas_timbangan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jml_sdm': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jml_pns': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jml_ppns': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jml_ppnpn': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'tahun_jto': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'status_operasi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },                                      
        'created_at': {
            type: DataTypes.DATE,
            allowNull: false,
            //defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            comment: "null"
        },
        'updated_at': {
            type: DataTypes.DATE,
            allowNull: false,
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
        'versi_lhr': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "2",
            comment: "null"
        },        
        'is_lhr': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },        
        'is_wim': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'is_integrasi_etilang': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'sk_tipe_lhr': {
            type: DataTypes.STRING(10),
            allowNull: true,
            comment: "null"
        },
        'sk_jml_lhr': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'foto_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'masa_berlaku_tera': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'no_cs': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'domain_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'ttd_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
    }, {
        tableName: 'jt_lokasi_uppkb'
    });

    lokasi.associate = function (models) {
        lokasi.hasMany(models.t_timbangan, {
            foreignKey: 'lokasi_uppkb_id',
            as: 'timbanganuppkb'
        });

        lokasi.belongsTo(models.t_kota_kab, {
            foreignKey: 'kota_kab_id',
            as: 'lkotakab'
        });

        lokasi.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'lbptd'
        });

        lokasi.hasMany(models.t_pengadilan, {
            foreignKey: 'lokasi_id',
            as: 'pengadilanlokasiuppkb'
        });

        lokasi.hasMany(models.t_kejaksaan, {
            foreignKey: 'lokasi_id',
            as: 'kejaksaanlokasiuppkb'
        });        

        lokasi.hasMany(models.Users, {
            foreignKey: 'lokasi_id',
            as: 'userlokasi'
        });        

        lokasi.hasMany(models.t_toleransi_uppkb, {
            foreignKey: 'lokasi_id',
            as: 'tolkoduppkb',
            //targetKey:'kode_uppkb'
        });
        
        lokasi.belongsTo(models.t_shift, {
            foreignKey: 'kode',
            as: 'shiftuppkb',
            targetKey:'kode_uppkb'
        });

        lokasi.belongsTo(models.t_regu, {
            foreignKey: 'kode',
            as: 'reguuppkb',
            targetKey:'kode_uppkb'
        });
        
        lokasi.hasMany(models.t_petugas, {
            foreignKey: 'lokasi_id',
            as: 'petugasuppkb',
        });        

        lokasi.hasMany(models.t_penimbangan, {
            foreignKey: 'kode_uppkb',
            as: 'penimbangan_uppkb',
            targetKey:'kode'
        });

        lokasi.hasMany(models.t_penindakan, {
            foreignKey: 'kode_uppkb',
            as: 'penindakan_uppkb',
            targetKey:'kode'
        });
        
        lokasi.hasMany(models.t_transfermuat, {
            foreignKey: 'kode_uppkb',
            as: 'transfermuat_uppkb',
            targetKey:'kode'
        });

        lokasi.hasMany(models.t_detaildimensi, {
            foreignKey: 'kode_uppkb',
            as: 'detaildimensi_uppkb',
            targetKey:'kode'
        });

        lokasi.hasMany(models.t_detailramcek, {
            foreignKey: 'kode_uppkb',
            as: 'detailramcek_uppkb',
            targetKey:'kode'
        });

        lokasi.hasMany(models.t_streaming, {
            foreignKey: 'lokasi_id',
            as: 'cctv_uppkb',
        });

        lokasi.hasMany(models.t_galeri_uppkb, {
            foreignKey: 'lokasi_uppkb_id',
            as: 'galeri_uppkb_lokasi',
        });
    }

    sequelizePaginate.paginate(lokasi)

    return lokasi;
};
