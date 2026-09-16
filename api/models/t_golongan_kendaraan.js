/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const golkendaraan = sequelize.define('t_golongan_kendaraan', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'jenis_kendaraan_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_jenis_kendaraan',
                key: 'id'
            }
        },        
        'sumbu_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_sumbu',
                key: 'id'
            }
        },
        'sim_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_gol_sim',
                key: 'id'
            }
        },         
        'kode': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },
        'kode_kemenhub': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },              
        'nama': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jbi_kelas_2': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbi_kelas_3': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        }, 
        'jml_ban': {
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
        tableName: 'jt_golongan_kendaraan'
    });

    golkendaraan.associate = function (models) {
        golkendaraan.belongsTo(models.t_jenis_kendaraan, {
            foreignKey: 'jenis_kendaraan_id',
            as: 'jnskend'
        });

        golkendaraan.belongsTo(models.t_sumbu, {
            foreignKey: 'sumbu_id',
            as: 'sumbu'
        });

        golkendaraan.belongsTo(models.t_gol_sim, {
            foreignKey: 'sim_id',
            as: 'simgol'
        });        
    };

    sequelizePaginate.paginate(golkendaraan)

    return golkendaraan;
};
