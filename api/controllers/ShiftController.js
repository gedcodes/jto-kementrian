const { t_shift, t_lokasi, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const {
    syncToPostServer,
    updateIdStatusSyncToPusat,
} = require('./lib/sinkronisasi');
const messageService =  require('../services/message.service');
const moment = require('moment');

const ShiftController = () => {

    const countAll = async () => {
        return t_shift.count({
            where:{
                is_deleted: false
            }
        });
    }

    const findShiftByTime = async (req, res, next) => {
        console.log("--------------------::Processing Find Shift By Time::--------------------");

        try {
            let timeNow = moment().format('HH:mm:ss a');

            console.log(timeNow, moment('20:00:00', 'HH:mm:ss').format('HH:mm:ss a'));

            const shift = await t_shift.findAll();

            let dataArr = [];
            for(var row of shift) {
                if (row.jam_mulai > timeNow && row.jam_selesai < timeNow) {
                    console.log(row);
                }
            }

            // console.log("All shift:", JSON.stringify(shift, null, 2));
    
            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: shift       
            });
        } catch (error) {
            next(error);
        }

    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            
            var conditions = {is_deleted: false}
            const count = await countAll();

            const condition_lokasi = {
                is_deleted: false,
                is_active: true
            }

            const lokasi = req.query.fil;
            if(lokasi){
                conditions = {
                    kode_uppkb : lokasi,
                    is_deleted: false
                }
            }

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
                //conditions = {is_deleted: false, nama : {[Op.iLike]: `%${name}%`}}
            }

            const options = {
                include:[                       
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'shiftuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: condition_lokasi
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
    
            const {docs, pages, total} = await t_shift.paginate(options)
    
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
            t_shift.findByPk(id, {
                include:[                       
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'shiftuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        }
                    }
                ],
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
            var conditions = {is_active: true, is_deleted: false}
            const count = await countAll();

            const lokasi = req.query.fil;
            if(lokasi){
                conditions = {
                    kode_uppkb : lokasi,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                include:[                       
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'shiftuppkb',
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
    
            const {docs, pages, total} = await t_shift.paginate(options)
            // const propinsi = await t_shift.findAll({
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

    const getLokasiIdUppkb = async(kode) => {
        var sql = `SELECT id FROM jt_lokasi_uppkb WHERE kode = '${kode}'`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            var id_uppkb = `${result[0].id}`;

            return id_uppkb;
        } else {
            return 0;
        }        
    }    

    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            var lokasi_id = await getLokasiIdUppkb(req.body.kode_uppkb);

            const field = {
                kode_uppkb: req.body.kode_uppkb,
                lokasi_id: lokasi_id,
                kode: req.body.kode,
                nama: req.body.nama,
                jam_mulai: req.body.jam_mulai,
                jam_selesai: req.body.jam_selesai,
                durasi: req.body.durasi,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss') 
            };
            
            t_shift.create(field,{
                logging: false
            }).then(async (data) => {
                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    var data_req = req.body;
                    await syncToPostServer(req.token.id, 'post', 'v2pv/shift/create', data_req).then(async (resp) => {
                        if (resp.data.success) {
                            console.log(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode);
                            console.log('SINKRONISASI DATA BERHASIL');
                            await updateIdStatusSyncToPusat(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode, 'jt_shift');
                        } else {
                            console.log('SINKRONISASI DATA GAGAL');
                        }
                    }).catch((error) => {
                        // console.log(error);
                        console.log('SINKRONISASI DATA GAGAL');
                    });
                }

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
            var lokasi_id = await getLokasiIdUppkb(req.body.kode_uppkb);

            t_shift.update(
                {
                    kode_uppkb: req.body.kode_uppkb,
                    lokasi_id: lokasi_id,
                    kode: req.body.kode,
                    nama: req.body.nama,
                    jam_mulai: req.body.jam_mulai,
                    jam_selesai: req.body.jam_selesai,
                    durasi: req.body.durasi,                    
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                },
                {
                    where: { id: id }
                }
            ).then(async(num) => {
                
                if (num == 1) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'put', `v2pv/shift/update/${id}`, data_req).then(async (resp) => {
                            if (resp) {
                                if (resp.data.success) {
                                    // console.log(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode);
                                    console.log('SINKRONISASI DATA BERHASIL');
                                     // await updateIdStatusSyncToPusat(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode, 'jt_shift');
                                } else {
                                    console.log('SINKRONISASI DATA GAGAL');
                                }
                            }
                        }).catch((error) => {
                            // console.log(error);
                            console.log('SINKRONISASI DATA GAGAL');
                        });
                    }
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

            t_shift.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')  
                },
                {
                    where: {id:{ [Op.any]: `{${resSplit}}` }},
                    logging: false
                }
            ).then( async(num) => {
                if (num == resSplit.length) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'put', `v2pv/shift/updateArr?arrId=${resSplit}`, data_req).then(async (resp) => {
                            if (resp) {
                                if (resp.data.success) {
                                    // console.log(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode);
                                    console.log('SINKRONISASI DATA BERHASIL');
                                     // await updateIdStatusSyncToPusat(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode, 'jt_shift');
                                } else {
                                    console.log('SINKRONISASI DATA GAGAL');
                                }
                            }
                        }).catch((error) => {
                            // console.log(error);
                            console.log('SINKRONISASI DATA GAGAL');
                        });
                    }
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
            t_shift.update(
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
            t_shift.destroy({
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

            t_shift.update(
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
            t_shift.destroy({
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
            t_shift.destroy(
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
        findShiftByTime,
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
module.exports = ShiftController;