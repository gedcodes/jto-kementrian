const {
    t_transfermuat, t_regu, t_shift, t_lokasi, t_bptd, t_petugas, sequelize
} = require('../models');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const {
    getJenisKendaraanId,
    getSumbuId,
    genCodeTrxTransferMuat,
    getLokasiUppkbId,
    getBptdId,
} = require('./lib/dataid');

const {
    loginUser,
    syncToPostServer,
    updateStatusSyncToPusat
} = require('./lib/sinkronisasi');

const { update_status_transfer } = require('./lib/transfermuat');
const moment = require('moment');

const TransferMuatController = () => {

    const countAll = async () => {
        return t_transfermuat.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const lokasi_id = req.query.lokasi;
            const regu_id = req.query.regu;
            const shift_id = req.query.shift;
            const bptd_id = req.query.bptd;
            const petugas_id = req.query.petugas_id;
            const kode_trx = req.query.kode_trx;
            const kode_penindakan = req.query.kodepenindakan;
            const kode_uppkb = req.query.kuppkb;
            const kode_transfer_muat = req.query.kodetransfer;
            const no_kendaraan = req.query.nokendaraan;
            const tgl_transfer_muat = req.query.tgltransfermuat;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;
            const is_turun_muatan = req.query.is_turun_muatan;
            const no_kendaraan_lansiran = req.query.nokendlansir;

            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                    { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                ),
                { is_deleted: false }
            ];

            const count = await countAll();

            if (bptd_id) conditions = { ...conditions, bptd_id };
            if (lokasi_id) conditions = { ...conditions, lokasi_id };
            if (kode_uppkb) conditions = { ...conditions, kode_uppkb };
            if (regu_id) conditions = { ...conditions, regu_id };
            if (shift_id) conditions = { ...conditions, shift_id };
            if (petugas_id) conditions = { ...conditions, petugas_id };
            if (no_kendaraan) conditions = { ...conditions, no_kendaraan };
            if (kode_trx) conditions = { ...conditions, kode_trx };
            if (kode_penindakan) conditions = { ...conditions, kode_penindakan };
            if (kode_transfer_muat) conditions = { ...conditions, kode_transfer_muat };
            if (is_turun_muatan) conditions = { ...conditions, is_turun_muatan };
            if (no_kendaraan_lansiran) conditions = { ...conditions, no_kendaraan_lansiran };

            if (tgl_transfer_muat) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                        moment(tgl_transfer_muat).format('YYYY-MM-DD')
                    ),
                    conditions,
                ];
            }

            if (tgl_awal && tgl_akhir) {
                if (bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            bptd_id: bptd_id,
                            is_deleted: false,
                            is_active: true
                        }
                        // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                    ]
                }

                if (lokasi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
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
                            sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            kode_uppkb: kode_uppkb,
                            is_deleted: false,
                            is_active: true
                        }
                        // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                    ]
                }

                if (lokasi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
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
                            sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
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

                if (lokasi_id && regu_id && shift_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            lokasi_id: lokasi_id,
                            shift_id: shift_id,
                            regu_id: regu_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (kode_uppkb && regu_id && shift_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_transfermuat.tgl_transfer_muat')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            kode_uppkb: kode_uppkb,
                            shift_id: shift_id,
                            regu_id: regu_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }
            }

            console.log('CONDITIONS : ', conditions);

            const options = {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'transfermuat_regu',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_shift,
                        required: false,
                        as: 'transfermuat_shift',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_petugas,
                        required: false,
                        as: 'transfermuat_petugas',
                        attributes: [
                            'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'transfermuat_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'transfermuat_uppkb',
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

            const { docs, pages, total } = await t_transfermuat.paginate(options)

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

        } catch (error) {
            next(error)
        }
    }

    const findOne = async (req, res, next) => {
        console.log("--------------------::Processing Find One::--------------------");
        try {
            const id = req.params.id;
            t_transfermuat.findByPk(id, {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'transfermuat_regu',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_shift,
                        required: true,
                        as: 'transfermuat_shift',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_petugas,
                        required: false,
                        as: 'transfermuat_petugas',
                        attributes: [
                            'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'transfermuat_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'transfermuat_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                ],
                where: {
                    is_deleted: false
                },
                logging: false
            }).then(data => {
                res.status(200).json({
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
            const lokasi_id = req.query.lokasi;
            const regu_id = req.query.regu;
            const shift_id = req.query.shift;
            const bptd_id = req.query.bptd;
            const petugas_id = req.query.petugas_id;

            const kode_trx = req.query.kode_trx;
            const kode_penindakan = req.query.kodepenindakan;
            const kode_uppkb = req.query.kuppkb;
            const kode_transfer_muat = req.query.kodetransfer;

            const no_kendaraan = req.query.nokendaraan;
            const tgl_transfer_muat = req.query.tgltransfermuat;
            const is_turun_muatan = req.query.is_turun_muatan;

            const no_kendaraan_lansiran = req.query.nokendlansir;

            let conditions = { is_deleted: false };
            const count = await countAll();

            if (lokasi_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (shift_id) {
                conditions = {
                    shift_id: shift_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (regu_id) {
                conditions = {
                    regu_id: regu_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (petugas_id) {
                conditions = {
                    petugas_id: petugas_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_trx) {
                conditions = {
                    kode_trx: kode_trx,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_penindakan) {
                conditions = {
                    kode_penindakan: kode_penindakan,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_transfer_muat) {
                conditions = {
                    kode_transfer_muat: kode_transfer_muat,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (no_kendaraan) {
                conditions = {
                    no_kendaraan: no_kendaraan,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (no_kendaraan_lansiran) {
                conditions = {
                    no_kendaraan_lansiran: no_kendaraan_lansiran,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_penindakan) {
                conditions = {
                    kode_penindakan: kode_penindakan,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (is_turun_muatan) {
                conditions = {
                    is_turun_muatan: is_turun_muatan,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (tgl_transfer_muat) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('tgl_transfer_muat')),
                        tgl_transfer_muat
                    ),
                    { is_active: true, is_deleted: false }
                ]
            }


            if (kode_uppkb && shift_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    shift_id: shift_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_uppkb && regu_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    regu_id: regu_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_uppkb && petugas_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    petugas_id: petugas_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_uppkb && bptd_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    bptd_id: bptd_id,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (kode_uppkb && tgl_transfer_muat) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('tgl_transfer_muat')),
                        tgl_transfer_muat
                    ),
                    { kode_uppkb: kode_uppkb, is_active: true, is_deleted: false }
                ]
            }

            if (regu_id && shift_id && kode_uppkb) {
                conditions = {
                    regu_id: regu_id,
                    shift_id: shift_id,
                    kode_uppkb: kode_uppkb,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (regu_id && shift_id && bptd_id && kode_uppkb) {
                conditions = {
                    regu_id: regu_id,
                    shift_id: shift_id,
                    bptd_id: bptd_id,
                    kode_uppkb: kode_uppkb,
                    is_active: true,
                    is_deleted: false
                }
            }

            if (regu_id && shift_id && bptd_id && kode_uppkb && tgl_transfer_muat) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('tgl_transfer_muat')),
                        tgl_transfer_muat
                    ),
                    {
                        regu_id: regu_id,
                        shift_id: shift_id,
                        bptd_id: bptd_id,
                        kode_uppkb: kode_uppkb,
                        is_active: true,
                        is_deleted: false
                    }
                ]
            }

            console.log('CONDITIONS : ', conditions);

            const options = {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'transfermuat_regu',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_shift,
                        required: false,
                        as: 'transfermuat_shift',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_petugas,
                        required: false,
                        as: 'transfermuat_petugas',
                        attributes: [
                            'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'transfermuat_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'transfermuat_uppkb',
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
                logging: false,
            }

            const { docs, pages, total } = await t_transfermuat.paginate(options)
            // const propinsi = await t_transfermuat.findAll({
            //     where: {
            //         is_active: true
            //     }
            // });

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
        } catch (error) {
            next(error)
        }
    }

    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        var kode_transfer_muat = req.body.kode_transfer_muat ? req.body.kode_transfer_muat : await genCodeTrxTransferMuat(req.body.kode_uppkb, moment(req.body.tgl_transfer_muat).format('YYYY-MM-DD HH:mm:ss'), req.body.no_kendaraan);
        var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
        var bptd_id = await getBptdId(req.body.kode_uppkb);
        let jenis_kendaraan_id = await getJenisKendaraanId(req.body.jenis_kendaraan);
        let sumbu_id = await getSumbuId(req.body.sumbu);
        // console.log('JENIS KENDARAAN ID : ', jenis_kendaraan_id, ' SUMBU ID : ', sumbu_id);
        try {
            const field = {
                shift_id: req.body.shift_id,
                regu_id: req.body.regu_id,
                petugas_id: req.body.petugas_id,
                bptd_id: bptd_id,
                lokasi_id: lokasi_id, //generate
                jenis_kendaraan_id: req.body.jenis_kendaraan_id || jenis_kendaraan_id,
                jenis_kendaraan: req.body.jenis_kendaraan,
                sumbu_id: req.body.sumbu_id || sumbu_id,
                sumbu: req.body.sumbu,
                kode_transfer_muat: kode_transfer_muat,
                kode_uppkb: req.body.kode_uppkb,
                kode_trx: req.body.kode_trx,
                kode_penindakan: req.body.kode_penindakan,
                no_kendaraan: req.body.no_kendaraan,
                tgl_transfer_muat: moment(req.body.tgl_transfer_muat).format('YYYY-MM-DD HH:mm:ss'),
                no_uji: req.body.no_uji,
                jbi_uji: req.body.jbi_uji,
                masa_berlaku: moment(req.body.masa_berlaku).format('YYYY-MM-DD'),
                berat_timbang: req.body.berat_timbang,
                jbki: req.body.jbki,
                berat_lebih: req.body.berat_lebih,
                persen_lebih: req.body.persen_lebih,
                berat_timbang_ulang: req.body.berat_timbang_ulang || 0,
                berat_lebih_ulang: req.body.berat_lebih_ulang || 0,
                persen_lebih_ulang: req.body.persen_lebih_ulang || 0,
                is_turun_muatan: req.body.is_turun_muatan,
                no_kendaraan_lansiran: req.body.no_kendaraan_lansiran || '',
                no_uji_lansiran: req.body.no_uji_lansiran || '',
                jenis_kendaraan_lansiran_id: req.body.jenis_kendaraan_lansiran_id || null,
                jenis_kendaraan_lansiran: req.body.jenis_kendaraan_lansiran || '',
                sumbu_lansiran_id: req.body.sumbu_lansiran_id || null,
                sumbu_lansiran: req.body.sumbu_lansiran || '',
                masa_berlaku_lansiran: moment(req.body.masa_berlaku_lansiran).format('YYYY-MM-DD') | null,
                jbi_lansiran: req.body.jbi_lansiran || 0,
                berat_timbang_lansiran: req.body.berat_timbang_lansiran || 0,
                berat_lebih_lansiran: req.body.berat_lebih_lansiran || 0,
                persen_lebih_lansiran: req.body.persen_lebih_lansiran || 0,
                is_active: true,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            t_transfermuat.create(field, {
                logging: false
            }).then(async (data) => {
                const update_penimbangan = await update_status_transfer(req.body.kode_trx, req.body.no_kendaraan, req.body.kode_uppkb);
                if (update_penimbangan == 1) {
                    console.log('UPDATE STATUS TRANSFER BERHASIL');
                } else {
                    console.log('UPDATE STATUS TRANSFER GAGAL');
                }

                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    if (req.body.is_transaksi == 1) {
                        var data_req = req.body;
                        var data_sync = {
                            kode_transfer_muat: kode_transfer_muat,
                            ...data_req,
                        }

                        await syncToPostServer(req.token.id, 'post', 'v2pv/transfermuat/create', data_sync).then(async (resp) => {
                            if (resp.data.success) {
                                console.log('SINKRONISASI DATA BERHASIL');
                                await updateStatusSyncToPusat(data.id, 'jt_transfer_muat');
                            } else {
                                console.log('SINKRONISASI DATA GAGAL');
                            }
                        }).catch((error) => {
                            // console.log(error);
                            console.log('SINKRONISASI DATA GAGAL');
                        });
                    }
                }

                res.status(200).send({
                    success: true,
                    message: messageService().CREATE_SUCCESS,
                    data: [{
                        last_insert_id: data.id,
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

    const sinkTransferMuat = async (req, res, next) => {
        console.log("--------------------::Processing Sink Transfer Muat::--------------------");
        try {
            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                var data_req = req.body;
                await syncToPostServer(req.token.id, 'post', 'v2pv/transfermuat/create', data_req).then(async (resp) => {
                    if (resp.data.success) {
                        console.log('SINKRONISASI DATA BERHASIL');
                        var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_transfer_muat');
                        console.log('UPDATE STATUS : ', update_status);
                        if (update_status == 1) {
                            res.send({
                                success: true,
                                message: 'Sinkronisasi / Kirim Data Transfer Muat Berhasil'
                            });
                        } else {
                            res.send({
                                success: false,
                                message: 'Update Status Transfer Muat Gagal',
                            });
                        }

                    } else {
                        console.log('SINKRONISASI DATA GAGAL');
                        res.send({
                            success: false,
                            message: 'Sinkronisasi / Kirim Data Transfer Muat Gagal',
                        });
                    }
                }).catch((error) => {
                    // console.log(error);
                    console.log('SINKRONISASI DATA GAGAL');
                    res.send({
                        success: false,
                        message: `Sinkronisasi / Kirim Data Transfer Muat Gagal. ${error}`,
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
        var kode_transfer_muat = req.body.kode_transfer_muat ? req.body.kode_transfer_muat : await genCodeTrxTransferMuat(req.body.kode_uppkb, moment(req.body.tgl_transfer_muat).format('YYYY-MM-DD HH:mm:ss'));
        var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
        var bptd_id = await getBptdId(req.body.kode_uppkb);
        let jenis_kendaraan_id = await getJenisKendaraanId(req.body.jenis_kendaraan);
        let sumbu_id = await getSumbuId(req.body.sumbu);

        try {
            const id = req.params.id;
            const field = {
                shift_id: req.body.shift_id,
                regu_id: req.body.regu_id,
                petugas_id: req.body.petugas_id,
                bptd_id: bptd_id,
                lokasi_id: lokasi_id, //generate
                kode_transfer_muat: kode_transfer_muat,
                kode_uppkb: req.body.kode_uppkb,
                kode_trx: req.body.kode_trx,
                kode_penindakan: req.body.kode_penindakan,
                no_kendaraan: req.body.no_kendaraan,
                jenis_kendaraan_id: req.body.jenis_kendaraan_id || jenis_kendaraan_id,
                jenis_kendaraan: req.body.jenis_kendaraan,
                sumbu_id: req.body.sumbu_id || sumbu_id,
                sumbu: req.body.sumbu,
                tgl_transfer_muat: moment(req.body.tgl_transfer_muat).format('YYYY-MM-DD HH:mm:ss'),
                no_uji: req.body.no_uji,
                jbi_uji: req.body.jbi_uji,
                masa_berlaku: moment(req.body.masa_berlaku).format('YYYY-MM-DD'),
                berat_timbang: req.body.berat_timbang,
                jbki: req.body.jbki,
                berat_lebih: req.body.berat_lebih,
                persen_lebih: req.body.persen_lebih,
                berat_timbang_ulang: req.body.berat_timbang_ulang,
                berat_lebih_ulang: req.body.berat_lebih_ulang,
                persen_lebih_ulang: req.body.persen_lebih_ulang,
                is_turun_muatan: req.body.is_turun_muatan,
                no_kendaraan_lansiran: req.body.no_kendaraan_lansiran,
                no_uji_lansiran: req.body.no_uji_lansiran,
                jenis_kendaraan_lansiran_id: req.body.jenis_kendaraan_lansiran_id,
                jenis_kendaraan_lansiran: req.body.jenis_kendaraan_lansiran,
                sumbu_lansiran_id: req.body.sumbu_lansiran_id,
                sumbu_lansiran: req.body.sumbu_lansiran,
                masa_berlaku_lansiran: moment(req.body.masa_berlaku_lansiran).format('YYYY-MM-DD'),
                jbi_lansiran: req.body.jbi_lansiran,
                berat_timbang_lansiran: req.body.berat_timbang_lansiran,
                berat_lebih_lansiran: req.body.berat_lebih_lansiran,
                persen_lebih_lansiran: req.body.persen_lebih_lansiran,
                is_active: true,
                updated_by: req.token.id,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            t_transfermuat.update(field,
                {
                    where: { id: id }
                }
            ).then(async (num) => {
                if (num == 1) {
                    const update_penimbangan = await update_status_transfer(req.body.kode_trx, req.body.no_kendaraan, req.body.kode_uppkb);
                    if (update_penimbangan == 1) {
                        console.log('UPDATE STATUS TRANSFER BERHASIL');
                    } else {
                        console.log('UPDATE STATUS TRANSFER GAGAL');
                    }

                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        if (req.body.is_transaksi == 1) {
                            var data_req = req.body;

                            await syncToPostServer(req.token.id, 'put', `v2pv/transfermuat/update/${id}`, data_req).then(async (resp) => {
                                if (resp.data.success) {
                                    console.log('SINKRONISASI DATA BERHASIL');
                                    await updateStatusSyncToPusat(data.id, 'jt_transfer_muat');
                                } else {
                                    console.log('SINKRONISASI DATA GAGAL');
                                }
                            }).catch((error) => {
                                // console.log(error);
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

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_transfermuat.update(
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
                    res.status(200).send({
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

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");
        //console.log(req.token.id);

        const id = req.params.id;
        try {
            t_transfermuat.update(
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
            t_transfermuat.destroy({
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

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_transfermuat.update(
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

    const removeArr = async (req, res, next) => {
        console.log("--------------------::Processing Delete All::--------------------");
        var q = req.query.arrId;
        var resSplit = q.split(",").map(i => Number(i));
        try {
            t_transfermuat.destroy({
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_transfermuat.destroy(
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
        findOne,
        findAllActive,
        create,
        sinkTransferMuat,
        update,
        updateStatus,
        removeSoft,
        remove,
        removeArrSoft,
        removeArr,
        truncate,
    };
}
module.exports = TransferMuatController;