const { sequelize } = require('../api/models');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const { getJenisKendaraanId, getSumbuId, getKepemilikanId, getKepemilikanVal, checkMasaBerlaku } = require('../api/controllers/lib/dataid');

// Variabel untuk menyimpan token
let currentToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJwb3J0YWxfb3Blbl9hcGlfYXBwcyIsImlhdCI6MTcyOTIzNDQ4NywiZXhwIjoxNzYwNzcwNDg3LCJuYmYiOjE3MjkyMzQ0ODcsInVzZXIiOnsiaWQiOiJhMjkxMTAxMC04YjRjLTQ5NmItOTY5Ni0zZTM0YTcyMWQ2NzQifX0.Z-5LcEGlw6OMa3XMPmeOi-Yvj1ItNvgw6KsowoSbWfM";

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

// Fungsi untuk membuat request dengan retry mechanism
async function makeRequestWithAuthRetry(config, maxRetries = 2) {
    let retries = 0;
    
    while (retries <= maxRetries) {
        try {
            // Update token di headers
            config.headers.Authorization = `Bearer ${currentToken}`;
            
            const response = await axios(config);
            
            // Cek jika response menunjukkan token expired
            if (response.data && response.data.status_code === 400 && 
                response.data.message === 'Expired token') {
                throw new Error('Expired token');
            }
            
            return response;
        } catch (error) {
            if (error.response && error.response.data && 
                error.response.data.status_code === 400 && 
                error.response.data.message === 'Expired token') {
                
                console.log(error.response.data);
                console.log('Token expired, mencoba login ulang...');
                
                try {
                    await loginAndGetToken();
                    retries++;
                    
                    if (retries > maxRetries) {
                        throw new Error('Gagal setelah maksimal percobaan login ulang');
                    }
                    
                    console.log(`Retry request ke-${retries}`);
                    await sleep(2000); // Tunggu sebentar sebelum retry
                    continue;
                } catch (loginError) {
                    throw new Error(`Gagal login ulang: ${loginError.message}`);
                }
            } else {
                // Jika error bukan karena token expired, langsung throw
                console.log(error.response.data);
                throw error;
            }
        }
    }
}

const upCheckString = (value) => {
    if (value === 'null' || value === null || value === undefined || value === '' || value === '-') {
        return 'NULL'; // Return string 'NULL' untuk SQL
    } else {
        // Escape single quote dan beri kutip
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
        return "NULL"; // Return string 'NULL' untuk SQL
    } else {
        // Konversi string dengan koma ke format angka PostgreSQL
        if (typeof value === 'string') {
            // Hapus pemisah ribuan (titik) dan ganti koma desimal dengan titik
            const cleanedValue = value.replace(/\./g, '').replace(',', '.');
            // Cek jika hasilnya adalah angka valid
            if (!isNaN(cleanedValue) && cleanedValue !== '') {
                return cleanedValue;
            }
        }
        return value;
    }
};

const update_kendaraan = async (data) => {
    const t = await sequelize.transaction();

    try {
        var masa_berlaku_uji = moment(data.masa_berlaku).format('YYYY-MM-DD');
        var tanggal_uji = moment(data.tgl_uji).format('YYYY-MM-DD');
        var is_masa_berlaku = await checkMasaBerlaku(masa_berlaku_uji);
        var jenis_kendaraan_id = data.jenis_kendaraan ? await getJenisKendaraanId(data.jenis_kendaraan) : null;
        var sumbu_id = data.sumbu ? await getSumbuId(data.sumbu) : null;
        var kepemilikan_id = data.nama_pemilik ? await getKepemilikanId(data.nama_pemilik) : null;
        var kepemilikan_val = data.nama_pemilik ? await getKepemilikanVal(data.nama_pemilik) : null;

        // Gunakan fungsi helper dengan benar
        var sql = `UPDATE jt_kendaraan SET 
                        no_reg_kend = ${upCheckString(data.no_registrasi_kendaraan)},
                        no_uji = ${upCheckString(data.nouji)},
                        nama_pemilik = ${upCheckString(data.nama_pemilik)},
                        alamat_pemilik = ${upCheckString(data.alamat_pemilik)},
                        tanggal_uji = ${upCheckString(tanggal_uji)},
                        masa_berlaku_uji = ${upCheckString(masa_berlaku_uji)},
                        jenis_kend = ${upCheckString(data.jenis_kendaraan)},
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
                        tgl_srut = ${upCheckString(data.tgl_srut)},
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

        // console.log('SQL Query:', sql); // Debug: lihat query yang dihasilkan

        const res_update = await sequelize.query(sql, {
            logging: false,
            transaction: t
        });

        await t.commit();
        if (res_update[1] && res_update[1].command == 'UPDATE') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log('Error update_kendaraan:', error);
        await t.rollback();
        return 0;
    }
}

const update_kendaraan_noblue = async (no_reg_kend) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_kendaraan SET 
                        blue_id = ${null},
                        is_blue = 99
                    WHERE LOWER(no_reg_kend) = LOWER('${no_reg_kend}')`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            console.log('UPDATE STATUS BLUE NULL')
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log('Error update_kendaraan_noblue:', error);
        await t.rollback();
        return 0;
    }
}

const getDataBlueKemenhub = async (no_reg_kend) => {
    var endpoint = `https://api-gateway.hubdat.dephub.go.id/data-integration-service/blue/kendaraan/find?no_registrasi_kendaraan=${no_reg_kend.trim().toUpperCase()}`;

    var config = {
        method: 'GET',
        timeout: 10000,
        url: endpoint,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentToken}`,
        }
    };

    try {
        const response = await makeRequestWithAuthRetry(config);
        
        if (response.data && response.data.data) {
            var data = response.data.data;
            console.log('RESPON BLUE : ', data);
            var upsert = await update_kendaraan(data);
            if (upsert == 1) {
                console.log(`NO KENDARAAN : ${data.no_registrasi_kendaraan} | MASA BERLAKU : ${moment(data.masa_berlaku).format('DD-MM-YYYY')}`);
                return 1;
            } else {
                console.log('UPSERT GAGAL');
                return 0;
            }
        } else {
            console.log('Data tidak ditemukan di response');
            return 0;
        }
    } catch (error) {
        console.log(`NO KENDARAAN : ${no_reg_kend} - ERROR RESPONSE E-BLU:`, error.message);
        
        // Jika error bukan karena auth, update status blue null
        if (!error.message.includes('Expired token') && !error.message.includes('Gagal login ulang')) {
            await update_kendaraan_noblue(no_reg_kend);
        }
        return 0;
    }
}

const getKendaraan = async () => {
    let offset = 0;
    const limit = 10;

    while (true) {
        try {
            const sql = `
                SELECT
                    no_reg_kend,
                    tanggal_uji,
                    masa_berlaku_uji
                FROM jt_kendaraan
                WHERE EXTRACT(YEAR FROM masa_berlaku_uji) < EXTRACT(YEAR FROM CURRENT_DATE) OR masa_berlaku_uji IS NULL
                ORDER BY masa_berlaku_uji DESC
                LIMIT ${limit} OFFSET ${offset};
            `;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result.length === 0) {
                console.log('Selesai. Tidak ada data lagi.');
                break;
            }

            for (let i = 0; i < result.length; i++) {
                console.log(offset + i + 1, ' : ', result[i].no_reg_kend);
                await getDataBlueKemenhub(result[i].no_reg_kend);
                await sleep(5000);
            }
            console.log('PAGING ', offset);

            offset += limit;
        } catch (error) {
            console.log('Terjadi kesalahan dalam loop:', error);
            break;
        }
    }
};

// Jalankan aplikasi
getKendaraan();
