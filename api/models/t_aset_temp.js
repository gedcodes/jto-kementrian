/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate');
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const asettemp = sequelize.define('t_aset_temp', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'kategori_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kegiatan_id': {
            type: DataTypes.UUID,
            allowNull: true,
            comment: "null"
        },
        'satuan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'lokasi_uppkb_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kondisi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'sub_kondisi_aset_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kode': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'kode_bmn': {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nup': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'nilai_perolehan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'no_spk': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'uraian': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'spesifikasi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'qty': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'keterangan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img1_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'img1_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'img2_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'img2_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'img3_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'img3_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'img4_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'img4_url': {
            type: DataTypes.STRING,
            allowNull: true,
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
        'jenis_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'temp_id': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'parent_id': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'is_terpasang': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
            comment: "null"
        },
        'is_parent': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        tableName: 'jt_aset_temp'
    });

    asettemp.associate = function (models) {
        asettemp.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'bptd_aset'
        });
        asettemp.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_uppkb_id',
            as: 'uppkb_aset'
        });
        asettemp.belongsTo(models.t_kategori_aset, {
            foreignKey: 'kategori_id',
            as: 'kategori_aset'
        });
        asettemp.belongsTo(models.t_jenis_aset, {
            foreignKey: 'jenis_id',
            as: 'jenis_aset'
        });
        asettemp.belongsTo(models.t_kegiatan, {
            foreignKey: 'kegiatan_id',
            as: 'kegiatan'
        });
        asettemp.belongsTo(models.t_satuan_aset, {
            foreignKey: 'satuan_id',
            as: 'satuan_aset'
        });
        asettemp.belongsTo(models.t_kondisi_aset, {
            foreignKey: 'kondisi_id',
            as: 'kondisi_aset'
        });
        asettemp.belongsTo(models.t_sub_kondisi_aset, {
            foreignKey: 'sub_kondisi_aset_id',
            as: 'sub_kondisi_aset'
        });
        asettemp.belongsTo(models.t_aset, {
            foreignKey: 'parent_id',
            as: 'referensi_aset'
        });
    }
    

    sequelizePaginate.paginate(asettemp)

    return asettemp;
};
