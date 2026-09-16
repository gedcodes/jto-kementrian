const { sequelize, t_dokumen, t_jenis_pelanggaran, } = require('../api/models');
const { Op } = require('sequelize');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const { ConfigObject } = require('svg-captcha-express');
var client = require('redis').createClient();
const { urlSinkronisasiJto } = require('../api/controllers/lib/urlsinkron');
var cron = require('node-cron');

const config = require('../config/config');
const path = require("path");

const {
    loginUser,
    updateStatusSyncToPusat,
    syncMidlewareToPostServer
} = require('../api/controllers/lib/sinkronisasi');

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}


const getPenindakan = async () => {
    console.log()
    try {
        // var sql = `SELECT * FROM jt_penimbangan WHERE  is_transaksi = 1 AND date_part('month', tgl_penimbangan) = ${bulan} AND device_id = 3 ORDER BY tgl_penimbangan DESC LIMIT 2`;
        var sql = `SELECT * FROM jt_penindakan WHERE is_active = true AND sync_to_pusat = false ORDER BY tgl_penindakan DESC limit 100`;
        //var sql = `SELECT * FROM jt_penimbangan WHERE kode_trx = 'T015895B9271RD/LSN00168/0722' ORDER BY tgl_penimbangan DESC`;

        console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            for (var i = 0; i < result.length; i++) {
                var pasal = await getDetailPasal(result[i].kode_penindakan, result[i].kode_uppkb);
                var arrpasal = pasal.length > 0 ? pasal.join() : '';
                var sanksi = await getDetailSanksi(result[i].kode_penindakan, result[i].kode_uppkb);
                var arrsanksi = sanksi.length > 0 ? sanksi.join() : '';
                var sitaan = await getDetailSitaan(result[i].kode_penindakan, result[i].kode_uppkb);
                var arrsitaan = sitaan.length > 0 ? sitaan.join() : '';
                const field = {
                    shift_id: result[i].shift_id,
                    regu_id: result[i].regu_id,
                    petugas_id: result[i].petugas_id,
                    bptd_id: result[i].bptd_id,
                    lokasi_id: result[i].lokasi_id,
                    pengadilan_id: result[i].pengadilan_id,
                    pengadilan_kode: result[i].pengadilan_kode,
                    kejaksaan_id: result[i].kejaksaan_id,
                    kejaksaan_kode: result[i].kejaksaan_kode,
                    gol_sim_id: result[i].gol_sim_id,
                    asal_kota_id: result[i].asal_kota_id,
                    tujuan_kota_id: result[i].tujuan_kota_id,
                    sanksi_id: result[i].sanksi_id ? result[i].sanksi_id : 10,
                    no_sim: result[i].no_sim,
                    nama_pengemudi: result[i].nama_pengemudi,
                    alamat_pengemudi: result[i].alamat_pengemudi,
                    umur_pengemudi: result[i].umur_pengemudi,
                    no_telp_pengemudi: result[i].no_telp_pengemudi,
                    jenis_kelamin: result[i].jenis_kelamin,
                    kode_uppkb: result[i].kode_uppkb,
                    kode_trx: result[i].kode_trx,
                    kode_penindakan: result[i].kode_penindakan,
                    no_kendaraan: result[i].no_kendaraan,
                    warna_kendaraan: result[i].warna_kendaraan,
                    kategori_jenis_kendaraan_id: Number(result[i].kategori_jenis_kendaraan_id) || null,
                    kategori_jenis_kendaraan: result[i].kategori_jenis_kendaraan || null,
                    tgl_penindakan: moment(result[i].tgl_penindakan).format('YYYY-MM-DD HH:mm:ss'),
                    nama_ppns: result[i].nama_ppns,
                    no_skep: result[i].no_skep,
                    tgl_sidang: result[i].tgl_sidang ? moment(result[i].tgl_sidang, 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                    jam_sidang: result[i].jam_sidang,
                    keterangan_tindakan: result[i].keterangan_tindakan,
                    sub_sanksi: arrsanksi,
                    pasal: arrpasal,
                    sitaan: arrsitaan,
                    is_active: result[i].is_active,
                    created_by: result[i].created_by,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }
                console.log('KODE PENINDAKAN : ', result[i].kode_penindakan, ' | REGU : ', result[i].regu_id, ' | SHIFT : ', result[i].shift_id, ' | PETUGAS ID : ', result[i].petugas_id, ' | DATA IS ACTIVE : ', result[i].is_active);
                console.log('KODE UPPKB : ', result[i].kode_uppkb, ' | ARRAY SANKSI : [', arrsanksi, ']', ' | ARRAY PASAL : [', arrpasal, ']', ' | ARRAY SITAAN : [', arrsitaan, ']');
                console.log('TANGGAL PENINDAKAN : ', moment(result[i].tgl_penindakan).format('YYYY-MM-DD HH:mm:ss'), ' | NO KENDARAAN : ', result[i].no_kendaraan);
                // client.hgetall('session', async function (err, obj) {
                // if (obj != null) {

                await syncMidlewareToPostServer('post', 'v2pv/penindakan/create', field).then(async (resp) => {
                    if (resp.data.success) {
                        console.log('SINKRONISASI DATA BERHASIL');
                        var update_status = await updateStatusSyncToPusat(result[i].id, 'jt_penindakan');
                        console.log('UPDATE STATUS : ', update_status);
                    } else {
                        if (resp.data.message === 'Nomor Transaksi Sudah Tersedia') {
                            console.log(resp.data, 'SINKRONISASI DATA SUDAH TERSEDIA');
                            var update_status = await updateStatusSyncToPusat(result[i].id, 'jt_penindakan');
                            console.log('UPDATE STATUS : ', update_status);
                        } else {
                            console.log(resp.data, 'SINKRONISASI DATA GAGAL');
                        }
                    }
                }).catch(async (error) => {
                    console.log(error);
                    console.log('SINKRONISASI DATA GAGAL. ' + error);
                    // await synclogin();
                    await sleep(1000);
                    // await syncloginPusat();
                });

                await sleep(2000);
            }

        }
    } catch (error) {
        console.log(error);
        return 0;
    }
}

const getDetailPasal = async (kode, kode_uppkb) => {
    var sql = `SELECT * FROM jt_detail_penindakan_pasal WHERE kode_penindakan = '${kode}' AND kode_uppkb = '${kode_uppkb}';`;
    console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var arr = [];
        for (var i = 0; i < result.length; i++) {

            arr.push(result[i].pasal_id);
        }
        console.log(arr);
        return arr;
    } else {
        return [];
    }
}

const getDetailSanksi = async (kode, kode_uppkb) => {
    var sql = `SELECT * FROM jt_detail_penindakan_sanksi WHERE kode_penindakan = '${kode}' AND kode_uppkb = '${kode_uppkb}'`;
    //console.log(sql)    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var arr = [];
        for (var i = 0; i < result.length; i++) {
            arr.push(result[i].sub_sanksi_id);
        }
        return arr;
    } else {
        return [];
    }
}

const getDetailSitaan = async (kode, kode_uppkb) => {
    var sql = `SELECT * FROM jt_detail_penindakan_sitaan WHERE kode_penindakan = '${kode}' AND kode_uppkb = '${kode_uppkb}'`;
    //console.log(sql)    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var arr = [];
        for (var i = 0; i < result.length; i++) {
            arr.push(result[i].sitaan_id);
        }
        return arr;
    } else {
        return [];
    }
}

// cron.schedule(`0 0 */3 * * *`, async () => {
//     try {
//         await getPenindakan()
//     } catch (error) {
//         console.log(error)
//     }
// });

cron.schedule(`0 2 * * *`, async () => {
    try {
        await getPenindakan()
    } catch (error) {
        console.log(error)
    }
});