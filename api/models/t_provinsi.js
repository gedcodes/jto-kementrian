/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const provinsi = sequelize.define('t_provinsi', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
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
            comment: "null"
        },
        'nama': {
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
        tableName: 'jt_provinsi'
    });

    provinsi.associate = function (models) {
        provinsi.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'provbptd'
        });

        provinsi.hasMany(models.t_kota_kab, {
            foreignKey: 'provinsi_id',
            as: 'kota'
        });
    };

    sequelizePaginate.paginate(provinsi)

    return provinsi;
};
