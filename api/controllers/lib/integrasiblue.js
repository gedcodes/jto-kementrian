const axios = require("axios");
const cheerio = require("cheerio");
var qs = require("qs");
const {
    t_integrasi,
    t_config_sinkronisasi,
    t_eblue,
    t_eblue_live,
    sequelize,
} = require("../../models");
const {
    Op,
    QueryTypes
} = require("sequelize");
const blue = "BLUE";
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const config = require("../../../config/config");
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
const imageToBase64 = require("image-to-base64");
var nodeBase64 = require("nodejs-base64-converter");
const {
    getJenisKendaraanId,
    getSumbuId,
    getKepemilikanId,
    getKepemilikanVal,
    checkMasaBerlaku,
} = require("./dataid");

const {
    urlSinkronisasiJto
} = require("./urlsinkron");

function remove(string, from, to) {
    return string.slice(0, from) + string.slice(to);
}

const checkjtoserver = async (key) => {
    // return new Promise( async (resolve, reject) => {
    try {
        console.log("LENGTH : ", key.length);
        const datascan = [];
        if (key.length > 70) {
            console.log("QR BARU");
            var data = await getFotoKendaraanQrNew(key);
            datascan.push(data[0]);
        } else {
            console.log("QR LAMA");
            var data = await getFotoKendaraanQr(key);
            datascan.push(data[0]);
        }
        console.log("datascan : ", datascan);

        var foto_depan_url = "";
        var foto_belakang_url = "";
        var foto_kiri_url = "";
        var foto_kanan_url = "";

        var foto_depan = "";
        var foto_belakang = "";
        var foto_kiri = "";
        var foto_kanan = "";

        if (process.env.IS_KEMENHUB == 0) {
            uploadPath = path.join(config.path_upload) + "/kendaraan";
            foto_depan_url = datascan[0].foto_depan[1];
            foto_belakang_url = datascan[0].foto_belakang[1];
            foto_kiri_url = datascan[0].foto_kiri[1];
            foto_kanan_url = datascan[0].foto_kanan[1];

            foto_depan = datascan[0].foto_depan[0];
            foto_belakang = datascan[0].foto_belakang[0];
            foto_kiri = datascan[0].foto_kiri[0];
            foto_kanan = datascan[0].foto_kanan[0];
        }
        var sql = `SELECT * FROM jt_kendaraan WHERE no_reg_kend = '${datascan[0].no_reg_kend}' AND is_deleted = false`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false,
        });

        if (Object.keys(result).length > 0) {
            var onMasaBerlakuDate = moment(
                    result[0].masa_berlaku_uji,
                    "YYYY-MM-DD",
                    true
                ).isValid() ?
                moment(result[0].masa_berlaku_uji).format("YYYY-MM-DD") :
                moment(result[0].masa_berlaku_uji, "DD-MM-YYYY").format(
                    "YYYY-MM-DD"
                );
            console.log(
                "FORMAT MASA BERLAKU UJI DATE : ",
                moment(
                    result[0].masa_berlaku_uji,
                    "YYYY-MM-DD",
                    true
                ).isValid(),
                onMasaBerlakuDate
            );

            var status_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate); // moment(masa_berlaku, 'YYYY-MM-DD', true).isValid() ? await checkMasaBerlaku(onMasaBerlakuDate) : false;
            console.log("STATUS MASA BERLAKU UJI : ", status_masa_berlaku);
            if (status_masa_berlaku) {
                const removeImg = await removeGambarField(
                    result[0].no_reg_kend
                );
                console.log("REMOVE IMG EXISTING DATA : ", removeImg);
                const update_foto = await update_kendaran_foto(
                    result[0].no_reg_kend,
                    result[0].no_uji,
                    foto_depan,
                    foto_belakang,
                    foto_kanan,
                    foto_kiri,
                    foto_depan_url,
                    foto_belakang_url,
                    foto_kanan_url,
                    foto_kiri_url
                );
                if (update_foto == 1) {
                    const lastdata = await selectLast(result[0].no_reg_kend);
                    // console.log(lastdata);
                    return lastdata;
                } else {
                    return [];
                }
            } else {
                console.log(
                    result[0].no_reg_kend,
                    result[0].no_uji,
                    foto_depan,
                    foto_belakang,
                    foto_kanan,
                    foto_kiri,
                    foto_depan_url,
                    foto_belakang_url,
                    foto_kanan_url,
                    foto_kiri_url
                );

                return await datakendaraanupsert(
                    key,
                    foto_depan,
                    foto_belakang,
                    foto_kiri,
                    foto_kanan,
                    foto_depan_url,
                    foto_belakang_url,
                    foto_kiri_url,
                    foto_kanan_url
                );
            }
        } else {
            var URL_SINK = await urlSinkronisasiJto();
            console.log("URL_SINK : ", URL_SINK);
            // console.log(result[0].no_reg_kend, result[0].no_uji, foto_depan, foto_belakang, foto_kanan, foto_kiri, foto_depan_url, foto_belakang_url, foto_kanan_url, foto_kiri_url);
            const urlJto =
                URL_SINK != 0 ?
                `${URL_SINK}/v2pb/jto/kendaraan/qrcode?qr=${key}` :
                `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/qrcode?qr=${key}`;
            console.log("URL JTO : ", urlJto);
            var config_axios = {
                method: "GET",
                timeout: 12000,
                url: urlJto, // 'https://jto.dephub.go.id/api/v2/v2pb/jto/kendaraan/qrcode?qr=https://ujiberkala.dephub.go.id/qr/vi/C11D34C1DA66E9F89A2BF31EAF8DE7C9'.toString(),
            };
            var arr = [];
            const response = await axios(config_axios);
            console.log("DATA RESULT : ", response.data);
            if (response.data.success) {
                var data = response.data.data;
                if (data.length > 0) {
                    arr.push(data[0]);
                } else {
                    arr.push(data);
                }

                const removeImg = await removeGambarField(arr[0].no_reg_kend);
                console.log("REMOVE IMG PATH : ", removeImg);

                var upsert_data = await upsert(
                    arr[0].rfid || "",
                    arr[0].vcode || "",
                    arr[0].no_reg_kend,
                    arr[0].no_uji,
                    arr[0].nama_pemilik,
                    arr[0].alamat_pemilik,
                    arr[0].lokasi_uji,
                    arr[0].tanggal_uji,
                    arr[0].masa_berlaku_uji,
                    arr[0].jenis_kend,
                    arr[0].konfigurasi_sumbu,
                    arr[0].berat_kosong,
                    arr[0].jbb,
                    arr[0].jbkb,
                    arr[0].jbi,
                    arr[0].jbki,
                    arr[0].panjang_utama,
                    arr[0].lebar_utama,
                    arr[0].tinggi_utama,
                    arr[0].julur_depan,
                    arr[0].julur_belakang,
                    foto_depan,
                    foto_kanan,
                    foto_kiri,
                    arr[0].nomor_rangka,
                    arr[0].merek,
                    arr[0].bahan_bakar,
                    arr[0].daya_angkut_orang,
                    arr[0].daya_angkut_barang,
                    arr[0].kelas,
                    moment().format("YYYY-MM-DD HH:mm:ss"),
                    moment().format("YYYY-MM-DD HH:mm:ss"),
                    arr[0].created_by,
                    arr[0].is_masa_berlaku,
                    true,
                    foto_belakang,
                    foto_depan_url,
                    foto_belakang_url,
                    foto_kanan_url,
                    foto_kiri_url,
                    arr[0].created_by,
                    arr[0].jenis_kendaraan_id,
                    arr[0].sumbu_id,
                    arr[0].blue_id,
                    arr[0].no_srut,
                    arr[0].tgl_srut,
                    arr[0].no_mesin,
                    arr[0].tipe,
                    arr[0].tahun_rakit,
                    arr[0].isi_silinder,
                    arr[0].daya_motor,
                    arr[0].ukuran_ban,
                    arr[0].keterangan_hasil_uji,
                    arr[0].petugas_penguji,
                    arr[0].nrp_petugas_penguji,
                    arr[0].kepala_dinas,
                    arr[0].pangkat_kepala_dinas,
                    arr[0].nip_kepala_dinas,
                    arr[0].unit_pelaksana_teknis,
                    arr[0].direktur,
                    arr[0].pangkat_direktur,
                    arr[0].nip_direktur,
                    moment(arr[0].etl_date).format("YYYY-MM-DD HH:mm:ss"),
                    arr[0].jarak_sumbu_1_2,
                    arr[0].jarak_sumbu_2_3,
                    arr[0].jarak_sumbu_3_4,
                    arr[0].dimensi_bak_tangki,
                    arr[0].mst,
                    arr[0].kepemilikan_id,
                    arr[0].kepemilikan_val
                );
                // console.log('UPSERT KENDARAAN : ',upsert_data);
                if (upsert_data && upsert_data.length > 0) {
                    return upsert_data;
                } else {
                    if (
                        foto_depan &&
                        foto_belakang &&
                        foto_kiri &&
                        foto_kanan
                    ) {
                        const removeImgPath = await removeGambar(
                            foto_depan,
                            foto_belakang,
                            foto_kiri,
                            foto_kanan
                        );
                        console.log("REMOVE IMG PATH : ", removeImgPath);
                    }
                    return arr;
                }
            }
        }

        // console.log(response.data);
        // console.log('BASE 64 : ', response.data.data[0].foto_depan_url);
    } catch (error) {
        console.log("ERROR RESPONSE : ", error.response);
        console.log("ERROR RESPONSE JTO SERVER");

        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        }
        // reject(0)
        return [];
    }

    // });
};

const datakendaraanupsert = async (
    key,
    foto_depan,
    foto_belakang,
    foto_kiri,
    foto_kanan,
    foto_depan_url,
    foto_belakang_url,
    foto_kiri_url,
    foto_kanan_url
) => {
    var URL_SINK = await urlSinkronisasiJto();
    console.log("URL_SINK : ", URL_SINK);

    const urlJto =
        URL_SINK != 0 ?
        `${URL_SINK}/v2pb/jto/kendaraan/qrcode?qr=${key}` :
        `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/qrcode?qr=${key}`;
    // const urlJto = `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/qrcode?qr=${key}`;
    console.log("URL JTO : ", urlJto);
    var config_axios = {
        method: "GET",
        timeout: 20000,
        url: urlJto, // 'https://jto.dephub.go.id/api/v2/v2pb/jto/kendaraan/qrcode?qr=https://ujiberkala.dephub.go.id/qr/vi/C11D34C1DA66E9F89A2BF31EAF8DE7C9'.toString(),
    };
    var arr = [];
    const response = await axios(config_axios);
    if (response.data.success) {
        var data = response.data.data;
        if (data.length > 0) {
            arr.push(data[0]);
        } else {
            arr.push(data);
        }

        const removeImg = await removeGambarField(arr[0].no_reg_kend);
        console.log("REMOVE IMG PATH : ", removeImg);

        var upsert_data = await upsert(
            arr[0].rfid || "",
            arr[0].vcode || "",
            arr[0].no_reg_kend,
            arr[0].no_uji,
            arr[0].nama_pemilik,
            arr[0].alamat_pemilik,
            arr[0].lokasi_uji,
            arr[0].tanggal_uji,
            arr[0].masa_berlaku_uji,
            arr[0].jenis_kend,
            arr[0].konfigurasi_sumbu,
            arr[0].berat_kosong,
            arr[0].jbb,
            arr[0].jbkb,
            arr[0].jbi,
            arr[0].jbki,
            arr[0].panjang_utama,
            arr[0].lebar_utama,
            arr[0].tinggi_utama,
            arr[0].julur_depan,
            arr[0].julur_belakang,
            foto_depan,
            foto_kanan,
            foto_kiri,
            arr[0].nomor_rangka,
            arr[0].merek,
            arr[0].bahan_bakar,
            arr[0].daya_angkut_orang,
            arr[0].daya_angkut_barang,
            arr[0].kelas,
            moment().format("YYYY-MM-DD HH:mm:ss"),
            moment().format("YYYY-MM-DD HH:mm:ss"),
            arr[0].created_by,
            arr[0].is_masa_berlaku,
            true,
            foto_belakang,
            foto_depan_url,
            foto_belakang_url,
            foto_kanan_url,
            foto_kiri_url,
            arr[0].created_by,
            arr[0].jenis_kendaraan_id,
            arr[0].sumbu_id,
            arr[0].blue_id,
            arr[0].no_srut,
            arr[0].tgl_srut,
            arr[0].no_mesin,
            arr[0].tipe,
            arr[0].tahun_rakit,
            arr[0].isi_silinder,
            arr[0].daya_motor,
            arr[0].ukuran_ban,
            arr[0].keterangan_hasil_uji,
            arr[0].petugas_penguji,
            arr[0].nrp_petugas_penguji,
            arr[0].kepala_dinas,
            arr[0].pangkat_kepala_dinas,
            arr[0].nip_kepala_dinas,
            arr[0].unit_pelaksana_teknis,
            arr[0].direktur,
            arr[0].pangkat_direktur,
            arr[0].nip_direktur,
            moment(arr[0].etl_date).format("YYYY-MM-DD HH:mm:ss"),
            arr[0].jarak_sumbu_1_2,
            arr[0].jarak_sumbu_2_3,
            arr[0].jarak_sumbu_3_4,
            arr[0].dimensi_bak_tangki,
            arr[0].mst,
            arr[0].kepemilikan_id,
            arr[0].kepemilikan_val
        );
        // console.log('UPSERT KENDARAAN : ',upsert_data);
        if (upsert_data && upsert_data.length > 0) {
            return upsert_data;
        } else {
            if (foto_depan && foto_belakang && foto_kiri && foto_kanan) {
                const removeImgPath = await removeGambar(
                    foto_depan,
                    foto_belakang,
                    foto_kiri,
                    foto_kanan
                );
                console.log("REMOVE IMG PATH : ", removeImgPath);
            }
            return arr;
        }
    } else {
        return [];
    }
};

const checkjtoserverkend = async (nokend) => {
    try {
        var URL_SINK = await urlSinkronisasiJto();
        console.log("URL_SINK : ", URL_SINK);

        const urlJto =
            URL_SINK != 0 ?
            `${URL_SINK}/v2pb/jto/kendaraan/ujiberkala?nokend=${nokend.toUpperCase()}` :
            `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/ujiberkala?nokend=${nokend.toUpperCase()}`;
        // console.log('URL JTO: ', urlJto);
        // const urlJto = `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/ujiberkala?nokend=${nokend.toUpperCase()}`;
        var config_axios = {
            method: "GET",
            timeout: 8000,
            url: urlJto, // 'https://jto.dephub.go.id/api/v2/v2pb/jto/kendaraan/qrcode?qr=https://ujiberkala.dephub.go.id/qr/vi/C11D34C1DA66E9F89A2BF31EAF8DE7C9'.toString(),
        };
        var arr = [];
        const response = await axios(config_axios);
        // console.log('ERR', response);

        if (response.data.success) {
            var data = response.data.data;
            arr.push(data);

            var foto_depan_url = "";
            var foto_belakang_url = "";
            var foto_kiri_url = "";
            var foto_kanan_url = "";

            var foto_depan = "";
            var foto_belakang = "";
            var foto_kiri = "";
            var foto_kanan = "";

            var upsert_data = await upsert(
                data.rfid || "",
                data.vcode || "",
                data.no_reg_kend,
                data.no_uji,
                data.nama_pemilik,
                data.alamat_pemilik,
                data.lokasi_uji,
                data.tanggal_uji,
                data.masa_berlaku_uji,
                data.jenis_kend,
                data.konfigurasi_sumbu,
                data.berat_kosong,
                data.jbb,
                data.jbkb,
                data.jbi,
                data.jbki,
                data.panjang_utama,
                data.lebar_utama,
                data.tinggi_utama,
                data.julur_depan,
                data.julur_belakang,
                foto_depan,
                foto_kanan,
                foto_kiri,
                data.nomor_rangka,
                data.merek,
                data.bahan_bakar,
                data.daya_angkut_orang,
                data.daya_angkut_barang,
                data.kelas,
                moment().format("YYYY-MM-DD HH:mm:ss"),
                moment().format("YYYY-MM-DD HH:mm:ss"),
                data.created_by,
                data.is_masa_berlaku,
                true,
                foto_belakang,
                foto_depan_url,
                foto_belakang_url,
                foto_kanan_url,
                foto_kiri_url,
                data.created_by,
                data.jenis_kendaraan_id,
                data.sumbu_id,
                data.blue_id,
                data.no_srut,
                data.tgl_srut,
                data.no_mesin,
                data.tipe,
                data.tahun_rakit,
                data.isi_silinder,
                data.daya_motor,
                data.ukuran_ban,
                data.keterangan_hasil_uji,
                data.petugas_penguji,
                data.nrp_petugas_penguji,
                data.kepala_dinas,
                data.pangkat_kepala_dinas,
                data.nip_kepala_dinas,
                data.unit_pelaksana_teknis,
                data.direktur,
                data.pangkat_direktur,
                data.nip_direktur,
                moment(data.etl_date).format("YYYY-MM-DD HH:mm:ss"),
                data.jarak_sumbu_1_2,
                data.jarak_sumbu_2_3,
                data.jarak_sumbu_3_4,
                data.dimensi_bak_tangki,
                data.mst,
                data.kepemilikan_id,
                data.kepemilikan_val
            );
            console.log("UPSERT DATA KENDARAAN : ", upsert_data.length);
            if (upsert_data && upsert_data.length > 0) {
                return upsert_data;
            } else {
                return arr;
            }
        } else {
            return arr;
        }
    } catch (error) {
        console.log("ERROR RESPONSE : ", error.response);
        console.log("ERROR RESPONSE JTO SERVER");

        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        }

        return [];
    }
};

const checkjtoserverkendrfid = async (rfid) => {
    try {
        var URL_SINK = await urlSinkronisasiJto();
        // console.log('URL_SINK : ', URL_SINK);

        const urlJto =
            URL_SINK != 0 ?
            `${URL_SINK}/v2pb/jto/kendaraan/rfid` :
            `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/rfid`;
        // console.log('URL REQ JTO RFID: ', urlJto);
        // const urlJto = `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/rfid`;
        var config_axios = {
            method: "POST",
            timeout: 12000,
            url: urlJto,
            data: {
                rfid: rfid,
            }, // 'https://jto.dephub.go.id/api/v2/v2pb/jto/kendaraan/qrcode?qr=https://ujiberkala.dephub.go.id/qr/vi/C11D34C1DA66E9F89A2BF31EAF8DE7C9'.toString(),
        };
        var arr = [];
        const response = await axios(config_axios);

        if (response.data.success) {
            var data = response.data.data;

            arr.push(data);

            var foto_depan_url = "";
            var foto_belakang_url = "";
            var foto_kiri_url = "";
            var foto_kanan_url = "";

            var foto_depan = "";
            var foto_belakang = "";
            var foto_kiri = "";
            var foto_kanan = "";
            // console.log('RESPONSE AXIOS RFID: ', data[0]);
            var upsert_data = await upsert(
                data.rfid,
                data.vcode,
                data.no_reg_kend,
                data.no_uji,
                data.nama_pemilik,
                data.alamat_pemilik,
                data.lokasi_uji,
                data.tanggal_uji,
                data.masa_berlaku_uji,
                data.jenis_kend,
                data.konfigurasi_sumbu,
                data.berat_kosong,
                data.jbb,
                data.jbkb,
                data.jbi,
                data.jbki,
                data.panjang_utama,
                data.lebar_utama,
                data.tinggi_utama,
                data.julur_depan,
                data.julur_belakang,
                foto_depan,
                foto_kanan,
                foto_kiri,
                data.nomor_rangka,
                data.merek,
                data.bahan_bakar,
                data.daya_angkut_orang,
                data.daya_angkut_barang,
                data.kelas,
                moment().format("YYYY-MM-DD HH:mm:ss"),
                moment().format("YYYY-MM-DD HH:mm:ss"),
                data.created_by,
                data.is_masa_berlaku,
                true,
                foto_belakang,
                foto_depan_url,
                foto_belakang_url,
                foto_kanan_url,
                foto_kiri_url,
                data.created_by,
                data.jenis_kendaraan_id,
                data.sumbu_id,
                data.blue_id,
                data.no_srut,
                data.tgl_srut,
                data.no_mesin,
                data.tipe,
                data.tahun_rakit,
                data.isi_silinder,
                data.daya_motor,
                data.ukuran_ban,
                data.keterangan_hasil_uji,
                data.petugas_penguji,
                data.nrp_petugas_penguji,
                data.kepala_dinas,
                data.pangkat_kepala_dinas,
                data.nip_kepala_dinas,
                data.unit_pelaksana_teknis,
                data.direktur,
                data.pangkat_direktur,
                data.nip_direktur,
                moment(data.etl_date).format("YYYY-MM-DD HH:mm:ss"),
                data.jarak_sumbu_1_2,
                data.jarak_sumbu_2_3,
                data.jarak_sumbu_3_4,
                data.dimensi_bak_tangki,
                data.mst,
                data.kepemilikan_id,
                data.kepemilikan_val
            );
            console.log("UPSERT DATA KENDARAAN : ", upsert_data.length);
            if (upsert_data && upsert_data.length > 0) {
                return upsert_data;
            } else {
                return arr;
            }
        } else {
            return arr;
        }
    } catch (error) {
        console.log("ERROR RESPONSE : ", error.response);
        console.log("ERROR RESPONSE JTO SERVER");

        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        }
        return [];
    }
};

const selectLastPenimbangan = async (no_reg_kend) => {
    console.log(
        "----------------------------------------- SEARCH FROM DATA PENIMBANGAN -----------------------------------------"
    );
    var sql = `SELECT * FROM jt_penimbangan WHERE no_kendaraan = '${no_reg_kend}' AND is_deleted = false ORDER BY tgl_penimbangan DESC LIMIT 1`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false,
    });

    if (result.length > 0) {
        var jenis_kendaraan_id = result[0].jenis_kendaraan ?
            await getJenisKendaraanId(result[0].jenis_kendaraan) :
            null;
        var sumbu_id = result[0].sumbu ?
            await getSumbuId(result[0].sumbu) :
            null;
        var kepemilikan_val = await getKepemilikanVal(result[0].nama_pemilik);
        let is_masa_berlaku = await checkMasaBerlaku(
            result[0].tgl_masa_berlaku
        );
        var data = [{
            // rfid: result[0].rfid,
            // vcode: result[0].vcode,
            no_reg_kend: result[0].no_kendaraan,
            no_uji: result[0].no_uji,
            nama_pemilik: result[0].nama_pemilik,
            alamat_pemilik: result[0].alamat_pemilik,
            // lokasi_uji: result[0].lokasi_uji,
            tanggal_uji: result[0].tgl_uji,
            masa_berlaku_uji: result[0].tgl_masa_berlaku,
            is_masa_berlaku: is_masa_berlaku,
            jenis_kendaraan_id: jenis_kendaraan_id,
            jenis_kend: result[0].jenis_kendaraan ?
                result[0].jenis_kendaraan.toUpperCase() : "",
            sumbu_id: sumbu_id,
            konfigurasi_sumbu: result[0].sumbu,
            kepemilikan_id: result[0].kategori_kepemilikan_id ?
                result[0].kategori_kepemilikan_id : null,
            kepemilikan_val: kepemilikan_val,
            // berat_kosong: result[0].Number(berat_kosong)},
            jbb: result[0].jbb_uji,
            jbkb: result[0].jbkb_uji,
            jbi: result[0].jbi_uji,
            // jbki: result[0].(typeof jbki == 'string') ? 0 : Number(jbki) },
            panjang_utama: result[0].panjang_utama,
            lebar_utama: result[0].lebar_utama,
            tinggi_utama: result[0].tinggi_utama,
            julur_depan: result[0].julur_depan,
            julur_belakang: result[0].julur_belakang,
            foto_depan: "",
            foto_kanan: "",
            foto_kiri: "",
            foto_belakang: "",
            mst: result[0].mst_uji,
        }, ];

        return data;
    } else {
        return [];
    }
};

const selectLast = async (no_reg_kend) => {
    console.log(
        "----------------------------------------- SEARCH FROM DATA KENDARAAN -----------------------------------------"
    );
    var sql = `SELECT * FROM jt_kendaraan WHERE no_reg_kend = '${no_reg_kend}' AND is_deleted = false`;
    console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false,
    });

    if (result !== undefined) {
        if (result.length > 0) {
            if (result[0].is_masa_berlaku) {
                console.log("==> DARI DATA KENDARAAN");
                return result;
            } else {
                var dataPenimbangan = await selectLastPenimbangan(no_reg_kend);
                if (dataPenimbangan.length > 0) {
                    console.log("==> DARI DATA LAST PENIMBANGAN");
                    return await selectLastPenimbangan(no_reg_kend);
                } else {
                    console.log(
                        "==> DARI DATA KENDARAAN JIKA DI PENIMBANGAN TIDAK TERSEDIA"
                    );
                    return result;
                }
            }
        }
    } else {
        console.log("RESULT UNDEFINED");
        var dataPenimbangan = await selectLastPenimbangan(no_reg_kend);
        if (dataPenimbangan.length > 0) {
            console.log("==> DARI DATA LAST PENIMBANGAN");
            return await selectLastPenimbangan(no_reg_kend);
        } else {
            console.log(
                "==> DARI DATA KENDARAAN JIKA DI PENIMBANGAN TIDAK TERSEDIA"
            );
            return [];
        }
    }
};

const selectLastRfid = async (rfid) => {
    var sql = `SELECT * FROM jt_kendaraan WHERE rfid = '${rfid}' AND is_deleted = false`;
    // console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false,
    });
    console.log("RESPON RESULT FROM KENDARAAN: ", result);
    return result;
};

const getFotoKendaraanQrNew = async (key) => {
    // const url = remove(key, 70, key.length); // `https://ujiberkala.dephub.go.id/qr/vi/${key}`;
    const url = remove(key, 80, key.length);
    console.log("URL IMG : ", url);
    var config = {
        method: "GET",
        url: url,
    };

    const response = await axios(config);
    var arr = [];
    if (response) {
        // console.log('res : ', response.data);
        const html = response.data;
        const $ = cheerio.load(html);
        const no_uji = $(
            "body > div.app-content.content > div.content-wrapper > div > div:nth-child(2) > div:nth-child(2) > div > table > tbody > tr:nth-child(1) > td:nth-child(2)"
        );
        const no_reg_kend = $(
            "body > div.app-content.content > div.content-wrapper > div > div:nth-child(2) > div:nth-child(2) > div > table > tbody > tr:nth-child(3) > td:nth-child(2)"
        );
        const masa_berlaku = $(
            "body > div.app-content.content > div.content-wrapper > div > div:nth-child(1) > div > center:nth-child(3) > h3"
        );
        const foto_depan = $(
            "body > div.app-content.content > div.content-wrapper > div > div:nth-child(4) > div:nth-child(1) > div > div > div > div > a > img"
        );
        const foto_belakang = $(
            "body > div.app-content.content > div.content-wrapper > div > div:nth-child(4) > div:nth-child(2) > div > div > div > div > a > img"
        );
        const foto_kanan = $(
            "body > div.app-content.content > div.content-wrapper > div > div:nth-child(4) > div:nth-child(3) > div > div > div > div > a > img"
        );
        const foto_kiri = $(
            "body > div.app-content.content > div.content-wrapper > div > div:nth-child(4) > div:nth-child(4) > div > div > div > div > a > img"
        );

        // var objbln = {}'
        var arrbln = {};
        arrbln["Januari"] = "01";
        arrbln["Februari"] = "02";
        arrbln["Maret"] = "03";
        arrbln["April"] = "04";
        arrbln["Mei"] = "05";
        arrbln["Juni"] = "06";
        arrbln["Juli"] = "07";
        arrbln["Agustus"] = "08";
        arrbln["September"] = "09";
        arrbln["Oktober"] = "10";
        arrbln["November"] = "11";
        arrbln["Desember"] = "12";

        var parse_plat_no = no_reg_kend.text().replace(": ", "");
        var parse_no_uji = no_uji.text().replace(": ", "");
        var result_no_uji = parse_no_uji.replace(" ", "");
        var result_no_kendaraan = parse_plat_no.replace(
            /[`~!@#$%^&*()_|+\-=?;:\s'",.<>\{\}\[\]\\\/]/gi,
            ""
        );
        var masa_berlaku_scan = masa_berlaku
            .text()
            .replace(" Masa Berlaku Hasil Uji : ", "");
        var masa_berlaku_scan_rem_last_space = masa_berlaku_scan.replace(
            /\s+$/,
            ""
        );
        // console.log('QR SCAN MASA BERLAKU: ', masa_berlaku_scan_rem_last_space.replace(/\s+/g, '-'));
        var date_uji = masa_berlaku_scan_rem_last_space
            .replace(/\s+/g, "-")
            .split("-");
        var tgl = date_uji[0];
        var bln = arrbln[date_uji[1]];
        var thn = date_uji[2];
        var tgl_qr_uji = `${tgl}-${bln}-${thn}`;

        console.log(
            result_no_uji,
            " | ",
            result_no_kendaraan,
            " | ",
            tgl_qr_uji.replace(/\s+$/, "")
        );

        // console.log(foto_depan.attr('src').replace('data:image/jpeg;base64,', ''));

        // console.log(result_no_uji, ' | ', result_no_kendaraan, ' | ', masa_berlaku.text().replace(' Masa Berlaku Uji : ', ''), ' | ', '\n');

        var res_foto_depan = base64decode(
            result_no_kendaraan,
            result_no_uji,
            "depan",
            foto_depan.attr("src").replace("data:image/jpeg;base64,", "")
        ).split(" | ");
        var res_foto_belakang = base64decode(
            result_no_kendaraan,
            result_no_uji,
            "belakang",
            foto_belakang.attr("src").replace("data:image/jpeg;base64,", "")
        ).split(" | ");
        var res_foto_kanan = base64decode(
            result_no_kendaraan,
            result_no_uji,
            "kanan",
            foto_kanan.attr("src").replace("data:image/jpeg;base64,", "")
        ).split(" | ");
        var res_foto_kiri = base64decode(
            result_no_kendaraan,
            result_no_uji,
            "kiri",
            foto_kiri.attr("src").replace("data:image/jpeg;base64,", "")
        ).split(" | ");
        // console.log(res_foto_depan);
        arr.push({
            no_reg_kend: result_no_kendaraan,
            no_uji: result_no_uji,
            masa_berlaku: tgl_qr_uji.replace(/\s+$/, ""),
            foto_depan: res_foto_depan,
            foto_belakang: res_foto_belakang,
            foto_kiri: res_foto_kiri,
            foto_kanan: res_foto_kanan,
        });
    }

    return arr;
};

const getFotoKendaraanQr = async (key) => {
    // const url = remove(key, 70, key.length); // `https://ujiberkala.dephub.go.id/qr/vi/${key}`;
    const url = remove(key, 70, key.length);
    console.log("URL IMG : ", url);
    var config = {
        method: "GET",
        url: url,
    };

    const response = await axios(config);
    var arr = [];
    if (response) {
        // console.log('res : ', response.data);
        const html = response.data;
        const $ = cheerio.load(html);

        const no_uji = $(
            "#container > div > div.row > div > div > div.widget-content > div:nth-child(1) > div:nth-child(2) > div > table > tbody > tr:nth-child(1) > td:nth-child(3)"
        );
        const no_reg_kend = $(
            "#container > div > div.row > div > div > div.widget-content > div:nth-child(1) > div:nth-child(2) > div > table > tbody > tr:nth-child(4) > td:nth-child(3)"
        );
        const masa_berlaku = $(
            "#container > div > div.row > div > div > div.widget-content > div:nth-child(7) > div:nth-child(2) > div:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(3)"
        );
        const foto_depan = $(
            "#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > a > img"
        );
        const foto_belakang = $(
            "#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a > img"
        );
        const foto_kanan = $(
            "#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(3) > a > img"
        );
        const foto_kiri = $(
            "#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(4) > a > img"
        );

        console.log(
            no_uji.text().replace(": ", ""),
            " | ",
            no_reg_kend.text().replace(": ", ""),
            " | ",
            masa_berlaku.text().replace(": ", ""),
            " | ",
            "\n"
        );
        var parse_plat_no = no_reg_kend.text().replace(": ", "");
        var result_no_uji = no_uji.text().replace(": ", "");
        var result_no_kendaraan = parse_plat_no.replace(
            /[`~!@#$%^&*()_|+\-=?;:\s'",.<>\{\}\[\]\\\/]/gi,
            ""
        );
        // console.log('RESULT NO KENDARAAN QR : ',result_no_kendaraan, ' ', result_no_uji);

        var res_foto_depan = base64decode(
            result_no_kendaraan,
            result_no_uji,
            "depan",
            foto_depan.attr("src").replace("data:image/jpeg;base64,", "")
        ).split(" | ");
        var res_foto_belakang = base64decode(
            result_no_kendaraan,
            result_no_uji,
            "belakang",
            foto_belakang.attr("src").replace("data:image/jpeg;base64,", "")
        ).split(" | ");
        var res_foto_kanan = base64decode(
            result_no_kendaraan,
            result_no_uji,
            "kanan",
            foto_kanan.attr("src").replace("data:image/jpeg;base64,", "")
        ).split(" | ");
        var res_foto_kiri = base64decode(
            result_no_kendaraan,
            result_no_uji,
            "kiri",
            foto_kiri.attr("src").replace("data:image/jpeg;base64,", "")
        ).split(" | ");

        arr.push({
            no_reg_kend: result_no_kendaraan,
            no_uji: result_no_uji,
            masa_berlaku: masa_berlaku.text().replace(": ", ""),
            foto_depan: res_foto_depan,
            foto_belakang: res_foto_belakang,
            foto_kiri: res_foto_kiri,
            foto_kanan: res_foto_kanan,
        });
    }

    return arr;
};

const qrcodescan = async (key) => {
    try {
        console.log("LENGTH : ", key.length);
        const datascan = [];
        if (key.length > 70) {
            console.log("QR BARU");
            var data = await getFotoKendaraanQrNew(key);
            console.log(data);
            datascan.push(data[0]);
            // return data;
        } else {
            console.log("QR LAMA");
            var data = await getFotoKendaraanQr(key);
            // console.log(data);
            datascan.push(data[0]);
            // return data;
        }

        const getDataKendaraan = await checkkendaraan(
            datascan[0].no_reg_kend,
            datascan[0].no_uji,
            datascan[0].masa_berlaku,
            datascan[0].foto_depan[0],
            datascan[0].foto_belakang[0],
            datascan[0].foto_kanan[0],
            datascan[0].foto_kiri[0],
            datascan[0].foto_depan[1],
            datascan[0].foto_belakang[1],
            datascan[0].foto_kanan[1],
            datascan[0].foto_kiri[1]
        );

        return getDataKendaraan;
        /*
        const url = remove(key, 70, key.length); // `https://ujiberkala.dephub.go.id/qr/vi/${key}`;

        var config = {
            method: 'GET',
            url: url,
        };

        const response = await axios(config);

        if (response) {
            const html = response.data;
            const $ = cheerio.load(html);

            const no_uji = $('#container > div > div.row > div > div > div.widget-content > div:nth-child(1) > div:nth-child(2) > div > table > tbody > tr:nth-child(1) > td:nth-child(3)');
            const no_reg_kend = $('#container > div > div.row > div > div > div.widget-content > div:nth-child(1) > div:nth-child(2) > div > table > tbody > tr:nth-child(4) > td:nth-child(3)');
            const masa_berlaku = $('#container > div > div.row > div > div > div.widget-content > div:nth-child(7) > div:nth-child(2) > div:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(3)');
            const foto_depan = $("#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > a > img");
            const foto_belakang = $("#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a > img");
            const foto_kanan = $("#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(3) > a > img");
            const foto_kiri = $("#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(4) > a > img");


            console.log(no_uji.text().replace(': ', ''), ' | ', no_reg_kend.text().replace(': ', ''), ' | ', masa_berlaku.text().replace(': ', ''), ' | ', '\n');
            var parse_plat_no = no_reg_kend.text().replace(': ', '');
            console.log(parse_plat_no.replace(/\s/g, ''));
            var result_no_uji = no_uji.text().replace(': ', '');
            var result_no_kendaraan = parse_plat_no.replace(/[`~!@#$%^&*()_|+\-=?;:\s'",.<>\{\}\[\]\\\/]/gi, "");
            console.log('RESULT NO KENDARAAN QR : ', result_no_kendaraan, ' ', result_no_uji);

            const getDataKendaraan = await checkkendaraan(result_no_kendaraan, result_no_uji, masa_berlaku.text().replace(': ', ''), foto_depan, foto_belakang, foto_kanan, foto_kiri);

            return getDataKendaraan;
        } else {
            return 'Error';
        }
        */
    } catch (error) {
        console.log(error);
        return error;
    }
};
// , foto_depan, foto_belakang, foto_kanan, foto_kiri, foto_depan_url, foto_belakang_url, foto_kanan_url, foto_kiri_url
const checkkendaraan = async (
    no_reg_kend,
    no_uji,
    masa_berlaku_uji,
    foto_depan,
    foto_belakang,
    foto_kanan,
    foto_kiri,
    foto_depan_url,
    foto_belakang_url,
    foto_kanan_url,
    foto_kiri_url
) => {
    var sql = `SELECT * FROM jt_kendaraan WHERE no_reg_kend = '${no_reg_kend}' AND is_deleted = false`;
    // console.log(sql);
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false,
    });

    if (Object.keys(result).length > 0) {
        // setTimeout( async() => {
        // var foto_depan = base64decode(no_reg_kend, no_uji, 'depan', resp_foto_depan.attr('src').replace('data:image/jpeg;base64,', '')).split(' | ');
        // var foto_belakang = base64decode(no_reg_kend, no_uji, 'belakang', resp_foto_belakang.attr('src').replace('data:image/jpeg;base64,', '')).split(' | ');
        // var foto_kanan = base64decode(no_reg_kend, no_uji, 'kanan', resp_foto_kanan.attr('src').replace('data:image/jpeg;base64,', '')).split(' | ');
        // var foto_kiri = base64decode(no_reg_kend, no_uji, 'kiri', resp_foto_kiri.attr('src').replace('data:image/jpeg;base64,', '')).split(' | ');

        // console.log('FOTO DEPAN : ', foto_depan[1]);
        let masa_berlaku = moment(masa_berlaku_uji, "DD-MM-YYYY");
        // console.log(masa_berlaku);
        var checkformatdate = moment(masa_berlaku, "DD-MMM-YYYY", true)
            .tz("UTC")
            .isValid();
        //console.log('MASA BERLAKU DATE : ', checkformatdate, ' AND ', moment(masa_berlaku).tz('UTC').format('YYYY-MM-DD'));
        var onMasaBerlakuDate = checkformatdate ?
            moment(masa_berlaku, "DD-MM-YYYY").format("YYYY-MM-DD") :
            moment(masa_berlaku).format("YYYY-MM-DD");
        //console.log('MASA BERLAKU : ', moment(masa_berlaku).format('YYYY-MM-DD'), ' TYPE OF : ', typeof masa_berlaku_uji);
        //console.log('QR EXPIRED : ', moment(moment().format('YYYY-MM-DD')).isSameOrAfter(moment(masa_berlaku).format('YYYY-MM-DD')));
        const removegambar = await removeGambarField(no_reg_kend);
        console.log("removegambar : ", removegambar);
        if (
            moment(masa_berlaku).format("YYYY-MM-DD") >
            moment(result[0].masa_berlaku_uji).format("YYYY-MM-DD")
        ) {
            //moment(result[0].masa_berlaku_uji).isSameOrAfter(moment(masa_berlaku).format('YYYY-MM-DD'))){
            console.log("UPDATE PENYESUAIAN MASA BERLAKU, NOMOR UJI DAN IMAGE");

            var update = await update_kendaran_expired(
                no_reg_kend,
                no_uji,
                moment(masa_berlaku).format("YYYY-MM-DD"),
                foto_depan,
                foto_belakang,
                foto_kanan,
                foto_kiri,
                foto_depan_url,
                foto_belakang_url,
                foto_kanan_url,
                foto_kiri_url
            );

            if (update == 1) {
                return await selectLast(no_reg_kend);
            } else {
                return result;
            }
            //return 0;
        } else {
            console.log("UPDATE GAMBAR TANPA MASA BERLAKU");
            // if(result[0].foto_depan == '' && result[0].foto_belakang == '' && result[0].foto_kanan == '' && result[0].foto_kiri == ''){
            var update = await update_kendaran_foto(
                no_reg_kend,
                no_uji,
                foto_depan,
                foto_belakang,
                foto_kanan,
                foto_kiri,
                foto_depan_url,
                foto_belakang_url,
                foto_kanan_url,
                foto_kiri_url
            );
            console.log("UPDATE : ", update);

            if (update == 1) {
                return await selectLast(no_reg_kend);
            }
        }
    } else {
        if (process.env.IS_KEMENHUB == 1) {
            console.log("CHECK KE BLUE NO KENDARAAN : ", no_reg_kend);

            return no_reg_kend;
        } else {
            console.log("LOCAL DATA DISINI");
            return 0;
        }
    }
};

const removeGambar = async (
    foto_depan,
    foto_belakang,
    foto_kiri,
    foto_kanan
) => {
    console.log("FOTO DEPAN : ", foto_depan);
    if (fs.existsSync(foto_depan)) {
        fs.unlink(foto_depan, function (err) {
            if (err) {
                return "Foto Depan Gagal Hapus. " + err;
            } else {
                console.log(foto_depan, " Foto Depan Berhasil di Hapus");
                return foto_depan + " Foto Depan Berhasil di Hapus";
            }
        });
    } else {
        return 0;
    }

    if (fs.existsSync(foto_belakang)) {
        fs.unlink(foto_belakang, function (err) {
            if (err) {
                return "Foto Belakang Gagal Hapus. " + err;
            } else {
                console.log(foto_belakang, " Foto Belakang Berhasil di Hapus");
                return foto_belakang + " Foto Belakang Berhasil di Hapus";
            }
        });
    } else {
        return 0;
    }

    if (fs.existsSync(foto_kiri)) {
        fs.unlink(foto_kiri, function (err) {
            if (err) {
                return "Foto Kiri Gagal Hapus. " + err;
            } else {
                console.log(foto_kiri, " Foto Kiri Berhasil di Hapus");
                return foto_kiri + " Foto Kiri Berhasil di Hapus";
            }
        });
    } else {
        return 0;
    }

    if (fs.existsSync(foto_kanan)) {
        fs.unlink(foto_kanan, function (err) {
            if (err) {
                return "Foto Kanan Gagal Hapus. " + err;
            } else {
                console.log(foto_kanan, " Foto Kanan Berhasil di Hapus");
                return foto_kanan + " Foto Kanan Berhasil di Hapus";
            }
        });
    } else {
        return 0;
    }
};

const removeGambarField = async (no_reg_kend) => {
    var sql = `SELECT * FROM jt_kendaraan WHERE no_reg_kend = '${no_reg_kend}' AND is_deleted = false`;

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false,
    });

    if (Object.keys(result).length > 0) {
        var gambar_depan =
            path.join(config.path_upload) +
            "\\kendaraan\\" +
            result[0].foto_depan;
        var gambar_belakang =
            path.join(config.path_upload) +
            "\\kendaraan\\" +
            result[0].foto_belakang;
        var foto_kiri =
            path.join(config.path_upload) +
            "\\kendaraan\\" +
            result[0].foto_kiri;
        var foto_kanan =
            path.join(config.path_upload) +
            "\\kendaraan\\" +
            result[0].foto_kanan;
        console.log(gambar_depan);

        if (fs.existsSync(gambar_depan)) {
            fs.unlink(gambar_depan, function (err) {
                if (err) {
                    return "Foto Depan Gagal Hapus. " + err;
                } else {
                    console.log(gambar_depan, " Foto Depan Berhasil di Hapus");
                    return gambar_depan + " Foto Depan Berhasil di Hapus";
                }
            });
        } else {
            return 0;
        }

        if (fs.existsSync(gambar_belakang)) {
            fs.unlink(gambar_belakang, function (err) {
                if (err) {
                    return "Foto Belakang Gagal Hapus. " + err;
                } else {
                    console.log(
                        gambar_belakang,
                        " Foto Belakang Berhasil di Hapus"
                    );
                    return gambar_belakang + " Foto Belakang Berhasil di Hapus";
                }
            });
        } else {
            return 0;
        }

        if (fs.existsSync(foto_kiri)) {
            fs.unlink(foto_kiri, function (err) {
                if (err) {
                    return "Foto Kiri Gagal Hapus. " + err;
                } else {
                    console.log(foto_kiri, " Foto Kiri Berhasil di Hapus");
                    return foto_kiri + " Foto Kiri Berhasil di Hapus";
                }
            });
        } else {
            return 0;
        }

        if (fs.existsSync(foto_kanan)) {
            fs.unlink(foto_kanan, function (err) {
                if (err) {
                    return "Foto Kanan Gagal Hapus. " + err;
                } else {
                    console.log(foto_kanan, " Foto Kanan Berhasil di Hapus");
                    return foto_kanan + " Foto Kanan Berhasil di Hapus";
                }
            });
        } else {
            return 0;
        }
    } else {
        return 1;
    }
};

const base64decode = (no_reg_kend, no_uji, desk_file, base64data) => {
    var file_name =
        no_reg_kend +
        "_" +
        moment().format("YYYY_MM_DD_HH_mm_ss") +
        "_" +
        moment().valueOf() +
        "_" +
        desk_file +
        ".jpg";
    const uploadPath =
        path.join(config.path_upload) + "/kendaraan/" + file_name; ////config.path_upload+'/'+file_name;
    const imageUrl = `${config.image_url}kendaraan/${file_name}`;
    let buff = Buffer.from(base64data, "base64"); //new Buffer(data, 'base64');
    let save = fs.writeFileSync(uploadPath, buff);

    console.log("Simpan Berhasil ", `${file_name} | ${imageUrl}`);
    return `${file_name} | ${imageUrl}`;
};

const update_kendaran_expired = async (
    no_reg_kend,
    no_uji,
    masa_berlaku_uji,
    foto_depan,
    foto_belakang,
    foto_kanan,
    foto_kiri,
    foto_depan_url,
    foto_belakang_url,
    foto_kanan_url,
    foto_kiri_url
) => {
    const t = await sequelize.transaction();
    let masa_berlaku = moment(
        moment(masa_berlaku_uji, "DD-MM-YYYY").toDate()
    ).format("YYYY-MM-DD");
    try {
        let sql = `UPDATE jt_kendaraan SET 
                        no_reg_kend = '${no_reg_kend}',
                        no_uji = '${no_uji}',
                        tanggal_uji = '${moment(masa_berlaku)
                            .subtract(6, "months")
                            .format("YYYY-MM-DD")}',
                        masa_berlaku_uji = '${masa_berlaku_uji}',
                        foto_depan = '${foto_depan}',
                        foto_kanan = '${foto_kanan}',
                        foto_kiri = '${foto_kiri}',
                        foto_belakang = '${foto_belakang}',
                        foto_depan_url = '${foto_depan_url}',
                        foto_belakang_url = '${foto_belakang_url}',
                        foto_kanan_url = '${foto_kanan_url}',
                        foto_kiri_url = '${foto_kiri_url}'
                    WHERE no_reg_kend = '${no_reg_kend}'`;
        console.log("SQL UPDATE : ", sql);
        const res_update = await sequelize.query(
            sql, {
                logging: false,
            }, {
                transaction: t
            }
        );

        await t.commit();
        if (res_update[1].command == "UPDATE") {
            console.log("UPDATE MASA BERLAKU : ", res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
    //return res_update[1].command;
};

const update_kendaran_foto = async (
    no_reg_kend,
    no_uji,
    foto_depan,
    foto_belakang,
    foto_kanan,
    foto_kiri,
    foto_depan_url,
    foto_belakang_url,
    foto_kanan_url,
    foto_kiri_url
) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_kendaraan SET 
                        no_reg_kend = '${no_reg_kend}',
                        no_uji = '${no_uji}',
                        foto_depan = '${foto_depan}',
                        foto_kanan = '${foto_kanan}',
                        foto_kiri = '${foto_kiri}',
                        foto_belakang = '${foto_belakang}',
                        foto_depan_url = '${foto_depan_url}',
                        foto_belakang_url = '${foto_belakang_url}',
                        foto_kanan_url = '${foto_kanan_url}',
                        foto_kiri_url = '${foto_kiri_url}'
                    WHERE no_reg_kend = '${no_reg_kend}'`;

        const res_update = await sequelize.query(
            sql, {
                logging: false,
            }, {
                transaction: t
            }
        );

        await t.commit();
        if (res_update[1].command == "UPDATE") {
            console.log("UPDATE IMAGE : ", res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
    //return res_update[1].command;
};

const updateToken = async (token_type, access_token) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_integrasi_sistem SET 
                        api_auth_params = '${token_type} ${access_token}',
                        api_auth_token = '${access_token}'
                    WHERE kode = 'BLUE'`;

        const res_update = await sequelize.query(
            sql, {
                logging: false,
            }, {
                transaction: t
            }
        );

        await t.commit();
        if (res_update[1].command == "UPDATE") {
            console.log("UPDATE TOKEN : ", res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
};

const setTokenBlue = async () => {
    console.log("SET TOKEN BLUE 2");
    const q = await t_integrasi.findOne({
        where: {
            kode: blue,
            is_active: true,
            is_deleted: false,
        },
        logging: false,
    });
    var data = qs.stringify({
        grant_type: "client_credentials",
    });
    var apiurl = q.api_url.replace(/[\r\n]/g, "");
    var auth_username = q.api_auth_username;
    var auth_password = q.api_auth_password;

    var endpoint = `${apiurl}/auth-service/auth/open/token`;

    const loginData = {
        email: auth_username,
        password: auth_password
    };

    var config = {
        method: "post",
        url: endpoint,
        headers: {
            "Content-Type": "application/json",
        },
        data: loginData,
    };

    await axios(config)
        .then(async function (response) {
            var access_token = response.data.token;
            var token_type = response.data.token_type;
            // var expires_in = response.data.expires_in;
            console.log("RESPONSE : ", response.data.token);
            var update = await updateToken(token_type, access_token);
            return update;
        })
        .catch(function (error) {
            console.log(error.response);
            return 0;
        });
};

const ujiberkalaRetry = async (no_registrasi_kendaraan) => {
    console.log(
        "--------------------::Processing Integrasi BLUE - UJI BERKALA | RETRYING 15x MAX::--------------------"
    );

    return new Promise(async (resolve, reject) => {
        // Konfigurasi retry
        const maxRetries = 15;
        const retryDelay = 2000; // 2 detik
        let retryCount = 0;

        const executeRequest = async () => {
            try {
                const q = await t_integrasi.findOne({
                    where: {
                        kode: blue,
                        is_active: true,
                        is_deleted: false,
                    },
                    logging: false,
                });

                var apiurl = q.api_url.replace(/[\r\n]/g, "");

                var endpoint = `${apiurl}${process.env.ENDPOINT_BLUE_V4}?no_registrasi_kendaraan=${no_registrasi_kendaraan.toUpperCase()}`;

                var config = {
                    method: "GET",
                    timeout: 6000,
                    url: endpoint,
                    headers: {
                        Authorization: `${q.api_auth_params}`,
                    },
                };

                const response = await axios(config);

                // Handle expired token
                if (response.data && response.data.status_code === 400 && 
                    response.data.message === 'Expired token') {
                    throw new Error('Expired token');
                }

                // Handle error 500 - trigger retry
                if (response.data && response.data.status_code === 500 && 
                    response.data.exception === 'Illuminate\\Http\\Client\\ConnectionException' &&
                    response.data.message === '500 Internal Server Error') {
                    
                    throw new Error('RETRY_NEEDED');
                }

                console.log("DATA BLUE : ", response.data);
                resolve(response.data.data);

            } catch (error) {
                // Handle error response dari server
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    
                    // Handle expired token
                    if (error.response.data.status_code === 400 && 
                        error.response.data.message === 'Expired token') {
                        try {
                            var setToken = await setTokenBlue();
                            if (setToken == 1) {
                                console.log("AUTHENTICATION");
                                // Setelah refresh token, coba lagi request
                                await executeRequest();
                                return;
                            }
                        } catch (tokenError) {
                            reject(0);
                            return;
                        }
                    }
                    
                    // Handle error 500 untuk retry
                    if (error.response.data.status_code === 500 && 
                        error.response.data.exception === 'Illuminate\\Http\\Client\\ConnectionException' &&
                        error.response.data.message === '500 Internal Server Error') {
                        
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Retry attempt ${retryCount}/${maxRetries} after ${retryDelay}ms`);
                            
                            setTimeout(async () => {
                                try {
                                    await executeRequest();
                                } catch (retryError) {
                                    reject(0);
                                }
                            }, retryDelay);
                            return;
                        } else {
                            console.log(`Max retries (${maxRetries}) exceeded`);
                            reject(0);
                            return;
                        }
                    }
                    
                    // Untuk error lainnya, langsung reject
                    reject(0);
                    
                } else if (error.message === 'RETRY_NEEDED') {
                    // Handle retry untuk successful response dengan error 500
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`Retry attempt ${retryCount}/${maxRetries} after ${retryDelay}ms`);
                        
                        setTimeout(async () => {
                            try {
                                await executeRequest();
                            } catch (retryError) {
                                reject(0);
                            }
                        }, retryDelay);
                        return;
                    } else {
                        console.log(`Max retries (${maxRetries}) exceeded`);
                        reject(0);
                        return;
                    }
                } else {
                    // Handle other errors
                    console.log(error);
                    reject(0);
                }
            }
        };

        // Mulai eksekusi request
        await executeRequest();
    });
};

const ujiberkala = async (no_registrasi_kendaraan) => {

    if (process.env.RETRY_BLUE == 'true') {
        return await ujiberkalaRetry(no_registrasi_kendaraan);
    }

    console.log(
        "--------------------::Processing Integrasi BLUE - UJI BERKALA::--------------------"
    );

    return new Promise(async (resolve, reject) => {
        try {

            const q = await t_integrasi.findOne({
                where: {
                    kode: blue,
                    is_active: true,
                    is_deleted: false,
                },
                logging: false,
            });

            var apiurl = q.api_url.replace(/[\r\n]/g, "");

            var endpoint = `${apiurl}${process.env.ENDPOINT_BLUE_V4}?no_registrasi_kendaraan=${no_registrasi_kendaraan.toUpperCase()}`;

            var config = {
                method: "GET",
                timeout: 6000,
                url: endpoint,
                headers: {
                    // 'Content-Type': 'application/json',
                    Authorization: `${q.api_auth_params}`,
                },
            };

            const response = await axios(config);

            if (response.data && response.data.status_code === 400 && 
                response.data.message === 'Expired token') {
                throw new Error('Expired token');
            }

            console.log("DATA BLUE : ", response.data);
            resolve(response.data.data);
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                if (error.response.data.status_code === 400 && 
                error.response.data.message === 'Expired token') {
                    // reject(0);
                    var setToken = await setTokenBlue();
                    if (setToken == 1) {
                        console.log("AUTHENTICATION");
                    }
                }
                reject(0);
            } else {
                console.log(error);
                reject(0);
            }
        }
    });
};

const ujiberkalarfid = async (rfid) => {
    console.log(
        "--------------------::Processing Integrasi BLUE - UJI BERKALA RFID::--------------------"
    );

    return new Promise(async (resolve, reject) => {
        try {

            const q = await t_integrasi.findOne({
                where: {
                    kode: blue,
                    is_active: true,
                    is_deleted: false,
                },
                logging: false,
            });

            var apiurl = q.api_url.replace(/[\r\n]/g, "");

            var endpoint = `${apiurl}${process.env.ENDPOINT_BLUE_V4}/rfid?rfid=${rfid}`;

            var config = {
                method: "GET",
                timeout: 12000,
                url: endpoint,
                headers: {
                    // 'Content-Type': 'application/json',
                    Authorization: `${q.api_auth_params}`,
                },
            };

            const response = await axios(config);

            if (response.data && response.data.status_code === 400 && 
                response.data.message === 'Expired token') {
                throw new Error('Expired token');
            }

            console.log("DATA BLUE RFID : ", response.data);
            resolve(response.data.data);
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                if (error.response.data.status_code === 400 && 
                error.response.data.message === 'Expired token') {
                    // reject(0);
                    var setToken = await setTokenBlue();
                    if (setToken == 1) {
                        console.log("AUTHENTICATION");
                    }
                }
                reject(0);
            } else {
                console.log(error);
                reject(0);
            }
        }
    });
};

const checkblue = async (no_registrasi_kendaraan, no_uji_kendaraan) => {
    return new Promise(async (resolve, reject) => {
        try {
            const q = await t_integrasi.findOne({
                where: {
                    kode: blue,
                    is_active: true,
                    is_deleted: false,
                },
                logging: true,
            });

            var apiurl = q.api_url.replace(/[\r\n]/g, "");

            var endpoint = `${apiurl}/ehubdat/v1/blue-lite?no_registrasi_kendaraan=${no_registrasi_kendaraan}`;
            if (no_uji_kendaraan) {
                endpoint = `${apiurl}/ehubdat/v1/blue-lite?no_uji_kendaraan=${no_uji_kendaraan}`;
            }
            //`${await url('/ehubdat/v1/blue?no_registrasi_kendaraan='+no_registrasi_kendaraan)}`

            var config = {
                method: "GET",
                url: endpoint, //'http://localhost:2001/api/auth',
                headers: {
                    // 'Content-Type': 'application/json',
                    Authorization: `${q.api_auth_params}`,
                },
            };

            const response = await axios(config);
            // console.log(response.data);
            resolve(response.data);
        } catch (error) {
            // checkblue(no_registrasi_kendaraan, no_uji_kendaraan);
            console.log("ERROR RESPONSE BLUE");
            /*
            checkblue(no_registrasi_kendaraan, no_uji_kendaraan);
            */
            // console.log(error)
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
            reject(0);
        }
    });
};

const upCheckString = (value) => {
    if (
        value === "null" ||
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-"
    ) {
        return "NULL"; // Return string 'NULL' untuk SQL
    } else {
        // Escape single quote dan beri kutip
        const escapedValue = value.toString().replace(/'/g, "''");
        return `'${escapedValue}'`;
    }
};

const upCheckNumber = (value) => {
    if (
        value === "-" ||
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "NULL"; // Return string 'NULL' untuk SQL
    } else {
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
        value === "Invalid date" || // Tambahkan pengecekan ini
        value === "invalid date" // Case insensitive
    ) {
        return "NULL"; // Return string 'NULL' untuk SQL
    } else {
        return `'${value}'`;
    }
};

const insert_kendaraan = async (
    rfid,
    vcode,
    no_reg_kend,
    no_uji,
    nama_pemilik,
    alamat_pemilik,
    lokasi_uji,
    tanggal_uji,
    masa_berlaku_uji,
    jenis_kend,
    konfigurasi_sumbu,
    berat_kosong,
    jbb,
    jbkb,
    jbi,
    jbki,
    panjang_utama,
    lebar_utama,
    tinggi_utama,
    julur_depan,
    julur_belakang,
    foto_depan,
    foto_kanan,
    foto_kiri,
    nomor_rangka,
    merek,
    bahan_bakar,
    daya_angkut_orang,
    daya_angkut_barang,
    kelas,
    created_at,
    created_by,
    is_masa_berlaku,
    is_active,
    foto_belakang,
    foto_depan_url,
    foto_belakang_url,
    foto_kanan_url,
    foto_kiri_url,
    jenis_kendaraan_id,
    sumbu_id,
    blue_id,
    no_srut,
    tgl_srut,
    no_mesin,
    tipe,
    tahun_rakit,
    isi_silinder,
    daya_motor,
    ukuran_ban,
    keterangan_hasil_uji,
    petugas_penguji,
    nrp_petugas_penguji,
    kepala_dinas,
    pangkat_kepala_dinas,
    nip_kepala_dinas,
    unit_pelaksana_teknis,
    direktur,
    pangkat_direktur,
    nip_direktur,
    etl_date,
    jarak_sumbu_1_2,
    jarak_sumbu_2_3,
    jarak_sumbu_3_4,
    dimensi_bak_tangki,
    mst,
    kepemilikan_id,
    kepemilikan_val
) => {
    const t = await sequelize.transaction();

    try {
        var sql = `INSERT INTO jt_kendaraan
                        (rfid, vcode, no_reg_kend, no_uji, nama_pemilik, alamat_pemilik, lokasi_uji, tanggal_uji, masa_berlaku_uji, jenis_kend, konfigurasi_sumbu, berat_kosong, jbb, jbkb, jbi, jbki, panjang_utama, lebar_utama, tinggi_utama, julur_depan, julur_belakang, foto_depan, foto_kanan, foto_kiri, nomor_rangka, merek, bahan_bakar, daya_angkut_orang, daya_angkut_barang, kelas, created_at, created_by, is_masa_berlaku, is_active, foto_belakang, foto_depan_url, foto_belakang_url, foto_kanan_url, foto_kiri_url, jenis_kendaraan_id, sumbu_id, blue_id, no_srut, tgl_srut, no_mesin, tipe, tahun_rakit, isi_silinder, daya_motor, ukuran_ban, keterangan_hasil_uji, petugas_penguji, nrp_petugas_penguji, kepala_dinas, pangkat_kepala_dinas, nip_kepala_dinas, unit_pelaksana_teknis, direktur, pangkat_direktur, nip_direktur, etl_date, jarak_sumbu_1_2, jarak_sumbu_2_3, jarak_sumbu_3_4, dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val)
                    VALUES
                        (${upCheckString(rfid)}, ${upCheckString(
            vcode
        )}, ${upCheckString(no_reg_kend)}, ${upCheckString(
            no_uji
        )}, ${upCheckString(nama_pemilik)}, ${upCheckString(
            alamat_pemilik
        )}, ${upCheckString(lokasi_uji)}, ${upCheckString(
            tanggal_uji
        )}, ${upCheckString(masa_berlaku_uji)}, ${upCheckString(
            jenis_kend
        )}, ${upCheckString(konfigurasi_sumbu)}, ${upCheckNumber(
            berat_kosong
        )}, ${upCheckNumber(jbb)}, ${upCheckNumber(jbkb)}, ${upCheckNumber(
            jbi
        )}, ${upCheckNumber(jbki)}, ${upCheckNumber(
            panjang_utama
        )}, ${upCheckNumber(lebar_utama)}, ${upCheckNumber(
            tinggi_utama
        )}, ${upCheckNumber(julur_depan)}, ${upCheckNumber(
            julur_belakang
        )}, ${upCheckString(foto_depan)}, ${upCheckString(
            foto_kanan
        )}, ${upCheckString(foto_kiri)}, ${upCheckString(
            nomor_rangka
        )}, ${upCheckString(merek)}, ${upCheckString(
            bahan_bakar
        )}, ${upCheckNumber(daya_angkut_orang)}, ${upCheckNumber(
            daya_angkut_barang
        )}, ${upCheckString(kelas)}, ${upCheckString(
            created_at
        )}, ${upCheckNumber(
            created_by
        )}, ${is_masa_berlaku}, ${is_active}, ${upCheckString(
            foto_belakang
        )}, ${upCheckString(foto_depan_url)}, ${upCheckString(
            foto_belakang_url
        )}, ${upCheckString(foto_kanan_url)}, ${upCheckString(
            foto_kiri_url
        )}, ${upCheckNumber(jenis_kendaraan_id)}, ${upCheckNumber(
            sumbu_id
        )}, ${upCheckNumber(blue_id)}, ${upCheckString(
            no_srut
        )}, ${upCheckDate(tgl_srut)}, ${upCheckString(
            no_mesin
        )}, ${upCheckString(tipe)}, ${upCheckString(
            tahun_rakit
        )}, ${upCheckString(isi_silinder)}, ${upCheckString(
            daya_motor
        )}, ${upCheckString(ukuran_ban)}, ${upCheckString(
            keterangan_hasil_uji
        )}, ${upCheckString(petugas_penguji)}, ${upCheckString(
            nrp_petugas_penguji
        )}, ${upCheckString(kepala_dinas)}, ${upCheckString(
            pangkat_kepala_dinas
        )}, ${upCheckString(nip_kepala_dinas)}, ${upCheckString(
            unit_pelaksana_teknis
        )}, ${upCheckString(direktur)}, ${upCheckString(
            pangkat_direktur
        )}, ${upCheckString(nip_direktur)}, ${upCheckDate(
            etl_date
        )}, ${upCheckNumber(jarak_sumbu_1_2)}, ${upCheckNumber(
            jarak_sumbu_2_3
        )}, ${upCheckNumber(jarak_sumbu_3_4)}, ${upCheckString(
            dimensi_bak_tangki
        )}, ${upCheckNumber(mst)}, ${upCheckNumber(
            kepemilikan_id
        )}, ${upCheckString(kepemilikan_val)})`;

        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false,
            transaction: t,
        });

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "");
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        console.log("Error insert_kendaraan:", error);
        await t.rollback();
        throw error;
    }
};

const update_kendaraan = async (
    rfid,
    vcode,
    no_reg_kend,
    no_uji,
    nama_pemilik,
    alamat_pemilik,
    lokasi_uji,
    tanggal_uji,
    masa_berlaku_uji,
    jenis_kend,
    konfigurasi_sumbu,
    berat_kosong,
    jbb,
    jbkb,
    jbi,
    jbki,
    panjang_utama,
    lebar_utama,
    tinggi_utama,
    julur_depan,
    julur_belakang,
    foto_depan,
    foto_kanan,
    foto_kiri,
    nomor_rangka,
    merek,
    bahan_bakar,
    daya_angkut_orang,
    daya_angkut_barang,
    kelas,
    is_masa_berlaku,
    is_active,
    updated_at,
    updated_by,
    foto_belakang,
    foto_depan_url,
    foto_belakang_url,
    foto_kanan_url,
    foto_kiri_url,
    jenis_kendaraan_id,
    sumbu_id,
    blue_id,
    no_srut,
    tgl_srut,
    no_mesin,
    tipe,
    tahun_rakit,
    isi_silinder,
    daya_motor,
    ukuran_ban,
    keterangan_hasil_uji,
    petugas_penguji,
    nrp_petugas_penguji,
    kepala_dinas,
    pangkat_kepala_dinas,
    nip_kepala_dinas,
    unit_pelaksana_teknis,
    direktur,
    pangkat_direktur,
    nip_direktur,
    etl_date,
    jarak_sumbu_1_2,
    jarak_sumbu_2_3,
    jarak_sumbu_3_4,
    dimensi_bak_tangki,
    mst,
    kepemilikan_id,
    kepemilikan_val
) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_kendaraan SET 
                        rfid = ${upCheckString(rfid)},
                        vcode = ${upCheckString(vcode)},
                        no_reg_kend = ${upCheckString(no_reg_kend)},
                        no_uji = ${upCheckString(no_uji)},
                        nama_pemilik = ${upCheckString(nama_pemilik)},
                        alamat_pemilik = ${upCheckString(alamat_pemilik)},
                        lokasi_uji = ${upCheckString(lokasi_uji)},
                        tanggal_uji = ${upCheckString(tanggal_uji)},
                        masa_berlaku_uji = ${upCheckString(masa_berlaku_uji)},
                        jenis_kend = ${upCheckString(jenis_kend.toUpperCase())},
                        konfigurasi_sumbu = ${upCheckString(konfigurasi_sumbu)},
                        berat_kosong = ${upCheckNumber(berat_kosong)},
                        jbb = ${upCheckNumber(jbb)},
                        jbkb = ${upCheckNumber(jbkb)},
                        jbi = ${upCheckNumber(jbi)},
                        jbki = ${upCheckNumber(jbki)},
                        panjang_utama = ${upCheckNumber(panjang_utama)},
                        lebar_utama = ${upCheckNumber(lebar_utama)},
                        tinggi_utama = ${upCheckNumber(tinggi_utama)},
                        julur_depan = ${upCheckNumber(julur_depan)},
                        julur_belakang = ${upCheckNumber(julur_belakang)},
                        foto_depan = ${upCheckString(
                            foto_depan
                        )},
                        foto_kanan = ${upCheckString(
                            foto_kanan
                        )},
                        foto_kiri = ${upCheckString(
                            foto_kiri
                        )},
                        nomor_rangka = ${upCheckString(nomor_rangka)},
                        merek = ${upCheckString(merek)},
                        bahan_bakar = ${upCheckString(bahan_bakar)},
                        daya_angkut_orang = ${upCheckNumber(daya_angkut_orang)},
                        daya_angkut_barang = ${upCheckNumber(
                            daya_angkut_barang
                        )},
                        kelas = ${upCheckString(kelas)},
                        updated_at = ${upCheckString(updated_at)},
                        is_masa_berlaku = ${is_masa_berlaku},
                        is_active = ${is_active},
                        foto_belakang = ${upCheckString(
                            foto_belakang
                        )},
                        foto_depan_url = ${upCheckString(
                            foto_depan_url
                        )},
                        foto_belakang_url = ${upCheckString(
                            foto_belakang_url
                        )},
                        foto_kanan_url = ${upCheckString(
                            foto_kanan_url
                        )},
                        foto_kiri_url = ${upCheckString(
                            foto_kiri_url
                        )},
                        updated_by = ${upCheckNumber(updated_by)},
                        jenis_kendaraan_id = ${upCheckNumber(
                            jenis_kendaraan_id
                        )},
                        sumbu_id = ${upCheckNumber(sumbu_id)},
                        blue_id = ${upCheckNumber(blue_id)},
                        no_srut = ${upCheckString(no_srut)},
                        tgl_srut = ${upCheckDate(tgl_srut)},
                        no_mesin = ${upCheckString(no_mesin)},
                        tipe = ${upCheckString(tipe)},
                        tahun_rakit = ${upCheckString(tahun_rakit)},
                        isi_silinder = ${upCheckString(isi_silinder)},
                        daya_motor = ${upCheckString(daya_motor)},
                        ukuran_ban = ${upCheckString(ukuran_ban)},
                        keterangan_hasil_uji = ${upCheckString(
                            keterangan_hasil_uji
                        )},
                        petugas_penguji = ${upCheckString(petugas_penguji)},
                        nrp_petugas_penguji = ${upCheckString(
                            nrp_petugas_penguji
                        )},
                        kepala_dinas = ${upCheckString(kepala_dinas)},
                        pangkat_kepala_dinas = ${upCheckString(
                            pangkat_kepala_dinas
                        )},
                        nip_kepala_dinas = ${upCheckString(nip_kepala_dinas)},
                        unit_pelaksana_teknis = ${upCheckString(
                            unit_pelaksana_teknis
                        )},
                        direktur = ${upCheckString(direktur)},
                        pangkat_direktur = ${upCheckString(pangkat_direktur)},
                        nip_direktur = ${upCheckString(nip_direktur)},
                        etl_date = ${upCheckDate(etl_date)},
                        jarak_sumbu_1_2 = ${upCheckNumber(jarak_sumbu_1_2)}, 
                        jarak_sumbu_2_3 = ${upCheckNumber(jarak_sumbu_2_3)}, 
                        jarak_sumbu_3_4 = ${upCheckNumber(jarak_sumbu_3_4)}, 
                        dimensi_bak_tangki = ${upCheckString(
                            dimensi_bak_tangki
                        )},
                        kepemilikan_id = ${upCheckNumber(kepemilikan_id)}, 
                        kepemilikan_val = ${upCheckString(kepemilikan_val)}, 
                        mst = ${upCheckNumber(mst)} 
                    WHERE LOWER(no_reg_kend) = LOWER(${upCheckString(no_reg_kend)})`;

        // console.log('UPDATE : ', sql);
        const res_update = await sequelize.query(sql, {
            logging: false,
            transaction: t,
        });

        await t.commit();
        if (res_update[1] && res_update[1].command == "UPDATE") {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error update_kendaraan:", error);
        await t.rollback();
        throw error;
    }
};

const upsert = async (
    rfid,
    vcode,
    no_reg_kend,
    no_uji,
    nama_pemilik,
    alamat_pemilik,
    lokasi_uji,
    tanggal_uji,
    masa_berlaku_uji,
    jenis_kend,
    konfigurasi_sumbu,
    berat_kosong,
    jbb,
    jbkb,
    jbi,
    jbki,
    panjang_utama,
    lebar_utama,
    tinggi_utama,
    julur_depan,
    julur_belakang,
    foto_depan,
    foto_kanan,
    foto_kiri,
    nomor_rangka,
    merek,
    bahan_bakar,
    daya_angkut_orang,
    daya_angkut_barang,
    kelas,
    created_at,
    updated_at,
    created_by,
    is_masa_berlaku,
    is_active,
    foto_belakang,
    foto_depan_url,
    foto_belakang_url,
    foto_kanan_url,
    foto_kiri_url,
    updated_by,
    jenis_kendaraan_id,
    sumbu_id,
    blue_id,
    no_srut,
    tgl_srut,
    no_mesin,
    tipe,
    tahun_rakit,
    isi_silinder,
    daya_motor,
    ukuran_ban,
    keterangan_hasil_uji,
    petugas_penguji,
    nrp_petugas_penguji,
    kepala_dinas,
    pangkat_kepala_dinas,
    nip_kepala_dinas,
    unit_pelaksana_teknis,
    direktur,
    pangkat_direktur,
    nip_direktur,
    etl_date,
    jarak_sumbu_1_2,
    jarak_sumbu_2_3,
    jarak_sumbu_3_4,
    dimensi_bak_tangki,
    mst,
    kepemilikan_id,
    kepemilikan_val
) => {
    const t = await sequelize.transaction();

    try {
        console.log("UPSERT KENDARAAN - NO REG KEND:", no_reg_kend);
        
        // Gunakan INSERT ... ON CONFLICT untuk UPSERT langsung
        var sql = `
            INSERT INTO jt_kendaraan (
                rfid, vcode, no_reg_kend, no_uji, nama_pemilik, alamat_pemilik, 
                lokasi_uji, tanggal_uji, masa_berlaku_uji, jenis_kend, konfigurasi_sumbu, 
                berat_kosong, jbb, jbkb, jbi, jbki, panjang_utama, lebar_utama, tinggi_utama, 
                julur_depan, julur_belakang, foto_depan, foto_kanan, foto_kiri, nomor_rangka, 
                merek, bahan_bakar, daya_angkut_orang, daya_angkut_barang, kelas, created_at, 
                created_by, is_masa_berlaku, is_active, foto_belakang, foto_depan_url, 
                foto_belakang_url, foto_kanan_url, foto_kiri_url, jenis_kendaraan_id, sumbu_id, 
                blue_id, no_srut, tgl_srut, no_mesin, tipe, tahun_rakit, isi_silinder, 
                daya_motor, ukuran_ban, keterangan_hasil_uji, petugas_penguji, nrp_petugas_penguji, 
                kepala_dinas, pangkat_kepala_dinas, nip_kepala_dinas, unit_pelaksana_teknis, 
                direktur, pangkat_direktur, nip_direktur, etl_date, jarak_sumbu_1_2, 
                jarak_sumbu_2_3, jarak_sumbu_3_4, dimensi_bak_tangki, mst, kepemilikan_id, 
                kepemilikan_val, updated_at, updated_by
            ) VALUES (
                ${upCheckString(rfid)}, ${upCheckString(vcode)}, ${upCheckString(no_reg_kend)}, 
                ${upCheckString(no_uji)}, ${upCheckString(nama_pemilik)}, ${upCheckString(alamat_pemilik)}, 
                ${upCheckString(lokasi_uji)}, ${upCheckString(tanggal_uji)}, ${upCheckString(masa_berlaku_uji)}, 
                ${upCheckString(jenis_kend.toUpperCase())}, ${upCheckString(konfigurasi_sumbu)}, 
                ${upCheckNumber(berat_kosong)}, ${upCheckNumber(jbb)}, ${upCheckNumber(jbkb)}, 
                ${upCheckNumber(jbi)}, ${upCheckNumber(jbki)}, ${upCheckNumber(panjang_utama)}, 
                ${upCheckNumber(lebar_utama)}, ${upCheckNumber(tinggi_utama)}, ${upCheckNumber(julur_depan)}, 
                ${upCheckNumber(julur_belakang)}, ${upCheckString(foto_depan)}, ${upCheckString(foto_kanan)}, 
                ${upCheckString(foto_kiri)}, ${upCheckString(nomor_rangka)}, ${upCheckString(merek)}, 
                ${upCheckString(bahan_bakar)}, ${upCheckNumber(daya_angkut_orang)}, ${upCheckNumber(daya_angkut_barang)}, 
                ${upCheckString(kelas)}, ${upCheckString(created_at)}, ${upCheckNumber(created_by)}, 
                ${is_masa_berlaku}, ${is_active}, ${upCheckString(foto_belakang)}, ${upCheckString(foto_depan_url)}, 
                ${upCheckString(foto_belakang_url)}, ${upCheckString(foto_kanan_url)}, ${upCheckString(foto_kiri_url)}, 
                ${upCheckNumber(jenis_kendaraan_id)}, ${upCheckNumber(sumbu_id)}, ${upCheckNumber(blue_id)}, 
                ${upCheckString(no_srut)}, ${upCheckDate(tgl_srut)}, ${upCheckString(no_mesin)}, 
                ${upCheckString(tipe)}, ${upCheckString(tahun_rakit)}, ${upCheckString(isi_silinder)}, 
                ${upCheckString(daya_motor)}, ${upCheckString(ukuran_ban)}, ${upCheckString(keterangan_hasil_uji)}, 
                ${upCheckString(petugas_penguji)}, ${upCheckString(nrp_petugas_penguji)}, ${upCheckString(kepala_dinas)}, 
                ${upCheckString(pangkat_kepala_dinas)}, ${upCheckString(nip_kepala_dinas)}, ${upCheckString(unit_pelaksana_teknis)}, 
                ${upCheckString(direktur)}, ${upCheckString(pangkat_direktur)}, ${upCheckString(nip_direktur)}, 
                ${upCheckDate(etl_date)}, ${upCheckNumber(jarak_sumbu_1_2)}, ${upCheckNumber(jarak_sumbu_2_3)}, 
                ${upCheckNumber(jarak_sumbu_3_4)}, ${upCheckString(dimensi_bak_tangki)}, ${upCheckNumber(mst)}, 
                ${upCheckNumber(kepemilikan_id)}, ${upCheckString(kepemilikan_val)}, ${upCheckString(updated_at)}, 
                ${upCheckNumber(updated_by)}
            )
            ON CONFLICT (no_reg_kend) 
            WHERE is_deleted = false
            DO UPDATE SET 
                rfid = EXCLUDED.rfid,
                vcode = EXCLUDED.vcode,
                no_uji = EXCLUDED.no_uji,
                nama_pemilik = EXCLUDED.nama_pemilik,
                alamat_pemilik = EXCLUDED.alamat_pemilik,
                lokasi_uji = EXCLUDED.lokasi_uji,
                tanggal_uji = EXCLUDED.tanggal_uji,
                masa_berlaku_uji = EXCLUDED.masa_berlaku_uji,
                jenis_kend = EXCLUDED.jenis_kend,
                konfigurasi_sumbu = EXCLUDED.konfigurasi_sumbu,
                berat_kosong = EXCLUDED.berat_kosong,
                jbb = EXCLUDED.jbb,
                jbkb = EXCLUDED.jbkb,
                jbi = EXCLUDED.jbi,
                jbki = EXCLUDED.jbki,
                panjang_utama = EXCLUDED.panjang_utama,
                lebar_utama = EXCLUDED.lebar_utama,
                tinggi_utama = EXCLUDED.tinggi_utama,
                julur_depan = EXCLUDED.julur_depan,
                julur_belakang = EXCLUDED.julur_belakang,
                foto_depan = EXCLUDED.foto_depan,
                foto_kanan = EXCLUDED.foto_kanan,
                foto_kiri = EXCLUDED.foto_kiri,
                nomor_rangka = EXCLUDED.nomor_rangka,
                merek = EXCLUDED.merek,
                bahan_bakar = EXCLUDED.bahan_bakar,
                daya_angkut_orang = EXCLUDED.daya_angkut_orang,
                daya_angkut_barang = EXCLUDED.daya_angkut_barang,
                kelas = EXCLUDED.kelas,
                updated_at = EXCLUDED.updated_at,
                is_masa_berlaku = EXCLUDED.is_masa_berlaku,
                is_active = EXCLUDED.is_active,
                foto_belakang = EXCLUDED.foto_belakang,
                foto_depan_url = EXCLUDED.foto_depan_url,
                foto_belakang_url = EXCLUDED.foto_belakang_url,
                foto_kanan_url = EXCLUDED.foto_kanan_url,
                foto_kiri_url = EXCLUDED.foto_kiri_url,
                updated_by = EXCLUDED.updated_by,
                jenis_kendaraan_id = EXCLUDED.jenis_kendaraan_id,
                sumbu_id = EXCLUDED.sumbu_id,
                blue_id = EXCLUDED.blue_id,
                no_srut = EXCLUDED.no_srut,
                tgl_srut = EXCLUDED.tgl_srut,
                no_mesin = EXCLUDED.no_mesin,
                tipe = EXCLUDED.tipe,
                tahun_rakit = EXCLUDED.tahun_rakit,
                isi_silinder = EXCLUDED.isi_silinder,
                daya_motor = EXCLUDED.daya_motor,
                ukuran_ban = EXCLUDED.ukuran_ban,
                keterangan_hasil_uji = EXCLUDED.keterangan_hasil_uji,
                petugas_penguji = EXCLUDED.petugas_penguji,
                nrp_petugas_penguji = EXCLUDED.nrp_petugas_penguji,
                kepala_dinas = EXCLUDED.kepala_dinas,
                pangkat_kepala_dinas = EXCLUDED.pangkat_kepala_dinas,
                nip_kepala_dinas = EXCLUDED.nip_kepala_dinas,
                unit_pelaksana_teknis = EXCLUDED.unit_pelaksana_teknis,
                direktur = EXCLUDED.direktur,
                pangkat_direktur = EXCLUDED.pangkat_direktur,
                nip_direktur = EXCLUDED.nip_direktur,
                etl_date = EXCLUDED.etl_date,
                jarak_sumbu_1_2 = EXCLUDED.jarak_sumbu_1_2,
                jarak_sumbu_2_3 = EXCLUDED.jarak_sumbu_2_3,
                jarak_sumbu_3_4 = EXCLUDED.jarak_sumbu_3_4,
                dimensi_bak_tangki = EXCLUDED.dimensi_bak_tangki,
                mst = EXCLUDED.mst,
                kepemilikan_id = EXCLUDED.kepemilikan_id,
                kepemilikan_val = EXCLUDED.kepemilikan_val
            RETURNING *;
        `;

        const result = await sequelize.query(sql, {
            logging: false,
            transaction: t,
        });

        await t.commit();
        
        // Cek apakah operasi berhasil (INSERT atau UPDATE)
        if (result && result[0] && result[0].length > 0) {
            const operation = result[0][0].created_at === result[0][0].updated_at ? 'INSERT' : 'UPDATE';
            console.log(`UPSERT ${operation} BERHASIL untuk: ${no_reg_kend}`);
            // console.log('RESULT: ', result[0]);
            return result[0];
        } else {
            console.log(`UPSERT GAGAL untuk: ${no_reg_kend}`);
            return [];
        }
    } catch (error) {
        console.log("Error upsert_kendaraan:", error);
        await t.rollback();
        throw error;
    }
};

// const upsert = async (
//     rfid,
//     vcode,
//     no_reg_kend,
//     no_uji,
//     nama_pemilik,
//     alamat_pemilik,
//     lokasi_uji,
//     tanggal_uji,
//     masa_berlaku_uji,
//     jenis_kend,
//     konfigurasi_sumbu,
//     berat_kosong,
//     jbb,
//     jbkb,
//     jbi,
//     jbki,
//     panjang_utama,
//     lebar_utama,
//     tinggi_utama,
//     julur_depan,
//     julur_belakang,
//     foto_depan,
//     foto_kanan,
//     foto_kiri,
//     nomor_rangka,
//     merek,
//     bahan_bakar,
//     daya_angkut_orang,
//     daya_angkut_barang,
//     kelas,
//     created_at,
//     updated_at,
//     created_by,
//     is_masa_berlaku,
//     is_active,
//     foto_belakang,
//     foto_depan_url,
//     foto_belakang_url,
//     foto_kanan_url,
//     foto_kiri_url,
//     updated_by,
//     jenis_kendaraan_id,
//     sumbu_id,
//     blue_id,
//     no_srut,
//     tgl_srut,
//     no_mesin,
//     tipe,
//     tahun_rakit,
//     isi_silinder,
//     daya_motor,
//     ukuran_ban,
//     keterangan_hasil_uji,
//     petugas_penguji,
//     nrp_petugas_penguji,
//     kepala_dinas,
//     pangkat_kepala_dinas,
//     nip_kepala_dinas,
//     unit_pelaksana_teknis,
//     direktur,
//     pangkat_direktur,
//     nip_direktur,
//     etl_date,
//     jarak_sumbu_1_2,
//     jarak_sumbu_2_3,
//     jarak_sumbu_3_4,
//     dimensi_bak_tangki,
//     mst,
//     kepemilikan_id,
//     kepemilikan_val
// ) => {
//     var sql = `SELECT * FROM jt_kendaraan WHERE LOWER(no_reg_kend) = LOWER('${no_reg_kend}') AND is_deleted = false`;
//     const result = await sequelize.query(sql, {
//         type: QueryTypes.SELECT,
//         logging: false,
//     });

//     console.log("NO KENDARAAN REG KEND UPSERT : ", no_reg_kend);
//     if (Object.keys(result).length > 0) {
//         var foto_depan_exist = foto_depan; // (result[0].foto_depan == foto_depan) ? result[0].foto_depan : foto_depan;
//         var foto_belakang_exist = foto_belakang; // (result[0].foto_belakang == foto_belakang) ? result[0].foto_belakang : foto_belakang;
//         var foto_kiri_exist = foto_kiri; // (result[0].foto_kiri == foto_kiri) ? result[0].foto_kiri : foto_kiri;
//         var foto_kanan_exist = foto_kanan; // (result[0].foto_kanan == foto_kanan) ? result[0].foto_kanan : foto_kanan;
//         var foto_depan_url_exist = foto_depan_url; // (result[0].foto_depan_url == foto_depan_url) ? result[0].foto_depan_url : foto_depan_url;
//         var foto_belakang_url_exist = foto_belakang_url; // (result[0].foto_belakang_url == foto_belakang_url) ? result[0].foto_belakang_url : foto_belakang_url;
//         var foto_kiri_url_exist = foto_kiri_url; // (result[0].foto_kiri_url == foto_kiri_url) ? result[0].foto_kiri_url : foto_kiri_url;
//         var foto_kanan_url_exist = foto_kanan_url; // (result[0].foto_kanan_url == foto_kanan_url) ? result[0].foto_kanan_url : foto_kanan_url;
//         // var id_jenis_kendaraan = await getJenisKendaraanId(jenis_kend.toUpperCase());
//         var update = await update_kendaraan(
//             rfid,
//             vcode,
//             no_reg_kend,
//             no_uji,
//             nama_pemilik,
//             alamat_pemilik,
//             lokasi_uji,
//             tanggal_uji,
//             masa_berlaku_uji,
//             jenis_kend.toUpperCase(),
//             konfigurasi_sumbu,
//             berat_kosong,
//             jbb,
//             jbkb,
//             jbi,
//             jbki,
//             panjang_utama,
//             lebar_utama,
//             tinggi_utama,
//             julur_depan,
//             julur_belakang,
//             foto_depan_exist,
//             foto_kanan_exist,
//             foto_kiri_exist,
//             nomor_rangka,
//             merek,
//             bahan_bakar,
//             daya_angkut_orang,
//             daya_angkut_barang,
//             kelas,
//             is_masa_berlaku,
//             is_active,
//             updated_at,
//             updated_by,
//             foto_belakang_exist,
//             foto_depan_url_exist,
//             foto_belakang_url_exist,
//             foto_kanan_url_exist,
//             foto_kiri_url_exist,
//             jenis_kendaraan_id,
//             sumbu_id,
//             blue_id,
//             no_srut,
//             tgl_srut,
//             no_mesin,
//             tipe,
//             tahun_rakit,
//             isi_silinder,
//             daya_motor,
//             ukuran_ban,
//             keterangan_hasil_uji,
//             petugas_penguji,
//             nrp_petugas_penguji,
//             kepala_dinas,
//             pangkat_kepala_dinas,
//             nip_kepala_dinas,
//             unit_pelaksana_teknis,
//             direktur,
//             pangkat_direktur,
//             nip_direktur,
//             etl_date,
//             jarak_sumbu_1_2,
//             jarak_sumbu_2_3,
//             jarak_sumbu_3_4,
//             dimensi_bak_tangki,
//             mst,
//             kepemilikan_id,
//             kepemilikan_val
//         );
//         console.log("update", update);
//         return update;
//     } else {
//         var insert = await insert_kendaraan(
//             rfid,
//             vcode,
//             no_reg_kend,
//             no_uji,
//             nama_pemilik,
//             alamat_pemilik,
//             lokasi_uji,
//             tanggal_uji,
//             masa_berlaku_uji,
//             jenis_kend.toUpperCase(),
//             konfigurasi_sumbu,
//             berat_kosong,
//             jbb,
//             jbkb,
//             jbi,
//             jbki,
//             panjang_utama,
//             lebar_utama,
//             tinggi_utama,
//             julur_depan,
//             julur_belakang,
//             foto_depan,
//             foto_kanan,
//             foto_kiri,
//             nomor_rangka,
//             merek,
//             bahan_bakar,
//             daya_angkut_orang,
//             daya_angkut_barang,
//             kelas,
//             created_at,
//             created_by,
//             is_masa_berlaku,
//             is_active,
//             foto_belakang,
//             foto_depan_url,
//             foto_belakang_url,
//             foto_kanan_url,
//             foto_kiri_url,
//             jenis_kendaraan_id,
//             sumbu_id,
//             blue_id,
//             no_srut,
//             tgl_srut,
//             no_mesin,
//             tipe,
//             tahun_rakit,
//             isi_silinder,
//             daya_motor,
//             ukuran_ban,
//             keterangan_hasil_uji,
//             petugas_penguji,
//             nrp_petugas_penguji,
//             kepala_dinas,
//             pangkat_kepala_dinas,
//             nip_kepala_dinas,
//             unit_pelaksana_teknis,
//             direktur,
//             pangkat_direktur,
//             nip_direktur,
//             etl_date,
//             jarak_sumbu_1_2,
//             jarak_sumbu_2_3,
//             jarak_sumbu_3_4,
//             dimensi_bak_tangki,
//             mst,
//             kepemilikan_id,
//             kepemilikan_val
//         );
//         console.log("insert", insert);
//         return insert;
//     }
// };

module.exports = {
    upsert,
    qrcodescan,
    ujiberkala,
    ujiberkalarfid,
    checkjtoserverkend,
    checkjtoserverkendrfid,
    checkjtoserver,
};