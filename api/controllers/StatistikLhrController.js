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

const StatistikLhrController = () => {

    const getSinkronisasiData = async (req, res, next) => {
        try {

            var sql = `SELECT lokasi_id FROM lhr_log_stat WHERE date_time::date = DATE(NOW()) GROUP BY lokasi_id`;

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
    const getResumeLhrUmum = async (req, res, next) => {
        try {
            const lokasi_id = req.query.lokasi;

            let sql = `SELECT
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
                        INNER JOIN lhr_konstanta ON lhr_konstanta.lokasi_id = jt_lokasi_uppkb.id 
                    WHERE
                        lhr_log_stat.date_time::date = DATE(NOW()) AND
                        lhr_log_stat.is_active = true AND 
                        lhr_log_stat.is_deleted = false AND
		                lhr_log_stat.lane = 1
                    GROUP BY  
                        waktu
                    ORDER BY waktu ASC`;

            if (lokasi_id) {
                sql = `SELECT
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
                        INNER JOIN lhr_konstanta ON lhr_konstanta.lokasi_id = jt_lokasi_uppkb.id 
                    WHERE
                        lhr_log_stat.date_time::date = DATE(NOW()) AND
                        lhr_log_stat.is_active = true AND 
                        lhr_log_stat.is_deleted = false AND
                        lhr_log_stat.lokasi_id = ${lokasi_id} AND
		                lhr_log_stat.lane = 1
                    GROUP BY  
                        waktu
                    ORDER BY waktu ASC`;
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

    const getResumeLhrAngkutan = async (req, res, next) => {
        try {
            const lokasi_id = req.query.lokasi;

            // let sql = `SELECT
            //             TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'DD-MM-YYYY') AS waktu,
            //             COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) AS "MOBIL_BARANG_BAK_TERBUKA",
            //             COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) AS "MOBIL_BARANG_BAK_TERTUTUP",
            //             COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) AS "MOBIL_PENARIK",
            //             COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS "MOBIL_TANGKI",
            //             COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 99) AS "UNDEFINED",
            //             COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS total
            //         FROM
            //             jt_vr_data
            //         JOIN
            //             jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
            //         JOIN
            //             jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
            //         LEFT JOIN
            //             jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
            //         WHERE
            //             jt_vr_data.tgl_capture::date = DATE(NOW())
            //             AND jt_vr_data.no_kendaraan ~ '^[A-Za-z0-9]+$'
            //             AND LENGTH(jt_vr_data.no_kendaraan) > 5
            //             AND LENGTH(jt_vr_data.no_kendaraan) < 10
            //             AND jt_vr_data.no_kendaraan != ''
            //             AND jt_vr_data.no_kendaraan IS NOT NULL
            //         GROUP BY
            //             waktu
            //         ORDER BY
            //             waktu`;

            let sql = `SELECT
                        TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'DD-MM-YYYY') AS waktu,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) AS "MOBIL_BARANG_BAK_TERBUKA",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11 AND jt_vr_data.is_blue = TRUE) AS jml_blue_bak_terbuka,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) AS "MOBIL_BARANG_BAK_TERTUTUP",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12 AND jt_vr_data.is_blue = TRUE) AS jml_blue_bak_tertutup,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) AS "MOBIL_PENARIK",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13 AND jt_vr_data.is_blue = TRUE) AS jml_blue_penarik,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS "MOBIL_TANGKI",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14 AND jt_vr_data.is_blue = TRUE) AS jml_blue_tangki,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 99) AS "UNDEFINED",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS total,
                        COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS jml_blue,
                        COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS jml_tdk_blue
                    FROM
                        jt_vr_data
                    JOIN
                        jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                    JOIN
                        jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                    LEFT JOIN
                        jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                    WHERE
                        jt_vr_data.tgl_capture::date = DATE(NOW())
                    GROUP BY
                        waktu
                    ORDER BY
                        waktu`;

            if (lokasi_id) {
                const kode_uppkb = await getLokasiUppkbKode(lokasi_id);

                sql = `SELECT
                        TO_CHAR(DATE_TRUNC('day', jt_vr_data.tgl_capture), 'DD-MM-YYYY') AS waktu,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) AS "MOBIL_BARANG_BAK_TERBUKA",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11 AND jt_vr_data.is_blue = TRUE) AS jml_blue_bak_terbuka,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) AS "MOBIL_BARANG_BAK_TERTUTUP",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12 AND jt_vr_data.is_blue = TRUE) AS jml_blue_bak_tertutup,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) AS "MOBIL_PENARIK",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13 AND jt_vr_data.is_blue = TRUE) AS jml_blue_penarik,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS "MOBIL_TANGKI",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14 AND jt_vr_data.is_blue = TRUE) AS jml_blue_tangki,
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 99) AS "UNDEFINED",
                        COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 11) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 12) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 13) + COUNT(*) FILTER (WHERE jt_gol_ai.id_jns_kendaraan = 14) AS total,
                        COUNT(*) FILTER (WHERE jt_vr_data.is_blue = TRUE) AS jml_blue,
                        COUNT(*) FILTER (WHERE jt_vr_data.is_blue = FALSE) AS jml_tdk_blue
                    FROM
                        jt_vr_data
                    JOIN
                        jt_gol_ai ON jt_vr_data.id_gol_ai = jt_gol_ai.id
                    JOIN
                        jt_jenis_kendaraan ON jt_jenis_kendaraan.id = jt_gol_ai.id_jns_kendaraan
                    LEFT JOIN
                        jt_lokasi_uppkb ON jt_lokasi_uppkb.kode = jt_vr_data.kode_uppkb
                    WHERE
                        jt_vr_data.tgl_capture::date = DATE(NOW()) AND
                        jt_vr_data.kode_uppkb = '${kode_uppkb}'
                    GROUP BY
                        waktu
                    ORDER BY
                        waktu`;
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

    const dataLhr = async (req, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const interval = req.query.interval;
            const tgl = moment(req.query.tgl).format('YYYY-MM-DD');
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
                                    intervals.interval_start,
                                    intervals.interval_end,
                                    SUM(lhr_log_stat.class_2) AS motor,
                                    SUM(lhr_log_stat.class_3) AS mobil,
                                    SUM(lhr_log_stat.class_4) AS truck_bus,
                                    SUM(lhr_log_stat.class_5) AS truck,
                                    SUM(lhr_log_stat.class_7) AS bus,
                                    ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) AS smp,
                                    ROUND(AVG(lhr_log_stat.gap)::numeric, 0) AS gap,
                                    ROUND(AVG(lhr_log_stat.headway)::numeric, 0) AS headway,
                                    ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) AS speed_avg,
                                    ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) AS occupancy,
                                    (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) AS total,
                                    ROW_NUMBER() OVER (PARTITION BY intervals.interval_start ORDER BY intervals.interval_start) AS row_num
                                FROM intervals
                                LEFT JOIN lhr_log_stat ON lhr_log_stat.date_time >= intervals.interval_start AND lhr_log_stat.date_time < intervals.interval_end
                                WHERE 
                                    lhr_log_stat.lokasi_id = ${lokasi_id} AND 
                                    lhr_log_stat.is_active = true AND 
                                    lhr_log_stat.is_deleted = false AND
                                    lhr_log_stat.lane = 1
                                GROUP BY intervals.interval_start, intervals.interval_end
                            )
                            SELECT
                                motor,
                                mobil,
                                truck_bus,
                                truck,
                                bus,
                                smp,
                                gap,
                                headway,
                                speed_avg,
                                occupancy,
                                total,
                                to_char(interval_start, 'HH24:MI') AS waktu_from,
                                to_char(interval_end, 'HH24:MI') AS waktu_to,
                                concat(to_char(interval_start, 'HH24:MI'), ' - ', to_char(interval_end, 'HH24:MI')) AS waktu
                            FROM aggregated_data
                            WHERE row_num = 1
                            ORDER BY interval_start;`;

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
                                    intervals.interval_start,
                                    intervals.interval_end,
                                    SUM(lhr_log_stat.class_2) AS motor,
                                    SUM(lhr_log_stat.class_3) AS mobil,
                                    SUM(lhr_log_stat.class_4) AS truck_bus,
                                    SUM(lhr_log_stat.class_5) AS truck,
                                    SUM(lhr_log_stat.class_7) AS bus,
                                    ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) AS smp,
                                    ROUND(AVG(lhr_log_stat.gap)::numeric, 0) AS gap,
                                    ROUND(AVG(lhr_log_stat.headway)::numeric, 0) AS headway,
                                    ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) AS speed_avg,
                                    ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) AS occupancy,
                                    (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) AS total,
                                    ROW_NUMBER() OVER (PARTITION BY intervals.interval_start ORDER BY intervals.interval_start) AS row_num
                                FROM intervals
                                LEFT JOIN lhr_log_stat ON lhr_log_stat.date_time >= intervals.interval_start AND lhr_log_stat.date_time < intervals.interval_end
                                JOIN jt_lokasi_uppkb ON jt_lokasi_uppkb.id = lhr_log_stat.lokasi_id
                                WHERE 
                                    lhr_log_stat.lokasi_id = ${lokasi_id} AND 
                                    lhr_log_stat.is_active = true AND 
                                    lhr_log_stat.is_deleted = false AND
                                    lhr_log_stat.lane = 1
                                GROUP BY lhr_log_stat.lokasi_id, intervals.interval_start, intervals.interval_end
                            )
                            SELECT
                                lokasi_id,
                                motor,
                                mobil,
                                truck_bus,
                                truck,
                                bus,
                                smp,
                                gap,
                                headway,
                                speed_avg,
                                occupancy,
                                total,
                                to_char(interval_start, 'HH24:00') AS waktu_from,
                                to_char(interval_end, 'HH24:00') AS waktu_to,
                                concat(to_char(interval_start, 'HH24:00'), ' - ', to_char(interval_end, 'HH24:00')) AS waktu
                            FROM aggregated_data
                            WHERE row_num = 1
                            ORDER BY interval_start;
                            `;
                }

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                return result
            } else {

                let sql2 = `WITH intervals AS (
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
                                    intervals.interval_start,
                                    intervals.interval_end,
                                    SUM(lhr_log_stat.class_2) AS motor,
                                    SUM(lhr_log_stat.class_3) AS mobil,
                                    SUM(lhr_log_stat.class_4) AS truck_bus,
                                    SUM(lhr_log_stat.class_5) AS truck,
                                    SUM(lhr_log_stat.class_7) AS bus,
                                    ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) AS smp,
                                    ROUND(AVG(lhr_log_stat.gap)::numeric, 0) AS gap,
                                    ROUND(AVG(lhr_log_stat.headway)::numeric, 0) AS headway,
                                    ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) AS speed_avg,
                                    ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) AS occupancy,
                                    (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) AS total,
                                    ROW_NUMBER() OVER (PARTITION BY intervals.interval_start ORDER BY intervals.interval_start) AS row_num
                                FROM intervals
                                LEFT JOIN lhr_log_stat ON lhr_log_stat.date_time >= intervals.interval_start AND lhr_log_stat.date_time < intervals.interval_end
                                WHERE 
                                    lhr_log_stat.is_active = true AND 
                                    lhr_log_stat.is_deleted = false AND
                                    lhr_log_stat.lane = 1
                                GROUP BY intervals.interval_start, intervals.interval_end
                            )
                            SELECT
                                motor,
                                mobil,
                                truck_bus,
                                truck,
                                bus,
                                smp,
                                gap,
                                headway,
                                speed_avg,
                                occupancy,
                                total,
                                to_char(interval_start, 'HH24:MI') AS waktu_from,
                                to_char(interval_end, 'HH24:MI') AS waktu_to,
                                concat(to_char(interval_start, 'HH24:MI'), ' - ', to_char(interval_end, 'HH24:MI')) AS waktu
                            FROM aggregated_data
                            WHERE row_num = 1
                            ORDER BY interval_start;`;

                if (interval == 2) {
                    sql2 = `WITH intervals AS (
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
                                    intervals.interval_start,
                                    intervals.interval_end,
                                    SUM(lhr_log_stat.class_2) AS motor,
                                    SUM(lhr_log_stat.class_3) AS mobil,
                                    SUM(lhr_log_stat.class_4) AS truck_bus,
                                    SUM(lhr_log_stat.class_5) AS truck,
                                    SUM(lhr_log_stat.class_7) AS bus,
                                    ((SUM(lhr_log_stat.class_2) * 0.3) + (SUM(lhr_log_stat.class_3) * 1) + (SUM(lhr_log_stat.class_4) * 1.3)) AS smp,
                                    ROUND(AVG(lhr_log_stat.gap)::numeric, 0) AS gap,
                                    ROUND(AVG(lhr_log_stat.headway)::numeric, 0) AS headway,
                                    ROUND(AVG(lhr_log_stat.speed_avg)::numeric, 0) AS speed_avg,
                                    ROUND(AVG(lhr_log_stat.occupancy)::numeric, 0) AS occupancy,
                                    (SUM(lhr_log_stat.class_2) + SUM(lhr_log_stat.class_3) + SUM(lhr_log_stat.class_4)) AS total,
                                    ROW_NUMBER() OVER (PARTITION BY intervals.interval_start ORDER BY intervals.interval_start) AS row_num
                                FROM intervals
                                LEFT JOIN lhr_log_stat ON lhr_log_stat.date_time >= intervals.interval_start AND lhr_log_stat.date_time < intervals.interval_end 
                                WHERE 
                                    lhr_log_stat.is_active = true AND 
                                    lhr_log_stat.is_deleted = false AND
                                    lhr_log_stat.lane = 1
                                GROUP BY intervals.interval_start, intervals.interval_end
                            )
                            SELECT
                                motor,
                                mobil,
                                truck_bus,
                                truck,
                                bus,
                                smp,
                                gap,
                                headway,
                                speed_avg,
                                occupancy,
                                total,
                                to_char(interval_start, 'HH24:00') AS waktu_from,
                                to_char(interval_end, 'HH24:00') AS waktu_to,
                                concat(to_char(interval_start, 'HH24:00'), ' - ', to_char(interval_end, 'HH24:00')) AS waktu
                            FROM aggregated_data
                            WHERE row_num = 1
                            ORDER BY interval_start;
                            `;
                }

                const result = await sequelize.query(sql2, {
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

    const lhrVersion = async (id) => {
        var sql = `SELECT * FROM jt_lokasi_uppkb WHERE id = ${id} AND is_active = true AND is_deleted = false`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        })

        return result[0].versi_lhr;
    }

    const getLhrUmum = async (req, res, next) => {
        console.log('::=::-------------> GET LHR UMUM <-------------::=::');
        const interval = req.query.interval;
        const result = await dataLhr(req, next);
        let data = [];
        let total = 0;
        let bagiSpeed = 0;
        let bagiOccupancy = 0;
        let speed_avgTotal = 0; // Variabel sementara untuk akumulasi speed_avg
        let occupancyTotal = 0; // Variabel sementara untuk akumulasi occupancy
        let versi_lhr = 1;
        if (req.query.lokasi) {
            versi_lhr = await lhrVersion(req.query.lokasi);
        }

        if (result) {
            // var versiLhr = result.length > 0 ? result[0].versi_lhr : '2';
            for (let row of result) {
                var formatwaktu = row.waktu;
                var waktu_from = row.waktu_from;
                var waktu_to = row.waktu_to;

                if (interval == 1 || interval == 2) {
                    if (Number(moment(waktu_to, 'HH:mm').format('HH')) == 0 && Number(moment(waktu_to, 'HH:mm').format('mm')) == 0) {
                        formatwaktu = `${waktu_from} - 23:59`;
                    }
                }

                const totalKend = versi_lhr === '2' ? (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck) + parseInt(row.bus)) : (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck_bus));
                data.push({
                    lokasi_id: row.lokasi_id,
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
                }
            });
        }
    }

    const dataABJK = async (req, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const interval = req.query.interval;
            const tgl = req.query.tgl;

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

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                return result
            } else {
                let sql2 = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute') as waktu_real,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute'), 'HH24:MI') as waktu_from,
                                to_char((date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute')) + INTERVAL '15 Minutes', 'HH24:MI') AS waktu_to,
                                concat(to_char(date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute'), 'HH24:MI'),' - ',to_char((date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute')) + INTERVAL '15 Minutes', 'HH24:MI')) as waktu,
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
                            WHERE jt_vr_data.tgl_capture BETWEEN '${tgl} 00:00:00' AND '${tgl} 23:59:00'
                            GROUP BY tanggal, waktu_real
                            ORDER BY waktu_real ASC`;

                if (interval == 2) {
                    sql2 = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                DATE_TRUNC('hour', jt_vr_data.tgl_capture) AS waktu_real,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture), 'HH24:MI') as waktu_from,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture) + INTERVAL '60 Minutes', 'HH24:MI') AS waktu_to,
                                CONCAT(to_char(date_trunc('hour', jt_vr_data.tgl_capture), 'HH24:MI'),' - ',to_char(date_trunc('hour', jt_vr_data.tgl_capture) + INTERVAL '60 Minutes', 'HH24:MI')) AS waktu,
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
                            WHERE
                                jt_vr_data.tgl_capture BETWEEN '${tgl} 00:00:00' AND '${tgl} 23:59:00'
                            GROUP BY
                                tanggal, waktu_real
                            ORDER BY
                                waktu_real ASC`;
                }

                const result = await sequelize.query(sql2, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                return result
            }

        } catch (error) {
            next(error)
        }
    }

    const getAngkutanBarangJK = async (req, res, next) => {
        console.log('::=::-------------> GET ALL LHR ANGKUTAN BARANG TIDAK MASUK UPPKB BY JENIS KENDARAAN <-------------::=::');
        const interval = req.query.interval;
        const result = await dataABJK(req, next);
        let data = [];

        if (result) {
            var T_MOBIL_BARANG_BAK_TERBUKA = 0; 
            var T_MOBIL_BARANG_BAK_TERTUTUP = 0;
            var T_MOBIL_PENARIK = 0;
            var T_MOBIL_TANGKI = 0;
            var T_UNDEFINED = 0;
            var T_blue = 0;
            var T_tdk_blue = 0;
            // var versiLhr = result.length > 0 ? result[0].versi_lhr : '2';
            for (let row of result) {
                var formatwaktu = row.waktu;
                if (interval == 4) {
                    formatwaktu = setMonth(Number(moment(row.waktu, 'MM-YYYY').format('MM')) - 1);
                }
                T_MOBIL_BARANG_BAK_TERBUKA = T_MOBIL_BARANG_BAK_TERBUKA + parseInt(row.MOBIL_BARANG_BAK_TERBUKA);
                T_MOBIL_BARANG_BAK_TERTUTUP = T_MOBIL_BARANG_BAK_TERTUTUP + parseInt(row.MOBIL_BARANG_BAK_TERTUTUP);
                T_MOBIL_PENARIK = T_MOBIL_PENARIK + parseInt(row.MOBIL_PENARIK);
                T_MOBIL_TANGKI = T_MOBIL_TANGKI + parseInt(row.MOBIL_TANGKI);
                T_UNDEFINED = T_UNDEFINED + parseInt(row.UNDEFINED);
                T_blue = T_blue + parseInt(row.jml_blue);
                T_tdk_blue = T_tdk_blue + parseInt(row.jml_tdk_blue);
                // const totalKend = versiLhr === '2' ? (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck) + parseInt(row.bus)) : (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck_bus))
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
            }


            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: data,
                meta: {
                    total: result.length,
                    T_MOBIL_BARANG_BAK_TERBUKA: parseInt(T_MOBIL_BARANG_BAK_TERBUKA),
                    T_MOBIL_BARANG_BAK_TERTUTUP: parseInt(T_MOBIL_BARANG_BAK_TERTUTUP),
                    T_MOBIL_PENARIK: parseInt(T_MOBIL_PENARIK),
                    T_MOBIL_TANGKI: parseInt(T_MOBIL_TANGKI),
                    T_UNDEFINED: parseInt(T_UNDEFINED),
                    T_blue: parseInt(T_blue),
                    T_tdk_blue: parseInt(T_tdk_blue),
                }
            });
        }
    }

    const dataABKA = async (req, next) => {
        try {
            const lokasi_id = req.query.lokasi;
            const interval = req.query.interval;
            const tgl = req.query.tgl;

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
                                jt_vr_data.tgl_capture BETWEEN '${tgl} 00:00:00' AND '${tgl} 23:59:00' AND jt_vr_data.kode_uppkb = '${kode_uppkb}'
                            GROUP BY
                                jt_lokasi_uppkb.id, tanggal, waktu_real
                            ORDER BY
                                waktu_real`;
                }

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                return result
            } else {
                let sql2 = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute') as waktu_real,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute'), 'HH24:MI') as waktu_from,
                                to_char((date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute')) + INTERVAL '15 Minutes', 'HH24:MI') AS waktu_to,
                                concat(to_char(date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute'), 'HH24:MI'),' - ',to_char((date_trunc('hour', jt_vr_data.tgl_capture) + (floor(date_part('minute', jt_vr_data.tgl_capture) / 15) * interval '15 minute')) + INTERVAL '15 Minutes', 'HH24:MI')) as waktu,
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
                            WHERE jt_vr_data.tgl_capture BETWEEN '${tgl} 00:00:00' AND '${tgl} 23:59:00'
                            GROUP BY tanggal, waktu_real
                            ORDER BY waktu_real`;

                if (interval == 2) {
                    sql2 = `SELECT
                                DATE(jt_vr_data.tgl_capture) AS tanggal,
                                DATE_TRUNC('hour', jt_vr_data.tgl_capture) AS waktu_real,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture), 'HH24:MI') as waktu_from,
                                to_char(date_trunc('hour', jt_vr_data.tgl_capture) + INTERVAL '60 Minutes', 'HH24:MI') AS waktu_to,
                                CONCAT(to_char(date_trunc('hour', jt_vr_data.tgl_capture), 'HH24:MI'),' - ',to_char(date_trunc('hour', jt_vr_data.tgl_capture) + INTERVAL '60 Minutes', 'HH24:MI')) AS waktu,
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
                            WHERE
                                jt_vr_data.tgl_capture BETWEEN '${tgl} 00:00:00' AND '${tgl} 23:59:00'
                            GROUP BY
                                tanggal, waktu_real
                            ORDER BY
                                waktu_real`;
                }

                const result = await sequelize.query(sql2, {
                    type: QueryTypes.SELECT,
                    logging: false
                })

                return result
            }

        } catch (error) {
            next(error)
        }
    }

    const getAngkutanBarangKA = async (req, res, next) => {
        console.log('::=::-------------> GET ALL LHR ANGKUTAN BARANG TIDAK MASUK UPPKB BY KLASIFIKASI AI <-------------::=::');
        const interval = req.query.interval;
        const result = await dataABKA(req, next);
        let data = [];

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
            var T_blue = 0;
            var T_tdk_blue = 0;
            for (let row of result) {
                var formatwaktu = row.waktu;
                var waktu_from = row.waktu_from;
                var waktu_to = row.waktu_to;

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
                T_blue = T_blue + parseInt(row.jml_blue);
                T_tdk_blue = T_tdk_blue + parseInt(row.jml_tdk_blue);
                // const totalKend = versiLhr === '2' ? (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck) + parseInt(row.bus)) : (parseInt(row.motor) + parseInt(row.mobil) + parseInt(row.truck_bus))
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
                    T_blue: parseInt(T_blue),
                    T_tdk_blue: parseInt(T_tdk_blue),
                }
            });
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

    const grafikKinerjaRuas = async (req, res, next) => {
        console.log('--------------------::Processing Grafik Kinerja Ruas::--------------------');
        try {
            const lokasi_id = req.query.lokasi;
            const interval = req.query.interval;
            const tgl = moment(req.query.tgl).format('YYYY-MM-DD');
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
                                        lhr_log_stat.lokasi_id = 48 AND 
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
                                        lhr_log_stat.lokasi_id = 48 AND 
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

                sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                }).then(async (result) => {
                    if (result.length > 0) {
                        // console.log(result);
                        var data = [];
                        for (var i = 0; i < result.length; i++) {
                            var formatwaktu = result[i].waktu;
                            var waktu_from = result[i].waktu_from;
                            var waktu_to = result[i].waktu_to;

                            if (interval == 1 || interval == 2) {
                                if (Number(moment(waktu_to, 'HH:mm').format('HH')) == 0 && Number(moment(waktu_to, 'HH:mm').format('mm')) == 0) {
                                    formatwaktu = `${waktu_from} - 23:59`;
                                }
                            }

                            const totalKend = (parseInt(result[i].motor) + parseInt(result[i].mobil) + parseInt(result[i].truck_bus));
                            data.push({
                                lokasi_id: result[i].lokasi_id,
                                nama_lokasi: result[i].nama_lokasi,
                                fsf: Number(result[i].fsf),
                                fcs: Number(result[i].fcs),
                                fclj: Number(result[i].fclj),
                                fcpa: Number(result[i].fcpa),
                                kapasitas: Number(result[i].kapasitas),
                                motor: Number(result[i].motor),
                                mobil: Number(result[i].mobil),
                                truck_bus: Number(result[i].truck_bus),
                                truck: Number(result[i].truck),
                                bus: Number(result[i].bus),
                                gap: Number(result[i].gap),
                                headway: Number(result[i].headway),
                                kec_rata_rata: Number(result[i].kec_rata_rata),
                                p_speed: Number(result[i].p_speed),
                                p_occupancy: Number(result[i].p_occupancy),
                                smp: Number(result[i].smp),
                                kapasitas: Number(result[i].kapasitas),
                                ds: Number(result[i].ds),
                                total: totalKend,
                                waktu: formatwaktu
                            });
                        }
                        res.send({
                            success: true,
                            message: messageService().GET_SUCCESS,
                            data: data
                        });
                    } else {
                        res.send({
                            success: false,
                            message: messageService().GET_FAILED
                        });
                    }
                });
            } else {

                res.send({
                    success: false,
                    message: 'Lokasi ID Tidak Boleh Kosong'
                });
            }

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

const getTopKinerjaRuas = async (req, res, next) => {
    console.log('--------------------::Processing Get Top Kinerja Ruas::--------------------');
    try {
        var limit = req.query.limit;
        if (limit) {
            $lmt = `LIMIT ${limit}`;
        } else {
            $lmt = 'LIMIT 4';
        }

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
                        lhr_log_stat.date_time BETWEEN CURRENT_TIMESTAMP - INTERVAL '15 MINUTE' AND CURRENT_TIMESTAMP 
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
                    ORDER BY ds DESC ${$lmt}`;

        // console.log(sql);

        sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        }).then(async (result) => {
            if (result.length > 0) {
                // console.log(result);
                var arr = [];
                for (var i = 0; i < result.length; i++) {
                    var index_pelayanan = await kode_tingkat_pelayanan(result[i].ds);
                    var tingkat_pelayanan = await qtingkat_pelayanan(index_pelayanan);
                    // console.log(result[i]);
                    arr.push({
                        ip_addresults: result[i].ip_addresults,
                        tgl_jam: result[i].tgl_jam,
                        waktu: result[i].waktu,
                        jml_lajur: Number(result[i].jml_lajur),
                        so_dasar: Number(result[i].so_dasar),
                        fsf: Number(result[i].fsf),
                        fcs: Number(result[i].fcs),
                        fclj: Number(result[i].fclj),
                        fcpa: Number(result[i].fcpa),
                        so_fix: Number(result[i].so_fix),
                        kapasitas: Number(result[i].kapasitas),
                        motor: Number(result[i].motor),
                        mobil: Number(result[i].mobil),
                        truck_bus: Number(result[i].truck_bus),
                        truck: Number(result[i].truck),
                        bus: Number(result[i].bus),
                        jml_kend: Number(result[i].jml_kend),
                        gap: Number(result[i].gap),
                        headway: Number(result[i].headway),
                        kec_rata_rata: Number(result[i].kec_rata_rata),
                        p_speed: Number(result[i].p_speed),
                        p_occupancy: Number(result[i].p_occupancy),
                        qtot_avg: Number(result[i].qtot_avg),
                        qtot: Number(result[i].qtot),
                        ds: Number(result[i].ds),
                        desk_tingkat_pelayanan: tingkat_pelayanan.desk_tingkat_pelayanan,
                        keterangan: tingkat_pelayanan.keterangan,
                        index_layanan: index_pelayanan,
                        fasa: result[i].fasa,
                        warna_layanan: tingkat_pelayanan.warna,
                        id_lokasi: Number(result[i].id_lokasi),
                        kode_lokasi: result[i].kode_lokasi,
                        nama_lokasi: result[i].nama_lokasi,
                        id_sensor: Number(result[i].sensor_id),
                        kode_sensor: result[i].kode_sensor,
                        desk_sensor: result[i].desk_sensor,
                        url_proxy_cam: result[i].url_proxy_cam,
                        url_webrtc_cam: result[i].url_webrtc_cam,
                        no_lane: result[i].lane,
                        desc_lane: result[i].desk_lane
                    });
                }
                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: arr
                });
            } else {
                res.send({
                    success: false,
                    message: messageService().GET_FAILED
                });
            }
        });
    } catch (error) {
        console.log(error);
        next(error);
        }
    }

    return {
        getSinkronisasiData,
        getResumeLhrUmum,
        getResumeLhrAngkutan,
        getLhrUmum,
        getAngkutanBarangJK,
        getAngkutanBarangKA,
        getTopKinerjaRuas,
        grafikKinerjaRuas,
    }
}

module.exports = StatistikLhrController;