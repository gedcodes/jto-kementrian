/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const regu = sequelize.define('t_regu', {
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
            comment: "null"
        },        
        'shift_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_shift',
                key: 'id'
            }
        }, 
        'kode_uppkb': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
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
        tableName: 'jt_regu'
    });

    regu.associate = function (models) {
        // regu.belongsTo(models.t_shift, {
        //     foreignKey: 'shift_id',
        //     as: 'regushift'
        // });

        regu.hasMany(models.t_petugas, {
            foreignKey: 'regu_id',
            as: 'petugasregu'
        });

        regu.hasMany(models.t_lokasi, {
            foreignKey: 'kode',
            as: 'reguuppkb', 
            sourceKey: 'kode_uppkb'
        }); 
        
        regu.hasMany(models.t_penimbangan, {
            foreignKey: 'regu_id',
            as: 'penimbangan_regu'
        }); 
        
        regu.hasMany(models.t_penindakan, {
            foreignKey: 'regu_id',
            as: 'penindakan_regu'
        });
        
        regu.hasMany(models.t_transfermuat, {
            foreignKey: 'regu_id',
            as: 'transfermuat_regu'
        });
    };

    sequelizePaginate.paginate(regu)

    return regu;
};
