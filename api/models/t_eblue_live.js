/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function (sequelize, DataTypes) {
    const bluelive = sequelize.define('t_eblue_live', {
        'id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "null",
            primaryKey: true,
            autoIncrement: true
        },
        'source': {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: "null"
        },
        'rfid': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'vcode': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nouji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tgl_uji': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'nama_pemilik': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'alamat_pemilik': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_srut': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tgl_srut': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'tgl_persochip': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'tgl_persovisual': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'tgl_persochip': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'tgl_cetak_sertifikat': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'no_registrasi_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_rangka': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'no_mesin': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jenis_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'merk': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tipe': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tahun_rakit': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'bahan_bakar': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'isi_silinder': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'daya_motor': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'berat_kosong': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'panjang_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'lebar_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'tinggi_kendaraan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'julur_depan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'julur_belakang': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'sumbu': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'jarak_sumbu1_2': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jarak_sumbu2_3': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jarak_sumbu3_4': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'panjang_bak_atau_tangki': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'lebar_bak_atau_tangki': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'tinggi_bak_atau_tangki': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbb': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbkb': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbi': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'jbki': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'daya_angkut_orang': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'daya_angkut_kg': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'kelas_jalan': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'keterangan_hasil_uji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'masa_berlaku': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
        'petugas_penguji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nrp_petugas_penguji': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'kepala_dinas': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'pangkat_kepala_dinas': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nip_kepala_dinas': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'unit_pelaksana_teknis': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'direktur': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'pangkat_direktur': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'nip_direktur': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'id_bptd': {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "null"
        },
        'nama_bptd': {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "null"
        },
        'etl_date': {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "null"
        },
    }, {
        freezeTableName: true,
        timestamps: false,
        tableName: 'jto_eblue_live'
    });


    sequelizePaginate.paginate(bluelive);

    return bluelive;
};
