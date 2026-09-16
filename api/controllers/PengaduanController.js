const {
    t_pengaduan,
    t_bptd,
    t_petugas,
    t_lokasi,
    Users,
    t_penanganan,
    t_distribusi_aduan,
    t_prioritas_aduan,
    t_aset,
    t_status,
    t_direktorat,
    t_distribusi_tembusan,
    t_kondisi_aset,
    t_sub_kondisi_aset,
    t_perbaikan,
    t_jenis_aset,
    t_kategori_aset,
    sequelize } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const messageService =  require('../services/message.service');
const {
    syncGet
} = require('./lib/sinkronisasi');
const { upsert_pengaduan } = require('./lib/upsertdata');
const {
    getLokasiUppkbId,
    getBptdId,
    getLokasiUppkbKode
} = require('./lib/dataid');
const { uploadImage, uploadFile, randomString, insert_distribusi, update_kondisi_aset, insert_distribusi_tembusan } = require('./lib/pengaduan');
const moment = require('moment');

const PengaduanController = () => {
    const countAll = async () => {
        return t_pengaduan.count({
            where:{
                is_deleted: false
            }
        });
    } 

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const id = req.query.id;
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const status = req.query.status;
            const tgl_pengaduan = req.query.tgl_pengaduan;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;

            const count = await countAll();

            let conditions = {
                is_deleted: false
            };

            if (name) {
                conditions.nama = { [Op.iLike]: `%${name}%` };
            }

            if (id) {
                conditions.id = id;
            }

            if (bptd_id) {
                conditions.bptd_id = bptd_id;
            }

            if (lokasi_id) {
                conditions.lokasi_uppkb_id = lokasi_id;
            }

            if (status) {
                conditions.status_id = status;
            }

            if (tgl_pengaduan) {
                conditions.tgl_pengaduan = moment(tgl_pengaduan).format('YYYY-MM-DD');
            }

            if (tgl_awal && tgl_akhir) {
                conditions.tgl_pengaduan = {
                    [Op.between]: [moment(tgl_awal).startOf('day').format(), moment(tgl_akhir).endOf('day').format()],
                };
            }
            
            const options = {
                include: [
                    {
                        model: Users,
                        required: false,
                        as: 'pengaduan_user',
                        attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                        where: {
                            is_active: true
                        },
                        include: [
                            {
                                model: t_petugas,
                                required: false,
                                as: 'userpetugas',
                                attributes: [
                                    'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ]
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'pengaduan_uppkb',
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
                        as: 'pengaduan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_penanganan,
                        required: false,
                        as: 'pengaduan_penanganan',
                        attributes: [
                            'id', 'kode', 'nama', 'pengaduan_id', 'tgl_penanganan', 'desk_penanganan', 'catatan', 'status_id', 'user_id', 'is_respond', 'is_penanganan', 'tgl_respond'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: Users,
                                required: false,
                                as: 'penanganan_user',
                                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                            },
                            {
                                model: t_status,
                                required: false,
                                as: 'penanganan_status',
                                attributes: [
                                    'id', 'kode', 'nama', 'alias', 'keterangan', 'kategori_status_id'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                        ]
                    },
                    {
                        model: t_perbaikan,
                        required: false,
                        as: 'pengaduan_perbaikan',
                        attributes: [
                            'id', 'kode', 'nama', 'aset_id', 'img_name', 'img_url', 'keterangan', 'kondisi_id', 'sub_kondisi_aset_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_aset,
                                required: false,
                                as: 'perbaikan_aset',
                                attributes: [
                                    'id', 'kode', 'nama', 'bptd_id', 'lokasi_uppkb_id', 'kegiatan_id', 'kategori_id', 'spesifikasi', 'keterangan', 'kondisi_id', 'sub_kondisi_aset_id', 'jenis_id', 'kode_bmn', 'nup', 'nilai_perolehan', 'no_spk', 'uraian', 'img1_name', 'img1_url', 'img2_name', 'img2_url', 'img3_name', 'img3_url', 'img4_name', 'img4_url'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                
                                include: [
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
                                        model: t_kondisi_aset,
                                        required: false,
                                        as: 'kondisi_aset',
                                        attributes: ['id', 'kode', 'nama'],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        },
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
                            },
                            {
                                model: t_kondisi_aset,
                                required: false,
                                as: 'perbaikan_kondisi_aset',
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
                                as: 'perbaikan_sub_kondisi_aset',
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
                        model: t_status,
                        required: false,
                        as: 'pengaduan_status',
                        attributes: [
                            'id', 'kode', 'nama', 'alias', 'keterangan', 'kategori_status_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_prioritas_aduan,
                        required: false,
                        as: 'pengaduan_prioritas',
                        attributes: ['id', 'kode', 'nama', 'keterangan'],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
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
    
            const {docs, pages, total} = await t_pengaduan.paginate(options)
    
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

    const findOne = async (req, res, next) => {
        console.log("--------------------::Processing Find One::--------------------");
        try{
            const id = req.params.id;
            t_pengaduan.findByPk(id, {
                include: [
                    {
                        model: Users,
                        required: false,
                        as: 'pengaduan_user',
                        attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                        where: {
                            is_active: true
                        },
                        include: [
                            {
                                model: t_petugas,
                                required: false,
                                as: 'userpetugas',
                                attributes: [
                                    'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ]
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'pengaduan_uppkb',
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
                        as: 'pengaduan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_penanganan,
                        required: false,
                        as: 'pengaduan_penanganan',
                        attributes: [
                            'id', 'kode', 'nama', 'pengaduan_id', 'tgl_penanganan', 'desk_penanganan', 'catatan', 'status_id', 'user_id', 'is_respond', 'is_penanganan', 'tgl_respond'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: Users,
                                required: false,
                                as: 'penanganan_user',
                                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                            },
                            {
                                model: t_status,
                                required: false,
                                as: 'penanganan_status',
                                attributes: [
                                    'id', 'kode', 'nama', 'alias', 'keterangan', 'kategori_status_id'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                        ]
                    },
                    {
                        model: t_perbaikan,
                        required: false,
                        as: 'pengaduan_perbaikan',
                        attributes: [
                            'id', 'kode', 'nama', 'aset_id', 'img_name', 'img_url', 'keterangan', 'kondisi_id', 'sub_kondisi_aset_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_aset,
                                required: false,
                                as: 'perbaikan_aset',
                                attributes: [
                                    'id', 'kode', 'nama', 'bptd_id', 'lokasi_uppkb_id', 'kegiatan_id', 'kategori_id', 'spesifikasi', 'keterangan', 'kondisi_id', 'sub_kondisi_aset_id', 'jenis_id', 'kode_bmn', 'nup', 'nilai_perolehan', 'no_spk', 'uraian', 'img1_name', 'img1_url', 'img2_name', 'img2_url', 'img3_name', 'img3_url', 'img4_name', 'img4_url'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                
                                include: [
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
                                        model: t_kondisi_aset,
                                        required: false,
                                        as: 'kondisi_aset',
                                        attributes: ['id', 'kode', 'nama'],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        },
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
                            },
                            {
                                model: t_kondisi_aset,
                                required: false,
                                as: 'perbaikan_kondisi_aset',
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
                                as: 'perbaikan_sub_kondisi_aset',
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
                        model: t_status,
                        required: false,
                        as: 'pengaduan_status',
                        attributes: [
                            'id', 'kode', 'nama', 'alias', 'keterangan', 'kategori_status_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_prioritas_aduan,
                        required: false,
                        as: 'pengaduan_prioritas',
                        attributes: ['id', 'kode', 'nama', 'keterangan'],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                ],
                where:{
                    is_deleted: false
                },
                logging: false
            }).then(data => {
                res.json({
                    success: true,
                    message: `${messageService().GET_SUCCESS}`,
                    data: data
                });
            }).catch(err => {
                res.send({
                    success: false,
                    message: `${messageService().GET_FAILED}`
                });
            });
        }catch (error){
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try{
            const name = req.query.search;
            const id = req.query.id;
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            // const kategori_pengaduan_id = req.query.kategori_pengaduan_id;
            const is_penanganan = req.query.is_penanganan;
            const tgl_pengaduan = req.query.tgl_pengaduan;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;

            const count = await countAll();

            let conditions = {
                is_active: true,
                is_deleted: false
            };

            if (name) {
                conditions.nama = { [Op.iLike]: `%${name}%` };
            }

            if (id) {
                conditions.id = id;
            }

            if (bptd_id) {
                conditions.bptd_id = bptd_id;
            }

            if (lokasi_id) {
                conditions.lokasi_uppkb_id = lokasi_id;
            }

            if (is_penanganan) {
                conditions.is_penanganan = is_penanganan;
            }

            if (tgl_pengaduan) {
                conditions.tgl_pengaduan = moment(tgl_pengaduan).format('YYYY-MM-DD');
            }

            if (tgl_awal && tgl_akhir) {
                conditions.tgl_pengaduan = {
                    [Op.between]: [moment(tgl_awal).startOf('day').format(), moment(tgl_akhir).endOf('day').format()],
                };
            }
            
            const options = {
                include: [
                    {
                        model: Users,
                        required: false,
                        as: 'pengaduan_user',
                        attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                        where: {
                            is_active: true
                        },
                        include: [
                            {
                                model: t_petugas,
                                required: false,
                                as: 'userpetugas',
                                attributes: [
                                    'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ]
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'pengaduan_uppkb',
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
                        as: 'pengaduan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_penanganan,
                        required: false,
                        as: 'pengaduan_penanganan',
                        attributes: [
                            'id', 'kode', 'nama', 'pengaduan_id', 'tgl_penanganan', 'desk_penanganan', 'catatan', 'status_id', 'user_id', 'is_respond', 'is_penanganan', 'tgl_respond'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: Users,
                                required: false,
                                as: 'penanganan_user',
                                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                            },
                            {
                                model: t_status,
                                required: false,
                                as: 'penanganan_status',
                                attributes: [
                                    'id', 'kode', 'nama', 'alias', 'keterangan', 'kategori_status_id'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                        ]
                    },
                    {
                        model: t_perbaikan,
                        required: false,
                        as: 'pengaduan_perbaikan',
                        attributes: [
                            'id', 'kode', 'nama', 'aset_id', 'img_name', 'img_url', 'keterangan', 'kondisi_id', 'sub_kondisi_aset_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_aset,
                                required: false,
                                as: 'perbaikan_aset',
                                attributes: [
                                    'id', 'kode', 'nama', 'bptd_id', 'lokasi_uppkb_id', 'kegiatan_id', 'kategori_id', 'spesifikasi', 'keterangan', 'kondisi_id', 'sub_kondisi_aset_id', 'jenis_id', 'kode_bmn', 'nup', 'nilai_perolehan', 'no_spk', 'uraian', 'img1_name', 'img1_url', 'img2_name', 'img2_url', 'img3_name', 'img3_url', 'img4_name', 'img4_url'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                
                                include: [
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
                                        model: t_kondisi_aset,
                                        required: false,
                                        as: 'kondisi_aset',
                                        attributes: ['id', 'kode', 'nama'],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        },
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
                            },
                            {
                                model: t_kondisi_aset,
                                required: false,
                                as: 'perbaikan_kondisi_aset',
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
                                as: 'perbaikan_sub_kondisi_aset',
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
                        model: t_status,
                        required: false,
                        as: 'pengaduan_status',
                        attributes: [
                            'id', 'kode', 'nama', 'alias', 'keterangan', 'kategori_status_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_prioritas_aduan,
                        required: false,
                        as: 'pengaduan_prioritas',
                        attributes: ['id', 'kode', 'nama', 'keterangan'],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
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
    
            const {docs, pages, total} = await t_pengaduan.paginate(options)
    
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
        }catch (error){
            next(error)
        }
    }

    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            if (req.body.desk_pengaduan != '') {
                var kode_uppkb = await getLokasiUppkbKode(req.body.lokasi_uppkb_id);
                var bptd_id = await getBptdId(kode_uppkb);
                var random = await randomString(10);

                let uploads = [];

                var dataFile = {
                    surat_pengantar_name: null,
                    surat_pengantar_url: null,
                }

                if (process.env.IS_KEMENHUB == 1) {
                    if (req.files) {

                        var uploadFilePdf = await uploadFile('surat_pengantar', req.body.kode, req.files.surat_pengantar);

                        dataFile = {
                            surat_pengantar_name: uploadFilePdf.pdfName || '',
                            surat_pengantar_url: uploadFilePdf.pdfUrl || '',
                        }

                        // console.log('DATA FOTO : ', dataFoto);
                        console.log('DATA FILE : ', dataFile);
                    }
                }
                        
                Promise.all(uploads).then(async () => {
                    console.log('INSERT WITH IMAGE');
                    const field = {
                        kode: req.body.kode,
                        nama: req.body.nama,
                        tiket_id: kode_uppkb + '_' + moment().format('YYYYMMDDHHmmss'),
                        // kategori_pengaduan_id: req.body.kategori_pengaduan_id,
                        tgl_pengaduan: moment(req.body.tgl_pengaduan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        desk_pengaduan: req.body.desk_pengaduan,
                        prioritas_aduan_id: req.body.prioritas,
                        // status_id: req.body.status_id || 1,
                        lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                        bptd_id: bptd_id,
                        user_id: req.token.id,
                        // ...dataFoto,
                        is_active: req.body.iact ? req.body.iact : true,
                        // ...dataAset,
                        created_by: req.token.id,
                        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                        ...dataFile,
                    }
                    console.log(field)
                    return sequelize.transaction().then(function (t) {
                        return t_pengaduan.create(field, { transaction: t, logging: false }).then(async (data) => {
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

            } else {
                res.send({
                    success: false,
                    message: 'Deskripsi Pengaduan Tidak Boleh Kosong',
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const update = async (req, res, next) => {      
        console.log("--------------------::Processing Update::--------------------");
    
        try {
            const id = req.params.id;
            console.log(id);
    
            if (id) {
                var kode_uppkb = await getLokasiUppkbKode(req.body.lokasi_uppkb_id);
                var bptd_id = await getBptdId(kode_uppkb);
                let uploads = [];

                const editDataPengaduan = await t_pengaduan.findOne({
                    where: {
                        id: id,
                        is_deleted: false
                    },
                    logging: false
                })

                let dataFile = {
                    surat_pengantar_name: editDataPengaduan.surat_pengantar_name,
                    surat_pengantar_url: editDataPengaduan.surat_pengantar_url
                }

                if (req.files) {
                    // console.log('FOTO DEPAN : ', req.files.fotoDepan);
                    var uploadFilePdf = await uploadFile('surat_pengantar', req.body.kode, req.files.surat_pengantar);

                    dataFile = {
                        surat_pengantar_name: uploadFilePdf.pdfName || '',
                        surat_pengantar_url: uploadFilePdf.pdfUrl || '',
                    }
                    // await removeFileExist(id);
                    console.log('DATA FILE : ', dataFile);
                }

                Promise.all(uploads).then(async () => {
                    console.log('UPDATE WITH PHOTO');


                    return sequelize.transaction().then(async (t) => {
                        return t_pengaduan.update({
                            kode: req.body.kode,
                            nama: req.body.nama,
                            desk_pengaduan: req.body.desk_pengaduan,
                            prioritas_aduan_id: req.body.prioritas,
                            lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                            bptd_id: bptd_id,
                            // ...dataFoto,
                            ...dataFile,
                            updated_by: req.token.id,
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        }, { where: { id: id }, transaction: t }).then(async (num) => {
                            try {
                                t.commit();

                                // var field_distribusi = {
                                //     nama: req.body.nama,
                                //     prioritas_aduan_id: req.body.prioritas,
                                //     updated_by: req.token.id,
                                //     updated_at: num.updated_at,
                                // }
                                // var insertdistribusi = await insert_distribusi(field_distribusi, id);
                                // console.log('UPSERT DISTRIBUSI : ', insertdistribusi);

                                // var insertdistribusitembusan = await insert_distribusi_tembusan(insertdistribusi.id, arrdirektorat, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                // console.log('UPSERT DISTRIBUSI TEMBUSAN : ', insertdistribusitembusan);

                                // if (req.body.aset) {
                                //     var update_kondisi = await update_kondisi_aset(req.body.aset, 'jt_aset', req.body.kondisi_aset);
                                //     console.log('UPDATE KONDISI ASET : ', update_kondisi);
                                // }

                                res.send({
                                    success: true,
                                    message: messageService().UPDATE_SUCCESS
                                });
                            } catch (error) {
                                console.log(error);
                                t.rollback().catch(() => { });
                                res.send({
                                    success: false,
                                    message: messageService().UPDATE_FAILED
                                });
                            }
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
            };
                      
        } catch (error) {
            next(error)
        }
    }

    const updateStatusPengaduan = async (req, res, next) => {
        console.log("--------------------::Processing Update Status Pengaduan::--------------------");
    
        try {
            if (req.body.status) {
                var q = req.query.arrId;
                var resSplit = q.split(",").map(i=>Number(i));

                t_pengaduan.update(
                    {
                        status_id: req.body.status,
                        updated_by: req.token.id,
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                    },
                    {
                        where: {id:{ [Op.any]: `{${resSplit}}` }},
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
                    res.send({
                        success: false,
                        message: `${messageService().UPDATE_STATUS_FAILED}. ${err}`
                    });
                });
            } else {
                res.send({
                    success: false,
                    message: 'Status Tidak Boleh Kosong',
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
            var resSplit = q.split(",").map(i=>Number(i));

            t_pengaduan.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                },
                {
                    where: {id:{ [Op.any]: `{${resSplit}}` }},
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
                res.send({
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
            t_pengaduan.destroy({
                where: { id: id }
            }).then(num => {
                if(num == 1){
                    res.json({ 
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                }else{
                    res.json({ 
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });          
                }
            }).catch(err => {
                console.log(err);
                res.json({
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
        var resSplit = q.split(",").map(i=>Number(i));
        try {
            t_pengaduan.destroy({
                where: {id:{ [Op.in]: resSplit }}
            }).then(num => {
                if(num == resSplit.length){
                    //if(i == resSplit.length){
                    
                        res.json({ 
                            success: true,
                            message: messageService().REMOVE_SUCCESS
                        });
                    
                        //}   
                }else{
                    res.json({ 
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });          
                }
            }).catch(err => {
                console.log(err);
                res.json({
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
            t_pengaduan.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: {id: id},
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
                res.send({
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
            var resSplit = q.split(",").map(i=>Number(i));

            t_pengaduan.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: {id:{ [Op.any]: `{${resSplit}}` }},
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
                res.send({
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
            t_pengaduan.destroy(
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
    
    
    return {
        // sinkronisasi,
        findAll,
        findOne,
        findAllActive,
        create,
        update,
        updateStatus,
        updateStatusPengaduan,
        remove,
        removeArr,
        truncate,
        removeSoft,
        removeArrSoft,
    };
}
module.exports = PengaduanController;