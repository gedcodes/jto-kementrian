/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const timbangan = sequelize.define('t_timbangan', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'lokasi_uppkb_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_lokasi',
                key: 'id'
            }
        },                
        'kode_uppkb': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
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
        'deskripsi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'spesifikasi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'ip_pintu_antrian': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'port_pintu_antrian': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },    
        'addr_ibg_antrian': {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: "null"
        },
        'ip_pintu_penimbangan': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'port_pintu_penimbangan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'addr_ibg_penimbangan': {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: "null"
        },
        'last_status_pintu_antri': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'last_status_pintu_timbang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },                
        'api_url_sensor_dim': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'api_url_auth_dim': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'api_url_params_dim': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'cctv_depan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'cctv_belakang_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'cctv_depan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'cctv_belakang': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'ip_server': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'ws_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'sync_to_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'sync_from_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
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
        tableName: 'jt_timbangan'
    });

    timbangan.associate = function (models) {

        timbangan.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_uppkb_id',
            as: 'timbanganuppkb'
        });

        timbangan.hasMany(models.t_penimbangan, {
            foreignKey: 'timbangan_id',
            as: 'penimbangan_platform'
        });
           
    };

    sequelizePaginate.paginate(timbangan)

    return timbangan;
};
