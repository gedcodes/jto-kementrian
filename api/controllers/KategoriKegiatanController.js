const { t_kategori_kegiatan, t_kegiatan, t_vendor, t_direktorat, t_instansi, t_bptd, t_sumber_anggaran, t_metode, sequelize } = require('../models');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const {
    syncGet
} = require('./lib/sinkronisasi');
const moment = require('moment');

const KategoriKegiatanController = () => {
    const countAll = async () => {
        return t_kategori_kegiatan.count({
            where:{
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const conditions = {is_deleted: false}
            
            const count = await countAll();

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                include: [
                    {
                        model: t_kegiatan,
                        required: false,
                        as: 'kegiatan',
                        attributes: ['id', 'kode', 'nama', 'deskripsi'],
                        where: {
                            is_active: true,
                            is_deleted: false,
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
    
            const {docs, pages, total} = await t_kategori_kegiatan.paginate(options)
    
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
            t_kategori_kegiatan.findByPk(id, {
                include: [
                    {
                        model: t_kegiatan,
                        required: false,
                        as: 'kegiatan',
                        attributes: ['id', 'kode', 'nama', 'deskripsi'],
                        where: {
                            is_active: true,
                            is_deleted: false,
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
            const conditions = {is_active: true, is_deleted: false}
            
            const count = await countAll();

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                include: [
                    {
                        model: t_kegiatan,
                        required: false,
                        as: 'kegiatan',
                        attributes: ['id', 'kode', 'nama', 'deskripsi'],
                        where: {
                            is_active: true,
                            is_deleted: false,
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
    
            const {docs, pages, total} = await t_kategori_kegiatan.paginate(options)
    
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
            const field = {
                kode: req.body.kode,
                nama: req.body.nama,
                keterangan: req.body.keterangan,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            t_kategori_kegiatan.create(field, {
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

        try {
            const id = req.params.id;

            t_kategori_kegiatan.update(
                {
                    kode: req.body.kode,
                    nama: req.body.nama,
                    keterangan: req.body.keterangan,
                    is_active: req.body.iact ? req.body.iact : false,
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
            var resSplit = q.split(",").map(i=>Number(i));

            t_kategori_kegiatan.update(
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
            t_kategori_kegiatan.destroy({
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
            t_kategori_kegiatan.destroy({
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
            t_kategori_kegiatan.update(
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

            t_kategori_kegiatan.update(
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
            t_kategori_kegiatan.destroy(
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
        remove,
        removeArr,
        truncate,
        removeSoft,
        removeArrSoft,
    };
}
module.exports = KategoriKegiatanController;