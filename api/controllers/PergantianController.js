const {
    t_pergantian,
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
    t_jenis_aset,
    t_kategori_aset,
    t_pengaduan,
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

const PergantianController = () => {
    const countAll = async () => {
        return t_pergantian.count({
            where:{
                is_deleted: false
            }
        });
    } 

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const pengaduan_id = req.query.pengaduan_id;
            const penanganan_id = req.query.penanganan_id;
            const bptd_id = req.query.bptd;
            const lokasi_uppkb_id = req.query.lokasi;

            const count = await countAll();

            let conditions = {
                is_deleted: false
            };

            if (name) {
                conditions.nama = { [Op.iLike]: `%${name}%` };
            }

            if (pengaduan_id) {
                conditions.pengaduan_id = pengaduan_id;
            }

            if (penanganan_id) {
                conditions.penanganan_id = penanganan_id;
            }

            if (bptd_id) {
                conditions.bptd_id = bptd_id;
            }

            if (lokasi_uppkb_id) {
                conditions.lokasi_uppkb_id = lokasi_uppkb_id;
            }

            const options = {
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
    
            const {docs, pages, total} = await t_pergantian.paginate(options)
    
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
            t_pergantian.findByPk(id, {
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
            const pengaduan_id = req.query.pengaduan_id;
            const penanganan_id = req.query.penanganan_id;
            const bptd_id = req.query.bptd;
            const lokasi_uppkb_id = req.query.lokasi;
            const status_pergantian = req.query.status_pergantian;
            const is_usulan = req.query.is_usulan;

            const count = await countAll();

            let conditions = {
                is_deleted: false,
                is_active: true
            };

            if (name) {
                conditions.nama = { [Op.iLike]: `%${name}%` };
            }

            if (pengaduan_id) {
                conditions.pengaduan_id = pengaduan_id;
            }

            if (penanganan_id) {
                conditions.penanganan_id = penanganan_id;
            }

            if (bptd_id) {
                conditions.bptd_id = bptd_id;
            }

            if (lokasi_uppkb_id) {
                conditions.lokasi_uppkb_id = lokasi_uppkb_id;
            }

            if (status_pergantian) {
                conditions.status_pergantian = status_pergantian;
            }

            if (is_usulan) {
                conditions.is_usulan = is_usulan;
            }

            const options = {
                include: [
                    {
                        model: t_bptd,
                        required: false,
                        as: 'pergantian_bptd',
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
                        as: 'pergantian_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'bptd_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_pengaduan,
                        required: false,
                        as: 'pergantian_pengaduan',
                        attributes: [
                            'id', 'kode', 'nama', 'tiket_id', 'tgl_pengaduan', 'desk_pengaduan', 'status_id', 'user_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_penanganan,
                        required: false,
                        as: 'pergantian_penanganan',
                        attributes: [
                            'id', 'kode', 'nama', 'pengaduan_id', 'tgl_penanganan', 'desk_penanganan', 'catatan', 'user_id', 'is_penanganan'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
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
    
            const {docs, pages, total} = await t_pergantian.paginate(options)
    
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

                let uploads = [];
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
                        const dataImage = await uploadImage('aduan', 'img1', req.files.image1);
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
                        const dataImage = await uploadImage('aduan', 'img1', req.files.image2)
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
                        const dataImage = await uploadImage('aduan', 'img1', req.files.image3)
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
                        const dataImage = await uploadImage('aduan', 'img1', req.files.image4)
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
                        
                Promise.all(uploads).then(async () => {
                    console.log('INSERT WITH IMAGE');
                    const field = {
                        pengaduan_id: req.body.pengaduan_id,
                        aset_id: req.body.aset_id,
                        kode: req.body.kode,
                        nama: req.body.nama,
                        keterangan: req.body.keterangan,
                        kondisi_id: req.body.kondisi_id,
                        sub_kondisi_aset_id: req.body.sub_kondisi_aset_id,
                        lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                        bptd_id: req.body.bptd_id,
                        img_name: image1.imgName,
                        img_url: image1.imgUrl,
                        img_name2: image2.imgName,
                        img_url2: image2.imgUrl,
                        img_name3: image3.imgName,
                        img_url3: image3.imgUrl,
                        img_name4: image4.imgName,
                        img_url4: image4.imgUrl,
                        is_active: req.body.iact ? req.body.iact : true,
                        created_by: req.token.id,
                        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    }
                    console.log(field)
                    return sequelize.transaction().then(function (t) {
                        return t_pergantian.create(field, { transaction: t, logging: false }).then(async (data) => {
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
    
            if (id) {

                let uploads = [];

                const editDataAset = await t_pergantian.findOne({
                    where: {
                        id: id,
                        is_deleted: false
                    },
                    logging: false
                })

                let image1 = {
                    imgName: editDataAset.img_name,
                    imgUrl: editDataAset.img_url
                }

                let image2 = {
                    imgName: editDataAset.img_name2,
                    imgUrl: editDataAset.img_url2
                }

                let image3 = {
                    imgName: editDataAset.img_name3,
                    imgUrl: editDataAset.img_url3
                }

                let image4 = {
                    imgName: editDataAset.img_name4,
                    imgUrl: editDataAset.img_url4
                }

                if (req.files) {
                    if(req.files.image1) {
                        const dataImage = await uploadImage('aduan', 'img1', req.files.image1);
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
                        const dataImage = await uploadImage('aduan', 'img1', req.files.image2)
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
                        const dataImage = await uploadImage('aduan', 'img1', req.files.image3)
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
                        const dataImage = await uploadImage('aduan', 'img1', req.files.image4)
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
                

                Promise.all(uploads).then(async () => {
                    console.log('UPDATE WITH PHOTO');


                    return sequelize.transaction().then(async (t) => {
                        return t_pergantian.update({
                            pengaduan_id: req.body.pengaduan_id,
                            aset_id: req.body.aset_id,
                            kode: req.body.kode,
                            nama: req.body.nama,
                            keterangan: req.body.keterangan,
                            kondisi_id: req.body.kondisi_id,
                            sub_kondisi_aset_id: req.body.sub_kondisi_aset_id,
                            lokasi_uppkb_id: req.body.lokasi_uppkb_id,
                            bptd_id: req.body.bptd_id,
                            img_name: image1.imgName,
                            img_url: image1.imgUrl,
                            img_name2: image2.imgName,
                            img_url2: image2.imgUrl,
                            img_name3: image3.imgName,
                            img_url3: image3.imgUrl,
                            img_name4: image4.imgName,
                            img_url4: image4.imgUrl,
                            updated_by: req.token.id,
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        }, { where: { id: id }, transaction: t }).then(async (num) => {
                            try {
                                t.commit();

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

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update Status::--------------------");
    
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i=>i);
            console.log(q,resSplit, req.body.is_usulan);

            t_pergantian.update(
                {
                    is_active: req.body.iact ? req.body.iact : true,
                    is_usulan: req.body.is_usulan ? req.body.is_usulan : false,
                    status_pergantian: req.body.status_pergantian ? req.body.status_pergantian : false,
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
            t_pergantian.destroy({
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
            t_pergantian.destroy({
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
            t_pergantian.update(
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

            t_pergantian.update(
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
            t_pergantian.destroy(
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
        remove,
        removeArr,
        truncate,
        removeSoft,
        removeArrSoft,
    };
}
module.exports = PergantianController;