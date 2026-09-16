const { t_detailmuatan, t_komoditi, t_kategori_komoditi, sequelize } = require('../models');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const moment = require('moment');

const DetailMuatanController = () => {

    const countAll = async (conditions) => {
        return t_detailmuatan.count({
            where:conditions
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            let kode_trx = req.query.notrx;
            let kode_uppkb = req.query.uppkb;
            let conditions = {is_deleted: false}
            
            if (kode_trx == undefined){
                res.send({
                    success: false,
                    data: 'No Penimbangan Tidak Boleh Kosong'
                });
            } else {
                if (kode_trx) {
                    conditions= { kode_trx: kode_trx, is_deleted: false};
                }

                if (kode_uppkb) {
                    conditions= { kode_uppkb: kode_uppkb, is_deleted: false};
                }            

                let count = await countAll(conditions);
                console.log(conditions)
                const options = {
                    include:[
                        {
                            model: t_komoditi,
                            required: false,
                            as: 'detailmuatankomoditi',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where:{
                                is_deleted: false,
                                is_active: true
                            },
                            include:[
                                {
                                    model: t_kategori_komoditi,
                                    required: false,
                                    as: 'katkomoditi',
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
        
                const {docs, pages, total} = await t_detailmuatan.paginate(options)
        
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
            }
        } catch (error) {
            next(error)
        }
    }
/*
    const findOne = async (req, res, next) => {
        console.log("--------------------::Processing Find One::--------------------");
        try{
            const id = req.params.id;
            t_detailmuatan.findByPk(id, {
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
            const name = req.query.search;
            const conditions = {is_active: true, is_deleted: false}
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
    
            const {docs, pages, total} = await t_detailmuatan.paginate(options)
            // const propinsi = await t_detailmuatan.findAll({
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
*/
    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            const field = {
                kode_trx: req.body.kode_trx,
                no_kendaraan: req.body.no_kendaraan,
                tgl_penimbangan: req.body.tgl_penimbangan,                
                kode_uppkb: req.body.kode_uppkb,
                komoditi_id: req.body.komoditi_id,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss') 
            };
            
            t_detailmuatan.create(field,{
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
        
            t_detailmuatan.update(
                {
                    kode_trx: req.body.kode_trx,
                    no_kendaraan: req.body.no_kendaraan,
                    tgl_penimbangan: req.body.tgl_penimbangan,
                    kode_uppkb: req.body.kode_uppkb,
                    komoditi_id: req.body.komoditi_id,
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

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");
        //console.log(req.token.id);
        
        const id = req.params.id;
        try {
            t_detailmuatan.update(
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
            t_detailmuatan.destroy({
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_detailmuatan.destroy(
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
        create,
        update,
        removeSoft,
        remove,
        truncate,
    };
}
module.exports = DetailMuatanController;