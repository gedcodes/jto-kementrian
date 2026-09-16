/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const direktorat = sequelize.define('t_direktorat', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kode': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kontak_person': {
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
        },
        'instansi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
    }, {
        tableName: 'jt_direktorat'
    });
    
    direktorat.associate = function (models) {
        
        direktorat.belongsTo(models.t_instansi, {
            foreignKey: 'instansi_id',
            as: 'direktorat_instansi'
        });
    };

    sequelizePaginate.paginate(direktorat)

    return direktorat;
};
