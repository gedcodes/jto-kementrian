/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const pergantian = sequelize.define('t_pergantian', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'pengaduan_id': {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "null"
        },
        'penanganan_id': {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "null"
        },
        'aset_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
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
        'img_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_name2': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_url2': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_name3': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_url3': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_name4': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'img_url4': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'keterangan': {
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
        'status_pergantian': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
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
        'is_usulan': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
    }, {
        tableName: 'jt_pergantian'
    });
    
    pergantian.associate = function (models) {
        
        pergantian.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'pergantian_bptd'
        });
        pergantian.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_uppkb_id',
            as: 'pergantian_uppkb'
        });
        pergantian.belongsTo(models.t_pengaduan, {
            foreignKey: 'pengaduan_id',
            as: 'pergantian_pengaduan'
        });
        pergantian.belongsTo(models.t_penanganan, {
            foreignKey: 'penanganan_id',
            as: 'pergantian_penanganan'
        });
        pergantian.belongsTo(models.t_aset, {
            foreignKey: 'aset_id',
            as: 'pergantian_aset'
        });
        pergantian.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_uppkb_id',
            as: 'pergantian_lokasi'
        });
        pergantian.belongsTo(models.t_kondisi_aset, {
            foreignKey: 'kondisi_id',
            as: 'pergantian_kondisi_aset'
        });
        pergantian.belongsTo(models.t_sub_kondisi_aset, {
            foreignKey: 'sub_kondisi_aset_id',
            as: 'pergantian_sub_kondisi_aset'
        });
    };

    sequelizePaginate.paginate(pergantian)

    return pergantian;
};
