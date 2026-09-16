/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const petugas = sequelize.define('t_petugas', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
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
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },                
        'kode_uppkb': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'nip': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_telp': {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: "null"
        },
        'pangkat': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jabatan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_skep': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'tgl_skep': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'tahun_skep': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'no_reg_penguji': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },         
        'keterangan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'is_korsatpel': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'is_penguji': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },
        'is_ppns': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        },  
        'is_danru': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
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
        tableName: 'jt_petugas'
    });

    petugas.associate = function (models) {
        petugas.belongsTo(models.t_regu, {
            foreignKey: 'regu_id',
            as: 'petugasregu'
        });

        petugas.hasMany(models.t_lokasi, {
            foreignKey: 'kode',
            as: 'petugasuppkb', 
            sourceKey: 'kode_uppkb'
        });
        
        petugas.hasMany(models.Users, {
            foreignKey: 'petugas_id',
            as: 'userpetugas'
        }); 

        petugas.hasMany(models.t_penimbangan, {
            foreignKey: 'petugas_id',
            as: 'penimbangan_petugas'
        });
        
        petugas.hasMany(models.t_penindakan, {
            foreignKey: 'petugas_id',
            as: 'penindakan_petugas'
        });

        petugas.hasMany(models.t_transfermuat, {
            foreignKey: 'petugas_id',
            as: 'transfermuat_petugas'
        });
    };

    sequelizePaginate.paginate(petugas)

    return petugas;
};
