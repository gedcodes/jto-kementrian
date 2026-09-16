const { t_toleransi, t_toleransi_uppkb, t_lokasi, t_komoditi, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const {
    syncGet
} = require('./lib/sinkronisasi');
const { upsert_toleransi, upsert_toleransi_uppkb } = require('./lib/upsertdata');
const messageService = require('../services/message.service');
const moment = require('moment');

const ToleransiController = () => {
    const countAll = async () => {
        return t_toleransi.count({
            where: {
                is_deleted: false
            }
        });
    }

    const sinkronisasi = async (req, res, next) => {
        try {
            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                // await syncGet(req.token.id, `toleransiuppkb?lkid=${req.query.lkid}`).then(async (response) => {
                await syncGet(req.token.id, `toleransi`).then(async (response) => {

                    if (response.data.success) {
                        var result = response.data.data;
                        
                        var i = 1;
                        if (Object.keys(result).length > 0) {
                            
                            for (var row of result) {
                                const sinkron_data = await upsert_toleransi(row.id, row.kode, row.nama, row.prosen_toleransi, row.is_active, req.token.id, moment().format('YYYY-MM-DD HH:mm:ss'));
                                console.log('sinkron_data : ', sinkron_data, ' Row Data : ',row.id, row.kode, row.nama, row.prosen_toleransi, row.is_active, req.token.id, moment().format('YYYY-MM-DD HH:mm:ss'));

                                var resuppkb = row.toluppkb;
                                var data_arr = [];
                                if (Object.keys(resuppkb).length > 0) {
                                    var j = 1;
                                    for (var rowuppkb of resuppkb) {
                                        
                                        // console.log('LOKASI : ', Number(rowuppkb.lokasi_id), Number(req.query.lkid));   
                                        if (Number(rowuppkb.lokasi_id) == Number(req.query.lkid)) {
                                            console.log(rowuppkb);
                                            // data_arr.push(resuppkb);
                                            if (Object.keys(resuppkb).length == j) {
                                                const sinkron_data_toleransi_uppkb = await upsert_toleransi_uppkb(rowuppkb.id, rowuppkb.kode_uppkb, rowuppkb.toleransi_id, rowuppkb.keterangan, rowuppkb.lokasi_id, rowuppkb.komoditi_uppkb.id, rowuppkb.is_active, req.token.id, moment().format('YYYY-MM-DD HH:mm:ss'));
                                                res.json({ 
                                                    success: true,
                                                    message: messageService().GET_SUCCESS,
                                                    data: response.data.data
                                                });
                                            }
                                        }
                                        // if (Number(rowuppkb.lokasi_id) == Number(req.query.lkid)) {
                                        //     console.log(rowuppkb.lokasi_id);     
                                        //     const sinkron_data_toleransi_uppkb = await upsert_toleransi_uppkb(rowuppkb.id, rowuppkb.kode_uppkb, rowuppkb.toleransi_id, rowuppkb.keterangan, rowuppkb.lokasi_id, rowuppkb.komoditi_uppkb.id, rowuppkb.is_active, req.token.id, moment().format('YYYY-MM-DD HH:mm:ss'));                           
                                        //     console.log('sinkron_data_toleransi_uppkb : ', sinkron_data_toleransi_uppkb, ' Row Data : ', rowuppkb.id, rowuppkb.kode_uppkb, rowuppkb.toleransi_id, rowuppkb.keterangan, rowuppkb.lokasi_id, rowuppkb.komoditi_uppkb.id, rowuppkb.is_active, req.token.id, moment().format('YYYY-MM-DD HH:mm:ss'));
                                        //     console.log(Object.keys(resuppkb).length, j)

                                        // } else {
                                        //     res.json({ 
                                        //         success: false,
                                        //         message: 'Data Toleransi Uppkb Tidak Tersedia.',
                                        //         data: []
                                        //     });
                                        // }
                                        j++;
                                    }
                                    console.log(data_arr);
                                } else {
                                    res.json({ 
                                        success: false,
                                        message: 'Data Toleransi Uppkb Tidak Tersedia.',
                                        data: []
                                    });
                                }
                                i++;
                            }
                        } else {
                            res.json({ 
                                success: false,
                                message: 'Data Tidak Tersedia',
                                data: response.data.data
                            });
                        }
                    } else {
                        res.json({ 
                            success: false,
                            message: 'Req. Sinkronisasi Failed',
                            data: response.data.data
                        });
                    }
                }).catch((error) => {
                    // console.log(error);
                    console.log('SINKRONISASI DATA GAGAL');
                    next(error);
                });
                
            } else {
                res.json({ 
                    success: false,
                    message: 'Aplikasi Tidak di Izinkan Sinkronisasi Data'
                });
            }
        } catch (error) {
            next(error)
        }
    }    

    const timer = ms => new Promise(res => setTimeout(res, ms))

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const conditions = { is_deleted: false }

            const count = await countAll();

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }

            const options = {
                include: [
                    {
                        model: t_toleransi_uppkb,
                        required: false,
                        as: 'toluppkb',
                        attributes: [
                            'id', 'lokasi_id', 'kode_uppkb', 'toleransi_id', 'keterangan', 'is_active'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_lokasi,
                                required: false,
                                as: 'tolkoduppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'is_active'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_komoditi,
                                required: false,
                                as: 'komoditi_uppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'is_active'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ],
                    }
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
                logging: true
            }

            const { docs, pages, total } = await t_toleransi.paginate(options)

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
        try {
            const id = req.params.id;
            t_toleransi.findByPk(id, {
                include: [
                    {
                        model: t_toleransi_uppkb,
                        required: false,
                        as: 'toluppkb',
                        attributes: [
                            'id', 'lokasi_id', 'kode_uppkb', 'toleransi_id', 'keterangan', 'is_active'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_lokasi,
                                required: false,
                                as: 'tolkoduppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'is_active'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_komoditi,
                                required: false,
                                as: 'komoditi_uppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'is_active'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ],
                    }
                ],
                where: {
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
        } catch (error) {
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            const name = req.query.search;
            const conditions = { is_active: true, is_deleted: false }

            const count = await countAll();

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }

            const options = {
                include: [
                    {
                        model: t_toleransi_uppkb,
                        required: false,
                        as: 'toluppkb',
                        attributes: [
                            'id', 'lokasi_id', 'kode_uppkb', 'toleransi_id', 'keterangan', 'is_active'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_lokasi,
                                required: false,
                                as: 'tolkoduppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'is_active'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            },
                            {
                                model: t_komoditi,
                                required: false,
                                as: 'komoditi_uppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'is_active'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ],
                    }
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
                logging: false,
            }

            const { docs, pages, total } = await t_toleransi.paginate(options)
            // const propinsi = await t_toleransi.findAll({
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

    const getKodeUppkb = async (id) => {
        var sql = `SELECT kode FROM jt_lokasi_uppkb WHERE id = ${id}`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            var kode_uppkb = `${result[0].kode}`;

            return kode_uppkb;
        } else {
            return 0;
        }
    }

    const update_exist_toleransi_uppkb = async (id_uppkb) => {
        const kode_uppkb = await getKodeUppkb(id_uppkb);

        var sql = `SELECT 
                        count(*) as jml
                    FROM 
                        jt_toleransi_uppkb
                    WHERE
                        kode_uppkb = '${kode_uppkb}' AND is_deleted = false AND is_active = true`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            if (result[0].jml > 0) {
                var update = await unpublish_soft_toleransi(kode_uppkb);
                if (update == 'UPDATE') {
                    return 1;
                } else {
                    return 0;
                }
            }
        } else {
            return 0;
        }
    }

    const unpublish_soft_toleransi = async (kode_uppkb) => {
        let update_sql = `UPDATE jt_toleransi_uppkb SET is_active = false WHERE kode_uppkb = '${kode_uppkb}'`;

        const res_update = await sequelize.query(update_sql, {
            logging: false
        })

        console.log(res_update[1].command)
        return res_update[1].command;
    }

    const insert_toleransi_uppkb = async (kode_uppkb, lokasi_id, toleransi_id, komoditi_id, keterangan, session_id, is_active) => {
        const t = await sequelize.transaction();

        try {
            let insert_sql = `INSERT INTO jt_toleransi_uppkb
                        (kode_uppkb, lokasi_id, toleransi_id, komoditi_id, keterangan, created_at, created_by, approve_by, is_active)
                    VALUES
                        ('${kode_uppkb}', ${lokasi_id}, ${toleransi_id}, ${komoditi_id}, '${keterangan}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', ${session_id}, ${session_id}, ${is_active})`;
            //console.log(insert_sql)
            const res_insert = await sequelize.query(insert_sql, {
                logging: false
            }, { transaction: t })

            await t.commit();
            const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")

            return res;
        } catch (error) {
            await t.rollback();
        }

    }

    const update_toleransi_uppkb = async (kode_uppkb, lokasi_id, toleransi_id, komoditi_id, keterangan, session_id, is_active) => {
        const t = await sequelize.transaction();

        try {
            let update_sql = `UPDATE jt_toleransi_uppkb SET 
                                kode_uppkb = '${kode_uppkb}', 
                                lokasi_id = ${lokasi_id},
                                toleransi_id = ${toleransi_id},
                                komoditi_id = ${komoditi_id}, 
                                keterangan = '${keterangan}', 
                                updated_at = '${moment().format('YYYY-MM-DD HH:mm:ss')}', 
                                updated_by = ${session_id}, 
                                is_active = ${is_active} 
                            WHERE kode_uppkb = '${kode_uppkb}' AND toleransi_id = ${toleransi_id} AND komoditi_id = ${komoditi_id}`;

            const res_update = await sequelize.query(update_sql, {
                logging: false
            }, { transaction: t })

            await t.commit();
            if (res_update[1].command == 'UPDATE') {
                return 1;
            } else {
                return 0;
            }
        } catch (error) {
            await t.rollback();
        }
        //return res_update[1].command;
    }

    const deleteSoftTolerasiUppkb = async (lokasi_id, komoditi_id, session_id) => {
        console.log("****************DELETE SOFT*************")
        //const t = await sequelize.transaction();

        try {
            let update_sql = `UPDATE jt_toleransi_uppkb SET 
                                is_deleted = true, 
                                is_active = false,
                                deleted_at = '${moment().format('YYYY-MM-DD HH:mm:ss')}', 
                                deleted_by = ${session_id}
                            WHERE lokasi_id = ${lokasi_id} AND komoditi_id = ${komoditi_id}`;

            const res_update = await sequelize.query(update_sql, {
                logging: false
            })

            //await t.commit();
            console.log(res_update[1].command)
            if (res_update[1].command == 'UPDATE') {
                
                return 1;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(error)
            return 0;
        }
    }

    const getKomoditiUppkb = async (lokasi_id, komoditi_id) => {
        var sql = `SELECT * FROM jt_toleransi_uppkb WHERE lokasi_id = ${lokasi_id} AND komoditi_id = ${komoditi_id} AND is_active = true AND is_deleted = false`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
        //console.log(result)
        if (Object.keys(result).length > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    const getUpsertAllUppkb = async (toleransi_id, komoditi_id, keterangan, session_id, is_active) => {
        var sql = `SELECT * FROM jt_lokasi_uppkb WHERE is_active = true AND is_deleted = false`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });


        if (Object.keys(result).length > 0) {
            var i = 1;
            var arr = [];
            for (var row of result) {
                //console.log(row.id, komoditi_id)

                var count_komoditi_uppkb = await getKomoditiUppkb(row.id, komoditi_id)
                //console.log('count_komoditi_uppkb', count_komoditi_uppkb)
                if(count_komoditi_uppkb == 1){
                    await deleteSoftTolerasiUppkb(row.id, komoditi_id, session_id);
                }

                var insert = await insert_toleransi_uppkb(row.kode, row.id, toleransi_id, komoditi_id, keterangan, session_id, is_active);

                arr.push(insert);
                await timer(300);
                i++;
            }
            if(Object.keys(result).length == arr.length){
                return 1;
            }else{
                return 0;
            }
            
        } else {
            return 0;
        }
    }

    const confirmToleransi = async(req, res, next) => {
        console.log("--------------------::Processing Confirm::--------------------");
        try {
            const field = {
                kode: req.body.kode,
                nama: req.body.nama,
                prosen_toleransi: req.body.prosen_toleransi,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            const komoditi_id = req.body.komoditi_id;
            const arr_uppkb = req.body.toleransi_uppkb;
            //console.log(komoditi_id, arr_uppkb)
            if(arr_uppkb == '*'){
                var sql = `SELECT * FROM jt_lokasi_uppkb WHERE is_active = true AND is_deleted = false`;

                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: false
                });
                var arr = [];
                for (var row of result) {
                    var sql_ql = `SELECT 
                                    jt_toleransi_uppkb.id,
                                    jt_toleransi_uppkb.toleransi_id,
                                    jt_toleransi_uppkb.keterangan,
                                    jt_toleransi_uppkb.is_deleted,
                                    jt_toleransi_uppkb.approve_by,
                                    jt_toleransi_uppkb.is_active,
                                    jt_toleransi_uppkb.lokasi_id,
                                    jt_toleransi_uppkb.komoditi_id,
                                    jt_toleransi.prosen_toleransi,
                                    jt_toleransi.kode AS kode_toleransi,
                                    jt_toleransi.nama AS nama_toleransi,
                                    jt_lokasi_uppkb.kode AS kode_uppkb,
                                    jt_lokasi_uppkb.nama AS nama_uppkb,
                                    jt_komoditi.kode AS kode_komditi,
                                    jt_komoditi.nama AS nama_komoditi
                                FROM
                                    jt_toleransi_uppkb
                                    INNER JOIN jt_toleransi ON (jt_toleransi_uppkb.toleransi_id = jt_toleransi.id)
                                    INNER JOIN jt_lokasi_uppkb ON (jt_toleransi_uppkb.lokasi_id = jt_lokasi_uppkb.id)
                                    INNER JOIN jt_komoditi ON (jt_toleransi_uppkb.komoditi_id = jt_komoditi.id)
                                WHERE jt_toleransi_uppkb.lokasi_id = ${row.id} AND jt_toleransi_uppkb.komoditi_id = ${komoditi_id} AND 
                                    jt_toleransi_uppkb.is_active = true AND jt_toleransi_uppkb.is_deleted = false`;
                    let res_ql = await sequelize.query(sql_ql, {
                        type: QueryTypes.SELECT,
                        logging: false
                    });

                    for(var rowql of res_ql){
                        arr.push(rowql)
                    }
                }

                res.send({
                    success: true,
                    message: `Konfirmasi Data Toleransi Komoditi`,
                    data:arr
                });
            }else{
                if (Object.keys(arr_uppkb).length > 0) {
                    var i = 1;
                    var arr = [];
                    for (var row of arr_uppkb) {
                        var sql = `SELECT 
                                        jt_toleransi_uppkb.id,
                                        jt_toleransi_uppkb.toleransi_id,
                                        jt_toleransi_uppkb.keterangan,
                                        jt_toleransi_uppkb.is_deleted,
                                        jt_toleransi_uppkb.approve_by,
                                        jt_toleransi_uppkb.is_active,
                                        jt_toleransi_uppkb.lokasi_id,
                                        jt_toleransi_uppkb.komoditi_id,
                                        jt_toleransi.prosen_toleransi,
                                        jt_toleransi.kode AS kode_toleransi,
                                        jt_toleransi.nama AS nama_toleransi,
                                        jt_lokasi_uppkb.kode AS kode_uppkb,
                                        jt_lokasi_uppkb.nama AS nama_uppkb,
                                        jt_komoditi.kode AS kode_komditi,
                                        jt_komoditi.nama AS nama_komoditi
                                    FROM
                                        jt_toleransi_uppkb
                                        INNER JOIN jt_toleransi ON (jt_toleransi_uppkb.toleransi_id = jt_toleransi.id)
                                        INNER JOIN jt_lokasi_uppkb ON (jt_toleransi_uppkb.lokasi_id = jt_lokasi_uppkb.id)
                                        INNER JOIN jt_komoditi ON (jt_toleransi_uppkb.komoditi_id = jt_komoditi.id)
                                    WHERE jt_toleransi_uppkb.lokasi_id = ${row.lokasi_uppkb_id} AND jt_toleransi_uppkb.komoditi_id = ${row.komoditi_id} AND 
                                        jt_toleransi_uppkb.is_active = true AND jt_toleransi_uppkb.is_deleted = false`;

                        let result = await sequelize.query(sql, {
                            type: QueryTypes.SELECT,
                            logging: false
                        });

                        for(var rowql of result){
                            arr.push(rowql)
                        }
                        //arr.push(arr);
                    }
                    //console.log(arr)
                    res.send({
                        success: true,
                        message: `Konfirmasi Data Toleransi Komoditi`,
                        data:arr
                    });
                }
                
            }
        } catch (error) {
            next(error)
        }
    }

    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");

        try {

            const field = {
                kode: req.body.kode,
                nama: req.body.nama,
                prosen_toleransi: req.body.prosen_toleransi,
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            const komoditi_id = req.body.komoditi_id;
            const arr_uppkb = req.body.toleransi_uppkb;
            const keterangan_all = req.body.keterangan;

            return sequelize.transaction().then(function (t) {
                return t_toleransi.create(field, { transaction: t }).then(async (data) => {
                    t.commit();
                    if (arr_uppkb == '*') {
                        var upsert = await getUpsertAllUppkb(data.id, komoditi_id, keterangan_all, req.token.id, true);

                        if (upsert == 1) {

                            //let fields = field[arr_uppkb]
                            res.send({
                                success: true,
                                message: messageService().CREATE_SUCCESS,
                                data: [{
                                    last_insert_id: data.id,
                                    fields: req.body
                                }]
                            });

                        } else {
                            res.send({
                                success: false,
                                message: messageService().CREATE_FAILED
                            });
                        }
                    } else {
                        if (Object.keys(arr_uppkb).length > 0) {
                            var i = 1;
                            for (var row of arr_uppkb) {
                                // var count_komoditi_uppkb = await getKomoditiUppkb(row.lokasi_uppkb_id, row.komoditi_id)
                                // if(count_komoditi_uppkb > 0){
                                    await deleteSoftTolerasiUppkb(row.lokasi_uppkb_id, row.komoditi_id, req.token.id);
                                //}
                                
                                //await update_exist_toleransi_uppkb(row.lokasi_uppkb_id);
                                let kode_uppkb = await getKodeUppkb(row.lokasi_uppkb_id);
                                var insert = await insert_toleransi_uppkb(kode_uppkb, row.lokasi_uppkb_id, data.id, row.komoditi_id, row.keterangan, req.token.id, row.iact);

                                if (insert == 1) {
                                    if (i == Object.keys(arr_uppkb).length) {
                                        //let fields = field[arr_uppkb]
                                        res.send({
                                            success: true,
                                            message: messageService().CREATE_SUCCESS,
                                            data: [{
                                                last_insert_id: data.id,
                                                fields: req.body
                                            }]
                                        });
                                    }
                                } else {
                                    res.send({
                                        success: false,
                                        message: messageService().CREATE_FAILED
                                    });
                                }
                                // console.log(insert, i, Object.keys(arr_uppkb).length);
                                i++;
                                await timer(300);
                            }
                        } else {
                            t.rollback().catch(() => { });
                            res.send({
                                success: false,
                                message: messageService().CREATE_FAILED
                            });
                        }
                    }
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    next(err)
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
            const arr_uppkb = req.body.toleransi_uppkb;
            //const komoditi_id = req.body.komoditi_id;
            //console.log(arr_uppkb)
            
            return sequelize.transaction().then(function (t) {
                return t_toleransi.update({
                    kode: req.body.kode,
                    nama: req.body.nama,
                    prosen_toleransi: req.body.prosen_toleransi,
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }, { where: { id: id }, transaction: t }).then(async (num) => {
                    t.commit();
                    if (num == 1) {
                        if (Object.keys(arr_uppkb).length > 0) {
                            var i = 1;
                            for (var row of arr_uppkb) {
                                await deleteSoftTolerasiUppkb(row.lokasi_uppkb_id, row.komoditi_id, req.token.id);
                                //await update_exist_toleransi_uppkb(row.lokasi_uppkb_id);
                                //let kode_uppkb = await getKodeUppkb(row.lokasi_uppkb_id);
                                //var update = await update_toleransi_uppkb(kode_uppkb, row.lokasi_uppkb_id, id, row.komoditi_id, row.keterangan, req.token.id, row.iact);

                                let kode_uppkb = await getKodeUppkb(row.lokasi_uppkb_id);
                                var update = await insert_toleransi_uppkb(kode_uppkb, row.lokasi_uppkb_id, id, row.komoditi_id, row.keterangan, req.token.id, row.iact);

                                if (update == 1) {
                                    if (i == Object.keys(arr_uppkb).length) {
                                        //let fields = field[arr_uppkb]
                                        res.send({
                                            success: true,
                                            message: messageService().UPDATE_SUCCESS
                                        });
                                    }
                                } else {
                                    res.send({
                                        success: false,
                                        message: messageService().UPDATE_FAILED
                                    });
                                }

                                /*
                                if (update == 1) {
                                    if (i == Object.keys(arr_uppkb).length) {
                                        //let fields = field[arr_uppkb]
                                        res.send({
                                            success: true,
                                            message: messageService().UPDATE_SUCCESS
                                        });
                                    }
                                } else {
                                    t.rollback().catch(() => { });
                                    res.send({
                                        success: false,
                                        message: messageService().UPDATE_FAILED
                                    });
                                }
                                */
                                // console.log(insert, i, Object.keys(arr_uppkb).length);
                                i++;

                                await timer(300);
                            }
                        } else {
                            t.rollback().catch(() => { });
                            res.send({
                                success: false,
                                message: messageService().UPDATE_FAILED
                            });
                        }
                    }
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    next(err)
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

            t_toleransi.update(
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
            t_toleransi.destroy({
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
        var resSplit = q.split(",").map(i => Number(i));
        try {
            t_toleransi.destroy({
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
                res.json({
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
            t_toleransi.update(
                {
                    is_deleted: true,
                    is_active: false,
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
                res.send({
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

            t_toleransi.update(
                {
                    is_deleted: true,
                    is_active: false,
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
                res.send({
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
            t_toleransi.destroy(
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
            //     res.json({
            //         success: false,
            //         message: `${messageService().REMOVE_FAILED}. ${err}`
            //     });
            // }); 

        } catch (error) {
            next(error)
        }

    }


    return {
        sinkronisasi,
        findAll,
        findOne,
        findAllActive,
        confirmToleransi,
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
module.exports = ToleransiController;