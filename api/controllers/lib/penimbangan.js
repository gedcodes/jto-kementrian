const { t_kendaraan, sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const config = require('../../../config/config');
const fs = require('fs');
const path = require("path");
const moment = require('moment');
const { resourceLimits } = require('worker_threads');


const timer = ms => new Promise(res => setTimeout(res, ms));

const insert_komoditi = async (kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, komoditi_id, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        console.log(uuidv4());
        var sql = `INSERT INTO jt_detail_muatan
                    (id, kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, komoditi_id, created_at, created_by)
                   VALUES
                    ('${uuidv4()}', '${kode_trx}', '${no_kendaraan}', '${tgl_penimbangan}', '${kode_uppkb}', ${komoditi_id}, '${created_at}', ${created_by})`;

        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //\\console.log('INSERT : ',res);
        return res;
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const update_komoditi = async (kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, komoditi_id, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_detail_muatan SET
                    kode_trx = '${kode_trx}',
                    no_kendaraan = '${no_kendaraan}',
                    tgl_penimbangan = '${tgl_penimbangan}',
                    kode_uppkb = '${kode_uppkb}',
                    komoditi_id = ${komoditi_id},
                    updated_at = '${updated_at}',
                    updated_by = ${updated_by}
                  WHERE
                    kode_trx = '${kode_trx}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

exports.checkMasaBerlaku = async (masa_berlaku) => {
    // console.log('IS MASA BERLAKU : ', moment(masa_berlaku, "YYYY-MM-DD").isBefore(moment()))
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

const delete_muatan_soft = async (kode_trx, kode_uppkb, deleted_at, deleted_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_detail_muatan SET
                    is_deleted = true,
                    deleted_at = '${moment(deleted_at).format('YYYY-MM-DD HH:mm:ss')}',
                    deleted_by = ${deleted_by}
                  WHERE
                    kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

exports.upsert_komoditi = async (arr_komoditi, kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, tgl_upsert, upsert_by) => {
    console.log('ARR KOMODITI : ', arr_komoditi);
    if (arr_komoditi.length > 0) {
        var upsert = [];
        var sql_chk = `SELECT COUNT(*) AS jml_muatan FROM jt_detail_muatan WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}';`;

        const result_chk = await sequelize.query(sql_chk, {
            type: QueryTypes.SELECT,
            logging: false
        });

        console.log('JUMLAH MUATAN : ', result_chk[0].jml_muatan, ' != ', arr_komoditi.length)
        if (Number(result_chk[0].jml_muatan) != arr_komoditi.length) {
            var del = await delete_muatan_trx(kode_trx, kode_uppkb);
            console.log('DELETE KOMODITI : ', del);
        }

        for (var i = 0; i < arr_komoditi.length; i++) {

            var sql = `SELECT * FROM jt_detail_muatan WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}' AND komoditi_id = ${Number(arr_komoditi[i])};`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (Object.keys(result).length > 0) {
                var del = await delete_muatan(kode_trx, kode_uppkb, arr_komoditi[i]);
                if (del == 1) {
                    console.log('INSERT KOMODITI');
                    var insert = await insert_komoditi(kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, arr_komoditi[i], tgl_upsert, upsert_by);
                    upsert.push(Number(insert));
                } else {
                    console.log('UPDATE KOMODITI');
                    var update = await update_komoditi(kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, arr_komoditi[i], tgl_upsert, upsert_by);
                    upsert.push(Number(update));
                }

            } else {
                var sql = `SELECT * FROM jt_komoditi WHERE id = ${arr_komoditi[i]}`;
                const result_pel = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: true
                });

                if (result_pel.length > 0) {
                    console.log('INSERT KOMODITI');
                    var insert = await insert_komoditi(kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, arr_komoditi[i], tgl_upsert, upsert_by);
                    upsert.push(Number(insert));
                }

            }

            await timer(50);
        }

        return upsert;
    }
}

exports.select_sync_komoditi = async (kode_trx) => {
    if (kode_trx) {
        var sql = `SELECT * FROM jt_detail_muatan WHERE kode_trx = '${kode_trx}';`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        console.log('JUMLAH DATA SYNC KOMODITI : ', result.length);
        if (result.length > 0) {
            return result;
        } else {
            return [];
        }
    }
}

exports.removeFileKendaraan = async (id) => {
    //if (img_path != null) {
    var rowImg = await getImageKendaraan(id);
    var arrImg = rowImg.split('#');
    //console.log(rowImg.split('#').length);
    arrImg.map(async (r, i) => {
        if (fs.existsSync(`${r}`)) {
            fs.unlink(`${r}`, function (err) {
                if (err) return console.log(err);
                console.log('file deleted ' + r + ' successfully');
            });
        }

        await timer(200);
    })
}

async function getImageKendaraan(id) {
    var sql = `SELECT * FROM jt_kendaraan WHERE id = ${id}`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    var arrImg = [];
    if (result.length > 0) {
        const fotoDepan = config.path_upload + '/kendaraan/' + result[0].foto_depan;
        const fotoBelakang = config.path_upload + '/kendaraan/' + result[0].foto_belakang;
        const fotoKiri = config.path_upload + '/kendaraan/' + result[0].foto_kiri;
        const fotoKanan = config.path_upload + '/kendaraan/' + result[0].foto_kanan;

        arrImg.push({
            'fotoDepan': fotoDepan,
            'fotoBelakang': fotoBelakang,
            'fotoKiri': fotoKiri,
            'fotoKanan': fotoKanan
        })

        return `${fotoDepan}#${fotoBelakang}#${fotoKiri}#${fotoKanan}`;
    } else {
        return 0;
    }
}

exports.ltrim = async (char, str) => {
    if (str.slice(0, char.length) === char) {
        return ltrim(char, str.slice(char.length));
    } else {
        return str;
    }
}

exports.rtrim = async (char, str) => {
    if (str.slice(str.length - char.length) === char) {
        return rtrim(char, str.slice(0, 0 - char.length));
    } else {
        return str;
    }
}

exports.getIsMelanggarDokumen = async (data) => {
    var sql = `SELECT * FROM jt_dokumen WHERE is_optional = false AND is_active = true AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    console.log(data, ' == ', result.length);
    if (result.length > 0) {
        if (data == result.length) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

exports.getRemoveImageDokumen = async (id) => {
    var sql = `SELECT * FROM jt_detail_dokumen WHERE id = '${id}'`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    //var arrImg = [];
    if (result.length > 0) {
        const file = config.path_upload + '/dokumen/' + result[0].foto_dokumen;

        if (fs.existsSync(`${file}`)) {
            fs.unlink(`${file}`, function (err) {
                if (err) return console.log(err);
                console.log('file deleted ' + file + ' successfully');
            });
        }

        await timer(200);
        return 1;
    } else {
        return 0;
    }
}

exports.getRemoveImageDokumenTemp = async (id) => {
    var sql = `SELECT * FROM jt_detail_dokumen_temp WHERE id = '${id}'`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    //var arrImg = [];
    if (result.length > 0) {
        const file = config.path_upload + '/dokumen/' + result[0].foto_dokumen;

        if (fs.existsSync(`${file}`)) {
            fs.unlink(`${file}`, function (err) {
                if (err) return console.log(err);
                console.log('file deleted ' + file + ' successfully');
            });
        }

        await timer(200);
        return 1;
    } else {
        return 0;
    }
}

exports.moveRowDocumentTemp = async (arrdokumen, kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, created_at, created_by) => {
    console.log('DOKUMEN ARR : ', arrdokumen);
    if (arrdokumen.length > 0) {
        let r = '';
        var upsert = [];
        var sqldokchk = `SELECT COUNT(*) jml_dt FROM jt_detail_dokumen WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;
        //console.log(sql)    
        const result_count = await sequelize.query(sqldokchk, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (Number(result_count[0].jml_dt) == arrdokumen.length) {
            var del = await delete_dokumen_trx(kode_trx, kode_uppkb);
            console.log('DELETE DOK : ', del);
        }

        for (var i = 0; i < arrdokumen.length; i++) {
            var sql = `SELECT * FROM jt_detail_dokumen_temp WHERE no_kendaraan = '${no_kendaraan}' AND kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;// AND dokumen_id = ${arrdokumen[i]}`;
            //console.log(sql)    
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            //var arrImg = [];
            if (result.length > 0) {
                var arr = [];
                var arrRem = [];
                for (var row of result) {
                    //console.log(row)
                    var insert = await insert_dokumen(kode_trx, row.no_kendaraan, row.tgl_penimbangan, row.kode_uppkb, row.dokumen_id, row.status_dokumen, row.keterangan, row.foto_dokumen_url, row.foto_dokumen, row.created_at, row.created_by);
                    arr.push(insert);
                    upsert.push(Number(insert));
                    var removeTemp = await delete_dokumen_temp(no_kendaraan, tgl_penimbangan, kode_uppkb);
                    arrRem.push(removeTemp);
                    await timer(200);
                }
                r += arr;
                r += ',' + arrRem;
                //return arr;
            } else {
                // var insert = await insert_dokumen(kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, arrdokumen[i], true, '', '', '', created_at, created_by);
                // r += insert;
                // upsert.push(Number(insert));
                console.log('DOKUMEN DETAIL');
                var sqldok = `SELECT * FROM jt_detail_dokumen WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}' AND dokumen_id = ${arrdokumen[i]}`;
                //console.log(sql)    
                const result_dok = await sequelize.query(sqldok, {
                    type: QueryTypes.SELECT,
                    logging: false
                });
                console.log(Object.keys(result_dok).length, ' != ', arrdokumen.length);
                if (Object.keys(result_dok).length > 0) {
                    var del = await delete_dokumen(kode_trx, kode_uppkb, arrdokumen[i]);
                    if (del == 1) {
                        var insert = await insert_dokumen(kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, arrdokumen[i], true, '', '', '', created_at, created_by);
                        upsert.push(Number(insert));
                    } else {
                        var update = await update_dokumen(kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, arrdokumen[i], true, '', '', '', created_at, created_by);
                        upsert.push(Number(update));
                    }
                } else {
                    var insert = await insert_dokumen(kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, arrdokumen[i], true, '', '', '', created_at, created_by);
                    upsert.push(Number(insert));
                }
            }

            await timer(50);
        }
        return upsert;
    }
}

const delete_dokumen_soft = async (kode_trx, kode_uppkb, deleted_at, deleted_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_detail_dokumen SET
                    is_deleted = true,
                    deleted_at = '${moment(deleted_at).format('YYYY-MM-DD HH:mm:ss')}',
                    deleted_by = ${deleted_by}
                  WHERE
                    kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

exports.getKodeKota = async (kota_id) => {
    var sql = `SELECT * FROM jt_kota_kab WHERE id = ${Number(kota_id)}`;// AND dokumen_id = ${arrdokumen[i]}`;
    //console.log(sql)    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    //var arrImg = [];
    if (result.length > 0) {
        return result[0].kode;
    } else {
        return '';
    }
}

const insert_dokumen = async (kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, dokumen_id, status_dokumen, keterangan, foto_dokumen_url, foto_dokumen, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `INSERT INTO jt_detail_dokumen
                    (id, kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, dokumen_id, status_dokumen, keterangan, foto_dokumen_url, foto_dokumen, created_at, created_by)
                   VALUES
                    ('${uuidv4()}', '${kode_trx}', '${no_kendaraan}', '${tgl_penimbangan}', '${kode_uppkb}', ${dokumen_id}, ${status_dokumen}, '${keterangan}', '${foto_dokumen_url}', '${foto_dokumen}', '${moment(created_at).format('YYYY-MM-DD HH:mm:ss')}', ${created_by})`;

        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //\\console.log('INSERT : ',res);
        return res;
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const update_dokumen = async (kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, dokumen_id, status_dokumen, keterangan, foto_dokumen_url, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_detail_dokumen SET
                    kode_trx = '${kode_trx}',
                    kode_uppkb = '${kode_uppkb}',
                    no_kendaraan = '${no_kendaraan}',
                    tgl_penimbangan = '${tgl_penimbangan}',
                    dokumen_id = ${dokumen_id},
                    status_dokumen = ${status_dokumen},
                    keterangan = '${keterangan}',
                    foto_dokumen_url = '${foto_dokumen_url}',
                    updated_at = '${moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}',
                    updated_by = ${updated_by}
                  WHERE
                    kode_trx = '${kode_trx}'`;
        // console.log(sql);
        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

exports.upsert_pelanggaran = async (arr_pelanggaran, kode_trx, no_kendaraan, tgl_penimbangan, kode_uppkb, upsert_at, upsert_by) => {
    if (arr_pelanggaran.length > 0) {
        var sql_chk = `SELECT COUNT(*) as jml_dt FROM jt_pelanggaran WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;
        const result_chk = await sequelize.query(sql_chk, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (Number(result_chk[0].jml_dt) != arr_pelanggaran.length) {
            var del = await delete_pelanggaran_trx(kode_trx, kode_uppkb);
            console.log('DELETE PELANGGARAN : ', del);
        }

        var upsert = [];
        for (var i = 0; i < arr_pelanggaran.length; i++) {

            var sql = `SELECT * FROM jt_pelanggaran WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}' AND jenis_pelanggaran_id = ${Number(arr_pelanggaran[i])}`;
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });
            //console.log(result);

            if (Object.keys(result).length > 0) {
                var del = await delete_pelanggaran(kode_trx, kode_uppkb, arr_pelanggaran[i]);
                if (del == 1) {
                    var insert = await insert_pelanggaran(kode_trx, kode_uppkb, no_kendaraan, tgl_penimbangan, arr_pelanggaran[i], result[0].kode_pelanggaran, `${result[0].deskripsi}`, upsert_at, upsert_by);
                    upsert.push(Number(insert));
                } else {
                    var update = await update_pelanggaran(kode_trx, kode_uppkb, no_kendaraan, tgl_penimbangan, arr_pelanggaran[i], result[0].kode_pelanggaran, `${result[0].deskripsi}`, upsert_at, upsert_by);
                    upsert.push(Number(update));
                }
            } else {
                var sql = `SELECT * FROM jt_jenis_pelanggaran WHERE id = ${arr_pelanggaran[i]}`;
                const result_pel = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: true
                });

                if (result_pel.length > 0) {
                    var insert = await insert_pelanggaran(kode_trx, kode_uppkb, no_kendaraan, tgl_penimbangan, arr_pelanggaran[i], result_pel[0].kode, `PELANGGARAN ${result_pel[0].nama}`, upsert_at, upsert_by);
                    upsert.push(Number(insert));
                }
            }

            await timer(150);

        }

        return upsert;
    }
}

const insert_pelanggaran = async (kode_trx, kode_uppkb, no_kendaraan, tgl_penimbangan, jenis_pelanggaran_id, kode_pelanggaran, deskripsi, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `INSERT INTO jt_pelanggaran
                    (kode_trx, kode_uppkb, no_kendaraan, tgl_penimbangan, jenis_pelanggaran_id, kode_pelanggaran, deskripsi, created_at, created_by)
                   VALUES
                    ('${kode_trx}', '${kode_uppkb}', '${no_kendaraan}', '${tgl_penimbangan}', ${jenis_pelanggaran_id}, '${kode_pelanggaran}', '${deskripsi}', '${moment(created_at).format('YYYY-MM-DD HH:mm:ss')}', ${created_by})`;

        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //\\console.log('INSERT : ',res);
        return res;
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const update_pelanggaran = async (kode_trx, kode_uppkb, no_kendaraan, tgl_penimbangan, jenis_pelanggaran_id, kode_pelanggaran, deskripsi, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_pelanggaran SET
                    kode_trx = '${kode_trx}',
                    kode_uppkb = '${kode_uppkb}',
                    no_kendaraan = '${no_kendaraan}',
                    tgl_penimbangan = '${tgl_penimbangan}',
                    jenis_pelanggaran_id = ${jenis_pelanggaran_id},
                    kode_pelanggaran = '${kode_pelanggaran}',
                    deskripsi = '${deskripsi}',
                    updated_at = '${moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}',
                    updated_by = ${updated_by}
                  WHERE
                    kode_trx = '${kode_trx}'`;
        // console.log(sql);
        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

const delete_pelanggaran_soft = async (kode_trx, kode_uppkb, deleted_at, deleted_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_pelanggaran SET
                    is_deleted = true,
                    deleted_at = '${moment(deleted_at).format('YYYY-MM-DD HH:mm:ss')}',
                    deleted_by = ${deleted_by}
                  WHERE
                    kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

const delete_dokumen_temp = async (no_kendaraan, tgl_penimbangan, kode_uppkb) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_dokumen_temp WHERE no_kendaraan = '${no_kendaraan}' AND tgl_penimbangan = '${tgl_penimbangan}' AND kode_uppkb = '${kode_uppkb}'`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const delete_dokumen = async (kode_trx, kode_uppkb, dokumen_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_dokumen WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}' AND dokumen_id = ${dokumen_id}`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const delete_dokumen_trx = async (kode_trx, kode_uppkb) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_dokumen WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const delete_muatan = async (kode_trx, kode_uppkb, komoditi_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_muatan WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}' AND komoditi_id = ${komoditi_id}`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const delete_muatan_trx = async (kode_trx, kode_uppkb) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_muatan WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const delete_pelanggaran = async (kode_trx, kode_uppkb, jenis_pelanggaran_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_pelanggaran WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}' AND jenis_pelanggaran_id = ${jenis_pelanggaran_id}`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const delete_pelanggaran_trx = async (kode_trx, kode_uppkb) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_pelanggaran WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const uploadPathPenimbangan = (param_path, file_name) => {
    const uploadPath = path.join(config.path_upload) + '/' + param_path + '/' + file_name;

    return uploadPath;
}

const imgUrlPenimbangan = (param_path, file_name) => {
    const imageUrl = `${config.image_url}${param_path}/${file_name}`;

    return imageUrl;
}

exports.uploadImage = async (no_kendaraan, param_path, req) => {
    if (req) {
        console.log('FILE IMAGE : ', req.name);
        let fileImg = req.name;
        if (req.size > 1 * 1024 * 1024) {
            console.log(`Size File Max. 1 Mb. File ${req.name} Melebihi Ukuran`);
        }

        const extensionName = path.extname(req.name); // fetch the file extension
        const allowedExtension = ['.png', '.jpg', '.jpeg'];

        if (!allowedExtension.includes(extensionName)) {
            return res.status(422).send({
                success: false,
                message: "Format File Yang Di Izinkan [*.png, *.jpg, *.jpeg]",
            });
        }


        var filename = no_kendaraan + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + req.name;

        const uploadPath = uploadPathPenimbangan(param_path, filename); ////config.path_upload+'/'+file_name;
        const imageUrl = imgUrlPenimbangan(param_path, filename); //`${config.image_url}penimbangan/${file_name}`;
        // fileImg.mv(uploadPath);
        var dataUpload = {
            imgPath: uploadPath || '',
            imgName: filename || '',
            imgUrl: imageUrl || ''
        }

        req.mv(uploadPath, function (err) {
            if (err)
                console.log(err);
            return err;

        });
        return dataUpload;
    } else {
        var dataUpload = {
            imgPath: '',
            imgName: '',
            imgUrl: ''
        }
        // console.log('DATA UPLOAD : ', dataUpload);
        return dataUpload;
    }
}

exports.getIsNoKendaraan = async (no_kendaraan, tgl_penimbangan) => {
    var jam = moment(tgl_penimbangan).format('HH');
    var sql = `SELECT * FROM jt_penimbangan WHERE no_kendaraan = '${no_kendaraan}' AND DATE(tgl_penimbangan) = '${tgl_penimbangan}'  AND EXTRACT(HOUR FROM tgl_penimbangan) = '${jam}'`;// AND is_transaksi = 0;`;// AND dokumen_id = ${arrdokumen[i]}`;
    //console.log(sql)    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    //var arrImg = [];
    if (result.length > 0) {
        return false;
    } else {
        return true;
    }
}

exports.getIsNoKendaraanWim = async (no_kendaraan, tgl_penimbangan) => {
    var jam = moment(tgl_penimbangan).format('HH');
    var sql = `SELECT * FROM jt_log_wim WHERE no_kendaraan = '${no_kendaraan}' AND DATE(tgl_penimbangan) = '${tgl_penimbangan}'  AND EXTRACT(HOUR FROM tgl_penimbangan) = '${jam}'`;// AND is_transaksi = 0;`;// AND dokumen_id = ${arrdokumen[i]}`;
    //console.log(sql)    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    //var arrImg = [];
    if (result.length > 0) {
        return false;
    } else {
        return true;
    }
}

exports.getIsNoKendaraanStatus = async (no_kendaraan, tgl_penimbangan) => {
    var jam = moment(tgl_penimbangan).format('HH');
    var sql = `SELECT * FROM jt_penimbangan WHERE no_kendaraan = '${no_kendaraan}' AND DATE(tgl_penimbangan) = '${tgl_penimbangan}'  AND EXTRACT(HOUR FROM tgl_penimbangan) = '${jam}' AND is_transaksi = 1;`;// AND dokumen_id = ${arrdokumen[i]}`;
    //console.log(sql)    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    //var arrImg = [];
    if (result.length > 0) {
        return false;
    } else {
        return true;
    }
}

exports.getIsExistsKodeTrxKendaraan = async (kode_trx, no_kendaraan) => {
    var sql = `SELECT * FROM jt_penimbangan WHERE kode_trx = '${kode_trx}';`;
    console.log(sql)
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    //var arrImg = [];
    if (result.length > 0) {
        return false;
    } else {
        return true;
    }
}

exports.upsert_kendaraan = async (no_kendaraan, field) => {
    try {
        var sql = `SELECT * FROM jt_kendaraan WHERE no_reg_kend = '${no_kendaraan}'`;// AND dokumen_id = ${arrdokumen[i]}`;
        //console.log(sql)    
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        //var arrImg = [];
        if (result.length == 0) {
            return sequelize.transaction().then(function (t) {
                return t_kendaraan.create(field, { transaction: t, logging: false }).then(async (data) => {
                    try {
                        t.commit();
                        return data.id;
                    } catch (error) {
                        t.rollback();
                        return 0;
                    }
                });
            });
        } else {
            return sequelize.transaction().then(function (t) {
                return t_kendaraan.update(field, { where: { no_reg_kend: no_kendaraan }, transaction: t, logging: false }).then(async (num) => {
                    try {
                        t.commit();
                        return num;
                    } catch (error) {
                        t.rollback();
                        return 0;
                    }
                });
            });
        }
    } catch (error) {
        await t.rollback();
    }
}

const delete_verifikasi = async (id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_vr_data WHERE id = '${id}'`;
        // console.log(sql);
        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            console.log('DELETE VERIFIKASI : ',res_delete[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

exports.cekExistsVerifikasi = async (id) => {
    var sql = `SELECT * FROM jt_penimbangan WHERE id = '${id}' and is_verifikasi = true;`;
    console.log(sql)
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    //var arrImg = [];
    if (result.length > 0) {
        var sql2 = `SELECT * FROM jt_vr_data WHERE id_referensi = '${id}';`;
        console.log(sql2)
        const result2 = await sequelize.query(sql2, {
            type: QueryTypes.SELECT,
            logging: false
        });
        if (result2.length > 0) {
            await delete_verifikasi(result2[0].id);
            return 1;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}