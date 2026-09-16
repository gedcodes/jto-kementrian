const {
    t_lokasi,
    sequelize
} = require('../models');
const {
    getLokasiUppkbKode
} = require('./lib/dataid');
const { Op, QueryTypes, where } = require('sequelize');
const messageService = require('../services/message.service');
const moment = require('moment');

const StatistikWdimController = () => {

    // Fungsi untuk menghitung persentase
    const calculatePercentage = (current, previous) => {
        if (previous === 0) {
            return current > 0 ? 100 : 0; // Jika kemarin 0 dan hari ini ada data = +100%
        }
        return Number((((current - previous) / previous) * 100).toFixed(2));
    };

    const calculatePercentageOfTotal = (current, total) => {
        if (total === 0) {
            return current > 0 ? 100 : 0; // Jika total 0 dan ada data = +100%
        }
        return Number((current / total) * 100).toFixed(2);
    };

    const getSinkronisasiData = async (req, res, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;

            let where = `WHERE lu.is_wim = TRUE`;

            if (bptd_id) {
                where = `WHERE lu.is_wim = TRUE AND lu.bptd_id = ${bptd_id}`;
            }
            if (lokasi_id) {
                where = `WHERE lu.is_wim = TRUE AND lu.id = ${lokasi_id}`;
            }
            var sql = `SELECT 
                            lu.id,
                            lu.kode,
                            lu.nama,
                            lu.lat_pos,
                            lu.lon_pos,
                            lu.alamat_uppkb,
                            COALESCE(mv.has_data_today, false) AS status_sinkron,
                            mv.last_data,
                            mv.total_records,
                            mv.last_date
                        FROM jt_lokasi_uppkb lu
                        LEFT JOIN mv_wim_status mv ON mv.kode_uppkb = lu.kode
                        ${where}
                        ORDER BY lu.nama;`;

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

    const getResumeData = async (req, res, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const interval = req.query.interval || '1'; // default harian
            const tanggal = req.query.tanggal;
            const tanggal_dari = req.query.tanggal_dari;
            const tanggal_sampai = req.query.tanggal_sampai;
            const bulan_dari = req.query.bulan_dari;
            const bulan_sampai = req.query.bulan_sampai;
            const tahun = req.query.tahun;
            const tahun_dari = req.query.tahun_dari;
            const tahun_sampai = req.query.tahun_sampai;

            const now = moment();
            
            // Deklarasi variabel dengan let agar bisa diubah
            let whereClause = '';

            const hariIni = tanggal ? moment(tanggal).format('YYYY-MM-DD') : moment(now).format('YYYY-MM-DD');
            const kemarin = tanggal ? moment(tanggal).add(-1, 'days').format('YYYY-MM-DD') : moment(now).add(-1, 'days').format('YYYY-MM-DD');

            // Deklarasi variabel untuk bulanan dan tahunan
            let tahunValue, bulanFrom, bulanTo, tahunFrom, tahunTo;

            // Build WHERE clause berdasarkan interval
            switch (interval) {
                case '1': // Harian
                    if (tanggal_dari && tanggal_sampai) {
                        whereClause = `WHERE w.tanggal BETWEEN '${moment(tanggal_dari).format('YYYY-MM-DD')}' AND '${moment(tanggal_sampai).format('YYYY-MM-DD')}'`;
                    } else {
                        whereClause = `WHERE w.tanggal = '${hariIni}'`;
                    }
                    break;

                case '2': // Bulanan
                    bulanFrom = bulan_dari.toString() || '1';
                    bulanTo = bulan_sampai.toString() || '12';
                    tahunValue = tahun.toString() || moment(now).format('YYYY');
                    
                    whereClause = `WHERE EXTRACT(YEAR FROM w.tanggal) = ${tahunValue} AND EXTRACT(MONTH FROM w.tanggal) BETWEEN ${bulanFrom} AND ${bulanTo}`;
                    break;

                case '3': // Tahunan
                    tahunFrom = tahun_dari || moment(now).add(-5, 'years').format('YYYY');
                    tahunTo = tahun_sampai || moment(now).format('YYYY');
                    
                    whereClause = `WHERE EXTRACT(YEAR FROM w.tanggal) BETWEEN ${tahunFrom} AND ${tahunTo}`;
                    break;

                default: // Harian
                    whereClause = `WHERE w.tanggal = '${moment(now).format('YYYY-MM-DD')}'`;
            }

            // Tambahkan filter lokasi/bptd jika ada
            if (bptd_id) {
                whereClause += ` AND lu.bptd_id = ${bptd_id}`;
            }
            if (lokasi_id) {
                whereClause += ` AND lu.id = ${lokasi_id}`;
            }

            // Query untuk periode saat ini
            let sqlCurrent = `SELECT
                                SUM(w.jumlah_kendaraan) as jumlah_kendaraan,
                                SUM(w.terdeteksi_overload) as terdeteksi_overload,
                                SUM(w.potensi_over_dimensi) as potensi_over_dimensi,
                                SUM(w.total_deteksi_blue) as total_deteksi_blue,
                                SUM(w.total_tidak_terdeteksi_blue) as total_tidak_terdeteksi_blue,
                                SUM(COALESCE(p.total_masuk_uppkb, 0)) as total_masuk_uppkb,
                                AVG(w.kecepatan_rata_rata) as kecepatan_rata_rata,
                                SUM(w.total_melanggar) as total_melanggar,
                                SUM(COALESCE(v.total_tidak_masuk, 0)) as total_tidak_masuk,
                                SUM(COALESCE(v.total_verifikasi, 0)) as total_verifikasi,
                                SUM(COALESCE(v.total_tidak_masuk - v.total_verifikasi, 0)) as total_tidak_verifikasi
                            FROM mv_resume_wim_summary w
                            LEFT JOIN mv_resume_masuk_uppkb_summary p USING (tanggal, kode_uppkb)
                            LEFT JOIN mv_resume_vr_summary v USING (tanggal, kode_uppkb)
                            LEFT JOIN jt_lokasi_uppkb lu ON lu.kode = w.kode_uppkb
                            ${whereClause}`;

            // Query untuk periode sebelumnya (untuk perbandingan)
            let sqlPrevious = '';

            if (interval === '1') {
                // Untuk harian, bandingkan dengan hari sebelumnya
                let previousDate = '';
                if (tanggal_dari && tanggal_sampai) {
                    previousDate = `WHERE w.tanggal BETWEEN '${moment(tanggal_dari).add(-1, 'days').format('YYYY-MM-DD')}' AND '${moment(tanggal_sampai).add(-1, 'days').format('YYYY-MM-DD')}'`;
                } else {
                    previousDate = `WHERE w.tanggal = '${kemarin}'`;
                }
                
                if (bptd_id) previousDate += ` AND lu.bptd_id = ${bptd_id}`;
                if (lokasi_id) previousDate += ` AND lu.id = ${lokasi_id}`;

                sqlPrevious = sqlCurrent.replace(whereClause, previousDate);
            } else if (interval === '2') {
                // Untuk bulanan, bandingkan dengan tahun sebelumnya
                const previousYearWhere = whereClause.replace(
                    `EXTRACT(YEAR FROM w.tanggal) = ${tahunValue}`,
                    `EXTRACT(YEAR FROM w.tanggal) = ${parseInt(tahunValue) - 1}`
                );
                sqlPrevious = sqlCurrent.replace(whereClause, previousYearWhere);
            } else if (interval === '3') {
                // Untuk tahunan, bandingkan dengan range tahun sebelumnya
                const rangeLength = parseInt(tahunTo) - parseInt(tahunFrom) + 1;
                const previousYearWhere = whereClause.replace(
                    `BETWEEN ${tahunFrom} AND ${tahunTo}`,
                    `BETWEEN ${parseInt(tahunFrom) - rangeLength} AND ${parseInt(tahunFrom) - 1}`
                );
                sqlPrevious = sqlCurrent.replace(whereClause, previousYearWhere);
            }

            const resultCurrent = await sequelize.query(sqlCurrent, {
                type: QueryTypes.SELECT,
                logging: false
            });

            let resultPrevious = [];
            if (sqlPrevious) {
                resultPrevious = await sequelize.query(sqlPrevious, {
                    type: QueryTypes.SELECT,
                    logging: false
                });
            }

            // Data periode saat ini
            const current = resultCurrent[0] || {
                jumlah_kendaraan: 0, terdeteksi_overload: 0, potensi_over_dimensi: 0,
                total_deteksi_blue: 0, total_tidak_terdeteksi_blue: 0, total_masuk_uppkb: 0,
                kecepatan_rata_rata: 0, total_melanggar: 0, total_tidak_masuk: 0,
                total_verifikasi: 0, total_tidak_verifikasi: 0
            };

            // Data periode sebelumnya
            const previous = resultPrevious[0] || {
                jumlah_kendaraan: 0, terdeteksi_overload: 0, potensi_over_dimensi: 0,
                total_deteksi_blue: 0, total_tidak_terdeteksi_blue: 0, total_masuk_uppkb: 0,
                kecepatan_rata_rata: 0, total_melanggar: 0, total_tidak_masuk: 0,
                total_verifikasi: 0, total_tidak_verifikasi: 0
            };

            const percentages = {
                jumlah_kendaraan: calculatePercentage(Number(current.jumlah_kendaraan), Number(previous.jumlah_kendaraan)),
                terdeteksi_overload: calculatePercentage(Number(current.terdeteksi_overload), Number(previous.terdeteksi_overload)),
                potensi_over_dimensi: calculatePercentage(Number(current.potensi_over_dimensi), Number(previous.potensi_over_dimensi)),
                total_deteksi_blue: calculatePercentage(Number(current.total_deteksi_blue), Number(previous.total_deteksi_blue)),
                total_tidak_terdeteksi_blue: calculatePercentage(Number(current.total_tidak_terdeteksi_blue), Number(previous.total_tidak_terdeteksi_blue)),
                total_masuk_uppkb: calculatePercentage(Number(current.total_masuk_uppkb), Number(previous.total_masuk_uppkb)),
                kecepatan_rata_rata: calculatePercentage(Number(current.kecepatan_rata_rata), Number(previous.kecepatan_rata_rata)),
                total_melanggar: calculatePercentage(Number(current.total_melanggar), Number(previous.total_melanggar)),
                total_tidak_masuk: calculatePercentage(Number(current.total_tidak_masuk), Number(previous.total_tidak_masuk)),
                total_verifikasi: calculatePercentage(Number(current.total_verifikasi), Number(previous.total_verifikasi)),
                total_tidak_verifikasi: calculatePercentage(Number(current.total_tidak_verifikasi), Number(previous.total_tidak_verifikasi))
            };

            // Hitung persentase terhadap jumlah kendaraan
            const percentageOfTotal = {
                terdeteksi_overload: calculatePercentageOfTotal(Number(current.terdeteksi_overload), Number(current.jumlah_kendaraan)),
                potensi_over_dimensi: calculatePercentageOfTotal(Number(current.potensi_over_dimensi), Number(current.jumlah_kendaraan)),
                total_deteksi_blue: calculatePercentageOfTotal(Number(current.total_deteksi_blue), Number(current.jumlah_kendaraan)),
                total_tidak_terdeteksi_blue: calculatePercentageOfTotal(Number(current.total_tidak_terdeteksi_blue), Number(current.jumlah_kendaraan)),
                total_masuk_uppkb: calculatePercentageOfTotal(Number(current.total_masuk_uppkb), Number(current.jumlah_kendaraan)),
                total_melanggar: calculatePercentageOfTotal(Number(current.total_melanggar), Number(current.jumlah_kendaraan)),
                total_tidak_masuk: calculatePercentageOfTotal(Number(current.total_tidak_masuk), Number(current.jumlah_kendaraan))
            };

            // Format response data
            const responseData = {
                jumlah_kendaraan: {
                    hari_ini: Number(current.jumlah_kendaraan),
                    kemarin: Number(previous.jumlah_kendaraan),
                    persentase: percentages.jumlah_kendaraan
                },
                terdeteksi_overload: {
                    hari_ini: Number(current.terdeteksi_overload),
                    kemarin: Number(previous.terdeteksi_overload),
                    persentase: percentages.terdeteksi_overload,
                    persentase_dari_total: percentageOfTotal.terdeteksi_overload
                },
                potensi_over_dimensi: {
                    hari_ini: Number(current.potensi_over_dimensi),
                    kemarin: Number(previous.potensi_over_dimensi),
                    persentase: percentages.potensi_over_dimensi,
                    persentase_dari_total: percentageOfTotal.potensi_over_dimensi
                },
                total_deteksi_blue: {
                    hari_ini: Number(current.total_deteksi_blue),
                    kemarin: Number(previous.total_deteksi_blue),
                    persentase: percentages.total_deteksi_blue,
                    persentase_dari_total: percentageOfTotal.total_deteksi_blue
                },
                total_tidak_terdeteksi_blue: {
                    hari_ini: Number(current.total_tidak_terdeteksi_blue),
                    kemarin: Number(previous.total_tidak_terdeteksi_blue),
                    persentase: percentages.total_tidak_terdeteksi_blue,
                    persentase_dari_total: percentageOfTotal.total_tidak_terdeteksi_blue
                },
                total_masuk_uppkb: {
                    hari_ini: Number(current.total_masuk_uppkb),
                    kemarin: Number(previous.total_masuk_uppkb),
                    persentase: percentages.total_masuk_uppkb,
                    persentase_dari_total: percentageOfTotal.total_masuk_uppkb
                },
                kecepatan_rata_rata: {
                    hari_ini: Number(current.kecepatan_rata_rata),
                    kemarin: Number(previous.kecepatan_rata_rata),
                    persentase: percentages.kecepatan_rata_rata
                },
                total_melanggar: {
                    hari_ini: Number(current.total_melanggar),
                    kemarin: Number(previous.total_melanggar),
                    persentase: percentages.total_melanggar,
                    persentase_dari_total: percentageOfTotal.total_melanggar
                },
                total_tidak_masuk: {
                    hari_ini: Number(current.total_tidak_masuk),
                    kemarin: Number(previous.total_tidak_masuk),
                    persentase: percentages.total_tidak_masuk,
                    persentase_dari_total: percentageOfTotal.total_tidak_masuk
                },
                total_verifikasi: {
                    hari_ini: Number(current.total_verifikasi),
                    kemarin: Number(previous.total_verifikasi),
                    persentase: percentages.total_verifikasi
                },
                total_tidak_verifikasi: {
                    hari_ini: Number(current.total_tidak_verifikasi),
                    kemarin: Number(previous.total_tidak_verifikasi),
                    persentase: percentages.total_tidak_verifikasi
                },
                periode: {
                    interval: parseInt(interval),
                    tanggal: interval === '1' ? {
                        dari: tanggal_dari || (tanggal ? moment(tanggal).format('YYYY-MM-DD') : moment(now).format('YYYY-MM-DD')),
                        sampai: tanggal_sampai || (tanggal ? moment(tanggal).format('YYYY-MM-DD') : moment(now).format('YYYY-MM-DD'))
                    } : null,
                    bulan: interval === '2' ? {
                        dari: bulan_dari || '1',
                        sampai: bulan_sampai || '12',
                        tahun: tahun || moment(now).format('YYYY')
                    } : null,
                    tahun: interval === '3' ? {
                        dari: tahun_dari || moment(now).add(-5, 'years').format('YYYY'),
                        sampai: tahun_sampai || moment(now).format('YYYY')
                    } : null
                }
            };

            res.status(200).send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: responseData
            });
        } catch (error) {
            next(error);
        }
    };

    const getTrendsOverloadData = async (req, res, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;

            let where = '';

            if (bptd_id) {
                where = `WHERE lu.bptd_id = ${bptd_id}`;
            }
            if (lokasi_id) {
                where = `WHERE lu.id = ${lokasi_id}`;
            }

            var sql = `WITH current_utc AS (
                            SELECT EXTRACT(HOUR FROM CURRENT_TIMESTAMP)::integer AS jam_sekarang_utc
                        ),
                        hours_24 AS (
                            SELECT 
                                generate_series(0, 23) AS jam_absolut,
                                ((SELECT jam_sekarang_utc FROM current_utc) + generate_series(1, 24)) % 24 AS jam_display
                            FROM current_utc
                        )
                        SELECT
                            h.jam_display AS jam,
                            COALESCE(SUM(mv.jumlah_kendaraan), 0) AS jumlah_kendaraan,
                            COALESCE(SUM(mv.jumlah_overload), 0) AS jumlah_overload,
                            CASE 
                                WHEN COALESCE(SUM(mv.jumlah_kendaraan), 0) > 0 THEN 
                                    ROUND((COALESCE(SUM(mv.jumlah_overload), 0) * 100.0 / COALESCE(SUM(mv.jumlah_kendaraan), 0)), 2)
                                ELSE 0 
                            END AS persentase_overload
                        FROM hours_24 h
                        LEFT JOIN mv_hourly_wim_traffic mv ON mv.jam = h.jam_display
                        LEFT JOIN jt_lokasi_uppkb lu ON lu.kode = mv.kode_uppkb
                        ${where}
                        GROUP BY h.jam_display, h.jam_absolut
                        ORDER BY h.jam_absolut`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            // Format response sesuai dengan yang diharapkan frontend
            const formattedData = result.map(item => ({
                jam: item.jam,
                jumlah_kendaraan: item.jumlah_kendaraan,
                jumlah_overload: item.jumlah_overload,
                persentase_overload: item.persentase_overload
            }));

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: formattedData
            });
        } catch (error) {
            next(error);
        }
    };

    const getHeatmapData = async (req, res, next) => {
        try {
            const { bptd, lokasi, interval, tanggal_dari, tanggal_sampai, bulan_dari, bulan_sampai, tahun, tahun_dari, tahun_sampai } = req.query;
            
            let sql = '';
            let whereConditions = [];
            let groupBy = '';
            let selectBy = '';
            let orderBy = '';

            // Validasi parameter berdasarkan interval
            if (interval === '1') {
                // Harian
                if (!tanggal_dari || !tanggal_sampai) {
                    res.send({
                        success: false,
                        message: 'Tanggal Dari dan Tanggal Sampai Harus Diisi'
                    });
                    return;
                }
                whereConditions.push(`mv.tanggal BETWEEN '${tanggal_dari}' AND '${tanggal_sampai}'`);
            } else if (interval === '2') {
                // Bulanan
                if (!bulan_dari || !bulan_sampai || !tahun) {
                    res.send({
                        success: false,
                        message: 'Bulan Dari, Bulan Sampai dan Tahun Harus Diisi'
                    });
                    return;
                }
                whereConditions.push(`mv.tahun = ${tahun}`);
                whereConditions.push(`mv.bulan BETWEEN ${bulan_dari} AND ${bulan_sampai}`);
            } else if (interval === '3') {
                // Tahunan
                if (!tahun_dari || !tahun_sampai) {
                    res.send({
                        success: false,
                        message: 'Tahun Dari dan Tahun Sampai Harus Diisi'
                    });
                    return;
                }
                whereConditions.push(`mv.tahun BETWEEN ${tahun_dari} AND ${tahun_sampai}`);
            } else {
                res.send({
                    success: false,
                    message: 'Interval harus diisi'
                });
                return;
            }

            // Tentukan SELECT dan GROUP BY berdasarkan lokasi dan interval
            if (lokasi) {
                // Jika lokasi dipilih
                if (interval === '1') {
                    // Harian - grouping berdasarkan hari
                    selectBy = 'mv.hari,';
                    groupBy = 'mv.hari';
                    orderBy = `CASE mv.hari
                        WHEN 'Senin' THEN 1
                        WHEN 'Selasa' THEN 2
                        WHEN 'Rabu' THEN 3
                        WHEN 'Kamis' THEN 4
                        WHEN 'Jumat' THEN 5
                        WHEN 'Sabtu' THEN 6
                        WHEN 'Minggu' THEN 7
                    END`;
                } else if (interval === '2') {
                    // Bulanan - grouping berdasarkan bulan
                    selectBy = 'mv.bulan,';
                    groupBy = 'mv.bulan';
                    orderBy = 'mv.bulan';
                } else if (interval === '3') {
                    // Tahunan - grouping berdasarkan tahun
                    selectBy = 'mv.tahun,';
                    groupBy = 'mv.tahun';
                    orderBy = 'mv.tahun';
                }
            } else {
                // Jika tidak ada lokasi - selalu grouping berdasarkan nama lokasi
                selectBy = 'lu.nama as nama,';
                groupBy = 'lu.nama';
                orderBy = 'lu.nama';
            }

            // Filter BPTD
            if (bptd) {
                whereConditions.push(`lu.bptd_id = '${bptd}'`);
            }

            // Filter Lokasi
            if (lokasi) {
                whereConditions.push(`lu.id = '${lokasi}'`);
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Tentukan kolom yang akan di-select berdasarkan interval
            let jamColumns = '';
            let overloadColumns = '';
            let persentaseColumns = '';
            let masukColumns = '';
            let persentaseMasukColumns = '';

            if (lokasi) {
                jamColumns = `
                    SUM(mv.jam_00) AS jam_00,
                    SUM(mv.jam_01) AS jam_01,
                    SUM(mv.jam_02) AS jam_02,
                    SUM(mv.jam_03) AS jam_03,
                    SUM(mv.jam_04) AS jam_04,
                    SUM(mv.jam_05) AS jam_05,
                    SUM(mv.jam_06) AS jam_06,
                    SUM(mv.jam_07) AS jam_07,
                    SUM(mv.jam_08) AS jam_08,
                    SUM(mv.jam_09) AS jam_09,
                    SUM(mv.jam_10) AS jam_10,
                    SUM(mv.jam_11) AS jam_11,
                    SUM(mv.jam_12) AS jam_12,
                    SUM(mv.jam_13) AS jam_13,
                    SUM(mv.jam_14) AS jam_14,
                    SUM(mv.jam_15) AS jam_15,
                    SUM(mv.jam_16) AS jam_16,
                    SUM(mv.jam_17) AS jam_17,
                    SUM(mv.jam_18) AS jam_18,
                    SUM(mv.jam_19) AS jam_19,
                    SUM(mv.jam_20) AS jam_20,
                    SUM(mv.jam_21) AS jam_21,
                    SUM(mv.jam_22) AS jam_22,
                    SUM(mv.jam_23) AS jam_23,`;

                overloadColumns = `
                    SUM(mv.jam_00_overload) AS jam_00_overload,
                    SUM(mv.jam_01_overload) AS jam_01_overload,
                    SUM(mv.jam_02_overload) AS jam_02_overload,
                    SUM(mv.jam_03_overload) AS jam_03_overload,
                    SUM(mv.jam_04_overload) AS jam_04_overload,
                    SUM(mv.jam_05_overload) AS jam_05_overload,
                    SUM(mv.jam_06_overload) AS jam_06_overload,
                    SUM(mv.jam_07_overload) AS jam_07_overload,
                    SUM(mv.jam_08_overload) AS jam_08_overload,
                    SUM(mv.jam_09_overload) AS jam_09_overload,
                    SUM(mv.jam_10_overload) AS jam_10_overload,
                    SUM(mv.jam_11_overload) AS jam_11_overload,
                    SUM(mv.jam_12_overload) AS jam_12_overload,
                    SUM(mv.jam_13_overload) AS jam_13_overload,
                    SUM(mv.jam_14_overload) AS jam_14_overload,
                    SUM(mv.jam_15_overload) AS jam_15_overload,
                    SUM(mv.jam_16_overload) AS jam_16_overload,
                    SUM(mv.jam_17_overload) AS jam_17_overload,
                    SUM(mv.jam_18_overload) AS jam_18_overload,
                    SUM(mv.jam_19_overload) AS jam_19_overload,
                    SUM(mv.jam_20_overload) AS jam_20_overload,
                    SUM(mv.jam_21_overload) AS jam_21_overload,
                    SUM(mv.jam_22_overload) AS jam_22_overload,
                    SUM(mv.jam_23_overload) AS jam_23_overload,`;

                persentaseColumns = `
                    CASE WHEN SUM(mv.jam_00) > 0 THEN ROUND((SUM(mv.jam_00_overload) * 100.0 / SUM(mv.jam_00)), 2) ELSE 0 END AS jam_00_persentase_overload,
                    CASE WHEN SUM(mv.jam_01) > 0 THEN ROUND((SUM(mv.jam_01_overload) * 100.0 / SUM(mv.jam_01)), 2) ELSE 0 END AS jam_01_persentase_overload,
                    CASE WHEN SUM(mv.jam_02) > 0 THEN ROUND((SUM(mv.jam_02_overload) * 100.0 / SUM(mv.jam_02)), 2) ELSE 0 END AS jam_02_persentase_overload,
                    CASE WHEN SUM(mv.jam_03) > 0 THEN ROUND((SUM(mv.jam_03_overload) * 100.0 / SUM(mv.jam_03)), 2) ELSE 0 END AS jam_03_persentase_overload,
                    CASE WHEN SUM(mv.jam_04) > 0 THEN ROUND((SUM(mv.jam_04_overload) * 100.0 / SUM(mv.jam_04)), 2) ELSE 0 END AS jam_04_persentase_overload,
                    CASE WHEN SUM(mv.jam_05) > 0 THEN ROUND((SUM(mv.jam_05_overload) * 100.0 / SUM(mv.jam_05)), 2) ELSE 0 END AS jam_05_persentase_overload,
                    CASE WHEN SUM(mv.jam_06) > 0 THEN ROUND((SUM(mv.jam_06_overload) * 100.0 / SUM(mv.jam_06)), 2) ELSE 0 END AS jam_06_persentase_overload,
                    CASE WHEN SUM(mv.jam_07) > 0 THEN ROUND((SUM(mv.jam_07_overload) * 100.0 / SUM(mv.jam_07)), 2) ELSE 0 END AS jam_07_persentase_overload,
                    CASE WHEN SUM(mv.jam_08) > 0 THEN ROUND((SUM(mv.jam_08_overload) * 100.0 / SUM(mv.jam_08)), 2) ELSE 0 END AS jam_08_persentase_overload,
                    CASE WHEN SUM(mv.jam_09) > 0 THEN ROUND((SUM(mv.jam_09_overload) * 100.0 / SUM(mv.jam_09)), 2) ELSE 0 END AS jam_09_persentase_overload,
                    CASE WHEN SUM(mv.jam_10) > 0 THEN ROUND((SUM(mv.jam_10_overload) * 100.0 / SUM(mv.jam_10)), 2) ELSE 0 END AS jam_10_persentase_overload,
                    CASE WHEN SUM(mv.jam_11) > 0 THEN ROUND((SUM(mv.jam_11_overload) * 100.0 / SUM(mv.jam_11)), 2) ELSE 0 END AS jam_11_persentase_overload,
                    CASE WHEN SUM(mv.jam_12) > 0 THEN ROUND((SUM(mv.jam_12_overload) * 100.0 / SUM(mv.jam_12)), 2) ELSE 0 END AS jam_12_persentase_overload,
                    CASE WHEN SUM(mv.jam_13) > 0 THEN ROUND((SUM(mv.jam_13_overload) * 100.0 / SUM(mv.jam_13)), 2) ELSE 0 END AS jam_13_persentase_overload,
                    CASE WHEN SUM(mv.jam_14) > 0 THEN ROUND((SUM(mv.jam_14_overload) * 100.0 / SUM(mv.jam_14)), 2) ELSE 0 END AS jam_14_persentase_overload,
                    CASE WHEN SUM(mv.jam_15) > 0 THEN ROUND((SUM(mv.jam_15_overload) * 100.0 / SUM(mv.jam_15)), 2) ELSE 0 END AS jam_15_persentase_overload,
                    CASE WHEN SUM(mv.jam_16) > 0 THEN ROUND((SUM(mv.jam_16_overload) * 100.0 / SUM(mv.jam_16)), 2) ELSE 0 END AS jam_16_persentase_overload,
                    CASE WHEN SUM(mv.jam_17) > 0 THEN ROUND((SUM(mv.jam_17_overload) * 100.0 / SUM(mv.jam_17)), 2) ELSE 0 END AS jam_17_persentase_overload,
                    CASE WHEN SUM(mv.jam_18) > 0 THEN ROUND((SUM(mv.jam_18_overload) * 100.0 / SUM(mv.jam_18)), 2) ELSE 0 END AS jam_18_persentase_overload,
                    CASE WHEN SUM(mv.jam_19) > 0 THEN ROUND((SUM(mv.jam_19_overload) * 100.0 / SUM(mv.jam_19)), 2) ELSE 0 END AS jam_19_persentase_overload,
                    CASE WHEN SUM(mv.jam_20) > 0 THEN ROUND((SUM(mv.jam_20_overload) * 100.0 / SUM(mv.jam_20)), 2) ELSE 0 END AS jam_20_persentase_overload,
                    CASE WHEN SUM(mv.jam_21) > 0 THEN ROUND((SUM(mv.jam_21_overload) * 100.0 / SUM(mv.jam_21)), 2) ELSE 0 END AS jam_21_persentase_overload,
                    CASE WHEN SUM(mv.jam_22) > 0 THEN ROUND((SUM(mv.jam_22_overload) * 100.0 / SUM(mv.jam_22)), 2) ELSE 0 END AS jam_22_persentase_overload,
                    CASE WHEN SUM(mv.jam_23) > 0 THEN ROUND((SUM(mv.jam_23_overload) * 100.0 / SUM(mv.jam_23)), 2) ELSE 0 END AS jam_23_persentase_overload,`;

                masukColumns = `
                    SUM(COALESCE(mvm.jam_00, 0)) AS jam_00_masuk,
                    SUM(COALESCE(mvm.jam_01, 0)) AS jam_01_masuk,
                    SUM(COALESCE(mvm.jam_02, 0)) AS jam_02_masuk,
                    SUM(COALESCE(mvm.jam_03, 0)) AS jam_03_masuk,
                    SUM(COALESCE(mvm.jam_04, 0)) AS jam_04_masuk,
                    SUM(COALESCE(mvm.jam_05, 0)) AS jam_05_masuk,
                    SUM(COALESCE(mvm.jam_06, 0)) AS jam_06_masuk,
                    SUM(COALESCE(mvm.jam_07, 0)) AS jam_07_masuk,
                    SUM(COALESCE(mvm.jam_08, 0)) AS jam_08_masuk,
                    SUM(COALESCE(mvm.jam_09, 0)) AS jam_09_masuk,
                    SUM(COALESCE(mvm.jam_10, 0)) AS jam_10_masuk,
                    SUM(COALESCE(mvm.jam_11, 0)) AS jam_11_masuk,
                    SUM(COALESCE(mvm.jam_12, 0)) AS jam_12_masuk,
                    SUM(COALESCE(mvm.jam_13, 0)) AS jam_13_masuk,
                    SUM(COALESCE(mvm.jam_14, 0)) AS jam_14_masuk,
                    SUM(COALESCE(mvm.jam_15, 0)) AS jam_15_masuk,
                    SUM(COALESCE(mvm.jam_16, 0)) AS jam_16_masuk,
                    SUM(COALESCE(mvm.jam_17, 0)) AS jam_17_masuk,
                    SUM(COALESCE(mvm.jam_18, 0)) AS jam_18_masuk,
                    SUM(COALESCE(mvm.jam_19, 0)) AS jam_19_masuk,
                    SUM(COALESCE(mvm.jam_20, 0)) AS jam_20_masuk,
                    SUM(COALESCE(mvm.jam_21, 0)) AS jam_21_masuk,
                    SUM(COALESCE(mvm.jam_22, 0)) AS jam_22_masuk,
                    SUM(COALESCE(mvm.jam_23, 0)) AS jam_23_masuk,`;

                persentaseMasukColumns = `
                    CASE WHEN SUM(mv.jam_00) > 0 THEN ROUND((SUM(mvm.jam_00) * 100.0 / SUM(mv.jam_00)), 2) ELSE 0 END AS jam_00_persentase_masuk,
                    CASE WHEN SUM(mv.jam_01) > 0 THEN ROUND((SUM(mvm.jam_01) * 100.0 / SUM(mv.jam_01)), 2) ELSE 0 END AS jam_01_persentase_masuk,
                    CASE WHEN SUM(mv.jam_02) > 0 THEN ROUND((SUM(mvm.jam_02) * 100.0 / SUM(mv.jam_02)), 2) ELSE 0 END AS jam_02_persentase_masuk,
                    CASE WHEN SUM(mv.jam_03) > 0 THEN ROUND((SUM(mvm.jam_03) * 100.0 / SUM(mv.jam_03)), 2) ELSE 0 END AS jam_03_persentase_masuk,
                    CASE WHEN SUM(mv.jam_04) > 0 THEN ROUND((SUM(mvm.jam_04) * 100.0 / SUM(mv.jam_04)), 2) ELSE 0 END AS jam_04_persentase_masuk,
                    CASE WHEN SUM(mv.jam_05) > 0 THEN ROUND((SUM(mvm.jam_05) * 100.0 / SUM(mv.jam_05)), 2) ELSE 0 END AS jam_05_persentase_masuk,
                    CASE WHEN SUM(mv.jam_06) > 0 THEN ROUND((SUM(mvm.jam_06) * 100.0 / SUM(mv.jam_06)), 2) ELSE 0 END AS jam_06_persentase_masuk,
                    CASE WHEN SUM(mv.jam_07) > 0 THEN ROUND((SUM(mvm.jam_07) * 100.0 / SUM(mv.jam_07)), 2) ELSE 0 END AS jam_07_persentase_masuk,
                    CASE WHEN SUM(mv.jam_08) > 0 THEN ROUND((SUM(mvm.jam_08) * 100.0 / SUM(mv.jam_08)), 2) ELSE 0 END AS jam_08_persentase_masuk,
                    CASE WHEN SUM(mv.jam_09) > 0 THEN ROUND((SUM(mvm.jam_09) * 100.0 / SUM(mv.jam_09)), 2) ELSE 0 END AS jam_09_persentase_masuk,
                    CASE WHEN SUM(mv.jam_10) > 0 THEN ROUND((SUM(mvm.jam_10) * 100.0 / SUM(mv.jam_10)), 2) ELSE 0 END AS jam_10_persentase_masuk,
                    CASE WHEN SUM(mv.jam_11) > 0 THEN ROUND((SUM(mvm.jam_11) * 100.0 / SUM(mv.jam_11)), 2) ELSE 0 END AS jam_11_persentase_masuk,
                    CASE WHEN SUM(mv.jam_12) > 0 THEN ROUND((SUM(mvm.jam_12) * 100.0 / SUM(mv.jam_12)), 2) ELSE 0 END AS jam_12_persentase_masuk,
                    CASE WHEN SUM(mv.jam_13) > 0 THEN ROUND((SUM(mvm.jam_13) * 100.0 / SUM(mv.jam_13)), 2) ELSE 0 END AS jam_13_persentase_masuk,
                    CASE WHEN SUM(mv.jam_14) > 0 THEN ROUND((SUM(mvm.jam_14) * 100.0 / SUM(mv.jam_14)), 2) ELSE 0 END AS jam_14_persentase_masuk,
                    CASE WHEN SUM(mv.jam_15) > 0 THEN ROUND((SUM(mvm.jam_15) * 100.0 / SUM(mv.jam_15)), 2) ELSE 0 END AS jam_15_persentase_masuk,
                    CASE WHEN SUM(mv.jam_16) > 0 THEN ROUND((SUM(mvm.jam_16) * 100.0 / SUM(mv.jam_16)), 2) ELSE 0 END AS jam_16_persentase_masuk,
                    CASE WHEN SUM(mv.jam_17) > 0 THEN ROUND((SUM(mvm.jam_17) * 100.0 / SUM(mv.jam_17)), 2) ELSE 0 END AS jam_17_persentase_masuk,
                    CASE WHEN SUM(mv.jam_18) > 0 THEN ROUND((SUM(mvm.jam_18) * 100.0 / SUM(mv.jam_18)), 2) ELSE 0 END AS jam_18_persentase_masuk,
                    CASE WHEN SUM(mv.jam_19) > 0 THEN ROUND((SUM(mvm.jam_19) * 100.0 / SUM(mv.jam_19)), 2) ELSE 0 END AS jam_19_persentase_masuk,
                    CASE WHEN SUM(mv.jam_20) > 0 THEN ROUND((SUM(mvm.jam_20) * 100.0 / SUM(mv.jam_20)), 2) ELSE 0 END AS jam_20_persentase_masuk,
                    CASE WHEN SUM(mv.jam_21) > 0 THEN ROUND((SUM(mvm.jam_21) * 100.0 / SUM(mv.jam_21)), 2) ELSE 0 END AS jam_21_persentase_masuk,
                    CASE WHEN SUM(mv.jam_22) > 0 THEN ROUND((SUM(mvm.jam_22) * 100.0 / SUM(mv.jam_22)), 2) ELSE 0 END AS jam_22_persentase_masuk,
                    CASE WHEN SUM(mv.jam_23) > 0 THEN ROUND((SUM(mvm.jam_23) * 100.0 / SUM(mv.jam_23)), 2) ELSE 0 END AS jam_23_persentase_masuk,`;
            } else {
                if (interval === '1') {
                    // Harian - tampilkan data per jam asli
                    jamColumns = `
                        SUM(mv.jam_00) AS jam_00,
                        SUM(mv.jam_01) AS jam_01,
                        SUM(mv.jam_02) AS jam_02,
                        SUM(mv.jam_03) AS jam_03,
                        SUM(mv.jam_04) AS jam_04,
                        SUM(mv.jam_05) AS jam_05,
                        SUM(mv.jam_06) AS jam_06,
                        SUM(mv.jam_07) AS jam_07,
                        SUM(mv.jam_08) AS jam_08,
                        SUM(mv.jam_09) AS jam_09,
                        SUM(mv.jam_10) AS jam_10,
                        SUM(mv.jam_11) AS jam_11,
                        SUM(mv.jam_12) AS jam_12,
                        SUM(mv.jam_13) AS jam_13,
                        SUM(mv.jam_14) AS jam_14,
                        SUM(mv.jam_15) AS jam_15,
                        SUM(mv.jam_16) AS jam_16,
                        SUM(mv.jam_17) AS jam_17,
                        SUM(mv.jam_18) AS jam_18,
                        SUM(mv.jam_19) AS jam_19,
                        SUM(mv.jam_20) AS jam_20,
                        SUM(mv.jam_21) AS jam_21,
                        SUM(mv.jam_22) AS jam_22,
                        SUM(mv.jam_23) AS jam_23,`;

                    overloadColumns = `
                        SUM(mv.jam_00_overload) AS jam_00_overload,
                        SUM(mv.jam_01_overload) AS jam_01_overload,
                        SUM(mv.jam_02_overload) AS jam_02_overload,
                        SUM(mv.jam_03_overload) AS jam_03_overload,
                        SUM(mv.jam_04_overload) AS jam_04_overload,
                        SUM(mv.jam_05_overload) AS jam_05_overload,
                        SUM(mv.jam_06_overload) AS jam_06_overload,
                        SUM(mv.jam_07_overload) AS jam_07_overload,
                        SUM(mv.jam_08_overload) AS jam_08_overload,
                        SUM(mv.jam_09_overload) AS jam_09_overload,
                        SUM(mv.jam_10_overload) AS jam_10_overload,
                        SUM(mv.jam_11_overload) AS jam_11_overload,
                        SUM(mv.jam_12_overload) AS jam_12_overload,
                        SUM(mv.jam_13_overload) AS jam_13_overload,
                        SUM(mv.jam_14_overload) AS jam_14_overload,
                        SUM(mv.jam_15_overload) AS jam_15_overload,
                        SUM(mv.jam_16_overload) AS jam_16_overload,
                        SUM(mv.jam_17_overload) AS jam_17_overload,
                        SUM(mv.jam_18_overload) AS jam_18_overload,
                        SUM(mv.jam_19_overload) AS jam_19_overload,
                        SUM(mv.jam_20_overload) AS jam_20_overload,
                        SUM(mv.jam_21_overload) AS jam_21_overload,
                        SUM(mv.jam_22_overload) AS jam_22_overload,
                        SUM(mv.jam_23_overload) AS jam_23_overload,`;

                    persentaseColumns = `
                        CASE WHEN SUM(mv.jam_00) > 0 THEN ROUND((SUM(mv.jam_00_overload) * 100.0 / SUM(mv.jam_00)), 2) ELSE 0 END AS jam_00_persentase_overload,
                        CASE WHEN SUM(mv.jam_01) > 0 THEN ROUND((SUM(mv.jam_01_overload) * 100.0 / SUM(mv.jam_01)), 2) ELSE 0 END AS jam_01_persentase_overload,
                        CASE WHEN SUM(mv.jam_02) > 0 THEN ROUND((SUM(mv.jam_02_overload) * 100.0 / SUM(mv.jam_02)), 2) ELSE 0 END AS jam_02_persentase_overload,
                        CASE WHEN SUM(mv.jam_03) > 0 THEN ROUND((SUM(mv.jam_03_overload) * 100.0 / SUM(mv.jam_03)), 2) ELSE 0 END AS jam_03_persentase_overload,
                        CASE WHEN SUM(mv.jam_04) > 0 THEN ROUND((SUM(mv.jam_04_overload) * 100.0 / SUM(mv.jam_04)), 2) ELSE 0 END AS jam_04_persentase_overload,
                        CASE WHEN SUM(mv.jam_05) > 0 THEN ROUND((SUM(mv.jam_05_overload) * 100.0 / SUM(mv.jam_05)), 2) ELSE 0 END AS jam_05_persentase_overload,
                        CASE WHEN SUM(mv.jam_06) > 0 THEN ROUND((SUM(mv.jam_06_overload) * 100.0 / SUM(mv.jam_06)), 2) ELSE 0 END AS jam_06_persentase_overload,
                        CASE WHEN SUM(mv.jam_07) > 0 THEN ROUND((SUM(mv.jam_07_overload) * 100.0 / SUM(mv.jam_07)), 2) ELSE 0 END AS jam_07_persentase_overload,
                        CASE WHEN SUM(mv.jam_08) > 0 THEN ROUND((SUM(mv.jam_08_overload) * 100.0 / SUM(mv.jam_08)), 2) ELSE 0 END AS jam_08_persentase_overload,
                        CASE WHEN SUM(mv.jam_09) > 0 THEN ROUND((SUM(mv.jam_09_overload) * 100.0 / SUM(mv.jam_09)), 2) ELSE 0 END AS jam_09_persentase_overload,
                        CASE WHEN SUM(mv.jam_10) > 0 THEN ROUND((SUM(mv.jam_10_overload) * 100.0 / SUM(mv.jam_10)), 2) ELSE 0 END AS jam_10_persentase_overload,
                        CASE WHEN SUM(mv.jam_11) > 0 THEN ROUND((SUM(mv.jam_11_overload) * 100.0 / SUM(mv.jam_11)), 2) ELSE 0 END AS jam_11_persentase_overload,
                        CASE WHEN SUM(mv.jam_12) > 0 THEN ROUND((SUM(mv.jam_12_overload) * 100.0 / SUM(mv.jam_12)), 2) ELSE 0 END AS jam_12_persentase_overload,
                        CASE WHEN SUM(mv.jam_13) > 0 THEN ROUND((SUM(mv.jam_13_overload) * 100.0 / SUM(mv.jam_13)), 2) ELSE 0 END AS jam_13_persentase_overload,
                        CASE WHEN SUM(mv.jam_14) > 0 THEN ROUND((SUM(mv.jam_14_overload) * 100.0 / SUM(mv.jam_14)), 2) ELSE 0 END AS jam_14_persentase_overload,
                        CASE WHEN SUM(mv.jam_15) > 0 THEN ROUND((SUM(mv.jam_15_overload) * 100.0 / SUM(mv.jam_15)), 2) ELSE 0 END AS jam_15_persentase_overload,
                        CASE WHEN SUM(mv.jam_16) > 0 THEN ROUND((SUM(mv.jam_16_overload) * 100.0 / SUM(mv.jam_16)), 2) ELSE 0 END AS jam_16_persentase_overload,
                        CASE WHEN SUM(mv.jam_17) > 0 THEN ROUND((SUM(mv.jam_17_overload) * 100.0 / SUM(mv.jam_17)), 2) ELSE 0 END AS jam_17_persentase_overload,
                        CASE WHEN SUM(mv.jam_18) > 0 THEN ROUND((SUM(mv.jam_18_overload) * 100.0 / SUM(mv.jam_18)), 2) ELSE 0 END AS jam_18_persentase_overload,
                        CASE WHEN SUM(mv.jam_19) > 0 THEN ROUND((SUM(mv.jam_19_overload) * 100.0 / SUM(mv.jam_19)), 2) ELSE 0 END AS jam_19_persentase_overload,
                        CASE WHEN SUM(mv.jam_20) > 0 THEN ROUND((SUM(mv.jam_20_overload) * 100.0 / SUM(mv.jam_20)), 2) ELSE 0 END AS jam_20_persentase_overload,
                        CASE WHEN SUM(mv.jam_21) > 0 THEN ROUND((SUM(mv.jam_21_overload) * 100.0 / SUM(mv.jam_21)), 2) ELSE 0 END AS jam_21_persentase_overload,
                        CASE WHEN SUM(mv.jam_22) > 0 THEN ROUND((SUM(mv.jam_22_overload) * 100.0 / SUM(mv.jam_22)), 2) ELSE 0 END AS jam_22_persentase_overload,
                        CASE WHEN SUM(mv.jam_23) > 0 THEN ROUND((SUM(mv.jam_23_overload) * 100.0 / SUM(mv.jam_23)), 2) ELSE 0 END AS jam_23_persentase_overload,`;

                    masukColumns = `
                        SUM(COALESCE(mvm.jam_00, 0)) AS jam_00_masuk,
                        SUM(COALESCE(mvm.jam_01, 0)) AS jam_01_masuk,
                        SUM(COALESCE(mvm.jam_02, 0)) AS jam_02_masuk,
                        SUM(COALESCE(mvm.jam_03, 0)) AS jam_03_masuk,
                        SUM(COALESCE(mvm.jam_04, 0)) AS jam_04_masuk,
                        SUM(COALESCE(mvm.jam_05, 0)) AS jam_05_masuk,
                        SUM(COALESCE(mvm.jam_06, 0)) AS jam_06_masuk,
                        SUM(COALESCE(mvm.jam_07, 0)) AS jam_07_masuk,
                        SUM(COALESCE(mvm.jam_08, 0)) AS jam_08_masuk,
                        SUM(COALESCE(mvm.jam_09, 0)) AS jam_09_masuk,
                        SUM(COALESCE(mvm.jam_10, 0)) AS jam_10_masuk,
                        SUM(COALESCE(mvm.jam_11, 0)) AS jam_11_masuk,
                        SUM(COALESCE(mvm.jam_12, 0)) AS jam_12_masuk,
                        SUM(COALESCE(mvm.jam_13, 0)) AS jam_13_masuk,
                        SUM(COALESCE(mvm.jam_14, 0)) AS jam_14_masuk,
                        SUM(COALESCE(mvm.jam_15, 0)) AS jam_15_masuk,
                        SUM(COALESCE(mvm.jam_16, 0)) AS jam_16_masuk,
                        SUM(COALESCE(mvm.jam_17, 0)) AS jam_17_masuk,
                        SUM(COALESCE(mvm.jam_18, 0)) AS jam_18_masuk,
                        SUM(COALESCE(mvm.jam_19, 0)) AS jam_19_masuk,
                        SUM(COALESCE(mvm.jam_20, 0)) AS jam_20_masuk,
                        SUM(COALESCE(mvm.jam_21, 0)) AS jam_21_masuk,
                        SUM(COALESCE(mvm.jam_22, 0)) AS jam_22_masuk,
                        SUM(COALESCE(mvm.jam_23, 0)) AS jam_23_masuk,`;

                    persentaseMasukColumns = `
                        CASE WHEN SUM(mv.jam_00) > 0 THEN ROUND((SUM(mvm.jam_00) * 100.0 / SUM(mv.jam_00)), 2) ELSE 0 END AS jam_00_persentase_masuk,
                        CASE WHEN SUM(mv.jam_01) > 0 THEN ROUND((SUM(mvm.jam_01) * 100.0 / SUM(mv.jam_01)), 2) ELSE 0 END AS jam_01_persentase_masuk,
                        CASE WHEN SUM(mv.jam_02) > 0 THEN ROUND((SUM(mvm.jam_02) * 100.0 / SUM(mv.jam_02)), 2) ELSE 0 END AS jam_02_persentase_masuk,
                        CASE WHEN SUM(mv.jam_03) > 0 THEN ROUND((SUM(mvm.jam_03) * 100.0 / SUM(mv.jam_03)), 2) ELSE 0 END AS jam_03_persentase_masuk,
                        CASE WHEN SUM(mv.jam_04) > 0 THEN ROUND((SUM(mvm.jam_04) * 100.0 / SUM(mv.jam_04)), 2) ELSE 0 END AS jam_04_persentase_masuk,
                        CASE WHEN SUM(mv.jam_05) > 0 THEN ROUND((SUM(mvm.jam_05) * 100.0 / SUM(mv.jam_05)), 2) ELSE 0 END AS jam_05_persentase_masuk,
                        CASE WHEN SUM(mv.jam_06) > 0 THEN ROUND((SUM(mvm.jam_06) * 100.0 / SUM(mv.jam_06)), 2) ELSE 0 END AS jam_06_persentase_masuk,
                        CASE WHEN SUM(mv.jam_07) > 0 THEN ROUND((SUM(mvm.jam_07) * 100.0 / SUM(mv.jam_07)), 2) ELSE 0 END AS jam_07_persentase_masuk,
                        CASE WHEN SUM(mv.jam_08) > 0 THEN ROUND((SUM(mvm.jam_08) * 100.0 / SUM(mv.jam_08)), 2) ELSE 0 END AS jam_08_persentase_masuk,
                        CASE WHEN SUM(mv.jam_09) > 0 THEN ROUND((SUM(mvm.jam_09) * 100.0 / SUM(mv.jam_09)), 2) ELSE 0 END AS jam_09_persentase_masuk,
                        CASE WHEN SUM(mv.jam_10) > 0 THEN ROUND((SUM(mvm.jam_10) * 100.0 / SUM(mv.jam_10)), 2) ELSE 0 END AS jam_10_persentase_masuk,
                        CASE WHEN SUM(mv.jam_11) > 0 THEN ROUND((SUM(mvm.jam_11) * 100.0 / SUM(mv.jam_11)), 2) ELSE 0 END AS jam_11_persentase_masuk,
                        CASE WHEN SUM(mv.jam_12) > 0 THEN ROUND((SUM(mvm.jam_12) * 100.0 / SUM(mv.jam_12)), 2) ELSE 0 END AS jam_12_persentase_masuk,
                        CASE WHEN SUM(mv.jam_13) > 0 THEN ROUND((SUM(mvm.jam_13) * 100.0 / SUM(mv.jam_13)), 2) ELSE 0 END AS jam_13_persentase_masuk,
                        CASE WHEN SUM(mv.jam_14) > 0 THEN ROUND((SUM(mvm.jam_14) * 100.0 / SUM(mv.jam_14)), 2) ELSE 0 END AS jam_14_persentase_masuk,
                        CASE WHEN SUM(mv.jam_15) > 0 THEN ROUND((SUM(mvm.jam_15) * 100.0 / SUM(mv.jam_15)), 2) ELSE 0 END AS jam_15_persentase_masuk,
                        CASE WHEN SUM(mv.jam_16) > 0 THEN ROUND((SUM(mvm.jam_16) * 100.0 / SUM(mv.jam_16)), 2) ELSE 0 END AS jam_16_persentase_masuk,
                        CASE WHEN SUM(mv.jam_17) > 0 THEN ROUND((SUM(mvm.jam_17) * 100.0 / SUM(mv.jam_17)), 2) ELSE 0 END AS jam_17_persentase_masuk,
                        CASE WHEN SUM(mv.jam_18) > 0 THEN ROUND((SUM(mvm.jam_18) * 100.0 / SUM(mv.jam_18)), 2) ELSE 0 END AS jam_18_persentase_masuk,
                        CASE WHEN SUM(mv.jam_19) > 0 THEN ROUND((SUM(mvm.jam_19) * 100.0 / SUM(mv.jam_19)), 2) ELSE 0 END AS jam_19_persentase_masuk,
                        CASE WHEN SUM(mv.jam_20) > 0 THEN ROUND((SUM(mvm.jam_20) * 100.0 / SUM(mv.jam_20)), 2) ELSE 0 END AS jam_20_persentase_masuk,
                        CASE WHEN SUM(mv.jam_21) > 0 THEN ROUND((SUM(mvm.jam_21) * 100.0 / SUM(mv.jam_21)), 2) ELSE 0 END AS jam_21_persentase_masuk,
                        CASE WHEN SUM(mv.jam_22) > 0 THEN ROUND((SUM(mvm.jam_22) * 100.0 / SUM(mv.jam_22)), 2) ELSE 0 END AS jam_22_persentase_masuk,
                        CASE WHEN SUM(mv.jam_23) > 0 THEN ROUND((SUM(mvm.jam_23) * 100.0 / SUM(mv.jam_23)), 2) ELSE 0 END AS jam_23_persentase_masuk,`;
                } else {
                    // Interval 2 (Bulanan) dan 3 (Tahunan) - perlu pivot data
                    if (interval === '2') {
                        // Bulanan - pivot per bulan
                        const bulanList = [];
                        for (let i = parseInt(bulan_dari); i <= parseInt(bulan_sampai); i++) {
                            const bulanName = getBulanName(i);
                            jamColumns += `SUM(CASE WHEN mv.bulan = ${i} THEN mv.total_kendaraan ELSE 0 END) AS "${bulanName}",\n`;
                            overloadColumns += `SUM(CASE WHEN mv.bulan = ${i} THEN mv.jumlah_overload ELSE 0 END) AS "${bulanName}_overload",\n`;
                            persentaseColumns += `CASE WHEN SUM(CASE WHEN mv.bulan = ${i} THEN mv.total_kendaraan ELSE 0 END) > 0 THEN ROUND((SUM(CASE WHEN mv.bulan = ${i} THEN mv.jumlah_overload ELSE 0 END) * 100.0 / SUM(CASE WHEN mv.bulan = ${i} THEN mv.total_kendaraan ELSE 0 END)), 2) ELSE 0 END AS "${bulanName}_persentase_overload",\n`;
                            masukColumns += `SUM(CASE WHEN mv.bulan = ${i} THEN COALESCE(mvm.total_masuk_uppkb, 0) ELSE 0 END) AS "${bulanName}_masuk",\n`;
                            persentaseMasukColumns += `CASE WHEN SUM(CASE WHEN mv.bulan = ${i} THEN mv.total_kendaraan ELSE 0 END) > 0 THEN ROUND((SUM(CASE WHEN mv.bulan = ${i} THEN mvm.total_masuk_uppkb ELSE 0 END) * 100.0 / SUM(CASE WHEN mv.bulan = ${i} THEN mv.total_kendaraan ELSE 0 END)), 2) ELSE 0 END AS "${bulanName}_persentase_masuk",\n`;
                        }
                    } else if (interval === '3') {
                        // Tahunan - pivot per tahun
                        for (let i = parseInt(tahun_dari); i <= parseInt(tahun_sampai); i++) {
                            jamColumns += `SUM(CASE WHEN mv.tahun = ${i} THEN mv.total_kendaraan ELSE 0 END) AS "${i}",\n`;
                            overloadColumns += `SUM(CASE WHEN mv.tahun = ${i} THEN mv.jumlah_overload ELSE 0 END) AS "${i}_overload",\n`;
                            persentaseColumns += `CASE WHEN SUM(CASE WHEN mv.tahun = ${i} THEN mv.total_kendaraan ELSE 0 END) > 0 THEN ROUND((SUM(CASE WHEN mv.tahun = ${i} THEN mv.jumlah_overload ELSE 0 END) * 100.0 / SUM(CASE WHEN mv.tahun = ${i} THEN mv.total_kendaraan ELSE 0 END)), 2) ELSE 0 END AS "${i}_persentase_overload",\n`;
                            masukColumns += `SUM(CASE WHEN mv.tahun = ${i} THEN COALESCE(mvm.total_masuk_uppkb, 0) ELSE 0 END) AS "${i}_masuk",\n`;
                            persentaseMasukColumns += `CASE WHEN SUM(CASE WHEN mv.tahun = ${i} THEN mv.total_kendaraan ELSE 0 END) > 0 THEN ROUND((SUM(CASE WHEN mv.tahun = ${i} THEN mvm.total_masuk_uppkb ELSE 0 END) * 100.0 / SUM(CASE WHEN mv.tahun = ${i} THEN mv.total_kendaraan ELSE 0 END)), 2) ELSE 0 END AS "${i}_persentase_masuk",\n`;
                        }
                    }
                }
            }

            sql = `SELECT 
                    ${selectBy}
                    ${jamColumns}
                    ${overloadColumns}
                    ${persentaseColumns}
                    ${masukColumns}
                    ${persentaseMasukColumns}
                    
                    -- Total dan overload keseluruhan
                    SUM(mv.total_kendaraan) AS total_kendaraan,
                    SUM(mv.jumlah_overload) AS jumlah_overload,
                    CASE WHEN SUM(mv.total_kendaraan) > 0 THEN ROUND((SUM(mv.jumlah_overload) * 100.0 / SUM(mv.total_kendaraan)), 2) ELSE 0 END AS persentase_overload,
                    SUM(COALESCE(mvm.total_masuk_uppkb, 0)) AS jumlah_masuk_uppkb,
                    
                    MIN(mv.periode_awal) AS periode_awal,
                    MAX(mv.periode_akhir) AS periode_akhir
                FROM jt_lokasi_uppkb lu
                LEFT JOIN mv_heatmap_volume_kendaraan mv ON mv.kode_uppkb = lu.kode 
                LEFT JOIN mv_resume_masuk_uppkb_summary mvm ON mvm.kode_uppkb = mv.kode_uppkb AND mvm.tanggal = mv.tanggal
                ${whereClause} AND lu.is_wim = true
                GROUP BY ${groupBy}
                ORDER BY ${orderBy}`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result,
                metadata: {
                    interval: interval,
                    total_records: result.length,
                    grouping: lokasi ? 
                        (interval === '1' ? 'hari' : interval === '2' ? 'bulan' : 'tahun') : 
                        'lokasi'
                }
            });
        } catch (error) {
            next(error);
        }
    };

    // Helper function untuk mendapatkan nama bulan
    function getBulanName(bulanNumber) {
        const bulanNames = {
            1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'Mei', 6: 'Jun',
            7: 'Jul', 8: 'Agu', 9: 'Sep', 10: 'Okt', 11: 'Nov', 12: 'Des'
        };
        return bulanNames[bulanNumber] || `Bulan_${bulanNumber}`;
    }

    const getLiveWimData = async (req, res, next) => {
        try {
            // 1. Ambil data WIM utama (tanpa JOIN kendaraan)
            const wimData = await sequelize.query(`
                SELECT
                    lw.tgl_penimbangan,
                    lw.kode_uppkb,
                    lu.nama AS nama_uppkb,
                    lw.no_kendaraan,
                    lw.foto_depan_url,
                    lw.foto_plat_no_url,
                    lw.sumbu,
                    lw.wim_berat,
                    lw.batas_berat_kg AS jbi,
                    lw.jml_kelebihan_berat,
                    lw.persen_kelebihan_berat,
                    lw.wim_panjang,
                    lw.batas_panjang_mm AS batas_panjang,
                    lw.jml_kelebihan_panjang,
                    lw.persen_kelebihan_panjang,
                    lw.wim_lebar,
                    lw.batas_lebar_mm AS batas_lebar,
                    lw.jml_kelebihan_lebar,
                    lw.persen_kelebihan_lebar,
                    lw.wim_tinggi,
                    lw.batas_tinggi_mm AS batas_tinggi,
                    lw.jml_kelebihan_tinggi,
                    lw.persen_kelebihan_tinggi,
                    lw.wim_foh,
                    lw.wim_roh,
                    lw.wim_kecepatan,
                    lw.is_melanggar,
                    lw.is_overload,
                    lw.is_overdim,
                    lw.is_status
                FROM jt_log_wim lw
                JOIN jt_lokasi_uppkb lu ON lu.kode = lw.kode_uppkb
                WHERE lw.deleted_at IS NULL
                ORDER BY lw.tgl_penimbangan DESC LIMIT 10
                `,
                {
                    type: QueryTypes.SELECT,
                    logging: false
                }
            );

            // 2. Ambil data kendaraan per-record (lebih efisien)
            const resultsWithVehicle = await Promise.all(
                wimData.map(async (record) => {
                    try {
                        if (record.no_kendaraan) {
                            const vehicleData = await getVehicleData(record.no_kendaraan);
                            
                            if (vehicleData) {
                                // Pastikan vehicleData.data ada sebelum mengakses propertinya
                                const vehicle = vehicleData;
                                
                                // Gunakan nilai dari vehicle data jika tersedia, else gunakan dari record
                                const jbi = (vehicle.jbi && vehicle.jbi > 0) ? vehicle.jbi : record.jbi;
                                const batas_panjang = (vehicle.panjang_utama && vehicle.panjang_utama > 0) ? vehicle.panjang_utama : record.batas_panjang;
                                const batas_lebar = (vehicle.lebar_utama && vehicle.lebar_utama > 0) ? vehicle.lebar_utama : record.batas_lebar;
                                const batas_tinggi = (vehicle.tinggi_utama && vehicle.tinggi_utama > 0) ? vehicle.tinggi_utama : record.batas_tinggi;

                                // Hitung kelebihan berat
                                const jml_kelebihan_berat = record.wim_berat > jbi ? record.wim_berat - jbi : 0;
                                const persen_kelebihan_berat = jbi > 0 ? (jml_kelebihan_berat / jbi) * 100 : 0;

                                // Hitung kelebihan panjang
                                const jml_kelebihan_panjang = record.wim_panjang > batas_panjang ? record.wim_panjang - batas_panjang : 0;
                                const persen_kelebihan_panjang = batas_panjang > 0 ? (jml_kelebihan_panjang / batas_panjang) * 100 : 0;

                                // Hitung kelebihan lebar
                                const jml_kelebihan_lebar = record.wim_lebar > batas_lebar ? record.wim_lebar - batas_lebar : 0;
                                const persen_kelebihan_lebar = batas_lebar > 0 ? (jml_kelebihan_lebar / batas_lebar) * 100 : 0;

                                // Hitung kelebihan tinggi
                                const jml_kelebihan_tinggi = record.wim_tinggi > batas_tinggi ? record.wim_tinggi - batas_tinggi : 0;
                                const persen_kelebihan_tinggi = batas_tinggi > 0 ? (jml_kelebihan_tinggi / batas_tinggi) * 100 : 0;

                                // Tentukan status pelanggaran
                                const isOverload = persen_kelebihan_berat > 5;
                                const isOverdim = persen_kelebihan_panjang > 0 || persen_kelebihan_lebar > 0 || persen_kelebihan_tinggi > 0;
                                const isMelanggar = isOverload || isOverdim;

                                return {
                                    ...record,
                                    jbi: jbi,
                                    batas_panjang: batas_panjang,
                                    batas_lebar: batas_lebar,
                                    batas_tinggi: batas_tinggi,
                                    jml_kelebihan_berat: parseFloat(jml_kelebihan_berat.toFixed(2)),
                                    persen_kelebihan_berat: parseFloat(persen_kelebihan_berat.toFixed(2)),
                                    jml_kelebihan_panjang: parseFloat(jml_kelebihan_panjang.toFixed(2)),
                                    persen_kelebihan_panjang: parseFloat(persen_kelebihan_panjang.toFixed(2)),
                                    jml_kelebihan_lebar: parseFloat(jml_kelebihan_lebar.toFixed(2)),
                                    persen_kelebihan_lebar: parseFloat(persen_kelebihan_lebar.toFixed(2)),
                                    jml_kelebihan_tinggi: parseFloat(jml_kelebihan_tinggi.toFixed(2)),
                                    persen_kelebihan_tinggi: parseFloat(persen_kelebihan_tinggi.toFixed(2)),
                                    is_overload: isOverload,
                                    is_overdim: isOverdim,
                                    is_melanggar: isMelanggar,
                                    is_status: 2,
                                    vehicle_data: vehicle // Tambahkan data kendaraan untuk referensi
                                };
                            }
                        }
                        
                        // Return record asli jika tidak ada data kendaraan
                        return {
                            ...record,
                            vehicle_data: null
                        };
                        
                    } catch (error) {
                        console.error(`Error processing vehicle data for ${record.no_kendaraan}:`, error);
                        // Return record asli jika terjadi error
                        return {
                            ...record,
                            vehicle_data: null,
                            processing_error: true
                        };
                    }
                })
            );

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: resultsWithVehicle
            });

        } catch (error) {
            console.error('Error in getLiveWimData:', error);
            next(error);
        }
    }

    // Function untuk ambil data kendaraan individual
    async function getVehicleData(noRegKend) {
        const vehicle = await sequelize.query(
            `SELECT * FROM jt_kendaraan WHERE no_reg_kend = ?`,
            {
                replacements: [noRegKend],
                type: QueryTypes.SELECT,
                logging: false
            }
        );
        return vehicle[0] || null;
    }

    const getResumeWimDataLokasi = async (req, res, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const interval = req.query.interval || '1'; // default harian
            const tanggal = req.query.tanggal;
            const tanggal_dari = req.query.tanggal_dari;
            const tanggal_sampai = req.query.tanggal_sampai;
            const bulan_dari = req.query.bulan_dari;
            const bulan_sampai = req.query.bulan_sampai;
            const tahun = req.query.tahun;
            const tahun_dari = req.query.tahun_dari;
            const tahun_sampai = req.query.tahun_sampai;

            const now = moment();
            
            // Deklarasi variabel dengan let agar bisa diubah
            let whereClause = '';
            let whereLeft = '';

            const hariIni = tanggal ? moment(tanggal).format('YYYY-MM-DD') : moment(now).format('YYYY-MM-DD');

            // Deklarasi variabel untuk bulanan dan tahunan
            let tahunValue, bulanFrom, bulanTo, tahunFrom, tahunTo;

            // Build WHERE clause berdasarkan interval
            switch (interval) {
                case '1': // Harian
                    if (tanggal_dari && tanggal_sampai) {
                        whereLeft = `AND w.tanggal BETWEEN '${moment(tanggal_dari).format('YYYY-MM-DD')}' AND '${moment(tanggal_sampai).format('YYYY-MM-DD')}'`;
                    } else {
                        whereLeft = `AND w.tanggal = '${hariIni}'`;
                    }
                    break;

                case '2': // Bulanan
                    bulanFrom = bulan_dari.toString() || '1';
                    bulanTo = bulan_sampai.toString() || '12';
                    tahunValue = tahun.toString() || moment(now).format('YYYY');
                    
                    whereLeft = `AND EXTRACT(YEAR FROM w.tanggal) = ${tahunValue} AND EXTRACT(MONTH FROM w.tanggal) BETWEEN ${bulanFrom} AND ${bulanTo}`;
                    break;

                case '3': // Tahunan
                    tahunFrom = tahun_dari || moment(now).add(-5, 'years').format('YYYY');
                    tahunTo = tahun_sampai || moment(now).format('YYYY');
                    
                    whereLeft = `AND EXTRACT(YEAR FROM w.tanggal) BETWEEN ${tahunFrom} AND ${tahunTo}`;
                    break;

                default: // Harian
                    whereLeft = `AND w.tanggal = '${moment(now).format('YYYY-MM-DD')}'`;
            }

            // Tambahkan filter lokasi/bptd jika ada
            if (bptd_id) {
                whereClause += ` AND lu.bptd_id = ${bptd_id}`;
            }
            if (lokasi_id) {
                whereClause += ` AND lu.id = ${lokasi_id}`;
            }

            // Query untuk periode saat ini
            let sqlCurrent = `SELECT
                                    lu.kode,
                                    lu.nama,
                                    COALESCE(SUM(w.jumlah_kendaraan), 0) as jumlah_kendaraan,
                                    COALESCE(SUM(w.terdeteksi_overload), 0) as terdeteksi_overload,
                                    CASE 
                                        WHEN COALESCE(SUM(w.jumlah_kendaraan), 0) = 0 THEN 0
                                        ELSE ROUND((COALESCE(SUM(w.terdeteksi_overload), 0) * 100.0 / COALESCE(SUM(w.jumlah_kendaraan), 0)), 2)
                                    END as persentase_overload
                                FROM jt_lokasi_uppkb lu 
                                LEFT JOIN mv_resume_wim_summary w ON w.kode_uppkb = lu.kode 
                                    ${whereLeft}
                                WHERE lu.is_wim = TRUE ${whereClause}
                                GROUP BY lu.kode, lu.nama`;

            const result = await sequelize.query(sqlCurrent, {
                type: QueryTypes.SELECT,
                logging: false
            });

            res.status(200).send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    return {
        getSinkronisasiData,
        getResumeData,
        getTrendsOverloadData,
        getHeatmapData,
        getLiveWimData,
        getResumeWimDataLokasi,
    }
}

module.exports = StatistikWdimController;