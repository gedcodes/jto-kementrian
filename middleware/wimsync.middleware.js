const { sequelize } = require('../api/models');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
var cron = require('node-cron');
var hrstart = hrstart + 0;
var time_str = 5;
const { syncToPostServerWim } = require('../api/controllers/lib/sinkronisasi');

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
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

const delete_log_wim = async (id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_log_wim
                  WHERE
                    id = '${id}'`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('DELETE : ',res_delete[1].command);
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

const validateLicensePlate = (licensePlate) => {
    // Format nomor plat: 1 huruf, 4 angka, 3 huruf (tanpa spasi)
    var regex = /^[A-Z]{1,2}\d{1,4}[A-Z]{1,3}$/g; // /^[A-Z]{1,}\d{5,}[A-Z]{2,}$/;

    return regex.test(licensePlate);
}

const create_wim = async () => {
    let start = new Date().getTime();
    hrstart = process.hrtime();
    try {
        // const kode_ruas = 'WIM-TLG001';
        const qwim = `SELECT * FROM jt_log_wim WHERE sync_to_pusat = FALSE AND is_status != 1 ORDER BY tgl_penimbangan DESC LIMIT 1`;
        const result = await sequelize.query(qwim, {
            type: QueryTypes.SELECT,
            logging: false
        });

        console.log('Result: ', result);

        const length = result.length
        console.log('Length: ', length);

        if (result.length > 0) {

            if (result[0].no_kendaraan != '' && validateLicensePlate(result[0].no_kendaraan.toUpperCase())) {
                await SyncWim(result[0], result[0].is_status).then(async (resp) => {
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
                        if (resp.data.message == 'Data Kendaraan Sudah Tersedia') {
                            var update = await update_sync_to_pusat(result[0].id);
                            if (update != 0) {
                                console.log('Update Status Log WIM Sudah Tersedia Berhasil');
                            } else {
                                console.log('Update Status Log WIM Sudah Tersedia Gagal');
                            }
                        }
                        console.log('SINKRONISASI DATA WIM GAGAL');
                    }

                }).catch((error) => {
                    console.log('SINKRONISASI DATA WIM GAGAL');
                });
            } else {
                console.log('Nomor Kendaraan Tidak Valid');
                var update = await delete_log_wim(result[0].id);
                if (update != 0) {
                    console.log('Delete Log WIM Nomor Kendaraan Tidak Valid Berhasil');
                } else {
                    console.log('Delete Log WIM Nomor Kendaraan Tidak Valid Gagal');
                }
            }

            console.log('<< SELESAI PEMROSESAN >>');
            // console.log(kode_uppkb, ' | ', no_kendaraan);
            await sleep(5000);
            //}
        }
    } catch (error) {
        console.log(`ERROR PROSESS FUNCTION CREATE WIM : `, error);
    }
    var end = new Date().getTime();
    time_str = Math.round(((end - start) * 0.001) + 10);
    //time_str = time.replace('ms','');
    console.log('Execution time (ms): ', time_str);

    var hrend = process.hrtime(hrstart);
    console.log('Execution time (s): %d', hrend[0]);
}



// checkblue('BG8097OW');
// create_wim();
let isRunning = false;

cron.schedule(`*/5 * * * * *`, async () => {
    if (isRunning) {
        console.log('create_wim masih berjalan, skip...');
        return;
    }
    isRunning = true;

    try {
        await create_wim();
    } catch (error) {
        console.log(error);
    } finally {
        isRunning = false;
    }
});
