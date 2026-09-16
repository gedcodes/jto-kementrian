/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const toleransikomoditi = sequelize.define('t_toleransi_komoditi', {
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
        'prosen_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'tgl_mulai': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'tgl_selesai': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'durasi': {
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
        tableName: 'jt_toleransi_komoditi'
    });

    toleransikomoditi.associate = function (models) {
        toleransikomoditi.belongsTo(models.t_kategori_komoditi, {
            foreignKey: 'kategori_komoditi_id',
            as: 'tolkatkomoditi'
        });
    };

    sequelizePaginate.paginate(toleransikomoditi)

    return toleransikomoditi;
};
