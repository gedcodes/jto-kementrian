/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const shift = sequelize.define('t_shift', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },        
        'kode_uppkb': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
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
        'jam_mulai': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jam_selesai': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },                
        'durasi': {
            type: DataTypes.INTEGER,
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
        tableName: 'jt_shift'
    });

    shift.associate = function (models) {
        // shift.hasMany(models.t_petugas, {
        //     foreignKey: 'shift_id',
        //     as: 'petugasshift'
        // });

        shift.hasMany(models.t_regu, {
            foreignKey: 'shift_id',
            as: 'regushift'
        });

        shift.hasMany(models.t_lokasi, {
            foreignKey: 'kode',
            as: 'shiftuppkb', 
            sourceKey: 'kode_uppkb'
        });
        
        shift.hasMany(models.t_penimbangan, {
            foreignKey: 'shift_id',
            as: 'penimbangan_shift'
        }); 

        shift.hasMany(models.t_penindakan, {
            foreignKey: 'shift_id',
            as: 'penindakan_shift'
        });

        shift.hasMany(models.t_transfermuat, {
            foreignKey: 'shift_id',
            as: 'transfermuat_shift'
        });         
    };

    sequelizePaginate.paginate(shift)

    return shift;
};
