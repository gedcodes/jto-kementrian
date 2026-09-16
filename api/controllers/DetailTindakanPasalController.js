const { t_detailpenindakan_pasal, t_pasal, sequelize } = require('../models');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const {
    genCodeTrxPenindakan,
    getLokasiUppkbId,
} = require('./lib/dataid');
const moment = require('moment');

const DetailTindakanSanksiController = () => {

    const countAll = async (conditions) => {
        return t_detailpenindakan_pasal.count({
            where:conditions
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            let kode_penindakan = req.query.notindakan;

            let kode_uppkb = req.query.uppkb;
            let conditions = {is_deleted: false}
            
            if (kode_penindakan == undefined){
                res.send({
                    success: false,
                    data: 'No Penindakan Tidak Boleh Kosong'
                });
            } else {
                if (kode_penindakan) {
                    conditions= { kode_penindakan: kode_penindakan, is_deleted: false};
                }

                if (kode_uppkb) {
                    conditions= { kode_uppkb: kode_uppkb, is_deleted: false};
                }            

                let count = await countAll(conditions);

                const options = {
                    include:[
                        {
                            model: t_pasal,
                            required: false,
                            as: 'fkdetailtindakanpasal',
                            attributes: [
                                'id', 'no_pasal', 'pasal', 'desk_pasal', 'denda_maks', 'keterangan'
                            ],
                            where:{
                                is_deleted: false,
                                is_active: true
                            },
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
        
                const {docs, pages, total} = await t_detailpenindakan_pasal.paginate(options)
        
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
        var kode_penindakan = req.body.kode_penindakan ? req.body.kode_penindakan : await genCodeTrxPenindakan(req.body.kode_uppkb, moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
        var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
        try {
            const field = {
                kode_penindakan: kode_penindakan,
                kode_trx: req.body.kode_trx,
                no_kendaraan: req.body.no_kendaraan,
                pasal_id: req.body.pasal_id,                
                tgl_penindakan: req.body.tgl_penindakan,
                kode_uppkb: req.body.kode_uppkb,
                lokasi_id: lokasi_id,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss') 
            };
            
            t_detailpenindakan_pasal.create(field,{
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
            var kode_penindakan = req.body.kode_penindakan ? req.body.kode_penindakan : await genCodeTrxPenindakan(req.body.kode_uppkb, moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
            var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
            t_detailpenindakan_pasal.update(
                {
                    kode_penindakan: kode_penindakan,
                    kode_trx: req.body.kode_trx,
                    no_kendaraan: req.body.no_kendaraan,
                    pasal_id: req.body.pasal_id,                
                    tgl_penindakan: req.body.tgl_penindakan,
                    kode_uppkb: req.body.kode_uppkb,
                    lokasi_id: lokasi_id,
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
            t_detailpenindakan_pasal.update(
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
            t_detailpenindakan_pasal.destroy({
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
            t_detailpenindakan_pasal.destroy(
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
module.exports = DetailTindakanSanksiController;