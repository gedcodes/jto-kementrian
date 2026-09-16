/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const detailtindakansitaan = sequelize.define('t_detailpenindakan_sitaan', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },   
        'kode_trx': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kode_penindakan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tgl_penindakan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },                
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'sitaan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
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
        'is_deleted': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        tableName: 'jt_detail_penindakan_sitaan'
    });
    detailtindakansitaan.beforeCreate(detailtindakan => detailtindakan.id = uuidv4());

    detailtindakansitaan.associate = function (models) {
        detailtindakansitaan.belongsTo(models.t_sitaan, {
            foreignKey: 'sitaan_id',
            as: 'detailtindakansitaan'
        });

        detailtindakansitaan.belongsTo(models.t_penindakan, {
            foreignKey: 'kode_penindakan',
            as: 'penindakanDetailSitaan',
            sourceKey:'kode_penindakan',
        });
    };

    sequelizePaginate.paginate(detailtindakansitaan)

    return detailtindakansitaan;
};
