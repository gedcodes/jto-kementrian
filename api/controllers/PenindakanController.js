const {
    t_penindakan, t_detailpenindakan_sanksi, t_detailpenindakan_pasal, t_detailpenindakan_sitaan,
    t_sitaan, t_dokumen, t_sub_sanksi, t_sanksi, t_pasal, t_gol_sim, t_pelanggaran, t_jenis_pelanggaran,
    t_regu, t_shift, t_bptd, t_petugas, t_lokasi, t_kota_kab, t_pengadilan, t_kejaksaan, t_kendaraan, etilang, t_integrasi, sequelize
} = require('../models');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const {
    genCodeTrxPenindakan,
    getLokasiUppkbId,
    getBptdId,
    getKejaksaanKode,
    getPengadilanKode,
    getLokasiUppkbNama,
    getKendaraan,
    getWilayahLokasiUppkbById,
    getDokumenKode,
    getDokumenKodeSitaan,
    getEtilangId,
    getIsIntegrasiEtilang,
    getNamaBank
} = require('./lib/dataid');
const {
    loginUser,
    syncToPostServer,
    updateStatusSyncToPusat,
    syncBaTilangPusat
} = require('./lib/sinkronisasi');
const { upsert_detail_pasal, upsert_detail_sanksi, upsert_detail_sitaan, updateTindakanPenimbangan, updatePenindakanBrivaTicket, upsert_etilang, updatePenindakanEtilang, getIsExistsKodePenindakan, getIsNoKendaraanPenindakan } = require('./lib/penindakan');
const moment = require('moment');
const configPath = require('../../config/config');
const fs = require('fs');
const path = require("path");
var axios = require('axios');

const PenindakanController = () => {

    const countAll = async () => {
        return t_penindakan.count({
            where: {
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const regu_id = req.query.regu;
            const shift_id = req.query.shift;
            const bptd_id = req.query.bptd;
            const petugas_id = req.query.petugas_id;
            const notrx = req.query.notrx;
            const kode_penindakan = req.query.kodepenindakan;
            const kode_uppkb = req.query.kuppkb;
            const no_kendaraan = req.query.nokendaraan;
            const tgl_penindakan = req.query.tglpenindakan;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;
            const tgl_sidang = req.query.tglsidang;
            const lokasi_id = req.query.lokasi;
            const sanksi_id = req.query.sanksi;

            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                    { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                ),
                { is_deleted: false }
            ];
            const count = await countAll();
            if (notrx) {
                conditions = {
                    kode_trx: notrx,
                    is_deleted: false
                }
            }

            if (lokasi_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    is_deleted: false
                }
            }

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    is_deleted: false
                }
            }

            if (no_kendaraan) {
                conditions = {
                    no_kendaraan: no_kendaraan,
                    is_deleted: false
                }
            }

            if (sanksi_id) {
                conditions = {
                    sanksi_id: sanksi_id,
                    is_deleted: false
                }
            }

            if (kode_penindakan) {
                conditions = {
                    kode_penindakan: kode_penindakan,
                    is_deleted: false
                }
            }

            if (tgl_sidang) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('tgl_sidang')),
                        tgl_sidang
                    ),
                    { is_deleted: false }
                ]
            }

            if (tgl_penindakan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        tgl_penindakan
                    ),
                    { is_deleted: false }
                ]
            }

            if (kode_uppkb && shift_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    shift_id: shift_id,
                    is_deleted: false
                }
            }

            if (kode_uppkb && regu_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    regu_id: regu_id,
                    is_deleted: false
                }
            }

            if (kode_uppkb && petugas_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    petugas_id: petugas_id,
                    is_deleted: false
                }
            }

            if (kode_uppkb && bptd_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    bptd_id: bptd_id,
                    is_deleted: false
                }
            }

            if (kode_uppkb && tgl_sidang) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('tgl_sidang')),
                        tgl_sidang
                    ),
                    { kode_uppkb: kode_uppkb, is_deleted: false }
                ]
            }

            if (kode_uppkb && tgl_penindakan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        tgl_penindakan
                    ),
                    { kode_uppkb: kode_uppkb, is_deleted: false }
                ]
            }

            if (kode_uppkb && sanksi_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    sanksi_id: sanksi_id,
                    is_deleted: false
                }
            }

            if (bptd_id && tgl_penindakan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        tgl_penindakan
                    ),
                    { bptd_id: bptd_id, is_deleted: false }
                ]
            }

            if (lokasi_id && tgl_penindakan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        tgl_penindakan
                    ),
                    { lokasi_id: lokasi_id, is_deleted: false }
                ]
            }

            if (tgl_penindakan && kode_uppkb && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    { kode_uppkb: kode_uppkb, sanksi_id: sanksi_id, is_deleted: false }
                ]
            }

            if (bptd_id && lokasi_id && tgl_penindakan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    { bptd_id: bptd_id, lokasi_id: lokasi_id, is_deleted: false }
                ]
            }

            if (tgl_penindakan && kode_uppkb && shift_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        sanksi_id: sanksi_id,
                        shift_id: shift_id,
                        is_deleted: false
                    }
                ]
            }

            if (tgl_penindakan && kode_uppkb && regu_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        sanksi_id: sanksi_id,
                        regu_id: regu_id,
                        is_deleted: false
                    }
                ]
            }

            if (tgl_penindakan && lokasi_id && regu_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        lokasi_id: lokasi_id,
                        sanksi_id: sanksi_id,
                        regu_id: regu_id,
                        is_deleted: false
                    }
                ]
            }

            if (tgl_penindakan && bptd_id && lokasi_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        bptd_id: bptd_id,
                        lokasi_id: lokasi_id,
                        sanksi_id: sanksi_id,
                        is_deleted: false
                    }
                ]
            }

            if (tgl_penindakan && kode_uppkb && regu_id && shift_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        shift_id: shift_id,
                        sanksi_id: sanksi_id,
                        regu_id: regu_id,
                        is_deleted: false
                    }
                ]
            }

            if (tgl_penindakan && lokasi_id && regu_id && shift_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        lokasi_id: lokasi_id,
                        shift_id: shift_id,
                        sanksi_id: sanksi_id,
                        regu_id: regu_id,
                        is_deleted: false
                    }
                ]
            }

            if (tgl_penindakan && lokasi_id && regu_id && shift_id && sanksi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        lokasi_id: lokasi_id,
                        shift_id: shift_id,
                        sanksi_id: sanksi_id,
                        bptd_id: bptd_id,
                        regu_id: regu_id,
                        is_deleted: false
                    }
                ]
            }

            /* ***********************************************TGL AWAL TGL AKHIR***************************************************************** */
            if (tgl_awal && tgl_akhir) {
                if (lokasi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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

                if (bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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

                if (lokasi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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

                if (bptd_id && sanksi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            sanksi_id: sanksi_id,
                            bptd_id: bptd_id,
                            is_deleted: false,
                            is_active: true
                        }
                        // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                    ]
                }


                if (bptd_id && lokasi_id && sanksi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            bptd_id: bptd_id,
                            lokasi_id: lokasi_id,
                            sanksi_id: sanksi_id,
                            is_deleted: false
                        }
                    ]
                }

                if (lokasi_id && regu_id && shift_id && sanksi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            lokasi_id: lokasi_id,
                            shift_id: shift_id,
                            sanksi_id: sanksi_id,
                            bptd_id: bptd_id,
                            regu_id: regu_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (kode_uppkb && regu_id && shift_id && sanksi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            kode_uppkb: kode_uppkb,
                            shift_id: shift_id,
                            sanksi_id: sanksi_id,
                            bptd_id: bptd_id,
                            regu_id: regu_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }
            }

            if (name) {
                conditions.push({
                    no_kendaraan: {
                        [Op.iLike]: `%${name}%`
                    }
                });
            }
            /* **************************************************************************************************************** */

            console.log('CONDITIONS : ', conditions);

            const options = {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'penindakan_regu',
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
                        as: 'penindakan_shift',
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
                        as: 'penindakan_petugas',
                        attributes: [
                            'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kota_kab,
                        required: false,
                        as: 'penindakanAsalKota',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kota_kab,
                        required: false,
                        as: 'penindakanTujuanKota',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'penindakan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_pengadilan,
                        required: false,
                        as: 'penindakanPengadilan',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat', 'lat_pos', 'lon_pos'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kejaksaan,
                        required: false,
                        as: 'penindakanKejaksaan',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_gol_sim,
                        required: false,
                        as: 'penindakanGolSim',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_sanksi,
                        required: false,
                        as: 'penindakanSanksiMelanggar',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false
                        },
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'penindakan_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_detailpenindakan_sanksi,
                        required: false,
                        as: 'penindakanDetailSanksi',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sub_sanksi_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_sub_sanksi,
                                required: false,
                                as: 'detailtindakansanksi',
                                attributes: [
                                    'id', 'kode', 'nama', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_sanksi,
                                        required: false,
                                        as: 'fksubsanksi',
                                        attributes: [
                                            'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        model: t_detailpenindakan_pasal,
                        required: false,
                        as: 'penindakanDetailPasal',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'pasal_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_pasal,
                                required: false,
                                as: 'fkdetailtindakanpasal',
                                attributes: [
                                    'id', 'no_pasal', 'pasal', 'desk_pasal', 'denda_maks', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ]
                    },
                    {
                        model: t_detailpenindakan_sitaan,
                        required: false,
                        as: 'penindakanDetailSitaan',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sitaan_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_sitaan,
                                required: false,
                                as: 'detailtindakansitaan',
                                attributes: [
                                    'id', 'sanksi_id', 'dokumen_id', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    // {
                                    //     model: t_sanksi,
                                    //     required: false,
                                    //     as: 'fksitaansanksi',
                                    //     attributes: [
                                    //         'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                    //     ],
                                    //     where: {
                                    //         is_deleted: false,
                                    //         is_active: true
                                    //     }
                                    // },
                                    {
                                        model: t_dokumen,
                                        required: false,
                                        as: 'fksitaandokumen',
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        model: t_pelanggaran,
                        required: false,
                        as: 'penindakanPelanggaran',
                        attributes: [
                            'id', 'kode_trx', 'kode_uppkb', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_jenis_pelanggaran,
                                required: false,
                                as: 'jenisPelanggaran',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ]
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

            const { docs, pages, total } = await t_penindakan.paginate(options)

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
            t_penindakan.findByPk(id, {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'penindakan_regu',
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
                        as: 'penindakan_shift',
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
                        as: 'penindakan_petugas',
                        attributes: [
                            'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kota_kab,
                        required: false,
                        as: 'penindakanAsalKota',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kota_kab,
                        required: false,
                        as: 'penindakanTujuanKota',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_pengadilan,
                        required: false,
                        as: 'penindakanPengadilan',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat', 'lat_pos', 'lon_pos'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kejaksaan,
                        required: false,
                        as: 'penindakanKejaksaan',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_gol_sim,
                        required: false,
                        as: 'penindakanGolSim',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_sanksi,
                        required: false,
                        as: 'penindakanSanksiMelanggar',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false
                        },
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'penindakan_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'penindakan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_detailpenindakan_sanksi,
                        required: false,
                        as: 'penindakanDetailSanksi',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sub_sanksi_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_sub_sanksi,
                                required: false,
                                as: 'detailtindakansanksi',
                                attributes: [
                                    'id', 'kode', 'nama', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_sanksi,
                                        required: false,
                                        as: 'fksubsanksi',
                                        attributes: [
                                            'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        model: t_detailpenindakan_pasal,
                        required: false,
                        as: 'penindakanDetailPasal',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'pasal_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_pasal,
                                required: false,
                                as: 'fkdetailtindakanpasal',
                                attributes: [
                                    'id', 'no_pasal', 'pasal', 'desk_pasal', 'denda_maks', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ]
                    },
                    {
                        model: t_detailpenindakan_sitaan,
                        required: false,
                        as: 'penindakanDetailSitaan',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sitaan_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_sitaan,
                                required: false,
                                as: 'detailtindakansitaan',
                                attributes: [
                                    'id', 'sanksi_id', 'dokumen_id', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_sanksi,
                                        required: false,
                                        as: 'fksitaansanksi',
                                        attributes: [
                                            'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    },
                                    {
                                        model: t_dokumen,
                                        required: false,
                                        as: 'fksitaandokumen',
                                        attributes: [
                                            'kode', 'nama', 'is_optional'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        model: t_pelanggaran,
                        required: false,
                        as: 'penindakanPelanggaran',
                        attributes: [
                            'id', 'kode_trx', 'kode_uppkb', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_jenis_pelanggaran,
                                required: false,
                                as: 'jenisPelanggaran',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ]
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
            const id = req.query.id;
            const regu_id = req.query.regu;
            const shift_id = req.query.shift;
            const bptd_id = req.query.bptd;
            const petugas_id = req.query.petugas_id;
            const notrx = req.query.notrx;
            const kode_penindakan = req.query.kodepenindakan;
            const kode_uppkb = req.query.kuppkb;
            const no_kendaraan = req.query.nokendaraan;
            const tgl_penindakan = req.query.tglpenindakan;
            const tgl_awal = req.query.tgl_awal;
            const tgl_akhir = req.query.tgl_akhir;
            const tgl_sidang = req.query.tglsidang;
            const lokasi_id = req.query.lokasi;
            const sanksi_id = req.query.sanksi;

            let conditions = { is_active: true, is_deleted: false };
            const count = await countAll();

            if (id) {
                conditions = {
                    id: id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (notrx) {
                conditions = {
                    kode_trx: notrx,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (lokasi_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (kode_uppkb) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (no_kendaraan) {
                conditions = {
                    no_kendaraan: no_kendaraan,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (sanksi_id) {
                conditions = {
                    sanksi_id: sanksi_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (kode_penindakan) {
                conditions = {
                    kode_penindakan: kode_penindakan,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (tgl_sidang) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('tgl_sidang')),
                        tgl_sidang
                    ),
                    {
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penindakan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        tgl_penindakan
                    ),
                    {
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (kode_uppkb && bptd_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    bptd_id: bptd_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (lokasi_id && bptd_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    bptd_id: bptd_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (kode_uppkb && shift_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    shift_id: shift_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (lokasi_id && shift_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    shift_id: shift_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (kode_uppkb && regu_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    regu_id: regu_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (lokasi_id && regu_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    regu_id: regu_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (kode_uppkb && petugas_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    petugas_id: petugas_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (lokasi_id && petugas_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    petugas_id: petugas_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (kode_uppkb && tgl_sidang) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('tgl_sidang')),
                        tgl_sidang
                    ),
                    { kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
                ]
            }

            if (kode_uppkb && tgl_penindakan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        tgl_penindakan
                    ),
                    { kode_uppkb: kode_uppkb, is_deleted: false, is_active: true }
                ]
            }

            if (kode_uppkb && sanksi_id) {
                conditions = {
                    kode_uppkb: kode_uppkb,
                    sanksi_id: sanksi_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (lokasi_id && tgl_sidang) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('tgl_sidang')),
                        tgl_sidang
                    ),
                    { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (lokasi_id && tgl_penindakan) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        tgl_penindakan
                    ),
                    { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                ]
            }

            if (lokasi_id && sanksi_id) {
                conditions = {
                    lokasi_id: lokasi_id,
                    sanksi_id: sanksi_id,
                    is_deleted: false,
                    is_active: true
                }
            }

            if (tgl_penindakan && kode_uppkb && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    { kode_uppkb: kode_uppkb, sanksi_id: sanksi_id, is_deleted: false, is_active: true }
                ]
            }

            if (tgl_penindakan && kode_uppkb && shift_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        sanksi_id: sanksi_id,
                        shift_id: shift_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penindakan && kode_uppkb && regu_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        sanksi_id: sanksi_id,
                        regu_id: regu_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penindakan && kode_uppkb && regu_id && shift_id && sanksi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        kode_uppkb: kode_uppkb,
                        shift_id: shift_id,
                        sanksi_id: sanksi_id,
                        regu_id: regu_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penindakan && lokasi_id && sanksi_id) {
                console.log('TGL PENINDAKAN : ', tgl_penindakan);
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    { lokasi_id: lokasi_id, sanksi_id: sanksi_id, is_deleted: false, is_active: true }
                ]
            }

            if (tgl_penindakan && lokasi_id && shift_id && sanksi_id) {

                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        lokasi_id: lokasi_id,
                        sanksi_id: sanksi_id,
                        shift_id: shift_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penindakan && lokasi_id && regu_id && sanksi_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        lokasi_id: lokasi_id,
                        sanksi_id: sanksi_id,
                        regu_id: regu_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            if (tgl_penindakan && lokasi_id && regu_id && shift_id && sanksi_id && bptd_id) {
                conditions = [
                    sequelize.where(
                        sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                        moment(tgl_penindakan).format('YYYY-MM-DD')
                    ),
                    {
                        lokasi_id: lokasi_id,
                        shift_id: shift_id,
                        sanksi_id: sanksi_id,
                        regu_id: regu_id,
                        bptd_id: bptd_id,
                        is_deleted: false,
                        is_active: true
                    }
                ]
            }

            /* ***********************************************TGL AWAL TGL AKHIR***************************************************************** */
            if (tgl_awal && tgl_akhir) {
                if (lokasi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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

                if (bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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

                if (sanksi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            sanksi_id: sanksi_id,
                            is_deleted: false,
                            is_active: true
                        }
                        // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                    ]
                }

                if (lokasi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
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

                if (bptd_id && sanksi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            sanksi_id: sanksi_id,
                            bptd_id: bptd_id,
                            is_deleted: false,
                            is_active: true
                        }
                        // { lokasi_id: lokasi_id, is_deleted: false, is_active: true }
                    ]
                }


                if (bptd_id && lokasi_id && sanksi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            bptd_id: bptd_id,
                            lokasi_id: lokasi_id,
                            sanksi_id: sanksi_id,
                            is_deleted: false
                        }
                    ]
                }

                if (lokasi_id && regu_id && shift_id && sanksi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            lokasi_id: lokasi_id,
                            shift_id: shift_id,
                            sanksi_id: sanksi_id,
                            bptd_id: bptd_id,
                            regu_id: regu_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }

                if (kode_uppkb && regu_id && shift_id && sanksi_id && bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('t_penindakan.tgl_penindakan')),
                            { [Op.between]: [moment(tgl_awal).format('YYYY-MM-DD'), moment(tgl_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            kode_uppkb: kode_uppkb,
                            shift_id: shift_id,
                            sanksi_id: sanksi_id,
                            bptd_id: bptd_id,
                            regu_id: regu_id,
                            is_deleted: false,
                            is_active: true
                        }
                    ]
                }
            }
            /* **************************************************************************************************************** */

            console.log('CONDITIONS : ', conditions);

            const options = {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'penindakan_regu',
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
                        as: 'penindakan_shift',
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
                        as: 'penindakan_petugas',
                        attributes: [
                            'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kota_kab,
                        required: false,
                        as: 'penindakanAsalKota',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kota_kab,
                        required: false,
                        as: 'penindakanTujuanKota',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_pengadilan,
                        required: false,
                        as: 'penindakanPengadilan',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat', 'lat_pos', 'lon_pos'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_kejaksaan,
                        required: false,
                        as: 'penindakanKejaksaan',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_gol_sim,
                        required: false,
                        as: 'penindakanGolSim',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_sanksi,
                        required: false,
                        as: 'penindakanSanksiMelanggar',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'penindakan_uppkb',
                        attributes: [
                            'id', 'kode', 'nama', 'alamat_uppkb'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'penindakan_bptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_detailpenindakan_sanksi,
                        required: false,
                        as: 'penindakanDetailSanksi',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sub_sanksi_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_sub_sanksi,
                                required: false,
                                as: 'detailtindakansanksi',
                                attributes: [
                                    'id', 'kode', 'nama', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_sanksi,
                                        required: false,
                                        as: 'fksubsanksi',
                                        attributes: [
                                            'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        model: t_detailpenindakan_pasal,
                        required: false,
                        as: 'penindakanDetailPasal',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'pasal_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_pasal,
                                required: false,
                                as: 'fkdetailtindakanpasal',
                                attributes: [
                                    'id', 'no_pasal', 'pasal', 'desk_pasal', 'denda_maks', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            }
                        ]
                    },
                    {
                        model: t_detailpenindakan_sitaan,
                        required: false,
                        as: 'penindakanDetailSitaan',
                        attributes: [
                            'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sitaan_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_sitaan,
                                required: false,
                                as: 'detailtindakansitaan',
                                attributes: [
                                    'id', 'sanksi_id', 'dokumen_id', 'keterangan'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_sanksi,
                                        required: false,
                                        as: 'fksitaansanksi',
                                        attributes: [
                                            'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    },
                                    {
                                        model: t_dokumen,
                                        required: false,
                                        as: 'fksitaandokumen',
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        model: t_pelanggaran,
                        required: false,
                        as: 'penindakanPelanggaran',
                        attributes: [
                            'id', 'kode_trx', 'kode_uppkb', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                        ],
                        where: {
                            is_deleted: false
                        },
                        include: [
                            {
                                model: t_jenis_pelanggaran,
                                required: false,
                                as: 'jenisPelanggaran',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ]
                    },
                ],
                page: req.query.page || 1,
                paginate: req.query.paginate || count,
                order: [
                    [
                        req.query.orderBy || 'tgl_penindakan',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
            }

            const { docs, pages, total } = await t_penindakan.paginate(options)
            // const propinsi = await t_penindakan.findAll({
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

    const syncetilang = async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const q = await t_integrasi.findOne(
                    {
                        where: {
                            kode: 'ETILANG',
                            is_active: true,
                            is_deleted: false
                        },
                        logging: false
                    }
                )

                var apiurl = q.api_url.replace(/[\r\n]/g, "");

                var endpoint = `${apiurl}${path}`;
                var config = {
                    method: 'post',
                    url: `${apiurl}/external/tickets/v2`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data
                };
                // console.log(config);
                axios.defaults.headers.common = {
                    'E-Tilang-APIKey': `${q.api_auth_token}`,
                };

                axios(config).then(function (response) {
                    // console.log('RESPONSE E-TILANG : ', response);
                    if (response.data) {
                        if (response.data.statusCode == 200 || response.data.statusCode == 201) {
                            // console.log(response.data)
                            resolve(response.data);
                        } else {
                            console.log('ERROR RESPONSE');
                            reject(0);
                        }
                    } else {
                        console.log('ERROR URL DATA');
                        reject(0);
                    }
                    // console.log(JSON.stringify(response.data));
                }).catch(function (error) {
                    console.log('ERROR REQUEST : ', error);
                    reject(0);
                });
            } catch (error) {
                console.log('ERROR : ', error);
                reject(0);
            }

        });
    }

    const downloadBATilang = async (req, res, next) => {
        // return new Promise( async (resolve, reject) => {
        try {
            var ticketId = req.query.ticketId;
            var typeNum = req.query.typeNum;

            if (process.env.IS_KEMENHUB == 0 && process.env.INTEGRASI_ETILANG == 1) {
                var sync_ba_tilang = await syncBaTilangPusat(ticketId, typeNum);
                console.log('UPDATE STATUS : ', sync_ba_tilang);
                if (sync_ba_tilang) {
                    if (sync_ba_tilang.success) {
                        const dataT = sync_ba_tilang.data;
                        res.send({
                            success: true,
                            message: 'Sinkronisasi BA Tilang Berhasil',
                            filename: dataT.filename,
                            download: dataT.reportUrl
                        });
                    } else {
                        res.send({
                            success: false,
                            message: 'Sinkrinisasi BA Tilang Gagal',
                            download: ''
                        });
                    }
                } else {
                    res.send({
                        success: false,
                        message: 'Sinkrinisasi BA Tilang Gagal',
                        download: ''
                    });
                }
            }

            if (process.env.INTEGRASI_ETILANG == 1 && process.env.IS_KEMENHUB == 1) {

                const q = await t_integrasi.findOne(
                    {
                        where: {
                            kode: 'ETILANG',
                            is_active: true,
                            is_deleted: false
                        },
                        logging: false
                    }
                )

                var apiurl = q.api_url.replace(/[\r\n]/g, "");

                var config = {
                    method: 'get',
                    url: `${apiurl}/external/tickets/${ticketId}/download-pdf/${typeNum}`,
                    responseType: 'arraybuffer', // important
                    // headers: { 
                    //     'Content-Type': 'application/json'
                    // },
                };
                // console.log(config);
                axios.defaults.headers.common = {
                    'E-Tilang-APIKey': `${q.api_auth_token}`,
                };

                axios(config).then(function (response) {
                    const filename = `batilang_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ticketId}_${typeNum}.pdf`;
                    const uploadPath = path.join(configPath.path_report) + '/pdf/' + filename;
                    const reportUrl = configPath.report_url + 'pdf/' + filename;
                    fs.writeFile(uploadPath, response.data, (err) => {
                        if (err) {
                            res.send({
                                success: false,
                                message: 'Create PDF Gagal.',
                                download: ''
                            });
                        } else {
                            res.send({
                                success: true,
                                message: 'Create PDF Berhasil.',
                                filename: filename,
                                download: reportUrl
                            });
                        }
                    });
                    // console.log(JSON.stringify(response.data));
                }).catch(function (error) {
                    console.log('ERROR REQUEST : ', error);
                    res.send({
                        success: false,
                        message: 'Error Request.',
                        download: ''
                    });
                });
            }
        } catch (error) {
            console.log('ERROR : ', error);
            // reject(0);
            next(error);
        }

        // });
    }

    const datapenindakan = async (conditions) => {
        const options = {
            include: [
                {
                    model: t_regu,
                    required: false,
                    as: 'penindakan_regu',
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
                    as: 'penindakan_shift',
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
                    as: 'penindakan_petugas',
                    attributes: [
                        'id', 'nip', 'nama', 'pangkat', 'jabatan', 'no_skep', 'tgl_skep', 'tahun_skep', 'no_telp', 'no_reg_penguji'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kota_kab,
                    required: false,
                    as: 'penindakanAsalKota',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kota_kab,
                    required: false,
                    as: 'penindakanTujuanKota',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_bptd,
                    required: false,
                    as: 'penindakan_bptd',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_pengadilan,
                    required: false,
                    as: 'penindakanPengadilan',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat', 'lat_pos', 'lon_pos'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kejaksaan,
                    required: false,
                    as: 'penindakanKejaksaan',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_gol_sim,
                    required: false,
                    as: 'penindakanGolSim',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_sanksi,
                    required: false,
                    as: 'penindakanSanksiMelanggar',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    },
                },
                {
                    model: t_lokasi,
                    required: false,
                    as: 'penindakan_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_kendaraan,
                    required: false,
                    as: 'penindakan_kendaraan',
                    attributes: [
                        'no_uji', 'tanggal_uji', 'masa_berlaku_uji', 'nama_pemilik', 'alamat_pemilik', 'konfigurasi_sumbu', 'jbi', 'foto_depan_url', 'foto_belakang_url', 'foto_kanan_url', 'foto_kiri_url'
                    ],
                    where: {
                        is_deleted: false
                    },
                },
                {
                    model: t_detailpenindakan_sanksi,
                    required: false,
                    as: 'penindakanDetailSanksi',
                    attributes: [
                        'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sub_sanksi_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_sub_sanksi,
                            required: false,
                            as: 'detailtindakansanksi',
                            attributes: [
                                'id', 'kode', 'nama', 'keterangan'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
                            include: [
                                {
                                    model: t_sanksi,
                                    required: false,
                                    as: 'fksubsanksi',
                                    attributes: [
                                        'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                    ],
                                    where: {
                                        is_deleted: false,
                                        is_active: true
                                    }
                                }
                            ],
                        },
                    ],
                },
                {
                    model: t_detailpenindakan_pasal,
                    required: false,
                    as: 'penindakanDetailPasal',
                    attributes: [
                        'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'pasal_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_pasal,
                            required: false,
                            as: 'fkdetailtindakanpasal',
                            attributes: [
                                'id', 'no_pasal', 'pasal', 'desk_pasal', 'denda_maks', 'keterangan'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
                        }
                    ]
                },
                {
                    model: t_detailpenindakan_sitaan,
                    required: false,
                    as: 'penindakanDetailSitaan',
                    attributes: [
                        'id', 'kode_penindakan', 'no_kendaraan', 'kode_trx', 'kode_uppkb', 'lokasi_id', 'sitaan_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_sitaan,
                            required: false,
                            as: 'detailtindakansitaan',
                            attributes: [
                                'id', 'sanksi_id', 'dokumen_id', 'keterangan'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
                            include: [
                                // {
                                //     model: t_sanksi,
                                //     required: false,
                                //     as: 'fksitaansanksi',
                                //     attributes: [
                                //         'id', 'kode', 'nama', 'deskripsi', 'keterangan'
                                //     ],
                                //     where: {
                                //         is_deleted: false,
                                //         is_active: true
                                //     }
                                // },
                                {
                                    model: t_dokumen,
                                    required: false,
                                    as: 'fksitaandokumen',
                                    where: {
                                        is_deleted: false,
                                        is_active: true
                                    }
                                }
                            ],
                        },
                    ],
                },
                {
                    model: t_pelanggaran,
                    required: false,
                    as: 'penindakanPelanggaran',
                    attributes: [
                        'id', 'kode_trx', 'kode_uppkb', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                    ],
                    where: {
                        is_deleted: false
                    },
                    include: [
                        {
                            model: t_jenis_pelanggaran,
                            required: false,
                            as: 'jenisPelanggaran',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            }
                        }
                    ]
                },
            ],
            where: conditions,
            logging: false
        }

        const penindakan = await t_penindakan.findAll(options);

        return penindakan;
    }

    const printPenindakan = async (req, res, next) => {
        if (req.query.id) {
            var ispdf = req.query.ispdf;
            var conditions = {
                id: req.query.id,
                is_active: true,
                is_deleted: false
            };

            var penindakan = await datapenindakan(conditions);

            var arrpasal = [];

            if (penindakan[0].penindakanDetailPasal != undefined) {
                penindakan[0].penindakanDetailPasal.map((val) => {
                    arrpasal.push(val.fkdetailtindakanpasal.pasal);
                });
            }

            var days = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUM'AT", "SABTU"];

            var now = new Date(penindakan[0].tgl_penindakan);

            var day = days[now.getDay()];
            var sim = penindakan[0].penindakanGolSim ? penindakan[0].penindakanGolSim.nama : '';

            var desk_sim = '';
            var gol_sim = '';
            if (sim != 'KTP' || sim != 'KTA') {
                var arr_sim = sim.split(" ");
                console.log(arr_sim);
                if (arr_sim.length > 0) {
                    if (arr_sim.length > 2) {
                        if (arr_sim[2].toUpperCase() == 'UMUM') {
                            desk_sim = 'UMUM';
                        } else {
                            desk_sim = 'TIDAK UMUM';
                        }
                    } else {
                        desk_sim = 'TIDAK UMUM';
                    }

                    gol_sim = arr_sim[1];
                }
            }

            var daySidang = new Date(penindakan[0].tgl_sidang);

            var daySd = days[daySidang.getDay()];

            console.log(gol_sim, desk_sim);

            var data = {
                kode_uppkb: penindakan[0].kode_uppkb,
                nama_uppkb: `SATPEL ${penindakan[0].penindakan_uppkb.nama}`,
                alamat_uppkb: penindakan[0].penindakan_uppkb.alamat_uppkb,
                nama_bptd: penindakan[0].penindakan_bptd.nama,
                tanggal: moment(penindakan[0].tgl_penimbangan).format('DD-MM-YYYY'),
                jam: moment(penindakan[0].tgl_penimbangan).format('HH:mm:ss'),
                tanggalPenindakan: moment(penindakan[0].tgl_penindakan).format('DD-MM-YYYY'),
                jamPenindakan: moment(penindakan[0].tgl_penindakan).format('HH:mm:ss'),
                hari: day,
                no_kendaraan: penindakan[0].no_kendaraan,
                kode_trx: penindakan[0].kode_trx,
                no_uji: penindakan[0].penindakan_kendaraan.no_uji,
                nama_pengemudi: penindakan[0].nama_pengemudi,
                alamat_pengemudi: penindakan[0].alamat_pengemudi,
                umur_pengemudi: penindakan[0].umur_pengemudi,
                no_telp_pengemudi: penindakan[0].no_telp_pengemudi,
                kategori_jenis_kendaraan: penindakan[0].kategori_jenis_kendaraan,
                kategori_jenis_kendaraan_id: penindakan[0].kategori_jenis_kendaraan_id,
                golSim: gol_sim,
                deskSim: desk_sim,
                no_sim: penindakan[0].no_sim,
                nama_ppns: penindakan[0].nama_ppns,
                no_skep: penindakan[0].no_skep,
                nip: penindakan[0].penindakan_petugas.nip,
                pangkat: penindakan[0].penindakan_petugas.pangkat,
                hari_sidang: daySd,
                tgl_sidang: moment(penindakan[0].tgl_sidang).format('DD-MM-YYYY'),
                jam_sidang: `${penindakan[0].jam_sidang}:00`,
                nama_pemilik: penindakan[0].penindakan_kendaraan.nama_pemilik,
                alamat_pemilik: penindakan[0].penindakan_kendaraan.alamat_pemilik,
                tgl_uji: moment(penindakan[0].penindakan_kendaraan.tanggal_uji).format('DD-MM-YYYY'),
                tgl_masa_berlaku: moment(penindakan[0].penindakan_kendaraan.masa_berlaku_uji).format('DD-MM-YYYY'),
                pengadilan: penindakan[0].penindakanPengadilan.nama,
                pasal: arrpasal.join(','),
                etilang_ticket_id: penindakan[0].etilang_ticket_id,
                kode_briva: penindakan[0].kode_briva,
            }
            console.log(data);

            res.render("printBlankoTilangViewTable.ejs", {
                data: data
            });
        } else {
            res.send({
                success: false,
                message: 'Permintaan Data Gagal.'
            });
        }
    }

    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");

        try {
            var is_no_kendaraan = await getIsNoKendaraanPenindakan(req.body.no_kendaraan.toUpperCase(), moment(req.body.tgl_penindakan).format('YYYY-MM-DD HH:mm:ss'));
            console.log('IS NO KENDARAAN : ', is_no_kendaraan);
            if (is_no_kendaraan) {
                var kode_penindakan = req.body.kode_penindakan ? req.body.kode_penindakan : await genCodeTrxPenindakan(req.body.kode_uppkb, moment(req.body.tgl_penindakan).format('YYYY-MM-DD HH:mm:ss'), req.body.no_kendaraan);
                var is_exists_no_trx = await getIsExistsKodePenindakan(kode_penindakan);

                if (is_exists_no_trx) {
                    var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
                    var bptd_id = await getBptdId(req.body.kode_uppkb);
                    var nama_uppkb = await getLokasiUppkbNama(req.body.kode_uppkb);
                    var pengadilan_kode = await getPengadilanKode(req.body.pengadilan_id);
                    var kejaksaan_kode = await getKejaksaanKode(req.body.kejaksaan_id);
                    var kendaraan = await getKendaraan(req.body.no_kendaraan);
                    var wil_uppkb = await getWilayahLokasiUppkbById(lokasi_id);
                    var isIntegrasiEtilang =  await getIsIntegrasiEtilang(req.body.kode_uppkb);
                    var nama_bank =  req.body.bank_id ? await getNamaBank(req.body.bank_id) : null;
                    var sub_sanksi = req.body.sub_sanksi;
                    var pasal = req.body.pasal;
                    var sitaan = req.body.sitaan;
                    // var isTilang = req.body.is_tilang || false;

                    var sitaan_kode = await getDokumenKodeSitaan(sitaan);
                    var pasal_etilang_id = await getEtilangId(pasal);

                    const field = {
                        shift_id: req.body.shift_id,
                        regu_id: req.body.regu_id,
                        petugas_id: req.body.petugas_id,
                        bptd_id: bptd_id,
                        lokasi_id: lokasi_id, //generate
                        pengadilan_id: req.body.pengadilan_id,
                        pengadilan_kode: pengadilan_kode, //generate
                        kejaksaan_id: req.body.kejaksaan_id,
                        kejaksaan_kode: kejaksaan_kode, //generate
                        gol_sim_id: req.body.gol_sim_id,
                        asal_kota_id: req.body.asal_kota_id,
                        tujuan_kota_id: req.body.tujuan_kota_id,
                        sanksi_id: req.body.sanksi_id ? req.body.sanksi_id : 10, //jika sanksi null makan sanksi id 10 = peringatan
                        no_sim: req.body.no_sim,
                        nama_pengemudi: req.body.nama_pengemudi,
                        alamat_pengemudi: req.body.alamat_pengemudi,
                        umur_pengemudi: req.body.umur_pengemudi,
                        no_telp_pengemudi: req.body.no_telp_pengemudi,
                        jenis_kelamin: req.body.jenis_kelamin,
                        kode_uppkb: req.body.kode_uppkb,
                        kode_trx: req.body.kode_trx,
                        kode_penindakan: kode_penindakan,
                        no_kendaraan: req.body.no_kendaraan,
                        warna_kendaraan: req.body.warna_kendaraan,
                        kategori_jenis_kendaraan_id: Number(req.body.kategori_jenis_kendaraan_id) || null,
                        kategori_jenis_kendaraan: req.body.kategori_jenis_kendaraan || null,
                        tgl_penindakan: moment(req.body.tgl_penindakan).format('YYYY-MM-DD HH:mm:ss'),
                        nama_ppns: req.body.nama_ppns,
                        no_skep: req.body.no_skep,
                        tgl_sidang: req.body.tgl_sidang ? moment(req.body.tgl_sidang, 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                        jam_sidang: req.body.jam_sidang,
                        keterangan_tindakan: req.body.keterangan_tindakan,
                        is_active: true,
                        created_by: req.token.id,
                        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    };

                    let de = {
                        resp_ticket_id: '',
                        resp_msg: '',
                        kode_briva: '',
                    }

                    // console.log('DATA TILANG : ', isTilang);

                    return sequelize.transaction().then(function (t) {
                        return t_penindakan.create(field, { transaction: t, logging: false }).then(async (data) => {
                            try {
                                t.commit();

                                if (req.body.keterangan_tindakan == '' || req.body.keterangan_tindakan == undefined) {
                                    await upsert_detail_pasal(pasal, kode_penindakan, field.kode_trx, field.no_kendaraan, field.tgl_penindakan, field.kode_uppkb, field.lokasi_id, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                    await upsert_detail_sanksi(sub_sanksi, kode_penindakan, field.kode_trx, field.no_kendaraan, field.tgl_penindakan, field.kode_uppkb, field.lokasi_id, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                    await upsert_detail_sitaan(sitaan, kode_penindakan, field.kode_trx, field.no_kendaraan, field.tgl_penindakan, field.kode_uppkb, field.lokasi_id, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                }

                                await updateTindakanPenimbangan(field.kode_trx, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                
                                if (process.env.INTEGRASI_ETILANG == 1) {
                                    console.log(field.sanksi_id, typeof field.sanksi_id);
                                    if (field.sanksi_id === 11 || field.sanksi_id === '11') {
                                        const field_tilang = {
                                            kode_penindakan: kode_penindakan,
                                            courtTrialDate: req.body.tgl_sidang ? moment(req.body.tgl_sidang, 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                                            province: Number(wil_uppkb.id_provinsi),
                                            courtCode: pengadilan_kode,
                                            attorneyCode: kejaksaan_kode,
                                            areaOfTicket: nama_uppkb,
                                            weighBridgeCode: req.body.kode_uppkb,
                                            confiscatedType: sitaan_kode.join(','),
                                            name: req.body.nama_pengemudi,
                                            age: req.body.umur_pengemudi.toString(),
                                            gender: req.body.jenis_kelamin,
                                            identityType: req.body.identitas === 'KTP' ? req.body.identitas : "SIM",
                                            identityNumber: req.body.no_sim.toString(),
                                            phoneNumber: req.body.no_telp_pengemudi.toString(),
                                            noSkep: req.body.no_skep,
                                            vehicleType: kendaraan ? kendaraan[0].jenis_kend : '-',
                                            vehicleColor: req.body.warna_kendaraan,
                                            vehicleBrand: kendaraan ? kendaraan[0].merek : '-',
                                            vehiclePlateNumber: req.body.no_kendaraan,
                                            bank_id: req.body.bank_id,
                                            nama_bank: nama_bank,
                                            no_rek: req.body.no_rek,
                                            atas_nama: req.body.atas_nama,
                                            no_blanko: req.body.no_blanko,
                                            denda_maks: req.body.denda_maks,
                                            articles: pasal_etilang_id.join(','),
                                            created_by: req.token.id,
                                            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                                        };
                                        // var field_tilang = {
                                        //     ...dt,
                                        // }
                                        var upsertetilang = await upsert_etilang(kode_penindakan, field_tilang);
                                        console.log('UPSERT ETILANG : ', upsertetilang);
                                        
                                    }
                                }

                                if (process.env.INTEGRASI_ETILANG == 1 && process.env.IS_KEMENHUB == 1) {
                                    console.log(`Integrasi E-Tilang lokasi ${nama_uppkb.toUpperCase()} : `, isIntegrasiEtilang);
                                    if (isIntegrasiEtilang) {
                                        if (field.sanksi_id === 11 || field.sanksi_id === '11') {
                                            const dataTilang = {
                                                courtTrialDate: req.body.tgl_sidang ? moment(req.body.tgl_sidang, 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                                                province: Number(wil_uppkb.id_provinsi),
                                                courtCode: pengadilan_kode,
                                                attorneyCode: kejaksaan_kode,
                                                areaOfTicket: nama_uppkb,
                                                weighBridgeCode: req.body.kode_uppkb,
                                                confiscatedType: sitaan_kode,
                                                name: req.body.nama_pengemudi,
                                                age: req.body.umur_pengemudi.toString(),
                                                gender: req.body.jenis_kelamin,
                                                identityType: req.body.identitas === 'KTP' ? req.body.identitas : "SIM",
                                                identityNumber: req.body.no_sim.toString(),
                                                phoneNumber: req.body.no_telp_pengemudi.toString(),
                                                noSkep: req.body.no_skep,
                                                vehicleType: kendaraan && kendaraan[0] && kendaraan[0].jenis_kend ? kendaraan[0].jenis_kend : '-',
                                                vehicleColor: req.body.warna_kendaraan,
                                                vehicleBrand: kendaraan && kendaraan[0] && kendaraan[0].merek ? kendaraan[0].merek : '-',
                                                vehiclePlateNumber: req.body.no_kendaraan,
                                                articles: pasal_etilang_id,
                                                billAmount: Number(req.body.denda_maks),
                                                refundBankName: nama_bank,
                                                refundBankAccountNumber: req.body.no_rek.toString(),
                                                refundBankAccountName: req.body.atas_nama,
                                                nomorBlangko: req.body.no_blanko,
                                            };
                                            console.log('DATA E-TILANG : ', dataTilang);
                                            await syncetilang(dataTilang).then(async (resetilang) => {
                                                console.log('RESULT ETILANG : ', resetilang);
                                                if (resetilang != 0) {
                                                    if (resetilang.data) {
                                                        console.log('INTEGRASI E-TILANG BERHASIL');
                                                        await updatePenindakanBrivaTicket(data.id, resetilang.data._id, (resetilang.data.brivaId == 'null') ? NULL : resetilang.data.brivaId, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                                        await updatePenindakanEtilang(kode_penindakan, resetilang.data._id, (resetilang.data.brivaId == 'null') ? NULL : resetilang.data.brivaId, JSON.stringify(resetilang), moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                                        de = {
                                                            resp_ticket_id: resetilang.data._id,
                                                            resp_msg: JSON.stringify(resetilang),
                                                            kode_briva: resetilang.data.brivaId,
                                                        }
                                                        console.log(de);
                                                    } else {
                                                        console.log('INTEGRASI E-TILANG GAGAL');
                                                    }
                                                } else {
                                                    console.log('INTEGRASI E-TILANG GAGAL');
                                                }
                                                
                                            }).catch((err) => {
                                                console.log('ERROR E-TILANG : ', err);
                                                console.log('INTEGRASI E-TILANG GAGAL');
                                            });
                                        }
                                    }
                                }

                                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                                    // if (req.body.is_transaksi == 1) {
                                    var data_req = req.body;
                                    var data_sync = {
                                        kode_penindakan: kode_penindakan,
                                        ...data_req,
                                    }
                                    await syncToPostServer(req.token.id, 'post', 'v2pv/penindakan/create', data_sync).then(async (resp) => {
                                        if (resp.data.success) {
                                            console.log('SINKRONISASI DATA BERHASIL', resp.data);
                                            await updateStatusSyncToPusat(data.id, 'jt_penindakan');
                                            if (process.env.INTEGRASI_ETILANG == 1) {
                                                const dataetilang = resp.data.data[0].dataetilang;
                                                await updatePenindakanBrivaTicket(data.id, dataetilang.resp_ticket_id, dataetilang.kode_briva, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                                await updatePenindakanEtilang(kode_penindakan, dataetilang.resp_ticket_id, dataetilang.kode_briva, dataetilang.resp_msg, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                                                de = {
                                                    resp_ticket_id: dataetilang.resp_ticket_id,
                                                    resp_msg: JSON.parse(dataetilang.resp_msg),
                                                    kode_briva: dataetilang.kode_briva,
                                                }
                                            }
                                        } else {
                                            console.log('SINKRONISASI DATA GAGAL');
                                        }
                                    }).catch((error) => {
                                        // console.log(error);
                                        console.log('SINKRONISASI DATA GAGAL');
                                    });
                                    // }
                                }

                                console.log('SUCCESS, LAST ID: ', data.id);
                                res.send({
                                    success: true,
                                    message: messageService().CREATE_SUCCESS,
                                    data: [{
                                        last_insert_id: data.id,
                                        fields: field,
                                        dataetilang: de
                                    }]
                                });
                            } catch (error) {
                                console.log(error)
                                t.rollback().catch(() => { });
                                res.send({
                                    success: false,
                                    message: messageService().CREATE_FAILED
                                });
                            }
                        }).catch(function (err) {
                            console.log(err)
                            t.rollback().catch(() => { });
                            next(err)
                        });
                    });
                } else {
                    console.log('Nomor Transaksi Sudah Tersedia');
                    res.send({
                        success: false,
                        message: 'Nomor Transaksi Sudah Tersedia',
                    });
                }
            } else {
                console.log('Data Kendaraan Sudah Tersedia');
                res.send({
                    success: false,
                    message: 'Data Kendaraan Sudah Tersedia',
                });
            }

                // if (process.env.INTEGRASI_ETILANG == 1 && process.env.IS_KEMENHUB == 1) {
                //     if (req.body.keterangan_tindakan == '' || req.body.keterangan_tindakan == undefined) {
                //         const dt = {
                //             courtTrialDate: moment(req.body.tgl_sidang, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                //             province: Number(wil_uppkb.id_provinsi),
                //             courtCode: pengadilan_kode,
                //             attorneyCode: kejaksaan_kode,
                //             areaOfTicket: nama_uppkb,
                //             weighBridgeCode: req.body.kode_uppkb,
                //             confiscatedType: sitaan_kode,
                //             name: req.body.nama_pengemudi,
                //             age: req.body.umur_pengemudi.toString(),
                //             gender: req.body.jenis_kelamin,
                //             identityType: req.body.identitas,
                //             identityNumber: req.body.no_sim.toString(),
                //             phoneNumber: req.body.no_telp_pengemudi,
                //             noSkep: req.body.no_skep,
                //             vehicleType: kendaraan ? kendaraan[0].jenis_kend : '',
                //             vehicleColor: req.body.warna_kendaraan,
                //             vehicleBrand: kendaraan ? kendaraan[0].merek : '-',
                //             vehiclePlateNumber: req.body.no_kendaraan,
                //             articles: pasal_etilang_id
                //         };
                //         console.log(dt);
                //         return await syncetilang(dt).then(async (resetilang) => {
                //             console.log('RESULT ETILANG : ', resetilang);
                //             if (resetilang) {
                //                 await updatePenindakanBrivaTicket(data.id, resetilang._id, (resetilang.brivaId == 'null') ? NULL : resetilang.brivaId, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                //             }
                //             res.status(200).send({
                //                 success: true,
                //                 message: messageService().CREATE_SUCCESS,
                //                 data: [{
                //                     last_insert_id: data.id,
                //                     fields: field
                //                 }]
                //             });
                //         }).catch((err) => {
                //             console.log('ERROR E-TILANG : ', err);
                //             res.status(200).send({
                //                 success: true,
                //                 message: messageService().CREATE_SUCCESS,
                //                 data: [{
                //                     last_insert_id: data.id,
                //                     fields: field
                //                 }]
                //             });
                //         });
                //     }

                //     res.status(200).send({
                //         success: true,
                //         message: messageService().CREATE_SUCCESS,
                //         data: [{
                //             last_insert_id: data.id,
                //             fields: field
                //         }]
                //     });
                // } else {
                //     res.status(200).send({
                //         success: true,
                //         message: messageService().CREATE_SUCCESS,
                //         data: [{
                //             last_insert_id: data.id,
                //             fields: field
                //         }]
                //     });
                // }
                /*
                if (process.env.INTEGRASI_ETILANG == 1) {
                    if (req.body.keterangan_tindakan == '' || req.body.keterangan_tindakan == undefined) {
                        const dt = {
                            courtTrialDate: moment(req.body.tgl_sidang, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                            province: Number(wil_uppkb.id_provinsi),
                            courtCode: pengadilan_kode,
                            attorneyCode: kejaksaan_kode,
                            areaOfTicket: nama_uppkb,
                            weighBridgeCode: req.body.kode_uppkb,
                            confiscatedType: sitaan_kode,
                            name: req.body.nama_pengemudi,
                            age: req.body.umur_pengemudi.toString(),
                            gender: req.body.jenis_kelamin,
                            identityType: req.body.identitas,
                            identityNumber: req.body.no_sim,
                            phoneNumber: req.body.no_telp_pengemudi,
                            noSkep: req.body.no_skep,
                            vehicleType: kendaraan ? kendaraan[0].jenis_kend : '',
                            vehicleColor: req.body.warna_kendaraan,
                            vehicleBrand: kendaraan ? kendaraan[0].merek : '-',
                            vehiclePlateNumber: req.body.no_kendaraan,
                            articles: pasal_etilang_id
                        };
                        console.log(dt);                    
                        await syncetilang(dt).then(async(resetilang) => {
                            console.log('RESULT ETILANG : ', resetilang);
                            if (resetilang) {
                                
                                await updatePenindakanBrivaTicket(data.id, resetilang._id, (resetilang.brivaId == 'null') ? NULL:resetilang.brivaId, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                            }                            
                        });
                        res.status(200).send({
                            success: true,
                            message: messageService().CREATE_SUCCESS,
                            data: [{
                                last_insert_id : data.id,
                                fields: field
                            }]
                        });
                    } else {
                        res.status(200).send({
                            success: true,
                            message: messageService().CREATE_SUCCESS,
                            data: [{
                                last_insert_id : data.id,
                                fields: field
                            }]
                        });
                    }
                } else {
                    res.status(200).send({
                        success: true,
                        message: messageService().CREATE_SUCCESS,
                        data: [{
                            last_insert_id : data.id,
                            fields: field
                        }]
                    });
                }
                */

        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    const sinkPenindakan = async (req, res, next) => {
        console.log("--------------------::Processing Sink Penindakan::--------------------");
        try {
            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                var data_req = req.body;
                await syncToPostServer(req.token.id, 'post', 'v2pv/penindakan/create', data_req).then(async (resp) => {
                    if (resp.data.success) {
                        console.log('SINKRONISASI DATA BERHASIL');
                        var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_penindakan');
                        console.log('UPDATE STATUS : ', update_status);
                        if (update_status == 1) {
                            res.send({
                                success: true,
                                message: 'Sinkronisasi / Kirim Data Penindakan Berhasil'
                            });
                        } else {
                            res.send({
                                success: false,
                                message: 'Update Status Penindakan Gagal',
                            });
                        }

                    } else {
                        if (resp.data.message === 'Nomor Transaksi Sudah Tersedia') {
                            console.log('SINKRONISASI DATA BERHASIL');
                            var update_status = await updateStatusSyncToPusat(req.body.id, 'jt_penindakan');
                            console.log('UPDATE STATUS : ', update_status);
                            if (update_status == 1) {
                                res.send({
                                    success: true,
                                    message: 'Sinkronisasi / Kirim Data Penindakan Berhasil'
                                });
                            } else {
                                res.send({
                                    success: false,
                                    message: 'Update Status Penindakan Gagal',
                                });
                            }
                        } else {
                            console.log(resp.data, 'SINKRONISASI DATA GAGAL');
                            res.send({
                                success: false,
                                message: 'Sinkronisasi / Kirim Data Penindakan Gagal',
                            });
                        }
                    }
                }).catch((error) => {
                    // console.log(error);
                    console.log('SINKRONISASI DATA GAGAL');
                    res.send({
                        success: false,
                        message: `Sinkronisasi / Kirim Data Penindakan Gagal. ${error}`,
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
        var kode_penindakan = req.body.kode_penindakan ? req.body.kode_penindakan : await genCodeTrxPenindakan(req.body.kode_uppkb, moment(req.body.tgl_penindakan).format('YYYY-MM-DD HH:mm:ss'));
        var lokasi_id = await getLokasiUppkbId(req.body.kode_uppkb);
        var bptd_id = await getBptdId(req.body.kode_uppkb);
        var nama_uppkb = await getLokasiUppkbNama(req.body.kode_uppkb);
        var pengadilan_kode = await getPengadilanKode(req.body.pengadilan_id);
        var kejaksaan_kode = await getKejaksaanKode(req.body.kejaksaan_id);
        var kendaraan = await getKendaraan(req.body.no_kendaraan);
        var wil_uppkb = await getWilayahLokasiUppkbById(lokasi_id);
        var sub_sanksi = req.body.sub_sanksi;
        var pasal = req.body.pasal;
        var sitaan = req.body.sitaan;

        try {
            const id = req.params.id;
            const field = {
                shift_id: req.body.shift_id,
                regu_id: req.body.regu_id,
                petugas_id: req.body.petugas_id,
                bptd_id: bptd_id,
                lokasi_id: lokasi_id, //generate
                pengadilan_id: req.body.pengadilan_id,
                pengadilan_kode: pengadilan_kode, //generate
                kejaksaan_id: req.body.kejaksaan_id,
                kejaksaan_kode: kejaksaan_kode, //generate
                gol_sim_id: req.body.gol_sim_id,
                asal_kota_id: req.body.asal_kota_id,
                tujuan_kota_id: req.body.tujuan_kota_id,
                sanksi_id: req.body.sanksi_id,
                no_sim: req.body.no_sim,
                nama_pengemudi: req.body.nama_pengemudi,
                alamat_pengemudi: req.body.alamat_pengemudi,
                umur_pengemudi: req.body.umur_pengemudi,
                no_telp_pengemudi: req.body.no_telp_pengemudi,
                jenis_kelamin: req.body.jenis_kelamin,
                kode_uppkb: req.body.kode_uppkb,
                kode_trx: req.body.kode_trx,
                kode_penindakan: kode_penindakan,
                no_kendaraan: req.body.no_kendaraan,
                warna_kendaraan: req.body.warna_kendaraan,
                tgl_penindakan: moment(req.body.tgl_penindakan).format('YYYY-MM-DD HH:mm:ss'),
                nama_ppns: req.body.nama_ppns,
                no_skep: req.body.no_skep,
                tgl_sidang: moment(req.body.tgl_sidang, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                jam_sidang: req.body.jam_sidang,
                is_active: true,
                updated_by: req.token.id,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };


            t_penindakan.update(field,
                {
                    where: { id: id }
                }
            ).then(async (num) => {
                if (num == 1) {
                    await upsert_detail_pasal(pasal, kode_penindakan, field.kode_trx, field.no_kendaraan, field.tgl_penindakan, field.kode_uppkb, field.lokasi_id, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                    await upsert_detail_sanksi(sub_sanksi, kode_penindakan, field.kode_trx, field.no_kendaraan, field.tgl_penindakan, field.kode_uppkb, field.lokasi_id, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                    await upsert_detail_sitaan(sitaan, kode_penindakan, field.kode_trx, field.no_kendaraan, field.tgl_penindakan, field.kode_uppkb, field.lokasi_id, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                    await updateTindakanPenimbangan(field.kode_trx, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
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

            t_penindakan.update(
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
            t_penindakan.update(
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
            t_penindakan.destroy({
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

            t_penindakan.update(
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
            t_penindakan.destroy({
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
            t_penindakan.destroy(
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
        downloadBATilang,
        create,
        printPenindakan,
        sinkPenindakan,
        update,
        updateStatus,
        removeSoft,
        remove,
        removeArrSoft,
        removeArr,
        truncate,
    };
}
module.exports = PenindakanController;