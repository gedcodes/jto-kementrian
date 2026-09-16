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
    syncMidlewareToPostServerWithImg
} = require('../api/controllers/lib/sinkronisasi');

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}


const getPenimbangan = async () => {
    console.log()
    try {
        // var sql = `SELECT * FROM jt_penimbangan WHERE  is_transaksi = 1 AND date_part('month', tgl_penimbangan) = ${bulan} AND device_id = 3 ORDER BY tgl_penimbangan DESC LIMIT 2`;
        var sql = `SELECT * FROM jt_penimbangan WHERE is_transaksi = 1 AND sync_to_pusat = false ORDER BY tgl_penimbangan DESC limit 200`;
        //var sql = `SELECT * FROM jt_penimbangan WHERE kode_trx = 'T015895B9271RD/LSN00168/0722' ORDER BY tgl_penimbangan DESC`;

        console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            for (var i = 0; i < result.length; i++) {
                var komoditi = await getDetailMuatan(result[i].kode_trx, result[i].kode_uppkb);
                var arrkomoditi = komoditi ? komoditi.join() : '';
                var dokumen = await getDetailDokumen(result[i].kode_trx, result[i].kode_uppkb);
                var arrdokumen = dokumen.length > 0 ? dokumen.join() : '';

                var pelanggaran = await getDetailPelanggaran(result[i].kode_trx, result[i].kode_uppkb);
                // console.log('PELANGGARAN : ',pelanggaran);
                var arrpelanggaran = pelanggaran.length > 0 ? pelanggaran.join() : '';
                const field = {
                    kode_trx: result[i].kode_trx,
                    regu_id: result[i].regu_id ? result[i].regu_id : null,
                    shift_id: result[i].shift_id ? result[i].shift_id : null,
                    petugas_id: result[i].petugas_id ? result[i].petugas_id : null,
                    bptd_id: result[i].bptd_id,
                    lokasi_id: result[i].lokasi_id,
                    kode_uppkb: result[i].kode_uppkb,
                    timbangan_id: result[i].timbangan_id ? result[i].timbangan_id : null,
                    tgl_penimbangan: moment(result[i].tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_antrian: moment(result[i].tgl_antrian).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    no_kendaraan: result[i].no_kendaraan.toUpperCase(),
                    no_uji: result[i].no_uji.toUpperCase(),
                    tgl_uji: moment(result[i].tgl_masa_berlaku).subtract(6, 'months').format('YYYY-MM-DD'),
                    tgl_masa_berlaku: result[i].tgl_masa_berlaku, // moment(result[i].tgl_masa_berlaku).format('YYYY-MM-DD'),
                    kategori_kepemilikan_id: result[i].kategori_kepemilikan_id ? result[i].kategori_kepemilikan_id : null,
                    nama_pemilik: result[i].nama_pemilik,
                    alamat_pemilik: result[i].alamat_pemilik,
                    asal_kota_id: result[i].asal_kota_id,
                    tujuan_kota_id: result[i].tujuan_kota_id,
                    asal_kode_kota: result[i].asal_kota_id,
                    tujuan_kode_kota: result[i].tujuan_kota_id,
                    toleransi_komoditi: result[i].toleransi_komoditi,
                    toleransi_uppkb: result[i].toleransi_uppkb,
                    kelebihan_berat: result[i].kelebihan_berat,
                    prosen_lebih: result[i].prosen_lebih,
                    komoditi: arrkomoditi,
                    berat_timbang: Number(result[i].berat_timbang),
                    use_toleransi: Number(result[i].use_toleransi),
                    jbi_uji: Number(result[i].jbi_uji),
                    mst_uji: Number(result[i].mst_uji),
                    jbb_uji: Number(result[i].jbb_uji),
                    jbkb_uji: Number(result[i].jbkb_uji),
                    dokumen: arrdokumen,
                    is_gandengan: result[i].is_gandengan ? result[i].is_gandengan : false,
                    is_transaksi: result[i].is_transaksi,
                    is_transfer: result[i].is_transfer,
                    is_tindakan: result[i].is_tindakan,
                    device_id: result[i].device_id,
                    komoditi_id: result[i].komoditi_id,
                    kategori_komoditi_id: result[i].kategori_komoditi_id,
                    nama_pengemudi: result[i].nama_pengemudi ? result[i].nama_pengemudi : '',
                    alamat_pengemudi: result[i].alamat_pengemudi ? result[i].alamat_pengemudi : '',
                    umur_pengemudi: result[i].umur_pengemudi ? result[i].umur_pengemudi : null,
                    jenis_kendaraan_id: result[i].jenis_kendaraan_id || jenis_kendaraan_id,
                    jenis_kendaraan: result[i].jenis_kendaraan,
                    sumbu_id: result[i].sumbu_id || sumbu_id,
                    sumbu: result[i].sumbu,
                    gol_sim_id: result[i].gol_sim_id ? result[i].gol_sim_id : null,
                    no_sim: result[i].no_sim ? result[i].no_sim : '',
                    panjang_utama: result[i].panjang_utama ? Number(result[i].panjang_utama) : 0,
                    panjang_toleransi: result[i].panjang_toleransi ? Number(result[i].panjang_toleransi) : 0,
                    panjang_ukur: result[i].panjang_ukur ? Number(result[i].panjang_ukur) : 0,
                    panjang_lebih: result[i].panjang_lebih ? Number(result[i].panjang_lebih) : 0,
                    lebar_utama: result[i].lebar_utama ? Number(result[i].lebar_utama) : 0,
                    lebar_toleransi: result[i].lebar_toleransi ? Number(result[i].lebar_toleransi) : 0,
                    lebar_ukur: result[i].lebar_ukur ? Number(result[i].lebar_ukur) : 0,
                    lebar_lebih: result[i].lebar_lebih ? Number(result[i].lebar_lebih) : 0,
                    tinggi_utama: result[i].tinggi_utama ? Number(result[i].tinggi_utama) : 0,
                    tinggi_toleransi: result[i].tinggi_toleransi ? Number(result[i].tinggi_toleransi) : 0,
                    tinggi_ukur: result[i].tinggi_ukur ? Number(result[i].tinggi_ukur) : 0,
                    tinggi_lebih: result[i].tinggi_lebih ? Number(result[i].tinggi_lebih) : 0,
                    foh_utama: result[i].foh_utama ? Number(result[i].foh_utama) : 0,
                    foh_toleransi: result[i].foh_toleransi ? Number(result[i].foh_toleransi) : 0,
                    foh_ukur: result[i].foh_ukur ? Number(result[i].foh_ukur) : 0,
                    foh_lebih: result[i].foh_lebih ? Number(result[i].foh_lebih) : 0,
                    roh_utama: result[i].roh_utama ? Number(result[i].roh_utama) : 0,
                    roh_toleransi: result[i].roh_toleransi ? Number(result[i].roh_toleransi) : 0,
                    roh_ukur: result[i].roh_ukur ? Number(result[i].roh_ukur) : 0,
                    roh_lebih: result[i].roh_lebih ? Number(result[i].roh_lebih) : 0,
                    wim_berat: Number(result[i].wim_berat) || 0,
                    wim_panjang: Number(result[i].wim_panjang) || 0,
                    wim_lebar: Number(result[i].wim_lebar) || 0,
                    wim_tinggi: Number(result[i].wim_tinggi) || 0,
                    wim_foh: Number(result[i].wim_foh) || 0,
                    wim_roh: Number(result[i].wim_roh) || 0,
                    wim_kec: Number(result[i].wim_kec) || 0,
                    pemilik_komoditi: result[i].pemilik_komoditi,
                    alamat_pemilik_komoditi: result[i].alamat_pemilik_komoditi,
                    no_surat_jalan: result[i].no_surat_jalan,
                    is_melanggar: result[i].is_melanggar,
                    pelanggaran: arrpelanggaran,
                    gandengan_no_uji: result[i].gandengan_no_uji ? result[i].gandengan_no_uji : 0,
                    gandengan_tgl_uji: (result[i].gandengan_tgl_uji) ? moment(result[i].gandengan_masa_berlaku).subtract(6, 'months').format('YYYY-MM-DD') : '',
                    gandengan_masa_berlaku: (result[i].gandengan_masa_berlaku) ? moment(result[i].gandengan_masa_berlaku).format('YYYY-MM-DD HH:mm:ss') : '',
                    gandengan_jbi_uji: result[i].gandengan_jbi_uji ? result[i].gandengan_jbi_uji : 0,
                    gandengan_jbki: result[i].gandengan_jbki ? result[i].gandengan_jbki : 0,
                    is_surat_tilang: result[i].is_surat_tilang,
                    no_ba_tilang: result[i].no_ba_tilang ? result[i].no_ba_tilang : '',
                    foto_depan: result[i].foto_depan,
                    foto_belakang: result[i].foto_belakang,
                    foto_kiri: result[i].foto_kiri,
                    foto_kanan: result[i].foto_kanan,
                    foto_depan_url: result[i].foto_depan_url,
                    foto_belakang_url: result[i].foto_belakang_url,
                    foto_kiri_url: result[i].foto_kiri_url,
                    foto_kanan_url: result[i].foto_kanan_url,
                    foto_plate_no: result[i].foto_plate_no,
                    foto_plate_no_url: result[i].foto_plate_no_url,
                    plate_no_img_name: result[i].plate_no_img_name,
                    plate_no_img_url: result[i].plate_no_img_url,
                    plate_no_confidance: result[i].plate_no_confidance,
                    iact: result[i].is_active,
                    created_by: result[i].created_by,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_by: result[i].update_by || null,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                }
                const capturedImages = {
					fotoDepan: result[i].foto_depan ? path.join(config.path_upload) + '/penimbangan/' + result[i].foto_depan : '',
					fotoBelakang: result[i].foto_belakang ? path.join(config.path_upload) + '/penimbangan/' + result[i].foto_belakang : '',
				};
                console.log('KODE TRX : ', result[i].kode_trx, ' | REGU : ', result[i].regu_id, ' | SHIFT : ', result[i].shift_id, ' | PETUGAS ID : ', result[i].petugas_id, ' | DATA IS ACTIVE : ', result[i].is_active);
                console.log('KODE UPPKB : ', result[i].kode_uppkb, ' | ARRAY KOMODITI : [', arrkomoditi, ']', ' | ARRAY DOKUMEN : [', arrdokumen, ']', ' | ARRAY PELANGGARAN : [', arrpelanggaran, ']');
                console.log('TANGGAL PENIMBANGAN : ', moment(result[i].tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), ' | NO KENDARAAN : ', result[i].no_kendaraan);
                // client.hgetall('session', async function (err, obj) {
                // if (obj != null) {

                await syncMidlewareToPostServerWithImg('post', 'v2pv/penimbangan/create', field, capturedImages).then(async (resp) => {
                    if (resp.data.success) {
                        console.log('SINKRONISASI DATA BERHASIL');
                        var update_status = await updateStatusSyncToPusat(result[i].id, 'jt_penimbangan');
                        console.log('UPDATE STATUS : ', update_status);
                    } else {
                        if (resp.data.message === 'Nomor Transaksi Sudah Tersedia') {
                            console.log(resp.data, 'SINKRONISASI DATA SUDAH TERSEDIA');
                            var update_status = await updateStatusSyncToPusat(result[i].id, 'jt_penimbangan');
                            console.log('UPDATE STATUS : ', update_status);
                        } else if (resp.data.message = 'Data Kendaraan Sudah Tersedia') {
                            console.log(resp.data, 'SINKRONISASI DATA SUDAH TERSEDIA');
                            var update_status = await updateStatusSyncToPusat(result[i].id, 'jt_penimbangan');
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

const getDetailMuatan = async (kode_trx, kode_uppkb) => {
    var sql = `SELECT * FROM jt_detail_muatan WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}';`;
    console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var arr = [];
        for (var i = 0; i < result.length; i++) {

            arr.push(result[i].komoditi_id);
        }
        console.log(arr);
        return arr;
    } else {
        return [];
    }
}

const getDetailDokumen = async (kode_trx, kode_uppkb) => {
    var sql = `SELECT * FROM jt_detail_dokumen WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;
    //console.log(sql)    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var arr = [];
        for (var i = 0; i < result.length; i++) {
            arr.push(result[i].dokumen_id);
        }
        return arr;
    } else {
        return [];
    }
}

const getDetailPelanggaran = async (kode_trx, kode_uppkb) => {
    var sql = `SELECT * FROM jt_pelanggaran WHERE kode_trx = '${kode_trx}' AND kode_uppkb = '${kode_uppkb}'`;
    //console.log(sql)    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    if (result.length > 0) {
        var arr = [];
        for (var i = 0; i < result.length; i++) {
            arr.push(result[i].jenis_pelanggaran_id);
        }
        return arr;
    } else {
        return [];
    }
}

// cron.schedule(`0 0 */3 * * *`, async () => {
//     try {
//         await getPenimbangan()
//     } catch (error) {
//         console.log(error)
//     }
// });

cron.schedule(`0 0 * * *`, async () => {
    try {
        await getPenimbangan()
    } catch (error) {
        console.log(error)
    }
});