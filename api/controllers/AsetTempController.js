const {
    t_aset_temp,
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
    t_pergantian,
    sequelize,
} = require('../models');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const moment = require('moment');

const path = require("path");
var QRCode = require('qrcode');
let ejs = require("ejs");
const excel = require('exceljs');
const { encrypt } = require('./lib/aescrypt');
const config = require('../../config/config');

const { uploadImage, removeImage } = require('./lib/aset');

const AsetTempController = () => {

    const countAll = async () => {
        return t_aset_temp.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findPagination = async (req, res, next) => {
        console.log("--------------------::Processing Find All Server Side Pagination::--------------------");
        try {
            const temp_id = req.query.temp_id
            const kegiatan_id = req.query.kegiatan_id

            let conditions = { is_deleted: false }
            let where_tahun = { is_deleted: false }
            const count = await countAll();

            if (kegiatan_id) {
                conditions.kegiatan_id = kegiatan_id;
            }

            if (temp_id) {
                conditions.temp_id = temp_id;
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
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_aset_temp.paginate(options)

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
            t_aset_temp.findByPk(id, {
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

            const { docs, pages, total } = await t_aset_temp.paginate(options)
            // const propinsi = await t_aset_temp.findAll({
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
                kategori_id: req.body.kategori_id,
                // kegiatan_id: req.body.kegiatan_id ? req.body.kegiatan_id : null,
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
                uraian: req.body.uraian ? req.body.uraian : '',
                // qty: req.body.qty,
                spesifikasi: req.body.spesifikasi ? req.body.spesifikasi : '',
                keterangan: req.body.keterangan ? req.body.keterangan : '',
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
                temp_id: req.body.temp_id,
                parent_id: req.body.parent_id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                is_terpasang: req.body.is_terpasang ?? true,
                is_parent: req.body.is_parent ?? false
            };

            t_aset_temp.create(field, {
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
        const editDataAset = await t_aset_temp.findOne({
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
            

            t_aset_temp.update(
                {
                    kategori_id: req.body.kategori_id,
                    // kegiatan_id: req.body.kegiatan_id ? req.body.kegiatan_id : null,
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
                    uraian: req.body.uraian ? req.body.uraian : '',
                    // qty: req.body.qty,
                    spesifikasi: req.body.spesifikasi ? req.body.spesifikasi : '',
                    keterangan: req.body.keterangan ? req.body.keterangan : '',
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
                    temp_id: req.body.temp_id,
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

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_aset_temp.update(
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
            t_aset_temp.update(
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
            const editData = await t_aset_temp.findOne({
                where: {
                    id: id,
                    is_deleted: false
                },
                logging: false
            });
            if (editData.parent_id) {
                t_pergantian.update(
                    {
                        is_usulan: false,
                    },
                    {
                        where: {aset_id: editData.parent_id},
                        logging: false
                    }
                )
            }
            t_aset_temp.destroy({
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

            t_aset_temp.update(
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
            t_aset_temp.destroy({
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
            t_aset_temp.destroy(
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
        findPagination,
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
    };
}
module.exports = AsetTempController;