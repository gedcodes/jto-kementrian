const {
    t_penimbangan,
    t_kendaraan,
    t_log_wim,
    sequelize } = require('../models');
const {
    upsert_komoditi,
    upsert_pelanggaran,
    moveRowDocumentTemp,
    getKodeKota,
    checkMasaBerlaku,
    uploadImage,
    getIsNoKendaraan,
    getIsNoKendaraanWim,
    getIsNoKendaraanStatus,
    getIsExistsKodeTrxKendaraan,
    upsert_kendaraan, ltrim, rtrim
} = require('./lib/penimbangan');

const {
    loginUser,
    syncToPostServer,
    syncToPostServerWithImage,
    updateStatusSyncToPusat
} = require('./lib/sinkronisasi');

const { syncToPostPanBali } = require('./lib/integrasipanbali');

const { downloadImageToUrl } = require('./lib/cctvcapture');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const uploadFile = require('../middleware/upload');
const config = require('../../config/config');
const { padLeft, kelebihanBerat, prosenKelebihanBerat } = require('../lib/utilities')
const fs = require('fs');
const moment = require('moment');
// const { io } = require("socket.io-client");

const WimController = () => {

    const timer = ms => new Promise(res => setTimeout(res, ms))

    const countData = async (kode_uppkb, next) => {
        try {
            var sql = `SELECT count(*) as jml
                        FROM
                            jt_log_wim
                        LEFT JOIN jt_kendaraan ON jt_log_wim.no_kendaraan = jt_kendaraan.no_reg_kend
                        WHERE
                            jt_log_wim.kode_uppkb = '${kode_uppkb}' AND
                            DATE(jt_log_wim.tgl_penimbangan) = DATE(NOW())`;
            
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result.length > 0) {
                return result[0].jml;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    const countDataBlue = async (kode_uppkb, is_vms, next) => {
        try {
            var where = `WHERE
                            jt_log_wim.kode_uppkb = '${kode_uppkb}' AND
                            DATE(jt_log_wim.tgl_penimbangan) = DATE(NOW()) AND is_status = 2`;
            
            if (is_vms == 1) {
                where = `WHERE
                            jt_log_wim.kode_uppkb = '${kode_uppkb}' AND
                            DATE(jt_log_wim.tgl_penimbangan) = CURRENT_DATE AND 
                            jt_log_wim.tgl_penimbangan >= date_trunc('hour', CURRENT_TIMESTAMP)`;
            }

            var sql = `SELECT count(*) as jml
                        FROM
                            jt_log_wim

                            LEFT JOIN jt_kendaraan ON jt_log_wim.no_kendaraan = jt_kendaraan.no_reg_kend
                        ${where}`;
            
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result.length > 0) {
                return result[0].jml;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    const wimInfo = async (req, res, next) => {
        try {
            var kode_uppkb = req.query.kuppkb;
            var no_kendaraan = req.query.no_kendaraan;
            var page = req.query.page || 0;
            var size = req.query.paginate || 2;
            var orderBy = req.query.orderBy || 'jt_log_wim.tgl_penimbangan';
            var sortedBy = req.query.sortBy || 'DESC';

            var is_vms = req.query.is_vms || 0 ;

            var jml_data = await countData(kode_uppkb, next);
            var jml_data_blue = await countDataBlue(kode_uppkb, is_vms, next);

            var where =`WHERE 
                        jt_log_wim.kode_uppkb = '${kode_uppkb}' AND 
                        DATE(jt_log_wim.tgl_penimbangan) = DATE(NOW())`

            if (is_vms == 1) {
                where = `WHERE 
                            jt_log_wim.kode_uppkb = '${kode_uppkb}' AND 
                            jt_log_wim.tgl_penimbangan >= CURRENT_TIMESTAMP - INTERVAL '15 minutes'`;
            }
            
            if (no_kendaraan) {
                where =`WHERE 
                            jt_log_wim.kode_uppkb = '${kode_uppkb}' AND 
                            DATE(jt_log_wim.tgl_penimbangan) = DATE(NOW()) AND
                            jt_log_wim.no_kendaraan ILIKE '%${no_kendaraan}%'`
            }

            var sql = `SELECT 
                            jt_log_wim.*,
                            jt_kendaraan.no_uji,
                            jt_kendaraan.jbi,
                            jt_kendaraan.jbki,
                            jt_kendaraan.nama_pemilik,
                            jt_kendaraan.alamat_pemilik,
                            jt_kendaraan.konfigurasi_sumbu,
                            jt_kendaraan.masa_berlaku_uji,
                            jt_kendaraan.jenis_kend,
                            jt_kendaraan.panjang_utama,
                            jt_kendaraan.lebar_utama,
                            jt_kendaraan.tinggi_utama,
                            jt_kendaraan.julur_depan,
                            jt_kendaraan.julur_belakang 
                        FROM 
                            jt_log_wim 
                        LEFT JOIN jt_kendaraan ON jt_log_wim.no_kendaraan = jt_kendaraan.no_reg_kend
                        ${where}
                        ORDER BY ${orderBy} ${sortedBy} 
                        LIMIT ${size} OFFSET ${page};`;
            // console.log(sql);
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            // console.log(result);

            var arr = [];

            if (result.length > 0) {
                
                for (var i = 0; i <= result.length; i++) {
                    if (result[i]) {
                        var kelebihan_berat = 0;
                        var prosen_kelebihan_berat = 0;
                        var informasi = 'HATI-HATI';
                        var warna = '#65a30d';
                        
                        if (result[i].jbi) {
                            kelebihan_berat = await kelebihanBerat(result[i].wim_berat, result[i].jbi || 0);
                            prosen_kelebihan_berat = await prosenKelebihanBerat(result[i].wim_berat, result[i].jbi || 0);

                            if (kelebihan_berat > 0) {
                                informasi = `OVERLOAD ${prosen_kelebihan_berat.toFixed(2)}%`;
                                warna = '#dc2626';
                            }

                            if (result[i].masa_berlaku_uji) {
                                var onMasaBerlakuDate = moment(result[i].masa_berlaku_uji, 'YYYY-MM-DD', true).isValid() ? moment(result[i].masa_berlaku_uji).format('YYYY-MM-DD') : moment(result[i].masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD');

                                console.log('FORMAT MASA BERLAKU DATE : ', moment(result[i].masa_berlaku_uji, 'YYYY-MM-DD', true).isValid(), onMasaBerlakuDate);

                                var status_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate);
                                console.log('STATUS MASA BERLAKU : ', status_masa_berlaku);

                                if (kelebihan_berat > 0 && !status_masa_berlaku) {
                                    informasi = `MELANGGAR`;
                                    warna = '#ea580c';
                                } else {
                                    if (prosen_kelebihan_berat > 0) {
                                        informasi = `OVERLOAD (${prosen_kelebihan_berat.toFixed(2)}%)`;
                                    } else {
                                        informasi = `OVERLOAD`;
                                    }
                                    warna = '#dc2626';
                                }
                            }
                        }
                        // console.log(result[i].wim_kec)
                        if (result[i].wim_kecepatan > 0 && result[i].wim_kecepatan <= 60) {
                            var warna_kec = '#16a34a';
                        } else if (result[i].wim_kecepatan > 61 && result[i].wim_kecepatan <= 80) {
                            var warna_kec = '#e11d48';
                        } else {
                            var warna_kec = '#e11d48';
                        }

                        if (result[i].is_status == 2) {
                            
                        }

                        arr.push({
                            id: result[i].id,
                            device_id: result[i].device_id,
                            is_transaksi: result[i].is_transaksi,
                            is_status: result[i].is_status,
                            wim_kode: result[i].wim_kode,
                            wim_berat: result[i].wim_berat,
                            wim_panjang: result[i].wim_panjang,
                            wim_lebar: result[i].wim_lebar,
                            wim_tinggi: result[i].wim_tinggi,
                            wim_foh: result[i].wim_foh,
                            wim_roh: result[i].wim_roh,
                            wim_kecepatan: result[i].wim_kecepatan,
                            tgl_penimbangan: result[i].tgl_penimbangan,
                            kode_uppkb: result[i].kode_uppkb,
                            no_kendaraan: result[i].no_kendaraan,
                            no_uji: result[i].no_uji || '',
                            jenis_kend: result[i].jenis_kend || '',
                            foto_depan_name: result[i].foto_depan_name,
                            foto_depan_url: result[i].foto_depan_url,
                            foto_plat_no_name: result[i].foto_plat_no_name,
                            foto_plat_no_url: result[i].foto_plat_no_url,
                            sumbu: result[i].konfigurasi_sumbu || result[i].sumbu || '',
                            jbi: result[i].jbi || 0,
                            jbki: result[i].jbki || 0,
                            nama_pemilik: result[i].nama_pemilik || '',
                            alamat_pemilik: result[i].alamat_pemilik || '',
                            masa_berlaku_uji: result[i].masa_berlaku_uji || '',
                            panjang_utama: result[i].panjang_utama || 0,
                            lebar_utama: result[i].lebar_utama || 0,
                            tinggi_utama: result[i].tinggi_utama || 0,
                            julur_depan: result[i].julur_depan || 0,
                            julur_belakang: result[i].julur_belakang || 0,
                            kelebihan_berat: kelebihan_berat,
                            prosen_kelebihan_berat: prosen_kelebihan_berat > 0 ? prosen_kelebihan_berat.toFixed(2) : prosen_kelebihan_berat,
                            informasi: informasi,
                            warna: warna,
                            warna_kec: warna_kec,
                        });
                    }
                }

            }
            
            if (is_vms == 1) {
                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: arr,
                    meta: {
                        jmlData: result.length,
                        page: page,
                        size: size
                    }
                });
            } else {
                var jml_data = await countData(kode_uppkb, next);
                var jml_data_blue = await countDataBlue(kode_uppkb, next);
                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: arr,
                    meta: {
                        total: Number(jml_data),
                        total_blue: Number(jml_data_blue),
                        total_no_blue: Number(jml_data) - Number(jml_data_blue),
                        page: Number(page),
                        size: Number(size)
                    }
                });
            }
        } catch (error) {
            next(error);
        }

    }

    const createLogWim = async (req, res, next) => {
        console.log("--------------------::Processing Create Log WIM::--------------------");
        try {
            console.log(req.body);
            if (req.body.no_kendaraan != '') {

                let uploads = [];
                var dataFoto = {
                    foto_depan_name: '',
                    foto_depan_url: '',
                    foto_plat_no_name: '',
                    foto_plat_no_url: '',
                }

                if (process.env.IS_KEMENHUB == 0) {
                    if (req.files) {
                        var uploadFotoDepan = await uploadImage(req.body.no_kendaraan, 'wim', req.files.fotoDepan);
                        var uploadFotoPlatNo = await uploadImage(req.body.no_kendaraan, 'wim', req.files.fotoPlateNo);

                        dataFoto = {
                            foto_depan_name: uploadFotoDepan.imgName || '',
                            foto_depan_url: uploadFotoDepan.imgUrl || '',
                            foto_plat_no_name: uploadFotoPlatNo.imgName || '',
                            foto_plat_no_url: uploadFotoPlatNo.imgUrl || '',
                        }
                    }

                    Promise.all(uploads).then(async () => {
                        console.log('INSERT WITH IMAGE');
                        const field = {
                            kode_uppkb: req.body.kode_uppkb,
                            no_kendaraan: req.body.no_kendaraan.toUpperCase(),
                            tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                            is_transaksi: req.body.is_transaksi,
                            device_id: req.body.device_id,
                            sumbu: req.body.sumbu || '',
                            wim_kode: req.body.wim_kode,
                            wim_berat: Number(req.body.wim_berat) || 0,
                            wim_panjang: Number(req.body.wim_panjang) || 0,
                            wim_lebar: Number(req.body.wim_lebar) || 0,
                            wim_tinggi: Number(req.body.wim_tinggi) || 0,
                            wim_foh: Number(req.body.wim_foh) || 0,
                            wim_roh: Number(req.body.wim_roh) || 0,
                            wim_kecepatan: Number(req.body.wim_kec) || 0,
                            ...dataFoto,
                            axle_weight1: Number(req.body.axle_weight1) || 0,
                            axle_weight2: Number(req.body.axle_weight2) || 0,
                            axle_weight3: Number(req.body.axle_weight3) || 0,
                            axle_weight4: Number(req.body.axle_weight4) || 0,
                            axle_weight5: Number(req.body.axle_weight5) || 0,
                            axle_weight6: Number(req.body.axle_weight6) || 0,
                            axle_weight7: Number(req.body.axle_weight7) || 0,
                            axle_dis1: Number(req.body.axle_dis1) || 0,
                            axle_dis2: Number(req.body.axle_dis2) || 0,
                            axle_dis3: Number(req.body.axle_dis3) || 0,
                            axle_dis4: Number(req.body.axle_dis4) || 0,
                            axle_dis5: Number(req.body.axle_dis5) || 0,
                            axle_dis6: Number(req.body.axle_dis6) || 0,
                            axle_dis7: Number(req.body.axle_dis7) || 0,
                            jml_sumbu: Number(req.body.jml_sumbu) || 0,
                            ip_device: req.body.ip_device,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            is_status: 1,
                        }
                        // console.log(field)
                        return sequelize.transaction().then(function (t) {
                            return t_log_wim.create(field, { transaction: t, logging: false }).then(async (data) => {
                                try {
                                    t.commit();

                                    res.send({
                                        success: true,
                                        message: messageService().CREATE_SUCCESS,
                                        data: [{
                                            last_insert_id: data.id,
                                            fields: field
                                        }]
                                    });
                                } catch (error) {
                                    console.log(error)
                                    t.rollback().catch(() => { });
                                    res.send({
                                        success: false,
                                        message: messageService().CREATE_FAILED
                                    });
                                }
                            }).catch(function (err) {
                                console.log(err)
                                t.rollback().catch(() => { });
                                next(err)
                            });
                        });
                    }).catch((err) => {
                        console.log(err)
                        res.status(500).send({
                            success: false,
                            message: err
                        });
                    });
                }

                if (process.env.IS_KEMENHUB == 1) {

                    var is_no_kendaraan = await getIsNoKendaraanWim(req.body.no_kendaraan.toUpperCase(), moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss'));
                    console.log('IS NO KENDARAAN : ', is_no_kendaraan);
                    if (is_no_kendaraan) {

                        Promise.all(uploads).then(async () => {
                            console.log('INSERT LOG DATA WIM');
                            const field = {
                                kode_uppkb: req.body.kode_uppkb,
                                no_kendaraan: req.body.no_kendaraan.toUpperCase(),
                                tgl_penimbangan: moment(req.body.tgl_penimbangan).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                is_transaksi: req.body.is_transaksi,
                                device_id: req.body.device_id,
                                sumbu: req.body.sumbu || '',
                                wim_kode: req.body.wim_kode,
                                wim_berat: Number(req.body.wim_berat) || 0,
                                wim_panjang: Number(req.body.wim_panjang) || 0,
                                wim_lebar: Number(req.body.wim_lebar) || 0,
                                wim_tinggi: Number(req.body.wim_tinggi) || 0,
                                wim_foh: Number(req.body.wim_foh) || 0,
                                wim_roh: Number(req.body.wim_roh) || 0,
                                wim_kecepatan: Number(req.body.wim_kec) || 0,
                                foto_depan_name: req.body.foto_depan_name,
                                foto_depan_url: req.body.foto_depan_url,
                                foto_plat_no_name: req.body.foto_plat_no_name,
                                foto_plat_no_url: req.body.foto_plat_no_url,
                                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                                is_status: req.body.is_status || 1,
                            }
                            console.log(field)
                            return sequelize.transaction().then(function (t) {
                                return t_log_wim.create(field, { transaction: t, logging: false }).then(async (data) => {
                                    try {
                                        t.commit();

                                        res.send({
                                            success: true,
                                            message: messageService().CREATE_SUCCESS,
                                            data: [{
                                                last_insert_id: data.id,
                                                fields: field
                                            }]
                                        });
                                    } catch (error) {
                                        console.log(error)
                                        t.rollback().catch(() => { });
                                        res.send({
                                            success: false,
                                            message: messageService().CREATE_FAILED
                                        });
                                    }
                                }).catch(function (err) {
                                    console.log(err)
                                    t.rollback().catch(() => { });
                                    next(err)
                                });
                            });
                        }).catch((err) => {
                            console.log(err)
                            res.status(500).send({
                                success: false,
                                message: err
                            });
                        });
                    } else {
                        console.log('Data Kendaraan Sudah Tersedia');
                        res.send({
                            success: false,
                            message: 'Data Kendaraan Sudah Tersedia',
                        });
                    }
                }

            } else {
                // console.log(req.body);
                res.status(500).send({
                    success: false,
                    message: 'No Kendaraan Wajib Di Isi'
                });
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    const wimIntegrasiPU = async (req, res, next) => {
        try {
            var page = req.query.page || 0;
            var size = req.query.paginate || 10;
            var orderBy = req.query.orderBy || 'jt_log_wim.tgl_penimbangan';
            var sortedBy = req.query.sortBy || 'DESC';

            var tgl_from = req.query.tgl_from || moment(new Date()).format('YYYY-MM-DD');
            var tgl_to = req.query.tgl_to || moment(new Date()).format('YYYY-MM-DD');
            var tgl = req.body.tgl || moment(new Date()).format('YYYY-MM-DD');

            var where = ` WHERE tgl_penimbangan::DATE = '${tgl}'`;
            if (tgl_from && tgl_to) {
                where = ` WHERE jt_log_wim.tgl_penimbangan::DATE BETWEEN '${tgl_from}' AND '${tgl_to}'`
            }

            const sql = `SELECT 
                                jt_log_wim.tgl_penimbangan AS tanggal,
                                jt_lokasi_uppkb.kode AS kode_wim,
                                jt_lokasi_uppkb.nama AS nama_wim,
                                jt_lokasi_uppkb.lon_pos AS lokasi_lon,
                                jt_lokasi_uppkb.lat_pos AS lokasi_lat,
                                jt_ruas.kode AS no_ruas,
                                jt_ruas.nama AS nama_ruas,
                                jt_ruas.wim_last_calibrate AS wim_last_calibrate,
                                jt_log_wim.*,
                                jt_golongan_kendaraan.kode AS golongan_kendaraan_MDP,
                                jt_golongan_kendaraan.kode_kemenhub AS golongan_kendaraan_kemenhub
                            FROM jt_log_wim 
                                INNER JOIN jt_ruas ON jt_log_wim.kode_ruas = jt_ruas.kode
                                INNER JOIN jt_lokasi_uppkb ON jt_log_wim.kode_uppkb = jt_lokasi_uppkb.kode
                                LEFT JOIN jt_konfigurasi_sumbu ON jt_log_wim.sumbu = jt_konfigurasi_sumbu.kode AND jt_log_wim.jml_sumbu = jt_konfigurasi_sumbu.jumlah_sumbu
                                LEFT JOIN jt_golongan_kendaraan ON jt_konfigurasi_sumbu.golongan_kendaraan_id = jt_golongan_kendaraan."id" 
                            ${where}
                            ORDER BY ${orderBy} ${sortedBy}
                            LIMIT ${size} OFFSET ${page};`

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            const countSql = `SELECT COUNT(*) AS total
                                FROM jt_log_wim 
                                    INNER JOIN jt_ruas ON jt_log_wim.kode_ruas = jt_ruas.kode
                                    INNER JOIN jt_lokasi_uppkb ON jt_log_wim.kode_uppkb = jt_lokasi_uppkb.kode
                                    LEFT JOIN jt_konfigurasi_sumbu ON jt_log_wim.sumbu = jt_konfigurasi_sumbu.kode AND jt_log_wim.jml_sumbu = jt_konfigurasi_sumbu.jumlah_sumbu
                                    LEFT JOIN jt_golongan_kendaraan ON jt_konfigurasi_sumbu.golongan_kendaraan_id = jt_golongan_kendaraan."id"
                                ${where}`;

            const totalResult = await sequelize.query(countSql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            var arr = [];
            
            for (let i = 0; i < result.length; i++) {
                var data = {
                    "tanggal": result[i].tanggal ? moment(result[i].tanggal).format('YYYY-MM-DD HH:mm:ss') : null || null,
                    "kode_wim": result[i].kode_wim || null,
                    "nama_wim": result[i].nama_wim || null,
                    "lokasi_long": Number(result[i].lokasi_lon) || null,
                    "lokasi_lat": Number(result[i].lokasi_lat) || null,
                    "nomor_ruas": result[i].no_ruas || null,
                    "nama_ruas": result[i].nama_ruas || null,
                    "nomor_kendaraan": result[i].no_kendaraan || null,
                    "golongan_kendaraan_MDP": result[i].golongan_kendaraan_mdp || null,
                    "golongan_kendaraan_kemenhub": result[i].golongan_kendaraan_kemenhub || null,
                    "foto_depan": `${process.env.HOST_PUBLIC_STATIC_IP}/${process.env.PATH_IMAGE_DEPAN_PUBLIC_IP}/${result[i].foto_depan_name}` || null,
                    "foto_belakang": `${process.env.HOST_PUBLIC_STATIC_IP}/${process.env.PATH_IMAGE_BELAKANG_PUBLIC_IP}/${result[i].foto_depan_name}` || null,
                    "jumlah_sumbu": Number(result[i].jml_sumbu) || null,
                    "beban_total": Number(result[i].wim_berat) / 1000 || null,
                    "beban_izin": Number(result[i].batas_berat_kg) / 1000 || null,
                    "kend_panjang": Number(result[i].wim_panjang) / 1000 || null,
                    "kend_lebar": Number(result[i].wim_lebar) / 1000 || null,
                    "kend_tinggi": Number(result[i].wim_tinggi) / 1000 || null,
                    "kend_kecepatan": Number(result[i].wim_kecepatan) || null,
                    "axel_weight1": Number(result[i].axle_weight1) || null,
                    "axel_weight2": Number(result[i].axle_weight2) || null,
                    "axel_weight3": Number(result[i].axle_weight3) || null,
                    "axel_weight4": Number(result[i].axle_weight4) || null,
                    "axel_weight5": Number(result[i].axle_weight5) || null,
                    "axel_weight6": Number(result[i].axle_weight6) || null,
                    "axel_weight7": Number(result[i].axle_weight7) || null,
                    "axel_dist1": Number(result[i].axle_dis1) / 1000 || null,
                    "axel_dist2": Number(result[i].axle_dis2) / 1000 || null,
                    "axel_dist3": Number(result[i].axle_dis3) / 1000 || null,
                    "axel_dist4": Number(result[i].axle_dis4) / 1000 || null,
                    "axel_dist5": Number(result[i].axle_dis5) / 1000 || null,
                    "axel_dist6": Number(result[i].axle_dis6) / 1000 || null,
                    "last_calibration_date": result[i].wim_last_calibrate ? moment(result[i].wim_last_calibrate).format('YYYY-MM-DD') : null,
                    "foto_plat_nomor_kend": `${process.env.HOST_PUBLIC_STATIC_IP}/${process.env.PATH_IMAGE_DEPAN_PUBLIC_IP}/${result[i].foto_plat_no_name}` || null,
                    "axel_configuration": result[i].sumbu || null,
                };

                arr.push(data);
            }

            const totalData = Number(totalResult[0].total || 0);
            const maxPage = Math.ceil(totalData / size);


            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: arr,
                meta: {
                    total: Number(arr.length) || 0,
                    page: Number(page),
                    size: Number(size),
                    maxPage: Number(maxPage)
                }
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    return {
        wimInfo,
        createLogWim,
        wimIntegrasiPU
    };
}
module.exports = WimController;
