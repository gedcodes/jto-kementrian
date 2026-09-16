/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const komoditi = sequelize.define('t_komoditi', {
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
            comment: "null",
            references: {
                model: 't_komoditi',
                key: 'id'
            }
        },         
        'sub_kategori_komoditi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
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
        tableName: 'jt_komoditi'
    });

    komoditi.associate = function (models) {
        komoditi.belongsTo(models.t_kategori_komoditi, {
            foreignKey: 'kategori_komoditi_id',
            as: 'katkomoditi'
        });

        komoditi.belongsTo(models.t_sub_kategori_komoditi, {
            foreignKey: 'sub_kategori_komoditi_id',
            as: 'subKategoriKomoditi'
        });

        komoditi.hasMany(models.t_detailmuatan, {
            foreignKey: 'komoditi_id',
            as: 'detailmuatankomoditi'
        });        

        komoditi.hasMany(models.t_toleransi_uppkb, {
            foreignKey: 'komoditi_id',
            as: 'komoditi_uppkb'
        });
        
        komoditi.hasMany(models.t_penimbangan, {
            foreignKey: 'komoditi_id',
            as: 'penimbanganKomoditi'
        });
             
    };

    sequelizePaginate.paginate(komoditi)

    return komoditi;
};
