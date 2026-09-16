const { 
    vr_pelanggaran, 
    vr_detail_capture, 
    vr_detail_pelanggaran, 
    vr_detail_pasal,
    vr_device,
    t_regu,
    t_shift,
    t_petugas,
    t_bptd,
    t_lokasi,
    vr_deteksi,
    vr_lhr_pelanggaran,
    sequelize
} = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const moment = require('moment');
const { reportTemplate } = require('../controllers/lib/report_template');
const path = require("path");
var QRCode = require('qrcode');
let ejs = require("ejs");
const { generatePdfFile } = require('../middleware/pdfGenerator');
const excel = require('exceljs');
const { encrypt } = require('./lib/aescrypt');
const {
    getKorsatpel,
    getPpns,
} = require('./lib/dataid');
const config = require('../../config/config');
const { getIsNoKendaraanVerifikasi } = require('./lib/verifikator');
const fs = require('fs');

const VrPelanggaranController = () => {

    const countAll = async () => {
        return vr_pelanggaran.count({
            where: {
                is_active: true
            }
        });
    }
    const datapelanggaran = async (req, next) => {
        try {
            const name = req.query.search;
            const tanggal_awal = req.query.tanggal_awal;
            const tanggal_akhir = req.query.tanggal_akhir;
            const bptd_id = req.query.bptd;
            const lokasi_id = req.query.lokasi;
            const jenis_pelanggaran_id = req.query.jenis_pelanggaran_id;

            const count = await countAll();
            let conditions = [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('vr_pelanggaran.tgl_pelanggaran')),
                    { [Op.between]: [moment(tanggal_awal).format('YYYY-MM-DD'), moment(tanggal_akhir).format('YYYY-MM-DD')] }
                ),
                { is_active: true }
            ];
            let jenis_pelanggaran = {is_active: true}

            let order = [
                [
                    req.query.orderBy || 'created_at',
                    req.query.sortedBy || 'DESC'
                ]
            ];

            if (tanggal_awal && tanggal_akhir) {
                if (bptd_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('vr_pelanggaran.tgl_pelanggaran')),
                            { [Op.between]: [moment(tanggal_awal).format('YYYY-MM-DD'), moment(tanggal_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            is_active: true,
                            bptd_id: bptd_id
                        }
                    ]
                }

                if (bptd_id && lokasi_id) {
                    conditions = [
                        sequelize.where(
                            sequelize.fn('DATE', sequelize.col('vr_pelanggaran.tgl_pelanggaran')),
                            { [Op.between]: [moment(tanggal_awal).format('YYYY-MM-DD'), moment(tanggal_akhir).format('YYYY-MM-DD')] }
                        ),
                        {
                            is_active: true,
                            lokasi_id: lokasi_id
                        }
                    ]
                }

            }

            if (jenis_pelanggaran_id) {
                jenis_pelanggaran = {
                    is_active: true,
                    jenis_pelanggaran_id: {[Op.eq]: jenis_pelanggaran_id}
                }
            }

            if (name) {
                conditions.push({
                    no_kendaraan: {
                    [Op.iLike]: `%${name}%`
                    }
                });
            }

            const options = {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'pelanggaran_regu',
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
                        as: 'pelanggaran_shift',
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
                        as: 'pelanggaran_petugas',
                        attributes: [
                            'id', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'pelanggaran_uppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    
                    {
                        model: vr_device,
                        required: false,
                        as: 'pelanggaran_device',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_active: true
                        }
                    },
                    {
                        model: vr_detail_capture,
                        required: false,
                        as: 'pelanggaran_capture',
                        where: {
                            is_active: true
                        }
                    },
                    {
                        model: vr_detail_pelanggaran,
                        required: true,
                        as: 'pelanggaran_detail',
                        attributes: [
                            'pelanggaran_id', 'deskripsi', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                        ],
                        where: jenis_pelanggaran
                    },
                    {
                        model: vr_detail_pasal,
                        required: false,
                        as: 'pelanggaran_pasal',
                        attributes: [
                            'pelanggaran_id', 'desk_pasal'
                        ],
                        where: {
                            is_active: true
                        }
                    }
                ],
                page: Number(req.query.page) || 1,
                paginate: Number(req.query.paginate) || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
                required: true
            }

            const { docs, pages, total } = await vr_pelanggaran.paginate(options)
            const result = {
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }
            }
            return result

        } catch (error) {
            next(error)
        }
    } 

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        // await datapelanggaran(req, next);
        const result = await datapelanggaran(req, next)
        res.status(200).json({
            success: true,
            message: messageService().GET_SUCCESS,
            data: result.data,
            meta: result.meta
        })
    }

    const findPagination = async (req, res, next) => {
        console.log("--------------------::Processing Find All Server Side Pagination::--------------------");
        try {
            const { search: name, tanggal_awal, tanggal_akhir, bptd, lokasi, jenis_pelanggaran_id } = req.query;

        const count = await countAll();
        
        const conditions = [
            sequelize.where(
                sequelize.fn('DATE', sequelize.col('vr_pelanggaran.tgl_pelanggaran')),
                { [Op.between]: [moment(tanggal_awal).format('YYYY-MM-DD'), moment(tanggal_akhir).format('YYYY-MM-DD')] }
            ),
            { is_active: true }
        ];

        const jenis_pelanggaran = { is_active: true };

        let order = [
            [
                req.query.orderBy || 'created_at',
                req.query.sortedBy || 'DESC'
            ]
        ];

        if (bptd) {
            conditions.push({
                ...(bptd && { bptd_id: bptd }),
            });
        }

        if (lokasi) {
            conditions.push({
                ...(lokasi && { lokasi_id: lokasi })
            });
        }

        if (jenis_pelanggaran_id) {
            Object.assign(jenis_pelanggaran, { jenis_pelanggaran_id });
        }

        if (name) {
            conditions.push({
                no_kendaraan: {
                    [Op.iLike]: `%${name}%`
                }
            });
        }
            console.log(conditions);
            // console.log(jenis_pelanggaran);
            
            const options = {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'pelanggaran_regu',
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
                        as: 'pelanggaran_shift',
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
                        as: 'pelanggaran_petugas',
                        attributes: [
                            'id', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'pelanggaran_uppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    
                    {
                        model: vr_device,
                        required: false,
                        as: 'pelanggaran_device',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_active: true
                        }
                    },
                    {
                        model: vr_detail_capture,
                        required: false,
                        as: 'pelanggaran_capture',
                        where: {
                            is_active: true
                        }
                    },
                    {
                        model: vr_detail_pelanggaran,
                        required: true,
                        as: 'pelanggaran_detail',
                        attributes: [
                            'pelanggaran_id', 'deskripsi', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                        ],
                        where: jenis_pelanggaran
                    },
                    {
                        model: vr_detail_pasal,
                        required: false,
                        as: 'pelanggaran_pasal',
                        attributes: [
                            'pelanggaran_id', 'desk_pasal'
                        ],
                        where: {
                            is_active: true
                        }
                    }
                ],
                page: req.query.page || 1,
                paginate: req.query.paginate || count,
                order,
                where: conditions,
                logging: false,
            }

            const { docs, pages, total } = await vr_pelanggaran.paginate(options)

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
            vr_pelanggaran.findByPk(id, {
                include: [
                    {
                        model: t_regu,
                        required: false,
                        as: 'pelanggaran_regu',
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
                        as: 'pelanggaran_shift',
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
                        as: 'pelanggaran_petugas',
                        attributes: [
                            'id', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'pelanggaran_uppkb',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    
                    {
                        model: vr_device,
                        required: false,
                        as: 'pelanggaran_device',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_active: true
                        }
                    },
                    {
                        model: vr_detail_capture,
                        required: false,
                        as: 'pelanggaran_capture',
                        where: {
                            is_active: true
                        }
                    },
                    {
                        model: vr_detail_pelanggaran,
                        required: true,
                        as: 'pelanggaran_detail',
                        attributes: [
                            'pelanggaran_id', 'deskripsi', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                        ],
                        where: {
                            is_active: true
                        }
                    },
                    {
                        model: vr_detail_pasal,
                        required: false,
                        as: 'pelanggaran_pasal',
                        attributes: [
                            'pelanggaran_id', 'desk_pasal'
                        ],
                        where: {
                            is_active: true
                        }
                    }
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
            const name = req.query.search;
            let conditions = { is_active: true}
            const count = await countAll();
            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
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

            const { docs, pages, total } = await vr_pelanggaran.paginate(options)

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

        try {
            var is_no_kendaraan = await getIsNoKendaraanVerifikasi(req.body.kd_pelanggaran);
            console.log('IS NO KENDARAAN : ', is_no_kendaraan);
            if (is_no_kendaraan) {
                const field = { 
                    kd_pelanggaran: req.body.kd_pelanggaran, 
                    tgl_pelanggaran: req.body.tgl_pelanggaran, 
                    no_ref: req.body.no_ref, 
                    kode_uppkb: req.body.kode_uppkb, 
                    regu_id: req.body.regu_id, 
                    shift_id: req.body.shift_id, 
                    no_kendaraan: req.body.no_kendaraan, 
                    no_uji: req.body.no_uji, 
                    tgl_uji: req.body.tgl_uji, 
                    tgl_masa_berlaku: req.body.tgl_masa_berlaku, 
                    nama_pemilik: req.body.nama_pemilik, 
                    alamat_pemilik: req.body.alamat_pemilik, 
                    toleransi_komoditi: req.body.toleransi_komoditi, 
                    toleransi_uppkb: req.body.toleransi_uppkb, 
                    berat_timbang: req.body.berat_timbang, 
                    jbi_uji: req.body.jbi_uji, 
                    kelebihan_berat: req.body.kelebihan_berat, 
                    prosen_lebih: req.body.prosen_lebih, 
                    jbb_uji: req.body.jbb_uji, 
                    jbkb_uji: req.body.jbkb_uji, 
                    mst_uji: req.body.mst_uji, 
                    jenis_kendaraan_id: req.body.jenis_kendaraan_id, 
                    jenis_kendaraan: req.body.jenis_kendaraan, 
                    sumbu_id: req.body.sumbu_id, 
                    sumbu: req.body.sumbu, 
                    kategori_kepemilikan_id: req.body.kategori_kepemilikan_id, 
                    asal_kota_id: req.body.asal_kota_id, 
                    tujuan_kota_id: req.body.tujuan_kota_id, 
                    asal_kode_kota: req.body.asal_kode_kota, 
                    tujuan_kode_kota: req.body.tujuan_kode_kota, 
                    is_gandengan: req.body.is_gandengan, 
                    gandengan_no_uji: req.body.gandengan_no_uji, 
                    gandengan_tgl_uji: req.body.gandengan_tgl_uji, 
                    gandengan_masa_berlaku: req.body.gandengan_masa_berlaku, 
                    gandengan_jbi_uji: req.body.gandengan_jbi_uji, 
                    gandengan_jbki: req.body.gandengan_jbki, 
                    komoditi_id: req.body.komoditi_id, 
                    pemilik_komoditi: req.body.pemilik_komoditi, 
                    alamat_pemilik_komoditi: req.body.alamat_pemilik_komoditi, 
                    no_surat_jalan: req.body.no_surat_jalan, 
                    device_id: req.body.device_id, 
                    petugas_id: req.body.petugas_id,
                    bptd_id: req.body.bptd_id, 
                    lokasi_id: req.body.lokasi_id, 
                    is_verified: req.body.is_verified, 
                    verified_at: req.body.verified_at, 
                    verified_by: req.body.verified_by, 
                    is_active: req.body.is_active ? req.body.is_active : true,
                    created_at: req.body.created_at, 
                    created_by: req.token.id,  
                    keterangan: req.body.keterangan, 
                    panjang_utama: req.body.panjang_utama, 
                    panjang_toleransi: req.body.panjang_toleransi, 
                    panjang_ukur: req.body.panjang_ukur, 
                    panjang_lebih: req.body.panjang_lebih, 
                    lebar_utama: req.body.lebar_utama, 
                    lebar_toleransi: req.body.lebar_toleransi, 
                    lebar_ukur: req.body.lebar_ukur, 
                    lebar_lebih: req.body.lebar_lebih, 
                    tinggi_utama: req.body.tinggi_utama, 
                    tinggi_toleransi: req.body.tinggi_toleransi, 
                    tinggi_ukur: req.body.tinggi_ukur, 
                    tinggi_lebih: req.body.tinggi_lebih, 
                    foh_utama: req.body.foh_utama, 
                    foh_toleransi: req.body.foh_toleransi, 
                    foh_ukur: req.body.foh_ukur, 
                    foh_lebih: req.body.foh_lebih, 
                    roh_utama: req.body.roh_utama, 
                    roh_toleransi: req.body.roh_toleransi, 
                    roh_ukur: req.body.roh_ukur, 
                    roh_lebih: req.body.roh_lebih, 
                    qrcode_name: req.body.qrcode_name, 
                    qrcode_url: req.body.qrcode_url, 
                    is_print: req.body.is_print, 
                    print_url: req.body.print_url, 
                    tgl_capture: req.body.tgl_capture
                };

                vr_pelanggaran.create(field, {
                    logging: false
                }).then(async data => {

                    if(req.body.detailcapture.length) {
                        for await (const capture of req.body.detailcapture) {
                            vr_detail_capture.create({
                                pelanggaran_id: data.id,
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                jt_vr_data_id: capture.jt_vr_data_id,
                                img_name: capture.img_name,
                                img2_name: capture.img2_name,
                                img3_name: capture.img3_name,
                                img4_name: capture.img4_name,
                                img_plat_depan_name: capture.img_plat_depan_name,
                                img_plat_belakang_name: capture.img_plat_belakang_name,
                                img_url: capture.img_url,
                                img2_url: capture.img2_url,
                                img3_url: capture.img3_url,
                                img4_url: capture.img4_url,
                                img_plat_depan_url: capture.img_plat_depan_url,
                                img_plat_belakang_url: capture.img_plat_belakang_url,
                                tgl_capture: capture.tgl_capture,
                                is_plat: capture.is_plat,
                                device_id: capture.device_id,
                                is_active: capture.is_active,
                                created_by: req.token.id,
                            }, {logging:false})

                            vr_lhr_pelanggaran.update(
                            {
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                is_verifikasi: true,
                                updated_by: req.token.id,
                                updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                            },
                            {
                                where: { last_id: capture.jt_vr_data_id },
                                logging: false
                            }
                        )
                        }
                    }

                    if (req.body.detailpelanggaran.length) {
                        for await (const detailpel of req.body.detailpelanggaran) {
                            vr_detail_pelanggaran.create({
                                pelanggaran_id: data.id,
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                jenis_pelanggaran_id: detailpel.jenis_pelanggaran_id,
                                kode_pelanggaran: detailpel.kode_pelanggaran,
                                deskripsi: detailpel.deskripsi,
                                created_by: req.token.id,
                                is_active: detailpel.is_active
                            }, {logging:false})
                        }
                    }

                    if (req.body.detailpasal.length) {
                        for await (const detailpasal of req.body.detailpasal) {
                            vr_detail_pasal.create({
                                pelanggaran_id: data.id,
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                pasal_id: detailpasal.pasal_id,
                                desk_pasal: detailpasal.desk_pasal,
                                created_by: req.token.id,
                                is_active: detailpasal.is_active
                            }, {logging:false})
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
                })

            } else {
                console.log('Data Kendaraan Sudah Tersedia');
                res.send({
                    success: false,
                    message: 'Data Kendaraan Sudah Tersedia',
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const createWithImage = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");

        try {
            var is_no_kendaraan = await getIsNoKendaraanVerifikasi(req.body.kd_pelanggaran);
            console.log('IS NO KENDARAAN : ', is_no_kendaraan);
            if (is_no_kendaraan) {
                const field = { 
                    kd_pelanggaran: req.body.kd_pelanggaran, 
                    tgl_pelanggaran: req.body.tgl_pelanggaran, 
                    no_ref: req.body.no_ref, 
                    kode_uppkb: req.body.kode_uppkb, 
                    regu_id: req.body.regu_id, 
                    shift_id: req.body.shift_id, 
                    no_kendaraan: req.body.no_kendaraan, 
                    no_uji: req.body.no_uji, 
                    tgl_uji: req.body.tgl_uji, 
                    tgl_masa_berlaku: req.body.tgl_masa_berlaku, 
                    nama_pemilik: req.body.nama_pemilik, 
                    alamat_pemilik: req.body.alamat_pemilik, 
                    toleransi_komoditi: req.body.toleransi_komoditi, 
                    toleransi_uppkb: req.body.toleransi_uppkb, 
                    berat_timbang: req.body.berat_timbang, 
                    jbi_uji: req.body.jbi_uji, 
                    kelebihan_berat: req.body.kelebihan_berat, 
                    prosen_lebih: req.body.prosen_lebih, 
                    jbb_uji: req.body.jbb_uji, 
                    jbkb_uji: req.body.jbkb_uji, 
                    mst_uji: req.body.mst_uji, 
                    jenis_kendaraan_id: req.body.jenis_kendaraan_id, 
                    jenis_kendaraan: req.body.jenis_kendaraan, 
                    sumbu_id: req.body.sumbu_id, 
                    sumbu: req.body.sumbu, 
                    kategori_kepemilikan_id: req.body.kategori_kepemilikan_id, 
                    asal_kota_id: req.body.asal_kota_id, 
                    tujuan_kota_id: req.body.tujuan_kota_id, 
                    asal_kode_kota: req.body.asal_kode_kota, 
                    tujuan_kode_kota: req.body.tujuan_kode_kota, 
                    is_gandengan: req.body.is_gandengan, 
                    gandengan_no_uji: req.body.gandengan_no_uji, 
                    gandengan_tgl_uji: req.body.gandengan_tgl_uji, 
                    gandengan_masa_berlaku: req.body.gandengan_masa_berlaku, 
                    gandengan_jbi_uji: req.body.gandengan_jbi_uji, 
                    gandengan_jbki: req.body.gandengan_jbki, 
                    komoditi_id: req.body.komoditi_id, 
                    pemilik_komoditi: req.body.pemilik_komoditi, 
                    alamat_pemilik_komoditi: req.body.alamat_pemilik_komoditi, 
                    no_surat_jalan: req.body.no_surat_jalan, 
                    device_id: req.body.device_id, 
                    petugas_id: req.body.petugas_id,
                    bptd_id: req.body.bptd_id, 
                    lokasi_id: req.body.lokasi_id, 
                    is_verified: req.body.is_verified, 
                    verified_at: req.body.verified_at, 
                    verified_by: req.body.verified_by, 
                    is_active: req.body.is_active ? req.body.is_active : true,
                    created_at: req.body.created_at, 
                    created_by: req.token.id,  
                    keterangan: req.body.keterangan, 
                    panjang_utama: req.body.panjang_utama, 
                    panjang_toleransi: req.body.panjang_toleransi, 
                    panjang_ukur: req.body.panjang_ukur, 
                    panjang_lebih: req.body.panjang_lebih, 
                    lebar_utama: req.body.lebar_utama, 
                    lebar_toleransi: req.body.lebar_toleransi, 
                    lebar_ukur: req.body.lebar_ukur, 
                    lebar_lebih: req.body.lebar_lebih, 
                    tinggi_utama: req.body.tinggi_utama, 
                    tinggi_toleransi: req.body.tinggi_toleransi, 
                    tinggi_ukur: req.body.tinggi_ukur, 
                    tinggi_lebih: req.body.tinggi_lebih, 
                    foh_utama: req.body.foh_utama, 
                    foh_toleransi: req.body.foh_toleransi, 
                    foh_ukur: req.body.foh_ukur, 
                    foh_lebih: req.body.foh_lebih, 
                    roh_utama: req.body.roh_utama, 
                    roh_toleransi: req.body.roh_toleransi, 
                    roh_ukur: req.body.roh_ukur, 
                    roh_lebih: req.body.roh_lebih, 
                    qrcode_name: req.body.qrcode_name, 
                    qrcode_url: req.body.qrcode_url, 
                    is_print: req.body.is_print, 
                    print_url: req.body.print_url, 
                    tgl_capture: req.body.tgl_capture
                };

                vr_pelanggaran.create(field, {
                    logging: false
                }).then(async data => {

                    if(req.body.detailcapture.length) {
                        for await (const capture of req.body.detailcapture) {
                            vr_detail_capture.create({
                                pelanggaran_id: data.id,
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                jt_vr_data_id: capture.jt_vr_data_id,
                                img_name: capture.img_name,
                                img2_name: capture.img2_name,
                                img3_name: capture.img3_name,
                                img4_name: capture.img4_name,
                                img_plat_depan_name: capture.img_plat_depan_name,
                                img_plat_belakang_name: capture.img_plat_belakang_name,
                                img_url: capture.img_url,
                                img2_url: capture.img2_url,
                                img3_url: capture.img3_url,
                                img4_url: capture.img4_url,
                                img_plat_depan_url: capture.img_plat_depan_url,
                                img_plat_belakang_url: capture.img_plat_belakang_url,
                                tgl_capture: capture.tgl_capture,
                                is_plat: capture.is_plat,
                                device_id: capture.device_id,
                                is_active: capture.is_active,
                                created_by: req.token.id,
                            }, {logging:false})

                            vr_lhr_pelanggaran.update(
                            {
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                is_verifikasi: true,
                                updated_by: req.token.id,
                                updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                            },
                            {
                                where: { last_id: capture.jt_vr_data_id },
                                logging: false
                            }
                        )
                        }
                    }

                    if (req.body.detailpelanggaran.length) {
                        for await (const detailpel of req.body.detailpelanggaran) {
                            vr_detail_pelanggaran.create({
                                pelanggaran_id: data.id,
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                jenis_pelanggaran_id: detailpel.jenis_pelanggaran_id,
                                kode_pelanggaran: detailpel.kode_pelanggaran,
                                deskripsi: detailpel.deskripsi,
                                created_by: req.token.id,
                                is_active: detailpel.is_active
                            }, {logging:false})
                        }
                    }

                    if (req.body.detailpasal.length) {
                        for await (const detailpasal of req.body.detailpasal) {
                            vr_detail_pasal.create({
                                pelanggaran_id: data.id,
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                pasal_id: detailpasal.pasal_id,
                                desk_pasal: detailpasal.desk_pasal,
                                created_by: req.token.id,
                                is_active: detailpasal.is_active
                            }, {logging:false})
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
                })

            } else {
                console.log('Data Kendaraan Sudah Tersedia');
                res.send({
                    success: false,
                    message: 'Data Kendaraan Sudah Tersedia',
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const deteksi = async (req, res, next) => {
        console.log("--------------------::Processing Create Deteksi Capture LHR & WIM::--------------------");

        try {
            const field = { 
                tgl_deteksi: req.body.tgl_deteksi, 
                lokasi_id: req.body.lokasi_id, 
                jml_deteksi: req.body.jml_deteksi
            };

            var month = moment(req.body.tgl_deteksi).format('MM');
            var year = moment(req.body.tgl_deteksi).format('YYYY');
            var tgl = moment(req.body.tgl_deteksi).format('YYYY-MM-DD');
            var sql = `SELECT * FROM vr_deteksi WHERE lokasi_id = ${req.body.lokasi_id} AND DATE(tgl_deteksi) = '${tgl}'`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });
            console.log(field);

            //var arrImg = [];
            if (result.length > 0) {
                vr_deteksi.update(field, { where: { id: result[0].id } }).then(async (num) => {
                    if (num == 1) {
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
            } else {
                vr_deteksi.create(field, { logging: false }).then(async (data) => {
                    try {
                        t.commit();
                        res.status(200).send({
                            success: true,
                            message: messageService().CREATE_SUCCESS,
                            data: [{
                                last_insert_id: data.id,
                                fields: field
                            }]
                        });
                    } catch (error) {
                        t.rollback().catch(() => { });
                        console.log(err)
                        res.status(500).send({
                            success: false,
                            message: messageService().CREATE_FAILED
                        });
                    }
                });
            }
        } catch (error) {
            next(error)
        }
    }

    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            const id = req.params.id;

            vr_pelanggaran.update(
                {
                    tgl_pelanggaran: req.body.tgl_pelanggaran, 
                    no_ref: req.body.no_ref, 
                    kode_uppkb: req.body.kode_uppkb, 
                    regu_id: req.body.regu_id, 
                    shift_id: req.body.shift_id, 
                    no_kendaraan: req.body.no_kendaraan, 
                    no_uji: req.body.no_uji, 
                    tgl_uji: req.body.tgl_uji, 
                    tgl_masa_berlaku: req.body.tgl_masa_berlaku, 
                    nama_pemilik: req.body.nama_pemilik, 
                    alamat_pemilik: req.body.alamat_pemilik, 
                    toleransi_komoditi: req.body.toleransi_komoditi, 
                    toleransi_uppkb: req.body.toleransi_uppkb, 
                    berat_timbang: req.body.berat_timbang, 
                    jbi_uji: req.body.jbb_uji, 
                    kelebihan_berat: req.body.kelebihan_berat, 
                    prosen_lebih: req.body.prosen_lebih, 
                    jbb_uji: req.body.jbi_uji, 
                    jbkb_uji: req.body.jbkb_uji, 
                    mst_uji: req.body.mst_uji, 
                    jenis_kendaraan_id: req.body.jenis_kendaraan_id, 
                    jenis_kendaraan: req.body.jenis_kendaraan, 
                    sumbu_id: req.body.sumbu_id, 
                    sumbu: req.body.sumbu, 
                    kategori_kepemilikan_id: req.body.kategori_kepemilikan_id, 
                    asal_kota_id: req.body.asal_kota_id, 
                    tujuan_kota_id: req.body.tujuan_kota_id, 
                    asal_kode_kota: req.body.asal_kode_kota, 
                    tujuan_kode_kota: req.body.tujuan_kode_kota, 
                    is_gandengan: req.body.is_gandengan, 
                    gandengan_no_uji: req.body.gandengan_no_uji, 
                    gandengan_tgl_uji: req.body.gandengan_tgl_uji, 
                    gandengan_masa_berlaku: req.body.gandengan_masa_berlaku, 
                    gandengan_jbi_uji: req.body.gandengan_jbi_uji, 
                    gandengan_jbki: req.body.gandengan_jbki, 
                    komoditi_id: req.body.komoditi_id, 
                    pemilik_komoditi: req.body.pemilik_komoditi, 
                    alamat_pemilik_komoditi: req.body.alamat_pemilik_komoditi, 
                    no_surat_jalan: req.body.no_surat_jalan, 
                    device_id: req.body.device_id, 
                    petugas_id: req.body.petugas_id, 
                    lokasi_id: req.body.lokasi_id, 
                    is_verified: req.body.is_verified, 
                    verified_at: req.body.verified_at, 
                    verified_by: req.body.verified_by, 
                    is_active: req.body.is_active ? req.body.is_active : true,
                    created_at: req.body.created_at, 
                    created_by: req.token.id,  
                    keterangan: req.body.keterangan, 
                    panjang_utama: req.body.panjang_utama, 
                    panjang_toleransi: req.body.panjang_toleransi, 
                    panjang_ukur: req.body.panjang_ukur, 
                    panjang_lebih: req.body.panjang_lebih, 
                    lebar_utama: req.body.lebar_utama, 
                    lebar_toleransi: req.body.lebar_toleransi, 
                    lebar_ukur: req.body.lebar_ukur, 
                    lebar_lebih: req.body.lebar_lebih, 
                    tinggi_utama: req.body.tinggi_utama, 
                    tinggi_toleransi: req.body.tinggi_toleransi, 
                    tinggi_ukur: req.body.tinggi_ukur, 
                    tinggi_lebih: req.body.tinggi_lebih, 
                    foh_utama: req.body.foh_utama, 
                    foh_toleransi: req.body.foh_toleransi, 
                    foh_ukur: req.body.foh_ukur, 
                    foh_lebih: req.body.foh_lebih, 
                    roh_utama: req.body.roh_utama, 
                    roh_toleransi: req.body.roh_toleransi, 
                    roh_ukur: req.body.roh_ukur, 
                    roh_lebih: req.body.roh_lebih, 
                    qrcode_name: req.body.qrcode_name, 
                    qrcode_url: req.body.qrcode_url, 
                    is_print: req.body.is_print, 
                    print_url: req.body.print_url, 
                    tgl_capture: req.body.tgl_capture
                },
                {
                    where: { id: id }
                }
            ).then(num => {
                if (num == 1) {
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
            var resSplit = q.split(",").map(i => String(i));
            
            vr_pelanggaran.update(
                {
                    is_active: req.body.is_active ? req.body.is_active : false,
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

    const remove = async (req, res, next) => {
        console.log("--------------------::Processing Delete::--------------------");

        const id = req.params.id;
        try {
            vr_pelanggaran.destroy({
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

    const removeArr = async (req, res, next) => {
        console.log("--------------------::Processing Delete All::--------------------");
        var q = req.query.arrId;
        var resSplit = q.split(",").map(i => String(i));
        try {
            vr_pelanggaran.destroy({
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

    const xlsWim = async (req, res, next) => {
        const result = await datapelanggaran(req, next)
        
        if (result) {
            let obj = [];

            for (let row of result.data) {
                let arrPelanggaran = [];
                let arrPasal = [];
                row.pelanggaran_detail.map((val) => {
                    arrPelanggaran.push(val.deskripsi)
                })

                row.pelanggaran_pasal.map((val) => {
                    arrPasal.push(val.desk_pasal)
                })

                obj.push({
                    waktu: moment(row.tgl_pelanggaran).format('DD-MM-YYYY HH:mm:ss'),
                    device: row.pelanggaran_device.nama,
                    nama_uppkb: row.pelanggaran_uppkb.nama,
                    no_kendaraan: row.no_kendaraan,
                    jenis_kendaraan: row.jenis_kendaraan,
                    no_uji: row.no_uji,
                    tgl_uji: row.tgl_uji,
                    tgl_masa_berlaku: row.tgl_masa_berlaku,
                    jbi: row.jbi_uji,
                    sumbu: row.sumbu,
                    kelebihan_berat: row.kelebihan_berat,
                    prosen_lebih: row.prosen_lebih,
                    berat_timbang: row.berat_timbang,
                    pelanggaran: arrPelanggaran.join(', '),
                    pasal: arrPasal.join(', '),
                    nama_pemilik: row.nama_pemilik,
                    alamat_pemilik: row.alamat_pemilik,
                    operator: row.pelanggaran_petugas ? row.pelanggaran_petugas.nama : '-' 
                })
            }
            
            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('Data Verifikasi', {
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
                { header: 'Waktu', key: 'waktu', width: 20},
                { header: 'Device', key: 'device', width: 20},
                { header: 'UPPKB', key: 'nama_uppkb', width: 20},
                { header: 'No Kendaraan', key: 'no_kendaraan', width: 20},
                { header: 'No Uji', key: 'no_uji', width: 20},
                { header: 'Masa Berlaku', key: 'tgl_masa_berlaku', width: 20},
                { header: 'Jenis Kendaraan', key: 'jenis_kendaraan', width: 20},
                { header: 'Sumbu', key: 'sumbu', width: 20},
                { header: 'JBI (KG)', key: 'jbi', width: 20},
                { header: 'Berat Timbang (KG)', key: 'berat_timbang', width: 20},
                { header: 'Berat Lebih (KG)', key: 'kelebihan_berat', width: 20},
                { header: 'Persen Lebih (%)', key: 'prosen_lebih', width: 20},
                { header: 'Pelanggaran', key: 'pelanggaran', width: 20},
                { header: 'Pasal', key: 'pasal', width: 30},
                { header: 'Nama Pemilik', key: 'nama_pemilik', width: 20},
                { header: 'Verifikator', key: 'operator', width: 20}
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
            const filename = `data_verifikasi_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
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

    const printWim = async (req, res, next) => {
        const tanggal_awal = req.query.tanggal_awal;
        const tanggal_akhir = req.query.tanggal_akhir;
        const lokasi_id = req.query.lokasi;
        const ispdf = req.query.ispdf;

        const result = await datapelanggaran(req, next);

        if (result) {
            let obj = [];

            for (let row of result.data) {
                let arrPelanggaran = [];
                let arrPasal = [];
                row.pelanggaran_detail.map((val) => {
                    arrPelanggaran.push(val.deskripsi)
                })
                row.pelanggaran_pasal.map((val) => {
                    arrPasal.push(val.desk_pasal)
                })
                obj.push({
                    waktu: moment(row.tgl_pelanggaran).format('DD-MM-YYYY HH:mm:ss'),
                    device: row.pelanggaran_device.nama,
                    nama_uppkb: row.pelanggaran_uppkb.nama,
                    no_kendaraan: row.no_kendaraan,
                    jenis_kendaraan: row.jenis_kendaraan,
                    no_uji: row.no_uji,
                    tgl_uji: row.tgl_uji,
                    tgl_masa_berlaku: row.tgl_masa_berlaku,
                    jbi: row.jbi_uji,
                    sumbu: row.sumbu,
                    kelebihan_berat: row.kelebihan_berat,
                    prosen_lebih: row.prosen_lebih,
                    berat_timbang: row.berat_timbang,
                    pelanggaran: arrPelanggaran.join(', '),
                    pasal: arrPasal.join(', '),
                    nama_pemilik: row.nama_pemilik,
                    alamat_pemilik: row.alamat_pemilik,
                    operator: row.pelanggaran_petugas ? row.pelanggaran_petugas.nama : '-' 
                })
            }

            let lokasi = ''
            if (lokasi_id) {
                lokasi = await t_lokasi.findOne({
                    where: {
                        'id': lokasi_id,
                        'is_active': true,
                        'is_deleted': false
                    }
                })
            }

            let params = 'lokasi_id=all_uppkb'
            if(lokasi_id) {
                params = `lokasi_id=${lokasi_id}`;
            }
            const tgl_pelanggaran = moment(obj[0].waktu).format('DD-MM-YYYY HH:mm:ss');
            const no_kendaraan = obj[0].no_kendaraan;
            const jenis_kendaraan = obj[0].jenis_kendaraan;
            const pelanggaran = obj[0].pelanggaran;
            const lokasi_uppkb = obj[0].nama_uppkb;
            const dataqr = `No Kendaraan : ${no_kendaraan} # Tanggal Melanggar : ${tgl_pelanggaran} # Jenis Kendaraan : ${jenis_kendaraan} # Pelanggaran : ${pelanggaran} # Lokasi UPPKB : ${lokasi_uppkb}`;
            const qrCodeDataUrl = await promiseToCreateQRcode(dataqr);

            const header = await reportTemplate();

            var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
            // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
            const fs = require('fs');
            const contents = fs.readFileSync(path_img, { encoding: 'base64' });

            if (ispdf == 0) {
                res.render("wimView.ejs", {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: obj,
                    tanggal_awal: moment(tanggal_awal).format('DD-MM-YYYY'),
                    tanggal_akhir: moment(tanggal_akhir).format('DD-MM-YYYY'),
                    moment: moment,
                    lokasi_id: lokasi_id,
                    lokasi: lokasi,
                    logo: 'data:image/png;base64,' + contents,
                    qr: qrCodeDataUrl
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', 'wimView.ejs'), {
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || '',
                    data: obj,
                    tanggal_awal: tanggal_awal,
                    tanggal_akhir: tanggal_akhir,
                    moment: moment,
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
                        
                        let nama_file_uppkb = 'all_uppkb'
                        if(lokasi_id) {

                            nama_file_uppkb = lokasi.kode;
                        }

                        const filename = `data_verifikasi_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
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

    const dataverifikasi = async (conditions) => {
        const options = {
            include: [
                {
                    model: t_regu,
                    required: false,
                    as: 'pelanggaran_regu',
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
                    as: 'pelanggaran_shift',
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
                    as: 'pelanggaran_petugas',
                    attributes: [
                        'id', 'nama'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                {
                    model: t_bptd,
                    required: false,
                    as: 'pelanggaran_bptd',
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
                    as: 'pelanggaran_uppkb',
                    attributes: [
                        'id', 'kode', 'nama', 'alamat_uppkb', 'ttd_url'
                    ],
                    where: {
                        is_deleted: false,
                        is_active: true
                    }
                },
                
                {
                    model: vr_device,
                    required: false,
                    as: 'pelanggaran_device',
                    attributes: [
                        'id', 'kode', 'nama'
                    ],
                    where: {
                        is_active: true
                    }
                },
                {
                    model: vr_detail_capture,
                    required: false,
                    as: 'pelanggaran_capture',
                    where: {
                        is_active: true
                    }
                },
                {
                    model: vr_detail_pelanggaran,
                    required: true,
                    as: 'pelanggaran_detail',
                    attributes: [
                        'pelanggaran_id', 'deskripsi', 'kode_pelanggaran', 'jenis_pelanggaran_id'
                    ],
                    where: {
                        is_active: true
                    }
                },
                {
                    model: vr_detail_pasal,
                    required: false,
                    as: 'pelanggaran_pasal',
                    attributes: [
                        'pelanggaran_id', 'desk_pasal'
                    ],
                    where: {
                        is_active: true
                    }
                }
            ],
            where: conditions,
            order: [
                ['tgl_pelanggaran', 'ASC']
            ],
            logging: false
        }

        const pelanggaran = await vr_pelanggaran.findAll(options);

        return pelanggaran;
    }

    const printVerifikasi = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var conditions = {
            id: req.query.id,
        };

        if (req.query.kuppkb) {
            conditions = {
                id: req.query.id,
                kode_uppkb: req.query.kuppkb,
            };
        }

        if (req.query.lokasi) {
            conditions = {
                id: req.query.id,
                lokasi_id: req.query.lokasi,
            };
        }

        var pelanggaran = await dataverifikasi(conditions);

        var arrcapture = [];
        var arrplat = [];
        if (pelanggaran[0].pelanggaran_capture) {
            pelanggaran[0].pelanggaran_capture.map((val) => {
                if (val.is_plat) {
                    arrplat.push(val);
                } else {
                    arrcapture.push(val);
                }
            });
        }

        var arrpelanggaran = [];
        if (pelanggaran[0].pelanggaran_detail) {
            pelanggaran[0].pelanggaran_detail.map((val) => {
                arrpelanggaran.push(val.deskripsi);
            });
        }

        var arrpasal = [];
        if (pelanggaran[0].pelanggaran_pasal) {
            pelanggaran[0].pelanggaran_pasal.map((val) => {
                arrpasal.push(val.desk_pasal);
            });
        }

        var lokasi = pelanggaran[0].lokasi_id;
        let korsatpel = null;
        if (lokasi) {
            korsatpel = await getKorsatpel(lokasi);
        }
        // let ppns = null;
        // if (lokasi) {
        //     ppns = await getPpns(lokasi);
        // }

        var data = {
            kode_uppkb: pelanggaran[0].pelanggaran_uppkb.kode,
            nama_uppkb: pelanggaran[0].pelanggaran_uppkb.nama,
            alamat_uppkb: pelanggaran[0].pelanggaran_uppkb.alamat_uppkb,
            nama_bptd: pelanggaran[0].pelanggaran_bptd.nama,
            tanggal: moment(pelanggaran[0].tgl_pelanggaran).format('DD-MM-YYYY'),
            jam: moment(pelanggaran[0].tgl_pelanggaran).format('HH:mm:ss'),
            no_kendaraan: pelanggaran[0].no_kendaraan,
            kd_pelanggaran: pelanggaran[0].kd_pelanggaran || '',
            no_uji: pelanggaran[0].no_uji,
            nama_pemilik: pelanggaran[0].nama_pemilik,
            alamat_pemilik: pelanggaran[0].alamat_pemilik,
            jbi: pelanggaran[0].jbi_uji,
            gandengan_jbki: pelanggaran[0].gandengan_jbki,
            berat_timbang: Math.ceil(pelanggaran[0].berat_timbang),
            kelebihan_berat: Math.ceil(pelanggaran[0].kelebihan_berat),
            persen_lebih: Math.ceil(pelanggaran[0].prosen_lebih),
            tgl_uji: moment(pelanggaran[0].tgl_uji).format('DD-MM-YYYY'),
            tgl_masa_berlaku: moment(pelanggaran[0].tgl_masa_berlaku).format('DD-MM-YYYY'),
            // nippetugas: pelanggaran[0].pelanggaran_petugas ? pelanggaran[0].pelanggaran_petugas.nip : '-',
            // petugas: pelanggaran[0].pelanggaran_petugas ? pelanggaran[0].pelanggaran_petugas.nama : '-',
            pelanggaran: arrpelanggaran.join(', '),
            pasal: arrpasal.join(', '),
            plat: arrplat,
            capture: arrcapture,
            nipkorsatpel: korsatpel ? korsatpel.nip : '',
            korsatpel: korsatpel ? korsatpel.nama : '',
            // nipppns: ppns ? ppns.nip : '',
            // ppns: ppns ? ppns.nama : '',
            ttd: pelanggaran[0].pelanggaran_uppkb.ttd_url,
        }

        var params = encrypt(`ispdf=0&id=${pelanggaran[0].id}`);
        if (req.query.kuppkb) {
            params = encrypt(`ispdf=0&kuppkb=${req.query.kuppkb}&id=${pelanggaran[0].id}`);
        }

        let dataqr = `${process.env.DOMAIN_URL_QR}/rep/verifikasi?src=${encrypt(params)}`;
        let qrCodeDataUrl = await promiseToCreateQRcode(dataqr); //await generateQr('Tested QR');
        //var logo = fs.readFileSync('./images/logo_dishub.png', {encoding: 'base64'});// './images/logo_dishub.png';
        const header = await reportTemplate();

        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // let path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        if (ispdf == 0) {
            res.render("printVerifikasiView.ejs", {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: data,
                moment: moment,
                logo: 'data:image/png;base64,' + contents,
                ttd: data.ttd,
                qr: qrCodeDataUrl
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "printVerifikasiView.ejs"), {
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || '',
                data: data, 
                moment: moment, 
                logo: 'data:image/png;base64,' + contents, 
                ttd: data.ttd,
                qr: qrCodeDataUrl
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    const options = {
                        format: 'A4',
                        landscape: false,
                        printBackground: true,
                        margin: { top: '8mm', bottom: '8mm' }
                    };

                    const filename = `verifikasi_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${data.kode_uppkb}.pdf`;
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
            });
        }
    }

    /**
     * Helper function untuk menyimpan base64 image ke file system
     * @param {string} base64Data - Base64 string dengan format "data:image/jpeg;base64,..."
     * @param {string} fileName - Nama file (tanpa extension)
     * @param {string} subfolder - Subfolder di path_upload (default: 'verifikasi')
     * @returns {object} { file_name, file_path, image_url }
     */
    const saveBase64Image = (base64Data, fileName, subfolder = 'verifikasi') => {
        if (!base64Data) return null;

        try {
            // Extract base64 string dan mime type
            let base64String = base64Data;
            let mimeType = 'image/jpeg';
            let extension = 'jpg';

            if (base64Data.includes(',')) {
                const parts = base64Data.split(',');
                const dataPart = parts[0]; // data:image/jpeg;base64
                base64String = parts[1]; // actual base64 string

                if (dataPart.includes('image/')) {
                    mimeType = dataPart.split('image/')[1].split(';')[0];
                    extension = mimeType === 'png' ? 'png' : mimeType === 'gif' ? 'gif' : mimeType === 'webp' ? 'webp' : 'jpg';
                }
            }

            // Generate unique filename
            const timestamp = moment().format('YYYY_MM_DD_HH_mm_ss_SSS');
            const uniqueFileName = `${fileName}_${timestamp}.${extension}`;
            
            // Create directory if not exists
            const uploadDir = path.join(config.path_upload, subfolder);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Save file
            const filePath = path.join(uploadDir, uniqueFileName);
            const buffer = Buffer.from(base64String, 'base64');
            fs.writeFileSync(filePath, buffer);

            // Generate URL
            const imageUrl = `${config.image_url}${subfolder}/${uniqueFileName}`;

            return {
                file_name: uniqueFileName,
                file_path: filePath,
                image_url: imageUrl
            };
        } catch (error) {
            console.error(`[VR Controller] Error saving base64 image:`, error.message);
            return null;
        }
    };

    /**
     * Create verifikasi pelanggaran dari data sinkronisasi middleware
     * Menerima data dengan format dari middleware syncverifikasipelanggaran
     */
    const createFromSync = async (req, res, next) => {
        console.log("--------------------::Processing Create From Sync::--------------------");

        try {
            // Parse detail dari middleware (format sesuai createWithImage: detailcapture, detailpelanggaran, detailpasal)
            let detailCaptures = req.body.detailcapture || [];
            let detailPelanggarans = req.body.detailpelanggaran || [];
            let detailPasals = req.body.detailpasal || [];

            // Ensure arrays
            if (!Array.isArray(detailCaptures)) {
                detailCaptures = [];
            }
            if (!Array.isArray(detailPelanggarans)) {
                detailPelanggarans = [];
            }
            if (!Array.isArray(detailPasals)) {
                detailPasals = [];
            }

            // Check if kendaraan already exists
            var is_no_kendaraan = await getIsNoKendaraanVerifikasi(req.body.kd_pelanggaran);
            console.log('IS NO KENDARAAN : ', is_no_kendaraan);
            
            if (!is_no_kendaraan) {
                console.log('Data Kendaraan Sudah Tersedia');
                return res.send({
                    success: false,
                    message: 'Data Kendaraan Sudah Tersedia',
                });
            }
            console.log('DATA PELANGGARAN : ', req.body);

            // Prepare field sesuai dengan createWithImage
            const field = { 
                kd_pelanggaran: req.body.kd_pelanggaran, 
                tgl_pelanggaran: req.body.tgl_pelanggaran, 
                no_ref: req.body.no_ref, 
                kode_uppkb: req.body.kode_uppkb, 
                regu_id: req.body.regu_id, 
                shift_id: req.body.shift_id, 
                no_kendaraan: req.body.no_kendaraan, 
                no_uji: req.body.no_uji, 
                tgl_uji: req.body.tgl_uji, 
                tgl_masa_berlaku: req.body.tgl_masa_berlaku, 
                nama_pemilik: req.body.nama_pemilik, 
                alamat_pemilik: req.body.alamat_pemilik, 
                toleransi_komoditi: req.body.toleransi_komoditi, 
                toleransi_uppkb: req.body.toleransi_uppkb, 
                berat_timbang: req.body.berat_timbang, 
                jbi_uji: req.body.jbi_uji, 
                kelebihan_berat: req.body.kelebihan_berat, 
                prosen_lebih: req.body.prosen_lebih, 
                jbb_uji: req.body.jbb_uji, 
                jbkb_uji: req.body.jbkb_uji, 
                mst_uji: req.body.mst_uji, 
                jenis_kendaraan_id: req.body.jenis_kendaraan_id, 
                jenis_kendaraan: req.body.jenis_kendaraan, 
                sumbu_id: req.body.sumbu_id, 
                sumbu: req.body.sumbu, 
                kategori_kepemilikan_id: req.body.kategori_kepemilikan_id, 
                asal_kota_id: req.body.asal_kota_id, 
                tujuan_kota_id: req.body.tujuan_kota_id, 
                asal_kode_kota: req.body.asal_kode_kota, 
                tujuan_kode_kota: req.body.tujuan_kode_kota, 
                is_gandengan: req.body.is_gandengan, 
                gandengan_no_uji: req.body.gandengan_no_uji, 
                gandengan_tgl_uji: req.body.gandengan_tgl_uji, 
                gandengan_masa_berlaku: req.body.gandengan_masa_berlaku, 
                gandengan_jbi_uji: req.body.gandengan_jbi_uji, 
                gandengan_jbki: req.body.gandengan_jbki, 
                komoditi_id: req.body.komoditi_id, 
                pemilik_komoditi: req.body.pemilik_komoditi, 
                alamat_pemilik_komoditi: req.body.alamat_pemilik_komoditi, 
                no_surat_jalan: req.body.no_surat_jalan, 
                device_id: req.body.device_id, 
                petugas_id: req.body.petugas_id,
                bptd_id: req.body.bptd_id, 
                lokasi_id: req.body.lokasi_id, 
                is_verified: req.body.is_verified, 
                verified_at: req.body.verified_at, 
                verified_by: req.body.verified_by, 
                is_active: req.body.is_active !== undefined ? req.body.is_active : true,
                created_at: req.body.created_at || moment().format('YYYY-MM-DD HH:mm:ss'), 
                created_by: req.body.created_by || req.token?.id || null,  
                keterangan: req.body.keterangan, 
                panjang_utama: req.body.panjang_utama, 
                panjang_toleransi: req.body.panjang_toleransi, 
                panjang_ukur: req.body.panjang_ukur, 
                panjang_lebih: req.body.panjang_lebih, 
                lebar_utama: req.body.lebar_utama, 
                lebar_toleransi: req.body.lebar_toleransi, 
                lebar_ukur: req.body.lebar_ukur, 
                lebar_lebih: req.body.lebar_lebih, 
                tinggi_utama: req.body.tinggi_utama, 
                tinggi_toleransi: req.body.tinggi_toleransi, 
                tinggi_ukur: req.body.tinggi_ukur, 
                tinggi_lebih: req.body.tinggi_lebih, 
                foh_utama: req.body.foh_utama, 
                foh_toleransi: req.body.foh_toleransi, 
                foh_ukur: req.body.foh_ukur, 
                foh_lebih: req.body.foh_lebih, 
                roh_utama: req.body.roh_utama, 
                roh_toleransi: req.body.roh_toleransi, 
                roh_ukur: req.body.roh_ukur, 
                roh_lebih: req.body.roh_lebih, 
                qrcode_name: req.body.qrcode_name, 
                qrcode_url: req.body.qrcode_url, 
                is_print: req.body.is_print, 
                print_url: req.body.print_url, 
                tgl_capture: req.body.tgl_capture,
                sync_to_pusat: true, // Mark as synced
                sync_from_pusat: true // Mark as received from pusat
            };

            // Create pelanggaran
            const pelanggaranData = await vr_pelanggaran.create(field, {
                logging: false
            });

            // Process detail capture dengan konversi base64 ke file
            if (detailCaptures && detailCaptures.length > 0) {
                for await (const capture of detailCaptures) {
                    const captureData = {
                        pelanggaran_id: pelanggaranData.id,
                        kd_pelanggaran: req.body.kd_pelanggaran,
                        jt_vr_data_id: capture.jt_vr_data_id,
                        img_name: capture.img_name,
                        img2_name: capture.img2_name,
                        img3_name: capture.img3_name,
                        img4_name: capture.img4_name,
                        img_plat_depan_name: capture.img_plat_depan_name,
                        img_plat_belakang_name: capture.img_plat_belakang_name,
                        tgl_capture: capture.tgl_capture,
                        is_plat: capture.is_plat,
                        device_id: capture.device_id,
                        is_active: capture.is_active !== undefined ? capture.is_active : true,
                        created_by: req.body.created_by || req.token?.id || null,
                    };

                    // Convert base64 images to files
                    const base64Fields = [
                        { base64: 'img_base64', name: 'img_name', url: 'img_url' },
                        { base64: 'img2_base64', name: 'img2_name', url: 'img2_url' },
                        { base64: 'img3_base64', name: 'img3_name', url: 'img3_url' },
                        { base64: 'img4_base64', name: 'img4_name', url: 'img4_url' },
                        { base64: 'img_plat_depan_base64', name: 'img_plat_depan_name', url: 'img_plat_depan_url' },
                        { base64: 'img_plat_belakang_base64', name: 'img_plat_belakang_name', url: 'img_plat_belakang_url' }
                    ];

                    for (const field of base64Fields) {
                        if (capture[field.base64]) {
                            const fileName = capture[field.name] || `img_${moment().valueOf()}`;
                            const savedImage = saveBase64Image(capture[field.base64], fileName, 'verifikasi');
                            if (savedImage) {
                                captureData[field.name] = savedImage.file_name;
                                captureData[field.url] = savedImage.image_url;
                            }
                        }
                    }
                    console.log('CAPTURE DATA : ', captureData);

                    await vr_detail_capture.create(captureData, { logging: false });

                    // Update vr_lhr_pelanggaran jika jt_vr_data_id ada
                    if (capture.jt_vr_data_id) {
                        await vr_lhr_pelanggaran.update(
                            {
                                kd_pelanggaran: req.body.kd_pelanggaran,
                                is_verifikasi: true,
                                updated_by: req.body.created_by || req.token?.id || null,
                                updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                            },
                            {
                                where: { last_id: capture.jt_vr_data_id },
                                logging: false
                            }
                        );
                    }
                }
            }

            // Process detail pelanggaran
            if (detailPelanggarans && detailPelanggarans.length > 0) {
                for await (const detailpel of detailPelanggarans) {
                    await vr_detail_pelanggaran.create({
                        pelanggaran_id: pelanggaranData.id,
                        kd_pelanggaran: req.body.kd_pelanggaran,
                        jenis_pelanggaran_id: detailpel.jenis_pelanggaran_id,
                        kode_pelanggaran: detailpel.kode_pelanggaran,
                        deskripsi: detailpel.deskripsi,
                        created_by: req.body.created_by || req.token?.id || null,
                        is_active: detailpel.is_active !== undefined ? detailpel.is_active : true
                    }, { logging: false });
                }
            }

            // Process detail pasal
            if (detailPasals && detailPasals.length > 0) {
                for await (const detailpasal of detailPasals) {
                    await vr_detail_pasal.create({
                        pelanggaran_id: pelanggaranData.id,
                        kd_pelanggaran: req.body.kd_pelanggaran,
                        pasal_id: detailpasal.pasal_id,
                        desk_pasal: detailpasal.desk_pasal,
                        created_by: req.body.created_by || req.token?.id || null,
                        is_active: detailpasal.is_active !== undefined ? detailpasal.is_active : true
                    }, { logging: false });
                }
            }

            res.status(200).send({
                success: true,
                message: messageService().CREATE_SUCCESS,
                data: [{
                    last_insert_id: null, //pelanggaranData.id,
                    fields: field
                }]
            });
        } catch (error) {
            console.error('[VR Controller] Error createFromSync:', error);
            res.status(500).send({
                success: false,
                message: messageService().CREATE_FAILED,
                error: error.message
            });
        }
    };

    return {
        findAll,
        findPagination,
        findOne,
        findAllActive,
        create,
        createWithImage,
        createFromSync,
        deteksi,
        update,
        updateStatus,
        remove,
        removeArr,
        xlsWim,
        printWim,
        printVerifikasi,
    };
}
module.exports = VrPelanggaranController;