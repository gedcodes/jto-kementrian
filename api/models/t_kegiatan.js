/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const kegiatan = sequelize.define('t_kegiatan', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kode': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'deskripsi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tahun': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'sumber_anggaran_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'metode_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'vendor_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'direktorat_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        }, 
        'kategori_kegiatan_id': {
            type: DataTypes.INTEGER,
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
        }
    }, {
        tableName: 'jt_kegiatan'
    });

    kegiatan.associate = function (models) {
        kegiatan.belongsTo(models.t_vendor, {
            foreignKey: 'vendor_id',
            as: 'kegiatan_vendor'
        });
        kegiatan.belongsTo(models.t_instansi, {
            foreignKey: 'direktorat_id',
            as: 'kegiatan_direktorat'
        });
        kegiatan.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'kegiatan_bptd'
        });
        kegiatan.belongsTo(models.t_sumber_anggaran, {
            foreignKey: 'sumber_anggaran_id',
            as: 'kegiatan_sumber_anggaran'
        });
        kegiatan.belongsTo(models.t_metode, {
            foreignKey: 'metode_id',
            as: 'kegiatan_metode'
        });
        kegiatan.belongsTo(models.t_kategori_kegiatan, {
            foreignKey: 'kategori_kegiatan_id',
            as: 'kegiatan_kategori'
        });
        kegiatan.hasMany(models.t_aset, {
            foreignKey: 'kegiatan_id',
            as: 'kegiatan_aset',
        });
    }
    sequelizePaginate.paginate(kegiatan)

    return kegiatan;
};
