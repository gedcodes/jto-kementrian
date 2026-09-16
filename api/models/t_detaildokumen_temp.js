/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate');

module.exports = function (sequelize, DataTypes) {
    const detaildokumentemp = sequelize.define('t_detaildokumen_temp', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kode_trx': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tgl_penimbangan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },                
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'dokumen_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_dokumen',
                key: 'id'
            }
        },     
        'status_dokumen': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },    
        'keterangan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'foto_dokumen_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'foto_dokumen': {
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
        'is_deleted': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        tableName: 'jt_detail_dokumen_temp'
    });


    sequelizePaginate.paginate(detaildokumentemp)

    return detaildokumentemp;
};
