/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const distribusi_tembusan = sequelize.define('t_distribusi_tembusan', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },      
        'distribusi_aduan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'direktorat_id': {
            type: DataTypes.INTEGER,
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
        },
        'is_bptd': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'is_kemenhub': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
    }, {
        tableName: 'jt_distribusi_tembusan'
    });

    distribusi_tembusan.associate = function (models) {
        
        distribusi_tembusan.belongsTo(models.t_direktorat, {
            foreignKey: 'direktorat_id',
            as: 'direktorat'
        });
    };

    sequelizePaginate.paginate(distribusi_tembusan)

    return distribusi_tembusan;
};
