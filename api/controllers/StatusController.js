const { t_status, t_kategori_status, t_kategori_status_role, roles, sequelize } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const messageService =  require('../services/message.service');
const moment = require('moment');

const StatusController = () => {
    const countAll = async () => {
        return t_status.count({
            where:{
                is_deleted: false
            }
        });
    }

    const findByKategoriRole = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            var kategori_status_id = req.query.ksid;
            var role_id = req.query.rid;

            if (kategori_status_id && role_id) {
                var arr = [];
                var sql = `SELECT jt_status.id, jt_status.nama, jt_kategori_status.nama as kategori, jt_status.alias, jt_status.keterangan
                        FROM 
                        jt_status
                            INNER JOIN jt_kategori_status ON (jt_kategori_status.id = jt_status.kategori_status_id)
                            INNER JOIN jt_kategori_status_role ON (jt_kategori_status_role.kategori_status_id = jt_kategori_status.id)
                        WHERE jt_status.is_active = TRUE AND jt_status.is_deleted = FALSE AND jt_status.kategori_status_id = ${kategori_status_id} AND jt_kategori_status_role.role_id = ${role_id}`;

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });

                for(var row of result){
                        arr.push(row)
                    }

                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: arr
                });
            } else {
                res.send({
                    success: false,
                    message: 'Kategori Status dan Role Tidak Boleh Kosong',
                });
            }
            
    
        } catch (error) {
            next(error)
        }
    }

    const findByKategori = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            var kategori_status_id = req.query.ksid;

            if (kategori_status_id) {
                var arr = [];
                var sql = `SELECT jt_status.id, jt_status.nama, jt_kategori_status.nama as kategori, jt_status.alias, jt_status.keterangan
                        FROM 
                        jt_status
                            INNER JOIN jt_kategori_status ON (jt_kategori_status.id = jt_status.kategori_status_id)
                        WHERE jt_status.is_active = TRUE AND jt_status.is_deleted = FALSE AND jt_status.kategori_status_id = ${kategori_status_id}`;

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });

                for(var row of result){
                        arr.push(row)
                    }

                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: arr
                });
            } else {
                res.send({
                    success: false,
                    message: 'Kategori Status Tidak Boleh Kosong',
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

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                include: [
                    {
                        model: t_kategori_status,
                        required: false,
                        as: 'kategoriStatus',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kategori_status_role,
                                required: false,
                                as: 'kategoriStatusRole',
                                attributes: ['id', 'kategori_status_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: roles,
                                        required: false,
                                        as: 'roles',
                                        attributes: ['id', 'kode', 'nama'],
                                        where: {
                                            is_active: true
                                        },
                                    },
                                ]
                            },
                        ]
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
    
            const {docs, pages, total} = await t_status.paginate(options)
    
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
            t_status.findByPk(id, {
                include: [
                    {
                        model: t_kategori_status,
                        required: false,
                        as: 'kategoriStatus',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kategori_status_role,
                                required: false,
                                as: 'kategoriStatusRole',
                                attributes: ['id', 'kategori_status_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: roles,
                                        required: false,
                                        as: 'roles',
                                        attributes: ['id', 'kode', 'nama'],
                                        where: {
                                            is_active: true
                                        },
                                    },
                                ]
                            },
                        ]
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
            const conditions = {is_active: true, is_deleted: false}
            
            const count = await countAll();

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                include: [
                    {
                        model: t_kategori_status,
                        required: false,
                        as: 'kategoriStatus',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kategori_status_role,
                                required: false,
                                as: 'kategoriStatusRole',
                                attributes: ['id', 'kategori_status_id', 'role_id'],
                                where: {
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: roles,
                                        required: false,
                                        as: 'roles',
                                        attributes: ['id', 'kode', 'nama'],
                                        where: {
                                            is_active: true
                                        },
                                    },
                                ]
                            },
                        ]
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
    
            const {docs, pages, total} = await t_status.paginate(options)
    
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
                alias: req.body.alias,
                keterangan: req.body.keterangan,
                kategori_status_id: req.body.kategori_status_id,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')  
            };
            
            t_status.create(field,{
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
        
            t_status.update(
                {
                    kode: req.body.kode,
                    nama: req.body.nama,
                    alias: req.body.alias,
                    keterangan: req.body.keterangan,
                    kategori_status_id: req.body.kategori_status_id,
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

            t_status.update(
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
            t_status.destroy({
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
            t_status.destroy({
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
            t_status.update(
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

            t_status.update(
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
            t_status.destroy(
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
        findByKategoriRole,
        findByKategori,
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
module.exports = StatusController;