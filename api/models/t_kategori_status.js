/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const kategori_status = sequelize.define('t_kategori_status', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
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
            type: DataTypes.DATE, //'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',//
            allowNull: true,
            //defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            comment: "null"
        },
        'updated_at': {
            type: DataTypes.DATE, //'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',//
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
        tableName: 'jt_kategori_status'
    });

    kategori_status.associate = function (models) {
          
        kategori_status.hasMany(models.t_kategori_status_role, {
            foreignKey: 'kategori_status_id',
            as: 'kategoriStatusRole',
        });
    };

    sequelizePaginate.paginate(kategori_status)

    return kategori_status;
};
