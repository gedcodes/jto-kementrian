const {
    vr_lhr_pelanggaran,
    t_lokasi,
    vr_device,
    t_gol_ai,
    t_jenis_kendaraan,
    sequelize } = require('../models');
const {
    getLokasiUppkbKode
} = require('./lib/dataid');
const { Op, QueryTypes } = require('sequelize');
const messageService =  require('../services/message.service');

const config = require('../../config/config');
const fs = require('fs');
const moment = require('moment');
const path = require("path");
var url = require('url');
var QRCode = require('qrcode');
const { reportTemplate } = require('../controllers/lib/report_template');
let ejs = require("ejs");
const { generatePdfFile } = require('../middleware/pdfGenerator');

const excel = require('exceljs');
const { encrypt } = require('./lib/aescrypt');

const LhrPelanggaranController = () => {
    const countAll = async () => {
        return vr_lhr_pelanggaran.count({
            where:{
                is_active: true
            }
        });
    } 

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try{
            const device_id = req.query.device_id;
            const lokasi_id = req.query.lokasi;
            const tgl_capture = req.query.tgl;
            const kode_uppkb = await getLokasiUppkbKode(lokasi_id);

            let conditions = {
                is_active: true
            };

            if (device_id) {
                conditions.device_id = device_id;
            }

            if (kode_uppkb) {
                conditions.kode_uppkb = kode_uppkb;
            }

            if (tgl_capture) {
                conditions.tgl_capture = {
                    [Op.between]: [moment(tgl_capture).startOf('day').format(), moment(tgl_capture).endOf('day').format()],
                };
            }
            
            const options = {
                include: [
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'lhr_pelanggaran_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: vr_device,
                        required: false,
                        as: 'device',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_active: true
                        }
                    },
                    {
                        model: t_gol_ai,
                        required: false,
                        as: 'gol_ai',
                        attributes: [
                            'id', 'id_jns_kendaraan', 'desc_gol_ai'
                        ],
                        where: {
                            is_active: true
                        },
                        include: [
                            {
                                model: t_jenis_kendaraan,
                                required: false,
                                as: 'jenisKend',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                        ],
                    },
                ],
                page: req.query.page || 1,
                paginate: req.query.paginate || await countAll(),
                order: [
                    [ 
                        req.query.orderBy || 'created_at', 
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: true
            }
    
            const {docs, pages, total} = await vr_lhr_pelanggaran.paginate(options)
    
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
            vr_lhr_pelanggaran.findByPk(id, {
                include: [
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'lhr_pelanggaran_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: vr_device,
                        required: false,
                        as: 'device',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_gol_ai,
                        required: false,
                        as: 'gol_ai',
                        attributes: [
                            'id', 'id_jns_kendaraan', 'desc_gol_ai'
                        ],
                        where: {
                            is_active: true
                        }
                    },
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
            // const name = req.query.search;
            const device_id = req.query.device_id;
            const lokasi_id = req.query.lokasi;
            const tgl_capture = req.query.tgl;
            const kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            const count = await countAll();

            let conditions = {
                is_active: true,
                is_verifikasi: false
            };

            // if (name) {
            //     conditions.no_kendaraan = { [Op.iLike]: `%${name}%` };
            // }

            if (device_id) {
                conditions.device_id = device_id;
            }

            if (kode_uppkb) {
                conditions.kode_uppkb = kode_uppkb;
            }

            if (tgl_capture) {
                conditions = {
                    ...conditions,  // Menyalin semua kondisi yang sudah ada
                    tgl_capture: sequelize.where(
                        sequelize.fn('DATE', sequelize.col('vr_lhr_pelanggaran.tgl_capture')),
                        moment(tgl_capture).format('YYYY-MM-DD')
                    )
                };
            }
            
            const options = {
                include: [
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'lhr_pelanggaran_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: vr_device,
                        required: false,
                        as: 'device',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_gol_ai,
                        required: false,
                        as: 'gol_ai',
                        attributes: [
                            'id', 'id_jns_kendaraan', 'desc_gol_ai'
                        ],
                        where: {
                            is_active: true
                        },
                        include: [
                            {
                                model: t_jenis_kendaraan,
                                required: false,
                                as: 'jenisKend',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                        ],
                    },
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
    
            const {docs, pages, total} = await vr_lhr_pelanggaran.paginate(options)
    
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
            let id_gol = req.body.id_gol_ai;
            if (req.body.id_gol_ai && Number(req.body.id_gol_ai) > 99) {
                id_gol = 99;
            }
            const field = { 
                tgl_capture: moment(req.body.tgl_capture).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                no_kendaraan: req.body.no_kendaraan,
                img_name: req.body.img_name,
                img2_name: req.body.img2_name,
                img3_name: req.body.img3_name,
                img4_name: req.body.img4_name,
                img_plat_depan_name: req.body.img_plat_depan_name,
                img_plat_belakang_name: req.body.img_plat_belakang_name,
                img_url: req.body.img_url,
                img2_url: req.body.img2_url,
                img3_url: req.body.img3_url,
                img4_url: req.body.img4_url,
                img_plat_depan_url: req.body.img_plat_depan_url,
                img_plat_belakang_url: req.body.img_plat_belakang_url,
                device_id: req.body.device_id,
                is_verifikasi: req.body.is_verifikasi ? req.body.is_verifikasi : false,
                berat_timbang: Number(req.body.berat_timbang) || 0,
                panjang_ukur: Number(req.body.panjang_ukur) || 0,
                lebar_ukur: Number(req.body.lebar_ukur) || 0,
                tinggi_ukur: Number(req.body.tinggi_ukur) || 0,
                foh_ukur: Number(req.body.foh_ukur) || 0,
                roh_ukur: Number(req.body.roh_ukur) || 0,
                is_plat: req.body.is_plat ? req.body.is_plat : false,
                kd_referensi: req.body.kd_referensi,
                id_referensi: req.body.id_referensi,
                id_gol_ai: id_gol,
                kode_uppkb: req.body.kode_uppkb,
                is_blue: req.body.is_blue,
                masa_berlaku_blue: req.body.masa_berlaku_blue ? moment(req.body.masa_berlaku_blue, 'YYYY-MM-DD').format('YYYY-MM-DD') : null,
                vcode: req.body.vcode,
                rfid: req.body.rfid,
                is_active: req.body.is_active ? req.body.is_active : true,
                created_at: moment(req.body.created_at).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
                created_by: req.body.created_by || req.token.id,
                last_id: req.body.id,
            };
            console.log('DATA LHR PELANGGARAN : ', field);

            vr_lhr_pelanggaran.create(field, {
                logging: false
            }).then(async data => {
                console.log('SINKRONISASI BERHASIL');
                res.status(200).send({
                    success: true,
                    message: messageService().CREATE_SUCCESS,
                    data: [{
                        last_insert_id: data.id,
                        fields: field
                    }]
                });

            }).catch(err => {
                console.log('SINKRONISASI GAGAL');
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
    
            if (id) {

                vr_lhr_pelanggaran.update(
                    {
                        tgl_capture: moment(req.body.tgl_capture).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        no_kendaraan: req.body.no_kendaraan,
                        img_name: req.body.img_name,
                        img2_name: req.body.img2_name,
                        img3_name: req.body.img3_name,
                        img4_name: req.body.img4_name,
                        img_plat_depan_name: req.body.img_plat_depan_name,
                        img_plat_belakang_name: req.body.img_plat_belakang_name,
                        img_url: req.body.img_url,
                        img2_url: req.body.img2_url,
                        img3_url: req.body.img3_url,
                        img4_url: req.body.img4_url,
                        img_plat_depan_url: req.body.img_plat_depan_url,
                        img_plat_belakang_url: req.body.img_plat_belakang_url,
                        device_id: req.body.device_id,
                        is_verifikasi: req.body.is_verifikasi ? req.body.is_verifikasi : false,
                        berat_timbang: Number(req.body.berat_timbang) || 0,
                        panjang_ukur: Number(req.body.panjang_ukur) || 0,
                        lebar_ukur: Number(req.body.lebar_ukur) || 0,
                        tinggi_ukur: Number(req.body.tinggi_ukur) || 0,
                        foh_ukur: Number(req.body.foh_ukur) || 0,
                        roh_ukur: Number(req.body.roh_ukur) || 0,
                        is_plat: req.body.is_plat ? req.body.is_plat : false,
                        kd_referensi: req.body.kd_referensi,
                        id_referensi: req.body.id_referensi,
                        id_gol_ai: req.body.id_gol_ai ? req.body.id_gol_ai : 99,
                        kode_uppkb: req.body.kode_uppkb,
                        is_blue: req.body.is_blue,
                        masa_berlaku_blue: req.body.masa_berlaku_blue ? moment(req.body.masa_berlaku_blue, 'YYYY-MM-DD').format('YYYY-MM-DD') : null,
                        vcode: req.body.vcode,
                        rfid: req.body.rfid,
                        is_active: req.body.is_active ? req.body.is_active : true,
                        updated_by: req.body.updated_by || req.token.id,
                        updated_at: moment(req.body.updated_at).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
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
            } else {
                res.send({
                    success: false,
                    message: `${messageService().UPDATE_FAILED} | ID Kosong`
                });
            };
                      
        } catch (error) {
            next(error)
        }
    }

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");
    
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i=>Number(i));

            vr_lhr_pelanggaran.update(
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
            vr_lhr_pelanggaran.destroy({
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
            vr_lhr_pelanggaran.destroy({
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
    
    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            vr_lhr_pelanggaran.destroy(
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

    const setMonth = (month) => {
        let bulan = '';
        switch (month) {
            case 0:
                bulan = 'Januari';
                break;
            case 1:
                bulan = 'Februari';
                break;
            case 2:
                bulan = 'Maret';
                break;
            case 3:
                bulan = 'April';
                break;
            case 4:
                bulan = 'Mei';
                break;
            case 5:
                bulan = 'Juni';
                break;
            case 6:
                bulan = 'Juli';
                break;
            case 7:
                bulan = 'Agustus';
                break;
            case 8:
                bulan = 'September';
                break;
            case 9:
                bulan = 'Oktober';
                break;
            case 10:
                bulan = 'November';
                break;
            case 11:
                bulan = 'Desember';
                break;
            default:
                bulan = '';
                break;
        }
        return bulan;
    };

    const dataLhr = async (req, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const interval = req.query.interval;
            const tgl = req.query.tgl;
            const jam_awal = req.query.jam_awal;
            const jam_akhir = req.query.jam_akhir;
            const tanggal_awal = req.query.tanggal_awal;
            const tanggal_akhir = req.query.tanggal_akhir;
            const bulan_awal = req.query.bulan_awal;
            const bulan_akhir = req.query.bulan_akhir;
            const tahun_awal = req.query.tahun_awal;
            const tahun_akhir = req.query.tahun_akhir;
            const tahun = moment().format('YYYY');
            const sensor_id = req.query.sensor_id;

            let whereSensor = '';
            if (sensor_id) {
                whereSensor = `AND jt_vr_data.id_sensor = ${sensor_id}`
            }

            if (lokasi_id) {
                const kode_uppkb = await getLokasiUppkbKode(lokasi_id);
                console.log('KODE UPPKB : ', kode_uppkb);
                // let sql = `SELECT
                //         TO_CHAR(DATE_TRUNC('hour', jt_vr_data.tgl_capture), 'HH24:MI') AS waktu,
                //         jt_lokasi_uppkb.id,
                //         jt_lokasi_uppkb.nama as nama_uppkb,
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'PICKUP') AS "PICKUP",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX KECIL') AS "TRUK_BOX_KECIL",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX BESAR') AS "TRUK_BOX_BESAR",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART KECIL') AS "TRUCK_STANDART_KECIL",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART BESAR') AS "TRUCK_STANDART_BESAR",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI KECIL') AS "TRUCK_TANGKI_KECIL",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI BESAR') AS "TRUCK_TANGKI_BESAR",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP KECIL') AS "TRUCK_DUMP_KECIL",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP BESAR') AS "TRUCK_DUMP_BESAR",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TRAILER') AS "TRUCK_TRAILER",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK MIXER') AS "TRUCK_MIXER",
                //         COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'UNDEFINED') AS "UNDEFINED"
                //     FROM
                //         jt_vr_data
                //     JOIN
                //         jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                //     LEFT JOIN
                //         jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                //     WHERE
                //         jt_vr_data.tgl_capture BETWEEN '${tgl} ${jam_awal}' AND '${tgl} ${jam_akhir}' AND jt_vr_data.kode_uppkb = '${kode_uppkb}'
                //     GROUP BY
			    //         jt_lokasi_uppkb.id, waktu
                //     ORDER BY
                //         waktu
                // `;
                let sql = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute') as waktu_real,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute'), 'HH24:MI') as waktu_from,
                                to_char((date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute')) + INTERVAL '15 Minutes', 'HH24:MI') AS waktu_to,
                                concat(to_char(date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute'), 'HH24:MI'),' - ',to_char((date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute')) + INTERVAL '15 Minutes', 'HH24:MI')) as waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) AS "MOBIL_BARANG_BAK_TERBUKA",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) AS "MOBIL_BARANG_BAK_TERTUTUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) AS "MOBIL_PENARIK",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS "MOBIL_TANGKI",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 99) AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM
                                jt_vr_data
                            JOIN jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE jt_vr_data.tgl_capture BETWEEN '${tgl} ${jam_awal}' AND '${tgl} ${jam_akhir}' AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY jt_lokasi_uppkb.id, tanggal, waktu_real
                            ORDER BY waktu_real`;

                if (interval == 2) {
                    sql = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                DATE_TRUNC('hour', jt_vr_data.tgl_capture) AS waktu_real,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture), 'HH24:MI') as waktu_from,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture) + INTERVAL '60 Minutes', 'HH24:MI') AS waktu_to,
                                CONCAT(to_char(date_trunc('hour', jt_vr_data.tgl_capture), 'HH24:MI'),' - ',to_char(date_trunc('hour', jt_vr_data.tgl_capture) + INTERVAL '60 Minutes', 'HH24:MI')) AS waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) AS "MOBIL_BARANG_BAK_TERBUKA",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) AS "MOBIL_BARANG_BAK_TERTUTUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) AS "MOBIL_PENARIK",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS "MOBIL_TANGKI",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 99) AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM jt_vr_data
                            JOIN jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE
                                jt_vr_data.tgl_capture BETWEEN '${tgl} ${jam_awal}' AND '${tgl} ${jam_akhir}' AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY
                                jt_lokasi_uppkb.id, tanggal, waktu_real
                            ORDER BY
                                waktu_real`;
                }

                if (interval == 3) {
                    sql = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'DD-MM-YYYY') AS waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) AS "MOBIL_BARANG_BAK_TERBUKA",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) AS "MOBIL_BARANG_BAK_TERTUTUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) AS "MOBIL_PENARIK",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS "MOBIL_TANGKI",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 99) AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM
                                jt_vr_data
                            JOIN
                                jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN
                                jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN
                                jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE
                                jt_vr_data.tgl_capture::date BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}' AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY
                                jt_lokasi_uppkb.id, tanggal, waktu
                            ORDER BY
                                waktu`;
                }

                if (interval == 4) {
                    sql = `SELECT
                                TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'MM-YYYY') AS waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) AS "MOBIL_BARANG_BAK_TERBUKA",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) AS "MOBIL_BARANG_BAK_TERTUTUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) AS "MOBIL_PENARIK",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS "MOBIL_TANGKI",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 99) AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM
                                jt_vr_data
                            JOIN
                                jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN
                                jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN
                                jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE
                                EXTRACT(YEAR FROM jt_vr_data.tgl_capture) = ${tahun} AND EXTRACT(MONTH FROM jt_vr_data.tgl_capture) BETWEEN ${bulan_awal} AND ${bulan_akhir} AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY
                                jt_lokasi_uppkb.id, waktu
                            ORDER BY
                                waktu`;
                }
                
                if (interval == 5) {
                    sql = `SELECT
                                TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'YYYY') AS waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) AS "MOBIL_BARANG_BAK_TERBUKA",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) AS "MOBIL_BARANG_BAK_TERTUTUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) AS "MOBIL_PENARIK",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS "MOBIL_TANGKI",
                                COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 99) AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM
                                jt_vr_data
                            JOIN
                                jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN
                                jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN
                                jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE
                                EXTRACT(YEAR FROM jt_vr_data.tgl_capture) BETWEEN ${tahun_awal} AND ${tahun_akhir} AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY
                                jt_lokasi_uppkb.id, waktu
                            ORDER BY
                                waktu`;
                        }

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                return result
            }

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            })

            return result

        } catch (error) {
            next(error)
        }
    }

    const filter = async (req, res, next) => {
        console.log('::=::-------------> GET ALL LHR PELANGGARAN FILTER <-------------::=::');
        const interval = req.query.interval;
        const result = await dataLhr(req, next);
        let data = [];
        let total = 0;
        let totalBlue = 0;
        let totalTdkBlue = 0;

        if (result) {
            // var versiLhr = result.length > 0 ? result[0].versi_lhr : '2';
            for (let row of result) {
                var formatwaktu = row.waktu;
                if (interval == 4) {
                    formatwaktu = setMonth(Number(moment(row.waktu, 'MM-YYYY').format('MM')) - 1);
                }
                const totalKend = parseInt(row.jml_blue) + parseInt(row.jml_tdk_blue);
                data.push({
                    interval: interval,
                    tanggal: row.tanggal,
                    waktu: formatwaktu,
                    lokasi_id: row.id,
                    nama_uppkb: row.nama_uppkb,
                    MOBIL_BARANG_BAK_TERBUKA: parseInt(row.MOBIL_BARANG_BAK_TERBUKA),
                    MOBIL_BARANG_BAK_TERTUTUP: parseInt(row.MOBIL_BARANG_BAK_TERTUTUP),
                    MOBIL_PENARIK: parseInt(row.MOBIL_PENARIK),
                    MOBIL_TANGKI: parseInt(row.MOBIL_TANGKI),
                    // TRUCK_STANDART_BESAR: parseInt(row.TRUCK_STANDART_BESAR),
                    // TRUCK_TANGKI_KECIL: parseFloat(row.TRUCK_TANGKI_KECIL),
                    // TRUCK_TANGKI_BESAR: parseInt(row.TRUCK_TANGKI_BESAR),
                    // TRUCK_DUMP_KECIL: parseInt(row.TRUCK_DUMP_KECIL),
                    // TRUCK_DUMP_BESAR: parseInt(row.TRUCK_DUMP_BESAR),
                    // TRUCK_TRAILER: parseInt(row.TRUCK_TRAILER),
                    // TRUCK_MIXER: parseInt(row.TRUCK_MIXER),
                    UNDEFINED: parseInt(row.UNDEFINED),
                    jml_blue: row.jml_blue,
                    jml_tdk_blue: row.jml_tdk_blue,
                });
                total += parseInt(totalKend);
                totalBlue += parseInt(row.jml_blue);
                totalTdkBlue += parseInt(row.jml_tdk_blue);
            }


            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: data,
                meta: {
                    total: result.length,
                    totakAllKend: total,
                    totalBlue: totalBlue,
                    totalTdkBlue: totalTdkBlue,
                }
            });
        }
    }

    const xlsLhrPelanggaran = async (req, res, next) => {
        const interval = req.query.interval;
        const result = await dataLhr(req, next)

        if (result) {
            const nama_interval = interval == 1 ? 'Per 15 Menit' : interval == 2 ? 'Per 60 Menit' : interval == 3 ? 'Per Hari' : interval == 4 ? 'Per Bulan' : 'Per Tahun';
            let obj = [];
            for (let row of result) {
                var formatwaktu = row.waktu;
                if (interval == 3) {
                    formatwaktu = setMonth(Number(moment(row.waktu, 'MM-YYYY').format('MM')) - 1);
                }
                obj.push({
                    nama_uppkb: row.nama_uppkb,
                    interval: nama_interval,
                    MOBIL_BARANG_BAK_TERBUKA: row.MOBIL_BARANG_BAK_TERBUKA,
                    MOBIL_BARANG_BAK_TERTUTUP: row.MOBIL_BARANG_BAK_TERTUTUP,
                    MOBIL_PENARIK: row.MOBIL_PENARIK,
                    MOBIL_TANGKI: row.MOBIL_TANGKI,
                    UNDEFINED: row.UNDEFINED,
                    waktu: formatwaktu
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
                { header: 'Waktu', key: 'waktu', width: 20 },
                { header: 'Interval', key: 'interval', width: 20 },
                { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
                { header: 'MOBIL BARANG BAK TERBUKA', key: 'MOBIL_BARANG_BAK_TERBUKA', width: 20 },
                { header: 'MOBIL BARANG BAK TERTUTUP', key: 'MOBIL_BARANG_BAK_TERTUTUP', width: 20 },
                { header: 'MOBIL PENARIK', key: 'MOBIL_PENARIK', width: 20 },
                { header: 'MOBIL TANGKI', key: 'MOBIL_TANGKI', width: 20 },
                { header: 'UNDEFINED', key: 'UNDEFINED', width: 20 },
            ]

            worksheet.addRows(obj);
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
            const filename = `lhr_pelanggaran_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
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

    const printLhrPelanggaran = async (req, res, next) => {
        const ispdf = req.query.ispdf;
        const lokasi_id = req.query.lokasi;
        const interval = req.query.interval;
        const tgl = req.query.tgl;
        const jam_awal = req.query.jam_awal;
        const jam_akhir = req.query.jam_akhir;
        const tanggal_awal = req.query.tanggal_awal;
        const tanggal_akhir = req.query.tanggal_akhir;
        const bulan_awal = req.query.bulan_awal;
        const bulan_akhir = req.query.bulan_akhir;
        const tahun_awal = req.query.tahun_awal;
        const tahun_akhir = req.query.tahun_akhir;
        const tahun = moment().format('YYYY');

        const result = await dataLhr(req, next);
        if (result) {
            let lokasi = ''
            const kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            if (lokasi_id) {
                lokasi = await t_lokasi.findOne({
                    where: {
                        'id': lokasi_id,
                        'is_active': true,
                        'is_deleted': false
                    },
                    attributes: ['id', 'nama']
                })
            }

            let datafilter = {
                interval: 'Per 15 Menit',
                tanggal: moment(tgl).format('DD-MM-YYYY'),
                jam_awal: moment(tgl + ' ' + jam_awal).format('HH:mm'),
                jam_akhir: moment(tgl + ' ' + jam_akhir).format('HH:mm'),
            }

            if (interval == 2) {
                datafilter = {
                    interval: 'Per 60 Menit',
                    tanggal: moment(tgl).format('DD-MM-YYYY'),
                    jam_awal: moment(tgl + ' ' + jam_awal).format('HH:mm'),
                    jam_akhir: moment(tgl + ' ' + jam_akhir).format('HH:mm'),
                }
            }

            if (interval == 3) {
                datafilter = {
                    interval: 'Per Hari',
                    jam_awal: moment(tanggal_awal).format('DD-MM-YYYY'),
                    jam_akhir: moment(tanggal_akhir).format('DD-MM-YYYY'),
                }
            }
            if (interval == 4) {
                datafilter = {
                    interval: 'Per Bulan',
                    jam_awal: moment(bulan_awal).locale('id').format('MMMM'),
                    jam_akhir: moment(bulan_akhir).locale('id').format('MMMM'),
                    // jam_awal: setMonth(Number(moment(bulan_awal + '-' + tahun, 'MM-YYYY').format('MM')) - 1),
                    // jam_akhir: setMonth(Number(moment(bulan_akhir + '-' + tahun, 'MM-YYYY').format('MM')) - 1),
                }
            }
            if (interval == 5) {
                datafilter = {
                    interval: 'Per Tahun',
                    jam_awal: moment(tahun_awal).format('YYYY'),
                    jam_akhir: moment(tahun_akhir).format('YYYY'),
                }
            }
            const params = `lokasi_id=${lokasi_id}`;
            const dataqr = `${process.env.DOMAIN_URL_QR}/rep/lhrpelanggaran?src=${encrypt(params)}`;
            const qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();
            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("lhrPelanggaranView.ejs", {
                    data: result,
                    datafilter: datafilter,
                    interval: interval,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', 'lhrPelanggaranView.ejs'), {
                    data: result,
                    datafilter: datafilter,
                    interval: interval,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
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
                        if (lokasi_id) {

                            nama_file_uppkb = kode_uppkb;
                        }

                        const filename = `data_lhr_pelanggaran_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
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
    
    const datarowLhrAb = async (req, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const interval = req.query.interval;
            const tgl = req.query.tgl;
            const jam_awal = req.query.jam_awal;
            const jam_akhir = req.query.jam_akhir;
            const tanggal_awal = req.query.tanggal_awal;
            const tanggal_akhir = req.query.tanggal_akhir;
            const bulan_awal = req.query.bulan_awal;
            const bulan_akhir = req.query.bulan_akhir;
            const tahun_awal = req.query.tahun_awal;
            const tahun_akhir = req.query.tahun_akhir;
            const tahun = moment().format('YYYY');
            const limit = req.query.limit;
            const offset = req.query.offset;
            const sensor_id = req.query.sensor_id;

            let whereSensor = '';
            if (sensor_id) {
                whereSensor = `AND jt_vr_data.id_sensor = ${sensor_id}`
            }

            if (lokasi_id) {
                const kode_uppkb = await getLokasiUppkbKode(lokasi_id);
                console.log('KODE UPPKB : ', kode_uppkb);
  
                let sql = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute') as waktu_real,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute'), 'HH24:MI') as waktu_from,
                                to_char((date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute')) + INTERVAL '15 Minutes', 'HH24:MI') AS waktu_to,
                                concat(to_char(date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute'), 'HH24:MI'),' - ',to_char((date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute')) + INTERVAL '15 Minutes', 'HH24:MI')) as waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'PICKUP') AS "PICKUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX KECIL') AS "TRUK_BOX_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX BESAR') AS "TRUK_BOX_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART KECIL') AS "TRUCK_STANDART_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART BESAR') AS "TRUCK_STANDART_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI KECIL') AS "TRUCK_TANGKI_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI BESAR') AS "TRUCK_TANGKI_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP KECIL') AS "TRUCK_DUMP_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP BESAR') AS "TRUCK_DUMP_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TRAILER') AS "TRUCK_TRAILER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK MIXER') AS "TRUCK_MIXER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'UNDEFINED') AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM
                                jt_vr_data
                            JOIN jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE jt_vr_data.tgl_capture BETWEEN '${tgl} ${jam_awal}' AND '${tgl} ${jam_akhir}' AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY jt_lokasi_uppkb.id, tanggal, waktu_real
                            ORDER BY waktu_real`;

                if (interval == 2) {
                    sql = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                DATE_TRUNC('hour', jt_vr_data.tgl_capture) AS waktu_real,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture), 'HH24:MI') as waktu_from,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture) + INTERVAL '60 Minutes', 'HH24:MI') AS waktu_to,
                                CONCAT(to_char(date_trunc('hour', jt_vr_data.tgl_capture), 'HH24:MI'),' - ',to_char(date_trunc('hour', jt_vr_data.tgl_capture) + INTERVAL '60 Minutes', 'HH24:MI')) AS waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'PICKUP') AS "PICKUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX KECIL') AS "TRUK_BOX_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX BESAR') AS "TRUK_BOX_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART KECIL') AS "TRUCK_STANDART_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART BESAR') AS "TRUCK_STANDART_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI KECIL') AS "TRUCK_TANGKI_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI BESAR') AS "TRUCK_TANGKI_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP KECIL') AS "TRUCK_DUMP_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP BESAR') AS "TRUCK_DUMP_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TRAILER') AS "TRUCK_TRAILER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK MIXER') AS "TRUCK_MIXER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'UNDEFINED') AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM jt_vr_data
                            JOIN jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE
                                jt_vr_data.tgl_capture BETWEEN '${tgl} ${jam_awal}' AND '${tgl} ${jam_akhir}' AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY
                                jt_lokasi_uppkb.id, tanggal, waktu_real
                            ORDER BY
                                waktu_real`;
                }

                if (interval == 3) {
                    sql = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'DD-MM-YYYY') AS waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'PICKUP') AS "PICKUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX KECIL') AS "TRUK_BOX_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX BESAR') AS "TRUK_BOX_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART KECIL') AS "TRUCK_STANDART_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART BESAR') AS "TRUCK_STANDART_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI KECIL') AS "TRUCK_TANGKI_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI BESAR') AS "TRUCK_TANGKI_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP KECIL') AS "TRUCK_DUMP_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP BESAR') AS "TRUCK_DUMP_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TRAILER') AS "TRUCK_TRAILER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK MIXER') AS "TRUCK_MIXER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'UNDEFINED') AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM
                                jt_vr_data
                            JOIN
                                jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN
                                jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN
                                jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE
                                jt_vr_data.tgl_capture::date BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}' AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY
                                jt_lokasi_uppkb.id, tanggal, waktu
                            ORDER BY
                                waktu`;
                }

                if (interval == 4) {
                    sql = `SELECT
                                TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'MM-YYYY') AS waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'PICKUP') AS "PICKUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX KECIL') AS "TRUK_BOX_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX BESAR') AS "TRUK_BOX_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART KECIL') AS "TRUCK_STANDART_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART BESAR') AS "TRUCK_STANDART_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI KECIL') AS "TRUCK_TANGKI_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI BESAR') AS "TRUCK_TANGKI_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP KECIL') AS "TRUCK_DUMP_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP BESAR') AS "TRUCK_DUMP_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TRAILER') AS "TRUCK_TRAILER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK MIXER') AS "TRUCK_MIXER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'UNDEFINED') AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM
                                jt_vr_data
                            JOIN
                                jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN
                                jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN
                                jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE
                                EXTRACT(YEAR FROM jt_vr_data.tgl_capture) = ${tahun} AND EXTRACT(MONTH FROM jt_vr_data.tgl_capture) BETWEEN ${bulan_awal} AND ${bulan_akhir} AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY
                                jt_lokasi_uppkb.id, waktu
                            ORDER BY
                                waktu`;
                }

                if (interval == 5) {
                    sql = `SELECT
                                TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'YYYY') AS waktu,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'PICKUP') AS "PICKUP",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX KECIL') AS "TRUK_BOX_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUK BOX BESAR') AS "TRUK_BOX_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART KECIL') AS "TRUCK_STANDART_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK STANDART BESAR') AS "TRUCK_STANDART_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI KECIL') AS "TRUCK_TANGKI_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TANGKI BESAR') AS "TRUCK_TANGKI_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP KECIL') AS "TRUCK_DUMP_KECIL",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK DUMP BESAR') AS "TRUCK_DUMP_BESAR",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK TRAILER') AS "TRUCK_TRAILER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'TRUCK MIXER') AS "TRUCK_MIXER",
                                COUNT(*) FILTER (WHERE jt_gol_ai.desc_gol_ai = 'UNDEFINED') AS "UNDEFINED",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS "jml_blue",
                                COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS "jml_tdk_blue"
                            FROM
                                jt_vr_data
                            JOIN
                                jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                            LEFT JOIN
                                jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            LEFT JOIN
                                jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                            WHERE
                                EXTRACT(YEAR FROM jt_vr_data.tgl_capture) BETWEEN ${tahun_awal} AND ${tahun_akhir} AND jt_vr_data.kode_uppkb = '${kode_uppkb}' ${whereSensor}
                            GROUP BY
                                jt_lokasi_uppkb.id, waktu
                            ORDER BY
                                waktu`;
                }

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                return result
            }

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            })

            return result

        } catch (error) {
            next(error)
        }
    }

    const filterAb = async (req, res, next) => {
        console.log('::=::-------------> GET ALL LHR PELANGGARAN FILTER AB <-------------::=::');
        const interval = req.query.interval;
        const result = await datarowLhrAb(req, next);
        let data = [];
        let total = 0;
        let totalBlue = 0;
        let totalTdkBlue = 0;

        if (result) {
            // var versiLhr = result.length > 0 ? result[0].versi_lhr : '2';
            var T_PICKUP = 0; 
            var T_TRUK_BOX_KECIL = 0;
            var T_TRUK_BOX_BESAR = 0;
            var T_TRUCK_STANDART_KECIL = 0;
            var T_TRUCK_STANDART_BESAR = 0;
            var T_TRUCK_TANGKI_KECIL = 0;
            var T_TRUCK_TANGKI_BESAR = 0;
            var T_TRUCK_DUMP_KECIL = 0;
            var T_TRUCK_DUMP_BESAR = 0;
            var T_TRUCK_TRAILER = 0;
            var T_TRUCK_MIXER = 0;
            var T_UNDEFINED = 0;
            for (let row of result) {
                var formatwaktu = row.waktu;
                var waktu_from = row.waktu_from;
                var waktu_to = row.waktu_to;
                if (interval == 4) {
                    formatwaktu = setMonth(Number(moment(row.waktu, 'MM-YYYY').format('MM')) - 1);
                }

                if (interval == 1 || interval == 2) {
                    if (Number(moment(waktu_to, 'HH:mm').format('HH')) == 0 && Number(moment(waktu_to, 'HH:mm').format('mm')) == 0) {
                        formatwaktu = `${waktu_from} - 23:59`;
                    }
                }

                T_PICKUP = T_PICKUP + parseInt(row.PICKUP);
                T_TRUK_BOX_KECIL = T_TRUK_BOX_KECIL + parseInt(row.TRUK_BOX_KECIL);
                T_TRUK_BOX_BESAR = T_TRUK_BOX_BESAR + parseInt(row.TRUK_BOX_BESAR);
                T_TRUCK_STANDART_KECIL = T_TRUCK_STANDART_KECIL + parseInt(row.TRUCK_STANDART_KECIL);
                T_TRUCK_STANDART_BESAR = T_TRUCK_STANDART_BESAR + parseInt(row.TRUCK_STANDART_BESAR);
                T_TRUCK_TANGKI_KECIL = T_TRUCK_TANGKI_KECIL + parseFloat(row.TRUCK_TANGKI_KECIL);
                T_TRUCK_TANGKI_BESAR = T_TRUCK_TANGKI_BESAR + parseInt(row.TRUCK_TANGKI_BESAR);
                T_TRUCK_DUMP_KECIL = T_TRUCK_DUMP_KECIL + parseInt(row.TRUCK_DUMP_KECIL);
                T_TRUCK_DUMP_BESAR = T_TRUCK_DUMP_BESAR + parseInt(row.TRUCK_DUMP_BESAR);
                T_TRUCK_TRAILER = T_TRUCK_TRAILER + parseInt(row.TRUCK_TRAILER);
                T_TRUCK_MIXER = T_TRUCK_MIXER + parseInt(row.TRUCK_MIXER);
                T_UNDEFINED = T_UNDEFINED + parseInt(row.UNDEFINED);
                const totalKend = parseInt(row.jml_blue) + parseInt(row.jml_tdk_blue);
                data.push({
                    interval: interval,
                    tanggal: row.tanggal,
                    waktu: formatwaktu,
                    lokasi_id: row.id,
                    nama_uppkb: row.nama_uppkb,
                    PICKUP: parseInt(row.PICKUP),
                    TRUK_BOX_KECIL: parseInt(row.TRUK_BOX_KECIL),
                    TRUK_BOX_BESAR: parseInt(row.TRUK_BOX_BESAR),
                    TRUCK_STANDART_KECIL: parseInt(row.TRUCK_STANDART_KECIL),
                    TRUCK_STANDART_BESAR: parseInt(row.TRUCK_STANDART_BESAR),
                    TRUCK_TANGKI_KECIL: parseFloat(row.TRUCK_TANGKI_KECIL),
                    TRUCK_TANGKI_BESAR: parseInt(row.TRUCK_TANGKI_BESAR),
                    TRUCK_DUMP_KECIL: parseInt(row.TRUCK_DUMP_KECIL),
                    TRUCK_DUMP_BESAR: parseInt(row.TRUCK_DUMP_BESAR),
                    TRUCK_TRAILER: parseInt(row.TRUCK_TRAILER),
                    TRUCK_MIXER: parseInt(row.TRUCK_MIXER),
                    UNDEFINED: parseInt(row.UNDEFINED),
                    jml_blue: row.jml_blue,
                    jml_tdk_blue: row.jml_tdk_blue,
                });

                total += parseInt(totalKend);
                totalBlue += parseInt(row.jml_blue);
                totalTdkBlue += parseInt(row.jml_tdk_blue);
            }


            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: data,
                meta: {
                    total: result.length,
                    T_PICKUP: parseInt(T_PICKUP),
                    T_TRUK_BOX_KECIL: parseInt(T_TRUK_BOX_KECIL),
                    T_TRUK_BOX_BESAR: parseInt(T_TRUK_BOX_BESAR),
                    T_TRUCK_STANDART_KECIL: parseInt(T_TRUCK_STANDART_KECIL),
                    T_TRUCK_STANDART_BESAR: parseInt(T_TRUCK_STANDART_BESAR),
                    T_TRUCK_TANGKI_KECIL: parseFloat(T_TRUCK_TANGKI_KECIL),
                    T_TRUCK_TANGKI_BESAR: parseInt(T_TRUCK_TANGKI_BESAR),
                    T_TRUCK_DUMP_KECIL: parseInt(T_TRUCK_DUMP_KECIL),
                    T_TRUCK_DUMP_BESAR: parseInt(T_TRUCK_DUMP_BESAR),
                    T_TRUCK_TRAILER: parseInt(T_TRUCK_TRAILER),
                    T_TRUCK_MIXER: parseInt(T_TRUCK_MIXER),
                    T_UNDEFINED: parseInt(T_UNDEFINED),
                    totakAllKend: total,
                    totalBlue: totalBlue,
                    totalTdkBlue: totalTdkBlue,
                }
            });
        }
    }

    const printLhrPelanggaranAb = async (req, res, next) => {
        const ispdf = req.query.ispdf;
        const lokasi_id = req.query.lokasi;
        const interval = req.query.interval;
        const tgl = req.query.tgl;
        const jam_awal = req.query.jam_awal;
        const jam_akhir = req.query.jam_akhir;
        const tanggal_awal = req.query.tanggal_awal;
        const tanggal_akhir = req.query.tanggal_akhir;
        const bulan_awal = req.query.bulan_awal;
        const bulan_akhir = req.query.bulan_akhir;
        const tahun_awal = req.query.tahun_awal;
        const tahun_akhir = req.query.tahun_akhir;
        const tahun = moment().format('YYYY');

        const result = await datarowLhrAb(req, next);
        if (result) {
            let lokasi = ''
            const kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            if (lokasi_id) {
                lokasi = await t_lokasi.findOne({
                    where: {
                        'id': lokasi_id,
                        'is_active': true,
                        'is_deleted': false
                    },
                    attributes: ['id', 'kode', 'nama']
                })
            }

            let datafilter = {
                interval: 'Per 15 Menit',
                tanggal: moment(tgl).format('DD-MM-YYYY'),
                jam_awal: moment(tgl + ' ' + jam_awal).format('HH:mm'),
                jam_akhir: moment(tgl + ' ' + jam_akhir).format('HH:mm'),
            }


            if (interval == 2) {
                datafilter = {
                    interval: 'Per 60 Menit',
                    tanggal: moment(tgl).format('DD-MM-YYYY'),
                    jam_awal: moment(tgl + ' ' + jam_awal).format('HH:mm'),
                    jam_akhir: moment(tgl + ' ' + jam_akhir).format('HH:mm'),
                }
            }

            if (interval == 3) {
                datafilter = {
                    interval: 'Per Hari',
                    jam_awal: moment(tanggal_awal, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                    jam_akhir: moment(tanggal_akhir, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                }
            }
            if (interval == 4) {
                datafilter = {
                    interval: 'Per Bulan',
                    jam_awal: moment(bulan_awal).locale('id').format('MMMM'),
                    jam_akhir: moment(bulan_akhir).locale('id').format('MMMM'),
                    // jam_awal: setMonth(Number(moment(bulan_awal + '-' + tahun, 'MM-YYYY').format('MM')) - 1),
                    // jam_akhir: setMonth(Number(moment(bulan_akhir + '-' + tahun, 'MM-YYYY').format('MM')) - 1),
                }
            }
            if (interval == 5) {
                datafilter = {
                    interval: 'Per Tahun',
                    jam_awal: moment(tahun_awal).format('YYYY'),
                    jam_akhir: moment(tahun_akhir).format('YYYY'),
                }
            }

            console.log('DATA FILTER: ', datafilter);

            const params = `lokasi_id=${lokasi_id}`;
            const dataqr = `${process.env.DOMAIN_URL_QR}/rep/lhrpelanggaranAb?src=${encrypt(params)}`;
            const qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();
            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("lhrPelanggaranAbView.ejs", {
                    data: result,
                    datafilter: datafilter,
                    interval: interval,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', 'lhrPelanggaranAbView.ejs'), {
                    data: result,
                    datafilter: datafilter,
                    interval: interval,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
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
                        if (lokasi_id) {

                            nama_file_uppkb = kode_uppkb;
                        }

                        const filename = `data_lhr_pelanggaran_ab_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
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

    const xlsLhrPelanggaranAb = async (req, res, next) => {
        const interval = req.query.interval;
        const result = await datarowLhrAb(req, next)

        if (result) {
            const nama_interval = interval == 1 ? 'Per 15 Menit' : interval == 2 ? 'Per 60 Menit' : interval == 3 ? 'Per Hari' : interval == 4 ? 'Per Bulan' : 'Per Tahun';
            let obj = [];
            for (let row of result) {
                var formatwaktu = row.waktu;
                var waktu_from = row.waktu_from;
                var waktu_to = row.waktu_to;
                if (interval == 4) {
                    formatwaktu = setMonth(Number(moment(row.waktu, 'MM-YYYY').format('MM')) - 1);
                }

                if (interval == 1 || interval == 2) {
                    if (Number(moment(waktu_to, 'HH:mm').format('HH')) == 0 && Number(moment(waktu_to, 'HH:mm').format('mm')) == 0) {
                        formatwaktu = `${waktu_from} - 23:59`;
                    }
                }
                
                obj.push({
                    nama_uppkb: row.nama_uppkb,
                    interval: nama_interval,
                    PICKUP: row.PICKUP,
                    TRUK_BOX_KECIL: row.TRUK_BOX_KECIL,
                    TRUK_BOX_BESAR: row.TRUK_BOX_BESAR,
                    TRUCK_STANDART_KECIL: row.TRUCK_STANDART_KECIL,
                    TRUCK_STANDART_BESAR: row.TRUCK_STANDART_BESAR,
                    TRUCK_TANGKI_KECIL: row.TRUCK_TANGKI_KECIL,
                    TRUCK_TANGKI_BESAR: row.TRUCK_TANGKI_BESAR,
                    TRUCK_DUMP_KECIL: row.TRUCK_DUMP_KECIL,
                    TRUCK_DUMP_BESAR: row.TRUCK_DUMP_BESAR,
                    TRUCK_TRAILER: row.TRUCK_TRAILER,
                    TRUCK_MIXER: row.TRUCK_MIXER,
                    UNDEFINED: row.UNDEFINED,
                    waktu: formatwaktu
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
                { header: 'Waktu', key: 'waktu', width: 20 },
                { header: 'Interval', key: 'interval', width: 20 },
                { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
                { header: 'PICKUP', key: 'PICKUP', width: 20 },
                { header: 'TRUK BOX KECIL', key: 'TRUK_BOX_KECIL', width: 20 },
                { header: 'TRUK BOX BESAR', key: 'TRUK_BOX_BESAR', width: 20 },
                { header: 'TRUCK STANDART KECIL', key: 'TRUCK_STANDART_KECIL', width: 20 },
                { header: 'TRUCK STANDART BESAR', key: 'TRUCK_STANDART_BESAR', width: 20 },
                { header: 'TRUCK TANGKI KECIL', key: 'TRUCK_TANGKI_KECIL', width: 20 },
                { header: 'TRUCK TANGKI BESAR', key: 'TRUCK_TANGKI_BESAR', width: 20 },
                { header: 'TRUCK DUMP KECIL', key: 'TRUCK_DUMP_KECIL', width: 20 },
                { header: 'TRUCK DUMP BESAR', key: 'TRUCK_DUMP_BESAR', width: 20 },
                { header: 'TRUCK TRAILER', key: 'TRUCK_TRAILER', width: 20 },
                { header: 'TRUCK MIXER', key: 'TRUCK_MIXER', width: 20 },
                { header: 'UNDEFINED', key: 'UNDEFINED', width: 20 },
            ]

            worksheet.addRows(obj);
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
            const filename = `lhr_pelanggaran_ab_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
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

    const getVrData = async (req, res, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const interval = req.query.interval;
            const tgl = req.query.tgl;
            const jam_awal = req.query.jam_awal;
            const jam_akhir = req.query.jam_akhir;
            const tanggal = req.query.tanggal;
            const bulan = req.query.bulan;
            const tahun = req.query.tahun;
            const limit = req.query.limit;
            const offset = req.query.offset;
            console.log('INTERVAL : ', interval);

            if (lokasi_id) {
                const kode_uppkb = await getLokasiUppkbKode(lokasi_id);
                console.log('KODE UPPKB : ', kode_uppkb);

                let sql = `SELECT 
                                jt_vr_data.*,
                                jt_gol_ai.desc_gol_ai,
                                jt_jenis_kendaraan.nama,
                                vr_pelanggaran.id AS id_pelanggaran
                            FROM jt_vr_data
                            LEFT JOIN vr_pelanggaran ON vr_pelanggaran.kd_pelanggaran = jt_vr_data.kd_pelanggaran
                            LEFT JOIN jt_gol_ai ON jt_gol_ai.id = jt_vr_data.id_gol_ai
                            LEFT JOIN jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            WHERE
                                jt_vr_data.kode_uppkb = '${kode_uppkb}' AND
                                jt_vr_data.tgl_capture::date = '${tgl}' AND
                                jt_vr_data.tgl_capture::time BETWEEN '${jam_awal}' AND '${jam_akhir}'`;

                if (interval == 3) {
                    sql = `SELECT 
                                jt_vr_data.*,
                                jt_gol_ai.desc_gol_ai,
                                jt_jenis_kendaraan.nama,
                                vr_pelanggaran.id AS id_pelanggaran
                            FROM jt_vr_data
                            LEFT JOIN vr_pelanggaran ON vr_pelanggaran.kd_pelanggaran = jt_vr_data.kd_pelanggaran
                            LEFT JOIN jt_gol_ai ON jt_gol_ai.id = jt_vr_data.id_gol_ai
                            LEFT JOIN jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            WHERE
                                jt_vr_data.kode_uppkb = '${kode_uppkb}' AND
                                jt_vr_data.tgl_capture::date = '${tanggal}'`;
                }

                if (interval == 4) {
                    sql = `SELECT 
                                jt_vr_data.*,
                                jt_gol_ai.desc_gol_ai,
                                jt_jenis_kendaraan.nama,
                                vr_pelanggaran.id AS id_pelanggaran
                            FROM jt_vr_data
                            LEFT JOIN vr_pelanggaran ON vr_pelanggaran.kd_pelanggaran = jt_vr_data.kd_pelanggaran
                            LEFT JOIN jt_gol_ai ON jt_gol_ai.id = jt_vr_data.id_gol_ai
                            LEFT JOIN jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            WHERE
                                jt_vr_data.kode_uppkb = '${kode_uppkb}' AND
                                EXTRACT(MONTH FROM jt_vr_data.tgl_capture) = ${bulan}`;
                }

                if (interval == 5) {
                    sql = `SELECT 
                                jt_vr_data.*,
                                jt_gol_ai.desc_gol_ai,
                                jt_jenis_kendaraan.nama,
                                vr_pelanggaran.id AS id_pelanggaran
                            FROM jt_vr_data
                            LEFT JOIN vr_pelanggaran ON vr_pelanggaran.kd_pelanggaran = jt_vr_data.kd_pelanggaran
                            LEFT JOIN jt_gol_ai ON jt_gol_ai.id = jt_vr_data.id_gol_ai
                            LEFT JOIN jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                            WHERE
                                jt_vr_data.kode_uppkb = '${kode_uppkb}' AND
                                EXTRACT(YEAR FROM jt_vr_data.tgl_capture) = ${tahun}`;
                }

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });

                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: result
                });
            }
        } catch (error) {
            next(error);
        }
    };

    return {
        // sinkronisasi,
        findAll,
        findOne,
        findAllActive,
        create,
        update,
        updateStatus,
        remove,
        removeArr,
        truncate,
        filter,
        xlsLhrPelanggaran,
        printLhrPelanggaran,
        filterAb,
        printLhrPelanggaranAb,
        xlsLhrPelanggaranAb,
        getVrData,
    };
}
module.exports = LhrPelanggaranController;