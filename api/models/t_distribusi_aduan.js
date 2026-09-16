/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const distribusi_aduan = sequelize.define('t_distribusi_aduan', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
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
        'deskripsi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tgl_distribusi': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'assigned_from_user_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'assigned_to_user_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'prioritas_aduan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'pengaduan_id': {
            type: DataTypes.UUID,
            allowNull: false
        },
        'status_id': {
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
        'is_bptd': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'is_kemenhub': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },
        'direktorat_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
    }, {
        tableName: 'jt_distribusi_aduan'
    });

    distribusi_aduan.associate = function (models) {
        
        distribusi_aduan.belongsTo(models.t_prioritas_aduan, {
            foreignKey: 'prioritas_aduan_id',
            as: 'prioritas_level'
        });

        distribusi_aduan.belongsTo(models.Users, {
            foreignKey: 'assigned_from_user_id',
            as: 'assigned_from_user'
        });

        distribusi_aduan.belongsTo(models.Users, {
            foreignKey: 'assigned_to_user_id',
            as: 'assigned_to_user'
        });
        distribusi_aduan.belongsTo(models.t_status, {
            foreignKey: 'status_id',
            as: 'distribusi_status'
        });
        distribusi_aduan.hasMany(models.t_distribusi_tembusan, {
            foreignKey: 'distribusi_aduan_id',
            as: 'distribusi_tembusan'
        });
        distribusi_aduan.belongsTo(models.t_direktorat, {
            foreignKey: 'direktorat_id',
            as: 'distribusi_direktorat'
        });
    };

    sequelizePaginate.paginate(distribusi_aduan)

    return distribusi_aduan;
};
