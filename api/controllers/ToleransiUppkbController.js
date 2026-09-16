const { t_toleransi, t_toleransi_uppkb, t_lokasi, t_komoditi, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const moment = require('moment');

const ToleransiUppkbController = () => {
    const countAll = async () => {
        return t_toleransi.count({
            where:{
                is_deleted: false
            }
        });
    }

    const timer = ms => new Promise(res => setTimeout(res, ms))

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const kom_id = req.query.kmid;
            const lok_id = req.query.lkid;

            let conditions = {is_deleted: false}
           
            const count = await countAll();

            if (name) {
                conditions = { 
                    nama: {[Op.iLike]: `%${name}%` }, 
                    is_deleted: true
                }
            }
            
            if(kom_id){
                conditions = {
                    komoditi_id: kom_id,
                    is_deleted: false
                }
            }

            if(lok_id){
                conditions = {
                    lokasi_id: lok_id,
                    is_deleted: false
                }
            }  
            
            if(lok_id && kom_id){
                conditions = {
                    lokasi_id: lok_id,
                    komoditi_id: kom_id,
                    is_deleted: false
                }
            }

            const options = {
                include:[
                    {
                        model: t_toleransi,
                        required: false,
                        as: 'toluppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'prosen_toleransi'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                    },                            
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'tolkoduppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        }
                    },                            
                    {
                        model: t_komoditi,
                        required: false,
                        as: 'komoditi_uppkb',
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
                logging: true
            }
            console.log(conditions);
            const {docs, pages, total} = await t_toleransi_uppkb.paginate(options)
    
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
            t_toleransi_uppkb.findByPk(id, {
                include:[
                    {
                        model: t_toleransi,
                        required: false,
                        as: 'toluppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'prosen_toleransi'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                    },                            
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'tolkoduppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        }
                    },                            
                    {
                        model: t_komoditi,
                        required: false,
                        as: 'komoditi_uppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
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
            const kom_id = req.query.kmid;
            const lok_id = req.query.lkid;

            let conditions = {is_active: true, is_deleted: false}
            
            const count = await countAll();

            if (name) {
                conditions = { 
                    nama: {[Op.iLike]: `%${name}%` }, 
                    is_active: true,
                    is_deleted: true
                }
            }
            
            if(kom_id){
                conditions = {
                    komoditi_id: kom_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if(lok_id){
                conditions = {
                    lokasi_id: lok_id,
                    is_active: true,
                    is_deleted: false
                }
            }  
            
            if(lok_id && kom_id){
                conditions = {
                    lokasi_id: lok_id,
                    komoditi_id: kom_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            const options = {
                include:[
                    {
                        model: t_toleransi,
                        required: false,
                        as: 'toluppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'prosen_toleransi'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        },
                    },                            
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'tolkoduppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        }
                    },                            
                    {
                        model: t_komoditi,
                        required: false,
                        as: 'komoditi_uppkb',
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
    
            const {docs, pages, total} = await t_toleransi_uppkb.paginate(options)
            // const propinsi = await t_toleransi.findAll({
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

    const getKodeUppkb = async(id) => {
        var sql = `SELECT kode FROM jt_lokasi_uppkb WHERE id = ${id}`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            var kode_uppkb = `${result[0].kode}`;

            return kode_uppkb;
        } else {
            return 0;
        }        
    }

    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            var kode_uppkb = await getKodeUppkb(req.body.lokasi_id);
            const field = {
                lokasi_id: req.body.lokasi_id,
                toleransi_id: req.body.toleransi_id,
                kode_uppkb: kode_uppkb,
                keterangan: req.body.keterangan,
                approve_by: req.token.id,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')  
            };


            t_toleransi_uppkb.create(field,{
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
            var kode_uppkb = await getKodeUppkb(req.body.lokasi_id);
            t_toleransi_uppkb.update(
                {
                    lokasi_id: req.body.lokasi_id,
                    toleransi_id: req.body.toleransi_id,
                    kode_uppkb: kode_uppkb,
                    keterangan: req.body.keterangan,
                    approve_by: req.token.id,
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
                    res.send({
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

            t_toleransi_uppkb.update(
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
            t_toleransi_uppkb.destroy({
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
            t_toleransi_uppkb.destroy({
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
            t_toleransi_uppkb.update(
                {
                    is_deleted: true,
                    is_active: false,
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

            t_toleransi_uppkb.update(
                {
                    is_deleted: true,
                    is_active: false,
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
            t_toleransi_uppkb.destroy(
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
module.exports = ToleransiUppkbController;