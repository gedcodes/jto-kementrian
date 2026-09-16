const { sequelize } = require('../api/models');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const { getJenisKendaraanId, getSumbuId, getKepemilikanId, getKepemilikanVal, checkMasaBerlaku } = require('../api/controllers/lib/dataid');

const url_jto_blue = `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/ujiberkala`;

// Fungsi helper untuk handle string dan number
const upCheckString = (value) => {
    if (value === 'null' || value === null || value === undefined || value === '' || value === '-' || value === 'undefined') {
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

const upCheckBoolean = (value) => {
    if (value === 'true' || value === true) {
        return 'true';
    } else if (value === 'false' || value === false) {
        return 'false';
    } else {
        return 'false';
    }
}

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

const getCountKendaraan = async () => {
    var sql = `SELECT COUNT(*) AS jml_data FROM jt_kendaraan`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });

    return result[0].jml_data;
}

const update_kendaraan = async (no_reg_kend, response, is_blue) => {
    const t = await sequelize.transaction();

    try {
        var masa_berlaku_uji = moment(response.masa_berlaku).format('YYYY-MM-DD');
        var tanggal_uji = moment(response.tgl_uji).format('YYYY-MM-DD'); // Gunakan tgl_uji dari response, bukan dikurangi 6 bulan
        var is_masa_berlaku = await checkMasaBerlaku(masa_berlaku_uji);
        var jenis_kendaraan_id = response.jenis_kendaraan ? await getJenisKendaraanId(response.jenis_kendaraan) : null;
        var sumbu_id = response.sumbu ? await getSumbuId(response.sumbu) : null;
        var kepemilikan_id = response.nama_pemilik ? await getKepemilikanId(response.nama_pemilik) : null;
        var kepemilikan_val = response.nama_pemilik ? await getKepemilikanVal(response.nama_pemilik) : null;

        // Handle field-field baru dari response
        var rfid = response.rfid || null;
        var vcode = response.vcode || null;
        var no_uji_kendaraan = response.nouji || response.no_uji_kendaraan; // Perbaikan field no uji
        var ukuran_ban = response.ukuran_ban || null;
        var keterangan_hasil_uji = response.keterangan_hasil_uji || null;
        var etl_date = response.etl_date ? moment(response.etl_date).format('YYYY-MM-DD HH:mm:ss') : null;

        // Handle dimensi bak/tangki
        var dimensi_bak_tangki = null;
        if (response.panjang_bak_atau_tangki && response.lebar_bak_atau_tangki && response.tinggi_bak_atau_tangki) {
            dimensi_bak_tangki = `${response.panjang_bak_atau_tangki}x${response.lebar_bak_atau_tangki}x${response.tinggi_bak_atau_tangki}`;
        } else if (response.dimensi_bak_tangki) {
            dimensi_bak_tangki = response.dimensi_bak_tangki;
        }
        var sql = `UPDATE jt_kendaraan SET
                        no_reg_kend = ${upCheckString(response.no_registrasi_kendaraan)},
                        no_uji = ${upCheckString(no_uji_kendaraan)},
                        nama_pemilik = ${upCheckString(response.nama_pemilik)},
                        alamat_pemilik = ${upCheckString(response.alamat_pemilik)},
                        lokasi_uji = ${upCheckString(response.unit_pelaksana_teknis)},
                        tanggal_uji = ${upCheckString(tanggal_uji)},
                        masa_berlaku_uji = ${upCheckString(masa_berlaku_uji)},
                        jenis_kend = ${upCheckString(response.jenis_kendaraan)},
                        konfigurasi_sumbu = ${upCheckString(response.sumbu)},
                        berat_kosong = ${upCheckNumber(response.berat_kosong)},
                        jbb = ${upCheckNumber(response.jbb)},
                        jbkb = ${upCheckNumber(response.jbkb)},
                        jbi = ${upCheckNumber(response.jbi)},
                        jbki = ${upCheckNumber(response.jbki)},
                        panjang_utama = ${upCheckNumber(response.panjang_kendaraan)},
                        lebar_utama = ${upCheckNumber(response.lebar_kendaraan)},
                        tinggi_utama = ${upCheckNumber(response.tinggi_kendaraan)},
                        julur_depan = ${upCheckNumber(response.julur_depan)},
                        julur_belakang = ${upCheckNumber(response.julur_belakang)},
                        nomor_rangka = ${upCheckString(response.no_rangka)},
                        merek = ${upCheckString(response.merk)},
                        bahan_bakar = ${upCheckString(response.bahan_bakar)},
                        daya_angkut_orang = ${upCheckNumber(response.daya_angkut_orang)},
                        daya_angkut_barang = ${upCheckNumber(response.daya_angkut_kg)},
                        kelas = ${upCheckString(response.kelas_jalan)},
                        updated_at = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                        is_masa_berlaku = ${is_masa_berlaku},
                        is_active = true,
                        updated_by = 1,
                        jenis_kendaraan_id = ${upCheckNumber(jenis_kendaraan_id)},
                        sumbu_id = ${upCheckNumber(sumbu_id)},
                        blue_id = ${upCheckNumber(response.id)},
                        no_srut = ${upCheckString(response.no_srut)},
                        tgl_srut = ${upCheckString(response.tgl_srut)},
                        no_mesin = ${upCheckString(response.no_mesin)},
                        tipe = ${upCheckString(response.tipe)},
                        tahun_rakit = ${upCheckString(response.tahun_rakit)},
                        isi_silinder = ${upCheckNumber(response.isi_silinder)},
                        daya_motor = ${upCheckString(response.daya_motor)},
                        ukuran_ban = ${upCheckString(ukuran_ban)},
                        keterangan_hasil_uji = ${upCheckString(keterangan_hasil_uji)},
                        petugas_penguji = ${upCheckString(response.petugas_penguji)},
                        nrp_petugas_penguji = ${upCheckString(response.nrp_petugas_penguji)},
                        kepala_dinas = ${upCheckString(response.kepala_dinas)},
                        pangkat_kepala_dinas = ${upCheckString(response.pangkat_kepala_dinas)},
                        nip_kepala_dinas = ${upCheckString(response.nip_kepala_dinas)},
                        unit_pelaksana_teknis = ${upCheckString(response.unit_pelaksana_teknis)},
                        direktur = ${upCheckString(response.direktur)},
                        pangkat_direktur = ${upCheckString(response.pangkat_direktur)},
                        nip_direktur = ${upCheckString(response.nip_direktur)},
                        etl_date = ${upCheckString(etl_date)},
                        jarak_sumbu_1_2 = ${upCheckNumber(response.jarak_sumbu1_2)},
                        jarak_sumbu_2_3 = ${upCheckNumber(response.jarak_sumbu2_3)},
                        jarak_sumbu_3_4 = ${upCheckNumber(response.jarak_sumbu3_4)},
                        dimensi_bak_tangki = ${upCheckString(dimensi_bak_tangki)},
                        kepemilikan_id = ${upCheckNumber(kepemilikan_id)},
                        kepemilikan_val = ${upCheckString(kepemilikan_val)},
                        mst = ${upCheckNumber(response.mst || 0)},
                        rfid = ${upCheckString(rfid)},
                        vcode = ${upCheckString(vcode)},
                        sync_from_pusat = true,
                        is_blue = ${is_blue}
                    WHERE LOWER(no_reg_kend) = LOWER(${no_reg_kend})`;

        console.log('Executing UPDATE query...');
        const res_update = await sequelize.query(sql, {
            logging: false,
            transaction: t
        });

        await t.commit();
        if (res_update[1] && res_update[1].command == 'UPDATE') {
            console.log(`UPDATE berhasil untuk ${no_reg_kend}`);
            return 1;
        } else {
            console.log(`UPDATE tidak mempengaruhi baris untuk ${no_reg_kend}`);
            return 0;
        }
    } catch (error) {
        console.log('Error update_kendaraan:', error);
        await t.rollback();
        return 0;
    }
    //return res_update[1].command;
}

const getDataBlueKemenhub = async (no_reg_kend) => {
    const config = {
        method: 'GET',
        timeout: 12000,
        url: `${url_jto_blue}?nokend=${no_reg_kend}`,
        headers: {}
    };

    console.log(`Requesting: ${config.url}`);

    axios(config).then(async function (response) {
        if (response.data != null) {
            var data = response.data;
            var upsert = await update_kendaraan(no_reg_kend, data, 1);
            if (upsert == 1) {
                console.log(`NO KENDARAAN : ${data.no_registrasi_kendaraan} | MASA BERLAKU : ${moment(data.masa_berlaku).format('DD-MM-YYYY')} | JBI : ${data.jbi} | JBKI : ${data.jbki}`);
                console.log(`JENIS KENDARAAN : ${data.jenis_kendaraan.toUpperCase()} | SUMBU : ${data.sumbu} | NAMA PEMILIK : ${data.nama_pemilik} | ALAMAT PEMILIK : ${data.alamat_pemilik}`);
                return 1;
            } else {
                console.log('UPSERT GAGAL');
                return 0;
            }
        } else {
            return 0;
        }
    }).catch(function (error) {
        console.error(`NO KENDARAAN : ${no_reg_kend} - ERROR RESPONSE E-BLU`);
        if (error.code === 'ECONNABORTED') {
            console.error("Request timeout after 12 seconds");
            return 0;
        } else if (error.response) {
            // 500,404
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
            return 0;
        } else {
            // jaringan
            console.error("Unknown error:", error.message);
            return 0;
        }
    });
}

const getKendaraan = async () => {
    try {
        var jml_kendaraan = await getCountKendaraan();
        console.log(`Total kendaraan: ${jml_kendaraan}`);

        let offset = 0;
        const limit = 10; // Batasi per batch untuk testing

        while (true) {
            var sql = `SELECT no_reg_kend FROM jt_kendaraan 
                      WHERE (EXTRACT(YEAR FROM masa_berlaku_uji) < EXTRACT(YEAR FROM CURRENT_DATE) OR masa_berlaku_uji IS NULL)
                      ORDER BY masa_berlaku_uji DESC, no_reg_kend ASC 
                      LIMIT ${limit} OFFSET ${offset}`;

            console.log(`Query: ${sql}`);
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result.length === 0) {
                console.log('Selesai. Tidak ada data lagi.');
                break;
            }

            console.log(`\nProcessing batch ${offset/limit + 1} dengan ${result.length} kendaraan`);

            for (let i = 0; i < result.length; i++) {
                console.log(`\n::-:: Processing ${offset + i + 1}/${jml_kendaraan} ::-::`);
                console.log(`No Kendaraan: ${result[i].no_reg_kend}`);
                await getDataBlueKemenhub(result[i].no_reg_kend);
                await sleep(5000); // Tunggu 5 detik antara requests
            }

            offset += limit;
            console.log(`\nCompleted batch. Offset sekarang: ${offset}`);
            
            // Tunggu sebentar sebelum batch berikutnya
            await sleep(10000);
        }

    } catch (error) {
        console.log('Error in getKendaraan:', error);
        return 0;
    }
}

// Jalankan aplikasi
getKendaraan();
