/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const gol_ai = sequelize.define('t_gol_ai', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'id_kategori_gol_ai': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'id_jns_kendaraan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },                           
        'desc_gol_ai': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },  
        'is_active': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
            comment: "null"
        },
    }, {
        tableName: 'jt_gol_ai'
    });

    gol_ai.associate = function (models) {
        gol_ai.belongsTo(models.t_jenis_kendaraan, {
            foreignKey: 'id_jns_kendaraan',
            as: 'jenisKend'
        });        
    };

    sequelizePaginate.paginate(gol_ai)

    return gol_ai;
};
