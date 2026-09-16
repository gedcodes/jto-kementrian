const { t_jenis_kendaraan, t_sumbu, sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const blue = 'BLUE'
const moment = require('moment');

const padLeft = (num, size) => {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

const getKodeKota = async () => {
    var sql = `SELECT kode FROM jt_kota_kab WHERE is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var kode = result[0].kode;

        return kode;
    } else {
        return 0;
    }
}

exports.hex2a = (hexx) => {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

exports.getNamaKegiatan = async (id) => {
    var sql = `SELECT nama FROM jt_kegiatan WHERE id = ${id} AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var nama = result[0].nama;

        return nama;
    } else {
        return 0;
    }
}

exports.getNamaKategoriAset = async (id) => {
    var sql = `SELECT nama FROM jt_kategori_aset WHERE id = ${id} AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var nama = result[0].nama;

        return nama;
    } else {
        return 0;
    }
}

const getGenCodeUppkb = async (kode_uppkb) => {
    var sql = `SELECT
                    jt_lokasi_uppkb.id, 
                    jt_bptd.kode || '.' || jt_kota_kab.kode || '.' || jt_lokasi_uppkb.kode AS gen_kode
                FROM
                    jt_lokasi_uppkb
                    INNER JOIN jt_kota_kab ON (jt_lokasi_uppkb.kota_kab_id = jt_kota_kab.id)
                    INNER JOIN jt_provinsi ON (jt_kota_kab.provinsi_id = jt_provinsi.id)
                    INNER JOIN jt_bptd ON (jt_provinsi.bptd_id = jt_bptd.id)
                WHERE jt_lokasi_uppkb.kode = '${kode_uppkb}' AND jt_lokasi_uppkb.is_active = TRUE AND jt_lokasi_uppkb.is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var kode = result[0].gen_kode;

        return kode;
    } else {
        return 0;
    }
}

const setNoUrutTrx = async (tgl_trx) => {
    var month = moment(tgl_trx).format('MM');
    var year = moment(tgl_trx).format('YYYY');
    var sql = `SELECT count(*) AS jml FROM jt_penimbangan WHERE EXTRACT(MONTH FROM tgl_penimbangan) = '${month}' AND EXTRACT(YEAR FROM tgl_penimbangan) = '${year}'`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var no_urut = Number(result[0].jml) + 1;

        console.log('JUMLAH : ', result[0].jml, no_urut);

        return no_urut;
    } else {
        return 0;
    }
}

exports.getKorsatpel = async (lokasi_id) => {
    var sql = `SELECT * FROM jt_petugas WHERE lokasi_id = ${lokasi_id} AND is_korsatpel = true AND is_active = true and is_deleted = false`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return [];
    }
}

exports.getKorsatpelByKode = async (kode) => {
    var sql = `SELECT * FROM jt_petugas WHERE kode_uppkb = '${kode}' AND is_korsatpel = true AND is_active = true and is_deleted = false`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return [];
    }
}

exports.getPpns = async (lokasi_id) => {
    var sql = `SELECT * FROM jt_petugas WHERE lokasi_id = ${lokasi_id} AND is_ppns = true AND is_active = true and is_deleted = false`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return [];
    }
}

exports.getPenguji = async (lokasi_id) => {
    var sql = `SELECT * FROM jt_petugas WHERE lokasi_id = ${lokasi_id} AND is_penguji = true AND is_active = true and is_deleted = false`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return [];
    }
}

exports.getDanru = async (lokasi_id, regu_id) => {
    var sql = `SELECT * FROM jt_petugas WHERE lokasi_id = ${lokasi_id} AND regu_id = ${regu_id} AND is_danru = true AND is_active = true and is_deleted = false`;
    console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return [];
    }
}

exports.getOperator = async (lokasi_id, regu_id, petugas_id) => {
    var sql = `SELECT * FROM jt_petugas WHERE lokasi_id = ${lokasi_id} AND regu_id = ${regu_id} AND petugas_id = ${petugas_id} AND is_active = true and is_deleted = false`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return [];
    }
}

exports.getBptdId = async (kode) => {
    var sql = `SELECT bptd_id FROM jt_lokasi_uppkb WHERE kode = '${kode}' AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var id = result[0].bptd_id;

        return Number(id);
    } else {
        return 0;
    }
}

exports.getNamaBptd = async (id) => {
    var sql = `SELECT nama FROM jt_bptd WHERE id = '${id}' AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var nama = result[0].nama;

        return nama;
    } else {
        return 0;
    }
}

exports.getLokasiUppkbId = async (kode) => {
    var sql = `SELECT id FROM jt_lokasi_uppkb WHERE kode = '${kode}' AND is_active = TRUE and is_deleted = FALSE`;
    console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var id = result[0].id;

        return Number(id);
    } else {
        return 0;
    }
}

exports.getLokasiUppkbKode = async (id) => {
    var sql = `SELECT kode FROM jt_lokasi_uppkb WHERE id = ${id} AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var kode = result[0].kode;

        return kode;
    } else {
        return 0;
    }
}

exports.getLokasiUppkbNama = async (kode) => {
    var sql = `SELECT nama FROM jt_lokasi_uppkb WHERE kode = '${kode}' AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var nama = result[0].nama;

        return nama;
    } else {
        return 0;
    }
}

exports.getNamaLokasiById = async (id) => {
    var sql = `SELECT nama FROM jt_lokasi_uppkb WHERE kode = '${kode}' AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var nama = result[0].nama;

        return nama;
    } else {
        return 0;
    }
}

exports.getKejaksaanKode = async (id) => {
    var sql = `SELECT kode FROM jt_kejaksaan WHERE id = ${id} AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var kode = result[0].kode;

        return kode;
    } else {
        return 0;
    }
}

exports.getPengadilanKode = async (id) => {
    var sql = `SELECT kode FROM jt_pengadilan WHERE id = ${id} AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var kode = result[0].kode;

        return kode;
    } else {
        return 0;
    }
}

exports.getIdKomoditi = async (komoditiarr) => {
    var arr = [];
    if (komoditiarr.length > 0) {
        for (var i = 0; i < komoditiarr.length; i++) {
            var komo = komoditiarr[i].load_commodity_name.toUpperCase();
            var sql = `SELECT * FROM jt_komoditi WHERE nama = '${komo}' AND is_active = true AND is_deleted = false;`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result.length > 0) {
                var data = {
                    value: result[0].id,
                    label: result[0].nama
                };

                arr.push(data);
            }
        }
    }

    return arr;
}

exports.getDokumenKode = async (arrid) => {
    var arr = [];
    if (arrid.length > 0) {
        for (var i = 0; i < arrid.length; i++) {
            var sql = `SELECT kode FROM jt_dokumen WHERE id = ${arrid[i]} AND is_active = TRUE and is_deleted = FALSE`;
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result.length > 0) {
                var kode = result[0].kode;
                arr.push(kode);
            }
        }
    }

    return arr;
}

exports.getDokumenKodeSitaan = async (arrid) => {
    var arr = [];
    if (arrid.length > 0) {
        for (var i = 0; i < arrid.length; i++) {
            var sql = `SELECT 
                            jt_dokumen.kode,
                            jt_dokumen.nama,
                            jt_detail_penindakan_sitaan.kode_penindakan,
                            jt_detail_penindakan_sitaan.no_kendaraan,
                            jt_detail_penindakan_sitaan.sitaan_id
                        FROM
                            jt_detail_penindakan_sitaan
                        INNER JOIN jt_sitaan ON (jt_detail_penindakan_sitaan.sitaan_id = jt_sitaan.id)
                        INNER JOIN jt_dokumen ON (jt_sitaan.dokumen_id = jt_dokumen.id)
                        WHERE jt_detail_penindakan_sitaan.sitaan_id = ${arrid[i]} AND jt_detail_penindakan_sitaan.is_deleted = false`;
            // var sql = `SELECT kode FROM jt_dokumen WHERE id = ${arrid[i]} AND is_active = TRUE and is_deleted = FALSE`;
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result.length > 0) {
                var kode = result[0].kode;
                arr.push(kode);
            }
        }
    }

    return arr;
}

exports.getEtilangId = async (arrid) => {
    var arr = [];
    if (arrid.length > 0) {
        for (var i = 0; i < arrid.length; i++) {
            var sql = `SELECT etilang_id FROM jt_pasal WHERE id = ${arrid[i]} AND is_active = TRUE and is_deleted = FALSE`;
            console.log(sql);
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result.length > 0 && result[0].etilang_id !== null) {
                var etilang_id = result[0].etilang_id;
                arr.push(etilang_id);
            }
        }
    }

    return arr;
}

exports.getKendaraan = async (no_reg_kend) => {
    var sql = `SELECT jenis_kend, merek FROM jt_kendaraan WHERE no_reg_kend = '${no_reg_kend}' AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result;
    } else {
        return 0;
    }
}

exports.getLokasiUppkbById = async (id) => {
    var sql = `SELECT jt_lokasi_uppkb.id, jt_lokasi_uppkb.kode, jt_lokasi_uppkb.nama, jt_lokasi_uppkb.alamat_uppkb, jt_bptd.kode as kode_bptd, jt_bptd.nama as nama_bptd, jt_bptd.alamat as alamat_bptd FROM jt_lokasi_uppkb INNER JOIN jt_bptd ON (jt_lokasi_uppkb.bptd_id = jt_bptd.id) WHERE jt_lokasi_uppkb.id = ${id} AND jt_lokasi_uppkb.is_active = TRUE and jt_lokasi_uppkb.is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return '-';
    }
}

exports.getExistKodeTrxById = async (id) => {
    var sql = `SELECT kode_trx FROM jt_penimbangan WHERE jt_penimbangan.id = '${id}'`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0].kode_trx;
    } else {
        return '-';
    }
}

exports.getWilayahLokasiUppkbById = async (id) => {
    var sql = `SELECT 
                    jt_lokasi_uppkb.id AS id_uppkb,
                    jt_lokasi_uppkb.kode AS kode_uppkb,
                    jt_lokasi_uppkb.nama AS nama_uppkb,
                    jt_provinsi.id AS id_provinsi,
                    jt_kota_kab.id AS id_kota_kab,
                    jt_kota_kab.kode AS kode_kota,
                    jt_kota_kab.nama AS nama_kota,
                    jt_provinsi.kode AS kode_provinsi,
                    jt_provinsi.nama AS nama_provinsi
                FROM
                    jt_lokasi_uppkb
                    INNER JOIN jt_kota_kab ON (jt_lokasi_uppkb.kota_kab_id = jt_kota_kab.id)
                    INNER JOIN jt_provinsi ON (jt_kota_kab.provinsi_id = jt_provinsi.id)
                WHERE jt_lokasi_uppkb.id = ${id} AND jt_lokasi_uppkb.is_active = TRUE and jt_lokasi_uppkb.is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return '-';
    }
}

exports.getIsIntegrasiEtilang = async (kode) => {
    var sql = `SELECT is_integrasi_etilang FROM jt_lokasi_uppkb WHERE kode = '${kode}' AND is_active = TRUE and is_deleted = FALSE AND is_integrasi_etilang = TRUE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return true;
    } else {
        return false;
    }
}

const wilayahLokasiUppkbByKodeUppkb = async (kode) => {
    var sql = `SELECT 
                    jt_lokasi_uppkb.id AS id_uppkb,
                    jt_lokasi_uppkb.kode AS kode_uppkb,
                    jt_lokasi_uppkb.nama AS nama_uppkb,
                    jt_provinsi.id AS id_provinsi,
                    jt_kota_kab.id AS id_kota_kab,
                    jt_kota_kab.kode AS kode_kota,
                    jt_kota_kab.nama AS nama_kota,
                    jt_provinsi.kode AS kode_provinsi,
                    jt_provinsi.nama AS nama_provinsi
                FROM
                    jt_lokasi_uppkb
                    INNER JOIN jt_kota_kab ON (jt_lokasi_uppkb.kota_kab_id = jt_kota_kab.id)
                    INNER JOIN jt_provinsi ON (jt_kota_kab.provinsi_id = jt_provinsi.id)
                WHERE jt_lokasi_uppkb.kode = '${kode}' AND jt_lokasi_uppkb.is_active = TRUE and jt_lokasi_uppkb.is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return '-';
    }
}

exports.getWilayahLokasiUppkbByKodeUppkb = async (kode) => {
    var sql = `SELECT 
                    jt_lokasi_uppkb.id AS id_uppkb,
                    jt_lokasi_uppkb.kode AS kode_uppkb,
                    jt_lokasi_uppkb.nama AS nama_uppkb,
                    jt_provinsi.id AS id_provinsi,
                    jt_kota_kab.id AS id_kota_kab,
                    jt_kota_kab.kode AS kode_kota,
                    jt_kota_kab.nama AS nama_kota,
                    jt_provinsi.kode AS kode_provinsi,
                    jt_provinsi.nama AS nama_provinsi
                FROM
                    jt_lokasi_uppkb
                    INNER JOIN jt_kota_kab ON (jt_lokasi_uppkb.kota_kab_id = jt_kota_kab.id)
                    INNER JOIN jt_provinsi ON (jt_kota_kab.provinsi_id = jt_provinsi.id)
                WHERE jt_lokasi_uppkb.kode = '${kode}' AND jt_lokasi_uppkb.is_active = TRUE and jt_lokasi_uppkb.is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return '-';
    }
}

exports.genCodeTrxPenimbangan = async (kode_uppkb, tgl_trx, no_kendaraan) => {
    var uppkb = await getGenCodeUppkb(kode_uppkb);
    var tgl = moment().format('MMYY');
    var no_urut = await setNoUrutTrx(tgl_trx);
    var duppkb = await wilayahLokasiUppkbByKodeUppkb(kode_uppkb);
    const d = new Date();
    let ms = d.valueOf().toString();
    var val = Math.floor(1000 + Math.random() * 9000);
    return `T01${val}${no_kendaraan}/${kode_uppkb}${padLeft(no_urut, 5)}/${tgl}`;
}

exports.getShift = async (id) => {
    var sql = `SELECT 
                *
              FROM jt_shift 
              WHERE id = ${id} AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return '';
    }
}

exports.getRegu = async (id) => {
    var sql = `SELECT * FROM jt_regu WHERE id = ${id} AND is_active = TRUE and is_deleted = FALSE`;
    // console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return '';
    }
}

exports.getSanksi = async (id) => {
    var sql = `SELECT * FROM jt_sanksi WHERE id = ${id} AND is_active = TRUE and is_deleted = FALSE`;
    // console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return '';
    }
}


const setNoUrutTrxPenindakan = async (tgl_trx) => {
    var month = moment(tgl_trx).format('MM');
    var year = moment(tgl_trx).format('YYYY');
    var sql = `SELECT count(*) AS jml FROM jt_penindakan WHERE EXTRACT(MONTH FROM tgl_penindakan) = '${month}' AND EXTRACT(YEAR FROM tgl_penindakan) = '${year}'`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var no_urut = Number(result[0].jml) + 1;

        //console.log('JUMLAH : ', no_urut);

        return no_urut;
    } else {
        return 0;
    }
}
exports.genCodeTrxPenindakan = async (kode_uppkb, tgl_trx, no_kendaraan) => {
    // var uppkb = await getGenCodeUppkb(kode_uppkb);
    var tgl = moment().format('MMYY');
    var no_urut = await setNoUrutTrxPenindakan(tgl_trx);
    //console.log('KODE TRX : ', `${uppkb}.${tgl}.${padLeft(no_urut,4)}`);
    var val = Math.floor(1000 + Math.random() * 9000);
    return `T02${val}${no_kendaraan}/${kode_uppkb}${padLeft(no_urut, 5)}/${tgl}`;
}

const setNoUrutTransferMuat = async (tgl_trx) => {
    var month = moment(tgl_trx).format('MM');
    var sql = `SELECT count(*) AS jml FROM jt_transfer_muat WHERE EXTRACT(MONTH FROM tgl_transfer_muat) = ${month}`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var no_urut = Number(result[0].jml) + 1;

        //console.log('JUMLAH : ', no_urut);

        return no_urut;
    } else {
        return 0;
    }
}
exports.genCodeTrxTransferMuat = async (kode_uppkb, tgl_trx, no_kendaraan) => {
    // var uppkb = await getGenCodeUppkb(kode_uppkb);
    var tgl = moment().format('MMYY');
    var no_urut = await setNoUrutTransferMuat(tgl_trx);
    var val = Math.floor(1000 + Math.random() * 9000);
    //console.log('KODE TRX : ', `${uppkb}.${tgl}.${padLeft(no_urut,4)}`);
    return `T03${val}${no_kendaraan}/${kode_uppkb}${padLeft(no_urut, 5)}/${tgl}`;
}

exports.getKategoriKomoditi = async (komoditi_id) => {
    var sql = `SELECT 
                jt_toleransi_komoditi.id,
                jt_toleransi_komoditi.kategori_komoditi_id,
                jt_toleransi_komoditi.prosen_toleransi,
                jt_toleransi_komoditi.tgl_mulai,
                jt_toleransi_komoditi.tgl_selesai,
                jt_toleransi_komoditi.durasi,
                jt_kategori_komoditi.kode AS kode_kategori_komoditi,
                jt_kategori_komoditi.nama AS nama_kategori_komoditi,
                jt_komoditi.kode AS kode_komoditi,
                jt_komoditi.nama AS nama_komoditi
            FROM
                jt_toleransi_komoditi
                INNER JOIN jt_kategori_komoditi ON (jt_toleransi_komoditi.kategori_komoditi_id = jt_kategori_komoditi.id)
                INNER JOIN jt_komoditi ON (jt_kategori_komoditi.id = jt_komoditi.kategori_komoditi_id)
            WHERE jt_komoditi.id = ${komoditi_id} AND jt_toleransi_komoditi.is_active = true AND jt_toleransi_komoditi.is_deleted = false;`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    //console.log(result)
    if (Object.keys(result).length > 0) {
        // var arr = [];
        // for(var row of result){
        //     arr.push(row);
        // }
        return result[0];
    } else {
        return 5;
    }
}

exports.getProsenKategoriKomoditi = async (komoditi_id) => {
    var sql = `SELECT 
                jt_toleransi_komoditi.id,
                jt_toleransi_komoditi.kategori_komoditi_id,
                jt_toleransi_komoditi.prosen_toleransi,
                jt_toleransi_komoditi.tgl_mulai,
                jt_toleransi_komoditi.tgl_selesai,
                jt_toleransi_komoditi.durasi,
                jt_kategori_komoditi.kode AS kode_kategori_komoditi,
                jt_kategori_komoditi.nama AS nama_kategori_komoditi,
                jt_komoditi.kode AS kode_komoditi,
                jt_komoditi.nama AS nama_komoditi
            FROM
                jt_toleransi_komoditi
                INNER JOIN jt_kategori_komoditi ON (jt_toleransi_komoditi.kategori_komoditi_id = jt_kategori_komoditi.id)
                INNER JOIN jt_komoditi ON (jt_kategori_komoditi.id = jt_komoditi.kategori_komoditi_id)
            WHERE jt_komoditi.id = ${komoditi_id} AND DATE(jt_toleransi_komoditi.tgl_selesai) > DATE(NOW()) AND jt_toleransi_komoditi.is_active = true AND jt_toleransi_komoditi.is_deleted = false;`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    // console.log(result.length);
    if (result) {
        if (result.length > 0) {
            // var arr = [];
            // for(var row of result){
            //     arr.push(row);
            // }
            return result[0];// .prosen_toleransi;
        } else {
            return 5;
        }
    } else {
        return 5;
    }
}

exports.getOptionResponKomoditi = async (komoditi_id) => {
    if (komoditi_id) {
        var sql = `SELECT *
            FROM
                jt_komoditi
            WHERE jt_komoditi.id = ANY(ARRAY[${komoditi_id}]) AND jt_komoditi.is_active = true AND jt_komoditi.is_deleted = false;`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        // console.log(result.length);
        if (result) {
            if (result.length > 0) {
                var arr = [];
                for (var row of result) {
                    arr.push({
                        value: row.id,
                        label: row.nama
                    });
                }
                return arr;// .prosen_toleransi;
            } else {
                return [];
            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}

exports.getHistori = async (no_kendaraan) => {
    var sql = `SELECT 
                kode_trx,
                tgl_penimbangan,
                no_surat_jalan,
                asal_kota_id,
                tujuan_kota_id,
                pemilik_komoditi,
                alamat_pemilik_komoditi
            FROM 
                jt_penimbangan
            WHERE no_kendaraan = '${no_kendaraan}' AND is_transaksi = 1 ORDER BY tgl_penimbangan DESC LIMIT 10`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result; //.prosen_toleransi;
    } else {
        return [];
    }
}

exports.getKomoditiByTrx = async (kode_trx) => {
    var sql = `SELECT
                jk.id,
                jk.kode,
                jk.nama
            FROM
                jt_detail_muatan jm
                INNER JOIN jt_komoditi jk ON jk.id = jm.komoditi_id
            WHERE jm.kode_trx = '${kode_trx}'`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result; //.prosen_toleransi;
    } else {
        return [];
    }
}

exports.getKotaById = async (kota_id) => {
    var sql = `SELECT nama FROM jt_kota_kab WHERE id = ${kota_id}`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result[0].nama; //.prosen_toleransi;
    } else {
        return [];
    }
}

exports.getValKomoditi = async (komoditi_id) => {
    var sql = `SELECT 
                jt_komoditi.id,
                jt_komoditi.kategori_komoditi_id,
                jt_komoditi.kode,
                jt_komoditi.nama,
                jt_komoditi.is_active,
                jt_kategori_komoditi.kode as kode_kategori_komoditi,
                jt_kategori_komoditi.nama as nama_kategori_komoditi
            FROM
                jt_komoditi
                INNER JOIN jt_kategori_komoditi ON (jt_komoditi.kategori_komoditi_id = jt_kategori_komoditi.id)
            WHERE 
                jt_komoditi.id = ${komoditi_id} AND 
                jt_komoditi.is_active = true AND 
                jt_komoditi.is_deleted = false`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result[0]; //.prosen_toleransi;
    } else {
        return [];
    }
}

exports.getKomoditi = async (komoditi_id) => {
    var sql = `SELECT *
                FROM
                  jt_komoditi
                WHERE jt_komoditi.id = ${komoditi_id}`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result[0]; //.prosen_toleransi;
    } else {
        return null;
    }
}

exports.getProsenToleransiUppkbKomoditi = async (kode_uppkb, komoditi_id) => {
    var sql = `SELECT 
                    jt_toleransi_uppkb.id,
                    jt_toleransi_uppkb.toleransi_id,
                    jt_toleransi_uppkb.keterangan,
                    jt_lokasi_uppkb.kode as kode_uppkb,
                    jt_lokasi_uppkb.nama as nama_uppkb,
                    jt_toleransi.kode as kode_toleransi,
                    jt_toleransi.nama as nama_toleransi,
                    jt_toleransi.prosen_toleransi,
                    jt_komoditi.id as komoditi_id,
                    jt_komoditi.kategori_komoditi_id,
                    jt_komoditi.kode as kode_komoditi,
                    jt_komoditi.nama as nama_komoditi,
                    jt_kategori_komoditi.kode as kode_kategori_komoditi,
                    jt_kategori_komoditi.nama as nama_kategori_komoditi
                FROM
                    jt_toleransi_uppkb
                    INNER JOIN jt_toleransi ON (jt_toleransi_uppkb.toleransi_id = jt_toleransi.id)
                    INNER JOIN jt_komoditi ON (jt_toleransi_uppkb.komoditi_id = jt_komoditi.id)
                    INNER JOIN jt_kategori_komoditi ON (jt_komoditi.kategori_komoditi_id = jt_kategori_komoditi.id)
                    INNER JOIN jt_lokasi_uppkb ON (jt_toleransi_uppkb.lokasi_id = jt_lokasi_uppkb.id)
                WHERE jt_lokasi_uppkb.kode = '${kode_uppkb}' AND jt_komoditi.id = ${komoditi_id}`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result[0]; //.prosen_toleransi;
    } else {
        return 5;
    }
}

exports.getToleransiUppkbKomoditi = async (kode_uppkb, komoditi_id) => {
    var sql = `SELECT 
                    jt_toleransi_uppkb.id,
                    jt_toleransi_uppkb.toleransi_id,
                    jt_toleransi_uppkb.keterangan,
                    jt_lokasi_uppkb.kode as kode_uppkb,
                    jt_lokasi_uppkb.nama as nama_uppkb,
                    jt_toleransi.kode as kode_toleransi,
                    jt_toleransi.nama as nama_toleransi,
                    jt_toleransi.prosen_toleransi,
                    jt_komoditi.kategori_komoditi_id,
                    jt_komoditi.kode as kode_komoditi,
                    jt_komoditi.nama as nama_komoditi,
                    jt_kategori_komoditi.kode as kode_kategori_komoditi,
                    jt_kategori_komoditi.nama as nama_kategori_komoditi
                FROM
                    jt_toleransi_uppkb
                    INNER JOIN jt_toleransi ON (jt_toleransi_uppkb.toleransi_id = jt_toleransi.id)
                    INNER JOIN jt_komoditi ON (jt_toleransi_uppkb.komoditi_id = jt_komoditi.id)
                    INNER JOIN jt_kategori_komoditi ON (jt_komoditi.kategori_komoditi_id = jt_kategori_komoditi.id)
                    INNER JOIN jt_lokasi_uppkb ON (jt_toleransi_uppkb.lokasi_id = jt_lokasi_uppkb.id)
                WHERE jt_lokasi_uppkb.kode = '${kode_uppkb}' AND jt_komoditi.id = ${komoditi_id}`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result[0];
    } else {
        return 5;
    }
}

exports.getDokumen = async (dokumen) => {
    var sql = `SELECT * FROM jt_dokumen WHERE is_active = true AND is_deleted = false ORDER BY id ASC`;
    var result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    var arrdokumen = dokumen ? dokumen.split(',') : [];
    if (arrdokumen.length > 0) {
        arrdokumen.sort((a, b) => {
            return a - b;
        })
    }
    if (Object.keys(result).length > 0) {
        var arrDok = [];
        for (var i = 0; i < Object.keys(result).length; i++) {
            if (Number(arrdokumen[i]) == Number(result[i].id)) {
                arrDok.push(1);
            } else {
                // console.log(result[i].id,' = ',arrdokumen[i]);
                arrDok.push(0);
            }
        }

        return arrDok;
    } else {
        return 0;
    }
}

exports.getToleransiDimensi = async (panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur) => {
    var sql = `SELECT * FROM jt_toleransi_dimensi WHERE is_active = true AND is_deleted = false ORDER BY id ASC`;
    var result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        var toleransi_panjang = Math.ceil((Number(panjang_uji) * (result[0].prosen_pjg / 100)) + Number(panjang_uji));
        var toleransi_lebar = Math.ceil((Number(lebar_uji) * (result[0].prosen_lebar / 100)) + Number(lebar_uji));
        var toleransi_tinggi = Math.ceil((Number(tinggi_uji) * (result[0].prosen_tinggi / 100)) + Number(tinggi_uji));
        var toleransi_foh = Math.ceil((Number(foh_uji) * (result[0].prosen_foh / 100)) + Number(foh_uji));
        var toleransi_roh = Math.ceil((Number(roh_uji) * (result[0].prosen_roh / 100)) + Number(roh_uji));

        var kelebihan_panjang = Math.ceil(Number(panjang_ukur) - Number(toleransi_panjang));
        var kelebihan_lebar = Math.ceil(Number(lebar_ukur) - Number(toleransi_lebar));
        var kelebihan_tinggi = Math.ceil(Number(tinggi_ukur) - Number(toleransi_tinggi));
        var kelebihan_foh = Math.ceil(Number(foh_ukur) - Number(toleransi_foh));
        var kelebihan_roh = Math.ceil(Number(roh_ukur) - Number(toleransi_roh));

        var prosen_kelebihan_panjang = Math.ceil((kelebihan_panjang / Number(panjang_uji)) * 100);
        var prosen_kelebihan_lebar = Math.ceil((kelebihan_lebar / Number(lebar_uji)) * 100);
        var prosen_kelebihan_tinggi = Math.ceil((kelebihan_tinggi / Number(tinggi_uji)) * 100);
        var prosen_kelebihan_foh = Math.ceil((kelebihan_foh / Number(foh_uji)) * 100);
        var prosen_kelebihan_roh = Math.ceil((kelebihan_roh / Number(roh_uji)) * 100);

        var result_toleransi_dimensi = {
            prosen_toleransi_panjang: result[0].prosen_pjg,
            prosen_toleransi_lebar: result[0].prosen_lebar,
            prosen_toleransi_tinggi: result[0].prosen_tinggi,
            prosen_toleransi_foh: result[0].prosen_foh,
            prosen_toleransi_roh: result[0].prosen_roh,
            toleransi_panjang: toleransi_panjang,
            toleransi_lebar: toleransi_lebar,
            toleransi_tinggi: toleransi_tinggi,
            toleransi_foh: toleransi_foh,
            toleransi_roh: toleransi_roh,
            kelebihan_panjang: kelebihan_panjang,
            kelebihan_lebar: kelebihan_lebar,
            kelebihan_tinggi: kelebihan_tinggi,
            kelebihan_foh: kelebihan_foh,
            kelebihan_roh: kelebihan_roh,
            prosen_kelebihan_panjang: prosen_kelebihan_panjang,
            prosen_kelebihan_lebar: prosen_kelebihan_lebar,
            prosen_kelebihan_tinggi: prosen_kelebihan_tinggi,
            prosen_kelebihan_foh: prosen_kelebihan_foh,
            prosen_kelebihan_roh: prosen_kelebihan_roh,
        }

        return result_toleransi_dimensi;
    } else {
        return 0;
    }
}

exports.getPelanggaranDimensi = async (panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur) => {
    var sql = `SELECT * FROM jt_toleransi_dimensi WHERE is_active = true AND is_deleted = false ORDER BY id ASC`;
    var result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        // var toleransi_panjang = Math.ceil((panjang_uji * (result[0].prosen_pjg/100)) + panjang_uji);
        // var toleransi_lebar = Math.ceil((lebar_uji * (result[0].prosen_lebar/100)) + lebar_uji);
        // var toleransi_tinggi = Math.ceil((tinggi_uji * (result[0].prosen_tinggi/100)) + tinggi_uji);
        // var toleransi_foh = Math.ceil((foh_uji * (result[0].prosen_foh/100)) + foh_uji);
        // var toleransi_roh = Math.ceil((roh_uji * (result[0].prosen_roh/100)) + roh_uji);

        var kelebihan_panjang = Math.ceil(Number(panjang_ukur) - Number(panjang_uji));
        var kelebihan_lebar = Math.ceil(Number(lebar_ukur) - Number(lebar_uji));
        var kelebihan_tinggi = Math.ceil(Number(tinggi_ukur) - Number(tinggi_uji));
        var kelebihan_foh = Math.ceil(Number(foh_ukur) - Number(foh_uji));
        var kelebihan_roh = Math.ceil(Number(roh_ukur) - Number(roh_uji));

        var prosen_kelebihan_panjang = Math.ceil((Number(kelebihan_panjang) / Number(panjang_uji)) * 100);
        var prosen_kelebihan_lebar = Math.ceil((Number(kelebihan_lebar) / Number(lebar_uji)) * 100);
        var prosen_kelebihan_tinggi = Math.ceil((Number(kelebihan_tinggi) / Number(tinggi_uji)) * 100);
        var prosen_kelebihan_foh = Math.ceil((Number(kelebihan_foh) / Number(foh_uji)) * 100);
        var prosen_kelebihan_roh = Math.ceil((Number(kelebihan_roh) / Number(roh_uji)) * 100);

        var pelanggaran_dimensi = false;
        if (prosen_kelebihan_panjang > result[0].prosen_pjg) {
            pelanggaran_dimensi = false;
        }

        if (prosen_kelebihan_lebar > result[0].prosen_lebar) {
            pelanggaran_dimensi = false;
        }

        if (prosen_kelebihan_tinggi > result[0].prosen_tinggi) {
            pelanggaran_dimensi = false;
        }

        if (prosen_kelebihan_foh > result[0].prosen_foh) {
            pelanggaran_dimensi = false;
        }

        if (prosen_kelebihan_roh > result[0].prosen_roh) {
            pelanggaran_dimensi = false;
        }

        return pelanggaran_dimensi;
    } else {
        return 0;
    }
}

exports.getJenisKendaraanId = async (jenis_kendaraan) => {
    var res_jenis_kendaraan = await JenisKendaraanId(jenis_kendaraan);

    return res_jenis_kendaraan;
    // if (res_jenis_kendaraan == 0) {
    //     var insert = await insert_jenis_kendaraan(jenis_kendaraan);

    //     if(insert == 1){
    //         return res_jenis_kendaraan;
    //     }        
    // } else {
    //     return res_jenis_kendaraan;
    // }
}

const JenisKendaraanId = async (jenis_kendaraan) => {
    // console.log('JENIS KENDARAAN : ', jenis_kendaraan);
    var jenis_kend = jenis_kendaraan.toUpperCase();
    console.log('DATA JENIS KENDARAAN : ', jenis_kend);
    var sql = `SELECT * FROM jt_jenis_kendaraan WHERE upper(nama) = '${jenis_kend}' AND is_active = true AND is_deleted = false`;
    // console.log('SQL JENIS KENDARAAN ID: ', sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        // console.log('DATA JENIS KENDARAAN ID : ', result[0].id);
        return result[0].id;
    } else {
        return 0;
    }
}

const setNoUrutJenisKendaraan = async () => {
    var sql = `SELECT MAX(id) AS mid FROM jt_jenis_kendaraan`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var mid = Number(result[0].mid) + 1;

        //console.log('JUMLAH : ', no_urut);

        return mid;
    } else {
        return 1;
    }
}

const insert_jenis_kendaraan = async (nama) => {

    try {
        var no_urut = await setNoUrutJenisKendaraan();
        var kode = `JK${no_urut}`;
        var jenis_kendaraan = nama.toUpperCase();

        return sequelize.transaction().then(function (t) {
            return t_jenis_kendaraan.create({
                kode: kode,
                nama: jenis_kendaraan
            }, { transaction: t }).then(async (data) => {
                try {
                    t.commit();
                    return data.id;
                } catch (error) {
                    t.rollback();
                    return 0;
                }
            });
        });
    } catch (error) {
        console.log(error);
        return error;
    }
}

exports.getSumbuId = async (konfig_sumbu) => {
    var res_sumbu = await SumbuId(konfig_sumbu);
    return res_sumbu;
    // if (res_sumbu == 0) {
    //     var insert = await insert_sumbu(konfig_sumbu);

    //     return insert;       
    // } else {
    //     return res_sumbu;
    // }
}

const SumbuId = async (konfig_sumbu) => {
    const konfig_sumbu_clean = konfig_sumbu.replace(/\s/g, '');
    console.log('DATA SUMBU : ', konfig_sumbu_clean);
    
    // 1. Cari exact match terlebih dahulu
    var sql = `SELECT * FROM jt_sumbu WHERE REPLACE(konfig_sumbu, ' ', '') = '${konfig_sumbu_clean}' AND is_active = true AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result[0].id;
    } else {
        return 0;
        // 2. Jika tidak ditemukan exact match, cari yang paling mendekati
        // console.log('Exact match tidak ditemukan, mencari konfigurasi terdekat...');
        // return await findClosestSumbu(konfig_sumbu_clean);
    }
}

exports.findClosestSumbu = async (konfig_sumbu_clean) => {
    try {
        // Ambil semua data sumbu yang aktif
        const allSumbu = await sequelize.query(
            `SELECT * FROM jt_sumbu WHERE is_active = true AND is_deleted = false`,
            { type: QueryTypes.SELECT, logging: false }
        );

        if (allSumbu.length === 0) {
            return 0;
        }

        // Normalisasi input: hilangkan spasi dan titik, ubah ke format standar
        const normalizedInput = normalizeSumbu(konfig_sumbu_clean);
        
        let bestMatch = null;
        let bestScore = 0;

        // Cari yang paling mirip
        for (const sumbu of allSumbu) {
            const normalizedDB = normalizeSumbu(sumbu.konfig_sumbu.replace(/\s/g, ''));
            const similarity = calculateSumbuSimilarity(normalizedInput, normalizedDB);
            
            if (similarity > bestScore) {
                bestScore = similarity;
                bestMatch = sumbu;
            }
        }

        // Jika similarity score cukup tinggi (misal > 0.7), gunakan match tersebut
        if (bestMatch && bestScore > 0.7) {
            console.log(`Menggunakan konfigurasi terdekat: ${bestMatch.konfig_sumbu} (score: ${bestScore.toFixed(2)})`);
            return {
                sumbu_id: bestMatch.id,
                sumbu: bestMatch.konfig_sumbu
            };
        }

        console.log('Tidak ditemukan konfigurasi sumbu yang sesuai');
        return 0;

    } catch (error) {
        console.error('Error dalam pencarian konfigurasi sumbu:', error);
        return 0;
    }
}

const normalizeSumbu = (sumbuStr) => {
    // Normalisasi format: hilangkan spasi, ubah berbagai pemisah menjadi titik
    return sumbuStr
        .replace(/\s/g, '') // Hapus spasi
        .replace(/[-,]/g, '.') // Ubah koma dan dash menjadi titik
        .replace(/\.+/g, '.') // Hapus titik berulang
        .replace(/^\.|\.$/g, ''); // Hapus titik di awal dan akhir
}

const calculateSumbuSimilarity = (input, dbSumbu) => {
    // Simple similarity calculation based on string matching
    if (input === dbSumbu) return 1.0;
    
    // Cek jika salah satu mengandung yang lain
    if (dbSumbu.includes(input) || input.includes(dbSumbu)) {
        return 0.8;
    }
    
    // Split by dots untuk perbandingan per angka
    const inputParts = input.split('.');
    const dbParts = dbSumbu.split('.');
    
    let matchCount = 0;
    const minLength = Math.min(inputParts.length, dbParts.length);
    
    for (let i = 0; i < minLength; i++) {
        if (inputParts[i] === dbParts[i]) {
            matchCount++;
        }
    }
    
    return matchCount / Math.max(inputParts.length, dbParts.length);
}

// Alternatif lebih sederhana jika ingin logic yang lebih straightforward
const findClosestSumbuSimple = async (konfig_sumbu_clean) => {
    try {
        // Query untuk mencari yang mengandung pattern yang mirip
        const similarSumbu = await sequelize.query(
            `SELECT * FROM jt_sumbu 
             WHERE is_active = true 
             AND is_deleted = false 
             AND REPLACE(konfig_sumbu, ' ', '') LIKE '%${konfig_sumbu_clean.replace(/[.-]/g, '%')}%'
             ORDER BY LENGTH(konfig_sumbu) ASC`,
            { type: QueryTypes.SELECT, logging: false }
        );

        if (similarSumbu.length > 0) {
            console.log(`Menggunakan konfigurasi terdekat: ${similarSumbu[0].konfig_sumbu}`);
            return similarSumbu[0].id;
        }

        return 0;

    } catch (error) {
        console.error('Error dalam pencarian konfigurasi sumbu:', error);
        return 0;
    }
}

const insert_sumbu = async (nama) => {

    try {
        return sequelize.transaction().then(function (t) {
            return t_sumbu.create({
                konfig_sumbu: nama,
                jml_sumbu: nama.replace(/[^0-9]/g, "").length
            }, { transaction: t }).then(async (data) => {
                try {
                    t.commit();
                    return data.id;
                } catch (error) {
                    t.rollback();
                    return 0;
                }
            });
        });
    } catch (error) {
        await t.rollback();
    }
}

exports.getKepemilikanId = async (nama_pemilik) => {
    var text = nama_pemilik.toLowerCase();
    var substring = text.substring(0, 2);

    if (substring == 'pt' || substring == 'cv') {
        return 2;
    } else {
        return 1;
    }
}

exports.getKepemilikanVal = async (nama_pemilik) => {
    console.log('DATA KEPEMILIKAN VAL : ', nama_pemilik.toUpperCase());
    if (nama_pemilik) {
        var text = nama_pemilik.toLowerCase();
        var substring = text.substring(0, 2);

        if (substring == 'pt' || substring == 'cv') {
            // console.log('PERUSAHAAN');
            return 'PERUSAHAAN';
        } else {
            // console.log('PERORANGAN');
            return 'PERSEORANGAN';
        }
    } else {
        console.log('UNDEFINE PEMILIK');
        return 'UNDEFINED';
    }
}

exports.checkMasaBerlaku = async (masa_berlaku) => {
    // return moment(masa_berlaku, "YYYY-MM-DD").isBefore(moment());
    var a = moment(masa_berlaku);
    var b = moment().utc();
    var d = a.diff(b, 'days');
    if (d > 0) {
        return true;
    } else if (d < 0) {
        return false;
    } else {
        return true;
    }
}

exports.base64decode = (base64data) => {
    let data = 'iVBORw0KGgoAAAANSUhEUgAAABkAAAATCAYAAABlcqYFAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAA' +
        'CA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0' +
        'YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly' +
        '93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAg' +
        'ICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZm' +
        'Y6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAADuUlEQVQ4EbVU' +
        'TUtcZxR+7ufkXp1SZ4iZRE1EDVQRnTAhowsZMFm40I2rNqUIIev8hvoPQroQXBTqwiAWcd0EglEhiZNajVZrQGXAWAzaZpzMnZn7lXPeeIe5Da' +
        'Wb9Ax33vOec8/znI/3vVI6nfbxP4v8b/iSJIGfzyGfkPi+D13XUalUBL6qqmIvy5+8WuX/r2RCkUzAoIuLi2hqaoLrutjb28P6+josyxJkiqJA' +
        '07SQXiqVwHaOZYx/itLc3Px9YIxEIlheXsbExATGxsYwMjIiwEdHRwXA/Pw8EokEcrkcDg4OYJomVlZWMDU1JSqfmZlBR0cHbNsOtVoNCHjlTF' +
        'iSySQMwxAVxONxQbi0tIRMJoPe3l5MT0+jtbUVg4ODYGImY18qlcL4+DhisZjoggCjv1C7uOyenh7Mzs5iY2ND6FQpdnd3sba2JloSjUYxPDyM' +
        '/v5+TE5OYn9/X9jZtrOzg+3t7WqyAUmoEu419/+HBw9E+eVymbJqAJP39fWBCR3HEU+hUMDQ0JCYGc8um81iYGAAjY2N8DwvwBdraCY8tHhDA1' +
        'Y3N9Hd3S2yvH37O7RcbsF7AuUsD9+8wdOFBTx/8QJtbW1C5/nMzc3R0D2UyxXk83lRXcAk1V5GCT5sSUGDbeHxy9/EO98M9OOXzT9wfHISxKC1' +
        'vR0GHfOtrS2g/SouWwU0Xkggu7qO9PUkJFULnbIQyTm6ewu2hF+vnOIIUQwdGlg8f4QF6wvMWBq+pAkaskSnx4FFVUf0CNpcC797KizXQ4oAHh' +
        'VdXJJ81F7j6kwUynPHlXDPdFB2fRj+KVK0KvT2rbp3uKYryJU11Cke8qqMuOoioeeJ1MPDYxM36m1cNSq4GdFx58RAWvbx8TrXnK4IgR16Em5G' +
        'K4iqHi5GHHxLgcSDn97WgZPoND+GGZRpPYH85cgiiRQl1ltXxmFFQ5PuopP8TrW5ZyRcWp7AbmkeZefg5+N6PPnbRJdpw/YlfB0vQiPQZwVdZN' +
        'tFZEVK6D1VTnccJlXzuqTjvOZiq6Rhj2KqLSJsofOHgIl8+t0/qsfDioxmSUWGjrRFzhYi/5Oynrdl3KXHIZDXtF6hil8R6I9FBV/RvDLnXKxS' +
        'bAdVYhNeINXBMwmXWCTQGG2Y+Jj+dFrfEmiMAtmeowpo9ojTvkD+A/L1UJUMmiVfkuz6WTyZhFRJAgP33j3bsM5k/Fng68UP21hYJyyxZwLWuS' +
        '2cKMfUSm3rhD0g4E2g197fwMZ+Bgt8rNe2iP2BhL5dgfFzrx8AfECEDdx45a0AAAAASUVORK5CYII=';

    var file_name = req.body.no_kendaraan + '_' + req.body.kode_uppkb + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + req.body.no_uji + '.jpg';
    const uploadPath = path.join(config.path_upload) + '/penimbangan/' + file_name;////config.path_upload+'/'+file_name;
    const imageUrl = `${config.image_url}penimbangan/${file_name}`;

    let buff = Buffer.from(data, 'base64');//new Buffer(data, 'base64');
    let save = fs.writeFileSync(uploadPath, buff);

    console.log('Base64 image data converted to file: stack-abuse-logo-out.png ', imageUrl);
}

exports.getUser = async (user_id) => {
    var sql = `SELECT * FROM users WHERE id = ${user_id} AND is_deleted = false`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0];
    } else {
        return [];
    }
}

exports.GetNup = async (lokasi) => {
    var sql = `SELECT nup FROM jt_aset WHERE lokasi_uppkb_id = ${lokasi} AND is_deleted = false ORDER BY nup DESC`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result[0].nup;
    } else {
        return 0;
        // var insert = await insert_sumbu(konfig_sumbu);

        // return insert;
    }
}

exports.GetNupTemp = async (lokasi) => {
    var sql = `SELECT nup FROM jt_aset_temp WHERE lokasi_uppkb_id = ${lokasi} AND is_deleted = false ORDER BY nup DESC`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (Object.keys(result).length > 0) {
        return result[0].nup;
    } else {
        return 0;
        // var insert = await insert_sumbu(konfig_sumbu);

        // return insert;
    }
}

exports.getNamaBank = async (id) => {
    var sql = `SELECT nama FROM jt_bank WHERE id = '${id}' AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0].nama;
    } else {
        return 0;
    }
}

exports.getNoRuas = async (kode_uppkb) => {
    var sql = `SELECT kode FROM jt_ruas WHERE kode_uppkb = '${kode_uppkb}' AND is_active = TRUE and is_deleted = FALSE`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        return result[0].kode;
    } else {
        return null;
    }
}