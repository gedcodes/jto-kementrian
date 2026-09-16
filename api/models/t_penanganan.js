/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {

    const penanganan = sequelize.define('t_penanganan', {

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
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'pengaduan_id': {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "null"
        },
        'tgl_penanganan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'desk_penanganan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'catatan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_penanganan_name': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'foto_penanganan_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'status_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'user_id': {
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
        'is_respond': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'is_penanganan': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'tgl_respond': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
    }, {
        tableName: 'jt_penanganan'
    });

    penanganan.associate = function (models) {
        
        penanganan.belongsTo(models.t_pengaduan, {
            foreignKey: 'pengaduan_id',
            as: 'penanganan_pengaduan'
        });
        penanganan.hasMany(models.t_detail_penanganan, {
            foreignKey: 'penanganan_id',
            as: 'penanganan_detail'
        });
        penanganan.belongsTo(models.Users, {
            foreignKey: 'user_id',
            as: 'penanganan_user'
        });
        penanganan.belongsTo(models.t_lokasi, {
            foreignKey: 'lokasi_uppkb_id',
            as: 'penanganan_uppkb'
        });  
        penanganan.belongsTo(models.t_bptd, {
            foreignKey: 'bptd_id',
            as: 'penanganan_bptd'
        });
        penanganan.belongsTo(models.t_status, {
            foreignKey: 'status_id',
            as: 'penanganan_status'
        });
        penanganan.hasMany(models.t_pergantian, {
            foreignKey: 'penanganan_id',
            as: 'penanganan_pergantian'
        });
    };

    sequelizePaginate.paginate(penanganan)

    return penanganan;
};
