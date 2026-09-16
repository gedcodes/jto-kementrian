/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const toleransiuppkb = sequelize.define('t_toleransi_uppkb', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
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
        'toleransi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_toleransi',
                key: 'id'
            }
        }, 
        'komoditi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_komoditi',
                key: 'id'
            }
        },               
        'keterangan': {
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
        tableName: 'jt_toleransi_uppkb'
    });

    toleransiuppkb.associate = function (models) {
        toleransiuppkb.belongsTo(models.t_toleransi, {
            foreignKey: 'toleransi_id',
            as: 'toluppkb'
        });

        toleransiuppkb.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_id',
            as: 'tolkoduppkb', 
            //sourceKey: 'kode_uppkb'
        });
      
        toleransiuppkb.belongsTo(models.t_komoditi, {
            foreignKey: 'komoditi_id',
            as: 'komoditi_uppkb'
        });        
    };

    sequelizePaginate.paginate(toleransiuppkb)

    return toleransiuppkb;
};
