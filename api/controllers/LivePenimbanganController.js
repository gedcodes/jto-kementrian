const {
    sequelize
} = require('../models');

const { Op, QueryTypes } = require('sequelize');
const messageService = require('../services/message.service');
const {
    getLokasiUppkbId,
    getLokasiUppkbKode,
    getLokasiUppkbNama
} = require('./lib/dataid');

const axios = require('axios');
const rax = require('retry-axios');
var client = require('redis').createClient();

const LivePenimbanganController = () => {
    const resumeLive = async (req, res, next) => {
        console.log("--------------------::Processing Resume Live UPPKB::--------------------");
        try {
            var lokasi = req.query.lid;

            if (lokasi) {
                const ttlPenimbangan = await getTotalPenimbangan(lokasi);
                const ttlPenindakan = await getTotalPenindakan(lokasi);
                const ttlLhr = await getTotalLhr(lokasi);
                const ttlVerif = await getTotalVerifikator(lokasi);
                const ttlDeteksi = await getTotalDeteksi(lokasi);
                var kode_uppkb = await getLokasiUppkbKode(lokasi);
                var nama = await getLokasiUppkbNama(kode_uppkb);

                console.log(ttlPenimbangan);

                const data = {
                    jml_penimbangan: ttlPenimbangan.jml_timbang,
                    jml_melanggar: ttlPenimbangan.jml_melanggar,
                    jml_penindakan: ttlPenindakan,
                    jml_lhr: ttlLhr,
                    jml_verifikator: ttlVerif,
                    jml_deteksi: ttlDeteksi,
                    kode_uppkb: kode_uppkb,
                    uppkb: nama,
                };

                console.log('DATA RESUME : ', data);

                res.json({
                    success: true,
                    message: `${messageService().GET_SUCCESS}`,
                    data: data
                });
            } else {
                res.send({ 
                    success: false,
                    message: 'Lokasi ID tidak boleh kosong'
                });
            }

        } catch (error) {
            next(error);
        }
    }

    const getTotalDeteksi = async (lokasi) => {
        try { 

            var sql = `SELECT 
                            SUM(jml_deteksi) AS ttl_deteksi
                        FROM vr_deteksi
                        WHERE
                            EXTRACT(YEAR FROM tgl_deteksi) = EXTRACT(YEAR FROM CURRENT_DATE)
                            AND EXTRACT(MONTH FROM tgl_deteksi) = EXTRACT(MONTH FROM CURRENT_DATE)
                            AND lokasi_id = ${lokasi}`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            return Number(result[0].ttl_deteksi);
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    const getTotalPenimbangan = async (lokasi) => {
        try { 

            var sql = `SELECT 
                        COUNT(*) AS jml_timbang,
                        COUNT(CASE WHEN is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar
                    FROM jt_penimbangan
                    WHERE is_transaksi = 1 AND DATE(tgl_penimbangan) = CURRENT_DATE AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            const res = {
                jml_timbang: Number(result[0].jml_timbang),
                jml_melanggar: Number(result[0].jml_melanggar),
            }

            return res;
        } catch (error) {
            console.log(error);
            var res = {
                jml_timbang: 0,
                jml_melanggar: 0,
            }
            return res;
        }
    }

    const getTotalPenindakan = async (lokasi) => {
        try { 

            var sql = `SELECT 
                        COUNT(*) AS jml_tindak
                    FROM jt_penindakan
                    WHERE DATE(tgl_penindakan) = CURRENT_DATE AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            return Number(result[0].jml_tindak);
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    const getTotalLhr = async (lokasi) => {
        try { 

            var sql = `SELECT 
                            COUNT(*) AS jml_timbang
                        FROM jt_penimbangan
                        WHERE 
                            is_transaksi = 1
                            AND EXTRACT(YEAR FROM tgl_penimbangan) = EXTRACT(YEAR FROM CURRENT_DATE)
                            AND EXTRACT(MONTH FROM tgl_penimbangan) = EXTRACT(MONTH FROM CURRENT_DATE)
                            AND lokasi_id = ${lokasi} 
                            AND is_active = true 
                            AND is_deleted = false`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            return Number(result[0].jml_timbang);
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    const getTotalVerifikator = async (lokasi) => {
        try { 

            var sql = `SELECT 
                            COUNT(*) AS jml_verif
                        FROM vr_pelanggaran
                        WHERE
                            EXTRACT(YEAR FROM tgl_pelanggaran) = EXTRACT(YEAR FROM CURRENT_DATE)
                            AND EXTRACT(MONTH FROM tgl_pelanggaran) = EXTRACT(MONTH FROM CURRENT_DATE)
                            AND lokasi_id = ${lokasi}
                            AND is_active = true`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            return Number(result[0].jml_verif);
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    const chartPenimbangan = async (req, res, next) => {
        try {
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;

            if (bptd_id && lokasi) {

                var sql = `SELECT 
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 00 THEN 1 ELSE NULL END) AS jml_timbang_00,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 00 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_00,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 01 THEN 1 ELSE NULL END) AS jml_timbang_01,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 01 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_01,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 02 THEN 1 ELSE NULL END) AS jml_timbang_02,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 02 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_02,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 03 THEN 1 ELSE NULL END) AS jml_timbang_03,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 03 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_03,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 04 THEN 1 ELSE NULL END) AS jml_timbang_04,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 04 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_04,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 05 THEN 1 ELSE NULL END) AS jml_timbang_05,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 05 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_05,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 06 THEN 1 ELSE NULL END) AS jml_timbang_06,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 06 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_06,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 07 THEN 1 ELSE NULL END) AS jml_timbang_07,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 07 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_07,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 08 THEN 1 ELSE NULL END) AS jml_timbang_08,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 08 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_08,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 09 THEN 1 ELSE NULL END) AS jml_timbang_09,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 09 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_09,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 10 THEN 1 ELSE NULL END) AS jml_timbang_10,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 10 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_10,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 11 THEN 1 ELSE NULL END) AS jml_timbang_11,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 11 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_11,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 12 THEN 1 ELSE NULL END) AS jml_timbang_12,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 12 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_12,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 13 THEN 1 ELSE NULL END) AS jml_timbang_13,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 13 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_13,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 14 THEN 1 ELSE NULL END) AS jml_timbang_14,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 14 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_14,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 15 THEN 1 ELSE NULL END) AS jml_timbang_15,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 15 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_15,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 16 THEN 1 ELSE NULL END) AS jml_timbang_16,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 16 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_16,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 17 THEN 1 ELSE NULL END) AS jml_timbang_17,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 17 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_17,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 18 THEN 1 ELSE NULL END) AS jml_timbang_18,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 18 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_18,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 19 THEN 1 ELSE NULL END) AS jml_timbang_19,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 19 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_19,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 20 THEN 1 ELSE NULL END) AS jml_timbang_20,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 20 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_20,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 21 THEN 1 ELSE NULL END) AS jml_timbang_21,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 21 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_21,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 22 THEN 1 ELSE NULL END) AS jml_timbang_22,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 22 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_22,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 23 THEN 1 ELSE NULL END) AS jml_timbang_23,
                                COUNT(CASE WHEN date_part('hour', tgl_penimbangan) = 23 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_23
                        FROM jt_penimbangan WHERE is_transaksi = 1 AND DATE(tgl_penimbangan) = CURRENT_DATE AND is_active = true AND is_deleted = false AND bptd_id = ${bptd_id} AND lokasi_id = ${lokasi}`;

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });

                const response = [
                    {
                        name: '00:00',
                        penimbangan: Number(result[0].jml_timbang_00),
                        melanggar: Number(result[0].jml_melanggar_00),
                    },
                    {
                        name: '01:00',
                        penimbangan: Number(result[0].jml_timbang_01),
                        melanggar: Number(result[0].jml_melanggar_01),
                    },
                    {
                        name: '02:00',
                        penimbangan: Number(result[0].jml_timbang_02),
                        melanggar: Number(result[0].jml_melanggar_02),
                    },
                    {
                        name: '03:00',
                        penimbangan: Number(result[0].jml_timbang_03),
                        melanggar: Number(result[0].jml_melanggar_03),
                    },
                    {
                        name: '04:00',
                        penimbangan: Number(result[0].jml_timbang_04),
                        melanggar: Number(result[0].jml_melanggar_04),
                    },
                    {
                        name: '05:00',
                        penimbangan: Number(result[0].jml_timbang_05),
                        melanggar: Number(result[0].jml_melanggar_05),
                    },
                    {
                        name: '06:00',
                        penimbangan: Number(result[0].jml_timbang_06),
                        melanggar: Number(result[0].jml_melanggar_06),
                    },
                    {
                        name: '07:00',
                        penimbangan: Number(result[0].jml_timbang_07),
                        melanggar: Number(result[0].jml_melanggar_07),
                    },
                    {
                        name: '08:00',
                        penimbangan: Number(result[0].jml_timbang_08),
                        melanggar: Number(result[0].jml_melanggar_08),
                    },
                    {
                        name: '09:00',
                        penimbangan: Number(result[0].jml_timbang_09),
                        melanggar: Number(result[0].jml_melanggar_09),
                    },
                    {
                        name: '10:00',
                        penimbangan: Number(result[0].jml_timbang_10),
                        melanggar: Number(result[0].jml_melanggar_10),
                    },
                    {
                        name: '11:00',
                        penimbangan: Number(result[0].jml_timbang_11),
                        melanggar: Number(result[0].jml_melanggar_11),
                    },
                    {
                        name: '12:00',
                        penimbangan: Number(result[0].jml_timbang_12),
                        melanggar: Number(result[0].jml_melanggar_12),
                    },
                    {
                        name: '13:00',
                        penimbangan: Number(result[0].jml_timbang_13),
                        melanggar: Number(result[0].jml_melanggar_13),
                    },
                    {
                        name: '14:00',
                        penimbangan: Number(result[0].jml_timbang_14),
                        melanggar: Number(result[0].jml_melanggar_14),
                    },
                    {
                        name: '15:00',
                        penimbangan: Number(result[0].jml_timbang_15),
                        melanggar: Number(result[0].jml_melanggar_15),
                    },
                    {
                        name: '16:00',
                        penimbangan: Number(result[0].jml_timbang_16),
                        melanggar: Number(result[0].jml_melanggar_16),
                    },
                    {
                        name: '17:00',
                        penimbangan: Number(result[0].jml_timbang_17),
                        melanggar: Number(result[0].jml_melanggar_17),
                    },
                    {
                        name: '18:00',
                        penimbangan: Number(result[0].jml_timbang_18),
                        melanggar: Number(result[0].jml_melanggar_18),
                    },
                    {
                        name: '19:00',
                        penimbangan: Number(result[0].jml_timbang_19),
                        melanggar: Number(result[0].jml_melanggar_19),
                    },
                    {
                        name: '20:00',
                        penimbangan: Number(result[0].jml_timbang_20),
                        melanggar: Number(result[0].jml_melanggar_20),
                    },
                    {
                        name: '21:00',
                        penimbangan: Number(result[0].jml_timbang_21),
                        melanggar: Number(result[0].jml_melanggar_21),
                    },
                    {
                        name: '22:00',
                        penimbangan: Number(result[0].jml_timbang_22),
                        melanggar: Number(result[0].jml_melanggar_22),
                    },
                    {
                        name: '23:00',
                        penimbangan: Number(result[0].jml_timbang_23),
                        melanggar: Number(result[0].jml_melanggar_23),
                    },

                ]

                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: response
                });
            } else {
                res.send({ 
                    success: false,
                    message: 'BPTD ID dan Lokasi ID tidak boleh kosong'
                });
            }
        } catch (error) {

        }
    }

    const chartPenindakan = async (req, res, next) => {
        try {
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;

            if (bptd_id && lokasi) {

                var sql = `SELECT 
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 00 THEN 1 ELSE NULL END) AS jml_tindak_00,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 01 THEN 1 ELSE NULL END) AS jml_tindak_01,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 02 THEN 1 ELSE NULL END) AS jml_tindak_02,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 03 THEN 1 ELSE NULL END) AS jml_tindak_03,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 04 THEN 1 ELSE NULL END) AS jml_tindak_04,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 05 THEN 1 ELSE NULL END) AS jml_tindak_05,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 06 THEN 1 ELSE NULL END) AS jml_tindak_06,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 07 THEN 1 ELSE NULL END) AS jml_tindak_07,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 08 THEN 1 ELSE NULL END) AS jml_tindak_08,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 09 THEN 1 ELSE NULL END) AS jml_tindak_09,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 10 THEN 1 ELSE NULL END) AS jml_tindak_10,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 11 THEN 1 ELSE NULL END) AS jml_tindak_11,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 12 THEN 1 ELSE NULL END) AS jml_tindak_12,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 13 THEN 1 ELSE NULL END) AS jml_tindak_13,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 14 THEN 1 ELSE NULL END) AS jml_tindak_14,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 15 THEN 1 ELSE NULL END) AS jml_tindak_15,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 16 THEN 1 ELSE NULL END) AS jml_tindak_16,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 17 THEN 1 ELSE NULL END) AS jml_tindak_17,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 18 THEN 1 ELSE NULL END) AS jml_tindak_18,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 19 THEN 1 ELSE NULL END) AS jml_tindak_19,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 20 THEN 1 ELSE NULL END) AS jml_tindak_20,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 21 THEN 1 ELSE NULL END) AS jml_tindak_21,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 22 THEN 1 ELSE NULL END) AS jml_tindak_22,
                                COUNT(CASE WHEN date_part('hour', tgl_penindakan) = 23 THEN 1 ELSE NULL END) AS jml_tindak_23
                        FROM jt_penindakan WHERE DATE(tgl_penindakan) = CURRENT_DATE AND is_active = true AND is_deleted = false AND bptd_id = ${bptd_id} AND lokasi_id = ${lokasi}`;

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });

                const response = [
                    {
                        name: '00:00',
                        penindakan: Number(result[0].jml_tindak_00),
                    },
                    {
                        name: '01:00',
                        penindakan: Number(result[0].jml_tindak_01),
                    },
                    {
                        name: '02:00',
                        penindakan: Number(result[0].jml_tindak_02),
                    },
                    {
                        name: '03:00',
                        penindakan: Number(result[0].jml_tindak_03),
                    },
                    {
                        name: '04:00',
                        penindakan: Number(result[0].jml_tindak_04),
                    },
                    {
                        name: '05:00',
                        penindakan: Number(result[0].jml_tindak_05),
                    },
                    {
                        name: '06:00',
                        penindakan: Number(result[0].jml_tindak_06),
                    },
                    {
                        name: '07:00',
                        penindakan: Number(result[0].jml_tindak_07),
                    },
                    {
                        name: '08:00',
                        penindakan: Number(result[0].jml_tindak_08),
                    },
                    {
                        name: '09:00',
                        penindakan: Number(result[0].jml_tindak_09),
                    },
                    {
                        name: '10:00',
                        penindakan: Number(result[0].jml_tindak_10),
                    },
                    {
                        name: '11:00',
                        penindakan: Number(result[0].jml_tindak_11),
                    },
                    {
                        name: '12:00',
                        penindakan: Number(result[0].jml_tindak_12),
                    },
                    {
                        name: '13:00',
                        penindakan: Number(result[0].jml_tindak_13),
                    },
                    {
                        name: '14:00',
                        penindakan: Number(result[0].jml_tindak_14),
                    },
                    {
                        name: '15:00',
                        penindakan: Number(result[0].jml_tindak_15),
                    },
                    {
                        name: '16:00',
                        penindakan: Number(result[0].jml_tindak_16),
                    },
                    {
                        name: '17:00',
                        penindakan: Number(result[0].jml_tindak_17),
                    },
                    {
                        name: '18:00',
                        penindakan: Number(result[0].jml_tindak_18),
                    },
                    {
                        name: '19:00',
                        penindakan: Number(result[0].jml_tindak_19),
                    },
                    {
                        name: '20:00',
                        penindakan: Number(result[0].jml_tindak_20),
                    },
                    {
                        name: '21:00',
                        penindakan: Number(result[0].jml_tindak_21),
                    },
                    {
                        name: '22:00',
                        penindakan: Number(result[0].jml_tindak_22),
                    },
                    {
                        name: '23:00',
                        penindakan: Number(result[0].jml_tindak_23),
                    },

                ]

                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: response
                });
            } else {
                res.send({ 
                    success: false,
                    message: 'BPTD ID dan Lokasi ID tidak boleh kosong'
                });
            }
        } catch (error) {

        }
    }

    const getTimbanganLokal = async (req, res, next) => {
        console.log("--------------------::Processing Get Timbangan Lokal UPPKB::--------------------");
        try {
            var iplocal = req.query.iplocal;

            if (iplocal) {
                console.log('IP Lokal UPPKB : ', iplocal);

                const urlJto = `http://${iplocal}:8021/api/v2pb/timbangan/local/active`;
                console.log('URL JTO: ', urlJto);
                // const urlJto = `${process.env.APP_API_JTO_KEMENHUB}/v2pb/jto/kendaraan/ujiberkala?nokend=${nokend.toUpperCase()}`;
                var config_axios = {
                    method: 'GET',
                    timeout: 5000,
                    url: urlJto // 'https://jto.dephub.go.id/api/v2/v2pb/jto/kendaraan/qrcode?qr=https://ujiberkala.dephub.go.id/qr/vi/C11D34C1DA66E9F89A2BF31EAF8DE7C9'.toString(),
                };
                var arr = [];
                const response = await axios(config_axios);
                // console.log('ERR', response);

                if (response.data.success) {
                    var data = response.data.data;
                    console.log('DATA TIMBANGAN LOKAL : ', data);

                    res.send({
                        success: true,
                        message: messageService().GET_SUCCESS,
                        data: data
                    });
                }
            // } catch (error) {
            //     console.log('ERROR RESPONSE : ', error.response);
            //     console.log('ERROR RESPONSE JTO SERVER');

            //     if (error.response) {
            //         console.log(error.response.data);
            //         console.log(error.response.status);
            //         console.log(error.response.headers);
            //     }
            //     res.send({ 
            //         success: false,
            //         message: 'Tidak Konek Server Lokal UPPKB'
            //     });
            // }
            } else {
                res.send({ 
                    success: false,
                    message: 'IP tidak boleh kosong'
                });
            }

        } catch (error) {
            next(error);
        }
    }

    return {
        resumeLive,
        chartPenimbangan,
        chartPenindakan,
        getTimbanganLokal,
    }
}

module.exports = LivePenimbanganController;