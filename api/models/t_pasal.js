/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const pasal = sequelize.define('t_pasal', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'no_pasal': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'pasal': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'desk_pasal': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'denda_maks': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },  
        'keterangan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'etilang_id': {
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
        }
    }, {
        tableName: 'jt_pasal'
    });

    pasal.associate = function (models) {
        pasal.hasMany(models.t_sanksi_pelanggaran, {
            foreignKey: 'pasal_id',
            as: 'pasal_pelanggaran'
        });

        pasal.hasMany(models.t_detailpenindakan_pasal, {
            foreignKey: 'pasal_id',
            as: 'fkdetailtindakanpasal'
        });
    };

    sequelizePaginate.paginate(pasal)

    return pasal;
};
