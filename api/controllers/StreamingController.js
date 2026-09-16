const axios = require('axios');
const { t_streaming, t_lokasi, t_vendor, t_tipe_cctv, t_tipe_source_cctv, t_posisi_cctv_platform, t_integrasi } = require('../models');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const moment = require('moment');
const { generateFile } = require('./lib/streaming')
const config = require('../../config/config');

const path = require("path");
var QRCode = require('qrcode');
let ejs = require("ejs");
const { generatePdfFile } = require('../middleware/pdfGenerator');
const excel = require('exceljs');
const { encrypt } = require('./lib/aescrypt');

const StreamingController = () => {

    const countAll = async () => {
        return t_streaming.count({
            where: {
                is_deleted: false
            }
        });
    }

    const synclogin = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const q = await t_integrasi.findOne(
                    {
                        where: {
                            kode: 'STREAMING',
                            is_active: true,
                            is_deleted: false
                        },
                        logging: false
                    }
                )

                var apiurl = q.api_url.replace(/[\r\n]/g, "");

                var endpoint = `${apiurl}/login`;

                var config = {
                    method: 'post',
                    url: endpoint,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        email: q.api_auth_username,
                        password: q.api_auth_password
                    }
                };

                axios(config).then(function (result) {
                    // console.log(JSON.stringify(result.data));
                    t_integrasi.update(
                        {
                            api_auth_params: JSON.stringify(result.data.data),
                            api_auth_token: result.data.data.access_token,
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        },
                        {
                            where: { kode: 'STREAMING' },
                            logging: false
                        }
                    )
                    const resL = JSON.stringify(result.data.data);
                    resolve(JSON.parse(resL));
                }).catch(function (error) {
                    console.log(error);
                    reject(0);
                });
            } catch (error) {
                reject(error)
            }

        });
    }

    const addDataStreaming = async (data, path) => {
        return new Promise(async (resolve, reject) => {
            try {
                const q = await t_integrasi.findOne(
                    {
                        where: {
                            kode: 'STREAMING',
                            is_active: true,
                            is_deleted: false
                        },
                        logging: false
                    }
                )

                var apiurl = q.api_url.replace(/[\r\n]/g, "");

                var endpoint = `${apiurl}${path}`;

                var config = {
                    method: 'post',
                    url: endpoint,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${q.api_auth_token}`,
                    },
                    data: data
                };

                axios(config).then(function (result) {
                    const resL = JSON.stringify(result.data.data);
                    resolve(JSON.parse(resL));
                }).catch(function (error) {
                    console.log(error);
                    reject(0);
                });
            } catch (error) {
                reject(error)
            }

        });
    }

    const getDataIntegrasiStreaming = async (path) => {
        return new Promise(async (resolve, reject) => {
            try {
                const q = await t_integrasi.findOne(
                    {
                        where: {
                            kode: 'STREAMING',
                            is_active: true,
                            is_deleted: false
                        },
                        logging: false
                    }
                )

                var apiurl = q.api_url.replace(/[\r\n]/g, "");
                var endpoint = `${apiurl}${path}`;

                var config = {
                    method: 'GET',
                    timeout: 12000,
                    url: endpoint,
                    headers: {
                        'Authorization': `Bearer ${q.api_auth_token}`,
                    },
                };
                console.log(endpoint);

                axios(config).then(async function (response) {
                    const resQ = JSON.stringify(response.data.data);
                    resolve(JSON.parse(resQ))
                }).catch(async (error) => {
                    console.log('ERROR RES : ', error.response);
                    await synclogin().then(async (resp) => {
                        console.log('RESPONSE LOGIN : ', resp);
                        if (resp && resp != 0) {
                            var config2 = {
                                method: 'GET',
                                timeout: 10000,
                                url: endpoint,
                                headers: {
                                    'Authorization': `${resp.token_type} ${resp.access_token}`,
                                },
                            };
                            await axios(config2).then(async function (respond) {
                                const resA = JSON.stringify(respond.data.data);
                                resolve(JSON.parse(resA))
                            }).catch(async (error) => {
                                reject(error);
                            });
                        } else {
                            reject(error);
                        }
                    }).catch((err) => {
                        reject(error);
                    });
                });
            } catch (error) {
                reject(error)
            }

        });

    }

    const getDataLokasi = async (kode) => {
        return new Promise(async (resolve, reject) => {
            try {
                const q = await t_integrasi.findOne(
                    {
                        where: {
                            kode: 'STREAMING',
                            is_active: true,
                            is_deleted: false
                        },
                        logging: false
                    }
                )

                var apiurl = q.api_url.replace(/[\r\n]/g, "");
                var endpoint = `${apiurl}/setup/lokasi?kode_lokasi=${kode}`;

                var config = {
                    method: 'GET',
                    timeout: 10000,
                    url: endpoint,
                    headers: {
                        'Authorization': `Bearer ${q.api_auth_token}`,
                    },
                };
                console.log(endpoint);

                axios(config).then(async function (response) {
                    const resQ = JSON.stringify(response.data.data);
                    resolve(JSON.parse(resQ))
                }).catch(async (error) => {
                    console.log('ERROR RES : ', error.response);
                    await synclogin().then(async (resp) => {
                        console.log('RESPONSE LOGIN : ', resp);
                        if (resp && resp != 0) {
                            var config2 = {
                                method: 'GET',
                                timeout: 10000,
                                url: endpoint,
                                headers: {
                                    'Authorization': `${resp.token_type} ${resp.access_token}`,
                                },
                            };
                            await axios(config2).then(async function (respond) {
                                const resA = JSON.stringify(respond.data.data);
                                resolve(JSON.parse(resA))
                            }).catch(async (error) => {
                                reject(error);
                            });
                        } else {
                            reject(error);
                        }
                    }).catch((err) => {
                        reject(error);
                    });
                });
            } catch (error) {
                reject(error)
            }

        });

    }

    const findAllLokasi = async (req, res, next) => {
        console.log("--------------------::Processing Find All Lokasi Streaming::--------------------");
        try {
            const kode = req.query.kode;
            let conditions = { is_active: true, is_deleted: false }
            const count = await countAll();
            if (kode) {
                await getDataLokasi(kode).then(async (resp) => {
                    if (resp.length) {
                        res.status(200).json({
                            success: true,
                            message: messageService().GET_SUCCESS,
                            data: resp,
                        });
                    } else {
                        const dataLok = await t_lokasi.findOne(
                            {
                                where: {
                                    kode: kode,
                                },
                                logging: false
                            }
                        )

                        var payload = JSON.stringify({
                            "kota_kab_id": dataLok.kota_kab_id,
                            "kode": dataLok.kode,
                            "nama": dataLok.nama,
                            "lat": dataLok.lat_pos,
                            "lon": dataLok.lon_pos,
                            "is_active": true
                        });

                        await addDataStreaming(payload, '/setup/lokasi').then(async (respond) => {
                            if (respond) {
                                res.status(200).json({
                                    success: true,
                                    message: messageService().GET_SUCCESS,
                                    data: [respond],
                                });
                            } else {
                                res.status(500).send({
                                    success: false,
                                    message: messageService().GET_FAILED
                                });
                            }
                        }).catch((error) => {
                            console.log(error);
                            res.status(500).send({
                                success: false,
                                message: messageService().GET_FAILED
                            });
                        });
                    }
                }).catch((error) => {
                    console.log(error);
                    res.status(500).send({
                        success: false,
                        message: messageService().GET_FAILED
                    });
                });
            } else {
                res.status(500).send({
                    success: false,
                    message: 'Kode UPPKB Wajib Di Isi'
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const findAllKategori = async (req, res, next) => {
        console.log("--------------------::Processing Find All Kategori Streaming::--------------------");
        try {
            await getDataIntegrasiStreaming('/setup/kategori_kegiatan').then(async (resp) => {
                res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: resp,
            });
            }).catch((error) => {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: `${messageService().GET_FAILED}`
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const findAllVendor = async (req, res, next) => {
        console.log("--------------------::Processing Find All Vendor Streaming::--------------------");
        try {
            await getDataIntegrasiStreaming('/setup/vendor').then(async (resp) => {
                res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: resp,
            });
            }).catch((error) => {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: `${messageService().GET_FAILED}`
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const findAllJenisPerangkat = async (req, res, next) => {
        console.log("--------------------::Processing Find All Jenis Perangkat Streaming::--------------------");
        try {
            await getDataIntegrasiStreaming('/setup/jenisperangkat').then(async (resp) => {
                res.status(200).json({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: resp,
                });
            }).catch((error) => {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: `${messageService().GET_FAILED}`
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const getAksesStreaming = async (kode_lokasi) => {
        return new Promise(async (resolve, reject) => {
            try {
                const q = await t_integrasi.findOne(
                    {
                        where: {
                            kode: 'STREAMING',
                            is_active: true,
                            is_deleted: false
                        },
                        logging: false
                    }
                )

                var apiurl = q.api_url.replace(/[\r\n]/g, "");
                var endpoint = `${apiurl}/akses?kode_lokasi=${kode_lokasi}`;

                var config = {
                    method: 'GET',
                    timeout: 10000,
                    url: endpoint,
                    headers: {
                        'Authorization': `Bearer ${q.api_auth_token}`,
                    },
                };
                console.log(endpoint);

                axios(config).then(async function (response) {
                    const resQ = JSON.stringify(response.data.data);
                    resolve(JSON.parse(resQ))
                }).catch(async (error) => {
                    console.log('ERROR RES : ', error.response);
                    await synclogin().then(async (resp) => {
                        console.log('RESPONSE LOGIN : ', resp);
                        if (resp && resp != 0) {
                            var config2 = {
                                method: 'GET',
                                timeout: 10000,
                                url: endpoint,
                                headers: {
                                    'Authorization': `${resp.token_type} ${resp.access_token}`,
                                },
                            };
                            await axios(config2).then(async function (respond) {
                                const resA = JSON.stringify(respond.data.data);
                                resolve(JSON.parse(resA))
                            }).catch(async (error) => {
                                reject(error);
                            });
                        } else {
                            reject(error);
                        }
                    }).catch((err) => {
                        reject(error);
                    });
                });
            } catch (error) {
                reject(error)
            }

        });

    }

    const sinkStreaming = async (req, res, next) => {
        console.log("--------------------::Processing Sink Data Streaming::--------------------");
        try {
            const kode_lokasi = req.query.kode_lokasi;
            const bptd_id = req.query.bptd;
            const lokasi_id = req.query.lokasi;
            console.log(kode_lokasi)
            if (kode_lokasi) {

                await getAksesStreaming(kode_lokasi).then(async (resp) => {
                    console.log('DATA STREAMING : ', resp);
                    if (resp.length) {
                        let layoutCounter = 1
                        for await (const val of resp) {
                            const cekData = await t_streaming.findOne({
                                where: {
                                    kode: val.id.toString(),
                                },
                                logging: false
                            })

                            if (cekData) {
                                await t_streaming.update(
                                    {
                                        bptd_id: bptd_id,
                                        lokasi_id: lokasi_id,
                                        kode: val.id,
                                        nama: val.nama,
                                        lokasi: val.lokasi,
                                        lokasi_kode: kode_lokasi,
                                        kotakab: val.kotakab,
                                        provinsi: val.provinsi,
                                        bptd: val.bptd,
                                        akses_url: val.akses_url,
                                        webrtc_url: val.webrtc_url,
                                        // layout: layoutCounter++,
                                        updated_by: req.token.id,
                                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                        is_lhr: val.is_lhr ? val.is_lhr : false,
                                    },
                                    {
                                        where: { kode: val.id.toString() },
                                        logging: false
                                    }
                                )
                            } else {
                                await t_streaming.create(
                                    {
                                        bptd_id: bptd_id,
                                        lokasi_id: lokasi_id,
                                        kode: val.id,
                                        nama: val.nama,
                                        lokasi: val.lokasi,
                                        lokasi_kode: kode_lokasi,
                                        kotakab: val.kotakab,
                                        provinsi: val.provinsi,
                                        bptd: val.bptd,
                                        akses_url: val.akses_url,
                                        webrtc_url: val.webrtc_url,
                                        layout: layoutCounter++,
                                        created_by: req.token.id,
                                        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                        is_lhr: val.is_lhr ? val.is_lhr : false,
                                    },
                                    {
                                        logging: false
                                    }
                                )
                            }
                        }
                        res.send({
                            success: true,
                            message: 'Sinkronisasi Data Streaming Berhasil'
                        });
                        
                    } else {
                        res.send({
                            success: false,
                            message: 'Data Streaming Tidak Tersedia'
                        });
                    }
                }).catch((error) => {
                    console.log(error);
                    res.send({
                        success: false,
                        message: 'Sinkronisasi Data Streaming Gagal'
                    });
                })

            } else {
                res.send({
                    success: false,
                    message: 'Kode UPPKB Wajib Di Isi'
                });
            }

        } catch (error) {
            next(error)
        }
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const lokasi_id = req.query.lokasi;
            let conditions = { is_deleted: false }

            if (lokasi_id) {
                conditions = { 
                    lokasi_id: lokasi_id,
                    is_deleted: false
                }
            }
            
            const options = {
                page: req.query.page || 1,
                paginate: req.query.paginate || await countAll(),
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
            }

            const { docs, pages, total } = await t_streaming.paginate(options)

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
            t_streaming.findByPk(id, {
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
        } catch (error) {
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            const lokasi_id = req.query.lokasi;
            let conditions = { is_active: true, is_deleted: false }

            if (lokasi_id) {
                conditions = { 
                    lokasi_id: lokasi_id, 
                    is_active: true,
                    is_deleted: false,
                }
            }
            
            const options = {
                page: req.query.page || 1,
                paginate: req.query.paginate || await countAll(),
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
            }

            const { docs, pages, total } = await t_streaming.paginate(options)

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

    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        
        try {

            const field = {
                lokasi_id: req.body.lokasi_id,
                jenis_perangkat_id: req.body.jenis_perangkat_id,
                vendor_id: 6,
                kategori_kegiatan_id: 6,
                kode: req.body.kode,
                nama: req.body.nama,
                ip_address: req.body.ip_address,
                deskripsi: req.body.deskripsi,
                source_type: req.body.source_type,
                source_url: req.body.source_url,
                source_on_demand: 'yes',
                is_active: req.body.is_active ? req.body.is_active : true,
                is_lhr: req.body.is_lhr ? req.body.is_lhr : false,
            };

            await addDataStreaming(field, '/setup/perangkat').then(async (respond) => {
                if (respond) {

                    res.status(200).json({
                        success: true,
                        message: messageService().CREATE_SUCCESS,
                        data: [respond],
                    });
                } else {
                    res.status(500).send({
                        success: false,
                        message: messageService().CREATE_FAILED
                    });
                }
            }).catch((error) => {
                console.log(error);
                res.status(500).send({
                    success: false,
                    message: messageService().CREATE_FAILED
                });
            });

        } catch (error) {
            next(error)
        }
    }

    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            const id = req.params.id;

            t_streaming.update(
                {
                    bptd_id: req.body.bptd_id,
                    lokasi_id: req.body.lokasi_id,
                    vendor_id: req.body.vendor_id,
                    tipe_cctv_id: req.body.tipe_cctv_id,
                    tipe_source_cctv_id: req.body.tipe_source_cctv_id,
                    source_url: req.body.source_url,
                    source_on_demand: req.body.source_on_demand,
                    source_on_demand_start_timeout: req.body.source_on_demand_start_timeout,
                    source_on_demand_close_after: req.body.source_on_demand_close_after,
                    kode: req.body.kode,
                    nama: req.body.nama,
                    deskripsi: req.body.deskripsi,
                    timbangan_id: req.body.is_platform ? req.body.timbangan_id : null,
                    posisi_cctv_platform_id: req.body.is_platform ? req.body.posisi_cctv_platform_id : null,
                    is_active: req.body.iact ? req.body.iact : true,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: id }
                }
            ).then(async num => {
                if (num == 1) {
                    const data_streamings = await t_streaming.findAll({where: {is_deleted: false}})
                    await generateFile(data_streamings);
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

            t_streaming.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
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
            t_streaming.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: id },
                    logging: false
                }
            ).then(async num => {
                if (num == 1) {
                    const data_streamings = await t_streaming.findAll({where: {is_deleted: false}})
                    await generateFile(data_streamings);
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
            t_streaming.destroy({
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

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_streaming.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
                    logging: false
                }
            ).then(async num => {
                if (num == resSplit.length) {
                    const data_streamings = await t_streaming.findAll({where: {is_deleted: false}})
                    await generateFile(data_streamings);
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
        var resSplit = q.split(",").map(i => Number(i));
        try {
            t_streaming.destroy({
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_streaming.destroy(
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

    const dataStreaming = async (req, next) => {
        try {
            const bptd_id = req.query.bptd;
            const lokasi_id = req.query.lokasi;

            let conditions = { is_deleted: false }
            const count = await countAll();

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }

            if (lokasi_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    is_deleted: false
                }
            }
            if (bptd_id && lokasi_id) {
                conditions = {
                    bptd_id: bptd_id,
                    lokasi_id: lokasi_id,
                    is_deleted: false
                }
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
                include: [
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'streaming_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'bptd_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_vendor,
                        required: false,
                        as: 'streaming_vendor',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_tipe_cctv,
                        required: false,
                        as: 'streaming_tipe_cctv',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_tipe_source_cctv,
                        required: false,
                        as: 'streaming_tipe_source_cctv',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_posisi_cctv_platform,
                        required: false,
                        as: 'streaming_posisi_cctv_platform',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    }
                ],
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_streaming.paginate(options)
            
            const result = {
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }
            }
            return result;

        } catch (error) {
            next(error)
        }
    }

    const xlsStreaming = async (req, res, next) => {
        const result = await dataStreaming(req, next)
        
        if (result) {
            let arr = []

            for await (const item of result.data) {
                const nama = item.nama.replace(/\s/g, '')
                arr.push({
                    kode: item.kode,
                    nama: item.nama,
                    deskripsi: item.deskripsi,
                    tipe_cctv: item.streaming_tipe_cctv.nama,
                    source_type: item.streaming_tipe_source_cctv.nama,
                    source_url: item.source_url,
                    nama_uppkb: item.streaming_uppkb.nama,
                    nama_vendor: item.streaming_vendor.nama,
                    cctv_platform: item.is_platform ? 'Ya' : 'Bukan',
                    posisi_cctv_platform: item.is_platform ? item.streaming_posisi_cctv_platform.nama : '-',
                    streaming_url: `${config.domain_streaming}/${item.kode}_${item.lokasi_id}_${nama}/stream.m3u8`
                })
            }

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('Lhr', {
                pageSetup: {
                    paperSize: 9,
                    orientation: 'landscape'
                }
            });
    
            worksheet.pageSetup.margins = {
                left: 0.7, right: 0.7,
                top: 0.75, bottom: 0.75,
                header: 0.3, footer: 0.3
            }

            worksheet.columns = [
                { header: 'Kode', key: 'kode', width: 20},
                { header: 'Nama', key: 'nama', width: 20},
                { header: 'Deskripsi', key: 'deskripsi', width: 20},
                { header: 'Uppkb', key: 'nama_uppkb', width: 20},
                { header: 'Vendor', key: 'nama_vendor', width: 20},
                { header: 'Tipe', key: 'tipe_cctv', width: 20},
                { header: 'Tipe Source', key: 'source_type', width: 20},
                { header: 'URL Source', key: 'source_url', width: 20},
                { header: 'URL Streaming', key: 'streaming_url', width: 20},
                { header: 'CCTV Platform', key: 'cctv_platform', width: 20},
                { header: 'Posisi CCTV Platform', key: 'posisi_cctv_platform', width: 20},
            ]
            
            worksheet.addRows(arr);
            worksheet.eachRow(function (row, rowNumber) {
                row.eachCell((cell, colNumber) => {
                    if (rowNumber == 1) {
                        // First set the background of header row
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'f5b914' }
                        }
                    }
                    // Set border of each cell 
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                })
                //Commit the changed row to the stream
                row.commit();
            });
            let m = moment();
            let ms = m.millisecond() + 1000 * (m.second() + 60 * (m.minutes() + 60 * m.hours()));
            const filename = `data_streaming_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
            const uploadPath = path.join(config.path_report) + '/xls/' + filename;
            const reportUrl = config.report_url + 'xls/' + filename;
    
            workbook.xlsx.writeFile(uploadPath).then(() => {
                console.log('xlsx fiel is written.')
                res.send({
                    success: true,
                    message: 'Export Excel Berhasil',
                    filename: filename,
                    download: reportUrl
                })
            })
        }
    }

    function promiseToCreateQRcode(linktext) {
        return new Promise(function (resolve, reject) {
            QRCode.toDataURL(linktext, function (err, url) {
                if (err) {
                    reject(err);
                } else {
                    resolve(url);
                }
            });
        });
    }

    const printStreaming = async (req, res, next) => {
        const result = await dataStreaming(req, next);
        const lokasi_id = req.query.lokasi
        const ispdf = req.query.ispdf

        if (result) {
            let arr = []

            for await (const item of result.data) {
                const nama = item.nama.replace(/\s/g, '')
                arr.push({
                    kode: item.kode,
                    nama: item.nama,
                    deskripsi: item.deskripsi,
                    tipe_cctv: item.streaming_tipe_cctv.nama,
                    source_type: item.streaming_tipe_source_cctv.nama,
                    source_url: item.source_url,
                    nama_uppkb: item.streaming_uppkb.nama,
                    nama_vendor: item.streaming_vendor.nama,
                    cctv_platform: item.is_platform ? 'Ya' : 'Bukan',
                    posisi_cctv_platform: item.is_platform ? item.streaming_posisi_cctv_platform.nama : '-',
                    streaming_url: `${config.domain_streaming}/${item.kode}_${item.lokasi_id}_${nama}/stream.m3u8`
                })
            }

            let params = 'lokasi_id=all_uppkb'
            let lokasi = null

            if (lokasi_id) {
                const resLokasi = await t_lokasi.findOne({
                    where: {
                        id: lokasi_id,
                        is_deleted: false
                    }
                })
                params = `lokasi_id=${lokasi_id}`
                lokasi = resLokasi
            }
            const dataqr = `${process.env.DOMAIN_URL_QR}/rep/streaming?src=${encrypt(params)}`;
            const qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();

            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });
            
            if (ispdf == 0) {
                res.render("streamingView.ejs", {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: arr,
                    moment: moment,
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', 'streamingView.ejs'), {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: arr,
                    moment: moment,
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                }, async (err, datapdf) => {
                    console.log(err)
                    if (err) {
                        res.send(err)
                    } else {
                        const options = {
                            format: 'Legal',
                            landscape: true,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };
                        
                        let nama_file_uppkb = 'all_uppkb'
                        if(lokasi_id) {
    
                            nama_file_uppkb = lokasi.kode;
                        }
    
                        const filename = `data_streaming_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                        const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
                        const reportUrl = config.report_url + 'pdf/' + filename;
    
                        try {
                            await generatePdfFile(datapdf, options, uploadPath);
                            res.send({
                                success: true,
                                message: 'Create PDF Berhasil.',
                                download: reportUrl,
                            });
                        } catch (err) {
                            console.error('PDF error:', err);
                            res.send({
                                success: false,
                                message: 'Create PDF Gagal.',
                                download: ''
                            });
                        }
                    }
                })
            }
        }
    }
    return {
        findAll,
        findOne,
        findAllActive,
        findAllLokasi,
        sinkStreaming,
        create,
        update,
        updateStatus,
        removeSoft,
        remove,
        removeArrSoft,
        removeArr,
        truncate,
        xlsStreaming,
        printStreaming
    };
}
module.exports = StreamingController;