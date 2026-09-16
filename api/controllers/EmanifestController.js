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
    getBptdId,
    getKepemilikanVal
} = require('./lib/dataid');

const {
    loginUser,
    syncToPostServer,
    updateStatusSyncToPusat
} = require('./lib/sinkronisasi');

const { downloadImageToUrl } = require('./lib/cctvcapture');
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

const EmanifestController = () => {
    const timer = ms => new Promise(res => setTimeout(res, ms))

    const findAll = async (req, res, next) => {
        var no_kendaraan = req.query.nokend;
        if (no_kendaraan) {
            var conditions = {
                no_kendaraan: no_kendaraan,
                is_active: true,
                is_deleted: false
            }

            const options = {
                attributes: [
                    'kode_uppkb', 'no_kendaraan', 'tgl_penimbangan', 'jbi_uji', 'no_surat_jalan', 'nama_pengemudi'
                ],
                include: [
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
                ],
                order: [
                    [
                        req.query.orderBy || 'tgl_penimbangan',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: true,
            }

            const docs = await t_penimbangan.findAll(options);

            res.json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs
            });
        } else {
            res.json({
                success: false,
                message: 'Nomor Kendaraan Tidak Tersedia',
            });
        }
    }
    return {
        findAll,
    };
}
module.exports = EmanifestController;
