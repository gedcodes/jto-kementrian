const { t_petugas, t_regu, t_shift, t_lokasi, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const {
    syncToPostServer,
    updateIdStatusSyncToPusat,
    updateIdNoKodeStatusSyncToPusat,
} = require('./lib/sinkronisasi');
const messageService = require('../services/message.service');
const moment = require('moment');

const ReguController = () => {
    const countAll = async () => {
        return t_petugas.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            //const shift_id = req.query.shift;
            const regu_id = req.query.regu;
            const lokasi_id = req.query.lkid;
            const kode_uppkb = req.query.kuppkb;

            let conditions = { is_deleted: false };
            const count = await countAll();

            // if (shift_id) {
            //     conditions = {shift_id: shift_id, is_deleted: false};
            // }

            if (regu_id) {
                conditions = { regu_id: regu_id, is_deleted: false };
            }

            if (lokasi_id) {
                conditions = { lokasi_id: lokasi_id, is_deleted: false };
            }

            if (kode_uppkb) {
                conditions = { kode_uppkb: kode_uppkb, is_deleted: false };
            }

            // if (shift_id && kode_uppkb) {
            //     conditions = {shift_id: shift_id, kode_uppkb: kode_uppkb, is_deleted: false};
            // }

            if (regu_id && kode_uppkb) {
                conditions = { regu_id: regu_id, kode_uppkb: kode_uppkb, is_deleted: false };
            }

            // if (shift_id && lokasi_id) {
            //     conditions = {shift_id: shift_id, lokasi_id: lokasi_id, is_deleted: false};
            // }   

            if (regu_id && lokasi_id) {
                conditions = { regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false };
            }

            // if (shift_id && regu_id && lokasi_id) {
            //     conditions = {shift_id: shift_id, regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false};
            // }

            const options = {
                include: [
                    // {
                    //     model: t_shift,
                    //     required: true,
                    //     as: 'petugasshift',
                    //     attributes: [
                    //         'id', 'kode', 'nama'
                    //     ],
                    //     where:{
                    //         is_deleted: false,
                    //         is_active: true
                    //     },
                    // },
                    {
                        model: t_regu,
                        required: false,
                        as: 'petugasregu',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        // include: [
                        //     {
                        //         model: t_shift,
                        //         required: true,
                        //         as: 'regushift',
                        //         attributes: [
                        //             'id', 'kode', 'nama'
                        //         ],
                        //         where:{
                        //             is_deleted: false,
                        //             is_active: true
                        //         }
                        //     }
                        // ]
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'petugasuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
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
                logging: false
            }

            const { docs, pages, total } = await t_petugas.paginate(options)

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
        try {
            const id = req.params.id;
            t_petugas.findByPk(id, {
                where: {
                    is_deleted: false
                },
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'petugasregu',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'petugasuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
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
        } catch (error) {
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            const regu_id = req.query.regu;
            const lokasi_id = req.query.lkid;
            const kode_uppkb = req.query.kuppkb;

            let conditions = { is_deleted: false, is_active: true };
            const count = await countAll();

            if (regu_id) {
                conditions = { regu_id: regu_id, is_deleted: false, is_active: true };
            }

            if (lokasi_id) {
                conditions = { lokasi_id: lokasi_id, is_deleted: false, is_active: true };
            }

            if (kode_uppkb) {
                conditions = { kode_uppkb: kode_uppkb, is_deleted: false, is_active: true };
            }

            if (regu_id && kode_uppkb) {
                conditions = { regu_id: regu_id, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true };
            }

            if (regu_id && lokasi_id) {
                conditions = { regu_id: regu_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true };
            }

            const options = {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'petugasregu',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'petugasuppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
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

            const { docs, pages, total } = await t_petugas.paginate(options)
            // const propinsi = await t_petugas.findAll({
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
        } catch (error) {
            next(error)
        }
    }

    const findKorsatpel = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            var lokasi_id = req.query.lokasi;
            var kode_uppkb = req.query.kuppkb;

            if (kode_uppkb || lokasi_id) {
                let conditions = {
                    kode_uppkb: kode_uppkb,
                    is_korsatpel: true,
                    is_deleted: false,
                    is_active: true
                };

                if (lokasi_id) {
                    conditions = {
                        lokasi_id: lokasi_id,
                        is_korsatpel: true,
                        is_deleted: false,
                        is_active: true
                    };
                }

                const count = await countAll();
                // if (regu_id) {            
                const options = {
                    include: [
                        {
                            model: t_regu,
                            required: false,
                            as: 'petugasregu',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            }
                        },
                        {
                            model: t_lokasi,
                            required: false,
                            as: 'petugasuppkb',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
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
                    logging: true,
                }

                const { docs, pages, total } = await t_petugas.paginate(options)
                // const propinsi = await t_petugas.findAll({
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
                // } else {
                //     res.send({
                //         success: false,
                //         message: 'Data Tidak Di Temukan. Masukkan Regu.'
                //     });
                // }
            } else {
                res.send({
                    success: false,
                    message: 'Data Tidak Di Temukan. Masukkan Kode UPPKB.'
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const findPengujiActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            var regu_id = req.query.regu;
            var kode_uppkb = req.query.kuppkb;

            if (kode_uppkb) {
                let conditions = {
                    kode_uppkb: kode_uppkb,
                    is_penguji: true,
                    is_deleted: false,
                    is_active: true
                };

                if (regu_id) {
                    conditions = {
                        regu_id: regu_id,
                        kode_uppkb: kode_uppkb,
                        is_penguji: true,
                        is_deleted: false,
                        is_active: true
                    };
                }

                const count = await countAll();
                // if (regu_id) {            
                const options = {
                    include: [
                        {
                            model: t_regu,
                            required: false,
                            as: 'petugasregu',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            }
                        },
                        {
                            model: t_lokasi,
                            required: false,
                            as: 'petugasuppkb',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
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
                    logging: true,
                }

                const { docs, pages, total } = await t_petugas.paginate(options)
                // const propinsi = await t_petugas.findAll({
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
                // } else {
                //     res.send({
                //         success: false,
                //         message: 'Data Tidak Di Temukan. Masukkan Regu.'
                //     });
                // }
            } else {
                res.send({
                    success: false,
                    message: 'Data Tidak Di Temukan. Masukkan Kode UPPKB.'
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const findPpnsActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            var regu_id = req.query.regu;
            var kode_uppkb = req.query.kuppkb;
            if (kode_uppkb) {
                let conditions = {
                    kode_uppkb: kode_uppkb,
                    is_ppns: true,
                    is_deleted: false,
                    is_active: true
                };

                // if (regu_id) {
                //     conditions = {
                //         regu_id: regu_id,
                //         kode_uppkb: kode_uppkb,
                //         is_ppns: true,
                //         is_deleted: false, 
                //         is_active: true
                //     };
                // }
                const count = await countAll();
                // if (regu_id) {            
                const options = {
                    include: [
                        // {
                        //     model: t_regu,
                        //     required: true,
                        //     as: 'petugasregu',
                        //     attributes: [
                        //         'id', 'kode', 'nama'
                        //     ],
                        //     where:{
                        //         is_deleted: false,
                        //         is_active: true
                        //     }
                        // },
                        {
                            model: t_lokasi,
                            required: false,
                            as: 'petugasuppkb',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
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

                const { docs, pages, total } = await t_petugas.paginate(options)
                // const propinsi = await t_petugas.findAll({
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
                // } else {

                // }
            } else {
                res.send({
                    success: false,
                    message: 'Data Tidak Di Temukan. Masukkan Kode UPPKB.'
                })
            }
        } catch (error) {
            next(error)
        }
    }

    const getKodeUppkb = async (id) => {
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

    const getLokasiIdUppkb = async (kode) => {
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
            var tgl_skep = null;
            if (req.body.tgl_skep != null || req.body.tgl_skep != '') {
                tgl_skep = moment(req.body.tgl_skep).format('YYYY-MM-DD');
            }

            const field = {
                regu_id: req.body.regu_id || null,
                kode_uppkb: req.body.kode_uppkb,
                lokasi_id: lokasi_id,
                nip: req.body.nip || '',
                nama: req.body.nama,
                no_telp: req.body.no_telp,
                pangkat: req.body.pangkat,
                jabatan: req.body.jabatan,
                no_skep: req.body.no_skep,
                // tgl_skep: tgl_skep,
                tahun_skep: (req.body.tahun_skep == "") ? 0 : req.body.tahun_skep,
                no_reg_penguji: req.body.no_reg_penguji,
                // tgl_reg_penguji: (req.body.tgl_reg_penguji == "") ? null:moment(req.body.tgl_reg_penguji).format('YYYY-MM-DD'),
                keterangan: req.body.keterangan,
                is_korsatpel: req.body.is_korsatpel ? req.body.is_korsatpel : false,
                is_penguji: req.body.iact ? req.body.is_penguji : false,
                is_ppns: req.body.iact ? req.body.is_ppns : false,
                is_danru: req.body.iact ? req.body.is_danru : false,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            t_petugas.create(field, {
                logging: false
            }).then(async (data) => {
                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    var data_req = req.body;
                    await syncToPostServer(req.token.id, 'post', 'v2pv/petugas/create', data_req).then(async (resp) => {
                        if (resp.data.success) {
                            console.log(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode);
                            console.log('SINKRONISASI DATA BERHASIL');
                            await updateIdNoKodeStatusSyncToPusat(resp.data.data[0].last_insert_id, data.id, 'jt_petugas');
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
                        last_insert_id: data.id,
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

            t_petugas.update(
                {
                    regu_id: req.body.regu_id || null,
                    kode_uppkb: req.body.kode_uppkb,
                    lokasi_id: lokasi_id,
                    nip: req.body.nip,
                    nama: req.body.nama,
                    no_telp: req.body.no_telp,
                    pangkat: req.body.pangkat,
                    jabatan: req.body.jabatan,
                    no_skep: req.body.no_skep,
                    // tgl_skep: (req.body.tgl_skep == "") ? null:moment(req.body.tgl_skep).format('YYYY-MM-DD'),
                    tahun_skep: (req.body.tahun_skep == "") ? 0 : req.body.tahun_skep,
                    no_reg_penguji: req.body.no_reg_penguji,
                    // tgl_reg_penguji: (req.body.tgl_reg_penguji == "") ? null:moment(req.body.tgl_reg_penguji).format('YYYY-MM-DD'),
                    keterangan: req.body.keterangan,
                    is_korsatpel: req.body.is_korsatpel ? req.body.is_korsatpel : false,
                    is_penguji: req.body.iact ? req.body.is_penguji : false,
                    is_ppns: req.body.iact ? req.body.is_ppns : false,
                    is_danru: req.body.iact ? req.body.is_danru : false,
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: id }
                }
            ).then(async (num) => {
                if (num == 1) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'put', `v2pv/petugas/update/${id}`, data_req).then(async (resp) => {
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
            var resSplit = q.split(",").map(i => Number(i));

            t_petugas.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
                    logging: false
                }
            ).then(async (num) => {
                if (num == resSplit.length) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        var data_req = req.body;
                        await syncToPostServer(req.token.id, 'put', `v2pv/petugas/updateArr?arrId=${resSplit}`, data_req).then(async (resp) => {
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

    const remove = async (req, res, next) => {
        console.log("--------------------::Processing Delete::--------------------");

        const id = req.params.id;
        try {
            t_petugas.destroy({
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
            t_petugas.destroy({
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
        console.log("--------------------::Processing Delete Soft Provinsi::--------------------");

        const id = req.params.id;
        try {
            t_petugas.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: id },
                    logging: true
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
                console.log(err)
                res.status(500).send({
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
            var resSplit = q.split(",").map(i => Number(i));

            t_petugas.update(
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
            t_petugas.destroy(
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
        findKorsatpel,
        findPengujiActive,
        findPpnsActive,
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
module.exports = ReguController;