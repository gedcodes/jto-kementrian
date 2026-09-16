/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
module.exports = function (sequelize, DataTypes) {
    const kota = sequelize.define('t_kota_kab', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'provinsi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 'jt_provinsi',
                key: 'id'
            }
        },
        'kode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
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
        tableName: 'jt_kota_kab'
    });

    kota.associate = function (models) {
        kota.belongsTo(models.t_provinsi, {
            foreignKey: 'provinsi_id',
            as: 'provinsi'
        });

        kota.hasMany(models.t_lokasi, {
            foreignKey: 'kota_kab_id',
            as: 'lkotakab'
        });

        kota.hasMany(models.t_penimbangan, {
            foreignKey: 'asal_kota_id',
            as: 'penimbanganAsalKota'
        });
        
        kota.hasMany(models.t_penimbangan, {
            foreignKey: 'tujuan_kota_id',
            as: 'penimbanganTujuanKota'
        }); 
        
        kota.hasMany(models.t_penindakan, {
            foreignKey: 'asal_kota_id',
            as: 'penindakanAsalKota'
        });
        
        kota.hasMany(models.t_penindakan, {
            foreignKey: 'tujuan_kota_id',
            as: 'penindakanTujuanKota'
        }); 
    }

    sequelizePaginate.paginate(kota)

    return kota;
};
