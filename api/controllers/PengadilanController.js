const { t_pengadilan, t_lokasi, t_kota_kab, t_provinsi, t_bptd, sequelize } = require('../models');
const {
    getLokasiUppkbKode
} = require('./lib/dataid');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const {
    syncToPostServer,
    updateIdStatusSyncToPusat,
} = require('./lib/sinkronisasi');
const messageService = require('../services/message.service');
const moment = require('moment');

const PengadilanController = () => {
    const countAll = async () => {
        return t_pengadilan.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const kode_uppkb = req.query.kode_uppkb;
            let conditions = { is_deleted: false }
            const count = await countAll();
            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb : kode_uppkb,
                    is_deleted: false
                }
            }

            const options = {
                include: [
                    {
                        model: t_lokasi,
                        required: true,
                        as: 'pengadilanlokasiuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kota_kab,
                                required: true,
                                as: 'lkotakab',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_provinsi,
                                        required: true,
                                        as: 'provinsi',
                                        attributes: [
                                            'id', 'kode', 'nama'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        },
                                        include: [
                                            {
                                                model: t_bptd,
                                                required: true,
                                                as: 'provbptd',
                                                attributes: [
                                                    'id', 'kode', 'nama'
                                                ],
                                                where: {
                                                    is_deleted: false,
                                                    is_active: true
                                                }
                                            }
                                        ],
                                    }
                                ],
                            }
                        ], 
                    }
                ],                
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: true
            }

            const { docs, pages, total } = await t_pengadilan.paginate(options)

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
        try {
            const id = req.params.id;
            t_pengadilan.findByPk(id, {
                where: { is_deleted: false },
                include: [
                    {
                        model: t_lokasi,
                        required: true,
                        as: 'pengadilanlokasiuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kota_kab,
                                required: true,
                                as: 'lkotakab',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_provinsi,
                                        required: true,
                                        as: 'provinsi',
                                        attributes: [
                                            'id', 'kode', 'nama'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        },
                                        include: [
                                            {
                                                model: t_bptd,
                                                required: true,
                                                as: 'provbptd',
                                                attributes: [
                                                    'id', 'kode', 'nama'
                                                ],
                                                where: {
                                                    is_deleted: false,
                                                    is_active: true
                                                }
                                            }
                                        ],
                                    }
                                ],
                            }
                        ], 
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
                res.status(500).send({
                    success: false,
                    message: `${messageService().GET_FAILED}`
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            const name = req.query.search;
            const kode_uppkb = req.query.kode_uppkb;

            let conditions = { is_deleted: false, is_active: true }
            const count = await countAll();
            
            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb : kode_uppkb,
                    is_deleted: false, 
                    is_active: true
                }
            }            

            const options = {
                include: [
                    {
                        model: t_lokasi,
                        required: true,
                        as: 'pengadilanlokasiuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kota_kab,
                                required: true,
                                as: 'lkotakab',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_provinsi,
                                        required: true,
                                        as: 'provinsi',
                                        attributes: [
                                            'id', 'kode', 'nama'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        },
                                        include: [
                                            {
                                                model: t_bptd,
                                                required: true,
                                                as: 'provbptd',
                                                attributes: [
                                                    'id', 'kode', 'nama'
                                                ],
                                                where: {
                                                    is_deleted: false,
                                                    is_active: true
                                                }
                                            }
                                        ],
                                    }
                                ],
                            }
                        ], 
                    }
                ],
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
            }

            const { docs, pages, total } = await t_pengadilan.paginate(options)
            // const propinsi = await t_kegiatan.findAll({
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
        } catch (error) {
            next(error)
        }
    }


    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        try {
            var kode_uppkb = await getLokasiUppkbKode(req.body.lokasi_id);
            const field = {
                lokasi_id: req.body.lokasi_id,
                kota_kab_id: req.body.kota_kab_id,
                kode_uppkb: kode_uppkb,
                kode: req.body.kode,
                nama: req.body.nama,
                alamat: req.body.alamat,
                no_telp: req.body.no_telp,
                lat_pos: req.body.lat_pos,
                lon_pos: req.body.lon_pos,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            return sequelize.transaction().then(function (t) {
                return t_pengadilan.create(field, { transaction: t }).then(async(data) => {
                    t.commit();

                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'post', 'v2pv/pengadilan/create', data_req).then(async (resp) => {
                            if (resp.data.success) {
                                console.log(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode);
                                console.log('SINKRONISASI DATA BERHASIL');
                                await updateIdStatusSyncToPusat(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode, 'jt_pengadilan');
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

                // }).then(function () {
                //     return t.commit();
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    next(err)
                });
            });
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            const id = req.params.id;
            var kode_uppkb = await getLokasiUppkbKode(req.body.lokasi_id);
            return sequelize.transaction().then(function (t) {
                return t_pengadilan.update({
                    lokasi_id: req.body.lokasi_id,
                    kota_kab_id: req.body.kota_kab_id,
                    kode_uppkb: kode_uppkb,
                    kode: req.body.kode,
                    nama: req.body.nama,
                    alamat: req.body.alamat,
                    no_telp: req.body.no_telp,
                    lat_pos: req.body.lat_pos,
                    lon_pos: req.body.lon_pos,
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }, { where: { id: id }, transaction: t }).then(async(num) => {
                    t.commit();
                    if (num == 1) {
                        if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                            var data_req = req.body;
                            await syncToPostServer(req.token.id, 'put', `v2pv/pengadilan/update/${id}`, data_req).then(async (resp) => {
                                if (resp.data.success) {
                                    console.log('SINKRONISASI DATA BERHASIL');
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

                    }
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    next(err)
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
            var resSplit = q.split(",").map(i => Number(i));

            t_pengadilan.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
                    logging: false
                }
            ).then(async(num) => {
                if (num == resSplit.length) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'put', `v2pv/pengadilan/updateArr?arrId=${resSplit}`, data_req).then(async (resp) => {
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
            t_pengadilan.destroy({
                where: { id: id }
            }).then(num => {
                if (num == 1) {
                    res.json({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                } else {
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
        var resSplit = q.split(",").map(i => Number(i));
        try {
            t_pengadilan.destroy({
                where: { id: { [Op.in]: resSplit } }
            }).then(num => {
                if (num == resSplit.length) {
                    //if(i == resSplit.length){

                    res.json({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });

                    //}   
                } else {
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
            t_pengadilan.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: id },
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
            var resSplit = q.split(",").map(i => Number(i));

            t_pengadilan.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
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
            t_pengadilan.destroy(
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
module.exports = PengadilanController;