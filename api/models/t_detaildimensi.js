/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
    const detaildimensi = sequelize.define('t_detaildimensi', {
        'id': {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        'regu_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'shift_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'petugas_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lokasi_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bptd_id': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },        
        'nama_penguji': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'no_reg_penguji': {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },                        
        'no_form': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'no_pengukuran': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        },
        'kode_trx': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        }, 
        'kode_uppkb': {
            type: DataTypes.STRING(60),
            allowNull: true,
            comment: "null"
        }, 
        'no_kendaraan': {
            type: DataTypes.STRING(30),
            allowNull: true,
            comment: "null"
        },                        
        'tgl_pengukuran': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },                
        'jarak_sb_s1_s2_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s1_s2_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s1_s2_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s1_s2_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s1_s2_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s2_s3_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s2_s3_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s2_s3_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s2_s3_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s2_s3_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s3_s4_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s3_s4_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s3_s4_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s3_s4_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'jarak_sb_s3_s4_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lebar_total_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lebar_total_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lebar_total_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lebar_total_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'lebar_total_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'panjang_total_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'panjang_total_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'panjang_total_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'panjang_total_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'panjang_total_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'tinggi_total_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'tinggi_total_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'tinggi_total_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'tinggi_total_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'tinggi_total_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'foh_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'foh_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'foh_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'foh_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'foh_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'roh_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'roh_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'roh_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'roh_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'roh_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_panjang_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_panjang_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_panjang_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_panjang_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_panjang_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_lebar_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_lebar_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_lebar_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_lebar_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_lebar_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        }, 
        'bbt_tinggi_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_tinggi_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_tinggi_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_tinggi_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'bbt_tinggi_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb1_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb1_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb1_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb1_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb1_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb2_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb2_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb2_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb2_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb2_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb3_uji': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb3_fisik': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb3_sensor': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb3_toleransi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'ban_sb3_kelebihan': {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "null"
        },
        'keterangan_ukur': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'catatan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },        
        'is_melanggar': {
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
        }
    }, {
        tableName: 'jt_detail_dimensi'
    });

    detaildimensi.beforeCreate(dimensi => dimensi.id = uuidv4());

    detaildimensi.associate = function (models) {
        detaildimensi.belongsTo(models.t_lokasi, {
            foreignKey: 'kode_uppkb',
            as: 'detaildimensi_uppkb',
            targetKey:'kode'
        });
        detaildimensi.belongsTo(models.t_kendaraan, {
            foreignKey: 'no_kendaraan',
            as: 'detaildimensi_kendaraan',
            targetKey:'no_reg_kend'
        });
        // detaildimensi.belongsTo(models.t_komoditi, {
        //     foreignKey: 'komoditi_id',
        //     as: 'detaildimensikomoditi'
        // });
    };

    sequelizePaginate.paginate(detaildimensi)

    return detaildimensi;
};
