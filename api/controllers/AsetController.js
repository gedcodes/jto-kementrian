const {
    t_aset,
    t_bptd,
    t_lokasi,
    t_kategori_aset,
    t_kegiatan,
    t_satuan_aset,
    t_kondisi_aset,
    t_vendor,
    t_direktorat,
    t_instansi,
    t_sumber_anggaran,
    t_jenis_aset,
    t_metode,
    t_kondisi,
    t_sub_kondisi_aset,
    sequelize,
} = require('../models');
const {
    GetNup,
    GetNupTemp,
} = require('./lib/dataid');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const moment = require('moment');

const path = require("path");
var QRCode = require('qrcode');
let ejs = require("ejs");
const excel = require('exceljs');
const { encrypt } = require('./lib/aescrypt');
const config = require('../../config/config');
const { reportTemplate } = require('../controllers/lib/report_template');
const { uploadImage, removeImage } = require('./lib/aset');
const { generatePdfFile } = require('../middleware/pdfGenerator');

const AsetController = () => {

    const countAll = async () => {
        return t_aset.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const lokasi_uppkb_id = req.query.lokasi
            const bptd_id = req.query.bptd
            const kegiatan_id = req.query.kegiatan_id
            const kategori_id = req.query.kategori_id
            const jenis_id = req.query.jenis_id
            const kondisi_id = req.query.kondisi_id
            const tahun_awal = req.query.tahun_awal
            const tahun_akhir = req.query.tahun_akhir

            let conditions = { is_deleted: false }
            let where_tahun = { is_deleted: false }
            const count = await countAll();        

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (kategori_id) {
                conditions = {
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (jenis_id) {
                conditions = {
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (kondisi_id) {
                conditions = {
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kegiatan_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kategori_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && jenis_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kondisi_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id && kategori_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id && jenis_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kondisi_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kegiatan_id && kategori_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kategori_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kategori_id: kategori_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }

            if (bptd_id && lokasi_uppkb_id && kegiatan_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kategori_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id && jenis_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            
            if (tahun_awal && tahun_akhir) {
                where_tahun = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                    is_deleted: false,
                }
            }

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
                //conditions = {is_deleted: false, nama : {[Op.iLike]: `%${name}%`}}
            }

            const options = {
                include: [
                    {
                        model: t_bptd,
                        required: false,
                        as: 'bptd_aset',
                        attributes: [
                            'id', 'kode', 'nama',
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'uppkb_aset',
                        attributes: [
                            'id', 'kode', 'nama', 'bptd_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kategori_aset,
                        required: false,
                        as: 'kategori_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_jenis_aset,
                        required: false,
                        as: 'jenis_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_kegiatan,
                        required: true,
                        as: 'kegiatan',
                        attributes: [
                            'id', 'kode', 'nama', 'deskripsi', 'tahun', 'sumber_anggaran_id', 'metode_id'
                        ],
                        where: where_tahun,
                        include: [
                            {
                                model: t_vendor,
                                required: false,
                                as: 'kegiatan_vendor',
                                attributes: [
                                    'id', 'kode', 'nama', 'alamat', 'kontak_person'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_instansi,
                                required: false,
                                as: 'kegiatan_direktorat',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_sumber_anggaran,
                                required: false,
                                as: 'kegiatan_sumber_anggaran',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_metode,
                                required: false,
                                as: 'kegiatan_metode',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: t_kondisi_aset,
                        required: false,
                        as: 'kondisi_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_sub_kondisi_aset,
                        required: false,
                        as: 'sub_kondisi_aset',
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
                paginate: req.query.paginate || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_aset.paginate(options)

            res.status(200).json({
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
        console.log("--------------------::Processing Find All Server Side Pagination::--------------------");
        try {
            const name = req.query.search;
            const lokasi_uppkb_id = req.query.lokasi
            const bptd_id = req.query.bptd
            const kegiatan_id = req.query.kegiatan_id
            const kategori_id = req.query.kategori_id
            const jenis_id = req.query.jenis_id
            const kondisi_id = req.query.kondisi_id
            const tahun_awal = req.query.tahun_awal
            const tahun_akhir = req.query.tahun_akhir

            let conditions = { is_deleted: false }
            let where_tahun = { is_deleted: false }
            let order = [
                [
                    req.query.orderBy || 'created_at',
                    req.query.sortedBy || 'DESC'
                ]
            ];
            const count = await countAll();

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (kategori_id) {
                conditions = {
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (jenis_id) {
                conditions = {
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (kondisi_id) {
                conditions = {
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kegiatan_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kategori_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && jenis_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kondisi_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id && kategori_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id && jenis_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kondisi_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kegiatan_id && kategori_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kategori_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kategori_id: kategori_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }

            if (bptd_id && lokasi_uppkb_id && kegiatan_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kategori_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id && jenis_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            
            if (tahun_awal && tahun_akhir) {
                where_tahun = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                    is_deleted: false,
                }
            }

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
                //conditions = {is_deleted: false, nama : {[Op.iLike]: `%${name}%`}}
            }

            const options = {
                include: [
                    {
                        model: t_aset,
                        required: false,
                        as: 'referensi_aset',
                        attributes: [
                            'id', 'kode', 'nama', 'bptd_id', 'lokasi_uppkb_id', 'kegiatan_id', 'kategori_id', 'spesifikasi', 'keterangan', 'kondisi_id', 'sub_kondisi_aset_id', 'jenis_id', 'kode_bmn', 'nup', 'nilai_perolehan', 'no_spk', 'uraian', 'img1_name', 'img1_url', 'img2_name', 'img2_url', 'img3_name', 'img3_url', 'img4_name', 'img4_url'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'bptd_aset',
                        attributes: [
                            'id', 'kode', 'nama',
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'uppkb_aset',
                        attributes: [
                            'id', 'kode', 'nama', 'bptd_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kategori_aset,
                        required: false,
                        as: 'kategori_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_jenis_aset,
                        required: false,
                        as: 'jenis_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_satuan_aset,
                        required: false,
                        as: 'satuan_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_kegiatan,
                        required: false,
                        as: 'kegiatan',
                        attributes: [
                            'id', 'kode', 'nama', 'deskripsi', 'tahun', 'sumber_anggaran_id', 'metode_id'
                        ],
                        where: where_tahun,
                        include: [
                            {
                                model: t_vendor,
                                required: false,
                                as: 'kegiatan_vendor',
                                attributes: [
                                    'id', 'kode', 'nama', 'alamat', 'kontak_person'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_instansi,
                                required: false,
                                as: 'kegiatan_direktorat',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_sumber_anggaran,
                                required: false,
                                as: 'kegiatan_sumber_anggaran',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_metode,
                                required: false,
                                as: 'kegiatan_metode',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: t_kondisi_aset,
                        required: false,
                        as: 'kondisi_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kondisi,
                                required: false,
                                as: 'kondisi_sub',
                                where: {
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_sub_kondisi_aset,
                                        required: false,
                                        as: 'sub_kondisi_aset',
                                        attributes: ['id', 'kode', 'nama'],
                                        where: {
                                            is_active: true
                                        },
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        model: t_sub_kondisi_aset,
                        required: false,
                        as: 'sub_kondisi_aset',
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
                paginate: req.query.paginate || count,
                order: order,
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_aset.paginate(options)

            res.status(200).json({
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

    const findNup = async (req, res, next) => {
        console.log("--------------------::Processing Nomor Urut Pendaftaran::--------------------");
        try {
            const lokasi_uppkb_id = req.query.lokasi_uppkb_id;
            const temp = req.query.temp || '1';
            let nup = 0;

            if (temp === '2' || temp == 2) {
                nup = await GetNupTemp(lokasi_uppkb_id);
            } else {
                nup = await GetNup(lokasi_uppkb_id);
            }

            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: Number(nup) + 1,
            });

        } catch (error) {
            next(error)
        }
    }

    const findOne = async (req, res, next) => {
        console.log("--------------------::Processing Find One::--------------------");
        try {
            const id = req.params.id;
            t_aset.findByPk(id, {
                where: {
                    is_deleted: false
                },
                logging: false
            }).then(data => {
                res.status(200).json({
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
            let conditions = { is_active: true, is_deleted: false }
            const count = await countAll();
            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                page: req.query.page || 1,
                paginate: req.query.paginate || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
            }

            const { docs, pages, total } = await t_aset.paginate(options)
            // const propinsi = await t_aset.findAll({
            //     where: {
            //         is_active: true
            //     }
            // });

            res.status(200).json({
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

    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        let image1 = {
            imgName: '',
            imgUrl: ''
        }

        let image2 = {
            imgName: '',
            imgUrl: ''
        }

        let image3 = {
            imgName: '',
            imgUrl: ''
        }

        let image4 = {
            imgName: '',
            imgUrl: ''
        }

        if (req.files) {
            if(req.files.image1) {
                const namaImage = 'img1'
                const dataImage = await uploadImage(req.body.lokasi_uppkb_id, req.body.nama, namaImage, req.files.image1)
                if(!dataImage.status) {
                    return res.status(422).send({
                        success: false,
                        message: 'Bad Request',
                        errors: {
                            image1: [dataImage.message]
                        }
                    });
                } else {
                    image1 = {
                        imgName: dataImage.imgName,
                        imgUrl: dataImage.imgUrl
                    }
                }
            }

            if(req.files.image2) {
                const namaImage = 'img2'
                const dataImage = await uploadImage(req.body.lokasi_uppkb_id, req.body.nama, namaImage, req.files.image2)
                if(!dataImage.status) {
                    return res.status(422).send({
                        success: false,
                        message: 'Bad Request',
                        errors: {
                            image2: [dataImage.message]
                        }
                    });
                } else {
                    image2 = {
                        imgName: dataImage.imgName,
                        imgUrl: dataImage.imgUrl
                    }
                }
            }
            if(req.files.image3) {
                const namaImage = 'img3'
                const dataImage = await uploadImage(req.body.lokasi_uppkb_id, req.body.nama, namaImage, req.files.image3)
                if(!dataImage.status) {
                    return res.status(422).send({
                        success: false,
                        message: 'Bad Request',
                        errors: {
                            image3: [dataImage.message]
                        }
                    });
                } else {
                    image3 = {
                        imgName: dataImage.imgName,
                        imgUrl: dataImage.imgUrl
                    }
                }
            }
            if(req.files.image4) {
                const namaImage = 'img4'
                const dataImage = await uploadImage(req.body.lokasi_uppkb_id, req.body.nama, namaImage, req.files.image4)
                if(!dataImage.status) {
                    return res.status(422).send({
                        success: false,
                        message: 'Bad Request',
                        errors: {
                            image4: [dataImage.message]
                        }
                    });
                } else {
                    image4 = {
                        imgName: dataImage.imgName,
                        imgUrl: dataImage.imgUrl
                    }
                }
            }
        }
        
        try {
            const field = {
                kategori_id: req.body.kategori_id || null,
                kegiatan_id: req.body.kegiatan_id,
                jenis_id: req.body.jenis_id,
                // satuan_id: req.body.satuan_id,
                lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                bptd_id: req.body.bptd_id,
                kondisi_id: req.body.kondisi_id,
                sub_kondisi_aset_id: req.body.sub_kondisi_aset_id,
                kode: req.body.kode,
                kode_bmn: req.body.kode_bmn,
                nama: req.body.nama,
                nup: req.body.nup,
                nilai_perolehan: req.body.nilai_perolehan,
                no_spk: req.body.no_spk,
                uraian: req.body.uraian || '',
                // qty: req.body.qty,
                spesifikasi: req.body.spesifikasi || '',
                keterangan: req.body.keterangan || '',
                is_active: req.body.iact ? req.body.iact : true,
                created_by: req.token.id,
                img1_name: image1.imgName,
                img1_url: image1.imgUrl,
                img2_name: image2.imgName,
                img2_url: image2.imgUrl,
                img3_name: image3.imgName,
                img3_url: image3.imgUrl,
                img4_name: image4.imgName,
                img4_url: image4.imgUrl,
                parent_id: req.body.parent_id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                is_terpasang: req.body.is_terpasang ?? true,
                is_parent: req.body.is_parent ?? false
            };
            console.log(field);

            t_aset.create(field, {
                logging: false
            }).then(data => {
                res.status(200).send({
                    success: true,
                    message: messageService().CREATE_SUCCESS,
                    data: [{
                        last_insert_id: data.id,
                        fields: field
                    }]
                });
            }).catch(err => {
                console.log(err)
                res.status(500).send({
                    success: false,
                    message: messageService().CREATE_FAILED
                });
            })
        } catch (error) {
            next(error)
        }
    }

    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");
        const editDataAset = await t_aset.findOne({
            where: {
                id: req.params.id,
                is_deleted: false
            },
            logging: false
        })

        let image1 = {
            imgName: editDataAset.img1_name,
            imgUrl: editDataAset.img1_url
        }

        let image2 = {
            imgName: editDataAset.img2_name,
            imgUrl: editDataAset.img2_url
        }

        let image3 = {
            imgName: editDataAset.img3_name,
            imgUrl: editDataAset.img3_url
        }

        let image4 = {
            imgName: editDataAset.img4_name,
            imgUrl: editDataAset.img4_url
        }

        if (req.files) {
            if(req.files.image1) {
                const namaImage = 'img1'
                const dataImage = await uploadImage(req.body.lokasi_uppkb_id, req.body.nama, namaImage, req.files.image1)
                
                if(!dataImage.status) {
                    return res.status(422).send({
                        success: false,
                        message: 'Bad Request',
                        errors: {
                            image1: [dataImage.message]
                        }
                    });
                } else {
                    image1 = {
                        imgName: dataImage.imgName,
                        imgUrl: dataImage.imgUrl
                    }
                    await removeImage(editDataAset.img1_name);
                }
            }

            if(req.files.image2) {
                const namaImage = 'img2'
                const dataImage = await uploadImage(req.body.lokasi_uppkb_id, req.body.nama, namaImage, req.files.image2)
                if(!dataImage.status) {
                    return res.status(422).send({
                        success: false,
                        message: 'Bad Request',
                        errors: {
                            image2: [dataImage.message]
                        }
                    });
                } else {
                    image2 = {
                        imgName: dataImage.imgName,
                        imgUrl: dataImage.imgUrl
                    }
                    await removeImage(editDataAset.img2_name);
                }
            }
            if(req.files.image3) {
                const namaImage = 'img3'
                const dataImage = await uploadImage(req.body.lokasi_uppkb_id, req.body.nama, namaImage, req.files.image3)
                
                if(!dataImage.status) {
                    return res.status(422).send({
                        success: false,
                        message: 'Bad Request',
                        errors: {
                            image3: [dataImage.message]
                        }
                    });
                } else {
                    image3 = {
                        imgName: dataImage.imgName,
                        imgUrl: dataImage.imgUrl
                    }
                    await removeImage(editDataAset.img3_name);
                }
            }
            if(req.files.image4) {
                const namaImage = 'img4'
                const dataImage = await uploadImage(req.body.lokasi_uppkb_id, req.body.nama, namaImage, req.files.image4)
                if(!dataImage.status) {
                    return res.status(422).send({
                        success: false,
                        message: 'Bad Request',
                        errors: {
                            image4: [dataImage.message]
                        }
                    });
                } else {
                    image4 = {
                        imgName: dataImage.imgName,
                        imgUrl: dataImage.imgUrl
                    }
                    await removeImage(editDataAset.img4_name);
                }
            }
        }
        console.log('finish')
        try {
            const id = req.params.id;
            

            t_aset.update(
                {
                    kategori_id: req.body.kategori_id,
                    kegiatan_id: req.body.kegiatan_id,
                    jenis_id: req.body.jenis_id,
                    // satuan_id: req.body.satuan_id,
                    lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                    bptd_id: req.body.bptd_id,
                    kondisi_id: req.body.kondisi_id,
                    sub_kondisi_aset_id: req.body.sub_kondisi_aset_id,
                    kode: req.body.kode,
                    kode_bmn: req.body.kode_bmn,
                    nama: req.body.nama,
                    nup: req.body.nup,
                    nilai_perolehan: req.body.nilai_perolehan,
                    no_spk: req.body.no_spk,
                    uraian: req.body.uraian || '',
                    // qty: req.body.qty,
                    spesifikasi: req.body.spesifikasi,
                    keterangan: req.body.keterangan || '',
                    is_active: req.body.iact ? req.body.iact : true,
                    updated_by: req.token.id,
                    img1_name: image1.imgName,
                    img1_url: image1.imgUrl,
                    img2_name: image2.imgName,
                    img2_url: image2.imgUrl,
                    img3_name: image3.imgName,
                    img3_url: image3.imgUrl,
                    img4_name: image4.imgName,
                    img4_url: image4.imgUrl,
                    parent_id: req.body.parent_id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    is_terpasang: req.body.is_terpasang ?? true,
                    is_parent: req.body.is_parent ?? false
                },
                {
                    where: { id: id }
                }
            ).then(num => {
                if (num == 1) {
                    res.status(200).send({
                        success: true,
                        message: messageService().UPDATE_SUCCESS
                    });
                } else {
                    res.status(204).send({
                        success: false,
                        message: messageService().UPDATE_FAILED
                    });
                }
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: `${messageService().UPDATE_FAILED}. ${err}`
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const updateKondisi = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            // var q = req.query.arrId;
            // var resSplit = q.split(",").map(i => Number(i));

            if (req.body.kondisi.length) {
                console.log('DATA KONDISI : ', req.body.kondisi);
                for await (const data of req.body.kondisi) {
                   t_aset.update(
                        {
                            kondisi_id: data.kondisi_id,
                            sub_kondisi_aset_id: data.sub_kondisi_aset_id,
                            updated_by: req.token.id,
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        },
                        {
                            where: { id: data.aset_id },
                            logging: false
                        }
                    )
                }
            }

            res.status(200).send({
                success: true,
                message: messageService().UPDATE_STATUS_SUCCESS
            });

            // t_aset.update(
            //     {
            //         kondisi_id: req.body.kondisi_id,
            //         sub_kondisi_aset_id: req.body.sub_kondisi_aset_id,
            //         updated_by: req.token.id,
            //         updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            //     },
            //     {
            //         where: { id: { [Op.any]: `{${resSplit}}` } },
            //         logging: false
            //     }
            // ).then(num => {
            //     if (num == resSplit.length) {
            //         res.status(200).send({
            //             success: true,
            //             message: messageService().UPDATE_STATUS_SUCCESS
            //         });
            //     } else {
            //         res.status(204).send({
            //             success: false,
            //             message: messageService().UPDATE_STATUS_FAILED
            //         });
            //     }
            // }).catch(err => {
            //     res.status(500).send({
            //         success: false,
            //         message: `${messageService().UPDATE_STATUS_FAILED}. ${err}`
            //     });
            // });
        } catch (error) {
            next(error)
        }
    }

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_aset.update(
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
                    res.status(200).send({
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

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");
        //console.log(req.token.id);

        const id = req.params.id;
        try {
            t_aset.update(
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
                    res.status(200).send({
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

    const remove = async (req, res, next) => {
        console.log("--------------------::Processing Delete::--------------------");

        const id = req.params.id;
        try {
            t_aset.destroy({
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

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_aset.update(
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
                    res.status(200).send({
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

    const removeArr = async (req, res, next) => {
        console.log("--------------------::Processing Delete All::--------------------");
        var q = req.query.arrId;
        var resSplit = q.split(",").map(i => Number(i));
        try {
            t_aset.destroy({
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_aset.destroy(
                { truncate: true, restartIdentity: true, cascade: true }
            );

            res.json({
                success: true,
                message: messageService().TRUNCATE_SUCCESS
            });
        } catch (error) {
            next(error)
        }

    }

    const dataAset = async (req, next) => {
        try {
            const name = req.query.search;
            const lokasi_uppkb_id = req.query.lokasi
            const bptd_id = req.query.bptd
            const kegiatan_id = req.query.kegiatan_id
            const kategori_id = req.query.kategori_id
            const jenis_id = req.query.jenis_id
            const kondisi_id = req.query.kondisi_id
            const tahun_awal = req.query.tahun_awal
            const tahun_akhir = req.query.tahun_akhir

            let conditions = { is_deleted: false}
            let where_tahun = { is_deleted: false }
            const count = await countAll();

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
                //conditions = {is_deleted: false, nama : {[Op.iLike]: `%${name}%`}}
            }         

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (kategori_id) {
                conditions = {
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (jenis_id) {
                conditions = {
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (kondisi_id) {
                conditions = {
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kegiatan_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kategori_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && jenis_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kondisi_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id && kategori_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (kegiatan_id && jenis_id) {
                conditions = {
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kondisi_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kondisi_id: kondisi_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (lokasi_uppkb_id && kegiatan_id && kategori_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kegiatan_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && kategori_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    kategori_id: kategori_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }

            if (bptd_id && lokasi_uppkb_id && kegiatan_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kategori_id && jenis_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kategori_id: kategori_id,
                    jenis_id: jenis_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_uppkb_id && kegiatan_id && jenis_id && kategori_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: jenis_id,
                    kategori_id: kategori_id,
                    is_deleted: false
                }
            }
            
            if (tahun_awal && tahun_akhir) {
                where_tahun = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                    is_deleted: false,
                }
            }
            
            console.log(conditions)

            const options = {
                include: [
                    {
                        model: t_bptd,
                        required: false,
                        as: 'bptd_aset',
                        attributes: [
                            'id', 'kode', 'nama',
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'uppkb_aset',
                        attributes: [
                            'id', 'kode', 'nama', 'bptd_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kategori_aset,
                        required: false,
                        as: 'kategori_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_jenis_aset,
                        required: false,
                        as: 'jenis_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_satuan_aset,
                        required: false,
                        as: 'satuan_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_kegiatan,
                        required: false,
                        as: 'kegiatan',
                        attributes: [
                            'id', 'kode', 'nama', 'deskripsi', 'tahun', 'sumber_anggaran_id', 'metode_id'
                        ],
                        where: where_tahun,
                        include: [
                            {
                                model: t_vendor,
                                required: false,
                                as: 'kegiatan_vendor',
                                attributes: [
                                    'id', 'kode', 'nama', 'alamat', 'kontak_person'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_instansi,
                                required: false,
                                as: 'kegiatan_direktorat',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_sumber_anggaran,
                                required: false,
                                as: 'kegiatan_sumber_anggaran',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_metode,
                                required: false,
                                as: 'kegiatan_metode',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: t_kondisi_aset,
                        required: false,
                        as: 'kondisi_aset',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kondisi,
                                required: false,
                                as: 'kondisi_sub',
                                where: {
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_sub_kondisi_aset,
                                        required: false,
                                        as: 'sub_kondisi_aset',
                                        attributes: ['id', 'kode', 'nama'],
                                        where: {
                                            is_active: true
                                        },
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        model: t_sub_kondisi_aset,
                        required: false,
                        as: 'sub_kondisi_aset',
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
                paginate: req.query.paginate || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_aset.paginate(options)

            const result = {
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }
            }

            return result;

        } catch (error) {
            next(error)
        }
    }

    const xlsAset = async (req, res, next) => {
        const result = await dataAset(req, next)

        if (result) {
            let arr = []

            for (let row of result.data) {
                arr.push({
                    kode_bmn: row.kode_bmn,
                    no_spk: row.no_spk,
                    nup: row.nup,
                    uraian: row.uraian,
                    nilai_perolehan: row.nilai_perolehan,
                    nama: row.nama,
                    nama_uppkb: row.uppkb_aset.nama,
                    kategori: row.kategori_aset.nama,
                    jenis: row.jenis_aset.nama,
                    kegiatan: row.kegiatan.nama,
                    metode: row.kegiatan.kegiatan_metode.nama,
                    sumber_anggaran: row.kegiatan.kegiatan_sumber_anggaran.nama,
                    tahun: row.kegiatan.tahun,
                    spesifikasi: row.spesifikasi,
                    kondisi: row.kondisi_aset?.nama ?? '-',
                    sub_kondisi: row.sub_kondisi_aset?.nama ?? '-',
                    keterangan: row.keterangan
                })
            }

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('Daftar Aset UPPKB', {
                pageSetup: {
                    paperSize: 9,
                    orientation: 'landscape'
                }
            });
    
            worksheet.pageSetup.margins = {
                left: 0.7, right: 0.7,
                top: 0.75, bottom: 0.75,
                header: 0.3, footer: 0.3
            }

            worksheet.columns = [
                { header: 'Uppkb', key: 'nama_uppkb', width: 20},
                { header: 'Kategori', key: 'kategori', width: 20},
                { header: 'Kode BMN', key: 'kode_bmn', width: 20},
                { header: 'No Bukti SPK', key: 'no_spk', width: 20},
                { header: 'NUP', key: 'nup', width: 20},
                { header: 'Nama Aset', key: 'nama', width: 20},
                { header: 'Uraian', key: 'uraian', width: 20},
                { header: 'Nilai Perolehan', key: 'nilai_perolehan', width: 20},
                { header: 'Jenis', key: 'jenis', width: 20},
                { header: 'Kegiatan', key: 'kegiatan', width: 20},
                { header: 'Metode', key: 'metode', width: 20},
                { header: 'Sumber Anggaran', key: 'sumber_anggaran', width: 20},
                { header: 'Tahun', key: 'tahun', width: 20},
                { header: 'Spesifikasi', key: 'spesifikasi', width: 20},
                { header: 'Kondisi', key: 'kondisi', width: 20},
                { header: 'Status', key: 'sub_kondisi', width: 20}
            ]
            
            worksheet.addRows(arr);
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
            let m = moment();
            let ms = m.millisecond() + 1000 * (m.second() + 60 * (m.minutes() + 60 * m.hours()));
            const filename = `data_aset_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
            const uploadPath = path.join(config.path_report) + '/xls/' + filename;
            const reportUrl = config.report_url + 'xls/' + filename;
    
            workbook.xlsx.writeFile(uploadPath).then(() => {
                console.log('xlsx fiel is written.')
                res.send({
                    success: true,
                    message: 'Export Excel Berhasil',
                    filename: filename,
                    download: reportUrl
                })
            })
        }
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

    const printAset = async (req, res, next) => {
        const result = await dataAset(req, next)

        const lokasi_id = req.query.lokasi
        const tahun_awal = req.query.tahun_awal
        const tahun_akhir = req.query.tahun_akhir
        const ispdf = req.query.ispdf

        if (result) {
            let arr = []

            for (let row of result.data) {
                //  console.log(row.satuan_aset.nama);
                arr.push({
                    kode_bmn: row.kode_bmn,
                    no_spk: row.no_spk,
                    nup: row.nup,
                    uraian: row.uraian,
                    nilai_perolehan: row.nilai_perolehan,
                    nama: row.nama,
                    nama_uppkb: row.uppkb_aset.nama,
                    kategori: row.kategori_aset.nama,
                    jenis: row.jenis_aset.nama,
                    kegiatan: row.kegiatan.nama,
                    metode: row.kegiatan.kegiatan_metode.nama,
                    sumber_anggaran: row.kegiatan.kegiatan_sumber_anggaran.nama,
                    tahun: row.kegiatan.tahun,
                    spesifikasi: row.spesifikasi,
                    kondisi: row.kondisi_aset?.nama ?? '-',
                    sub_kondisi: row.sub_kondisi_aset ? row.sub_kondisi_aset.nama : '-',
                    keterangan: row.keterangan
                })
            }

            let params = 'lokasi_id=all_uppkb'
            let lokasi = null
            if (lokasi_id) {
                const resLokasi = await t_lokasi.findOne({
                    where: {
                        id: lokasi_id,
                        is_active: true,
                        is_deleted: false
                    }
                })
                params = `lokasi_id=${lokasi_id}`
                lokasi = resLokasi
            }

            let tahun = '';
            if (tahun_awal && tahun_akhir) {
                if (tahun_awal === tahun_akhir) {
                    tahun = tahun_awal;
                } else {
                    tahun = `${tahun_awal} s.d ${tahun_akhir}`;
                }
            }

            const dataqr = `${process.env.DOMAIN_URL_QR}/rep/aset?src=${encrypt(params)}`;
            const qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();

            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("asetView.ejs", {
                    data: arr,
                    tahun_awal: tahun_awal,
                    tahun_akhir: tahun_akhir,
                    tahun: tahun,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', 'asetView.ejs'), {
                    data: arr,
                    tahun_awal: tahun_awal,
                    tahun_akhir: tahun_akhir,
                    tahun: tahun,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                }, async (err, datapdf) => {
                    console.log(err)
                    if (err) {
                        res.send(err)
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

                        let nama_file_uppkb = 'all_uppkb'
                        if(lokasi_id) {
    
                            nama_file_uppkb = lokasi.kode;
                        }
    
                        const filename = `data_aset_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
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
                })
            }
        }

    }
    return {
        findAll,
        findPagination,
        findNup,
        findOne,
        findAllActive,
        create,
        update,
        updateKondisi,
        updateStatus,
        removeSoft,
        remove,
        removeArrSoft,
        removeArr,
        truncate,
        xlsAset,
        printAset
    };
}
module.exports = AsetController;