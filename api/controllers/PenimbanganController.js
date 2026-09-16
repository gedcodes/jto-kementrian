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
    getIsNoKendaraanWim,
    getIsNoKendaraanStatus,
    getIsExistsKodeTrxKendaraan,
    upsert_kendaraan, ltrim, rtrim,
    cekExistsVerifikasi
} = require('./lib/penimbangan');
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
    getBptdId,
    getKepemilikanVal,
    getHistori,
    getKomoditiByTrx,
    getKotaById,
    getOptionResponKomoditi,
    getNoRuas
} = require('./lib/dataid');

const {
    loginUser,
    syncToPostServer,
    syncToPostServerWithImage,
    updateStatusSyncToPusat
} = require('./lib/sinkronisasi');

const { syncToPostPanBali } = require('./lib/integrasipanbali');

const { downloadImageToUrl } = require('./lib/cctvcapture');
const { getPrinterConfig, buildStrukText, printStruk } = require('./lib/thermalprinter');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const uploadFile = require('../middleware/upload');
const config = require('../../config/config');
const { padLeft, kelebihanBerat, prosenKelebihanBerat } = require('../lib/utilities')
const fs = require('fs');
const moment = require('moment');
const path = require("path");
var url = require('url');
const axios = require('axios');
const AxiosDigestAuth = require('@mhoc/axios-digest-auth').default;
var tcp = require('../tcpclient');

// Saklar sinkronisasi realtime penimbangan ke server pusat saat create/update.
// Bernilai false = data hanya disimpan lokal (sync_to_pusat tetap false, sehingga
// masih bisa disusulkan lewat cron syncpenimbangan atau endpoint /penimbangan/sink).
// Variabel tidak diset dianggap aktif, agar deployment lama tidak berhenti sinkron.
const isSyncFromPenimbangan = () => String(process.env.IS_SYNC_FROM_PENIMBANGAN ?? '').trim().toLowerCase() !== 'false';

const PenimbanganController = () => {

    const timer = ms => new Promise(res => setTimeout(res, ms))

    const countAll = async () => {
        return t_penimbangan.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findLiveCount = async (req, res, next) => {
        var kode_uppkb = req.query.kuppkb;

        var sql = `SELECT (SELECT count(*) FROM jt_penimbangan WHERE is_transaksi = 1 AND DATE(tgl_penimbangan) = DATE(NOW())) as jml_penimbangan, (SELECT count(*) FROM jt_penimbangan WHERE is_transaksi = 1 AND is_melanggar = false AND DATE(tgl_penimbangan) = DATE(NOW())) as jml_tidak_melanggar, (SELECT count(*) FROM jt_penimbangan WHERE is_transaksi = 1 AND is_melanggar = true AND DATE(tgl_penimbangan) = DATE(NOW())) as jml_melanggar`;
        if (kode_uppkb) {
            sql = `SELECT (SELECT count(*) FROM jt_penimbangan WHERE kode_uppkb = '${kode_uppkb}' AND is_transaksi = 1 AND DATE(tgl_penimbangan) = DATE(NOW())) as jml_penimbangan, (SELECT count(*) FROM jt_penimbangan WHERE  kode_uppkb = '${kode_uppkb}' AND is_transaksi = 1 AND is_melanggar = false AND DATE(tgl_penimbangan) = DATE(NOW())) as jml_tidak_melanggar, (SELECT count(*) FROM jt_penimbangan WHERE  kode_uppkb = '${kode_uppkb}' AND is_transaksi = 1 AND is_melanggar = true AND DATE(tgl_penimbangan) = DATE(NOW())) as jml_melanggar`;
        }

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            res.json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } else {
            res.json({
                success: false,
                message: 'Query Error'
            });
        }
    }

    const conditions = async (req) => {

    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const id = req.query.id;
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
            const petugas_id = req.query.petugas_id;
            const is_transaksi = req.query.istrx;
            const is_wim_trx = req.query.wim;
            const is_tindakan = req.query.istindakan;
            const tgl_antrian = req.query.tglantri;
            const is_transfer = req.query.istransfer;
            const status_transfer = req.query.status_transfer;
            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                    { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                ),
                { is_deleted: false }
            ];
            const count = await countAll();
            // if (name) {
            //     conditions['no_kendaraan'] = { [Op.iLike]: `%${name}%` }
            // }

            if (id) {
                conditions = {
                    id: sequelize.col('t_penimbangan.id'),
                    is_active: true,
                    is_deleted: false
                }
            }

            if (lokasi_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_trx) {
                conditions = {
                    kode_trx: kode_trx,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (no_uji) {
                conditions = {
                    no_uji: no_uji,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (no_kendaraan) {
                conditions = {
                    no_kendaraan: no_kendaraan,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (shift_id) {
                conditions = {
                    shift_id: shift_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (regu_id) {
                conditions = {
                    regu_id: regu_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (is_melanggar) {
                conditions = {
                    is_melanggar: is_melanggar,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (is_tindakan) {
                conditions = {
                    is_tindakan: is_tindakan,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (tgl_penimbangan) {
                conditions = {
                    tgl_penimbangan: moment(tgl_penimbangan).format('YYYY-MM-DD'),
                    is_active: true,
                    is_deleted: false
                }
            }

            if (is_transaksi) {
                conditions = {
                    is_transaksi: is_transaksi,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (is_transfer) {
                conditions = {
                    is_transfer: is_transfer,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (status_transfer) {
                conditions = {
                    status_transfer: status_transfer,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (is_transaksi && lokasi_id) {
                conditions = {
                    is_transaksi: is_transaksi,
                    lokasi_id: lokasi_id,
                    is_deleted: false
                }
            }

            if (is_transaksi && bptd_id) {
                conditions = {
                    is_transaksi: is_transaksi,
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }

            if (is_transaksi && regu_id) {
                conditions = {
                    regu_id: regu_id,
                    is_transaksi: is_transaksi,
                    is_deleted: false
                }
            }

            if (is_transaksi && shift_id) {
                conditions = {
                    shift_id: shift_id,
                    is_transaksi: is_transaksi,
                    is_deleted: false
                }
            }

            if (is_transaksi && kode_trx) {
                conditions = {
                    kode_trx: kode_trx,
                    is_transaksi: is_transaksi,
                    is_deleted: false
                }
            }

            if (is_transaksi && no_kendaraan) {
                conditions = {
                    no_kendaraan: no_kendaraan,
                    is_transaksi: is_transaksi,
                    is_deleted: false
                }
            }

            /*************************************** TGL ANTRIAN ********************************* */

            if (tgl_antrian) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    { is_active: true, is_deleted: false }
                ]
            }

            if (is_transaksi && tgl_antrian) {
                if (lokasi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                            moment(tgl_antrian).format('YYYY-MM-DD')
                        ),
                        { is_transaksi: is_transaksi, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                    ]
                }

                if (kode_uppkb) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                            moment(tgl_antrian).format('YYYY-MM-DD')
                        ),
                        { is_transaksi: is_transaksi, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
                    ]
                }

                if (no_kendaraan) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                            moment(tgl_antrian).format('YYYY-MM-DD')
                        ),
                        { is_transaksi: is_transaksi, no_kendaraan: no_kendaraan, is_deleted: false }
                    ]
                }

                if (kode_uppkb && no_kendaraan) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                            moment(tgl_antrian).format('YYYY-MM-DD')
                        ),
                        { is_transaksi: is_transaksi, kode_uppkb: kode_uppkb, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
                    ]
                }

                if (lokasi_id && no_kendaraan) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                            moment(tgl_antrian).format('YYYY-MM-DD')
                        ),
                        { is_transaksi: is_transaksi, lokasi_id: lokasi_id, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
                    ]
                }
            }
            /*************************************** END TGL ANTRIAN ********************************* */

            if (is_transaksi && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, is_deleted: false }
                ]
            }

            if (tgl_penimbangan && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { no_kendaraan: no_kendaraan, is_deleted: false }
                ]
            }

            if (tgl_penimbangan && no_uji) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { no_uji: no_uji, is_deleted: false }
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

            if (is_transaksi && bptd_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: is_transaksi,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

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

            if (is_transaksi && tgl_penimbangan && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, no_kendaraan: no_kendaraan, is_deleted: false }
                ]
            }

            if (is_transaksi && is_melanggar && kode_trx) {
                conditions = {
                    is_transaksi: is_transaksi,
                    is_melanggar: is_melanggar,
                    kode_trx: kode_trx,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (is_transaksi && is_melanggar && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: is_melanggar,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (is_transaksi && kode_uppkb && is_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    kode_uppkb: kode_uppkb,
                    is_transfer: is_transfer,
                    is_deleted: false
                }
            }

            if (is_transaksi && lokasi_id && is_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    lokasi_id: lokasi_id,
                    is_transfer: is_transfer,
                    is_deleted: false
                }
            }

            /* ***********************************************BEGIN MELANGGAR TGL AWAL TGL AKHIR***************************************************************** */
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
            /* ****************************************************END MELANGGAR TGL AWAL TGL AKHIR************************************************************ */

            if (is_transaksi && is_wim_trx && tgl_penimbangan && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: {
                            [Op.or]: [is_transaksi, is_wim_trx],
                        },
                        no_kendaraan: no_kendaraan,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (is_transaksi && kode_uppkb && is_transfer && status_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    kode_uppkb: kode_uppkb,
                    is_transfer: is_transfer,
                    status_transfer: status_transfer,
                    is_deleted: false
                }
            }

            if (is_transaksi && lokasi_id && is_transfer && status_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    lokasi_id: lokasi_id,
                    is_transfer: is_transfer,
                    status_transfer: status_transfer,
                    is_deleted: false
                }
            }



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

            if (is_transaksi && is_melanggar && bptd_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: is_melanggar,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (is_transaksi && is_melanggar && lokasi_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: is_melanggar,
                        lokasi_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
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


            if (is_transaksi && lokasi_id && is_tindakan && is_transfer && status_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    lokasi_id: lokasi_id,
                    is_tindakan: is_tindakan,
                    is_transfer: is_transfer,
                    status_transfer: status_transfer,
                    is_deleted: false
                }
            }

            if (is_transaksi && kode_uppkb && is_tindakan && is_transfer && status_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    kode_uppkb: kode_uppkb,
                    is_tindakan: is_tindakan,
                    is_transfer: is_transfer,
                    status_transfer: status_transfer,
                    is_deleted: false
                }
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

            if (is_transaksi && is_melanggar && shift_id && lokasi_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, is_melanggar: is_melanggar, shift_id: shift_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && is_melanggar && regu_id && lokasi_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, is_melanggar: is_melanggar, regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }


            if (is_transaksi && is_melanggar && bptd_id && lokasi_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, is_melanggar: is_melanggar, bptd_id: bptd_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
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

            if (is_transaksi && is_melanggar && shift_id && regu_id && lokasi_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, is_melanggar: is_melanggar, shift_id: shift_id, regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && is_melanggar && shift_id && regu_id && lokasi_id && bptd_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, is_melanggar: is_melanggar, shift_id: shift_id, regu_id: regu_id, lokasi_id: lokasi_id, bptd_id: bptd_id, is_deleted: false, is_active: true }
                ]
            }

            if (name) {
                conditions.push({
                    no_kendaraan: {
                        [Op.iLike]: `%${name}%`
                    }
                });
            }

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
                            'id', 'kode', 'nama', 'alamat_uppkb', 'lat_pos', 'lon_pos'
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
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_penimbangan.paginate(options)

            res.json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }
            });

        } catch (error) {
            next(error)
        }
    }

    const findPagination = async (req, res, next) => {
        console.log("--------------------::Processing Find All Paginate::--------------------");
        try {
            const name = req.query.search;
            const id = req.query.id;
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
            const petugas_id = req.query.petugas_id;
            const is_transaksi = req.query.istrx;
            const is_tindakan = req.query.istindakan;
            const tgl_antrian = req.query.tglantri;
            const is_transfer = req.query.istransfer;
            const status_transfer = req.query.status_transfer;

            // const count = await countAll();

            // const orConditions = [];

            // if (name !== '') {
            //     orConditions.push({
            //         no_kendaraan: { [Op.iLike]: `%${name}%` },
            //     });
            // }

            let conditions = {
                is_active: true,
                is_deleted: false,
            };

            if (tgl_awal && tgl_akhir) {
                conditions['tgl_penimbangan'] = {
                    [Op.between]: [moment(tgl_awal).startOf('day').format(), moment(tgl_akhir).endOf('day').format()],
                };
            }

            if (id) {
                conditions.id = id;
            }

            if (lokasi_id) {
                conditions.lokasi_id = lokasi_id;
            }

            if (kode_uppkb) {
                conditions.kode_uppkb = kode_uppkb;
            }

            if (bptd_id) {
                conditions.bptd_id = bptd_id;
            }

            if (no_uji) {
                conditions.no_uji = no_uji;
            }

            if (no_kendaraan) {
                conditions.no_kendaraan = no_kendaraan;
            }

            if (shift_id) {
                conditions.shift_id = shift_id;
            }

            if (regu_id) {
                conditions.regu_id = regu_id;
            }

            if (is_melanggar) {
                conditions.is_melanggar = is_melanggar;
            }

            if (is_tindakan) {
                conditions.is_tindakan = is_tindakan;
            }

            if (tgl_penimbangan) {
                conditions = {
                    ...conditions,  // Menyalin semua kondisi yang sudah ada
                    tgl_penimbangan: sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    )
                };
            }

            if (is_transaksi) {
                conditions.is_transaksi = is_transaksi;
            }

            if (is_transfer) {
                conditions.is_transfer = is_transfer;
            }

            if (status_transfer) {
                conditions.status_transfer = status_transfer;
            }

            // if (orConditions.length > 0) {
            //     conditions[Op.or] = orConditions;
            // }

            if (name) {
                conditions.no_kendaraan = {
                    [Op.iLike]: `%${name}%`,
                };
            }
            // console.log(nama);
            // console.log(conditions);

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
                                // include: [
                                //     {
                                //         model: t_kategori_komoditi,
                                //         required: false,
                                //         as: 'katkomoditi',
                                //         attributes: [
                                //             'id', 'kode', 'nama'
                                //         ],
                                //         where: {
                                //             is_deleted: false,
                                //             is_active: true
                                //         }
                                //     }
                                // ],
                            }
                        ]
                    },
                    // {
                    //     model: t_detaildokumen,
                    //     required: false,
                    //     as: 'penimbanganDetailDokumen',
                    //     attributes: [
                    //         'id', 'kode_trx', 'kode_uppkb', 'dokumen_id'
                    //     ],
                    //     where: {
                    //         is_deleted: false
                    //     },
                    //     include: [
                    //         {
                    //             model: t_dokumen,
                    //             required: false,
                    //             as: 'detaildokumen',
                    //             attributes: [
                    //                 'id', 'kode', 'nama'
                    //             ],
                    //             where: {
                    //                 is_deleted: false
                    //             },
                    //         }
                    //     ]
                    // },
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
                    // {
                    //     model: t_kendaraan,
                    //     required: false,
                    //     as: 'penimbangan_kendaraan',
                    //     attributes: [
                    //         'no_uji', 'masa_berlaku_uji', 'konfigurasi_sumbu', 'jbi', 'foto_depan_url', 'foto_belakang_url', 'foto_kanan_url', 'foto_kiri_url'
                    //     ],
                    //     where: {
                    //         is_deleted: false
                    //     },
                    // },
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
                            'id', 'kode', 'nama', 'alamat_uppkb', 'lat_pos', 'lon_pos'
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
                    // {
                    //     model: t_komoditi,
                    //     required: false,
                    //     as: 'penimbanganKomoditi',
                    //     attributes: [
                    //         'id', 'kode', 'nama'
                    //     ],
                    //     where: {
                    //         is_deleted: false,
                    //         is_active: true
                    //     }
                    // },
                    // {
                    //     model: t_kategori_komoditi,
                    //     required: false,
                    //     as: 'penimbanganKatKomoditi',
                    //     attributes: [
                    //         'id', 'kode', 'nama'
                    //     ],
                    //     where: {
                    //         is_deleted: false,
                    //         is_active: true
                    //     }
                    // },
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
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || (await countAll()),
                order: [
                    [req.query.orderBy || 'created_at', req.query.sortedBy || 'DESC'],
                ],
                where: conditions,
                logging: false,
            };

            const { docs, pages, total } = await t_penimbangan.paginate(options);

            let melanggarConditions = {
                ...conditions,
                is_melanggar: true,
            };

            if (is_melanggar) {
                melanggarConditions = {
                    ...conditions,
                    is_tindakan: true,
                };
            }

            const dataMelanggar = await getDataMelanggar(melanggarConditions);

            res.json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total,
                    dataMelanggar: dataMelanggar,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    const getDataMelanggar = async (conditions) => {
        return t_penimbangan.count({
            where: conditions,
            logging: false,
        });
    };

    const findOne = async (req, res, next) => {
        console.log("--------------------::Processing Find One::--------------------");
        try {
            const id = req.params.id;
            t_penimbangan.findByPk(id, {
                include: [
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
                        required: true,
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
                    },
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
                ],
                where: { is_deleted: false },
                logging: false
            }).then(data => {
                res.json({
                    success: true,
                    message: `${messageService().GET_SUCCESS}`,
                    data: data
                });
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: `${messageService().GET_FAILED}`
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            const name = req.query.search;
            const id = req.query.id;
            const device_id = req.query.dev;
            const timbangan_id = req.query.timbangan_id;
            const is_wim_trx = req.query.wim;
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
            const tgl_antrian = req.query.tglantri;
            const is_transfer = req.query.istransfer;
            const status_transfer = req.query.status_transfer;

            let conditions = { is_deleted: false, is_active: true }
            const count = await countAll();
            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }

            if (id) {
                conditions = {
                    id: `${id}`,
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

            if (is_transfer) {
                conditions = {
                    is_transfer: is_transfer,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (status_transfer) {
                conditions = {
                    status_transfer: status_transfer,
                    is_deleted: false
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
                    is_deleted: false,
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

            if (tgl_antrian && is_transaksi) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, is_deleted: false, is_active: true }
                ]
            }

            if (tgl_penimbangan && is_transaksi) {
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

            if (is_transaksi && bptd_id && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: is_transaksi,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (is_transaksi && lokasi_id && tgl_antrian) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && kode_uppkb && tgl_antrian) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
                ]
            }

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

            if (is_transaksi && tgl_antrian && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && tgl_penimbangan && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && is_melanggar && kode_trx) {
                conditions = {
                    is_transaksi: is_transaksi,
                    is_melanggar: is_melanggar,
                    kode_trx: kode_trx,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (is_transaksi && is_melanggar && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: is_transaksi,
                        is_melanggar: is_melanggar,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (is_transaksi && kode_uppkb && is_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    kode_uppkb: kode_uppkb,
                    is_transfer: is_transfer,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (is_transaksi && lokasi_id && is_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    lokasi_id: lokasi_id,
                    is_transfer: is_transfer,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (is_transaksi && tgl_awal && tgl_akhir) {
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

            if (is_transaksi && bptd_id && tgl_awal && tgl_akhir) {
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

            if (is_transaksi && lokasi_id && tgl_awal && tgl_akhir) {
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

            if (is_transaksi && kode_uppkb && tgl_awal && tgl_akhir) {
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

            if (is_transaksi && kode_uppkb && is_transfer && status_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    kode_uppkb: kode_uppkb,
                    is_transfer: is_transfer,
                    status_transfer: status_transfer,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (is_transaksi && lokasi_id && is_transfer && status_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    lokasi_id: lokasi_id,
                    is_transfer: is_transfer,
                    status_transfer: status_transfer,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (is_transaksi && kode_uppkb && tgl_antrian && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, kode_uppkb: kode_uppkb, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
                ]
            }

            if (is_transaksi && lokasi_id && tgl_antrian && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    { is_transaksi: is_transaksi, lokasi_id: lokasi_id, no_kendaraan: no_kendaraan, is_deleted: false, is_active: true }
                ]
            }

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

            if (is_transaksi && is_wim_trx && kode_uppkb && tgl_antrian) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: {
                            [Op.or]: [is_transaksi, is_wim_trx],
                        },
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (is_transaksi && is_wim_trx && kode_uppkb && tgl_penimbangan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: {
                            [Op.or]: [is_transaksi, is_wim_trx],
                        },
                        kode_uppkb: kode_uppkb,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (is_transaksi && lokasi_id && bptd_id && tgl_awal && tgl_akhir) {
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

            if (is_transaksi && kode_uppkb && bptd_id && tgl_awal && tgl_akhir) {
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

            if (is_transaksi && lokasi_id && is_tindakan && is_transfer && status_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    lokasi_id: lokasi_id,
                    is_tindakan: is_tindakan,
                    is_transfer: is_transfer,
                    status_transfer: status_transfer,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (is_transaksi && kode_uppkb && is_tindakan && is_transfer && status_transfer) {
                conditions = {
                    is_transaksi: is_transaksi,
                    kode_uppkb: kode_uppkb,
                    is_tindakan: is_tindakan,
                    is_transfer: is_transfer,
                    status_transfer: status_transfer,
                    is_deleted: false,
                    is_active: true
                }
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

            if (is_transaksi && is_wim_trx && kode_uppkb && tgl_antrian && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_antrian')),
                        moment(tgl_antrian).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: {
                            [Op.or]: [is_transaksi, is_wim_trx],
                        },
                        kode_uppkb: kode_uppkb,
                        no_kendaraan: no_kendaraan,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (is_transaksi && is_wim_trx && kode_uppkb && tgl_penimbangan && no_kendaraan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penimbangan.tgl_penimbangan')),
                        moment(tgl_penimbangan).format('YYYY-MM-DD')
                    ),
                    {
                        is_transaksi: {
                            [Op.or]: [is_transaksi, is_wim_trx],
                        },
                        kode_uppkb: kode_uppkb,
                        no_kendaraan: no_kendaraan,
                        is_deleted: false,
                        is_active: true
                    }
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

            /* ***********************************************MELANGGAR TGL AWAL TGL AKHIR***************************************************************** */
            if (tgl_awal && tgl_akhir) {

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
            }
            /* **************************************************************************************************************** */

            const options = {
                include: [
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
                        },
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
                    },
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
                ],
                page: Number(req.query.page) || 1,
                paginate: Number(req.query.paginate) || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
            }
            // console.log('OPTIONS : ', conditions);
            const { docs, pages, total } = await t_penimbangan.paginate(options);
            // const propinsi = await t_kegiatan.findAll({
            //     where: {
            //         is_active: true
            //     }
            // });

            res.json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs,
                meta: {
                    pages: options.page,
                    paginate: options.paginate,
                    total: total
                }
            });
        } catch (error) {
            next(error)
        }
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
        var arrkomoditi = komoditi.length > 0 ? komoditi.split(',') : '';

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
            var komoditi = req.body.komoditi ? req.body.komoditi : [];
            var arrkomoditi = komoditi.length > 0 ? komoditi.split(',') : '';

            var optionKomoditi = await getOptionResponKomoditi(arrkomoditi);
            console.log('optionKomoditi : ', optionKomoditi)
            // if (komoditi) {
            //     var vkomoditi = komoditi.map((item) => {
            //         return item.value;
            //     });
            //     var prosenToleransi = await useToleransi(vkomoditi, req.body.kode_uppkb);
            // }
            var prosenToleransi = await useToleransi(komoditi, req.body.kode_uppkb);
            var dokumen = req.body.dokumen;
            // console.log('DOKUMEN: ', dokumen);
            // if (dokumen == "") {
            //     dokumen = '12,13,14,15';
            // } else if (dokumen.split(',')[0] != '12') {
            //     dokumen = '13,14,15';
            //     console.log('DOKUMEN: ', dokumen);
            // } else if (status_masa_berlaku && dokumen.split(',')[0] != '12') {
            //     dokumen = '12,13,14,15';
            // } else if (status_masa_berlaku && dokumen.split(',')[0] == '12') {
            //     dokumen = '12,13,14,15';
            // } else {
            //     dokumen = '12,13,14,15';
            // }

            if (dokumen == "") {
                dokumen = '12,13,14,15';
            }
            
            if (dokumen.split(',')[0] != '12') {
                if (status_masa_berlaku) {
                    dokumen = '12,13,14,15';
                } else {
                    dokumen = '13,14,15';
                }
                
                // console.log('DOKUMEN: ', dokumen);
            }
            
            // if (status_masa_berlaku && dokumen.split(',')[0] != '12') {
            //     dokumen = '12,13,14,15';
            // }
            
            // if (status_masa_berlaku && dokumen.split(',')[0] == '12') {
            //     dokumen = '12,13,14,15';
            // }
            
            // else {
            //     dokumen = '12,13,14,15';
            // }            

            var resDok = await getDokumen(dokumen);

            var pelanggaran_da = false;
            if (prosen_kelebihan_berat > prosenToleransi) {
                pelanggaran_da = true;
            }

            // var pelanggaran_dim = await getPelanggaranDimensi(panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur);

            var toleransiDimensi = await getToleransiDimensi(panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur);

            var pelanggaran_dim = false;
            // if (toleransiDimensi.kelebihan_panjang > 0) {
            //     pelanggaran_dim = true;
            // }

            // if (toleransiDimensi.kelebihan_lebar > 0) {
            //     pelanggaran_dim = true;
            // }

            // if (toleransiDimensi.kelebihan_tinggi > 0) {
            //     pelanggaran_dim = true;
            // }

            // if (toleransiDimensi.kelebihan_foh > 0) {
            //     pelanggaran_dim = true;
            // }

            // if (toleransiDimensi.kelebihan_roh > 0) {
            //     pelanggaran_dim = true;
            // }

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
                        });

                        // dokumen = '12, 13,14,15';
                    } else {
                        obj.push({
                            id: results[i].id,
                            kode: results[i].kode,
                            nama: results[i].nama,
                            is_optional: results[i].is_optional,
                            status: true,
                        });
                    }
                } else {
                    // console.log('dok id : ', row.id);
                    obj.push({
                        id: results[i].id,
                        kode: results[i].kode,
                        nama: results[i].nama,
                        is_optional: results[i].is_optional,
                        status: false,
                    });
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
                no_kendaraan: req.body.no_kendaraan ? req.body.no_kendaraan : '',
                plt_no: req.body.no_kendaraan ? req.body.no_kendaraan : '',
                no_uji: req.body.no_uji,
                nama_pemilik: req.body.nama_pemilik,
                alamat_pemilik: req.body.alamat_pemilik,
                komoditi: optionKomoditi || null,
                asal_kota: req.body.asal_kota || null,
                tujuan_kota: req.body.tujuan_kota || null,
                pemilik_komoditi: req.body.pemilik_komoditi || null,
                jenis_kendaraan_id: req.body.jenis_kendaraan_id,
                jenis_kend: req.body.jenis_kend ? req.body.jenis_kend.toUpperCase() : '',
                sumbu_id: req.body.sumbu_id,
                konfigurasi_sumbu: req.body.konfigurasi_sumbu,
                kepemilikan_id: req.body.kepemilikan_id,
                kepemilikan_val: req.body.kepemilikan_val,
                jbi_uji: req.body.jbi_uji ? req.body.jbi_uji : 0,
                jbi: req.body.jbi_uji ? req.body.jbi_uji : 0,
                berat_timbang: req.body.berat_timbang,
                kelebihan_berat: kelebihan_berat,
                prosen_kelebihan_berat: Math.ceil(prosen_kelebihan_berat, 2),
                prosen_toleransi_komoditi: prosenToleransi,
                masa_berlaku: masa_berlaku,
                masa_berlaku_uji: masa_berlaku,
                dokumen: dokumen,
                panjang_uji: Number(req.body.panjang_uji || 0),
                lebar_uji: Number(req.body.lebar_uji || 0),
                tinggi_uji: Number(req.body.tinggi_uji || 0),
                foh_uji: Number(req.body.foh_uji || 0),
                roh_uji: Number(req.body.roh_uji || 0),
                panjang_utama: Number(req.body.panjang_uji || 0),
                lebar_utama: Number(req.body.lebar_uji || 0),
                tinggi_utama: Number(req.body.tinggi_uji || 0),
                julur_depan: Number(req.body.foh_uji || 0),
                julur_belakang: Number(req.body.roh_uji || 0),
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
            // console.log('DATA FIND PELANGGARAN : ', data);
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

    const findHistori = async (req, res, next) => {
        console.log("--------------------::Processing Find All HISTORI KOMODITI::--------------------");
        console.log('NO KENDARAAN : ', req.body.no_kendaraan);
        if (req.body.no_kendaraan) {
            var dataHistori = await getHistori(req.body.no_kendaraan);
            if (dataHistori.length > 0) {
                var resData = [];
                for (var row of dataHistori) {
                    // console.log(dataHistori);
                    var arrkomoditi = await getKomoditiByTrx(row.kode_trx);
                    var komoditi = [];
                    var komoditi_id = [];
                    if (arrkomoditi.length > 0) {
                        for (var qry of arrkomoditi) {
                            komoditi.push(qry.nama);
                            komoditi_id.push(qry.id);
                        }
                    }
                    // console.log('Komoditi : ', arrkomoditi);

                    var asalKota = await getKotaById(row.asal_kota_id);
                    var tujuanKota = await getKotaById(row.tujuan_kota_id);

                    if (resData.length > 0) {
                        var filterData = resData.filter((val) => val.komoditi === komoditi.toString());
                        if (filterData.length < 1 && resData.length < 4) {
                            resData.push({
                                kode_trx: row.kode_trx,
                                tgl_penimbangan: row.tgl_penimbangan,
                                komoditi: komoditi.toString(),
                                komoditi_id: komoditi_id.toString(),
                                no_surat_jalan: row.no_surat_jalan,
                                asal_kota_id: row.asal_kota_id,
                                asal_kota: asalKota,
                                tujuan_kota_id: row.tujuan_kota_id,
                                tujuan_kota: tujuanKota,
                                pemilik_komoditi: row.pemilik_komoditi,
                                alamat_pemilik_komoditi: row.alamat_pemilik_komoditi
                            });
                        }
                    } else {
                        resData.push({
                            kode_trx: row.kode_trx,
                            tgl_penimbangan: row.tgl_penimbangan,
                            komoditi: komoditi.toString(),
                            komoditi_id: komoditi_id.toString(),
                            no_surat_jalan: row.no_surat_jalan,
                            asal_kota_id: row.asal_kota_id,
                            asal_kota: asalKota,
                            tujuan_kota_id: row.tujuan_kota_id,
                            tujuan_kota: tujuanKota,
                            pemilik_komoditi: row.pemilik_komoditi,
                            alamat_pemilik_komoditi: row.alamat_pemilik_komoditi
                        });
                    }
                };
                // console.log('DATA HISTORI : ', resData);

                res.send({
                    success: true,
                    message: 'Pencarian Data Histori Berhasil',
                    data: resData
                });
            } else {
                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    console.log('CEK HISTORI TO SERVER JTO');
                    var data_post = {
                        no_kendaraan: req.body.no_kendaraan,
                    }
                    // console.log('Token : ', req.token.id);
                    await syncToPostServer(req.token.id, 'post', 'v2pv/penimbangan/findhistori', data_post).then((resp) => {
                        console.log('GET DATA BERHASIL');
                        console.log('DATA HISTORI : ', resp.data);
                        res.send({
                            success: true,
                            message: 'Pencarian Data Histori Berhasil',
                            data: resp.data.data
                        });
                    }).catch((error) => {
                        console.log(error);
                        console.log('GET DATA GAGAL');
                        res.send({
                            success: false,
                            message: 'Pencarian Data Histori Gagal',
                            data: []
                        })
                    });
                } else {
                    res.send({
                        success: true,
                        message: 'Pencarian Data Histori Berhasil',
                        data: []
                    });
                }
            }

        } else {
            res.send({
                success: false,
                message: 'No Kendaraan Tidak Boleh Kosong',
                data: []
            })
        }
    }

    const checkServerPusatJTOHistori = async (nokend) => {
        var dataJtoServerHistori = await checkjtoserverhistori(nokend);

        return dataJtoServerHistori;
    }

    const captureImg = async (kode_uppkb, lokasi_id, no_kendaraan, timbangan_id) => {
		console.log("--------------------::Processing Capture CCTV::--------------------");
		try {
			var sql_chk = `SELECT * FROM jt_timbangan WHERE id = ${timbangan_id} AND lokasi_uppkb_id = ${lokasi_id} AND is_active = true AND is_deleted = false;`;

			const result_chk = await sequelize.query(sql_chk, {
				type: QueryTypes.SELECT,
				logging: false
			});

			var arr = [];
			if (result_chk && result_chk.length > 0) {
				var resp = result_chk[0];
				var cctv_depan = resp.cctv_depan;
				var cctv_belakang = resp.cctv_belakang;
				arr.push(cctv_depan, cctv_belakang);

				var arrcapture = [];

				for (var i = 0; i < arr.length; i++) {
					try {
						var urlparse = url.parse(arr[i], true);
						var host = urlparse.host;
						var pathname = urlparse.pathname;
						var auth = urlparse.auth;
						
						// Validasi auth
						if (!auth) {
							console.log(`Auth tidak ditemukan untuk camera ${i+1}`);
							arrcapture.push({
								'filename': '',
								'imageUrl': '',
							});
							continue;
						}
						
						var authUsername = auth.split(":")[0];
						var authPassword = auth.split(":")[1];
						var urlCaptureApi = `http://${host}/ISAPI/${pathname}/${process.env.CAPTURE_PARAMS}`;
						
						const digestAuth = new AxiosDigestAuth({
							username: `${authUsername}`,
							password: `${authPassword}`,
						});

						const response = await digestAuth.request({
							headers: { Accept: "*/*" },
							responseType: "arraybuffer",
							method: "GET",
							url: urlCaptureApi,
							timeout: 10000 // tambah timeout 10 detik
						});

						const file_name = kode_uppkb + '_' + no_kendaraan + '_timbangan_' + timbangan_id + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + (i + 1) + '.jpg';
						const uploadPath = path.join(config.path_upload) + '/penimbangan/' + file_name;
						const imageUrl = `${config.image_url}penimbangan/${file_name}`;

						// Gunakan fs.writeFileSync atau await fs.promises.writeFile
						await fs.promises.writeFile(uploadPath, response.data);
						
						arrcapture.push({
							'filename': file_name,
							'imageUrl': imageUrl,
						});
						
						console.log(`Camera ${i+1} berhasil di-capture: ${file_name}`);

					} catch (captureError) {
						console.log(`Capture Error Camera ${i+1}:`, captureError.message);
						arrcapture.push({
							'filename': '',
							'imageUrl': '',
						});
					}
					
					await timer(100);
				}
				
				console.log('Hasil capture:', arrcapture);
				return arrcapture;
			} else {
				console.log('Data timbangan tidak ditemukan');
				return [];
			}

		} catch (error) {
			console.log('ERROR CAPTURE : ', error);
			return [];
		}
	}

    const setDimensi = async (kode_uppkb, timbangan_id, no_kendaraan, status_baca) => {
        return new Promise(async (resolve, reject) => {
            try {
                var sql = `SELECT * FROM jt_timbangan WHERE id = ${timbangan_id} AND kode_uppkb = '${kode_uppkb}' AND is_active = true AND is_deleted = false`;

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });

                if (result.length > 0) {
                    var api_url_dimensi = result[0].api_url_sensor_dim;
                    console.log(`${api_url_dimensi}/${no_kendaraan}/${status_baca}`);
                    if (api_url_dimensi && api_url_dimensi != '') {
                        var config = {
                            method: 'get',
                            url: `${api_url_dimensi}/${no_kendaraan}/${status_baca}`,
                            headers: {},
                            timeout: 5000,
                        };
                        axios(config).then(function (response) {
                            console.log('RESPONSE DIMENSI : ', response.data.response);
                            if (response.data) {
                                if (response.data.status == '1') {
                                    resolve(response.data.response);
                                } else {
                                    console.log('ERROR RESPONSE');
                                    reject(0);
                                }
                            } else {
                                console.log('ERROR URL DATA');
                                reject(0);
                            }
                        }).catch(function (error) {
                            console.log('ERROR REQUEST : ', error);
                            reject(error);
                        });
                    } else {
                        console.log('ERROR API URL');
                        reject(0);
                    }
                } else {
                    console.log('ERROR LENGHT DATA');
                    reject(0);
                }
            } catch (error) {
                reject(error);
            }

        });
    }

    const readDimensi = async (req, res, next) => {
        console.log("--------------------::Processing Read Dimensi::--------------------");
        try {
            var kode_uppkb = req.query.kuppkb;
            var timbangan_id = req.query.timbangan_id;
            var no_kendaraan = req.query.no_kendaraan;
            var status_baca = req.query.status_baca;

            return await setDimensi(kode_uppkb, timbangan_id, no_kendaraan, status_baca).then(data => {
                console.log('DATA DIMENSI : ', data);
                if (data) {
                    res.send({
                        success: true,
                        message: 'Baca Sensor Dimensi Berhasil',
                        data: data[0]
                    });
                } else {
                    res.send({
                        success: false,
                        message: 'Baca Sensor Dimensi Gagal'
                    });
                }
            }).catch((err) => {

                res.send({
                    success: false,
                    message: 'Baca Sensor Dimensi Gagal'
                });
            });
        } catch (error) {
            console.log(error);
            next('ERROR : ', error);
        }
    }


    function validateLicensePlate(licensePlate) {
        // Format nomor plat: 1 huruf, 4 angka, 3 huruf (tanpa spasi)
        var regex = /^[A-Z]{1,2}\d{1,4}[A-Z]{1,3}$/g; // /^[A-Z]{1,}\d{5,}[A-Z]{2,}$/;

        return regex.test(licensePlate);
    }

    const createLogWim = async (req, res, next) => {
        console.log("--------------------::Processing Create Log WIM::--------------------");
        try {
            if (req.body.no_kendaraan != '' && validateLicensePlate(req.body.no_kendaraan.toUpperCase())) {
                var is_no_kendaraan = await getIsNoKendaraanWim(req.body.no_kendaraan.toUpperCase(), moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
                console.log('IS NO KENDARAAN : ', is_no_kendaraan);
                if (is_no_kendaraan) {

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
                        const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
                        console.log('Client IP:', clientIp);
                        Promise.all(uploads).then(async () => {
                            console.log('INSERT WITH IMAGE');
                            const field = {
                                kode_uppkb: req.body.kode_uppkb || process.env.KODE_UPPKB,
                                kode_ruas: await getNoRuas(req.body.kode_uppkb || process.env.KODE_UPPKB),
                                no_kendaraan: req.body.no_kendaraan.toUpperCase(),
                                tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                is_transaksi: req.body.is_transaksi || 2,
                                device_id: req.body.device_id || 3,
                                sumbu: req.body.sumbu || '',
                                wim_kode: req.body.wim_kode,
                                wim_berat: req.body.wim_berat ? Number(req.body.wim_berat) : 0,
                                wim_panjang: req.body.wim_panjang ? Number(req.body.wim_panjang) : 0,
                                wim_lebar: req.body.wim_lebar ? Number(req.body.wim_lebar) : 0,
                                wim_tinggi: req.body.wim_tinggi ? Number(req.body.wim_tinggi) : 0,
                                wim_foh: req.body.wim_foh ? Number(req.body.wim_foh) : 0,
                                wim_roh: req.body.wim_roh ? Number(req.body.wim_roh) : 0,
                                wim_kecepatan: req.body.wim_kec ? Number(req.body.wim_kec) : 0,
                                ...dataFoto,
                                axle_weight1: req.body.axle_weight1 ? Number(req.body.axle_weight1) : 0,
                                axle_weight2: req.body.axle_weight2 ? Number(req.body.axle_weight2) : 0,
                                axle_weight3: req.body.axle_weight3 ? Number(req.body.axle_weight3) : 0,
                                axle_weight4: req.body.axle_weight4 ? Number(req.body.axle_weight4) : 0,
                                axle_weight5: req.body.axle_weight5 ? Number(req.body.axle_weight5) : 0,
                                axle_weight6: req.body.axle_weight6 ? Number(req.body.axle_weight6) : 0,
                                axle_weight7: req.body.axle_weight7 ? Number(req.body.axle_weight7) : 0,
                                axle_dis1: req.body.axle_dis1 ? Number(req.body.axle_dis1) : 0,
                                axle_dis2: req.body.axle_dis2 ? Number(req.body.axle_dis2) : 0,
                                axle_dis3: req.body.axle_dis3 ? Number(req.body.axle_dis3) : 0,
                                axle_dis4: req.body.axle_dis4 ? Number(req.body.axle_dis4) : 0,
                                axle_dis5: req.body.axle_dis5 ? Number(req.body.axle_dis5) : 0,
                                axle_dis6: req.body.axle_dis6 ? Number(req.body.axle_dis6) : 0,
                                axle_dis7: req.body.axle_dis7 ? Number(req.body.axle_dis7) : 0,
                                jml_sumbu: req.body.jml_sumbu ? Number(req.body.jml_sumbu) : 0,
                                ip_device: req.body.ip_device || clientIp || null,
                                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                is_status: 1,
                                ruas_id: req.body.ruas_id || null,
                            }

                            console.log(field)
                            return sequelize.transaction().then(function (t) {
                                return t_log_wim.create(field, { transaction: t, logging: true }).then(async (data) => {
                                    try {
                                        t.commit();
                                        console.log(field);
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

                    if (process.env.IS_KEMENHUB == 1) {

                        console.log('INSERT LOG DATA WIM');
                        const field = {
                            kode_uppkb: req.body.kode_uppkb,
                            kode_ruas: req.body.kode_ruas || null,
                            no_kendaraan: req.body.no_kendaraan.toUpperCase(),
                            tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                            is_transaksi: req.body.is_transaksi,
                            device_id: req.body.device_id,
                            sumbu: req.body.sumbu || '',
                            wim_kode: req.body.wim_kode,
                            wim_berat: req.body.wim_berat ? Number(req.body.wim_berat) : 0,
                            wim_panjang: req.body.wim_panjang ? Number(req.body.wim_panjang) : 0,
                            wim_lebar: req.body.wim_lebar ? Number(req.body.wim_lebar) : 0,
                            wim_tinggi: req.body.wim_tinggi ? Number(req.body.wim_tinggi) : 0,
                            wim_foh: req.body.wim_foh ? Number(req.body.wim_foh) : 0,
                            wim_roh: req.body.wim_roh ? Number(req.body.wim_roh) : 0,
                            wim_kecepatan: req.body.wim_kec ? Number(req.body.wim_kec) : 0,
                            foto_depan_name: req.body.foto_depan_name,
                            foto_depan_url: req.body.foto_depan_url,
                            foto_plat_no_name: req.body.foto_plat_no_name,
                            foto_plat_no_url: req.body.foto_plat_no_url,
                            axle_weight1: req.body.axle_weight1 ? Number(req.body.axle_weight1) : 0,
                            axle_weight2: req.body.axle_weight2 ? Number(req.body.axle_weight2) : 0,
                            axle_weight3: req.body.axle_weight3 ? Number(req.body.axle_weight3) : 0,
                            axle_weight4: req.body.axle_weight4 ? Number(req.body.axle_weight4) : 0,
                            axle_weight5: req.body.axle_weight5 ? Number(req.body.axle_weight5) : 0,
                            axle_weight6: req.body.axle_weight6 ? Number(req.body.axle_weight6) : 0,
                            axle_weight7: req.body.axle_weight7 ? Number(req.body.axle_weight7) : 0,
                            axle_dis1: req.body.axle_dis1 ? Number(req.body.axle_dis1) : 0,
                            axle_dis2: req.body.axle_dis2 ? Number(req.body.axle_dis2) : 0,
                            axle_dis3: req.body.axle_dis3 ? Number(req.body.axle_dis3) : 0,
                            axle_dis4: req.body.axle_dis4 ? Number(req.body.axle_dis4) : 0,
                            axle_dis5: req.body.axle_dis5 ? Number(req.body.axle_dis5) : 0,
                            axle_dis6: req.body.axle_dis6 ? Number(req.body.axle_dis6) : 0,
                            axle_dis7: req.body.axle_dis7 ? Number(req.body.axle_dis7) : 0,
                            jml_sumbu: req.body.jml_sumbu ? Number(req.body.jml_sumbu) : 0,
                            ip_device: req.body.ip_device || null,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            is_status: req.body.is_status || 1,
                            ruas_id: req.body.ruas_id || null,
                            is_melanggar: req.body.is_melanggar || false,
                            is_overload: req.body.is_overload || false,
                            is_overdim: req.body.is_overdim || false,
                            persen_kelebihan_berat: req.body.persen_kelebihan_berat ? Number(req.body.persen_kelebihan_berat) : 0,
                            jml_kelebihan_berat: req.body.jml_kelebihan_berat ? Number(req.body.jml_kelebihan_berat) : 0,
                            persen_kelebihan_panjang: req.body.persen_kelebihan_panjang ? Number(req.body.persen_kelebihan_panjang) : 0,
                            jml_kelebihan_panjang: req.body.jml_kelebihan_panjang ? Number(req.body.jml_kelebihan_panjang) : 0,
                            persen_kelebihan_lebar: req.body.persen_kelebihan_lebar ? Number(req.body.persen_kelebihan_lebar) : 0,
                            jml_kelebihan_lebar: req.body.jml_kelebihan_lebar ? Number(req.body.jml_kelebihan_lebar) : 0,
                            persen_kelebihan_tinggi: req.body.persen_kelebihan_tinggi ? Number(req.body.persen_kelebihan_tinggi) : 0,
                            jml_kelebihan_tinggi: req.body.jml_kelebihan_tinggi ? Number(req.body.jml_kelebihan_tinggi) : 0,
                            batas_berat_kg: req.body.batas_berat_kg ? Number(req.body.batas_berat_kg) : 0,
                            batas_berat_kg_tol: req.body.batas_berat_kg_tol ? Number(req.body.batas_berat_kg_tol) : 0,
                            batas_panjang_mm: req.body.batas_panjang_mm ? Number(req.body.batas_panjang_mm) : 0,
                            batas_panjang_mm_tol: req.body.batas_panjang_mm_tol ? Number(req.body.batas_panjang_mm_tol) : 0,
                            batas_lebar_mm: req.body.batas_lebar_mm ? Number(req.body.batas_lebar_mm) : 0,
                            batas_lebar_mm_tol: req.body.batas_lebar_mm_tol ? Number(req.body.batas_lebar_mm_tol) : 0,
                            batas_tinggi_mm: req.body.batas_tinggi_mm ? Number(req.body.batas_tinggi_mm) : 0,
                            batas_tinggi_mm_tol: req.body.batas_tinggi_mm_tol ? Number(req.body.batas_tinggi_mm_tol) : 0,
                        }
                        console.log(field)
                        return sequelize.transaction().then(function (t) {
                            return t_log_wim.create(field, { transaction: t, logging: false }).then(async (data) => {
                                try {
                                    t.commit();
                                    console.log("BERHASIL INSERT LOG DATA WIM")
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
                    }
                } else {
                    console.log('Data Kendaraan Sudah Tersedia');
                    res.send({
                        success: false,
                        message: 'Data Kendaraan Sudah Tersedia',
                    });
                }
                    
            } else {
                console.log('No Kendaraan Wajib Di Isi');
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

    const createLogWimBackup = async (req, res, next) => {
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

                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
                reject(false)

            }
        });
    }
    
    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        try {
            // console.log('REQ DATA PENIMBANGAN: ', req.body);
            if (req.body.wim_kode != '' && (req.body.is_transaksi == 0 || req.body.is_transaksi == 2) && req.body.device_id == 3) {
                createLogWim(req, res, next);
            } else {
                if (req.body.no_kendaraan != '' && req.body.no_kendaraan != undefined && validateLicensePlate(req.body.no_kendaraan.toUpperCase()) && req.body.is_transaksi != 2 && req.body.device_id != 3) {
                    var is_no_kendaraan = await getIsNoKendaraan(req.body.no_kendaraan.toUpperCase(), moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
                    console.log('IS NO KENDARAAN : ', is_no_kendaraan);
                    if (is_no_kendaraan) {
                        console.log('CREATED');
                        if (process.env.IS_INTEGRASI_WIM == 0 && req.body.device_id == 3) {
                            // if (req.body.device_id == 3) {
                            return res.send({
                                success: false,
                                message: 'Input Data Kendaraan WIM Disable',
                            })
                            // }
                        } else {

                            var kode_trx = req.body.kode_trx ? req.body.kode_trx : await genCodeTrxPenimbangan(req.body.kode_uppkb, moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), req.body.no_kendaraan.toUpperCase());
                            var is_exists_no_trx = await getIsExistsKodeTrxKendaraan(kode_trx, req.body.no_kendaraan.toUpperCase());

                            if (is_exists_no_trx) {
                                var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
                                var bptd_id = await getBptdId(req.body.kode_uppkb);

                                var is_use_jbi = Number(req.body.gandengan_jbki) > 0 ? Number(req.body.gandengan_jbki) : Number(req.body.jbi_uji);
                                var kelebihan_berat = await kelebihanBerat(Number(req.body.berat_timbang), is_use_jbi);
                                var prosen_kelebihan_berat = await prosenKelebihanBerat(Number(req.body.berat_timbang), is_use_jbi);
                                var komoditi = req.body.komoditi;
                                var arrkomoditi = komoditi ? komoditi.split(',') : [];

                                var dokumen = req.body.dokumen;
                                var arrdokumen = dokumen ? dokumen.split(',') : [];

                                var pelanggaran = req.body.pelanggaran;
                                // console.log('PELANGGARAN : ',pelanggaran);
                                var arrpelanggaran = pelanggaran ? pelanggaran.split(',') : [];
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

                                var apiKey = process.env.API_KEY_PAN_BALI;
                                var platformName = process.env.PLATFORM_NAME_PAN_BALI;
                                var payload = {
                                    e_manifest_number: req.body.no_surat_jalan,
                                    inspection_date: moment().format(),
                                    load_commodity_name: arrkomoditi,
                                    vehicle_plate_number: req.body.no_kendaraan.toUpperCase(),
                                    weight_scale: Number(req.body.berat_timbang) || 0,
                                };

                                //var useTolTrx = isUseToleransiTrx.split(',');
                                //console.log('TOLERANSI TRX : ', useTolTrx);
                                //let komoditi_kategori = useTolTrx[2];//getKategoriKomoditi(arrkomoditi[0]);
                                //let toleransi_komoditi_uppkb = useTolTrx[1]; //await getToleransiUppkbKomoditi(req.body.kode_uppkb, arrkomoditi[0]);

                                let jenis_kendaraan_id = req.body.jenis_kendaraan ? await getJenisKendaraanId(req.body.jenis_kendaraan) : null;
                                let sumbu_id = req.body.sumbu ? await getSumbuId(req.body.sumbu) : null;

                                if (arrkomoditi.length < 1) {
                                    console.log('KOMODITI : ', arrkomoditi);
                                    console.log('Komoditi Tidak Boleh Kosong');
                                    res.send({
                                        success: false,
                                        message: 'Komoditi Tidak Boleh Kosong',
                                    });
                                } else if (jenis_kendaraan_id == 0) {
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

                                    // console.log('TOLERANSI KATEGORI : ', komoditi_kategori.prosen_toleransi, ' TOLERANSI UPPKB : ', toleransi_komoditi_uppkb.prosen_toleransi);
                                    // console.log('JENIS KENDARAAN ID : ', jenis_kendaraan_id, ' SUMBU ID : ', sumbu_id);
                                    console.log(useTolTrx[2]);
                                    console.log('TOLERANSI KATEGORI : ', komoditi_kategori, ' TOLERANSI UPPKB : ', toleransi_komoditi_uppkb);
                                    console.log('JENIS KENDARAAN ID : ', jenis_kendaraan_id, ' SUMBU ID : ', sumbu_id);
                                    console.log('MASA BERLAKU : ', req.body.tgl_masa_berlaku, ' TANGGAL UJI : ', moment(req.body.tgl_masa_berlaku).subtract(6, 'months').format('YYYY-MM-DD'))

                                    var imgArr = [];
                                    var imgArrUrl = [];
                                    let uploads = [];
                                    var dataFoto = {
                                        foto_depan: req.body.foto_depan || '',
                                        foto_belakang: req.body.foto_belakang || '',
                                        foto_kiri: req.body.foto_kiri || '',
                                        foto_kanan: req.body.foto_kanan || '',
                                        foto_depan_url: req.body.foto_depan_url || '',
                                        foto_belakang_url: req.body.foto_belakang_url || '',
                                        foto_kiri_url: req.body.foto_kiri_url || '',
                                        foto_kanan_url: req.body.foto_kanan_url || '',
                                        foto_plate_no: req.body.foto_plate_no || '',
                                        foto_plate_no_url: req.body.foto_plate_no_url || '',
                                        plate_no_img_name: req.body.plate_no_img_name || '',
                                        plate_no_img_url: req.body.plate_no_img_url || '',
                                    }

                                    if (process.env.IS_KEMENHUB == 0) {
                                        if (req.files) {
                                            // console.log('FOTO DEPAN : ', req.files.fotoDepan);
                                            var uploadFotoDepan = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoDepan);
                                            var uploadFotoBelakang = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoBelakang);
                                            var uploadFotoKiri = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoKiri);
                                            var uploadFotoKanan = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoKanan);
                                            var uploadFotoPlatNo = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoPlateNo);

                                            dataFoto = {
                                                foto_depan: uploadFotoDepan.imgName || '',
                                                foto_belakang: uploadFotoBelakang.imgName || '',
                                                foto_kiri: uploadFotoKiri.imgName || '',
                                                foto_kanan: uploadFotoKanan.imgName || '',
                                                foto_depan_url: uploadFotoDepan.imgUrl || '',
                                                foto_belakang_url: uploadFotoBelakang.imgUrl || '',
                                                foto_kiri_url: uploadFotoKiri.imgUrl || '',
                                                foto_kanan_url: uploadFotoKanan.imgUrl || '',
                                                plate_no_img_name: uploadFotoPlatNo.imgName || '',
                                                plate_no_img_url: uploadFotoPlatNo.imgUrl || '',
                                            }
                                        }

                                        if (req.body.is_transaksi == 1 && req.body.device_id != 4 && req.files == null) {
                                            var captureCam = await captureImg(req.body.kode_uppkb, lokasi_id, req.body.no_kendaraan, req.body.timbangan_id);
                                            console.log(captureCam);
                                            if (captureCam) {
                                                if (captureCam.length > 0) {
                                                    dataFoto = {
                                                        foto_depan: captureCam[0].filename || '',
                                                        foto_belakang: captureCam[1].filename || '',
                                                        foto_kiri: '',
                                                        foto_kanan: '',
                                                        foto_depan_url: captureCam[0].imageUrl || '',
                                                        foto_belakang_url: captureCam[1].imageUrl || '',
                                                        foto_kiri_url: '',
                                                        foto_kanan_url: '',
                                                        plate_no_img_name: '',
                                                        plate_no_img_url: '',
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    if (process.env.IS_KEMENHUB == 1) {
                                        if (req.files) {
                                            // console.log('FOTO DEPAN : ', req.files.fotoDepan);
                                            var uploadFotoDepan = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoDepan);
                                            var uploadFotoBelakang = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoBelakang);
                                            var uploadFotoKiri = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoKiri);
                                            var uploadFotoKanan = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoKanan);
                                            var uploadFotoPlatNo = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoPlateNo);

                                            dataFoto = {
                                                foto_depan: uploadFotoDepan.imgName || '',
                                                foto_belakang: uploadFotoBelakang.imgName || '',
                                                foto_kiri: uploadFotoKiri.imgName || '',
                                                foto_kanan: uploadFotoKanan.imgName || '',
                                                foto_depan_url: uploadFotoDepan.imgUrl || '',
                                                foto_belakang_url: uploadFotoBelakang.imgUrl || '',
                                                foto_kiri_url: uploadFotoKiri.imgUrl || '',
                                                foto_kanan_url: uploadFotoKanan.imgUrl || '',
                                                plate_no_img_name: uploadFotoPlatNo.imgName || '',
                                                plate_no_img_url: uploadFotoPlatNo.imgUrl || '',
                                            }
                                        }
                                    }

                                    // console.log(data_sync);
                                    Promise.all(uploads).then(async () => {
                                        console.log('INSERT WITH IMAGE');
                                        const field = {
                                            kode_trx: kode_trx || req.body.kode_trx,
                                            regu_id: req.body.regu_id ? req.body.regu_id : null,
                                            shift_id: req.body.shift_id ? req.body.shift_id : null,
                                            petugas_id: req.body.petugas_id ? req.body.petugas_id : null,
                                            bptd_id: bptd_id,
                                            lokasi_id: lokasi_id,
                                            kode_uppkb: req.body.kode_uppkb,
                                            timbangan_id: req.body.timbangan_id ? req.body.timbangan_id : null,
                                            tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                            tgl_antrian: moment(req.body.tgl_antrian).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
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
                                            // jbb_uji: req.body.jbb_uji,
                                            // jbkb_uji: req.body.jbkb_uji,
                                            kelebihan_berat: kelebihan_berat || 0, //req.body.kelebihan_berat,
                                            prosen_lebih: prosen_kelebihan_berat || 0,
                                            use_toleransi: useTolTrx[0] || 0,
                                            // jenis_pelanggaran: req.body.jenis_pelanggaran,
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
                                            ...dataFoto,
                                            plate_no_confidance: req.body.plate_no_confidance,
                                            is_active: req.body.iact ? req.body.iact : false,
                                            created_by: req.token.id,
                                            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                        }
                                        // console.log(field)
                                        return sequelize.transaction().then(function (t) {
                                            return t_penimbangan.create(field, { transaction: t, logging: false }).then(async (data) => {
                                                // Commit di luar try: mulai titik ini data sudah permanen, sehingga
                                                // kegagalan efek samping di bawah tidak boleh membalik respons jadi gagal.
                                                await t.commit();

                                                var gate_status = 'TIDAK DIPROSES';

                                                try {
                                                    var upsert_muatan = await upsert_komoditi(arrkomoditi, kode_trx, req.body.no_kendaraan.toUpperCase(), moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                                    console.log('UPSERT MUATAN : ', upsert_muatan);

                                                    var upsertpelanggaran = await upsert_pelanggaran(arrpelanggaran, kode_trx, req.body.no_kendaraan.toUpperCase(), moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD'), req.token.id);
                                                    console.log('UPSERT PELANGGARAN : ', upsertpelanggaran);

                                                    var movedoc = await moveRowDocumentTemp(arrdokumen, kode_trx, req.body.no_kendaraan.toUpperCase(), moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                                    console.log('MOVE DOC ', movedoc);

                                                    if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                                                        if (req.body.is_transaksi == 1) {
                                                            var postpanbali = await syncToPostPanBali(apiKey, platformName, payload).then((res) => {
                                                                console.log('POST DATA PAN BALI BERHASIL');
                                                                console.log('RESPOND PAN BALI : ', res);
                                                            }).catch((error) => {
                                                                console.log(error);
                                                                console.log('POST DATA PAN BALI GAGAL');
                                                            });
                                                        }
                                                    }

                                                    if (isSyncFromPenimbangan() && process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                                                        if (req.body.is_transaksi == 1) {
                                                            var data_req = req.body;

                                                            const capturedImages = {
                                                                fotoDepan: dataFoto.foto_depan ? path.join(config.path_upload) + '/penimbangan/' + dataFoto.foto_depan : '',
                                                                fotoBelakang: dataFoto.foto_belakang ? path.join(config.path_upload) + '/penimbangan/' + dataFoto.foto_belakang : '',
                                                            };
                                                            var data_sync = {
                                                                kode_trx: kode_trx,
                                                                ...data_req,
                                                                ...dataFoto,
                                                                ...capturedImages
                                                            }
                                                            console.log(data_sync);
                                                            await syncToPostServerWithImage(req.token.id, 'post', 'v2pv/penimbangan/create', data_sync).then(async (resp) => {
                                                                if (resp.data.success) {
                                                                    console.log('SINKRONISASI DATA BERHASIL');
                                                                    await updateStatusSyncToPusat(data.id, 'jt_penimbangan');
                                                                } else {
                                                                    console.log(resp.data);
                                                                    console.log('SINKRONISASI DATA GAGAL');
                                                                }
                                                            }).catch((error) => {
                                                                console.log(error);
                                                                console.log('SINKRONISASI DATA GAGAL');
                                                            });
                                                        }
                                                    }
                                                    if (process.env.IS_KEMENHUB == 0) {
                                                        gate_status = await openCloseGate(req.body.kode_uppkb, req.body.timbangan_id, 1, 1)
                                                            .then(() => 'TERBUKA')
                                                            .catch((errGate) => {
                                                                console.log('GATE CONTROL GAGAL : ', errGate);
                                                                return 'GAGAL';
                                                            });
                                                    }
                                                    if (process.env.IS_KEMENHUB == 0 && process.env.IS_INTEGRASI_WIM == 1) {
                                                        await cekExistsVerifikasi(data.id);
                                                    }
                                                } catch (error) {
                                                    // Data penimbangan sudah tersimpan permanen di atas.
                                                    // Kegagalan di sini hanya dicatat, tidak membatalkan apa pun.
                                                    console.log('EFEK SAMPING PASCA-SIMPAN GAGAL : ', error);
                                                }

                                                console.log('SUCCESS, LAST ID: ', data.id, '| GATE:', gate_status);
                                                res.send({
                                                    success: true,
                                                    message: messageService().CREATE_SUCCESS,
                                                    gate_status: gate_status,
                                                    data: [{
                                                        last_insert_id: data.id,
                                                        fields: field
                                                    }]
                                                });
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
                                console.log('Nomor Transaksi Sudah Tersedia');
                                res.send({
                                    success: false,
                                    message: 'Nomor Transaksi Sudah Tersedia',
                                });
                            }

                        }
                    } else {
                        console.log('Data Kendaraan Sudah Tersedia');
                        res.send({
                            success: false,
                            message: 'Data Kendaraan Sudah Tersedia',
                        });
                    }
                } else {
                    console.log('NO KENDARAAN KOSONG');
                    res.send({
                        success: false,
                        message: 'No Kendaraan Kosong',
                    });
                }
            }
        } catch (error) {
            console.log(error)
            next(error)
        }

    }

    const sinkPenimbangan = async (req, res, next) => {
        try {
            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                if (req.body.is_transaksi == 1) {
                    var data_req = req.body;
                    await syncToPostServer(req.token.id, 'post', 'v2pv/penimbangan/create', data_req).then(async (resp) => {
                        if (resp.data.success) {
                            console.log('SINKRONISASI DATA BERHASIL');
                            var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_penimbangan');
                            console.log('UPDATE STATUS : ', update_status);
                            if (update_status == 1) {
                                res.send({
                                    success: true,
                                    message: 'Sinkronisasi / Kirim Data Penimbangan Berhasil'
                                });
                            } else {
                                res.send({
                                    success: false,
                                    message: 'Update Status Penimbangan Gagal',
                                });
                            }

                        } else {
                            if (resp.data.message === 'Nomor Transaksi Sudah Tersedia') {
                                console.log(resp.data, 'SINKRONISASI DATA SUDAH TERSEDIA');
                                var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_penimbangan');
                                console.log('UPDATE STATUS : ', update_status);
                                if (update_status == 1) {
                                    res.send({
                                        success: true,
                                        message: 'Sinkronisasi / Kirim Data Penimbangan Berhasil'
                                    });
                                } else {
                                    res.send({
                                        success: false,
                                        message: 'Update Status Penimbangan Gagal',
                                    });
                                }
                            } else if (resp.data.message = 'Data Kendaraan Sudah Tersedia') {
                                console.log(resp.data, 'SINKRONISASI DATA SUDAH TERSEDIA');
                                var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_penimbangan');
                                console.log('UPDATE STATUS : ', update_status);
                                if (update_status == 1) {
                                    res.send({
                                        success: true,
                                        message: 'Sinkronisasi / Kirim Data Penimbangan Berhasil'
                                    });
                                } else {
                                    res.send({
                                        success: false,
                                        message: 'Update Status Penimbangan Gagal',
                                    });
                                }
                            } else {
                                console.log(resp.data, 'SINKRONISASI DATA GAGAL');
                                res.send({
                                    success: false,
                                    message: 'Sinkronisasi / Kirim Data Penimbangan Gagal',
                                });
                            }
                        }
                    }).catch((error) => {
                        // console.log(error);
                        console.log('SINKRONISASI DATA GAGAL');
                        res.send({
                            success: false,
                            message: `Sinkronisasi / Kirim Data Penimbangan Gagal. ${error}`,
                        });
                    });
                }
            }
        } catch (error) {
            console.log(error)
            next(error)
        }

    }

    const sinkUpsertPenimbangan = async (req, res, next) => {
        console.log('------------------------SINK UPSERT PENIMBANGAN------------------------');
        try {
            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                if (req.body.is_transaksi == 1) {
                    var sql = `SELECT * FROM jt_penimbangan WHERE lokasi_id = ${req.body.lokasi_id} AND kode_trx = '${req.body.kode_trx}' AND no_kendaraan = '${req.body.no_kendaraan.toUpperCase()}' AND tgl_penimbangan = '${moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss')}' AND is_transaksi = 1 ORDER BY tgl_penimbangan`;
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    });

                    if (Object.keys(result).length > 0) {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'post', `v2pv/penimbangan/updatebytrx`, data_req).then(async (resp) => {
                            if (resp.data.success) {
                                console.log('SINKRONISASI UPDATE DATA BERHASIL');
                                var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_penimbangan');
                                console.log('UPDATE STATUS : ', update_status);
                                if (update_status == 1) {
                                    res.send({
                                        success: true,
                                        message: 'Sinkronisasi Update / Update Data Penimbangan Berhasil'
                                    });
                                } else {
                                    res.send({
                                        success: false,
                                        message: 'Update Status Penimbangan Gagal ' + resp.data.message,
                                    });
                                }

                            } else {
                                console.log(resp.data, 'SINKRONISASI UPDATE DATA GAGAL ' + resp.data.message);
                                res.send({
                                    success: false,
                                    message: 'Sinkronisasi Update / Update Data Penimbangan Gagal ' + resp.data.message,
                                });
                            }
                        }).catch((error) => {
                            // console.log(error);
                            console.log('SINKRONISASI UPDATE DATA GAGAL');
                            res.send({
                                success: false,
                                message: `Sinkronisasi Update / Update Data Penimbangan Gagal. ${error}`,
                            });
                        });
                    } else {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'post', 'v2pv/penimbangan/create', data_req).then(async (resp) => {
                            if (resp.data.success) {
                                console.log('SINKRONISASI DATA INSERT BERHASIL');
                                var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_penimbangan');
                                console.log('UPDATE STATUS : ', update_status);
                                if (update_status == 1) {
                                    res.send({
                                        success: true,
                                        message: 'Sinkronisasi Insert / Insert Data Penimbangan Berhasil'
                                    });
                                } else {
                                    res.send({
                                        success: false,
                                        message: 'Update Status Penimbangan Gagal',
                                    });
                                }

                            } else {
                                console.log(resp.data, 'SINKRONISASI INSERT DATA GAGAL');
                                res.send({
                                    success: false,
                                    message: 'Sinkronisasi Insert / Insert Data Penimbangan Gagal',
                                });
                            }
                        }).catch((error) => {
                            // console.log(error);
                            console.log('SINKRONISASI INSERT DATA GAGAL');
                            res.send({
                                success: false,
                                message: `Sinkronisasi Insert / Insert Data Penimbangan Gagal. ${error}`,
                            });
                        });
                    }


                    /*
                    var data_req = req.body;
                    await syncToPostServer(req.token.id, 'post', 'v2pv/penimbangan/create', data_req).then(async (resp) => {
                        if (resp.data.success) {
                            console.log('SINKRONISASI DATA BERHASIL');
                            var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_penimbangan');
                            console.log('UPDATE STATUS : ', update_status);
                            if (update_status == 1) {
                                res.send({
                                    success: true,
                                    message: 'Sinkronisasi / Kirim Data Penimbangan Berhasil'
                                });
                            } else {
                                res.send({
                                    success: false,
                                    message: 'Update Status Penimbangan Gagal',
                                });
                            }

                        } else {
                            console.log(resp.data, 'SINKRONISASI DATA GAGAL');
                            res.send({
                                success: false,
                                message: 'Sinkronisasi / Kirim Data Penimbangan Gagal',
                            });
                        }
                    }).catch((error) => {
                        // console.log(error);
                        console.log('SINKRONISASI DATA GAGAL');
                        res.send({
                            success: false,
                            message: `Sinkronisasi / Kirim Data Penimbangan Gagal. ${error}`,
                        });
                    });
                    */
                }
            }
        } catch (error) {
            console.log(error)
            next(error)
        }

    }

    async function removeFileExist(id) {
        //if (img_path != null) {
        var rowImg = await getImageKendaraan(id);

        if (rowImg != 0) {
            console.log('ROW IMG : ', rowImg);
            var arrImg = rowImg.split('#');
            //console.log(rowImg.split('#').length);
            arrImg.map(async (r, i) => {
                if (fs.existsSync(`${r}`)) {
                    fs.unlink(`${r}`, function (err) {
                        if (err) return console.log(err);
                        console.log('file deleted ' + r + ' successfully');
                    });
                }

                await timer(300);
            })

        }


        //}
    }

    async function getImageKendaraan(id) {
        var sql = `SELECT * FROM jt_penimbangan WHERE id = '${id}'`;
        console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        var arrImg = [];

        if (result.length > 0) {
            const fotoDepan = config.path_upload + '/penimbangan/' + result[0].foto_depan;
            const fotoBelakang = config.path_upload + '/penimbangan/' + result[0].foto_belakang;
            const fotoKiri = config.path_upload + '/penimbangan/' + result[0].foto_kiri;
            const fotoKanan = config.path_upload + '/penimbangan/' + result[0].foto_kanan;

            arrImg.push({
                'fotoDepan': fotoDepan,
                'fotoBelakang': fotoBelakang,
                'fotoKiri': fotoKiri,
                'fotoKanan': fotoKanan
            })

            return `${fotoDepan}#${fotoBelakang}#${fotoKiri}#${fotoKanan}`;
        } else {
            return 0;
        }
    }

    const updateTrxByKode = async (req, res, next) => {
        console.log("--------------------::Processing Update By Kode Transaksi::--------------------");
        const t = await sequelize.transaction();
        try {
            var komoditi = req.body.komoditi;
            var arrkomoditi = komoditi ? komoditi.split(',') : '';

            var dokumen = req.body.dokumen;
            var arrdokumen = dokumen ? dokumen.split(',') : '';

            var pelanggaran = req.body.pelanggaran;
            console.log('PELANGGARAN : ', pelanggaran);
            var arrpelanggaran = pelanggaran ? pelanggaran.split(',') : '';
            var no_uji = req.body.no_uji;
            var replace_space = no_uji.replace(/\s/g, '');
            var no_uji_fix = replace_space.toUpperCase();

            var gandengan_no_uji = req.body.gandengan_no_uji;
            var gandengan_no_uji_replace_space = gandengan_no_uji.replace(/\s/g, '');
            var gandengan_no_uji_fix = gandengan_no_uji_replace_space.toUpperCase();

            var sql = `UPDATE jt_penimbangan SET
                            kode_trx = '${req.body.kode_trx}',
                            regu_id = ${req.body.regu_id},
                            kode_uppkb = '${req.body.kode_uppkb}',
                            timbangan_id = ${req.body.timbangan_id},
                            tgl_penimbangan = '${moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss')}',
                            no_kendaraan = '${req.body.no_kendaraan.toUpperCase()}',
                            no_uji = '${no_uji_fix}',
                            tgl_uji = '${moment(req.body.tgl_uji).format('YYYY-MM-DD')}',
                            tgl_masa_berlaku = '${moment(req.body.tgl_masa_berlaku).format('YYYY-MM-DD')}',
                            nama_pemilik = '${req.body.nama_pemilik}',
                            alamat_pemilik = '${req.body.alamat_pemilik}',
                            asal_kota_id = ${req.body.asal_kota_id},
                            tujuan_kota_id = ${req.body.tujuan_kota_id},
                            toleransi_komoditi = ${req.body.toleransi_komoditi},
                            toleransi_uppkb = ${req.body.toleransi_uppkb},
                            berat_timbang = ${req.body.berat_timbang},
                            jbi_uji = ${req.body.jbi_uji},
                            kelebihan_berat = ${req.body.kelebihan_berat},
                            prosen_lebih = ${req.body.prosen_lebih},
                            is_gandengan = ${req.body.is_gandengan},
                            is_transaksi = ${req.body.is_transaksi},
                            updated_at = '${req.body.updated_at}',
                            updated_by = ${req.body.updated_by},
                            is_deleted = ${req.body.is_deleted},
                            nama_pengemudi = '${req.body.nama_pengemudi}',
                            alamat_pengemudi = '${req.body.alamat_pengemudi}',
                            jenis_kendaraan_id = ${req.body.jenis_kendaraan_id},
                            gol_sim_id = ${req.body.gol_sim_id},
                            is_melanggar = ${req.body.is_melanggar},
                            is_active = ${req.body.iact},
                            gandengan_no_uji = '${gandengan_no_uji_fix}',
                            gandengan_tgl_uji = '${req.body.gandengan_tgl_uji}',
                            gandengan_masa_berlaku = '${req.body.gandengan_masa_berlaku}',
                            gandengan_jbi_uji = ${req.body.gandengan_jbi_uji},
                            gandengan_jbki = ${req.body.gandengan_jbki},
                            jbb_uji = ${req.body.jbb_uji},
                            jbkb_uji = ${req.body.jbkb_uji},
                            mst_uji = ${req.body.mst_uji},
                            kategori_kepemilikan_id = ${req.body.kategori_kepemilikan_id},
                            foto_depan = '${req.body.foto_depan}',
                            foto_depan_url = '${req.body.foto_depan_url}',
                            foto_belakang = '${req.body.foto_belakang}',
                            foto_belakang_url = '${req.body.foto_belakang_url}',
                            foto_kiri = '${req.body.foto_kiri}',
                            foto_kiri_url = '${req.body.foto_kiri_url}',
                            foto_kanan = '${req.body.foto_kanan}',
                            foto_kanan_url = '${req.body.foto_kanan_url}',
                            jenis_kendaraan = '${req.body.jenis_kendaraan}',
                            sumbu = '${req.body.sumbu}',
                            sumbu_id = ${req.body.sumbu_id},
                            pemilik_komoditi = '${req.body.pemilik_komoditi}',
                            alamat_pemilik_komoditi = '${req.body.alamat_pemilik_komoditi}',
                            no_sim = '${req.body.no_sim}',
                            tgl_antrian = '${moment(req.body.tgl_antrian).format('YYYY-MM-DD HH:mm:ss')}',
                            no_surat_jalan = '${req.body.no_surat_jalan}',
                            panjang_utama = ${req.body.panjang_utama},
                            panjang_toleransi = ${req.body.panjang_toleransi},
                            panjang_ukur = ${req.body.panjang_ukur},
                            panjang_lebih = ${req.body.panjang_lebih},
                            lebar_utama = ${req.body.lebar_utama},
                            lebar_toleransi = ${req.body.lebar_toleransi},
                            lebar_ukur = ${req.body.lebar_ukur},
                            lebar_lebih = ${req.body.lebar_lebih},
                            tinggi_utama = ${req.body.tinggi_utama},
                            tinggi_toleransi = ${req.body.tinggi_toleransi},
                            tinggi_ukur = ${req.body.tinggi_ukur},
                            tinggi_lebih = ${req.body.tinggi_lebih},
                            foh_utama = ${req.body.foh_utama},
                            foh_toleransi = ${req.body.foh_toleransi},
                            foh_ukur = ${req.body.foh_ukur},
                            foh_lebih = ${req.body.foh_lebih},
                            roh_utama = ${req.body.roh_utama},
                            roh_toleransi = ${req.body.roh_toleransi},
                            roh_ukur = ${req.body.roh_ukur},
                            roh_lebih = ${req.body.roh_lebih},
                            asal_kode_kota = '${req.body.asal_kode_kota}',
                            tujuan_kode_kota = '${req.body.tujuan_kode_kota}',
                            device_id = ${req.body.device_id},
                            lokasi_id = ${req.body.lokasi_id},
                            umur_pengemudi = ${req.body.umur_pengemudi},
                            use_toleransi = ${req.body.use_toleransi},
                            is_surat_tilang = ${req.body.is_surat_tilang},
                            no_ba_tilang = '${req.body.no_ba_tilang}',
                            komoditi_id = ${req.body.komoditi_id},
                            petugas_id = ${req.body.petugas_id},
                            shift_id = ${req.body.shift_id},
                            kategori_komoditi_id = ${req.body.kategori_komoditi_id},
                            created_at = '${moment(req.body.created_at).format('YYYY-MM-DD HH:mm:ss')}',
                            is_tindakan = ${req.body.is_tindakan},
                            bptd_id = ${req.body.bptd_id},
                            is_transfer = ${req.body.is_transfer},
                            status_transfer = ${req.body.status_transfer},
                            plate_no_img_name = '${req.body.plate_no_img_name}',
                            plate_no_img_url = '${req.body.plate_no_img_url}',
                            plate_no_confidance = ${req.body.plate_no_confidance ? req.body.plate_no_confidance : null},
                            wim_berat = ${req.body.wim_berat},
                            wim_panjang = ${req.body.wim_panjang},
                            wim_lebar = ${req.body.wim_lebar},
                            wim_tinggi = ${req.body.wim_tinggi},
                            wim_foh = ${req.body.wim_foh},
                            wim_roh = ${req.body.wim_roh},
                            wim_kec = ${req.body.wim_kec}
                        WHERE
                            LOWER(kode_trx) = LOWER(:kode_trx) AND tgl_penimbangan = :tgl_penimbangan AND LOWER(no_kendaraan) = LOWER(:no_kendaraan)`;

            const res_update = await sequelize.query(sql, {
                replacements: { kode_trx: req.body.kode_trx, tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), no_kendaraan: req.body.no_kendaraan.toUpperCase() },
                logging: false
            }, { transaction: t })

            await t.commit();
            if (res_update[1].command == 'UPDATE') {
                var exist_kode_trx = req.body.kode_trx;
                if (exist_kode_trx) {
                    var upsert_muatan = await upsert_komoditi(arrkomoditi, exist_kode_trx, req.body.no_kendaraan.toUpperCase(), moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                    console.log('UPSERT MUATAN : ', upsert_muatan);

                    var upsertpelanggaran = await upsert_pelanggaran(arrpelanggaran, exist_kode_trx, req.body.no_kendaraan.toUpperCase(), moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD'), req.token.id);
                    console.log('UPSERT PELANGGARAN : ', upsertpelanggaran);

                    var movedoc = await moveRowDocumentTemp(arrdokumen, exist_kode_trx, req.body.no_kendaraan.toUpperCase(), moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), req.body.kode_uppkb, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                    console.log('MOVE DOC ', movedoc);
                    // if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    //     if (req.body.is_transaksi == 1) {
                    //         var data_req = req.body;

                    //         await syncToPostServer(req.token.id, 'post', 'v2pv/penimbangan/create', data_req).then(async (resp) => {
                    //             if (resp.data.success) {
                    //                 console.log('SINKRONISASI DATA BERHASIL');
                    //                 await updateStatusSyncToPusat(id, 'jt_penimbangan');
                    //             } else {
                    //                 console.log('SINKRONISASI DATA GAGAL');
                    //             }
                    //         }).catch((error) => {
                    //             console.log(error);
                    //             console.log('SINKRONISASI DATA GAGAL');
                    //         });
                    //     }
                    // }
                }
                res.send({
                    success: true,
                    message: messageService().UPDATE_SUCCESS
                });
            } else {
                res.send({
                    success: false,
                    message: messageService().UPDATE_FAILED
                });
            }
        } catch (error) {
            console.log(error);
            await t.rollback();
        }

    }

    const updateTrxByKodePelanggaran = async (req, res, next) => {
        console.log("--------------------::Processing Update By Kode Transaksi::--------------------");
        const t = await sequelize.transaction();
        try {
            var komoditi = req.body.komoditi;
            var arrkomoditi = komoditi ? komoditi.split(',') : '';

            var dokumen = req.body.dokumen;
            var arrdokumen = dokumen ? dokumen.split(',') : '';

            var pelanggaran = req.body.pelanggaran;
            console.log('PELANGGARAN : ', pelanggaran);
            var arrpelanggaran = pelanggaran ? pelanggaran.split(',') : '';
            var no_uji = req.body.no_uji;
            var replace_space = no_uji.replace(/\s/g, '');
            var no_uji_fix = replace_space.toUpperCase();

            var gandengan_no_uji = req.body.gandengan_no_uji;
            var gandengan_no_uji_replace_space = gandengan_no_uji.replace(/\s/g, '');
            var gandengan_no_uji_fix = gandengan_no_uji_replace_space.toUpperCase();

            var sql = `UPDATE jt_penimbangan SET
                            kode_trx = '${req.body.kode_trx}',
                            regu_id = ${req.body.regu_id},
                            kode_uppkb = '${req.body.kode_uppkb}',
                            timbangan_id = ${req.body.timbangan_id},
                            tgl_penimbangan = '${moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss')}',
                            no_kendaraan = '${req.body.no_kendaraan.toUpperCase()}',
                            no_uji = '${no_uji_fix}',
                            tgl_uji = '${moment(req.body.tgl_uji).format('YYYY-MM-DD')}',
                            tgl_masa_berlaku = '${moment(req.body.tgl_masa_berlaku).format('YYYY-MM-DD')}',
                            nama_pemilik = '${req.body.nama_pemilik}',
                            alamat_pemilik = '${req.body.alamat_pemilik}',
                            asal_kota_id = ${req.body.asal_kota_id},
                            tujuan_kota_id = ${req.body.tujuan_kota_id},
                            toleransi_komoditi = ${req.body.toleransi_komoditi},
                            toleransi_uppkb = ${req.body.toleransi_uppkb},
                            berat_timbang = ${req.body.berat_timbang},
                            jbi_uji = ${req.body.jbi_uji},
                            kelebihan_berat = ${req.body.kelebihan_berat},
                            prosen_lebih = ${req.body.prosen_lebih},
                            is_gandengan = ${req.body.is_gandengan},
                            is_transaksi = ${req.body.is_transaksi},
                            updated_at = '${req.body.updated_at}',
                            updated_by = ${req.body.updated_by},
                            is_deleted = ${req.body.is_deleted},
                            nama_pengemudi = '${req.body.nama_pengemudi}',
                            alamat_pengemudi = '${req.body.alamat_pengemudi}',
                            jenis_kendaraan_id = ${req.body.jenis_kendaraan_id},
                            gol_sim_id = ${req.body.gol_sim_id},
                            is_melanggar = ${req.body.is_melanggar},
                            is_active = ${req.body.iact},
                            gandengan_no_uji = '${gandengan_no_uji_fix}',
                            gandengan_tgl_uji = '${req.body.gandengan_tgl_uji}',
                            gandengan_masa_berlaku = '${req.body.gandengan_masa_berlaku}',
                            gandengan_jbi_uji = ${req.body.gandengan_jbi_uji},
                            gandengan_jbki = ${req.body.gandengan_jbki},
                            jbb_uji = ${req.body.jbb_uji},
                            jbkb_uji = ${req.body.jbkb_uji},
                            mst_uji = ${req.body.mst_uji},
                            kategori_kepemilikan_id = ${req.body.kategori_kepemilikan_id},
                            foto_depan = '${req.body.foto_depan}',
                            foto_depan_url = '${req.body.foto_depan_url}',
                            foto_belakang = '${req.body.foto_belakang}',
                            foto_belakang_url = '${req.body.foto_belakang_url}',
                            foto_kiri = '${req.body.foto_kiri}',
                            foto_kiri_url = '${req.body.foto_kiri_url}',
                            foto_kanan = '${req.body.foto_kanan}',
                            foto_kanan_url = '${req.body.foto_kanan_url}',
                            jenis_kendaraan = '${req.body.jenis_kendaraan}',
                            sumbu = '${req.body.sumbu}',
                            sumbu_id = ${req.body.sumbu_id},
                            pemilik_komoditi = '${req.body.pemilik_komoditi}',
                            alamat_pemilik_komoditi = '${req.body.alamat_pemilik_komoditi}',
                            no_sim = '${req.body.no_sim}',
                            tgl_antrian = '${moment(req.body.tgl_antrian).format('YYYY-MM-DD HH:mm:ss')}',
                            no_surat_jalan = '${req.body.no_surat_jalan}',
                            panjang_utama = ${req.body.panjang_utama},
                            panjang_toleransi = ${req.body.panjang_toleransi},
                            panjang_ukur = ${req.body.panjang_ukur},
                            panjang_lebih = ${req.body.panjang_lebih},
                            lebar_utama = ${req.body.lebar_utama},
                            lebar_toleransi = ${req.body.lebar_toleransi},
                            lebar_ukur = ${req.body.lebar_ukur},
                            lebar_lebih = ${req.body.lebar_lebih},
                            tinggi_utama = ${req.body.tinggi_utama},
                            tinggi_toleransi = ${req.body.tinggi_toleransi},
                            tinggi_ukur = ${req.body.tinggi_ukur},
                            tinggi_lebih = ${req.body.tinggi_lebih},
                            foh_utama = ${req.body.foh_utama},
                            foh_toleransi = ${req.body.foh_toleransi},
                            foh_ukur = ${req.body.foh_ukur},
                            foh_lebih = ${req.body.foh_lebih},
                            roh_utama = ${req.body.roh_utama},
                            roh_toleransi = ${req.body.roh_toleransi},
                            roh_ukur = ${req.body.roh_ukur},
                            roh_lebih = ${req.body.roh_lebih},
                            asal_kode_kota = '${req.body.asal_kode_kota}',
                            tujuan_kode_kota = '${req.body.tujuan_kode_kota}',
                            device_id = ${req.body.device_id},
                            lokasi_id = ${req.body.lokasi_id},
                            umur_pengemudi = ${req.body.umur_pengemudi},
                            use_toleransi = ${req.body.use_toleransi},
                            is_surat_tilang = ${req.body.is_surat_tilang},
                            no_ba_tilang = '${req.body.no_ba_tilang}',
                            komoditi_id = ${req.body.komoditi_id},
                            petugas_id = ${req.body.petugas_id},
                            shift_id = ${req.body.shift_id},
                            kategori_komoditi_id = ${req.body.kategori_komoditi_id},
                            created_at = '${moment(req.body.created_at).format('YYYY-MM-DD HH:mm:ss')}',
                            is_tindakan = ${req.body.is_tindakan},
                            bptd_id = ${req.body.bptd_id},
                            is_transfer = ${req.body.is_transfer},
                            status_transfer = ${req.body.status_transfer},
                            plate_no_img_name = '${req.body.plate_no_img_name}',
                            plate_no_img_url = '${req.body.plate_no_img_url}',
                            plate_no_confidance = ${req.body.plate_no_confidance ? req.body.plate_no_confidance : null},
                            wim_berat = ${req.body.wim_berat},
                            wim_panjang = ${req.body.wim_panjang},
                            wim_lebar = ${req.body.wim_lebar},
                            wim_tinggi = ${req.body.wim_tinggi},
                            wim_foh = ${req.body.wim_foh},
                            wim_roh = ${req.body.wim_roh},
                            wim_kec = ${req.body.wim_kec}
                        WHERE
                            LOWER(kode_trx) = LOWER(:kode_trx) AND tgl_penimbangan = :tgl_penimbangan AND LOWER(no_kendaraan) = LOWER(:no_kendaraan)`;

            const res_update = await sequelize.query(sql, {
                replacements: { kode_trx: req.body.kode_trx, tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), no_kendaraan: req.body.no_kendaraan.toUpperCase() },
                logging: false
            }, { transaction: t })

            await t.commit();
            if (res_update[1].command == 'UPDATE') {
                var exist_kode_trx = req.body.kode_trx;
                if (exist_kode_trx) {
                    // var upsert_muatan = await upsert_komoditi(arrkomoditi, exist_kode_trx, req.body.no_kendaraan, moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                    // console.log('UPSERT MUATAN : ', upsert_muatan);

                    var upsertpelanggaran = await upsert_pelanggaran(arrpelanggaran, exist_kode_trx, req.body.no_kendaraan.toUpperCase(), moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD'), req.token.id);
                    console.log('UPSERT PELANGGARAN : ', upsertpelanggaran);

                    // var movedoc = await moveRowDocumentTemp(arrdokumen, exist_kode_trx, req.body.no_kendaraan, moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), req.body.kode_uppkb, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                    // console.log('MOVE DOC ', movedoc);
                    // if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    //     if (req.body.is_transaksi == 1) {
                    //         var data_req = req.body;

                    //         await syncToPostServer(req.token.id, 'post', 'v2pv/penimbangan/create', data_req).then(async (resp) => {
                    //             if (resp.data.success) {
                    //                 console.log('SINKRONISASI DATA BERHASIL');
                    //                 await updateStatusSyncToPusat(id, 'jt_penimbangan');
                    //             } else {
                    //                 console.log('SINKRONISASI DATA GAGAL');
                    //             }
                    //         }).catch((error) => {
                    //             console.log(error);
                    //             console.log('SINKRONISASI DATA GAGAL');
                    //         });
                    //     }
                    // }
                }
                res.send({
                    success: true,
                    message: messageService().UPDATE_SUCCESS
                });
            } else {
                res.send({
                    success: false,
                    message: messageService().UPDATE_FAILED
                });
            }
        } catch (error) {
            console.log(error);
            await t.rollback();
        }

    }

    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update Penimbangan::--------------------");

        try {
            const id = req.params.id;

            if (id) {
                // if (req.body.no_kendaraan != '') {
                //     var is_no_kendaraan = await getIsNoKendaraanStatus(req.body.no_kendaraan, moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
                //     console.log('IS NO KENDARAAN : ', is_no_kendaraan);
                //     if (is_no_kendaraan) {
                //     }
                // }
                var exist_kode_trx = await getExistKodeTrxById(id);
                var kode_trx = req.body.kode_trx ? req.body.kode_trx : await genCodeTrxPenimbangan(req.body.kode_uppkb, moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
                var bptd_id = await getBptdId(req.body.kode_uppkb);
                var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
                var kelebihan_berat = await kelebihanBerat(Number(req.body.berat_timbang), Number(req.body.jbi_uji));
                var prosen_kelebihan_berat = await prosenKelebihanBerat(Number(req.body.berat_timbang), Number(req.body.jbi_uji));
                var komoditi = req.body.komoditi;
                var arrkomoditi = komoditi ? komoditi.split(',') : '';

                var dokumen = req.body.dokumen;
                var arrdokumen = dokumen ? dokumen.split(',') : '';

                var pelanggaran = req.body.pelanggaran;
                // console.log('PELANGGARAN : ',pelanggaran);
                var arrpelanggaran = pelanggaran ? pelanggaran.split(',') : '';

                var is_melanggar = false; // await getIsMelanggarDokumen(arrdokumen.length);
                if (arrpelanggaran.length > 0) {
                    is_melanggar = true;
                } else {
                    is_melanggar = false;
                }

                var is_transfer = false;
                if (prosen_kelebihan_berat > 20) {
                    is_transfer = true;
                }

                var apiKey = process.env.API_KEY_PAN_BALI;
                var platformName = process.env.PLATFORM_NAME_PAN_BALI;
                var payload = {
                    e_manifest_number: req.body.no_surat_jalan,
                    inspection_date: moment().format(),
                    load_commodity_name: arrkomoditi,
                    vehicle_plate_number: req.body.no_kendaraan.toUpperCase(),
                    weight_scale: Number(req.body.berat_timbang) || 0,
                };

                var isUseToleransiTrx = await useToleransiTrx(komoditi, req.body.kode_uppkb);
                var useTolTrx = isUseToleransiTrx.split(',');
                let komoditi_kategori = useTolTrx[2];//getKategoriKomoditi(arrkomoditi[0]);
                let toleransi_komoditi_uppkb = useTolTrx[1]; //await getToleransiUppkbKomoditi(req.body.kode_uppkb, arrkomoditi[0]);
                let jenis_kendaraan_id = req.body.jenis_kendaraan ? await getJenisKendaraanId(req.body.jenis_kendaraan) : null;
                let sumbu_id = req.body.sumbu ? await getSumbuId(req.body.sumbu) : null;
                console.log(useTolTrx[2]);
                console.log('TOLERANSI KATEGORI : ', komoditi_kategori, ' TOLERANSI UPPKB : ', toleransi_komoditi_uppkb);
                console.log('JENIS KENDARAAN ID : ', jenis_kendaraan_id, ' SUMBU ID : ', sumbu_id);
                console.log('MASA BERLAKU : ', req.body.masa_berlaku, ' TANGGAL UJI : ', moment(req.body.masa_berlaku).subtract(6, 'months').format('YYYY-MM-DD'))
                var imgArr = [];
                var imgArrUrl = [];
                let uploads = [];
                var dataFoto = {
                    foto_depan: '',
                    foto_belakang: '',
                    foto_kiri: '',
                    foto_kanan: '',
                    foto_depan_url: '',
                    foto_belakang_url: '',
                    foto_kiri_url: '',
                    foto_kanan_url: '',
                    foto_plate_no: '',
                    foto_plate_no_url: '',
                    plate_no_img_name: '',
                    plate_no_img_url: '',
                }

                // if (req.files) {
                //     // console.log('FOTO DEPAN : ', req.files.fotoDepan);
                //     var uploadFotoDepan = await uploadImage(req.body.no_kendaraan, req.files.fotoDepan);
                //     var uploadFotoBelakang = await uploadImage(req.body.no_kendaraan, req.files.fotoBelakang);
                //     var uploadFotoKiri = await uploadImage(req.body.no_kendaraan, req.files.fotoKiri);
                //     var uploadFotoKanan = await uploadImage(req.body.no_kendaraan, req.files.fotoKanan);
                //     var uploadFotoPlatNo = await uploadImage(req.body.no_kendaraan, req.files.fotoPlateNo);

                //     dataFoto = {
                //         foto_depan: uploadFotoDepan.imgName || '',
                //         foto_belakang: uploadFotoBelakang.imgName || '',
                //         foto_kiri: uploadFotoKiri.imgName || '',
                //         foto_kanan: uploadFotoKanan.imgName || '',
                //         foto_depan_url: uploadFotoDepan.imgUrl || '',
                //         foto_belakang_url: uploadFotoBelakang.imgUrl || '',
                //         foto_kiri_url: uploadFotoKiri.imgUrl || '',
                //         foto_kanan_url: uploadFotoKanan.imgUrl || '',
                //         plate_no_img_name: uploadFotoPlatNo.imgName || '',
                //         plate_no_img_url: uploadFotoPlatNo.imgUrl || '',
                //     }
                //     await removeFileExist(id);
                //     console.log('DATA FOTO : ', dataFoto);
                // }

                if (process.env.IS_KEMENHUB == 0) {
                    if (req.files) {
                        // console.log('FOTO DEPAN : ', req.files.fotoDepan);
                        var uploadFotoDepan = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoDepan);
                        var uploadFotoBelakang = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoBelakang);
                        var uploadFotoKiri = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoKiri);
                        var uploadFotoKanan = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoKanan);
                        var uploadFotoPlatNo = await uploadImage(req.body.no_kendaraan, 'penimbangan', req.files.fotoPlateNo);

                        dataFoto = {
                            foto_depan: uploadFotoDepan.imgName || '',
                            foto_belakang: uploadFotoBelakang.imgName || '',
                            foto_kiri: uploadFotoKiri.imgName || '',
                            foto_kanan: uploadFotoKanan.imgName || '',
                            foto_depan_url: uploadFotoDepan.imgUrl || '',
                            foto_belakang_url: uploadFotoBelakang.imgUrl || '',
                            foto_kiri_url: uploadFotoKiri.imgUrl || '',
                            foto_kanan_url: uploadFotoKanan.imgUrl || '',
                            plate_no_img_name: uploadFotoPlatNo.imgName || '',
                            plate_no_img_url: uploadFotoPlatNo.imgUrl || '',
                        }
                    }

                    if (req.body.is_transaksi == 1 && req.body.device_id != 4 && req.files == null) {
                        var captureCam = await captureImg(req.body.kode_uppkb, lokasi_id, req.body.no_kendaraan, req.body.timbangan_id);

                        if (captureCam) {
                            if (Object.keys(captureCam).length > 0) {
                                dataFoto = {
                                    foto_depan: captureCam[0].filename || '',
                                    foto_belakang: captureCam[1].filename || '',
                                    foto_kiri: '',
                                    foto_kanan: '',
                                    foto_depan_url: captureCam[0].imageUrl || '',
                                    foto_belakang_url: captureCam[1].imageUrl || '',
                                    foto_kiri_url: '',
                                    foto_kanan_url: '',
                                    plate_no_img_name: '',
                                    plate_no_img_url: '',
                                }
                            }
                        }
                    }
                }

                Promise.all(uploads).then(async () => {
                    console.log('UPDATE WITH PHOTO');


                    return sequelize.transaction().then(async (t) => {
                        return t_penimbangan.update({
                            // kode_trx: kode_trx || req.body.kode_trx,
                            regu_id: req.body.regu_id ? req.body.regu_id : null,
                            shift_id: req.body.shift_id ? req.body.shift_id : null,
                            petugas_id: req.body.petugas_id ? req.body.petugas_id : null,
                            bptd_id: bptd_id,
                            lokasi_id: lokasi_id,
                            kode_uppkb: req.body.kode_uppkb,
                            timbangan_id: req.body.timbangan_id ? req.body.timbangan_id : null,
                            tgl_penimbangan: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'),
                            tgl_antrian: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') || moment(req.body.tgl_antrian).format('YYYY-MM-DD HH:mm:ss'),
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
                            toleransi_komoditi: komoditi_kategori || 0,//komoditi_kategori.prosen_tolerasi,// || req.body.toleransi_komoditi,
                            toleransi_uppkb: toleransi_komoditi_uppkb || 0, //(toleransi_komoditi_uppkb.prosen_toleransi) ? toleransi_komoditi_uppkb.prosen_toleransi:toleransi_komoditi_uppkb,//req.body.toleransi_uppkb_id,
                            berat_timbang: Number(req.body.berat_timbang),
                            jbi_uji: Number(req.body.jbi_uji) || 0,
                            mst_uji: Number(req.body.mst_uji) || 0,
                            // jbb_uji: req.body.jbb_uji,
                            // jbkb_uji: req.body.jbkb_uji,
                            kelebihan_berat: kelebihan_berat || 0, //req.body.kelebihan_berat,
                            prosen_lebih: prosen_kelebihan_berat || 0,
                            use_toleransi: useTolTrx[0] || 0,
                            // jenis_pelanggaran: req.body.jenis_pelanggaran,
                            is_gandengan: req.body.is_gandengan ? req.body.is_gandengan : false,
                            is_transaksi: req.body.is_transaksi,
                            is_transfer: is_transfer,
                            //device_id: req.body.device_id,
                            komoditi_id: (useTolTrx[3] != 'undefined') ? useTolTrx[3] : null,
                            kategori_komoditi_id: (useTolTrx[4] != 'undefined') ? useTolTrx[3] : null,
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
                            // wim_berat: req.body.wim_berat,
                            // wim_panjang: req.body.wim_panjang,
                            // wim_lebar: req.body.wim_lebar,
                            // wim_tinggi: req.body.wim_tinggi,
                            // wim_foh: req.body.wim_foh,
                            // wim_roh: req.body.wim_roh,
                            // wim_kec: req.body.wim_kec,
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
                            ...dataFoto,
                            plate_no_confidance: req.body.plate_no_confidance,
                            updated_by: req.token.id,
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        }, { where: { id: id }, transaction: t }).then(async (num) => {
                            // Commit di luar try: perubahan sudah permanen, kegagalan efek
                            // samping di bawah tidak boleh membalik respons jadi gagal.
                            await t.commit();

                            var gate_status = 'TIDAK DIPROSES';

                            try {
                                if (exist_kode_trx) {
                                    var upsert_muatan = await upsert_komoditi(arrkomoditi, exist_kode_trx, req.body.no_kendaraan.toUpperCase(), moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                    console.log('UPSERT MUATAN : ', upsert_muatan);

                                    var upsertpelanggaran = await upsert_pelanggaran(arrpelanggaran, exist_kode_trx, req.body.no_kendaraan.toUpperCase(), moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'), req.body.kode_uppkb, moment().format('YYYY-MM-DD'), req.token.id);
                                    console.log('UPSERT PELANGGARAN : ', upsertpelanggaran);

                                    var movedoc = await moveRowDocumentTemp(arrdokumen, exist_kode_trx, req.body.no_kendaraan.toUpperCase(), moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'), req.body.kode_uppkb, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                    console.log('MOVE DOC ', movedoc);
                                    if (isSyncFromPenimbangan() && process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                                        if (req.body.is_transaksi == 1) {
                                            var data_req = req.body;
                                            const capturedImages = {
                                                fotoDepan: path.join(config.path_upload) + '/penimbangan/' + dataFoto.foto_depan,
                                                fotoBelakang: path.join(config.path_upload) + '/penimbangan/' + dataFoto.foto_belakang,
                                            };
                                            var data_sync = {
                                                kode_trx: exist_kode_trx,
                                                ...data_req,
                                                ...dataFoto,
                                                ...capturedImages
                                            }
                                            await syncToPostServerWithImage(req.token.id, 'post', 'v2pv/penimbangan/create', data_sync).then(async (resp) => {
                                                if (resp.data.success) {
                                                    console.log('SINKRONISASI DATA BERHASIL');
                                                    await updateStatusSyncToPusat(id, 'jt_penimbangan');
                                                } else {
                                                    console.log(resp.data);
                                                    console.log('SINKRONISASI DATA GAGAL');
                                                }
                                            }).catch((error) => {
                                                console.log(error);
                                                console.log('SINKRONISASI DATA GAGAL');
                                            });
                                        }
                                    }

                                    if (process.env.IS_KEMENHUB == 0) {
                                        gate_status = await openCloseGate(req.body.kode_uppkb, req.body.timbangan_id, 1, 1)
                                            .then(() => 'TERBUKA')
                                            .catch((errGate) => {
                                                console.log('GATE CONTROL GAGAL : ', errGate);
                                                return 'GAGAL';
                                            });
                                    }

                                    if (process.env.IS_KEMENHUB == 0 && process.env.IS_INTEGRASI_WIM == 1) {
                                        await cekExistsVerifikasi(id);
                                    }

                                    if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                                        if (req.body.is_transaksi == 1) {
                                            var postpanbali = await syncToPostPanBali(apiKey, platformName, payload).then((res) => {
                                                console.log('POST DATA PAN BALI BERHASIL');
                                                console.log('RESPOND PAN BALI : ', res);
                                            }).catch((error) => {
                                                console.log(error);
                                                console.log('POST DATA PAN BALI GAGAL');
                                            });
                                        }
                                    }
                                }
                            } catch (error) {
                                // Perubahan sudah tersimpan permanen di atas.
                                // Kegagalan di sini hanya dicatat, tidak membatalkan apa pun.
                                console.log('EFEK SAMPING PASCA-UBAH GAGAL : ', error);
                            }

                            res.send({
                                success: true,
                                message: messageService().UPDATE_SUCCESS,
                                gate_status: gate_status
                            });
                        }).catch(function (err) {
                            t.rollback().catch(() => { });
                            next(err)
                        });
                    });
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({
                        success: false,
                        message: err
                    })
                });
            } else {
                res.send({
                    success: false,
                    message: `${messageService().UPDATE_FAILED} | ID Kosong`
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_penimbangan.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
                    logging: false
                }
            ).then(num => {
                if (num == resSplit.length) {
                    res.send({
                        success: true,
                        message: messageService().UPDATE_STATUS_SUCCESS
                    });
                } else {
                    res.status(204).send({
                        success: false,
                        message: messageService().UPDATE_STATUS_FAILED
                    });
                }
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: `${messageService().UPDATE_STATUS_FAILED}. ${err}`
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const remove = async (req, res, next) => {
        console.log("--------------------::Processing Delete::--------------------");

        const id = req.params.id;
        try {
            t_penimbangan.destroy({
                where: { id: id }
            }).then(num => {
                if (num == 1) {
                    res.json({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                } else {
                    res.json({
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });
        } catch (error) {
            next(error)
        }
    }
    
    const removeArr = async (req, res, next) => {
        console.log("--------------------::Processing Delete All::--------------------");
        var q = req.query.arrId;
        var resSplit = q.split(",").map(i => i);
        try {
            t_penimbangan.destroy({
                where: { id: { [Op.in]: resSplit } }
            }).then(num => {
                if (num == resSplit.length) {
                    //if(i == resSplit.length){

                    res.json({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });

                    //}   
                } else {
                    res.json({
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });

        } catch (error) {
            next(error)
        }

    }

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");

        const id = req.params.id;
        try {
            t_penimbangan.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: id },
                    logging: false
                }
            ).then(num => {
                if (num == 1) {
                    res.send({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                } else {
                    res.status(204).send({
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });
                }
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => i);

            t_penimbangan.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
                    logging: false
                }
            ).then(num => {
                if (num == resSplit.length) {
                    res.send({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                } else {
                    res.status(204).send({
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });
                }
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });
        } catch (error) {
            next(error)
        }

    }

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_penimbangan.destroy(
                { truncate: true, restartIdentity: true, cascade: true }
            );

            res.json({
                success: true,
                message: messageService().TRUNCATE_SUCCESS
            });
            // .then(num => {
            //     res.json({ 
            //         success: true,
            //         message: messageService().REMOVE_SUCCESS
            //     });

            // }).catch(err => {
            //     console.log(err);
            //     res.status(500).json({
            //         success: false,
            //         message: `${messageService().REMOVE_FAILED}. ${err}`
            //     });
            // }); 

        } catch (error) {
            next(error)
        }

    }

    const createSyncWimData = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        try {

            if (req.body.no_kendaraan != '' && req.body.is_transaksi != 2 && req.body.device_id != 3) {
                var is_no_kendaraan = await getIsNoKendaraan(req.body.no_kendaraan.toUpperCase(), moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
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
                        var is_exists_no_trx = await getIsExistsKodeTrxKendaraan(kode_trx, req.body.no_kendaraan.toUpperCase());

                        if (is_exists_no_trx) {
                            var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
                            var bptd_id = await getBptdId(req.body.kode_uppkb);

                            var is_use_jbi = Number(req.body.gandengan_jbki) > 0 ? Number(req.body.gandengan_jbki) : Number(req.body.jbi_uji);
                            var kelebihan_berat = await kelebihanBerat(Number(req.body.berat_timbang), is_use_jbi);
                            var prosen_kelebihan_berat = await prosenKelebihanBerat(Number(req.body.berat_timbang), is_use_jbi);
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

                            var apiKey = process.env.API_KEY_PAN_BALI;
                            var platformName = process.env.PLATFORM_NAME_PAN_BALI;
                            var payload = {
                                e_manifest_number: req.body.no_surat_jalan,
                                inspection_date: moment().format(),
                                load_commodity_name: arrkomoditi,
                                vehicle_plate_number: req.body.no_kendaraan.toUpperCase(),
                                weight_scale: Number(req.body.berat_timbang) || 0,
                            };

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
                                    tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                    tgl_antrian: moment(req.body.tgl_antrian).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
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
                                    created_by: req.token.id,
                                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                }
                                console.log(field)
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

    /**
     * Ambil satu data penimbangan lengkap dengan relasi yang dibutuhkan struk.
     */
    const getPenimbanganStruk = async (conditions) => {
        return t_penimbangan.findOne({
            include: [
                {
                    model: t_lokasi,
                    required: false,
                    as: 'penimbangan_uppkb',
                    attributes: ['id', 'kode', 'nama', 'alamat_uppkb'],
                },
                {
                    model: t_bptd,
                    required: false,
                    as: 'penimbangan_bptd',
                    attributes: ['id', 'kode', 'nama'],
                },
                {
                    model: t_kota_kab,
                    required: false,
                    as: 'penimbanganAsalKota',
                    attributes: ['id', 'kode', 'nama'],
                },
                {
                    model: t_kota_kab,
                    required: false,
                    as: 'penimbanganTujuanKota',
                    attributes: ['id', 'kode', 'nama'],
                },
                {
                    model: t_komoditi,
                    required: false,
                    as: 'penimbanganKomoditi',
                    attributes: ['id', 'kode', 'nama'],
                },
                {
                    model: t_detailmuatan,
                    required: false,
                    as: 'penimbanganDetailMuatan',
                    attributes: ['id', 'kode_trx', 'komoditi_id'],
                    where: { is_deleted: false },
                    include: [
                        {
                            model: t_komoditi,
                            required: false,
                            as: 'detailmuatankomoditi',
                            attributes: ['id', 'kode', 'nama'],
                        }
                    ]
                },
                {
                    model: t_pelanggaran,
                    required: false,
                    as: 'penimbanganPelanggaran',
                    attributes: ['id', 'kode_trx', 'kode_pelanggaran', 'jenis_pelanggaran_id'],
                    where: { is_deleted: false },
                    include: [
                        {
                            model: t_jenis_pelanggaran,
                            required: false,
                            as: 'jenisPelanggaran',
                            attributes: ['id', 'kode', 'nama'],
                        }
                    ]
                },
            ],
            where: conditions,
            logging: false
        });
    }

    /**
     * Ubah row penimbangan menjadi field-field siap cetak pada struk thermal.
     */
    const mapDataStruk = (row) => {
        const angka = (val) => {
            const num = Number(val);
            return Number.isFinite(num) ? Math.round(num) : 0;
        }

        const tanggal = (val, format) => {
            if (!val) return '-';
            const m = moment(val);
            return m.isValid() ? m.format(format) : '-';
        }

        // Komoditi: utamakan detail muatan, fallback ke komoditi utama.
        var arrkomoditi = [];
        if (row.penimbanganDetailMuatan) {
            row.penimbanganDetailMuatan.forEach((val) => {
                if (val.detailmuatankomoditi && val.detailmuatankomoditi.nama) {
                    arrkomoditi.push(val.detailmuatankomoditi.nama);
                }
            });
        }
        if (arrkomoditi.length == 0 && row.penimbanganKomoditi && row.penimbanganKomoditi.nama) {
            arrkomoditi.push(row.penimbanganKomoditi.nama);
        }

        // Nama pelanggaran untuk dicetak, kode pelanggaran (DYA/DIM/PST/DOK/TCM/KLS/RLL)
        // untuk dikembalikan sebagai array pada response.
        var arrpelanggaran = [];
        var arrkodepelanggaran = [];
        if (row.penimbanganPelanggaran) {
            row.penimbanganPelanggaran.forEach((val) => {
                if (val.jenisPelanggaran && val.jenisPelanggaran.nama) {
                    arrpelanggaran.push(val.jenisPelanggaran.nama);
                }
                // Utamakan kode dari master jenis pelanggaran, fallback ke kode di baris transaksi.
                const kode = (val.jenisPelanggaran && val.jenisPelanggaran.kode) || val.kode_pelanggaran;
                if (kode && arrkodepelanggaran.indexOf(String(kode).toUpperCase()) == -1) {
                    arrkodepelanggaran.push(String(kode).toUpperCase());
                }
            });
        }

        // JBI rangkaian dipakai bila kendaraan bergandengan.
        const jbi = Number(row.gandengan_jbki) > 0 ? row.gandengan_jbki : row.jbi_uji;

        const namaUppkb = row.penimbangan_uppkb ? String(row.penimbangan_uppkb.nama).toUpperCase() : '';
        const subJudul = namaUppkb
            ? (namaUppkb.startsWith('UPPKB') ? namaUppkb : `UPPKB ${namaUppkb}`)
            : '';

        const prosen = Number(row.prosen_lebih);

        return {
            judul: 'STRUK PENIMBANGAN KENDARAAN BERMOTOR',
            sub_judul: subJudul,
            tgl_jam: tanggal(row.tgl_penimbangan, 'DD/MM/YYYY HH:mm:ss'),
            no_kendaraan: row.no_kendaraan || '-',
            no_uji: row.no_uji || '-',
            masa_berlaku: tanggal(row.tgl_masa_berlaku, 'DD/MM/YYYY'),
            jbi: `${angka(jbi)} Kg`,
            berat_timbang: `${angka(row.berat_timbang)} Kg`,
            kelebihan_berat: `${angka(row.kelebihan_berat)} Kg`,
            prosen_lebih: `${(Number.isFinite(prosen) ? prosen : 0).toFixed(2)} %`,
            asal: row.penimbanganAsalKota ? String(row.penimbanganAsalKota.nama).toUpperCase() : '-',
            tujuan: row.penimbanganTujuanKota ? String(row.penimbanganTujuanKota.nama).toUpperCase() : '-',
            komoditi: arrkomoditi.length ? arrkomoditi.join(', ').toUpperCase() : '-',
            status_pelanggaran: row.is_melanggar
                ? (arrpelanggaran.length ? `MELANGGAR (${arrpelanggaran.join(', ')})`.toUpperCase() : 'MELANGGAR')
                : 'TIDAK MELANGGAR',
            is_melanggar: !!row.is_melanggar,
            kode_pelanggaran: arrkodepelanggaran,
            jenis_pelanggaran: arrpelanggaran.map((v) => String(v).toUpperCase()),
            qr_data: `${process.env.DOMAIN_URL_QR}/penimbangan/${row.kode_uppkb}/${row.id}`,
        };
    }

    /**
     * Cetak struk penimbangan ke printer thermal Epson (ESC/POS) via TCP.
     *
     * GET  /api/v2pv/penimbangan/print/thermal/:id
     * POST /api/v2pv/penimbangan/print/thermal
     *
     * Params:
     *   id       (wajib) - id penimbangan
     *   kuppkb   - filter kode uppkb (opsional)
     *   notrx    - cari berdasarkan kode transaksi, pengganti id (opsional)
     *   preview  - 1 = jangan cetak, kembalikan hasil struk sebagai teks
     *   ip/port/width/font/copies/cut/qr_size/feed - override konfigurasi .env (opsional)
     */
    const printThermal = async (req, res, next) => {
        console.log("--------------------::Processing Print Thermal::--------------------");
        try {
            const body = req.body || {};
            const id = req.params.id || body.id || req.query.id;
            const kode_trx = body.notrx || req.query.notrx;
            const kode_uppkb = body.kuppkb || req.query.kuppkb;
            const preview = String(body.preview || req.query.preview || '0') == '1';

            if (!id && !kode_trx) {
                return res.status(400).send({
                    success: false,
                    message: 'Parameter id atau notrx wajib diisi.'
                });
            }

            let conditions = { is_deleted: false };
            if (id) conditions.id = id;
            if (kode_trx) conditions.kode_trx = kode_trx;
            if (kode_uppkb) conditions.kode_uppkb = kode_uppkb;

            const row = await getPenimbanganStruk(conditions);

            if (!row) {
                return res.status(404).send({
                    success: false,
                    message: 'Data penimbangan tidak ditemukan.'
                });
            }

            const data = mapDataStruk(row);

            // Override konfigurasi printer per-request (default tetap dari .env).
            const override = {
                ip: body.ip || req.query.ip,
                port: body.port || req.query.port,
                width: body.width || req.query.width,
                font: body.font || req.query.font,
                paper: body.paper || req.query.paper,
                size: body.size || req.query.size,
                copies: body.copies || req.query.copies,
                cut: body.cut !== undefined ? body.cut : req.query.cut,
                qr_size: body.qr_size || req.query.qr_size,
                feed: body.feed !== undefined ? body.feed : req.query.feed,
            };

            const cfg = getPrinterConfig(override);

            // Mode preview: tampilkan hasil struk tanpa mengirim ke printer.
            if (preview) {
                return res.send({
                    success: true,
                    message: 'Preview struk penimbangan.',
                    printer: {
                        ip: cfg.ip,
                        port: cfg.port,
                        paper: `${cfg.paper}mm`,
                        font: cfg.font,
                        size: cfg.size,
                        scale: `${cfg.scale_w}x lebar, ${cfg.scale_h}x tinggi`,
                        width: cfg.width,
                        max_width: cfg.max_width,
                        layout: cfg.layout
                    },
                    data: data,
                    struk: buildStrukText(data, cfg)
                });
            }

            if (!cfg.ip) {
                return res.status(500).send({
                    success: false,
                    message: 'IP printer thermal belum dikonfigurasi (PRINTER_THERMAL_IP).'
                });
            }

            const result = await printStruk(data, override);

            res.send({
                success: true,
                message: 'Struk penimbangan berhasil dicetak.',
                printer: result.printer,
                copies: result.copies,
                data: data
            });
        } catch (error) {
            console.log('PRINT THERMAL ERROR : ', error.message);
            res.status(500).send({
                success: false,
                message: error.message || 'Gagal mencetak struk penimbangan.'
            });
        }
    }

    const testingsync = async (req, res, next) => {
        var data = { 'obj': 'test' };
        await loginUser(req.token.id);
    }

    return {
        testingsync,
        printThermal,
        findAll,
        findPagination,
        findOne,
        findAllActive,
        captureImg,
        findLiveCount,
        findPelanggaran,
        findHistori,
        useToleransiKomoditi,
        readDimensi,
        createLogWim,
        createSyncWimData,
        create,
        sinkPenimbangan,
        sinkUpsertPenimbangan,
        update,
        updateTrxByKode,
        updateTrxByKodePelanggaran,
        updateStatus,
        remove,
        removeArr,
        truncate,
        removeSoft,
        removeArrSoft,
    };
}
module.exports = PenimbanganController;
