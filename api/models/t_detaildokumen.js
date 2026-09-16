/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const detaildokumen = sequelize.define('t_detaildokumen', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'kode_trx': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tgl_penimbangan': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },                
        'kode_uppkb': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'dokumen_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_dokumen',
                key: 'id'
            }
        },     
        'status_dokumen': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: "null"
        },    
        'keterangan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'foto_dokumen_url': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        }, 
        'foto_dokumen': {
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
        'deleted_by': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },               
        'is_deleted': {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: "null"
        }
    }, {
        tableName: 'jt_detail_dokumen'
    });

    detaildokumen.beforeCreate(dokumen => dokumen.id = uuidv4());

    detaildokumen.associate = function (models) {
        detaildokumen.belongsTo(models.t_dokumen, {
            foreignKey: 'dokumen_id',
            as: 'detaildokumen'
        });
        detaildokumen.belongsTo(models.t_penimbangan, {
            foreignKey: 'kode_trx',
            as: 'penimbanganDetailDokumen',
            sourceKey:'kode_trx',
        });
    };

    sequelizePaginate.paginate(detaildokumen)

    return detaildokumen;
};
