/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const kejaksaan = sequelize.define('t_kejaksaan', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_lokasi',
                key: 'id'
            }
        }, 
        'kota_kab_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },               
        'kode_uppkb': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null",
            unique: true
        }, 
        'kode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
            unique: true
        },              
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'alamat': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_telp': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tipe': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'etilang_id': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'sync_to_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'sync_from_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
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
        }
    }, {
        tableName: 'jt_kejaksaan'
    });

    kejaksaan.associate = function (models) {
        kejaksaan.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_id',
            as: 'kejaksaanlokasiuppkb'
        });
        kejaksaan.hasMany(models.t_penindakan, {
            foreignKey: 'kejaksaan_id',
            as: 'penindakankejaksaan'
        }); 
    }

    sequelizePaginate.paginate(kejaksaan)

    return kejaksaan;
};
