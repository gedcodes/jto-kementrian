const { t_detaildimensi, t_lokasi, sequelize } = require('../models');
const { QueryTypes, Op } = require('sequelize');
const messageService =  require('../services/message.service');
const moment = require('moment');
const {
    getPelanggaranDimensi,
    getToleransiDimensi,
    getBptdId,
    getLokasiUppkbId
} = require('./lib/dataid');

const {
    loginUser,
    syncToPostServer,
    updateStatusSyncToPusat
} = require('./lib/sinkronisasi');

const DetailMuatanController = () => {

    const countAll = async (conditions) => {
        return t_detaildimensi.count({
            where:conditions
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            // let kode_trx = req.query.trx;
            // let kode_uppkb = req.query.kuppkb;
            // let tgl_ukur = req.query.tglukur;
            // let conditions = {is_deleted: false}
            
            // if (kode_trx == undefined){
            //     res.send({
            //         success: false,
            //         data: 'No Penimbangan Tidak Boleh Kosong'
            //     });
            // } else {

                // KODE SEBELUMNYA
                // if (kode_trx) {
                //     conditions= { kode_trx: kode_trx, is_deleted: false};
                // }

                // if (kode_uppkb) {
                //     conditions= { kode_uppkb: kode_uppkb, is_deleted: false};
                // }   
                
                // if (tgl_ukur) {
                //     conditions = [
                //         sequelize.where(
                //             sequelize.fn('DATE', sequelize.col('tgl_pengukuran')),
                //             moment(tgl_ukur).format('YYYY-MM-DD')
                //         ),
                //         { is_deleted: false, is_active: true }
                //     ]
                // }   

                // if (kode_trx && kode_uppkb && tgl_ukur) {
                //     conditions = [
                //         sequelize.where(
                //             sequelize.fn('DATE', sequelize.col('tgl_pengukuran')),
                //             moment(tgl_ukur).format('YYYY-MM-DD')
                //         ),
                //         { kode_trx: kode_trx, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
                //     ]
                // }

                // KONDISI BARU
                const lokasi_id = req.query.lokasi;
                const bptd_id = req.query.bptd;
                const kode_trx = req.query.trx;
                const kode_uppkb = req.query.kuppkb;
                const tgl_ukur = req.query.tglukur;
                const tgl_awal = req.query.tgl_awal;
                const tgl_akhir = req.query.tgl_akhir;
                const device_id = req.query.device_id;

                let conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                        {[Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]}
                    ),
                    {is_deleted: false, is_active: true}
                ];
                if (bptd_id) conditions = { ...conditions, bptd_id };
                if (lokasi_id) conditions = { ...conditions, lokasi_id };
                if (kode_uppkb) conditions = { ...conditions, kode_uppkb };
                if (kode_trx) conditions = { ...conditions, kode_trx };
                if (tgl_ukur) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('tgl_pengukuran')),
                            moment(tgl_ukur).format('YYYY-MM-DD')
                        ),
                        {is_deleted: false, is_active: true}
                    ];
                }

                if (tgl_awal && tgl_akhir) {
                    if (lokasi_id) {
                        conditions = [
                            sequelize.where(
                                sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                                {[Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]}
                            ),
                            {
                                lokasi_id: lokasi_id,
                                is_deleted: false,
                                is_active: true
                            }
                            // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                        ]
                    } 
                    
                    if (kode_uppkb) {
                        conditions = [
                            sequelize.where(
                                sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                                {[Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]}
                            ),
                            {
                                kode_uppkb: kode_uppkb,
                                is_deleted: false,
                                is_active: true
                            }
                            // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                        ]
                    }

                    if (bptd_id) {
                        conditions = [
                            sequelize.where(
                                sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                                {[Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]}
                            ),
                            {
                                bptd_id: bptd_id,
                                is_deleted: false,
                                is_active: true
                            }
                            // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                        ]
                    }
        
                    if (lokasi_id && bptd_id) {
                        conditions = [
                            sequelize.where(
                                sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                                {[Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]}
                            ),
                            {
                                lokasi_id: lokasi_id,
                                bptd_id: bptd_id,
                                is_deleted: false,
                                is_active: true
                            }
                            // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                        ]
                    }  
        
                    if (kode_uppkb && bptd_id) {
                        conditions = [
                            sequelize.where(
                                sequelize.fn('DATE', sequelize.col('t_detaildimensi.tgl_pengukuran')),
                                {[Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]}
                            ),
                            {
                                kode_uppkb: kode_uppkb,
                                bptd_id: bptd_id,
                                is_deleted: false,
                                is_active: true
                            }
                            // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                        ]
                    }                
                }

                let count = await countAll(conditions);

                const options = {
                    include: [
                        {
                            model: t_lokasi,
                            required: false,
                            as: 'detaildimensi_uppkb',
                            attributes: [
                                'id', 'kode', 'nama', 'alamat_uppkb'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            }
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
        
                const {docs, pages, total} = await t_detaildimensi.paginate(options)
        
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
            //}
        } catch (error) {
            next(error)
        }
    }

    const padLeft = (num, size) => {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        return s;
    }

    const setNoUrutTrx = async (kode_uppkb, tgl_trx) => {
        var sql = `SELECT count(*) AS jml FROM jt_detail_dimensi WHERE kode_uppkb = '${kode_uppkb}' AND DATE(tgl_pengukuran) = DATE('${tgl_trx}')`;
        console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
    
        if (result.length > 0) {
            var no_urut = Number(result[0].jml) + 1;
        } else {
            var no_urut = 1;
        }

        return no_urut;
    }

    const setNoForm = async (kode_uppkb, tgl_trx) => {
        var sql = `SELECT count(*) AS jml FROM jt_detail_dimensi WHERE kode_uppkb = '${kode_uppkb}' AND DATE(tgl_pengukuran) = DATE('${tgl_trx}')`;
    
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
        var bln = moment().format('MM');
        var thn = moment().format('YY');
        var rombln = romawi(bln);

        if (result.length > 0) {
            var no_urut = Number(result[0].jml) + 1;
            //console.log('JUMLAH : ', no_urut);
        } else {
            var no_urut = 1;
        }

        return `PL.203/${padLeft(no_urut, 5)}/UPPKB-${kode_uppkb}/${rombln}/${padLeft(thn,2)}`;
    }

    const romawi = (num) => {
        var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},
            roman = '',
            i;
        for ( i in lookup ) {
          while ( num >= lookup[i] ) {
            roman += i;
            num -= lookup[i];
          }
        }
        return roman;
    }    

    const findToleransiDimensiManual = async (req, res, next) => {
        const jarak_sb_s1_s2_uji = req.body.jarak_sb_s1_s2_uji;
        const jarak_sb_s1_s2_fisik = req.body.jarak_sb_s1_s2_fisik;

        const jarak_sb_s2_s3_uji = req.body.jarak_sb_s2_s3_uji;
        const jarak_sb_s2_s3_fisik = req.body.jarak_sb_s2_s3_fisik;

        const jarak_sb_s3_s4_uji = req.body.jarak_sb_s3_s4_uji;
        const jarak_sb_s3_s4_fisik = req.body.jarak_sb_s3_s4_fisik;

        const lebar_total_uji = req.body.lebar_total_uji;
        const lebar_total_fisik = req.body.lebar_total_fisik;

        const panjang_total_uji = req.body.panjang_total_uji;
        const panjang_total_fisik = req.body.panjang_total_fisik;
        
        const tinggi_total_uji = req.body.tinggi_total_uji;
        const tinggi_total_fisik = req.body.tinggi_total_fisik;

        const foh_uji = req.body.foh_uji;
        const foh_fisik = req.body.foh_fisik;

        const roh_uji = req.body.roh_uji;
        const roh_fisik = req.body.roh_fisik;

        const bbt_panjang_uji = req.body.bbt_panjang_uji;
        const bbt_panjang_fisik = req.body.bbt_panjang_fisik;
        
        const bbt_lebar_uji = req.body.bbt_lebar_uji;
        const bbt_lebar_fisik = req.body.bbt_lebar_fisik;

        const bbt_tinggi_uji = req.body.bbt_tinggi_uji;
        const bbt_tinggi_fisik = req.body.bbt_tinggi_fisik;

        const ban_sb1_uji = req.body.ban_sb1_uji;
        const ban_sb1_fisik = req.body.ban_sb1_fisik;

        const ban_sb2_uji = req.body.ban_sb2_uji;
        const ban_sb2_fisik = req.body.ban_sb2_fisik;

        const ban_sb3_uji = req.body.ban_sb3_uji;
        const ban_sb3_fisik = req.body.ban_sb3_fisik;

        var sql = `SELECT * FROM jt_toleransi_dimensi WHERE is_active = true AND is_deleted = false ORDER BY id ASC`;
        var result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
    
        if (Object.keys(result).length > 0) {
            var toleransi_jarak_sb_s1_s2 = Math.ceil((Number(jarak_sb_s1_s2_uji) * (result[0].prosen_sb1_sb2/100)) + Number(jarak_sb_s1_s2_uji));
            var toleransi_jarak_sb_s2_s3 = Math.ceil((Number(jarak_sb_s2_s3_uji) * (result[0].prosen_sb2_sb3/100)) + Number(jarak_sb_s2_s3_uji));
            var toleransi_jarak_sb_s3_s4 = Math.ceil((Number(jarak_sb_s3_s4_uji) * (result[0].prosen_sb3_sb4/100)) + Number(jarak_sb_s3_s4_uji));

            var toleransi_panjang = Math.ceil((Number(panjang_total_uji) * (result[0].prosen_pjg/100)) + Number(panjang_total_uji));
            var toleransi_lebar = Math.ceil((Number(lebar_total_uji) * (result[0].prosen_lebar/100)) + Number(lebar_total_uji));
            var toleransi_tinggi = Math.ceil((Number(tinggi_total_uji) * (result[0].prosen_tinggi/100)) + Number(tinggi_total_uji));
            var toleransi_foh = Math.ceil((Number(foh_uji) * (result[0].prosen_foh/100)) + Number(foh_uji));
            var toleransi_roh = Math.ceil((Number(roh_uji) * (result[0].prosen_roh/100)) + Number(roh_uji));
    
            var toleransi_bbt_panjang_uji = Math.ceil((Number(bbt_panjang_uji) * (result[0].prosen_bbt_panjang/100)) + Number(bbt_panjang_uji));
            var toleransi_bbt_lebar_uji = Math.ceil((Number(bbt_lebar_uji) * (result[0].prosen_bbt_lebar/100)) + Number(bbt_lebar_uji));
            var toleransi_bbt_tinggi_uji = Math.ceil((Number(bbt_tinggi_uji) * (result[0].prosen_bbt_tinggi/100)) + Number(bbt_tinggi_uji));

            var toleransi_ban_sb1_uji = Math.ceil((Number(ban_sb1_uji) * (result[0].prosen_ban_sb1/100)) + Number(ban_sb1_uji));
            var toleransi_ban_sb2_uji = Math.ceil((Number(ban_sb2_uji) * (result[0].prosen_ban_sb2/100)) + Number(ban_sb2_uji));
            var toleransi_ban_sb3_uji = Math.ceil((Number(ban_sb3_uji) * (result[0].prosen_ban_sb3/100)) + Number(ban_sb3_uji));


            // var kelebihan_jarak_sb_s1_s2 = Math.ceil(Number(jarak_sb_s1_s2_fisik) - Number(toleransi_jarak_sb_s1_s2));
            // var kelebihan_jarak_sb_s2_s3 = Math.ceil(Number(jarak_sb_s2_s3_fisik) - Number(toleransi_jarak_sb_s2_s3));
            // var kelebihan_jarak_sb_s3_s4 = Math.ceil(Number(jarak_sb_s3_s4_fisik) - Number(toleransi_jarak_sb_s3_s4));
            
            var kelebihan_jarak_sb_s1_s2 = Math.ceil(Number(jarak_sb_s1_s2_fisik) - Number(jarak_sb_s1_s2_uji));
            var kelebihan_jarak_sb_s2_s3 = Math.ceil(Number(jarak_sb_s2_s3_fisik) - Number(jarak_sb_s2_s3_uji));
            var kelebihan_jarak_sb_s3_s4 = Math.ceil(Number(jarak_sb_s3_s4_fisik) - Number(jarak_sb_s3_s4_uji));
            
            // var kelebihan_panjang = Math.ceil(Number(panjang_total_fisik) - Number(toleransi_panjang));
            // var kelebihan_lebar = Math.ceil(Number(lebar_total_fisik) - Number(toleransi_lebar));
            // var kelebihan_tinggi = Math.ceil(Number(tinggi_total_fisik) - Number(toleransi_tinggi));
            // var kelebihan_foh = Math.ceil(Number(foh_fisik) - Number(toleransi_foh));
            // var kelebihan_roh = Math.ceil(Number(roh_fisik) - Number(toleransi_roh));
            
            var kelebihan_panjang = Math.ceil(Number(panjang_total_fisik) - Number(panjang_total_uji));
            var kelebihan_lebar = Math.ceil(Number(lebar_total_fisik) - Number(lebar_total_uji));
            var kelebihan_tinggi = Math.ceil(Number(tinggi_total_fisik) - Number(tinggi_total_uji));
            var kelebihan_foh = Math.ceil(Number(foh_fisik) - Number(foh_uji));
            var kelebihan_roh = Math.ceil(Number(roh_fisik) - Number(roh_uji));
            
            // var kelebihan_bbt_panjang_uji = Math.ceil(Number(bbt_panjang_fisik) - Number(toleransi_bbt_panjang_uji));
            // var kelebihan_bbt_lebar_uji = Math.ceil(Number(bbt_lebar_fisik) - Number(toleransi_bbt_lebar_uji));
            // var kelebihan_bbt_tinggi_uji =  Math.ceil(Number(bbt_tinggi_fisik) - Number(toleransi_bbt_tinggi_uji));
            
            var kelebihan_bbt_panjang_uji = Math.ceil(Number(bbt_panjang_fisik) - Number(bbt_panjang_uji));
            var kelebihan_bbt_lebar_uji = Math.ceil(Number(bbt_lebar_fisik) - Number(bbt_lebar_uji));
            var kelebihan_bbt_tinggi_uji =  Math.ceil(Number(bbt_tinggi_fisik) - Number(bbt_tinggi_uji));
            
            // var kelebihan_ban_sb1_uji = Math.ceil(Number(ban_sb1_fisik) - Number(toleransi_ban_sb1_uji));
            // var kelebihan_ban_sb2_uji = Math.ceil(Number(ban_sb2_fisik) - Number(toleransi_ban_sb2_uji));
            // var kelebihan_ban_sb3_uji =  Math.ceil(Number(ban_sb3_fisik) - Number(toleransi_ban_sb3_uji));
            
            
            var kelebihan_ban_sb1_uji = Math.ceil(Number(ban_sb1_fisik) - Number(ban_sb1_uji));
            var kelebihan_ban_sb2_uji = Math.ceil(Number(ban_sb2_fisik) - Number(ban_sb2_uji));
            var kelebihan_ban_sb3_uji =  Math.ceil(Number(ban_sb3_fisik) - Number(ban_sb3_uji));
            
            var prosen_kelebihan_jarak_sb_s1_s2 = Math.ceil((kelebihan_jarak_sb_s1_s2 / Number(jarak_sb_s1_s2_uji)) * 100);
            var prosen_kelebihan_jarak_sb_s2_s3 = Math.ceil((kelebihan_jarak_sb_s2_s3 / Number(jarak_sb_s2_s3_uji)) * 100);
            var prosen_kelebihan_jarak_sb_s3_s4 = Math.ceil((kelebihan_jarak_sb_s3_s4 / Number(jarak_sb_s3_s4_uji)) * 100);

            var prosen_kelebihan_panjang = Math.ceil((kelebihan_panjang / Number(panjang_total_uji)) * 100);
            var prosen_kelebihan_lebar = Math.ceil((kelebihan_lebar / Number(lebar_total_uji)) * 100);
            var prosen_kelebihan_tinggi = Math.ceil((kelebihan_tinggi / Number(tinggi_total_uji)) * 100);
            var prosen_kelebihan_foh = Math.ceil((kelebihan_foh / Number(foh_uji)) * 100);
            var prosen_kelebihan_roh = Math.ceil((kelebihan_roh / Number(roh_uji)) * 100);

            var prosen_kelebihan_bbt_panjang_uji = Math.ceil((kelebihan_bbt_panjang_uji / Number(bbt_panjang_uji)) * 100);
            var prosen_kelebihan_bbt_lebar_uji = Math.ceil((kelebihan_bbt_lebar_uji / Number(bbt_lebar_uji)) * 100);
            var prosen_kelebihan_bbt_tinggi_uji = Math.ceil((kelebihan_bbt_tinggi_uji / Number(bbt_tinggi_uji)) * 100);

            var prosen_kelebihan_ban_sb1_uji = Math.ceil((kelebihan_ban_sb1_uji / Number(ban_sb1_uji)) * 100);
            var prosen_kelebihan_ban_sb2_uji = Math.ceil((kelebihan_ban_sb2_uji / Number(ban_sb2_uji)) * 100);
            var prosen_kelebihan_ban_sb3_uji = Math.ceil((kelebihan_ban_sb3_uji / Number(ban_sb3_uji)) * 100);
    
            var result_toleransi_dimensi = {
                prosen_toleransi_sb1_sb1: result[0].prosen_sb1_sb2,
                prosen_toleransi_sb2_sb2: result[0].prosen_sb2_sb3,
                prosen_toleransi_sb3_sb4: result[0].prosen_sb3_sb4,
                prosen_toleransi_bbt_panjang: result[0].prosen_bbt_panjang,
                prosen_toleransi_bbt_lebar: result[0].prosen_bbt_lebar,
                prosen_toleransi_bbt_tinggi: result[0].prosen_bbt_tinggi,
                prosen_toleransi_ban_sb1: result[0].prosen_ban_sb1,
                prosen_toleransi_ban_sb2: result[0].prosen_ban_sb2,
                prosen_toleransi_ban_sb3: result[0].prosen_ban_sb3,
                prosen_toleransi_foh: result[0].prosen_foh,
                prosen_toleransi_roh: result[0].prosen_roh,
                prosen_toleransi_sb1_sb1: result[0].prosen_sb1_sb2,
                prosen_toleransi_sb2_sb2: result[0].prosen_sb2_sb3,
                prosen_toleransi_sb3_sb4: result[0].prosen_sb3_sb4,
                toleransi_jarak_sb_s1_s2: toleransi_jarak_sb_s1_s2,
                toleransi_jarak_sb_s2_s3: toleransi_jarak_sb_s2_s3,
                toleransi_jarak_sb_s3_s4: toleransi_jarak_sb_s3_s4,
                toleransi_bbt_panjang_uji: toleransi_bbt_panjang_uji,
                toleransi_bbt_lebar_uji: toleransi_bbt_lebar_uji,
                toleransi_bbt_tinggi_uji: toleransi_bbt_tinggi_uji,
                toleransi_ban_sb1_uji: toleransi_ban_sb1_uji,
                toleransi_ban_sb2_uji: toleransi_ban_sb2_uji,
                toleransi_ban_sb3_uji: toleransi_ban_sb3_uji,
                toleransi_panjang: toleransi_panjang,
                toleransi_lebar: toleransi_lebar,
                toleransi_tinggi: toleransi_tinggi,
                toleransi_foh: toleransi_foh,
                toleransi_roh: toleransi_roh,
                kelebihan_jarak_sb_s1_s2: kelebihan_jarak_sb_s1_s2,
                kelebihan_jarak_sb_s2_s3: kelebihan_jarak_sb_s2_s3,
                kelebihan_jarak_sb_s3_s4: kelebihan_jarak_sb_s3_s4,
                kelebihan_bbt_panjang_uji: kelebihan_bbt_panjang_uji,
                kelebihan_bbt_lebar_uji: kelebihan_bbt_lebar_uji,
                kelebihan_bbt_tinggi_uji: kelebihan_bbt_tinggi_uji,
                kelebihan_ban_sb1_uji: kelebihan_ban_sb1_uji,
                kelebihan_ban_sb2_uji: kelebihan_ban_sb2_uji,
                kelebihan_ban_sb3_uji: kelebihan_ban_sb3_uji,
                kelebihan_panjang: kelebihan_panjang,
                kelebihan_lebar: kelebihan_lebar,
                kelebihan_tinggi: kelebihan_tinggi,
                kelebihan_foh: kelebihan_foh,
                kelebihan_roh: kelebihan_roh,
                prosen_kelebihan_jarak_sb_s1_s2: (prosen_kelebihan_jarak_sb_s1_s2) ? prosen_kelebihan_jarak_sb_s1_s2 : 0,
                prosen_kelebihan_jarak_sb_s2_s3: (prosen_kelebihan_jarak_sb_s2_s3) ? prosen_kelebihan_jarak_sb_s2_s3 : 0,
                prosen_kelebihan_jarak_sb_s3_s4: (prosen_kelebihan_jarak_sb_s3_s4) ? prosen_kelebihan_jarak_sb_s3_s4 : 0,
                prosen_kelebihan_bbt_panjang_uji: (prosen_kelebihan_bbt_panjang_uji) ? prosen_kelebihan_bbt_panjang_uji : 0,
                prosen_kelebihan_bbt_lebar_uji: (prosen_kelebihan_bbt_lebar_uji) ? prosen_kelebihan_bbt_lebar_uji : 0,
                prosen_kelebihan_bbt_tinggi_uji: (prosen_kelebihan_bbt_tinggi_uji) ? prosen_kelebihan_bbt_tinggi_uji : 0,
                prosen_kelebihan_ban_sb1_uji: (prosen_kelebihan_ban_sb1_uji) ? prosen_kelebihan_ban_sb1_uji : 0,
                prosen_kelebihan_ban_sb2_uji: (prosen_kelebihan_ban_sb2_uji) ? prosen_kelebihan_ban_sb2_uji : 0,
                prosen_kelebihan_ban_sb3_uji: (prosen_kelebihan_ban_sb3_uji) ? prosen_kelebihan_ban_sb3_uji : 0,
                prosen_kelebihan_panjang: (prosen_kelebihan_panjang) ? prosen_kelebihan_panjang : 0,
                prosen_kelebihan_lebar: (prosen_kelebihan_lebar) ? prosen_kelebihan_panjang : 0,
                prosen_kelebihan_tinggi: (prosen_kelebihan_tinggi) ? prosen_kelebihan_tinggi : 0,
                prosen_kelebihan_foh: (prosen_kelebihan_foh) ? prosen_kelebihan_foh : 0,
                prosen_kelebihan_roh: (prosen_kelebihan_roh) ? prosen_kelebihan_roh : 0,                        
            }
    
            res.send({
                success: true,
                message: 'Req. Berhasil',
                data: result_toleransi_dimensi
            });
        } else {
            res.send({
                success: false,
                message: 'Data Tidak Tersedia',
                data: null
            });
        }
    }


    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            const tglnow = moment(new Date()).format('YYYY-MM-DD');
            const no_urut_ukur = await setNoUrutTrx(req.body.kode_uppkb, tglnow);
            const date_ukur = moment().format('DDMMYY');
            const no_ukur = `P203.${req.body.kode_uppkb}.${padLeft(no_urut_ukur,5)}.${date_ukur}`;
            var pelanggaran_dim = await getPelanggaranDimensi(req.body.panjang_total_uji, req.body.lebar_total_fisik, req.body.tinggi_total_uji, req.body.foh_uji, req.body.roh_fisik, req.body.panjang_total_fisik, req.body.lebar_total_fisik, req.body.tinggi_total_fisik, req.body.foh_fisik, req.body.roh_fisik);
            var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
            var bptd_id = await getBptdId(req.query.kode_uppkb);
            var panjang_uji = req.body.panjang_total_uji; 
            var lebar_uji = req.body.lebar_total_uji; 
            var tinggi_uji = req.body.tinggi_total_uji; 
            var foh_uji = req.body.foh_uji; 
            var roh_uji = req.body.roh_uji; 
            var panjang_ukur = req.body.panjang_total_fisik; 
            var lebar_ukur = req.body.lebar_total_fisik; 
            var tinggi_ukur = req.body.tinggi_total_fisik; 
            var foh_ukur = req.body.foh_fisik; 
            var roh_ukur = req.body.roh_fisik;
            // req.body.panjang_total_uji, req.body.lebar_total_fisik, req.body.tinggi_total_uji, req.body.foh_uji, req.body.roh_fisik, req.body.panjang_total_fisik, req.body.lebar_total_fisik, req.body.tinggi_total_fisik, req.body.foh_fisik, req.body.roh_fisik
            var toleransiDimensi = await getToleransiDimensi(panjang_uji, lebar_uji, tinggi_uji, foh_uji, roh_uji, panjang_ukur, lebar_ukur, tinggi_ukur, foh_ukur, roh_ukur);

            const field = {
                no_form                   : await setNoForm(req.body.kode_uppkb, tglnow),
                no_pengukuran             : no_ukur,
                lokasi_id                 : lokasi_id,
                shift_id                  : Number(req.body.shift_id),
                regu_id                   : Number(req.body.regu_id),
                petugas_id                : Number(req.body.petugas_id),
                nama_penguji              : req.body.nama_penguji,
                no_reg_penguji            : req.body.no_reg_penguji,      
                kode_trx                  : req.body.kode_trx,
                kode_uppkb                : req.body.kode_uppkb,
                bptd_id                   : bptd_id,
                no_kendaraan              : req.body.no_kendaraan,
                tgl_pengukuran            : moment(req.body.tgl_pengukuran, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                tempat_pengukuran         : req.body.tempat_pengukuran,
                jarak_sb_s1_s2_uji        : Number(req.body.jarak_sb_s1_s2_uji),
                jarak_sb_s1_s2_fisik      : Number(req.body.jarak_sb_s1_s2_fisik),
                jarak_sb_s1_s2_sensor     : Number(req.body.jarak_sb_s1_s2_sensor),
                jarak_sb_s1_s2_toleransi  : Number(req.body.jarak_sb_s1_s2_toleransi),
                jarak_sb_s1_s2_kelebihan  : Number(req.body.jarak_sb_s1_s2_kelebihan),
                jarak_sb_s2_s3_uji        : Number(req.body.jarak_sb_s2_s3_uji),
                jarak_sb_s2_s3_fisik      : Number(req.body.jarak_sb_s2_s3_fisik),
                jarak_sb_s2_s3_sensor     : Number(req.body.jarak_sb_s2_s3_sensor),
                jarak_sb_s2_s3_toleransi  : Number(req.body.jarak_sb_s2_s3_toleransi),
                jarak_sb_s2_s3_kelebihan  : Number(req.body.jarak_sb_s2_s3_kelebihan),
                jarak_sb_s3_s4_uji        : Number(req.body.jarak_sb_s3_s4_uji),
                jarak_sb_s3_s4_fisik      : Number(req.body.jarak_sb_s3_s4_fisik),
                jarak_sb_s3_s4_sensor     : Number(req.body.jarak_sb_s3_s4_sensor),
                jarak_sb_s3_s4_toleransi  : Number(req.body.jarak_sb_s3_s4_sensor),
                jarak_sb_s3_s4_kelebihan  : Number(req.body.jarak_sb_s3_s4_kelebihan),
                lebar_total_uji           : Number(req.body.lebar_total_uji),
                lebar_total_fisik         : Number(req.body.lebar_total_fisik),
                lebar_total_sensor        : Number(req.body.lebar_total_sensor),
                lebar_total_toleransi     : Number(toleransiDimensi.toleransi_lebar) || Number(req.body.lebar_total_toleransi),
                lebar_total_kelebihan     : Number(toleransiDimensi.kelebihan_lebar) || Number(req.body.lebar_total_kelebihan),
                panjang_total_uji         : Number(req.body.panjang_total_uji),
                panjang_total_fisik       : Number(req.body.panjang_total_fisik),
                panjang_total_sensor      : Number(req.body.panjang_total_sensor),
                panjang_total_toleransi   : Number(toleransiDimensi.toleransi_panjang) || Number(req.body.panjang_total_toleransi),
                panjang_total_kelebihan   : Number(toleransiDimensi.kelebihan_panjang) || Number(req.body.panjang_total_kelebihan),
                tinggi_total_uji          : Number(req.body.tinggi_total_uji),
                tinggi_total_fisik        : Number(req.body.tinggi_total_fisik),
                tinggi_total_sensor       : Number(req.body.tinggi_total_sensor),
                tinggi_total_toleransi    : Number(toleransiDimensi.toleransi_tinggi) || Number(req.body.tinggi_total_toleransi),
                tinggi_total_kelebihan    : Number(toleransiDimensi.kelebihan_tinggi) || Number(req.body.tinggi_total_kelebihan),
                foh_uji                   : Number(req.body.foh_uji),
                foh_fisik                 : Number(req.body.foh_fisik),
                foh_sensor                : Number(req.body.foh_sensor),
                foh_toleransi             : Number(toleransiDimensi.toleransi_foh) || Number(req.body.foh_toleransi),
                foh_kelebihan             : Number(toleransiDimensi.kelebihan_foh) || Number(req.body.foh_kelebihan),
                roh_uji                   : Number(req.body.roh_uji),
                roh_fisik                 : Number(req.body.roh_fisik),
                roh_sensor                : Number(req.body.roh_sensor),
                roh_toleransi             : Number(toleransiDimensi.toleransi_roh) || Number(req.body.roh_toleransi),
                roh_kelebihan             : Number(toleransiDimensi.kelebihan_roh) || Number(req.body.roh_kelebihan),
                bbt_panjang_uji           : Number(req.body.bbt_panjang_uji),
                bbt_panjang_sensor        : Number(req.body.bbt_panjang_sensor),
                bbt_panjang_fisik         : Number(req.body.bbt_panjang_fisik),
                bbt_panjang_toleransi     : Number(req.body.bbt_panjang_toleransi),
                bbt_panjang_kelebihan     : Number(req.body.bbt_panjang_kelebihan),
                bbt_lebar_uji             : Number(req.body.bbt_lebar_uji),
                bbt_lebar_sensor          : Number(req.body.bbt_lebar_sensor),
                bbt_lebar_fisik           : Number(req.body.bbt_lebar_fisik),
                bbt_lebar_toleransi       : Number(req.body.bbt_lebar_toleransi),
                bbt_lebar_kelebihan       : Number(req.body.bbt_lebar_kelebihan),
                bbt_tinggi_uji            : Number(req.body.bbt_tinggi_uji),
                bbt_tinggi_sensor         : Number(req.body.bbt_tinggi_sensor),
                bbt_tinggi_fisik          : Number(req.body.bbt_tinggi_fisik),
                bbt_tinggi_toleransi      : Number(req.body.bbt_tinggi_toleransi),
                bbt_tinggi_kelebihan      : Number(req.body.bbt_tinggi_kelebihan),
                ban_sb1_uji               : Number(req.body.ban_sb1_uji),
                ban_sb1_fisik             : Number(req.body.ban_sb1_fisik),
                ban_sb1_sensor            : Number(req.body.ban_sb1_sensor),
                ban_sb1_toleransi         : Number(req.body.ban_sb1_toleransi),
                ban_sb1_kelebihan         : Number(req.body.ban_sb1_kelebihan),
                ban_sb2_uji               : Number(req.body.ban_sb2_uji),
                ban_sb2_fisik             : Number(req.body.ban_sb2_fisik),
                ban_sb2_sensor            : Number(req.body.ban_sb2_sensor),
                ban_sb2_toleransi         : Number(req.body.ban_sb2_toleransi),
                ban_sb2_kelebihan         : Number(req.body.ban_sb2_kelebihan),
                ban_sb3_uji               : Number(req.body.ban_sb3_uji),
                ban_sb3_fisik             : Number(req.body.ban_sb3_fisik),
                ban_sb3_sensor            : Number(req.body.ban_sb3_sensor),
                ban_sb3_toleransi         : Number(req.body.ban_sb3_toleransi),
                ban_sb3_kelebihan         : Number(req.body.ban_sb3_kelebihan),
                is_active                 : req.body.iact,
                is_melanggar              : pelanggaran_dim,
                keterangan_ukur           : req.body.keterangan_ukur,
                catatan                   : req.body.catatan,
                created_by                : req.token.id,
                created_at                : moment().format('YYYY-MM-DD HH:mm:ss') 
            };

            t_detaildimensi.create(field,{
                logging: false
            }).then(async(data) => {
                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    var data_req = req.body;
                    await syncToPostServer(req.token.id, 'post', 'v2pv/detaildimensi/create', data_req).then(async (resp) => {
                        if (resp.data.success) {
                            console.log('SINKRONISASI DATA BERHASIL');
                            await updateStatusSyncToPusat(data.id, 'jt_detail_dimensi');
                        } else {
                            console.log('SINKRONISASI DATA GAGAL');
                        }
                    }).catch((error) => {
                        // console.log(error);
                        console.log('SINKRONISASI DATA GAGAL');
                    });
                }
                res.status(200).send({
                    success: true,
                    message: messageService().CREATE_SUCCESS,
                    data: [{
                        last_insert_id : data.id,
                        fields: field
                    }]
                });
            }).catch(err => {
                console.log(err)
                res.status(500).send({
                    success: false,
                    message: messageService().CREATE_FAILED
                });
            });
        } catch (error) {
            next(error)
        }
    }
    
    const sinkDetailDimensi = async (req, res, next) => {
        console.log("--------------------::Processing Sink Pengukuran Dimensi::--------------------");
        try {
            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                var data_req = req.body;
                await syncToPostServer(req.token.id, 'post', 'v2pv/detaildimensi/create', data_req).then(async (resp) => {
                    if (resp.data.success) {
                        console.log('SINKRONISASI DATA BERHASIL');
                        var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_detail_dimensi');
                        console.log('UPDATE STATUS : ', update_status);
                        if (update_status == 1) {
                            res.send({
                                success: true,
                                message: 'Sinkronisasi / Kirim Data Pengukuran Dimensi Berhasil' 
                            });
                        } else {
                            res.send({
                                success: false,
                                message: 'Update Status Pengukuran Dimensi Gagal',
                            });
                        }

                    } else {
                        console.log('SINKRONISASI DATA GAGAL');
                        res.send({
                            success: false,
                            message: 'Sinkronisasi / Kirim Data Pengukuran Dimensi Gagal',
                        });
                    }
                }).catch((error) => {
                    // console.log(error);
                    console.log('SINKRONISASI DATA GAGAL');
                    res.send({
                        success: false,
                        message: `Sinkronisasi / Kirim Data Pengukuran Dimensi Gagal. ${error}`,
                    });
                });
            }
        } catch (error) {
            console.log(error)
            next(error)
        }

    }

    const update = async (req, res, next) => {      
        console.log("--------------------::Processing Update::--------------------");
    
        try {
            const id = req.params.id;
            const tglnow = moment(new Date()).format('YYYY-MM-DD');
            const no_urut_ukur = await setNoUrutTrx(req.body.kode_uppkb, tglnow);
            const date_ukur = moment().format('DDMMYY');
            const no_ukur = `P203.${req.body.kode_uppkb}.${padLeft(no_urut_ukur,5)}.${date_ukur}`;
            var pelanggaran_dim = await getPelanggaranDimensi(req.body.panjang_total_uji, req.body.lebar_total_fisik, req.body.tinggi_total_uji, req.body.foh_uji, req.body.roh_fisik, req.body.panjang_total_fisik, req.body.lebar_total_fisik, req.body.tinggi_total_fisik, req.body.foh_fisik, req.body.roh_fisik);
            var toleransiDimensi = await getToleransiDimensi(req.body.panjang_total_uji, req.body.lebar_total_fisik, req.body.tinggi_total_uji, req.body.foh_uji, req.body.roh_fisik, req.body.panjang_total_fisik, req.body.lebar_total_fisik, req.body.tinggi_total_fisik, req.body.foh_fisik, req.body.roh_fisik);        
            var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
            var bptd_id = await getBptdId(req.query.kode_uppkb);
            t_detaildimensi.update(
                {
                    no_form                   : await setNoForm(req.body.kode_uppkb, tglnow),
                    no_pengukuran             : no_ukur,
                    lokasi_id                 : lokasi_id,
                    bptd_id                   : bptd_id,
                    shift_id                  : req.body.shift_id,
                    regu_id                   : req.body.regu_id,
                    petugas_id                : req.body.petugas_id,
                    nama_penguji              : req.body.nama_penguji,
                    no_reg_penguji            : req.body.no_reg_penguji,                                        
                    kode_trx                  : req.body.kode_trx,
                    kode_uppkb                : req.body.kode_uppkb,
                    no_kendaraan              : req.body.no_kendaraan,
                    tgl_pengukuran            : moment(req.body.tgl_pengukuran, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    tempat_pengukuran         : req.body.tgl_pengukuran,
                    jarak_sb_s1_s2_uji        : Number(req.body.jarak_sb_s1_s2_uji),
                    jarak_sb_s1_s2_fisik      : Number(req.body.jarak_sb_s1_s2_fisik),
                    jarak_sb_s1_s2_sensor     : Number(req.body.jarak_sb_s1_s2_sensor),
                    jarak_sb_s1_s2_toleransi  : Number(req.body.jarak_sb_s1_s2_toleransi),
                    jarak_sb_s1_s2_kelebihan  : Number(req.body.jarak_sb_s1_s2_kelebihan),
                    jarak_sb_s2_s3_uji        : Number(req.body.jarak_sb_s2_s3_uji),
                    jarak_sb_s2_s3_fisik      : Number(req.body.jarak_sb_s2_s3_fisik),
                    jarak_sb_s2_s3_sensor     : Number(req.body.jarak_sb_s2_s3_sensor),
                    jarak_sb_s2_s3_toleransi  : Number(req.body.jarak_sb_s2_s3_toleransi),
                    jarak_sb_s2_s3_kelebihan  : Number(req.body.jarak_sb_s2_s3_kelebihan),
                    jarak_sb_s3_s4_uji        : Number(req.body.jarak_sb_s3_s4_uji),
                    jarak_sb_s3_s4_fisik      : Number(req.body.jarak_sb_s3_s4_fisik),
                    jarak_sb_s3_s4_sensor     : Number(req.body.jarak_sb_s3_s4_sensor),
                    jarak_sb_s3_s4_toleransi  : Number(req.body.jarak_sb_s3_s4_sensor),
                    jarak_sb_s3_s4_kelebihan  : Number(req.body.jarak_sb_s3_s4_kelebihan),
                    lebar_total_uji           : Number(req.body.lebar_total_uji),
                    lebar_total_fisik         : Number(req.body.lebar_total_fisik),
                    lebar_total_sensor        : Number(req.body.lebar_total_sensor),
                    lebar_total_toleransi     : Number(toleransiDimensi.toleransi_lebar) || Number(req.body.lebar_total_toleransi),
                    lebar_total_kelebihan     : Number(toleransiDimensi.kelebihan_lebar) || Number(req.body.lebar_total_kelebihan),
                    panjang_total_uji         : Number(req.body.panjang_total_uji),
                    panjang_total_fisik       : Number(req.body.panjang_total_fisik),
                    panjang_total_sensor      : Number(req.body.panjang_total_sensor),
                    panjang_total_toleransi   : Number(toleransiDimensi.toleransi_panjang) || Number(req.body.panjang_total_toleransi),
                    panjang_total_kelebihan   : Number(toleransiDimensi.kelebihan_panjang) || Number(req.body.panjang_total_kelebihan),
                    tinggi_total_uji          : Number(req.body.tinggi_total_uji),
                    tinggi_total_fisik        : Number(req.body.tinggi_total_fisik),
                    tinggi_total_sensor       : Number(req.body.tinggi_total_sensor),
                    tinggi_total_toleransi    : Number(toleransiDimensi.toleransi_tinggi) || Number(req.body.tinggi_total_toleransi),
                    tinggi_total_kelebihan    : Number(toleransiDimensi.kelebihan_tinggi) || Number(req.body.tinggi_total_kelebihan),
                    foh_uji                   : Number(req.body.foh_uji),
                    foh_fisik                 : Number(req.body.foh_fisik),
                    foh_sensor                : Number(req.body.foh_sensor),
                    foh_toleransi             : Number(toleransiDimensi.toleransi_foh) || Number(req.body.foh_toleransi),
                    foh_kelebihan             : Number(toleransiDimensi.kelebihan_foh) || Number(req.body.foh_kelebihan),
                    roh_uji                   : Number(req.body.roh_uji),
                    roh_fisik                 : Number(req.body.roh_fisik),
                    roh_sensor                : Number(req.body.roh_sensor),
                    roh_toleransi             : Number(toleransiDimensi.toleransi_roh) || Number(req.body.roh_toleransi),
                    roh_kelebihan             : Number(toleransiDimensi.kelebihan_roh) || Number(req.body.roh_kelebihan),
                    bbt_panjang_uji           : Number(req.body.bbt_panjang_uji),
                    bbt_panjang_sensor        : Number(req.body.bbt_panjang_sensor),
                    bbt_panjang_fisik         : Number(req.body.bbt_panjang_fisik),
                    bbt_panjang_toleransi     : Number(req.body.bbt_panjang_toleransi),
                    bbt_panjang_kelebihan     : Number(req.body.bbt_panjang_kelebihan),
                    bbt_lebar_uji             : Number(req.body.bbt_lebar_uji),
                    bbt_lebar_sensor          : Number(req.body.bbt_lebar_sensor),
                    bbt_lebar_fisik           : Number(req.body.bbt_lebar_fisik),
                    bbt_lebar_toleransi       : Number(req.body.bbt_lebar_toleransi),
                    bbt_lebar_kelebihan       : Number(req.body.bbt_lebar_kelebihan),
                    bbt_tinggi_uji            : Number(req.body.bbt_tinggi_uji),
                    bbt_tinggi_sensor         : Number(req.body.bbt_tinggi_sensor),
                    bbt_tinggi_fisik          : Number(req.body.bbt_tinggi_fisik),
                    bbt_tinggi_toleransi      : Number(req.body.bbt_tinggi_toleransi),
                    bbt_tinggi_kelebihan      : Number(req.body.bbt_tinggi_kelebihan),
                    ban_sb1_uji               : Number(req.body.ban_sb1_uji),
                    ban_sb1_fisik             : Number(req.body.ban_sb1_fisik),
                    ban_sb1_sensor            : Number(req.body.ban_sb1_sensor),
                    ban_sb1_toleransi         : Number(req.body.ban_sb1_toleransi),
                    ban_sb1_kelebihan         : Number(req.body.ban_sb1_kelebihan),
                    ban_sb2_uji               : Number(req.body.ban_sb2_uji),
                    ban_sb2_fisik             : Number(req.body.ban_sb2_fisik),
                    ban_sb2_sensor            : Number(req.body.ban_sb2_sensor),
                    ban_sb2_toleransi         : Number(req.body.ban_sb2_toleransi),
                    ban_sb2_kelebihan         : Number(req.body.ban_sb2_kelebihan),
                    ban_sb3_uji               : Number(req.body.ban_sb3_uji),
                    ban_sb3_fisik             : Number(req.body.ban_sb3_fisik),
                    ban_sb3_sensor            : Number(req.body.ban_sb3_sensor),
                    ban_sb3_toleransi         : Number(req.body.ban_sb3_toleransi),
                    ban_sb3_kelebihan         : Number(req.body.ban_sb3_kelebihan),
                    is_active                 : req.body.iact,
                    is_melanggar              : pelanggaran_dim,
                    keterangan_ukur           : req.body.keterangan_ukur,
                    catatan                   : req.body.catatan,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                },
                {
                    where: { id: id }
                }
            ).then( async(num) => {
                if (num == 1) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        if (req.body.is_transaksi == 1) {
                            var data_req = req.body;
                            await syncToPostServer(req.token.id, 'put', `v2pv/detaildimensi/update/${id}`, data_req).then(async (resp) => {
                                if (resp.data.success) {
                                    console.log('SINKRONISASI DATA BERHASIL');
                                } else {
                                    console.log('SINKRONISASI DATA GAGAL');
                                }
                            }).catch((error) => {
                                console.log(error);
                                console.log('SINKRONISASI DATA GAGAL');
                            });
                        }
                    }
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

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");
        //console.log(req.token.id);
        
        const id = req.params.id;
        try {
            t_detaildimensi.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: {id: id},
                    logging: false
                }
            ).then(num => {
                if (num == 1) {
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
            t_detaildimensi.destroy({
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
            t_detaildimensi.destroy(
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
    
    
    return {
        findAll,
        findToleransiDimensiManual,
        create,
        sinkDetailDimensi,
        update,
        removeSoft,
        remove,
        truncate,
    };
}
module.exports = DetailMuatanController;