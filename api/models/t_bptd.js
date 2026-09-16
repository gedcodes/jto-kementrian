/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const bptd = sequelize.define('t_bptd', {
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
        'alamat': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'lat_pos': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'lon_pos': {
            type: DataTypes.STRING(30),
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
        tableName: 'jt_bptd'
    });

    bptd.associate = function (models) {
        bptd.hasMany(models.t_provinsi, {
            foreignKey: 'bptd_id',
            as: 'provbptd'
        });
        bptd.hasMany(models.t_lokasi, {
            foreignKey: 'bptd_id',
            as: 'lbptd'
        });
        bptd.hasMany(models.t_penimbangan, {
            foreignKey: 'bptd_id',
            as: 'penimbangan_bptd'
        });
        bptd.hasMany(models.t_penindakan, {
            foreignKey: 'bptd_id',
            as: 'penindakan_bptd'
        });
        bptd.hasMany(models.t_transfermuat, {
            foreignKey: 'bptd_id',
            as: 'transfermuat_bptd'
        });
        bptd.hasMany(models.Users, {
            foreignKey: 'bptd_id',
            as: 'userbptd'
        });
    };

    sequelizePaginate.paginate(bptd)

    return bptd;
};
