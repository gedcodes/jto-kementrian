/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const sanksi = sequelize.define('t_sanksi', {
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
        'deskripsi': {
            type: DataTypes.STRING,
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
        tableName: 'jt_sanksi'
    });

    sanksi.associate = function (models) {
        sanksi.hasMany(models.t_sanksi_pelanggaran, {
            foreignKey: 'sanksi_id',
            as: 'sanksi_pel'
        });

        sanksi.hasMany(models.t_sub_sanksi, {
            foreignKey: 'sanksi_id',
            as: 'fksubsanksi'
        });

        sanksi.hasMany(models.t_sitaan, {
            foreignKey: 'sanksi_id',
            as: 'fksitaansanksi'
        });

        sanksi.hasMany(models.t_penindakan, {
            foreignKey: 'sanksi_id',
            as: 'penindakanSanksiMelanggar'
        }); 
    };

    sequelizePaginate.paginate(sanksi)

    return sanksi;
};
