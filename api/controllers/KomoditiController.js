const { t_komoditi, t_kategori_komoditi, t_sub_kategori_komoditi, t_jenis_komoditi } = require('../models');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const moment = require('moment');
const axios = require('axios');
const {
    syncGet
} = require('./lib/sinkronisasi');
const { upsert_komoditi } = require('./lib/upsertdata');
// const syncInstance = require('../middleware/syncInstance');

const KomoditiController = () => {
    const countAll = async () => {
        return t_komoditi.count({
            where:{
                is_deleted: false
            }
        });
    }

    const sinkronisasi = async (req, res, next) => {
        try {
            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                await syncGet(req.token.id, 'komoditi').then(async (response) => {
                    if (response.data.success) {
                        var result = response.data.data;
                        var i = 1;
                        for (var row of result) {
                            const sinkron_data = await upsert_komoditi(row.id, row.kategori_komoditi_id, row.kode, row.nama, row.is_active, req.token.id, moment().format('YYYY-MM-DD HH:mm:ss'));
                            console.log('SINKRON DATA : ',sinkron_data, i);
                            if (Object.keys(result).length == i) {
                                res.send({ 
                                    success: true,
                                    message: messageService().GET_SUCCESS,
                                    data: response.data.data
                                }); 
                            }
                            i++;
                        }
  
                    } else {
                        res.send({ 
                            success: false,
                            message: 'Req. Sinkronisasi Failed',
                            data: response.data.data
                        });
                    }
                }).catch((error) => {
                    // console.log(error);
                    console.log('SINKRONISASI DATA GAGAL');
                    next(error);
                });
                
            } else {
                res.send({ 
                    success: false,
                    message: 'Aplikasi Tidak di Izinkan Sinkronisasi Data'
                });
            }
        } catch (error) {
            next(error)
        }
    } 

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const conditions = {is_deleted: false}
    
            const count = await countAll();

            let order = [
                [
                    req.query.orderBy || 'created_at',
                    req.query.sortedBy || 'DESC'
                ]
            ];

            if (req.query.orderByKategori) {

                order = [
                    [
                        { model: t_kategori_komoditi, as: 'katkomoditi' },
                        'nama',
                        req.query.sortedBy || 'DESC'
                    ]
                ];
            }

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                include:[
                    {
                        model: t_kategori_komoditi,
                        required: true,
                        as: 'katkomoditi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_jenis_komoditi,
                                as: 'jenisKomoditi',
                                attributes: ['id', 'kode', 'nama'],
                                required: false,
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ]
                    },
                    {
                        model: t_sub_kategori_komoditi,
                        as: 'subKategoriKomoditi',
                        attributes: ['id', 'kode', 'nama'],
                        required: false,
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
    
            const {docs, pages, total} = await t_komoditi.paginate(options)
    
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
            t_komoditi.findByPk(id, {
                where:{
                    is_deleted: false
                },
                include:[
                    {
                        model: t_kategori_komoditi,
                        required: true,
                        as: 'katkomoditi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_jenis_komoditi,
                                as: 'jenisKomoditi',
                                attributes: ['id', 'kode', 'nama'],
                                required: false,
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ]
                    },
                    {
                        model: t_sub_kategori_komoditi,
                        as: 'subKategoriKomoditi',
                        attributes: ['id', 'kode', 'nama'],
                        required: false,
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    }
                ],                
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
                include:[
                    {
                        model: t_kategori_komoditi,
                        required: true,
                        as: 'katkomoditi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_jenis_komoditi,
                                as: 'jenisKomoditi',
                                attributes: ['id', 'kode', 'nama'],
                                required: false,
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ]
                    },
                    {
                        model: t_sub_kategori_komoditi,
                        as: 'subKategoriKomoditi',
                        attributes: ['id', 'kode', 'nama'],
                        required: false,
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
                logging: false,
            }
    
            const {docs, pages, total} = await t_komoditi.paginate(options)
            // const propinsi = await t_komoditi.findAll({
            //     where: {
            //         is_active: true
            //     }
            // });
    
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
                kategori_komoditi_id: req.body.kategori_komoditi_id,
                sub_kategori_komoditi_id: req.body.sub_kategori_komoditi_id,
                kode: req.body.kode,
                nama: req.body.nama,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss') 
            };
            
            t_komoditi.create(field,{
                logging: false
            }).then(data => {
                res.send({
                    success: true,
                    message: messageService().CREATE_SUCCESS,
                    data: [{
                        last_insert_id : data.id,
                        fields: field
                    }]
                });
            }).catch(err => {
                console.log(err)
                res.send({
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
    
            // if (!req.body.nama) {
            //     res.status(400).send({
            //         success: false,
            //         message: "Req. Faild. Required Params"
            //     });
            //     return;
            // }
        
            t_komoditi.update(
                {
                    kategori_komoditi_id: req.body.kategori_komoditi_id,
                    sub_kategori_komoditi_id: req.body.sub_kategori_komoditi_id,
                    kode: req.body.kode,
                    nama: req.body.nama,
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')  
                },
                {
                    where: { id: id }
                }
            ).then(num => {
                if (num == 1) {
                    res.send({
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
                res.send({
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

            t_komoditi.update(
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
            t_komoditi.destroy({
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
            t_komoditi.destroy({
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
            t_komoditi.update(
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

            t_komoditi.update(
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
            t_komoditi.destroy(
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
            //     res.json({
            //         success: false,
            //         message: `${messageService().REMOVE_FAILED}. ${err}`
            //     });
            // }); 
                   
        } catch (error) {
            next(error)
        }
        
    }    
    
    
    return {
        sinkronisasi,
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
module.exports = KomoditiController;