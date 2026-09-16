const { t_detaildokumen_temp, sequelize } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const { getRemoveImageDokumenTemp } = require('./lib/penimbangan');
const messageService = require('../services/message.service');
const config = require('../../config/config');
const fs = require('fs');
const moment = require('moment');
const path = require("path");

const DetailDokumenTempController = () => {

    const countAll = async (conditions) => {
        return t_detaildokumen_temp.count({
            where: conditions
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            let kode_trx = req.query.trx;
            let kode_uppkb = req.query.uppkb;
            let conditions = { is_deleted: false }


            if (kode_trx) {
                conditions = { kode_trx: kode_trx, is_deleted: false };
            }

            if (kode_uppkb) {
                conditions = { kode_uppkb: kode_uppkb, is_deleted: false };
            }

            let count = await countAll(conditions);
            //console.log(conditions)
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
                logging: false
            }

            const { docs, pages, total } = await t_detaildokumen_temp.paginate(options)

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

    const setKodeDokumen = async (id) => {
        var sql = `SELECT kode FROM jt_dokumen WHERE id= ${id} AND is_active = TRUE and is_deleted = FALSE`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            var kode = result[0].kode;

            return kode;
        } else {
            return 0;
        }
    }

    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");

        try {
            var kode_dok = await setKodeDokumen(req.body.dokumen_id);
            if (req.files) {
                var imgArr = [];
                var imgArrUrl = [];

                const uploads = Object.values(req.files).map((file) => {
                    //console.log(config.path_upload+'/'+file.name)
                    if (file.size > 1 * 1024 * 1024) {
                        console.log(`Size File Max. 1 Mb. File Melebihi Ukuran`);
                    }

                    const extensionName = path.extname(file.name); // fetch the file extension
                    const allowedExtension = ['.png', '.jpg', '.jpeg'];

                    if (!allowedExtension.includes(extensionName)) {
                        return res.status(422).send({
                            success: false,
                            message: "Format File Yang Di Izinkan [*.png, *.jpg, *.jpeg]",
                        });
                    }

                    var file_name = kode_dok + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + req.body.no_kendaraan + extensionName;
                    const uploadPath = path.join(config.path_upload) + '/dokumen/' + file_name;////config.path_upload+'/'+file_name;
                    const imageUrl = `${config.image_url}dokumen/${file_name}`;

                    imgArr.push(file_name);
                    imgArrUrl.push(imageUrl);

                    return file.mv(uploadPath);
                });

                Promise.all(uploads).then(
                    () => {
                        const field = {
                            kode_trx: req.body.kode_trx,
                            no_kendaraan: req.body.no_kendaraan,
                            tgl_penimbangan: moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'),
                            kode_uppkb: req.body.kode_uppkb,
                            dokumen_id: req.body.dokumen_id,
                            status_dokumen: req.body.status_dokumen,
                            keterangan: req.body.keterangan,
                            foto_dokumen_url: imgArrUrl[0] || '',
                            foto_dokumen: imgArr[0] || '',
                            created_by: req.token.id,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        };

                        t_detaildokumen_temp.create(field, {
                            logging: false
                        }).then(data => {
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
                        });
                    }
                ).catch(err => res.status(500).send({
                    success: false,
                    message: err
                }));
            } else {
                const field = {
                    kode_trx: req.body.kode_trx,
                    no_kendaraan: req.body.no_kendaraan,
                    tgl_penimbangan: moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'),
                    kode_uppkb: req.body.kode_uppkb,
                    dokumen_id: req.body.dokumen_id,
                    status_dokumen: req.body.status_dokumen,
                    keterangan: req.body.keterangan,
                    foto_dokumen_url: '',
                    foto_dokumen: '',
                    created_by: req.token.id,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                };

                t_detaildokumen_temp.create(field, {
                    logging: false
                }).then(data => {
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
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            const id = req.params.id;
            var kode_dok = await setKodeDokumen(req.body.dokumen_id);
            if (id) {
                if (req.files) {
                    var imgArr = [];
                    var imgArrUrl = [];
                    const uploads = Object.values(req.files).map((file) => {
                        if (file.size > 1 * 1024 * 1024) {
                            console.log(`Size File Max. 1 Mb. File Melebihi Ukuran`);
                        }
    
                        const extensionName = path.extname(file.name); // fetch the file extension
                        const allowedExtension = ['.png', '.jpg', '.jpeg'];
    
                        if (!allowedExtension.includes(extensionName)) {
                            return res.status(422).send({
                                success: false,
                                message: "Format File Yang Di Izinkan [*.png, *.jpg, *.jpeg]",
                            });
                        }
    
                        var file_name = kode_dok + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + req.body.no_kendaraan + extensionName;
                        const uploadPath = path.join(config.path_upload) + '/dokumen/' + file_name;////config.path_upload+'/'+file_name;
                        const imageUrl = `${config.image_url}dokumen/${file_name}`;
    
                        imgArr.push(file_name);
                        imgArrUrl.push(imageUrl);
    
                        return file.mv(uploadPath);
                    });

                    Promise.all(uploads).then(
                        async () => {
                            await getRemoveImageDokumenTemp(id);
                            return sequelize.transaction().then(function (t) {
                                return t_detaildokumen_temp.update({
                                    kode_trx: req.body.kode_trx,
                                    no_kendaraan: req.body.no_kendaraan,
                                    tgl_penimbangan: moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'),
                                    kode_uppkb: req.body.kode_uppkb,
                                    dokumen_id: req.body.dokumen_id,
                                    status_dokumen: req.body.status_dokumen,
                                    keterangan: req.body.keterangan,
                                    foto_dokumen_url: imgArrUrl[0] || '',
                                    foto_dokumen: imgArr[0] || '',
                                    updated_by: req.token.id,
                                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                }, { where: { id: id }, transaction: t }).then(async (num) => {
                                    try {
                                        t.commit();
                                        res.send({
                                            success: true,
                                            message: messageService().UPDATE_SUCCESS
                                        });
                                    } catch (error) {
                                        t.rollback().catch(() => { });
                                        res.send({
                                            success: false,
                                            message: messageService().CREATE_FAILED
                                        });
                                    }
                                }).catch(function (err) {
                                    t.rollback().catch(() => { });
                                    next(err)
                                });
                            });
                        }).catch( err => {
                            console.log(err)
                            res.send({
                                success: false,
                                message: err
                            })
                        });
                } else {
                    return sequelize.transaction().then(function (t) {
                        return t_detaildokumen_temp.update({
                            kode_trx: req.body.kode_trx,
                            no_kendaraan: req.body.no_kendaraan,
                            tgl_penimbangan: moment().format('YYYY-MM-DD') || moment(req.body.tgl_penimbangan).format('YYYY-MM-DD'),
                            kode_uppkb: req.body.kode_uppkb,
                            dokumen_id: req.body.dokumen_id,
                            status_dokumen: req.body.status_dokumen,
                            keterangan: req.body.keterangan,
                            foto_dokumen_url: '',
                            foto_dokumen: '',
                            updated_by: req.token.id,
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        }, { where: { id: id }, transaction: t }).then(async (num) => {
                            try {
                                t.commit();
                                res.send({
                                    success: true,
                                    message: messageService().UPDATE_SUCCESS
                                });
                            } catch (error) {
                                t.rollback().catch(() => { });
                                res.send({
                                    success: false,
                                    message: messageService().CREATE_FAILED
                                });
                            }
                        }).catch(function (err) {
                            t.rollback().catch(() => { });
                            next(err)
                        });
                    });
                }
            } else {
                res.send({
                    success: false,
                    message: `${messageService().CREATE_FAILED} | ID Kosong`
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");
        //console.log(req.token.id);

        const id = req.params.id;
        try {
            t_detaildokumen_temp.update(
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
            t_detaildokumen_temp.destroy({
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_detaildokumen_temp.destroy(
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
module.exports = DetailDokumenTempController;