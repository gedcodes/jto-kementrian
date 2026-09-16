const { 
    t_penanganan,
    Users,
    t_petugas,
    t_pengaduan,
    t_lokasi,
    t_bptd,
    t_kategori_pengaduan,
    t_status,
    t_pergantian,
    t_detail_penanganan,
    t_aset,
    t_jenis_aset,
    t_kategori_aset,
    t_sub_kondisi_aset,
    t_kondisi_aset,
    t_perbaikan,
    sequelize
} = require('../models');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const {
    syncGet
} = require('./lib/sinkronisasi');
const {
    getLokasiUppkbId,
    getBptdId,
    getLokasiUppkbKode,
    getUser
} = require('./lib/dataid');
const { uploadImage, update_status_pengaduan, update_status_perbaikan, update_status_distribusi, delete_pergantian, delete_detail_penanganan, update_perbaikan_by_aset } = require('./lib/pengaduan');
const moment = require('moment');

const PenangananController = () => {
    const countAll = async () => {
        return t_penanganan.count({
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
            const tgl_penanganan = req.query.tgl_penanganan;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;
            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                    { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                ),
                { is_deleted: false }
            ];
            const count = await countAll();
            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }

            if (id) {
                conditions = {
                    id: sequelize.col('t_penanganan.id'),
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

            if (lokasi_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (status) {
                conditions = {
                    status_id: status,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (tgl_penanganan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { is_deleted: false, is_active: true }
                ]
            }

            if (lokasi_id && bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (lokasi_id && status) {
                conditions = {
                    status_id: status,
                    lokasi_uppkb_id: lokasi_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (bptd_id && status) {
                conditions = {
                    status_id: status,
                    bptd_id: bptd_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (tgl_penanganan && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        lokasi_uppkb_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && status) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        status_id: status,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (status && lokasi_id && bptd_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_id,
                    bptd_id: bptd_id,
                    status_id: status,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (tgl_penanganan && lokasi_id && bptd_id && status) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        lokasi_uppkb_id: lokasi_id,
                        bptd_id: bptd_id,
                        status_id: status,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && lokasi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        lokasi_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && lokasi_id && status) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        lokasi_uppkb_id: lokasi_id,
                        status_id: status,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && bptd_id && status) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        bptd_id: bptd_id,
                        status_id: status,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_awal && tgl_akhir) {

                if (lokasi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        { 
                            lokasi_uppkb_id: lokasi_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        { 
                            bptd_id: bptd_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (status) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        { 
                            status_id: status,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (lokasi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            bptd_id: bptd_id,
                            lokasi_uppkb_id: lokasi_id,
                            is_active: true,
                            is_deleted: false
                        }
                    ]
                }

                if (lokasi_id && status) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            status_id: status,
                            lokasi_uppkb_id: lokasi_id,
                            is_active: true,
                            is_deleted: false
                        }
                    ]
                }

                if (bptd_id && status) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            status_id: status,
                            bptd_id: bptd_id,
                            is_active: true,
                            is_deleted: false
                        }
                    ]
                }

                if (status && lokasi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            lokasi_uppkb_id: lokasi_id,
                            bptd_id: bptd_id,
                            status_id: status,
                            is_active: true,
                            is_deleted: false
                        }
                    ]
                }
            }
            
            const options = {
                include: [
                    {
                        model: Users,
                        required: false,
                        as: 'penanganan_user',
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
                        as: 'penanganan_uppkb',
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
                        as: 'penanganan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_pengaduan,
                        required: false,
                        as: 'penanganan_pengaduan',
                        attributes: [
                            'id', 'kode', 'nama', 'tiket_id', 'tgl_pengaduan', 'desk_pengaduan', 'status_id', 'user_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: Users,
                                required: false,
                                as: 'pengaduan_user',
                                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                            }
                        ]
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
    
            const {docs, pages, total} = await t_penanganan.paginate(options)
    
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
            t_penanganan.findByPk(id, {
                include: [
                    {
                        model: Users,
                        required: false,
                        as: 'penanganan_user',
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
                        model: t_detail_penanganan,
                        required: false,
                        as: 'penanganan_detail',
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
                                as: 'detailpenanganan_aset',
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
                                as: 'detailpenanganan_kondisi_aset',
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
                                as: 'detailpenanganan_sub_kondisi_aset',
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
                        model: t_pergantian,
                        required: false,
                        as: 'penanganan_pergantian',
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
                                as: 'pergantian_aset',
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
                                as: 'pergantian_kondisi_aset',
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
                                as: 'pergantian_sub_kondisi_aset',
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
                        model: t_lokasi,
                        required: false,
                        as: 'penanganan_uppkb',
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
                        as: 'penanganan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_pengaduan,
                        required: false,
                        as: 'penanganan_pengaduan',
                        attributes: [
                            'id', 'kode', 'nama', 'tiket_id', 'tgl_pengaduan', 'desk_pengaduan', 'status_id', 'user_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: Users,
                                required: false,
                                as: 'pengaduan_user',
                                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                            }
                        ]
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
            const status = req.query.status;
            const tgl_penanganan = req.query.tgl_penanganan;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;

            let conditions = { is_deleted: false, is_active: true }
            // let conditions = [
            //     sequelize.where(
            //         sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
            //         { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
            //     ),
            //     { is_deleted: false }
            // ];
            const count = await countAll();
            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }

            if (id) {
                conditions = {
                    id: sequelize.col('t_penanganan.id'),
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

            if (lokasi_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (status) {
                conditions = {
                    status_id: status,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (tgl_penanganan) {
                conditions = {
                    tgl_penanganan: moment(tgl_penanganan).format('YYYY-MM-DD'),
                    is_active: true,
                    is_deleted: false
                }
            }

            if (lokasi_id && bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_uppkb_id: lokasi_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (lokasi_id && status) {
                conditions = {
                    status_id: status,
                    lokasi_uppkb_id: lokasi_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (bptd_id && status) {
                conditions = {
                    status_id: status,
                    bptd_id: bptd_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (tgl_penanganan && lokasi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        lokasi_uppkb_id: lokasi_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && status) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        status_id: status,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (status && lokasi_id && bptd_id) {
                conditions = {
                    lokasi_uppkb_id: lokasi_id,
                    bptd_id: bptd_id,
                    status_id: status,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (tgl_penanganan && lokasi_id && bptd_id && status) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        lokasi_uppkb_id: lokasi_id,
                        bptd_id: bptd_id,
                        status_id: status,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && lokasi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        lokasi_uppkb_id: lokasi_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && lokasi_id && status) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        lokasi_uppkb_id: lokasi_id,
                        status_id: status,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penanganan && bptd_id && status) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                        moment(tgl_penanganan).format('YYYY-MM-DD')
                    ),
                    { 
                        bptd_id: bptd_id,
                        status_id: status,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_awal && tgl_akhir) {

                conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        { 
                            is_deleted: false,
                            is_active: true
                        }
                    ]

                if (lokasi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        { 
                            lokasi_uppkb_id: lokasi_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        { 
                            bptd_id: bptd_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (status) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        { 
                            status_id: status,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (lokasi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            bptd_id: bptd_id,
                            lokasi_uppkb_id: lokasi_id,
                            is_active: true,
                            is_deleted: false
                        }
                    ]
                }

                if (lokasi_id && status) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            status_id: status,
                            lokasi_uppkb_id: lokasi_id,
                            is_active: true,
                            is_deleted: false
                        }
                    ]
                }

                if (bptd_id && status) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            status_id: status,
                            bptd_id: bptd_id,
                            is_active: true,
                            is_deleted: false
                        }
                    ]
                }

                if (status && lokasi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penanganan.tgl_penanganan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            lokasi_uppkb_id: lokasi_id,
                            bptd_id: bptd_id,
                            status_id: status,
                            is_active: true,
                            is_deleted: false
                        }
                    ]
                }
            }
            
            const options = {
                include: [
                    {
                        model: Users,
                        required: false,
                        as: 'penanganan_user',
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
                        as: 'penanganan_uppkb',
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
                        as: 'penanganan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_pengaduan,
                        required: false,
                        as: 'penanganan_pengaduan',
                        attributes: [
                            'id', 'kode', 'nama', 'tiket_id', 'tgl_pengaduan', 'desk_pengaduan', 'status_id', 'user_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: Users,
                                required: false,
                                as: 'pengaduan_user',
                                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                            }
                        ]
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
    
            const {docs, pages, total} = await t_penanganan.paginate(options)
    
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
            if (req.body.desk_penanganan != '') {
                // console.log(req.body);
                var kode_uppkb = await getLokasiUppkbKode(req.body.lokasi_uppkb_id);
                var bptd_id = await getBptdId(kode_uppkb);

                console.log('INSERT PENANGANAN');
                const field = {
                    kode: req.body.kode,
                    nama: req.body.nama,
                    pengaduan_id: req.body.pengaduan_id,
                    tgl_respond: moment(req.body.tgl_respond).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_penanganan: moment(req.body.tgl_penanganan).format('YYYY-MM-DD') || moment(new Date()).format('YYYY-MM-DD'),
                    desk_penanganan: req.body.desk_penanganan,
                    catatan: req.body.catatan || null,
                    user_id: req.token.id,
                    lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                    bptd_id: bptd_id,
                    is_respond: req.body.is_respond ? req.body.is_respond : true,
                    is_penanganan: req.body.is_penanganan ? req.body.is_penanganan : false,
                    is_active: req.body.iact ? req.body.iact : true,
                    created_by: req.token.id,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }
                console.log(field)
                return sequelize.transaction().then(function (t) {
                    return t_penanganan.create(field, { transaction: t, logging: false }).then(async (data) => {
                        try {
                            t.commit();

                            var updateStatusPengaduan = await update_status_pengaduan(data.pengaduan_id, 'jt_pengaduan', true);
                            console.log('UPDATE STATUS PENGADUAN : ', updateStatusPengaduan);

                            if (req.body.data_pergantian.length) {
                                for await (const datapergantian of req.body.data_pergantian) {

                                    t_perbaikan.update(
                                        {
                                            is_penanganan: datapergantian.is_penanganan,
                                            is_usulan: datapergantian.is_usulan,
                                            updated_by: req.token.id,
                                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                        },
                                        {
                                            where: { id: datapergantian.id },
                                            logging: false
                                        }
                                    )

                                    if (datapergantian.is_usulan) {
                                        t_pergantian.create({
                                            penanganan_id: data.id,
                                            pengaduan_id: datapergantian.pengaduan_id,
                                            aset_id: datapergantian.aset_id,
                                            kode: datapergantian.kode,
                                            nama: datapergantian.nama,
                                            img_name: datapergantian.img_name,
                                            img_url: datapergantian.img_url,
                                            img_name2: datapergantian.img_name2,
                                            img_url2: datapergantian.img_url2,
                                            img_name3: datapergantian.img_name3,
                                            img_url3: datapergantian.img_url3,
                                            img_name4: datapergantian.img_name4,
                                            img_url4: datapergantian.img_url4,
                                            keterangan: datapergantian.keterangan,
                                            kondisi_id: datapergantian.kondisi_id,
                                            sub_kondisi_aset_id: datapergantian.sub_kondisi_aset_id,
                                            created_by: req.token.id,
                                            lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                                            bptd_id: bptd_id
                                        }, {logging:false})
                                    }

                                    if (datapergantian.is_penanganan) {
                                        t_detail_penanganan.create({
                                            penanganan_id: data.id,
                                            pengaduan_id: datapergantian.pengaduan_id,
                                            aset_id: datapergantian.aset_id,
                                            kode: datapergantian.kode,
                                            nama: datapergantian.nama,
                                            // keterangan: datapergantian.keterangan,
                                            kondisi_id: datapergantian.kondisi_id,
                                            sub_kondisi_aset_id: datapergantian.sub_kondisi_aset_id,
                                            created_by: req.token.id,
                                            lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                                            bptd_id: bptd_id
                                        }, {logging:false})

                                        var updateStatusPerbaikan = await update_status_perbaikan(datapergantian.id, 'jt_perbaikan', true);
                                        console.log('UPDATE STATUS PERBAIKAN : ', updateStatusPerbaikan);
                                    }
                                }
                            }

                            // var updateStatusDistribusi = await update_status_distribusi(req.body.pengaduan_id, 'jt_distribusi_aduan', status);
                            // console.log('UPDATE STATUS DISTRIBUSI : ', updateStatusDistribusi);

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
                // res.send({
                //     success: true,
                //     message: messageService().CREATE_SUCCESS,
                //     data: req.body
                // });

            } else {
                res.send({
                    success: false,
                    message: 'Deskripsi Penanganan Tidak Boleh Kosong',
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
    
            if (id) {
                // var kode_uppkb = await getLokasiUppkbKode(req.body.lokasi_uppkb_id);
                // var bptd_id = await getBptdId(kode_uppkb);

                console.log('UPDATE PENANGANAN');

                return sequelize.transaction().then(async (t) => {
                    return t_penanganan.update({
                        nama: req.body.nama,
                        desk_penanganan: req.body.desk_penanganan,
                        catatan: req.body.catatan || null,
                        updated_by: req.token.id,
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, { where: { id: id }, transaction: t }).then(async (num) => {
                        try {
                            t.commit();

                            var deletepergantian = await delete_pergantian(id);
                            console.log('DELETE PERGANTIAN : ', deletepergantian);

                            var deletedetailpenanganan = await delete_detail_penanganan(id);
                            console.log('DELETE DETAIL PENANGANAN : ', deletedetailpenanganan);

                            if (req.body.data_pergantian.length > 0) {                                

                                for await (const datapergantian of req.body.data_pergantian) {

                                    await t_perbaikan.update(
                                        {
                                            is_penanganan: datapergantian.is_penanganan,
                                            is_usulan: datapergantian.is_usulan,
                                            updated_by: req.token.id,
                                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                        },
                                        {
                                            where: { id: datapergantian.id },
                                            logging: false
                                        }
                                    )

                                    if (datapergantian.is_usulan) {
                                        await t_pergantian.create({
                                            penanganan_id: id,
                                            pengaduan_id: datapergantian.pengaduan_id,
                                            aset_id: datapergantian.aset_id,
                                            kode: datapergantian.kode,
                                            nama: datapergantian.nama,
                                            img_name: datapergantian.img_name,
                                            img_url: datapergantian.img_url,
                                            img_name2: datapergantian.img_name2,
                                            img_url2: datapergantian.img_url2,
                                            img_name3: datapergantian.img_name3,
                                            img_url3: datapergantian.img_url3,
                                            img_name4: datapergantian.img_name4,
                                            img_url4: datapergantian.img_url4,
                                            keterangan: datapergantian.keterangan,
                                            kondisi_id: datapergantian.kondisi_id,
                                            sub_kondisi_aset_id: datapergantian.sub_kondisi_aset_id,
                                            created_by: req.token.id,
                                            lokasi_uppkb_id: datapergantian.lokasi_uppkb_id,
                                            bptd_id: datapergantian.bptd_id
                                        }, {logging:false})

                                        var updateStatusPerbaikan = await update_perbaikan_by_aset(datapergantian.aset_id, 'jt_perbaikan', false);
                                        console.log('UPDATE STATUS PERBAIKAN : ', updateStatusPerbaikan);
                                    }

                                    if (datapergantian.is_penanganan) {
                                        await t_detail_penanganan.create({
                                            penanganan_id: id,
                                            pengaduan_id: datapergantian.pengaduan_id,
                                            aset_id: datapergantian.aset_id,
                                            kode: datapergantian.kode,
                                            nama: datapergantian.nama,
                                            // keterangan: datapergantian.keterangan,
                                            kondisi_id: datapergantian.kondisi_id,
                                            sub_kondisi_aset_id: datapergantian.sub_kondisi_aset_id,
                                            created_by: req.token.id,
                                            lokasi_uppkb_id: datapergantian.lokasi_uppkb_id,
                                            bptd_id: datapergantian.bptd_id
                                        }, {logging:false})

                                        var updateStatusPerbaikan = await update_perbaikan_by_aset(datapergantian.aset_id, 'jt_perbaikan', true);
                                        console.log('UPDATE STATUS PERBAIKAN : ', updateStatusPerbaikan);
                                    }

                                }
                            }

                            res.send({
                                success: true,
                                message: messageService().UPDATE_SUCCESS
                            });
                        } catch (error) {
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

    const updateStatusPenanganan = async (req, res, next) => {
        console.log("--------------------::Processing Update Status Pengaduan::--------------------");
    
        try {
            const id = req.params.id;
    
            if (id) {
                // var kode_uppkb = await getLokasiUppkbKode(req.body.lokasi_uppkb_id);
                // var bptd_id = await getBptdId(kode_uppkb);

                console.log('UPDATE STATUS PENANGANAN');

                return sequelize.transaction().then(async (t) => {
                    return t_penanganan.update({
                        is_penanganan: req.body.is_penanganan,
                        updated_by: req.token.id,
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, { where: { id: id }, transaction: t }).then(async (num) => {
                        try {
                            t.commit();

                            const editData = await t_detail_penanganan.findAll({
                                where: {
                                    penanganan_id: id,
                                    is_deleted: false
                                },
                                logging: false
                            })
                            // console.log('DATA DETAIL PENANGANAN', editData.count());

                            for await (const dataedit of editData) {
                                t_detail_penanganan.update(
                                    {
                                        kondisi_id: 1,
                                        sub_kondisi_aset_id: 1,
                                        keterangan: 'Sudah Ditangani',
                                        updated_by: req.token.id,
                                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                    },
                                    {
                                        where: { id: dataedit.id },
                                        logging: false
                                    }
                                )
                                t_aset.update(
                                    {
                                        kondisi_id: 1,
                                        sub_kondisi_aset_id: 1,
                                        updated_by: req.token.id,
                                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                    },
                                    {
                                        where: { id: dataedit.aset_id },
                                        logging: false
                                    }
                                )
                                t_perbaikan.update(
                                    {
                                        kondisi_id: 1,
                                        sub_kondisi_aset_id: 1,
                                        updated_by: req.token.id,
                                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                    },
                                    {
                                        where: { aset_id: dataedit.aset_id },
                                        logging: false
                                    }
                                )
                            }

                            res.send({
                                success: true,
                                message: messageService().UPDATE_SUCCESS
                            });
                        } catch (error) {
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

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");
    
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i=>Number(i));

            t_penanganan.update(
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
            t_penanganan.destroy({
                where: { id: id }
            }).then(async num => {
                if(num == 1){

                    var deletepergantian = await delete_pergantian(id);
                    console.log('DELETE PERGANTIAN : ', deletepergantian);

                    var deletedetailpenanganan = await delete_detail_penanganan(id);
                    console.log('DELETE DETAIL PENANGANAN : ', deletedetailpenanganan);

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
            t_penanganan.destroy({
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
            t_penanganan.update(
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

            t_penanganan.update(
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
            t_penanganan.destroy(
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
        findAll,
        findOne,
        findAllActive,
        create,
        update,
        updateStatus,
        updateStatusPenanganan,
        remove,
        removeArr,
        truncate,
        removeSoft,
        removeArrSoft,
    };
}
module.exports = PenangananController;