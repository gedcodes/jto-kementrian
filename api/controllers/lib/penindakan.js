const { t_detailpenindakan_pasal, t_detailpenindakan_sanksi, t_etilang, sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const config = require('../../../config/config');
const fs = require('fs');
const path = require("path");
const moment = require('moment');

const timer = ms => new Promise(res => setTimeout(res, ms));

const insert_detail_sitaan = async (kode_penindakan, kode_trx, no_kendaraan, sitaan_id, tgl_penindakan, kode_uppkb, lokasi_id, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        console.log(uuidv4());
        var sql = `INSERT INTO jt_detail_penindakan_sitaan
                    (id, kode_penindakan, kode_trx, no_kendaraan, sitaan_id, tgl_penindakan, kode_uppkb, lokasi_id, created_at, created_by)
                   VALUES
                    ('${uuidv4()}', '${kode_penindakan}', '${kode_trx}', '${no_kendaraan}', '${sitaan_id}', '${tgl_penindakan}', '${kode_uppkb}', ${lokasi_id}, '${created_at}', ${created_by})`;

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

const update_detail_sitaan = async (kode_penindakan, kode_trx, no_kendaraan, sitaan_id, tgl_penindakan, kode_uppkb, lokasi_id, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_detail_penindakan_sitaan SET
                    kode_penindakan = '${kode_penindakan}',
                    kode_trx = '${kode_trx}',
                    no_kendaraan = '${no_kendaraan}',
                    sitaan_id = ${sitaan_id},
                    tgl_penindakan = '${tgl_penindakan}',
                    kode_uppkb = '${kode_uppkb}',
                    lokasi_id = '${lokasi_id}',
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

const delete_detailsitaan = async (kode_penindakan, kode_uppkb, sitaan_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_penindakan_sitaan WHERE kode_penindakan = '${kode_penindakan}' AND kode_uppkb = '${kode_uppkb}' AND sitaan_id = ${sitaan_id}`;

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

exports.upsert_detail_sitaan = async (arrsitaan, kode_penindakan, kode_trx, no_kendaraan, tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by) => {
    console.log('ARR SITAAN : ', arrsitaan);
    if (arrsitaan.length > 0) {
        var upsert = [];
        for (var i = 0; i < arrsitaan.length; i++) {

            var sql = `SELECT * FROM jt_detail_penindakan_sitaan WHERE kode_penindakan = '${kode_penindakan}' AND kode_uppkb = '${kode_uppkb}' AND sitaan_id = ${Number(arrsitaan[i])};`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            var del = await delete_detailsitaan(kode_penindakan, kode_uppkb, arrsitaan[i]);
            if (del == 1) {
                console.log(del);
            }

            if (Object.keys(result).length > 0) {
                console.log('UPDATE DETAIL SITAAN');
                var update = await update_detail_sitaan(kode_penindakan, kode_trx, no_kendaraan, arrsitaan[i], tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by);
                upsert.push(Number(update));

            } else {
                console.log('INSERT DETAIL SITAAN');
                var insert = await insert_detail_sitaan(kode_penindakan, kode_trx, no_kendaraan, arrsitaan[i], tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by);
                upsert.push(Number(insert));
            }

            await timer(500);
        }

        return upsert;
    }
}




const insert_detail_subsanksi = async (kode_penindakan, kode_trx, no_kendaraan, sub_sanksi_id, tgl_penindakan, kode_uppkb, lokasi_id, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        console.log(uuidv4());
        var sql = `INSERT INTO jt_detail_penindakan_sanksi
                    (id, kode_penindakan, kode_trx, no_kendaraan, sub_sanksi_id, tgl_penindakan, kode_uppkb, lokasi_id, created_at, created_by)
                   VALUES
                    ('${uuidv4()}', '${kode_penindakan}', '${kode_trx}', '${no_kendaraan}', '${sub_sanksi_id}', '${tgl_penindakan}', '${kode_uppkb}', ${lokasi_id}, '${created_at}', ${created_by})`;

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

const update_detail_subsanksi = async (kode_penindakan, kode_trx, no_kendaraan, sub_sanksi_id, tgl_penindakan, kode_uppkb, lokasi_id, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_detail_penindakan_sanksi SET
                    kode_penindakan = '${kode_penindakan}',
                    kode_trx = '${kode_trx}',
                    no_kendaraan = '${no_kendaraan}',
                    sub_sanksi_id = ${sub_sanksi_id},
                    tgl_penindakan = '${tgl_penindakan}',
                    kode_uppkb = '${kode_uppkb}',
                    lokasi_id = '${lokasi_id}',
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

const delete_detailsubsanksi = async (kode_penindakan, kode_uppkb, sub_sanksi_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_penindakan_sanksi WHERE kode_penindakan = '${kode_penindakan}' AND kode_uppkb = '${kode_uppkb}' AND sub_sanksi_id = ${sub_sanksi_id}`;

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

exports.upsert_detail_sanksi = async (arr_sanksi, kode_penindakan, kode_trx, no_kendaraan, tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by) => {
    console.log('ARR SANKSI : ', arr_sanksi);
    if (arr_sanksi.length > 0) {
        var upsert = [];
        for (var i = 0; i < arr_sanksi.length; i++) {

            var sql = `SELECT * FROM jt_detail_penindakan_sanksi WHERE kode_penindakan = '${kode_penindakan}' AND kode_uppkb = '${kode_uppkb}' AND sub_sanksi_id = ${Number(arr_sanksi[i])};`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            var del = await delete_detailsubsanksi(kode_penindakan, kode_uppkb, arr_sanksi[i]);
            if (del == 1) {
                console.log(del);
            }

            if (Object.keys(result).length > 0) {
                console.log('UPDATE DETAIL SANKSI');
                var update = await update_detail_subsanksi(kode_penindakan, kode_trx, no_kendaraan, arr_sanksi[i], tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by);
                upsert.push(Number(update));

            } else {
                console.log('INSERT DETAIL SANKSI');
                var insert = await insert_detail_subsanksi(kode_penindakan, kode_trx, no_kendaraan, arr_sanksi[i], tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by);
                upsert.push(Number(insert));
            }

            await timer(500);
        }

        return upsert;
    }
}


const insert_detail_pasal = async (kode_penindakan, kode_trx, no_kendaraan, pasal_id, tgl_penindakan, kode_uppkb, lokasi_id, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        console.log(uuidv4());
        var sql = `INSERT INTO jt_detail_penindakan_pasal
                    (id, kode_penindakan, kode_trx, no_kendaraan, pasal_id, tgl_penindakan, kode_uppkb, lokasi_id, created_at, created_by)
                   VALUES
                    ('${uuidv4()}', '${kode_penindakan}', '${kode_trx}', '${no_kendaraan}', '${pasal_id}', '${tgl_penindakan}', '${kode_uppkb}', ${lokasi_id}, '${created_at}', ${created_by})`;

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

const update_detail_pasal = async (kode_penindakan, kode_trx, no_kendaraan, pasal_id, tgl_penindakan, kode_uppkb, lokasi_id, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_detail_penindakan_pasal SET
                    kode_penindakan = '${kode_penindakan}',
                    kode_trx = '${kode_trx}',
                    no_kendaraan = '${no_kendaraan}',
                    pasal_id = ${pasal_id},
                    tgl_penindakan = '${tgl_penindakan}',
                    kode_uppkb = '${kode_uppkb}',
                    lokasi_id = '${lokasi_id}',
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

const delete_detailpasal = async (kode_penindakan, kode_uppkb, pasal_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_penindakan_pasal WHERE kode_penindakan = '${kode_penindakan}' AND kode_uppkb = '${kode_uppkb}' AND pasal_id = ${pasal_id}`;

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

exports.upsert_detail_pasal = async (arr_pasal, kode_penindakan, kode_trx, no_kendaraan, tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by) => {
    console.log('ARR PASAL : ', arr_pasal);
    if (arr_pasal.length > 0) {
        var upsert = [];
        for (var i = 0; i < arr_pasal.length; i++) {

            var sql = `SELECT * FROM jt_detail_penindakan_pasal WHERE kode_penindakan = '${kode_penindakan}' AND kode_uppkb = '${kode_uppkb}' AND pasal_id = ${Number(arr_pasal[i])};`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            var del = await delete_detailpasal(kode_penindakan, kode_uppkb, arr_pasal[i]);
            if (del == 1) {
                console.log(del);
            }

            if (Object.keys(result).length > 0) {
                console.log('UPDATE DETAIL PASAL');
                var update = await update_detail_pasal(kode_penindakan, kode_trx, no_kendaraan, arr_pasal[i], tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by);
                upsert.push(Number(update));

            } else {
                console.log('INSERT DETAIL PASAL');
                var insert = await insert_detail_pasal(kode_penindakan, kode_trx, no_kendaraan, arr_pasal[i], tgl_penindakan, kode_uppkb, lokasi_id, tgl_upsert, upsert_by);
                upsert.push(Number(insert));
            }

            await timer(500);
        }

        return upsert;
    }
}

exports.updateTindakanPenimbangan = async (kode_trx, updated_at, updated_by) => {
    console.log('UPDATE IS TINDAKAN');
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_penimbangan SET
                    is_tindakan = true,
                    updated_at = '${updated_at}',
                    updated_by = ${updated_by}
                  WHERE
                    kode_trx = '${kode_trx}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

exports.updatePenindakanBrivaTicket = async (id, ticket_id, briva_id, updated_at, updated_by) => {
    console.log('UPDATE TICKET ID AND BRIVA ID IN PENINDAKAN', id, ticket_id, briva_id);
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_penindakan SET
                    etilang_ticket_id = '${ticket_id}',
                    kode_briva = '${briva_id}',
                    updated_at = '${updated_at}',
                    updated_by = ${updated_by}
                  WHERE
                    id = '${id}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

exports.updatePenindakanEtilang = async (kode_penindakan, ticket_id, briva_id, msg, updated_at, updated_by) => {
    console.log('UPDATE TICKET ID AND BRIVA ID IN ETILANG', kode_penindakan, ticket_id, briva_id, msg);
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_etilang SET
                    resp_ticket_id = '${ticket_id}',
                    resp_msg = '${msg}',
                    "brivaCode" = '${briva_id}',
                    updated_at = '${updated_at}',
                    updated_by = ${updated_by}
                  WHERE
                    kode_penindakan = '${kode_penindakan}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

exports.upsert_etilang = async (kode_penindakan, field) => {
    try {
        var sql = `SELECT * FROM jt_etilang WHERE kode_penindakan = '${kode_penindakan}'`;
        //console.log(sql)    
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        //var arrImg = [];
        if (result.length == 0) {
            return sequelize.transaction().then(function (t) {
                return t_etilang.create(field, { transaction: t, logging: false }).then(async (data) => {
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
                return t_etilang.update(field, { where: { kode_penindakan: kode_penindakan }, transaction: t, logging: false }).then(async (num) => {
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

exports.getIsExistsKodePenindakan = async (kode) => {
    var sql = `SELECT * FROM jt_penindakan WHERE kode_penindakan = '${kode}';`;
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

exports.getIsNoKendaraanPenindakan = async (no_kendaraan, tgl_penindakan) => {
    const startTime = moment(tgl_penindakan).startOf('hour').format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment(tgl_penindakan).endOf('hour').format('YYYY-MM-DD HH:mm:ss');
    
    var sql = `SELECT * FROM jt_penindakan WHERE no_kendaraan = '${no_kendaraan}' AND tgl_penindakan BETWEEN '${startTime}' AND '${endTime}'`;
    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    return result.length === 0;
}