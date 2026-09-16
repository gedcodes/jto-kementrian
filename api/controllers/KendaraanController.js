const { t_kendaraan, t_dokumen, t_komoditi, t_kategori_komoditi, t_rfid_log, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const { ujiberkala, ujiberkalarfid, qrcodescan, checkjtoserver, checkjtoserverkend, upsert, checkjtoserverkendrfid } = require('./lib/integrasiblue');
const { getpanbali } = require('./lib/integrasipanbali');
const { removeFileKendaraan } = require('./lib/penimbangan');

const { syncToPostServer } = require('./lib/sinkronisasi');
const { getJenisKendaraanId, getSumbuId, getKepemilikanId, getKepemilikanVal, checkMasaBerlaku, getIdKomoditi, hex2a, findClosestSumbu } = require('./lib/dataid');
const uploadFile = require('../middleware/upload');
const config = require('../../config/config');
const fs = require('fs');
const moment = require('moment');
const path = require("path");
const WebSocket = require('ws');
var SYNC_RFID = process.env.SYNC_RFID;
var WS_URL = process.env.WS_URL;

const { resolve } = require('path');
const KendaraanController = () => {
    const countAll = async () => {
        return t_kendaraan.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            let name = req.query.search;

            let no_kendaraan = req.query.nokendaraan;
            let no_uji = req.query.nouji;

            let conditions = { is_deleted: false }
            let count = await countAll();

            if (no_kendaraan) {
                conditions = { no_reg_kend: no_kendaraan, is_deleted: false }
            }

            if (no_uji) {
                conditions = { no_uji: no_uji, is_deleted: false }
            }

            if (name) {
                conditions['no_reg_kend'] = { [Op.iLike]: `%${name}%` }
            }

            const options = {
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_kendaraan.paginate(options)

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

    const findUjiberkala = async (req, res, next) => {
        console.log("--------------------::Processing Find All UJI BERKALA PLAT NOMOR::--------------------");
        try {
            const nokend = req.query.nokend.toUpperCase();
            const nouji = req.query.nouji;
            var filter = 'plate_number';

            if (nokend) {
                if (process.env.IS_KEMENHUB == 1) {
                    console.log('UJI BERKALA - CHECK BLUE');
                    var datablue = await checkBlue(req, nokend, nouji);
                    if (datablue == 0) {
                        console.log('CHECK LOCAL DATABASE JTO SERVER');
                        const kendaraan = await checkLocal(nokend, nouji);
                        if (Object.keys(kendaraan).length > 0) {
                            console.log('DATA KENDARAAN FROM JTO SERVER PUSAT');
                            res.send({
                                success: true,
                                message: 'Req. Data Uji Berkala Berhasil',
                                dataFrom: 'JTO',
                                data: kendaraan,
                            });
                        } else {
                            console.log('DATA KENDARAAN BELUM TERDAFTAR DI BLUE');
                            res.send({
                                success: false,
                                message: 'Kendaraan Belum Terdaftar di BLUE',
                            });
                        }
                    } else {
                        console.log('DATA KENDARAAN FROM BLUE');
                        res.send({
                            success: true,
                            message: 'Req. Data Uji Berkala Berhasil',
                            dataFrom: 'BLUE',
                            data: datablue
                        })
                    }
                } else {
                    console.log('CEK LOKAL DATABASE');
                    const kendaraan = await checkLocal(nokend, nouji);
                    if (Object.keys(kendaraan).length > 0) {
                        var checkformatdate = moment(kendaraan.masa_berlaku_uji, 'DD-MMM-YYYY', true).isValid();
                        console.log('MASA BERLAKU DATE : ', checkformatdate, ' AND ', moment(kendaraan.masa_berlaku_uji).format('YYYY-MM-DD'));
                        var onMasaBerlakuDate = checkformatdate ? moment(kendaraan.masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD') : moment(kendaraan.masa_berlaku_uji).format('YYYY-MM-DD');
                        var is_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate);
                        if (is_masa_berlaku == false || kendaraan.jenis_kendaraan_id == '' || kendaraan.sumbu_id == '' || kendaraan.konfigurasi_sumbu == '0' || kendaraan.kepemilikan_id == '') {
                            console.log('CHECK JTO SERVER');
                            var dataserverjto = await checkServerPusatJTONoKend(nokend);
                            console.log('RESPONSE JTO SERVER : ', dataserverjto);
                            var datapanbali = {};
                            if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                                datapanbali = await checkPanBali(filter, nokend);
                            }

                            if (dataserverjto && dataserverjto.length > 0) {
                                console.log('DATA KENDARAAN FROM JTO SERVER PUSAT');
                                res.send({
                                    success: true,
                                    message: 'Req. Data Uji Berkala Berhasil',
                                    dataFrom: 'BLUE VIA JTO PUSAT',
                                    data: { ...dataserverjto[0], manifest: datapanbali }
                                })
                            } else {
                                console.log('DATA KENDARAAN FROM JTO LOKAL');
                                res.send({
                                    success: true,
                                    message: 'Req. Data Uji Berkala Berhasil',
                                    dataFrom: 'JTO LOKAL',
                                    data: { ...kendaraan, manifest: datapanbali }
                                })
                            }
                        } else {
                            var datapanbali = {};
                            if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                                datapanbali = await checkPanBali(filter, nokend);
                            }
                            res.send({
                                success: true,
                                message: 'Req. Data Uji Berkala Berhasil',
                                dataFrom: 'JTO LOKAL',
                                data: { ...kendaraan, manifest: datapanbali }
                            })
                        }
                    } else {
                        console.log('CEK TO SERVER JTO');
                        var dataserverjto = await checkServerPusatJTONoKend(nokend);
                        console.log('RESPONSE JTO SERVER : ', dataserverjto);
                        var datapanbali = {};
                        if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                            datapanbali = await checkPanBali(filter, nokend);
                        }

                        if (dataserverjto && dataserverjto.length > 0) {
                            console.log('DATA KENDARAAN FROM JTO SERVER PUSAT');
                            res.send({
                                success: true,
                                message: 'Req. Data Uji Berkala Berhasil',
                                dataFrom: 'BLUE VIA JTO PUSAT',
                                data: { ...dataserverjto[0], manifest: datapanbali }
                            })
                        } else {
                            console.log('DATA KENDARAAN BELUM TERDAFTAR DI BLUE');
                            res.send({
                                success: false,
                                message: 'Req. Data Uji Berkala Gagal. Periksa Server BLUE'
                            });
                        }
                    }
                }
            } else {
                res.send({
                    success: false,
                    message: 'No. Kendaraan Tidak Boleh Kosong'
                })
            }

        } catch (err) {
            console.log(err)
            next(err);
        }
    }

    const findRfid = async (req, res, next) => {
        console.log("--------------------::Processing Find All UJI BERKALA RFID::--------------------");
        try {
            const rfid = req.body.rfid;
            const rfid_ip = req.body.rfid_ip;
            console.log('RFID: ', rfid);
            console.log('RFID IP: ', rfid_ip);
            var filter = 'plate_number';

            if (rfid) {
                if (process.env.IS_KEMENHUB == 1) {
                    console.log('UJI BERKALA - CHECK BLUE');
                    var datablue = await checkBlueRfid(req, rfid);
                    if (datablue == 0) {
                        console.log('CHECK LOCAL DATABASE JTO SERVER');
                        const kendaraan = await checkLocalrfidPusat(rfid);
                        if (Object.keys(kendaraan).length > 0) {
                            console.log('DATA KENDARAAN FROM JTO SERVER PUSAT');
                            res.send({
                                success: true,
                                message: 'Req. Data Uji Berkala Berhasil',
                                dataFrom: 'JTO',
                                data: kendaraan,
                            });
                        } else {
                            console.log('DATA KENDARAAN BELUM TERDAFTAR DI BLUE');
                            res.send({
                                success: false,
                                message: 'Kendaraan Belum Terdaftar di BLUE',
                            });
                        }
                    } else {
                        console.log('DATA KENDARAAN FROM BLUE');
                        res.send({
                            success: true,
                            message: 'Req. Data Uji Berkala Berhasil',
                            dataFrom: 'BLUE',
                            data: datablue
                        })
                    }
                } else {
                    let urlWs = '';
                    if (!rfid_ip) {
                        res.send({
                            success: false,
                            message: 'RFID IP Tidak Boleh Kosong'
                        });
                        return;
                    }
                    var wsUrl = await getWsUrl(rfid_ip);
                    urlWs = wsUrl != 0 ? wsUrl : WS_URL;
                    console.log('URL WS : ', urlWs);
                    console.log('CEK LOKAL DATABASE');
                    const kendaraan = await checkLocalrfid(req, rfid, urlWs);
                    if (Object.keys(kendaraan).length > 0) {
                        var checkformatdate = moment(kendaraan.masa_berlaku_uji, 'DD-MMM-YYYY', true).isValid();
                        console.log('MASA BERLAKU DATE : ', checkformatdate, ' AND ', moment(kendaraan.masa_berlaku_uji).format('YYYY-MM-DD'));
                        var onMasaBerlakuDate = checkformatdate ? moment(kendaraan.masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD') : moment(kendaraan.masa_berlaku_uji).format('YYYY-MM-DD');
                        var is_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate);
                        if (is_masa_berlaku == false || kendaraan.jenis_kendaraan_id == '' || kendaraan.sumbu_id == '' || kendaraan.konfigurasi_sumbu == '0' || kendaraan.kepemilikan_id == '') {
                            const valueLog = {
                                rfid: kendaraan.rfid,
                                rfid_ip: rfid_ip,
                                no_kendaraan: kendaraan.no_reg_kend,
                                is_used: false,
                            }
                            await createLogRfid(valueLog);
                            console.log('CHECK JTO SERVER MASA BERLAKU');
                            var dataserverjto = await checkServerPusatJTORfid(rfid);
                            console.log('RESPONSE JTO SERVER : ', dataserverjto);
                            var datapanbali = {};
                            if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                                datapanbali = await checkPanBali(filter, kendaraan.no_reg_kend);
                            }

                            if (dataserverjto && dataserverjto.length > 0) {
                                console.log('DATA KENDARAAN FROM JTO SERVER PUSAT');
                                res.send({
                                    success: true,
                                    message: 'Req. Data Uji Berkala Berhasil',
                                    dataFrom: 'BLUE VIA JTO PUSAT',
                                    data: { ...dataserverjto[0], manifest: datapanbali }
                                })
                            } else {
                                console.log('DATA KENDARAAN FROM JTO LOKAL');
                                res.send({
                                    success: true,
                                    message: 'Req. Data Uji Berkala Berhasil',
                                    dataFrom: 'JTO',
                                    data: { ...kendaraan, manifest: datapanbali }
                                })
                            }
                        } else {
                            var datapanbali = {};
                            if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                                datapanbali = await checkPanBali(filter, kendaraan.no_reg_kend);
                            }
                            res.send({
                                success: true,
                                message: 'Req. Data Uji Berkala Berhasil',
                                dataFrom: 'JTO LOKAL',
                                data: { ...kendaraan, manifest: datapanbali }
                            })
                        }
                    } else {
                        console.log('CEK TO SERVER JTO');
                        var dataserverjto = await checkServerPusatJTORfid(rfid);
                        console.log('RESPONSE JTO SERVER : ', dataserverjto);
                        var datapanbali = {};

                        if (dataserverjto && dataserverjto.length > 0) {
                            if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                                datapanbali = await checkPanBali(filter, dataserverjto?.[0]?.no_reg_kend || '');
                            }
                            console.log('DATA KENDARAAN FROM JTO SERVER PUSAT');
                            const valueLog = {
                                rfid: dataserverjto[0].rfid,
                                rfid_ip: rfid_ip,
                                no_kendaraan: dataserverjto[0].no_reg_kend,
                                is_used: false,
                            }
                            await createLogRfid(valueLog);
                            sendws(dataserverjto[0], null, wsUrl);
                            res.send({
                                success: true,
                                message: 'Req. Data Uji Berkala Berhasil',
                                dataFrom: 'BLUE VIA JTO PUSAT',
                                data: { ...dataserverjto[0], manifest: datapanbali }
                            })
                        } else {
                            console.log('DATA KENDARAAN BELUM TERDAFTAR DI BLUE');
                            res.send({
                                success: false,
                                message: 'Req. Data Uji Berkala Gagal. Periksa Server BLUE'
                            });
                        }
                    }
                }
            } else {
                res.send({
                    success: false,
                    message: 'Kode RFID Tidak Boleh Kosong'
                })
            }
        } catch (err) {
            console.log(err)
            next(err);
        }
    }

    const findToServerJtoNoKend = async (nokend, res) => {
        var dataserverjto = await checkServerPusatJTONoKend(nokend);
        console.log(dataserverjto);
        // if(dataserverjto){
        //     res.send({
        //         success: false,
        //         message: 'Kendaraan Belum Terdaftar di BLUE',
        //         data: []
        //     })
        // }else{
        // console.log('DATA SERVER JTO : ', dataserverjto);
        if (dataserverjto) {
            res.send({
                success: true,
                message: 'Req. Data Uji Berkala Berhasil',
                dataFrom: 'BLUE VIA QR',
                data: dataserverjto[0]
            })
        } else {
            var data_local = await checkLocal(nokend, '');
            if (data_local) {
                res.send({
                    success: true,
                    message: 'Req. Data Uji Berkala Berhasil',
                    dataFrom: 'JTO LOCAL SERVER',
                    data: data_local
                });
            } else {
                res.send({
                    success: false,
                    message: 'Req. Data Uji Berkala Gagal. Periksa Server BLUE'
                });
            }
        }

        // }
    }

    const findQrcode = async (req, res, next) => {
        console.log("--------------------::Processing Find All SCAN QR CODE::--------------------");
        try {
            const key = req.query.qr;
            var nouji = '';
            var filter = 'plate_number';

            if (key) {
                if (process.env.IS_KEMENHUB == 1) {
                    var response = await checkQrScan(req, key);
                    var nokend = response;
                    if (typeof response == 'object' && Object.keys(response).length > 0) {
                        res.send({
                            success: true,
                            message: 'Req. Data Uji Berkala Berhasil',
                            dataFrom: 'JTO',
                            data: response
                        })
                    } else if (typeof response == 'string' && response !== '') {
                        console.log('CHECK DATA KE BLUE');
                        var datablue = await checkBlue(req, response, '');

                        if (datablue == 0) {
                            res.send({
                                success: false,
                                message: 'Kendaraan Belum Terdaftar di BLUE',
                                data: []
                            })
                        } else {
                            res.send({
                                success: true,
                                message: 'Req. Data Uji Berkala Berhasil',
                                dataFrom: 'BLUE',
                                data: datablue
                            })
                        }

                    } else {
                        res.send({
                            success: false,
                            message: 'Kendaraan Belum Terdaftar di BLUE',
                            data: []
                        })
                    }
                } else {
                    console.log('---------------check jto server via QR CODE----------------------')
                    var dataserverjto = await checkServerPusatJTOQR(key);
                    console.log('DATA SERVER JTO : ', dataserverjto);

                    var datapanbali = {};

                    if (dataserverjto && dataserverjto.length > 0) {
                        if (process.env.IS_INTEGRASI_PAN_BALI == 1) {
                            var nokend = dataserverjto[0].no_reg_kend;
                            datapanbali = await checkPanBali(filter, nokend);
                        }
                        res.send({
                            success: true,
                            message: 'Req. Data Uji Berkala Berhasil',
                            dataFrom: 'BLUE VIA JTO PUSAT',
                            data: [{ manifest: datapanbali }]
                        })
                    } else {
                        res.send({
                            success: false,
                            message: 'Req. Data Uji Berkala Gagal. Periksa Server BLUE'
                        });

                    }
                }
            } else {
                res.send({
                    success: false,
                    message: 'Key Tidak Boleh Kosong'
                })
            }

        } catch (err) {
            console.log(err)
            next(err);
            // res.send({
            //     success: false,
            //     message: err
            // })
        }
    }

    const checkLocal = async (nokend, nouji) => {
        var sql = `SELECT * FROM jt_kendaraan WHERE no_reg_kend = '${nokend}' AND is_deleted = false`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            return result[0];
        } else {
            return {};
        }
    }

    const checkLocalrfidPusat = async (rfid) => {
        var rfidAscii = hex2a(rfid);
        var sql = `SELECT * FROM jt_kendaraan WHERE rfid = '${rfidAscii}' AND is_deleted = false`;
        console.log('SQL RFID LOCAL: ', sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            return result[0];
        } else {
            return {};
        }
    }

    const checkLocalrfid = async (req, rfid, wsurl) => {
        var rfidAscii = hex2a(rfid);
        var sql = `SELECT * FROM jt_kendaraan WHERE rfid = '${rfidAscii}' AND is_deleted = false`;
        console.log('SQL RFID LOCAL: ', sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (Object.keys(result).length > 0) {
            var dataTimbang = await checkDataPenimbangan(result[0].no_reg_kend);
            if (dataTimbang != 0) {
                console.log('RESPONSE AND SEND WS FROM DATA TIMBANG');
                sendws(dataTimbang, dataTimbang.id, wsurl);
                return dataTimbang;
            } else {
                console.log('RESPONSE AND SEND WS FROM DATA KENDARAAN LOCAL');
                sendws(result[0], null, wsurl);
                return result[0];
            }
        } else {
            return {};
        }
    }

    const checkLogRfid = async (rfid) => {
        var rfidAscii = hex2a(rfid);
        var sql = `SELECT * FROM t_rfid_log WHERE rfid = '${rfidAscii}' AND is_used = false`;
        console.log('SQL RFID LOCAL: ', sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (Object.keys(result).length > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    const checkDataPenimbangan = async (no_kendaraan) => {
        var tgl_penimbangan = moment().format('YYYY-MM-DD HH:mm:ss');
        var jam = moment(tgl_penimbangan).format('HH');
        var sql = `SELECT * FROM jt_penimbangan WHERE no_kendaraan = '${no_kendaraan}' AND DATE(tgl_penimbangan) = '${tgl_penimbangan}'  AND EXTRACT(HOUR FROM tgl_penimbangan) = '${jam}'`;// AND is_transaksi = 0;`;// AND dokumen_id = ${arrdokumen[i]}`;
        // console.log(sql)
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        //var arrImg = [];
        if (result.length > 0) {
            var kepemilikan_id = await getKepemilikanId(result[0].nama_pemilik);
            var kepemilikan_val = await getKepemilikanVal(result[0].nama_pemilik);
            var data = {
                id: result[0].id,
                no_reg_kend: result[0].no_kendaraan,
                no_kendaraan: result[0].no_kendaraan,
                plt_no: result[0].no_kendaraan,
                no_uji: result[0].no_uji,
                nama_pemilik: result[0].nama_pemilik,
                alamat_pemilik: result[0].alamat_pemilik,
                masa_berlaku_uji: result[0].tgl_masa_berlaku,
                jenis_kend: result[0].jenis_kendaraan,
                konfigurasi_sumbu: result[0].sumbu,
                kepemilikan_id: kepemilikan_id,
                kepemilikan_val: kepemilikan_val,
                jbb: Number(result[0].jbb_uji),
                jbkb: Number(result[0].jbkb_uji),
                jbi: Number(result[0].jbi_uji),
                dokumen: "12,13,14,15",
                panjang_utama: Number(result[0].panjang_utama),
                lebar_utama: Number(result[0].lebar_utama),
                tinggi_utama: Number(result[0].tinggi_utama),
                julur_depan: Number(result[0].foh_utama),
                julur_belakang: Number(result[0].roh_utama),
                wim_berat: result[0].wim_berat,
                wim_panjang: result[0].wim_panjang,
                wim_lebar: result[0].wim_lebar,
                wim_tinggi: result[0].wim_tinggi,
                wim_foh: result[0].wim_foh,
                wim_roh: result[0].wim_roh,
                wim_kec: result[0].wim_kec,
                jenis_kendaraan_id: result[0].jenis_kendaraan_id,
                sumbu_id: result[0].sumbu_id,
            }
            console.log('DATA TIMBANG : ', data);
            return data;
        } else {
            return 0;
        }
    }

    const checkBlue = async (req, nokend, nouji) => {
        console.log('CHECK BLUE UJI BERKALA KENDARAAN WITH VALIDATION');
        var no_kendaraan = nokend ? nokend.replace(/[^a-z0-9]/gi, '').toUpperCase() : nokend;
        return await ujiberkala(no_kendaraan).then(async (data) => {
            // console.log('DATA KENDARAAN CHECK BLUE UJI BERKALA : ', data);
            if (data != null) {
                if (Object.keys(data).length > 0) { //data.no_uji
                    // console.log('DATA BLUE : ', data);
                    var checkformatdate = moment(data.masa_berlaku, 'DD-MMM-YYYY', true).isValid();
                    console.log('MASA BERLAKU DATE : ', checkformatdate, ' AND ', moment(data.masa_berlaku).format('YYYY-MM-DD'));
                    var onMasaBerlakuDate = checkformatdate ? moment(data.masa_berlaku, 'DD-MM-YYYY').format('YYYY-MM-DD') : moment(data.masa_berlaku).format('YYYY-MM-DD');
                    console.log(data.jenis_kendaraan)
                    var is_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate);
                    var jenis_kendaraan_id = await getJenisKendaraanId(data.jenis_kendaraan.toUpperCase());
                    let sumbu_id = await getSumbuId(data.sumbu);
                    let kepemilikan_id = await getKepemilikanId(data.nama_pemilik);
                    let kepemilikan_val = await getKepemilikanVal(data.nama_pemilik);
                    var mst = 0;
                    let konfig_sumbu = data.sumbu;

                    if (sumbu_id == 0) {
                        const sumbu_data = await findClosestSumbu(data.sumbu);
                        if (sumbu_data == 0) {
                            console.log('DATA SUMBU TIDAK SESUAI. Sumbu: ' + data.sumbu);
                            return 0;
                        }
                        sumbu_id = sumbu_data.sumbu_id;
                        konfig_sumbu = sumbu_data.sumbu;
                    }

                    if (jenis_kendaraan_id == 0 || kepemilikan_val == 'UNDEFINED') {
                        console.log('DATA KENDARAAN TIDAK SESUAI. Jenis Kendaraan: ' + data.jenis_kendaraan.toUpperCase() + ', Sumbu: ' + data.sumbu + ', Kepemilikan: ' + data.nama_pemilik);
                        return 0;
                    }
                    //if (is_masa_berlaku) {
                    // var upsert_data = await upsert(data.no_registrasi_kendaraan, data.no_uji_kendaraan, data.nama_pemilik, data.alamat_pemilik, data.unit_pelaksana_teknis, moment(data.date).format('YYYY-MM-DD'), moment(data.masa_berlaku).format('YYYY-MM-DD'), data.jenis_kendaraan, data.sumbu, data.berat_kosong, data.jbb, data.jbkb, data.jbi, data.jbki, data.panjang_kendaraan, data.lebar_kendaraan, data.tinggi_kendaraan, data.julur_depan, data.julur_belakang, '', '', '', data.no_rangka, data.merk, data.bahan_bakar, data.daya_angkut_orang, data.daya_angkut_kg, data.kelas_jalan, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id, is_masa_berlaku, true, '', '', '', '', '', req.token.id, jenis_kendaraan_id, sumbu_id, data.id, data.no_srut, moment(data.tgl_srut).format('YYYY-MM-DD HH:mm:ss'), data.no_mesin, data.tipe, Number(data.tahun_rakit), data.isi_silinder, Number(data.daya_motor), data.ukuran_ban, data.keterangan_hasil_uji, data.petugas_penguji, data.nrp_petugas_penguji, data.kepala_dinas, data.pangkat_kepala_dinas, data.nip_kepala_dinas, data.unit_pelaksana_teknis, data.direktur, data.pangkat_direktur, data.nip_direktur, moment(data.etl_date).format('YYYY-MM-DD HH:mm:ss'), data.jarak_sumbu_1_2, data.jarak_sumbu_2_3, data.jarak_sumbu_3_4, data.dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val);
                    var token_id = req.token != undefined ? req.token.id : null;
                    //var jenis_kend = data.jenis_kendaraan ? data.jenis_kendaraan.toUpperCase : '';
                    // console.log('DATA UJI BERKALA: ', data);
                    var dimensi_bak_tangki = data.panjang_bak_atau_tangki + 'x' + data.lebar_bak_atau_tangki + 'x' + data.tinggi_bak_atau_tangki;
                    var upsert_data = await upsert(
                        data.rfid || '', data.vcode || '', data.no_registrasi_kendaraan.replace(/[^a-z0-9]/gi, ''), data.nouji, data.nama_pemilik, data.alamat_pemilik,
                        data.unit_pelaksana_teknis, moment(data.date).format('YYYY-MM-DD'), moment(data.masa_berlaku).format('YYYY-MM-DD'),
                        data.jenis_kendaraan.toUpperCase(), konfig_sumbu, data.berat_kosong, data.jbb, data.jbkb, data.jbi, data.jbki, data.panjang_kendaraan,
                        data.lebar_kendaraan, data.tinggi_kendaraan, data.julur_depan, data.julur_belakang, '', '', '', data.no_rangka, data.merk,
                        data.bahan_bakar, data.daya_angkut_orang, data.daya_angkut_kg, data.kelas_jalan, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'),
                        token_id, is_masa_berlaku, true, '', '', '', '', '', token_id, jenis_kendaraan_id, sumbu_id, data.id, data.no_srut,
                        moment(data.tgl_srut).format('YYYY-MM-DD HH:mm:ss'), data.no_mesin, data.tipe, data.tahun_rakit, data.isi_silinder, data.daya_motor,
                        data.ukuran_ban || null, data.keterangan_hasil_uji, data.petugas_penguji, data.nrp_petugas_penguji, data.kepala_dinas, data.pangkat_kepala_dinas,
                        data.nip_kepala_dinas, data.unit_pelaksana_teknis, data.direktur, data.pangkat_direktur, data.nip_direktur, moment(data.etl_date).format('YYYY-MM-DD HH:mm:ss'),
                        data.jarak_sumbu_1_2 || data.jarak_sumbu1_2, data.jarak_sumbu_2_3 || data.jarak_sumbu2_3, data.jarak_sumbu_3_4 || data.jarak_sumbu3_4, dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val);
                    console.log('STATUS UPSERT : ', upsert_data.length);

                    if (upsert_data && upsert_data.length > 0) {
                        console.log('NO KEND : ', nokend, ' RESPON NO KEND : ', data.no_registrasi_kendaraan);
                        return upsert_data[0];
                    } else {
                        return data;
                    }
                    //}
                } else {
                    return 0;
                }
            } else {
                return 0;
            }

        }).catch(err => {
            console.log(err);
            return 0;
        });

    }

    const checkBlueRfid = async (req, rfid) => {
        console.log('CHECK BLUE UJI BERKALA KENDARAAN WITH VALIDATION BY RFID');
        var rfidAscii = hex2a(rfid);
        return await ujiberkalarfid(rfidAscii).then(async (data) => {
            // console.log(data);
            if (data != null) {
                if (Object.keys(data).length > 0) { //data.no_uji
                    // console.log('DATA BLUE : ', data);
                    var checkformatdate = moment(data.masa_berlaku, 'DD-MMM-YYYY', true).isValid();
                    console.log('MASA BERLAKU DATE : ', checkformatdate, ' AND ', moment(data.masa_berlaku).format('YYYY-MM-DD'));
                    var onMasaBerlakuDate = checkformatdate ? moment(data.masa_berlaku, 'DD-MM-YYYY').format('YYYY-MM-DD') : moment(data.masa_berlaku).format('YYYY-MM-DD');

                    var is_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate);
                    var jenis_kendaraan_id = await getJenisKendaraanId(data.jenis_kendaraan.toUpperCase());
                    var sumbu_id = await getSumbuId(data.sumbu);
                    let kepemilikan_id = await getKepemilikanId(data.nama_pemilik);
                    let kepemilikan_val = await getKepemilikanVal(data.nama_pemilik);
                    var mst = 0;

                    if (jenis_kendaraan_id == 0 || sumbu_id == 0 || kepemilikan_val == 'UNDEFINED') {
                        console.log('DATA KENDARAAN TIDAK SESUAI. Jenis Kendaraan: ' + data.jenis_kendaraan.toUpperCase() + ', Sumbu: ' + data.sumbu + ', Kepemilikan: ' + data.nama_pemilik);
                        return 0;
                    }
                    //if (is_masa_berlaku) {
                    // var upsert_data = await upsert(data.no_registrasi_kendaraan, data.no_uji_kendaraan, data.nama_pemilik, data.alamat_pemilik, data.unit_pelaksana_teknis, moment(data.date).format('YYYY-MM-DD'), moment(data.masa_berlaku).format('YYYY-MM-DD'), data.jenis_kendaraan, data.sumbu, data.berat_kosong, data.jbb, data.jbkb, data.jbi, data.jbki, data.panjang_kendaraan, data.lebar_kendaraan, data.tinggi_kendaraan, data.julur_depan, data.julur_belakang, '', '', '', data.no_rangka, data.merk, data.bahan_bakar, data.daya_angkut_orang, data.daya_angkut_kg, data.kelas_jalan, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id, is_masa_berlaku, true, '', '', '', '', '', req.token.id, jenis_kendaraan_id, sumbu_id, data.id, data.no_srut, moment(data.tgl_srut).format('YYYY-MM-DD HH:mm:ss'), data.no_mesin, data.tipe, Number(data.tahun_rakit), data.isi_silinder, Number(data.daya_motor), data.ukuran_ban, data.keterangan_hasil_uji, data.petugas_penguji, data.nrp_petugas_penguji, data.kepala_dinas, data.pangkat_kepala_dinas, data.nip_kepala_dinas, data.unit_pelaksana_teknis, data.direktur, data.pangkat_direktur, data.nip_direktur, moment(data.etl_date).format('YYYY-MM-DD HH:mm:ss'), data.jarak_sumbu_1_2, data.jarak_sumbu_2_3, data.jarak_sumbu_3_4, data.dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val);
                    var token_id = req.token != undefined ? req.token.id : null;
                    //var jenis_kend = data.jenis_kendaraan ? data.jenis_kendaraan.toUpperCase : '';
                    var dimensi_bak_tangki = data.panjang_bak_atau_tangki + 'x' + data.lebar_bak_atau_tangki + 'x' + data.tinggi_bak_atau_tangki;
                    var upsert_data = await upsert(
                        data.rfid || '', data.vcode || '', data.no_registrasi_kendaraan.replace(/[^a-z0-9]/gi, ''), data.nouji, data.nama_pemilik, data.alamat_pemilik,
                        data.unit_pelaksana_teknis, moment(data.tgl_uji).format('YYYY-MM-DD'), moment(data.masa_berlaku).format('YYYY-MM-DD'),
                        data.jenis_kendaraan.toUpperCase(), data.sumbu, data.berat_kosong, data.jbb, data.jbkb, data.jbi, data.jbki, data.panjang_kendaraan,
                        data.lebar_kendaraan, data.tinggi_kendaraan, data.julur_depan, data.julur_belakang, '', '', '', data.no_rangka, data.merk,
                        data.bahan_bakar, data.daya_angkut_orang, data.daya_angkut_kg, data.kelas_jalan, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'),
                        token_id, is_masa_berlaku, true, '', '', '', '', '', token_id, jenis_kendaraan_id, sumbu_id, data.id, data.no_srut,
                        moment(data.tgl_srut).format('YYYY-MM-DD HH:mm:ss'), data.no_mesin, data.tipe, data.tahun_rakit, data.isi_silinder, data.daya_motor,
                        data.ukuran_ban || null, data.keterangan_hasil_uji, data.petugas_penguji, data.nrp_petugas_penguji, data.kepala_dinas, data.pangkat_kepala_dinas,
                        data.nip_kepala_dinas, data.unit_pelaksana_teknis, data.direktur, data.pangkat_direktur, data.nip_direktur, moment(data.etl_date).format('YYYY-MM-DD HH:mm:ss'),
                        data.jarak_sumbu_1_2 || data.jarak_sumbu1_2, data.jarak_sumbu_2_3 || data.jarak_sumbu2_3, data.jarak_sumbu_3_4 || data.jarak_sumbu3_4, dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val);
                    console.log('STATUS UPSERT : ', upsert_data.length);

                    if (upsert_data && upsert_data.length > 0) {
                        console.log('RFID : ', rfid, ' RESPON NO KEND : ', data.no_registrasi_kendaraan);
                        return upsert_data[0];
                    } else {
                        return data;
                    }
                } else {
                    return 0;
                }
            } else {
                return 0;
            }

        }).catch(err => {
            console.log(err);
            return 0;
        });

    }

    const checkPanBali = async (filter, nokend) => {
        console.log('CHECK PAN BALI WITH NO KENDARAAN');
        if (!nokend || nokend === '') {
            console.log('NO KENDARAAN NULL');
            return 0;
        } else {
            console.log('NO KENDARAAN : ', nokend);
            return await getpanbali(filter, nokend.toUpperCase()).then(async (data) => {
                var res = data.data
                if (res != null) {
                    // console.log('DATA PAN BALI : ', res);
                    var asal_kode = res.manifest_detail[0].origin_kode_kabkot;
                    var tujuan_kode = res.manifest_detail[0].destination_kode_kabkot;

                    if (asal_kode == null || tujuan_kode == null) {
                        console.log('ORIGIN KODE DAN DESTINATION KODE NULL');
                        return 0;
                    } else {
                        var origin = [];
                        var destination = [];
                        var sql_asal = `SELECT nama FROM jt_kota_kab where kode='${asal_kode}'`;
                        const result_asal = await sequelize.query(sql_asal, {
                            type: QueryTypes.SELECT,
                            logging: false
                        });
                        console.log('ASAL : ', result_asal);
                        if (result_asal) {
                            result_asal.map((val) => {
                                origin.push({
                                    kode: asal_kode,
                                    nama: val.nama,
                                });
                            });
                        };

                        var sql_tujuan = `SELECT nama FROM jt_kota_kab where kode='${tujuan_kode}'`;
                        const result_tujuan = await sequelize.query(sql_tujuan, {
                            type: QueryTypes.SELECT,
                            logging: false
                        });
                        if (result_tujuan) {
                            result_tujuan.map((val) => {
                                destination.push({
                                    kode: tujuan_kode,
                                    nama: val.nama,
                                });
                            });
                        };

                        var komoditi = res.manifest_detail;

                        var komoditi_id = await getIdKomoditi(komoditi);

                        var obj = {
                            no_kendaraan: nokend.toUpperCase(),
                            number: res.number,
                            business_type: res.business_type,
                            organization_id: res.organization_id,
                            organization_name: res.organization_name,
                            organization_owner: res.organization_owner,
                            organization_phone: res.organization_phone,
                            organization_address: res.organization_address,
                            origin: origin.slice(-1)[0].nama,
                            origin_code: origin.slice(-1)[0].kode,
                            destination: destination.slice(-1)[0].nama,
                            destination_code: destination.slice(-1)[0].kode,
                            manifest_detail: komoditi_id
                        };
                        return obj;
                    }
                } else {
                    return 0;
                }

            }).catch(err => {
                return 0;
            });
        }

    }

    const checkServerPusatJTOQR = async (qr) => {
        var dataJtoServerQr = await checkjtoserver(qr);

        return dataJtoServerQr;
    }

    const checkServerPusatJTONoKend = async (nokend) => {
        var dataJtoServerNoKend = await checkjtoserverkend(nokend);

        return dataJtoServerNoKend;
    }

    const checkServerPusatJTORfidBk = async (rfid) => {
        var dataJtoServerRfid = await checkjtoserverkendrfid(rfid);
        if (dataJtoServerRfid) {
            if (dataJtoServerRfid.length > 0) {
                var dataTimbang = await checkDataPenimbangan(dataJtoServerRfid[0].no_reg_kend);
                if (dataTimbang != 0) {
                    console.log('RESPONSE FROM DATA TIMBANG');
                    return dataTimbang;
                } else {
                    console.log('DATA JTO SERVER RFID');
                    return dataJtoServerRfid[0];
                }
            } else {
                return dataJtoServerRfid[0];
            }
        } else {
            return dataJtoServerRfid[0];
        }
    }

    const checkServerPusatJTORfid = async (rfid) => {
        var dataJtoServerRfid = await checkjtoserverkendrfid(rfid);
        return dataJtoServerRfid;
    }

    const checkMasaBerlakuUpsert = async (nokend, data) => {
        var checkformatdate = moment(data.masa_berlaku, 'DD-MMM-YYYY', true).isValid();
        console.log('MASA BERLAKU DATE : ', checkformatdate, ' AND ', moment(data.masa_berlaku).format('YYYY-MM-DD'));
        var onMasaBerlakuDate = checkformatdate ? moment(data.masa_berlaku, 'DD-MM-YYYY').format('YYYY-MM-DD') : moment(data.masa_berlaku).format('YYYY-MM-DD');

        var is_masa_berlaku = await checkMasaBerlaku(onMasaBerlakuDate);
        var jenis_kendaraan_id = await getJenisKendaraanId(data.jenis_kendaraan);
        var sumbu_id = await getSumbuId(data.sumbu);
        let kepemilikan_id = await getKepemilikanId(data.nama_pemilik);
        let kepemilikan_val = await getKepemilikanVal(data.nama_pemilik);
        var mst = 0;
        if (is_masa_berlaku) {
            // var upsert_data = await upsert(data.no_registrasi_kendaraan, data.no_uji_kendaraan, data.nama_pemilik, data.alamat_pemilik, data.unit_pelaksana_teknis, moment(data.date).format('YYYY-MM-DD'), moment(data.masa_berlaku).format('YYYY-MM-DD'), data.jenis_kendaraan, data.sumbu, data.berat_kosong, data.jbb, data.jbkb, data.jbi, data.jbki, data.panjang_kendaraan, data.lebar_kendaraan, data.tinggi_kendaraan, data.julur_depan, data.julur_belakang, '', '', '', data.no_rangka, data.merk, data.bahan_bakar, data.daya_angkut_orang, data.daya_angkut_kg, data.kelas_jalan, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id, is_masa_berlaku, true, '', '', '', '', '', req.token.id, jenis_kendaraan_id, sumbu_id, data.id, data.no_srut, moment(data.tgl_srut).format('YYYY-MM-DD HH:mm:ss'), data.no_mesin, data.tipe, Number(data.tahun_rakit), data.isi_silinder, Number(data.daya_motor), data.ukuran_ban, data.keterangan_hasil_uji, data.petugas_penguji, data.nrp_petugas_penguji, data.kepala_dinas, data.pangkat_kepala_dinas, data.nip_kepala_dinas, data.unit_pelaksana_teknis, data.direktur, data.pangkat_direktur, data.nip_direktur, moment(data.etl_date).format('YYYY-MM-DD HH:mm:ss'), data.jarak_sumbu_1_2, data.jarak_sumbu_2_3, data.jarak_sumbu_3_4, data.dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val);
            var token_id = req.token != undefined ? req.token.id : null;
            var upsert_data = await upsert(
                data.rfid || '', data.vcode || '', data.no_registrasi_kendaraan, data.no_uji_kendaraan, data.nama_pemilik, data.alamat_pemilik,
                data.unit_pelaksana_teknis, moment(data.date).format('YYYY-MM-DD'), moment(data.masa_berlaku).format('YYYY-MM-DD'),
                data.jenis_kendaraan, data.sumbu, data.berat_kosong, data.jbb, data.jbkb, data.jbi, data.jbki, data.panjang_kendaraan,
                data.lebar_kendaraan, data.tinggi_kendaraan, data.julur_depan, data.julur_belakang, '', '', '', data.no_rangka, data.merk,
                data.bahan_bakar, data.daya_angkut_orang, data.daya_angkut_kg, data.kelas_jalan, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'),
                token_id, is_masa_berlaku, true, '', '', '', '', '', token_id, jenis_kendaraan_id, sumbu_id, data.id, data.no_srut,
                moment(data.tgl_srut).format('YYYY-MM-DD HH:mm:ss'), data.no_mesin, data.tipe, Number(data.tahun_rakit), data.isi_silinder, Number(data.daya_motor),
                data.ukuran_ban, data.keterangan_hasil_uji, data.petugas_penguji, data.nrp_petugas_penguji, data.kepala_dinas, data.pangkat_kepala_dinas,
                data.nip_kepala_dinas, data.unit_pelaksana_teknis, data.direktur, data.pangkat_direktur, data.nip_direktur, moment(data.etl_date).format('YYYY-MM-DD HH:mm:ss'),
                data.jarak_sumbu_1_2, data.jarak_sumbu_2_3, data.jarak_sumbu_3_4, data.dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val);
            console.log('STATUS UPSERT : ', upsert_data.length);

            if (upsert_data && upsert_data.length > 0) {
                console.log('NO KEND : ', nokend, ' RESPON NO KEND : ', data.no_registrasi_kendaraan);
                return 1;
            } else {
                return 0;
            }
        }

        return 1;
    }

    const checkQrScan = async (req, key) => {
        var response = await qrcodescan(key);

        return response;
    }

    const findOne = async (req, res, next) => {
        console.log("--------------------::Processing Find One::--------------------");
        try {
            const id = req.params.id;
            t_kendaraan.findByPk(id, {
                where: { is_deleted: false },
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
            let name = req.query.search;
            let no_kendaraan = req.query.nokendaraan;
            let no_uji = req.query.nouji;

            let conditions = { is_deleted: false, is_active: true }
            let count = await countAll();

            if (no_kendaraan) {
                conditions = { no_reg_kend: no_kendaraan, is_deleted: false, is_active: true }
            }

            if (no_uji) {
                conditions = { no_uji: no_uji, is_deleted: false, is_active: true }
            }

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }

            const options = {
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

            const { docs, pages, total } = await t_kendaraan.paginate(options)
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
            //console.log(moment(req.body.tgl_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'));

            //await uploadFile(req, res);
            let is_masa_berlaku = await checkMasaBerlaku(moment(req.body.masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'));
            let jenis_kendaraan_id = await getJenisKendaraanId(req.body.jenis_kend);
            let sumbu_id = await getSumbuId(req.body.konfigurasi_sumbu);
            let kepemilikan_id = await getKepemilikanId(req.body.nama_pemilik);
            let kepemilikan_val = await getKepemilikanVal(req.body.nama_pemilik);
            if (req.files) {
                if (!req.files || Object.keys(req.files).length === 0) {
                    //return res.status(400).send('File Kosong. Silahkan Unggah Gambar');
                    return res.status(400).send({
                        success: false,
                        message: 'File Kosong. Silahkan Unggah Gambar',
                    });
                }

                if (Object.keys(req.files).length < 4) {
                    return res.status(400).send({
                        success: false,
                        message: 'Lengkapi Foto Depan, Belakang, Kiri, dan Kanan',
                    });
                    //res.status(400).send('Lengkapi Foto Depan, Belakang, Kiri, dan Kanan');
                }

                var imgArr = [];
                var imgArrUrl = [];
                const uploads = Object.values(req.files).map((file) => {
                    //console.log(config.path_upload+'/'+file.name)
                    if (file.size > 1 * 1024 * 1024) {
                        console.log(`Size File Max. 1 Mb. File ${file.name} Melebihi Ukuran`);
                    }

                    const extensionName = path.extname(file.name); // fetch the file extension
                    const allowedExtension = ['.png', '.jpg', '.jpeg'];

                    if (!allowedExtension.includes(extensionName)) {
                        return res.status(422).send({
                            success: false,
                            message: "Format File Yang Di Izinkan [*.png, *.jpg, *.jpeg]",
                        });
                    }

                    var file_name = req.body.no_reg_kend + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + file.name;
                    const uploadPath = path.join(config.path_upload) + '/kendaraan/' + file_name;////config.path_upload+'/'+file_name;
                    const imageUrl = `${config.image_url}kendaraan/${file_name}`;

                    imgArr.push(file_name);
                    imgArrUrl.push(imageUrl);

                    return file.mv(uploadPath);
                });
                //console.log(imgArr)

                Promise.all(uploads).then(
                    () => {
                        //res.send('Files uploaded to ' + config.path_upload)
                        const field = {
                            no_reg_kend: req.body.no_reg_kend,
                            no_uji: req.body.no_uji,
                            nama_pemilik: req.body.nama_pemilik,
                            alamat_pemilik: req.body.alamat_pemilik,
                            lokasi_uji: req.body.lokasi_uji,
                            tanggal_uji: moment(req.body.tgl_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                            masa_berlaku_uji: moment(req.body.masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                            jenis_kend: req.body.jenis_kend,
                            konfigurasi_sumbu: req.body.konfigurasi_sumbu,
                            jenis_kendaraan_id: jenis_kendaraan_id,
                            sumbu_id: sumbu_id,
                            kepemilikan_id: kepemilikan_id,
                            kepemilikan_val: kepemilikan_val,
                            berat_kosong: req.body.berat_kosong,
                            jbb: req.body.jbb,
                            jbkb: req.body.jbkb,
                            jbi: req.body.jbi,
                            jbki: req.body.jbki,
                            panjang_utama: req.body.panjang_utama,
                            lebar_utama: req.body.lebar_utama,
                            tinggi_utama: req.body.tinggi_utama,
                            julur_depan: req.body.julur_depan,
                            julur_belakang: req.body.julur_belakang,
                            is_masa_berlaku: is_masa_berlaku,
                            foto_depan: imgArr[0] || '',
                            foto_kanan: imgArr[1] || '',
                            foto_kiri: imgArr[2] || '',
                            foto_belakang: imgArr[3] || '',
                            nomor_rangka: req.body.nomor_rangka,
                            merek: req.body.merek,
                            bahan_bakar: req.body.bahan_bakar,
                            daya_angkut_orang: req.body.daya_angkut_orang,
                            daya_angkut_barang: req.body.daya_angkut_barang,
                            kelas: req.body.kelas,
                            foto_depan_url: imgArrUrl[0] || '',
                            foto_belakang_url: imgArrUrl[1] || '',
                            foto_kanan_url: imgArrUrl[2] || '',
                            foto_kiri_url: imgArrUrl[3] || '',
                            is_active: req.body.iact ? req.body.iact : false,
                            created_by: req.token.id,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        }

                        return sequelize.transaction().then(function (t) {
                            return t_kendaraan.create(field, { transaction: t }).then(async (data) => {
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
                ).catch(err => res.status(500).send({
                    success: false,
                    message: err
                }));
            } else {
                const field = {
                    no_reg_kend: req.body.no_reg_kend,
                    no_uji: req.body.no_uji,
                    nama_pemilik: req.body.nama_pemilik,
                    alamat_pemilik: req.body.alamat_pemilik,
                    lokasi_uji: req.body.lokasi_uji,
                    tanggal_uji: moment(req.body.tgl_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    masa_berlaku_uji: moment(req.body.masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    jenis_kend: req.body.jenis_kend,
                    konfigurasi_sumbu: req.body.konfigurasi_sumbu,
                    jenis_kendaraan_id: jenis_kendaraan_id,
                    sumbu_id: sumbu_id,
                    kepemilikan_id: kepemilikan_id,
                    kepemilikan_val: kepemilikan_val,
                    berat_kosong: req.body.berat_kosong,
                    jbb: req.body.jbb,
                    jbkb: req.body.jbkb,
                    jbi: req.body.jbi,
                    jbki: req.body.jbki,
                    panjang_utama: req.body.panjang_utama,
                    lebar_utama: req.body.lebar_utama,
                    tinggi_utama: req.body.tinggi_utama,
                    julur_depan: req.body.julur_depan,
                    julur_belakang: req.body.julur_belakang,
                    is_masa_berlaku: is_masa_berlaku,
                    foto_depan: '',
                    foto_kanan: '',
                    foto_kiri: '',
                    foto_belakang: '',
                    nomor_rangka: req.body.nomor_rangka,
                    merek: req.body.merek,
                    bahan_bakar: req.body.bahan_bakar,
                    daya_angkut_orang: req.body.daya_angkut_orang,
                    daya_angkut_barang: req.body.daya_angkut_barang,
                    kelas: req.body.kelas,
                    foto_depan_url: '',
                    foto_belakang_url: '',
                    foto_kanan_url: '',
                    foto_kiri_url: '',
                    is_active: req.body.iact ? req.body.iact : false,
                    created_by: req.token.id,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }

                return sequelize.transaction().then(function (t) {
                    return t_kendaraan.create(field, { transaction: t }).then(async (data) => {
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

        } catch (error) {
            console.log(error)
            next(error)
        }
    }


    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update Kendaraan::--------------------");

        try {
            const id = req.params.id;

            if (id) {
                let is_masa_berlaku = await checkMasaBerlaku(moment(req.body.masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'));
                let jenis_kendaraan_id = await getJenisKendaraanId(req.body.jenis_kend);
                let sumbu_id = await getSumbuId(req.body.konfigurasi_sumbu);
                let kepemilikan_id = await getKepemilikanId(req.body.nama_pemilik);
                let kepemilikan_val = await getKepemilikanVal(req.body.nama_pemilik);

                if (req.files) {
                    if (!req.files || Object.keys(req.files).length === 0) {
                        //return res.status(400).send('File Kosong. Silahkan Unggah Gambar');
                        return res.status(400).send({
                            success: false,
                            message: 'File Kosong. Silahkan Unggah Gambar',
                        });
                    }

                    if (Object.keys(req.files).length < 4) {
                        return res.status(400).send({
                            success: false,
                            message: 'Lengkapi Foto Depan, Belakang, Kiri, dan Kanan',
                        });
                        //res.status(400).send('Lengkapi Foto Depan, Belakang, Kiri, dan Kanan');
                    }

                    var imgArr = [];
                    var imgArrUrl = [];
                    const uploads = Object.values(req.files).map((file) => {
                        //console.log(config.path_upload+'/'+file.name)
                        if (file.size > 1 * 1024 * 1024) {
                            console.log(`Size File Max. 1 Mb. File ${file.name} Melebihi Ukuran`);
                        }

                        const extensionName = path.extname(file.name); // fetch the file extension
                        const allowedExtension = ['.png', '.jpg', '.jpeg'];

                        if (!allowedExtension.includes(extensionName)) {
                            return res.status(422).send({
                                success: false,
                                message: "Format File Yang Di Izinkan [*.png, *.jpg, *.jpeg]",
                            });
                        }

                        var file_name = req.body.no_reg_kend + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + file.name;
                        const uploadPath = path.join(config.path_upload) + '/kendaraan/' + file_name;////config.path_upload+'/'+file_name;
                        const imageUrl = `${config.image_url}kendaraan/${file_name}`;

                        imgArr.push(file_name);
                        imgArrUrl.push(imageUrl);

                        return file.mv(uploadPath);
                    });

                    Promise.all(uploads).then(
                        async () => {
                            await removeFileKendaraan(id);
                            return sequelize.transaction().then(function (t) {
                                return t_kendaraan.update({
                                    no_reg_kend: req.body.no_reg_kend,
                                    no_uji: req.body.no_uji,
                                    nama_pemilik: req.body.nama_pemilik,
                                    alamat_pemilik: req.body.alamat_pemilik,
                                    lokasi_uji: req.body.lokasi_uji,
                                    tanggal_uji: moment(req.body.tgl_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                    masa_berlaku_uji: moment(req.body.masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                    jenis_kend: req.body.jenis_kend,
                                    konfigurasi_sumbu: req.body.konfigurasi_sumbu,
                                    jenis_kendaraan_id: jenis_kendaraan_id,
                                    sumbu_id: sumbu_id,
                                    kepemilikan_id: kepemilikan_id,
                                    kepemilikan_val: kepemilikan_val,
                                    berat_kosong: req.body.berat_kosong,
                                    jbb: req.body.jbb,
                                    jbkb: req.body.jbkb,
                                    jbi: req.body.jbi,
                                    jbki: req.body.jbki,
                                    panjang_utama: req.body.panjang_utama,
                                    lebar_utama: req.body.lebar_utama,
                                    tinggi_utama: req.body.tinggi_utama,
                                    julur_depan: req.body.julur_depan,
                                    julur_belakang: req.body.julur_belakang,
                                    is_masa_berlaku: is_masa_berlaku,
                                    foto_depan: imgArr[0] || '',
                                    foto_kanan: imgArr[1] || '',
                                    foto_kiri: imgArr[2] || '',
                                    foto_belakang: imgArr[3] || '',
                                    nomor_rangka: req.body.nomor_rangka,
                                    merek: req.body.merek,
                                    bahan_bakar: req.body.bahan_bakar,
                                    daya_angkut_orang: req.body.daya_angkut_orang,
                                    daya_angkut_barang: req.body.daya_angkut_barang,
                                    kelas: req.body.kelas,
                                    foto_depan_url: imgArrUrl[0] || '',
                                    foto_belakang_url: imgArrUrl[1] || '',
                                    foto_kanan_url: imgArrUrl[2] || '',
                                    foto_kiri_url: imgArrUrl[3] || '',
                                    is_active: req.body.iact ? req.body.iact : false,
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
                        }).catch(err => res.status(500).send({
                            success: false,
                            message: err
                        }));
                } else {
                    return sequelize.transaction().then(function (t) {
                        return t_kendaraan.update({
                            no_reg_kend: req.body.no_reg_kend,
                            no_uji: req.body.no_uji,
                            nama_pemilik: req.body.nama_pemilik,
                            alamat_pemilik: req.body.alamat_pemilik,
                            lokasi_uji: req.body.lokasi_uji,
                            tanggal_uji: moment(req.body.tgl_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                            masa_berlaku_uji: moment(req.body.masa_berlaku_uji, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                            jenis_kend: req.body.jenis_kend,
                            konfigurasi_sumbu: req.body.konfigurasi_sumbu,
                            jenis_kendaraan_id: jenis_kendaraan_id,
                            sumbu_id: sumbu_id,
                            kepemilikan_id: kepemilikan_id,
                            kepemilikan_val: kepemilikan_val,
                            berat_kosong: req.body.berat_kosong,
                            jbb: req.body.jbb,
                            jbkb: req.body.jbkb,
                            jbi: req.body.jbi,
                            jbki: req.body.jbki,
                            panjang_utama: req.body.panjang_utama,
                            lebar_utama: req.body.lebar_utama,
                            tinggi_utama: req.body.tinggi_utama,
                            julur_depan: req.body.julur_depan,
                            julur_belakang: req.body.julur_belakang,
                            is_masa_berlaku: is_masa_berlaku,
                            // foto_depan: '',
                            // foto_kanan: '',
                            // foto_kiri: '',
                            // foto_belakang: '',
                            nomor_rangka: req.body.nomor_rangka,
                            merek: req.body.merek,
                            bahan_bakar: req.body.bahan_bakar,
                            daya_angkut_orang: req.body.daya_angkut_orang,
                            daya_angkut_barang: req.body.daya_angkut_barang,
                            kelas: req.body.kelas,
                            // foto_depan_url: '',
                            // foto_belakang_url: '',
                            // foto_kanan_url: '',
                            // foto_kiri_url: '',
                            is_active: req.body.iact ? req.body.iact : false,
                            is_active: req.body.iact ? req.body.iact : false,
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

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_kendaraan.update(
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
            t_kendaraan.destroy({
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
            t_kendaraan.destroy({
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
            t_kendaraan.update(
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

            t_kendaraan.update(
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
            t_kendaraan.destroy(
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

    const getDokumenKendaraan = async (is_masa_berlaku) => {
        const results = await t_dokumen.findAll({
            where: { is_active: true, is_deleted: false },
            order: [
                ['id', 'ASC'],
            ],
            logging: false
        });

        // var obj = [{
        //     id: results[0].id,
        //     kode: results[0].kode,
        //     nama: results[0].nama,
        //     is_optional: results[0].is_optional,
        //     status: is_masa_berlaku,
        // }];

        // console.log(results.join(','));
        var arrdokumen = [];// results.join(','); // ? dokumen.split(',') : [];
        for (var i = 0; i < results.length; i++) {
            arrdokumen.push(results[i].id);
        }
        // console.log('ARR DOKUMEN: ', arrdokumen);
        if (arrdokumen.length > 0) {
            arrdokumen.sort((a, b) => {
                return a - b;
            })
        }

        var obj = [];
        for (var i = 0; i < Object.keys(results).length; i++) {
            var status = true;
            // console.log(results[i].id, ' == ', Number(arrdokumen[i]));
            var found = arrdokumen.find(element => element == results[i].id);

            if (results[i].id == Number(found)) {

                if (results[i].kode == 'BLUE' || results[i].id == 12) {
                    obj.push({
                        id: results[i].id,
                        kode: results[i].kode,
                        nama: results[i].nama,
                        is_optional: results[i].is_optional,
                        status: is_masa_berlaku,
                    });
                } else {
                    obj.push({
                        id: results[i].id,
                        kode: results[i].kode,
                        nama: results[i].nama,
                        is_optional: results[i].is_optional,
                        status: true,
                    });
                }
            } else {
                // console.log('dok id : ', row.id);
                obj.push({
                    id: results[i].id,
                    kode: results[i].kode,
                    nama: results[i].nama,
                    is_optional: results[i].is_optional,
                    status: false,
                });
            }

        }
        return obj;
    }

    const createLogRfid = async (value) => {
        console.log("--------------------::Processing Create Log RFID::--------------------");
        try {
            const valueLog = {
                rfid: value.rfid,
                rfid_ip: value.rfid_ip,
                no_kendaraan: value.no_kendaraan,
                is_used: false,
            }
            return sequelize.transaction().then(function (t) {
                return t_rfid_log.create(valueLog, { transaction: t }).then(async (data) => {
                    t.commit();
                    return 1;
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    return 0;
                });
            });
        } catch (error) {
            console.log(error)
            return 0;
        }
    }

    const getWsUrl = async (rfid_ip) => {
        try {
            var sql = `SELECT * FROM jt_timbangan WHERE ip_rfid = '${rfid_ip}' AND is_active = true AND is_deleted = false ORDER BY id DESC LIMIT 1`;
            // console.log(sql)
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (Object.keys(result).length > 0) {
                return result[0].ws_url;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(error)
            return 0;
        }
    }

    const sendws = async (msg, id = null, wsurl) => {
        console.log('----------------------------SEND TO WEB SOCKET----------------------------');
        // console.log('SYNC RFID: ', typeof process.env.SYNC_RFID, ' IS KEMENHUB: ', typeof process.env.IS_KEMENHUB);
        if (process.env.IS_KEMENHUB == '0' && process.env.SYNC_RFID == 'true') {
            // console.log('MSG SEND WEBSOCKET: ', msg);
            // if (process.env.SYNC_RFID) {
            // console.log('SYNC RFID: ', SYNC_RFID, process.env.IS_KEMENHUB, WS_URL);
            
            const ws = new WebSocket(wsurl);

            ws.on('error', console.error);

            ws.on('open', async function open() {
                // console.log('MSG DATA WEB SOCKET: ', msg);

                if (msg) {
                    var dok = '12,13,14,15';

                    if (!msg.is_masa_berlaku) {
                        dok = '13,14,15';
                    }

                    var data = {
                        'socketFrom': 'jtoapi',
                        'plt_no': msg.no_reg_kend,
                        'no_kendaraan': msg.no_reg_kend,
                        'no_reg_kend': msg.no_reg_kend,
                        'no_uji': msg.no_uji,
                        'jbi': msg.jbi,
                        'jbi_uji': msg.jbi,
                        'jenis_kend': msg.jenis_kend,
                        'jenis_kendaraan_id': msg.jenis_kendaraan_id,
                        'sumbu_id': msg.sumbu_id,
                        'sumbu': msg.konfigurasi_sumbu,
                        'dokumen': await getDokumenKendaraan(msg.is_masa_berlaku),
                        'julur_belakang': msg.julur_belakang,
                        'julur_depan': msg.julur_depan,
                        'jbb': msg.jbb,
                        'jbkb': msg.jbkb,
                        'jbki': msg.jbki,
                        'mst': msg.mst,
                        'is_masa_berlaku': msg.is_masa_berlaku,
                        'masa_berlaku_uji': msg.masa_berlaku_uji,
                        'nama_pemilik': msg.nama_pemilik,
                        'alamat_pemilik': msg.alamat_pemilik,
                        'kategoriKepimilikan': {
                            value: msg.kepemilikan_id,
                            label: msg.kepemilikan_val == 'PERORANGAN' ? 'PERSEORANGAN' : msg.kepemilikan_val,
                        },
                        'kepemilikan_id': msg.kepemilikan_id,
                        'kepemilikan_val': msg.kepemilikan_val == 'PERORANGAN' ? 'PERSEORANGAN' : msg.kepemilikan_val,
                        'berat_kosong': msg.berat_kosong,
                        'jarak_sumbu_1_2': msg.jarak_sumbu_1_2,
                        'jarak_sumbu_2_3': msg.jarak_sumbu_2_3,
                        'jarak_sumbu_3_4': msg.jarak_sumbu_3_4,
                        'konfigurasi_sumbu': msg.konfigurasi_sumbu,
                        'panjang_utama': msg.panjang_utama,
                        'lebar_utama': msg.lebar_utama,
                        'tinggi_utama': msg.tinggi_utama,
                        'rfid': process.env.SYNC_DIMENSI == 'true' ? msg.rfid : '',
                        'vcode': process.env.SYNC_DIMENSI == 'true' ? msg.vcode : ''
                    }
                    if (id) {
                        data = {'id': id, ...data};
                    } 
                    console.log('MSG: ', data);
                    // console.log('SEND MESSAGE RFID: ', JSON.stringify(msg));

                    setTimeout(function timeout() {
                        ws.send(JSON.stringify(data));
                    }, 200);
                }
            });

            ws.on('close', function close() {
                console.log('disconnected');
            });
            // } else {
            //  console.log('SYNC RFID FALSE');
            // }
        } else {
            console.log('IS KEMENHUB 1');
        }
    }

    return {
        findAll,
        findOne,
        findAllActive,
        findUjiberkala,
        findRfid,
        findQrcode,
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
module.exports = KendaraanController;