const {
    t_penimbangan,
    t_detailmuatan,
    t_detaildokumen,
    t_dokumen,
    t_pelanggaran,
    t_regu,
    t_shift,
    t_petugas,
    t_lokasi,
    t_bptd,
    t_timbangan,
    t_kota_kab,
    t_jenis_pelanggaran,
    t_komoditi,
    t_kategori_kepemilikan,
    t_kategori_komoditi,
    t_penindakan,
    t_detailpenindakan_sanksi,
    t_detailpenindakan_pasal,
    t_detailpenindakan_sitaan,
    t_sitaan,
    t_sub_sanksi,
    t_sanksi,
    t_pasal,
    t_gol_sim,
    t_pengadilan,
    t_transfermuat,
    t_detaildimensi,
    t_kendaraan,
    t_detailramcek,
    sequelize
} = require('../models');

const {
    encrypt, decrypt
} = require('./lib/aescrypt');

const {
    getLokasiUppkbById,
    getLokasiUppkbNama,
    getShift,
    getRegu,
    getSanksi,
    getKorsatpel,
    getPpns,
    getPenguji,
    getDanru,
    getOperator,
} = require('./lib/dataid');
var QRCode = require('qrcode');

const { Op } = require('sequelize');

const config = require('../../config/config');
const { reportTemplate } = require('../controllers/lib/report_template');
const fs = require('fs');
const moment = require('moment');
const path = require("path");
const ejs = require("ejs");

const excel = require('exceljs');
const { generatePdfFile } = require('../middleware/pdfGenerator');

// var key = "JTO21Marktel1234";

const PengawasanController = () => {
    const generateQr = async (link) => {
        QRCode.toDataURL(link, (err, data) => {
            if (err) {
                return err;
            } else {
                // const qrCodeDataUrl = data;
                // console.log(data);
                return data;
            }
        });
    }

    function base64_encode(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    }

    function promiseToCreateQRcode(linktext) {
        return new Promise(function (resolve, reject) {
            QRCode.toDataURL(linktext, function (err, url) {
                if (err) {
                    reject(err);
                } else {
                    resolve(url);
                }
            });
        });
    }

    // PENIMBANGAN 
    const conditionPenimbanganOld = async (req) => {
        const name = req.query.search;
        const id = req.query.id;
        const device_id = req.query.device;
        const lokasi_id = req.query.lokasi;
        const bptd_id = req.query.bptd;
        const kode_trx = req.query.notrx;
        const kode_uppkb = req.query.kuppkb;
        const no_kendaraan = req.query.nokendaraan;
        const no_uji = req.query.nouji;
        const tgl_penimbangan = req.query.tgltrx;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const is_melanggar = req.query.is_melanggar;
        const kategori_kepemilikan_id = req.query.katkepemilikan;
        const komoditi_id = req.query.komoditi;
        const kategori_komoditi_id = req.query.kategori_komoditi_id;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const petugas_id = req.query.petugas;
        const is_transaksi = req.query.istrx;
        const is_tindakan = req.query.istindakan;

        let conditions = { is_deleted: false, is_active: true }

        if (name) {
            conditions['nama'] = { [Op.iLike]: `%${name}%` }
        }

        if (id) {
            conditions = {
                id: id,
                is_deleted: false, is_active: true
            }
        }

        if (lokasi_id) {
            conditions = {
                lokasi_id: lokasi_id,
                is_deleted: false, is_active: true
            }
        }

        if (bptd_id) {
            conditions = {
                bptd_id: bptd_id,
                is_deleted: false, is_active: true
            }
        }

        if (kode_trx) {
            conditions = {
                kode_trx: kode_trx,
                is_deleted: false, is_active: true
            }
        }

        if (no_uji) {
            conditions = {
                no_uji: no_uji,
                is_deleted: false, is_active: true
            }
        }

        if (no_kendaraan) {
            conditions = {
                no_kendaraan: no_kendaraan,
                is_deleted: false, is_active: true
            }
        }

        if (kategori_kepemilikan_id) {
            conditions = {
                kategori_kepemilikan_id: kategori_kepemilikan_id,
                is_deleted: false, is_active: true
            }
        }

        if (komoditi_id) {
            conditions = {
                komoditi_id: komoditi_id,
                is_deleted: false, is_active: true
            }
        }

        if (kategori_komoditi_id) {
            conditions = {
                kategori_komoditi_id: kategori_komoditi_id,
                is_deleted: false, is_active: true
            }
        }

        if (shift_id) {
            conditions = {
                shift_id: shift_id,
                is_deleted: false, is_active: true
            }
        }

        if (regu_id) {
            conditions = {
                regu_id: regu_id,
                is_deleted: false, is_active: true
            }
        }

        if (petugas_id) {
            conditions = {
                petugas_id: petugas_id,
                is_deleted: false, is_active: true
            }
        }

        if (is_melanggar) {
            conditions = {
                is_melanggar: is_melanggar,
                is_deleted: false, is_active: true
            }
        }

        if (is_tindakan) {
            conditions = {
                is_tindakan: is_tindakan,
                is_deleted: false, is_active: true
            }
        }

        if (tgl_penimbangan) {
            conditions = {
                tgl_penimbangan: moment(tgl_penimbangan).format('YYYY-MM-DD'),
                is_deleted: false, is_active: true
            }
        }

        if (tgl_antrian) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                    moment(tgl_antrian).format('YYYY-MM-DD')
                ),
                { is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi) {
            conditions = {
                is_transaksi: is_transaksi,
                is_deleted: false, is_active: true
            }
        }

        if (kode_uppkb) {
            conditions = {
                kode_uppkb: kode_uppkb,
                is_deleted: false, is_active: true,
                is_active: true
            }
        }

        if (is_transaksi && lokasi_id) {
            conditions = {
                is_transaksi: is_transaksi,
                lokasi_id: lokasi_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (is_transaksi && regu_id) {
            conditions = {
                regu_id: regu_id,
                is_transaksi: is_transaksi,
                is_deleted: false, is_active: true
            }
        }

        if (is_transaksi && shift_id) {
            conditions = {
                shift_id: shift_id,
                is_transaksi: is_transaksi,
                is_deleted: false, is_active: true
            }
        }

        if (is_transaksi && komoditi_id) {
            conditions = {
                komoditi_id: komoditi_id,
                is_transaksi: is_transaksi,
                is_deleted: false, is_active: true
            }
        }

        if (is_transaksi && kategori_komoditi_id) {
            conditions = {
                kategori_komoditi_id: kategori_komoditi_id,
                is_transaksi: is_transaksi,
                is_deleted: false, is_active: true
            }
        }

        if (is_transaksi && kategori_kepemilikan_id) {
            conditions = {
                kategori_kepemilikan_id: kategori_kepemilikan_id,
                is_transaksi: is_transaksi,
                is_deleted: false, is_active: true
            }
        }

        if (is_transaksi && kode_trx) {
            conditions = {
                kode_trx: kode_trx,
                is_transaksi: is_transaksi,
                is_deleted: false, is_active: true
            }
        }

        if (is_transaksi && no_kendaraan) {
            conditions = {
                no_kendaraan: no_kendaraan,
                is_transaksi: is_transaksi,
                is_deleted: false, is_active: true
            }
        }

        // if (is_transaksi && tgl_antrian) {
        //     conditions = [
        //         sequelize.where(
        //             sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
        //             moment(tgl_antrian).format('YYYY-MM-DD')
        //         ),
        //         { is_transaksi: is_transaksi, is_deleted: false, is_active: true }
        //     ]
        // }

        /* ***********************************************MELANGGAR TGL AWAL TGL AKHIR***************************************************************** */
        if (tgl_awal && tgl_akhir) {
            if (is_transaksi) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        lokasi_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && lokasi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        lokasi_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && kode_uppkb && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        kode_uppkb: kode_uppkb,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        lokasi_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && bptd_id && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        lokasi_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && bptd_id && kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        kode_uppkb: kode_uppkb,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && shift_id && regu_id && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    { is_transaksi: is_transaksi, shift_id: shift_id, regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }
        }
        /* **************************************************************************************************************** */

        if (is_transaksi && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, is_deleted: false, is_active: true }
            ]
        }

        if (tgl_penimbangan && no_kendaraan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
            ]
        }

        if (tgl_penimbangan && no_uji) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { no_uji: no_uji, is_deleted: false, is_active: true }
            ]
        }

        if (tgl_penimbangan && kode_uppkb) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
            ]
        }

        if (tgl_penimbangan && lokasi_id) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        // if (is_transaksi && lokasi_id && tgl_antrian) {
        //     conditions = [
        //         sequelize.where(
        //             sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
        //             moment(tgl_antrian).format('YYYY-MM-DD')
        //         ),
        //         { is_transaksi: is_transaksi, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
        //     ]                                
        // }

        // if (is_transaksi && kode_uppkb && tgl_antrian) {
        //     conditions = [
        //         sequelize.where(
        //             sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
        //             moment(tgl_antrian).format('YYYY-MM-DD')
        //         ),
        //         { is_transaksi: is_transaksi, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
        //     ]                                
        // }

        if (is_transaksi && lokasi_id && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi && kode_uppkb && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
            ]
        }

        // if (is_transaksi && tgl_antrian && no_kendaraan) {
        //     conditions = [
        //         sequelize.where(
        //             sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
        //             moment(tgl_antrian).format('YYYY-MM-DD')
        //         ),
        //         { is_transaksi: is_transaksi, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
        //     ]
        // }

        if (is_transaksi && tgl_penimbangan && no_kendaraan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
            ]
        }

        // if (is_transaksi && kode_uppkb && tgl_antrian && no_kendaraan) {
        //     conditions = [
        //         sequelize.where(
        //             sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
        //             moment(tgl_antrian).format('YYYY-MM-DD')
        //         ),
        //         { is_transaksi: is_transaksi, kode_uppkb: kode_uppkb, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
        //     ]                                
        // }

        // if (is_transaksi && lokasi_id && tgl_antrian && no_kendaraan) {
        //     conditions = [
        //         sequelize.where(
        //             sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
        //             moment(tgl_antrian).format('YYYY-MM-DD')
        //         ),
        //         { is_transaksi: is_transaksi, lokasi_id: lokasi_id, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
        //     ]                                
        // }

        if (is_transaksi && kode_uppkb && tgl_penimbangan && no_kendaraan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, kode_uppkb: kode_uppkb, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi && is_tindakan && is_melanggar && kode_trx) {
            conditions = {
                is_transaksi: is_transaksi,
                is_melanggar: is_melanggar,
                is_tindakan: is_tindakan,
                kode_trx: kode_trx,
                is_deleted: false,
                is_active: true
            }
        }

        if (is_transaksi && shift_id && lokasi_id && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, shift_id: shift_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi && regu_id && lokasi_id && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi && shift_id && regu_id && kode_uppkb && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, shift_id: shift_id, regu_id: regu_id, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi && shift_id && regu_id && lokasi_id && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, shift_id: shift_id, regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi && is_tindakan && is_melanggar && kode_uppkb && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, is_melanggar: is_melanggar, is_tindakan: is_tindakan, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi && is_tindakan && is_melanggar && lokasi_id && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, is_melanggar: is_melanggar, is_tindakan: is_tindakan, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        if (is_transaksi && bptd_id && shift_id && regu_id && lokasi_id && tgl_penimbangan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    moment(tgl_penimbangan).format('YYYY-MM-DD')
                ),
                { is_transaksi: is_transaksi, bptd_id: bptd_id, shift_id: shift_id, regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        return conditions;
    }

    // PENIMBANGAN 
    const conditionPenimbangan = async (req) => {
        const id = req.query.id;
        const device_id = req.query.device;
        const lokasi_id = req.query.lokasi;
        const bptd_id = req.query.bptd;
        const kode_trx = req.query.notrx;
        const kode_uppkb = req.query.kuppkb;
        const no_kendaraan = req.query.nokendaraan;
        const tgl_penimbangan = req.query.tgltrx;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const is_melanggar = req.query.is_melanggar;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const petugas_id = req.query.petugas;
        const is_transaksi = req.query.istrx;
        const is_tindakan = req.query.istindakan;

        let conditions = { is_deleted: false, is_active: true }

        if (id) conditions = { ...conditions, id };
        if (bptd_id) conditions = { ...conditions, bptd_id };
        if (lokasi_id) conditions = { ...conditions, lokasi_id };
        if (no_kendaraan) conditions = { ...conditions, no_kendaraan };
        if (kode_uppkb) conditions = { ...conditions, kode_uppkb };
        if (tgl_penimbangan) conditions = { ...conditions, tgl_penimbangan };
        if (regu_id) conditions = { ...conditions, regu_id };
        if (shift_id) conditions = { ...conditions, shift_id };
        if (petugas_id) conditions = { ...conditions, petugas_id };
        if (kode_trx) conditions = { ...conditions, kode_trx };

        if (tgl_awal && tgl_akhir) {
            if (is_transaksi) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        lokasi_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && lokasi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        lokasi_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && kode_uppkb && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        kode_uppkb: kode_uppkb,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        lokasi_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_melanggar && is_transaksi && bptd_id && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: true,
                        lokasi_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && shift_id && regu_id && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    { is_transaksi: is_transaksi, shift_id: shift_id, regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && shift_id && regu_id && kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    { is_transaksi: is_transaksi, shift_id: shift_id, regu_id: regu_id, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && shift_id && regu_id && lokasi_id && is_melanggar) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    { is_transaksi: is_transaksi, shift_id: shift_id, regu_id: regu_id, lokasi_id: lokasi_id, is_melanggar: is_melanggar, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && shift_id && regu_id && kode_uppkb && is_melanggar) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    { is_transaksi: is_transaksi, shift_id: shift_id, regu_id: regu_id, kode_uppkb: kode_uppkb, is_melanggar: is_melanggar, is_deleted: false, is_active: true }
                ]
            }
        }

        return conditions;
    }

    const datapenimbangan = async (conditions) => {
        const options = {
            include: [
                {
                    model: t_detailmuatan,
                    required: false,
                    as: 'penimbanganDetailMuatan',
                    attributes: [
                        'id', 'kode_trx', 'kode_uppkb', 'komoditi_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_komoditi,
                            required: false,
                            as: 'detailmuatankomoditi',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
                            include: [
                                {
                                    model: t_kategori_komoditi,
                                    required: false,
                                    as: 'katkomoditi',
                                    attributes: [
                                        'id', 'kode', 'nama'
                                    ],
                                    where: {
                                        is_deleted: false,
                                        is_active: true
                                    }
                                }
                            ],
                        }
                    ]
                },
                {
                    model: t_detaildokumen,
                    required: false,
                    as: 'penimbanganDetailDokumen',
                    attributes: [
                        'id', 'kode_trx', 'kode_uppkb', 'dokumen_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_dokumen,
                            required: false,
                            as: 'detaildokumen',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false
                            },
                        }
                    ]
                },
                {
                    model: t_pelanggaran,
                    required: false,
                    as: 'penimbanganPelanggaran',
                    attributes: [
                        'id', 'kode_trx', 'kode_uppkb', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_jenis_pelanggaran,
                            required: false,
                            as: 'jenisPelanggaran',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            }
                        }
                    ]
                },
                {
                    model: t_kendaraan,
                    required: false,
                    as: 'penimbangan_kendaraan',
                    attributes: [
                        'no_uji', 'masa_berlaku_uji', 'konfigurasi_sumbu', 'jbi', 'foto_depan_url', 'foto_belakang_url', 'foto_kanan_url', 'foto_kiri_url'
                    ],
                    where: {
                        is_deleted: false
                    },
                },
                {
                    model: t_regu,
                    required: false,
                    as: 'penimbangan_regu',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_shift,
                    required: false,
                    as: 'penimbangan_shift',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_petugas,
                    required: false,
                    as: 'penimbangan_petugas',
                    attributes: [
                        'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_lokasi,
                    required: false,
                    as: 'penimbangan_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_timbangan,
                    required: false,
                    as: 'penimbangan_platform',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kota_kab,
                    required: false,
                    as: 'penimbanganAsalKota',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kota_kab,
                    required: false,
                    as: 'penimbanganTujuanKota',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_bptd,
                    required: false,
                    as: 'penimbangan_bptd',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_komoditi,
                    required: false,
                    as: 'penimbanganKomoditi',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kategori_komoditi,
                    required: false,
                    as: 'penimbanganKatKomoditi',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kategori_kepemilikan,
                    required: false,
                    as: 'penimbanganKatKepemilikan',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                }
            ],
            where: conditions,
            order: [
                ['tgl_penimbangan', 'ASC']
            ],
            logging: false
        }

        const penimbangan = await t_penimbangan.findAll(options);

        return penimbangan;
    }

    const printPenimbangan = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var conditions = {
            id: req.query.id,
            is_deleted: false,
        };

        if (req.query.kuppkb) {
            conditions = {
                id: req.query.id,
                kode_uppkb: req.query.kuppkb,
                is_deleted: false,
            };
        }

        if (req.query.lokasi) {
            conditions = {
                id: req.query.id,
                lokasi: req.query.lokasi,
                is_deleted: false,
            };
        }

        var penimbangan = await datapenimbangan(conditions);

        var arrkomoditi = [];
        if (penimbangan.length > 0) {
            if (penimbangan[0].penimbanganDetailMuatan != undefined) {
                penimbangan[0].penimbanganDetailMuatan.map((val) => {
                    arrkomoditi.push(val.detailmuatankomoditi.nama);
                });
            }
        }

        var arrpelanggaran = [];
        if (penimbangan[0].penimbanganPelanggaran) {
            penimbangan[0].penimbanganPelanggaran.map((val) => {
                arrpelanggaran.push(val.jenisPelanggaran.nama);
            });
        }

        var data = {
            kode_uppkb: penimbangan[0].penimbangan_uppkb.kode,
            nama_uppkb: penimbangan[0].penimbangan_uppkb.nama,
            alamat_uppkb: penimbangan[0].penimbangan_uppkb.alamat_uppkb,
            nama_bptd: penimbangan[0].penimbangan_bptd.nama,
            tanggal: moment(penimbangan[0].tgl_penimbangan).format('DD-MM-YYYY'),
            jam: moment(penimbangan[0].tgl_penimbangan).format('HH:mm:ss'),
            no_kendaraan: penimbangan[0].no_kendaraan,
            kode_trx: penimbangan[0].kode_trx,
            no_uji: penimbangan[0].no_uji,
            nama_pemilik: penimbangan[0].nama_pemilik,
            alamat_pemilik: penimbangan[0].alamat_pemilik,
            jbi: penimbangan[0].jbi_uji,
            gandengan_jbki: penimbangan[0].gandengan_jbki,
            berat_timbang: Math.ceil(penimbangan[0].berat_timbang),
            kelebihan_berat: Math.ceil(penimbangan[0].kelebihan_berat),
            persen_lebih: Math.ceil(penimbangan[0].prosen_lebih),
            toleransi: penimbangan[0].use_toleransi,
            tgl_uji: moment(penimbangan[0].tgl_uji).format('DD-MM-YYYY'),
            tgl_masa_berlaku: moment(penimbangan[0].tgl_masa_berlaku).format('DD-MM-YYYY'),
            asal_kota: penimbangan[0].penimbanganAsalKota ? penimbangan[0].penimbanganAsalKota.nama : '-',
            tujuan_kota: penimbangan[0].penimbanganTujuanKota ? penimbangan[0].penimbanganTujuanKota.nama : '-',
            nippetugas: penimbangan[0].penimbangan_petugas ? penimbangan[0].penimbangan_petugas.nip : '-',
            petugas: penimbangan[0].penimbangan_petugas ? penimbangan[0].penimbangan_petugas.nama : '-',
            muatan: arrkomoditi.join(','),
            pelanggaran: arrpelanggaran.join(','),
        }

        var params = encrypt(`ispdf=0&device=1&id=${penimbangan[0].id}`);
        if (req.query.kuppkb) {
            params = encrypt(`ispdf=0&device=1&kuppkb=${req.query.kuppkb}&id=${penimbangan[0].id}`);
        }

        let dataqr = `${process.env.DOMAIN_URL_QR}/penimbangan/${data.kode_uppkb}/${penimbangan[0].id}`;
        let qrCodeDataUrl = await promiseToCreateQRcode(dataqr); //await generateQr('Tested QR');
        //var logo = fs.readFileSync('./images/logo_dishub.png', {encoding: 'base64'});// './images/logo_dishub.png';
        const header = await reportTemplate();
        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        if (ispdf == 0) {
            res.render("printTimbangView.ejs", {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: data,
                logo: 'data:image/png;base64,' + contents,
                qr: qrCodeDataUrl
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "printTimbangView.ejs"), {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: data, logo: 'data:image/png;base64,' + contents, qr: qrCodeDataUrl
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    // let options = {
                    //     "format": "A4",
                    //     "orientation": "portrait",
                    //     "header": {
                    //         "height": "8mm"
                    //     },
                    //     "footer": {
                    //         "height": "8mm",
                    //     },
                    // };
                    const options = {
                        format: 'A4',
                        landscape: false,
                        printBackground: true,
                        margin: { top: '8mm', bottom: '8mm' }
                    };

                    const filename = `timbang_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${data.kode_uppkb}.pdf`;
                    const uploadPath = path.join(config.path_report) + '/pdf/' + filename;

                    const reportUrl = config.report_url + 'pdf/' + filename;

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

    const printPenimbanganKios = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var conditions = {
            id: req.query.id,
            is_deleted: false,
        };

        if (req.query.kuppkb) {
            conditions = {
                id: req.query.id,
                kode_uppkb: req.query.kuppkb,
                is_deleted: false,
            };
        }

        if (req.query.lokasi) {
            conditions = {
                id: req.query.id,
                lokasi: req.query.lokasi,
                is_deleted: false,
            };
        }

        var penimbangan = await datapenimbangan(conditions);

        var arrkomoditi = [];
        if (penimbangan.length > 0) {
            if (penimbangan[0].penimbanganDetailMuatan != undefined) {
                penimbangan[0].penimbanganDetailMuatan.map((val) => {
                    arrkomoditi.push(val.detailmuatankomoditi.nama);
                });
            }
        }

        var arrpelanggaran = [];
        if (penimbangan[0].penimbanganPelanggaran) {
            penimbangan[0].penimbanganPelanggaran.map((val) => {
                arrpelanggaran.push(val.jenisPelanggaran.nama);
            });
        }

        var data = {
            kode_uppkb: penimbangan[0].penimbangan_uppkb.kode,
            nama_uppkb: penimbangan[0].penimbangan_uppkb.nama,
            alamat_uppkb: penimbangan[0].penimbangan_uppkb.alamat_uppkb,
            nama_bptd: penimbangan[0].penimbangan_bptd.nama,
            tanggal: moment(penimbangan[0].tgl_penimbangan).format('DD-MM-YYYY'),
            jam: moment(penimbangan[0].tgl_penimbangan).format('HH:mm:ss'),
            no_kendaraan: penimbangan[0].no_kendaraan,
            kode_trx: penimbangan[0].kode_trx,
            no_uji: penimbangan[0].no_uji,
            nama_pemilik: penimbangan[0].nama_pemilik,
            alamat_pemilik: penimbangan[0].alamat_pemilik,
            jbi: penimbangan[0].jbi_uji,
            gandengan_jbki: penimbangan[0].gandengan_jbki,
            berat_timbang: Math.ceil(penimbangan[0].berat_timbang),
            kelebihan_berat: Math.ceil(penimbangan[0].kelebihan_berat),
            persen_lebih: Math.ceil(penimbangan[0].prosen_lebih),
            toleransi: penimbangan[0].use_toleransi,
            tgl_uji: moment(penimbangan[0].tgl_uji).format('DD-MM-YYYY'),
            tgl_masa_berlaku: moment(penimbangan[0].tgl_masa_berlaku).format('DD-MM-YYYY'),
            asal_kota: penimbangan[0].penimbanganAsalKota ? penimbangan[0].penimbanganAsalKota.nama : '-',
            tujuan_kota: penimbangan[0].penimbanganTujuanKota ? penimbangan[0].penimbanganTujuanKota.nama : '-',
            nippetugas: penimbangan[0].penimbangan_petugas ? penimbangan[0].penimbangan_petugas.nip : '-',
            petugas: penimbangan[0].penimbangan_petugas ? penimbangan[0].penimbangan_petugas.nama : '-',
            muatan: arrkomoditi.join(','),
            pelanggaran: arrpelanggaran.join(','),
        }

        var params = encrypt(`ispdf=0&device=1&id=${penimbangan[0].id}`);
        if (req.query.kuppkb) {
            params = encrypt(`ispdf=0&device=1&kuppkb=${req.query.kuppkb}&id=${penimbangan[0].id}`);
        }

        let dataqr = `${process.env.DOMAIN_URL_QR}/penimbangan/${data.kode_uppkb}/${penimbangan[0].id}`;
        let qrCodeDataUrl = await promiseToCreateQRcode(dataqr); //await generateQr('Tested QR');
        //var logo = fs.readFileSync('./images/logo_dishub.png', {encoding: 'base64'});// './images/logo_dishub.png';
        const header = await reportTemplate();
        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        if (ispdf == 0) {
            res.render("printTimbangKios.ejs", {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: data,
                logo: 'data:image/png;base64,' + contents,
                qr: qrCodeDataUrl
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "printTimbangKios.ejs"), {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: data, logo: 'data:image/png;base64,' + contents, qr: qrCodeDataUrl
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    // let options = {
                    //     "format": "A4",
                    //     "orientation": "portrait",
                    //     "header": {
                    //         "height": "8mm"
                    //     },
                    //     "footer": {
                    //         "height": "8mm",
                    //     },
                    // };
                    const options = {
                            format: 'A4',
                            landscape: false,
                            printBackground: true,
                            margin: { top: '8mm', bottom: '8mm' }
                        };

                    const filename = `timbang_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${data.kode_uppkb}.pdf`;
                    const uploadPath = path.join(config.path_report) + '/pdf/' + filename;

                    const reportUrl = config.report_url + 'pdf/' + filename;

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

    const pengawasanPenimbangan = async (req, res, next) => {
        const ispdf = req.query.ispdf;
        const lokasi_id = req.query.lokasi;
        const kode_uppkb = req.query.kuppkb;
        const tgl_penimbangan = req.query.tgltrx;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const device_id = req.query.device;
        const is_cond = device_id == 1 ? false : true;

        let conditions = await conditionPenimbangan(req);

        var data = await datapenimbangan(conditions);

        if (!data) {
            return res.send({ success: false, message: 'Data tidak ditemukan' });
        }

        if (data) {
            const jmlData = data.length;
            const jmlMelanggar = data.filter((val) => val.is_melanggar === true);
            const jmlTidakMelanggar = Number(jmlData) - Number(jmlMelanggar.length);

            const shift = (shift_id != undefined) ? await getShift(shift_id) : 'SEMUA';
            const regu = (regu_id != undefined) ? await getRegu(regu_id) : 'SEMUA';

            const resumedata = {
                shift: (shift.nama) ? shift.nama : 'SEMUA',
                regu: (regu.nama) ? regu.nama : 'SEMUA',
                jmlData: jmlData,
                jmlMelanggar: jmlMelanggar.length,
                jmlTidakMelanggar: jmlTidakMelanggar ? jmlTidakMelanggar : 0,
            };

            const tanggal = moment(tgl_penimbangan).format('DD-MM-YYYY');
            const tanggal_awal = moment(tgl_awal).format('DD-MM-YYYY');
            const tanggal_akhir = moment(tgl_akhir).format('DD-MM-YYYY');
            const lokasi = lokasi_id ? await getLokasiUppkbById(lokasi_id) : [];


            var nama_file_uppkb = 'all_uppkb';
            if (lokasi_id) {
                nama_file_uppkb = lokasi.kode;
            }

            var params = `istrx=1&ispdf=0&device=${device_id}&tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}`;
            if (lokasi_id) {
                params = `istrx=1&ispdf=0&device=${device_id}&lokasi=${lokasi_id}&tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}`;
            }

            var filename = `data_penimbangan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
            var uploadPath = path.join(config.path_report) + '/pdf/' + filename;

            var reportUrl = config.report_url + 'pdf/' + filename;

            let dataqr = `${process.env.DOMAIN_URL_QR}/rep/penimbangan?src=${encrypt(params)}`;
            if (regu_id != undefined) {
                dataqr += `&regu=${regu_id}`;
            }

            if (shift_id != undefined) {
                dataqr += `&shift=${shift_id}`;
            }

            const danru = lokasi_id && regu_id ? await getDanru(lokasi_id, regu_id) : [];
            const korsatpel = lokasi_id ? await getKorsatpel(lokasi_id) : [];

            let qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();
            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });
            if (ispdf == 0) {
                res.render("penimbanganView.ejs", {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: data,
                    moment: moment,
                    danru: danru,
                    korsatpel: korsatpel,
                    is_cond: is_cond,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    device_id: device_id,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', "penimbanganView.ejs"), {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: data,
                    danru: danru,
                    korsatpel: korsatpel,
                    is_cond: is_cond,
                    moment: moment,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    device_id: device_id,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                }, async (err, datapdf) => {
                    if (err) {
                        res.send(err);
                    } else {
                        // let options = {
                        //     "format": "Legal",
                        //     "orientation": "landscape",
                        //     "header": {
                        //         "height": "5mm"
                        //     },
                        //     "footer": {
                        //         "height": "7mm",
                        //     },
                        // };
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


                        // pdf.create(datapdf, options).toFile(uploadPath, function (err, data) {
                        //     if (err) {
                        //         res.send({
                        //             success: false,
                        //             message: 'Create PDF Gagal.',
                        //             download: ''
                        //         });
                        //     } else {
                        //         res.send({
                        //             success: true,
                        //             message: 'Create PDF Berhasil.',
                        //             filename: filename,
                        //             download: reportUrl
                        //         });
                        //         // res.send("File created successfully");
                        //     }
                        // });
                    }
                });
            }
        }
    }

    const pengawasanXlsPenimbangan = async (req, res, next) => {
        let conditions = await conditionPenimbangan(req);

        let data = await datapenimbangan(conditions);
        if (data) {
            var obj = [];
            for (var row of data) {
                var arrkomoditi = [];
                row.penimbanganDetailMuatan.map((val) => {
                    if (val.detailmuatankomoditi) {
                        arrkomoditi.push(val.detailmuatankomoditi.nama);
                    } else {
                        arrkomoditi.push('-');
                    }
                });

                var arrpelanggaran = [];
                row.penimbanganPelanggaran.map((val) => {
                    arrpelanggaran.push(val.jenisPelanggaran.nama);
                });
                obj.push({
                    kode_uppkb: row.penimbangan_uppkb.kode,
                    nama_uppkb: row.penimbangan_uppkb.nama,
                    alamat_uppkb: row.penimbangan_uppkb.alamat_uppkb,
                    nama_bptd: row.penimbangan_bptd ? row.penimbangan_bptd.nama : '',
                    tgl_penimbangan: moment(row.tgl_penimbangan).format('DD-MM-YYYY HH:mm:ss'),
                    tanggal: moment(row.tgl_penimbangan).format('DD-MM-YYYY'),
                    jam: moment(row.tgl_penimbangan).format('HH:mm:ss'),
                    no_kendaraan: row.no_kendaraan,
                    kode_trx: row.kode_trx,
                    no_uji: row.no_uji,
                    nama_pemilik: row.nama_pemilik,
                    alamat_pemilik: row.alamat_pemilik,
                    jenis_kendaraan: row.jenis_kendaraan ? row.jenis_kendaraan.toUpperCase() : '',
                    sumbu: row.sumbu,
                    jbi: row.jbi_uji || 0,
                    berat_timbang: Math.ceil(row.berat_timbang) || 0,
                    kelebihan_berat: Math.ceil(row.kelebihan_berat) || 0,
                    persen_lebih: Math.ceil(row.prosen_lebih) || 0,
                    toleransi: row.use_toleransi || 0,
                    tgl_uji: moment(row.tgl_uji).format('DD-MM-YYYY'),
                    tgl_masa_berlaku: moment(row.tgl_masa_berlaku).format('DD-MM-YYYY'),
                    asal_kota: row.penimbanganAsalKota ? row.penimbanganAsalKota.nama : '-',
                    tujuan_kota: row.penimbanganTujuanKota ? row.penimbanganTujuanKota.nama : '-',
                    petugas: row.penimbangan_petugas ? row.penimbangan_petugas.nama : '-',
                    shift: row.penimbangan_shift ? row.penimbangan_shift.nama : '-',
                    regu: row.penimbangan_regu ? row.penimbangan_regu.nama : '',
                    muatan: arrkomoditi.join(','),
                    pelanggaran: arrpelanggaran.join(','),
                    panjang_utama: row.panjang_utama || 0,
                    panjang_toleransi: row.panjang_toleransi || 0,
                    panjang_ukur: row.panjang_ukur || 0,
                    panjang_lebih: row.panjang_lebih || 0,
                    lebar_utama: row.lebar_utama || 0,
                    lebar_toleransi: row.lebar_toleransi || 0,
                    lebar_ukur: row.lebar_ukur || 0,
                    lebar_lebih: row.lebar_lebih || 0,
                    tinggi_utama: row.tinggi_utama || 0,
                    tinggi_toleransi: row.tinggi_toleransi || 0,
                    tinggi_ukur: row.tinggi_ukur || 0,
                    tinggi_lebih: row.tinggi_lebih || 0,
                    foh_utama: row.foh_utama || 0,
                    foh_toleransi: row.foh_toleransi || 0,
                    foh_ukur: row.foh_ukur || 0,
                    foh_lebih: row.foh_lebih || 0,
                    roh_utama: row.roh_utama || 0,
                    roh_toleransi: row.roh_toleransi || 0,
                    roh_ukur: row.roh_ukur || 0,
                    roh_lebih: row.roh_lebih || 0,
                    wim_panjang: row.wim_panjang || 0,
                    wim_lebar: row.wim_lebar || 0,
                    wim_tinggi: row.wim_tinggi || 0,
                    wim_foh: row.wim_foh || 0,
                    wim_roh: row.wim_roh || 0,
                })
            }

            let workbook = new excel.Workbook(); //creating workbook
            let worksheet = workbook.addWorksheet('Penimbangan', {
                pageSetup: { paperSize: 9, orientation: 'landscape' }
            }); //creating worksheet
            // adjust pageSetup settings afterwards
            worksheet.pageSetup.margins = {
                left: 0.7, right: 0.7,
                top: 0.75, bottom: 0.75,
                header: 0.3, footer: 0.3
            };

            if (req.query.device != 1) {
                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Waktu', key: 'tgl_penimbangan', width: 20 },
                    { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
                    { header: 'No kendaraan', key: 'no_kendaraan', width: 20 },
                    { header: 'No Uji', key: 'no_uji', width: 20 },
                    { header: 'Nama Pemilik', key: 'nama_pemilik', width: 30 },
                    { header: 'Alamat Pemilik', key: 'alamat_pemilik', width: 40 },
                    { header: 'Jenis Kendaraan', key: 'jenis_kendaraan', width: 30 },
                    { header: 'Sumbu', key: 'sumbu', width: 10, alignment: 'center' },
                    { header: 'JBI (Kg)', key: 'jbi', width: 10 },
                    { header: 'Berat Timbang (Kg)', key: 'berat_timbang', width: 10 },
                    { header: 'Berat Lebih (Kg)', key: 'kelebihan_berat', width: 10 },
                    { header: 'Persen Lebih (%)', key: 'persen_lebih', width: 10 },
                    { header: 'Toleransi (%)', key: 'toleransi', width: 10 },
                    { header: 'Panjang Uji (mm)', key: 'panjang_utama', width: 10 },
                    { header: 'Panjang Ukur (mm)', key: 'panjang_ukur', width: 10 },
                    { header: 'Panjang WIM (mm)', key: 'wim_panjang', width: 10 },
                    { header: 'Panjang Toleransi (mm)', key: 'panjang_toleransi', width: 10 },
                    { header: 'Panjang Lebih (mm)', key: 'panjang_lebih', width: 10 },
                    { header: 'Lebar Uji (mm)', key: 'lebar_utama', width: 10 },
                    { header: 'Lebar Ukur (mm)', key: 'lebar_ukur', width: 10 },
                    { header: 'Lebar WIM (mm)', key: 'wim_lebar', width: 10 },
                    { header: 'Lebar Toleransi (mm)', key: 'lebar_toleransi', width: 10 },
                    { header: 'Lebar Lebih (mm)', key: 'lebar_lebih', width: 10 },
                    { header: 'Tinggi Uji (mm)', key: 'tinggi_utama', width: 10 },
                    { header: 'Tinggi Ukur (mm)', key: 'tinggi_ukur', width: 10 },
                    { header: 'Tinggi WIM (mm)', key: 'wim_tinggi', width: 10 },
                    { header: 'Tinggi Toleransi (mm)', key: 'tinggi_toleransi', width: 10 },
                    { header: 'Tinggi Lebih (mm)', key: 'tinggi_lebih', width: 10 },
                    { header: 'FOH Uji (mm)', key: 'foh_utama', width: 10 },
                    { header: 'FOH Ukur (mm)', key: 'foh_ukur', width: 10 },
                    { header: 'FOH WIM (mm)', key: 'wim_foh', width: 10 },
                    { header: 'FOH Toleransi (mm)', key: 'foh_toleransi', width: 10 },
                    { header: 'FOH Lebih (mm)', key: 'foh_lebih', width: 10 },
                    { header: 'ROH Uji (mm)', key: 'roh_utama', width: 10 },
                    { header: 'ROH Ukur (mm)', key: 'roh_ukur', width: 10 },
                    { header: 'ROH WIM (mm)', key: 'wim_roh', width: 10 },
                    { header: 'ROH Toleransi (mm)', key: 'roh_toleransi', width: 10 },
                    { header: 'ROH Lebih (mm)', key: 'roh_lebih', width: 10 },
                    { header: 'Asal', key: 'asal_kota', width: 30 },
                    { header: 'Tujuan', key: 'tujuan_kota', width: 30 },
                    { header: 'Komoditi', key: 'muatan', width: 30 },
                    { header: 'Pelanggaran', key: 'pelanggaran', width: 30 },
                    { header: 'Shift', key: 'shift', width: 30 },
                    { header: 'Regu', key: 'regu', width: 30 },
                    { header: 'Operator', key: 'petugas', width: 30 },
                ];
            } else {
                worksheet.columns = [
                    { header: 'Waktu', key: 'tgl_penimbangan', width: 20 },
                    { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
                    { header: 'No kendaraan', key: 'no_kendaraan', width: 20 },
                    { header: 'No Uji', key: 'no_uji', width: 20 },
                    { header: 'Nama Pemilik', key: 'nama_pemilik', width: 30 },
                    { header: 'Alamat Pemilik', key: 'alamat_pemilik', width: 40 },
                    { header: 'Jenis Kendaraan', key: 'jenis_kendaraan', width: 30 },
                    { header: 'Sumbu', key: 'sumbu', width: 10, alignment: 'center' },
                    { header: 'JBI (Kg)', key: 'jbi', width: 10 },
                    { header: 'Berat Timbang (Kg)', key: 'berat_timbang', width: 10 },
                    { header: 'Berat Lebih (Kg)', key: 'kelebihan_berat', width: 10 },
                    { header: 'Persen Lebih (%)', key: 'persen_lebih', width: 10 },
                    { header: 'Toleransi (%)', key: 'toleransi', width: 10 },
                    { header: 'Panjang Uji (mm)', key: 'panjang_utama', width: 10 },
                    { header: 'Panjang Ukur (mm)', key: 'panjang_ukur', width: 10 },
                    { header: 'Panjang WIM (mm)', key: 'wim_panjang', width: 10 },
                    { header: 'Panjang Toleransi (mm)', key: 'panjang_toleransi', width: 10 },
                    { header: 'Panjang Lebih (mm)', key: 'panjang_lebih', width: 10 },
                    { header: 'Lebar Uji (mm)', key: 'lebar_utama', width: 10 },
                    { header: 'Lebar Ukur (mm)', key: 'lebar_ukur', width: 10 },
                    { header: 'Lebar WIM (mm)', key: 'wim_lebar', width: 10 },
                    { header: 'Lebar Toleransi (mm)', key: 'lebar_toleransi', width: 10 },
                    { header: 'Lebar Lebih (mm)', key: 'lebar_lebih', width: 10 },
                    { header: 'Tinggi Uji (mm)', key: 'tinggi_utama', width: 10 },
                    { header: 'Tinggi Ukur (mm)', key: 'tinggi_ukur', width: 10 },
                    { header: 'Tinggi WIM (mm)', key: 'wim_tinggi', width: 10 },
                    { header: 'Tinggi Toleransi (mm)', key: 'tinggi_toleransi', width: 10 },
                    { header: 'Tinggi Lebih (mm)', key: 'tinggi_lebih', width: 10 },
                    { header: 'FOH Uji (mm)', key: 'foh_utama', width: 10 },
                    { header: 'FOH Ukur (mm)', key: 'foh_ukur', width: 10 },
                    { header: 'FOH WIM (mm)', key: 'wim_foh', width: 10 },
                    { header: 'FOH Toleransi (mm)', key: 'foh_toleransi', width: 10 },
                    { header: 'FOH Lebih (mm)', key: 'foh_lebih', width: 10 },
                    { header: 'ROH Uji (mm)', key: 'roh_utama', width: 10 },
                    { header: 'ROH Ukur (mm)', key: 'roh_ukur', width: 10 },
                    { header: 'ROH WIM (mm)', key: 'wim_roh', width: 10 },
                    { header: 'ROH Toleransi (mm)', key: 'roh_toleransi', width: 10 },
                    { header: 'ROH Lebih (mm)', key: 'roh_lebih', width: 10 },
                    { header: 'Asal', key: 'asal_kota', width: 30 },
                    { header: 'Tujuan', key: 'tujuan_kota', width: 30 },
                    { header: 'Komoditi', key: 'muatan', width: 30 },
                    { header: 'Pelanggaran', key: 'pelanggaran', width: 30 },
                ];
            }

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
            const filename = `penimbangan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
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


    // PELANGGARAN

    const pengawasanPelanggaran = async (req, res, next) => {
        const ispdf = req.query.ispdf;
        const lokasi_id = req.query.lokasi;
        const kode_uppkb = req.query.kuppkb;
        const tgl_penimbangan = req.query.tgltrx;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const device_id = req.query.device;
        const is_cond = device_id == 1 ? false : true;
        let conditions = await conditionPenimbangan(req);

        var data = await datapenimbangan(conditions);

        if (data) {

            const jmlData = Object.keys(data).length;
            const jmlDitindak = (data || []).filter((val) => val.is_tindakan === true);
            const jmlBelumDitindak = Number(jmlData) - Number(jmlDitindak.length);

            const shift = (shift_id != undefined) ? await getShift(shift_id) : 'SEMUA';
            const regu = (regu_id != undefined) ? await getRegu(regu_id) : 'SEMUA';

            const resumedata = {
                shift: (shift.nama) ? shift.nama : 'SEMUA',
                regu: (regu.nama) ? regu.nama : 'SEMUA',
                jmlData: jmlData,
                jmlDitindak: jmlDitindak.length,
                jmlBelumDitindak: jmlBelumDitindak ? jmlBelumDitindak : 0,
            };

            const tanggal = moment(tgl_penimbangan).format('DD-MM-YYYY');
            const tanggal_awal = moment(tgl_awal).format('DD-MM-YYYY');
            const tanggal_akhir = moment(tgl_akhir).format('DD-MM-YYYY');
            const lokasi = lokasi_id ? await getLokasiUppkbById(lokasi_id) : [];

            var params = `tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}&device=${device_id}&is_melanggar=${true}&istrx=1&ispdf=0`;
            if (lokasi_id) {
                params = `tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}&device=${device_id}&is_melanggar=${true}&lokasi=${lokasi_id}&istrx=1&ispdf=0`;
            }

            let dataqr = `${process.env.DOMAIN_URL_QR}/rep/pelanggaran?src=${encrypt(params)}`;

            if (regu_id != undefined) {
                dataqr += `&regu=${regu_id}`;
            }

            if (shift_id != undefined) {
                dataqr += `&shift=${shift_id}`;
            }

            var danru = [];
            if (lokasi_id && regu_id) {
                danru = await getDanru(lokasi_id, regu_id);
            }
            var korsatpel = [];
            if (lokasi_id) {
                korsatpel = await getKorsatpel(lokasi_id);
            }

            let qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();
            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("pelanggaranView.ejs", {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: data,
                    moment: moment,
                    danru: danru,
                    korsatpel: korsatpel,
                    lokasi_id: lokasi_id,
                    is_cond: is_cond,
                    device_id: device_id,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    lokasi: lokasi,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', "pelanggaranView.ejs"), {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: data,
                    is_cond: is_cond,
                    korsatpel: korsatpel,
                    device_id: device_id,
                    danru: danru,
                    lokasi_id: lokasi_id,
                    moment: moment,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    lokasi: lokasi,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                }, async (err, datapdf) => {
                    if (err) {
                        res.send(err);
                    } else {
                        // let options = {
                        //     "format": "Legal",
                        //     "orientation": "landscape",
                        //     "header": {
                        //         "height": "5mm"
                        //     },
                        //     "footer": {
                        //         "height": "7mm",
                        //     },
                        // };

                        const options = {
                            format: 'Legal',
                            landscape: true,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };

                        var nama_file_uppkb = 'all_uppkb';
                        if (lokasi_id) {
                            nama_file_uppkb = lokasi.kode;
                        }
                        const filename = `data_pelanggaran_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                        const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
                        const reportUrl = config.report_url + 'pdf/' + filename;

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

    const pengawasanXlsPelanggaran = async (req, res, next) => {

        let conditions = await conditionPenimbangan(req);
        let data = await datapenimbangan(conditions);

        var obj = [];
        for (var row of data) {
            var arrkomoditi = [];
            row.penimbanganDetailMuatan.map((val) => {
                if (val.detailmuatankomoditi) {
                    arrkomoditi.push(val.detailmuatankomoditi.nama);
                } else {
                    arrkomoditi.push('-');
                }
            });

            var arrpelanggaran = [];
            row.penimbanganPelanggaran.map((val) => {
                arrpelanggaran.push(val.jenisPelanggaran.nama);
            });
            obj.push({
                kode_uppkb: row.penimbangan_uppkb.kode,
                nama_uppkb: row.penimbangan_uppkb.nama,
                alamat_uppkb: row.penimbangan_uppkb.alamat_uppkb,
                nama_bptd: row.penimbangan_bptd.nama,
                tgl_penimbangan: moment(row.tgl_penimbangan).format('DD-MM-YYYY HH:mm:ss'),
                tanggal: moment(row.tgl_penimbangan).format('DD-MM-YYYY'),
                jam: moment(row.tgl_penimbangan).format('HH:mm:ss'),
                no_kendaraan: row.no_kendaraan,
                kode_trx: row.kode_trx,
                no_uji: row.no_uji,
                nama_pemilik: row.nama_pemilik,
                alamat_pemilik: row.alamat_pemilik,
                jenis_kendaraan: row.jenis_kendaraan,
                sumbu: row.sumbu,
                jbi: row.jbi_uji,
                berat_timbang: Math.ceil(row.berat_timbang),
                kelebihan_berat: Math.ceil(row.kelebihan_berat),
                persen_lebih: Math.ceil(row.prosen_lebih),
                toleransi: row.use_toleransi,
                tgl_uji: moment(row.tgl_uji).format('DD-MM-YYYY'),
                tgl_masa_berlaku: moment(row.tgl_masa_berlaku).format('DD-MM-YYYY'),
                asal_kota: row.penimbanganAsalKota ? row.penimbanganAsalKota.nama : '-',
                tujuan_kota: row.penimbanganTujuanKota ? row.penimbanganTujuanKota.nama : '-',
                petugas: row.penimbangan_petugas ? row.penimbangan_petugas.nama : '-',
                shift: row.penimbangan_shift ? row.penimbangan_shift.nama : '-',
                regu: row.penimbangan_regu ? row.penimbangan_regu.nama : '-',
                muatan: arrkomoditi.join(','),
                pelanggaran: arrpelanggaran.join(','),
                sudah_ditindak: row.is_tindakan == true ? 'SUDAH DITINDAK' : 'BELUM DITINDAK',
            });
        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('Pelanggaran', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        //  WorkSheet Header
        if (req.query.device != 1) {
            //  WorkSheet Header
            worksheet.columns = [
                { header: 'Waktu', key: 'tgl_penimbangan', width: 20 },
                { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
                { header: 'No kendaraan', key: 'no_kendaraan', width: 20 },
                { header: 'No Uji', key: 'no_uji', width: 20 },
                { header: 'Nama Pemilik', key: 'nama_pemilik', width: 30 },
                { header: 'Alamat Pemilik', key: 'alamat_pemilik', width: 40 },
                { header: 'Jenis Kendaraan', key: 'jenis_kendaraan', width: 30 },
                { header: 'Sumbu', key: 'sumbu', width: 10, alignment: 'center' },
                { header: 'JBI (Kg)', key: 'jbi', width: 10 },
                { header: 'Berat Timbang (Kg)', key: 'berat_timbang', width: 10 },
                { header: 'Berat Lebih (Kg)', key: 'kelebihan_berat', width: 10 },
                { header: 'Persen Lebih (%)', key: 'persen_lebih', width: 10 },
                { header: 'Toleransi (%)', key: 'toleransi', width: 10 },
                { header: 'Asal', key: 'asal_kota', width: 30 },
                { header: 'Tujuan', key: 'tujuan_kota', width: 30 },
                { header: 'Komoditi', key: 'muatan', width: 30 },
                { header: 'Pelanggaran', key: 'pelanggaran', width: 30 },
                { header: 'Shift', key: 'shift', width: 30 },
                { header: 'Regu', key: 'regu', width: 30 },
                { header: 'Operator', key: 'petugas', width: 30 },
            ];
        } else {
            worksheet.columns = [
                { header: 'Waktu', key: 'tgl_penimbangan', width: 20 },
                { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
                { header: 'No kendaraan', key: 'no_kendaraan', width: 20 },
                { header: 'No Uji', key: 'no_uji', width: 20 },
                { header: 'Nama Pemilik', key: 'nama_pemilik', width: 30 },
                { header: 'Alamat Pemilik', key: 'alamat_pemilik', width: 40 },
                { header: 'Jenis Kendaraan', key: 'jenis_kendaraan', width: 30 },
                { header: 'Sumbu', key: 'sumbu', width: 10, alignment: 'center' },
                { header: 'JBI (Kg)', key: 'jbi', width: 10 },
                { header: 'Berat Timbang (Kg)', key: 'berat_timbang', width: 10 },
                { header: 'Berat Lebih (Kg)', key: 'kelebihan_berat', width: 10 },
                { header: 'Persen Lebih (%)', key: 'persen_lebih', width: 10 },
                { header: 'Toleransi (%)', key: 'toleransi', width: 10 },
                { header: 'Asal', key: 'asal_kota', width: 30 },
                { header: 'Tujuan', key: 'tujuan_kota', width: 30 },
                { header: 'Komoditi', key: 'muatan', width: 30 },
                { header: 'Pelanggaran', key: 'pelanggaran', width: 30 },
            ];
        }
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

        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `pelanggaran_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }


    // PENINDAKAN

    const conditionPenindakan = async (req) => {
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const bptd_id = req.query.bptd;
        const petugas_id = req.query.petugas_id;
        const notrx = req.query.notrx;
        const kode_penindakan = req.query.kodepenindakan;
        const kode_uppkb = req.query.kuppkb;
        const no_kendaraan = req.query.nokendaraan;
        const tgl_penindakan = req.query.tglpenindakan;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const tgl_sidang = req.query.tglsidang;
        const lokasi_id = req.query.lokasi;
        const sanksi_id = req.query.sanksi;

        let conditions = [
            sequelize.where(
                sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
            ),
            { is_active: true, is_deleted: false }
        ];
        if (notrx) {
            conditions = {
                kode_trx: notrx,
                is_deleted: false,
                is_active: true
            }
        }

        if (lokasi_id) {
            conditions = {
                lokasi_id: lokasi_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (bptd_id) {
            conditions = {
                bptd_id: bptd_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (kode_uppkb) {
            conditions = {
                kode_uppkb: kode_uppkb,
                is_deleted: false,
                is_active: true
            }
        }

        if (no_kendaraan) {
            conditions = {
                no_kendaraan: no_kendaraan,
                is_deleted: false,
                is_active: true
            }
        }

        if (sanksi_id) {
            conditions = {
                sanksi_id: sanksi_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (kode_penindakan) {
            conditions = {
                kode_penindakan: kode_penindakan,
                is_deleted: false,
                is_active: true
            }
        }

        if (tgl_sidang) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('tgl_sidang')),
                    tgl_sidang
                ),
                {
                    is_deleted: false,
                    is_active: true
                }
            ]
        }

        if (tgl_penindakan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    tgl_penindakan
                ),
                {
                    is_deleted: false,
                    is_active: true
                }
            ]
        }

        if (kode_uppkb && bptd_id) {
            conditions = {
                kode_uppkb: kode_uppkb,
                bptd_id: bptd_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (lokasi_id && bptd_id) {
            conditions = {
                lokasi_id: lokasi_id,
                bptd_id: bptd_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (kode_uppkb && shift_id) {
            conditions = {
                kode_uppkb: kode_uppkb,
                shift_id: shift_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (lokasi_id && shift_id) {
            conditions = {
                lokasi_id: lokasi_id,
                shift_id: shift_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (kode_uppkb && regu_id) {
            conditions = {
                kode_uppkb: kode_uppkb,
                regu_id: regu_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (lokasi_id && regu_id) {
            conditions = {
                lokasi_id: lokasi_id,
                regu_id: regu_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (kode_uppkb && petugas_id) {
            conditions = {
                kode_uppkb: kode_uppkb,
                petugas_id: petugas_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (lokasi_id && petugas_id) {
            conditions = {
                lokasi_id: lokasi_id,
                petugas_id: petugas_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (kode_uppkb && tgl_sidang) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('tgl_sidang')),
                    tgl_sidang
                ),
                { kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
            ]
        }

        if (kode_uppkb && tgl_penindakan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    tgl_penindakan
                ),
                { kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
            ]
        }

        if (kode_uppkb && sanksi_id) {
            conditions = {
                kode_uppkb: kode_uppkb,
                sanksi_id: sanksi_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (lokasi_id && tgl_sidang) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('tgl_sidang')),
                    tgl_sidang
                ),
                { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        if (lokasi_id && tgl_penindakan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    tgl_penindakan
                ),
                { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
            ]
        }

        if (lokasi_id && sanksi_id) {
            conditions = {
                lokasi_id: lokasi_id,
                sanksi_id: sanksi_id,
                is_deleted: false,
                is_active: true
            }
        }

        if (tgl_penindakan && kode_uppkb && sanksi_id) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    moment(tgl_penindakan).format('YYYY-MM-DD')
                ),
                { kode_uppkb: kode_uppkb, sanksi_id: sanksi_id, is_deleted: false, is_active: true }
            ]
        }

        if (tgl_penindakan && kode_uppkb && shift_id && sanksi_id) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    moment(tgl_penindakan).format('YYYY-MM-DD')
                ),
                {
                    kode_uppkb: kode_uppkb,
                    sanksi_id: sanksi_id,
                    shift_id: shift_id,
                    is_deleted: false,
                    is_active: true
                }
            ]
        }

        if (tgl_penindakan && kode_uppkb && regu_id && sanksi_id) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    moment(tgl_penindakan).format('YYYY-MM-DD')
                ),
                {
                    kode_uppkb: kode_uppkb,
                    sanksi_id: sanksi_id,
                    regu_id: regu_id,
                    is_deleted: false,
                    is_active: true
                }
            ]
        }

        if (tgl_penindakan && kode_uppkb && regu_id && shift_id && sanksi_id && bptd_id) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    moment(tgl_penindakan).format('YYYY-MM-DD')
                ),
                {
                    kode_uppkb: kode_uppkb,
                    shift_id: shift_id,
                    sanksi_id: sanksi_id,
                    regu_id: regu_id,
                    bptd_id: bptd_id,
                    is_deleted: false,
                    is_active: true
                }
            ]
        }

        if (tgl_penindakan && lokasi_id && sanksi_id) {
            console.log('TGL PENINDAKAN : ', tgl_penindakan);
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    moment(tgl_penindakan).format('YYYY-MM-DD')
                ),
                { lokasi_id: lokasi_id, sanksi_id: sanksi_id, is_deleted: false, is_active: true }
            ]
        }

        if (tgl_penindakan && lokasi_id && shift_id && sanksi_id) {

            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    moment(tgl_penindakan).format('YYYY-MM-DD')
                ),
                {
                    lokasi_id: lokasi_id,
                    sanksi_id: sanksi_id,
                    shift_id: shift_id,
                    is_deleted: false,
                    is_active: true
                }
            ]
        }

        if (tgl_penindakan && lokasi_id && regu_id && sanksi_id) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    moment(tgl_penindakan).format('YYYY-MM-DD')
                ),
                {
                    lokasi_id: lokasi_id,
                    sanksi_id: sanksi_id,
                    regu_id: regu_id,
                    is_deleted: false,
                    is_active: true
                }
            ]
        }

        if (tgl_penindakan && lokasi_id && regu_id && shift_id && sanksi_id && bptd_id) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    moment(tgl_penindakan).format('YYYY-MM-DD')
                ),
                {
                    lokasi_id: lokasi_id,
                    shift_id: shift_id,
                    sanksi_id: sanksi_id,
                    regu_id: regu_id,
                    bptd_id: bptd_id,
                    is_deleted: false,
                    is_active: true
                }
            ]
        }

        /* ***********************************************TGL AWAL TGL AKHIR***************************************************************** */
        if (tgl_awal && tgl_akhir) {
            if (lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        lokasi_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (lokasi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        lokasi_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (kode_uppkb && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (bptd_id && lokasi_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        bptd_id: bptd_id,
                        lokasi_id: lokasi_id,
                        sanksi_id: sanksi_id,
                        is_deleted: false
                    }
                ]
            }

            if (lokasi_id && regu_id && shift_id && sanksi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        lokasi_id: lokasi_id,
                        shift_id: shift_id,
                        sanksi_id: sanksi_id,
                        bptd_id: bptd_id,
                        regu_id: regu_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (kode_uppkb && regu_id && shift_id && sanksi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        shift_id: shift_id,
                        sanksi_id: sanksi_id,
                        bptd_id: bptd_id,
                        regu_id: regu_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }
        }
        /* **************************************************************************************************************** */
        // console.log(conditions);
        return conditions;
    }

    const datapenindakan = async (conditions) => {
        const options = {
            include: [
                {
                    model: t_regu,
                    required: false,
                    as: 'penindakan_regu',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_shift,
                    required: true,
                    as: 'penindakan_shift',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_petugas,
                    required: false,
                    as: 'penindakan_petugas',
                    attributes: [
                        'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kota_kab,
                    required: false,
                    as: 'penindakanAsalKota',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kota_kab,
                    required: false,
                    as: 'penindakanTujuanKota',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_pengadilan,
                    required: false,
                    as: 'penindakanPengadilan',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat', 'lat_pos', 'lon_pos'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_gol_sim,
                    required: false,
                    as: 'penindakanGolSim',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_sanksi,
                    required: false,
                    as: 'penindakanSanksiMelanggar',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    },
                },
                {
                    model: t_lokasi,
                    required: false,
                    as: 'penindakan_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_bptd,
                    required: false,
                    as: 'penindakan_bptd',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_detailpenindakan_sanksi,
                    required: false,
                    as: 'penindakanDetailSanksi',
                    attributes: [
                        'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sub_sanksi_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_sub_sanksi,
                            required: false,
                            as: 'detailtindakansanksi',
                            attributes: [
                                'id', 'kode', 'nama', 'keterangan'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
                            include: [
                                {
                                    model: t_sanksi,
                                    required: false,
                                    as: 'fksubsanksi',
                                    attributes: [
                                        'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                    ],
                                    where: {
                                        is_deleted: false,
                                        is_active: true
                                    }
                                }
                            ],
                        },
                    ],
                },
                {
                    model: t_detailpenindakan_pasal,
                    required: false,
                    as: 'penindakanDetailPasal',
                    attributes: [
                        'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'pasal_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_pasal,
                            required: false,
                            as: 'fkdetailtindakanpasal',
                            attributes: [
                                'id', 'no_pasal', 'pasal', 'desk_pasal', 'denda_maks', 'keterangan'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
                        }
                    ]
                },
                {
                    model: t_detailpenindakan_sitaan,
                    required: false,
                    as: 'penindakanDetailSitaan',
                    attributes: [
                        'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sitaan_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_sitaan,
                            required: false,
                            as: 'detailtindakansitaan',
                            attributes: [
                                'id', 'sanksi_id', 'dokumen_id', 'keterangan'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
                            include: [
                                // {
                                //     model: t_sanksi,
                                //     required: false,
                                //     as: 'fksitaansanksi',
                                //     attributes: [
                                //         'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                //     ],
                                //     where: {
                                //         is_deleted: false,
                                //         is_active: true
                                //     }
                                // },
                                {
                                    model: t_dokumen,
                                    required: false,
                                    as: 'fksitaandokumen',
                                    where: {
                                        is_deleted: false,
                                        is_active: true
                                    }
                                }
                            ],
                        },
                    ],
                },
                {
                    model: t_pelanggaran,
                    required: false,
                    as: 'penindakanPelanggaran',
                    attributes: [
                        'id', 'kode_trx', 'kode_uppkb', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_jenis_pelanggaran,
                            required: false,
                            as: 'jenisPelanggaran',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            }
                        }
                    ]
                },
            ],
            where: conditions,
            order: [
                ['tgl_penindakan', 'ASC'],
            ],
            logging: false,
        }

        const penindakan = await t_penindakan.findAll(options);
        return penindakan;
    }

    const pengawasanPenindakan = async (req, res, next) => {
        const ispdf = req.query.ispdf;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const kode_uppkb = req.query.kuppkb;
        const tgl_penindakan = req.query.tglpenindakan;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const lokasi_id = req.query.lokasi;
        const sanksi_id = req.query.sanksi;
        const device_id = Number(req.query.device);
        const is_cond = device_id == 1 ? false : true;
        let conditions = await conditionPenindakan(req);

        var data = await datapenindakan(conditions);
        if (data) {
            const jmlData = data.length;

            const shift = (shift_id != undefined) ? await getShift(shift_id) : 'SEMUA';
            const regu = (regu_id != undefined) ? await getRegu(regu_id) : 'SEMUA';
            const sanksi = (sanksi_id != undefined) ? await getSanksi(sanksi_id) : 'SEMUA';

            const resumedata = {
                shift: (shift.nama) ? shift.nama : 'SEMUA',
                regu: (regu.nama) ? regu.nama : 'SEMUA',
                sanksi: (sanksi.nama) ? sanksi.nama : 'SEMUA',
                jmlData: jmlData,
            };

            const tanggal = moment(tgl_penindakan).format('DD-MM-YYYY');
            const tanggal_awal = moment(tgl_awal).format('DD-MM-YYYY');
            const tanggal_akhir = moment(tgl_akhir).format('DD-MM-YYYY');
            const lokasi = lokasi_id ? await getLokasiUppkbById(lokasi_id) : [];

            var params = encrypt(`tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}&device=${device_id}&ispdf=0`);
            if (lokasi_id) {
                params = encrypt(`lokasi=${lokasi_id}&tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}&device=${device_id}&ispdf=0`);
            }

            if (sanksi_id) {
                params = encrypt(`lokasi=${sanksi_id}&tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}&device=${device_id}&ispdf=0`);
            }

            if (lokasi_id && sanksi_id) {
                params = encrypt(`lokasi=${lokasi_id}&sid=${sanksi_id}&tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}&device=${device_id}&ispdf=0`);
            }

            let dataqr = `${process.env.DOMAIN_URL_QR}/rep/penindakan?src=${params}`;
            if (regu_id != undefined) {
                dataqr += `&regu=${regu_id}`;
            }

            if (shift_id != undefined) {
                dataqr += `&shift=${shift_id}`;
            }

            var korsatpel = [];
            if (lokasi_id) {
                korsatpel = await getKorsatpel(lokasi_id);
            }


            let qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();
            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });
            // for (var i=0; i<data.length; i++) {
            //     data[i].penindakanDetailSitaan.forEach(function(val){
            //         console.log(val.detailtindakansitaan.fksitaandokumen.get({plain: true}).nam);
            //     })

            // }
            if (ispdf == 0) {
                res.render("penindakanView.ejs", {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: data,
                    moment: moment,
                    is_cond: is_cond,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    korsatpel: korsatpel,
                    lokasi_id: lokasi_id,
                    device_id: device_id,
                    lokasi: lokasi,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', "penindakanView.ejs"), {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: data,
                    moment: moment,
                    is_cond: is_cond,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    korsatpel: korsatpel,
                    lokasi_id: lokasi_id,
                    device_id: device_id,
                    lokasi: lokasi,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                }, async (err, datapdf) => {
                    if (err) {
                        res.send(err);
                    } else {
                        // let options = {
                        //     "format": "Legal",
                        //     "orientation": "landscape",
                        //     "header": {
                        //         "height": "5mm"
                        //     },
                        //     "footer": {
                        //         "height": "7mm",
                        //     },
                        // };
                        const options = {
                            format: 'Legal',
                            landscape: true,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };

                        var nama_file_uppkb = 'all_uppkb';
                        if (lokasi_id) {
                            nama_file_uppkb = lokasi.kode;
                        }
                        const filename = `data_penindakan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                        const uploadPath = path.join(config.path_report) + '/pdf/' + filename;

                        const reportUrl = config.report_url + 'pdf/' + filename;

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

    const pengawasanXlsPenindakan = async (req, res, next) => {

        let conditions = await conditionPenindakan(req);
        let data = await datapenindakan(conditions);

        let obj = [];
        for (let row of data) {

            let arrayPelanggaran = [];
            row.penindakanPelanggaran.map((val) => {
                arrayPelanggaran.push(val.jenisPelanggaran.nama);
            });

            let arraySanksiTambahan = [];
            row.penindakanDetailSanksi.map((val) => {
                arraySanksiTambahan.push(val.detailtindakansanksi.nama);
            });

            let arraySitaan = [];
            row.penindakanDetailSitaan.map((val) => {
                if (val.detailtindakansitaan && val.detailtindakansitaan.fksitaandokumen) {
                    const namaSitaan = JSON.parse(JSON.stringify(val.detailtindakansitaan.fksitaandokumen)).nam;
                    arraySitaan.push(namaSitaan);
                }
            });

            obj.push({
                kode_uppkb: row.penindakan_uppkb.kode,
                nama_uppkb: row.penindakan_uppkb.nama,
                alamat_uppkb: row.penindakan_uppkb.alamat_uppkb,
                nama_bptd: row.penindakan_bptd.nama,
                tgl_penindakan: moment(row.tgl_penindakan).format('DD-MM-YYYY HH:mm:ss'),
                tanggal: moment(row.tgl_penindakan).format('DD-MM-YYYY'),
                jam: moment(row.tgl_penindakan).format('HH:mm:ss'),
                no_kendaraan: row.no_kendaraan,
                nama_pengemudi: row.nama_pengemudi,
                alamat_pengemudi: row.alamat_pengemudi,
                golongan_sim: row.penindakanGolSim ? row.penindakanGolSim.nama : '-',
                asal_kota: row.penindakanAsalKota.nama,
                tujuan_kota: row.penindakanTujuanKota.nama,
                pelanggaran: arrayPelanggaran.join(', '),
                sanksi: row.penindakanSanksiMelanggar ? row.penindakanSanksiMelanggar.nama : '-',
                sanksi_tambahan: arraySanksiTambahan.join(', '),
                sitaan: arraySitaan.join(', '),
                tgl_sidang: moment(row.tgl_sidang).format('DD-MM-YYYY'),
                jam_sidang: row.jam_sidang,
                pengadilan: row.penindakanPengadilan ? row.penindakanPengadilan.nama : '-',
                ppns: row.nama_ppns,
                no_skep: row.no_skep,
                petugas: row.penindakan_petugas ? row.penindakan_petugas.nama : '',
                shift: row.penindakan_shift ? row.penindakan_shift.nama : '',
                regu: row.penindakan_regu ? row.penindakan_regu.nama : '',
            });
        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('Penindakan', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        //  WorkSheet Header
        worksheet.columns = [
            { header: 'Waktu', key: 'tgl_penindakan', width: 20 },
            { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
            { header: 'No kendaraan', key: 'no_kendaraan', width: 20 },
            { header: 'Nama Pengemudi', key: 'nama_pengemudi', width: 30 },
            { header: 'Alamat Pengemudi', key: 'alamat_pengemudi', width: 40 },
            { header: 'Gol SIM', key: 'golongan_sim', width: 20 },
            { header: 'Asal', key: 'asal_kota', width: 30 },
            { header: 'Tujuan', key: 'tujuan_kota', width: 30 },
            { header: 'Pelanggaran', key: 'pelanggaran', width: 30 },
            { header: 'Sanksi', key: 'sanksi', width: 20 },
            { header: 'Sanksi Tambahan', key: 'sanksi_tambahan', width: 50 },
            { header: 'Sitaan', key: 'sitaan', width: 50 },
            { header: 'Tgl Sidang', key: 'tgl_sidang', width: 20 },
            { header: 'Jam Sidang', key: 'jam_sidang', width: 20 },
            { header: 'Pengadilan', key: 'pengadilan', width: 50 },
            { header: 'PPNS', key: 'ppns', width: 20 },
            { header: 'No SKEP', key: 'no_skep', width: 30 },
            { header: 'Keterangan', key: 'keterangan_tindakan', width: 20 },
        ];

        if (req.query.device == 0) {
            let newColumnShift = worksheet.getColumn(worksheet.columns.length + 1);
            newColumnShift.key = "shift";
            newColumnShift.header = "Shift";
            newColumnShift.width = 20;

            // worksheet.columns.push(newColumnShift);

            let newColumnRegu = worksheet.getColumn(worksheet.columns.length);
            newColumnRegu.key = "regu";
            newColumnRegu.header = "Regu";
            newColumnRegu.width = 20;

            worksheet.columns.push(newColumnShift, newColumnRegu);
            //{ header: 'Regu', key: 'regu', width: 20},
        }

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

        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `penindakan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }

    // TRANSFER MUAT

    const conditionTransferMuat = async (req) => {
        const bptd_id = req.query.bptd;
        const lokasi_id = req.query.lokasi;
        const kode_uppkb = req.query.kuppkb;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const petugas_id = req.query.petugas_id;
        const kode_trx = req.query.kode_trx;
        const kode_penindakan = req.query.kodepenindakan;
        const kode_transfer_muat = req.query.kode_transfer_muat;
        const no_kendaraan = req.query.nokendaraan;
        const tgl_transfer_muat = req.query.tgltransfermuat;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const device_id = req.query.device_id;
        const no_kendaraan_lansiran = req.query.nokendlansir;

        let conditions = { is_deleted: false, is_active: true };

        if (bptd_id) conditions = { ...conditions, bptd_id };
        if (lokasi_id) conditions = { ...conditions, lokasi_id };
        if (kode_uppkb) conditions = { ...conditions, kode_uppkb };
        if (regu_id) conditions = { ...conditions, regu_id };
        if (shift_id) conditions = { ...conditions, shift_id };
        if (petugas_id) conditions = { ...conditions, petugas_id };
        if (no_kendaraan) conditions = { ...conditions, no_kendaraan };
        if (kode_trx) conditions = { ...conditions, kode_trx };
        if (kode_penindakan) conditions = { ...conditions, kode_penindakan };
        if (kode_transfer_muat) conditions = { ...conditions, kode_transfer_muat };
        if (no_kendaraan_lansiran) conditions = { ...conditions, no_kendaraan_lansiran };

        if (tgl_transfer_muat) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                    moment(tgl_transfer_muat).format('YYYY-MM-DD')
                ),
                conditions,
            ];
        }

        if (tgl_awal && tgl_akhir) {
            if (lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        lokasi_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (lokasi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        lokasi_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (kode_uppkb && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (lokasi_id && regu_id && shift_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        lokasi_id: lokasi_id,
                        shift_id: shift_id,
                        regu_id: regu_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (kode_uppkb && regu_id && shift_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        shift_id: shift_id,
                        regu_id: regu_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }
        }

        return conditions;
    }

    const dataTransferMuat = async (conditions) => {
        const options = {
            include: [
                {
                    model: t_regu,
                    required: false,
                    as: 'transfermuat_regu',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_shift,
                    required: true,
                    as: 'transfermuat_shift',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_petugas,
                    required: false,
                    as: 'transfermuat_petugas',
                    attributes: [
                        'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_bptd,
                    required: false,
                    as: 'transfermuat_bptd',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_lokasi,
                    required: false,
                    as: 'transfermuat_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
            ],
            where: conditions,
            logging: false
        }

        const transfermuat = await t_transfermuat.findAll(options);
        return transfermuat;
    }

    const pengawasanTransferMuat = async (req, res, next) => {
        const ispdf = req.query.ispdf;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const kode_uppkb = req.query.kuppkb;
        const tgl_transfer_muat = req.query.tgltransfermuat;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const device_id = Number(req.query.device);

        const lokasi_id = req.query.lokasi;
        const is_cond = device_id == 1 ? false : true;
        let conditions = await conditionTransferMuat(req);
        let data = await dataTransferMuat(conditions);

        if (data) {
            var params = encrypt(`tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}`);
            if (lokasi_id) {
                params = encrypt(`id=${lokasi_id}&tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}`);
            }

            if (kode_uppkb) {
                params = encrypt(`kuppkb=${kode_uppkb}&tgl_awal=${tgl_awal}&tgl_akhir=${tgl_akhir}`);
            }

            let dataqr = `${process.env.DOMAIN_URL_QR}/rep/transfermuat?#${params}`;
            if (regu_id != undefined) {
                dataqr += `&regu=${regu_id}`;
            }

            if (shift_id != undefined) {
                dataqr += `&shift=${shift_id}`;
            }

            let qrCodeDataUrl = await promiseToCreateQRcode(dataqr);


            const jmlMelanggar = data.length;
            const jmlTurunMuatan = data.filter((val) => val.is_turun_muatan === true);
            const jmlLansirMuatan = data.filter((val) => val.is_turun_muatan === false); // Number(jmlMelanggar) - Number(jmlTurunMuatan);

            const shift = (shift_id != undefined) ? await getShift(shift_id) : 'SEMUA';
            const regu = (regu_id != undefined) ? await getRegu(regu_id) : 'SEMUA';

            const resumedata = {
                shift: (shift.nama) ? shift.nama : 'SEMUA',
                regu: (regu.nama) ? regu.nama : 'SEMUA',
                jmlMelanggar: jmlMelanggar,
                jmlTurunMuatan: jmlTurunMuatan.length,
                jmlLansirMuatan: jmlLansirMuatan.length,
            };

            const tanggal = moment(tgl_transfer_muat).format('DD-MM-YYYY');
            const tanggal_awal = moment(tgl_awal).format('DD-MM-YYYY');
            const tanggal_akhir = moment(tgl_akhir).format('DD-MM-YYYY');
            const lokasi = lokasi_id ? await getLokasiUppkbById(lokasi_id) : [];

            var danru = [];
            if (lokasi_id && regu_id) {
                danru = await getDanru(lokasi_id, regu_id);
            }

            var korsatpel = [];
            if (lokasi_id) {
                korsatpel = await getKorsatpel(lokasi_id);
            }
            console.log(lokasi, lokasi_id);
            const header = await reportTemplate();
            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("transferMuatView.ejs", {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: data,
                    moment: moment,
                    is_cond: is_cond,
                    danru: danru,
                    korsatpel: korsatpel,
                    lokasi_id: lokasi_id,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    device_id: device_id,
                    lokasi: lokasi,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', "transferMuatView.ejs"), {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: data,
                    moment: moment,
                    is_cond: is_cond,
                    danru: danru,
                    korsatpel: korsatpel,
                    lokasi_id: lokasi_id,
                    tanggal: tanggal,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    device_id: device_id,
                    lokasi: lokasi,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                }, async (err, datapdf) => {
                    if (err) {
                        res.send(err);
                    } else {
                        // let options = {
                        //     "format": "Legal",
                        //     "orientation": "landscape",
                        //     "header": {
                        //         "height": "5mm"
                        //     },
                        //     "footer": {
                        //         "height": "7mm",
                        //     },
                        // };
                        const options = {
                            format: 'Legal',
                            landscape: true,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };

                        var nama_file_uppkb = 'all_uppkb';
                        if (kode_uppkb) {
                            nama_file_uppkb = kode_uppkb;
                        }
                        const filename = `data_transfer_muat_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}.pdf`;
                        const uploadPath = path.join(config.path_report) + '/pdf/' + filename;

                        const reportUrl = config.report_url + 'pdf/' + filename;

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

    const pengawasanXlsTransferMuat = async (req, res, next) => {

        let conditions = await conditionTransferMuat(req);
        let data = await dataTransferMuat(conditions);

        let obj = [];
        for (let row of data) {
            obj.push({
                kode_uppkb: row.transfermuat_uppkb.kode || '',
                nama_uppkb: row.transfermuat_uppkb.nama || '',
                alamat_uppkb: row.transfermuat_uppkb.alamat_uppkb || '',
                nama_bptd: row.transfermuat_bptd.nama || '',
                tgl_transfer_muat: moment(row.tgl_transfer_muat).format('DD-MM-YYYY HH:mm:ss'),
                tanggal: moment(row.tgl_transfer_muat).format('DD-MM-YYYY'),
                jam: moment(row.tgl_transfer_muat).format('HH:mm:ss'),
                status: row.is_turun_muatan == true ? 'TURUN MUATAN' : 'LANSIR MUATAN',
                no_kendaraan: row.no_kendaraan || '-',
                no_uji: row.no_uji || '-',
                jenis_kendaraan: row.jenis_kendaraan || '-',
                sumbu: row.sumbu || '-',
                jbi_uji: row.jbi_uji || 0,
                berat_timbang: row.berat_timbang || 0,
                berat_lebih: row.berat_lebih || 0,
                persen_lebih: row.persen_lebih || 0,
                berat_timbang_ulang: row.berat_timbang || 0,
                berat_lebih_ulang: row.berat_lebih || 0,
                persen_lebih_ulang: row.persen_lebih || 0,
                no_kendaraan_lansiran: row.no_kendaraan_lansiran || '-',
                no_uji_lansiran: row.no_uji_lansiran || '-',
                jenis_kendaraan_lansiran: row.jenis_kendaraan_lansiran || '-',
                sumbu_lansiran: row.sumbu_lansiran || '-',
                jbi_lansiran: row.jbi_lansiran || 0,
                berat_timbang_lansiran: row.berat_timbang_lansiran || 0,
                berat_lebih_lansiran: row.berat_lebih_lansiran || 0,
                persen_lebih_lansiran: row.persen_lebih_lansiran || 0,
                petugas: row.transfermuat_petugas.nama || '-',
                shift: row.transfermuat_shift ? row.transfermuat_shift.nama : '-',
                regu: row.transfermuat_regu ? row.transfermuat_regu.nama : '-',
            });
        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('TransferMuat', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        //  WorkSheet Header
        // if (req.query.device != 1) {
        //     worksheet.columns = [
        //         { header: 'Status', key: 'status', width: 30 },
        //         { header: 'Waktu', key: 'tgl_transfer_muat', width: 30 },
        //         { header: 'No kendaraan', key: 'no_kendaraan', width: 30},
        //         { header: 'No Uji', key: 'no_uji', width: 20},
        //         { header: 'Jenis Kendaraan', key: 'jenis_kendaraan', width: 20},
        //         { header: 'Sumbu', key: 'sumbu', width: 20},
        //         { header: 'JBI', key: 'jbi_uji', width: 20},
        //         { header: 'Hasil Timbangan', key: 'berat_timbang', width: 40},
        //         { header: 'Berat Lebih', key: 'berat_lebih', width: 40},
        //         { header: '%', key: 'persen_lebih', width: 20},
        //         { header: 'Hasil Timbang Ulang', key: 'berat_timbang_ulang', width: 40},
        //         { header: 'Berat Lebih Ulang', key: 'berat_lebih_ulang', width: 40},
        //         { header: '%', key: 'persen_lebih_ulang', width: 20},
        //         { header: 'No kendaraan', key: 'no_kendaraan_lansiran', width: 30},
        //         { header: 'No Uji', key: 'no_uji_lansiran', width: 20},
        //         { header: 'Jenis Kendaraan', key: 'jenis_kendaraan_lansiran', width: 20},
        //         { header: 'Sumbu', key: 'sumbu_lansiran', width: 20},
        //         { header: 'JBI', key: 'jbi_lansiran', width: 20},
        //         { header: 'Hasil Timbangan', key: 'berat_timbang_lansiran', width: 40},
        //         { header: 'Berat Lebih', key: 'berat_lebih_lansiran', width: 40},
        //         { header: '%', key: 'persen_lebih_lansiran', width: 20},
        //         { header: 'Shift', key: 'shift', width: 20},
        //         { header: 'Regu', key: 'regu', width: 20},
        //     ];
        // } else {
        worksheet.columns = [
            { header: 'Status', key: 'status', width: 30 },
            { header: 'Waktu', key: 'tgl_transfer_muat', width: 30 },
            { header: 'UPPKB', key: 'nama_uppkb', width: 30 },
            { header: 'No kendaraan', key: 'no_kendaraan', width: 30 },
            { header: 'No Uji', key: 'no_uji', width: 20 },
            { header: 'Jenis Kendaraan', key: 'jenis_kendaraan', width: 20 },
            { header: 'Sumbu', key: 'sumbu', width: 20 },
            { header: 'JBI', key: 'jbi_uji', width: 20 },
            { header: 'Hasil Timbangan', key: 'berat_timbang', width: 40 },
            { header: 'Berat Lebih', key: 'berat_lebih', width: 40 },
            { header: '% Labih', key: 'persen_lebih', width: 20 },
            { header: 'Hasil Timbang Ulang', key: 'berat_timbang_ulang', width: 40 },
            { header: 'Berat Lebih Ulang', key: 'berat_lebih_ulang', width: 40 },
            { header: '% Labih Ulang', key: 'persen_lebih_ulang', width: 20 },
            { header: 'No kendaraan Lansir', key: 'no_kendaraan_lansiran', width: 30 },
            { header: 'No Uji Lansir', key: 'no_uji_lansiran', width: 20 },
            { header: 'Jenis Kendaraan Lansir', key: 'jenis_kendaraan_lansiran', width: 20 },
            { header: 'Sumbu Lansir', key: 'sumbu_lansiran', width: 20 },
            { header: 'JBI Lansir', key: 'jbi_lansiran', width: 20 },
            { header: 'Hasil Timbangan Lansir', key: 'berat_timbang_lansiran', width: 40 },
            { header: 'Berat Lebih Lansir', key: 'berat_lebih_lansiran', width: 40 },
            { header: '% Lebih Lansir', key: 'persen_lebih_lansiran', width: 20 },
        ];
        //}

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

        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `transfer_muat_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }

    // DETAIL DIMENSI / PENGUKURAN DIMENSI

    const conditionPengukuranDimensi = async (req) => {
        const id = req.query.id;
        const bptd_id = req.query.bptd;
        const lokasi_id = req.query.lokasi;
        const kode_uppkb = req.query.kuppkb;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const petugas_id = req.query.petugas_id;
        const kode_trx = req.query.trx;
        const tgl_pengukuran = req.query.tglukur;
        const tgl_awal = req.query.tgl_awal;
        const tgl_akhir = req.query.tgl_akhir;
        const device_id = req.query.device_id;

        let conditions = { is_deleted: false, is_active: true };

        if (id) conditions = { ...conditions, id };
        if (bptd_id) conditions = { ...conditions, bptd_id };
        if (lokasi_id) conditions = { ...conditions, lokasi_id };
        if (kode_uppkb) conditions = { ...conditions, kode_uppkb };
        if (regu_id) conditions = { ...conditions, regu_id };
        if (shift_id) conditions = { ...conditions, shift_id };
        if (petugas_id) conditions = { ...conditions, petugas_id };
        if (kode_trx) conditions = { ...conditions, kode_trx };

        if (tgl_pengukuran) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                    moment(tgl_pengukuran).format('YYYY-MM-DD')
                ),
                conditions,
            ];
        }

        if (tgl_awal && tgl_akhir) {
            if (lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        lokasi_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (kode_uppkb) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (lokasi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        lokasi_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (kode_uppkb && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                        { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                    // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }
        }

        return conditions;
    }

    const dataPengukuranDimensi = async (conditions) => {
        const options = {
            include: [
                {
                    model: t_lokasi,
                    required: false,
                    as: 'detaildimensi_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    },
                },
                {
                    model: t_kendaraan,
                    required: false,
                    as: 'detaildimensi_kendaraan',
                    where: {
                        is_deleted: false,
                        is_active: true
                    },
                },
            ],
            where: conditions,
            logging: false
        };

        const detaildimensi = await t_detaildimensi.findAll(options);
        return detaildimensi;
    }

    const pengawasanPengukuranDimensi = async (req, res, next) => {
        const ispdf = req.query.ispdf;
        const lokasi_id = req.query.lokasi;
        let conditions = await conditionPengukuranDimensi(req);
        let data = await dataPengukuranDimensi(conditions);
        if (data) {
            const detailData = data[0] || {};

            const kodeUppkb = detailData.detaildimensi_uppkb ? detailData.detaildimensi_uppkb.kode : '';
            var nama_uppkb = detailData.detaildimensi_uppkb ? await getLokasiUppkbNama(detailData.detaildimensi_uppkb.kode) : '-';
            const header = await reportTemplate();
            let path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            var jarak_sb_s1_s2_kelebihan = Math.ceil(detailData.jarak_sb_s1_s2_fisik - detailData.jarak_sb_s1_s2_uji);
            var jarak_sb_s2_s3_kelebihan = Math.ceil(detailData.jarak_sb_s2_s3_fisik - detailData.jarak_sb_s2_s3_uji);
            var jarak_sb_s3_s4_kelebihan = Math.ceil(detailData.jarak_sb_s3_s4_fisik - detailData.jarak_sb_s3_s4_uji);

            var lebar_total_kelebihan = Math.ceil(detailData.lebar_total_fisik - detailData.lebar_total_uji);
            var panjang_total_kelebihan = Math.ceil(detailData.panjang_total_fisik - detailData.panjang_total_uji);
            var tinggi_total_kelebihan = Math.ceil(detailData.tinggi_total_fisik - detailData.tinggi_total_uji);
            var roh_kelebihan = Math.ceil(detailData.roh_fisik - detailData.roh_uji);
            var foh_kelebihan = Math.ceil(detailData.foh_fisik - detailData.foh_uji);
            var bbt_panjang_kelebihan = Math.ceil(detailData.bbt_panjang_fisik - detailData.bbt_panjang_uji);
            var bbt_lebar_kelebihan = Math.ceil(detailData.bbt_lebar_fisik - detailData.bbt_lebar_uji);
            var bbt_tinggi_kelebihan = Math.ceil(detailData.bbt_tinggi_fisik - detailData.bbt_tinggi_uji);
            var ban_sb1_kelebihan = Math.ceil(detailData.ban_sb1_fisik - detailData.ban_sb1_uji);
            var ban_sb2_kelebihan = Math.ceil(detailData.ban_sb2_fisik - detailData.ban_sb2_uji);
            var ban_sb3_kelebihan = Math.ceil(detailData.ban_sb3_fisik - detailData.ban_sb3_uji);

            var dataKelebihan = {
                jarak_sb_s1_s2_kelebihan: jarak_sb_s1_s2_kelebihan > 0 ? jarak_sb_s1_s2_kelebihan : 0,
                jarak_sb_s2_s3_kelebihan: jarak_sb_s2_s3_kelebihan > 0 ? jarak_sb_s2_s3_kelebihan : 0,
                jarak_sb_s3_s4_kelebihan: jarak_sb_s3_s4_kelebihan > 0 ? jarak_sb_s3_s4_kelebihan : 0,
                lebar_total_kelebihan: lebar_total_kelebihan > 0 ? lebar_total_kelebihan : 0,
                panjang_total_kelebihan: panjang_total_kelebihan > 0 ? panjang_total_kelebihan : 0,
                tinggi_total_kelebihan: tinggi_total_kelebihan > 0 ? tinggi_total_kelebihan : 0,
                roh_kelebihan: roh_kelebihan > 0 ? roh_kelebihan : 0,
                foh_kelebihan: foh_kelebihan > 0 ? foh_kelebihan : 0,
                bbt_panjang_kelebihan: bbt_panjang_kelebihan > 0 ? bbt_panjang_kelebihan : 0,
                bbt_lebar_kelebihan: bbt_lebar_kelebihan > 0 ? bbt_lebar_kelebihan : 0,
                bbt_tinggi_kelebihan: bbt_tinggi_kelebihan > 0 ? bbt_tinggi_kelebihan : 0,
                ban_sb1_kelebihan: ban_sb1_kelebihan > 0 ? ban_sb1_kelebihan : 0,
                ban_sb2_kelebihan: ban_sb2_kelebihan > 0 ? ban_sb2_kelebihan : 0,
                ban_sb3_kelebihan: ban_sb3_kelebihan > 0 ? ban_sb3_kelebihan : 0,
            }

            if (ispdf == 0) {
                res.render("pengukuranDimensiView.ejs", {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: detailData,
                    nama_uppkb: nama_uppkb,
                    dataKelebihan: dataKelebihan,
                    moment: moment,
                    logo: 'data:image/png;base64,' + contents
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', "pengukuranDimensiView.ejs"), {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: detailData,
                    nama_uppkb: nama_uppkb,
                    dataKelebihan: dataKelebihan,
                    moment: moment,
                    logo: 'data:image/png;base64,' + contents
                }, async (err, datapdf) => {
                    if (err) {
                        res.send(err);
                    } else {
                        // let options = {
                        //     "format": "Legal",
                        //     "orientation": "potrait",
                        //     "header": {
                        //         "height": "5mm"
                        //     },
                        //     "footer": {
                        //         "height": "7mm",
                        //     },
                        // };
                        const options = {
                            format: 'Legal',
                            landscape: false,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };

                        var nama_file_uppkb = 'all_uppkb';
                        if (kodeUppkb) {
                            nama_file_uppkb = kodeUppkb;
                        }
                        const filename = `data_pengukuran_dimensi_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                        const uploadPath = path.join(config.path_report) + '/pdf/' + filename;

                        const reportUrl = config.report_url + 'pdf/' + filename;

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


    // DETAIL RAMCEK

    const conditionRamcek = async (req) => {
        const id = req.query.id;
        const bptd_id = req.query.bptd;
        const lokasi_id = req.query.lokasi;
        const kode_uppkb = req.query.kuppkb;
        const regu_id = req.query.regu;
        const shift_id = req.query.shift;
        const petugas_id = req.query.petugas_id;
        const kode_trx = req.query.trx;
        const tgl_pemeriksaan = req.query.tglperiksa;

        let conditions = { is_deleted: false };

        if (id) conditions = { ...conditions, id };
        if (bptd_id) conditions = { ...conditions, bptd_id };
        if (lokasi_id) conditions = { ...conditions, lokasi_id };
        if (kode_uppkb) conditions = { ...conditions, kode_uppkb };
        if (regu_id) conditions = { ...conditions, regu_id };
        if (shift_id) conditions = { ...conditions, shift_id };
        if (petugas_id) conditions = { ...conditions, petugas_id };
        if (kode_trx) conditions = { ...conditions, kode_trx };

        if (tgl_pemeriksaan) {
            conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_detailramcek.tgl_pemeriksaan')),
                    moment(tgl_pemeriksaan).format('YYYY-MM-DD')
                ),
                conditions,
            ];
        }

        return conditions;
    }

    const dataRamcek = async (conditions) => {
        const options = {
            include: [
                {
                    model: t_lokasi,
                    required: false,
                    as: 'detailramcek_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    },
                },
                {
                    model: t_kendaraan,
                    required: false,
                    as: 'detailramcek_kendaraan',
                    where: {
                        is_deleted: false,
                        is_active: true
                    },
                },
            ],
            where: conditions,
            logging: false
        };

        const detailramcek = await t_detailramcek.findAll(options);

        return detailramcek;
    }

    const pengawasanRamcek = async (req, res, next) => {
        const ispdf = req.query.ispdf;

        let conditions = await conditionRamcek(req);

        let data = await dataRamcek(conditions);

        const detailData = data[0] || {};
        const kodeUppkb = detailData.detailramcek_uppkb.kode;

        let checked_path = path.join(__dirname, '../views/images/', "checkbox_checked.png");
        let unchecked_path = path.join(__dirname, '../views/images/', "checkbox_unchecked.png");

        const header = await reportTemplate();
        let path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });

        const checked = fs.readFileSync(checked_path, { encoding: 'base64' });
        const unchecked = fs.readFileSync(unchecked_path, { encoding: 'base64' });

        const img_checked = `<img src="data:image/png;base64,${checked}" width="16" height="16" />`;
        const img_unchecked = `<img src="data:image/png;base64,${unchecked}" width="16" height="16" />`;

        if (ispdf == 0) {
            res.render("ramcekView.ejs", {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: detailData,
                moment: moment,
                checked: 'data:image/png;base64,' + checked, unchecked: 'data:image/png;base64,' + unchecked,
                img_checked: img_checked,
                img_unchecked: img_unchecked,
                logo: 'data:image/png;base64,' + contents
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "ramcekView.ejs"), {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: detailData,
                moment: moment,
                checked: 'data:image/png;base64,' + checked,
                unchecked: 'data:image/png;base64,' + unchecked,
                img_checked: img_checked,
                img_unchecked: img_unchecked,
                logo: 'data:image/png;base64,' + contents
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    // let options = {
                    //     "format": "A4",
                    //     "orientation": "potrait",
                    //     "header": {
                    //         "height": "4mm"
                    //     },
                    //     "footer": {
                    //         "height": "4mm",
                    //     },
                    // };
                    const options = {
                        format: 'A4',
                        landscape: false,
                        printBackground: true,
                        margin: { top: '4mm', bottom: '4mm' }
                    };

                    var nama_file_uppkb = 'all_uppkb';
                    if (kodeUppkb) {
                        nama_file_uppkb = kodeUppkb;
                    }
                    const filename = `data_ramcek_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                    const uploadPath = path.join(config.path_report) + '/pdf/' + filename;

                    const reportUrl = config.report_url + 'pdf/' + filename;

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


    return {
        printPenimbangan,
        printPenimbanganKios,
        pengawasanPenimbangan,
        pengawasanPelanggaran,
        pengawasanPenindakan,
        pengawasanTransferMuat,
        pengawasanXlsPenimbangan,
        pengawasanXlsPelanggaran,
        pengawasanXlsPenindakan,
        pengawasanXlsTransferMuat,
        pengawasanPengukuranDimensi,
        pengawasanRamcek,
    };
}
module.exports = PengawasanController;