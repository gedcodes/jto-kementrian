const {
    t_penimbangan,
    t_detailmuatan,
    t_detaildokumen,
    t_dokumen,
    t_pelanggaran,
    t_bptd,
    t_regu,
    t_shift,
    t_petugas,
    t_lokasi,
    t_timbangan,
    t_kota_kab,
    t_jenis_pelanggaran,
    t_komoditi,
    t_kategori_kepemilikan,
    t_kategori_komoditi,
    t_kendaraan,
    t_log_wim,
    sequelize } = require('../models');
const {
    upsert_komoditi,
    upsert_pelanggaran,
    moveRowDocumentTemp,
    getKodeKota,
    checkMasaBerlaku,
    uploadImage,
    getIsNoKendaraan,
    getIsNoKendaraanStatus,
    getIsExistsKodeTrxKendaraan,
    upsert_kendaraan, ltrim, rtrim } = require('./lib/penimbangan');
const {
    genCodeTrxPenimbangan,
    getToleransiUppkbKomoditi,
    getExistKodeTrxById,
    getToleransiDimensi,
    getDokumen,
    getProsenKategoriKomoditi,
    getProsenToleransiUppkbKomoditi,
    getValKomoditi,
    getJenisKendaraanId,
    getSumbuId,
    getLokasiUppkbId,
    getLokasiUppkbNama,
    getBptdId,
    getKepemilikanVal,
    getLokasiUppkbKode,
    getNamaBptd
} = require('./lib/dataid');

const {
    loginUser,
    syncToPostServer,
    updateStatusSyncToPusat
} = require('./lib/sinkronisasi');

const { syncToPostPanBali } = require('./lib/integrasipanbali');

const { downloadImageToUrl } = require('./lib/cctvcapture');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
var tcp = require('../tcpclient');
const uploadFile = require('../middleware/upload');
const config = require('../../config/config');
const { padLeft, kelebihanBerat, prosenKelebihanBerat } = require('../lib/utilities');
const { reportTemplate } = require('../controllers/lib/report_template');
const fs = require('fs');
const moment = require('moment');
const path = require("path");
var url = require('url');
const axios = require('axios');
const AxiosDigestAuth = require('@mhoc/axios-digest-auth').default;

let ejs = require("ejs");
const { generatePdfFile } = require('../middleware/pdfGenerator');

const excel = require('exceljs');

const PenimbanganWimController = () => {

    const timer = ms => new Promise(res => setTimeout(res, ms))

    const countAll = async () => {
        return t_log_wim.count();
    }

    const useToleransiKomoditi = async (req, res, next) => {
        var komoditi = req.body.komoditi;
        var kode_uppkb = req.body.kode_uppkb;
        var arrkomoditi = komoditi ? komoditi.split(',') : '';

        let useToleransiKatKomoditi = 0;
        let useToleransiUppkbKomoditi = 0;
        let useKomoditi;
        let useKategoriKomoditi;
        if (arrkomoditi.length > 0) {
            var arrKatKom = [];
            var arrUppkbKom = [];
            for (var i = 0; i < arrkomoditi.length; i++) {
                var komoditi_kategori = await getProsenKategoriKomoditi(arrkomoditi[i]);
                var toleransi_komoditi_uppkb = await getProsenToleransiUppkbKomoditi(kode_uppkb, arrkomoditi[i]);
                arrKatKom.push(komoditi_kategori.prosen_toleransi);
                arrUppkbKom.push(toleransi_komoditi_uppkb.prosen_toleransi);

                if (toleransi_komoditi_uppkb.komoditi_id) {
                    useKomoditi = toleransi_komoditi_uppkb.komoditi_id;
                }

                if (toleransi_komoditi_uppkb.kategori_komoditi_id) {
                    useKategoriKomoditi = toleransi_komoditi_uppkb.kategori_komoditi_id;
                }

            }
            //console.log(arr);
            var largestKatKom = arrKatKom[0];
            for (i = 0; i <= largestKatKom; i++) {
                if (arrKatKom[i] > largestKatKom) {
                    largestKatKom = arrKatKom[i];
                }
            }
            useToleransiKatKomoditi = largestKatKom;

            var largestUppkbKom = arrUppkbKom[0];
            for (i = 0; i <= largestUppkbKom; i++) {
                if (arrUppkbKom[i] > largestUppkbKom) {
                    largestUppkbKom = arrUppkbKom[i];
                }
            }
            useToleransiUppkbKomoditi = largestUppkbKom;
        }

        var arrUseTol = [useToleransiKatKomoditi, useToleransiUppkbKomoditi];
        var largestUseTol = arrUseTol[0];
        for (i = 0; i <= largestUseTol; i++) {
            if (arrUseTol[i] > largestUseTol) {
                largestUseTol = arrUseTol[i];
            }
        }
        // var data = `${largestUseTol},${useToleransiUppkbKomoditi},${useToleransiKatKomoditi}`;

        res.send({
            success: true,
            message: 'ok',
            data: [
                {
                    'useKomoditi': useKomoditi,
                    'useKategoriKomoditi': useKategoriKomoditi,
                    'toleransiDigunakan': largestUseTol,
                    'toleransiUppkbKomoditi': useToleransiUppkbKomoditi,
                    'toleransiKategoriKomoditi': useToleransiKatKomoditi
                }
            ]
        })
    }

    const useToleransiTrx = async (komoditi, kode_uppkb) => {
        var arrkomoditi = komoditi ? komoditi.split(',') : '';

        let useToleransiKatKomoditi = 0;
        let useToleransiUppkbKomoditi = 0;
        let useKomoditi = 0;
        let useKategoriKomoditi = 0;
        if (arrkomoditi.length > 0) {
            var arrKatKom = [];
            var arrUppkbKom = [];
            for (var i = 0; i < arrkomoditi.length; i++) {
                var komoditi_kategori = await getProsenKategoriKomoditi(arrkomoditi[i]);
                var toleransi_komoditi_uppkb = await getProsenToleransiUppkbKomoditi(kode_uppkb, arrkomoditi[i]);
                // arrKatKom.push(komoditi_kategori);
                // arrUppkbKom.push(toleransi_komoditi_uppkb);

                if (komoditi_kategori.prosen_toleransi) {
                    arrKatKom.push(komoditi_kategori.prosen_toleransi);
                } else {
                    arrKatKom.push(komoditi_kategori);
                }
                // console.log('toleransi_komoditi_uppkb : ', toleransi_komoditi_uppkb);
                if (toleransi_komoditi_uppkb != undefined && toleransi_komoditi_uppkb != 5) {
                    arrUppkbKom.push(toleransi_komoditi_uppkb.prosen_toleransi);

                    if (toleransi_komoditi_uppkb.komoditi_id) {
                        useKomoditi = toleransi_komoditi_uppkb.komoditi_id;
                    }

                    if (toleransi_komoditi_uppkb.kategori_komoditi_id) {
                        useKategoriKomoditi = toleransi_komoditi_uppkb.kategori_komoditi_id;
                    }
                } else {
                    arrUppkbKom.push(toleransi_komoditi_uppkb);
                    var komoditi_used = await getValKomoditi(arrkomoditi[i]);
                    if (komoditi_used.length > 0) {
                        useKomoditi = komoditi_used.id;
                        useKategoriKomoditi = komoditi_used.kategori_komoditi_id;
                    }
                }

            }
            //console.log(arr);
            var largestKatKom = arrKatKom[0];
            for (i = 0; i <= largestKatKom; i++) {
                if (arrKatKom[i] > largestKatKom) {
                    largestKatKom = arrKatKom[i];
                }
            }
            useToleransiKatKomoditi = largestKatKom;

            // console.log('arrUppkbKom ', arrUppkbKom);
            var largestUppkbKom = arrUppkbKom[0];
            for (i = 0; i <= largestUppkbKom; i++) {
                if (arrUppkbKom[i] > largestUppkbKom) {
                    largestUppkbKom = arrUppkbKom[i];
                }
            }
            useToleransiUppkbKomoditi = largestUppkbKom;
        }

        var arrUseTol = [useToleransiKatKomoditi, useToleransiUppkbKomoditi];
        // console.log('arrUseTol ', arrUseTol);
        var largestUseTol = arrUseTol[0];
        for (i = 0; i <= largestUseTol; i++) {
            if (arrUseTol[i] > largestUseTol) {
                largestUseTol = arrUseTol[i];
            }
        }
        var data_arr = `${largestUseTol},${useToleransiUppkbKomoditi},${useToleransiKatKomoditi},${useKomoditi},${useKategoriKomoditi}`;
        // console.log(data_arr);
        return data_arr;
    }

    const useToleransi = async (komoditi, kode_uppkb) => {
        console.log(komoditi);
        var arrkomoditi = komoditi ? komoditi.split(',') : '';

        let useToleransiKatKomoditi = 0;
        let useToleransiUppkbKomoditi = 0;
        if (arrkomoditi.length > 0) {
            var arrKatKom = [];
            var arrUppkbKom = [];
            for (var i = 0; i < arrkomoditi.length; i++) {
                var komoditi_kategori = await getProsenKategoriKomoditi(arrkomoditi[i]);
                var toleransi_komoditi_uppkb = await getProsenToleransiUppkbKomoditi(kode_uppkb, arrkomoditi[i]);
                arrKatKom.push(komoditi_kategori.prosen_toleransi);
                arrUppkbKom.push(toleransi_komoditi_uppkb.prosen_toleransi_komoditi);
            }
            //console.log(arr);
            var largestKatKom = arrKatKom[0];
            for (i = 0; i <= largestKatKom; i++) {
                if (arrKatKom[i] > largestKatKom) {
                    largestKatKom = arrKatKom[i];
                }
            }
            useToleransiKatKomoditi = largestKatKom;

            var largestUppkbKom = arrUppkbKom[0];
            for (i = 0; i <= largestUppkbKom; i++) {
                if (arrUppkbKom[i] > largestUppkbKom) {
                    largestUppkbKom = arrUppkbKom[i];
                }
            }
            useToleransiUppkbKomoditi = largestUppkbKom;
        }

        var arrUseTol = [useToleransiKatKomoditi, useToleransiUppkbKomoditi];
        var largestUseTol = arrUseTol[0];
        for (i = 0; i <= largestUseTol; i++) {
            if (arrUseTol[i] > largestUseTol) {
                largestUseTol = arrUseTol[i];
            }
        }
        return largestUseTol || 5;
    }

    const findPelanggaran = async (req, res, next) => {
        console.log('----------------------------------------------FIND PELANGGARAN-------------------------------------------------');
        console.log('DATA KENDARAAN: ', req.body);
        console.log('NO KENDARAAN : ', req.body.no_kendaraan, req.body.timbangan_id, req.body.masa_berlaku);
        if (req.body.kode_uppkb) {
            var panjang_uji = req.body.panjang_uji;
            var lebar_uji = req.body.lebar_uji;
            var tinggi_uji = req.body.tinggi_uji;
            var foh_uji = req.body.foh_uji;
            var roh_uji = req.body.roh_uji;
            var panjang_ukur = req.body.panjang_ukur;
            var lebar_ukur = req.body.lebar_ukur;
            var tinggi_ukur = req.body.tinggi_ukur;
            var foh_ukur = req.body.foh_ukur;
            var roh_ukur = req.body.roh_ukur;
            var masa_berlaku = req.body.masa_berlaku;
            var checkformatdate = moment(masa_berlaku, 'DD-MM-YYYY', true).isValid();

            // var onMasaBerlakuDate = checkformatdate ? moment(masa_berlaku).format('YYYY-MM-DD') : moment(masa_berlaku, 'DD-MM-YYYY').format('YYYY-MM-DD');
            var onMasaBerlakuDate = moment(masa_berlaku, 'YYYY-MM-DD', true).isValid() ? moment(masa_berlaku).format('YYYY-MM-DD') : moment(masa_berlaku, 'DD-MM-YYYY').format('YYYY-MM-DD');

            console.log('FORMAT MASA BERLAKU DATE : ', moment(masa_berlaku, 'YYYY-MM-DD', true).isValid(), onMasaBerlakuDate);

            var status_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate); // moment(masa_berlaku, 'YYYY-MM-DD', true).isValid() ? await checkMasaBerlaku(onMasaBerlakuDate) : false;
            console.log('STATUS MASA BERLAKU : ', status_masa_berlaku);
            // var dokumen = req.body.dokumen;
            var kelebihan_berat = await kelebihanBerat(req.body.berat_timbang, req.body.jbi_uji);
            var prosen_kelebihan_berat = await prosenKelebihanBerat(req.body.berat_timbang, req.body.jbi_uji);
            var komoditi = req.body.komoditi;
            var prosenToleransi = await useToleransi(komoditi, req.body.kode_uppkb);

            var dokumen = req.body.dokumen;
            if (status_masa_berlaku && dokumen.split(',')[0] != '12') {
                dokumen = '12,13,14,15';
            }
            var resDok = await getDokumen(dokumen);

            var pelanggaran_da = false;
            if (prosen_kelebihan_berat > prosenToleransi) {
                pelanggaran_da = true;
            }

            // var pelanggaran_dim = await getPelanggaranDimensi(panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur);

            var toleransiDimensi = await getToleransiDimensi(panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur);

            var pelanggaran_dim = false;
            if (toleransiDimensi.kelebihan_panjang > 0) {
                pelanggaran_dim = true;
            }

            if (toleransiDimensi.kelebihan_lebar > 0) {
                pelanggaran_dim = true;
            }

            if (toleransiDimensi.kelebihan_tinggi > 0) {
                pelanggaran_dim = true;
            }

            if (toleransiDimensi.kelebihan_foh > 0) {
                pelanggaran_dim = true;
            }

            if (toleransiDimensi.kelebihan_roh > 0) {
                pelanggaran_dim = true;
            }

            var str = '';

            if (pelanggaran_da) {
                str += '1,';
            }

            if (pelanggaran_dim) {
                str += '2,';
            }

            if (resDok.includes(0)) {
                str += '4,';
            }

            if (!status_masa_berlaku) {
                str += '4,';
            }

            var datastr = str.substring(',', str.length - 1);
            var result_arr = [];
            if (datastr.length > 0) {
                var result_jenis_pelanggaran = await t_jenis_pelanggaran.findAll({
                    where: {
                        id: {
                            [Op.in]: datastr.split(',')
                        },
                        is_active: true,
                        is_deleted: false
                    },
                    logging: false
                });
                for (var row of result_jenis_pelanggaran) {
                    console.log(row.id, ' | ', row.kode, ' | ', row.nama);
                    result_arr.push({
                        label: row.nama,
                        value: row.id
                    })
                }
            }

            const results = await t_dokumen.findAll({
                where: { is_active: true, is_deleted: false },
                order: [
                    ['id', 'ASC'],
                ],
                logging: false
            });

            var arrdokumen = dokumen ? dokumen.split(',') : [];
            if (arrdokumen.length > 0) {
                arrdokumen.sort((a, b) => {
                    return a - b;
                })
            }

            var obj = [];
            for (var i = 0; i < Object.keys(results).length; i++) {
                var status = true;
                // console.log(results[i].id, ' == ', Number(arrdokumen[i]));
                var found = arrdokumen.find(element => element == results[i].id);

                if (results[i].id == Number(found)) {

                    if (results[i].kode == 'BLUE' || results[i].id == 12) {
                        obj.push({
                            id: results[i].id,
                            kode: results[i].kode,
                            nama: results[i].nama,
                            is_optional: results[i].is_optional,
                            status: status_masa_berlaku,
                        })
                    } else {
                        obj.push({
                            id: results[i].id,
                            kode: results[i].kode,
                            nama: results[i].nama,
                            is_optional: results[i].is_optional,
                            status: true,
                        })
                    }
                } else {
                    // console.log('dok id : ', row.id);
                    obj.push({
                        id: results[i].id,
                        kode: results[i].kode,
                        nama: results[i].nama,
                        is_optional: results[i].is_optional,
                        status: false,
                    })
                }

            }
            // var informasiKendaraan = {
            //     no_reg_kend: req.body.no_reg_kend,
            //     no_uji: req.body.no_uji,
            //     nama_pemilik: req.body.nama_pemilik,
            //     alamat_pemilik: req.body.alamat_pemilik,
            //     masa_berlaku_uji: req.body.masa_berlaku_uji,
            //     jenis_kend: req.body.jenis_kend,
            //     konfigurasi_sumbu: req.body.
            // }
            // console.log(resDok.includes(0));
            const data = [{
                kode_uppkb: req.body.kode_uppkb,
                timbangan_id: req.body.timbangan_id,
                no_kendaraan: req.body.no_kendaraan ? req.body.no_kendaraan : '-',
                no_uji: req.body.no_uji,
                nama_pemilik: req.body.nama_pemilik,
                alamat_pemilik: req.body.alamat_pemilik,
                jenis_kendaraan_id: req.body.jenis_kendaraan_id,
                jenis_kend: req.body.jenis_kend ? req.body.jenis_kend.toUpperCase() : '',
                sumbu_id: req.body.sumbu_id,
                konfigurasi_sumbu: req.body.konfigurasi_sumbu,
                kepemilikan_id: req.body.kepemilikan_id,
                kepemilikan_val: req.body.kepemilikan_val,
                jbi_uji: req.body.jbi_uji ? req.body.jbi_uji : 0,
                berat_timbang: req.body.berat_timbang,
                kelebihan_berat: kelebihan_berat,
                prosen_kelebihan_berat: Math.ceil(prosen_kelebihan_berat, 2),
                prosen_toleransi_komoditi: prosenToleransi,
                masa_berlaku: masa_berlaku,
                dokumen: dokumen,
                panjang_uji: Number(req.body.panjang_uji || 0),
                lebar_uji: Number(req.body.lebar_uji || 0),
                tinggi_uji: Number(req.body.tinggi_uji || 0),
                foh_uji: Number(req.body.foh_uji || 0),
                roh_uji: Number(req.body.roh_uji || 0),
                panjang_ukur: Number(req.body.panjang_ukur || 0),
                lebar_ukur: Number(req.body.lebar_ukur || 0),
                tinggi_ukur: Number(req.body.tinggi_ukur || 0),
                foh_ukur: Number(req.body.foh_ukur || 0),
                roh_ukur: Number(req.body.roh_ukur || 0),
                dimensi: toleransiDimensi,
                dokumen_kelengkapan: obj,
                status_masa_berlaku: status_masa_berlaku,
                pelanggaran_daya_angkut: pelanggaran_da,
                pelanggaran_dokumen: resDok.includes(0),
                pelanggaran_dimensi: pelanggaran_dim,
                pelanggaran: result_arr,
                deskTilang: result_arr.length > 0 ? 'TILANG' : '',
            }];

            res.send({
                success: true,
                message: 'Penghitungan Data Pelanggaran Berhasil',
                data: data
            });
        } else {
            res.send({
                success: false,
                message: 'Kode UPPKB Tidak Boleh Kosong',
                data: []
            })
        }
    }


    const createLogWim = async (req, res, next) => {
        console.log("--------------------::Processing Create Log WIM::--------------------");
        try {
            if (req.body.no_kendaraan != '') {

                let uploads = [];
                var dataFoto = {
                    foto_depan_name: '',
                    foto_depan_url: '',
                    foto_plat_no_name: '',
                    foto_plat_no_url: '',
                }

                if (process.env.IS_KEMENHUB == 0) {
                    if (req.files) {
                        var uploadFotoDepan = await uploadImage(req.body.no_kendaraan, 'wim', req.files.fotoDepan);
                        var uploadFotoPlatNo = await uploadImage(req.body.no_kendaraan, 'wim', req.files.fotoPlateNo);

                        dataFoto = {
                            foto_depan_name: uploadFotoDepan.imgName || '',
                            foto_depan_url: uploadFotoDepan.imgUrl || '',
                            foto_plat_no_name: uploadFotoPlatNo.imgName || '',
                            foto_plat_no_url: uploadFotoPlatNo.imgUrl || '',
                        }
                    }

                    Promise.all(uploads).then(async () => {
                        console.log('INSERT WITH IMAGE');
                        const field = {
                            kode_uppkb: req.body.kode_uppkb,
                            no_kendaraan: req.body.no_kendaraan.toUpperCase(),
                            tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                            is_transaksi: req.body.is_transaksi,
                            device_id: req.body.device_id,
                            sumbu: req.body.sumbu || '',
                            wim_kode: req.body.wim_kode,
                            wim_berat: Number(req.body.wim_berat) || 0,
                            wim_panjang: Number(req.body.wim_panjang) || 0,
                            wim_lebar: Number(req.body.wim_lebar) || 0,
                            wim_tinggi: Number(req.body.wim_tinggi) || 0,
                            wim_foh: Number(req.body.wim_foh) || 0,
                            wim_roh: Number(req.body.wim_roh) || 0,
                            wim_kecepatan: Number(req.body.wim_kec) || 0,
                            ...dataFoto,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            is_status: 1,
                        }
                        // console.log(field)
                        return sequelize.transaction().then(function (t) {
                            return t_log_wim.create(field, { transaction: t, logging: false }).then(async (data) => {
                                try {
                                    t.commit();

                                    res.send({
                                        success: true,
                                        message: messageService().CREATE_SUCCESS,
                                        data: [{
                                            last_insert_id: data.id,
                                            fields: field
                                        }]
                                    });
                                } catch (error) {
                                    console.log(error)
                                    t.rollback().catch(() => { });
                                    res.send({
                                        success: false,
                                        message: messageService().CREATE_FAILED
                                    });
                                }
                            }).catch(function (err) {
                                console.log(err)
                                t.rollback().catch(() => { });
                                next(err)
                            });
                        });
                    }).catch((err) => {
                        console.log(err)
                        res.status(500).send({
                            success: false,
                            message: err
                        });
                    });
                }

            } else {
                res.status(500).send({
                    success: false,
                    message: 'No Kendaraan Wajib Di Isi'
                });
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    const createSyncWimData = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        try {

            if (req.body.no_kendaraan != '') {
                var is_no_kendaraan = await getIsNoKendaraan(req.body.no_kendaraan, moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
                console.log('IS NO KENDARAAN : ', is_no_kendaraan);
                if (is_no_kendaraan) {
                    console.log('CREATED');
                    if (process.env.IS_INTEGRASI_WIM == 0) {
                        if (req.body.device_id == 3) {
                            return res.send({
                                success: false,
                                message: 'Input Data Kendaraan WIM Disable',
                            })
                        }
                    } else {

                        var kode_trx = req.body.kode_trx ? req.body.kode_trx : await genCodeTrxPenimbangan(req.body.kode_uppkb, moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), req.body.no_kendaraan);
                        var is_exists_no_trx = await getIsExistsKodeTrxKendaraan(kode_trx, req.body.no_kendaraan);

                        if (is_exists_no_trx) {
                            var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
                            var bptd_id = await getBptdId(req.body.kode_uppkb);

                            var is_use_jbi = Number(req.body.gandengan_jbki) > 0 ? Number(req.body.gandengan_jbki) : Number(req.body.jbi_uji);
                            var kelebihan_berat = await kelebihanBerat(Number(req.body.wim_berat), is_use_jbi);
                            var prosen_kelebihan_berat = await prosenKelebihanBerat(Number(req.body.wim_berat), is_use_jbi);
                            var komoditi = req.body.komoditi;
                            var arrkomoditi = komoditi ? komoditi.split(',') : '';

                            var dokumen = req.body.dokumen;
                            var arrdokumen = dokumen ? dokumen.split(',') : '';

                            var pelanggaran = req.body.pelanggaran;
                            // console.log('PELANGGARAN : ',pelanggaran);
                            var arrpelanggaran = pelanggaran ? pelanggaran.split(',') : '';
                            // console.log('PELANGGARAN : ', arrpelanggaran.length);
                            var is_melanggar = false; // await getIsMelanggarDokumen(arrdokumen.length);
                            if (arrpelanggaran.length > 0) {
                                is_melanggar = true;
                            }

                            var is_transfer = false;
                            if (prosen_kelebihan_berat > 20) {
                                is_transfer = true;
                            }

                            var komoditi_kategori = 0;
                            var toleransi_komoditi_uppkb = 0;
                            var isUseToleransiTrx = await useToleransiTrx(komoditi, req.body.kode_uppkb);
                            if (isUseToleransiTrx.length > 0) {
                                var useTolTrx = isUseToleransiTrx.split(',');
                                console.log('TOLERANSI TRX : ', useTolTrx);
                                komoditi_kategori = useTolTrx[2];//getKategoriKomoditi(arrkomoditi[0]);
                                toleransi_komoditi_uppkb = useTolTrx[1]; //await getToleransiUppkbKomoditi(req.body.kode_uppkb, arrkomoditi[0]);
                            } else {
                                komoditi_kategori = 5;
                                toleransi_komoditi_uppkb = 5;
                            }

                            // var apiKey = process.env.API_KEY_PAN_BALI;
                            // var platformName = process.env.PLATFORM_NAME_PAN_BALI;
                            // var payload = {
                            //     e_manifest_number: req.body.no_surat_jalan,
                            //     inspection_date: moment().format(),
                            //     load_commodity_name: arrkomoditi,
                            //     vehicle_plate_number: req.body.no_kendaraan.toUpperCase(),
                            //     weight_scale: Number(req.body.berat_timbang) || 0,
                            // };

                            let jenis_kendaraan_id = req.body.jenis_kendaraan ? await getJenisKendaraanId(req.body.jenis_kendaraan) : null;
                            let sumbu_id = req.body.sumbu ? await getSumbuId(req.body.sumbu) : null;

                            if (jenis_kendaraan_id == 0) {
                                res.send({
                                    success: false,
                                    message: 'Jenis Kendaraan Tidak Teridentifikasi',
                                });
                            } else if (sumbu_id == 0) {
                                res.send({
                                    success: false,
                                    message: 'Sumbu Tidak Teridentifikasi',
                                });
                            } else {
                                const field = {
                                    kode_trx: kode_trx || req.body.kode_trx,
                                    regu_id: req.body.regu_id ? req.body.regu_id : null,
                                    shift_id: req.body.shift_id ? req.body.shift_id : null,
                                    petugas_id: req.body.petugas_id ? req.body.petugas_id : null,
                                    bptd_id: bptd_id,
                                    lokasi_id: lokasi_id,
                                    kode_uppkb: req.body.kode_uppkb,
                                    timbangan_id: req.body.timbangan_id ? req.body.timbangan_id : null,
                                    tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), // || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                    tgl_antrian: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), // || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                    no_kendaraan: req.body.no_kendaraan.toUpperCase(),
                                    no_uji: req.body.no_uji.toUpperCase(),
                                    tgl_uji: moment(req.body.tgl_masa_berlaku).subtract(6, 'months').format('YYYY-MM-DD'),
                                    tgl_masa_berlaku: req.body.tgl_masa_berlaku, // moment(req.body.tgl_masa_berlaku).format('YYYY-MM-DD'),
                                    kategori_kepemilikan_id: req.body.kategori_kepemilikan_id ? req.body.kategori_kepemilikan_id : null,
                                    nama_pemilik: req.body.nama_pemilik,
                                    alamat_pemilik: req.body.alamat_pemilik,
                                    asal_kota_id: req.body.asal_kota_id ? req.body.asal_kota_id : null,
                                    tujuan_kota_id: req.body.tujuan_kota_id ? req.body.tujuan_kota_id : null,
                                    asal_kode_kota: req.body.asal_kota_id ? await getKodeKota(req.body.asal_kota_id) || req.body.asal_kode_kota : '',
                                    tujuan_kode_kota: req.body.tujuan_kota_id ? await getKodeKota(req.body.tujuan_kota_id) || req.body.tujuan_kode_kota : '',
                                    toleransi_komoditi: komoditi_kategori || 5,//komoditi_kategori.prosen_tolerasi,// || req.body.toleransi_komoditi,
                                    toleransi_uppkb: toleransi_komoditi_uppkb || 5, //(toleransi_komoditi_uppkb.prosen_toleransi) ? toleransi_komoditi_uppkb.prosen_toleransi:toleransi_komoditi_uppkb,//req.body.toleransi_uppkb_id,
                                    berat_timbang: Number(req.body.berat_timbang) || 0,
                                    jbi_uji: Number(req.body.jbi_uji) || 0,
                                    mst_uji: Number(req.body.mst_uji) || 0,
                                    kelebihan_berat: kelebihan_berat || 0,
                                    prosen_lebih: prosen_kelebihan_berat || 0,
                                    use_toleransi: useTolTrx[0] || 0,
                                    is_gandengan: req.body.is_gandengan ? req.body.is_gandengan : false,
                                    is_transaksi: req.body.is_transaksi,
                                    is_transfer: is_transfer,
                                    device_id: req.body.device_id,
                                    komoditi_id: req.body.komoditi || (useTolTrx[3] != 'undefined') ? useTolTrx[3] : null,
                                    kategori_komoditi_id: (useTolTrx[4] != 'undefined') ? useTolTrx[4] : null,
                                    nama_pengemudi: req.body.nama_pengemudi ? req.body.nama_pengemudi : '',
                                    alamat_pengemudi: req.body.alamat_pengemudi ? req.body.alamat_pengemudi : '',
                                    umur_pengemudi: req.body.umur_pengemudi ? req.body.umur_pengemudi : '',
                                    jenis_kendaraan_id: req.body.jenis_kendaraan_id || jenis_kendaraan_id,
                                    jenis_kendaraan: req.body.jenis_kendaraan,
                                    sumbu_id: req.body.sumbu_id || sumbu_id,
                                    sumbu: req.body.sumbu,
                                    gol_sim_id: req.body.gol_sim_id ? req.body.gol_sim_id : null,
                                    no_sim: req.body.no_sim ? req.body.no_sim : '',
                                    panjang_utama: req.body.panjang_utama ? Number(req.body.panjang_utama) : 0,
                                    panjang_toleransi: req.body.panjang_toleransi ? Number(req.body.panjang_toleransi) : 0,
                                    panjang_ukur: req.body.panjang_ukur ? Number(req.body.panjang_ukur) : 0,
                                    panjang_lebih: req.body.panjang_lebih ? Number(req.body.panjang_lebih) : 0,
                                    lebar_utama: req.body.lebar_utama ? Number(req.body.lebar_utama) : 0,
                                    lebar_toleransi: req.body.lebar_toleransi ? Number(req.body.lebar_toleransi) : 0,
                                    lebar_ukur: req.body.lebar_ukur ? Number(req.body.lebar_ukur) : 0,
                                    lebar_lebih: req.body.lebar_lebih ? Number(req.body.lebar_lebih) : 0,
                                    tinggi_utama: req.body.tinggi_utama ? Number(req.body.tinggi_utama) : 0,
                                    tinggi_toleransi: req.body.tinggi_toleransi ? Number(req.body.tinggi_toleransi) : 0,
                                    tinggi_ukur: req.body.tinggi_ukur ? Number(req.body.tinggi_ukur) : 0,
                                    tinggi_lebih: req.body.tinggi_lebih ? Number(req.body.tinggi_lebih) : 0,
                                    foh_utama: req.body.foh_utama ? Number(req.body.foh_utama) : 0,
                                    foh_toleransi: req.body.foh_toleransi ? Number(req.body.foh_toleransi) : 0,
                                    foh_ukur: req.body.foh_ukur ? Number(req.body.foh_ukur) : 0,
                                    foh_lebih: req.body.foh_lebih ? Number(req.body.foh_lebih) : 0,
                                    roh_utama: req.body.roh_utama ? Number(req.body.roh_utama) : 0,
                                    roh_toleransi: req.body.roh_toleransi ? Number(req.body.roh_toleransi) : 0,
                                    roh_ukur: req.body.roh_ukur ? Number(req.body.roh_ukur) : 0,
                                    roh_lebih: req.body.roh_lebih ? Number(req.body.roh_lebih) : 0,
                                    wim_berat: Number(req.body.wim_berat) || 0,
                                    wim_panjang: Number(req.body.wim_panjang) || 0,
                                    wim_lebar: Number(req.body.wim_lebar) || 0,
                                    wim_tinggi: Number(req.body.wim_tinggi) || 0,
                                    wim_foh: Number(req.body.wim_foh) || 0,
                                    wim_roh: Number(req.body.wim_roh) || 0,
                                    wim_kec: Number(req.body.wim_kec) || 0,
                                    pemilik_komoditi: req.body.pemilik_komoditi,
                                    alamat_pemilik_komoditi: req.body.alamat_pemilik_komoditi,
                                    no_surat_jalan: req.body.no_surat_jalan,
                                    is_melanggar: is_melanggar, // req.body.is_melanggar,
                                    gandengan_no_uji: req.body.gandengan_no_uji ? req.body.gandengan_no_uji : 0,
                                    gandengan_tgl_uji: (req.body.gandengan_tgl_uji) ? moment(req.body.gandengan_masa_berlaku).subtract(6, 'months').format('YYYY-MM-DD') : '',
                                    gandengan_masa_berlaku: (req.body.gandengan_masa_berlaku) ? moment(req.body.gandengan_masa_berlaku).format('YYYY-MM-DD HH:mm:ss') : '',
                                    gandengan_jbi_uji: req.body.gandengan_jbi_uji ? req.body.gandengan_jbi_uji : 0,
                                    gandengan_jbki: req.body.gandengan_jbki ? req.body.gandengan_jbki : 0,
                                    komoditi: req.body.komoditi ? req.body.komoditi : '',
                                    is_surat_tilang: req.body.is_surat_tilang ? req.body.is_surat_tilang : null,
                                    no_ba_tilang: req.body.no_ba_tilang ? req.body.no_ba_tilang : '',
                                    foto_depan: req.body.foto_depan ? req.body.foto_depan : '',
                                    foto_depan_url: req.body.foto_depan_url ? req.body.foto_depan_url : '',
                                    plate_no_img_name: req.body.plate_no_img_name ? req.body.plate_no_img_name : '',
                                    plate_no_img_url: req.body.plate_no_img_url ? req.body.plate_no_img_url : '',
                                    plate_no_confidance: req.body.plate_no_confidance,
                                    is_active: req.body.iact ? req.body.iact : false,
                                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                }
                                console.log('FIELD: ', field)
                                return sequelize.transaction().then(function (t) {
                                    return t_penimbangan.create(field, { transaction: t, logging: false }).then(async (data) => {
                                        try {
                                            t.commit();

                                            res.send({
                                                success: true,
                                                message: messageService().CREATE_SUCCESS,
                                                data: [{
                                                    last_insert_id: data.id,
                                                    fields: field
                                                }]
                                            });
                                        } catch (error) {
                                            console.log(error)
                                            t.rollback().catch(() => { });
                                            res.send({
                                                success: false,
                                                message: messageService().CREATE_FAILED
                                            });
                                        }
                                    }).catch(function (err) {
                                        console.log(err)
                                        t.rollback().catch(() => { });
                                        next(err)
                                    });

                                }).catch((err) => {
                                    console.log(err)
                                    res.status(500).send({
                                        success: false,
                                        message: err
                                    });
                                });

                            }
                        } else {
                            res.send({
                                success: false,
                                message: 'Nomor Transaksi Sudah Tersedia',
                            });
                        }

                    }
                } else {
                    res.send({
                        success: false,
                        message: 'Data Kendaraan Sudah Tersedia',
                    });
                }
            } else {
                res.send({
                    success: false,
                    message: 'No Kendaraan Kosong',
                });
            }

        } catch (error) {
            console.log(error)
            next(error)
        }

    }

    const testingsync = async (req, res, next) => {
        var data = { 'obj': 'test' };
        await loginUser(req.token.id);
    }

    const dataWim = async (req, res, next) => {
        console.log("--------------------::Processing Find All Log WIM::--------------------");
        try {
            const interval = req.query.interval;
            const tgl = req.query.tgl;
            const jam_awal = req.query.jam_awal;
            const jam_akhir = req.query.jam_akhir;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;
            let kode_uppkb;
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const ruas_id = req.query.ruas;

            const count = await countAll();

            if (lokasi_id) {
                kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            }

            let where_sql = `tgl_penimbangan BETWEEN '${moment(tgl_awal).format('YYYY-MM-DD')} 00:00:00' AND '${moment(tgl_akhir).format('YYYY-MM-DD')} 23:59:59'`;

            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_log_wim.tgl_penimbangan')),
                    { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                )
            ];

            if (interval == 'jam') {
                const waktuMulai = moment(`${tgl} ${jam_awal}:00`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                const waktuSelesai = moment(`${tgl} ${jam_akhir}:00`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                conditions = [
                    sequelize.where(
                        sequelize.col('t_log_wim.tgl_penimbangan'),
                        {
                            [Op.between]: [waktuMulai, waktuSelesai]
                        }
                    )
                ];
                where_sql = `tgl_penimbangan BETWEEN '${waktuMulai}' AND '${waktuSelesai}'`;
            }

            // let conditions = {};

            // if (tgl_awal && tgl_akhir) {
            //     conditions['tgl_penimbangan'] = {
            //         [Op.between]: [moment(tgl_awal).startOf('day').format(), moment(tgl_akhir).endOf('day').format()],
            //     };
            // }

            // let conditions = [
            //     sequelize.where(
            //         sequelize.fn('DATE', sequelize.col('t_log_wim.tgl_penimbangan')),
            //         'BETWEEN ? AND ?',
            //         [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]
            //     )
            // ];

            if (bptd_id) {
                const uppkbIds = await t_lokasi.findAll({
                    attributes: ['kode'],
                    where: {
                        bptd_id: bptd_id
                    }
                }).map(uppkb => uppkb.kode);

                conditions.push({
                    kode_uppkb: {
                        [Op.in]: uppkbIds
                    }
                });
            }

            if (kode_uppkb) {
                conditions.push({
                    kode_uppkb: kode_uppkb
                });
            }

            if (ruas_id) {
                conditions.push({
                    ruas_id: ruas_id
                });
            }

            // console.log(conditions);
            const options = {
                include: [
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'wim_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                ],
                page: Number(req.query.page) || 1,
                paginate: Number(req.query.paginate) || count,
                where: conditions,
                order: [
                    [
                        req.query.orderBy || 'tgl_penimbangan',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                logging: false
            }
            const { docs, pages, total } = await t_log_wim.paginate(options)
            let sqlTerdeteksiBlue = `
                SELECT
                    COUNT(*) AS total_data,
                    COUNT(CASE WHEN is_status = 2 THEN 1 END) AS jml_terdeteksi_blue,
                    ROUND(100.0 * COUNT(CASE WHEN is_status = 2 THEN 1 END) / NULLIF(COUNT(*), 0), 2) AS persen_terdeteksi_blue,
                    COUNT(CASE WHEN is_melanggar = true THEN 1 END) AS jml_melanggar,
                    ROUND(100.0 * COUNT(CASE WHEN is_melanggar = true THEN 1 END) / NULLIF(COUNT(*), 0), 2) AS persen_melanggar,
                    COUNT(CASE WHEN is_overload = true THEN 1 END) AS jml_overload,
                    ROUND(100.0 * COUNT(CASE WHEN is_overload = true THEN 1 END) / NULLIF(COUNT(*), 0), 2) AS persen_overload,
                    COUNT(CASE WHEN is_overdim = true THEN 1 END) AS jml_overdimensi,
                    ROUND(100.0 * COUNT(CASE WHEN is_overdim = true THEN 1 END) / NULLIF(COUNT(*), 0), 2) AS persen_overdimensi,
                    COUNT(CASE WHEN is_overload = true AND is_overdim = true THEN 1 END) AS jml_odol,
                    ROUND(100.0 * COUNT(CASE WHEN is_overload = true AND is_overdim = true THEN 1 END) / NULLIF(COUNT(*), 0), 2) AS persen_odol
                FROM jt_log_wim
                WHERE ${where_sql}`;

            // console.log(sqlTerdeteksiBlue);
            const jmlTerdeteksiBlue = await sequelize.query(sqlTerdeteksiBlue, {
                type: QueryTypes.SELECT,
                logging: false
            })
            let sqlMasukUppkb = `
                SELECT
                COUNT(*) AS total FROM jt_penimbangan
                WHERE ${where_sql} AND is_transaksi = 1 AND device_id = 3 AND is_active = true AND is_deleted = false
            `;
            const jmlMasukUppkb = await sequelize.query(sqlMasukUppkb, {
                type: QueryTypes.SELECT,
                logging: false
            })
            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                },
                widget: {
                    jml_wim_masuk_uppkb: Number(jmlMasukUppkb[0].total),
                    persen_wim_masuk_uppkb: Number(jmlTerdeteksiBlue[0].total_data) === 0 ? 0 : Math.round(Number(jmlMasukUppkb[0].total) / Number(jmlTerdeteksiBlue[0].total_data) * 10000) / 100,
                    jml_wim: Number(jmlTerdeteksiBlue[0].total_data),
                    jml_wim_terdeteksi_blue: Number(jmlTerdeteksiBlue[0].jml_terdeteksi_blue),
                    persen_wim_terdeteksi_blue: Number(jmlTerdeteksiBlue[0].persen_terdeteksi_blue),
                    jml_wim_melanggar: Number(jmlTerdeteksiBlue[0].jml_melanggar),
                    persen_wim_melanggar: Number(jmlTerdeteksiBlue[0].persen_melanggar),
                    jml_wim_overload: Number(jmlTerdeteksiBlue[0].jml_overload),
                    persen_wim_overload: Number(jmlTerdeteksiBlue[0].persen_overload),
                    jml_wim_overdim: Number(jmlTerdeteksiBlue[0].jml_overdimensi),
                    persen_wim_overdim: Number(jmlTerdeteksiBlue[0].persen_overdimensi),
                    jml_wim_odol: Number(jmlTerdeteksiBlue[0].jml_odol),
                    persen_wim_odol: Number(jmlTerdeteksiBlue[0].persen_odol),
                }
            });

        } catch (error) {
            next(error)
        }
    }

    const dataWimPusat = async (req, res, next) => {
        console.log("--------------------::Processing Find All Log WIM::--------------------");
        try {
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;
            let kode_uppkb;
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;

            if (lokasi_id) {
                kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            }

            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_log_wim.tgl_penimbangan')),
                    { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                )
            ];

            // let conditions = {};

            // if (tgl_awal && tgl_akhir) {
            //     conditions['tgl_penimbangan'] = {
            //         [Op.between]: [moment(tgl_awal).startOf('day').format(), moment(tgl_akhir).endOf('day').format()],
            //     };
            // }

            // let conditions = [
            //     sequelize.where(
            //         sequelize.fn('DATE', sequelize.col('t_log_wim.tgl_penimbangan')),
            //         'BETWEEN ? AND ?',
            //         [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]
            //     )
            // ];

            if (bptd_id) {
                const uppkbIds = await t_lokasi.findAll({
                    attributes: ['kode'],
                    where: {
                        bptd_id: bptd_id
                    }
                }).map(uppkb => uppkb.kode);

                conditions.push({
                    kode_uppkb: {
                        [Op.in]: uppkbIds
                    }
                });
            }

            if (kode_uppkb) {
                conditions.push({
                    kode_uppkb: kode_uppkb
                });
            }

            // console.log(conditions);
            const options = {
                include: [
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'wim_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                ],
                page: Number(req.query.page) || 1,
                paginate: Number(req.query.paginate) || 10,
                where: conditions,
                order: [
                    [
                        req.query.orderBy || 'tgl_penimbangan',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                logging: false
            }
            const { docs, pages, total } = await t_log_wim.paginate(options)
            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                },
            });

        } catch (error) {
            next(error)
        }
    }

    const dataWimById = async (req, res, next) => {
        console.log("--------------------::Processing Find All Log WIM::--------------------");
        try {
            const id = req.params.id;
           
            const options = {
                include: [
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'wim_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                ],
                page: req.query.page || 1,
                paginate: req.query.paginate || 50,
                where: {
                    id: id
                },
                order: [
                    [
                        req.query.orderBy || 'tgl_penimbangan',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                logging: true
            }
            const { docs, pages, total } = await t_log_wim.paginate(options)
            console.log(docs);
            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs,
            });

        } catch (error) {
            next(error)
        }
    }

    function ltrim(char, str) {
        if (str.slice(0, char.length) === char) {
            return ltrim(char, str.slice(char.length));
        } else {
            return str;
        }
    }

    function rtrim(char, str) {
        if (str.slice(str.length - char.length) === char) {
            return rtrim(char, str.slice(0, 0 - char.length));
        } else {
            return str;
        }
    }

    const getKodeUppkbActive = async () => {
        var sql = `SELECT * FROM jt_lokasi_uppkb WHERE is_active = true AND is_deleted = false`;
        // console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
        // console.log('JALUR ID : ', result);
        if (result.length > 0) {
            return result[0].kode;
        }

        return '';
    }

    const jalurId = async (kode_uppkb, nama) => {
        var sql = `SELECT * FROM jt_timbangan WHERE kode_uppkb = '${kode_uppkb}' AND TRIM(LOWER(nama)) = TRIM(LOWER('${nama}')) AND is_active = true AND is_deleted = false`;
        // console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
        // console.log('JALUR ID : ', result);
        if (result.length > 0) {
            return result[0].id;
        }

        return 0;
    }

    const automaticLane = async (req, res, next) => {
        console.log("--------------------::Processing Automatic Lane From Weight WIM::--------------------");

        try {
            var nokend = req.body.nokend;

            // if (process.env.WIM_VALIDATION_BERAT == 1 && process.env.WIM_VALIDATION_DIMENSI == 1) {
            //     var sql = `SELECT * FROM "jt_penimbangan" WHERE no_kendaraan = '${nokend}' AND is_melanggar = true AND is_transaksi = 2 AND device_id = 3 AND tgl_penimbangan::timestamp::date = NOW()::timestamp::date AND tgl_penimbangan <= NOW() - INTERVAL '5 minutes' ORDER BY tgl_penimbangan DESC;`;
            // } else {
            //     var sql = `SELECT * FROM "jt_penimbangan" WHERE no_kendaraan = '${nokend}' AND is_melanggar = true AND prosen_lebih > 5  AND is_transaksi = 2 AND device_id = 3 AND tgl_penimbangan::timestamp::date = NOW()::timestamp::date AND tgl_penimbangan <= NOW() - INTERVAL '5 minutes' ORDER BY tgl_penimbangan DESC;`;
            // }

            const kode_uppkb = await getKodeUppkbActive();

            if (kode_uppkb != '') {
                var sql = `SELECT * FROM "jt_penimbangan" WHERE no_kendaraan = '${nokend}' AND is_transaksi = 2 AND device_id = 3 AND tgl_penimbangan::timestamp::date = NOW()::timestamp::date AND tgl_penimbangan <= NOW() - INTERVAL '5 minutes' ORDER BY tgl_penimbangan DESC;`;
                // console.log(sql);
                const checkwim = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });

                var jalurTimbangan = await jalurId(kode_uppkb, 'JALUR PENIMBANGAN');
                var jalurPendataan = await jalurId(kode_uppkb, 'JALUR PENDATAAN');
                console.log('JALUR TIMBANGAN: ', jalurTimbangan, ' JALUR PENDATAAN: ', jalurPendataan);

                // console.log(checkwim);

                if (Object.keys(checkwim).length > 0) {
                    var is_melanggar = checkwim[0].is_melanggar;
                    var prosen_lebih = checkwim[0].prosen_lebih;
                    console.log('NO KENDARAAN: ', nokend, ' IS MELANGGAR: ', is_melanggar, ' PROSEN LEBIH: ', prosen_lebih);
                    if (process.env.WIM_VALIDATION_BERAT == 1 && process.env.WIM_VALIDATION_DIMENSI == 0) {
                        if (is_melanggar == true && prosen_lebih > 5) {
                            var opengate = await openCloseGate(kode_uppkb, jalurTimbangan, 1, 0);
                            await openCloseGate(kode_uppkb, jalurPendataan, 0, 0);
                            console.log('OPEN GATE PENIMBANGAN : ', opengate);
                            if (opengate) {
                                res.send({
                                    success: true,
                                    message: 'Palang Pintu Penimbangan Terbuka',
                                });
                            } else {
                                res.send({
                                    success: false,
                                    message: 'Buka Palang Pintu Penimbangan Gagal',
                                });
                            }
                        } else {
                            var opengate = await openCloseGate(kode_uppkb, jalurPendataan, 1, 0);
                            await openCloseGate(kode_uppkb, jalurTimbangan, 0, 0);
                            console.log('OPEN GATE PENDATAAN : ', opengate);
                            if (opengate) {
                                res.send({
                                    success: true,
                                    message: 'Palang Pintu Pendataan Terbuka',
                                });
                            } else {
                                res.send({
                                    success: false,
                                    message: 'Buka Palang Pintu Pendataan Gagal',
                                });
                            }
                        }
                    } else {
                        var opengate = await openCloseGate(kode_uppkb, jalurTimbangan, 1, 0);
                        await openCloseGate(kode_uppkb, jalurPendataan, 0, 0);
                        console.log('OPEN GATE PENIMBANGAN : ', opengate);
                        if (opengate) {
                            res.send({
                                success: true,
                                message: 'Palang Pintu Penimbangan Terbuka',
                            });
                        } else {
                            res.send({
                                success: false,
                                message: 'Buka Palang Pintu Penimbangan Gagal',
                            });
                        }
                    }
                } else {
                    console.log('Data Kosong');
                    // var opengate = await openCloseGate(kode_uppkb, jalurPendataan, 1, 0);
                    var opengate = await openCloseGate(kode_uppkb, jalurTimbangan, 1, 0);
                    await openCloseGate(kode_uppkb, jalurPendataan, 0, 0);
                    console.log('OPEN GATE PENIMBANGAN : ', opengate);
                    if (opengate) {
                        res.send({
                            success: true,
                            message: 'Palang Pintu Penimbangan Terbuka',
                        });
                    } else {
                        res.send({
                            success: false,
                            message: 'Buka Palang Pintu Penimbangan Gagal',
                        });
                    }
                }
            } else {
                res.send({
                    success: false,
                    message: 'Buka Palang Pintu Gagal. Kode UPPKB Tidak Tersedia. Cek Database',
                });
            }
        } catch (error) {
            next(error);
        }

    }

    const openCloseGate = async (kode_uppkb, timbangan_id, is_gate, gate) => {
        console.log('**********************************Gate Control******************************');
        return new Promise(async (resolve, reject) => {
            try {
                const data_timbangan = await t_timbangan.findOne({
                    where: {
                        kode_uppkb: kode_uppkb,
                        id: timbangan_id
                    },
                    logging: false
                });

                if (data_timbangan != null) {

                    if (gate == 0) {
                        console.log('Pintu Antrian');
                        var gate_name = 'Pintu Antrian';
                        var ip_address = data_timbangan.ip_pintu_antrian ? data_timbangan.ip_pintu_antrian : '';
                        var port = data_timbangan.port_pintu_antrian;
                        var addr = data_timbangan.addr_ibg_antrian;
                    }

                    if (gate == 1) {
                        console.log('Pintu Penimbangan');
                        var gate_name = 'Pintu Penimbangan';
                        var ip_address = data_timbangan.ip_pintu_penimbangan ? data_timbangan.ip_pintu_penimbangan : '';
                        var port = data_timbangan.port_pintu_penimbangan;
                        var addr = data_timbangan.addr_ibg_penimbangan;
                    }

                    if (ip_address != '') {
                        var msg = `*${addr},001,${is_gate}#`;
                        console.log(msg);
                        if (msg != '') {
                            const data = msg.toString();// Buffer.from(msg.split(' ').map(x => parseInt(x, 16))); // via ibg (interface barrier gate)
                            // const data = Buffer.from(msg.split(' ').map(x => parseInt(x, 16))); // via terminal server
                            // console.log(Buffer.from(data).toString('hex'));
                            if (!!ip_address || !!port || !!addr) {
                                await tcp.tcpClient(Number(port), ip_address.toString(), data).then((row) => {
                                    console.log('RESPONSE : ', row);
                                    var data_resp = row.replace(/\s/g, '');
                                    var resp_length = data_resp.length;
                                    var firstChar = row.charAt(0);
                                    var lastChar = row.charAt(resp_length - 1);//, resp_length);

                                    console.log('LENGTH : ', resp_length, ' FIRST CHAR : ', firstChar, ' LAST CHAR : ', lastChar);
                                    if (firstChar == "*" && lastChar == "#") {
                                        var removeFirstChar = ltrim("*", data_resp);
                                        var result = row.substring(1, data_resp.length - 1);
                                        var data_fs = rtrim("#", removeFirstChar);
                                        console.log(result);
                                        var data_rsp = result.split(",");

                                        console.log(data_rsp[2]);

                                        resolve(true);
                                    } else {
                                        // return 0;
                                        reject(false);
                                    }
                                }).catch(err => {
                                    console.log(err);
                                    reject(false);
                                });
                            } else {
                                reject(false);
                            }
                        } else {
                            reject(false);
                        }
                    } else {
                        reject(false);
                    }
                } else {
                    reject(false);
                }
            } catch (error) {
                // checkblue(no_registrasi_kendaraan, no_uji_kendaraan);
                console.log('ERROR RESPONSE BLUE');

                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
                reject(false)

            }
        });
    }
    const printPenimbanganWim = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var tgl_awal = req.query.tgl_awal;
        var tgl_akhir = req.query.tgl_akhir;
        // console.log(tgl_awal, tgl_akhir);
        var kode_uppkb = req.query.kuppkb;
        // const lokasi_id = req.query.lokasi;
        const bptd_id = req.query.bptd;
        let uppkb = 'Semua UPPKB';
        if (kode_uppkb) {
            uppkb = await getLokasiUppkbNama(kode_uppkb);
        }

        let conditions = [
            sequelize.where(
                sequelize.fn('DATE', sequelize.col('t_log_wim.tgl_penimbangan')),
                { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
            )
        ]

        if (bptd_id) {
            const uppkbIds = await t_lokasi.findAll({
                attributes: ['kode'],
                where: {
                    bptd_id: bptd_id
                }
            }).map(uppkb => uppkb.kode);

            conditions.push({
                kode_uppkb: {
                    [Op.in]: uppkbIds
                }
            });
        }

        if (kode_uppkb) {
            conditions.push({
                kode_uppkb: kode_uppkb
            });
        }

        const options = {
            include: [
                {
                    model: t_lokasi,
                    required: false,
                    as: 'wim_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
            ],
            page: req.query.page || 1,
            paginate: req.query.paginate || 100,
            where: conditions,
            order: [
                [
                    req.query.orderBy || 'tgl_penimbangan',
                    req.query.sortedBy || 'DESC'
                ]
            ],
            logging: false
        }

        const data = await t_log_wim.findAll(options);

        if (data) {
            // let sqlMasukUppkb = `
            //     SELECT
            //     COUNT(*) AS total FROM jt_penimbangan
            //     WHERE tgl_penimbangan BETWEEN '${tgl_awal} 00:00:00' AND '${tgl_akhir} 23:59:59'
            //     AND is_transaksi = 1 AND device_id = 3 AND is_active = true AND is_deleted = false
            // `;
            // const jmlMasukUppkb = await sequelize.query(sqlMasukUppkb, {
            //     type: QueryTypes.SELECT,
            //     logging: false
            // });

            // const jmlData = data.length;
            // const jmlBlueValid = data.filter((val) => val.is_status === 2);
            // const jmlMasukUppkb = Number(jmlMasukUppkb[0].total);

            // const resumedata = {
            //     jmlData: jmlData,
            //     jmlMelanggar: jmlMelanggar.length,
            //     jmlTidakMelanggar: jmlTidakMelanggar ? jmlTidakMelanggar : 0,
            // };
            let tanggal = '';
            const tanggal_awal = moment(tgl_awal).format('DD-MM-YYYY');
            const tanggal_akhir = moment(tgl_akhir).format('DD-MM-YYYY');
            
            if (tanggal_awal == tanggal_akhir) {
                tanggal = `${tanggal_awal}`;
            } else {
                tanggal = `${tanggal_awal} s/d ${tanggal_akhir}`
            }

            var nama_file_uppkb = 'all_uppkb';
            if (bptd_id) {
                uppkb = await getNamaBptd(bptd_id);
                nama_file_uppkb = bptd_id;
            }
            if (kode_uppkb) {
                uppkb = await getLokasiUppkbNama(kode_uppkb);
                nama_file_uppkb = kode_uppkb;
            }

            var filename = `data_wim_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
            var uploadPath = path.join(config.path_report) + '/pdf/' + filename;

            var reportUrl = config.report_url + 'pdf/' + filename;

            const header = await reportTemplate();

            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_ajr.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("printTimbangWimView.ejs", {
                    data: data,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || uppkb,
                    namauppkb: uppkb,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    logo: 'data:image/png;base64,' + contents
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', "printTimbangWimView.ejs"), {
                    data: data,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || uppkb,
                    namauppkb: uppkb,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    logo: 'data:image/png;base64,' + contents
                }, async (err, datapdf) => {
                    if (err) {
                        res.send(err);
                    } else {
                        const options = {
                            format: 'Legal',
                            landscape: true,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };

                        try {
                            await generatePdfFile(datapdf, options, uploadPath);
                            res.send({
                                success: true,
                                message: 'Create PDF Berhasil.',
                                download: reportUrl,
                            });
                        } catch (err) {
                            console.error('PDF error:', err);
                            res.send({
                                success: false,
                                message: 'Create PDF Gagal.',
                                download: ''
                            });
                        }
                    }
                });
            }
        }
    }

    const xlsPenimbanganWim = async (req, res, next) => {
        var tgl_awal = req.query.tgl_awal;
        var tgl_akhir = req.query.tgl_akhir;
        
        var kode_uppkb = req.query.kuppkb;
        const lokasi_id = req.query.lokasi;
        const bptd_id = req.query.bptd;

        // if (lokasi_id) {
        //     kode_uppkb = await getLokasiUppkbKode(lokasi_id);
        // }
        // let uppkb = 'Semua UPPKB';
        // if (kode_uppkb) {
        //     uppkb = await getLokasiUppkbNama(kode_uppkb);
        // }

        let conditions = [
            sequelize.where(
                sequelize.fn('DATE', sequelize.col('t_log_wim.tgl_penimbangan')),
                { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
            )
        ]

        if (bptd_id) {
            const uppkbIds = await t_lokasi.findAll({
                attributes: ['kode'],
                where: {
                    bptd_id: bptd_id
                }
            }).map(uppkb => uppkb.kode);

            conditions.push({
                kode_uppkb: {
                    [Op.in]: uppkbIds
                }
            });
        }

        if (kode_uppkb) {
            conditions.push({
                kode_uppkb: kode_uppkb
            });
        }

        const options = {
            include: [
                {
                    model: t_lokasi,
                    required: false,
                    as: 'wim_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
            ],
            page: req.query.page || 1,
            paginate: req.query.paginate || 100,
            where: conditions,
            order: [
                [
                    req.query.orderBy || 'tgl_penimbangan',
                    req.query.sortedBy || 'DESC'
                ]
            ],
            logging: false
        }

        const data = await t_log_wim.findAll(options);
        if (data) {
            var obj = [];
            for (var row of data) {
                var status = '';
                var status_melanggar = 'Tidak Melanggar';
                if (row.is_status == 1) {
                    status = 'Data Baru';
                } else if (row.is_status == 2) {
                    status = 'Ada Di Blue';
                } else {
                    status = 'Tidak Ada Di Blue';
                }

                if (row.is_melanggar == true) {
                    status_melanggar = 'Melanggar';
                }
                obj.push({
                    tgl_penimbangan: moment(row.tgl_penimbangan).format('DD-MM-YYYY HH:mm:ss'),
                    uppkb: row.wim_uppkb.nama,
                    no_kendaraan: row.no_kendaraan,
                    sumbu: row.sumbu,
                    wim_berat: Math.ceil(row.wim_berat) || 0,
                    batas_berat_kg: Math.ceil(row.batas_berat_kg) || 0,
                    kelebihan_berat: Math.ceil(row.jml_kelebihan_berat) + ' Kg (' + Math.ceil(row.persen_kelebihan_berat) + '%)' || 0,
                    wim_panjang: Math.ceil(row.wim_panjang) || 0,
                    batas_panjang_mm: Math.ceil(row.batas_panjang_mm) || 0,
                    kelebihan_panjang: Math.ceil(row.jml_kelebihan_panjang) + ' mm (' + Math.ceil(row.persen_kelebihan_panjang) + '%)' || 0,
                    wim_lebar: Math.ceil(row.wim_lebar) || 0,
                    batas_lebar_mm: Math.ceil(row.batas_lebar_mm) || 0,
                    kelebihan_lebar: Math.ceil(row.jml_kelebihan_lebar) + ' mm (' + Math.ceil(row.persen_kelebihan_lebar) + '%)' || 0,
                    wim_tinggi: Math.ceil(row.wim_tinggi) || 0,
                    batas_tinggi_mm: Math.ceil(row.batas_tinggi_mm) || 0,
                    kelebihan_tinggi: Math.ceil(row.jml_kelebihan_tinggi) + ' mm (' + Math.ceil(row.persen_kelebihan_tinggi) + '%)' || 0,
                    wim_kecepatan: Math.ceil(row.wim_kecepatan) || 0,
                    axle_weight1: Math.ceil(row.axle_weight1) || 0,
                    axle_weight2: Math.ceil(row.axle_weight2) || 0,
                    axle_weight3: Math.ceil(row.axle_weight3) || 0,
                    axle_weight4: Math.ceil(row.axle_weight4) || 0,
                    axle_weight5: Math.ceil(row.axle_weight5) || 0,
                    axle_weight6: Math.ceil(row.axle_weight6) || 0,
                    axle_weight7: Math.ceil(row.axle_weight7) || 0,
                    axle_dis1: Math.ceil(row.axle_dis1) || 0,
                    axle_dis2: Math.ceil(row.axle_dis2) || 0,
                    axle_dis3: Math.ceil(row.axle_dis3) || 0,
                    axle_dis4: Math.ceil(row.axle_dis4) || 0,
                    axle_dis5: Math.ceil(row.axle_dis5) || 0,
                    axle_dis6: Math.ceil(row.axle_dis6) || 0,
                    axle_dis7: Math.ceil(row.axle_dis7) || 0,
                    status_melanggar: status_melanggar,
                    status_blue: status,
                })
            }

            let workbook = new excel.Workbook(); //creating workbook
            let worksheet = workbook.addWorksheet('Data WIM', {
                pageSetup: { paperSize: 9, orientation: 'landscape' }
            }); //creating worksheet
            // adjust pageSetup settings afterwards
            worksheet.pageSetup.margins = {
                left: 0.7, right: 0.7,
                top: 0.75, bottom: 0.75,
                header: 0.3, footer: 0.3
            };

            //  WorkSheet Header
            worksheet.columns = [
                { header: 'Waktu', key: 'tgl_penimbangan', width: 20 },
                { header: 'Lokasi', key: 'uppkb', width: 20 },
                { header: 'No kendaraan', key: 'no_kendaraan', width: 20 },
                { header: 'Sumbu', key: 'sumbu', width: 20 },
                { header: 'Berat Deteksi (Kg)', key: 'wim_berat', width: 20 },
                { header: 'Berat Diizinkan (Kg)', key: 'batas_berat_kg', width: 20 },
                { header: 'Kelebihan Berat', key: 'kelebihan_berat', width: 20 },
                { header: 'Panjang Deteksi (mm)', key: 'wim_panjang', width: 20 },
                { header: 'Panjang Diizinkan (mm)', key: 'batas_panjang_mm', width: 20 },
                { header: 'Kelebihan Panjang', key: 'kelebihan_panjang', width: 20 },
                { header: 'Lebar WIM (mm)', key: 'wim_lebar', width: 20 },
                { header: 'Lebar Diizinkan (mm)', key: 'batas_lebar_mm', width: 20 },
                { header: 'Kelebihan Lebar (mm)', key: 'kelebihan_lebar', width: 20 },                
                { header: 'Tinggi WIM (mm)', key: 'wim_tinggi', width: 20 },
                { header: 'Tinggi Diizinkan (mm)', key: 'batas_tinggi_mm', width: 20 },
                { header: 'Kelebihan Tinggi (mm)', key: 'kelebihan_tinggi', width: 20 },                 
                { header: 'Kecepatan WIM (Km/Jam)', key: 'wim_kecepatan', width: 20 },
                { header: 'Deteksi Berat Sumbu 1 (Kg)', key: 'axle_weight1', width: 20 },
                { header: 'Deteksi Berat Sumbu 2 (Kg)', key: 'axle_weight2', width: 20 },
                { header: 'Deteksi Berat Sumbu 3 (Kg)', key: 'axle_weight3', width: 20 },
                { header: 'Deteksi Berat Sumbu 4 (Kg)', key: 'axle_weight4', width: 20 },
                { header: 'Deteksi Berat Sumbu 5 (Kg)', key: 'axle_weight5', width: 20 },
                { header: 'Deteksi Berat Sumbu 6 (Kg)', key: 'axle_weight6', width: 20 },
                { header: 'Deteksi Berat Sumbu 7 (Kg)', key: 'axle_weight7', width: 20 },
                { header: 'Deteksi Jarak Sumbu 1 & 2 (mm)', key: 'axle_dis1', width: 20 },
                { header: 'Deteksi Jarak Sumbu 2 & 3 (mm)', key: 'axle_dis2', width: 20 },
                { header: 'Deteksi Jarak Sumbu 3 & 4 (mm)', key: 'axle_dis3', width: 20 },
                { header: 'Deteksi Jarak Sumbu 4 & 5 (mm)', key: 'axle_dis4', width: 20 },
                { header: 'Deteksi Jarak Sumbu 5 & 6 (mm)', key: 'axle_dis5', width: 20 },
                { header: 'Deteksi Jarak Sumbu 6 & 7 (mm)', key: 'axle_dis6', width: 20 },
                { header: 'Deteksi Jarak Sumbu 7 & 8 (mm)', key: 'axle_dis7', width: 20 },
                { header: 'Status Melanggar', key: 'status_melanggar', width: 30 },
                { header: 'Status Blu-e', key: 'status_blue', width: 30 },
            ];

            // Add Array Rows
            worksheet.addRows(obj);

            worksheet.eachRow(function (row, rowNumber) {

                row.eachCell((cell, colNumber) => {
                    if (rowNumber == 1) {
                        // First set the background of header row
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'f5b914' }
                        }
                    }
                    // Set border of each cell 
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                })
                //Commit the changed row to the stream
                row.commit();
            });

            console.log(path.join(__dirname));
            //var reportUrl = config.path_report+'/excel/'
            var m = moment();

            var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
            const filename = `data_wim_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
            const uploadPath = path.join(config.path_report) + '/xls/' + filename;
            const reportUrl = config.report_url + 'xls/' + filename;

            workbook.xlsx.writeFile(uploadPath).then(function () {
                console.log("xlsx file is written.");
                res.send({
                    success: true,
                    message: 'Create PDF Berhasil.',
                    filename: filename,
                    download: reportUrl
                });
            });
        }
    }

    return {
        createSyncWimData,
        dataWim,
        dataWimPusat,
        dataWimById,
        automaticLane,
        printPenimbanganWim,
        xlsPenimbanganWim
    };
}

module.exports = PenimbanganWimController;