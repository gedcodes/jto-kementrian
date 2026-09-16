/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const logwim = sequelize.define('t_log_wim', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'device_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'is_transaksi': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'tgl_penimbangan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'kode_uppkb': {
            type: DataTypes.STRING(512),
            allowNull: true,
            comment: "null"
        },
        'wim_kode': {
            type: DataTypes.STRING(512),
            allowNull: true,
            comment: "null"
        },
        'no_kendaraan': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'foto_depan_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_depan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_plat_no_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_plat_no_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'sumbu': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'wim_berat': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'wim_panjang': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'wim_lebar': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'wim_tinggi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'wim_foh': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'wim_roh': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'wim_kecepatan': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_weight1': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_weight2': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_weight3': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_weight4': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_weight5': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_weight6': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_weight7': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_dis1': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_dis2': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_dis3': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_dis4': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_dis5': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_dis6': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            comment: "null"
        },
        'axle_dis7': {
            type: DataTypes.DOUBLE,
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
        'is_status': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: true,
            comment: "null"
        },
        'jml_sumbu': {
            type: DataTypes.INTEGER,
            allowNull: true,
            // defaultValue: true,
            comment: "null"
        },
        'lajur': {
            type: DataTypes.INTEGER,
            allowNull: true,
            // defaultValue: true,
            comment: "null"
        },
        'is_melanggar': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'is_overload': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'is_overdim': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'persen_kelebihan_berat': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jml_kelebihan_berat': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'persen_kelebihan_panjang': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jml_kelebihan_panjang': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'persen_kelebihan_lebar': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jml_kelebihan_lebar': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'persen_kelebihan_tinggi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jml_kelebihan_tinggi': {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'gol_kendaraan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ip_device': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "null",
            comment: "null"
        },
        'kode_ruas': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "null",
            comment: "null"
        },
        'batas_berat_kg': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'batas_berat_kg_tol': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'batas_panjang_mm': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'batas_panjang_mm_tol': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'batas_lebar_mm': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'batas_lebar_mm_tol': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'batas_tinggi_mm': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'batas_tinggi_mm_tol': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        }
    }, {
        tableName: 'jt_log_wim'
    });

    logwim.associate = function (models) {
        logwim.belongsTo(models.t_lokasi, {
            foreignKey: 'kode_uppkb',
            as: 'wim_uppkb', 
            targetKey: 'kode'
        }); 
    };

    sequelizePaginate.paginate(logwim)

    return logwim;
};
