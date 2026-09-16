/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const livelogwim = sequelize.define('t_livelogwim', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },      
        'nokend': {
            type: DataTypes.STRING(10),
            allowNull: true,
            comment: "null"
        },
        'date_time': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'waktu_awal': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'sumbu1': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'sumbu2': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'sumbu3': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'sumbu4': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'sumbu5': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'sumbu6': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'berat': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'kecepatan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'konfigurasi_sumbu': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },  
        'panjang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'lebar': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        }, 
        'tinggi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        }, 
        'status': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        }, 
        'melanggar_berat': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'melanggar_dimensi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'konfigurasi_sumbu2': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'jbi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'panjang2': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'lebar2': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        }, 
        'tinggi2': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },         
        'capture_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'capture_kendaraan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },  
        'capture_plate': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'capture_plate_url': {
            type: DataTypes.STRING,
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
        }
    }, {
        tableName: 'jt_log_live_wim'
    });

    // livelogwim.associate = function (models) {
    //     livelogwim.hasMany(models.t_komoditi, {
    //         foreignKey: 'livelogwim_id',
    //         as: 'katkomoditi'
    //     });
    //     livelogwim.hasMany(models.t_toleransi_komoditi, {
    //         foreignKey: 'livelogwim_id',
    //         as: 'tolkatkomoditi'
    //     });
    // };

    sequelizePaginate.paginate(livelogwim)

    return livelogwim;
};
