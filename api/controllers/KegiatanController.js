const {
    t_kegiatan,
    t_vendor,
    t_direktorat,
    t_bptd,
    t_sumber_anggaran,
    t_metode,
    t_kategori_kegiatan,
    t_aset,
    t_lokasi,
    t_kategori_aset,
    t_satuan_aset,
    t_kondisi_aset,
    t_jenis_aset,
    t_kondisi,
    t_sub_kondisi_aset,
    t_instansi,
    sequelize,
} = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const moment = require('moment');
const { reportTemplate } = require('../controllers/lib/report_template');
const path = require("path");
var QRCode = require('qrcode');
let ejs = require("ejs");
const { generatePdfFile } = require('../middleware/pdfGenerator');
const excel = require('exceljs');
const { encrypt } = require('./lib/aescrypt');
const config = require('../../config/config');

const { upsert_aset, delete_aset_temp } = require('./lib/aset');

const KegiatanController = () => {

    const countAll = async () => {
        return t_kegiatan.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const direktorat_id = req.query.direktorat_id
            const instansi_id = req.query.instansi_id
            const bptd_id = req.query.bptd_id
            const vendor_id = req.query.vendor_id
            const kategori_kegiatan_id = req.query.kategori_id
            const tahun_awal = req.query.tahun_awal
            const tahun_akhir = req.query.tahun_akhir

            let conditions = { 
                is_deleted: false
            }
            let conditions2 = { 
                is_deleted: false,
                is_active: true
            }
            const count = await countAll();

            if (tahun_awal && tahun_akhir) {
                conditions.tahun = {[Op.between]: [tahun_awal, tahun_akhir]};
            }

            if (direktorat_id) {
                conditions.direktorat_id = direktorat_id;
            }

            if (instansi_id) {
                conditions2.instansi_id = instansi_id;
            }

            if (bptd_id) {
                conditions.bptd_id = bptd_id;
            }

            if (vendor_id) {
                conditions.vendor_id = vendor_id;
            }

            if (kategori_kegiatan_id) {
                conditions.kategori_kegiatan_id = kategori_kegiatan_id;
            }

            if (name) {
                conditions.nama = {
                    [Op.iLike]: `%${name}%`,
                };
            }
            
            const options = {
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
                        },
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'kegiatan_bptd',
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
                    },
                    {
                        model: t_kategori_kegiatan,
                        required: false,
                        as: 'kegiatan_kategori',
                        attributes: [
                            'id', 'kode', 'nama', 'keterangan'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_aset,
                        required: false,
                        as: 'kegiatan_aset',
                        attributes: [
                            'id',
                            'kode',
                            'kode_bmn',
                            'nama', 
                            'spesifikasi',
                            'keterangan',
                            'lokasi_uppkb_id',
                            'bptd_id',
                            'kondisi_id',
                            'img1_name',
                            'img1_url',
                            'img2_name',
                            'img2_url',
                            'img3_name',
                            'img3_url',
                            'img4_name',
                            'img4_url',

                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
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
                        ]
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
                required: true,
                logging: false
            }

            const { docs, pages, total } = await t_kegiatan.paginate(options)

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

    const findOne = async (req, res, next) => {
        console.log("--------------------::Processing Find One::--------------------");
        try {
            const id = req.params.id;
            t_kegiatan.findByPk(id, {
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
                        },
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'kegiatan_bptd',
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
                    },
                    {
                        model: t_kategori_kegiatan,
                        required: false,
                        as: 'kegiatan_kategori',
                        attributes: [
                            'id', 'kode', 'nama', 'keterangan'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_aset,
                        required: false,
                        as: 'kegiatan_aset',
                        attributes: [
                            'id',
                            'kode',
                            'kode_bmn',
                            'nama', 
                            'spesifikasi',
                            'keterangan',
                            'lokasi_uppkb_id',
                            'bptd_id',
                            'kondisi_id',
                            'img1_name',
                            'img1_url',
                            'img2_name',
                            'img2_url',
                            'img3_name',
                            'img3_url',
                            'img4_name',
                            'img4_url',
                            'is_active',
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
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
                                required: true,
                                as: 'kegiatan',
                                attributes: [
                                    'id', 'kode', 'nama', 'deskripsi', 'tahun', 'sumber_anggaran_id', 'metode_id'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
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
                                        },
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
                        ]
                    }
                ],
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
            const direktorat_id = req.query.direktorat_id
            const instansi_id = req.query.instansi_id
            const bptd_id = req.query.bptd_id
            const vendor_id = req.query.vendor_id
            const kategori_kegiatan_id = req.query.kategori_id
            const tahun_awal = req.query.tahun_awal
            const tahun_akhir = req.query.tahun_akhir

            let conditions = { 
                is_deleted: false,
                is_active: true
            }
            let conditions2 = { 
                is_deleted: false,
                is_active: true
            }
            const count = await countAll();

            if (tahun_awal && tahun_akhir) {
                conditions.tahun = {[Op.between]: [tahun_awal, tahun_akhir]};
            }

            if (direktorat_id) {
                conditions.direktorat_id = direktorat_id;
            }

            if (instansi_id) {
                conditions2.instansi_id = instansi_id;
            }

            if (bptd_id) {
                conditions.bptd_id = bptd_id;
            }

            if (vendor_id) {
                conditions.vendor_id = vendor_id;
            }

            if (kategori_kegiatan_id) {
                conditions.kategori_kegiatan_id = kategori_kegiatan_id;
            }

            if (name) {
                conditions.nama = {
                    [Op.iLike]: `%${name}%`,
                };
            }
            
            const options = {
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
                        },
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'kegiatan_bptd',
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
                    },
                    {
                        model: t_kategori_kegiatan,
                        required: false,
                        as: 'kegiatan_kategori',
                        attributes: [
                            'id', 'kode', 'nama', 'keterangan'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_aset,
                        required: false,
                        as: 'kegiatan_aset',
                        attributes: [
                            'id',
                            'kode',
                            'kode_bmn',
                            'nama', 
                            'spesifikasi',
                            'keterangan',
                            'lokasi_uppkb_id',
                            'bptd_id',
                            'kondisi_id',
                            'img1_name',
                            'img1_url',
                            'img2_name',
                            'img2_url',
                            'img3_name',
                            'img3_url',
                            'img4_name',
                            'img4_url',

                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
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
                        ]
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
                required: true,
                logging: false
            }

            const { docs, pages, total } = await t_kegiatan.paginate(options)

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
        
        try {
            const field = {
                kode: req.body.kode,
                nama: req.body.nama,
                deskripsi: req.body.deskripsi,
                tahun: req.body.tahun,
                sumber_anggaran_id: req.body.sumber_anggaran_id,
                metode_id: req.body.metode_id,
                vendor_id: req.body.vendor_id,
                direktorat_id: req.body.direktorat_id,
                bptd_id: req.body.bptd_id,
                kategori_kegiatan_id: req.body.kategori_kegiatan_id,
                is_active: req.body.iact ? req.body.iact : true,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            var aset = req.body.aset;
            var arraset = aset ? aset.split(',') : '';

            return sequelize.transaction().then(function (t) {
                return t_kegiatan.create(field, { transaction: t, logging: false }).then(async (data) => {
                    try {
                        t.commit();

                        var upsertaset = await upsert_aset(arraset, data.id);
                        console.log('UPSERT ASET : ', upsertaset);

                        // var deleteaset = await delete_aset_temp(upsertaset);
                        // console.log('DELETE ASET TEMP : ', deleteaset);

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
        } catch (error) {
            next(error)
        }
    }

    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            const id = req.params.id;

            t_kegiatan.update(
                {
                    kode: req.body.kode,
                    nama: req.body.nama,
                    deskripsi: req.body.deskripsi,
                    tahun: req.body.tahun,
                    sumber_anggaran_id: req.body.sumber_anggaran_id,
                    metode_id: req.body.metode_id,
                    vendor_id: req.body.vendor_id,
                    direktorat_id: req.body.direktorat_id,
                    bptd_id: req.body.bptd_id,
                    kategori_kegiatan_id: req.body.kategori_kegiatan_id,
                    is_active: req.body.iact ? req.body.iact : true,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
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

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_kegiatan.update(
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
            t_kegiatan.update(
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
            t_kegiatan.destroy({
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

            t_kegiatan.update(
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
            t_kegiatan.destroy({
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
            t_kegiatan.destroy(
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

    const dataKegiatan = async (req, next) => {
        try {
            const name = req.query.search;
            const direktorat_id = req.query.direktorat_id
            const bptd_id = req.query.bptd_id
            const vendor_id = req.query.vendor_id
            const tahun_awal = req.query.tahun_awal
            const tahun_akhir = req.query.tahun_akhir

            let conditions = { 
                is_deleted: false
            }
            const count = await countAll();

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
                //conditions = {is_deleted: false, nama : {[Op.iLike]: `%${name}%`}}
            }
            if (tahun_awal && tahun_akhir) {
                conditions = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                    is_deleted: false
                }
            }
            if (direktorat_id) {
                conditions = {
                    direktorat_id: direktorat_id,
                    is_deleted: false
                }
            }
            if (direktorat_id && tahun_awal && tahun_akhir) {
                conditions = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                    direktorat_id: direktorat_id,
                    is_deleted: false
                }
            }

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }
            if (bptd_id && tahun_awal && tahun_akhir) {
                conditions = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }

            if (vendor_id) {
                conditions = {
                    vendor_id: vendor_id,
                    is_deleted: false
                }
            }
            if (vendor_id && tahun_awal && tahun_akhir) {
                conditions = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                    vendor_id: vendor_id,
                    is_deleted: false
                }
            }
            
            if (direktorat_id && bptd_id) {
                conditions = {
                   direktorat_id: direktorat_id,
                   bptd_id: bptd_id,
                   is_deleted: false
                }
            }
            if (direktorat_id && bptd_id && tahun_awal && tahun_akhir) {
                conditions = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                   direktorat_id: direktorat_id,
                   bptd_id: bptd_id,
                   is_deleted: false
                }
            }

            if (direktorat_id && vendor_id) {
                conditions = {
                   direktorat_id: direktorat_id,
                   vendor_id: vendor_id,
                   is_deleted: false
                }
            }
            if (direktorat_id && vendor_id && tahun_awal && tahun_akhir) {
                conditions = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                   direktorat_id: direktorat_id,
                   vendor_id: vendor_id,
                   is_deleted: false
                }
            }
            if (direktorat_id && bptd_id && vendor_id) {
                conditions = {
                    direktorat_id: direktorat_id,
                    bptd_id: bptd_id,
                    vendor_id: vendor_id,
                    is_deleted: false
                }
            }
            if (direktorat_id && bptd_id && vendor_id && tahun_awal && tahun_akhir) {
                conditions = {
                    tahun: {[Op.between]: [tahun_awal, tahun_akhir]},
                    direktorat_id: direktorat_id,
                    bptd_id: bptd_id,
                    vendor_id: vendor_id,
                    is_deleted: false
                }
            }

            const options = {
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
                        },
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'kegiatan_bptd',
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
                page: req.query.page || 1,
                paginate: req.query.paginate || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                required: true,
                logging: false
            }

            const { docs, pages, total } = await t_kegiatan.paginate(options)

            const result = {
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }
            }

            return result

        } catch (error) {
            next(error)
        }
    }

    const xlsKegiatan = async (req, res, next) => {
        const result = await dataKegiatan(req, next)
        
        if (result) {
            let arr = []

            for (let row of result.data) {
                arr.push({
                    kode: row.kode,
                    nama: row.nama,
                    deskripsi: row.deskripsi,
                    direktorat: row.kegiatan_direktorat?.nama ?? '-',
                    bptd: row.kegiatan_bptd?.nama ?? '-',
                    tahun: row.tahun,
                    sumber_anggaran: row.kegiatan_sumber_anggaran.nama,
                    metode: row.kegiatan_metode.nama,
                    vendor: row.kegiatan_vendor.nama
                })
            }
            
            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('Daftar Kegiatan UPPKB', {
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
                { header: 'Kode', key: 'kode', width: 20},
                { header: 'Nama', key: 'nama', width: 20},
                { header: 'Deskripsi', key: 'deskripsi', width: 20},
                { header: 'Satuan Kerja', key: 'direktorat', width: 20},
                { header: 'BPTD', key: 'bptd', width: 20},
                { header: 'Tahun', key: 'tahun', width: 20},
                { header: 'Sumber Anggaran', key: 'sumber_anggaran', width: 20},
                { header: 'Metode', key: 'metode', width: 20},
                { header: 'Vendor', key: 'vendor', width: 20}
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
            const filename = `data_kegiatan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
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

    const printKegiatan = async (req, res, next) => {
        const result = await dataKegiatan(req, next)
        const tahun_awal = req.query.tahun_awal
        const tahun_akhir = req.query.tahun_akhir
        const ispdf = req.query.ispdf
        const direktorat_id = req.query.direktorat_id
        const bptd_id = req.query.bptd_id
        const vendor_id = req.query.vendor_id

        if (result) {
            let arr = []

            for (let row of result.data) {
                arr.push({
                    kode: row.kode,
                    nama: row.nama,
                    deskripsi: row.deskripsi,
                    direktorat: row.kegiatan_direktorat?.nama ?? '-',
                    bptd: row.kegiatan_bptd?.nama ?? '-',
                    tahun: row.tahun,
                    sumber_anggaran: row.kegiatan_sumber_anggaran.nama,
                    metode: row.kegiatan_metode.nama,
                    vendor: row.kegiatan_vendor.nama
                })
            }

            let params = 'bptd_id=all_bptd'
            let databptd = null
            if (bptd_id) {
                const bptd = await t_bptd.findOne({
                    where: {
                        id: bptd_id,
                        is_active: true,
                        is_deleted: false
                    },
                    logging: false
                })
                params = `bptd_id=${bptd_id}`
                databptd = bptd
            }

            let tahun = '';
            if (tahun_awal && tahun_akhir) {
                if (tahun_awal === tahun_akhir) {
                    tahun = tahun_awal;
                } else {
                    tahun = `${tahun_awal} s.d ${tahun_akhir}`;
                }
            }

            const dataqr = `${process.env.DOMAIN_URL_QR}/rep/kegiatan?src=${encrypt(params)}`;
            const qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();

            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("kegiatanView.ejs", {
                    data: arr,
                    tahun_awal: tahun_awal,
                    tahun_akhir: tahun_akhir,
                    tahun: tahun,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    bptd_id: bptd_id,
                    databptd: databptd,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', 'kegiatanView.ejs'), {
                    data: arr,
                    tahun_awal: tahun_awal,
                    tahun_akhir: tahun_akhir,
                    tahun: tahun,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    bptd_id: bptd_id,
                    databptd: databptd,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                }, async (err, datapdf) => {
                    console.log(err)
                    if (err) {
                        res.send(err)
                    } else {
                        const options = {
                            format: 'Legal',
                            landscape: true,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };
                        let nama_file_bptd = 'all_bptd'
                        if(bptd_id) {
    
                            nama_file_bptd = databptd.kode;
                        }
    
                        const filename = `data_kegiatan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_bptd}.pdf`;
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

    const getkegiatan = async (conditions) => {
        const options = {
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
                    },
                },
                {
                    model: t_bptd,
                    required: false,
                    as: 'kegiatan_bptd',
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
                },
                {
                    model: t_kategori_kegiatan,
                    required: false,
                    as: 'kegiatan_kategori',
                    attributes: [
                        'id', 'kode', 'nama', 'keterangan'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_aset,
                    required: false,
                    as: 'kegiatan_aset',
                    attributes: [
                        'id',
                        'kode',
                        'kode_bmn',
                        'nama', 
                        'spesifikasi',
                        'keterangan',
                        'lokasi_uppkb_id',
                        'bptd_id',
                        'kondisi_id',
                        'img1_name',
                        'img1_url',
                        'img2_name',
                        'img2_url',
                        'img3_name',
                        'img3_url',
                        'img4_name',
                        'img4_url',

                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    },
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
                            required: true,
                            as: 'kegiatan',
                            attributes: [
                                'id', 'kode', 'nama', 'deskripsi', 'tahun', 'sumber_anggaran_id', 'metode_id'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
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
                                    },
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
                    ]
                }
            ],
            where: conditions,
            order: [
                ['created_at', 'ASC']
            ],
            logging: false
        }

        const kegiatan = await t_kegiatan.findAll(options);

        return kegiatan;
    }

    const sqlAset = async (kegiatan_id) => {
        var sql = ``;
        if (kegiatan_id) {
            sql = `SELECT
                        jt_lokasi_uppkb.nama AS nama_uppkb,
                        jt_kategori_aset.nama AS kategori,
                        jt_aset.nama AS nama_aset,
                        COUNT(*) AS jml_aset
                    FROM jt_aset
                        LEFT JOIN jt_kategori_aset ON jt_aset.kategori_id = jt_kategori_aset.id
                        LEFT JOIN jt_lokasi_uppkb ON jt_aset.lokasi_uppkb_id = jt_lokasi_uppkb.id
                    WHERE jt_aset.kegiatan_id = ${kegiatan_id}
                    GROUP BY jt_lokasi_uppkb.nama, jt_kategori_aset.nama, jt_aset.nama
                    ORDER BY jt_lokasi_uppkb.nama`;
        }
        return sql;
    }

    const printDetailKegiatan = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var conditions = {
            id: req.query.id,
            is_deleted: false,
        };

        var kegiatan = await getkegiatan(conditions);
        
        // const sql = await sqlAset(req.query.id);

        // let result = await sequelize.query(sql, {
        //     type: QueryTypes.SELECT,
        //     logging: false
        // });

        let judul = '';
        if (kegiatan.length > 0) {
            judul = `${kegiatan[0].nama} (${kegiatan[0].kegiatan_sumber_anggaran.nama} ${kegiatan[0].tahun})`
        }

        var data = {
            judul: judul,
            kode: kegiatan[0].kode,
            kementerian: kegiatan[0].kegiatan_direktorat.nama,
            bptd: kegiatan[0].kegiatan_bptd.nama,
            vendor: kegiatan[0].kegiatan_vendor.nama,
            metode: kegiatan[0].kegiatan_metode.nama,
            aset: kegiatan[0].kegiatan_aset,
        }

        // var params = encrypt(`ispdf=0&device=1&id=${penimbangan[0].id}`);
        // if (req.query.kuppkb) {
        //     params = encrypt(`ispdf=0&device=1&kuppkb=${req.query.kuppkb}&id=${penimbangan[0].id}`);
        // }

        let dataqr = `${process.env.DOMAIN_URL_QR}/detailkegiatan//${kegiatan[0].id}`;
        let qrCodeDataUrl = await promiseToCreateQRcode(dataqr);
        const header = await reportTemplate();

        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        if (ispdf == 0) {
            res.render("detailKegiatanView.ejs", {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: data,
                logo: 'data:image/png;base64,' + contents,
                qr: qrCodeDataUrl
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "detailKegiatanView.ejs"), {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: data, logo: 'data:image/png;base64,' + contents, qr: qrCodeDataUrl
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    const options = {
                        format: 'A4',
                        landscape: false,
                        printBackground: true,
                        margin: { top: '8mm', bottom: '8mm' }
                    };

                    const filename = `detail_kegiatan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${req.query.id}.pdf`;
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

    const xlsDetailKegiatan = async (req, res, next) => {
        const result = await getkegiatan(req, next)
        
        if (result) {
            let arr = []

            if (result[0].kegiatan_aset.length > 0) {
                for (let row of result[0].kegiatan_aset) {
                    arr.push({
                        kode_bmn: row.kode_bmn,
                        nama: row.nama,
                        nama_uppkb: row.uppkb_aset.nama,
                        kategori: row.kategori_aset.nama,
                        satuan:row.satuan_aset.nama,
                        jenis: row.jenis_aset.nama,
                        kegiatan: row.kegiatan.nama,
                        metode: row.kegiatan.kegiatan_metode.nama,
                        sumber_anggaran: row.kegiatan.kegiatan_sumber_anggaran.nama,
                        tahun: row.kegiatan.tahun,
                        spesifikasi: row.spesifikasi,
                        kondisi: row.kondisi_aset.nama,
                        sub_kondisi: row.sub_kondisi_aset.nama,
                        keterangan: row.keterangan
                    })
                }
            }

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('Data Aset By Kegiatan', {
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
                { header: 'Nama Aset', key: 'nama', width: 20},
                { header: 'Satuan', key: 'satuan', width: 20},
                { header: 'Jenis', key: 'jenis', width: 20},
                { header: 'Kegiatan', key: 'kegiatan', width: 20},
                { header: 'Metode', key: 'metode', width: 20},
                { header: 'Sumber Anggaran', key: 'sumber_anggaran', width: 20},
                { header: 'Tahun', key: 'tahun', width: 20},
                { header: 'Spesifikasi', key: 'spesifikasi', width: 20},
                { header: 'Kondisi', key: 'kondisi', width: 20},
                { header: 'Sub Kondisi', key: 'sub_kondisi', width: 20}
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
            const filename = `kegiatan_aset_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
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

    return {
        findAll,
        findOne,
        findAllActive,
        create,
        update,
        updateStatus,
        removeSoft,
        remove,
        removeArrSoft,
        removeArr,
        truncate,
        xlsKegiatan,
        printKegiatan,
        printDetailKegiatan,
        xlsDetailKegiatan
    };
}
module.exports = KegiatanController;