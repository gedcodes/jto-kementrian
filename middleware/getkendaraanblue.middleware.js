const { sequelize } = require('../api/models');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const { getJenisKendaraanId, getSumbuId, getKepemilikanId, getKepemilikanVal, checkMasaBerlaku } = require('../api/controllers/lib/dataid');

// Variabel untuk menyimpan token
let currentToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJwb3J0YWxfb3Blbl9hcGlfYXBwcyIsImlhdCI6MTc2MTAxNjQ2MywiZXhwIjoxNzkyNTUyNDYzLCJuYmYiOjE3NjEwMTY0NjMsInVzZXIiOnsiaWQiOiJhMjkxMTAxMC04YjRjLTQ5NmItOTY5Ni0zZTM0YTcyMWQ2NzQifX0.l4J28Z382RBpJ9kHd02XbYhnRwAIyxM7x9MIzoqmMrI";

// Counter untuk retry
let retryCount = 0;
const MAX_RETRY_COUNT = 5;
const RETRY_DELAY = 5000; // 5 detik

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

// Fungsi untuk login dan mendapatkan token baru
async function loginAndGetToken() {
    const loginEndpoint = 'https://api-gateway.hubdat.dephub.go.id/auth-service/auth/open/token';
    
    const loginData = {
        email: "noviehp@gmail.com",
        password: "5eI7&D£z"
    };

    try {
        const response = await axios.post(loginEndpoint, loginData, {
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 10000
        });

        if (response.data && response.data.data && response.data.data.token) {
            currentToken = response.data.data.token;
            console.log('Token berhasil diperbarui');
            return currentToken;
        } else {
            throw new Error('Token tidak ditemukan dalam response login');
        }
    } catch (error) {
        console.error('Gagal melakukan login:', error.message);
        throw error;
    }
}

// Fungsi untuk membuat request dengan retry mechanism yang lebih robust
async function makeRequestWithAuthRetry(config, maxRetries = 3) {
    let retries = 0;
    
    while (retries <= maxRetries) {
        try {
            // Update token di headers
            config.headers.Authorization = `Bearer ${currentToken}`;
            
            const response = await axios(config);
            
            // Reset retry count jika request berhasil
            retryCount = 0;
            
            // Cek jika response menunjukkan token expired
            if (response.data && response.data.status_code === 400 && 
                response.data.message === 'Expired token') {
                throw new Error('Expired token');
            }
            
            return response;
        } catch (error) {
            // Cek jika error karena token expired
            if (error.response && error.response.data && 
                error.response.data.status_code === 400 && 
                error.response.data.message === 'Expired token') {
                
                console.log('Token expired, mencoba login ulang...');
                
                try {
                    await loginAndGetToken();
                    retries++;
                    
                    if (retries > maxRetries) {
                        throw new Error('Gagal setelah maksimal percobaan login ulang');
                    }
                    
                    console.log(`Retry request ke-${retries} karena token expired`);
                    await sleep(2000);
                    continue;
                } catch (loginError) {
                    throw new Error(`Gagal login ulang: ${loginError.message}`);
                }
            } 
            // Cek jika error 500 (Internal Server Error)
            else if (error.response && error.response.status === 500) {
                retryCount++;
                retries++;
                
                if (retryCount > MAX_RETRY_COUNT) {
                    console.log(`Sudah mencapai maksimal ${MAX_RETRY_COUNT} kali retry untuk error 500. Melanjutkan ke halaman berikutnya...`);
                    throw new Error('MAX_RETRY_EXCEEDED');
                }
                
                if (retries > maxRetries) {
                    console.log(`Sudah ${retries} kali retry untuk request ini. Skip halaman...`);
                    throw new Error('REQUEST_RETRY_EXCEEDED');
                }
                
                console.log(`Error 500 terjadi. Retry ke-${retries} dalam ${RETRY_DELAY/1000} detik...`);
                console.log(`Error detail: ${error.response.data.message || 'Internal Server Error'}`);
                
                await sleep(RETRY_DELAY);
                continue;
            }
            // Untuk error lainnya
            else {
                console.log(`Error lainnya: ${error.message}`);
                throw error;
            }
        }
    }
}

const upCheckString = (value) => {
    if (value === 'null' || value === null || value === undefined || value === '' || value === '-') {
        return 'NULL';
    } else {
        const escapedValue = value.toString().replace(/'/g, "''");
        return `'${escapedValue}'`;
    }
}

const upCheckNumber = (value) => {
    if (
        value === "-" ||
        value === null ||
        value === undefined ||
        value === "" ||
        value === "undefined"
    ) {
        return "NULL";
    } else {
        if (typeof value === 'string') {
            const cleanedValue = value.replace(/\./g, '').replace(',', '.');
            if (!isNaN(cleanedValue) && cleanedValue !== '') {
                return cleanedValue;
            }
        }
        return value;
    }
};

const upCheckDate = (value) => {
    if (
        value === "null" ||
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-" ||
        value === "Invalid date" ||
        value === "invalid date"
    ) {
        return "NULL";
    } else {
        return `'${value}'`;
    }
};

const update_kendaraan = async (data) => {
    const t = await sequelize.transaction();

    try {
        const masa_berlaku_uji = moment(data.masa_berlaku).format('YYYY-MM-DD');
        const tanggal_uji = moment(data.tgl_uji).format('YYYY-MM-DD');
        const is_masa_berlaku = await checkMasaBerlaku(masa_berlaku_uji);
        const jenis_kendaraan_id = data.jenis_kendaraan ? await getJenisKendaraanId(data.jenis_kendaraan) : null;
        const sumbu_id = data.sumbu ? await getSumbuId(data.sumbu) : null;
        const kepemilikan_id = data.nama_pemilik ? await getKepemilikanId(data.nama_pemilik) : null;
        const kepemilikan_val = data.nama_pemilik ? await getKepemilikanVal(data.nama_pemilik) : null;

        const sql = `UPDATE jt_kendaraan SET 
                        no_reg_kend = ${upCheckString(data.no_registrasi_kendaraan)},
                        no_uji = ${upCheckString(data.nouji)},
                        nama_pemilik = ${upCheckString(data.nama_pemilik)},
                        alamat_pemilik = ${upCheckString(data.alamat_pemilik)},
                        tanggal_uji = ${upCheckString(tanggal_uji)},
                        masa_berlaku_uji = ${upCheckString(masa_berlaku_uji)},
                        jenis_kend = ${upCheckString(data.jenis_kendaraan.toUpperCase())},
                        konfigurasi_sumbu = ${upCheckString(data.sumbu)},
                        berat_kosong = ${upCheckNumber(data.berat_kosong)},
                        jbb = ${upCheckNumber(data.jbb)},
                        jbkb = ${upCheckNumber(data.jbkb)},
                        jbi = ${upCheckNumber(data.jbi)},
                        jbki = ${upCheckNumber(data.jbki)},
                        panjang_utama = ${upCheckNumber(data.panjang_kendaraan)},
                        lebar_utama = ${upCheckNumber(data.lebar_kendaraan)},
                        tinggi_utama = ${upCheckNumber(data.tinggi_kendaraan)},
                        julur_depan = ${upCheckNumber(data.julur_depan)},
                        julur_belakang = ${upCheckNumber(data.julur_belakang)},
                        nomor_rangka = ${upCheckString(data.no_rangka)},
                        merek = ${upCheckString(data.merk)},
                        bahan_bakar = ${upCheckString(data.bahan_bakar)},
                        daya_angkut_orang = ${upCheckNumber(data.daya_angkut_orang)},
                        daya_angkut_barang = ${upCheckNumber(data.daya_angkut_kg)},
                        kelas = ${upCheckString(data.kelas_jalan)},
                        updated_at = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                        is_masa_berlaku = ${is_masa_berlaku},
                        jenis_kendaraan_id = ${upCheckNumber(jenis_kendaraan_id)},
                        sumbu_id = ${upCheckNumber(sumbu_id)},
                        blue_id = ${data.id},
                        no_srut = ${upCheckString(data.no_srut)},
                        tgl_srut = ${upCheckDate(data.tgl_srut)},
                        no_mesin = ${upCheckString(data.no_mesin)},
                        tipe = ${upCheckString(data.tipe)},
                        tahun_rakit = ${upCheckString(data.tahun_rakit)},
                        isi_silinder = ${upCheckNumber(data.isi_silinder)},
                        daya_motor = ${upCheckString(data.daya_motor)},
                        keterangan_hasil_uji = ${upCheckNumber(data.keterangan_hasil_uji)},
                        petugas_penguji = ${upCheckString(data.petugas_penguji)},
                        nrp_petugas_penguji = ${upCheckString(data.nrp_petugas_penguji)},
                        kepala_dinas = ${upCheckString(data.kepala_dinas)},
                        pangkat_kepala_dinas = ${upCheckString(data.pangkat_kepala_dinas)},
                        nip_kepala_dinas = ${upCheckString(data.nip_kepala_dinas)},
                        unit_pelaksana_teknis = ${upCheckString(data.unit_pelaksana_teknis)},
                        direktur = ${upCheckString(data.direktur)},
                        pangkat_direktur = ${upCheckString(data.pangkat_direktur)},
                        nip_direktur = ${upCheckString(data.nip_direktur)},
                        jarak_sumbu_1_2 = ${upCheckNumber(data.jarak_sumbu1_2)},
                        jarak_sumbu_2_3 = ${upCheckNumber(data.jarak_sumbu2_3)},
                        jarak_sumbu_3_4 = ${upCheckNumber(data.jarak_sumbu3_4)},
                        dimensi_bak_tangki = ${upCheckString(`${data.panjang_bak_atau_tangki} x ${data.lebar_bak_atau_tangki} x ${data.tinggi_bak_atau_tangki}`)},
                        kepemilikan_id = ${upCheckNumber(kepemilikan_id)},
                        kepemilikan_val = ${upCheckString(kepemilikan_val)},
                        sync_from_pusat = true,
                        is_blue = 1,
                        rfid = ${upCheckString(data.rfid)},
                        vcode = ${upCheckString(data.vcode)}
                    WHERE LOWER(no_reg_kend) = LOWER(${upCheckString(data.no_registrasi_kendaraan)})`;

        const res_update = await sequelize.query(sql, {
            logging: false,
            transaction: t
        });

        await t.commit();
        if (res_update[1] && res_update[1].command === 'UPDATE') {
            console.log(`Berhasil update kendaraan: ${data.no_registrasi_kendaraan}`);
            return 1;
        } else {
            console.log(`Tidak ada data yang diupdate: ${data.no_registrasi_kendaraan}`);
            return 0;
        }
    } catch (error) {
        console.log('Error update_kendaraan:', error);
        await t.rollback();
        return 0;
    }
}

const insert_kendaraan = async (data) => {
    const t = await sequelize.transaction();

    try {
        const masa_berlaku_uji = moment(data.masa_berlaku).format('YYYY-MM-DD');
        const tanggal_uji = moment(data.tgl_uji).format('YYYY-MM-DD');
        const is_masa_berlaku = await checkMasaBerlaku(masa_berlaku_uji);
        const jenis_kendaraan_id = data.jenis_kendaraan ? await getJenisKendaraanId(data.jenis_kendaraan) : null;
        const sumbu_id = data.sumbu ? await getSumbuId(data.sumbu) : null;
        const kepemilikan_id = data.nama_pemilik ? await getKepemilikanId(data.nama_pemilik) : null;
        const kepemilikan_val = data.nama_pemilik ? await getKepemilikanVal(data.nama_pemilik) : null;

        if (jenis_kendaraan_id == 0 || sumbu_id == 0 || kepemilikan_val == 'UNDEFINED') {
            console.log('JENIS KENDARAAN ID : ', jenis_kendaraan_id);
            console.log('SUMBU ID : ', sumbu_id);
            console.log('KEPEMILIKAN VAL : ', kepemilikan_val);
            console.log('DATA KENDARAAN TIDAK SESUAI, LANJUT KENDARAAN LAIN');
            return 0;
        }

        const sql = `INSERT INTO jt_kendaraan (
                        no_reg_kend, no_uji, nama_pemilik, alamat_pemilik, tanggal_uji, 
                        masa_berlaku_uji, jenis_kend, konfigurasi_sumbu, berat_kosong, jbb, 
                        jbkb, jbi, jbki, panjang_utama, lebar_utama, tinggi_utama, 
                        julur_depan, julur_belakang, nomor_rangka, merek, bahan_bakar, 
                        daya_angkut_orang, daya_angkut_barang, kelas, created_at, updated_at, 
                        is_masa_berlaku, jenis_kendaraan_id, sumbu_id, blue_id, no_srut, 
                        tgl_srut, no_mesin, tipe, tahun_rakit, isi_silinder, daya_motor, 
                        keterangan_hasil_uji, petugas_penguji, nrp_petugas_penguji, kepala_dinas, 
                        pangkat_kepala_dinas, nip_kepala_dinas, unit_pelaksana_teknis, direktur, 
                        pangkat_direktur, nip_direktur, jarak_sumbu_1_2, jarak_sumbu_2_3, 
                        jarak_sumbu_3_4, dimensi_bak_tangki, kepemilikan_id, kepemilikan_val, 
                        sync_from_pusat, is_blue, rfid, vcode
                    ) VALUES (
                        ${upCheckString(data.no_registrasi_kendaraan)},
                        ${upCheckString(data.nouji)},
                        ${upCheckString(data.nama_pemilik)},
                        ${upCheckString(data.alamat_pemilik)},
                        ${upCheckString(tanggal_uji)},
                        ${upCheckString(masa_berlaku_uji)},
                        ${upCheckString(data.jenis_kendaraan.toUpperCase())},
                        ${upCheckString(data.sumbu)},
                        ${upCheckNumber(data.berat_kosong)},
                        ${upCheckNumber(data.jbb)},
                        ${upCheckNumber(data.jbkb)},
                        ${upCheckNumber(data.jbi)},
                        ${upCheckNumber(data.jbki)},
                        ${upCheckNumber(data.panjang_kendaraan)},
                        ${upCheckNumber(data.lebar_kendaraan)},
                        ${upCheckNumber(data.tinggi_kendaraan)},
                        ${upCheckNumber(data.julur_depan)},
                        ${upCheckNumber(data.julur_belakang)},
                        ${upCheckString(data.no_rangka)},
                        ${upCheckString(data.merk)},
                        ${upCheckString(data.bahan_bakar)},
                        ${upCheckNumber(data.daya_angkut_orang)},
                        ${upCheckNumber(data.daya_angkut_kg)},
                        ${upCheckString(data.kelas_jalan)},
                        '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                        '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                        ${is_masa_berlaku},
                        ${upCheckNumber(jenis_kendaraan_id)},
                        ${upCheckNumber(sumbu_id)},
                        ${data.id},
                        ${upCheckString(data.no_srut)},
                        ${upCheckDate(data.tgl_srut)},
                        ${upCheckString(data.no_mesin)},
                        ${upCheckString(data.tipe)},
                        ${upCheckString(data.tahun_rakit)},
                        ${upCheckNumber(data.isi_silinder)},
                        ${upCheckString(data.daya_motor)},
                        ${upCheckNumber(data.keterangan_hasil_uji)},
                        ${upCheckString(data.petugas_penguji)},
                        ${upCheckString(data.nrp_petugas_penguji)},
                        ${upCheckString(data.kepala_dinas)},
                        ${upCheckString(data.pangkat_kepala_dinas)},
                        ${upCheckString(data.nip_kepala_dinas)},
                        ${upCheckString(data.unit_pelaksana_teknis)},
                        ${upCheckString(data.direktur)},
                        ${upCheckString(data.pangkat_direktur)},
                        ${upCheckString(data.nip_direktur)},
                        ${upCheckNumber(data.jarak_sumbu1_2)},
                        ${upCheckNumber(data.jarak_sumbu2_3)},
                        ${upCheckNumber(data.jarak_sumbu3_4)},
                        ${upCheckString(`${data.panjang_bak_atau_tangki} x ${data.lebar_bak_atau_tangki} x ${data.tinggi_bak_atau_tangki}`)},
                        ${upCheckNumber(kepemilikan_id)},
                        ${upCheckString(kepemilikan_val)},
                        true,
                        1,
                        ${upCheckString(data.rfid)},
                        ${upCheckString(data.vcode)}
                    )`;

        const res_insert = await sequelize.query(sql, {
            logging: false,
            transaction: t
        });

        await t.commit();
        console.log(`Berhasil insert kendaraan: ${data.no_registrasi_kendaraan}`);
        return 1;
    } catch (error) {
        console.log('Error insert_kendaraan:', error);
        await t.rollback();
        return 0;
    }
}

const getKendaraan = async (nokend, data) => {
    try {
        const sql = `
            SELECT
                no_reg_kend
            FROM jt_kendaraan
            WHERE no_reg_kend = '${nokend}'
        `;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            console.log(`Data ditemukan, melakukan update: ${nokend}`);
            return await update_kendaraan(data);
        } else {
            console.log(`Data tidak ditemukan, melakukan insert: ${nokend}`);
            return await insert_kendaraan(data);
        }

    } catch (error) {
        console.log('Terjadi kesalahan dalam getKendaraan:', error);
        return 0;
    }
};

const getKendaraanBlue = async () => {
    let page = 1;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;

    while (true) {
        try {
            const endpoint = `https://api-gateway.hubdat.dephub.go.id/data-integration-service/blue/kendaraan/list?page=${page}`;
            console.log(endpoint);
            const config = {
                method: 'GET',
                timeout: 15000, // Tambah timeout
                url: endpoint,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentToken}`,
                }
            };

            console.info(`Mencoba mengambil data halaman ${page}...`);

            const response = await makeRequestWithAuthRetry(config, 3);

            // Reset consecutive errors counter jika berhasil
            consecutiveErrors = 0;

            if (response.data.data.length === 0) {
                console.log('Selesai. Tidak ada data lagi.');
                break;
            }

            console.log(`Memproses halaman ${page} dengan ${response.data.data.length} data`);

            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < response.data.data.length; i++) {
                try {
                    console.log("-----------------------------------------------------");
                    console.log(page + ' - ' + (i + 1) + ' : ', response.data.data[i].no_registrasi_kendaraan);
                    const result = await getKendaraan(response.data.data[i].no_registrasi_kendaraan, response.data.data[i]);
                    
                    if (result === 1) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                    
                    await sleep(3000); // Kurangi delay menjadi 3 detik
                } catch (error) {
                    console.log(`Error processing item ${i + 1}:`, error.message);
                    errorCount++;
                    // Lanjut ke item berikutnya meskipun ada error
                    continue;
                }
            }
            
            console.info(`Halaman ${page} selesai. Berhasil: ${successCount}, Gagal: ${errorCount}`);
            console.log("=====================================================");
            
            page += 1;
            
            // Delay antar halaman
            await sleep(2000);
            
        } catch (error) {
            consecutiveErrors++;
            console.log(`Error pada halaman ${page}:`, error.message);
            
            if (error.message === 'MAX_RETRY_EXCEEDED' || error.message === 'REQUEST_RETRY_EXCEEDED') {
                console.log(`Skip halaman ${page} karena sudah mencapai batas retry.`);
                page += 1; // Lanjut ke halaman berikutnya
                await sleep(5000); // Delay lebih lama sebelum lanjut
            } 
            else if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                console.log(`Sudah ${MAX_CONSECUTIVE_ERRORS} error berturut-turut. Menghentikan proses.`);
                break;
            }
            else {
                // Coba ulang halaman yang sama
                console.log(`Mencoba ulang halaman ${page}...`);
                await sleep(5000);
                continue;
            }
            
            // Reset counter jika berhasil melewati halaman yang error
            if (error.message === 'MAX_RETRY_EXCEEDED' || error.message === 'REQUEST_RETRY_EXCEEDED') {
                consecutiveErrors = 0;
            }
        }
    }
    
    console.log('Proses sync kendaraan selesai.');
};

// Jalankan aplikasi dengan error handling
getKendaraanBlue().catch(error => {
    console.error('Aplikasi berhenti karena error:', error);
});