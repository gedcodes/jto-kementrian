const { sequelize, vr_pelanggaran, vr_detail_capture, vr_detail_pelanggaran, vr_detail_pasal } = require('../api/models');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { syncToPostServerWim } = require('../api/controllers/lib/sinkronisasi');

let hrstart = process.hrtime();
let time_str = 5;

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

/**
 * Konversi image URL ke base64
 * @param {string} imgUrl - URL atau path file gambar
 * @returns {Promise<string|null>} Base64 string atau null jika gagal
 */
const convertImageToBase64 = async (imgUrl) => {
    if (!imgUrl) return null;

    try {
        // Jika URL adalah path lokal
        if (imgUrl.startsWith('/') || imgUrl.includes('\\')) {
            const filePath = path.isAbsolute(imgUrl) ? imgUrl : path.join(config.path_upload, imgUrl);
            
            if (fs.existsSync(filePath)) {
                const imageBuffer = fs.readFileSync(filePath);
                const base64 = imageBuffer.toString('base64');
                // Deteksi mime type dari extension
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif',
                    '.webp': 'image/webp'
                };
                const mimeType = mimeTypes[ext] || 'image/jpeg';
                return `data:${mimeType};base64,${base64}`;
            }
        } else if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
            // Jika URL adalah HTTP/HTTPS, download dulu
            const axios = require('axios');
            try {
                const response = await axios.get(imgUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 10000 // 10 detik timeout
                });
                const base64 = Buffer.from(response.data).toString('base64');
                const contentType = response.headers['content-type'] || 'image/jpeg';
                return `data:${contentType};base64,${base64}`;
            } catch (axiosError) {
                console.error(`[SYNC VR] Error downloading image from URL ${imgUrl}:`, axiosError.message);
                return null;
            }
        } else {
            // Coba sebagai relative path dari upload directory atau berbagai kemungkinan path
            const possiblePaths = [
                path.join(config.path_upload, imgUrl),
                path.join(config.path_upload, 'verifikasi', imgUrl),
                path.join(config.path_upload, 'capture', imgUrl),
                imgUrl // Coba langsung sebagai absolute path
            ];

            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath)) {
                    const imageBuffer = fs.readFileSync(filePath);
                    const base64 = imageBuffer.toString('base64');
                    const ext = path.extname(filePath).toLowerCase();
                    const mimeTypes = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png',
                        '.gif': 'image/gif',
                        '.webp': 'image/webp'
                    };
                    const mimeType = mimeTypes[ext] || 'image/jpeg';
                    return `data:${mimeType};base64,${base64}`;
                }
            }
        }
    } catch (error) {
        console.error(`[SYNC VR] Error converting image ${imgUrl} to base64:`, error.message);
        return null;
    }

    return null;
};

/**
 * Update status sync_to_pusat menjadi TRUE (berhasil)
 */
const update_sync_to_pusat = async (id) => {
    const t = await sequelize.transaction();

    try {
        const sql = `UPDATE vr_pelanggaran SET
                    sync_to_pusat = TRUE
                  WHERE
                    id = :id`;

        const res_update = await sequelize.query(sql, {
            replacements: { id: id },
            type: QueryTypes.UPDATE,
            logging: false,
            transaction: t
        });

        await t.commit();
        return res_update[1] || 0;
    } catch (error) {
        await t.rollback();
        console.error(`[SYNC VR] Error update_sync_to_pusat for ID ${id}:`, error.message);
        return 0;
    }
};

/**
 * Ambil detail capture dengan konversi image ke base64
 */
const getDetailCapture = async (pelanggaranId) => {
    try {
        const captures = await vr_detail_capture.findAll({
            where: {
                pelanggaran_id: pelanggaranId,
                is_active: true,
                device_id: 1
            },
            order: [['created_at', 'ASC']]
        });

        const detailCaptures = await Promise.all(
            captures.map(async (capture) => {
                const captureData = capture.toJSON();
                
                // Konversi semua image URL ke base64
                const images = {};
                const imageFields = [
                    { url: 'img_url', base64: 'img_base64' },
                    { url: 'img2_url', base64: 'img2_base64' },
                    { url: 'img3_url', base64: 'img3_base64' },
                    { url: 'img4_url', base64: 'img4_base64' },
                    { url: 'img_plat_depan_url', base64: 'img_plat_depan_base64' }
                ];
                
                // Cek juga img_plat_belakang_url (jika ada di database)
                if (captureData.img_plat_belakang_url) {
                    imageFields.push({ url: 'img_plat_belakang_url', base64: 'img_plat_belakang_base64' });
                }
                
                for (const field of imageFields) {
                    if (captureData[field.url]) {
                        const base64Data = await convertImageToBase64(captureData[field.url]);
                        if (base64Data) {
                            images[field.base64] = base64Data;
                        }
                    }
                }

                return {
                    id: captureData.id,
                    jt_vr_data_id: captureData.jt_vr_data_id,
                    img_name: captureData.img_name,
                    img2_name: captureData.img2_name,
                    img3_name: captureData.img3_name,
                    img4_name: captureData.img4_name,
                    img_plat_depan_name: captureData.img_plat_depan_name,
                    img_plat_belakang_name: captureData.img_plat_belakang_name,
                    kd_pelanggaran: captureData.kd_pelanggaran,
                    tgl_capture: captureData.tgl_capture ? moment(captureData.tgl_capture).format('YYYY-MM-DD HH:mm:ss') : null,
                    is_plat: captureData.is_plat,
                    device_id: captureData.device_id,
                    is_active: captureData.is_active,
                    ...images // Include semua base64 images
                };
            })
        );

        return detailCaptures;
    } catch (error) {
        console.error(`[SYNC VR] Error getDetailCapture:`, error.message);
        return [];
    }
};

/**
 * Ambil detail pelanggaran
 */
const getDetailPelanggaran = async (pelanggaranId) => {
    try {
        const pelanggarans = await vr_detail_pelanggaran.findAll({
            where: {
                pelanggaran_id: pelanggaranId,
                is_active: true
            },
            order: [['created_at', 'ASC']]
        });

        return pelanggarans.map(p => {
            const data = p.toJSON();
            return {
                id: data.id,
                jenis_pelanggaran_id: data.jenis_pelanggaran_id,
                kode_pelanggaran: data.kode_pelanggaran,
                deskripsi: data.deskripsi,
                is_active: data.is_active,
            };
        });
    } catch (error) {
        console.error(`[SYNC VR] Error getDetailPelanggaran:`, error.message);
        return [];
    }
};

/**
 * Ambil detail pasal
 */
const getDetailPasal = async (pelanggaranId) => {
    try {
        const pasals = await vr_detail_pasal.findAll({
            where: {
                pelanggaran_id: pelanggaranId,
                is_active: true
            },
            order: [['created_at', 'ASC']]
        });

        return pasals.map(p => {
            const data = p.toJSON();
            return {
                id: data.id,
                pasal_id: data.pasal_id,
                desk_pasal: data.desk_pasal,
                is_active: data.is_active,
            };
        });
    } catch (error) {
        console.error(`[SYNC VR] Error getDetailPasal:`, error.message);
        return [];
    }
};

/**
 * Sinkronisasi data verifikasi pelanggaran ke server pusat
 */
const syncVerifikasiPelanggaran = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Ambil detail capture, pelanggaran, dan pasal
            const [detailCaptures, detailPelanggarans, detailPasals] = await Promise.all([
                getDetailCapture(data.id),
                getDetailPelanggaran(data.id),
                getDetailPasal(data.id)
            ]);

            // Prepare data untuk sinkronisasi
            const fieldPelanggaran = {
                tgl_pelanggaran: moment(data.tgl_pelanggaran).format('YYYY-MM-DD HH:mm:ss'),
                kd_pelanggaran: data.kd_pelanggaran,
                no_ref: data.no_ref,
                kode_uppkb: data.kode_uppkb,
                regu_id: data.regu_id,
                shift_id: data.shift_id,
                no_kendaraan: data.no_kendaraan ? data.no_kendaraan.toUpperCase() : null,
                no_uji: data.no_uji,
                tgl_uji: data.tgl_uji ? moment(data.tgl_uji).format('YYYY-MM-DD') : null,
                tgl_masa_berlaku: data.tgl_masa_berlaku ? moment(data.tgl_masa_berlaku).format('YYYY-MM-DD') : null,
                nama_pemilik: data.nama_pemilik,
                alamat_pemilik: data.alamat_pemilik,
                toleransi_komoditi: data.toleransi_komoditi,
                toleransi_uppkb: data.toleransi_uppkb,
                berat_timbang: data.berat_timbang,
                jbi_uji: data.jbi_uji,
                kelebihan_berat: data.kelebihan_berat,
                prosen_lebih: data.prosen_lebih,
                jbb_uji: data.jbb_uji,
                jbkb_uji: data.jbkb_uji,
                mst_uji: data.mst_uji,
                jenis_kendaraan_id: data.jenis_kendaraan_id,
                jenis_kendaraan: data.jenis_kendaraan,
                sumbu_id: data.sumbu_id,
                sumbu: data.sumbu,
                kategori_kepemilikan_id: data.kategori_kepemilikan_id,
                asal_kota_id: data.asal_kota_id,
                tujuan_kota_id: data.tujuan_kota_id,
                asal_kode_kota: data.asal_kode_kota,
                tujuan_kode_kota: data.tujuan_kode_kota,
                is_gandengan: data.is_gandengan || false,
                gandengan_no_uji: data.gandengan_no_uji,
                gandengan_tgl_uji: data.gandengan_tgl_uji ? moment(data.gandengan_tgl_uji).format('YYYY-MM-DD') : null,
                gandengan_masa_berlaku: data.gandengan_masa_berlaku,
                gandengan_jbi_uji: data.gandengan_jbi_uji,
                gandengan_jbki: data.gandengan_jbki,
                komoditi_id: data.komoditi_id,
                pemilik_komoditi: data.pemilik_komoditi,
                alamat_pemilik_komoditi: data.alamat_pemilik_komoditi,
                no_surat_jalan: data.no_surat_jalan,
                device_id: data.device_id,
                petugas_id: data.petugas_id,
                lokasi_id: data.lokasi_id,
                bptd_id: data.bptd_id,
                is_verified: data.is_verified || false,
                verified_at: data.verified_at ? moment(data.verified_at).format('YYYY-MM-DD HH:mm:ss') : null,
                verified_by: data.verified_by,
                keterangan: data.keterangan,
                panjang_utama: data.panjang_utama,
                panjang_toleransi: data.panjang_toleransi,
                panjang_ukur: data.panjang_ukur,
                panjang_lebih: data.panjang_lebih,
                lebar_utama: data.lebar_utama,
                lebar_toleransi: data.lebar_toleransi,
                lebar_ukur: data.lebar_ukur,
                lebar_lebih: data.lebar_lebih,
                tinggi_utama: data.tinggi_utama,
                tinggi_toleransi: data.tinggi_toleransi,
                tinggi_ukur: data.tinggi_ukur,
                tinggi_lebih: data.tinggi_lebih,
                foh_utama: data.foh_utama,
                foh_toleransi: data.foh_toleransi,
                foh_ukur: data.foh_ukur,
                foh_lebih: data.foh_lebih,
                roh_utama: data.roh_utama,
                roh_toleransi: data.roh_toleransi,
                roh_ukur: data.roh_ukur,
                roh_lebih: data.roh_lebih,
                qrcode_name: data.qrcode_name,
                qrcode_url: data.qrcode_url,
                is_print: data.is_print || false,
                print_url: data.print_url,
                tgl_capture: data.tgl_capture ? moment(data.tgl_capture).format('YYYY-MM-DD HH:mm:ss') : null,
                // Include detail capture, pelanggaran, dan pasal (format sesuai createWithImage)
                detailcapture: detailCaptures,
                detailpelanggaran: detailPelanggarans,
                detailpasal: detailPasals
            };

            // Hapus field yang null atau undefined
            Object.keys(fieldPelanggaran).forEach(key => {
                if (fieldPelanggaran[key] === null || fieldPelanggaran[key] === undefined) {
                    delete fieldPelanggaran[key];
                }
            });
            // console.log('FIELD PELANGGARAN : ', fieldPelanggaran);
            // resolve(fieldPelanggaran);
            await syncToPostServerWim(null, 'post', 'v2pv/vrpelanggaran/create/fromsync', fieldPelanggaran)
                .then(async (response) => {
                    resolve(response);
                })
                .catch((error) => {
                    console.error('[SYNC VR] Error syncVerifikasiPelanggaran:', error.message);
                    reject(error);
                });
        } catch (error) {
            console.error('[SYNC VR] Error syncVerifikasiPelanggaran:', error.message);
            reject(error);
        }
    });
};

/**
 * Proses sinkronisasi verifikasi pelanggaran
 */
const syncVerifikasiPelanggaranProcess = async () => {
    let start = new Date().getTime();
    hrstart = process.hrtime();

    try {
        // Query data yang belum di-sync
        const query = `SELECT * FROM vr_pelanggaran 
                      WHERE sync_to_pusat = FALSE 
                        AND is_active = TRUE
                        AND deleted_at IS NULL
                      ORDER BY tgl_pelanggaran ASC 
                      LIMIT 1`;

        const result = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length === 0) {
            // Tidak ada data yang perlu di-sync
            return;
        }

        const pelanggaranData = result[0];
        console.log(`[SYNC VR] Processing pelanggaran ID: ${pelanggaranData.id}, KD: ${pelanggaranData.kd_pelanggaran}`);

        try {
            const resp = await syncVerifikasiPelanggaran(pelanggaranData);
            console.log('[SYNC VR] RESP PUSAT:', resp?.data);

            if (resp?.data?.success) {
                // Sinkronisasi berhasil
                console.log(`[SYNC VR] SINKRONISASI DATA VERIFIKASI PELANGGARAN BERHASIL - ID: ${pelanggaranData.id}`);
                const update = await update_sync_to_pusat(pelanggaranData.id);
                if (update !== 0) {
                    console.log(`[SYNC VR] Update Sync To Pusat Berhasil - ID: ${pelanggaranData.id}`);
                } else {
                    console.error(`[SYNC VR] Update Sync To Pusat Gagal - ID: ${pelanggaranData.id}`);
                }
            } else {
                // Sinkronisasi gagal tapi ada response
                const errorMsg = resp?.data?.message || 'Unknown error';
                console.log(`[SYNC VR] SINKRONISASI DATA VERIFIKASI PELANGGARAN GAGAL - ID: ${pelanggaranData.id}, Message: ${errorMsg}`);

                if (errorMsg === 'Data Kendaraan Sudah Tersedia' || errorMsg.includes('sudah ada')) {
                    // Data sudah ada di pusat, mark as synced
                    const update = await update_sync_to_pusat(pelanggaranData.id);
                    if (update !== 0) {
                        console.log(`[SYNC VR] Update Status Pelanggaran Sudah Tersedia Berhasil - ID: ${pelanggaranData.id}`);
                    } else {
                        console.error(`[SYNC VR] Update Status Pelanggaran Sudah Tersedia Gagal - ID: ${pelanggaranData.id}`);
                    }
                }
            }
        } catch (error) {
            // Error saat sinkronisasi (network error, timeout, dll)
            // const errorMsg = error.message || error.toString();
            console.error(`[SYNC VR] SINKRONISASI DATA VERIFIKASI PELANGGARAN ERROR - ID: ${pelanggaranData.id}`);
        }

        console.log('[SYNC VR] << SELESAI PEMROSESAN >>');
        await sleep(5000);

    } catch (error) {
        console.error(`[SYNC VR] ERROR PROSESS FUNCTION SYNC VERIFIKASI PELANGGARAN:`, error);
    }

    const end = new Date().getTime();
    time_str = Math.round(((end - start) * 0.001) + 10);
    console.log('[SYNC VR] Execution time (ms):', time_str);

    const hrend = process.hrtime(hrstart);
    console.log('[SYNC VR] Execution time (s):', hrend[0]);
};

// Setup cron job untuk sinkronisasi setiap 5 detik
let isRunning = false;

cron.schedule(`*/5 * * * * *`, async () => {
    if (isRunning) {
        console.log('[SYNC VR] syncVerifikasiPelanggaranProcess masih berjalan, skip...');
        return;
    }
    isRunning = true;

    try {
        await syncVerifikasiPelanggaranProcess();
    } catch (error) {
        console.error('[SYNC VR] Error in cron job:', error);
    } finally {
        isRunning = false;
    }
});

console.log('[SYNC VR] Verifikasi Pelanggaran Sync Middleware started');
console.log('[SYNC VR] Sync interval: every 5 seconds');
