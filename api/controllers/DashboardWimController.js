const {
    t_lokasi,
    t_streaming,
    t_kota_kab,
    t_provinsi,
    t_bptd,
    sequelize
} = require('../models');

const { Op, QueryTypes, where } = require('sequelize');
const messageService = require('../services/message.service');
const moment = require('moment');
const {
    getLokasiUppkbKode
} = require('./lib/dataid');
const config = require('../../config/config');
const path = require("path");
var QRCode = require('qrcode');
const { reportTemplate } = require('../controllers/lib/report_template');
let ejs = require("ejs");
const { generatePdfFile } = require('../middleware/pdfGenerator');

const excel = require('exceljs');
const { encrypt } = require('./lib/aescrypt');

const DashboardWimController = () => {

    const chartPer15Menit = async (req, res, next) => {
        try {
            const tanggal = req.query.tanggal || moment().format('YYYY-MM-DD');
            const lokasi = req.query.lkd;
            let where = `WHERE DATE(tgl_penimbangan) = '${tanggal}'`;
            if (lokasi) where += ` AND kode_uppkb = '${lokasi}'`;
    
            const sql = `
                SELECT 
                    FLOOR(EXTRACT(HOUR FROM tgl_penimbangan)) AS jam,
                    FLOOR(EXTRACT(MINUTE FROM tgl_penimbangan) / 15) AS kuartal,
                    COUNT(*) as penimbangan,
                    COUNT(*) FILTER (WHERE is_melanggar = true) as melanggar
                FROM jt_log_wim
                ${where}
                GROUP BY jam, kuartal
                ORDER BY jam, kuartal
            `;
    
            const result = await sequelize.query(sql, { type: QueryTypes.SELECT });
    
            const response = result.map(item => {
                const startMinute = item.kuartal * 15;
                const endMinute = startMinute + 14;
                const label = `${String(item.jam).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} - ${String(item.jam).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    
                return {
                    name: label,
                    penimbangan: Number(item.penimbangan),
                    melanggar: Number(item.melanggar),
                    normal: Number(item.penimbangan) - Number(item.melanggar)
                };
            });
    
            res.send({ success: true, data: response });
        } catch (error) {
            next(error);
        }
    };
    
    const chartPerJam = async (req, res, next) => {
        try {
            const interval = req.query.interval;
            const tgl = req.query.tgl;
            const jam_awal = req.query.jam_awal;
            const jam_akhir = req.query.jam_akhir;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;
            let kode_uppkb;
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const ruas_id = req.query.ruas;

            if (lokasi_id) {
                kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            }

            // let where_sql = `kode_uppkb = '${kode_uppkb}' AND tgl_penimbangan BETWEEN '${moment(tgl_awal).format('YYYY-MM-DD')} 00:00:00' AND '${moment(tgl_akhir).format('YYYY-MM-DD')} 23:59:59'`;

            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_log_wim.tgl_penimbangan')),
                    { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                )
            ];

            // if (interval == 'jam') {
            const waktuMulai = moment(`${tgl} ${jam_awal}:00`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            const waktuSelesai = moment(`${tgl} ${jam_akhir}:00`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                // conditions = [
                //     sequelize.where(
                //         sequelize.col('t_log_wim.tgl_penimbangan'),
                //         {
                //             [Op.between]: [waktuMulai, waktuSelesai]
                //         }
                //     )
                // ];
            var where_sql = `kode_uppkb = '${kode_uppkb}' AND tgl_penimbangan BETWEEN '${waktuMulai}' AND '${waktuSelesai}'`;
            // }

            if (bptd_id) {
                const uppkbIds = await t_lokasi.findAll({
                    attributes: ['kode'],
                    where: {
                        bptd_id: bptd_id
                    }
                }).map(uppkb => uppkb.kode);

                conditions.push({
                    kode_uppkb: {
                        [Op.in]: uppkbIds
                    }
                });
            }

            if (kode_uppkb) {
                conditions.push({
                    kode_uppkb: kode_uppkb
                });
            }

            if (ruas_id) {
                conditions.push({
                    ruas_id: ruas_id
                });
            }
    
            const sql = `
                SELECT 
                    EXTRACT(HOUR FROM tgl_penimbangan) as jam,
                    COUNT(*) as penimbangan,
                    COUNT(*) FILTER (WHERE is_melanggar = true) as melanggar
                FROM jt_log_wim
                WHERE ${where_sql}
                GROUP BY jam
                ORDER BY jam
            `;
            // console.log(sql);
            const result = await sequelize.query(sql, { type: QueryTypes.SELECT });
    
            const response = result.map(item => ({
                name: `${item.jam}:00`,
                penimbangan: Number(item.penimbangan),
                melanggar: Number(item.melanggar),
                normal: Number(item.penimbangan) - Number(item.melanggar)
            }));
    
            res.send({ success: true, data: response });
        } catch (error) {
            next(error);
        }
    };

    const chartPerHari = async (req, res) => {
        try {
            const interval = req.query.interval;
            const tgl = req.query.tgl;
            const jam_awal = req.query.jam_awal;
            const jam_akhir = req.query.jam_akhir;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;
            let kode_uppkb;
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const ruas_id = req.query.ruas;

            if (lokasi_id) {
                kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            }

            let where_sql = `kode_uppkb = '${kode_uppkb}' AND tgl_penimbangan BETWEEN '${moment(tgl_awal).format('YYYY-MM-DD')} 00:00:00' AND '${moment(tgl_akhir).format('YYYY-MM-DD')} 23:59:59'`;

            // let conditions = [
            //     sequelize.where(
            //         sequelize.fn('DATE', sequelize.col('t_log_wim.tgl_penimbangan')),
            //         { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
            //     )
            // ];
    
            const sql = `
                SELECT 
                    DATE(tgl_penimbangan) as tanggal,
                    COUNT(*) as penimbangan,
                    COUNT(*) FILTER (WHERE is_melanggar = true) as melanggar
                FROM jt_log_wim
                WHERE ${where_sql}
                GROUP BY tanggal
                ORDER BY tanggal
            `;

            console.log(sql);

            const result = await sequelize.query(sql, { type: QueryTypes.SELECT });
    
            const response = result.map(item => ({
                name: moment(item.tanggal).format('YYYY-MM-DD'),
                penimbangan: Number(item.penimbangan),
                melanggar: Number(item.melanggar),
                normal: Number(item.penimbangan) - Number(item.melanggar)
            }));
    
            res.send({ success: true, data: response });
        } catch (error) {
            next(error);
        }
    };
    
    const chartBulanan = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lkd;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE date_part('year', tgl_penimbangan) = ${year} AND bptd_id = ${bptd_id}`;
            } else if (lokasi) {
                $where = `WHERE date_part('year', tgl_penimbangan) = ${year} AND kode_uppkb = '${lokasi}'`;
            } else {
                $where = `WHERE date_part('year', tgl_penimbangan) = ${year}`;
            }
            console.log($where);

            var sql = `SELECT 
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 1 THEN 1 ELSE NULL END) AS jml_timbang_jan,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 1 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_jan,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 2 THEN 1 ELSE NULL END) AS jml_timbang_feb,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 2 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_feb,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 3 THEN 1 ELSE NULL END) AS jml_timbang_mar,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 3 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_mar,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 4 THEN 1 ELSE NULL END) AS jml_timbang_apr,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 4 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_apr,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 5 THEN 1 ELSE NULL END) AS jml_timbang_mei,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 5 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_mei,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 6 THEN 1 ELSE NULL END) AS jml_timbang_jun,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 6 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_jun,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 7 THEN 1 ELSE NULL END) AS jml_timbang_jul,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 7 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_jul,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 8 THEN 1 ELSE NULL END) AS jml_timbang_agt,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 8 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_agt,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 9 THEN 1 ELSE NULL END) AS jml_timbang_sep,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 9 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_sep,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 10 THEN 1 ELSE NULL END) AS jml_timbang_okt,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 10 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_okt,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 11 THEN 1 ELSE NULL END) AS jml_timbang_nov,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 11 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_nov,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 12 THEN 1 ELSE NULL END) AS jml_timbang_des,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 12 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_des
                    FROM jt_log_wim ${$where}`;
            console.log(sql);
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            const response = [
                {
                    name: 'Januari',
                    penimbangan: Number(result[0].jml_timbang_jan),
                    melanggar: Number(result[0].jml_melanggar_jan),
                    normal: Number(result[0].jml_timbang_jan) - Number(result[0].jml_melanggar_jan),
                },
                {
                    name: 'Februari',
                    penimbangan: Number(result[0].jml_timbang_feb),
                    melanggar: Number(result[0].jml_melanggar_feb),
                    normal: Number(result[0].jml_timbang_feb) - Number(result[0].jml_melanggar_feb),
                },
                {
                    name: 'Maret',
                    penimbangan: Number(result[0].jml_timbang_mar),
                    melanggar: Number(result[0].jml_melanggar_mar),
                    normal: Number(result[0].jml_timbang_mar) - Number(result[0].jml_melanggar_mar),
                },
                {
                    name: 'April',
                    penimbangan: Number(result[0].jml_timbang_apr),
                    melanggar: Number(result[0].jml_melanggar_apr),
                    normal: Number(result[0].jml_timbang_apr) - Number(result[0].jml_melanggar_apr),
                },
                {
                    name: 'Mei',
                    penimbangan: Number(result[0].jml_timbang_mei),
                    melanggar: Number(result[0].jml_melanggar_mei),
                    normal: Number(result[0].jml_timbang_mei) - Number(result[0].jml_melanggar_mei),
                },
                {
                    name: 'Juni',
                    penimbangan: Number(result[0].jml_timbang_jun),
                    melanggar: Number(result[0].jml_melanggar_jun),
                    normal: Number(result[0].jml_timbang_jun) - Number(result[0].jml_melanggar_jun),
                },
                {
                    name: 'Juli',
                    penimbangan: Number(result[0].jml_timbang_jul),
                    melanggar: Number(result[0].jml_melanggar_jul),
                    normal: Number(result[0].jml_timbang_jul) - Number(result[0].jml_melanggar_jul),
                },
                {
                    name: 'Agustus',
                    penimbangan: Number(result[0].jml_timbang_agt),
                    melanggar: Number(result[0].jml_melanggar_agt),
                    normal: Number(result[0].jml_timbang_agt) - Number(result[0].jml_melanggar_agt),
                },
                {
                    name: 'September',
                    penimbangan: Number(result[0].jml_timbang_sep),
                    melanggar: Number(result[0].jml_melanggar_sep),
                    normal: Number(result[0].jml_timbang_sep) - Number(result[0].jml_melanggar_sep),
                },
                {
                    name: 'Oktober',
                    penimbangan: Number(result[0].jml_timbang_okt),
                    melanggar: Number(result[0].jml_melanggar_okt),
                    normal: Number(result[0].jml_timbang_okt) - Number(result[0].jml_melanggar_okt),
                },
                {
                    name: 'November',
                    penimbangan: Number(result[0].jml_timbang_nov),
                    melanggar: Number(result[0].jml_melanggar_nov),
                    normal: Number(result[0].jml_timbang_nov) - Number(result[0].jml_melanggar_nov),
                },
                {
                    name: 'Desember',
                    penimbangan: Number(result[0].jml_timbang_des),
                    melanggar: Number(result[0].jml_melanggar_des),
                    normal: Number(result[0].jml_timbang_des) - Number(result[0].jml_melanggar_des),
                },

            ]

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: response
            });
        } catch (error) {

        }
    }

    const chartTahunan = async (req, res) => {
        try {
            const tahunAwal = req.query.mulai || moment().subtract(5, 'years').format('YYYY');
            const tahunAkhir = req.query.sampai || moment().format('YYYY');
            const lokasi = req.query.lkd;
            let where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) BETWEEN ${tahunAwal} AND ${tahunAkhir}`;
            if (lokasi) where += ` AND kode_uppkb = '${lokasi}'`;
    
            const sql = `
                SELECT 
                    EXTRACT(YEAR FROM tgl_penimbangan) as tahun,
                    COUNT(*) as penimbangan,
                    COUNT(*) FILTER (WHERE is_melanggar = true) as melanggar
                FROM jt_log_wim
                ${where}
                GROUP BY tahun
                ORDER BY tahun
            `;
            const result = await sequelize.query(sql, { type: QueryTypes.SELECT });
    
            const response = result.map(item => ({
                name: item.tahun,
                penimbangan: Number(item.penimbangan),
                melanggar: Number(item.melanggar),
                normal: Number(item.penimbangan) - Number(item.melanggar)
            }));
    
            res.send({ success: true, data: response });
        } catch (error) {
            next(error);
        }
    };
    

    const chartPenimbangan = async (req, res, next) => {
        var type = req.query.interval;
        console.log(type);
        switch (type) {
            case 'jam':
                return chartPerJam(req, res, next);
            case 'harian':
                return chartPerHari(req, res, next);
            default:
                return chartPerJam(req, res, next);
                // return res.status(400).send({ success: false, message: 'Invalid chart type' });
        }        
    }

    const chartPenindakan = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE is_transaksi = 1 AND date_part('year', tgl_penimbangan) = ${year} AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
            } else if (lokasi) {
                $where = `WHERE is_transaksi = 1 AND date_part('year', tgl_penimbangan) = ${year} AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
            } else {
                $where = `WHERE is_transaksi = 1 AND date_part('year', tgl_penimbangan) = ${year} AND is_active = true AND is_deleted = false`;
            }
            console.log($where);

            var sql = `SELECT 
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 1 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_jan,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 1 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_jan,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 2 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_feb,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 2 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_feb,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 3 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_mar,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 3 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_mar,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 4 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_apr,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 4 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_apr,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 5 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_mei,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 5 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_mei,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 6 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_jun,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 6 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_jun,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 7 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_jul,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 7 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_jul,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 8 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_agt,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 8 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_agt,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 9 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_sep,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 9 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_sep,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 10 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_okt,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 10 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_okt,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 11 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_nov,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 11 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_nov,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 12 AND is_tindakan = true THEN 1 ELSE NULL END) AS jml_tindak_des,
                        COUNT(CASE WHEN date_part('month', tgl_penimbangan) = 12 AND is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar_des
                    FROM jt_penimbangan ${$where}`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            const response = [
                {
                    name: 'Januari',
                    penindakan: Number(result[0].jml_tindak_jan),
                    melanggar: Number(result[0].jml_melanggar_jan),
                },
                {
                    name: 'Februari',
                    penindakan: Number(result[0].jml_tindak_feb),
                    melanggar: Number(result[0].jml_melanggar_feb),
                },
                {
                    name: 'Maret',
                    penindakan: Number(result[0].jml_tindak_mar),
                    melanggar: Number(result[0].jml_melanggar_mar),
                },
                {
                    name: 'April',
                    penindakan: Number(result[0].jml_tindak_apr),
                    melanggar: Number(result[0].jml_melanggar_apr),
                },
                {
                    name: 'Mei',
                    penindakan: Number(result[0].jml_tindak_mei),
                    melanggar: Number(result[0].jml_melanggar_mei),
                },
                {
                    name: 'Juni',
                    penindakan: Number(result[0].jml_tindak_jun),
                    melanggar: Number(result[0].jml_melanggar_jun),
                },
                {
                    name: 'Juli',
                    penindakan: Number(result[0].jml_tindak_jul),
                    melanggar: Number(result[0].jml_melanggar_jul),
                },
                {
                    name: 'Agustus',
                    penindakan: Number(result[0].jml_tindak_agt),
                    melanggar: Number(result[0].jml_melanggar_agt),
                },
                {
                    name: 'September',
                    penindakan: Number(result[0].jml_tindak_sep),
                    melanggar: Number(result[0].jml_melanggar_sep),
                },
                {
                    name: 'Oktober',
                    penindakan: Number(result[0].jml_tindak_okt),
                    melanggar: Number(result[0].jml_melanggar_okt),
                },
                {
                    name: 'November',
                    penindakan: Number(result[0].jml_tindak_nov),
                    melanggar: Number(result[0].jml_melanggar_nov),
                },
                {
                    name: 'Desember',
                    penindakan: Number(result[0].jml_tindak_des),
                    melanggar: Number(result[0].jml_melanggar_des),
                },

            ]

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: response
            });
        } catch (error) {

        }
    }

    const chartJmlJenisPelanggaran = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `AND jn.bptd_id = ${bptd_id} `;
            } else if (lokasi) {
                $where = `AND jn.lokasi_id = ${lokasi} `;
            } else {
                $where = '';
            }

            var sql = `SELECT 
                            jjp.nama AS name,
                            COUNT(jp.id) AS melanggar
                        FROM 
                            jt_jenis_pelanggaran jjp
                        LEFT JOIN 
                            jt_pelanggaran jp ON jp.jenis_pelanggaran_id = jjp.id
                        LEFT JOIN 
                            jt_penimbangan jn ON (jn.kode_trx = jp.kode_trx)
                        WHERE 
                            jjp.is_active = true 
                            AND jjp.is_deleted = false 
                            AND date_part('year', jn.tgl_penimbangan) = ${year} 
                            ${$where}
                            AND jn.is_transaksi = 1 
                            AND jn.jbi_uji > 0::double precision 
                            AND (
                                (jp.jenis_pelanggaran_id = 1 AND round(jn.prosen_lebih) > 5)
                                OR jp.jenis_pelanggaran_id <> 1
                            ) 
                            AND jn.berat_timbang > 500 
                            AND jn.berat_timbang IS NOT NULL 
                            AND jn.berat_timbang <> 'NaN' 
                            AND jn.is_active = true 
                            AND jn.is_deleted = false 
                            AND jn.is_melanggar = true 
                        GROUP BY 
                            jjp.id, jjp.nama;`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }

    }

    const chartLebihMuat = async (req, res, next) => {
        try {

            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `AND bptd_id = ${bptd_id} `;
            } else if (lokasi) {
                $where = `AND lokasi_id = ${lokasi} `;
            } else {
                $where = '';
            }

            var sql = `SELECT
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 5 AND round(jt_penimbangan.prosen_lebih) <= 20 THEN 1
                                    ELSE NULL
                                END) AS range_5_20,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 21 AND round(jt_penimbangan.prosen_lebih) <= 40 THEN 1
                                    ELSE NULL
                                END) AS range_21_40,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 41 AND round(jt_penimbangan.prosen_lebih) <= 60 THEN 1
                                    ELSE NULL
                                END) AS range_41_60,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 61 AND round(jt_penimbangan.prosen_lebih) <= 80 THEN 1
                                    ELSE NULL
                                END) AS range_61_80,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 81 AND round(jt_penimbangan.prosen_lebih) <= 100 THEN 1
                                    ELSE NULL
                                END) AS range_81_100,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 100 THEN 1
                                    ELSE NULL
                                END) AS range_up_100,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 5 THEN 1
                                    ELSE NULL
                                END) AS total
                        FROM 
                            jt_penimbangan
                        JOIN 
                            jt_pelanggaran ON jt_penimbangan.kode_trx = jt_pelanggaran.kode_trx
                        WHERE 
                            date_part('year', jt_penimbangan.tgl_penimbangan) = ${year} 
                            ${$where}
                            AND jt_penimbangan.is_transaksi = 1 
                            AND jt_penimbangan.jbi_uji > 0::double precision 
                            AND jt_pelanggaran.jenis_pelanggaran_id = 1
                            AND jt_penimbangan.berat_timbang > 500::double precision 
                            AND jt_penimbangan.berat_timbang IS NOT NULL 
                            AND jt_penimbangan.berat_timbang <> 'NaN'::double precision
                            AND jt_penimbangan.is_active = true 
                            AND jt_penimbangan.is_deleted = false 
                            AND jt_penimbangan.is_melanggar = true`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            const response = [
                {
                    name: '5 - 20%',
                    pelanggaran: Number(result[0].range_5_20),
                },
                {
                    name: '21 - 40%',
                    pelanggaran: Number(result[0].range_21_40),
                },
                {
                    name: '41 - 60%',
                    pelanggaran: Number(result[0].range_41_60),
                },
                {
                    name: '61 - 80%',
                    pelanggaran: Number(result[0].range_61_80),
                },
                {
                    name: '81 - 100%',
                    pelanggaran: Number(result[0].range_81_100),
                },
                {
                    name: '> 100%',
                    pelanggaran: Number(result[0].range_up_100),
                },
            ]

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: response
            });

        } catch (error) {
            next(error);
        }
    }

    const toptenMelanggarAsalTujuan = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var jnsp = req.query.jnsp || 1;
            var limit = req.query.limit;
            if (limit) {
                $lmt = `LIMIT ${limit}`;
            } else {
                $lmt = '';
            }
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE jt_penimbangan.is_transaksi = 1 AND bptd_id = ${bptd_id} AND jt_penimbangan.is_melanggar = true AND jt_penimbangan.is_active = true AND jt_penimbangan.is_deleted = false`;
            } else if (lokasi) {
                $where = `WHERE jt_penimbangan.is_transaksi = 1 AND lokasi_id = ${lokasi} AND jt_penimbangan.is_melanggar = true AND jt_penimbangan.is_active = true AND jt_penimbangan.is_deleted = false`;
            } else {
                $where = `WHERE jt_penimbangan.is_transaksi = 1 AND jt_penimbangan.is_melanggar = true AND jt_penimbangan.is_active = true AND jt_penimbangan.is_deleted = false`;
            }
            // var sql = `SELECT 
            //         jt_kota_asal.nama as kota_asal, jt_kota_tujuan.nama as kota_tujuan, CONCAT(jt_kota_asal.nama, ' - ', jt_kota_tujuan.nama) AS asal_tujuan, COUNT(*) as jml
            //        FROM jt_penimbangan
            //        INNER JOIN jt_kota_kab jt_kota_asal ON (jt_penimbangan.asal_kota_id = jt_kota_asal.id)
            //        INNER JOIN jt_kota_kab jt_kota_tujuan ON (jt_penimbangan.tujuan_kota_id = jt_kota_tujuan.id)
            //        ${$where} AND date_part('year', jt_penimbangan.tgl_penimbangan) = ${year}
            //        GROUP BY jt_kota_asal.nama, jt_kota_tujuan.nama
            //        ORDER BY jml DESC LIMIT 5`;

            if (jnsp == 1) {
                var sql = `SELECT 
                            jt_kota_asal.nama AS kota_asal,
                            jt_kota_tujuan.nama AS kota_tujuan,
                            CONCAT(jt_kota_asal.nama, ' - ', jt_kota_tujuan.nama) AS asal_tujuan,
                            COUNT(DISTINCT jt_penimbangan.id) AS jml,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DYA' THEN 1 ELSE 0 END) AS daya_angkut,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DIM' THEN 1 ELSE 0 END) AS dimensi,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'PST' THEN 1 ELSE 0 END) AS persyaratan_teknis,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DOK' THEN 1 ELSE 0 END) AS dokumen,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'TCM' THEN 1 ELSE 0 END) AS tata_cara_muat,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'KLS' THEN 1 ELSE 0 END) AS kelas_jalan
                        FROM 
                            jt_penimbangan
                        INNER JOIN 
                            jt_kota_kab AS jt_kota_asal ON (jt_penimbangan.asal_kota_id = jt_kota_asal.id)
                        INNER JOIN 
                            jt_kota_kab AS jt_kota_tujuan ON (jt_penimbangan.tujuan_kota_id = jt_kota_tujuan.id)
                        LEFT JOIN 
                            jt_pelanggaran ON jt_penimbangan.kode_trx = jt_pelanggaran.kode_trx
                        ${$where} 
                            AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                        GROUP BY 
                            jt_kota_asal.nama, jt_kota_tujuan.nama
                        ORDER BY 
                            jml DESC
                        ${$lmt};`;
            } else {
                var sql = `SELECT 
                            jt_kota_asal.nama AS kota_asal,
                            jt_kota_tujuan.nama AS kota_tujuan,
                            CONCAT(jt_kota_asal.nama, ' - ', jt_kota_tujuan.nama) AS asal_tujuan,
                            COUNT(DISTINCT jt_penimbangan.id) AS jml,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DYA' THEN 1 ELSE NULL END) AS daya_angkut,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DIM' THEN 1 ELSE NULL END) AS dimensi,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'PST' THEN 1 ELSE NULL END) AS persyaratan_teknis,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DOK' THEN 1 ELSE NULL END) AS dokumen,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'TCM' THEN 1 ELSE NULL END) AS tata_cara_muat,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'KLS' THEN 1 ELSE NULL END) AS kelas_jalan
                        FROM 
                            jt_penimbangan
                        INNER JOIN 
                            jt_kota_kab AS jt_kota_asal ON (jt_penimbangan.asal_kota_id = jt_kota_asal.id)
                        INNER JOIN 
                            jt_kota_kab AS jt_kota_tujuan ON (jt_penimbangan.tujuan_kota_id = jt_kota_tujuan.id)
                        LEFT JOIN 
                            jt_pelanggaran ON jt_penimbangan.kode_trx = jt_pelanggaran.kode_trx
                        ${$where} 
                            AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                        GROUP BY 
                            jt_kota_asal.nama, jt_kota_tujuan.nama
                        ORDER BY 
                            jml DESC
                        ${$lmt};`;
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
        } catch (error) {
            next(error);
        }
    }

    const toptenMelanggarPerusahaan = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var jnsp = req.query.jnsp || 1;
            var limit = req.query.limit;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE jt_penimbangan.is_transaksi = 1 AND date_part('year', jt_penimbangan.tgl_penimbangan) = ${year} AND jt_penimbangan.kategori_kepemilikan_id = 2 AND jt_penimbangan.bptd_id = ${bptd_id} AND jt_penimbangan.is_melanggar = true AND jt_penimbangan.is_active = true AND jt_penimbangan.is_deleted = false AND jt_penimbangan.nama_pemilik != '0'`;
            } else if (lokasi) {
                $where = `WHERE jt_penimbangan.is_transaksi = 1 AND date_part('year', jt_penimbangan.tgl_penimbangan) = ${year} AND jt_penimbangan.kategori_kepemilikan_id = 2 AND jt_penimbangan.lokasi_id = ${lokasi} AND jt_penimbangan.is_melanggar = true AND jt_penimbangan.is_active = true AND jt_penimbangan.is_deleted = false AND jt_penimbangan.nama_pemilik != '0'`;
            } else {
                $where = `WHERE jt_penimbangan.is_transaksi = 1 AND date_part('year', jt_penimbangan.tgl_penimbangan) = ${year} AND jt_penimbangan.kategori_kepemilikan_id = 2 AND jt_penimbangan.is_melanggar = true AND jt_penimbangan.is_active = true AND jt_penimbangan.is_deleted = false AND jt_penimbangan.nama_pemilik != '0'`;
            }

            if (limit) {
                $lmt = `LIMIT ${limit}`;
            } else {
                $lmt = '';
            }

            if (jnsp == 1) {
                var sql = `SELECT
                            REPLACE(jt_penimbangan.nama_pemilik, '.', '') AS nama_pemilik,
                            COUNT(DISTINCT jt_penimbangan.id) AS jml,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DYA' THEN 1 ELSE 0 END) AS daya_angkut,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DIM' THEN 1 ELSE 0 END) AS dimensi,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'PST' THEN 1 ELSE 0 END) AS persyaratan_teknis,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DOK' THEN 1 ELSE 0 END) AS dokumen,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'TCM' THEN 1 ELSE 0 END) AS tata_cara_muat,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'KLS' THEN 1 ELSE 0 END) AS kelas_jalan
                        FROM 
                            jt_penimbangan
                        LEFT JOIN 
                            jt_pelanggaran ON jt_penimbangan.kode_trx = jt_pelanggaran.kode_trx
                        ${$where}
                        GROUP BY 
                            REPLACE(jt_penimbangan.nama_pemilik, '.', '')
                        ORDER BY 
                            jml DESC 
                        ${$lmt}`;
            } else {
                var sql = `SELECT
                            REPLACE(jt_penimbangan.nama_pemilik, '.', '') AS nama_pemilik,
                            COUNT(DISTINCT jt_penimbangan.id) AS jml,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DYA' THEN 1 ELSE NULL END) AS daya_angkut,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DIM' THEN 1 ELSE NULL END) AS dimensi,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'PST' THEN 1 ELSE NULL END) AS persyaratan_teknis,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'DOK' THEN 1 ELSE NULL END) AS dokumen,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'TCM' THEN 1 ELSE NULL END) AS tata_cara_muat,
                            SUM(CASE WHEN jt_pelanggaran.kode_pelanggaran = 'KLS' THEN 1 ELSE NULL END) AS kelas_jalan
                        FROM 
                            jt_penimbangan
                        LEFT JOIN 
                            jt_pelanggaran ON jt_penimbangan.kode_trx = jt_pelanggaran.kode_trx
                        ${$where}
                        GROUP BY 
                            REPLACE(jt_penimbangan.nama_pemilik, '.', '')
                        ORDER BY 
                            jml DESC 
                        ${$lmt}`;
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

        } catch (error) {
            next(error);
        }
    }

    const toptenMelanggarKomoditi = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var limit = req.query.limit;
            if (limit) {
                $lmt = `LIMIT ${limit}`;
            } else {
                $lmt = '';
            }
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `jt_penimbangan.is_transaksi = 1
                            AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.bptd_id = ${bptd_id}
                            AND jt_penimbangan.is_melanggar = true
                            AND jt_penimbangan.is_active = true
                            AND jt_penimbangan.is_deleted = false
                            AND jt_komoditi.nama NOT LIKE '%KOSONG%'`;
            } else if (lokasi) {
                $where = `jt_penimbangan.is_transaksi = 1
                            AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.lokasi_id = ${lokasi}
                            AND jt_penimbangan.is_melanggar = true
                            AND jt_penimbangan.is_active = true
                            AND jt_penimbangan.is_deleted = false
                            AND jt_komoditi.nama NOT LIKE '%KOSONG%'`;
            } else {
                $where = `jt_penimbangan.is_transaksi = 1
                            AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.is_melanggar = TRUE
                            AND jt_penimbangan.is_active = TRUE
                            AND jt_penimbangan.is_deleted = FALSE
                            AND jt_komoditi.nama NOT LIKE '%KOSONG%'`;
            }

            var sql = `SELECT 
                        CASE 
                            WHEN nama ILIKE '%PASIR%' THEN 'PASIR'
                            WHEN nama ILIKE '%SEMEN%' THEN 'SEMEN'
		                    WHEN nama ILIKE '%PAKET%' THEN 'BARANG PAKET'
                            ELSE nama
                        END AS nama,
                        MAX(tgl_penimbangan) AS tgl_terakhir,
                        COUNT(*) AS jml
                        FROM (
                            SELECT 
                                jt_komoditi.nama,
                                jt_penimbangan.tgl_penimbangan
                            FROM jt_penimbangan
                            INNER JOIN jt_detail_muatan ON jt_penimbangan.kode_trx = jt_detail_muatan.kode_trx
                            INNER JOIN jt_komoditi ON jt_detail_muatan.komoditi_id = jt_komoditi.id
                            WHERE ${$where}
                        ) AS subquery
                        GROUP BY 
                        CASE 
                            WHEN nama ILIKE '%PASIR%' THEN 'PASIR'
                            WHEN nama ILIKE '%SEMEN%' THEN 'SEMEN'
		                    WHEN nama ILIKE '%PAKET%' THEN 'BARANG PAKET'
                            ELSE nama
                        END
                        ORDER BY jml DESC, tgl_terakhir DESC
                        ${$lmt}`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }

    }

    const toptenMelanggarJenisKendaraan = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `jp.is_transaksi = 1 AND date_part('year', jp.tgl_penimbangan) = ${year} AND jp.bptd_id = ${bptd_id} AND jp.is_melanggar = true AND jp.is_active = true AND jp.is_deleted = false`;
            } else if (lokasi) {
                $where = `jp.is_transaksi = 1 AND date_part('year', jp.tgl_penimbangan) = ${year} AND jp.lokasi_id = ${lokasi} AND jp.is_melanggar = true AND jp.is_active = true AND jp.is_deleted = false`;
            } else {
                $where = `jp.is_transaksi = 1 AND date_part('year', jp.tgl_penimbangan) = ${year} AND jp.is_melanggar = true AND jp.is_active = true AND jp.is_deleted = false`;
            }

            var sql = `
                SELECT jjk.nama, COUNT(jp.jenis_kendaraan_id) as jml
                FROM jt_jenis_kendaraan jjk
                LEFT JOIN jt_penimbangan jp ON (jp.jenis_kendaraan_id = jjk.id) AND ${$where}
                WHERE jjk.id <> 52 AND jjk.id <> 40
                GROUP BY jjk.id
                ORDER BY jml DESC
            `
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }

    }

    const topMelanggarKategoriKomoditi = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `jt_penimbangan.is_transaksi = 1
                            AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.bptd_id = ${bptd_id}
                            AND jt_penimbangan.is_melanggar = true
                            AND jt_penimbangan.is_active = true
                            AND jt_penimbangan.is_deleted = false`;
            } else if (lokasi) {
                $where = `jt_penimbangan.is_transaksi = 1
                            AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.lokasi_id = ${lokasi}
                            AND jt_penimbangan.is_melanggar = true
                            AND jt_penimbangan.is_active = true
                            AND jt_penimbangan.is_deleted = false`;
            } else {
                $where = `jt_penimbangan.is_transaksi = 1
                            AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.is_melanggar = TRUE
                            AND jt_penimbangan.is_active = TRUE
                            AND jt_penimbangan.is_deleted = FALSE`;
            }

            var sql = `SELECT 
                        CASE 
                            WHEN nama ILIKE '%MIGRASI%' THEN 'LAINNYA'
                            ELSE nama
                        END AS nama,
                        MAX(tgl_penimbangan) AS tgl_terakhir,
                        COUNT(*) AS jml
                        FROM (
                            SELECT 
                                jt_kategori_komoditi.nama,
                                jt_penimbangan.tgl_penimbangan
                            FROM jt_penimbangan
                            INNER JOIN jt_detail_muatan ON jt_penimbangan.kode_trx = jt_detail_muatan.kode_trx
                            INNER JOIN jt_komoditi ON jt_detail_muatan.komoditi_id = jt_komoditi.id
			                INNER JOIN jt_kategori_komoditi ON jt_kategori_komoditi.id = jt_komoditi.kategori_komoditi_id
                            WHERE ${$where}
                        ) AS subquery
                        GROUP BY 
                        CASE 
                            WHEN nama ILIKE '%MIGRASI%' THEN 'LAINNYA'
                            ELSE nama
                        END
                        ORDER BY nama ASC`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }

    }

    const widgetUppkb = async (req, res, next) => {
        try {

            var sql = `SELECT
                            COUNT(*) AS jml_uppkb,
                            SUM(CASE WHEN status_operasi = 1 THEN 1 ELSE 0 END) AS beroperasi,
                            SUM(CASE WHEN status_operasi = 2 THEN 1 ELSE 0 END) AS tdk_beroperasi,
                            SUM(CASE WHEN status_operasi = 3 THEN 1 ELSE 0 END) AS perbaikan
                        FROM jt_lokasi_uppkb
                        WHERE is_active = TRUE`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }

    }

    const widgetPenimbangan = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            const now = moment();
            const hariIni = moment(now).format('YYYY-MM-DD');
            const kemarin = moment(now).add(-1, 'days').format('YYYY-MM-DD');

            var days = req.query.is_day || false;
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if (days) {
                if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                } else if (lokasi) {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                } else {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND is_active = true AND is_deleted = false`;
                }
    
                let sqlTodays = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$where}`;
                let sqlYesterday = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$whereYesterday}`;
    
                const resultTodays = await sequelize.query(sqlTodays, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                const resultYesterday = await sequelize.query(sqlYesterday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                res.status(200).send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: {
                        hari_ini: Number(resultTodays[0].count),
                        kemarin: Number(resultYesterday[0].count)
                    }
                })
            } else {
                if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                } else if (lokasi) {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                } else {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND is_active = true AND is_deleted = false`;
                }
    
                let sqlToday = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$where}`;
    
                const resultToday = await sequelize.query(sqlToday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                res.status(200).send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: {
                        hari_ini: Number(resultToday[0].count),
                        kemarin: 0
                    }
                })
            }
            
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    const widgetMelanggar = async (req, res, next) => {
        try {

            const tahunIni = moment().format('YYYY');
            const now = moment();
            const hariIni = moment(now).format('YYYY-MM-DD');
            const kemarin = moment(now).add(-1, 'days').format('YYYY-MM-DD');

            var days = req.query.is_day || false;
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if (days) {
                if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND is_melanggar = true AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND is_melanggar = true AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                } else if (lokasi) {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND is_melanggar = true AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND is_melanggar = true AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                } else {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND is_melanggar = true AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND is_melanggar = true AND is_active = true AND is_deleted = false`;
                }
    
                let sqlTodays = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$where}`;
                let sqlYesterday = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$whereYesterday}`;
    
                const resultTodays = await sequelize.query(sqlTodays, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                const resultYesterday = await sequelize.query(sqlYesterday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                res.status(200).send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: {
                        hari_ini: Number(resultTodays[0].count),
                        kemarin: Number(resultYesterday[0].count)
                    }
                })
            } else {
                if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND is_melanggar = true AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                } else if (lokasi) {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND is_melanggar = true AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                } else {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND is_melanggar = true AND is_active = true AND is_deleted = false`;
                }
    
                let sqlToday = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$where}`;
    
                const resultToday = await sequelize.query(sqlToday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                res.status(200).send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: {
                        hari_ini: Number(resultToday[0].count),
                        kemarin: 0
                    }
                })
            }
            
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
    const widgetTidakDiTindak = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            const now = moment();
            const hariIni = moment(now).format('YYYY-MM-DD');
            const kemarin = moment(now).add(-1, 'days').format('YYYY-MM-DD');

            var days = req.query.is_day || false;
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if (days) {
                if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND is_tindakan = false AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND is_tindakan = false AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                } else if (lokasi) {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND is_tindakan = false AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND is_tindakan = false AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                } else {
                    $where = `WHERE tgl_penimbangan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_transaksi = 1 AND is_tindakan = false AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penimbangan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_transaksi = 1 AND is_tindakan = false AND is_active = true AND is_deleted = false`;
                }
    
                let sqlToday = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$where}`;
                let sqlYesterday = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$whereYesterday}`;
    
                const resultToday = await sequelize.query(sqlToday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                const resultYesterday = await sequelize.query(sqlYesterday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                res.status(200).send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: {
                        hari_ini: Number(resultToday[0].count),
                        kemarin: Number(resultYesterday[0].count)
                    }
                })
            } else {
                if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND is_melanggar = true AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                    $wherePenindakan = `WHERE EXTRACT(YEAR FROM tgl_penindakan) = ${year} AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                } else if (lokasi) {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND is_melanggar = true AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                    $wherePenindakan = `WHERE EXTRACT(YEAR FROM tgl_penindakan) = ${year} AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                } else {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penimbangan) = ${year} AND is_transaksi = 1 AND is_melanggar = true AND is_active = true AND is_deleted = false`;
                    $wherePenindakan = `WHERE EXTRACT(YEAR FROM tgl_penindakan) = ${year} AND is_active = true AND is_deleted = false`;
                }
    
                let sqlMelanggar = `SELECT
                                COUNT(*) FROM jt_penimbangan ${$where}`;

                let sqlPenindakan = `SELECT
                                COUNT(*) FROM jt_penindakan ${$wherePenindakan}`;
    
                const resultMelanggar = await sequelize.query(sqlMelanggar, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                const resultPenindakan = await sequelize.query(sqlPenindakan, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                res.status(200).send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: {
                        hari_ini: Number(resultMelanggar[0].count) - Number(resultPenindakan[0].count),
                        kemarin: 0
                    }
                })
            }

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    const widgetPenindakan = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            const now = moment();
            const hariIni = moment(now).format('YYYY-MM-DD');
            const kemarin = moment(now).add(-1, 'days').format('YYYY-MM-DD');

            var days = req.query.is_day || false;
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;
            var tahun = req.query.tahun;
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if (days) {
                if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                    $where = `WHERE tgl_penindakan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penindakan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                } else if (lokasi) {
                    $where = `WHERE tgl_penindakan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penindakan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                } else {
                    $where = `WHERE tgl_penindakan BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_active = true AND is_deleted = false`;
                    $whereYesterday = `WHERE tgl_penindakan BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_active = true AND is_deleted = false`;
                }
    
                let sqlToday = `SELECT
                                COUNT(*) FROM jt_penindakan ${$where}`;
                let sqlYesterday = `SELECT
                                COUNT(*) FROM jt_penindakan ${$whereYesterday}`;
    
                const resultToday = await sequelize.query(sqlToday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                const resultYesterday = await sequelize.query(sqlYesterday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                res.status(200).send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: {
                        hari_ini: Number(resultToday[0].count),
                        kemarin: Number(resultYesterday[0].count)
                    }
                })
            } else {
                if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penindakan) = ${year} AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                } else if (lokasi) {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penindakan) = ${year} AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                } else {
                    $where = `WHERE EXTRACT(YEAR FROM tgl_penindakan) = ${year} AND is_active = true AND is_deleted = false`;
                }
    
                let sqlToday = `SELECT
                                COUNT(*) FROM jt_penindakan ${$where}`;
    
                const resultToday = await sequelize.query(sqlToday, {
                    type: QueryTypes.SELECT,
                    logging: false
                })
    
                res.status(200).send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: {
                        hari_ini: Number(resultToday[0].count),
                        kemarin: 0
                    }
                })
            }

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    const widgetAngkutanBarangTidakMasukUPPKB = async (req, res, next) => {
        try {

            const now = moment();
            const hariIni = moment(now).format('YYYY-MM-DD');
            const kemarin = moment(now).add(-1, 'days').format('YYYY-MM-DD');
            // const hariIni = '2023-05-09';
            // const kemarin = '2023-05-08';
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE date_time BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
                $whereYesterday = `WHERE date_time BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
            } else if (lokasi) {
                $where = `WHERE date_time BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
                $whereYesterday = `WHERE date_time BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
            } else {
                $where = `WHERE date_time BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_active = true AND is_deleted = false`;
                $whereYesterday = `WHERE date_time BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_active = true AND is_deleted = false`;
            }

            let sqlToday = `SELECT
                            (SUM(class_4) + SUM(class_5)) AS total FROM lhr_log_stat ${$where}`;
            let sqlYesterday = `SELECT
                            (SUM(class_4) + SUM(class_5)) AS total FROM lhr_log_stat ${$whereYesterday}`;

            const resultToday = await sequelize.query(sqlToday, {
                type: QueryTypes.SELECT,
                logging: false
            })
            // console.log(resultToday)
            const resultYesterday = await sequelize.query(sqlYesterday, {
                type: QueryTypes.SELECT,
                logging: false
            })
            // console.log(resultYesterday)
            res.status(200).send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: {
                    hari_ini: Number(resultToday[0].total),
                    kemarin: Number(resultYesterday[0].total)
                }
            })
        } catch (error) {

        }
    }

    const widgetVerifikasi = async (req, res, next) => {
        try {

            const now = moment();
            const hariIni = moment(now).format('YYYY-MM-DD');
            const kemarin = moment(now).add(-1, 'days').format('YYYY-MM-DD');
            // const hariIni = '2023-07-14';
            // const kemarin = '2023-06-13';
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE tgl_pelanggaran BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND bptd_id = ${bptd_id} AND is_active = true`;
                $whereYesterday = `WHERE tgl_pelanggaran BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND bptd_id = ${bptd_id} AND is_active = true`;
            } else if (lokasi) {
                $where = `WHERE tgl_pelanggaran BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND lokasi_id = ${lokasi} AND is_active = true`;
                $whereYesterday = `WHERE tgl_pelanggaran BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND lokasi_id = ${lokasi} AND is_active = true`;
            } else {
                $where = `WHERE tgl_pelanggaran BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_active = true`;
                $whereYesterday = `WHERE tgl_pelanggaran BETWEEN '${kemarin} 00:00:00' AND '${kemarin} 23:59:59' AND is_active = true`;
            }

            let sqlToday = `SELECT
                            COUNT(*) FROM vr_pelanggaran ${$where}`;
            let sqlYesterday = `SELECT
                            COUNT(*) FROM vr_pelanggaran ${$whereYesterday}`;

            const resultToday = await sequelize.query(sqlToday, {
                type: QueryTypes.SELECT,
                logging: false
            })

            const resultYesterday = await sequelize.query(sqlYesterday, {
                type: QueryTypes.SELECT,
                logging: false
            })

            res.status(200).send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: {
                    hari_ini: Number(resultToday[0].count),
                    kemarin: Number(resultYesterday[0].count)
                }
            })
        } catch (error) {

        }
    }

    const widgetTidakDiVerifikasi = async (req, res, next) => {
        try {

            const now = moment();
            const hariIni = moment(now).format('YYYY-MM-DD');
            const kemarin = moment(now).add(-1, 'days').format('YYYY-MM-DD');

            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE tgl_deteksi = '${hariIni}' AND bptd_id = ${bptd_id} `;
                $whereYesterday = `WHERE tgl_deteksi = '${kemarin}' AND bptd_id = ${bptd_id} `;
            } else if (lokasi) {
                $where = `WHERE tgl_deteksi = '${hariIni}' AND lokasi_id = ${lokasi} `;
                $whereYesterday = `WHERE tgl_deteksi = '${kemarin}' AND lokasi_id = ${lokasi} `;
            } else {
                $where = `WHERE tgl_deteksi = '${hariIni}' `;
                $whereYesterday = `WHERE tgl_deteksi = '${kemarin}' `;
            }

            let sqlToday = `SELECT
                            jml_deteksi FROM vr_deteksi ${$where} `;
            let sqlYesterday = `SELECT
                            jml_deteksi FROM vr_deteksi ${$whereYesterday} `;

            const resultToday = await sequelize.query(sqlToday, {
                type: QueryTypes.SELECT,
                logging: false
            })

            const resultYesterday = await sequelize.query(sqlYesterday, {
                type: QueryTypes.SELECT,
                logging: false
            })

            res.status(200).send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: {
                    hari_ini: Number(resultToday[0]?.jml_deteksi || 0),
                    kemarin: Number(resultYesterday[0]?.jml_deteksi || 0)
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    const chartAngkutanBarangTidakMasuk = async (req, res, next) => {
        try {

            // const now = moment();
            // const hariIni = moment(now).format('YYYY-MM-DD');
            // const hariIni = '2023-05-08';
            // const hariIni = '2023-07-23';
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;

            // if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
            //     $where = `WHERE tgl_capture::timestamp::date = NOW()::timestamp::date AND bptd_id = ${bptd_id} AND device_id = 2 AND is_active = true AND is_verifikasi = false`;
            // } else if (lokasi) {
            //     $where = `WHERE tgl_capture::timestamp::date = NOW()::timestamp::date AND lokasi_id = ${lokasi} AND device_id = 2 AND is_active = true AND is_verifikasi = false`;
            // } else {
            //     $where = `WHERE tgl_capture::timestamp::date = NOW()::timestamp::date AND device_id = 2 AND is_active = true AND is_verifikasi = false`;
            // }

            let sql = `SELECT 
                        jgi.desc_gol_ai AS label,
                        COALESCE(
                            (
                                SELECT 
                                        COUNT(*)
                                FROM jt_vr_data
                                WHERE 
                                    jt_vr_data.id_gol_ai = jgi.id AND
                                    jt_vr_data.tgl_capture::timestamp::date = NOW()::timestamp::date AND
                                    jt_vr_data.device_id = 2 AND
                                    jt_vr_data.is_active = TRUE AND
                                    jt_vr_data.is_verifikasi = FALSE
                                GROUP BY jt_vr_data.id_gol_ai
                            ),
                        0
                        ) as jml
                    FROM jt_gol_ai jgi
                    ORDER BY jgi.desc_gol_ai
                    `
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            })
            res.status(200).send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            })
        } catch (error) {
            next(error);
        }
    }

    const chartLhrUmum = async (req, res, next) => {
        try {

            const now = moment();
            const hariIni = moment(now).format('YYYY-MM-DD');
            // const hariIni = '2023-05-08';
            // const hariIni = '2023-07-23';
            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE date_time BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND bptd_id = ${bptd_id} AND is_active = true AND is_deleted = false`;
            } else if (lokasi) {
                $where = `WHERE date_time BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND lokasi_id = ${lokasi} AND is_active = true AND is_deleted = false`;
            } else {
                $where = `WHERE date_time BETWEEN '${hariIni} 00:00:00' AND '${hariIni} 23:59:59' AND is_active = true AND is_deleted = false`;
            }

            let sql = `SELECT
                SUM(class_2) as motor,
                SUM(class_3) as mobil,
                SUM(class_4) as truck_bus,
                (SUM(class_5) + SUM(class_6)) as truck,
                (SUM(class_7) + SUM(class_8)) as bus,
                (SUM(class_2) + SUM(class_3) + SUM(class_5) + SUM(class_6) + SUM(class_7) + SUM(class_8)) AS total,
                to_char(date_time, 'HH24:00') as waktu
                FROM lhr_log_stat ${$where}
                GROUP BY to_char(date_time, 'HH24:00')
                ORDER BY waktu ASC
                `
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            })
            res.status(200).send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            })
        } catch (error) {
            next(error);
        }
    }

    const chartLhrVerifikasi = async (req, res, next) => {
        try {

            var role = req.query.rid;
            var role_kode = req.query.rkd;
            var lokasi = req.query.lid;
            var bptd_id = req.query.bid;

            if ((role_kode == 'BPTD' || role == 6) && (bptd_id)) {
                $where = `WHERE date_part('year', tgl_deteksi) = date_part('year', CURRENT_DATE) AND bptd_id = ${bptd_id}`;
            } else if (lokasi) {
                $where = `WHERE date_part('year', tgl_deteksi) = date_part('year', CURRENT_DATE) AND lokasi_id = ${lokasi}`;
            } else {
                $where = `WHERE date_part('year', tgl_deteksi) = date_part('year', CURRENT_DATE)`;
            }

            let sql = `SELECT
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 1 THEN jml_deteksi ELSE 0 END) as jml_jan,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 2 THEN jml_deteksi ELSE 0 END) as jml_feb,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 3 THEN jml_deteksi ELSE 0 END) as jml_mar,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 4 THEN jml_deteksi ELSE 0 END) as jml_apr,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 5 THEN jml_deteksi ELSE 0 END) as jml_mei,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 6 THEN jml_deteksi ELSE 0 END) as jml_jun,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 7 THEN jml_deteksi ELSE 0 END) as jml_jul,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 8 THEN jml_deteksi ELSE 0 END) as jml_agt,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 9 THEN jml_deteksi ELSE 0 END) as jml_sep,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 10 THEN jml_deteksi ELSE 0 END) as jml_okt,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 10 THEN jml_deteksi ELSE 0 END) as jml_nov,
                    SUM(CASE WHEN date_part('month', tgl_deteksi) = 12 THEN jml_deteksi ELSE 0 END) as jml_des
                    FROM vr_deteksi ${$where}
                `
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            })
            const response = [
                {
                    name: 'Jan',
                    jml_verifikasi: Number(result[0].jml_jan)
                },
                {
                    name: 'Feb',
                    jml_verifikasi: Number(result[0].jml_feb)
                },
                {
                    name: 'Mar',
                    jml_verifikasi: Number(result[0].jml_mar)
                },
                {
                    name: 'Apr',
                    jml_verifikasi: Number(result[0].jml_apr)
                },
                {
                    name: 'Mei',
                    jml_verifikasi: Number(result[0].jml_mei)
                },
                {
                    name: 'Jun',
                    jml_verifikasi: Number(result[0].jml_jun)
                },
                {
                    name: 'Jul',
                    jml_verifikasi: Number(result[0].jml_jul)
                },
                {
                    name: 'Agu',
                    jml_verifikasi: Number(result[0].jml_agt)
                },
                {
                    name: 'Sep',
                    jml_verifikasi: Number(result[0].jml_sep)
                },
                {
                    name: 'Okt',
                    jml_verifikasi: Number(result[0].jml_okt)
                },
                {
                    name: 'Nov',
                    jml_verifikasi: Number(result[0].jml_nov)
                },
                {
                    name: 'Des',
                    jml_verifikasi: Number(result[0].jml_des)
                },
            ]
            res.status(200).send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: response
            })
        } catch (error) {
            next(error);
        }
    }

    const calculateTotal = (obj) => {
        let total = 0;
        for (const key in obj) {
            if (key !== "waktu" && !isNaN(Number(obj[key]))) {
                total += Number(obj[key]);
            }
        }
        return total;
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

    const dataLhrAngkutan = async (req, next) => {
        try {
            const is_verifikasi = req.query.is_verifikasi
            const interval = req.query.interval;
            const tahun = moment().format('YYYY');

            if (is_verifikasi == 0) {
                if (interval == 2) {
                    const tgl = req.query.tgl
                    const jam_awal = req.query.jam_awal
                    const jam_akhir = req.query.jam_akhir

                    let sql = `
                    SELECT
                        COUNT(CASE WHEN jga.desc_gol_ai = 'UNDEFINED' THEN 1 ELSE NULL END) AS UNDEFINED,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'PICKUP' THEN 1 ELSE NULL END) AS PICKUP,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI KECIL' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI BESAR' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX KECIL' THEN 1 ELSE NULL END) AS TRUCK_BOX_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX BESAR' THEN 1 ELSE NULL END) AS TRUCK_BOX_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TRAILER' THEN 1 ELSE NULL END) AS TRUCK_TRAILER,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP KECIL' THEN 1 ELSE NULL END) AS TRUCK_DUMP_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP BESAR' THEN 1 ELSE NULL END) AS TRUCK_DUMP_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT KECIL' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT BESAR' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_BESAR,
                        to_char(jvd.tgl_capture, 'HH24:00') as waktu
                        
                    FROM jt_vr_data jvd
                    LEFT JOIN jt_gol_ai jga ON (jvd.id_gol_ai = jga.id)
                    WHERE 
                        jvd.tgl_capture BETWEEN '${tgl} ${jam_awal}' AND 
                        '${tgl} ${jam_akhir}' AND 
                        jvd.device_id = 2 AND
                        jvd.is_active = TRUE AND
                        jvd.is_verifikasi = FALSE
                    GROUP BY to_char(jvd.tgl_capture, 'HH24:00')
                    ORDER BY waktu ASC
    
                    `
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    })

                    // Calculate the total for each object and add a "total" property
                    const newData = result.map((item) => {
                        const jml_ab = calculateTotal(item);
                        return { ...item, jml_ab };
                    });

                    return newData
                }

                if (interval == 3) {
                    const tanggal_awal = req.query.tanggal_awal
                    const tanggal_akhir = req.query.tanggal_akhir

                    let sql = `
                    SELECT
                        COUNT(CASE WHEN jga.desc_gol_ai = 'UNDEFINED' THEN 1 ELSE NULL END) AS UNDEFINED,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'PICKUP' THEN 1 ELSE NULL END) AS PICKUP,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI KECIL' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI BESAR' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX KECIL' THEN 1 ELSE NULL END) AS TRUCK_BOX_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX BESAR' THEN 1 ELSE NULL END) AS TRUCK_BOX_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TRAILER' THEN 1 ELSE NULL END) AS TRUCK_TRAILER,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP KECIL' THEN 1 ELSE NULL END) AS TRUCK_DUMP_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP BESAR' THEN 1 ELSE NULL END) AS TRUCK_DUMP_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT KECIL' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT BESAR' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_BESAR,
                        to_char(jvd.tgl_capture, 'DD-MM-YYYY') as waktu
                        
                    FROM jt_vr_data jvd
                    LEFT JOIN jt_gol_ai jga ON (jvd.id_gol_ai = jga.id)
                    WHERE 
                        jvd.tgl_capture::date BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}' AND 
                        jvd.device_id = 2 AND
                        jvd.is_active = TRUE AND
                        jvd.is_verifikasi = FALSE
                    GROUP BY to_char(jvd.tgl_capture, 'DD-MM-YYYY')
                    ORDER BY waktu ASC
    
                    `
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    })
                    // Calculate the total for each object and add a "total" property
                    const newData = result.map((item) => {
                        const jml_ab = calculateTotal(item);
                        return { ...item, jml_ab };
                    });

                    return newData
                }

                if (interval == 4) {
                    const bulan_awal = req.query.bulan_awal
                    const bulan_akhir = req.query.bulan_akhir

                    let sql = `
                    SELECT
                        COUNT(CASE WHEN jga.desc_gol_ai = 'UNDEFINED' THEN 1 ELSE NULL END) AS UNDEFINED,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'PICKUP' THEN 1 ELSE NULL END) AS PICKUP,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI KECIL' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI BESAR' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX KECIL' THEN 1 ELSE NULL END) AS TRUCK_BOX_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX BESAR' THEN 1 ELSE NULL END) AS TRUCK_BOX_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TRAILER' THEN 1 ELSE NULL END) AS TRUCK_TRAILER,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP KECIL' THEN 1 ELSE NULL END) AS TRUCK_DUMP_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP BESAR' THEN 1 ELSE NULL END) AS TRUCK_DUMP_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT KECIL' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT BESAR' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_BESAR,
                        to_char(jvd.tgl_capture, 'MM-YYYY') as waktu
                        
                    FROM jt_vr_data jvd
                    LEFT JOIN jt_gol_ai jga ON (jvd.id_gol_ai = jga.id)
                    WHERE 
                        EXTRACT(YEAR FROM jvd.tgl_capture) = ${tahun} AND EXTRACT(MONTH FROM jvd.tgl_capture) BETWEEN ${bulan_awal} AND ${bulan_akhir} AND
                        jvd.device_id = 2 AND
                        jvd.is_active = TRUE AND
                        jvd.is_verifikasi = FALSE
                    GROUP BY to_char(jvd.tgl_capture, 'MM-YYYY')
                    ORDER BY waktu ASC
    
                    `
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    })
                    // Calculate the total for each object and add a "total" property
                    const newData = result.map((item) => {
                        const jml_ab = calculateTotal(item);
                        return { ...item, jml_ab };
                    });

                    return newData
                }

                if (interval == 5) {
                    const tahun_awal = req.query.tahun_awal
                    const tahun_akhir = req.query.tahun_akhir

                    let sql = `
                    SELECT
                        COUNT(CASE WHEN jga.desc_gol_ai = 'UNDEFINED' THEN 1 ELSE NULL END) AS UNDEFINED,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'PICKUP' THEN 1 ELSE NULL END) AS PICKUP,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI KECIL' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI BESAR' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX KECIL' THEN 1 ELSE NULL END) AS TRUCK_BOX_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX BESAR' THEN 1 ELSE NULL END) AS TRUCK_BOX_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TRAILER' THEN 1 ELSE NULL END) AS TRUCK_TRAILER,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP KECIL' THEN 1 ELSE NULL END) AS TRUCK_DUMP_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP BESAR' THEN 1 ELSE NULL END) AS TRUCK_DUMP_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT KECIL' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT BESAR' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_BESAR,
                        to_char(jvd.tgl_capture, 'YYYY') as waktu
                        
                    FROM jt_vr_data jvd
                    LEFT JOIN jt_gol_ai jga ON (jvd.id_gol_ai = jga.id)
                    WHERE 
                        EXTRACT(YEAR FROM jvd.tgl_capture) BETWEEN ${tahun_awal} AND ${tahun_akhir} AND
                        jvd.device_id = 2 AND
                        jvd.is_active = TRUE AND
                        jvd.is_verifikasi = FALSE
                    GROUP BY to_char(jvd.tgl_capture, 'YYYY')
                    ORDER BY waktu ASC
    
                    `
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    })
                    // Calculate the total for each object and add a "total" property
                    const newData = result.map((item) => {
                        const jml_ab = calculateTotal(item);
                        return { ...item, jml_ab };
                    });

                    return newData
                }
            }

            if (is_verifikasi == 1) {
                if (interval == 2) {
                    const tgl = req.query.tgl
                    const jam_awal = req.query.jam_awal
                    const jam_akhir = req.query.jam_akhir

                    let sql = `
                    SELECT
                        COUNT(CASE WHEN jga.desc_gol_ai = 'UNDEFINED' THEN 1 ELSE NULL END) AS UNDEFINED,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'PICKUP' THEN 1 ELSE NULL END) AS PICKUP,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI KECIL' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI BESAR' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX KECIL' THEN 1 ELSE NULL END) AS TRUCK_BOX_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX BESAR' THEN 1 ELSE NULL END) AS TRUCK_BOX_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TRAILER' THEN 1 ELSE NULL END) AS TRUCK_TRAILER,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP KECIL' THEN 1 ELSE NULL END) AS TRUCK_DUMP_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP BESAR' THEN 1 ELSE NULL END) AS TRUCK_DUMP_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT KECIL' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT BESAR' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_BESAR,
                        to_char(jvd.tgl_capture, 'HH24:00') as waktu
                        
                    FROM jt_vr_data jvd
                    LEFT JOIN jt_gol_ai jga ON (jvd.id_gol_ai = jga.id)
                    WHERE 
                        jvd.tgl_capture BETWEEN '${tgl} ${jam_awal}' AND 
                        '${tgl} ${jam_akhir}' AND 
                        jvd.device_id = 2 AND
                        jvd.is_active = TRUE AND
                        jvd.is_verifikasi = TRUE
                    GROUP BY to_char(jvd.tgl_capture, 'HH24:00')
                    ORDER BY waktu ASC
    
                    `
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    })
                    // Calculate the total for each object and add a "total" property
                    const newData = result.map((item) => {
                        const jml_ab = calculateTotal(item);
                        return { ...item, jml_ab };
                    });

                    return newData
                }

                if (interval == 3) {
                    const tanggal_awal = req.query.tanggal_awal
                    const tanggal_akhir = req.query.tanggal_akhir

                    let sql = `
                    SELECT
                        COUNT(CASE WHEN jga.desc_gol_ai = 'UNDEFINED' THEN 1 ELSE NULL END) AS UNDEFINED,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'PICKUP' THEN 1 ELSE NULL END) AS PICKUP,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI KECIL' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI BESAR' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX KECIL' THEN 1 ELSE NULL END) AS TRUCK_BOX_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX BESAR' THEN 1 ELSE NULL END) AS TRUCK_BOX_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TRAILER' THEN 1 ELSE NULL END) AS TRUCK_TRAILER,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP KECIL' THEN 1 ELSE NULL END) AS TRUCK_DUMP_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP BESAR' THEN 1 ELSE NULL END) AS TRUCK_DUMP_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT KECIL' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT BESAR' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_BESAR,
                        to_char(jvd.tgl_capture, 'DD-MM-YYYY') as waktu
                        
                    FROM jt_vr_data jvd
                    LEFT JOIN jt_gol_ai jga ON (jvd.id_gol_ai = jga.id)
                    WHERE 
                        jvd.tgl_capture::date BETWEEN '${tanggal_awal}' AND '${tanggal_akhir}' AND 
                        jvd.device_id = 2 AND
                        jvd.is_active = TRUE AND
                        jvd.is_verifikasi = TRUE
                    GROUP BY to_char(jvd.tgl_capture, 'DD-MM-YYYY')
                    ORDER BY waktu ASC
    
                    `
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    })
                    // Calculate the total for each object and add a "total" property
                    const newData = result.map((item) => {
                        const jml_ab = calculateTotal(item);
                        return { ...item, jml_ab };
                    });

                    return newData
                }

                if (interval == 4) {
                    const bulan_awal = req.query.bulan_awal
                    const bulan_akhir = req.query.bulan_akhir

                    let sql = `
                    SELECT
                        COUNT(CASE WHEN jga.desc_gol_ai = 'UNDEFINED' THEN 1 ELSE NULL END) AS UNDEFINED,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'PICKUP' THEN 1 ELSE NULL END) AS PICKUP,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI KECIL' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI BESAR' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX KECIL' THEN 1 ELSE NULL END) AS TRUCK_BOX_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX BESAR' THEN 1 ELSE NULL END) AS TRUCK_BOX_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TRAILER' THEN 1 ELSE NULL END) AS TRUCK_TRAILER,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP KECIL' THEN 1 ELSE NULL END) AS TRUCK_DUMP_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP BESAR' THEN 1 ELSE NULL END) AS TRUCK_DUMP_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT KECIL' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT BESAR' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_BESAR,
                        to_char(jvd.tgl_capture, 'MM-YYYY') as waktu
                        
                    FROM jt_vr_data jvd
                    LEFT JOIN jt_gol_ai jga ON (jvd.id_gol_ai = jga.id)
                    WHERE 
                        EXTRACT(YEAR FROM jvd.tgl_capture) = ${tahun} AND EXTRACT(MONTH FROM jvd.tgl_capture) BETWEEN ${bulan_awal} AND ${bulan_akhir} AND
                        jvd.device_id = 2 AND
                        jvd.is_active = TRUE AND
                        jvd.is_verifikasi = TRUE
                    GROUP BY to_char(jvd.tgl_capture, 'MM-YYYY')
                    ORDER BY waktu ASC
    
                    `
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    })
                    // Calculate the total for each object and add a "total" property
                    const newData = result.map((item) => {
                        const jml_ab = calculateTotal(item);
                        return { ...item, jml_ab };
                    });

                    return newData
                }

                if (interval == 5) {
                    const tahun_awal = req.query.tahun_awal
                    const tahun_akhir = req.query.tahun_akhir

                    let sql = `
                    SELECT
                        COUNT(CASE WHEN jga.desc_gol_ai = 'UNDEFINED' THEN 1 ELSE NULL END) AS UNDEFINED,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'PICKUP' THEN 1 ELSE NULL END) AS PICKUP,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI KECIL' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TANGKI BESAR' THEN 1 ELSE NULL END) AS TRUCK_TANGKI_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX KECIL' THEN 1 ELSE NULL END) AS TRUCK_BOX_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK BOX BESAR' THEN 1 ELSE NULL END) AS TRUCK_BOX_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK TRAILER' THEN 1 ELSE NULL END) AS TRUCK_TRAILER,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP KECIL' THEN 1 ELSE NULL END) AS TRUCK_DUMP_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK DUMP BESAR' THEN 1 ELSE NULL END) AS TRUCK_DUMP_BESAR,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT KECIL' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_KECIL,
                        COUNT(CASE WHEN jga.desc_gol_ai = 'TRUCK STANDARDT BESAR' THEN 1 ELSE NULL END) AS TRUCK_STANDARDT_BESAR,
                        to_char(jvd.tgl_capture, 'YYYY') as waktu
                        
                    FROM jt_vr_data jvd
                    LEFT JOIN jt_gol_ai jga ON (jvd.id_gol_ai = jga.id)
                    WHERE 
                        EXTRACT(YEAR FROM jvd.tgl_capture) BETWEEN ${tahun_awal} AND ${tahun_akhir} AND
                        jvd.device_id = 2 AND
                        jvd.is_active = TRUE AND
                        jvd.is_verifikasi = TRUE
                    GROUP BY to_char(jvd.tgl_capture, 'YYYY')
                    ORDER BY waktu ASC
    
                    `
                    const result = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    })
                    // Calculate the total for each object and add a "total" property
                    const newData = result.map((item) => {
                        const jml_ab = calculateTotal(item);
                        return { ...item, jml_ab };
                    });

                    return newData
                }
            }

        } catch (error) {
            next(error)
        }
    }

    const lhrBarangTidakMasuk = async (req, res, next) => {
        const data = await dataLhrAngkutan(req, next)
        res.status(200).send({
            success: true,
            message: messageService().GET_SUCCESS,
            data: data,
        })
    }

    const lhrBarangTidakMasukXls = async (req, res, next) => {
        const is_verifikasi = req.query.is_verifikasi;
        const interval = req.query.interval;

        const result = await dataLhrAngkutan(req, next)

        if (result) {
            const nama_interval = interval == 1 ? 'Per 15 Menit' : interval == 2 ? 'Per 60 Menit' : interval == 3 ? 'Per Hari' : interval == 4 ? 'Per Bulan' : 'Per Tahun';
            let obj = [];
            for (let row of result) {
                var formatwaktu = row.waktu;
                if (interval == 4) {
                    formatwaktu = setMonth(Number(moment(row.waktu, 'MM-YYYY').format('MM')) - 1);
                }
                obj.push({
                    interval: nama_interval,
                    pickup: row.pickup,
                    truck_dump_besar: row.truck_dump_besar,
                    truck_dump_kecil: row.truck_dump_kecil,
                    truck_standardt_besar: row.truck_standardt_besar,
                    truck_standardt_kecil: row.truck_standardt_kecil,
                    truck_tangki_besar: row.truck_tangki_besar,
                    truck_tangki_kecil: row.truck_tangki_kecil,
                    truck_trailer: row.truck_trailer,
                    truck_box_besar: row.truck_box_besar,
                    truck_box_kecil: row.truck_box_kecil,
                    undefined: row.undefined,
                    jml_ab: row.jml_ab,
                    waktu: formatwaktu
                })
            }

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet(is_verifikasi == 0 ? 'LhrAngkutanTidakMasukBelumVerifikasi' : 'LhrAngkutanTidakMasukSudahVerifikasi', {
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
                { header: 'Pickup', key: 'pickup', width: 20 },
                { header: 'Truck Dump Besar', key: 'truck_dump_besar', width: 20 },
                { header: 'Truck Dump Kecil', key: 'truck_dump_kecil', width: 20 },
                { header: 'Truck Standardt Besar', key: 'truck_standardt_besar', width: 20 },
                { header: 'Truck Standardt Kecil', key: 'truck_standardt_kecil', width: 20 },
                { header: 'Truck Tangki Besar', key: 'truck_tangki_besar', width: 20 },
                { header: 'Truck Tangki Kecil', key: 'truck_tangki_kecil', width: 20 },
                { header: 'Truck Trailer', key: 'truck_trailer', width: 20 },
                { header: 'Truck Box Besar', key: 'truck_box_besar', width: 20 },
                { header: 'Truck Box Kecil', key: 'truck_box_kecil', width: 20 },
                { header: 'Undefined', key: 'undefined', width: 20 },
                { header: 'Jumlah', key: 'jml_ab', width: 20 },
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
            let filename = `lhr_angkutan_tidak_masuk_uppkb_belum_verifikasi_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
            if (is_verifikasi == 1) {
                filename = `lhr_angkutan_tidak_masuk_uppkb_sudah_verifikasi_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
            }
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

    const lhrBarangTidakMasukPrint = async (req, res, next) => {
        const lokasi_id = req.query.lokasi;
        const is_verifikasi = req.query.is_verifikasi;
        const interval = req.query.interval;
        const ispdf = req.query.ispdf;
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

        const result = await dataLhrAngkutan(req, next)
        if (result) {
            let lokasi = ''
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
                    jam_awal: moment(bulan_awal).locale('id').format('MMMM') + ' ' + tahun,
                    jam_akhir: moment(bulan_akhir).locale('id').format('MMMM') + ' ' + tahun,
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
            let filename = `data_lhr_angkutan_tidak_masuk_uppkb_belum_verifikasi_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}.pdf`;
            if (is_verifikasi == 1) {
                filename = `data_lhr_angkutan_tidak_masuk_uppkb_sudah_verifikasi_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}.pdf`;
            }
            const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
            const reportUrl = config.report_url + 'pdf/' + filename;

            const qrCodeDataUrl = await promiseToCreateQRcode(reportUrl);

            const header = await reportTemplate();

            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("lhrAngkutanView.ejs", {
                    data: result,
                    datafilter: datafilter,
                    interval: interval,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    moment: moment,
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl,
                    is_verifikasi: is_verifikasi
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', 'lhrAngkutanView.ejs'), {
                    data: result,
                    datafilter: datafilter,
                    interval: interval,
                    moment: moment,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl,
                    is_verifikasi: is_verifikasi
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

                            nama_file_uppkb = lokasi.kode;
                        }

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

    const getJumlahBlue = async (req, res, next) => {
        try {
            var sql = `SELECT COUNT(DISTINCT no_registrasi_kendaraan) AS total
                        FROM jto_eblue
                        WHERE no_registrasi_kendaraan ~ '^[A-Za-z0-9]+$'
                        AND LENGTH(no_registrasi_kendaraan) > 5
                        AND LENGTH(no_registrasi_kendaraan) < 10;`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });

        } catch (error) {
            next(error);
        }
    }

    const getJumlahBlueAktif = async (req, res, next) => {
        try {
            var sql = `SELECT COUNT(DISTINCT no_registrasi_kendaraan) AS total
                    FROM jto_eblue_live
                    WHERE no_registrasi_kendaraan ~ '^[A-Za-z0-9]+$'
                    AND LENGTH(no_registrasi_kendaraan) > 5
                    AND LENGTH(no_registrasi_kendaraan) < 10;`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });

        } catch (error) {
            next(error);
        }
    }

    const topFiveUppkb = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var tahun = req.query.tahun;
            var limit = req.query.limit;
            if (limit) {
                $lmt = `LIMIT ${limit}`;
            } else {
                $lmt = '';
            }
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            var sql = `
                SELECT jt_lokasi_uppkb.nama AS nama_uppkb,
                    count(*) AS jml_timbang,
                    count(*) FILTER (WHERE jt_penimbangan.is_melanggar = true) AS jml_melanggar,
                    count(*) FILTER (WHERE jt_penimbangan.is_tindakan = true) AS jml_penindakan
                FROM jt_penimbangan
                    JOIN jt_lokasi_uppkb ON jt_penimbangan.kode_uppkb::text = jt_lokasi_uppkb.kode::text
                    WHERE 
                        date_part('year', jt_penimbangan.tgl_penimbangan) = ${year}
                        AND jt_penimbangan.is_transaksi = 1
                        AND jt_penimbangan.is_active = true
                        AND jt_penimbangan.is_deleted = false
                    GROUP BY jt_lokasi_uppkb.nama
                    ORDER BY jml_timbang DESC ${$lmt}
            `
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }

    }

    const topFiveBptd = async (req, res, next) => {
        try {
            const tahunIni = moment().format('YYYY');
            var tahun = req.query.tahun;
            var limit = req.query.limit;
            if (limit) {
                $lmt = `LIMIT ${limit}`;
            } else {
                $lmt = '';
            }
            var year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            var sql = `
                SELECT jt_bptd.nama AS nama_bptd,
                        count(*) AS jml_timbang,
                        count(*) FILTER (WHERE jt_penimbangan.is_melanggar = true) AS jml_melanggar,
                        count(*) FILTER (WHERE jt_penimbangan.is_tindakan = true) AS jml_penindakan
                    FROM jt_penimbangan
                        JOIN jt_bptd ON jt_penimbangan.bptd_id = jt_bptd.id
                        WHERE 
                            date_part('year', jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.is_transaksi = 1
                            AND jt_penimbangan.is_active = true
                            AND jt_penimbangan.is_deleted = false
                        GROUP BY jt_bptd.nama
                        ORDER BY jml_timbang DESC ${$lmt}`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }

    }

    const countAllActive = async () => {
        var sql = `SELECT COUNT(*) jml_data
					FROM
					  jt_lokasi_uppkb
					  INNER JOIN public.jt_kota_kab ON (jt_lokasi_uppkb.kota_kab_id = jt_kota_kab.id)
					  INNER JOIN public.jt_provinsi ON (jt_kota_kab.provinsi_id = jt_provinsi.id)
					  INNER JOIN public.jt_bptd ON (public.jt_provinsi.bptd_id = jt_bptd.id)
					WHERE 
					jt_lokasi_uppkb.is_active = true AND jt_lokasi_uppkb.is_deleted = false 
					AND jt_kota_kab.is_active = true AND jt_kota_kab.is_deleted = false
					AND jt_provinsi.is_active = true AND jt_provinsi.is_deleted = false
					AND jt_bptd.is_active = true AND jt_bptd.is_deleted = false`;
					
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            return result[0].jml_data;
        } else {
            return 0;
        }
    }

    const kode_tingkat_pelayanan = async (tundaan) => {
        var sql = 'SELECT * FROM lhr_tingkat_pelayanan WHERE is_active = true';
        // console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {               
            if (tundaan <= result[0].nilai) {
                // console.log(${tundaan} <= ${result[1].nilai} = ${result[0].kode});
                return result[0].kode;
            } else if (tundaan < result[1].nilai && tundaan <= result[2].nilai) {
                // console.log(${tundaan} < ${result[1].nilai} && ${tundaan} <= ${result[2].nilai} = ${result[1].kode});
                return result[1].kode;
            } else if (tundaan < result[2].nilai && tundaan <= result[3].nilai) {
                // console.log(${tundaan} < ${result[2].nilai} && ${tundaan} <= ${result[3].nilai} = ${result[2].kode});
                return result[2].kode;
            } else if (tundaan < result[3].nilai && tundaan <= result[4].nilai) {
                // console.log(${tundaan} < ${result[3].nilai} && ${tundaan} <= ${result[4].nilai} = ${result[3].kode});
                return result[3].kode;
            } else if (tundaan < result[4].nilai && tundaan <= result[5].nilai) {
                // console.log(${tundaan} < ${result[4].nilai} && ${tundaan} <= ${result[5].nilai} = ${result[4].kode});
                return result[4].kode;
            } else {
                // console.log(${tundaan} = ${result[0].kode});
                return result[5].kode;
            }
        } else {
            return '-';
        }
    }

    const qtingkat_pelayanan = async (kode) => {
        var sql = `SELECT * FROM lhr_tingkat_pelayanan WHERE kode = '${kode}'`;
        // console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
        
        if (result.length > 0) {
            // console.log(result[0]);
            return result[0];
        } else {
            return '-';
        }
    }

    const convertArrayToObject = (array, key) => {
        const initialValue = {};
        return array.reduce((obj, item) => {
            return {
                ...obj,
                [item[key]]: item,
            };
        }, initialValue);
    };

    const getDataLokasi = async (req, res, next) => {
        console.log("--------------------::Processing Get Data Lokasi By Filter::--------------------");
        try {
            const bptd_id = req.query.bptd;
            const lokasi_id = req.query.lokasi;
            const status_operasi = req.query.status_operasi;
            const intl_ab = req.query.interval_lhr_ab;
            let interval_ab = 3;
            if (intl_ab) {
                interval_ab = intl_ab;
            }
            let conditions = { is_deleted: false, is_active: true };

            if (bptd_id) {
                conditions = { bptd_id: bptd_id, is_deleted: false, is_active: true };
            }

            if (lokasi_id) {
                conditions = { id: lokasi_id, is_deleted: false, is_active: true };
            }

            if (status_operasi) {
                conditions = { status_operasi: status_operasi, is_deleted: false, is_active: true };
            }

            if (bptd_id && lokasi_id) {
                conditions = { id: lokasi_id, bptd_id: bptd_id, is_deleted: false, is_active: true };
            }

            if (bptd_id && status_operasi) {
                conditions = { status_operasi: status_operasi, bptd_id: bptd_id, is_deleted: false, is_active: true };
            }

            if (lokasi_id && status_operasi) {
                conditions = { status_operasi: status_operasi, id: lokasi_id, is_deleted: false, is_active: true };
            }

            if (bptd_id && lokasi_id && status_operasi) {
                conditions = { id: lokasi_id, bptd_id: bptd_id, status_operasi: status_operasi, is_deleted: false, is_active: true };
            }

            const options = {
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
                    },
                    {
                        model: t_streaming,
                        required: false,
                        as: 'cctv_uppkb',
                        attributes: [
                            'id', 'bptd_id', 'lokasi_id', 'lokasi_kode', 'kode', 'nama', 'is_lhr', 'akses_url', 'webrtc_url'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true,
                        }
                    }
                ],
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || await countAllActive(),
                order: [
                    [
                        req.query.orderBy || 'nama',
                        req.query.sortedBy || 'ASC'
                    ]
                ],
                where: conditions,
                logging: false,
            }

            const { docs, pages, total } = await t_lokasi.paginate(options)

            let dataAll = await Promise.all(docs.map(async (doc) => {
                if (lokasi_id) {
                    let data_lhr = [];
                    let data_lhr_angkutan_barang = [];
                    let data_vc_rasio = {}
                    let resume_data = {}
                    const dataResume = await getResumeDataProduksi(req, next);
                    if (dataResume) {
                        resume_data = dataResume[0];
                    }
                    const dataRasio = await getKinerjaRuas(req, next);
                    if (dataRasio) {
                        console.log(dataRasio)
                        for (var i = 0; i < dataRasio.length; i++) {
                            var index_pelayanan = await kode_tingkat_pelayanan(dataRasio[i].ds);
                            var tingkat_pelayanan = await qtingkat_pelayanan(index_pelayanan);
                            data_vc_rasio = {
                                ip_addresults: dataRasio[i].ip_addresults,
                                tgl_jam: dataRasio[i].tgl_jam,
                                waktu: dataRasio[i].waktu,
                                jml_lajur: Number(dataRasio[i].jml_lajur),
                                so_dasar: Number(dataRasio[i].so_dasar),
                                fsf: Number(dataRasio[i].fsf),
                                fcs: Number(dataRasio[i].fcs),
                                fclj: Number(dataRasio[i].fclj),
                                fcpa: Number(dataRasio[i].fcpa),
                                so_fix: Number(dataRasio[i].so_fix),
                                kapasitas: Number(dataRasio[i].kapasitas),
                                motor: Number(dataRasio[i].motor),
                                mobil: Number(dataRasio[i].mobil),
                                truck_bus: Number(dataRasio[i].truck_bus),
                                truck: Number(dataRasio[i].truck),
                                bus: Number(dataRasio[i].bus),
                                jml_kend: Number(dataRasio[i].jml_kend),
                                gap: Number(dataRasio[i].gap),
                                headway: Number(dataRasio[i].headway),
                                kec_rata_rata: Number(dataRasio[i].kec_rata_rata),
                                p_speed: Number(dataRasio[i].p_speed),
                                p_occupancy: Number(dataRasio[i].p_occupancy),
                                qtot_avg: Number(dataRasio[i].qtot_avg),
                                qtot: Number(dataRasio[i].qtot),
                                ds: Number(dataRasio[i].ds),
                                desk_tingkat_pelayanan: tingkat_pelayanan.desk_tingkat_pelayanan,
                                keterangan: tingkat_pelayanan.keterangan,
                                index_layanan: index_pelayanan,
                                fasa: dataRasio[i].fasa,
                                warna_layanan: tingkat_pelayanan.warna,
                                id_lokasi: Number(dataRasio[i].id_lokasi),
                                kode_lokasi: dataRasio[i].kode_lokasi,
                                nama_lokasi: dataRasio[i].nama_lokasi,
                                id_sensor: Number(dataRasio[i].sensor_id),
                                kode_sensor: dataRasio[i].kode_sensor,
                                desk_sensor: dataRasio[i].desk_sensor,
                                url_proxy_cam: dataRasio[i].url_proxy_cam,
                                url_webrtc_cam: dataRasio[i].url_webrtc_cam,
                                no_lane: dataRasio[i].lane,
                                desc_lane: dataRasio[i].desk_lane
                            };
                        }
                    }
                    const resultLhr = await dataLhr(req, next);
                    for (let row of resultLhr) {
                        var formatwaktu = row.waktu;
                        var waktu_from = row.waktu_from;
                        var waktu_to = row.waktu_to;
        
                        if (Number(moment(waktu_to, 'HH:mm').format('HH')) == 0 && Number(moment(waktu_to, 'HH:mm').format('mm')) == 0) {
                            formatwaktu = `${waktu_from} - 23:59`;
                        }
        
                        const totalKend = (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck_bus));
                        data_lhr.push({
                            lokasi_id: row.lokasi_id,
                            nama_lokasi: row.nama_lokasi,
                            fsf: Number(row.fsf),
                            fcs: Number(row.fcs),
                            fclj: Number(row.fclj),
                            fcpa: Number(row.fcpa),
                            kapasitas: Number(row.kapasitas),
                            motor: Number(row.motor),
                            mobil: Number(row.mobil),
                            truck_bus: Number(row.truck_bus),
                            truck: Number(row.truck),
                            bus: Number(row.bus),
                            gap: Number(row.gap),
                            headway: Number(row.headway),
                            kec_rata_rata: Number(row.kec_rata_rata),
                            p_speed: Number(row.p_speed),
                            p_occupancy: Number(row.p_occupancy),
                            smp: Number(row.smp),
                            kapasitas: Number(row.kapasitas),
                            ds: Number(row.ds),
                            total: totalKend,
                            waktu: formatwaktu
                        });
                    }

                    const resultLhrAB = await dataABJK(req, next);

                    if (resultLhrAB) {
                        for (let qry of resultLhrAB) {
                            let formatwaktu = qry.waktu;
                            if (interval_ab == 3) {
                                formatwaktu = setMonth(Number(moment(qry.waktu, 'MM-YYYY').format('MM')) - 1);
                            }
                            const totalAB = (parseInt(qry.MOBIL_BARANG_BAK_TERBUKA) + parseInt(qry.MOBIL_BARANG_BAK_TERTUTUP) + parseInt(qry.MOBIL_PENARIK) + parseInt(qry.MOBIL_TANGKI) + parseInt(qry.UNDEFINED));
                            data_lhr_angkutan_barang.push({
                                tanggal: qry.tanggal,
                                waktu: formatwaktu,
                                lokasi_id: qry.id,
                                nama_uppkb: qry.nama_uppkb,
                                MOBIL_BARANG_BAK_TERBUKA: parseInt(qry.MOBIL_BARANG_BAK_TERBUKA),
                                MOBIL_BARANG_BAK_TERTUTUP: parseInt(qry.MOBIL_BARANG_BAK_TERTUTUP),
                                MOBIL_PENARIK: parseInt(qry.MOBIL_PENARIK),
                                MOBIL_TANGKI: parseInt(qry.MOBIL_TANGKI),
                                UNDEFINED: parseInt(qry.UNDEFINED),
                                jml_blue: qry.jml_blue,
                                jml_tdk_blue: qry.jml_tdk_blue,
                                total: totalAB,
                            });
                        }
                    }

                    return { ...doc.toJSON(), resume_data, data_lhr, data_lhr_angkutan_barang, data_vc_rasio };
                }
                return doc.toJSON();
            }));


            res.json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: dataAll,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total,
                }
            });
        } catch (error) {
            next(error)
        }
    }

    const getResumeDataProduksi = async (req, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const now = moment();
            const tgl = moment(now).format('YYYY-MM-DD');

            let sql = `SELECT 
                        tgl_penimbangan::date as tanggal,
                        COUNT(*) AS jml_timbang,
                        COUNT(CASE WHEN is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar,
                        COUNT(CASE WHEN is_melanggar = false THEN 1 ELSE NULL END) AS jml_tdk_melanggar
                    FROM jt_penimbangan 
                    WHERE is_transaksi = 1 AND tgl_penimbangan::date = '${tgl}' AND is_active = true AND is_deleted = false
                    GROUP BY tanggal`;

            if (lokasi_id) {
                sql = `SELECT 
                        tgl_penimbangan::date as tanggal,
                        lokasi_id,
                        COUNT(*) AS jml_timbang,
                        COUNT(CASE WHEN is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar,
                        COUNT(CASE WHEN is_melanggar = false THEN 1 ELSE NULL END) AS jml_tdk_melanggar
                    FROM jt_penimbangan
                    WHERE is_transaksi = 1 AND tgl_penimbangan::date = '${tgl}' AND lokasi_id = ${lokasi_id} AND is_active = true AND is_deleted = false
                    GROUP BY tanggal, lokasi_id`;
            }

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });
            return result;

        } catch (error) {
            next(error)
        }
    }

    const dataLhr = async (req, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const intl = req.query.interval_lhr_umum;
            let interval = 2;
            if (intl) {
                interval = intl;
            }
            const now = moment();
            const tgl = moment(now).format('YYYY-MM-DD');
            const besok = moment(tgl).add(+1, 'days').format('YYYY-MM-DD');

            if (lokasi_id) {
                let sql = `WITH intervals AS (
                                    SELECT 
                                        generate_series(start_time, end_time - INTERVAL '1 second', '15 minutes'::interval) AS interval_start,
                                        generate_series(start_time + INTERVAL '15 minutes', end_time, '15 minutes'::interval) AS interval_end
                                    FROM (
                                        SELECT 
                                            generate_series('${tgl} 00:00:00'::timestamp, '${besok} 00:00:00'::timestamp, '15 minutes'::interval) AS start_time,
                                            generate_series('${tgl} 00:15:00'::timestamp, '${besok} 00:15:00'::timestamp, '15 minutes'::interval) AS end_time
                                    ) AS hour_intervals
                                ),
                                aggregated_data AS (
                                    SELECT
                                            lhr_log_stat.lokasi_id as lokasi_id,
                                            jt_lokasi_uppkb.nama as nama_lokasi,
                                            intervals.interval_start,
                                            intervals.interval_end,
                                            lhr_konstanta.co_konstanta AS so_dasar,
                                            ROUND((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur)::numeric, 0) AS so_fix,
                                            lhr_konstanta.fsf_fchs AS fsf, --faktor_hambatan_samping,
                                            lhr_konstanta.fclj AS fclj, --nilai_satuan_lebar_lajur,
                                            lhr_konstanta.fcpa AS fcpa, --faktor_koreksi_kapasitas_akibat,
                                            lhr_konstanta.fcs_fcuk AS fcs, --faktor_ukuran_kota,
                                            ROUND(((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur) * lhr_konstanta.fsf_fchs	* lhr_konstanta.fclj * lhr_konstanta.fcpa * lhr_konstanta.fcs_fcuk)::numeric, 0) AS kapasitas,
                                            SUM(lhr_log_stat.class_2) AS motor,
                                            SUM(lhr_log_stat.class_3) AS mobil,
                                            SUM(lhr_log_stat.class_4) AS truck_bus,
                                            SUM(lhr_log_stat.class_5) AS truck,
                                            SUM(lhr_log_stat.class_7) AS bus,
                                            ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) AS smp,
                                            ROUND(AVG(lhr_log_stat.headway)::numeric, 0) AS headway,
                                            ROUND(AVG(ABS(lhr_log_stat.speed_85th))::numeric, 0) AS p_speed,
                                            ROUND(AVG(ABS(lhr_log_stat.speed_avg))::numeric, 0) AS kec_rata_rata,
                                            ROUND(AVG(ABS(lhr_log_stat.gap))::numeric, 0) AS gap,
                                            ROUND(AVG(ABS(lhr_log_stat.occupancy))::numeric, 0) AS p_occupancy,
                                            (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) AS total,
                                            ROUND((
                                                (((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3))) / 
                                                ((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur) * lhr_konstanta.fsf_fchs	* lhr_konstanta.fclj * lhr_konstanta.fcpa * lhr_konstanta.fcs_fcuk)
                            )::numeric, 3) AS ds,
                                            ROW_NUMBER() OVER (PARTITION BY intervals.interval_start ORDER BY intervals.interval_start) AS row_num
                                    FROM intervals
                                    LEFT JOIN lhr_log_stat ON lhr_log_stat.date_time >= intervals.interval_start AND lhr_log_stat.date_time < intervals.interval_end
                                    INNER JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id 
                                    INNER JOIN lhr_konstanta ON lhr_konstanta.lokasi_id = jt_lokasi_uppkb.id 
                                    WHERE 
                                            lhr_log_stat.lokasi_id = ${lokasi_id} AND 
                                            lhr_log_stat.is_active = true AND 
                                            lhr_log_stat.is_deleted = false AND
                                            lhr_log_stat.lane = 1
                                    GROUP BY 
                                        lhr_log_stat.lokasi_id,
                                        jt_lokasi_uppkb.nama,
                                        lhr_konstanta.jml_lajur,
                                        lhr_konstanta.co_konstanta,
                                        lhr_konstanta.fsf_fchs,
                                        lhr_konstanta.fclj,
                                        lhr_konstanta.fcpa,
                                        lhr_konstanta.fcs_fcuk,
                                        intervals.interval_start, 
                                        intervals.interval_end
                            )
                            SELECT
                                    lokasi_id,
                                    nama_lokasi,
                                    fsf,
                                    fclj,
                                    fcpa,
                                    fcs,
                                    motor,
                                    mobil,
                                    truck_bus,
                                    truck,
                                    bus,
                                    smp,
                                    gap,
                                    headway,
                                    p_speed,
                                    kec_rata_rata,
                                    p_occupancy,
                                    total,
                                    kapasitas,
                                    ds,
                                    to_char(interval_start, 'HH24:MI') AS waktu_from,
                                    to_char(interval_end, 'HH24:MI') AS waktu_to,
                                    concat(to_char(interval_start, 'HH24:MI'), ' - ', to_char(interval_end, 'HH24:MI')) AS waktu
                            FROM aggregated_data
                            WHERE row_num = 1
                            ORDER BY interval_start`;

                    if (interval == 2) {
                        sql = `WITH intervals AS (
                                    SELECT 
                                        generate_series(start_time, end_time - INTERVAL '1 second', '1 hour'::interval) AS interval_start,
                                        generate_series(start_time + INTERVAL '1 hour', end_time, '1 hour'::interval) AS interval_end
                                    FROM (
                                        SELECT 
                                            generate_series('${tgl} 00:00:00'::timestamp, '${besok} 00:00:00'::timestamp, '1 hour'::interval) AS start_time,
                                            generate_series('${tgl} 01:00:00'::timestamp, '${besok} 01:00:00'::timestamp, '1 hour'::interval) AS end_time
                                    ) AS hour_intervals
                                ), aggregated_data AS (
                                    SELECT
                                            lhr_log_stat.lokasi_id as lokasi_id,
                                            jt_lokasi_uppkb.nama as nama_lokasi,
                                            intervals.interval_start,
                                            intervals.interval_end,
                                            lhr_konstanta.co_konstanta AS so_dasar,
                                            ROUND((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur)::numeric, 0) AS so_fix,
                                            lhr_konstanta.fsf_fchs AS fsf, --faktor_hambatan_samping,
                                            lhr_konstanta.fclj AS fclj, --nilai_satuan_lebar_lajur,
                                            lhr_konstanta.fcpa AS fcpa, --faktor_koreksi_kapasitas_akibat,
                                            lhr_konstanta.fcs_fcuk AS fcs, --faktor_ukuran_kota,
                                            ROUND(((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur) * lhr_konstanta.fsf_fchs	* lhr_konstanta.fclj * lhr_konstanta.fcpa * lhr_konstanta.fcs_fcuk)::numeric, 0) AS kapasitas,
                                            SUM(lhr_log_stat.class_2) AS motor,
                                            SUM(lhr_log_stat.class_3) AS mobil,
                                            SUM(lhr_log_stat.class_4) AS truck_bus,
                                            SUM(lhr_log_stat.class_5) AS truck,
                                            SUM(lhr_log_stat.class_7) AS bus,
                                            ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) AS smp,
                                            ROUND(AVG(lhr_log_stat.headway)::numeric, 0) AS headway,
                                            ROUND(AVG(ABS(lhr_log_stat.speed_85th))::numeric, 0) AS p_speed,
                                            ROUND(AVG(ABS(lhr_log_stat.speed_avg))::numeric, 0) AS kec_rata_rata,
                                            ROUND(AVG(ABS(lhr_log_stat.gap))::numeric, 0) AS gap,
                                            ROUND(AVG(ABS(lhr_log_stat.occupancy))::numeric, 0) AS p_occupancy,
                                            (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) AS total,
                                            ROUND((
                                                (((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3))) / 
                                                ((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur) * lhr_konstanta.fsf_fchs	* lhr_konstanta.fclj * lhr_konstanta.fcpa * lhr_konstanta.fcs_fcuk)
                            )::numeric, 3) AS ds,
                                            ROW_NUMBER() OVER (PARTITION BY intervals.interval_start ORDER BY intervals.interval_start) AS row_num
                                    FROM intervals
                                    LEFT JOIN lhr_log_stat ON lhr_log_stat.date_time >= intervals.interval_start AND lhr_log_stat.date_time < intervals.interval_end
                                    INNER JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id 
                                    INNER JOIN lhr_konstanta ON lhr_konstanta.lokasi_id = jt_lokasi_uppkb.id 
                                    WHERE 
                                            lhr_log_stat.lokasi_id = ${lokasi_id} AND 
                                            lhr_log_stat.is_active = true AND 
                                            lhr_log_stat.is_deleted = false AND
                                            lhr_log_stat.lane = 1
                                    GROUP BY 
                                        lhr_log_stat.lokasi_id,
                                        jt_lokasi_uppkb.nama,
                                        lhr_konstanta.jml_lajur,
                                        lhr_konstanta.co_konstanta,
                                        lhr_konstanta.fsf_fchs,
                                        lhr_konstanta.fclj,
                                        lhr_konstanta.fcpa,
                                        lhr_konstanta.fcs_fcuk,
                                        intervals.interval_start, 
                                        intervals.interval_end
                            )
                            SELECT
                                    lokasi_id,
                                    nama_lokasi,
                                    fsf,
                                    fclj,
                                    fcpa,
                                    fcs,
                                    motor,
                                    mobil,
                                    truck_bus,
                                    truck,
                                    bus,
                                    smp,
                                    gap,
                                    headway,
                                    p_speed,
                                    kec_rata_rata,
                                    p_occupancy,
                                    total,
                                    kapasitas,
                                    ds,
                                    to_char(interval_start, 'HH24:00') AS waktu_from,
                                    to_char(interval_end, 'HH24:00') AS waktu_to,
                                    concat(to_char(interval_start, 'HH24:00'), ' - ', to_char(interval_end, 'HH24:00')) AS waktu
                            FROM aggregated_data
                            WHERE row_num = 1
                            ORDER BY interval_start
                                `;
                    }

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                return result
            }

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    const dataABJK = async (req, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const intl = req.query.interval_lhr_ab;
            let interval = 3;
            if (intl) {
                interval = intl;
            }
            const now = moment();
            const tgl = moment(now).format('YYYY-MM-DD');
            const tahun = moment().format('YYYY');

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
                            WHERE jt_vr_data.tgl_capture BETWEEN '${tgl} 00:00:00' AND '${tgl} 23:59:00' AND jt_vr_data.kode_uppkb = '${kode_uppkb}'
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
                                jt_vr_data.tgl_capture BETWEEN '${tgl} 00:00:00' AND '${tgl} 23:59:00' AND jt_vr_data.kode_uppkb = '${kode_uppkb}'
                            GROUP BY
                                jt_lokasi_uppkb.id, tanggal, waktu_real
                            ORDER BY
                                waktu_real`;
                }

                if (interval == 3) {
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
                                EXTRACT(YEAR FROM jt_vr_data.tgl_capture) = ${tahun} AND jt_vr_data.kode_uppkb = '${kode_uppkb}'
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

        } catch (error) {
            next(error)
        }
    }

    const getKinerjaRuas = async (req, next) => {
        console.log('--------------------::Processing Get Kinerja Ruas By Lokasi::--------------------');
        try {
            var lokasi = req.query.lokasi;
    
            var sql = `SELECT
                            date_trunc('hour', lhr_log_stat.date_time) AS tgl_jam,
                            concat(concat(extract(hour from lhr_log_stat.date_time),':','00'), ' - ',to_char(lhr_log_stat.date_time + INTERVAL '60 Minutes', 'HH24:00'))  as waktu,
                            lhr_log_stat.ip_address AS ip_addresults,
                            lhr_log_stat.lane,
                            jt_lokasi_uppkb.id AS id_lokasi,
                            jt_lokasi_uppkb.kode AS kode_lokasi,
                            jt_lokasi_uppkb.nama AS nama_lokasi,
                            lhr_log_stat.sensor_id,
                            lhr_log_stat.kode_sensor,
                            lhr_log_stat.desk_sensor,
                            lhr_log_stat.desk_lane,	
                            lhr_konstanta.jml_lajur, 
                            lhr_konstanta.co_konstanta AS so_dasar,
                            ROUND((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur)::numeric, 0) AS so_fix,
                            lhr_konstanta.fsf_fchs AS fsf, --faktor_hambatan_samping,
                            lhr_konstanta.fclj AS fclj, --nilai_satuan_lebar_lajur,
                            lhr_konstanta.fcpa AS fcpa, --faktor_koreksi_kapasitas_akibat,
                            lhr_konstanta.fcs_fcuk AS fcs, --faktor_ukuran_kota,
                            lhr_konstanta.plt AS plt,
                            lhr_konstanta.prt AS prt,
                            lhr_konstanta.fp AS fp,
                            lhr_konstanta.fg AS fg,		
                            ROUND(((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur) * lhr_konstanta.fsf_fchs	* lhr_konstanta.fclj * lhr_konstanta.fcpa * lhr_konstanta.fcs_fcuk)::numeric, 0) AS kapasitas,
                            SUM(lhr_log_stat.class_2) as motor,
                            SUM(lhr_log_stat.class_3) as mobil,
                            SUM(lhr_log_stat.class_4) as truck_bus,
                            SUM(lhr_log_stat.class_5) as truck,
                            SUM(lhr_log_stat.class_7) as bus,
                            ((SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3)) + SUM(lhr_log_stat.class_4)) AS jml_kend,
                            ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) AS qtot,
                            ROUND(AVG(lhr_log_stat.headway)::numeric, 0) AS headway,
                            ROUND(AVG(ABS(lhr_log_stat.speed_85th))::numeric, 0) AS p_speed,
                            ROUND(AVG(ABS(lhr_log_stat.speed_avg))::numeric, 0) AS kec_rata_rata,
                            ROUND(AVG(ABS(lhr_log_stat.gap))::numeric, 0) AS gap,
                            ROUND(AVG(ABS(lhr_log_stat.occupancy))::numeric, 0) AS p_occupancy,
                            ROUND((
                                        (((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3))) / 
                                        ((lhr_konstanta.co_konstanta * lhr_konstanta.jml_lajur) * lhr_konstanta.fsf_fchs	* lhr_konstanta.fclj * lhr_konstanta.fcpa * lhr_konstanta.fcs_fcuk)
                            )::numeric, 3) AS ds,
                            COALESCE(jt_streaming_akses_url_1.akses_url, jt_streaming_akses_url_2.akses_url) AS url_proxy_cam,
                            COALESCE(jt_streaming_akses_url_1.webrtc_url, jt_streaming_akses_url_2.webrtc_url) AS url_webrtc_cam
                        FROM lhr_log_stat 
                        INNER JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id 
                        INNER JOIN lhr_konstanta ON lhr_konstanta.lokasi_id = jt_lokasi_uppkb.id 
                        LEFT JOIN LATERAL (
                            SELECT akses_url, webrtc_url
                            FROM jt_streaming
                            WHERE jt_streaming.lokasi_id = jt_lokasi_uppkb.id 
                            AND jt_streaming.is_lhr = true
                            AND lhr_log_stat.sensor_id = 23
                            AND (
                                jt_streaming.nama ILIKE '%1%'
                                OR NOT EXISTS (SELECT 1 FROM jt_streaming WHERE jt_streaming.lokasi_id = jt_lokasi_uppkb.id AND jt_streaming.nama ILIKE '%1%')
                            )
                            LIMIT 1
                        ) AS jt_streaming_akses_url_1 ON true
                        LEFT JOIN LATERAL (
                            SELECT akses_url, webrtc_url
                            FROM jt_streaming
                            WHERE jt_streaming.lokasi_id = jt_lokasi_uppkb.id 
                            AND lhr_log_stat.sensor_id = 24
                            AND jt_streaming.is_lhr = true
                            AND jt_streaming.nama ILIKE '%2%'
                            LIMIT 1
                        ) AS jt_streaming_akses_url_2 ON true
                        WHERE 
                            jt_lokasi_uppkb.id = ${lokasi}
                            AND lhr_log_stat.date_time BETWEEN CURRENT_TIMESTAMP - INTERVAL '15 MINUTE' AND CURRENT_TIMESTAMP 
                            AND lhr_log_stat.lane = 1
                            AND lhr_log_stat.is_active = true 
                            AND lhr_log_stat.is_deleted = false
                        GROUP BY
                            tgl_jam,
                            waktu,
                            lhr_log_stat.ip_address,
                            lhr_log_stat.lane,
                            jt_lokasi_uppkb.id,
                            jt_lokasi_uppkb.kode,
                            jt_lokasi_uppkb.nama,
                            lhr_log_stat.sensor_id,
                            lhr_log_stat.kode_sensor,
                            lhr_log_stat.desk_sensor,
                            lhr_log_stat.desk_lane,
                            lhr_konstanta.jml_lajur,
                            lhr_konstanta.co_konstanta,
                            lhr_konstanta.fsf_fchs,
                            lhr_konstanta.fclj,
                            lhr_konstanta.fcpa,
                            lhr_konstanta.fcs_fcuk,
                            lhr_konstanta.plt,
                            lhr_konstanta.prt,
                            lhr_konstanta.fp,
                            lhr_konstanta.fg,
                            COALESCE(jt_streaming_akses_url_1.akses_url, jt_streaming_akses_url_2.akses_url),
                            url_webrtc_cam
                        ORDER BY ds DESC`;
    
            // console.log(sql);

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            })

            return result
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    const resumeDataProduksi = async (req, res, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const tanggal = req.query.tanggal;
            const now = moment();
            const tgl = tanggal ? moment(tanggal).format('YYYY-MM-DD') : moment(now).format('YYYY-MM-DD');

            let sql = `SELECT 
                        tgl_penimbangan::date as tanggal,
                        COUNT(*) AS jml_timbang,
                        COUNT(CASE WHEN is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar,
                        COUNT(CASE WHEN is_melanggar = false THEN 1 ELSE NULL END) AS jml_tdk_melanggar
                    FROM jt_penimbangan 
                    WHERE is_transaksi = 1 AND tgl_penimbangan::date = '${tgl}' AND is_active = true AND is_deleted = false
                    GROUP BY tanggal`;

            if (lokasi_id) {
                sql = `SELECT 
                        tgl_penimbangan::date as tanggal,
                        lokasi_id,
                        COUNT(*) AS jml_timbang,
                        COUNT(CASE WHEN is_melanggar = true THEN 1 ELSE NULL END) AS jml_melanggar,
                        COUNT(CASE WHEN is_melanggar = false THEN 1 ELSE NULL END) AS jml_tdk_melanggar
                    FROM jt_penimbangan
                    WHERE is_transaksi = 1 AND tgl_penimbangan::date = '${tgl}' AND lokasi_id = ${lokasi_id} AND is_active = true AND is_deleted = false
                    GROUP BY tanggal, lokasi_id`;
            }

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });
            console.log(result);

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });

        } catch (error) {
            next(error)
        }
    }

    const resumeDataLhrUppkb = async (req, res, next) => {
        try {

            const tahunIni = moment().format('YYYY');
            const lokasi = req.query.lid;
            const bptd_id = req.query.bid;
            const tahun = req.query.tahun;
            let year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if (bptd_id) {
                $where = `WHERE cpm.id_bptd = ${bptd_id}`;
            } else if (lokasi) {
                $where = `WHERE cpm.id_uppkb = ${lokasi}`;
            } else {
                $where = '';
            }

            let sql = `WITH count_penimbangan AS (
                            SELECT 
                                jt_lokasi_uppkb.id AS id_uppkb,
                                jt_lokasi_uppkb.kode AS kode_uppkb,
                                jt_lokasi_uppkb.nama AS nama_uppkb,
                                jt_bptd.id AS id_bptd,
                                jt_bptd.kode AS kode_bptd,
                                jt_bptd.nama AS nama_bptd,
                                COUNT(*) AS jml_timbang
                            FROM jt_penimbangan
                            JOIN jt_lokasi_uppkb 
                                ON jt_penimbangan.lokasi_id = jt_lokasi_uppkb.id
                                AND jt_lokasi_uppkb.is_lhr = TRUE
                            JOIN jt_bptd 
                                ON jt_penimbangan.bptd_id = jt_bptd.id
                            WHERE 
                                jt_penimbangan.is_transaksi = 1
                                AND jt_penimbangan.is_active = TRUE
                                AND jt_penimbangan.is_deleted = FALSE
                                AND EXTRACT(YEAR FROM jt_penimbangan.tgl_penimbangan) = ${year}
                            GROUP BY 
                                jt_lokasi_uppkb.id, 
                                jt_lokasi_uppkb.kode, 
                                jt_lokasi_uppkb.nama, 
                                jt_bptd.id, 
                                jt_bptd.kode, 
                                jt_bptd.nama
                        ),
                        count_lhr AS (
                            SELECT
                                jt_lokasi_uppkb.id AS id_uppkb,
                                COALESCE(SUM(jt_vr_data_summary.count), 0) AS jml_tdk_masuk
                            FROM jt_vr_data_summary
                            JOIN jt_lokasi_uppkb 
                                ON jt_vr_data_summary.kode_uppkb = jt_lokasi_uppkb.kode
                                AND jt_lokasi_uppkb.is_lhr = TRUE
                            WHERE jt_vr_data_summary."year" = ${year}
                            GROUP BY jt_lokasi_uppkb.id
                        )
                        SELECT
                            cpm.id_uppkb,
                            cpm.kode_uppkb,
                            cpm.nama_uppkb,
                            cpm.id_bptd,
                            cpm.kode_bptd,
                            cpm.nama_bptd,
                            COALESCE(SUM(cpm.jml_timbang), 0) AS jml_masuk,
                            COALESCE(SUM(cpl.jml_tdk_masuk), 0) AS jml_tdk_masuk
                        FROM count_penimbangan cpm
                        LEFT JOIN count_lhr cpl ON cpm.id_uppkb = cpl.id_uppkb
                        ${$where}
                        GROUP BY 
                            cpm.id_uppkb, 
                            cpm.kode_uppkb, 
                            cpm.nama_uppkb, 
                            cpm.id_bptd, 
                            cpm.kode_bptd, 
                            cpm.nama_bptd
                        ORDER BY 
                            cpm.id_uppkb, 
                            cpm.kode_uppkb`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            })

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });

        } catch (error) {
            next(error);
        }
    }

    const resumeKelebihanMuatan = async (req, res, next) => {
        try {

            const tahunIni = moment().format('YYYY');
            const lokasi = req.query.lid;
            const bptd_id = req.query.bid;
            const tahun = req.query.tahun;
            let year = tahunIni;
            if (tahun) {
                year = tahun;
            }

            if (bptd_id) {
                let where = ''
                if (lokasi) {
                    where = `AND jt_lokasi_uppkb.id = ${lokasi} `;
                }

                var sql = `SELECT 
                                jt_lokasi_uppkb.id AS id_uppkb, 
                                jt_lokasi_uppkb.kode AS kode_uppkb, 
                                jt_lokasi_uppkb.nama AS nama_uppkb,
                                jt_bptd.id AS id_bptd, 
                                jt_bptd.kode AS kode_bptd,
                                jt_bptd.nama AS nama_bptd,
                                COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 5 AND round(jt_penimbangan.prosen_lebih) <= 20 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_5_20,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 21 AND round(jt_penimbangan.prosen_lebih) <= 40 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_21_40,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 41 AND round(jt_penimbangan.prosen_lebih) <= 60 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_41_60,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 61 AND round(jt_penimbangan.prosen_lebih) <= 80 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_61_80,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 81 AND round(jt_penimbangan.prosen_lebih) <= 100 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_81_100,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 100 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_up_100,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 5 THEN 1
                                    ELSE NULL
                                END
                            ) AS total
                        FROM jt_lokasi_uppkb
                        INNER JOIN jt_bptd ON jt_bptd.id = jt_lokasi_uppkb.bptd_id
                        LEFT JOIN jt_penimbangan 
                            ON jt_penimbangan.lokasi_id = jt_lokasi_uppkb.id
                            AND date_part('year', jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.is_transaksi = 1 
                            AND jt_penimbangan.jbi_uji > 0::double precision 
                            AND jt_penimbangan.berat_timbang > 500::double precision 
                            AND jt_penimbangan.berat_timbang IS NOT NULL 
                            AND jt_penimbangan.berat_timbang <> 'NaN'::double precision
                            AND jt_penimbangan.is_active = true 
                            AND jt_penimbangan.is_deleted = false 
                            AND jt_penimbangan.is_melanggar = true
                        LEFT JOIN jt_pelanggaran 
                            ON jt_penimbangan.kode_trx = jt_pelanggaran.kode_trx
                            AND jt_pelanggaran.jenis_pelanggaran_id = 1
                        WHERE 
                            jt_lokasi_uppkb.is_active = TRUE 
                            AND jt_lokasi_uppkb.status_operasi = 1
                            AND jt_lokasi_uppkb.bptd_id = ${bptd_id}
                            ${where}
                        GROUP BY jt_lokasi_uppkb.id, jt_lokasi_uppkb.kode, jt_lokasi_uppkb.nama, jt_bptd.id, jt_bptd.kode, jt_bptd.nama
                        ORDER BY jt_lokasi_uppkb.nama ASC`;

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });
    
                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: result
                });
            } else {
                var sql = `SELECT 
                            jt_bptd.id AS id_bptd, 
                            jt_bptd.kode AS kode_bptd,
                            jt_bptd.nama AS nama_bptd,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 5 AND round(jt_penimbangan.prosen_lebih) <= 20 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_5_20,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 21 AND round(jt_penimbangan.prosen_lebih) <= 40 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_21_40,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 41 AND round(jt_penimbangan.prosen_lebih) <= 60 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_41_60,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 61 AND round(jt_penimbangan.prosen_lebih) <= 80 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_61_80,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) >= 81 AND round(jt_penimbangan.prosen_lebih) <= 100 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_81_100,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 100 THEN 1
                                    ELSE NULL
                                END
                            ) AS range_up_100,
                            COUNT(
                                CASE
                                    WHEN round(jt_penimbangan.prosen_lebih) > 5 THEN 1
                                    ELSE NULL
                                END
                            ) AS total
                        FROM jt_bptd
                        INNER JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.bptd_id = jt_bptd.id
                        LEFT JOIN jt_penimbangan 
                            ON jt_penimbangan.lokasi_id = jt_lokasi_uppkb.id
                            AND date_part('year', jt_penimbangan.tgl_penimbangan) = ${year}
                            AND jt_penimbangan.is_transaksi = 1 
                            AND jt_penimbangan.jbi_uji > 0::double precision 
                            AND jt_penimbangan.berat_timbang > 500::double precision 
                            AND jt_penimbangan.berat_timbang IS NOT NULL 
                            AND jt_penimbangan.berat_timbang <> 'NaN'::double precision
                            AND jt_penimbangan.is_active = true 
                            AND jt_penimbangan.is_deleted = false 
                            AND jt_penimbangan.is_melanggar = true
                        LEFT JOIN jt_pelanggaran 
                            ON jt_penimbangan.kode_trx = jt_pelanggaran.kode_trx
                            AND jt_pelanggaran.jenis_pelanggaran_id = 1
                        WHERE 
                            jt_bptd.is_active = TRUE
                        GROUP BY jt_bptd.id, jt_bptd.kode, jt_bptd.nama
                        ORDER BY jt_bptd.nama ASC`;

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
    }

    return {
        chartPenimbangan,
        chartPenindakan,
        chartJmlJenisPelanggaran,
        chartLebihMuat,
        toptenMelanggarAsalTujuan,
        toptenMelanggarPerusahaan,
        toptenMelanggarKomoditi,
        toptenMelanggarJenisKendaraan,
        widgetUppkb,
        widgetPenimbangan,
        widgetMelanggar,
        widgetTidakDiTindak,
        widgetPenindakan,
        widgetAngkutanBarangTidakMasukUPPKB,
        widgetVerifikasi,
        widgetTidakDiVerifikasi,
        chartAngkutanBarangTidakMasuk,
        chartLhrUmum,
        chartLhrVerifikasi,
        lhrBarangTidakMasuk,
        lhrBarangTidakMasukXls,
        lhrBarangTidakMasukPrint,
        getJumlahBlue,
        getJumlahBlueAktif,
        topMelanggarKategoriKomoditi,
        topFiveUppkb,
        topFiveBptd,
        getDataLokasi,
        resumeDataProduksi,
        resumeKelebihanMuatan,
        resumeDataLhrUppkb,
    }
}

module.exports = DashboardWimController;