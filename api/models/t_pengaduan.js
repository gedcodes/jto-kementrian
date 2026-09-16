/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {

    const pengaduan = sequelize.define('t_pengaduan', {

        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },      
        'kode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tiket_id': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kategori_pengaduan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'tgl_pengaduan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'desk_pengaduan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_pengaduan_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_pengaduan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'status_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'lokasi_uppkb_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'user_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'surat_pengantar_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'surat_pengantar_url': {
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
        'is_penanganan': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'prioritas_aduan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },  
    }, {
        tableName: 'jt_pengaduan'
    });

    pengaduan.associate = function (models) {
        
        // pengaduan.belongsTo(models.t_kategori_pengaduan, {
        //     foreignKey: 'kategori_pengaduan_id',
        //     as: 'pengaduan_kategori'
        // });
        pengaduan.hasMany(models.t_perbaikan, {
            foreignKey: 'pengaduan_id',
            as: 'pengaduan_perbaikan'
        });
        pengaduan.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_uppkb_id',
            as: 'pengaduan_uppkb'
        });        
        pengaduan.belongsTo(models.Users, {
            foreignKey: 'user_id',
            as: 'pengaduan_user'
        });
        pengaduan.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'pengaduan_bptd'
        });    
        pengaduan.hasOne(models.t_penanganan, {
            foreignKey: 'pengaduan_id',
            as: 'pengaduan_penanganan',
        });
        pengaduan.belongsTo(models.t_prioritas_aduan, {
            foreignKey: 'prioritas_aduan_id',
            as: 'pengaduan_prioritas'
        });
        pengaduan.belongsTo(models.t_status, {
            foreignKey: 'status_id',
            as: 'pengaduan_status'
        });
    };

    sequelizePaginate.paginate(pengaduan)

    return pengaduan;
};
