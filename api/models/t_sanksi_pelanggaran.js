/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const sanksi_pelanggaran = sequelize.define('t_sanksi_pelanggaran', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'jenis_pelanggaran_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_jenis_pelanggaran',
                key: 'id'
            }
        },        
        'sanksi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_sanksi',
                key: 'id'
            }
        },
        'pasal_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_pasal',
                key: 'id'
            }
        },                
        'rekomendasi': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'keterangan': {
            type: DataTypes.STRING,
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
        tableName: 'jt_sanksi_pelanggaran'
    });

    sanksi_pelanggaran.associate = function (models) {
        sanksi_pelanggaran.belongsTo(models.t_sanksi, {
            foreignKey: 'sanksi_id',
            as: 'sanksi_pel'
        });

        sanksi_pelanggaran.belongsTo(models.t_pasal, {
            foreignKey: 'pasal_id',
            as: 'pasal_pelanggaran'
        });        

        sanksi_pelanggaran.belongsTo(models.t_jenis_pelanggaran, {
            foreignKey: 'jenis_pelanggaran_id',
            as: 'jenis_pel'
        });        
    };

    sequelizePaginate.paginate(sanksi_pelanggaran)

    return sanksi_pelanggaran;
};
