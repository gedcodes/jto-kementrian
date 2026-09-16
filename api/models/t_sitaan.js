/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const sitaan = sequelize.define('t_sitaan', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'sanksi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'dokumen_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
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
        tableName: 'jt_sitaan'
    });

    sitaan.associate = function (models) {
        sitaan.belongsTo(models.t_sanksi, {
            foreignKey: 'sanksi_id',
            as: 'fksitaansanksi'
        });

        sitaan.belongsTo(models.t_dokumen, {
            foreignKey: 'dokumen_id',
            as: 'fksitaandokumen'
        });

        sitaan.hasMany(models.t_detailpenindakan_sitaan, {
            foreignKey: 'sitaan_id',
            as: 'detailtindakansitaan'
        });
    };

    sequelizePaginate.paginate(sitaan)

    return sitaan;
};
