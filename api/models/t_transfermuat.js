/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');
module.exports = function (sequelize, DataTypes) {
    const transfermuat = sequelize.define('t_transfermuat', {
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
        'regu_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_regu',
                key: 'id'
            }
        },
        'shift_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },                 
        'petugas_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        }, 
        'kode_trx': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null",
        },
        'jenis_kendaraan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'jenis_kendaraan': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null",
        },
        'sumbu_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'sumbu': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null",
        },
        'kode_penindakan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        },
        'kode_transfer_muat': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        }, 
        'no_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        },
        'no_uji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null",
        },                                 
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jbi_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'masa_berlaku': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },  
        'tgl_transfer_muat': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },                
        'berat_timbang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbki': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
        'berat_lebih': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'persen_lebih': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'berat_timbang_ulang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'berat_lebih_ulang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'persen_lebih_ulang': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'is_turun_muatan': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'no_kendaraan_lansiran': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_uji_lansiran': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jenis_kendaraan_lansiran_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'jenis_kendaraan_lansiran': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null",
        },
        'sumbu_lansiran_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
        },
        'sumbu_lansiran': {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "null",
        },
        'masa_berlaku_lansiran': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'jbi_lansiran': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'berat_timbang_lansiran': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'berat_lebih_lansiran': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        }, 
        'persen_lebih_lansiran': {
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
        'sync_to_pusat': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        tableName: 'jt_transfer_muat'
    });
    transfermuat.beforeCreate(transfermuat => transfermuat.id = uuidv4());
    
    transfermuat.associate = function (models) {
        transfermuat.belongsTo(models.t_regu, {
            foreignKey: 'regu_id',
            as: 'transfermuat_regu'
        });
        transfermuat.belongsTo(models.t_shift, {
            foreignKey: 'shift_id',
            as: 'transfermuat_shift'
        });        
        transfermuat.belongsTo(models.t_petugas, {
            foreignKey: 'petugas_id',
            as: 'transfermuat_petugas'
        });
        transfermuat.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'transfermuat_bptd'
        });                
        transfermuat.belongsTo(models.t_lokasi, {
            foreignKey: 'kode_uppkb',
            as: 'transfermuat_uppkb',
            targetKey:'kode'
        });
    }
    
    sequelizePaginate.paginate(transfermuat)

    return transfermuat;
};
