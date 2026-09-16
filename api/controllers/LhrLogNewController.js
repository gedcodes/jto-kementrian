const {
    t_bptd,
    t_lokasi,
    t_kota_kab,
    lhr_log_new,
    lhr_log_stat,
    sequelize } = require('../models');
// const {
//     upsert_komoditi,
//     upsert_pelanggaran,
//     moveRowDocumentTemp,
//     getKodeKota,
//     checkMasaBerlaku,
//     uploadImage,
//     getIsNoKendaraan,
//     getIsNoKendaraanStatus,
//     getIsExistsKodeTrxKendaraan,
//     upsert_kendaraan, ltrim, rtrim } = require('./lib/penimbangan');
const {
    loginUser,
    syncToPostServer,
    syncToPostServerLhr,
    updateStatusSyncToPusat
} = require('./lib/sinkronisasi');

const {
    getLokasiUppkbId,
    getBptdId
} = require('./lib/dataid');

// const {
//     loginUser,
//     syncToPostServer,
//     updateStatusSyncToPusat
// } = require('./lib/sinkronisasi');

const { syncToPostPanBali } = require('./lib/integrasipanbali');

const { downloadImageToUrl } = require('./lib/cctvcapture');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const message = require('../services/message.service');
const uploadFile = require('../middleware/upload');
const config = require('../../config/config');
const { padLeft, kelebihanBerat, prosenKelebihanBerat } = require('../lib/utilities')
const fs = require('fs');
const moment = require('moment');
const path = require("path");
var url = require('url');
const { reportTemplate } = require('../controllers/lib/report_template');
const axios = require('axios');
const messageService = require('../services/message.service');
const AxiosDigestAuth = require('@mhoc/axios-digest-auth').default;
var QRCode = require('qrcode');

let ejs = require("ejs");
const { generatePdfFile } = require('../middleware/pdfGenerator');

const excel = require('exceljs');
const { encrypt } = require('./lib/aescrypt');
const LhrLogNewController = () => {

    const timer = ms => new Promise(res => setTimeout(res, ms))

    const getPagination = (page, size) => {
        const limit = size ? +size : 3;
        const offset = page ? page * limit : 0;

        return { limit, offset };
    };

    const getPagingData = (data, page, limit) => {
        const { count: totalItems } = data;

        const currentPage = page ? + page : 0;
        const totalPages = Math.ceil(totalItems / limit);

        return { totalItems, totalPages, currentPage };
    };

    const getAll = async (req, res, next) => {
        console.log('::=::-------------> GET ALL LOG RADAR NEW DATE NOW <-------------::=::');
        try {
            var tanggal = req.body.tgl;// || moment().format('YYYY-MM-DD');
            var page = req.query.page || 0;
            var pageSize = req.query.size || 25;

            const { limit, offset } = getPagination(page, pageSize);
            const condition = tanggal ? [
                sequelize.where(
                    sequelize.fn('date', sequelize.col('date_time')),
                    tanggal
                )] : {};
            lhr_log_new.findAndCountAll({
                where: condition, limit, offset,
                order: [
                    [
                        req.query.orderBy || 'date_time',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
            }, { logging: false })
                .then((result) => {
                    res.send({
                        success: true,
                        message: message().GET_SUCCESS,
                        data: result.rows,
                        meta: getPagingData(result, page, limit)
                    });
                }).catch((error) => {
                    res.send({
                        success: false,
                        message: message().GET_FAILED,
                        error
                    });
                });
        } catch (error) {
            next(error);
        }

    };

    const getBy = async (req, res, next) => {
        console.log('::=::-------------> GET BY IP AND LANE LOG RADAR NEW DATE NOW <-------------::=::');
        try {
            var tanggal = req.body.tgl || moment().format('YYYY-MM-DD');
            var ip = req.body.ip;
            var lane = req.body.lane;
            console.log(req.body);
            if (ip && lane) {
                var condition = [
                    sequelize.where(
                        sequelize.fn('date', sequelize.col('date_time')),
                        tanggal
                    ),
                    { 'ip_address': ip, 'lane': lane }
                ];
            }

            if (ip && lane == 0) {
                var condition = [
                    sequelize.where(
                        sequelize.fn('date', sequelize.col('date_time')),
                        tanggal
                    ), { 'ip_address': ip }
                ];
            }
            lhr_log_new.findAll({
                where: condition
            }, { logging: false })
                .then((result) => {
                    if (Object.keys(result).length > 0) {
                        res.send({
                            success: true,
                            message: message().GET_SUCCESS,
                            data: result
                        });
                    } else {
                        res.send({
                            success: false,
                            message: message().GET_DATA_NULL,
                            data: result
                        });
                    }
                }).catch((error) => {
                    res.send({
                        success: false,
                        message: message().GET_FAILED,
                        error
                    });
                });
        } catch (error) {
            next(error);
        }

    };

    const upsert = async (req, res, next) => {
        console.log('::=::-------------> UPSERT LOG RADAR NEW DATE NOW <-------------::=::');
        try {
            if (req.body.kode_uppkb) {
                var bptd_id = await getBptdId(req.body.kode_uppkb);
                var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);

                var condition = {
                    'kode_uppkb': req.body.kode_uppkb,
                    'ip_address': req.body.ip_address,
                    'measure_line': req.body.measure_line,
                    'lane': req.body.lane
                }

                var value = {
                    'kode_uppkb': req.body.kode_uppkb,
                    'lokasi_id': lokasi_id,
                    'bptd_id': bptd_id,
                    'sensor_id': req.body.sensor_id,
                    'kode_sensor': req.body.kode_sensor,
                    'desk_sensor': req.body.desk_sensor,
                    'desk_lane': req.body.desk_lane,
                    'ip_address': req.body.ip_address,
                    'lane': req.body.lane,
                    'measure_line': req.body.measure_line,
                    'class_0': req.body.class_0,
                    'class_1': req.body.class_1,
                    'class_2': req.body.class_2,
                    'class_3': req.body.class_3,
                    'class_4': req.body.class_4,
                    'class_5': req.body.class_5,
                    'class_6': req.body.class_6,
                    'class_7': req.body.class_7,
                    'class_8': req.body.class_8,
                    'headway': req.body.headway,
                    'speed_85th': req.body.speed_85th,
                    'speed_avg': req.body.speed_avg,
                    'gap': req.body.gap,
                    'occupancy': req.body.occupancy,
                    'date_time': req.body.date_time,
                    'date_time_device': req.body.date_time_device || moment().format('YYYY-MM-DD')
                }
                console.log('VALUE UPSERT: ', value);
                lhr_log_new.findOne({
                    where: condition
                }, { logging: false })
                    .then(async (result) => {
                        var logstat = await getDataLogStat(req.body.kode_uppkb, moment(req.body.date_time).format('YYYY-MM-DD HH:mm:ss'), req.body.ip_address, req.body.lane, req.body.measure_line, req, next);
                        // console.log(logstat);

                        if (result) {
                            console.log('UPDATE LOG NEW');
                            var updateLog = await update(value, condition, res, next);

                            if (updateLog == 1) {
                                res.send({
                                    success: true,
                                    message: 'UPDATE LOG BERHASIL'
                                });
                            } else {
                                res.send({
                                    success: false,
                                    message: 'UPDATE LOG GAGAL'
                                });
                            }

                        } else {
                            console.log('INSERT LOG NEW');
                            var insertLog = await create(value, res, next);

                            if (insertLog == 1) {
                                res.send({
                                    success: true,
                                    message: 'INSERT LOG BERHASIL'
                                });
                            } else {
                                res.send({
                                    success: true,
                                    message: 'INSERT LOG GAGAL'
                                });
                            }
                        }

                    }).catch((error) => {
                        console.log(error)
                        res.send({
                            success: false,
                            message: message().FIND_DATA_FAIL,
                            error: error
                        });
                    });
            } else {
                res.send({
                    success: false,
                    message: 'Kode UPPKB Tidak Ditemukan / Kode UPPKB Salah'
                });
            }
        } catch (error) {
            next(error);
        }
    };

    const create = async (value, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        try {
            return sequelize.transaction().then(function (t) {
                return lhr_log_new.create(value, { transaction: t }).then(async (data) => {
                    t.commit();
                    /*
                    res.send({
                        success: true,
                        message: message().CREATE_SUCCESS,
                        insertId: data.id,
                        data: value
                    });
                    */
                    return 1;
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    /*
                    res.send({
                        "status": false,
                        "message": message().CREATE_FAILED,
                        "data": null
                    });
                    */
                    return 0;
                });
            });
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    const update = async (value, condition, res, next) => {
        console.log("--------------------::Processing Update::--------------------");
        console.log('KONDISI : ', condition);
        try {
            return sequelize.transaction().then(function (t) {
                return lhr_log_new.update(value, {
                    where: {
                        'kode_uppkb': condition.kode_uppkb,
                        'ip_address': condition.ip_address,
                        'measure_line': condition.measure_line,
                        'lane': condition.lane
                    }, transaction: t
                }).then(async (num) => {
                    t.commit();
                    return 1;
                    /*
                    res.send({
                        "success": true,
                        "message": message().UPDATE_SUCCESS,
                        "data": value
                    });
                    */
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    /*
                    res.send({
                        "status": false,
                        "message": message().UPDATE_FAILED,
                        "data": null
                    });
                    */
                    return 0;
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const menit = (tgl_jam) => {
        var mnt = moment(tgl_jam).format('mm');

        if (parseInt(mnt) >= 1 && parseInt(mnt) <= 15) {
            return 15;
        } else if (parseInt(mnt) >= 16 && parseInt(mnt) <= 30) {
            return 30;
        } else if (parseInt(mnt) >= 31 && parseInt(mnt) <= 45) {
            return 45;
        } else {
            return 0;
        }
    }

    const menitToJam = (tgl_jam) => {
        var dateTime = moment(tgl_jam, 'YYYY-MM-DD HH:mm:ss');
        var jam = moment(tgl_jam).format('HH');
        var mnt = moment(tgl_jam).format('mm');

        if (mnt === '00') {
            return jam;
        } else if (parseInt(mnt) >= 1 && parseInt(mnt) <= 15) {
            return jam;
        } else if (parseInt(mnt) >= 16 && parseInt(mnt) <= 30) {
            return jam;
        } else if (parseInt(mnt) >= 31 && parseInt(mnt) <= 45) {
            return jam;
        } else {
            var jamPlus = dateTime.add(1, 'hours');
            return jamPlus.format('HH');
        }
    }

    function f_15menit(tgl_jam) {
        let v_date_time = new Date(tgl_jam);

        let v_minute = 0;
        switch (true) {
            case v_date_time.getMinutes() === 0:
                v_minute = 0;
                break;
            case v_date_time.getMinutes() >= 1 && v_date_time.getMinutes() <= 15:
                v_minute = 15;
                break;
            case v_date_time.getMinutes() >= 16 && v_date_time.getMinutes() <= 30:
                v_minute = 30;
                break;
            case v_date_time.getMinutes() >= 31 && v_date_time.getMinutes() <= 45:
                v_minute = 45;
                break;
            case v_date_time.getMinutes() >= 46 && v_date_time.getMinutes() <= 59:
                v_minute = 0;
                v_date_time.setHours(v_date_time.getHours() + 1);
                break;
        }

        v_date_time.setMinutes(v_minute);

        return v_date_time;
    }

    const getDataLogStat = async (kode_uppkb, tgl_jam, ip_address, lane, measure_line, req, next) => {
        try {
            var tgl = moment(tgl_jam).format('YYYY-MM-DD');
            // var jam = moment(tgl_jam).format('HH');
            var jam = menitToJam(tgl_jam);
            var mnt = menit(tgl_jam);

            var sql = `SELECT * FROM lhr_log_stat WHERE kode_uppkb = '${kode_uppkb}' AND DATE(date_time) = '${tgl}' AND jam = '${jam}' AND "15menit" = '${mnt}' AND ip_address = '${ip_address}' AND lane = ${lane} AND measure_line = ${measure_line} AND is_active = true AND is_deleted = false`;
            // console.log('SQL: ', sql);
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            // console.log('REQ BODY: ', req.body);

            // console.log('RESULT SQL: ', result);

            if (Object.keys(result).length > 0) {
                console.log('UPDATE LOG STAT');
                var updatestat = await updateLogStat(kode_uppkb, tgl, jam, mnt, req, result[0]);
                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    // var data_req = value;

                    await syncToPostServerLhr(req.token.id, 'post', 'v2pv/lhrnew/upsert', req.body).then(async (resp) => {
                        // console.log('RESP PUSAT: ', resp);

                        if (resp.data.success) {
                            console.log('SINKRONISASI DATA BERHASIL');
                            // await updateStatusSyncToPusat(data.id, 'lhr_log_stat');
                        } else {
                            console.log(resp.data);
                            console.log('SINKRONISASI DATA GAGAL');
                        }

                    }).catch((error) => {
                        console.log(error);
                        console.log('SINKRONISASI DATA GAGAL');
                    });

                }
                console.log('UPDATE STAT: ', updatestat);
            } else {
                console.log('INSERT LOG STAT');
                var createstat = await createlogStat(kode_uppkb, tgl, jam, mnt, req);
                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    // var data_req = value;

                    await syncToPostServerLhr(req.token.id, 'post', 'v2pv/lhrnew/upsert', req.body).then(async (resp) => {
                        // console.log('RESP PUSAT: ', resp);

                        if (resp.data.success) {
                            console.log('SINKRONISASI DATA BERHASIL');
                            // await updateStatusSyncToPusat(data.id, 'lhr_log_stat');
                        } else {
                            console.log(resp.data);
                            console.log('SINKRONISASI DATA GAGAL');
                        }

                    }).catch((error) => {
                        console.log(error);
                        console.log('SINKRONISASI DATA GAGAL');
                    });

                }
                console.log('CREATE STAT: ', createstat);

            }
        } catch (error) {
            next(error);
        }
    }

    const createlogStat = async (kode_uppkb, tgl, jam, menit, req) => {
        console.log("--------------------::Processing Create::--------------------");
        const t = await sequelize.transaction();
        try {

            if (kode_uppkb) {
                var bptd_id = await getBptdId(kode_uppkb);
                var lokasi_id = await getLokasiUppkbId(kode_uppkb);

                var value = {
                    'kode_uppkb': kode_uppkb,
                    'lokasi_id': lokasi_id,
                    'bptd_id': bptd_id,
                    'sensor_id': req.body.sensor_id,
                    'kode_sensor': req.body.kode_sensor,
                    'desk_sensor': req.body.desk_sensor,
                    'desk_lane': req.body.desk_lane,
                    'ip_address': req.body.ip_address,
                    'lane': req.body.lane,
                    'measure_line': req.body.measure_line,
                    'class_0': req.body.class_0,
                    'class_1': req.body.class_1,
                    'class_2': req.body.class_2,
                    'class_3': req.body.class_3,
                    'class_4': req.body.class_4,
                    'class_5': req.body.class_5,
                    'class_6': req.body.class_6,
                    'class_7': req.body.class_7,
                    'class_8': req.body.class_8,
                    'headway': req.body.headway,
                    'speed_85th': req.body.speed_85th,
                    'speed_avg': req.body.speed_avg,
                    'gap': req.body.gap,
                    'occupancy': req.body.occupancy,
                    'date_time': req.body.date_time,
                    'date_time_device': req.body.date_time_device || moment().format('YYYY-MM-DD'),
                    'tgl': tgl,
                    'jam': Number(jam),
                    '15menit': Number(menit)
                }

                await lhr_log_stat.create(value, { transaction: t });

                await t.commit();

                return 1;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(error);
            await t.rollback();
            return 0;
        }
    }

    const updateLogStat = async (kode_uppkb, tgl, jam, menit, req, old_data) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            if (kode_uppkb) {
                var bptd_id = await getBptdId(kode_uppkb);
                var lokasi_id = await getLokasiUppkbId(kode_uppkb);

                var condition = {
                    'kode_uppkb': kode_uppkb,
                    'ip_address': req.body.ip_address,
                    'measure_line': req.body.measure_line,
                    'lane': req.body.lane,
                    'tgl': tgl,
                    'jam': Number(jam),
                    '15menit': Number(menit)
                }

                var value = {
                    'kode_uppkb': kode_uppkb,
                    'lokasi_id': lokasi_id,
                    'bptd_id': bptd_id,
                    'sensor_id': req.body.sensor_id,
                    'kode_sensor': req.body.kode_sensor,
                    'desk_sensor': req.body.desk_sensor,
                    'desk_lane': req.body.desk_lane,
                    'ip_address': req.body.ip_address,
                    'lane': req.body.lane,
                    'measure_line': req.body.measure_line,
                    'class_0': Number(req.body.class_0) + Number(old_data.class_0),
                    'class_1': Number(req.body.class_1) + Number(old_data.class_1),
                    'class_2': Number(req.body.class_2) + Number(old_data.class_2),
                    'class_3': Number(req.body.class_3) + Number(old_data.class_3),
                    'class_4': Number(req.body.class_4) + Number(old_data.class_4),
                    'class_5': Number(req.body.class_5) + Number(old_data.class_5),
                    'class_6': Number(req.body.class_6) + Number(old_data.class_6),
                    'class_7': Number(req.body.class_7) + Number(old_data.class_7),
                    'class_8': Number(req.body.class_8) + Number(old_data.class_8),
                    'headway': (parseFloat(req.body.headway) + parseFloat(old_data.headway)) / 2,
                    'speed_85th': (parseFloat(req.body.speed_85th) + parseFloat(old_data.speed_85th)) / 2,
                    'speed_avg': (parseFloat(req.body.speed_avg) + parseFloat(old_data.speed_avg)) / 2,
                    'gap': (parseFloat(req.body.gap) + parseFloat(old_data.gap)) / 2,
                    'occupancy': (parseFloat(req.body.occupancy) + parseFloat(old_data.occupancy)) / 2,
                    'date_time': req.body.date_time,
                    'date_time_device': req.body.date_time_device || moment().format('YYYY-MM-DD'),
                    'tgl': tgl,
                    'jam': Number(jam),
                    '15menit': Number(menit)
                }

                return sequelize.transaction().then(function (t) {
                    return lhr_log_stat.update(value, { where: condition, transaction: t }).then(async (num) => {
                        t.commit();
                        return 1;
                    }).catch(function (err) {
                        t.rollback().catch(() => { });
                        return 0;
                    });
                });
            } else {
                return 0;
            }
        } catch (error) {
            return 0;
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
            const sensor_id = req.query.sensor_id;
            const tahun = moment().format('YYYY');

            let whereSensor = '';
            if (sensor_id) {
                whereSensor = `AND lhr_log_stat.sensor_id = ${sensor_id}`
            }

            if (lokasi_id) {
                let sql = `SELECT
                                lhr_log_stat.lokasi_id,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                SUM(lhr_log_stat.class_2) as motor,
                                SUM(lhr_log_stat.class_3) as mobil,
                                SUM(lhr_log_stat.class_4) as truck_bus,
                                SUM(lhr_log_stat.class_5) as truck,
                                SUM(lhr_log_stat.class_7) as bus,
                                ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) as smp,
                                ROUND(AVG(lhr_log_stat.gap)::numeric, 0) as gap,
                                ROUND(AVG(lhr_log_stat.headway)::numeric, 0) as headway,
                                ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) as speed_avg,
                                ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) as occupancy,
                                (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) as total,
                                to_char(lhr_log_stat.date_time, 'HH24:MI') as waktu_from,
                                to_char(lhr_log_stat.date_time + INTERVAL '15 Minutes', 'HH24:MI') AS waktu_to,
                                concat(to_char(lhr_log_stat.date_time, 'HH24:MI'),' - ',to_char(lhr_log_stat.date_time + INTERVAL '15 Minutes', 'HH24:MI')) as waktu,
                                lhr_log_stat."15menit"
                            FROM lhr_log_stat
                            JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id
                            WHERE 
                                lhr_log_stat.date_time BETWEEN '${tgl} ${jam_awal}' AND '${tgl} ${jam_akhir}' AND 
                                lhr_log_stat.lokasi_id = ${lokasi_id} AND 
                                lhr_log_stat.is_active = true AND 
                                lhr_log_stat.is_deleted = false AND
		                        lhr_log_stat.lane = 1 ${whereSensor}
                            GROUP BY jt_lokasi_uppkb.id, lhr_log_stat.lokasi_id, lhr_log_stat.date_time, lhr_log_stat."15menit"
                            ORDER BY waktu ASC`;

                if (interval == 2) {
                    sql = `SELECT
                                lhr_log_stat.lokasi_id,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                SUM(lhr_log_stat.class_2) as motor,
                                SUM(lhr_log_stat.class_3) as mobil,
                                SUM(lhr_log_stat.class_4) as truck_bus,
                                SUM(lhr_log_stat.class_5) as truck,
                                SUM(lhr_log_stat.class_7) as bus,
                                ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) as smp,
                                ROUND(AVG(lhr_log_stat.gap)::numeric, 0) as gap,
                                ROUND(AVG(lhr_log_stat.headway)::numeric, 0) as headway,
                                ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) as speed_avg,
                                ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) as occupancy,
                                (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) as total,
                                concat(concat(extract(hour from lhr_log_stat.date_time),':','00'), ' - ',to_char(lhr_log_stat.date_time + INTERVAL '60 Minutes', 'HH24:00'))  as waktu,
                                concat(extract(hour from lhr_log_stat.date_time),':','00') as waktu_from,
                                to_char(lhr_log_stat.date_time + INTERVAL '60 Minutes', 'HH24:00') AS waktu_to,
                                lhr_log_stat.jam
                            FROM lhr_log_stat
                            JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id
                            WHERE 
                                lhr_log_stat.date_time BETWEEN '${tgl} ${jam_awal}' AND '${tgl} ${jam_akhir}' AND 
                                lhr_log_stat.lokasi_id = ${lokasi_id} AND 
                                lhr_log_stat.is_active = true AND 
                                lhr_log_stat.is_deleted = false AND
		                        lhr_log_stat.lane = 1 ${whereSensor}
                            GROUP BY 
                                jt_lokasi_uppkb.id, 
                                lhr_log_stat.lokasi_id, 
                                lhr_log_stat.jam, 
                                extract(hour from lhr_log_stat.date_time), 
                                to_char(lhr_log_stat.date_time + INTERVAL '60 Minutes', 'HH24:00')
                            ORDER BY lhr_log_stat.jam ASC`;
                }
                if (interval == 3) {
                    sql = `SELECT
                                lhr_log_stat.lokasi_id,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                SUM(lhr_log_stat.class_2) as motor,
                                SUM(lhr_log_stat.class_3) as mobil,
                                SUM(lhr_log_stat.class_4) as truck_bus,
                                SUM(lhr_log_stat.class_5) as truck,
                                SUM(lhr_log_stat.class_7) as bus,
                                ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) as smp,
                                ROUND(AVG(lhr_log_stat.gap)::numeric, 0) as gap,
                                ROUND(AVG(lhr_log_stat.headway)::numeric, 0) as headway,
                                ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) as speed_avg,
                                ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) as occupancy,
                                (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) as total,
                                to_char(lhr_log_stat.date_time, 'DD-MM-YYYY') as waktu
                            FROM lhr_log_stat
                                JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id
                            WHERE
                                lhr_log_stat.date_time::date BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}' AND 
                                lhr_log_stat.lokasi_id = '${lokasi_id}' AND 
                                lhr_log_stat.is_active = true AND 
                                lhr_log_stat.is_deleted = false AND
		                        lhr_log_stat.lane = 1 ${whereSensor}
                            GROUP BY 
                                jt_lokasi_uppkb.id, 
                                lhr_log_stat.lokasi_id, 
                                to_char(lhr_log_stat.date_time, 'DD-MM-YYYY')
                            ORDER BY waktu ASC`;
                }
                if (interval == 4) {
                    sql = `SELECT
                                lhr_log_stat.lokasi_id,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                SUM(lhr_log_stat.class_2) as motor,
                                SUM(lhr_log_stat.class_3) as mobil,
                                SUM(lhr_log_stat.class_4) as truck_bus,
                                SUM(lhr_log_stat.class_5) as truck,
                                SUM(lhr_log_stat.class_7) as bus,
                                ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) as smp,
                                ROUND(AVG(lhr_log_stat.gap)::numeric, 0) as gap,
                                ROUND(AVG(lhr_log_stat.headway)::numeric, 0) as headway,
                                ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) as speed_avg,
                                ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) as occupancy,
                                (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) as total,
                                to_char(lhr_log_stat.date_time, 'MM-YYYY') as waktu
                            FROM lhr_log_stat
                                JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id
                            WHERE
                                EXTRACT(YEAR FROM lhr_log_stat.date_time) = ${tahun} AND 
                                EXTRACT(MONTH FROM lhr_log_stat.date_time) BETWEEN ${bulan_awal} AND ${bulan_akhir} AND 
                                lhr_log_stat.lokasi_id = '${lokasi_id}' AND 
                                lhr_log_stat.is_active = true AND 
                                lhr_log_stat.is_deleted = false AND
		                        lhr_log_stat.lane = 1 ${whereSensor}
                            GROUP BY jt_lokasi_uppkb.id, lhr_log_stat.lokasi_id, to_char(lhr_log_stat.date_time, 'MM-YYYY')
                            ORDER BY waktu ASC`;
                }
                if (interval == 5) {
                    sql = `SELECT
                                lhr_log_stat.lokasi_id,
                                jt_lokasi_uppkb.id,
                                jt_lokasi_uppkb.nama as nama_uppkb,
                                SUM(lhr_log_stat.class_2) as motor,
                                SUM(lhr_log_stat.class_3) as mobil,
                                SUM(lhr_log_stat.class_4) as truck_bus,
                                SUM(lhr_log_stat.class_5) as truck,
                                SUM(lhr_log_stat.class_7) as bus,
                                ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) as smp,
                                ROUND(AVG(lhr_log_stat.gap)::numeric, 0) as gap,
                                ROUND(AVG(lhr_log_stat.headway)::numeric, 0) as headway,
                                ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) as speed_avg,
                                ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) as occupancy,
                                (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) as total,
                                to_char(lhr_log_stat.date_time, 'YYYY') as waktu
                            FROM lhr_log_stat
                                JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id
                            WHERE
                                EXTRACT(YEAR FROM lhr_log_stat.date_time) BETWEEN '${tahun_awal}' AND '${tahun_akhir}' AND 
                                lhr_log_stat.lokasi_id = '${lokasi_id}' AND 
                                lhr_log_stat.is_active = true AND 
                                lhr_log_stat.is_deleted = false AND
		                        lhr_log_stat.lane = 1 ${whereSensor}
                            GROUP BY jt_lokasi_uppkb.id, lhr_log_stat.lokasi_id, to_char(lhr_log_stat.date_time, 'YYYY')
                            ORDER BY waktu ASC`;
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

    const lhrVersion = async (id) => {
        var sql = `SELECT * FROM jt_lokasi_uppkb WHERE id = ${id} AND is_active = true AND is_deleted = false`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        })

        return result[0].versi_lhr;
    }

    const filter = async (req, res, next) => {
        console.log('::=::-------------> GET ALL LOG RADAR FILTER <-------------::=::');
        const interval = req.query.interval;
        const result = await dataLhr(req, next);
        let data = [];
        let total = 0;
        let totalK = 0;
        let bagiSpeed = 0;
        let bagiOccupancy = 0;
        let speed_avgTotal = 0; // Variabel sementara untuk akumulasi speed_avg
        let occupancyTotal = 0; // Variabel sementara untuk akumulasi occupancy
        const versi_lhr = await lhrVersion(req.query.lokasi);

        if (result) {
            // var versiLhr = result.length > 0 ? result[0].versi_lhr : '2';
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

                const totalKend = versi_lhr === '2' ? (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck) + parseInt(row.bus)) : (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck_bus));
                data.push({
                    lokasi_id: row.lokasi_id,
                    nama_uppkb: row.nama_uppkb,
                    motor: parseInt(row.motor),
                    mobil: parseInt(row.mobil),
                    truck_bus: parseInt(row.truck_bus),
                    truck: parseInt(row.truck),
                    bus: parseInt(row.bus),
                    smp: parseFloat(row.smp),
                    gap: parseInt(row.gap),
                    headway: parseInt(row.headway),
                    speed_avg: parseInt(row.speed_avg),
                    occupancy: parseInt(row.occupancy),
                    total: totalKend,
                    waktu: formatwaktu
                });
                total += parseInt(row.total);
                totalK += totalKend;
                bagiSpeed += parseInt(row.speed_avg) > 0 ? 1 : 0;
                bagiOccupancy += parseInt(row.occupancy) > 0 ? 1 : 0;
                speed_avgTotal += parseInt(row.speed_avg); // Akumulasi speed_avg
                occupancyTotal += parseInt(row.occupancy); // Akumulasi occupancy
            }

            // Menghitung rata-rata speed_avg dan occupancy
            const speed_avg = data.length > 0 ? speed_avgTotal / bagiSpeed : 0;
            const occupancy = data.length > 0 ? occupancyTotal / bagiOccupancy : 0;

            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: data,
                meta: {
                    total: result.length,
                    totalAll: total,
                    speed_avg: speed_avg,
                    occupancy: occupancy,
                    versi_lhr: versi_lhr,
                    totakAllKend: totalK,
                }
            });
        }
    }

    const xlsLhr = async (req, res, next) => {
        const interval = req.query.interval;
        const result = await dataLhr(req, next)
        const versi_lhr = await lhrVersion(req.query.lokasi);
        if (result) {
            // var versiLhr = result.length > 0 ? result[0].versi_lhr : '2';
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
                // const totalKend = versiLhr === '2' ? (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck) + parseInt(row.bus)) : (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck_bus));
                obj.push({
                    nama_uppkb: row.nama_uppkb,
                    interval: nama_interval,
                    motor: row.motor,
                    mobil: row.mobil,
                    truck_bus: row.truck_bus,
                    truck: row.truck,
                    bus: row.bus,
                    total: row.total,
                    smp: row.smp,
                    gap: row.gap,
                    headway: row.headway,
                    speed_avg: row.speed_avg,
                    occupancy: row.occupancy,
                    waktu: formatwaktu
                });
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

            if (versi_lhr == "1") {
                worksheet.columns = [
                    { header: 'Waktu', key: 'waktu', width: 20 },
                    { header: 'Interval', key: 'interval', width: 20 },
                    { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
                    { header: 'Motor', key: 'motor', width: 20 },
                    { header: 'Mobil', key: 'mobil', width: 20 },
                    { header: 'Truk/Bus', key: 'truck_bus', width: 20 },
                    { header: 'Total', key: 'total', width: 20 },
                    { header: 'Smp', key: 'smp', width: 20 },
                    { header: 'Gap (s)', key: 'gap', width: 20 },
                    { header: 'Headway (s)', key: 'headway', width: 20 },
                    { header: 'Speed AVG (Km/jam)', key: 'speed_avg', width: 20 },
                    { header: 'Occupancy (%)', key: 'occupancy', width: 20 },
                ]
            } else {
                worksheet.columns = [
                    { header: 'Waktu', key: 'waktu', width: 20 },
                    { header: 'Interval', key: 'interval', width: 20 },
                    { header: 'UPPKB', key: 'nama_uppkb', width: 20 },
                    { header: 'Motor', key: 'motor', width: 20 },
                    { header: 'Mobil', key: 'mobil', width: 20 },
                    { header: 'Truk', key: 'truck', width: 20 },
                    { header: 'Bus', key: 'bus', width: 20 },
                    { header: 'Total', key: 'total', width: 20 },
                    { header: 'Smp', key: 'smp', width: 20 },
                    { header: 'Gap (dtk)', key: 'gap', width: 20 },
                    { header: 'Headway (dtk)', key: 'headway', width: 20 },
                    { header: 'Speed AVG (Km/jam)', key: 'speed_avg', width: 20 },
                    { header: 'Occupancy (%)', key: 'occupancy', width: 20 },
                ]
            }

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
            const filename = `lhr_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
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

    const printLhr = async (req, res, next) => {
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
        const versi_lhr = await lhrVersion(req.query.lokasi);
        const result = await dataLhr(req, next);
        if (result) {
            // var versiLhr = result.length > 0 ? result[0].versi_lhr : '2';
            let lokasi = ''
            if (lokasi_id) {
                lokasi = await t_lokasi.findOne({
                    where: {
                        'id': lokasi_id,
                        'is_active': true,
                        'is_deleted': false
                    },
                    attributes: ['id', 'kode', 'nama', 'bptd_id', 'kota_kab_id']
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
            const dataqr = `${process.env.DOMAIN_URL_QR}/rep/lhr?src=${encrypt(params)}`;
            const qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();

            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("lhrView.ejs", {
                    data: result,
                    datafilter: datafilter,
                    versi_lhr: versi_lhr,
                    interval: interval,
                    versi_lhr: versi_lhr,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', 'lhrView.ejs'), {
                    data: result,
                    datafilter: datafilter,
                    versi_lhr: versi_lhr,
                    interval: interval,
                    versi_lhr: versi_lhr,
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

                        console.log('LOKASI : ', lokasi);
                        let nama_file_uppkb = 'all_uppkb'
                        if (lokasi_id) {

                            nama_file_uppkb = lokasi.kode;
                        }

                        const filename = `data_lhr_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
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
        getAll,
        getBy,
        upsert,
        filter,
        xlsLhr,
        printLhr
    };
}
module.exports = LhrLogNewController;
