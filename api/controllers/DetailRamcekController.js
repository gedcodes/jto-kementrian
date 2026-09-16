const { t_detailramcek, t_lokasi, sequelize } = require('../models');
const { QueryTypes, Op } = require('sequelize');
const messageService =  require('../services/message.service');
const {
    getLokasiUppkbId,
    getBptdId
} = require('./lib/dataid');
const moment = require('moment');

const {
    loginUser,
    syncToPostServer,
    updateStatusSyncToPusat
} = require('./lib/sinkronisasi');


const DetailRamcekController = () => {

    const countAll = async (conditions) => {
        return t_detailramcek.count({
            where:conditions
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            let bptd_id = req.query.bptd;
            let lokasi_id = req.query.lokasi;
            let kode_trx = req.query.trx;
            let kode_uppkb = req.query.kuppkb;
            let tgl_pemeriksaan = req.query.tglperiksa;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;

            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
                    {[Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')]}
                ),
                {is_deleted: false}
            ];
            // if (kode_trx == undefined){
            //     res.send({
            //         success: false,
            //         data: 'No Penimbangan Tidak Boleh Kosong'
            //     });
            // } else {
                if (bptd_id) {
                    conditions= { bptd_id: bptd_id, is_deleted: false};
                }

                if (lokasi_id) {
                    conditions= { lokasi_id: lokasi_id, is_deleted: false};
                }

                if (kode_trx) {
                    conditions= { kode_trx: kode_trx, is_deleted: false};
                }

                if (kode_uppkb) {
                    conditions= { kode_uppkb: kode_uppkb, is_deleted: false};
                }   
                
                if (tgl_pemeriksaan) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
                            moment(tgl_pemeriksaan).format('YYYY-MM-DD')
                        ),
                        { is_deleted: false, is_active: true }
                    ]
                }

                if (bptd_id && tgl_pemeriksaan) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
                            moment(tgl_pemeriksaan).format('YYYY-MM-DD')
                        ),
                        { bptd_id: bptd_id, is_deleted: false, is_active: true }
                    ]
                }
                
                if (lokasi_id && tgl_pemeriksaan) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
                            moment(tgl_pemeriksaan).format('YYYY-MM-DD')
                        ),
                        { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                    ]
                }

                if (bptd_id && lokasi_id && tgl_pemeriksaan) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
                            moment(tgl_pemeriksaan).format('YYYY-MM-DD')
                        ),
                        { bptd_id: bptd_id, lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                    ]
                }

                if (kode_trx && kode_uppkb && tgl_pemeriksaan) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
                            moment(tgl_pemeriksaan).format('YYYY-MM-DD')
                        ),
                        { kode_trx: kode_trx, kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
                    ]
                }

                if (tgl_awal && tgl_akhir) {
                    if (lokasi_id) {
                        conditions = [
                            sequelize.where(
                                sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
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
                                sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
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
                                sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
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
                                sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
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
                                sequelize.fn('DATE', sequelize.col('tgl_pemeriksaan')),
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
                console.log(conditions);
                let count = await countAll(conditions);

                const options = {
                    include: [
                        {
                            model: t_lokasi,
                            required: false,
                            as: 'detailramcek_uppkb',
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
        
                const {docs, pages, total} = await t_detailramcek.paginate(options)
        
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
        var sql = `SELECT count(*) AS jml FROM jt_detail_ramcek WHERE kode_uppkb = '${kode_uppkb}' AND DATE(tgl_pemeriksaan) = DATE('${tgl_trx}')`;
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
        var sql = `SELECT count(*) AS jml FROM jt_detail_ramcek WHERE kode_uppkb = '${kode_uppkb}' AND DATE(tgl_pemeriksaan) = DATE('${tgl_trx}')`;
    
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

        return `PL.204/${padLeft(no_urut, 5)}/UPPKB-${kode_uppkb}/${rombln}/${padLeft(thn,2)}`;
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


    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            const tglnow = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            const no_urut_ukur = await setNoUrutTrx(req.body.kode_uppkb, tglnow);
            const date_ukur = moment().format('DDMMYY');
            const no_ukur = `P204.${req.body.kode_uppkb}.${padLeft(no_urut_ukur,5)}.${date_ukur}`;
            const lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
            const bptd_id = await getBptdId(req.body.kode_uppkb);

            const field = {
                no_pemeriksaan            : req.body.no_pemeriksaan || no_ukur,
                shift_id                  : Number(req.body.shift_id),
                regu_id                   : Number(req.body.regu_id),
                petugas_id                : Number(req.body.petugas_id),
                lokasi_id                 : req.body.lokasi_id || lokasi_id,
                bptd_id                   : req.body.bptd_id || bptd_id,
                nama_penguji              : req.body.nama_penguji,
                no_reg_penguji            : req.body.no_reg_penguji,
                nama_ppns                 : req.body.nama_ppns,
                no_skep                   : req.body.no_skep,      
                kode_trx                  : req.body.kode_trx,
                kode_uppkb                : req.body.kode_uppkb,
                no_kendaraan              : req.body.no_kendaraan,
                tgl_pemeriksaan           : moment(req.body.tgl_pemeriksaan, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') || tglnow,
                nama_pengemudi            : req.body.nama_pengemudi,
                umur_pengemudi            : Number(req.body.umur_pengemudi),
                nokend_value              : Number(req.body.nokend_value),
                nokend_sesuai             : Number(req.body.nokend_sesuai),
                kartu_izin_value          : Number(req.body.kartu_izin_value),
                kartu_izin_berlaku        : Number(req.body.kartu_izin_berlaku),
                kartu_izin_sesuai         : Number(req.body.kartu_izin_sesuai),
                kartu_uji_value           : Number(req.body.kartu_uji_value),
                kartu_uji_tidak_berlaku   : Number(req.body.kartu_uji_tidak_berlaku),
                kartu_uji_tidak_sesuai    : Number(req.body.kartu_uji_tidak_sesuai),
                sim_a                     : Number(req.body.sim_a),
                sim_b1                    : Number(req.body.sim_b1),
                sim_b2                    : Number(req.body.sim_b2),
                sim_tidak_sesuai          : Number(req.body.sim_tidak_sesuai),
                lampu_utama_kendaraan_dekat         : Number(req.body.lampu_utama_kendaraan_dekat),
                lampu_utama_kendaraan_dekat_kiri    : Number(req.body.lampu_utama_kendaraan_dekat_kiri),
                lampu_utama_kendaraan_dekat_kanan   : Number(req.body.lampu_utama_kendaraan_dekat_kanan),
                lampu_utama_kendaraan_jauh          : Number(req.body.lampu_utama_kendaraan_jauh),
                lampu_utama_kendaraan_jauh_kiri     : Number(req.body.lampu_utama_kendaraan_jauh_kiri),
                lampu_utama_kendaraan_jauh_kanan    : Number(req.body.lampu_utama_kendaraan_jauh_kanan),
                lampu_petunjuk_arah_depan           : Number(req.body.lampu_petunjuk_arah_depan),
                lampu_petunjuk_arah_depan_kiri      : Number(req.body.lampu_petunjuk_arah_depan_kiri),
                lampu_petunjuk_arah_depan_kanan     : Number(req.body.lampu_petunjuk_arah_depan_kanan),
                lampu_petunjuk_arah_belakang        : Number(req.body.lampu_petunjuk_arah_belakang),
                lampu_petunjuk_arah_belakang_kiri   : Number(req.body.lampu_petunjuk_arah_belakang_kiri),
                lampu_petunjuk_arah_belakang_kanan  : Number(req.body.lampu_petunjuk_arah_belakang_kanan),
                lampu_rem                           : Number(req.body.lampu_rem),
                lampu_rem_kiri          : Number(req.body.lampu_rem_kiri),
                lampu_rem_kanan         : Number(req.body.lampu_rem_kanan),
                lampu_mundur            : Number(req.body.lampu_mundur),
                lampu_mundur_kiri       : Number(req.body.lampu_mundur_kiri),
                lampu_mundur_kanan      : Number(req.body.lampu_mundur_kanan),
                kondisi_rem_utama       : Number(req.body.kondisi_rem_utama),
                kondisi_rem_parkir      : Number(req.body.kondisi_rem_parkir),
                kondisi_kaca_depan      : Number(req.body.kondisi_kaca_depan),
                kondisi_ban_depan       : Number(req.body.kondisi_ban_depan),
                kondisi_ban_depan_kiri  : Number(req.body.kondisi_ban_depan_kiri),
                kondisi_ban_depan_kanan : Number(req.body.kondisi_ban_depan_kanan),
                kondisi_ban_belakang    : Number(req.body.kondisi_ban_belakang),
                kondisi_ban_belakang_kiri           : Number(req.body.kondisi_ban_belakang_kiri),
                kondisi_ban_belakang_kanan          : Number(req.body.kondisi_ban_belakang_kanan),
                sabuk_keselamatan_pengemudi         : Number(req.body.sabuk_keselamatan_pengemudi),
                plakat_dan_simbol                   : Number(req.body.plakat_dan_simbol),
                dimensi_muatan                      : Number(req.body.dimensi_muatan),
                pengukuran_kecepatan                : Number(req.body.pengukuran_kecepatan),
                lampu_depan                         : Number(req.body.lampu_depan),
                lampu_depan_kiri                    : Number(req.body.lampu_depan_kiri),
                lampu_depan_kanan                   : Number(req.body.lampu_depan_kanan),
                lampu_belakang                      : Number(req.body.lampu_belakang),
                lampu_belakang_kiri                 : Number(req.body.lampu_belakang_kiri),
                lampu_belakang_kanan                : Number(req.body.lampu_belakang_kanan),
                kaca_spion                          : Number(req.body.kaca_spion),
                kaca_spion_tidak_sesuai             : Number(req.body.kaca_spion_tidak_sesuai),
                penghapus_kaca                      : Number(req.body.penghapus_kaca),
                penghapus_kaca_tidak_sesuai         : Number(req.body.penghapus_kaca_tidak_sesuai),
                klakson                     : Number(req.body.klakson),
                klakson_tidak_sesuai        : Number(req.body.klakson_tidak_sesuai),
                sabuk_keselamatan_pengemudi_teknis_penunjang                : Number(req.body.sabuk_keselamatan_pengemudi_teknis_penunjang),
                sabuk_keselamatan_pengemudi_teknis_penunjang_tidak_laik     : Number(req.body.sabuk_keselamatan_pengemudi_teknis_penunjang_tidak_laik),
                segitiga_pengaman           : Number(req.body.segitiga_pengaman),
                dongkrak                    : Number(req.body.dongkrak),
                pembuka_roda                : Number(req.body.pembuka_roda),
                lampu_senter                : Number(req.body.lampu_senter),
                lampu_senter_tidak_berfungsi        : Number(req.body.lampu_senter_tidak_berfungsi),
                status_kesimpulan                   : Number(req.body.status_kesimpulan),
                diijinkan_operasional               : Number(req.body.diijinkan_operasional),
                peringatan_dan_perbaikan            : Number(req.body.peringatan_dan_perbaikan),
                tilang_dan_dilarang_operasional     : Number(req.body.tilang_dan_dilarang_operasional),
                dilarang_operasional                : Number(req.body.dilarang_operasional),
                catatan                   : req.body.catatan ? req.body.catatan : '',
                created_by                : req.token.id,
                created_at                : moment().format('YYYY-MM-DD HH:mm:ss') 
            };

            t_detailramcek.create(field,{
                logging: false
            }).then(async(data) => {
                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    var data_req = req.body;
                    await syncToPostServer(req.token.id, 'post', 'v2pv/detailramcek/create', data_req).then(async (resp) => {
                        if (resp.data.success) {
                            console.log('SINKRONISASI DATA BERHASIL');
                            await updateStatusSyncToPusat(data.id, 'jt_detail_ramcek');
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
    
    const sinkDetailRamcek = async (req, res, next) => {
        console.log("--------------------::Processing Sink Data Ramcek::--------------------");
        try {
            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                var data_req = req.body;
                await syncToPostServer(req.token.id, 'post', 'v2pv/detailramcek/create', data_req).then(async (resp) => {
                    if (resp.data.success) {
                        console.log('SINKRONISASI DATA BERHASIL');
                        var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_detail_ramcek');
                        console.log('UPDATE STATUS : ', update_status);
                        if (update_status == 1) {
                            res.send({
                                success: true,
                                message: 'Sinkronisasi / Kirim Data Ramcek Berhasil' 
                            });
                        } else {
                            res.send({
                                success: false,
                                message: 'Update Status Ramcek Gagal',
                            });
                        }

                    } else {
                        console.log('SINKRONISASI DATA GAGAL');
                        res.send({
                            success: false,
                            message: 'Sinkronisasi / Kirim Data Ramcek Gagal',
                        });
                    }
                }).catch((error) => {
                    // console.log(error);
                    console.log('SINKRONISASI DATA GAGAL');
                    res.send({
                        success: false,
                        message: `Sinkronisasi / Kirim Data Ramcek Gagal. ${error}`,
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
            const no_ukur = `P204.${req.body.kode_uppkb}.${padLeft(no_urut_ukur,5)}.${date_ukur}`;
            // var pelanggaran_dim = await getPelanggaranDimensi(req.body.panjang_total_uji, req.body.lebar_total_fisik, req.body.tinggi_total_uji, req.body.foh_uji, req.body.roh_fisik, req.body.panjang_total_fisik, req.body.lebar_total_fisik, req.body.tinggi_total_fisik, req.body.foh_fisik, req.body.roh_fisik);
            // var toleransiDimensi = await getToleransiDimensi(req.body.panjang_total_uji, req.body.lebar_total_fisik, req.body.tinggi_total_uji, req.body.foh_uji, req.body.roh_fisik, req.body.panjang_total_fisik, req.body.lebar_total_fisik, req.body.tinggi_total_fisik, req.body.foh_fisik, req.body.roh_fisik);        
            const lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
            const bptd_id = await getBptdId(req.body.kode_uppkb);
            t_detailramcek.update(
                {
                    no_pemeriksaan            : req.body.no_pemeriksaan || no_ukur,
                    shift_id                  : Number(req.body.shift_id),
                    regu_id                   : Number(req.body.regu_id),
                    petugas_id                : Number(req.body.petugas_id),
                    lokasi_id                 : req.body.lokasi_id || lokasi_id,
                    bptd_id                   : req.body.bptd_id || bptd_id,
                    nama_penguji              : req.body.nama_penguji,
                    no_reg_penguji            : req.body.no_reg_penguji,
                    nama_ppns                 : req.body.nama_ppns,
                    no_skep                   : req.body.no_skep,      
                    kode_trx                  : req.body.kode_trx,
                    kode_uppkb                : req.body.kode_uppkb,
                    no_kendaraan              : req.body.no_kendaraan,
                    tgl_pemeriksaan           : moment(req.body.tgl_pemeriksaan, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') || tglnow,
                    nama_pengemudi            : req.body.nama_pengemudi,
                    umur_pengemudi            : Number(req.body.umur_pengemudi),
                    nokend_value              : Number(req.body.nokend_value),
                    nokend_sesuai             : Number(req.body.nokend_sesuai),
                    kartu_izin_value          : Number(req.body.kartu_izin_value),
                    kartu_izin_berlaku        : Number(req.body.kartu_izin_berlaku),
                    kartu_izin_sesuai         : Number(req.body.kartu_izin_sesuai),
                    kartu_uji_value           : Number(req.body.kartu_uji_value),
                    kartu_uji_tidak_berlaku   : Number(req.body.kartu_uji_tidak_berlaku),
                    kartu_uji_tidak_sesuai    : Number(req.body.kartu_uji_tidak_sesuai),
                    sim_a                     : Number(req.body.sim_a),
                    sim_b1                    : Number(req.body.sim_b1),
                    sim_b2                    : Number(req.body.sim_b2),
                    sim_tidak_sesuai          : Number(req.body.sim_tidak_sesuai),
                    lampu_utama_kendaraan_dekat         : Number(req.body.lampu_utama_kendaraan_dekat),
                    lampu_utama_kendaraan_dekat_kiri    : Number(req.body.lampu_utama_kendaraan_dekat_kiri),
                    lampu_utama_kendaraan_dekat_kanan   : Number(req.body.lampu_utama_kendaraan_dekat_kanan),
                    lampu_utama_kendaraan_jauh          : Number(req.body.lampu_utama_kendaraan_jauh),
                    lampu_utama_kendaraan_jauh_kiri     : Number(req.body.lampu_utama_kendaraan_jauh_kiri),
                    lampu_utama_kendaraan_jauh_kanan    : Number(req.body.lampu_utama_kendaraan_jauh_kanan),
                    lampu_petunjuk_arah_depan           : Number(req.body.lampu_petunjuk_arah_depan),
                    lampu_petunjuk_arah_depan_kiri      : Number(req.body.lampu_petunjuk_arah_depan_kiri),
                    lampu_petunjuk_arah_depan_kanan     : Number(req.body.lampu_petunjuk_arah_depan_kanan),
                    lampu_petunjuk_arah_belakang        : Number(req.body.lampu_petunjuk_arah_belakang),
                    lampu_petunjuk_arah_belakang_kiri   : Number(req.body.lampu_petunjuk_arah_belakang_kiri),
                    lampu_petunjuk_arah_belakang_kanan  : Number(req.body.lampu_petunjuk_arah_belakang_kanan),
                    lampu_rem                           : Number(req.body.lampu_rem),
                    lampu_rem_kiri          : Number(req.body.lampu_rem_kiri),
                    lampu_rem_kanan         : Number(req.body.lampu_rem_kanan),
                    lampu_mundur            : Number(req.body.lampu_mundur),
                    lampu_mundur_kiri       : Number(req.body.lampu_mundur_kiri),
                    lampu_mundur_kanan      : Number(req.body.lampu_mundur_kanan),
                    kondisi_rem_utama       : Number(req.body.kondisi_rem_utama),
                    kondisi_rem_parkir      : Number(req.body.kondisi_rem_parkir),
                    kondisi_kaca_depan      : Number(req.body.kondisi_kaca_depan),
                    kondisi_ban_depan       : Number(req.body.kondisi_ban_depan),
                    kondisi_ban_depan_kiri  : Number(req.body.kondisi_ban_depan_kiri),
                    kondisi_ban_depan_kanan : Number(req.body.kondisi_ban_depan_kanan),
                    kondisi_ban_belakang    : Number(req.body.kondisi_ban_belakang),
                    kondisi_ban_belakang_kiri           : Number(req.body.kondisi_ban_belakang_kiri),
                    kondisi_ban_belakang_kanan          : Number(req.body.kondisi_ban_belakang_kanan),
                    sabuk_keselamatan_pengemudi         : Number(req.body.sabuk_keselamatan_pengemudi),
                    plakat_dan_simbol                   : Number(req.body.plakat_dan_simbol),
                    dimensi_muatan                      : Number(req.body.dimensi_muatan),
                    pengukuran_kecepatan                : Number(req.body.pengukuran_kecepatan),
                    lampu_depan                         : Number(req.body.lampu_depan),
                    lampu_depan_kiri                    : Number(req.body.lampu_depan_kiri),
                    lampu_depan_kanan                   : Number(req.body.lampu_depan_kanan),
                    lampu_belakang                      : Number(req.body.lampu_belakang),
                    lampu_belakang_kiri                 : Number(req.body.lampu_belakang_kiri),
                    lampu_belakang_kanan                : Number(req.body.lampu_belakang_kanan),
                    kaca_spion                          : Number(req.body.kaca_spion),
                    kaca_spion_tidak_sesuai             : Number(req.body.kaca_spion_tidak_sesuai),
                    penghapus_kaca                      : Number(req.body.penghapus_kaca),
                    penghapus_kaca_tidak_sesuai         : Number(req.body.penghapus_kaca_tidak_sesuai),
                    klakson                     : Number(req.body.klakson),
                    klakson_tidak_sesuai        : Number(req.body.klakson_tidak_sesuai),
                    sabuk_keselamatan_pengemudi_teknis_penunjang                : Number(req.body.sabuk_keselamatan_pengemudi_teknis_penunjang),
                    sabuk_keselamatan_pengemudi_teknis_penunjang_tidak_laik     : Number(req.body.sabuk_keselamatan_pengemudi_teknis_penunjang_tidak_laik),
                    segitiga_pengaman           : Number(req.body.segitiga_pengaman),
                    dongkrak                    : Number(req.body.dongkrak),
                    pembuka_roda                : Number(req.body.pembuka_roda),
                    lampu_senter                : Number(req.body.lampu_senter),
                    lampu_senter_tidak_berfungsi        : Number(req.body.lampu_senter_tidak_berfungsi),
                    status_kesimpulan                   : Number(req.body.status_kesimpulan),
                    diijinkan_operasional               : Number(req.body.diijinkan_operasional),
                    peringatan_dan_perbaikan            : Number(req.body.peringatan_dan_perbaikan),
                    tilang_dan_dilarang_operasional     : Number(req.body.tilang_dan_dilarang_operasional),
                    dilarang_operasional                : Number(req.body.dilarang_operasional),
                    catatan                   : req.body.catatan ? req.body.catatan:'',
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                },
                {
                    where: { id: id }
                }
            ).then(async(num) => {
                if (num == 1) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        if (req.body.is_transaksi == 1) {
                            var data_req = req.body;
                            await syncToPostServer(req.token.id, 'put', `v2pv/detailramcek/update/${id}`, data_req).then(async (resp) => {
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
            t_detailramcek.update(
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
            t_detailramcek.destroy({
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
            t_detailramcek.destroy(
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
        create,
        sinkDetailRamcek,
        update,
        removeSoft,
        remove,
        truncate,
    };
}
module.exports = DetailRamcekController;