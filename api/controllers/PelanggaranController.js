const { t_pelanggaran, t_jenis_pelanggaran } = require('../models');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const moment = require('moment');

const PasalController = () => {

    const countAll = async () => {
        return t_pelanggaran.count({
            where:{
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const notrx = req.query.notrx;
            const kode_uppkb = req.query.kuppkb;
            const no_kendaraan = req.query.nokendaraan;

            let conditions = {is_deleted: false};
            const count = await countAll();
            if (notrx) {
                conditions = {
                    kode_trx: notrx,
                    is_deleted: false
                }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    is_deleted: false
                }
            } 
            
            if (no_kendaraan) {
                conditions = {
                    no_kendaraan: no_kendaraan,
                    is_deleted: false
                }
            } 
            
            if (notrx && kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    kode_trx: notrx,
                    is_deleted: false
                }
            }
            
            if (notrx && no_kendaraan) {
                conditions = {
                    kode_trx: notrx,
                    no_kendaraan: no_kendaraan,
                    is_deleted: false
                }
            }
            
            if (notrx && no_kendaraan && kode_uppkb) {
                conditions = {
                    kode_trx: notrx,
                    kode_uppkb: kode_uppkb,
                    no_kendaraan: no_kendaraan,
                    is_deleted: false
                }
            }            

            const options = {
                include:[
                    {
                        model: t_jenis_pelanggaran,
                        required: true,
                        as: 'jenisPelanggaran',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
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
    
            const {docs, pages, total} = await t_pelanggaran.paginate(options)
    
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
            const id = req.params.id;
            t_pelanggaran.findByPk(id, {
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
        }catch (error){
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try{
            const notrx = req.query.notrx;
            const kode_uppkb = req.query.kuppkb;
            const no_kendaraan = req.query.nokendaraan;

            let conditions = {is_active: true, is_deleted: false};
            const count = await countAll();
            if (notrx) {
                conditions = {
                    kode_trx: notrx,
                    is_active: true, 
                    is_deleted: false
                }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    is_active: true, 
                    is_deleted: false
                }
            } 
            
            if (no_kendaraan) {
                conditions = {
                    no_kendaraan: no_kendaraan,
                    is_active: true, 
                    is_deleted: false
                }
            } 
            
            if (notrx && kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    kode_trx: notrx,
                    is_active: true, 
                    is_deleted: false
                }
            }
            
            if (notrx && no_kendaraan) {
                conditions = {
                    kode_trx: notrx,
                    no_kendaraan: no_kendaraan,
                    is_active: true, 
                    is_deleted: false
                }
            }
            
            if (notrx && no_kendaraan && kode_uppkb) {
                conditions = {
                    kode_trx: notrx,
                    kode_uppkb: kode_uppkb,
                    no_kendaraan: no_kendaraan,
                    is_active: true, 
                    is_deleted: false
                }
            }
            
            const options = {
                include:[
                    {
                        model: t_jenis_pelanggaran,
                        required: true,
                        as: 'jenisPelanggaran',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
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
    
            const {docs, pages, total} = await t_pelanggaran.paginate(options)
            // const propinsi = await t_pelanggaran.findAll({
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
                kode_trx: req.body.kode_trx,
                no_kendaraan: req.body.no_kendaraan,
                tgl_penimbangan: req.body.tgl_penimbangan,
                kode_uppkb: req.body.kode_uppkb,
                jenis_pelanggaran_id: req.body.jenis_pelanggaran_id,
                kode_pelanggaran: req.body.kode_pelanggaran,
                deskripsi: req.body.deskripsi,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss') 
            };
            
            t_pelanggaran.create(field,{
                logging: false
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
    
            // if (!req.body.nama) {
            //     res.status(400).send({
            //         success: false,
            //         message: "Req. Faild. Required Params"
            //     });
            //     return;
            // }
        
            t_pelanggaran.update(
                {
                    kode_trx: req.body.kode_trx,
                    no_kendaraan: req.body.no_kendaraan,
                    tgl_penimbangan: req.body.tgl_penimbangan,                    
                    kode_uppkb: req.body.kode_uppkb,
                    jenis_pelanggaran_id: req.body.jenis_pelanggaran_id,
                    kode_pelanggaran: req.body.kode_pelanggaran,
                    deskripsi: req.body.deskripsi,             
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

            t_pelanggaran.update(
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

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");
        //console.log(req.token.id);
        
        const id = req.params.id;
        try {
            t_pelanggaran.update(
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

    const remove = async (req, res, next) => {
        console.log("--------------------::Processing Delete::--------------------");
    
        const id = req.params.id;
        try {
            t_pelanggaran.destroy({
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

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i=>Number(i));

            t_pelanggaran.update(
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

    const removeArr = async (req, res, next) => {
        console.log("--------------------::Processing Delete All::--------------------");
        var q = req.query.arrId;
        var resSplit = q.split(",").map(i=>Number(i));
        try {
            t_pelanggaran.destroy({
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_pelanggaran.destroy(
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
        removeSoft,
        remove,
        removeArrSoft,
        removeArr,
        truncate,
    };
}
module.exports = PasalController;