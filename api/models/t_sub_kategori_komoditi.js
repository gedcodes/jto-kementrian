/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const sub_kategori_komoditi = sequelize.define('t_sub_kategori_komoditi', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kategori_komoditi_id': {
            type: DataTypes.INTEGER,
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
        tableName: 'jt_sub_kategori_komoditi'
    });

    sub_kategori_komoditi.associate = function (models) {
        sub_kategori_komoditi.hasMany(models.t_komoditi, {
            foreignKey: 'sub_kategori_komoditi_id',
            as: 'subKategoriKomoditi'
        });
        sub_kategori_komoditi.belongsTo(models.t_kategori_komoditi, {
            foreignKey: 'kategori_komoditi_id',
            as: 'kategoriKomoditi'
        });
    };

    sequelizePaginate.paginate(sub_kategori_komoditi)

    return sub_kategori_komoditi;
};
