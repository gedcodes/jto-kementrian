const { t_penimbangan, sequelize } = require('../api/models');
const { Op } = require('sequelize');
var cron = require('node-cron');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const timer = ms => new Promise(res => setTimeout(res, ms));
let tgl_now = moment().format('YYYY-MM-DD');
var hrstart = hrstart + 0;
var time_str = 5;

getUppkb();
//Loop Setiap 5 Menit
cron.schedule(`*/${time_str} * * * *`, async () => {
    try {
        await getUppkb()
    } catch (error) {
        console.log(error)
    }
});

async function getUppkb() {
    var start = new Date().getTime();
    hrstart = process.hrtime()   
    try {
        var sql = `SELECT * FROM jt_lokasi_uppkb WHERE is_active = true AND is_deleted = false`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        })
        
        for (var row of result) {
            var penimbangan = await getPenimbangan(row.kode);
    
            if (penimbangan == 1) {
                console.log(`UPDATE STATUS OPERASI ${row.kode} - ${row.nama} TANGGAL ${tgl_now} BERHASIL`);
            } else {
                console.log(`UPDATE STATUS OPERASI ${row.kode} - ${row.nama} TANGGAL ${tgl_now} GAGAL`);
            }
            await timer(500);
        }
    } catch (error) {
        console.log(`ERROR : `, error);
    }
    var end = new Date().getTime();
    time_str = Math.round(((end - start) * 0.001) + 10); 
    //time_str = time.replace('ms','');
    console.log('Execution time : ', time_str);

    var hrend = process.hrtime(hrstart);
    console.log('Execution time (hr): %d', hrend[0]);    
}

async function getPenimbangan(kode_uppkb) {
    var sql = `SELECT * FROM jt_penimbangan WHERE DATE(tgl_penimbangan) = '${tgl_now}' AND kode_uppkb = '${kode_uppkb}' AND is_transaksi = 1`;
    console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    })
    
    var is_operasi = false;
    if (Object.keys(result).length > 0) {
        is_operasi = true;
    } 
    console.log(`JUMLAH TIMBANG ${kode_uppkb} `, Object.keys(result).length, ` STATUS OPERASI : `, is_operasi);
    var update_operasi = await update_status_operasi(kode_uppkb, is_operasi);

    return update_operasi;
}

const update_status_operasi = async(kode_uppkb, is_operasi) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_lokasi_uppkb SET is_operasi = ${is_operasi} WHERE kode = '${kode_uppkb}'`;

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
        console.log(`UPDATE STATUS OPERASI ${kode_uppkb} GAGAL `,error);
        await t.rollback();
    }
}