const { t_timbangan, t_lokasi, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const {
    syncToPostServer,
    updateIdStatusSyncToPusat,
} = require('./lib/sinkronisasi');
const messageService =  require('../services/message.service');
const moment = require('moment');
const axios = require('axios').default;
const axiosRetry = require('axios-retry');

const TimbanganController = () => {
    const countAll = async () => {
        return t_timbangan.count({
            where:{
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            var conditions = {is_deleted: false}
            
            const count = await countAll();

            const lokasi = req.query.kuppkb;
            if(lokasi){
                conditions = {
                    kode_uppkb : lokasi,
                    is_deleted: false
                }
            }

            const id = req.query.id;
            if(id){
                conditions = {
                    id : id,
                    is_deleted: false
                }
            }

            if(id && lokasi){
                conditions = {
                    id : id,
                    kode_uppkb : lokasi,
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
                        as: 'timbanganuppkb',
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
    
            const {docs, pages, total} = await t_timbangan.paginate(options)
    
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
            t_timbangan.findByPk(id, {
                where: {
                    is_deleted: false
                },
                include:[
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'timbanganuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
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
            var conditions = {is_deleted: false, is_active: true}
            const count = await countAll();

            const lokasi = req.query.kuppkb;
            if(lokasi){
                conditions = {
                    kode_uppkb : lokasi,
                    is_active: true,
                    is_deleted: false
                }
            }

            const id = req.query.id;
            if(id){
                conditions = {
                    id : id,
                    is_deleted: false
                }
            }

            if(id && lokasi){
                conditions = {
                    id : id,
                    kode_uppkb : lokasi,
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
                        as: 'timbanganuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where:{
                            is_deleted: false,
                            is_active: true
                        }
                    }
                ],                
                page: Number(req.query.page) || 1,
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
    
            const {docs, pages, total} = await t_timbangan.paginate(options)
            // const propinsi = await t_timbangan.findAll({
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
    /*
    const sinkronisasi = async (payload) => {
        axiosRetry(axios, { retries: 3 });
        var config = {
            method: 'post',
            url: 'http://localhost:8021/api/v2pv/timbangan/create',
            headers: { 
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNjM5NjM1OTcyLCJleHAiOjE2Mzk2NzkxNzJ9.K6md2al1f8I4o8jta-5WF9V-pu8q8tspADjcMXKFZ7M', 
              'Content-Type': 'application/json', 
              'Cookie': 'connect.sid=s%3AYrjWpvZdqTd8A6itpDjdQ4O1EU0rT0NE.xREC4alUFiEDj%2F6h%2BKI3qrNmSAgyR8m0mt4RPQi8Zdg; jto-session=s%3AJ3-8MZE278kqaJCjE38BX6CgkfRDYWKd.b4NkVw9XSA7y92S6V4A2roEwZfIU4G8fq7VmYF33Pmg'
            },
            data : payload
        };
          
        axios(config).then(function (response) {
            console.log(JSON.stringify(response.data));
        }).catch(function (error) {
            console.log(error);
        });

          
        // axios.post(url, payload, {headers: header, timeout: 3000})
        // .then((res) => {
        //   console.log('Response is *****', res);
      
        // })
        // .catch((err) => {
        //   console.log('Error occurred' + err);
        // });
        // console.log(req);
    }
    */
    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            var lokasi_uppkb_id = await getLokasiIdUppkb(req.body.kode_uppkb);
            var cctv_depan_url = `http://${req.body.ip_server}:8083/stream/player/camdepan`;
            var cctv_belakang_url = `http://${req.body.ip_server}:8083/stream/player/cambelakang`;
            const field = {
                kode_uppkb: req.body.kode_uppkb,
                lokasi_uppkb_id: Number(lokasi_uppkb_id),
                kode: req.body.kode,
                nama: req.body.nama,
                ip_pintu_antrian: req.body.ip_pintu_antrian,
                port_pintu_antrian: Number(req.body.port_pintu_antrian) || 0,
                addr_ibg_antrian: req.body.addr_ibg_antrian,
                ip_pintu_penimbangan: req.body.ip_pintu_penimbangan,
                port_pintu_penimbangan: Number(req.body.port_pintu_penimbangan) || 0,
                addr_ibg_penimbangan: req.body.addr_ibg_penimbangan,
                api_url_sensor_dim: req.body.api_url_sensor_dim,
                cctv_depan_url: cctv_depan_url,
                cctv_belakang_url: cctv_belakang_url,
                cctv_depan: req.body.cctv_depan,
                cctv_belakang: req.body.cctv_belakang,
                ip_server: req.body.ip_server,
                ws_url: req.body.ws_url,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            t_timbangan.create(field,{
                logging: false
            }).then(async(data) => {
                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    var data_req = req.body;
                    await syncToPostServer(req.token.id, 'post', 'v2pv/timbangan/create', data_req).then(async (resp) => {
                        if (resp.data.success) {
                            console.log(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode);
                            console.log('SINKRONISASI DATA BERHASIL');
                            await updateIdStatusSyncToPusat(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode, 'jt_timbangan');
                        } else {
                            console.log('SINKRONISASI DATA GAGAL');
                        }
                    }).catch((error) => {
                        // console.log(error);
                        console.log('SINKRONISASI DATA GAGAL');
                    });
                }
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
            var lokasi_uppkb_id = await getLokasiIdUppkb(req.body.kode_uppkb);
            var cctv_depan_url = `http://${req.body.ip_server}:8083/stream/player/camdepan`;
            var cctv_belakang_url = `http://${req.body.ip_server}:8083/stream/player/cambelakang`;
            t_timbangan.update(
                {
                    kode_uppkb: req.body.kode_uppkb,
                    lokasi_uppkb_id: lokasi_uppkb_id,
                    kode: req.body.kode,
                    nama: req.body.nama,
                    ip_pintu_antrian: req.body.ip_pintu_antrian,
                    port_pintu_antrian: Number(req.body.port_pintu_antrian) || 0,
                    addr_ibg_antrian: req.body.addr_ibg_antrian,
                    ip_pintu_penimbangan: req.body.ip_pintu_penimbangan,
                    port_pintu_penimbangan: Number(req.body.port_pintu_penimbangan) || 0,
                    addr_ibg_penimbangan: req.body.addr_ibg_penimbangan,
                    api_url_sensor_dim: req.body.api_url_sensor_dim,
                    cctv_depan_url: cctv_depan_url,
                    cctv_belakang_url: cctv_belakang_url,
                    cctv_depan: req.body.cctv_depan,
                    cctv_belakang: req.body.cctv_belakang,
                    ip_server: req.body.ip_server,
                    ws_url: req.body.ws_url,
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
                        await syncToPostServer(req.token.id, 'put', `v2pv/timbangan/update/${id}`, data_req).then(async (resp) => {
                            if (resp.data.success) {
                                console.log('SINKRONISASI DATA BERHASIL');
                                // await updateIdStatusSyncToPusat(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode, 'jt_timbangan');
                            } else {
                                console.log('SINKRONISASI DATA GAGAL');
                            }
                        }).catch((error) => {
                            // console.log(error);
                            console.log('SINKRONISASI DATA GAGAL');
                        });
                    }
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

            t_timbangan.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                },
                {
                    where: {id:{ [Op.any]: `{${resSplit}}` }},
                    logging: false
                }
            ).then(async(num) => {
                if (num == resSplit.length) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'put', `v2pv/timbangan/updateArr?arrId=${resSplit}`, data_req).then(async (resp) => {
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
            t_timbangan.destroy({
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
            t_timbangan.destroy({
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
        console.log("--------------------::Processing Delete Soft Provinsi::--------------------");
    
        const id = req.params.id;
        try {
            t_timbangan.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: {id: id},
                    logging: true
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
                console.log(err)
                res.send({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });         
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i=>Number(i));

            t_timbangan.update(
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
            t_timbangan.destroy(
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
module.exports = TimbanganController;