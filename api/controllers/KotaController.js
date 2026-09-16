const { t_kota_kab, t_provinsi, t_bptd } = require('../models');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const moment = require('moment');

const KotaController = () => {
    const countAll = async () => {
        return t_kota_kab.count({
            where:{
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        /**
         * @swagger
         * /api/v2pv/kotakab:
         *  get:
         *   summary: get all kota kabupaten
         *   description: get all kota kabupaten
         *   responses:
         *    200:
         *     description: success
         *    500:
         *     description: error
         */
        try {
            const name = req.query.search;
            const pid = req.query.pid;
            const kod = req.query.kod;
            const count = await countAll();
            const conditions = {is_deleted: false}
    
            if(pid){
                conditions = {provinsi_id: pid}
            }

            if(kod){
                conditions['kode'] = { [Op.iLike]: `%${kod}%` }
            }            

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            const options = {
                include:[
                    {
                        model: t_provinsi,
                        required: false,
                        as: 'provinsi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                        include:[
                            {
                                model: t_bptd,
                                required: false,
                                as: 'provbptd',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where:{
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ], 
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
    
            const {docs, pages, total} = await t_kota_kab.paginate(options)
    
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
        console.log("--------------------::Processing Find All Pagination Server Side::--------------------");

        try {
            const name = req.query.search;
            const count = await countAll();
            const conditions = {is_deleted: false}

            let order = [
                [
                    req.query.orderBy || 'created_at',
                    req.query.sortedBy || 'DESC'
                ]
            ];          

            if (name) {
                const nameCondition = { [Op.iLike]: `%${name}%` };
                conditions[Op.or] = [
                    { nama: nameCondition },
                    { kode: nameCondition }
                ];
            }
            const options = {
                include:[
                    {
                        model: t_provinsi,
                        required: false,
                        as: 'provinsi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                        include:[
                            {
                                model: t_bptd,
                                required: false,
                                as: 'provbptd',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where:{
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ], 
                    }
                ],                
                page: req.query.page || 1,
                paginate: req.query.paginate || count,
                order: order,
                where: conditions,
                logging: false
            }
    
            const {docs, pages, total} = await t_kota_kab.paginate(options)
    
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
        try{
            const conditions = {is_deleted: false}
            const id = req.params.id;
            t_kota_kab.findByPk(id, {
                where: conditions,
                include:[
                    {
                        model: t_provinsi,
                        required: true,
                        as: 'provinsi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                        include:[
                            {
                                model: t_bptd,
                                required: true,
                                as: 'provbptd',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where:{
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    }
                ],                
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
        }catch (error){
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try{
            const name = req.query.search;
            const pid = req.query.pid;
            const kod = req.query.kod;
            const count = await countAll();
            var conditions = {is_deleted: false, is_active: true}
    
            if(pid){
                conditions = {provinsi_id: pid}
            }

            if(kod){
                conditions['kode'] = { [Op.iLike]: `%${kod}%` }
            }            

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                include:[
                    {
                        model: t_provinsi,
                        required: true,
                        as: 'provinsi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_active: true
                        },
                        include:[
                            {
                                model: t_bptd,
                                required: true,
                                as: 'provbptd',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where:{
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
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
                logging: true,
            }
    
            const {docs, pages, total} = await t_kota_kab.paginate(options)
            // const propinsi = await t_kota_kab.findAll({
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
        }catch (error){
            next(error)
        }
    }

    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            const field = {
                provinsi_id: req.body.provinsi_id,
                kode: req.body.kode,
                nama: req.body.nama,
                lat_pos: req.body.lat_pos,
                lon_pos: req.body.lon_pos,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')  
            };

            t_kota_kab.create(field,{
                logging: true
            }).then(data => {
                res.status(200).send({
                    success: true,
                    message: messageService().CREATE_SUCCESS,
                    data: [{
                        last_insert_id : data.id,
                        fields: field
                    }]
                });
            }).catch(err => {
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
    
            // if (!req.body.nama) {
            //     res.status(400).send({
            //         success: false,
            //         message: "Req. Faild. Required Params"
            //     });
            //     return;
            // }
        
            t_kota_kab.update(
                {
                    provinsi_id: req.body.provinsi_id,
                    kode: req.body.kode,
                    nama: req.body.nama,
                    lat_pos: req.body.lat_pos,
                    lon_pos: req.body.lon_pos,                    
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

            t_kota_kab.update(
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

    const remove = async (req, res, next) => {
        console.log("--------------------::Processing Delete::--------------------");
    
        const id = req.params.id;
        try {
            t_kota_kab.destroy({
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
        var resSplit = q.split(",").map(i=>Number(i));
        try {
            t_kota_kab.destroy({
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
            t_kota_kab.update(
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

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i=>Number(i));

            t_kota_kab.update(
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_kota_kab.destroy(
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
    
    
    return {
        findAll,
        findPagination,
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
module.exports = KotaController;