/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const pelanggaran = sequelize.define('t_pelanggaran', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'kode_trx': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kode_uppkb': {
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
        'jenis_pelanggaran_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kode_pelanggaran': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },  
        'deskripsi': {
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
        tableName: 'jt_pelanggaran'
    });

    pelanggaran.associate = function (models) {
        pelanggaran.belongsTo(models.t_jenis_pelanggaran, {
            foreignKey: 'jenis_pelanggaran_id',
            as: 'jenisPelanggaran'
        });
        pelanggaran.belongsTo(models.t_penimbangan, {
            foreignKey: 'kode_trx',
            as: 'penimbanganPelanggaran',
            sourceKey:'kode_trx',
        });
        pelanggaran.belongsTo(models.t_penindakan, {
            foreignKey: 'kode_trx',
            as: 'penindakanPelanggaran',
            sourceKey:'kode_trx',
        });
    };

    sequelizePaginate.paginate(pelanggaran)

    return pelanggaran;
};
