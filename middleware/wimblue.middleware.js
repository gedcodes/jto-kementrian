const { t_log_wim, sequelize } = require('../api/models');
const { Op } = require('sequelize');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
var cron = require('node-cron');
const timer = ms => new Promise(res => setTimeout(res, ms));
let tgl_now = moment().format('YYYY-MM-DD');
var hrstart = hrstart + 0;
var time_str = 5;
const { kelebihanBerat, prosenKelebihanBerat } = require('../api/lib/utilities')
const {
    checkMasaBerlaku,
} = require('../api/controllers/lib/penimbangan');
const {
    getToleransiDimensi,
} = require('../api/controllers/lib/dataid');
const {
    upsert,
} = require('../api/controllers/lib/integrasiblue');
const { urlSinkronisasiJto } = require('../api/controllers/lib/urlsinkron');
const { syncToPostServerWim } = require('../api/controllers/lib/sinkronisasi');


// var URL_SINK = await urlSinkronisasiJto();
// console.log('URL_SINK : ', URL_SINK);

const url_jto_login = `${process.env.APP_API_JTO_LOCAL}/v2pb/login`;
// const url_jto_blue = URL_SINK != 0 ? `${URL_SINK}/v2pb/jto/kendaraan/ujiberkala` : `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/ujiberkala`;
// const url_jto_blue = `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/ujiberkala`;
const url_jto_blue = `${process.env.APP_API_JTO_LOCAL}/v2pb/jto/kendaraan/ujiberkala`;
const url_jto_antrian = `${process.env.APP_API_JTO_LOCAL}/v2pb/wimpenimbangan/createwimsync`;

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

const synclogin = async () => {
    var data = JSON.stringify({
        "email": "super@gmail.com",
        "password": "hubdat1234"
    });

    var config = {
        method: 'post',
        url: url_jto_login,
        headers: {
            'Content-Type': 'application/json',
        },
        data: data
    };

    axios(config).then(function (result) {
        console.log(JSON.stringify(result.data));
        client.del("session");
        client.hmset("session", {
            'token_type': 'Bearer',
            'expires_in': result.data.expired,
            'access_token': result.data.accessToken,
            'refresh_token': result.data.refreshToken,
            'token': `Bearer ${result.data.accessToken}`
        });
    }).catch(function (error) {
        console.log(error);
    });
}

const checkblue_Older = async (nokend) => {
    return new Promise(async (resolve, reject) => {
        try {
            var config = {
                method: 'GET',
                timeout: 12000,
                url: `${url_jto_blue}?nokend=${nokend}`,//'http://localhost:2001/api/auth',
                headers: {}
            };
            console.log(`${url_jto_blue}?nokend=${nokend}`);

            axios(config).then(async function (response) {
                if (response.data != null) {
                    var data = response.data;
                    // console.log(data);
                    resolve(data);
                } else {
                    reject(0);
                }
            }).catch(function (error) {
                console.log(`NO KENDARAAN : ${nokend} - ERROR RESPONSE E-BLU`);
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
                reject(0);
            });
        } catch (error) {
            console.log(error);
            reject(error);
        }

    });

}


// const update_status_log_wim = async (id, is_status) => {
//     const t = await sequelize.transaction();

//     try {
//         var sql = `UPDATE jt_log_wim SET
//                     is_status = ${is_status}
//                   WHERE
//                     id = '${id}'`;

//         const res_update = await sequelize.query(sql, {
//             logging: false
//         }, { transaction: t })

//         await t.commit();
//         if (res_update[1].command == 'UPDATE') {
//             //console.log('UPDATE : ',res_update[1].command);
//             return 1;
//         } else {
//             return 0;
//         }
//     } catch (error) {
//         await t.rollback();
//     }
// }

const isPelanggaran = async (kode_uppkb, berat_timbang, jbi_uji, panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur, masa_berlaku) => {
    console.log('----------------------------------------------FIND PELANGGARAN-------------------------------------------------');

    if (kode_uppkb) {
        var is_melanggar = false;

        var onMasaBerlakuDate = moment(masa_berlaku, 'YYYY-MM-DD', true).isValid() ? moment(masa_berlaku).format('YYYY-MM-DD') : moment(masa_berlaku, 'DD-MM-YYYY').format('YYYY-MM-DD');

        console.log('FORMAT MASA BERLAKU DATE : ', moment(masa_berlaku, 'YYYY-MM-DD', true).isValid(), onMasaBerlakuDate);

        var status_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate); // moment(masa_berlaku, 'YYYY-MM-DD', true).isValid() ? await checkMasaBerlaku(onMasaBerlakuDate) : false;
        console.log('STATUS MASA BERLAKU : ', status_masa_berlaku);
        // var dokumen = req.body.dokumen;
        var kelebihan_berat = await kelebihanBerat(berat_timbang, jbi_uji);
        var prosen_kelebihan_berat = await prosenKelebihanBerat(berat_timbang, jbi_uji);

        if (status_masa_berlaku) {
            status_masa_berlaku = true;
        }

        var pelanggaran_da = false;
        if (prosen_kelebihan_berat > 3) {
            pelanggaran_da = true;
        }

        var toleransiDimensi = await getToleransiDimensi(panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur);

        var pelanggaran_dim = false;
        var overdimensi = '';
        if (toleransiDimensi.kelebihan_panjang > 0) {
            pelanggaran_dim = true;
            overdimensi = 'OD';
        }

        if (toleransiDimensi.kelebihan_lebar > 0) {
            pelanggaran_dim = true;
            overdimensi = 'OD';
        }

        if (toleransiDimensi.kelebihan_tinggi > 0) {
            pelanggaran_dim = true;
            overdimensi = 'OD';
        }

        if (toleransiDimensi.kelebihan_foh > 0) {
            pelanggaran_dim = true;
            overdimensi = 'OD';
        }

        if (toleransiDimensi.kelebihan_roh > 0) {
            pelanggaran_dim = true;
            overdimensi = 'OD';
        }

        var str = '';

        if (pelanggaran_da) {
            str += '1,';
        }

        if (pelanggaran_dim) {
            str += '2,';
        }

        if (!status_masa_berlaku) {
            str += '4,';
        }

        console.log('STR MELANGGAR: ', str);

        var data = {
            melanggar: str,
            kelebihan_berat: kelebihan_berat,
            prosen_kelebihan_berat: prosen_kelebihan_berat,
            overdimensi: overdimensi
        }

        return data;
    } else {
        return 0;
    }
}

const update_status_log_wim = async (id, is_status) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_log_wim SET
                    is_status = ${is_status}
                  WHERE
                    id = '${id}'`;

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

const postVmsWim = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (process.env.IS_INTEGRASI_VMS_WIM == 1) {
                var config = {
                    method: 'post',
                    url: `${process.env.APP_API_VMS_WIM}`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data,
                    timeout: 10000
                };
                console.log(`${process.env.APP_API_VMS_WIM}`);

                axios(config).then(async function (response) {
                    resolve(response)
                }).catch(async (error) => {
                    console.log(error);
                    reject(error);
                });
            }
        } catch (error) {
            reject(error);
        }

    });

}

const update_sync_to_pusat = async (id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_log_wim SET
                    sync_to_pusat = TRUE
                  WHERE
                    id = '${id}'`;

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

const SyncWim = async (data, is_status) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fieldWim = {
                kode_uppkb: data.kode_uppkb,
                kode_ruas: data.kode_ruas,
                no_kendaraan: data.no_kendaraan.toUpperCase(),
                tgl_penimbangan: moment(data.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                is_transaksi: data.is_transaksi,
                device_id: data.device_id,
                sumbu: data.sumbu,
                wim_kode: data.wim_kode,
                wim_berat: data.wim_berat,
                wim_panjang: data.wim_panjang,
                wim_lebar: data.wim_lebar,
                wim_tinggi: data.wim_tinggi,
                wim_foh: data.wim_foh,
                wim_roh: data.wim_roh,
                wim_kec: data.wim_kecepatan,
                foto_depan_name: data.foto_depan_name,
                foto_depan_url: data.foto_depan_url,
                foto_plat_no_name: data.foto_plat_no_name,
                foto_plat_no_url: data.foto_plat_no_url,
                axle_weight1: data.axle_weight1,
                axle_weight2: data.axle_weight2,
                axle_weight3: data.axle_weight3,
                axle_weight4: data.axle_weight4,
                axle_weight5: data.axle_weight5,
                axle_weight6: data.axle_weight6,
                axle_weight7: data.axle_weight7,
                axle_dis1: data.axle_dis1,
                axle_dis2: data.axle_dis2,
                axle_dis3: data.axle_dis3,
                axle_dis4: data.axle_dis4,
                axle_dis5: data.axle_dis5,
                axle_dis6: data.axle_dis6,
                axle_dis7: data.axle_dis7,
                jml_sumbu: data.jml_sumbu,
                ip_device: data.ip_device,
                is_status: is_status,
                ruas_id: data.ruas_id,
                is_melanggar: !data.is_melanggar ? (data.persen_kelebihan_berat > 5 || data.is_overdim) : data.is_melanggar,
                is_overload: !data.is_overload ? data.persen_kelebihan_berat > 5 : data.is_overload,
                is_overdim: data.is_overdim,
                persen_kelebihan_berat: data.persen_kelebihan_berat,
                jml_kelebihan_berat: data.jml_kelebihan_berat,
                persen_kelebihan_panjang: data.persen_kelebihan_panjang,
                jml_kelebihan_panjang: data.jml_kelebihan_panjang,
                persen_kelebihan_lebar: data.persen_kelebihan_lebar,
                jml_kelebihan_lebar: data.jml_kelebihan_lebar,
                persen_kelebihan_tinggi: data.persen_kelebihan_tinggi,
                jml_kelebihan_tinggi: data.jml_kelebihan_tinggi,
                batas_berat_kg: data.batas_berat_kg,
                batas_berat_kg_tol: data.batas_berat_kg_tol,
                batas_panjang_mm: data.batas_panjang_mm,
                batas_panjang_mm_tol: data.batas_panjang_mm_tol,
                batas_lebar_mm: data.batas_lebar_mm,
                batas_lebar_mm_tol: data.batas_lebar_mm_tol,
                batas_tinggi_mm: data.batas_tinggi_mm,
                batas_tinggi_mm_tol: data.batas_tinggi_mm_tol,

            }

            await syncToPostServerWim(null, 'post', 'v2pv/penimbangan/createwim', fieldWim).then(async (response) => {
                resolve(response)
            }).catch((error) => {
                // console.log(error);
                reject(error);
            });
        } catch (error) {
            reject(error);
        }

    });

}

const handleSyncFail = async (resWim, statusMsg) => {
    const update = update_status_log_wim(resWim.id, 3);
    if (update !== 0) console.log(`${statusMsg} Berhasil`);
    else console.log(`${statusMsg} Gagal`);

    try {
        const resp = await SyncWim(resWim, 3);
        if (resp.data.success) {
            console.log('SINKRONISASI DATA WIM BERHASIL');
            const update = update_sync_to_pusat(resWim.id);
            if (update !== 0) console.log('Update Sync To Pusat Berhasil');
            else console.log('Update Sync To Pusat Gagal');
        } else {
            console.log('SINKRONISASI DATA WIM GAGAL');
        }
    } catch (err) {
        console.log('SINKRONISASI DATA WIM GAGAL');
    }
}

const checkblue = async (nokend) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const qchecklokal = `SELECT * FROM jt_kendaraan WHERE no_reg_kend = '${nokend}' AND is_active = true LIMIT 1`;
            // const result = await sequelize.query(qchecklokal, {
            //     type: QueryTypes.SELECT,
            //     logging: false
            // });

            // if (result.length > 0) {
            //     console.log('DATA KENDARAAN LOKAL: ', result);
            //     resolve(result);
            // } else {

                const config = {
                    method: 'GET',
                    timeout: 12000,
                    url: `${url_jto_blue}?nokend=${nokend}`,
                    headers: {}
                };

                console.log(`Requesting: ${config.url}`);

                axios(config).then(async function (response) {
                    if (response.data != null) {
                        resolve(response.data);
                    } else {
                        reject(new Error("No data returned"));
                    }
                }).catch(function (error) {
                    console.error(`NO KENDARAAN : ${nokend} - ERROR RESPONSE E-BLU`);

                    if (error.code === 'ECONNABORTED') {
                        console.error("Request timeout after 12 seconds");
                        reject(new Error("Timeout: E-BLU tidak merespons"));
                    } else if (error.response) {
                        // 500,404
                        console.error("Response data:", error.response.data);
                        console.error("Response status:", error.response.status);
                        console.error("Response headers:", error.response.headers);
                        reject(new Error(`HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`));
                    } else {
                        // jaringan
                        console.error("Unknown error:", error.message);
                        reject(new Error(`Unknown error: ${error.message}`));
                    }
                });
            // }

        } catch (error) {
            console.error("Exception in checkblue:", error);
            reject(new Error(`Exception: ${error.message}`));
        }
    });
}

const create_antrian = async () => {
    let start = new Date().getTime();
    hrstart = process.hrtime();
    try {
        // const kode_ruas = 'WIM-TLG001';
        const qwim = `SELECT * FROM jt_log_wim WHERE DATE(tgl_penimbangan) = DATE(NOW()) AND is_status = 1 ORDER BY tgl_penimbangan DESC LIMIT 1`;
        const result = await sequelize.query(qwim, {
            type: QueryTypes.SELECT,
            logging: false
        });

        // console.log('Result: ', result);

        const length = result.length
        console.log('Length: ', length);

        if (result.length > 0) {
            //for (var i = 0; i < result.length; i++) {
            var device_id = result[0].device_id;
            var is_transaksi = result[0].is_transaksi;
            var kode_uppkb = result[0].kode_uppkb;
            var no_kendaraan = result[0].no_kendaraan.toUpperCase();
            var wim_kode = result[0].wim_kode;
            var tgl_penimbangan = result[0].tgl_penimbangan;
            var foto_depan_name = result[0].foto_depan_name;
            var foto_depan_url = result[0].foto_depan_url;
            var foto_plat_no_name = result[0].foto_plat_no_name;
            var foto_plat_no_url = result[0].foto_plat_no_url;
            var sumbu_wim = result[0].sumbu;
            var wim_berat = result[0].wim_berat;
            var wim_panjang = result[0].wim_panjang;
            var wim_lebar = result[0].wim_lebar;
            var wim_tinggi = result[0].wim_tinggi;
            var wim_foh = result[0].wim_foh;
            var wim_roh = result[0].wim_roh;
            var wim_kecepatan = result[0].wim_kecepatan;
            // console.log('FROM WIM: ', moment(result[0].tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), result[0].foto_depan_url);
            var eblue = null;
            try {
                eblue = await checkblue(no_kendaraan);
            } catch (err) {
                console.log(`ERROR FETCH BLUE (${no_kendaraan})`);//console.log(`ERROR FETCH BLUE (${no_kendaraan}): ${err.message}`);
            }
            if (eblue && eblue.data) {
                var resblue = eblue.data;
                console.log('RESPON BLUE: ', resblue);
                console.log(url_jto_antrian);
                //if (resblue) {
                    // var arr = [];
                    // arr.push(resblue);
        
                    // var foto_depan_blue_url = '';
                    // var foto_belakang_blue_url = '';
                    // var foto_kiri_blue_url = '';
                    // var foto_kanan_blue_url = '';
        
                    // var foto_depan_blue = '';
                    // var foto_belakang_blue = '';
                    // var foto_kiri_blue = '';
                    // var foto_kanan_blue = '';
        
                    // var upsert_data = await upsert(
                    //     resblue.rfid || '',
                    //     resblue.vcode || '',
                    //     resblue.no_reg_kend,
                    //     resblue.no_uji || '',
                    //     resblue.nama_pemilik || '',
                    //     resblue.alamat_pemilik || '',
                    //     resblue.lokasi_uji || '',
                    //     resblue.tanggal_uji,
                    //     resblue.masa_berlaku_uji,
                    //     resblue.jenis_kend || '',
                    //     resblue.konfigurasi_sumbu || '',
                    //     resblue.berat_kosong || null,
                    //     resblue.jbb || null,
                    //     resblue.jbkb || null,
                    //     resblue.jbi || null,
                    //     resblue.jbki || null,
                    //     resblue.panjang_utama || null,
                    //     resblue.lebar_utama || null,
                    //     resblue.tinggi_utama || null,
                    //     resblue.julur_depan || null,
                    //     resblue.julur_belakang || null,
                    //     foto_depan_blue || '',
                    //     foto_kanan_blue || '',
                    //     foto_kiri_blue || '',
                    //     resblue.nomor_rangka || '',
                    //     resblue.merek || '',
                    //     resblue.bahan_bakar || '',
                    //     resblue.daya_angkut_orang || null,
                    //     resblue.daya_angkut_barang || null,
                    //     resblue.kelas,
                    //     moment().format('YYYY-MM-DD HH:mm:ss'),
                    //     moment().format('YYYY-MM-DD HH:mm:ss'),
                    //     resblue.created_by,
                    //     resblue.is_masa_berlaku,
                    //     true,
                    //     foto_belakang_blue || '',
                    //     foto_depan_blue_url,
                    //     foto_belakang_blue_url || '',
                    //     foto_kanan_blue_url || '',
                    //     foto_kiri_blue_url || '',
                    //     resblue.created_by,
                    //     resblue.jenis_kendaraan_id || null,
                    //     resblue.sumbu_id || null,
                    //     resblue.blue_id || null,
                    //     resblue.no_srut || '',
                    //     resblue.tgl_srut || null,
                    //     resblue.no_mesin || '',
                    //     resblue.tipe || '',
                    //     resblue.tahun_rakit || null,
                    //     resblue.isi_silinder || '',
                    //     resblue.daya_motor || '',
                    //     resblue.ukuran_ban || '',
                    //     resblue.keterangan_hasil_uji || '',
                    //     resblue.petugas_penguji || '',
                    //     resblue.nrp_petugas_penguji || '',
                    //     resblue.kepala_dinas || '',
                    //     resblue.pangkat_kepala_dinas || '',
                    //     resblue.nip_kepala_dinas || '',
                    //     resblue.unit_pelaksana_teknis || '',
                    //     resblue.direktur || '',
                    //     resblue.pangkat_direktur || '',
                    //     resblue.nip_direktur || '',
                    //     resblue.etl_date || null,
                    //     resblue.jarak_sumbu_1_2 || 0,
                    //     resblue.jarak_sumbu_2_3 || 0,
                    //     resblue.jarak_sumbu_3_4 || 0,
                    //     resblue.dimensi_bak_tangki || null,
                    //     resblue.mst || 0,
                    //     resblue.kepemilikan_id || null,
                    //     resblue.kepemilikan_val || null);
                    // console.log('UPSERT DATA KENDARAAN : ', upsert_data.length);
                    // if (upsert_data && upsert_data.length > 0) {
                    //     console.log('UPSERT DATA KENDARAAN BERHASIL');
                    // } else {
                    //     console.log('UPSERT DATA KENDARAAN GAGAL');
                    // }

                    var dataMelanggar = await isPelanggaran(kode_uppkb, wim_berat, resblue.jbi, resblue.panjang_utama, resblue.lebar_utama, resblue.tinggi_utama, resblue.julur_depan, resblue.julur_belakang, wim_panjang, wim_lebar, wim_tinggi, wim_foh, wim_roh, resblue.masa_berlaku_uji);

                    var attb = {
                        'is_transaksi': is_transaksi,
                        'device_id': device_id,
                        'kode_uppkb': kode_uppkb,
                        // 'kode_ruas': kode_ruas,
                        'tgl_penimbangan': moment(tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'),
                        'no_kendaraan': no_kendaraan,
                        'no_uji': resblue.no_uji,
                        'tgl_masa_berlaku': resblue.masa_berlaku_uji,
                        'kategori_kepemilikan_id': resblue.kepemilikan_id,
                        'nama_pemilik': resblue.nama_pemilik,
                        'alamat_pemilik': resblue.alamat_pemilik,
                        'jenis_kendaraan': resblue.jenis_kend,
                        'sumbu': resblue.konfigurasi_sumbu,
                        'berat_timbang': '0',
                        'jbi_uji': resblue.jbi,
                        'mst_uji': '0',
                        'panjang_utama': resblue.panjang_utama,
                        'lebar_utama': resblue.lebar_utama,
                        'tinggi_utama': resblue.tinggi_utama,
                        'foh_utama': resblue.julur_depan,
                        'roh_utama': resblue.julur_belakang,
                        'pelanggaran': dataMelanggar.melanggar,
                        'foto_depan': foto_depan_name, //fs.createReadStream('D:/Picture/anpr/2023_03_15_13_41_59_1678862519548.jpg'),
                        'foto_depan_url': foto_depan_url, //fs.createReadStream('D:/Picture/anpr/2023_03_15_13_41_59_1678862519548.jpg'),
                        'plate_no_img_name': foto_plat_no_name, //fs.createReadStream('D:/Picture/anpr/testing/2023_03_14__16_16_56_da271645df9f43f32130bd3c192ed8de8c71.jpeg'),
                        'plate_no_img_url': foto_plat_no_url, //fs.createReadStream('D:/Picture/anpr/testing/2023_03_14__16_16_56_da271645df9f43f32130bd3c192ed8de8c71.jpeg'),
                        'wim_berat': wim_berat,
                        'wim_panjang': wim_panjang,
                        'wim_lebar': wim_lebar,
                        'wim_tinggi': wim_tinggi,
                        'wim_foh': wim_foh,
                        'wim_roh': wim_roh,
                        'wim_kec': wim_kecepatan,
                        'iact': true
                    }

                    console.log(attb);

                    var config = {
                        method: 'post',
                        timeout: 10000,
                        url: `${url_jto_antrian}`,//'http://localhost:2001/api/auth',
                        data: attb,
                        headers: {}
                    };

                    await axios(config).then(async function (response) {
                        if (response.data != null) {
                            var data = response.data;
                            console.log(data);
                            var update = await update_status_log_wim(result[0].id, 2);
                            if (update != 0) {
                                console.log('Set Antrian Penimbangan Berhasil');
                            } else {
                                console.log('Set Antrian Penimbangan Gagal');
                            }
                            // return data;
                            if (process.env.IS_INTEGRASI_VMS_WIM == 1) {

                                var dataVms = JSON.stringify({
                                    "stationId": kode_uppkb,
                                    "deviceId": device_id,
                                    "msgType": "71",
                                    "data": {
                                        "previewTime": moment(tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                        "pubMsgType": 0,
                                        "plateNo": no_kendaraan,
                                        "laneId": 1,
                                        "direction": 1,
                                        "totalMass": wim_berat,
                                        "overLoad": dataMelanggar.kelebihan_berat,
                                        "overLoadRate": Math.ceil(dataMelanggar.prosen_kelebihan_berat, 2),
                                        "pubMsg": dataMelanggar.overdimensi
                                    }
                                })
                                // console.log('DATA VMS : ', dataVms);
                                await postVmsWim(dataVms).then((resp) => {
                                    var res = resp.data;
                                    if (res.code == 200) {
                                        console.log('POST DATA VMS BERHASIL');
                                        console.log('RESPOND DARA VMS WIM : ', res);
                                    } else {
                                        console.log('POST DATA VMS GAGAL');
                                    }
                                }).catch((error) => {
                                    console.log('POST DATA VMS GAGAL');
                                });
                            }

                            await SyncWim(result[0], 2).then(async (resp) => {
                                console.log('RESP PUSAT: ', resp.data);

                                if (resp.data.success) {
                                    console.log('SINKRONISASI DATA WIM BERHASIL');
                                    var update = await update_sync_to_pusat(result[0].id);
                                    if (update != 0) {
                                        console.log('Update Sync To Pusat Berhasil');
                                    } else {
                                        console.log('Update Sync To Pusat Gagal');
                                    }
                                } else {
                                    console.log('SINKRONISASI DATA WIM GAGAL');
                                }

                            }).catch((error) => {
                                console.log('SINKRONISASI DATA WIM GAGAL');
                            });


                        } else {
                            var update = await update_status_log_wim(result[0].id, 3);
                            if (update != 0) {
                                console.log('Update Status Blue Tidak Tersedia Berhasil');
                            } else {
                                console.log('Update Status Blue Tidak Tersedia Gagal');
                            }
                            await SyncWim(result[0], 3).then(async (resp) => {
                                console.log('RESP PUSAT: ', resp.data);

                                if (resp.data.success) {
                                    console.log('SINKRONISASI DATA WIM BERHASIL');
                                    var update = await update_sync_to_pusat(result[0].id);
                                    if (update != 0) {
                                        console.log('Update Sync To Pusat Berhasil');
                                    } else {
                                        console.log('Update Sync To Pusat Gagal');
                                    }
                                } else {
                                    console.log('SINKRONISASI DATA WIM GAGAL');
                                }

                            }).catch((error) => {
                                console.log('SINKRONISASI DATA WIM GAGAL');
                            });

                        }
                    }).catch(function (error) {
                        console.log(`NO KENDARAAN : ${no_kendaraan} RESULT ID: ${result[0].id} - ERROR RESPONSE E-BLU`);
                        if (error.response) {
                            console.log(error.response.data);
                            console.log(error.response.status);
                            console.log(error.response.headers);
                        }
                        var update = update_status_log_wim(result[0].id, 3);
                        if (update != 0) {
                            console.log('Update Status Blue Tidak Tersedia Berhasil');
                        } else {
                            console.log('Update Status Blue Tidak Tersedia Gagal');
                        }

                    });
            } else {
                console.log('RESPON BLUE UNDEFINE OR 0');
                var update = await update_status_log_wim(result[0].id, 3);
                if (update != 0) {
                    console.log('Update Status Blue Tidak Tersedia Berhasil');
                } else {
                    console.log('Update Status Blue Tidak Tersedia Gagal');
                }

                await SyncWim(result[0], 3).then(async (resp) => {
                    console.log('RESP PUSAT: ', resp.data);

                    if (resp.data.success) {
                        console.log('SINKRONISASI DATA WIM BERHASIL');
                        var update = await update_sync_to_pusat(result[0].id);
                        if (update != 0) {
                            console.log('Update Sync To Pusat Berhasil');
                        } else {
                            console.log('Update Sync To Pusat Gagal');
                        }
                    } else {
                        // console.log(resp.data);
                        console.log('SINKRONISASI DATA WIM GAGAL');
                    }

                }).catch((error) => {
                    // console.log(error);
                    console.log('SINKRONISASI DATA WIM GAGAL');
                });
            }

            console.log('<< SELESAI PEMROSESAN >>');
            // console.log(kode_uppkb, ' | ', no_kendaraan);
            await sleep(5000);
            //}
        }
    } catch (error) {
        console.log(`ERROR PROSESS FUNCTION CREATE ANTRIAN : `, error);
    }
    var end = new Date().getTime();
    time_str = Math.round(((end - start) * 0.001) + 10);
    //time_str = time.replace('ms','');
    console.log('Execution time (ms): ', time_str);

    var hrend = process.hrtime(hrstart);
    console.log('Execution time (s): %d', hrend[0]);
}



// checkblue('BG8097OW');
// create_antrian();
let isRunning = false;

cron.schedule(`*/3 * * * * *`, async () => {
    if (isRunning) {
        console.log('create_antrian masih berjalan, skip...');
        return;
    }
    isRunning = true;

    try {
        await create_antrian();
    } catch (error) {
        console.log(error);
    } finally {
        isRunning = false;
    }
});
