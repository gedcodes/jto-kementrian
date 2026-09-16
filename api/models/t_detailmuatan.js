/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const detailmuatan = sequelize.define('t_detailmuatan', {
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
        'komoditi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null",
            references: {
                model: 't_komoditi',
                key: 'id'
            }
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
        tableName: 'jt_detail_muatan'
    });
    detailmuatan.beforeCreate(muatan => muatan.id = uuidv4());

    detailmuatan.associate = function (models) {
        detailmuatan.belongsTo(models.t_komoditi, {
            foreignKey: 'komoditi_id',
            as: 'detailmuatankomoditi'
        });
        detailmuatan.belongsTo(models.t_penimbangan, {
            foreignKey: 'kode_trx',
            as: 'penimbanganDetailMuatan',
            sourceKey: 'kode_trx',
        });
    };

    sequelizePaginate.paginate(detailmuatan)

    return detailmuatan;
};
